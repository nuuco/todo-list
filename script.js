const STORAGE_KEY_TODOS = "todo-app-items";
const STORAGE_KEY_THEME = "todo-app-theme";

const state = {
  todos: [],
  filter: "all",
  theme: "light",
};

const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const inputCount = document.getElementById("inputCount");
const inputMessage = document.getElementById("inputMessage");
const todoList = document.getElementById("todoList");
const remainingCount = document.getElementById("remainingCount");
const filterButtons = document.querySelectorAll(".filter-btn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeIcon = document.getElementById("themeIcon");
const confettiCanvas = document.getElementById("confettiCanvas");
const celebrateBadge = document.getElementById("celebrateBadge");
const maxInputLength = Number(todoInput.getAttribute("maxlength")) || 120;
const confettiCtx = confettiCanvas ? confettiCanvas.getContext("2d") : null;
const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
const appContainer = document.querySelector(".app");
const CONFETTI_COLORS = ["#ff4d4f", "#ffd93d", "#22c55e", "#38bdf8", "#a855f7", "#fb7185"];

let confettiAnimationId = null;
let confettiParticles = [];
let audioCtx = null;
let editingTodoId = null;

function persistTodos(nextTodos) {
  state.todos = nextTodos;
  saveTodos();
}

function persistTodosAndRender(nextTodos) {
  persistTodos(nextTodos);
  render();
}

function normalizeTodoText(rawText) {
  return rawText.trim();
}

function validateTodoText(text) {
  if (!text) {
    setMessage("할 일을 한 글자 이상 입력해주세요.", "error");
    return false;
  }
  return true;
}

function updateInputCount() {
  inputCount.textContent = `${todoInput.value.length}/${maxInputLength}`;
}

function getAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return null;
  }

  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  return audioCtx;
}

function isAllTodosCompleted() {
  return state.todos.length > 0 && state.todos.every((todo) => todo.completed);
}

function resizeConfettiCanvas() {
  if (!confettiCanvas) {
    return;
  }

  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

function launchConfetti(mode = "normal") {
  if (!confettiCtx || reducedMotionMedia.matches) {
    return;
  }

  resizeConfettiCanvas();
  const width = confettiCanvas.width;
  const height = confettiCanvas.height;

  const isMega = mode === "mega";
  const particleCount = isMega ? 220 : 90;
  const bursts = isMega
    ? [width * 0.22, width * 0.5, width * 0.78]
    : [width * (0.35 + Math.random() * 0.3)];

  confettiParticles = Array.from({ length: particleCount }, (_, index) => {
    const burstX = bursts[index % bursts.length];
    const startX = burstX + (Math.random() - 0.5) * (isMega ? 60 : 40);
    const startY = height * 0.18 + Math.random() * (isMega ? 35 : 20);
    const angle = (-Math.PI / 2) + (Math.random() - 0.5) * (isMega ? 1.8 : 1.4);
    const speed = (isMega ? 4.2 : 3) + Math.random() * (isMega ? 6.5 : 5.5);

    return {
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: (isMega ? 5 : 4) + Math.random() * (isMega ? 7 : 5),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * (isMega ? 0.35 : 0.22),
      life: 1,
    };
  });

  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);
  }

  const gravity = isMega ? 0.14 : 0.16;
  const friction = isMega ? 0.996 : 0.994;

  function animate() {
    confettiCtx.clearRect(0, 0, width, height);

    confettiParticles.forEach((particle) => {
      particle.vx *= friction;
      particle.vy = particle.vy * friction + gravity;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.rotationSpeed;
      particle.life -= isMega ? 0.0085 : 0.012;

      confettiCtx.save();
      confettiCtx.globalAlpha = Math.max(particle.life, 0);
      confettiCtx.translate(particle.x, particle.y);
      confettiCtx.rotate(particle.rotation);
      confettiCtx.fillStyle = particle.color;
      confettiCtx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.7);
      confettiCtx.restore();
    });

    confettiParticles = confettiParticles.filter(
      (particle) => particle.life > 0 && particle.y < height + 25
    );

    if (confettiParticles.length > 0) {
      confettiAnimationId = requestAnimationFrame(animate);
      return;
    }

    confettiAnimationId = null;
    confettiCtx.clearRect(0, 0, width, height);
  }

  confettiAnimationId = requestAnimationFrame(animate);
}

function playMegaCelebrationSound() {
  if (reducedMotionMedia.matches) {
    return;
  }

  const context = getAudioContext();
  if (!context) {
    return;
  }

  const now = context.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5];

  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.07);
    gain.gain.setValueAtTime(0.0001, now + index * 0.07);
    gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.07 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.07 + 0.18);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now + index * 0.07);
    oscillator.stop(now + index * 0.07 + 0.2);
  });
}

function playSingleCompleteSound() {
  if (reducedMotionMedia.matches) {
    return;
  }

  const context = getAudioContext();
  if (!context) {
    return;
  }

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(740, now);
  oscillator.frequency.exponentialRampToValueAtTime(980, now + 0.12);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.17);
}

function showCelebrateBadge() {
  if (!celebrateBadge) {
    return;
  }

  celebrateBadge.classList.remove("show");
  void celebrateBadge.offsetWidth;
  celebrateBadge.classList.add("show");
}

function triggerMegaCelebration() {
  launchConfetti("mega");
  playMegaCelebrationSound();
  showCelebrateBadge();
  document.body.classList.add("celebrating");
  appContainer.classList.add("mega-celebrate");
  setTimeout(() => {
    appContainer.classList.remove("mega-celebrate");
    document.body.classList.remove("celebrating");
  }, 650);
}

function loadTodos() {
  const stored = localStorage.getItem(STORAGE_KEY_TODOS);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error) {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(state.todos));
}

function loadTheme() {
  const storedTheme = localStorage.getItem(STORAGE_KEY_THEME);
  return storedTheme === "dark" ? "dark" : "light";
}

function saveTheme() {
  localStorage.setItem(STORAGE_KEY_THEME, state.theme);
}

function setMessage(text, type) {
  inputMessage.textContent = text;
  inputMessage.classList.remove("error", "success");
  if (type) {
    inputMessage.classList.add(type);
  }
}

function getFilteredTodos() {
  if (state.filter === "active") {
    return state.todos.filter((todo) => !todo.completed);
  }
  if (state.filter === "completed") {
    return state.todos.filter((todo) => todo.completed);
  }
  return state.todos;
}

function updateRemainingCount() {
  const left = state.todos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = `남은 할 일 ${left}개`;
}

function updateThemeUI() {
  const isDark = state.theme === "dark";
  document.body.classList.toggle("dark", isDark);
  themeIcon.src = isDark ? "./assets/icon-sun.svg" : "./assets/icon-moon.svg";
  themeToggleBtn.setAttribute("aria-label", isDark ? "라이트 모드로 전환" : "다크 모드로 전환");
}

function createTodoItem(todo) {
  const item = document.createElement("li");
  item.className = `todo-item ${todo.completed ? "completed" : ""} ${editingTodoId === todo.id ? "editing" : ""}`;
  item.dataset.id = todo.id;

  const left = document.createElement("div");
  left.className = "todo-item-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.setAttribute("aria-label", `${todo.text} 완료 상태 전환`);
  checkbox.className = "todo-toggle";

  if (editingTodoId === todo.id) {
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = todo.text;
    editInput.maxLength = maxInputLength;
    editInput.dataset.id = todo.id;
    editInput.className = "todo-edit-input";
    left.append(checkbox, editInput);
  } else {
    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;
    left.append(checkbox, text);
  }

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "todo-action-btn delete";
  deleteBtn.setAttribute("aria-label", `${todo.text} 삭제`);
  deleteBtn.innerHTML = `
    <span class="action-glyph" aria-hidden="true">×</span>
    <span class="visually-hidden">삭제</span>
  `;

  item.append(left, deleteBtn);
  return item;
}

function renderFilterButtons() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === state.filter;
    button.classList.toggle("active", isActive);
  });
}

function renderTodoList() {
  const filteredTodos = getFilteredTodos();
  todoList.innerHTML = "";

  if (filteredTodos.length === 0) {
    const empty = document.createElement("li");
    empty.className = "todo-empty";
    empty.innerHTML = `
      <p class="todo-empty-title">표시할 할 일이 없습니다.</p>
      <p class="todo-empty-hint">새 할 일을 추가하거나 필터를 변경해보세요.</p>
    `;
    todoList.append(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  filteredTodos.forEach((todo) => {
    fragment.append(createTodoItem(todo));
  });
  todoList.append(fragment);
}

function render() {
  renderFilterButtons();
  renderTodoList();
  updateRemainingCount();
  updateThemeUI();
}

function focusEditInput(id) {
  requestAnimationFrame(() => {
    const targetInput = todoList.querySelector(`.todo-edit-input[data-id="${id}"]`);
    if (!targetInput) {
      return;
    }
    targetInput.focus();
    const end = targetInput.value.length;
    targetInput.setSelectionRange(end, end);
  });
}

function startEditTodo(id) {
  if (editingTodoId === id) {
    return;
  }
  editingTodoId = id;
  render();
  focusEditInput(id);
}

function commitEditTodo(id, rawText) {
  const text = normalizeTodoText(rawText);
  if (!validateTodoText(text)) {
    return;
  }

  persistTodos(
    state.todos.map((todo) => (todo.id === id ? { ...todo, text } : todo))
  );
  editingTodoId = null;
  render();
}

function cancelEditTodo() {
  if (editingTodoId === null) {
    return;
  }

  editingTodoId = null;
  render();
}

function addTodo(rawText) {
  const text = normalizeTodoText(rawText);
  if (!validateTodoText(text)) {
    return;
  }

  persistTodos([
    {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    },
    ...state.todos,
  ]);
  setMessage("할 일이 추가되었습니다.", "success");
  render();
}

function toggleTodo(id) {
  const targetTodo = state.todos.find((todo) => todo.id === id);
  if (!targetTodo) {
    return;
  }

  const isNowCompleted = !targetTodo.completed;
  persistTodosAndRender(
    state.todos.map((todo) =>
      todo.id === id ? { ...todo, completed: isNowCompleted } : todo
    )
  );
  if (isNowCompleted) {
    if (isAllTodosCompleted()) {
      triggerMegaCelebration();
      setMessage("모든 할 일을 완료했어요! 멋져요!", "success");
      return;
    }

    playSingleCompleteSound();
    launchConfetti();
  }
}

function deleteTodo(id) {
  persistTodosAndRender(
    state.todos.filter((todo) => todo.id !== id)
  );
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = "";
  updateInputCount();
  todoInput.focus();
});

todoInput.addEventListener("input", () => {
  updateInputCount();
  setMessage("", null);
});

todoList.addEventListener("click", (event) => {
  const item = event.target.closest(".todo-item");
  if (!item) {
    return;
  }

  const id = item.dataset.id;
  const deleteButton = event.target.closest(".todo-action-btn.delete");
  if (deleteButton) {
    deleteTodo(id);
    return;
  }

  const toggleInput = event.target.closest(".todo-toggle");
  if (toggleInput) {
    return;
  }

  const editInput = event.target.closest(".todo-edit-input");
  if (editInput) {
    return;
  }

  const todoText = event.target.closest(".todo-text");
  if (todoText) {
    startEditTodo(id);
    return;
  }

  toggleTodo(id);
});

todoList.addEventListener("keydown", (event) => {
  const editInput = event.target.closest(".todo-edit-input");
  if (!editInput) {
    return;
  }

  const id = editInput.dataset.id;
  if (event.key === "Enter") {
    commitEditTodo(id, editInput.value);
    return;
  }

  if (event.key === "Escape") {
    cancelEditTodo();
  }
});

todoList.addEventListener("focusout", (event) => {
  const editInput = event.target.closest(".todo-edit-input");
  if (!editInput) {
    return;
  }

  commitEditTodo(editInput.dataset.id, editInput.value);
});

todoList.addEventListener("change", (event) => {
  const item = event.target.closest(".todo-item");
  if (!item) {
    return;
  }

  if (event.target.classList.contains("todo-toggle")) {
    toggleTodo(item.dataset.id);
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    render();
  });
});

themeToggleBtn.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  saveTheme();
  render();
});

function init() {
  state.todos = loadTodos();
  state.theme = loadTheme();
  resizeConfettiCanvas();
  updateInputCount();
  render();
}

window.addEventListener("resize", resizeConfettiCanvas);

init();
