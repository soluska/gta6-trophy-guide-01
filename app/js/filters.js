// filters.js — pure helpers that decide which trophies the checklist shows
// and which ones the spoiler setting masks. No DOM access here.

// A story trophy is a spoiler while the player has the setting on and has not
// earned it yet: its name and description are masked in the list and detail.
export function isMasked(trophy, { hideSpoilers, isEarned }) {
  return hideSpoilers && trophy.kind === "story" && !isEarned(trophy.id);
}

const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

// Filter state: { query, grade, kind, state } straight from the toolbar.
// Returns the visible trophies in list order (grade first, then id, so the
// platinum sits on top like it does on PSN).
export function applyFilters(trophies, filters, isEarned) {
  const q = (filters.query || "").trim().toLowerCase();
  return trophies
    .filter((t) => {
      if (filters.grade !== "all" && t.grade !== filters.grade) return false;
      if (filters.kind !== "all" && t.kind !== filters.kind) return false;
      if (filters.state === "earned" && !isEarned(t.id)) return false;
      if (filters.state === "unearned" && isEarned(t.id)) return false;
      if (q) {
        const haystack = `${t.name} ${t.description} ${t.kind} ${t.grade}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id);
}
