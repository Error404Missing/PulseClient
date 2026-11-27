/* ==========================================================================
   christmas.js — Frosted Midnight holiday layer
   --------------------------------------------------------------------------
   Adds the winter scene, falling snow, garland lights, baubles, greeting chip
   and gift ribbon. Purely decorative: everything is aria-hidden, pointer
   transparent and skipped under prefers-reduced-motion (static frame instead).
   ========================================================================== */

(function () {
  "use strict";

  if (window.__xmsHoliday) return;
  window.__xmsHoliday = true;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("xms");

  /* ---------------------------------------------------------------------
     1. Winter scene — aurora, moon, pine ridge, frost vignette
     --------------------------------------------------------------------- */

  function pineRidge() {
    var w = 1440;
    var h = 320;
    var d = "M0 " + h + " L0 " + (h - 150);
    for (var i = 0; i <= 26; i++) {
      var cx = i * 56;
      var peak = 90 + ((i * 47) % 120);
      d += " L" + (cx - 26) + " " + h;
      d += " L" + cx + " " + (h - peak);
      d += " L" + (cx + 26) + " " + h;
    }
    d += " L" + w + " " + h + " Z";

    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">' +
      '<defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#0f3d2e"/>' +
      '<stop offset="0.55" stop-color="#082a20"/>' +
      '<stop offset="1" stop-color="#03100b"/>' +
      "</linearGradient></defs>" +
      '<path fill="url(#rg)" d="' + d + '"/></svg>';

    return "url(\"data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg) + "\")";
  }

  function buildScene() {
    if (document.querySelector(".xms-scene")) return;

    var scene = document.createElement("div");
    scene.className = "xms-scene";
    scene.setAttribute("aria-hidden", "true");

    var aurora = document.createElement("div");
    aurora.className = "xms-aurora";

    var moon = document.createElement("div");
    moon.className = "xms-moon";

    var ridge = document.createElement("div");
    ridge.className = "xms-ridge";
    ridge.style.backgroundImage = pineRidge();

    scene.appendChild(aurora);
    scene.appendChild(moon);
    scene.appendChild(ridge);
    document.body.appendChild(scene);

    var frost = document.createElement("div");
    frost.className = "xms-frost";
    frost.setAttribute("aria-hidden", "true");
    document.body.appendChild(frost);
  }

  /* ---------------------------------------------------------------------
     2. Garland lights on the navigation bar
     --------------------------------------------------------------------- */

  function addGarland() {
    var host = document.querySelector(".navbar") || document.querySelector(".lg-header");
    if (!host || host.querySelector(".xms-garland")) return;

    var bar = document.createElement("div");
    bar.className = "xms-garland";
    bar.setAttribute("aria-hidden", "true");

    var count = Math.max(10, Math.min(22, Math.round(window.innerWidth / 76)));
    for (var i = 0; i < count; i++) {
      var bulb = document.createElement("i");
      bulb.className = "xms-bulb";
      var t = count > 1 ? i / (count - 1) : 0;
      bulb.style.setProperty("--drop", (Math.sin(Math.PI * t) * 7).toFixed(2) + "px");
      bulb.style.setProperty("--delay", (i * 0.21).toFixed(2) + "s");
      bar.appendChild(bulb);
    }

    host.style.position = host.style.position || "relative";
    host.appendChild(bar);
  }

  /* ---------------------------------------------------------------------
     3. Greeting chip + hanging baubles + gift ribbon
     --------------------------------------------------------------------- */

  var STAR_ICON =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M12 1.6l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 16.6 6.1 19.8l1.2-6.6L2.4 8.6l6.7-.9L12 1.6z"/>' +
    "</svg>";

  function makeGreeting() {
    var greet = document.createElement("div");
    greet.className = "xms-greet";
    greet.innerHTML = STAR_ICON + "<span>Merry Christmas &middot; Happy New Year</span>";
    return greet;
  }

  function addGreeting() {
    var targets = [
      { host: ".px-hero-copy", before: ".px-eyebrow" },
      { host: ".px-auth-body", before: ".px-auth-badge" },
      { host: ".lg-hero", before: ".lg-eyebrow" }
    ];

    for (var i = 0; i < targets.length; i++) {
      var host = document.querySelector(targets[i].host);
      if (!host || host.querySelector(".xms-greet")) continue;
      var greet = makeGreeting();
      var before = targets[i].before ? host.querySelector(targets[i].before) : null;
      if (before) host.insertBefore(greet, before);
      else host.insertBefore(greet, host.firstChild);
    }
  }

  function addOrnaments() {
    var host = document.querySelector(".px-hero-visual");
    if (!host || host.querySelector(".xms-ornaments")) return;

    var wrap = document.createElement("div");
    wrap.className = "xms-ornaments";
    wrap.setAttribute("aria-hidden", "true");

    var specs = [
      { cls: "gold", left: "3%", top: "-14px", delay: "0s" },
      { cls: "red", left: "12%", top: "-30px", delay: "1.1s" },
      { cls: "mint", right: "5%", top: "-8px", delay: "0.6s" },
      { cls: "ice", right: "16%", top: "-26px", delay: "1.8s" }
    ];

    for (var i = 0; i < specs.length; i++) {
      var s = specs[i];
      var orn = document.createElement("i");
      orn.className = "xms-orn " + s.cls;
      if (s.left) orn.style.left = s.left;
      if (s.right) orn.style.right = s.right;
      orn.style.top = s.top;
      orn.style.setProperty("--delay", s.delay);
      wrap.appendChild(orn);
    }

    host.appendChild(wrap);
  }

  function addRibbons() {
    var panels = document.querySelectorAll(".px-free-panel");
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].querySelector(".xms-ribbon")) continue;
      var ribbon = document.createElement("i");
      ribbon.className = "xms-ribbon";
      ribbon.setAttribute("aria-hidden", "true");
      ribbon.innerHTML = "<i></i><i></i>";
      panels[i].insertBefore(ribbon, panels[i].firstChild);
    }
  }

  function addCardFlakes() {
    var cards = document.querySelectorAll(".px-card");
    var flake =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" ' +
      'stroke-linecap="round" aria-hidden="true">' +
      '<path d="M12 2v20M3.5 7l17 10M20.5 7l-17 10"/>' +
      '<path d="M12 5.4l2.1-2.1M12 5.4L9.9 3.3M12 18.6l2.1 2.1M12 18.6l-2.1 2.1"/>' +
      "</svg>";

    for (var i = 0; i < cards.length; i++) {
      if (cards[i].querySelector(".xms-flake")) continue;
      var el = document.createElement("i");
      el.className = "xms-flake";
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = flake;
      cards[i].appendChild(el);
    }
  }

  /* ---------------------------------------------------------------------
     4. Falling snow
     --------------------------------------------------------------------- */

  function startSnow() {
    if (document.getElementById("xms-snow")) return;

    var canvas = document.createElement("canvas");
    canvas.id = "xms-snow";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = 1;
    var W = 0;
    var H = 0;
    var flakes = [];
    var meteors = [];
    var raf = 0;
    var last = 0;
    var elapsed = 0;

    function seed() {
      var count = Math.round(Math.min(190, Math.max(45, (W * H) / 16000)));
      flakes = [];
      for (var i = 0; i < count; i++) {
        var depth = Math.random();
        flakes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.7 + depth * 2.1,
          vy: 13 + depth * 44,
          drift: 6 + depth * 18,
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 0.9,
          alpha: 0.22 + depth * 0.5,
          star: depth > 0.84
        });
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(W * dpr));
      canvas.height = Math.max(1, Math.floor(H * dpr));
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function drawFlake(f) {
      if (f.star) {
        ctx.strokeStyle = "rgba(255, 252, 240, " + f.alpha + ")";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(f.x - f.r * 1.7, f.y);
        ctx.lineTo(f.x + f.r * 1.7, f.y);
        ctx.moveTo(f.x, f.y - f.r * 1.7);
        ctx.lineTo(f.x, f.y + f.r * 1.7);
        ctx.moveTo(f.x - f.r * 1.2, f.y - f.r * 1.2);
        ctx.lineTo(f.x + f.r * 1.2, f.y + f.r * 1.2);
        ctx.moveTo(f.x + f.r * 1.2, f.y - f.r * 1.2);
        ctx.lineTo(f.x - f.r * 1.2, f.y + f.r * 1.2);
        ctx.stroke();
        return;
      }

      ctx.beginPath();
      ctx.fillStyle = "rgba(246, 252, 255, " + f.alpha + ")";
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }

    function frame(now) {
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      elapsed += dt;

      var wind = Math.sin(elapsed * 0.18) * 16 + 6;

      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.y += f.vy * dt;
        f.x += (wind + Math.sin(elapsed * f.speed + f.phase) * f.drift) * dt;

        if (f.y - f.r > H) {
          f.y = -f.r * 2;
          f.x = Math.random() * W;
        }
        if (f.x < -f.r * 4) f.x = W + f.r * 2;
        if (f.x > W + f.r * 4) f.x = -f.r * 2;

        drawFlake(f);
      }

      /* Occasional shooting star across the winter sky. */
      if (meteors.length < 2 && Math.random() < dt * 0.07) {
        meteors.push({
          x: Math.random() * W * 0.7,
          y: Math.random() * H * 0.32,
          vx: 330 + Math.random() * 210,
          vy: 150 + Math.random() * 90,
          life: 1
        });
      }

      for (var m = meteors.length - 1; m >= 0; m--) {
        var mt = meteors[m];
        mt.x += mt.vx * dt;
        mt.y += mt.vy * dt;
        mt.life -= dt * 0.5;

        if (mt.life <= 0 || mt.x > W + 160 || mt.y > H + 160) {
          meteors.splice(m, 1);
          continue;
        }

        var tail = 120;
        var grad = ctx.createLinearGradient(mt.x, mt.y, mt.x - tail, mt.y - tail * 0.46);
        grad.addColorStop(0, "rgba(255, 248, 226, " + (0.9 * mt.life) + ")");
        grad.addColorStop(0.35, "rgba(255, 224, 170, " + (0.45 * mt.life) + ")");
        grad.addColorStop(1, "rgba(255, 248, 226, 0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.9;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(mt.x, mt.y);
        ctx.lineTo(mt.x - tail, mt.y - tail * 0.46);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 252, 240, " + (0.95 * mt.life) + ")";
        ctx.arc(mt.x, mt.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (reduceMotion) {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < flakes.length; i++) drawFlake(flakes[i]);
        return;
      }
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    var resizeTimer = 0;
    window.addEventListener(
      "resize",
      function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          resize();
          if (reduceMotion) start();
        }, 180);
      },
      { passive: true }
    );

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    resize();
    start();
  }

  /* ---------------------------------------------------------------------
     4b. New Year countdown
     --------------------------------------------------------------------- */

  function addCountdown() {
    var anchors = [];
    var heroAnchor = document.querySelector(".px-hero-copy .xms-greet");
    var authAnchor = document.querySelector(".px-auth-body .xms-greet");
    if (heroAnchor) anchors.push(heroAnchor);
    if (authAnchor) anchors.push(authAnchor);
    if (!anchors.length) return;

    var target = new Date(new Date().getFullYear() + 1, 0, 1, 0, 0, 0, 0);
    var cells = [
      { key: "days", label: "Days" },
      { key: "hours", label: "Hours" },
      { key: "mins", label: "Minutes" },
      { key: "secs", label: "Seconds" }
    ];

    for (var a = 0; a < anchors.length; a++) {
      var anchor = anchors[a];
      if (anchor.parentNode.querySelector(".xms-count")) continue;

      var box = document.createElement("div");
      box.className = "xms-count";

      var label = document.createElement("div");
      label.className = "xms-count-label";
      label.innerHTML = "<i></i>Countdown to New Year";
      box.appendChild(label);

      var row = document.createElement("div");
      row.className = "xms-count-cells";

      for (var i = 0; i < cells.length; i++) {
        var cell = document.createElement("div");
        cell.className = "xms-count-cell";
        cell.setAttribute("data-count", cells[i].key);
        var value = document.createElement("b");
        value.textContent = "--";
        var caption = document.createElement("span");
        caption.textContent = cells[i].label;
        cell.appendChild(value);
        cell.appendChild(caption);
        row.appendChild(cell);
      }

      box.appendChild(row);
      anchor.parentNode.insertBefore(box, anchor.nextSibling);
    }

    function pad(n) {
      return (n < 10 ? "0" : "") + n;
    }

    function tick() {
      var diff = target - new Date();
      if (diff < 0) diff = 0;

      var secs = Math.floor(diff / 1000);
      var values = {
        days: Math.floor(secs / 86400),
        hours: Math.floor((secs % 86400) / 3600),
        mins: Math.floor((secs % 3600) / 60),
        secs: secs % 60
      };

      var all = document.querySelectorAll(".xms-count-cell");
      for (var j = 0; j < all.length; j++) {
        var node = all[j];
        var key = node.getAttribute("data-count");
        if (!key || !Object.prototype.hasOwnProperty.call(values, key)) continue;
        var digits = node.querySelector("b");
        if (!digits) continue;
        var text = key === "days" ? String(values[key]) : pad(values[key]);
        if (digits.textContent === text) continue;
        digits.textContent = text;
        if (!reduceMotion) {
          node.classList.remove("is-tick");
          void node.offsetWidth;
          node.classList.add("is-tick");
        }
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------------------
     4c. Santa's sleigh, scroll ribbon, snow bank, gift boxes
     --------------------------------------------------------------------- */

  var SLEIGH_SVG =
    '<svg viewBox="0 0 240 96" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M6 60h42l7-13h34l13 13h24" fill="rgba(224,52,75,.85)" stroke="rgba(255,233,189,.95)" stroke-width="2.2"/>' +
    '<path d="M9 66c-5 1-7 5-6 9h104c8 0 14-4 14-9" stroke="rgba(255,233,189,.9)" stroke-width="2.2"/>' +
    '<path d="M52 47c4-8 14-12 26-8" stroke="rgba(255,233,189,.9)" stroke-width="2.2"/>' +
    '<circle cx="96" cy="40" r="6" fill="rgba(255,233,189,.9)"/>' +
    '<path d="M170 62V44m0 18l-9 12m9-12l9 12m-9-22l-9 12m9-12l9 12" stroke="rgba(246,203,122,.85)" stroke-width="2"/>' +
    '<path d="M170 44c9 0 15-6 15-13 0-5-4-8-8-8-5 0-8 4-8 10" stroke="rgba(255,233,189,.9)" stroke-width="2.2"/>' +
    '<path d="M177 23l-6-9m5 3l-6-6m13 12l7-8m-2 2l6-5" stroke="rgba(255,233,189,.9)" stroke-width="1.8"/>' +
    '<path d="M140 48c10-9 22-11 31-7" stroke="rgba(255,233,189,.9)" stroke-width="2"/>' +
    '<path d="M196 62v-9m10 9v-9" stroke="rgba(246,203,122,.8)" stroke-width="2"/>' +
    '<g fill="rgba(255,246,224,.85)"><circle cx="120" cy="18" r="1.4"/><circle cx="140" cy="10" r="1.1"/><circle cx="104" cy="12" r="1"/><circle cx="132" cy="30" r="1.2"/></g>' +
    "</svg>";

  function addSleigh() {
    var scene = document.querySelector(".xms-scene");
    if (!scene || scene.querySelector(".xms-sleigh")) return;
    var sleigh = document.createElement("div");
    sleigh.className = "xms-sleigh";
    sleigh.setAttribute("aria-hidden", "true");
    sleigh.innerHTML = SLEIGH_SVG;
    scene.appendChild(sleigh);
  }

  function addScrollRibbon() {
    if (document.querySelector(".xms-progress")) return;
    var bar = document.createElement("div");
    bar.className = "xms-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    var pending = 0;
    function paint() {
      pending = 0;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.width = (ratio * 100).toFixed(2) + "%";
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!pending) pending = requestAnimationFrame(paint);
      },
      { passive: true }
    );
    window.addEventListener("resize", paint, { passive: true });
    paint();
  }

  function addSnowbank() {
    var footer = document.querySelector(".footer");
    if (!footer || footer.querySelector(".xms-snowbank")) return;
    var bank = document.createElement("div");
    bank.className = "xms-snowbank";
    bank.setAttribute("aria-hidden", "true");
    footer.appendChild(bank);
  }

  function addGifts() {
    var panel = document.querySelector(".px-free-panel");
    if (!panel || panel.querySelector(".xms-gifts")) return;

    var wrap = document.createElement("div");
    wrap.className = "xms-gifts";
    wrap.setAttribute("aria-hidden", "true");

    var spots = [
      "left: 30px; bottom: 26px;",
      "right: 36px; bottom: 44px;"
    ];

    for (var i = 0; i < spots.length; i++) {
      var gift = document.createElement("i");
      gift.className = "xms-gift";
      gift.style.cssText = spots[i];
      wrap.appendChild(gift);
    }

    panel.appendChild(wrap);
  }

  /* ---------------------------------------------------------------------
     5. Boot
     --------------------------------------------------------------------- */

  function boot() {
    buildScene();
    addGarland();
    addGreeting();
    addCountdown();
    addOrnaments();
    addRibbons();
    addCardFlakes();
    addSleigh();
    addScrollRibbon();
    addSnowbank();
    addGifts();
    startSnow();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
