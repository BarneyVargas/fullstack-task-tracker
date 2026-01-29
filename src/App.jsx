import { Routes, Route, Navigate } from "react-router-dom";

import LoginCard from "@/components/auth/LoginCard";
import { Toaster } from "@/components/ui/sonner";
import AppLayout from "@/components/AppLayout";
import TasksPage from "@/pages/TasksPage";
import { useSession } from "@/hooks/useSession";
import { useTasks } from "@/hooks/useTasks";

export default function App() {
  const { session, user, signOut } = useSession();
  const {
    tasks,
    loading,
    error,
    addTask,
    toggleTask,
    deleteTask,
    editTitle,
    clearAll,
  } = useTasks(user);

  return (
    <AppLayout session={session} onSignOut={signOut}>
      <Toaster />
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <LoginCard />}
        />
        <Route
          path="/"
          element={
            session ? (
              <TasksPage
                user={user}
                tasks={tasks}
                loading={loading}
                error={error}
                onAddTask={addTask}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onEditTitle={editTitle}
                onClearAll={clearAll}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
