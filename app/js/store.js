/* Leonida Trophy Guide — store.js
   Owns the player's progress: which trophies are earned, the manual
   counters for countable trophies, and the spoiler-shield setting.
   Everything persists in localStorage; nothing leaves the browser.
   Export/import moves the same JSON document between devices. */
(function () {
  "use strict";

  var STORAGE_KEY = "leonida-trophy-guide.progress.v1";

  function defaultState() {
    return {
      version: 1,
      earned: {},            // trophyId -> true
      counts: {},            // trophyId -> number (manual progress counter)
      settings: { hideSpoilers: false },
      updatedAt: null
    };
  }

  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      var parsed = JSON.parse(raw);
      var state = defaultState();
      if (parsed && typeof parsed === "object") {
        if (parsed.earned && typeof parsed.earned === "object") state.earned = parsed.earned;
        if (parsed.counts && typeof parsed.counts === "object") state.counts = parsed.counts;
        if (parsed.settings && typeof parsed.settings === "object") {
          state.settings.hideSpoilers = !!parsed.settings.hideSpoilers;
        }
        if (typeof parsed.updatedAt === "string") state.updatedAt = parsed.updatedAt;
      }
      return state;
    } catch (err) {
      return defaultState();
    }
  }

  var state = load();

  function save() {
    state.updatedAt = new Date().toISOString();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      /* Storage full or blocked (private mode): progress simply will not
         persist this session; the app keeps working in memory. */
    }
  }

  function isEarned(id) {
    return state.earned[id] === true;
  }

  function setEarned(id, earned) {
    if (earned) state.earned[id] = true;
    else delete state.earned[id];
    save();
  }

  function toggleEarned(id) {
    setEarned(id, !isEarned(id));
    return isEarned(id);
  }

  function getCount(id) {
    var n = state.counts[id];
    return typeof n === "number" && isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }

  function setCount(id, value) {
    var n = Math.max(0, Math.floor(Number(value) || 0));
    if (n === 0) delete state.counts[id];
    else state.counts[id] = n;
    save();
    return n;
  }

  function earnedCount(trophies) {
    var n = 0;
    for (var i = 0; i < trophies.length; i++) {
      if (isEarned(trophies[i].id)) n++;
    }
    return n;
  }

  function getHideSpoilers() {
    return state.settings.hideSpoilers === true;
  }

  function setHideSpoilers(value) {
    state.settings.hideSpoilers = !!value;
    save();
  }

  function exportJSON() {
    return JSON.stringify({
      app: "leonida-trophy-guide",
      version: 1,
      exportedAt: new Date().toISOString(),
      earned: state.earned,
      counts: state.counts,
      settings: state.settings
    }, null, 2);
  }

  /* Returns true on success. Throws Error with a readable message otherwise. */
  function importJSON(text) {
    var parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      throw new Error("That file is not valid JSON.");
    }
    if (!parsed || typeof parsed !== "object" ||
        typeof parsed.earned !== "object" || parsed.earned === null) {
      throw new Error("That file does not look like a Leonida Trophy Guide export.");
    }
    var next = defaultState();
    next.earned = parsed.earned;
    if (parsed.counts && typeof parsed.counts === "object") next.counts = parsed.counts;
    if (parsed.settings && typeof parsed.settings === "object") {
      next.settings.hideSpoilers = !!parsed.settings.hideSpoilers;
    }
    state = next;
    save();
    return true;
  }

  function resetAll() {
    state = defaultState();
    save();
  }

  window.LTGStore = {
    isEarned: isEarned,
    setEarned: setEarned,
    toggleEarned: toggleEarned,
    getCount: getCount,
    setCount: setCount,
    earnedCount: earnedCount,
    getHideSpoilers: getHideSpoilers,
    setHideSpoilers: setHideSpoilers,
    exportJSON: exportJSON,
    importJSON: importJSON,
    resetAll: resetAll
  };
})();
