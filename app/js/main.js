/* Leonida Trophy Guide — main.js
   Boot and wiring: loads the trophy data, connects the controls, keeps the
   checklist / detail pane / header progress in sync, and routes between the
   Checklist, Roadmap and Missables views via the URL hash. */
(function () {
  "use strict";

  var DATA = null;          // parsed trophies.json
  var selectedId = null;    // trophy shown in the detail pane
  var route = "checklist";  // checklist | roadmap | missables

  var els = {};

  function grab(id) { return document.getElementById(id); }

  function currentCriteria() {
    return {
      query: els.search.value.trim(),
      grade: els.grade.value,
      kind: els.kind.value,
      state: els.state.value,
      hideSpoilers: window.LTGStore.getHideSpoilers(),
      isEarned: window.LTGStore.isEarned
    };
  }

  function trophyById(id) {
    if (!DATA) return null;
    for (var i = 0; i < DATA.trophies.length; i++) {
      if (DATA.trophies[i].id === id) return DATA.trophies[i];
    }
    return null;
  }

  function renderHeader() {
    var earned = window.LTGStore.earnedCount(DATA.trophies);
    var total = DATA.trophies.length;
    var pct = total === 0 ? 0 : Math.round((earned / total) * 100);
    els.overallCount.textContent = earned + " / " + total;
    els.overallBar.style.width = pct + "%";
    els.overallPct.textContent = pct + "%";
  }

  function renderChecklist() {
    var criteria = currentCriteria();
    var visible = window.LTGFilter.apply(DATA.trophies, criteria);
    els.list.innerHTML = window.LTGViews.trophyList(visible, {
      isEarned: window.LTGStore.isEarned,
      selectedId: selectedId,
      kind: criteria.kind
    });
    els.resultCount.textContent =
      "Showing " + visible.length + " of " + DATA.trophies.length + " trophies.";
    renderDetail();
  }

  function renderDetail() {
    var trophy = selectedId == null ? null : trophyById(selectedId);
    els.detail.innerHTML = window.LTGViews.detail(trophy, {
      isEarned: window.LTGStore.isEarned,
      getCount: window.LTGStore.getCount,
      hideSpoilers: window.LTGStore.getHideSpoilers()
    });
  }

  function renderRoadmap() {
    els.roadmapRoot.innerHTML = window.LTGViews.roadmap(DATA, {
      isEarned: window.LTGStore.isEarned
    });
  }

  function renderMissables() {
    els.missablesRoot.innerHTML = window.LTGViews.missables(DATA, {
      isEarned: window.LTGStore.isEarned
    });
  }

  function renderAll() {
    renderHeader();
    if (route === "checklist") renderChecklist();
    else if (route === "roadmap") renderRoadmap();
    else if (route === "missables") renderMissables();
  }

  function setRoute(next) {
    route = next;
    ["checklist", "roadmap", "missables"].forEach(function (name) {
      grab("view-" + name).hidden = name !== route;
    });
    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.classList.toggle("is-active", tab.getAttribute("data-route") === route);
    });
    renderAll();
  }

  function routeFromHash() {
    var hash = window.location.hash.replace(/^#\/?/, "");
    if (hash === "roadmap" || hash === "missables" || hash === "checklist") return hash;
    return "checklist";
  }

  function flashToolsMessage(text) {
    els.toolsMsg.textContent = text;
    window.setTimeout(function () {
      if (els.toolsMsg.textContent === text) els.toolsMsg.textContent = "";
    }, 4000);
  }

  function wireEvents() {
    [els.search, els.grade, els.kind, els.state].forEach(function (el) {
      el.addEventListener("input", renderChecklist);
      el.addEventListener("change", renderChecklist);
    });

    els.spoilers.checked = window.LTGStore.getHideSpoilers();
    els.spoilers.addEventListener("change", function () {
      window.LTGStore.setHideSpoilers(els.spoilers.checked);
      renderChecklist();
    });

    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-route");
        if (window.location.hash === "#/" + target) setRoute(target);
        else window.location.hash = "#/" + target;
      });
    });
    window.addEventListener("hashchange", function () { setRoute(routeFromHash()); });

    /* Card clicks select a trophy; the detail pane's buttons handle
       earn toggles and the personal counter (event delegation). */
    els.list.addEventListener("click", function (event) {
      var card = event.target.closest("[data-trophy-id]");
      if (!card) return;
      selectedId = Number(card.getAttribute("data-trophy-id"));
      renderChecklist();
    });

    els.detail.addEventListener("click", function (event) {
      var toggle = event.target.closest("[data-toggle-earned]");
      if (toggle) {
        window.LTGStore.toggleEarned(Number(toggle.getAttribute("data-toggle-earned")));
        renderHeader();
        renderChecklist();
        return;
      }
      var counterBtn = event.target.closest("[data-counter]");
      if (counterBtn && selectedId != null) {
        var trophy = trophyById(selectedId);
        if (trophy && typeof trophy.target === "number") {
          var next = window.LTGStore.getCount(selectedId) + Number(counterBtn.getAttribute("data-counter"));
          window.LTGStore.setCount(selectedId, Math.min(next, trophy.target));
          renderDetail();
        }
      }
    });

    els.exportBtn.addEventListener("click", function () {
      var blob = new Blob([window.LTGStore.exportJSON()], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "leonida-trophy-progress.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      flashToolsMessage("Progress exported.");
    });

    els.importBtn.addEventListener("click", function () { els.importFile.click(); });
    els.importFile.addEventListener("change", function () {
      var file = els.importFile.files && els.importFile.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          window.LTGStore.importJSON(String(reader.result || ""));
          els.spoilers.checked = window.LTGStore.getHideSpoilers();
          flashToolsMessage("Progress imported.");
          renderAll();
        } catch (err) {
          flashToolsMessage(err.message || "Import failed.");
        }
        els.importFile.value = "";
      };
      reader.readAsText(file);
    });

    els.resetBtn.addEventListener("click", function () {
      if (window.confirm("Reset all progress, counters and settings? This cannot be undone.")) {
        window.LTGStore.resetAll();
        els.spoilers.checked = false;
        selectedId = null;
        flashToolsMessage("Progress reset.");
        renderAll();
      }
    });
  }

  function showLoadError(err) {
    els.list.innerHTML =
      '<div class="empty-state"><strong>Could not load the trophy data.</strong><br>' +
      "The app reads app/data/trophies.json, which browsers block from plain file:// pages. " +
      "Start the bundled server instead: <code>node serve.ts</code>, then open http://localhost:8080.</div>";
    if (window.console) console.error(err);
  }

  function boot() {
    els.search = grab("filter-search");
    els.grade = grab("filter-grade");
    els.kind = grab("filter-kind");
    els.state = grab("filter-state");
    els.spoilers = grab("setting-spoilers");
    els.list = grab("trophy-list");
    els.detail = grab("detail");
    els.resultCount = grab("result-count");
    els.overallCount = grab("overall-count");
    els.overallBar = grab("overall-bar");
    els.overallPct = grab("overall-pct");
    els.roadmapRoot = grab("roadmap-root");
    els.missablesRoot = grab("missables-root");
    els.exportBtn = grab("btn-export");
    els.importBtn = grab("btn-import");
    els.importFile = grab("file-import");
    els.resetBtn = grab("btn-reset");
    els.toolsMsg = grab("tools-msg");

    fetch("data/trophies.json")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status + " loading trophies.json");
        return res.json();
      })
      .then(function (data) {
        DATA = data;
        var problems = window.LTGRoadmap.coverageProblems(data.trophies);
        if (problems.length && window.console) console.warn("Roadmap coverage:", problems);
        wireEvents();
        setRoute(routeFromHash());
      })
      .catch(showLoadError);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
