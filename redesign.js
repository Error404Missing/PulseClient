/* ==========================================================================
   PULSECLIENT — REDESIGN INTERACTIONS
   Scroll reveals, magnetic buttons, card spotlights, nav state, scroll
   progress and the hero panel's pointer parallax. No dependencies.
   ========================================================================== */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- nav */
  const nav = document.getElementById("main-navbar");
  const navToggle = document.getElementById("px-nav-toggle");

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("px-scrolled", y > 12);
    const bar = document.querySelector(".px-progress");
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, (y / max) * 100) : 0;
      bar.style.width = pct + "%";
    }
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

    // The hamburger is only meaningful once the signed-in nav is available.
    const navLinks = document.querySelector(".nav-links");
    if (navLinks) {
      const syncToggle = () => {
        navToggle.style.display = navLinks.classList.contains("hidden") ? "none" : "";
      };
      new MutationObserver(syncToggle).observe(navLinks, { attributes: true, attributeFilter: ["class"] });
      syncToggle();
    }
  }

  /* ------------------------------------------------------------- reveal */
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
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
    const dur = 1400;
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
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

  /* ------------------------------------------------------- card spotlight */
  document.querySelectorAll(".px-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  });

  /* -------------------------------------------------------- magnetic CTA */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".px-magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = `translate(${dx * 6}px, ${dy * 5}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* --------------------------------------------------- hero panel motion */
  const visual = document.querySelector(".px-hero-visual");
  const panel = document.querySelector(".px-panel");
  if (visual && panel && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    visual.addEventListener("pointermove", (e) => {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      panel.style.animation = "none";
      panel.style.transform = `rotateY(${x * 12 - 2}deg) rotateX(${4 - y * 8}deg)`;
    });
    visual.addEventListener("pointerleave", () => {
      panel.style.transform = "";
      panel.style.animation = "";
    });
  }

  /* ------------------------------------------------------------- to top */
  const toTop = document.querySelector("[data-to-top]");
  if (toTop) {
    toTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  document.addEventListener("DOMContentLoaded", onScroll);
  onScroll();
})();
