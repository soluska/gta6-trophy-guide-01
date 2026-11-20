/* Leonida Trophy Guide — filters.js
   Pure search/filter logic for the checklist, plus the spoiler shield.
   No DOM access here: functions take data and criteria, return data. */
(function () {
  "use strict";

  /* A story trophy is treated as a spoiler while the shield is on and the
     trophy has not been earned yet: its name and description are masked.
     Hidden trophies (the riddle-like secret ones) are masked the same way
     until earned, shield or not — that mirrors how PSN presents them. */
  function isMasked(trophy, criteria) {
    if (criteria.isEarned(trophy.id)) return false;
    if (trophy.hidden) return true;
    if (criteria.hideSpoilers && trophy.kind === "story") return true;
    return false;
  }

  function matchesQuery(trophy, query, masked) {
    if (!query) return true;
    if (masked) return false; // do not leak hidden names through search
    var haystack = (trophy.name + " " + trophy.description + " " + trophy.guide).toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  /* criteria: {
     query: string (already trimmed, any case),
     grade: "all" | grade,
     kind: "all" | kind,
     state: "all" | "earned" | "unearned",
     hideSpoilers: boolean,
     isEarned: function(id) -> boolean
   }
   Returns a NEW array of shallow copies, each with a `_masked` flag. */
  function applyFilters(trophies, criteria) {
    var query = (criteria.query || "").toLowerCase();
    var out = [];
    for (var i = 0; i < trophies.length; i++) {
      var t = trophies[i];
      if (criteria.grade !== "all" && t.grade !== criteria.grade) continue;
      if (criteria.kind !== "all" && t.kind !== criteria.kind) continue;
      var earned = criteria.isEarned(t.id);
      if (criteria.state === "earned" && !earned) continue;
      if (criteria.state === "unearned" && earned) continue;
      var masked = isMasked(t, criteria);
      if (!matchesQuery(t, query, masked)) continue;
      var copy = {};
      for (var key in t) {
        if (Object.prototype.hasOwnProperty.call(t, key)) copy[key] = t[key];
      }
      copy._masked = masked;
      out.push(copy);
    }
    return out;
  }

  window.LTGFilter = {
    apply: applyFilters,
    isMasked: isMasked
  };
})();
