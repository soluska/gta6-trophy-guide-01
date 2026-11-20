// store.js — progress persistence for the Leonida Trophy Guide.
// Everything lives in localStorage on this device only; nothing is uploaded.
const STORAGE_KEY = "leonida-trophy-guide:v1";

const defaultState = () => ({
  earned: {}, // trophy id (string) -> ISO date string when marked earned
  settings: { hideSpoilers: false },
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      earned: parsed && typeof parsed.earned === "object" && parsed.earned ? parsed.earned : {},
      settings: { hideSpoilers: !!(parsed && parsed.settings && parsed.settings.hideSpoilers) },
    };
  } catch {
    return defaultState();
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked (private mode): the app keeps working in memory.
  }
}

export function isEarned(id) {
  return Object.prototype.hasOwnProperty.call(state.earned, String(id));
}

export function setEarned(id, earned) {
  const key = String(id);
  if (earned) state.earned[key] = new Date().toISOString();
  else delete state.earned[key];
  save();
}

export function earnedCount() {
  return Object.keys(state.earned).length;
}

export function earnedIds() {
  return new Set(Object.keys(state.earned).map(Number));
}

export function getSetting(name) {
  return state.settings[name];
}

export function setSetting(name, value) {
  state.settings[name] = value;
  save();
}

export function resetAll() {
  state = defaultState();
  save();
}

// Export: hand the user a small JSON file they can keep or move to another device.
export function exportProgress() {
  const payload = {
    app: "leonida-trophy-guide",
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: state.earned,
    settings: state.settings,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leonida-trophy-progress.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Import: accept a file produced by exportProgress(). Returns a human-readable
// result string; throws nothing. Unknown trophy ids are ignored.
export async function importProgress(file, validIds) {
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    return "Import failed: that file is not valid JSON.";
  }
  if (!parsed || typeof parsed.earned !== "object" || parsed.earned === null) {
    return "Import failed: no progress data found in that file.";
  }
  const next = {};
  for (const [id, when] of Object.entries(parsed.earned)) {
    if (validIds.has(Number(id))) next[id] = typeof when === "string" ? when : new Date().toISOString();
  }
  state.earned = next;
  if (parsed.settings && typeof parsed.settings.hideSpoilers === "boolean") {
    state.settings.hideSpoilers = parsed.settings.hideSpoilers;
  }
  save();
  return `Imported progress: ${Object.keys(next).length} trophies marked earned.`;
}
