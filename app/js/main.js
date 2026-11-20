// main.js — boot, routing and wiring for the Leonida Trophy Guide.
// Loads data/trophies.json, keeps the filter/selection state, and re-renders
// on every change. All progress lives in store.js (localStorage).

import * as store from "./store.js";
import { applyFilters } from "./filters.js";
import { renderList, renderDetail, renderRoadmap, renderMissables } from "./views.js";

const els = {
  list: document.getElementById("trophy-list"),
  empty: document.getElementById("empty-state"),
  resultCount: document.getElementById("result-count"),
  detail: document.getElementById("detail-pane"),
  search: document.getElementById("filter-search"),
  grade: document.getElementById("filter-grade"),
  kind: document.getElementById("filter-kind"),
  stateFilter: document.getElementById("filter-state"),
  earnedCount: document.getElementById("earned-count"),
  earnedPct: document.getElementById("earned-pct"),
  progressBar: document.getElementById("progress-bar"),
  views: {
    checklist: document.getElementById("view-checklist"),
    roadmap: document.getElementById("view-roadmap"),
    missables: document.getElementById("view-missables"),
  },
  tabs: document.querySelectorAll(".tab"),
  spoilerToggle: document.getElementById("setting-spoilers"),
  ioStatus: document.getElementById("io-status"),
};

let data = null; // parsed trophies.json
let trophies = [];
let selectedId = null;
const filters = { query: "", grade: "all", kind: "all", state: "all" };

const ctx = () => ({
  isEarned: store.isEarned,
  hideSpoilers: store.getSetting("hideSpoilers"),
  selectedId,
  rarityNote: data ? data.rarityNote : "",
  onToggle,
  onSelect,
});

function onToggle(id, earned) {
  store.setEarned(id, earned);
  render();
}

function onSelect(id) {
  selectedId = id;
  render();
}

function currentRoute() {
  const hash = location.hash.replace(/^#\//, "");
  return ["roadmap", "missables"].includes(hash) ? hash : "checklist";
}

function render() {
  if (!data) return;
  const route = currentRoute();

  // Header progress always reflects the full list.
  const total = trophies.length;
  const done = store.earnedCount();
  els.earnedCount.textContent = String(done);
  const pct = total ? Math.round((done / total) * 100) : 0;
  els.earnedPct.textContent = `${pct}%`;
  els.progressBar.style.width = `${pct}%`;

  // Tabs + view visibility.
  for (const [name, section] of Object.entries(els.views)) {
    section.hidden = name !== route;
  }
  els.tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.route === route));

  if (route === "checklist") {
    const visible = applyFilters(trophies, filters, store.isEarned);
    els.resultCount.textContent = `Showing ${visible.length} of ${total} trophies`;
    els.empty.hidden = visible.length > 0;
    renderList(els.list, visible, ctx());
    const selected = trophies.find((t) => t.id === selectedId) || null;
    renderDetail(els.detail, selected, ctx());
  } else if (route === "roadmap") {
    renderRoadmap(els.views.roadmap, trophies, ctx());
  } else if (route === "missables") {
    renderMissables(els.views.missables, trophies, ctx());
  }
}

function wireControls() {
  els.search.addEventListener("input", () => { filters.query = els.search.value; render(); });
  els.grade.addEventListener("change", () => { filters.grade = els.grade.value; render(); });
  els.kind.addEventListener("change", () => { filters.kind = els.kind.value; render(); });
  els.stateFilter.addEventListener("change", () => { filters.state = els.stateFilter.value; render(); });

  els.spoilerToggle.checked = store.getSetting("hideSpoilers");
  els.spoilerToggle.addEventListener("change", () => {
    store.setSetting("hideSpoilers", els.spoilerToggle.checked);
    render();
  });

  document.getElementById("btn-export").addEventListener("click", () => {
    store.exportProgress();
    els.ioStatus.textContent = "Progress exported as a JSON file.";
  });

  document.getElementById("file-import").addEventListener("change", async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const validIds = new Set(trophies.map((t) => t.id));
    els.ioStatus.textContent = await store.importProgress(file, validIds);
    els.spoilerToggle.checked = store.getSetting("hideSpoilers");
    ev.target.value = "";
    render();
  });

  document.getElementById("btn-reset").addEventListener("click", () => {
    if (!window.confirm("Reset all progress and settings for this guide?")) return;
    store.resetAll();
    selectedId = null;
    els.spoilerToggle.checked = false;
    els.ioStatus.textContent = "Progress reset.";
    render();
  });

  window.addEventListener("hashchange", render);
}

function fillAbout() {
  document.getElementById("about-notes").textContent = data.notes || "";
  document.getElementById("about-rarity").textContent = data.rarityNote || "";
  document.getElementById("about-sources").innerHTML = (data.sources || [])
    .map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.name}</a></li>`)
    .join("");
}

async function boot() {
  try {
    const res = await fetch("data/trophies.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    els.list.innerHTML = "";
    els.empty.hidden = false;
    els.empty.textContent =
      "Could not load data/trophies.json. Serve this folder over HTTP (for example `node serve.ts` from the repo root) instead of opening the file directly.";
    console.error("Failed to load trophy data:", err);
    return;
  }
  trophies = data.trophies || [];
  fillAbout();
  wireControls();
  render();
}

boot();
