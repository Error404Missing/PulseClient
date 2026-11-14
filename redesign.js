/* ==========================================================================
   PULSECLIENT — MOTION ENGINE
   Ambient layers, cursor light, hero particle field, 3D card tilt, magnetic
   buttons, ripples, reveals and counters. Dependency-free and motion-safe.
   ========================================================================== */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ------------------------------------------------------------ ambient */
  function ambient() {
    if (document.querySelector(".px3-grain")) return;
    const grain = document.createElement("div");
    grain.className = "px3-grain";
    grain.setAttribute("aria-hidden", "true");
    document.body.appendChild(grain);

    if (reduceMotion || !finePointer) return;
    const cursor = document.createElement("div");
    cursor.className = "px3-cursor";
    cursor.id = "px3-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;
    let active = false;

    window.addEventListener(
      "pointermove",
      (e) => {
        tx = e.clientX;
        ty = e.clientY;
        if (!active) {
          active = true;
          cursor.classList.add("is-live");
          cx = tx;
          cy = ty;
        }
      },
      { passive: true }
    );
    document.addEventListener("mouseleave", () => cursor.classList.remove("is-live"));

    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ------------------------------------------------------------- navbar */
  const nav = document.getElementById("main-navbar");
  const navToggle = document.getElementById("px-nav-toggle");

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("px-scrolled", y > 12);
    const bar = document.querySelector(".px-progress");
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + "%";
    }
    const stage = document.querySelector(".px-hero-stage");
    if (stage && y < 1200) stage.style.translate = `0 ${Math.round(y * 0.12)}px`;
  }

  if (navToggle && nav) {
    const setMenu = (open) => {
      nav.classList.toggle("px-nav-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      setMenu(!nav.classList.contains("px-nav-open"));
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest(".nav-links button")) setMenu(false);
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#main-navbar")) setMenu(false);
    });

    const navLinks = document.querySelector(".nav-links");
    if (navLinks) {
      const syncToggle = () => {
        navToggle.style.display = navLinks.classList.contains("hidden") ? "none" : "";
      };
      new MutationObserver(syncToggle).observe(navLinks, { attributes: true, attributeFilter: ["class"] });
      syncToggle();
    }
  }

  /* ------------------------------------------------ active nav section */
  const sectionIds = ["features", "modules", "pricing", "faq"];
  const sectionButtons = new Map();
  document.querySelectorAll(".nav-links button").forEach((btn) => {
    const match = (btn.getAttribute("onclick") || "").match(/navigateToLandingSection\([^,]+,\s*'([^']+)'\)/);
    if (match && sectionIds.includes(match[1])) sectionButtons.set(match[1], btn);
  });
  if ("IntersectionObserver" in window && sectionButtons.size) {
    const secObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          sectionButtons.forEach((btn) => btn.classList.remove("px-nav-current"));
          const btn = sectionButtons.get(entry.target.id);
          if (btn) btn.classList.add("px-nav-current");
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) secObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------- reveal */
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
  document.querySelectorAll(".px-bento, .px-steps, .px-stats").forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      if (child.hasAttribute("data-reveal") && !child.style.getPropertyValue("--d")) {
        child.style.setProperty("--d", Math.min(i * 70, 320) + "ms");
      }
    });
  });
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ------------------------------------------------------------ counters */
  const counters = Array.from(document.querySelectorAll("[data-count]"));
  const animateCount = (el) => {
    const target = parseFloat(el.getAttribute("data-count"));
    const suffix = el.getAttribute("data-suffix") || "";
    const prefix = el.getAttribute("data-prefix") || "";
    const decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    if (reduceMotion || !isFinite(target)) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }
    const start = performance.now();
    const dur = 1500;
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          co.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => co.observe(el));
  } else {
    counters.forEach(animateCount);
  }

  /* ------------------------------------------------------ card spotlight */
  document.querySelectorAll(".px-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  });

  /* ------------------------------------------------------ 3D card tilt */
  if (!reduceMotion && finePointer) {
    document.querySelectorAll(".px-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(1100px) rotateY(${px * 5.5}deg) rotateX(${-py * 5.5}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ------------------------------------------------------- magnetic CTA */
  if (!reduceMotion && finePointer) {
    document.querySelectorAll(".px-magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = `translate(${dx * 7}px, ${dy * 6}px) scale(1.02)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* -------------------------------------------------------------- ripple */
  document.querySelectorAll(".px-btn, .px-nav-dash, #nav-login-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (reduceMotion) return;
      const r = btn.getBoundingClientRect();
      const span = document.createElement("span");
      const size = Math.max(r.width, r.height) * 2;
      span.className = "px3-ripple";
      span.style.width = span.style.height = size + "px";
      span.style.left = e.clientX - r.left + "px";
      span.style.top = e.clientY - r.top + "px";
      btn.appendChild(span);
      window.setTimeout(() => span.remove(), 700);
    });
  });

  /* --------------------------------------------------------- hero stage */
  const hero = document.querySelector(".px-hero");
  if (hero) {
    const stage = document.createElement("div");
    stage.className = "px-hero-stage";
    stage.setAttribute("aria-hidden", "true");
    stage.innerHTML =
      '<span class="px3-orb a"></span><span class="px3-orb b"></span><span class="px3-orb c"></span>' +
      '<div class="px3-floor"></div>' +
      '<canvas class="px3-particles"></canvas>';
    hero.insertBefore(stage, hero.firstChild);

    const canvas = stage.querySelector(".px3-particles");
    const ctx = canvas.getContext("2d");
    const orbs = Array.from(stage.querySelectorAll(".px3-orb"));
    const heroCopy = hero.querySelector(".px-hero-copy");

    if (ctx && !reduceMotion) {
      const colours = [
        [255, 70, 94],
        [255, 178, 107],
        [124, 92, 255],
        [124, 240, 192]
      ];
      let dpr = 1;
      let w = 0;
      let h = 0;
      let dots = [];
      let raf = 0;
      let visible = true;

      const resize = () => {
        const rect = hero.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = Math.max(1, Math.round(rect.width));
        h = Math.max(1, Math.round(rect.height));
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = w < 700 ? 26 : 56;
        dots = Array.from({ length: count }, () => {
          const c = colours[Math.floor(Math.random() * colours.length)];
          return {
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.7 + Math.random() * 1.7,
            vx: (Math.random() - 0.5) * 0.16,
            vy: -0.08 - Math.random() * 0.22,
            a: 0.18 + Math.random() * 0.45,
            c
          };
        });
      };

      const frame = () => {
        raf = requestAnimationFrame(frame);
        // Self-heal if the hero was measured while the landing view was hidden.
        if (w <= 1 && hero.offsetWidth > 0) resize();
        if (!visible || document.hidden) return;
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i];
          d.x += d.vx;
          d.y += d.vy;
          if (d.y < -8) { d.y = h + 8; d.x = Math.random() * w; }
          if (d.x < -8) d.x = w + 8;
          if (d.x > w + 8) d.x = -8;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${d.c[0]},${d.c[1]},${d.c[2]},${d.a})`;
          ctx.fill();
          for (let j = i + 1; j < dots.length; j++) {
            const o = dots[j];
            const dx = d.x - o.x;
            const dy = d.y - o.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 108) {
              ctx.beginPath();
              ctx.moveTo(d.x, d.y);
              ctx.lineTo(o.x, o.y);
              ctx.strokeStyle = `rgba(255,120,140,${(1 - dist / 108) * 0.07})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      };

      resize();
      frame();
      window.addEventListener("resize", resize);
      window.addEventListener("orientationchange", () => window.setTimeout(resize, 120));
      window.setInterval(() => {
        if (hero.offsetWidth > 0 && Math.abs(w - hero.offsetWidth) > 2) resize();
      }, 1200);
      // The landing view is hidden until sign-in, so the hero can have zero
      // size on load. Re-measure whenever it actually gains dimensions.
      if ("ResizeObserver" in window) {
        new ResizeObserver(() => {
          if (hero.offsetWidth > 0 && (canvas.width !== Math.round(hero.offsetWidth * dpr) || w === 1)) resize();
        }).observe(hero);
      }
      if ("IntersectionObserver" in window) {
        const hio = new IntersectionObserver(
          (entries) => {
            visible = entries[0].isIntersecting;
            if (visible && w <= 1) resize();
          },
          { threshold: 0.02 }
        );
        hio.observe(hero);
      }
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) resize();
      });
    }

    if (!reduceMotion && finePointer) {
      window.addEventListener(
        "pointermove",
        (e) => {
          const nx = (e.clientX / window.innerWidth - 0.5) * 2;
          const ny = (e.clientY / window.innerHeight - 0.5) * 2;
          orbs.forEach((orb, i) => {
            const depth = 8 + i * 6;
            orb.style.translate = `${(-nx * depth).toFixed(1)}px ${(-ny * depth).toFixed(1)}px`;
          });
          if (heroCopy) {
            heroCopy.style.setProperty("--tilt-x", (nx * 0.6).toFixed(2));
            heroCopy.style.setProperty("--tilt-y", (ny * 0.6).toFixed(2));
          }
        },
        { passive: true }
      );
    }
  }

  /* ----------------------------------------------------------- to top */
  const toTop = document.querySelector("[data-to-top]");
  if (toTop) {
    toTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  ambient();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  document.addEventListener("DOMContentLoaded", onScroll);
  onScroll();
})();
