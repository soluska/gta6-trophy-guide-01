[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/soluska/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/soluska/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Trophy Guide

An offline, dependency-free web app that tracks all **55 PlayStation 5 trophies
for Grand Theft Auto VI** (1 platinum, 2 gold, 6 silver, 46 bronze) and tells
you, in plain language, how each one is earned.

The game has only just launched, so this guide is deliberately honest about
what is known and what is not:

- Every trophy carries a short guide written for this app, plus its official
  description, grade, category and PSN target count where one exists.
- Six trophies whose triggers nobody has confirmed yet are **flagged as
  unconfirmed** instead of being dressed up with invented steps.
- One trophy (Positive Mental Attitude) is flagged as **possibly missable** —
  see the Missables page in the app for why, and do that one early.
- Rarity percentages are not public yet, so the app says so rather than
  guessing at numbers.

## Features

- **Checklist** — search by name or description, filter by grade
  (platinum/gold/silver/bronze), by kind (story, missable, collectibles,
  activities, completion, other, online) and by earned state.
- **Detail pane** — per-trophy guide, target counter you can increment as you
  play, missable and unconfirmed warnings, and tracker sources
  (Exophase, PSNProfiles, PowerPyx).
- **Platinum roadmap** — a 3-step route rated 4/10 difficulty at roughly
  200 hours, with live progress per step driven by your checklist.
- **Missables page** — the risky trophies and the structural gotchas
  (no mission replay, no New Game Plus, cheats disable trophies).
- **Spoiler shield** — an optional setting that hides story trophy names and
  descriptions until you have earned them.
- **Your progress stays yours** — earned state, counters and settings live in
  your browser's localStorage, and you can export them to a JSON file and
  import them back on another device. Nothing is uploaded anywhere.

## Run it

You need Node.js 22 or newer (the server files are TypeScript that Node runs
directly via type stripping; on Node 22 add `--experimental-strip-types`).

```sh
node serve.ts
```

Then open <http://localhost:8080>. `main.ts` is an alternative entrypoint
that starts the same server:

```sh
node main.ts
```

Any other static file server pointed at the `app/` folder works too — the app
is plain HTML, CSS and JavaScript with no build step and no dependencies.

## Layout

- `app/index.html` — the page shell
- `app/style.css` — all styling (CSS-only visuals, no images)
- `app/js/` — `store.js` (progress persistence), `filters.js` (search/filter
  logic), `roadmap.js` (roadmap data and progress maths), `views.js`
  (rendering), `main.js` (boot and wiring)
- `app/data/trophies.json` — the trophy database: official names,
  descriptions and grades, plus this app's own kinds, targets and guides

## A note on accuracy

Trophy names, descriptions and grades are the official ones published for the
PS5 list. Everything else — categories, targets and guide text — is this
project's own work, cross-checked against the public trophy trackers named
above. Where the community has not yet confirmed how a trophy triggers, the
app labels it **unconfirmed** rather than repeating guesses as fact.

<sub>Entered on [make.fun](https://make.fun/?ref=esagh3na&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
