import { useEffect, useMemo, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  getTasks,
  createTask,
  toggleTask,
  deleteTask,
  clearAllTasks,
  updateTaskTitle,
} from "@/lib/tasksApi";

import TaskItem from "@/components/TaskItem";

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
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // filter + sort UI state
  const [statusFilter, setStatusFilter] = useState("all"); // all | open | done
  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest | az | za

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
      setLoading(false);
    })();
  }, []);

  // derived counts
  const counts = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    const open = total - done;
    return { total, open, done };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    let list = [...tasks];

    // filter
    if (statusFilter === "open") list = list.filter((t) => !t.completed);
    if (statusFilter === "done") list = list.filter((t) => t.completed);

    // sort
    if (sortOrder === "newest") list.sort((a, b) => b.createdAt - a.createdAt);
    if (sortOrder === "oldest") list.sort((a, b) => a.createdAt - b.createdAt);
    if (sortOrder === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    if (sortOrder === "za") list.sort((a, b) => b.title.localeCompare(a.title));

    return list;
  }, [tasks, statusFilter, sortOrder]);

  const onAdd = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const newTask = await createTask(trimmed);
    setTasks((prev) => [newTask, ...prev]); // instant UI update
    setTitle("");
  };

  const onToggle = async (id) => {
    // optimistic update first
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

    // persist
    await toggleTask(id);
  };

  const onDelete = async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await deleteTask(id);
  };

  const onEditTitle = async (id, newTitle) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t))
    );
    await updateTaskTitle(id, newTitle);
  };

  const onClearAll = async () => {
    setTasks([]); // instant UI update
    await clearAllTasks();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute top-6 right-6">
        <ModeToggle />
      </div>

      <div className="mx-auto max-w-xl p-6 pt-20">
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Task Tracker</CardTitle>

              <div className="flex items-center gap-2">
                <Badge variant="outline">Total: {counts.total}</Badge>
                <Badge variant="outline">Open: {counts.open}</Badge>
                <Badge variant="secondary">Done: {counts.done}</Badge>
              </div>
            </div>

            <p className="text-sm opacity-70">
              Frontend-only mock (localStorage). No server, no database.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={onAdd} className="flex gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a new task..."
              />
              <Button type="submit">Add</Button>
            </form>

            {/* Filter + Sort row */}
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

              {/* Clear All: ONLY show dialog trigger if there are tasks */}
              {tasks.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Clear All
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear all tasks?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove {tasks.length} task
                        {tasks.length === 1 ? "" : "s"} from the list.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onClearAll} className="">
                        Yes, clear
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {loading ? (
              <p className="text-sm opacity-70">Loading…</p>
            ) : visibleTasks.length === 0 ? (
              <p className="text-sm opacity-70">No tasks match your filter.</p>
            ) : (
              <div className="space-y-2">
                {visibleTasks.map((t) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onEditTitle={onEditTitle}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
