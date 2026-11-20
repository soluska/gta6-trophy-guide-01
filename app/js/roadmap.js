// roadmap.js — the platinum roadmap data.
// Difficulty and hour estimates come from launch guides (PowerPyx rates the
// list 4/10 and ~200 hours); each step's trophy kinds let views.js compute
// live progress from the player's own checklist.

export const ROADMAP = {
  difficulty: "4/10",
  hours: "~200 hours",
  summary:
    "A long but forgiving platinum. Nothing on the list demands high-end skill: " +
    "the shooting-range golds are the closest thing to a skill check, and the real " +
    "cost is time — the 100% completion trophy (A Long Road) alone accounts for " +
    "most of the ~200 hours. There are no online trophies, no difficulty-setting " +
    "trophies, and only one possibly missable trophy (Positive Mental Attitude), " +
    "so a single careful playthrough can earn everything.",
  steps: [
    {
      title: "Step 1 — Play through the story",
      kinds: ["story"],
      body:
        "Finish the campaign and every stranger strand. All 17 story trophies are " +
        "unmissable progression awards, including the strand finales for Andy, " +
        "Kenton, Billy, Randy and Tyrone. Two warnings before you start: the game " +
        "has no mission replay and no New Game Plus, and entering cheat codes " +
        "disables trophies and saving — so play clean, and when Lucia's Chapter 1 " +
        "balcony meditation is offered, do it (it feeds the one possibly missable " +
        "trophy in Step 2). Keep a manual save before the final mission.",
    },
    {
      title: "Step 2 — Activities & collectibles across Leonida",
      kinds: ["activity", "collectible"],
      body:
        "Clear the map: 250 stunts, gold medals in all 42 shooting-range challenges, " +
        "drone-race wins at all 14 locations, 20 race wins, 50 challenges, the card " +
        "sets, WAiNK at 100 locations, 100 discovered vehicles, all 52 areas and all " +
        "18 meditation spots. Positive Mental Attitude (the meditation spots) is the " +
        "list's one possibly missable trophy — if the Chapter 1 spot was done in " +
        "Step 1, the rest are all waiting in free roam.",
    },
    {
      title: "Step 3 — 100% completion & clean-up",
      kinds: ["completion", "misc"],
      body:
        "Finish A Long Road (100% on the in-game tracker — roughly 200 of 277 " +
        "vehicles, 100 of 255 animals and 70 of 80 challenges), then sweep the " +
        "one-off miscellaneous trophies: the partner jobs, the vault and armored-" +
        "truck robberies, the money totals and the rest. Six miscellaneous trophies " +
        "still have unconfirmed triggers (see their entries) — everything else on " +
        "the list can be cleaned up in free roam after the story. The platinum, " +
        "Vice Got a Price!, pops the moment the 54th other trophy lands.",
    },
  ],
};
