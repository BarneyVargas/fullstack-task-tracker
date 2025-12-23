import { useEffect, useMemo, useState } from "react";
import LoginCard from "./components/auth/LoginCard";
import TaskList from "./components/tasks/TaskList";
import { supabase } from "./lib/supabaseClient";

import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";

export default function App() {
  const [session, setSession] = useState(null);
  const user = useMemo(() => session?.user ?? null, [session]);

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [msg, setMsg] = useState("");

  // auth session bootstrap + listener
  useEffect(() => {
    let ignore = false;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!ignore) setSession(data?.session ?? null);
      if (error) console.error(error);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession ?? null);
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const addTask = async (e) => {
    e.preventDefault();
    setMsg("");

    const trimmed = title.trim();
    if (!trimmed || !user) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .insert([{ user_id: user.id, title: trimmed, completed: false }]);

      if (error) throw error;

      setTitle("");
      await loadTasks();
    } catch (e2) {
      setMsg(e2?.message || "Failed to create task.");
    }
  };

  const toggleTask = async (task) => {
    setMsg("");
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", task.id);

      if (error) throw error;
      await loadTasks();
    } catch (e) {
      setMsg(e?.message || "Failed to toggle task.");
    }
  };

  const deleteTask = async (taskId) => {
    setMsg("");
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
      await loadTasks();
    } catch (e) {
      setMsg(e?.message || "Failed to delete task.");
    }
  };

  const editTitle = async (taskId, newTitle) => {
    setMsg("");
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ title: newTitle })
        .eq("id", taskId);

      if (error) throw error;
      await loadTasks();
    } catch (e) {
      setMsg(e?.message || "Failed to update task.");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) return <LoginCard />;

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">Task Tracker</h1>
            <p className="text-sm opacity-70 truncate">{user?.email}</p>
          </div>
          <Button variant="secondary" onClick={signOut}>
            Sign out
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Tasks</CardTitle>
            <Badge variant="secondary">
              {completedCount}/{tasks.length} done
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={addTask} className="flex gap-2">
              <Input
                placeholder="Add a task..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Button type="submit">Add</Button>
            </form>

            {msg ? <p className="text-sm opacity-80">{msg}</p> : null}

            {loadingTasks ? (
              <p className="text-sm opacity-70">Loading...</p>
            ) : tasks.length === 0 ? (
              <p className="text-sm opacity-70">No tasks yet.</p>
            ) : (
              <TaskList
                tasks={tasks}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onEditTitle={editTitle}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// import { useEffect, useMemo, useState } from "react";
// import LoginCard from "./components/auth/LoginCard";
// import TaskList from "./components/tasks/TaskList";
// import { supabase } from "./lib/supabaseClient";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";

// export default function App() {
//   const [session, setSession] = useState(null);
//   const user = useMemo(() => session?.user ?? null, [session]);

//   const [tasks, setTasks] = useState([]);
//   const [title, setTitle] = useState("");
//   const [loadingTasks, setLoadingTasks] = useState(false);
//   const [msg, setMsg] = useState("");

//   // auth session bootstrap + listener
//   useEffect(() => {
//     let ignore = false;

//     (async () => {
//       const { data } = await supabase.auth.getSession();
//       if (!ignore) setSession(data.session ?? null);
//     })();

//     const { data: sub } = supabase.auth.onAuthStateChange(
//       (_event, newSession) => {
//         setSession(newSession ?? null);
//       }
//     );

//     return () => {
//       ignore = true;
//       sub.subscription.unsubscribe();
//     };
//   }, []);

//   const loadTasks = async () => {
//     if (!user) return;
//     setMsg("");
//     setLoadingTasks(true);
//     try {
//       const { data, error } = await supabase
//         .from("tasks")
//         .select("*")
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false });

//       if (error) throw error;
//       setTasks(data ?? []);
//     } catch (e) {
//       setMsg(e?.message || "Failed to load tasks.");
//     } finally {
//       setLoadingTasks(false);
//     }
//   };

//   useEffect(() => {
//     if (user) loadTasks();
//     else setTasks([]);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.id]);

//   const addTask = async (e) => {
//     e.preventDefault();
//     setMsg("");

//     const trimmed = title.trim();
//     if (!trimmed || !user) return;

//     try {
//       const { error } = await supabase
//         .from("tasks")
//         .insert([{ user_id: user.id, title: trimmed, completed: false }]);
//       if (error) throw error;

//       setTitle("");
//       await loadTasks();
//     } catch (e2) {
//       setMsg(e2?.message || "Failed to create task.");
//     }
//   };

//   const toggleTask = async (task) => {
//     setMsg("");
//     try {
//       const { error } = await supabase
//         .from("tasks")
//         .update({ completed: !task.completed })
//         .eq("id", task.id);

//       if (error) throw error;
//       await loadTasks();
//     } catch (e) {
//       setMsg(e?.message || "Failed to toggle task.");
//     }
//   };

//   const deleteTask = async (taskId) => {
//     setMsg("");
//     try {
//       const { error } = await supabase.from("tasks").delete().eq("id", taskId);
//       if (error) throw error;
//       await loadTasks();
//     } catch (e) {
//       setMsg(e?.message || "Failed to delete task.");
//     }
//   };

//   const editTitle = async (taskId, newTitle) => {
//     setMsg("");
//     try {
//       const { error } = await supabase
//         .from("tasks")
//         .update({ title: newTitle })
//         .eq("id", taskId);

//       if (error) throw error;
//       await loadTasks();
//     } catch (e) {
//       setMsg(e?.message || "Failed to update task.");
//     }
//   };

//   const signOut = async () => {
//     await supabase.auth.signOut();
//   };

//   if (!session) return <LoginCard />;

//   const completedCount = tasks.filter((t) => t.completed).length;

//   return (
//     <div className="min-h-screen bg-background p-4">
//       <div className="mx-auto max-w-2xl space-y-4">
//         <div className="flex items-center justify-between gap-2">
//           <div className="min-w-0">
//             <h1 className="text-xl font-semibold">Task Tracker</h1>
//             <p className="text-sm opacity-70 truncate">{user?.email}</p>
//           </div>
//           <Button variant="secondary" onClick={signOut}>
//             Sign out
//           </Button>
//         </div>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between">
//             <CardTitle>Your Tasks</CardTitle>
//             <Badge variant="secondary">
//               {completedCount}/{tasks.length} done
//             </Badge>
//           </CardHeader>

//           <CardContent className="space-y-4">
//             <form onSubmit={addTask} className="flex gap-2">
//               <Input
//                 placeholder="Add a task..."
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//               />
//               <Button type="submit">Add</Button>
//             </form>

//             {msg ? <p className="text-sm opacity-80">{msg}</p> : null}

//             {loadingTasks ? (
//               <p className="text-sm opacity-70">Loading...</p>
//             ) : tasks.length === 0 ? (
//               <p className="text-sm opacity-70">No tasks yet.</p>
//             ) : (
//               <TaskList
//                 tasks={tasks}
//                 onToggle={toggleTask}
//                 onDelete={deleteTask}
//                 onEditTitle={editTitle}
//               />
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

// import { useEffect, useMemo, useState } from "react";
// import LoginCard from "@/components/auth/LoginCard";
// import TaskList from "@/components/tasks/TaskList";
// import { supabase } from "@/lib/supabaseClient";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";

// export default function App() {
//   const [session, setSession] = useState(null);
//   const user = useMemo(() => session?.user ?? null, [session]);

//   const [tasks, setTasks] = useState([]);
//   const [title, setTitle] = useState("");
//   const [loadingTasks, setLoadingTasks] = useState(false);
//   const [msg, setMsg] = useState("");

//   // auth session bootstrap + listener
//   useEffect(() => {
//     let ignore = false;

//     (async () => {
//       const { data } = await supabase.auth.getSession();
//       if (!ignore) setSession(data.session ?? null);
//     })();

//     const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
//       setSession(newSession ?? null);
//     });

//     return () => {
//       ignore = true;
//       sub.subscription.unsubscribe();
//     };
//   }, []);

//   const loadTasks = async () => {
//     if (!user) return;
//     setMsg("");
//     setLoadingTasks(true);
//     try {
//       const { data, error } = await supabase
//         .from("tasks")
//         .select("*")
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false });

//       if (error) throw error;
//       setTasks(data ?? []);
//     } catch (e) {
//       setMsg(e?.message || "Failed to load tasks.");
//     } finally {
//       setLoadingTasks(false);
//     }
//   };

//   useEffect(() => {
//     if (user) loadTasks();
//     else setTasks([]);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.id]);

//   const addTask = async (e) => {
//     e.preventDefault();
//     setMsg("");

//     const trimmed = title.trim();
//     if (!trimmed || !user) return;

//     try {
//       const { error } = await supabase.from("tasks").insert([
//         { user_id: user.id, title: trimmed, completed: false },
//       ]);
//       if (error) throw error;

//       setTitle("");
//       await loadTasks();
//     } catch (e2) {
//       setMsg(e2?.message || "Failed to create task.");
//     }
//   };

//   const toggleTask = async (task) => {
//     setMsg("");
//     try {
//       const { error } = await supabase
//         .from("tasks")
//         .update({ completed: !task.completed })
//         .eq("id", task.id);

//       if (error) throw error;
//       await loadTasks();
//     } catch (e) {
//       setMsg(e?.message || "Failed to toggle task.");
//     }
//   };

//   const deleteTask = async (taskId) => {
//     setMsg("");
//     try {
//       const { error } = await supabase.from("tasks").delete().eq("id", taskId);
//       if (error) throw error;
//       await loadTasks();
//     } catch (e) {
//       setMsg(e?.message || "Failed to delete task.");
//     }
//   };

//   const editTitle = async (taskId, newTitle) => {
//     setMsg("");
//     try {
//       const { error } = await supabase
//         .from("tasks")
//         .update({ title: newTitle })
//         .eq("id", taskId);

//       if (error) throw error;
//       await loadTasks();
//     } catch (e) {
//       setMsg(e?.message || "Failed to update task.");
//     }
//   };

//   const signOut = async () => {
//     await supabase.auth.signOut();
//   };

//   if (!session) return <LoginCard />;

//   const completedCount = tasks.filter((t) => t.completed).length;

//   return (
//     <div className="min-h-screen bg-background p-4">
//       <div className="mx-auto max-w-2xl space-y-4">
//         <div className="flex items-center justify-between gap-2">
//           <div className="min-w-0">
//             <h1 className="text-xl font-semibold">Task Tracker</h1>
//             <p className="text-sm opacity-70 truncate">{user?.email}</p>
//           </div>
//           <Button variant="secondary" onClick={signOut}>
//             Sign out
//           </Button>
//         </div>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between">
//             <CardTitle>Your Tasks</CardTitle>
//             <Badge variant="secondary">
//               {completedCount}/{tasks.length} done
//             </Badge>
//           </CardHeader>

//           <CardContent className="space-y-4">
//             <form onSubmit={addTask} className="flex gap-2">
//               <Input
//                 placeholder="Add a task..."
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//               />
//               <Button type="submit">Add</Button>
//             </form>

//             {msg ? <p className="text-sm opacity-80">{msg}</p> : null}

//             {loadingTasks ? (
//               <p className="text-sm opacity-70">Loading...</p>
//             ) : tasks.length === 0 ? (
//               <p className="text-sm opacity-70">No tasks yet.</p>
//             ) : (
//               <TaskList
//                 tasks={tasks}
//                 onToggle={toggleTask}
//                 onDelete={deleteTask}
//                 onEditTitle={editTitle}
//               />
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

// export default function App() {
//   const [session, setSession] = useState(null);
//   const user = useMemo(() => session?.user ?? null, [session]);

//   const [tasks, setTasks] = useState([]);
//   const [title, setTitle] = useState("");
//   const [loadingTasks, setLoadingTasks] = useState(false);
//   const [msg, setMsg] = useState("");

//   // auth session bootstrap + listener
//   useEffect(() => {
//     let ignore = false;

//     (async () => {
//       const { data } = await supabase.auth.getSession();
//       if (!ignore) setSession(data.session ?? null);
//     })();

//     const { data: sub } = supabase.auth.onAuthStateChange(
//       (_event, newSession) => {
//         setSession(newSession ?? null);
//       }
//     );

//     return () => {
//       ignore = true;
//       sub.subscription.unsubscribe();
//     };
//   }, []);

//   const loadTasks = async () => {
//     if (!user) return;
//     setMsg("");
//     setLoadingTasks(true);
//     try {
//       const { data, error } = await supabase
//         .from("tasks")
//         .select("*")
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false });

//       if (error) throw error;
//       setTasks(data ?? []);
//     } catch (e) {
//       setMsg(e?.message || "Failed to load tasks.");
//     } finally {
//       setLoadingTasks(false);
//     }
//   };

//   useEffect(() => {
//     if (user) loadTasks();
//     else setTasks([]);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.id]);

//   const addTask = async (e) => {
//     e.preventDefault();
//     setMsg("");

//     const trimmed = title.trim();
//     if (!trimmed || !user) return;

//     try {
//       const { error } = await supabase
//         .from("tasks")
//         .insert([{ user_id: user.id, title: trimmed, completed: false }]);
//       if (error) throw error;

//       setTitle("");
//       await loadTasks();
//     } catch (e2) {
//       setMsg(e2?.message || "Failed to create task.");
//     }
//   };

//   const toggleTask = async (task) => {
//     setMsg("");
//     try {
//       const { error } = await supabase
//         .from("tasks")
//         .update({ completed: !task.completed })
//         .eq("id", task.id);

//       if (error) throw error;
//       await loadTasks();
//     } catch (e) {
//       setMsg(e?.message || "Failed to toggle task.");
//     }
//   };

//   const deleteTask = async (taskId) => {
//     setMsg("");
//     try {
//       const { error } = await supabase.from("tasks").delete().eq("id", taskId);
//       if (error) throw error;
//       await loadTasks();
//     } catch (e) {
//       setMsg(e?.message || "Failed to delete task.");
//     }
//   };

//   const editTitle = async (taskId, newTitle) => {
//     setMsg("");
//     try {
//       const { error } = await supabase
//         .from("tasks")
//         .update({ title: newTitle })
//         .eq("id", taskId);

//       if (error) throw error;
//       await loadTasks();
//     } catch (e) {
//       setMsg(e?.message || "Failed to update task.");
//     }
//   };

//   const signOut = async () => {
//     await supabase.auth.signOut();
//   };

//   if (!session) return <LoginCard />;

//   const completedCount = tasks.filter((t) => t.completed).length;

//   return (
//     <div className="min-h-screen bg-background p-4">
//       <div className="mx-auto max-w-2xl space-y-4">
//         <div className="flex items-center justify-between gap-2">
//           <div className="min-w-0">
//             <h1 className="text-xl font-semibold">Task Tracker</h1>
//             <p className="text-sm opacity-70 truncate">{user?.email}</p>
//           </div>
//           <Button variant="secondary" onClick={signOut}>
//             Sign out
//           </Button>
//         </div>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between">
//             <CardTitle>Your Tasks</CardTitle>
//             <Badge variant="secondary">
//               {completedCount}/{tasks.length} done
//             </Badge>
//           </CardHeader>

//           <CardContent className="space-y-4">
//             <form onSubmit={addTask} className="flex gap-2">
//               <Input
//                 placeholder="Add a task..."
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//               />
//               <Button type="submit">Add</Button>
//             </form>

//             {msg ? <p className="text-sm opacity-80">{msg}</p> : null}

//             {loadingTasks ? (
//               <p className="text-sm opacity-70">Loading...</p>
//             ) : tasks.length === 0 ? (
//               <p className="text-sm opacity-70">No tasks yet.</p>
//             ) : (
//               <TaskList
//                 tasks={tasks}
//                 onToggle={toggleTask}
//                 onDelete={deleteTask}
//                 onEditTitle={editTitle}
//               />
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
