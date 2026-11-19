// Saved progress for the trophy checklist: localStorage, plus export to a file and import back.
export const PROGRESS_KEY = 'gta6-trophy-guide-progress-v1';

// loadProgress reads the earned trophy names out of localStorage; a corrupt or foreign value is ignored.
export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((name) => typeof name === 'string'));
  } catch {
    return new Set();
  }
}

// saveProgress writes the earned names back. It is called on every tick so a reload never loses a check.
export function saveProgress(earned) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned]));
  } catch {
    // Storage full or unavailable (private mode): the page still works, it just cannot remember.
  }
}

// exportProgress downloads the earned names as JSON, so progress moves between browsers.
export function exportProgress(earned) {
  const payload = JSON.stringify({ game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned] }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

// parseImportedProgress turns an imported file's text into an earned set, keeping only names the list holds.
export function parseImportedProgress(text, knownNames) {
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(list)) throw new Error('That file does not hold a trophy list.');
  const known = new Set(knownNames);
  return new Set(list.filter((name) => typeof name === 'string' && known.has(name)));
}
