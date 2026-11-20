/* Leonida Trophy Guide — views.js
   Rendering only: turns trophy data + progress state into HTML strings.
   Every dynamic string passes through esc() before it reaches the page. */
(function () {
  "use strict";

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function gradeLabel(grade) {
    return grade.charAt(0).toUpperCase() + grade.slice(1);
  }

  function kindLabel(kind) {
    var labels = {
      story: "Story",
      missable: "Missable",
      collectibles: "Collectibles",
      activities: "Activities",
      completion: "Completion",
      other: "Other",
      online: "Online"
    };
    return labels[kind] || kind;
  }

  function badges(trophy, earned) {
    var out = "";
    out += '<span class="badge grade-' + esc(trophy.grade) + '">' + esc(gradeLabel(trophy.grade)) + "</span>";
    out += '<span class="badge">' + esc(kindLabel(trophy.kind)) + "</span>";
    if (trophy.missable) out += '<span class="badge alert">Possibly missable</span>';
    if (trophy.unconfirmed) out += '<span class="badge warn">Unconfirmed</span>';
    if (trophy.hidden && !earned) out += '<span class="badge">Hidden</span>';
    if (earned) out += '<span class="badge done">Earned</span>';
    return out;
  }

  function formatTarget(trophy) {
    if (trophy.target == null) return esc(trophy.targetLabel || "");
    return esc(trophy.target.toLocaleString("en-US")) + " — " + esc(trophy.targetLabel || "");
  }

  /* ---------- checklist cards ---------- */

  function trophyCard(trophy, opts) {
    var earned = opts.isEarned(trophy.id);
    var name = trophy._masked ? "Hidden trophy" : trophy.name;
    var desc = trophy._masked
      ? "This trophy is hidden until you earn it."
      : trophy.description;
    var classes = "trophy-card grade-" + trophy.grade +
      (earned ? " is-earned" : "") +
      (opts.selectedId === trophy.id ? " is-selected" : "");
    return (
      '<button type="button" class="' + classes + '" data-trophy-id="' + trophy.id + '">' +
        '<span class="card-main">' +
          '<span class="card-top"><span class="card-name">' + esc(name) + "</span></span>" +
          '<span class="card-desc">' + esc(desc) + "</span>" +
          '<span class="card-badges">' + badges(trophy, earned) + "</span>" +
        "</span>" +
        '<span class="card-check" aria-hidden="true">✓</span>' +
      "</button>"
    );
  }

  function trophyList(trophies, opts) {
    if (trophies.length === 0) {
      return '<div class="empty-state"><strong>Nothing matches.</strong><br>' +
        "No trophies fit the current search and filters. " +
        (opts.kind === "online"
          ? "That is expected for the Online filter: no trophy in this list requires online play."
          : "Try widening the filters.") +
        "</div>";
    }
    return trophies.map(function (t) { return trophyCard(t, opts); }).join("");
  }

  /* ---------- detail pane ---------- */

  function detail(trophy, opts) {
    if (!trophy) {
      return '<p class="detail-empty">Select a trophy to see its guide, target and warnings.</p>';
    }
    var earned = opts.isEarned(trophy.id);
    var masked = !earned && (trophy.hidden || (opts.hideSpoilers && trophy.kind === "story"));
    var name = masked ? "Hidden trophy" : trophy.name;
    var desc = masked ? "This trophy is hidden until you earn it." : trophy.description;
    var out = "";
    out += "<h2>" + esc(name) + "</h2>";
    out += '<p class="official-desc">“' + esc(desc) + '”</p>';
    out += '<div class="card-badges">' + badges(trophy, earned) + "</div>";

    if (trophy.unconfirmed) {
      out += '<div class="callout warn"><strong>Unconfirmed trigger.</strong> ' +
        "No tracker has verified how this trophy is earned yet. The note below is honest about what is known — and what is not.</div>";
    }
    if (trophy.missable) {
      out += '<div class="callout alert"><strong>Possibly missable.</strong> ' +
        "One part of this trophy is tied to a one-time story moment and there is no mission replay or New Game Plus. Read the guide before you play past Chapter 1.</div>";
    }

    out += "<h3>Guide</h3><p>" + esc(trophy.guide) + "</p>";

    if (trophy.targetLabel || trophy.target != null) {
      out += "<h3>Target</h3><p>" + formatTarget(trophy) + "</p>";
    }

    if (typeof trophy.target === "number" && trophy.target > 1) {
      var count = opts.getCount(trophy.id);
      out += "<h3>Your counter</h3>" +
        '<div class="counter-row">' +
          '<button type="button" class="counter-btn" data-counter="-1" aria-label="Decrease counter">−</button>' +
          '<span class="count">' + count.toLocaleString("en-US") + " / " + trophy.target.toLocaleString("en-US") + "</span>" +
          '<button type="button" class="counter-btn" data-counter="1" aria-label="Increase counter">+</button>' +
        "</div>" +
        '<p class="fineprint">A personal tally for your own tracking — it does not read your PSN data.</p>';
    }

    out += "<h3>Rarity</h3><p>" + esc(trophy.rarity) + "</p>";
    out += "<h3>Sources</h3>" +
      '<p class="fineprint">Trophy listed by Exophase, PSNProfiles and PowerPyx.' +
      (trophy.unconfirmed ? " All three list it without a confirmed method at launch." : "") +
      "</p>";

    out += '<button type="button" class="earn-btn' + (earned ? " is-earned" : "") + '" data-toggle-earned="' + trophy.id + '">' +
      (earned ? "Earned — tap to undo" : "Mark as earned") + "</button>";
    return out;
  }

  /* ---------- roadmap ---------- */

  function roadmap(data, opts) {
    var meta = window.LTGRoadmap.meta;
    var out = "";
    out += '<div class="page-intro"><h2>Platinum Roadmap</h2>' +
      "<p>One playthrough, three steps. The platinum (Vice Got a Price!) unlocks automatically when the other 54 trophies are earned, so this route is simply the order that wastes the least effort: story first, strands and feats second, the counted 100% sweep last.</p>" +
      '<div class="stat-row">' +
        '<span class="stat-chip">Difficulty <strong>' + esc(meta.difficulty) + "</strong></span>" +
        '<span class="stat-chip">Time <strong>' + esc(meta.hours) + "</strong></span>" +
        '<span class="stat-chip">Playthroughs <strong>' + esc(meta.playthroughs) + "</strong></span>" +
        '<span class="stat-chip">Online <strong>not required</strong></span>' +
      "</div></div>";

    window.LTGRoadmap.steps.forEach(function (step) {
      var progress = window.LTGRoadmap.stepProgress(step, opts.isEarned);
      var byId = {};
      data.trophies.forEach(function (t) { byId[t.id] = t; });
      out += '<article class="step-card"><h3>' + esc(step.title) + "</h3>" +
        '<div class="step-meta">' + esc(step.hours) + " · " + progress.done + " / " + progress.total + " trophies</div>" +
        "<p>" + esc(step.blurb) + "</p>" +
        '<div class="progress-track"><div class="progress-fill" style="width:' + progress.pct + '%"></div></div>' +
        '<div class="step-trophies">' +
          step.trophyIds.map(function (id) {
            var t = byId[id];
            var label = t ? t.name : ("Trophy " + id);
            return '<span class="step-trophy' + (opts.isEarned(id) ? " done" : "") + '">' + esc(label) + "</span>";
          }).join("") +
        "</div></article>";
    });

    out += '<div class="page-intro"><h2>Before you start</h2><ul class="note-list">' +
      window.LTGRoadmap.warnings.map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") +
      "</ul></div>";
    return out;
  }

  /* ---------- missables ---------- */

  function missables(data, opts) {
    var risky = data.trophies.filter(function (t) { return t.missable; });
    var out = "";
    out += '<div class="page-intro"><h2>Missables &amp; one-time moments</h2>' +
      "<p>Good news first: this is a gentle list. No trophy requires online play, the story trophies cannot be locked out, and almost everything else can be cleaned up in free roam after the credits. There is exactly one trophy the community flags as possibly missable — treat it with respect, because the game offers no mission replay and no New Game Plus.</p></div>";

    risky.forEach(function (t) {
      var earned = opts.isEarned(t.id);
      out += '<article class="step-card"><h3>' + esc(t.name) + "</h3>" +
        '<div class="step-meta">' + esc(gradeLabel(t.grade)) + " · " + esc(t.targetLabel || "") + (earned ? " · Earned" : "") + "</div>" +
        "<p>" + esc(t.guide) + "</p></article>";
    });

    out += '<div class="page-intro"><h2>The structural gotchas</h2><ul class="note-list">' +
      window.LTGRoadmap.warnings.map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") +
      "</ul>" +
      "<p>The practical upshot: do the Chapter 1 balcony meditation when it appears, keep cheats on a separate save, and everything else can wait until you feel like it.</p></div>";
    return out;
  }

  window.LTGViews = {
    esc: esc,
    gradeLabel: gradeLabel,
    kindLabel: kindLabel,
    trophyList: trophyList,
    detail: detail,
    roadmap: roadmap,
    missables: missables
  };
})();
