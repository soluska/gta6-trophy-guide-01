// Search, grade, kind and earned filters, plus the spoiler rule that hides story trophies until earned.
export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectible: 'Collectible',
  activity: 'Activity',
  completion: 'Completion',
  misc: 'Other',
};

// isStoryTrophy decides what the spoiler setting hides: chapter, mission and stranger-final trophies.
export function isStoryTrophy(trophy) {
  return trophy.kind === 'story';
}

// isHiddenBySpoiler is true for a story trophy the reader has not earned yet while the spoiler setting is on.
export function isHiddenBySpoiler(trophy, spoilerOn, earned) {
  return spoilerOn && isStoryTrophy(trophy) && !earned.has(trophy.name);
}

// applyFilters returns the trophies matching the toolbar: search text, grade, kind and earned state.
// The "online" kind has no trophies in this game — the list is single-player only — so it matches nothing on purpose.
export function applyFilters(trophies, filters, earned) {
  const query = filters.search.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
    if (filters.kind === 'missable' && !trophy.missable) return false;
    if (filters.kind === 'online') return false;
    if (filters.kind !== 'all' && filters.kind !== 'missable' && trophy.kind !== filters.kind) return false;
    if (filters.earned === 'earned' && !earned.has(trophy.name)) return false;
    if (filters.earned === 'unearned' && earned.has(trophy.name)) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${KIND_LABELS[trophy.kind] ?? ''}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}
