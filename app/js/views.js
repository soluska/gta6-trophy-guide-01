// views.js — renders the checklist, the detail pane, the roadmap page and the
// missables page. All text comes from data/trophies.json; this file only lays
// it out. Visuals are CSS only — no images, no game artwork.

import { isMasked } from "./filters.js";
import { ROADMAP } from "./roadmap.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));

const KIND_LABEL = {
  story: "Story",
  activity: "Activity",
  collectible: "Collectible",
  completion: "Completion",
  misc: "Miscellaneous",
};

function tagsFor(t, earned) {
  const tags = [`<span class="tag">${esc(KIND_LABEL[t.kind] || t.kind)}</span>`];
  if (t.missable) tags.push(`<span class="tag tag-missable">Missable</span>`);
  if (t.unconfirmed) tags.push(`<span class="tag tag-unconfirmed">Trigger unconfirmed</span>`);
  if (t.hidden) tags.push(`<span class="tag">Hidden on PSN</span>`);
  if (earned) tags.push(`<span class="tag tag-earned">Earned</span>`);
  return tags.join("");
}

export function renderList(listEl, trophies, ctx) {
  listEl.innerHTML = trophies
    .map((t) => {
      const earned = ctx.isEarned(t.id);
      const masked = isMasked(t, { hideSpoilers: ctx.hideSpoilers, isEarned: ctx.isEarned });
      const name = masked ? "Hidden story trophy" : t.name;
      const desc = masked ? "Masked by your spoiler setting — earn it to reveal." : t.description;
      return `
      <li>
        <div class="trophy-row ${earned ? "is-earned" : ""} ${ctx.selectedId === t.id ? "is-selected" : ""}"
             data-select="${t.id}" role="button" tabindex="0" aria-label="${esc(name)}">
          <input type="checkbox" class="trophy-check" data-toggle="${t.id}"
                 ${earned ? "checked" : ""} aria-label="Mark ${esc(name)} as earned">
          <span class="grade-chip grade-${esc(t.grade)}">${esc(t.grade)}</span>
          <span class="trophy-main">
            <span class="trophy-name ${masked ? "masked" : ""}">${esc(name)}</span>
            <span class="trophy-desc ${masked ? "masked" : ""}">${esc(desc)}</span>
            <span class="trophy-tags">${tagsFor(t, earned)}</span>
          </span>
        </div>
      </li>`;
    })
    .join("");

  listEl.querySelectorAll("[data-toggle]").forEach((box) => {
    box.addEventListener("click", (ev) => ev.stopPropagation());
    box.addEventListener("change", () => ctx.onToggle(Number(box.dataset.toggle), box.checked));
  });
  listEl.querySelectorAll("[data-select]").forEach((row) => {
    row.addEventListener("click", () => ctx.onSelect(Number(row.dataset.select)));
    row.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        ctx.onSelect(Number(row.dataset.select));
      }
    });
  });
}

export function renderDetail(pane, trophy, ctx) {
  if (!trophy) {
    pane.innerHTML = `<p class="detail-hint">Pick a trophy from the list to see its guide, target, missable warnings and sources.</p>`;
    return;
  }
  const t = trophy;
  const earned = ctx.isEarned(t.id);
  const masked = isMasked(t, { hideSpoilers: ctx.hideSpoilers, isEarned: ctx.isEarned });
  const name = masked ? "Hidden story trophy" : t.name;
  const desc = masked ? "This story trophy is masked by your spoiler setting until you earn it." : t.description;
  const guide = masked
    ? "The guide for this trophy is hidden too — it would give away story beats. Mark the trophy earned (or turn the spoiler setting off in the footer) to read it."
    : t.guide;

  const meta = [];
  if (t.target) meta.push(`<div><b>PSN target</b>${esc(t.target)}</div>`);
  meta.push(`<div><b>Grade / kind</b>${esc(t.grade)} · ${esc(KIND_LABEL[t.kind] || t.kind)}</div>`);
  if (t.missable) {
    meta.push(`<div class="warn-box"><b>Missable warning</b>This trophy can be missed. Read the guide before playing past the point it describes.</div>`);
  }
  if (t.unconfirmed) {
    meta.push(`<div class="note-box"><b>Trigger unconfirmed</b>No launch guide has confirmed this trophy's exact trigger yet, so the guide says what is known and does not invent steps.</div>`);
  }
  meta.push(`<div><b>Rarity</b>${esc(ctx.rarityNote)}</div>`);

  const sources = (t.sources || [])
    .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`)
    .join("");

  pane.innerHTML = `
    <span class="grade-chip grade-${esc(t.grade)}">${esc(t.grade)}</span>
    <h2 class="${masked ? "masked" : ""}">${esc(name)}</h2>
    <p class="detail-desc ${masked ? "masked" : ""}">${esc(desc)}</p>
    <p class="detail-guide">${esc(guide)}</p>
    <div class="detail-meta">${meta.join("")}</div>
    ${sources ? `<h3>Sources</h3><ul class="detail-sources">${sources}</ul>` : ""}
    <button type="button" class="detail-toggle" data-detail-toggle="${t.id}" aria-pressed="${earned}">
      ${earned ? "Earned — tap to undo" : "Mark as earned"}
    </button>`;

  pane.querySelector("[data-detail-toggle]").addEventListener("click", () => {
    ctx.onToggle(t.id, !earned);
  });
}

export function renderRoadmap(section, trophies, ctx) {
  const stepCards = ROADMAP.steps
    .map((step) => {
      const inStep = trophies.filter((t) => step.kinds.includes(t.kind));
      const done = inStep.filter((t) => ctx.isEarned(t.id)).length;
      const pct = inStep.length ? Math.round((done / inStep.length) * 100) : 0;
      return `
      <article class="step-card">
        <h3>${esc(step.title)}</h3>
        <p>${esc(step.body)}</p>
        <div class="step-progress">
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
          <output>${done} / ${inStep.length} trophies</output>
        </div>
      </article>`;
    })
    .join("");

  section.innerHTML = `
    <div class="page-head">
      <h2>Platinum roadmap</h2>
      <p>${esc(ROADMAP.summary)}</p>
    </div>
    <div class="stat-cards">
      <div class="stat-card"><b>${esc(ROADMAP.difficulty)}</b><span>difficulty (PowerPyx)</span></div>
      <div class="stat-card"><b>${esc(ROADMAP.hours)}</b><span>estimated time to platinum</span></div>
      <div class="stat-card"><b>1</b><span>possibly missable trophy</span></div>
      <div class="stat-card"><b>0</b><span>online trophies</span></div>
    </div>
    ${stepCards}`;
}

export function renderMissables(section, trophies, ctx) {
  const missables = trophies.filter((t) => t.missable);
  const cards = missables
    .map((t) => {
      const earned = ctx.isEarned(t.id);
      return `
      <article class="alert-card">
        <h3>${esc(t.name)} <span class="grade-chip grade-${esc(t.grade)}">${esc(t.grade)}</span></h3>
        <p><i>${esc(t.description)}</i>${t.target ? ` · Target: ${esc(t.target)}` : ""}</p>
        <p>${esc(t.guide)}</p>
        <p>${earned ? "You have marked this one earned — nothing left to worry about." : "Not yet marked earned. Do not play past the moment the guide describes without doing it."}</p>
      </article>`;
    })
    .join("");

  section.innerHTML = `
    <div class="page-head">
      <h2>Missables</h2>
      <p>Launch guides agree the list is almost entirely missable-free — with one exception worth planning around. The facts that shape your run:</p>
    </div>
    ${cards}
    <article class="step-card">
      <h3>Ground rules for a one-playthrough platinum</h3>
      <ul class="fact-list">
        <li><b>No mission replay and no New Game Plus.</b> Anything tied to a one-time story moment has to be done when it appears.</li>
        <li><b>Cheats disable trophies and saving.</b> Play clean for the whole run.</li>
        <li><b>No online trophies.</b> Everything can be earned solo, offline.</li>
        <li><b>The 100% checklist is not the whole game.</b> It tracks roughly 200 of 277 vehicles, 100 of 255 animals and 70 of 80 challenges — completion is a subset of everything there is to do.</li>
        <li><b>Six trophies still have unconfirmed triggers</b> (In The Beginning…, Capital Offense, Bad Luck I Guess, The Truth Is Out There, Ten Pin, Challenging Tank). Their entries say so plainly rather than inventing steps.</li>
      </ul>
    </article>`;
}
