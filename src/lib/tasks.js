// const TASKS_PREFIX = "task_tracker_tasks_v1:";

// function keyFor(email) {
//   return `${TASKS_PREFIX}${email}`;
// }

// export function getTasks(email) {
//   try {
//     const raw = localStorage.getItem(keyFor(email));
//     if (!raw) return [];
//     const parsed = JSON.parse(raw);
//     return Array.isArray(parsed) ? parsed : [];
//   } catch {
//     return [];
//   }
// }

// function saveTasks(email, tasks) {
//   localStorage.setItem(keyFor(email), JSON.stringify(tasks));
//   return tasks;
// }

// export function createTask(email, title) {
//   const tasks = getTasks(email);
//   const newTask = {
//     id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
//     title,
//     completed: false,
//     createdAt: Date.now(),
//   };
//   return saveTasks(email, [newTask, ...tasks]);
// }

// export function toggleTask(email, id) {
//   const tasks = getTasks(email);
//   const next = tasks.map((t) =>
//     t.id === id ? { ...t, completed: !t.completed } : t
//   );
//   return saveTasks(email, next);
// }

// export function deleteTask(email, id) {
//   const tasks = getTasks(email);
//   const next = tasks.filter((t) => t.id !== id);
//   return saveTasks(email, next);
// }

// export function clearAllTasks(email) {
//   return saveTasks(email, []);
// }

// export function updateTaskTitle(email, id, title) {
//   const tasks = getTasks(email);
//   const next = tasks.map((t) => (t.id === id ? { ...t, title } : t));
//   return saveTasks(email, next);
// }
