/* Leonida Trophy Guide — roadmap.js
   The platinum roadmap: three steps that between them cover every trophy
   except the platinum itself (which unlocks automatically at 54/54).
   Also holds the standing warnings that apply to the whole run. */
(function () {
  "use strict";

  var META = {
    difficulty: "4 / 10",
    hours: "~200 hours",
    playthroughs: "1 (plus free-roam cleanup)",
    onlineRequired: "None — no trophy in this list needs online play"
  };

  var STEPS = [
    {
      id: "story",
      title: "Step 1 — See the story out",
      hours: "~35–45 hours",
      blurb: "Play the campaign from Gone Fishing to the final mission. Every chapter and named-mission trophy lands automatically along the way, and the story introduces most of the map, activities and stranger strands you will finish later. One thing to do on sight during this step: the Chapter 1 balcony meditation for Positive Mental Attitude — it is the list's one possibly missable moment, and there is no mission replay to rescue it.",
      trophyIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    },
    {
      id: "strands",
      title: "Step 2 — Strands, partners and scores",
      hours: "~60–80 hours",
      blurb: "With the story done and the whole state open, work the stranger strands to their finales (each one also feeds Strangers & Freaks), then clear the partner and crime feats while they are fresh: the wanted-level escapes with your partner riding along, the stealth jewelry job, vaults, the armored truck and one illegal operation per gang. Money trophies — laundering Marked Bills, shop spending, buying every garage — progress naturally during this phase.",
      trophyIds: [22, 23, 24, 25, 26, 27, 29, 33, 34, 36, 37, 39, 40, 41, 43, 47, 48, 52, 53, 54]
    },
    {
      id: "sweep",
      title: "Step 3 — The 100% sweep",
      hours: "~80–100 hours",
      blurb: "The long tail. Drive the in-game completion tracker to 100% while sweeping the counted grinds: stunts, shooting-range golds, races, challenges, cards, photo spots, vehicles and areas. Keep an eye on the six unconfirmed trophies in this step — the community has not verified their triggers yet, so check back rather than grinding guesses. When the tracker reads 100% and the last counted trophy pops, the platinum follows on its own.",
      trophyIds: [14, 15, 16, 17, 18, 19, 20, 21, 28, 30, 31, 32, 35, 38, 42, 44, 45, 46, 49, 50, 51, 55]
    }
  ];

  /* Standing warnings shown on the roadmap and missables pages. */
  var WARNINGS = [
    "No mission replay: story moments cannot be replayed on the same save, which is what makes the Chapter 1 meditation risky.",
    "No New Game Plus: a missed one-time moment means a fresh playthrough, not a chapter select.",
    "Cheats disable trophies (and saving): if you experiment with cheat codes, do it on a throwaway save.",
    "Six trophies are still unconfirmed at launch. Their entries in the checklist say so plainly — wait for verified methods instead of following guesswork.",
    "Nothing in this list requires online play, so the platinum stays earnable even if servers change in the future."
  ];

  function stepProgress(step, isEarned) {
    var done = 0;
    for (var i = 0; i < step.trophyIds.length; i++) {
      if (isEarned(step.trophyIds[i])) done++;
    }
    return {
      done: done,
      total: step.trophyIds.length,
      pct: step.trophyIds.length === 0 ? 0 : Math.round((done / step.trophyIds.length) * 100)
    };
  }

  /* Sanity check used by the app boot: the three steps should cover every
     non-platinum trophy exactly once. Returns a list of problems (empty = ok). */
  function coverageProblems(trophies) {
    var seen = {};
    var problems = [];
    STEPS.forEach(function (step) {
      step.trophyIds.forEach(function (id) {
        if (seen[id]) problems.push("Trophy " + id + " appears in two roadmap steps.");
        seen[id] = true;
      });
    });
    trophies.forEach(function (t) {
      if (t.grade !== "platinum" && !seen[t.id]) {
        problems.push("Trophy " + t.id + " (" + t.name + ") is missing from the roadmap.");
      }
    });
    return problems;
  }

  window.LTGRoadmap = {
    meta: META,
    steps: STEPS,
    warnings: WARNINGS,
    stepProgress: stepProgress,
    coverageProblems: coverageProblems
  };
})();
