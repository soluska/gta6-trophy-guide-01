// Rendering for the three views: the checklist with its detail pane, the platinum roadmap and the missables page.
import { KIND_LABELS, isHiddenBySpoiler } from './filters.js';
import { ROADMAP, roadmapProgress } from './roadmap.js';

// el builds an element with a class and text, the small helper every view uses.
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// gradeChip is the medal shown beside a trophy: a coloured dot and the grade word.
export function gradeChip(grade) {
  return el('span', `grade ${grade}`, grade);
}

// trophyRow is one checklist row: a checkbox, the official name and description (or the spoiler mask),
// and chips for grade, kind, missable and the PSN target count where the list tracks one.
export function trophyRow(trophy, state, callbacks) {
  const hidden = isHiddenBySpoiler(trophy, state.spoilerOn, state.earned);
  const row = el('li');
  const button = el('button', `trophy${state.earned.has(trophy.name) ? ' earned' : ''}`);
  button.type = 'button';
  button.setAttribute('aria-selected', state.selectedId === trophy.id ? 'true' : 'false');
  button.addEventListener('click', (event) => {
    if (event.target.tagName === 'INPUT') return;
    callbacks.onSelect(trophy.id);
  });

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(trophy.name);
  box.setAttribute('aria-label', `Earned: ${trophy.name}`);
  box.addEventListener('click', (event) => {
    event.stopPropagation();
    callbacks.onToggle(trophy.name, box.checked);
  });
  button.append(box);

  const middle = el('span');
  const name = el('span', 'trophy-name', hidden ? 'Hidden story trophy' : trophy.name);
  if (hidden) name.classList.add('spoiler-hidden');
  const desc = el('span', 'trophy-desc', hidden ? 'Earn it to reveal its name and description.' : trophy.description);
  middle.append(name, document.createElement('br'), desc);
  button.append(middle, gradeChip(trophy.grade));

  const meta = el('span', 'trophy-meta');
  meta.append(el('span', 'chip', KIND_LABELS[trophy.kind] ?? trophy.kind));
  if (trophy.missable) meta.append(el('span', 'chip missable', 'Possibly missable'));
  if (trophy.hidden) meta.append(el('span', 'chip hidden-note', 'Hidden on PSN'));
  if (trophy.target) meta.append(el('span', 'chip', `Target: ${trophy.target}`));
  button.append(meta);
  row.append(button);
  return row;
}

// renderDetail is the guide pane for one trophy: official name, description and grade, the guide in our own words,
// the missable warning where one applies, the sources it cites, and a note that rarity is not published yet.
export function renderDetail(detail, trophy, state, callbacks) {
  detail.replaceChildren();
  if (!trophy) {
    detail.append(el('p', 'placeholder', 'Pick a trophy from the checklist to read its guide, its sources and its missable warning.'));
    return;
  }
  const hidden = isHiddenBySpoiler(trophy, state.spoilerOn, state.earned);
  detail.append(el('h2', null, hidden ? 'Hidden story trophy' : trophy.name));
  const official = el('p', 'official', hidden ? 'Story trophy — hidden until earned.' : `${trophy.description} · ${trophy.grade[0].toUpperCase() + trophy.grade.slice(1)}`);
  detail.append(official);
  if (trophy.target) detail.append(el('p', null, `PSN tracks a count for this one: ${trophy.target}.`));

  detail.append(el('h3', null, 'How to unlock it'));
  detail.append(el('p', null, hidden ? 'Earn this trophy in the game to reveal its guide.' : trophy.guide));

  if (trophy.missable) {
    const warn = el('p', 'warn', 'Possibly missable: the first meditation, Lucia on the balcony at Jason’s house in Chapter 1, is reported to disappear after that chapter. Do it the moment the game offers it. Source: PowerPyx.');
    detail.append(warn);
  }

  detail.append(el('h3', null, 'Sources'));
  const sources = el('ul', 'sources');
  for (const source of trophy.sources) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.name;
    link.target = '_blank';
    link.rel = 'noopener';
    item.append(link);
    sources.append(item);
  }
  detail.append(sources);
  detail.append(el('p', 'rarity', 'Rarity: no public rate yet — the game released 19 November 2026, and PSNProfiles and Exophase publish earned percentages as players unlock trophies.'));

  const earnButton = el('button', `earn-btn${state.earned.has(trophy.name) ? ' earned' : ''}`, state.earned.has(trophy.name) ? '✓ Earned — tap to unmark' : 'Mark as earned');
  earnButton.type = 'button';
  earnButton.addEventListener('click', () => callbacks.onToggle(trophy.name, !state.earned.has(trophy.name)));
  detail.append(earnButton);
}

// renderRoadmap is the platinum roadmap view: the headline figures, then one card per step with live progress.
export function renderRoadmap(container, trophies, earned) {
  container.replaceChildren();
  container.append(el('h2', null, 'Roadmap to the platinum'));
  const callout = el('p', 'callout', `Difficulty ${ROADMAP.difficulty} · ${ROADMAP.time} · ${ROADMAP.playthroughs} · ${ROADMAP.online}. Figures from PowerPyx’s trophy guide and roadmap, 18 November 2026.`);
  container.append(callout);
  for (const step of ROADMAP.steps) {
    const { done, total } = roadmapProgress(step, earned, trophies);
    const card = el('div', 'roadmap-step');
    card.append(el('h3', null, step.title));
    card.append(el('p', null, ''));
    card.lastChild.append(el('span', 'hours', `${step.hours} · `), document.createTextNode(`${done} of ${total} trophies earned`));
    card.append(el('p', null, step.text));
    if (step.warning) card.append(el('p', 'warn', step.warning));
    container.append(card);
  }
}

// renderMissables is the missables page: the one possibly missable trophy in full, plus the safe habits that protect a run.
export function renderMissables(container, trophies, state) {
  container.replaceChildren();
  container.append(el('h2', null, 'Missable trophies'));
  const intro = el('p', 'callout warn', 'Only one trophy is reported as possibly missable: Positive Mental Attitude. Everything else — story trophies included — can be earned after the story in free-roam, and nothing on the 100% completion checklist is missable. Source: PowerPyx, 18 November 2026.');
  container.append(intro);
  const trophy = trophies.find((item) => item.missable);
  if (trophy) {
    const card = el('div', 'roadmap-step');
    card.append(el('h3', null, trophy.name));
    card.append(el('p', null, `${trophy.description} · Bronze · Target: ${trophy.target}.`));
    card.append(el('p', null, trophy.guide));
    const sources = el('ul', 'sources');
    for (const source of trophy.sources) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.name;
      link.target = '_blank';
      link.rel = 'noopener';
      item.append(link);
      sources.append(item);
    }
    card.append(el('h3', null, 'Sources'), sources);
    container.append(card);
  }
  const habits = el('div', 'roadmap-step');
  habits.append(el('h3', null, 'Safe habits for a platinum run'));
  const list = document.createElement('ul');
  for (const habit of [
    'Keep a manual save at the start of every chapter and one before the final mission — there is no mission replay and no New Game Plus.',
    'Meditate whenever the game offers it, starting in Chapter 1 (see Positive Mental Attitude above).',
    'Take stranger missions as they appear. Some optional missions disappear over time, but there are far more strands than the eight Strangers & Freaks needs.',
    'Keep cheats off: using any cheat disables trophies and saving.',
    'Scan vehicles and study animals as you travel — 200 of 277 vehicles and 100 of 255 animals feed 100% completion.',
  ]) list.append(el('li', null, habit));
  habits.append(list);
  container.append(habits);
}
