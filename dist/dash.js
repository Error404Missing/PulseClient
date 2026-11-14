/* ==========================================================================
   PULSE — DASHBOARD MOTION
   Ambient layers, tab choreography, pointer light and ripples.
   Pure decoration: never touches auth, licenses or data.
   ========================================================================== */
(() => {
  const page = document.getElementById("dashboard-page");
  if (!page) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Ambient backdrop ------------------------------------------------------ */
  if (!page.querySelector(".dash-ambient")) {
    const ambient = document.createElement("div");
    ambient.className = "dash-ambient";
    ambient.setAttribute("aria-hidden", "true");
    ambient.innerHTML =
      '<span class="dash-orb dash-orb-a"></span>' +
      '<span class="dash-orb dash-orb-b"></span>' +
      '<span class="dash-orb dash-orb-c"></span>' +
      '<span class="dash-grid"></span>';
    page.prepend(ambient);
  }

  /* Tab choreography ------------------------------------------------------ */
  const animatePane = (pane) => {
    if (!pane || pane.classList.contains("hidden")) return;
    Array.from(pane.children).forEach((child, i) => {
      child.style.setProperty("--i", String(Math.min(i, 8)));
    });
    pane.classList.remove("px-enter");
    void pane.offsetWidth;
    pane.classList.add("px-enter");
  };

  const animateVisiblePane = () => {
    const pane = page.querySelector(".tab-pane:not(.hidden)");
    if (pane) animatePane(pane);
  };

  page.querySelectorAll(".tab-pane").forEach((pane) => {
    let wasHidden = pane.classList.contains("hidden");
    new MutationObserver(() => {
      const isHidden = pane.classList.contains("hidden");
      // Only react to the hidden -> visible transition. animatePane() toggles
      // its own class, so comparing state avoids an observer feedback loop.
      if (wasHidden && !isHidden) animatePane(pane);
      wasHidden = isHidden;
    }).observe(pane, { attributes: true, attributeFilter: ["class"] });
  });

  new MutationObserver(() => {
    if (!page.classList.contains("hidden")) {
      window.setTimeout(animateVisiblePane, 40);
    }
  }).observe(page, { attributes: true, attributeFilter: ["class"] });

  if (!page.classList.contains("hidden")) {
    window.setTimeout(animateVisiblePane, 80);
  }

  // showDashboard() is defined by app.js before this file runs; hook it so the
  // first paint after sign-in gets the same staggered entrance as tab clicks.
  if (typeof window.showDashboard === "function" && !window.showDashboard.__pxEntrance) {
    const originalShowDashboard = window.showDashboard;
    const wrappedShowDashboard = function (...args) {
      const result = originalShowDashboard.apply(this, args);
      window.setTimeout(animateVisiblePane, 90);
      return result;
    };
    wrappedShowDashboard.__pxEntrance = true;
    window.showDashboard = wrappedShowDashboard;
  }

  /* Pointer spotlight ----------------------------------------------------- */
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const cardSelector =
      ".glass-panel, .krypton-download-card, .step-card, .launcher-card, .promo-step-card";
    let frame = 0;
    let pending = null;

    page.addEventListener(
      "pointermove",
      (event) => {
        const card = event.target.closest(cardSelector);
        if (!card) return;
        pending = { card, x: event.clientX, y: event.clientY };
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (!pending) return;
          const rect = pending.card.getBoundingClientRect();
          pending.card.style.setProperty("--mx", pending.x - rect.left + "px");
          pending.card.style.setProperty("--my", pending.y - rect.top + "px");
          pending.card.classList.add("px-lit");
        });
      },
      { passive: true }
    );

    page.addEventListener("pointerout", (event) => {
      const card = event.target.closest(cardSelector);
      if (card && !card.contains(event.relatedTarget)) {
        card.classList.remove("px-lit");
      }
    });
  }

  /* Button ripples -------------------------------------------------------- */
  page.addEventListener("pointerdown", (event) => {
    const button = event.target.closest(".btn, button");
    if (!button || button.disabled || button.classList.contains("close-banner")) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    const ripple = document.createElement("span");
    ripple.className = "px-ripple";
    ripple.style.width = size + "px";
    ripple.style.height = size + "px";
    ripple.style.left = event.clientX - rect.left + "px";
    ripple.style.top = event.clientY - rect.top + "px";

    const styles = window.getComputedStyle(button);
    if (styles.position === "static") button.style.position = "relative";
    if (styles.overflow !== "hidden") button.style.overflow = "hidden";

    button.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  });

  /* Number pop when values refresh --------------------------------------- */
  ["dash-license-count", "user-promo-count", "user-promo-days"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    new MutationObserver(() => {
      el.classList.remove("px-tick");
      void el.offsetWidth;
      el.classList.add("px-tick");
    }).observe(el, { childList: true, characterData: true, subtree: true });
  });
})();
