import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import TasksPage from "@/pages/TasksPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import SignupPage from "@/pages/SignupPage";
import { useSession } from "@/hooks/useSession";
import { useTasks } from "@/hooks/useTasks";
import { Spinner } from "@/components/ui/spinner";

export default function App() {
  const { session, user, loading: sessionLoading, signOut } = useSession();
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

  if (sessionLoading) {
    return (
      <AppLayout session={session} onSignOut={signOut}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner className="size-6" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout session={session} onSignOut={signOut}>
      <Toaster />
      <Routes>
        <Route
          path="/login"
          element={
            <RequireAnon session={session}>
              <LoginPage />
            </RequireAnon>
          }
        />
        <Route
          path="/signup"
          element={
            <RequireAnon session={session}>
              <SignupPage />
            </RequireAnon>
          }
        />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route
          path="/"
          element={
            <RequireAuth session={session}>
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
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

function RequireAuth({ session, children }) {
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function RequireAnon({ session, children }) {
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  if (session) {
    return <Navigate to={from} replace />;
  }

  return children;
}
