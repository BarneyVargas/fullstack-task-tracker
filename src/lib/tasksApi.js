const TASKS_KEY = "task_tracker_tasks";

function safeParse(json, fallback) {
  try {
    const val = JSON.parse(json);
    return val ?? fallback;
  } catch {
    return fallback;
  }
}

function readTasks() {
  const raw = localStorage.getItem(TASKS_KEY);
  const tasks = safeParse(raw, []);
  return Array.isArray(tasks) ? tasks : [];
}

function writeTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return String(Date.now()) + "_" + Math.random().toString(16).slice(2);
}

export async function getTasks() {
  return readTasks();
}

export async function createTask(title) {
  const tasks = readTasks();
  const task = {
    id: makeId(),
    title,
    completed: false,
    createdAt: Date.now(),
  };
  const next = [task, ...tasks];
  writeTasks(next);
  return task;
}

export async function toggleTask(id) {
  const tasks = readTasks();
  const next = tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  writeTasks(next);
  return true;
}

export async function deleteTask(id) {
  const tasks = readTasks();
  const next = tasks.filter((t) => t.id !== id);
  writeTasks(next);
  return true;
}

export async function clearAllTasks() {
  writeTasks([]);
  return true;
}

export async function updateTaskTitle(id, newTitle) {
  const tasks = readTasks();
  const next = tasks.map((t) => (t.id === id ? { ...t, title: newTitle } : t));
  writeTasks(next);
  return true;
}
