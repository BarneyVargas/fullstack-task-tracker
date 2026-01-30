import { useMemo, useState } from "react";

import TaskList from "@/components/tasks/TaskList";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskForm from "@/components/tasks/TaskForm";
import TaskHeader from "@/components/tasks/TaskHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const EMPTY_FILTER_MESSAGE = {
  all: "No tasks yet. Add one above!",
  filtered: "No tasks match your filter.",
};

export default function TasksPage({
  user,
  tasks,
  loading,
  error,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTitle,
  onClearAll,
}) {
  const [title, setTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [sortOrder, setSortOrder] = useState("newest");

  const totalCount = tasks.length;
  const openCount = tasks.filter((task) => !task.completed).length;
  const doneCount = tasks.filter((task) => task.completed).length;

  const visibleTasks = useMemo(() => {
    let list = [...tasks];

    if (statusFilter === "open") list = list.filter((task) => !task.completed);
    if (statusFilter === "done") list = list.filter((task) => task.completed);

    if (sortOrder === "newest")
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (sortOrder === "oldest")
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (sortOrder === "az")
      list.sort((a, b) => a.title.localeCompare(b.title));
    if (sortOrder === "za")
      list.sort((a, b) => b.title.localeCompare(a.title));

    return list;
  }, [tasks, statusFilter, sortOrder]);
  const visibleCount = visibleTasks.length;
  const canClearAll = visibleCount > 0;

  const handleAddTask = async (event) => {
    event.preventDefault();
    const created = await onAddTask(title);
    if (created) setTitle("");
  };
  const handleClearAll = () => {
    onClearAll(statusFilter);
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <TaskHeader
          email={user.email}
          totalCount={totalCount}
          openCount={openCount}
          doneCount={doneCount}
        />

        <CardContent className="space-y-4">
          <TaskForm
            title={title}
            onTitleChange={setTitle}
            onSubmit={handleAddTask}
          />

          <TaskFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            totalCount={totalCount}
            visibleCount={visibleCount}
            canClearAll={canClearAll}
            onClearAll={handleClearAll}
          />

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="h-4 w-4" />
              <span>Loading...</span>
            </div>
          ) : visibleTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {totalCount === 0
                ? EMPTY_FILTER_MESSAGE.all
                : EMPTY_FILTER_MESSAGE.filtered}
            </p>
          ) : (
            <TaskList
              tasks={visibleTasks}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
              onEditTitle={onEditTitle}
            />
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
