import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabaseClient";

export function useTasks(user) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userId = user?.id;

  const loadTasks = useCallback(async () => {
    if (!userId) return;
    setError("");
    setLoading(true);

    try {
      const { data, error: loadError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (loadError) throw loadError;
      setTasks(data ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadTasks();
    else setTasks([]);
  }, [userId, loadTasks]);

  const addTask = useCallback(
    async (title) => {
      const trimmed = title.trim();
      if (!trimmed || !userId) return false;

      setError("");
      try {
        const { data, error: insertError } = await supabase
          .from("tasks")
          .insert([{ user_id: userId, title: trimmed, completed: false }])
          .select();

        if (insertError) throw insertError;
        setTasks((prev) => [data[0], ...prev]);
        return true;
      } catch (e) {
        setError(e?.message || "Failed to create task.");
        return false;
      }
    },
    [userId]
  );

  const toggleTask = useCallback(
    async (task) => {
      setError("");
      try {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, completed: !t.completed } : t
          )
        );

        const { error: updateError } = await supabase
          .from("tasks")
          .update({ completed: !task.completed })
          .eq("id", task.id);

        if (updateError) throw updateError;
      } catch (e) {
        setError(e?.message || "Failed to toggle task.");
        loadTasks();
      }
    },
    [loadTasks]
  );

  const deleteTask = useCallback(
    (taskId) => {
      setError("");

      const taskToDelete = tasks.find((task) => task.id === taskId);
      if (!taskToDelete) return;

      const index = tasks.findIndex((task) => task.id === taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));

      let undone = false;
      const timer = setTimeout(async () => {
        if (undone) return;

        try {
          const { error: deleteError } = await supabase
            .from("tasks")
            .delete()
            .eq("id", taskId);
          if (deleteError) throw deleteError;
        } catch (e) {
          setError(e?.message || "Failed to delete task.");
          loadTasks();
        }
      }, 5000);

      toast.success("Task has been deleted", {
        position: "bottom-right",
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => {
            undone = true;
            clearTimeout(timer);

            setTasks((prev) => {
              const next = [...prev];
              next.splice(index < 0 ? next.length : index, 0, taskToDelete);
              return next;
            });
          },
        },
      });
    },
    [loadTasks, tasks]
  );

  const editTitle = useCallback(
    async (taskId, newTitle) => {
      const trimmed = newTitle.trim();
      if (!trimmed) return;

      setError("");
      try {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, title: trimmed } : t))
        );

        const { error: updateError } = await supabase
          .from("tasks")
          .update({ title: trimmed })
          .eq("id", taskId);

        if (updateError) throw updateError;
      } catch (e) {
        setError(e?.message || "Failed to update task.");
        loadTasks();
      }
    },
    [loadTasks]
  );

  const clearAll = useCallback(async () => {
    if (!userId) return;
    setError("");

    try {
      const { error: clearError } = await supabase
        .from("tasks")
        .delete()
        .eq("user_id", userId);

      if (clearError) throw clearError;
      setTasks([]);
    } catch (e) {
      setError(e?.message || "Failed to clear tasks.");
      loadTasks();
    }
  }, [loadTasks, userId]);

  return {
    tasks,
    loading,
    error,
    addTask,
    toggleTask,
    deleteTask,
    editTitle,
    clearAll,
  };
}
