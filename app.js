const taskInput = document.getElementById("taskInput");
const addForm = document.getElementById("addForm");
const taskList = document.getElementById("taskList");
const tabs = document.querySelectorAll(".tab");

const STORAGE_KEY = "tasks_v1";

let filter = "all";
let tasks = loadTasks(); // <-- load from localStorage on start

// ---------- LocalStorage helpers ----------
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);

    // basic safety: ensure correct shape
    if (!Array.isArray(parsed)) return [];
    return parsed.map(t => ({
      id: String(t.id ?? crypto.randomUUID()),
      text: String(t.text ?? ""),
      done: Boolean(t.done),
    })).filter(t => t.text.trim().length > 0);
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---------- UI logic ----------
function getVisibleTasks() {
  if (filter === "active") return tasks.filter(t => !t.done);
  if (filter === "completed") return tasks.filter(t => t.done);
  return tasks;
}

function render() {
  taskList.innerHTML = "";

  const visible = getVisibleTasks();

  for (const task of visible) {
    const li = document.createElement("li");
    li.className = `item ${task.done ? "completed" : ""}`;

    const left = document.createElement("div");
    left.className = "left";

    const box = document.createElement("button");
    box.type = "button";
    box.className = `checkbox ${task.done ? "checked" : ""}`;
    box.ariaLabel = "Toggle task";
    box.addEventListener("click", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "text";
    text.textContent = task.text;

    left.appendChild(box);
    left.appendChild(text);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete";
    del.ariaLabel = `Delete "${task.text}"`;
    del.textContent = "✕";
    del.addEventListener("click", () => deleteTask(task.id));

    li.appendChild(left);
    li.appendChild(del);

    taskList.appendChild(li);
  }
}

function toggleTask(id) {
  tasks = tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t));
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = taskInput.value.trim();
  if (!value) return;

  tasks.unshift({ id: crypto.randomUUID(), text: value, done: false });
  taskInput.value = "";
  saveTasks();
  render();
});

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    render();
  });
});

// If localStorage was empty, you can optionally seed sample tasks
// (comment this out if you don’t want it)
if (tasks.length === 0) {
  tasks = [
    { id: crypto.randomUUID(), text: "Begin wireframing", done: false },
    { id: crypto.randomUUID(), text: "Write documentation", done: false },
    { id: crypto.randomUUID(), text: "Update homepage", done: false },
    { id: crypto.randomUUID(), text: "Fix bugs", done: false },
    { id: crypto.randomUUID(), text: "Review pull request", done: false },
  ];
  saveTasks();
}

render();
