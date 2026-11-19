// Boot for the Leonida Trophy Guide: load the trophy list, wire the toolbar and tabs, render the views.
// The app fetches only its own data/trophies.json at run time; nothing else leaves the browser.
import { loadProgress, saveProgress, exportProgress, parseImportedProgress } from './store.js';
import { applyFilters } from './filters.js';
import { trophyRow, renderDetail, renderRoadmap, renderMissables } from './views.js';

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;

const state = {
  earned: loadProgress(),
  spoilerOn: true,
  selectedId: null,
  view: 'checklist',
  filters: { search: '', grade: 'all', kind: 'all', earned: 'all' },
};

const rows = document.getElementById('rows');
const detail = document.getElementById('detail');
const resultCount = document.getElementById('result-count');
const empty = document.getElementById('empty');

// renderProgress updates the header bar: how many of the 55 are earned, and the percentage.
function renderProgress() {
  const earned = state.earned.size;
  const pct = Math.round((earned / trophies.length) * 100);
  document.getElementById('progress-count').textContent = `${earned} of ${trophies.length} earned`;
  document.getElementById('progress-pct').textContent = `${pct}% to the platinum`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
}

// renderChecklist rebuilds the list from the filters and refreshes the detail pane beside it.
function renderChecklist() {
  const visible = applyFilters(trophies, state.filters, state.earned);
  rows.replaceChildren();
  for (const trophy of visible) {
    rows.append(trophyRow(trophy, state, {
      onSelect: (id) => { state.selectedId = id; renderChecklist(); },
      onToggle: toggleEarned,
    }));
  }
  empty.hidden = visible.length !== 0;
  resultCount.textContent = state.filters.kind === 'online'
    ? 'Online trophies: none. All 55 trophies are single-player (PowerPyx) — nothing to show here.'
    : `${visible.length} of ${trophies.length} trophies shown`;
  const selected = trophies.find((trophy) => trophy.id === state.selectedId) ?? null;
  renderDetail(detail, selected, state, { onToggle: toggleEarned });
}

// toggleEarned flips one trophy, saves the progress and re-renders.
function toggleEarned(name, checked) {
  if (checked) state.earned.add(name);
  else state.earned.delete(name);
  saveProgress(state.earned);
  renderProgress();
  renderChecklist();
  renderRoadmapView();
  renderMissablesView();
}

// showView switches between the checklist, roadmap and missables tabs and keeps the URL hash in step.
function showView(view) {
  state.view = view;
  for (const section of document.querySelectorAll('.view')) section.hidden = section.id !== `view-${view}`;
  for (const tab of document.querySelectorAll('.tab')) tab.setAttribute('aria-selected', tab.dataset.view === view ? 'true' : 'false');
  if (location.hash !== `#${view}`) history.replaceState(null, '', `#${view}`);
  if (view === 'roadmap') renderRoadmapView();
  if (view === 'missables') renderMissablesView();
}

function renderRoadmapView() {
  renderRoadmap(document.getElementById('roadmap'), trophies, state.earned);
}

function renderMissablesView() {
  renderMissables(document.getElementById('missables'), trophies, state);
}

// Toolbar wiring: search, grade, kind, earned, the spoiler setting, export and import.
document.getElementById('search').addEventListener('input', (event) => {
  state.filters.search = event.target.value;
  renderChecklist();
});
document.getElementById('grade').addEventListener('change', (event) => {
  state.filters.grade = event.target.value;
  renderChecklist();
});
document.getElementById('kind').addEventListener('change', (event) => {
  state.filters.kind = event.target.value;
  renderChecklist();
});
document.getElementById('earned').addEventListener('change', (event) => {
  state.filters.earned = event.target.value;
  renderChecklist();
});
document.getElementById('spoiler').addEventListener('change', (event) => {
  state.spoilerOn = event.target.checked;
  renderChecklist();
});
document.getElementById('export').addEventListener('click', () => exportProgress(state.earned));
document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    state.earned = parseImportedProgress(await file.text(), trophies.map((trophy) => trophy.name));
    saveProgress(state.earned);
    renderProgress();
    renderChecklist();
    renderRoadmapView();
    renderMissablesView();
  } catch {
    alert('That file is not a trophy progress export from this guide.');
  }
  event.target.value = '';
});

// Tabs and deep links: #checklist, #roadmap, #missables, or #trophy-<id> to open one trophy's guide.
for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => showView(tab.dataset.view));
}
window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1);
  if (hash.startsWith('trophy-')) {
    state.selectedId = Number(hash.slice('trophy-'.length));
    showView('checklist');
    renderChecklist();
  } else if (['checklist', 'roadmap', 'missables'].includes(hash)) {
    showView(hash);
  }
});

// First paint: open the view the URL names, or the checklist with the first trophy's guide open.
const firstHash = location.hash.slice(1);
if (firstHash.startsWith('trophy-')) {
  state.selectedId = Number(firstHash.slice('trophy-'.length));
} else if (['roadmap', 'missables'].includes(firstHash)) {
  state.view = firstHash;
} else if (trophies.length > 0) {
  state.selectedId = trophies[0].id;
}
renderProgress();
renderChecklist();
showView(state.view);
