/* ==========================================================================
   PULSECLIENT — ALIVE ENGINE
   Ambient aurora, floating hero telemetry, counter-scrolling marquee,
   pointer comet trail, click bursts and scroll parallax. One shared
   pointer/scroll loop; everything pauses when hidden and disappears
   under px-perf or prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (reduceMotion || root.classList.contains("px-perf")) return;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ------------------------------------------------------------- aurora */
  const aurora = document.createElement("div");
  aurora.className = "px-alive-aurora";
  aurora.setAttribute("aria-hidden", "true");
  aurora.innerHTML = "<i></i><i></i><i></i>";
  document.body.appendChild(aurora);

  /* --------------------------------------------------------- hero chips */
  const hero = document.querySelector(".px-hero");
  if (hero && !hero.querySelector(".px-alive-chips")) {
    const chips = document.createElement("div");
    chips.className = "px-alive-chips";
    chips.setAttribute("aria-hidden", "true");
    chips.innerHTML =
      '<span class="px-alive-chip c1"><b>0</b> ms input lag</span>' +
      '<span class="px-alive-chip c2"><b>14</b> modules</span>' +
      '<span class="px-alive-chip c3"><b>100%</b> free</span>' +
      '<span class="px-alive-chip c4"><b>GRIMAC</b> safe</span>';
    hero.appendChild(chips);
  }
  const chipEls = Array.from(document.querySelectorAll(".px-alive-chip"));

  /* ----------------------------------------------- second marquee row */
  const marquee = document.querySelector(".px-marquee");
  const marqueeTrack = marquee && marquee.querySelector(".px-marquee-track");
  if (marquee && marqueeTrack && !marquee.querySelector(".px-alive-reverse")) {
    const reverse = marqueeTrack.cloneNode(true);
    reverse.classList.add("px-alive-reverse");
    reverse.setAttribute("aria-hidden", "true");
    marquee.appendChild(reverse);
  }

  /* ------------------------------------------- sparkles in free panel */
  document.querySelectorAll(".px-free-panel").forEach((panel) => {
    if (panel.querySelector(".px-alive-spark")) return;
    for (let i = 0; i < 7; i += 1) {
      const spark = document.createElement("span");
      spark.className = "px-alive-spark";
      spark.setAttribute("aria-hidden", "true");
      spark.style.left = 8 + Math.random() * 84 + "%";
      spark.style.top = 12 + Math.random() * 72 + "%";
      spark.style.animationDelay = (-Math.random() * 4.5).toFixed(2) + "s";
      spark.style.animationDuration = (3.6 + Math.random() * 2.6).toFixed(2) + "s";
      panel.appendChild(spark);
    }
  });

  /* ------------------------------------------------------ pointer trail */
  let canvas = null;
  let ctx = null;
  let dpr = 1;
  let cw = 0;
  let ch = 0;
  let trailRaf = 0;
  const motes = [];
  const rings = [];
  const palette = [
    [255, 70, 94],
    [255, 178, 107],
    [124, 92, 255],
    [124, 240, 192]
  ];

  const sizeCanvas = () => {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    cw = Math.max(1, window.innerWidth);
    ch = Math.max(1, window.innerHeight);
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawLoop = () => {
    if (!ctx) { trailRaf = 0; return; }
    if (document.hidden) { trailRaf = 0; return; }
    trailRaf = requestAnimationFrame(drawLoop);
    ctx.clearRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = "lighter";

    for (let i = motes.length - 1; i >= 0; i -= 1) {
      const p = motes[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.006;
      p.life -= p.decay;
      if (p.life <= 0) { motes.splice(i, 1); continue; }
      ctx.globalAlpha = p.life * 0.9;
      ctx.fillStyle = `rgb(${p.c[0]},${p.c[1]},${p.c[2]})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = rings.length - 1; i >= 0; i -= 1) {
      const r = rings[i];
      r.radius += 2.6;
      r.alpha *= 0.93;
      if (r.alpha <= 0.02) { rings.splice(i, 1); continue; }
      ctx.globalAlpha = r.alpha;
      ctx.strokeStyle = "rgb(255, 110, 130)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    if (!motes.length && !rings.length) {
      ctx.clearRect(0, 0, cw, ch);
      trailRaf = 0;
    }
  };

  const kickTrail = () => {
    if (!trailRaf) trailRaf = requestAnimationFrame(drawLoop);
  };

  if (finePointer) {
    canvas = document.createElement("canvas");
    canvas.className = "px-alive-trail";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    if (ctx) {
      sizeCanvas();
      window.addEventListener("resize", sizeCanvas, { passive: true });
    } else {
      canvas.remove();
      canvas = null;
    }
  }

  let lastTrailX = -999;
  let lastTrailY = -999;
  const addMote = (x, y) => {
    const dx = x - lastTrailX;
    const dy = y - lastTrailY;
    if (dx * dx + dy * dy < 24) return;
    lastTrailX = x;
    lastTrailY = y;
    if (motes.length > 46) motes.splice(0, motes.length - 46);
    const c = palette[(Math.random() * palette.length) | 0];
    motes.push({
      x: x + (Math.random() - 0.5) * 5,
      y: y + (Math.random() - 0.5) * 5,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35 - 0.12,
      r: 1 + Math.random() * 2.1,
      life: 1,
      decay: 0.018 + Math.random() * 0.014,
      c
    });
    kickTrail();
  };

  const burst = (x, y) => {
    rings.push({ x, y, radius: 5, alpha: 0.5 });
    const count = 11;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.45;
      const speed = 1.1 + Math.random() * 2.4;
      const c = palette[(Math.random() * palette.length) | 0];
      motes.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1.1 + Math.random() * 1.8,
        life: 1,
        decay: 0.026 + Math.random() * 0.018,
        c
      });
    }
    kickTrail();
  };

  /* ------------------------------------------------------ panel tilt */
  if (finePointer) {
    document.querySelectorAll(".px-free-panel, .px-stats").forEach((panel) => {
      panel.addEventListener(
        "pointermove",
        (e) => {
          if (root.classList.contains("px-perf")) return;
          const rect = panel.getBoundingClientRect();
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          panel.style.transform =
            `perspective(1200px) rotateY(${(nx * 2.4).toFixed(2)}deg) rotateX(${(-ny * 2.1).toFixed(2)}deg)`;
        },
        { passive: true }
      );
      panel.addEventListener("pointerleave", () => {
        panel.style.transform = "";
      });
    });
  }

  /* ------------------------------------------------------ scroll parallax */
  const parallax = [];
  const heroCopy = document.querySelector(".px-hero-copy");
  if (heroCopy) parallax.push({ el: heroCopy, f: 0.035 });
  document.querySelectorAll(".px-section-head").forEach((el) => parallax.push({ el, f: 0.026 }));
  const freePanel = document.querySelector(".px-free-panel");
  if (freePanel) parallax.push({ el: freePanel, f: 0.018 });

  const visible = new Set();
  if ("IntersectionObserver" in window && parallax.length) {
    const pio = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }),
      { rootMargin: "18% 0px 18% 0px" }
    );
    parallax.forEach((item) => pio.observe(item.el));
  } else {
    parallax.forEach((item) => visible.add(item.el));
  }

  let scrollRaf = 0;
  const updateParallax = () => {
    scrollRaf = 0;
    if (root.classList.contains("px-perf") || window.innerWidth < 720) return;
    const mid = window.innerHeight / 2;
    parallax.forEach(({ el, f }) => {
      if (!visible.has(el)) return;
      const rect = el.getBoundingClientRect();
      const delta = rect.top + rect.height / 2 - mid;
      el.style.translate = `0 ${clamp(-delta * f, -26, 26).toFixed(1)}px`;
    });
  };

  /* -------------------------------------------------- shared pointer work */
  let pointerRaf = 0;
  let px = 0;
  let py = 0;

  const applyPointer = () => {
    pointerRaf = 0;
    if (!chipEls.length) return;
    const nx = px / window.innerWidth - 0.5;
    const ny = py / window.innerHeight - 0.5;
    chipEls.forEach((chip, i) => {
      const depth = 9 + i * 3.5;
      chip.style.setProperty("--ax", (nx * depth).toFixed(1));
      chip.style.setProperty("--ay", (ny * depth).toFixed(1));
    });
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      if (finePointer && canvas && !root.classList.contains("px-perf")) addMote(px, py);
      if (!pointerRaf) pointerRaf = requestAnimationFrame(applyPointer);
    },
    { passive: true }
  );

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (!finePointer || !canvas || e.button !== 0 || root.classList.contains("px-perf")) return;
      const target = e.target.closest(
        "button, a, .faq-item, .menu-item, .px-card, .px-step, .px-nav-dash"
      );
      if (!target) return;
      burst(e.clientX, e.clientY);
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollRaf) scrollRaf = requestAnimationFrame(updateParallax);
    },
    { passive: true }
  );
  window.addEventListener("resize", () => {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(updateParallax);
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      updateParallax();
      if ((motes.length || rings.length) && !trailRaf) kickTrail();
    }
  });

  updateParallax();
})();
