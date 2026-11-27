/* ==========================================================================
   ClickGUI — corz.gg layout rebuilt 1:1 at a 620x360 stage, branded PULSE.
   Handles stage scaling, module cards, toggles, search and the live clock.
   ========================================================================== */

(function () {
  "use strict";

  var ICONS = {
    combat:
      '<svg viewBox="0 0 24 24"><path d="M13.5 3.5l7 7-2.5 2.5-7-7z"/><path d="M3 21l6.5-6.5"/><path d="M10.5 10.5l3 3"/></svg>',
    movement:
      '<svg viewBox="0 0 24 24"><path d="M3 17h5l4.5-10H21"/><path d="M18 4l3 3-3 3"/></svg>',
    smp:
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.6"/></svg>',
    visuals:
      '<svg viewBox="0 0 24 24"><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.4"/></svg>',
    misc:
      '<svg viewBox="0 0 24 24"><path d="M4 8h10M18 8h2M4 16h4M12 16h8"/><circle cx="16" cy="8" r="2"/><circle cx="10" cy="16" r="2"/></svg>',
    network:
      '<svg viewBox="0 0 24 24"><path d="M4 9a12 12 0 0116 0M7 13a8 8 0 0110 0M10.5 16.5a3 3 0 013 0"/><circle cx="12" cy="19.5" r="0.8"/></svg>',
    bots:
      '<svg viewBox="0 0 24 24"><rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9.5 13h.01M14.5 13h.01"/></svg>',
    settings:
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/></svg>',
    configs:
      '<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
    theme:
      '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 100 18h1.4a2 2 0 001.4-3.4 2 2 0 011.4-3.4H18a3 3 0 003-3C21 7 17 3 12 3z"/><path d="M8 9h.01M12 7h.01M16 9h.01"/></svg>',
    socials:
      '<svg viewBox="0 0 24 24"><path d="M4 5h16v10H9l-5 4z"/></svg>'
  };

  var NAV = [
    { id: "combat", label: "Combat", icon: "combat", count: true },
    { id: "movement", label: "Movement", icon: "movement" },
    { id: "donutsmp", label: "DonutSMP", icon: "smp", count: 1 },
    { id: "visuals", label: "Visuals", icon: "visuals", count: 6 },
    { id: "misc", label: "Misc", icon: "misc", count: 4 },
    { id: "network", label: "Network", icon: "network" },
    { id: "bots", label: "Bots", icon: "bots" }
  ];

  var GENERAL = [
    { id: "settings", label: "Settings", icon: "settings" },
    { id: "configs", label: "Configs", icon: "configs" },
    { id: "theme", label: "Theme", icon: "theme" },
    { id: "socials", label: "Socials", icon: "socials" }
  ];

  /* Corz ClickGUI Combat tab, exactly as shown in their window. */
  var MODULES = [
    { name: "Auto Inventory Totem", on: true },
    { name: "Auto Crystal", on: true },
    { name: "Crystal Optimizer", on: false, warn: true },
    { name: "Silent Aim", on: true },
    { name: "AutoTrap", on: false, warn: true },
    { name: "AutoClicker", on: false },
    { name: "Hit Select", on: false },
    { name: "Safe Anchor", on: false },
    { name: "Anchor Macro", on: true },
    { name: "Auto Totem", on: false },
    { name: "Aim Assist", on: false },
    { name: "Reach", on: false, warn: true },
    { name: "AutoCart", on: false, warn: true },
    { name: "Trigger Bot", on: false },
    { name: "Trident Assist", on: false },
    { name: "Auto XP", on: false }
  ];

  function init() {
    var root = document.getElementById("cg-gui");
    if (!root) return;

    var frame = document.getElementById("cg-frame");
    var stage = document.getElementById("cg-stage");
    var grid = document.getElementById("cg-grid");
    var navModules = document.getElementById("cg-nav-modules");
    var navGeneral = document.getElementById("cg-nav-general");
    var search = document.getElementById("cg-search");
    var clock = document.getElementById("cg-clock");
    if (!frame || !stage || !grid || !navModules) return;

    /* ---------------------------------------------------- stage scaling */
    var BASE_WIDTH = 620;
    function fit() {
      var width = frame.clientWidth;
      if (!width) {
        window.requestAnimationFrame(fit);
        return;
      }
      var scale = Math.min(1.6, width / BASE_WIDTH);
      stage.style.setProperty("--cg-scale", scale.toFixed(4));
    }
    fit();
    window.requestAnimationFrame(fit);
    window.addEventListener("load", fit);
    window.addEventListener("resize", fit);
    if ("ResizeObserver" in window) {
      new ResizeObserver(fit).observe(frame);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fit);
    }

    /* ------------------------------------------------------- navigation */
    function navButton(item) {
      var el = document.createElement("div");
      el.className = "cg-nav-item" + (item.id === "combat" ? " is-active" : "");
      el.insertAdjacentHTML("beforeend", ICONS[item.icon] || "");

      var label = document.createElement("span");
      label.textContent = item.label;
      el.appendChild(label);

      if (item.count !== undefined) {
        var count = document.createElement("span");
        count.className = "cg-count";
        count.textContent = "0";
        if (item.count === true) count.setAttribute("data-cg-combat-count", "");
        else count.textContent = String(item.count);
        el.appendChild(count);
      }

      return el;
    }

    NAV.forEach(function (item) {
      navModules.appendChild(navButton(item));
    });

    GENERAL.forEach(function (item) {
      navGeneral.appendChild(navButton(item));
    });

    /* ------------------------------------------------------------ cards */
    function updateCounts() {
      var active = 0;
      MODULES.forEach(function (mod) {
        if (mod.on) active++;
      });
      var el = navModules.querySelector("[data-cg-combat-count]");
      if (el) el.textContent = String(active);
    }

    function card(mod) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cg-mod";
      btn.setAttribute("aria-pressed", mod.on ? "true" : "false");
      btn.setAttribute("aria-label", mod.name);

      var title = document.createElement("span");
      title.className = "cg-mod-title";

      var name = document.createElement("span");
      name.className = "cg-mod-name";
      name.textContent = mod.name;
      title.appendChild(name);

      var info = document.createElement("i");
      info.className = "cg-info";
      info.setAttribute("aria-hidden", "true");
      info.textContent = "i";
      title.appendChild(info);

      if (mod.warn) {
        var warn = document.createElement("i");
        warn.className = "cg-warn";
        warn.setAttribute("aria-hidden", "true");
        warn.textContent = "!";
        title.appendChild(warn);
      }

      var key = document.createElement("span");
      key.className = "cg-key";
      key.innerHTML = 'KeyBind: <b>[ None ]</b>';

      var sw = document.createElement("span");
      sw.className = "cg-sw";
      sw.setAttribute("aria-hidden", "true");

      btn.appendChild(title);
      btn.appendChild(key);
      btn.appendChild(sw);

      btn.addEventListener("click", function () {
        mod.on = !mod.on;
        btn.setAttribute("aria-pressed", mod.on ? "true" : "false");
        updateCounts();
      });

      return btn;
    }

    function render(list) {
      grid.innerHTML = "";
      list.forEach(function (mod) {
        grid.appendChild(card(mod));
      });
      if (!list.length) {
        var empty = document.createElement("div");
        empty.className = "cg-empty";
        empty.textContent = "No modules found";
        grid.appendChild(empty);
      }
    }

    render(MODULES);
    updateCounts();

    /* ----------------------------------------------------------- search */
    function matches(mod, needle) {
      return mod.name.toLowerCase().indexOf(needle) !== -1;
    }

    if (search) {
      search.addEventListener("input", function () {
        var needle = search.value.trim().toLowerCase();
        if (!needle) {
          render(MODULES);
          return;
        }
        render(
          MODULES.filter(function (mod) {
            return matches(mod, needle);
          })
        );
      });
    }

    /* ------------------------------------------------------------ clock */
    function tick() {
      if (!clock) return;
      var now = new Date();
      clock.textContent =
        String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    }
    tick();
    window.setInterval(tick, 15000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
