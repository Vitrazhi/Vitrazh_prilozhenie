import { Delaunay } from "https://cdn.jsdelivr.net/npm/d3-delaunay@6/+esm";
import { DEFAULT_THEME_ID, THEMES, themeDataUrl, themeLabel } from "./themes.js";

const STORAGE_KEY = "vitrazh-v1";
const NS = "http://www.w3.org/2000/svg";

const HABIT_PALETTE = [
  ["#5b8bd9", "#3d5a8c"],
  ["#c97bb8", "#8a4d7a"],
  ["#6bc9a8", "#3d8a6f"],
  ["#e0b565", "#9a7a3a"],
  ["#9b8ad9", "#6557a3"],
  ["#d98b6b", "#a35a3d"],
  ["#7ec8e8", "#4a90b0"],
  ["#b5d96b", "#7aa33d"],
];

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
}

function safeId(s) {
  return String(s).replace(/[^a-zA-Z0-9_]/g, "_");
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { goals: [] };
    const data = JSON.parse(raw);
    if (!data.goals || !Array.isArray(data.goals)) return { goals: [] };
    return data;
  } catch {
    return { goals: [] };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ goals: state.goals }));
}

function ensureGoalFields(goal) {
  if (!goal.themeId || !THEMES.some((t) => t.id === goal.themeId)) {
    goal.themeId = DEFAULT_THEME_ID;
  }
  if (goal.dailyShardLimit === undefined) goal.dailyShardLimit = true;
}

function polygonToPathD(poly) {
  if (!poly || poly.length < 3) return "";
  const [x0, y0] = poly[0];
  let d = `M ${x0} ${y0}`;
  for (let i = 1; i < poly.length; i++) {
    d += ` L ${poly[i][0]} ${poly[i][1]}`;
  }
  return `${d} Z`;
}

function generateShardPaths(goalId, shardCount = 92) {
  const rand = mulberry32(hashString(goalId));
  const pts = [];
  for (let i = 0; i < shardCount; i++) {
    pts.push([4 + rand() * 92, 4 + rand() * 92]);
  }
  const delaunay = Delaunay.from(pts);
  const voronoi = delaunay.voronoi([0, 0, 100, 100]);
  const paths = [];
  for (let i = 0; i < shardCount; i++) {
    const poly = voronoi.cellPolygon(i);
    if (!poly || poly.length < 3) continue;
    paths.push(polygonToPathD(poly));
  }
  return paths;
}

function habitGradients(habitId, colorPair) {
  const id = habitId.replace(/[^a-z0-9]/gi, "_");
  return {
    id: `grad-${id}`,
    c1: colorPair[0],
    c2: colorPair[1],
  };
}

function renderGlassSvg(svg, goal, animateShardIndex) {
  ensureGoalFields(goal);
  const paths = goal.shardPaths;
  const fills = goal.fills || [];
  const fillByShard = new Map(fills.map((f) => [f.shardIndex, f]));
  const patId = `themePat_${safeId(goal.id)}`;
  const href = themeDataUrl(goal.themeId);

  svg.innerHTML = "";
  const defs = document.createElementNS(NS, "defs");

  const pattern = document.createElementNS(NS, "pattern");
  pattern.setAttribute("id", patId);
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  pattern.setAttribute("x", "0");
  pattern.setAttribute("y", "0");
  pattern.setAttribute("width", "100");
  pattern.setAttribute("height", "100");
  const image = document.createElementNS(NS, "image");
  image.setAttribute("href", href);
  image.setAttribute("width", "100");
  image.setAttribute("height", "100");
  image.setAttribute("preserveAspectRatio", "xMidYMid slice");
  pattern.appendChild(image);
  defs.appendChild(pattern);

  const seen = new Set();
  for (const h of goal.habits) {
    const pair = h.colors;
    const g = habitGradients(h.id, pair);
    if (seen.has(g.id)) continue;
    seen.add(g.id);
    const gr = document.createElementNS(NS, "linearGradient");
    gr.setAttribute("id", g.id);
    gr.setAttribute("x1", "0%");
    gr.setAttribute("y1", "0%");
    gr.setAttribute("x2", "100%");
    gr.setAttribute("y2", "100%");
    const s1 = document.createElementNS(NS, "stop");
    s1.setAttribute("offset", "0%");
    s1.setAttribute("stop-color", g.c1);
    const s2 = document.createElementNS(NS, "stop");
    s2.setAttribute("offset", "100%");
    s2.setAttribute("stop-color", g.c2);
    gr.append(s1, s2);
    defs.appendChild(gr);
  }
  svg.appendChild(defs);

  paths.forEach((d, index) => {
    const fill = fillByShard.get(index);
    const g = document.createElementNS(NS, "g");
    g.dataset.shardIndex = String(index);
    g.classList.add("shard");

    if (animateShardIndex === index) {
      g.classList.add("shard--animate");
      g.addEventListener(
        "animationend",
        () => {
          g.classList.remove("shard--animate");
        },
        { once: true },
      );
    }

    if (fill) {
      g.classList.add("shard--filled");
      const habit = goal.habits.find((h) => h.id === fill.habitId);
      const gradId = habit ? habitGradients(habit.id, habit.colors).id : null;

      const pImg = document.createElementNS(NS, "path");
      pImg.setAttribute("d", d);
      pImg.setAttribute("fill", `url(#${patId})`);
      pImg.setAttribute("class", "shard-picture");
      pImg.setAttribute("pointer-events", "none");

      const pTint = document.createElementNS(NS, "path");
      pTint.setAttribute("d", d);
      if (gradId) pTint.setAttribute("fill", `url(#${gradId})`);
      else pTint.setAttribute("fill", habit?.colors[0] || "#888");
      pTint.setAttribute("fill-opacity", "0.38");
      pTint.setAttribute("pointer-events", "none");

      const pEdge = document.createElementNS(NS, "path");
      pEdge.setAttribute("d", d);
      pEdge.setAttribute("fill", "none");
      pEdge.setAttribute("class", "shard-edge");
      pEdge.setAttribute("pointer-events", "none");

      const pHit = document.createElementNS(NS, "path");
      pHit.setAttribute("d", d);
      pHit.setAttribute("fill", "transparent");
      pHit.setAttribute("pointer-events", "all");

      g.append(pImg, pTint, pEdge, pHit);
    } else {
      g.classList.add("shard--empty");

      const pPic = document.createElementNS(NS, "path");
      pPic.setAttribute("d", d);
      pPic.setAttribute("fill", `url(#${patId})`);
      pPic.setAttribute("class", "shard-picture");
      pPic.setAttribute("pointer-events", "none");

      const pFrost = document.createElementNS(NS, "path");
      pFrost.setAttribute("d", d);
      pFrost.setAttribute("fill", "rgb(10, 12, 20)");
      pFrost.setAttribute("fill-opacity", "0.86");
      pFrost.setAttribute("pointer-events", "none");

      const pEdge = document.createElementNS(NS, "path");
      pEdge.setAttribute("d", d);
      pEdge.setAttribute("fill", "none");
      pEdge.setAttribute("class", "shard-edge");
      pEdge.setAttribute("pointer-events", "none");

      const pHit = document.createElementNS(NS, "path");
      pHit.setAttribute("d", d);
      pHit.setAttribute("fill", "transparent");
      pHit.setAttribute("pointer-events", "all");

      g.append(pPic, pFrost, pEdge, pHit);
    }
    svg.appendChild(g);
  });

  svg.dataset.goalId = goal.id;
}

function habitDoneToday(goal, habitId) {
  if (goal.dailyShardLimit === false) return false;
  const day = todayKey();
  return (goal.fills || []).some((f) => f.habitId === habitId && f.day === day);
}

function dailyLimitOn(goal) {
  return goal.dailyShardLimit !== false;
}

function renderHabits(listEl, goal, selectedHabitId) {
  ensureGoalFields(goal);
  listEl.innerHTML = "";
  const limited = dailyLimitOn(goal);

  for (const h of goal.habits) {
    const done = limited && habitDoneToday(goal, h.id);
    const row = document.createElement("li");
    row.className = "habit-row";
    if (selectedHabitId === h.id && !done) row.classList.add("habit-row--active");
    if (done) row.classList.add("habit-row--done");

    const sw = document.createElement("div");
    sw.className = "habit-swatch";
    sw.style.background = `linear-gradient(160deg, ${h.colors[0]}, ${h.colors[1]})`;

    const info = document.createElement("div");
    info.className = "habit-info";
    const name = document.createElement("p");
    name.className = "habit-name";
    name.textContent = h.name;
    const status = document.createElement("p");
    status.className = "habit-status";
    if (done) {
      status.textContent = "Сегодня осколок уже добавлен в витраж";
    } else if (selectedHabitId === h.id) {
      status.textContent = "Нажмите на пустой осколок — проявится картинка";
    } else {
      status.textContent = limited
        ? "Нажмите, чтобы выбрать и закрасить осколок"
        : "Нажмите и закрашивайте любое число осколков подряд";
    }
    info.append(name, status);

    row.append(sw, info);

    if (!done) {
      row.style.cursor = "pointer";
      row.addEventListener("click", () => {
        state.selectedHabitId = state.selectedHabitId === h.id ? null : h.id;
        refreshGoalView();
      });
    }

    listEl.appendChild(row);
  }
}

function updateProgress(goal) {
  const total = goal.shardPaths.length;
  const n = (goal.fills || []).length;
  const el = document.getElementById("glass-progress");
  if (!el) return;
  if (n >= total) {
    el.textContent = "Витраж собран — картинка и привычки сияют целиком.";
  } else {
    el.textContent = `Осколков открыто: ${n} из ${total}`;
  }
}

function updateGlassHint(goal) {
  const hint = document.getElementById("glass-hint");
  if (!hint) return;
  ensureGoalFields(goal);
  const sel = state.selectedHabitId;
  const habit = goal.habits.find((h) => h.id === sel);
  const limited = dailyLimitOn(goal);

  if (habit && !habitDoneToday(goal, habit.id)) {
    hint.textContent = `Выбрано: «${habit.name}» — коснитесь пустого осколка`;
  } else if (limited && goal.habits.length > 0 && goal.habits.every((h) => habitDoneToday(goal, h.id))) {
    hint.textContent = "Сегодня все действия уже в витраже. До завтра!";
  } else {
    hint.textContent = "Сначала выберите действие в списке ниже";
  }
}

function syncGoalSettingsUI(goal) {
  ensureGoalFields(goal);
  const sel = document.getElementById("goal-theme-select");
  if (sel && sel.options.length) {
    sel.value = goal.themeId;
  }
  const lim = document.getElementById("toggle-daily-limit");
  if (lim) lim.checked = dailyLimitOn(goal);
}

function updateHabitsBlockDesc(goal) {
  const el = document.getElementById("habits-block-desc");
  if (!el) return;
  if (dailyLimitOn(goal)) {
    el.textContent =
      "Выберите действие и нажмите на пустой осколок: проявится фрагмент картинки и оттенок привычки. С лимитом — один такой шаг на каждое действие в день.";
  } else {
    el.textContent =
      "Выберите действие и нажимайте пустые осколки сколько угодно за день — тематическая картинка соберётся целиком, когда вы готовы.";
  }
}

let state = {
  goals: [],
  view: "list",
  currentGoalId: null,
  selectedHabitId: null,
  pendingShardAnim: undefined,
};

function ensureGoalShards(goal) {
  ensureGoalFields(goal);
  if (!goal.shardPaths || !goal.shardPaths.length) {
    goal.shardPaths = generateShardPaths(goal.id);
  }
  if (!goal.fills) goal.fills = [];
}

function refreshListView() {
  const ul = document.getElementById("goals-list");
  const empty = document.getElementById("goals-empty");
  ul.innerHTML = "";
  if (!state.goals.length) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
  for (const g of state.goals) {
    ensureGoalShards(g);
    const li = document.createElement("li");
    li.className = "goal-card";
    const fills = (g.fills || []).length;
    const total = g.shardPaths.length;
    li.innerHTML = `<p class="goal-card-title"></p><p class="goal-card-meta"></p>`;
    li.querySelector(".goal-card-title").textContent = g.title;
    li.querySelector(".goal-card-meta").textContent = `${g.habits.length} действий · ${fills} / ${total} · ${themeLabel(g.themeId)}`;
    li.addEventListener("click", () => {
      state.currentGoalId = g.id;
      state.selectedHabitId = null;
      state.view = "goal";
      showView();
    });
    ul.appendChild(li);
  }
}

function refreshGoalView() {
  const goal = state.goals.find((x) => x.id === state.currentGoalId);
  if (!goal) {
    state.view = "list";
    showView();
    return;
  }
  ensureGoalShards(goal);
  document.getElementById("goal-title").textContent = goal.title;
  const note = goal.note?.trim();
  document.getElementById("goal-meta").textContent = note || `Создано ${new Date(goal.createdAt).toLocaleDateString("ru-RU")}`;

  syncGoalSettingsUI(goal);
  updateHabitsBlockDesc(goal);

  const svg = document.getElementById("glass-svg");
  const anim = state.pendingShardAnim;
  state.pendingShardAnim = undefined;
  renderGlassSvg(svg, goal, anim);
  renderHabits(document.getElementById("habits-list"), goal, state.selectedHabitId);
  updateProgress(goal);
  updateGlassHint(goal);
}

function showView() {
  document.getElementById("view-list").classList.toggle("hidden", state.view !== "list");
  document.getElementById("view-goal").classList.toggle("hidden", state.view !== "goal");
  document.getElementById("view-form").classList.toggle("hidden", state.view !== "form");

  if (state.view === "list") refreshListView();
  if (state.view === "goal") refreshGoalView();
  saveState(state);
}

function onShardClick(e) {
  if (state.view !== "goal") return;
  const g = e.target.closest("g.shard");
  if (!g || !g.classList.contains("shard--empty")) return;

  const goal = state.goals.find((x) => x.id === state.currentGoalId);
  if (!goal) return;
  ensureGoalFields(goal);

  const habitId = state.selectedHabitId;
  if (!habitId) {
    updateGlassHint(goal);
    return;
  }
  if (dailyLimitOn(goal) && habitDoneToday(goal, habitId)) {
    state.selectedHabitId = null;
    refreshGoalView();
    return;
  }

  const index = Number(g.dataset.shardIndex);
  const fills = goal.fills || [];
  if (fills.some((f) => f.shardIndex === index)) return;

  const day = todayKey();
  fills.push({ shardIndex: index, habitId, day });
  goal.fills = fills;

  state.pendingShardAnim = index;
  state.selectedHabitId = null;
  saveState(state);
  refreshGoalView();
}

function fillThemeSelect(selectEl) {
  if (!selectEl || selectEl.options.length > 0) return;
  for (const t of THEMES) {
    const o = document.createElement("option");
    o.value = t.id;
    o.textContent = t.label;
    selectEl.appendChild(o);
  }
}

function openForm() {
  state.view = "form";
  document.getElementById("form-title").textContent = "Новая цель";
  buildHabitInputs(3);
  document.getElementById("goal-form").reset();
  document.getElementById("form-daily-limit").checked = true;
  document.getElementById("form-theme-select").value = DEFAULT_THEME_ID;
  showView();
}

function buildHabitInputs(count) {
  const wrap = document.getElementById("habit-inputs");
  wrap.innerHTML = "";
  const n = Math.max(1, Math.min(8, count));
  for (let i = 0; i < n; i++) {
    const row = document.createElement("div");
    row.className = "habit-input-row";
    row.innerHTML = `<input type="text" name="habit" placeholder="Действие ${i + 1}" maxlength="80" ${i === 0 ? "required" : ""} />`;
    if (n > 1) {
      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "btn-remove-habit";
      rm.setAttribute("aria-label", "Удалить");
      rm.textContent = "×";
      rm.addEventListener("click", () => {
        if (wrap.querySelectorAll(".habit-input-row").length <= 1) return;
        row.remove();
      });
      row.appendChild(rm);
    }
    wrap.appendChild(row);
  }
}

function init() {
  state = {
    ...loadState(),
    view: "list",
    currentGoalId: null,
    selectedHabitId: null,
    pendingShardAnim: undefined,
  };
  if (!state.goals) state.goals = [];
  state.goals.forEach(ensureGoalFields);

  fillThemeSelect(document.getElementById("form-theme-select"));
  fillThemeSelect(document.getElementById("goal-theme-select"));

  document.getElementById("btn-new-goal").addEventListener("click", openForm);
  document.getElementById("btn-form-back").addEventListener("click", () => {
    state.view = "list";
    showView();
  });
  document.getElementById("btn-back").addEventListener("click", () => {
    state.currentGoalId = null;
    state.selectedHabitId = null;
    state.view = "list";
    showView();
  });

  document.getElementById("btn-add-habit").addEventListener("click", () => {
    const wrap = document.getElementById("habit-inputs");
    const rows = wrap.querySelectorAll(".habit-input-row");
    if (rows.length >= 8) return;
    const row = document.createElement("div");
    row.className = "habit-input-row";
    row.innerHTML = `<input type="text" name="habit" placeholder="Новое действие" maxlength="80" />`;
    const rm = document.createElement("button");
    rm.type = "button";
    rm.className = "btn-remove-habit";
    rm.setAttribute("aria-label", "Удалить");
    rm.textContent = "×";
    rm.addEventListener("click", () => {
      if (wrap.querySelectorAll(".habit-input-row").length <= 1) return;
      row.remove();
    });
    row.appendChild(rm);
    wrap.appendChild(row);
  });

  document.getElementById("goal-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const title = String(fd.get("title") || "").trim();
    const note = String(fd.get("note") || "").trim();
    const themeIdRaw = String(fd.get("themeId") || DEFAULT_THEME_ID);
    const themeId = THEMES.some((t) => t.id === themeIdRaw) ? themeIdRaw : DEFAULT_THEME_ID;
    const dailyLimitOnForm = document.getElementById("form-daily-limit").checked;

    const habitEls = e.target.querySelectorAll('input[name="habit"]');
    const names = [...habitEls].map((el) => String(el.value || "").trim()).filter(Boolean);
    if (!title || !names.length) return;

    const id = uid("goal");
    const habits = names.map((name, i) => ({
      id: uid("habit"),
      name,
      colors: HABIT_PALETTE[i % HABIT_PALETTE.length],
    }));

    const goal = {
      id,
      title,
      note,
      createdAt: Date.now(),
      habits,
      themeId,
      dailyShardLimit: dailyLimitOnForm,
      shardPaths: generateShardPaths(id),
      fills: [],
    };
    state.goals.unshift(goal);
    state.currentGoalId = id;
    state.selectedHabitId = null;
    state.view = "goal";
    showView();
  });

  document.getElementById("glass-svg").addEventListener("click", onShardClick);

  document.getElementById("goal-theme-select").addEventListener("change", (e) => {
    const goal = state.goals.find((x) => x.id === state.currentGoalId);
    if (!goal) return;
    const v = e.target.value;
    goal.themeId = THEMES.some((t) => t.id === v) ? v : DEFAULT_THEME_ID;
    saveState(state);
    refreshGoalView();
  });

  document.getElementById("toggle-daily-limit").addEventListener("change", (e) => {
    const goal = state.goals.find((x) => x.id === state.currentGoalId);
    if (!goal) return;
    goal.dailyShardLimit = e.target.checked;
    saveState(state);
    refreshGoalView();
  });

  document.getElementById("btn-about").addEventListener("click", () => {
    document.getElementById("modal-about").showModal();
  });
  document.querySelectorAll("[data-close-modal]").forEach((b) => {
    b.addEventListener("click", () => document.getElementById("modal-about").close());
  });

  document.getElementById("btn-delete-goal").addEventListener("click", () => {
    if (!confirm("Удалить эту цель и весь прогресс витража?")) return;
    state.goals = state.goals.filter((g) => g.id !== state.currentGoalId);
    state.currentGoalId = null;
    state.view = "list";
    showView();
  });

  showView();
}

init();
