import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { ModeToggle } from "@/components/mode-toggle";
import LoginCard from "./components/auth/LoginCard";
import TaskList from "./components/tasks/TaskList";
import { supabase } from "./lib/supabaseClient";

import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function App() {
  const [session, setSession] = useState(null);
  const user = useMemo(() => session?.user ?? null, [session]);

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [msg, setMsg] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    let ignore = false;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!ignore) setSession(data?.session ?? null);
      if (error) console.error(error);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession ?? null),
    );

    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const loadTasks = async () => {
    if (!user) return;
    setMsg("");
    setLoadingTasks(true);

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data ?? []);
    } catch (e) {
      setMsg(e?.message || "Failed to load tasks.");
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (user) loadTasks();
    else setTasks([]);
  }, [user?.id]);

  const visibleTasks = useMemo(() => {
    let list = [...tasks];

    if (statusFilter === "open") list = list.filter((t) => !t.completed);
    if (statusFilter === "done") list = list.filter((t) => t.completed);

    if (sortOrder === "newest")
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (sortOrder === "oldest")
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (sortOrder === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    if (sortOrder === "za") list.sort((a, b) => b.title.localeCompare(a.title));

    return list;
  }, [tasks, statusFilter, sortOrder]);

  const addTask = async (e) => {
    e.preventDefault();
    setMsg("");

    const trimmed = title.trim();
    if (!trimmed || !user) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([{ user_id: user.id, title: trimmed, completed: false }])
        .select();

      if (error) throw error;

      setTasks((prev) => [data[0], ...prev]);
      setTitle("");
    } catch (e) {
      setMsg(e?.message || "Failed to create task.");
    }
  };

  const toggleTask = async (task) => {
    setMsg("");
    try {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: !t.completed } : t,
        ),
      );

      const { error } = await supabase
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", task.id);

      if (error) throw error;
    } catch (e) {
      setMsg(e?.message || "Failed to toggle task.");
      loadTasks();
    }
  };

  const deleteTask = async (taskId) => {
    setMsg("");
    try {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));

      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
    } catch (e) {
      setMsg(e?.message || "Failed to delete task.");
      loadTasks();
    }
  };

  const editTitle = async (taskId, newTitle) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    setMsg("");
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, title: trimmed } : t)),
      );

      const { error } = await supabase
        .from("tasks")
        .update({ title: trimmed })
        .eq("id", taskId);

      if (error) throw error;
    } catch (e) {
      setMsg(e?.message || "Failed to update task.");
      loadTasks();
    }
  };

  const clearAllTasks = async () => {
    setMsg("");
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
      setTasks([]);
    } catch (e) {
      setMsg(e?.message || "Failed to clear tasks.");
      loadTasks();
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar isAuthed={!!session} onLogout={signOut} />

      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <LoginCard />}
        />

        <Route
          path="/"
          element={
            session ? (
              <MainApp
                user={user}
                tasks={tasks}
                title={title}
                setTitle={setTitle}
                loadingTasks={loadingTasks}
                visibleTasks={visibleTasks}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                addTask={addTask}
                toggleTask={toggleTask}
                deleteTask={deleteTask}
                editTitle={editTitle}
                onClearAll={clearAllTasks}
                msg={msg}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function TopBar({ isAuthed, onLogout }) {
  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
      {isAuthed && (
        <Button variant="outline" size="sm" onClick={onLogout}>
          Logout
        </Button>
      )}
      <ModeToggle />
    </div>
  );
}

function MainApp({
  user,
  tasks,
  title,
  setTitle,
  loadingTasks,
  visibleTasks,
  statusFilter,
  setStatusFilter,
  sortOrder,
  setSortOrder,
  addTask,
  toggleTask,
  deleteTask,
  editTitle,
  onClearAll,
  msg,
}) {
  return (
    <div className="mx-auto max-w-2xl p-6 pt-20">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-xl">Task Tracker</CardTitle>
              <p className="text-xs text-muted-foreground">
                Signed in as {user.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="rounded" variant="outline">
                Total: {tasks.length}
              </Badge>
              <Badge className="rounded" variant="outline">
                Open: {tasks.filter((t) => !t.completed).length}
              </Badge>
              <Badge className="rounded" variant="secondary">
                Done: {tasks.filter((t) => t.completed).length}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={addTask} className="flex gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a new task..."
            />
            <Button type="submit">Add</Button>
          </form>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="az">Title (A → Z)</SelectItem>
                  <SelectItem value="za">Title (Z → A)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tasks.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all tasks?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove {tasks.length} task
                      {tasks.length === 1 ? "" : "s"}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onClearAll}>
                      Yes, clear
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {loadingTasks ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="h-4 w-4" />
              <span>Loading…</span>
            </div>
          ) : visibleTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {tasks.length === 0
                ? "No tasks yet. Add one above!"
                : "No tasks match your filter."}
            </p>
          ) : (
            <TaskList
              tasks={visibleTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEditTitle={editTitle}
            />
          )}

          {msg && <p className="text-sm text-destructive">{msg}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
