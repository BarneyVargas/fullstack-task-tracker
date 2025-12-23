import { useEffect, useMemo, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";

import LoginCard from "@/components/auth/LoginCard";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function App() {
  const [session, setSession] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | done

  // 1) auth listener
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession ?? null);
      }
    );

    return () => sub.subscription.unsubscribe();
  }, []);

  // 2) load tasks whenever session changes
  useEffect(() => {
    if (!session?.user) {
      setTasks([]);
      return;
    }
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, completed, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data ?? []);
    } finally {
      setLoadingTasks(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    // IMPORTANT:
    // If you used Option A (uuid id + user_id not null),
    // you MUST include user_id here OR create a trigger.
    // We'll include it here to keep it simple.
    const user_id = session.user.id;

    const { data, error } = await supabase
      .from("tasks")
      .insert([{ title, user_id }])
      .select("id, title, completed, created_at")
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setTasks((prev) => [data, ...prev]);
    setNewTitle("");
  };

  const toggle = async (task) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id);

    if (error) {
      alert(error.message);
      return;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const remove = async (task) => {
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) {
      alert(error.message);
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const visibleTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "done") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  if (!session?.user) {
    return (
      <div>
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <LoginCard />
      </div>
    );
  }

  const doneCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Task Tracker</h1>
            <p className="text-sm text-muted-foreground">
              Signed in as{" "}
              <span className="font-medium">{session.user.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button variant="outline" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Tasks{" "}
              <Badge variant="secondary">
                {doneCount}/{tasks.length}
              </Badge>
            </CardTitle>

            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("active")}
              >
                Active
              </Button>
              <Button
                variant={filter === "done" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("done")}
              >
                Done
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={addTask} className="flex gap-2">
              <Input
                placeholder="Add a task..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Button type="submit">Add</Button>
            </form>

            {loadingTasks ? (
              <p className="text-sm text-muted-foreground">Loading tasks...</p>
            ) : visibleTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks yet.</p>
            ) : (
              <div className="space-y-2">
                {visibleTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <button
                      className="flex-1 text-left"
                      onClick={() => toggle(t)}
                      type="button"
                    >
                      <span
                        className={
                          t.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }
                      >
                        {t.title}
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggle(t)}
                      >
                        {t.completed ? "Undo" : "Done"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => remove(t)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={loadTasks}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
