// The platinum roadmap: three steps built from the official trophy descriptions and PowerPyx's roadmap
// (difficulty 4/10, about 200 hours, one playthrough, no online trophies, no mission replay).
// Each step names the trophy ids it works toward, so the roadmap view can show live progress per step.
export const ROADMAP = {
  difficulty: '4/10',
  time: 'about 200 hours',
  playthroughs: '1 (free-roam continues after the story; no mission replay, no New Game Plus)',
  online: '0 online trophies — every one of the 55 is single-player',
  steps: [
    {
      title: 'Step 1 — Play the five chapters',
      hours: '60–80 hours',
      trophies: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 22, 23, 24, 26, 27, 28],
      text: 'Play the story through its five chapters and take the optional missions as they appear. Scan vehicles and study animals as you travel, since 100% completion needs 200 of 277 vehicles scanned and 100 of 255 animals studied. Do every stranger mission you pass: some optional missions disappear after a while, but there are far more strands than the eight Strangers & Freaks needs.',
      warning: 'Do Lucia’s Chapter 1 balcony meditation the moment it is offered (after the mission Down to Earth, talk to Lucia in the kitchen in the morning and accept). It is the one possibly missable trophy — Positive Mental Attitude — and the spot is reported to disappear after Chapter 1.',
    },
    {
      title: 'Step 2 — The 100% completion checklist',
      hours: 'about 100 hours',
      trophies: [14, 15, 16, 17, 18, 19, 20, 21, 25, 30, 31, 32, 35, 40, 42, 43, 46, 48, 52, 53, 54, 55],
      text: 'After the credits, open the 100% completion checklist (Progress, Stats, 100% Completion) and work through it. It is roughly 60% of true completion: 70 of the 80 challenges, most of the collectibles and activities, and the scanning and studying from Step 1. This step is the bulk of the platinum and where trophies like Cunning Stunts (250 stunts), The Shootist (gold in all 42 Shooting Range challenges) and You WAiNKer! (100 locations) fall.',
      warning: null,
    },
    {
      title: 'Step 3 — Strangers, character quests and cleanup',
      hours: 'about 10 hours',
      trophies: [1, 29, 33, 34, 36, 37, 38, 39, 41, 44, 45, 47, 49, 50, 51],
      text: 'Finish any remaining stranger strands (eight for Strangers & Freaks), the character quests for Andy, Kenton, Billy, Randy and Tyrone, then clean up the one-off trophies: the partner robberies, Combat Focus, the VCIA departure, the jewelry store, the armored truck, and the unconfirmed ones (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin) once launch guides verify them. The platinum, Vice Got a Price!, pops when the last of the other 54 does.',
      warning: 'Keep cheats off for the whole run: using any cheat disables trophies and saving.',
    },
  ],
};

// roadmapProgress counts, per step, how many of its trophies the reader has earned.
export function roadmapProgress(step, earned, trophies) {
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  const done = step.trophies.filter((id) => byId.has(id) && earned.has(byId.get(id).name)).length;
  return { done, total: step.trophies.length };
}
