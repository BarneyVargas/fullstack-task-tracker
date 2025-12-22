const KEY = "tasks_v1";

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

function write(tasks) {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

export async function getTasks() {
  return read();
}

export async function createTask(title) {
  const tasks = read();
  const newTask = {
    id: crypto.randomUUID(),
    title,
    completed: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const next = [newTask, ...tasks];
  write(next);
  return newTask;
}

export async function toggleTask(id) {
  const tasks = read();
  const next = tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t
  );
  write(next);
  return next;
}

export async function deleteTask(id) {
  const tasks = read();
  const next = tasks.filter((t) => t.id !== id);
  write(next);
  return next;
}

export async function updateTaskTitle(id, title) {
  const tasks = read();
  const next = tasks.map((t) =>
    t.id === id ? { ...t, title, updatedAt: Date.now() } : t
  );
  write(next);
  return next;
}

export async function clearAllTasks() {
  write([]);
  return [];
}
