// i18n.js - safe loader and runtime for translations
// Paste this whole file as project/i18n.js and hard-refresh the page.

// Wrap in IIFE to avoid polluting global scope and to prevent duplicate declarations
(function () {
  // If a global TRANSLATIONS already exists (from a previous script), reuse it.
  // We'll merge a small set of safe defaults into it so UI remains functional.
  window.TRANSLATIONS = window.TRANSLATIONS || {};

  // Minimal safe defaults (expand if you want more). These avoid showing raw keys on critical UI.
  const SAFE_DEFAULTS = {
    ka: {
      "meta.title": "PulseClient - პრემიუმ Minecraft საბრძოლო და სტელს უპირატესობა",
      "nav.features": "მახასიათებლები",
      "nav.pricing": "ფასები",
      "nav.faq": "კითხვები",
      "nav.login": "შესვლა",
      "nav.user": "მომხმარებელი",
      "pricing.free": "უფასო",
      "pricing.trialBadge": "FREE",
      "pricing.per3": "/ 3 დღე",
      "pricing.per7": "/ 7 დღე",
      "pricing.per30": "/ 30 დღე",
      "pricing.once": "/ ერთჯერადი",
      "pricing.trial": "3-დღიანი საცდელი",
      "dash.devices": "მოწყობილობები",
      "dash.downloads": "ჩამოტვირთვები",
      "dash.licenses": "ლიცენზიები & გასაღები",
      "dash.logout": "გამოსვლა",
      "dash.bindBtn": "დაკავშირება",
      "dash.trialBtn": "უფასო გასაღების აღება",
      "footer.text": "© 2026 PulseClient. ყველა უფლება დაცულია."
    },
    en: {
      "meta.title": "PulseClient - Premium Minecraft Combat & Stealth Advantage",
      "nav.features": "Features",
      "nav.pricing": "Pricing",
      "nav.faq": "FAQ",
      "nav.login": "Login",
      "nav.user": "User",
      "pricing.free": "Free",
      "pricing.trialBadge": "FREE",
      "pricing.per3": "/ 3 days",
      "pricing.per7": "/ 7 days",
      "pricing.per30": "/ 30 days",
      "pricing.once": "/ one-time",
      "pricing.trial": "3-Day Trial",
      "dash.devices": "Devices",
      "dash.downloads": "Downloads",
      "dash.licenses": "Licenses & Keys",
      "dash.logout": "Logout",
      "dash.bindBtn": "Link Key",
      "dash.trialBtn": "Claim Free Trial Key",
      "footer.text": "© 2026 PulseClient. All rights reserved."
    }
  };

  // Merge SAFE_DEFAULTS into window.TRANSLATIONS without overwriting existing keys
  ['ka', 'en'].forEach(lang => {
    window.TRANSLATIONS[lang] = window.TRANSLATIONS[lang] || {};
    const src = SAFE_DEFAULTS[lang] || {};
    Object.keys(src).forEach(k => {
      if (typeof window.TRANSLATIONS[lang][k] === 'undefined') {
        window.TRANSLATIONS[lang][k] = src[k];
      }
    });
  });

  // Local alias used inside this file (keeps code similar to original)
  const TRANSLATIONS = window.TRANSLATIONS;

  // -------------------------
  // Static binding arrays (copied from your original file)
  // -------------------------
  const SELECTOR_BINDINGS = [
    ["#features .section-header h2", "features.title"],
    ["#features .section-header p", "features.subtitle"],
    ["#features .feature-card:nth-child(1) h3", "features.f1.title"],
    ["#features .feature-card:nth-child(1) p", "features.f1.desc"],
    ["#features .feature-card:nth-child(2) h3", "features.f2.title"],
    ["#features .feature-card:nth-child(2) p", "features.f2.desc"],
    ["#features .feature-card:nth-child(3) h3", "features.f3.title"],
    ["#features .feature-card:nth-child(3) p", "features.f3.desc"],
    ["#features .feature-card:nth-child(4) h3", "features.f4.title"],
    ["#features .feature-card:nth-child(4) p", "features.f4.desc"],

    // Pricing: correct card ordering (1 = Trial, 2 = Weekly, 3 = Lifetime (popular), 4 = Monthly)
    ["#pricing .section-header h2", "pricing.title"],
    ["#pricing .section-header p", "pricing.subtitle"],

    // Trial card (first card in markup)
    ["#pricing .pricing-card:nth-child(1) h3", "pricing.trial"],
    ["#pricing .pricing-card:nth-child(1) .desc", "pricing.trialDesc"],

    // Weekly card (2)
    ["#pricing .pricing-card:nth-child(2) h3", "pricing.weekly"],
    ["#pricing .pricing-card:nth-child(2) .desc", "pricing.weeklyDesc"],

    // Lifetime card (3) — popular
    ["#pricing .pricing-card:nth-child(3) .popular-badge", "pricing.popular"],
    ["#pricing .pricing-card:nth-child(3) h3", "pricing.lifetime"],
    ["#pricing .pricing-card:nth-child(3) .desc", "pricing.lifetimeDesc"],

    // Monthly card (4)
    ["#pricing .pricing-card:nth-child(4) h3", "pricing.monthly"],
    ["#pricing .pricing-card:nth-child(4) .desc", "pricing.monthlyDesc"],

    [".device-title", "dash.devices"],
    [".btn-device-slot", "dash.deviceSlot"],
    ["#dashboard-page .sidebar-menu .menu-item:nth-child(1)", "dash.downloads", "text"],
    ["#dashboard-page .sidebar-menu .menu-item:nth-child(2)", "dash.licenses", "text"],
    ["#dashboard-page .sidebar-menu .menu-item:nth-child(3)", "dash.referral", "text"],
    ["#dashboard-page .sidebar-menu .menu-item:nth-child(4)", "dash.faq", "text"],
    ["#admin-menu-item", "dash.admin", "menuText"],
    [".role-text", "dash.licensesLabel", "prefix"],
    ["#dash-logout-btn", "dash.logout", "text"],
    ["#update-notification .update-text strong", "dash.updateTitle"],
    ["#update-download-btn", "dash.updateBtn", "text"],
    [".download-meta h3", "dash.latestVersion"],
    [".version-label", "dash.versionLabelHtml", "html"],
    [".updated-date", "dash.updatedToday"],
    ["#download-mod-btn", "dash.download", "textLast"],
    ["#opsec-title-text", "dash.opsecTitle"],
    ["#opsec-desc-text", "dash.opsecDesc"],
    ["#download-opsec-btn", "dash.download", "textLast"],
    [".quick-start-section .section-title", "dash.quickStart"],
    [".quick-start-grid .step-card:nth-child(1) h4", "dash.step1.title"],
    [".quick-start-grid .step-card:nth-child(1) p", "dash.step1.desc"],
    [".quick-start-grid .step-card:nth-child(2) h4", "dash.step2.title"],
    [".quick-start-grid .step-card:nth-child(2) p", "dash.step2.desc"],
    [".quick-start-grid .step-card:nth-child(3) h4", "dash.step3.title"],
    [".quick-start-grid .step-card:nth-child(3) p", "dash.step3.desc"],
    [".launchers-section .section-title", "dash.launchers"],
    [".launcher-card .launcher-meta span", "dash.compatible"],
    [".launcher-footer-note", "dash.launchersNote"],
    [".licenses-card .panel-header h3", "dash.myLicenses"],
    ["#refresh-licenses-btn", "dash.refresh", "textLast"],
    ["#licenses-loading", "dash.licensesLoading", "textLast"],
    ["#no-licenses-view p:first-child", "dash.noLicenses"],
    ["#no-licenses-view p.sub", "dash.noLicensesSub"],
    [".bind-card h3", "dash.bindTitle"],
    [".bind-card .desc", "dash.bindDesc"],
    ["#bind-submit-btn", "dash.bindBtn"],
    [".trial-card h3", "dash.trialTitle"],
    [".trial-card .desc", "dash.trialDesc"],
    ["#claim-trial-btn", "dash.trialBtn"],
    [".referral-card h3", "dash.referralTitle"],
    [".referral-card .desc", "dash.referralDesc"],
    ["#copy-referral-btn", "dash.referralCopyBtn"],
    ["#tab-content-faq .section-title", "dash.faqTitle"],
    ["#faq .section-header h2", "faq.title"],
    [".admin-create-card > h3", "admin.genTitle"],
    ["label[for='admin-product-select']", "admin.product"],
    ["label[for='admin-duration-select']", "admin.duration"],
    ["#admin-create-btn", "admin.createBtn", "textLast"],
    ["#admin-key-result > div > span:first-child", "admin.createdKey"],
    ["#admin-copy-key-btn", "admin.copy"],
    [".admin-licenses-card .admin-header h3", "admin.manageTitle"],
    ["#admin-licenses-loading", "admin.loading", "textLast"],
    [".admin-count", "admin.totalFound", "prefix"],
    ["#license-info-modal h3", "admin.modalTitle"],
    ["#user-selection-modal h3", "admin.userModalTitle"],
    [".footer p", "footer.text"]
  ];

  const FAQ_BINDINGS = [
    ["faq.q1", "faq.a1"],
    ["faq.q2", "faq.a2"],
    ["faq.q3", "faq.a3"]
  ];

  // Corrected PRICING_PERKS mapping to match markup order (trial, weekly, lifetime, monthly)
  const PRICING_PERKS = [
    // Trial card (1)
    ["#pricing .pricing-card:nth-child(1) li", ["pricing.perk1", "pricing.perk2", "pricing.trialPerk"]],
    // Weekly card (2)
    ["#pricing .pricing-card:nth-child(2) li", ["pricing.perk1", "pricing.perk2", "pricing.perk3", "pricing.perk4"]],
    // Lifetime card (3) — popular
    ["#pricing .pricing-card:nth-child(3) li", ["pricing.perk5", "pricing.perk1", "pricing.perk2", "pricing.perk6", "pricing.perk7", "pricing.perk8"]],
    // Monthly card (4)
    ["#pricing .pricing-card:nth-child(4) li", ["pricing.perk1", "pricing.perk2", "pricing.perk3", "pricing.perk4"]]
  ];

  const ADMIN_TABLE_HEADERS = [
    "admin.colProduct", "admin.colOwner", "admin.colCreator",
    "admin.colKey", "admin.colStatus", "admin.colExpiry", "admin.colActions"
  ];

  const MODAL_LABELS = [
    ["admin.modalKey", "modal-key"],
    ["admin.modalOwner", "modal-buyer"],
    ["admin.modalCreator", "modal-creator"],
    ["admin.modalStatus", "modal-status"],
    ["admin.modalCreated", "modal-created"],
    ["admin.modalExpires", "modal-expires"],
    ["admin.modalHwid", "modal-hwid"],
    ["admin.modalNote", "modal-note"]
  ];

  // -------------------------
  // Runtime: language state + helpers
  // -------------------------
  let currentLang = (localStorage.getItem("pulse_lang") || window.currentLang || "ka");
  window.currentLang = currentLang; // keep global pointer in case other code uses it

  // setElementText copied/adapted (keeps compatibility with existing bindings)
  function setElementText(el, key, mode = "text") {
    if (!el) return;
    const val = t(key);
    try {
      if (mode === "html") {
        el.innerHTML = val;
      } else if (mode === "prefix") {
        const keep = el.querySelector("span");
        el.textContent = val + " ";
        if (keep) el.appendChild(keep);
      } else if (mode === "textLast") {
        const svg = el.querySelector("svg, .spinner");
        el.childNodes.forEach(n => { if (n.nodeType === Node.TEXT_NODE) n.remove(); });
        el.append(document.createTextNode(svg ? " " + val : val));
      } else if (mode === "menuText") {
        const badge = el.querySelector(".admin-badge");
        el.childNodes.forEach(n => { if (n.nodeType === Node.TEXT_NODE) n.remove(); });
        const textNode = document.createTextNode(val);
        if (badge) el.insertBefore(textNode, badge);
        else el.appendChild(textNode);
      } else if (mode === "text") {
        const badge = el.querySelector(".admin-badge");
        const svg = el.querySelector("svg");
        el.childNodes.forEach(n => { if (n.nodeType === Node.TEXT_NODE) n.remove(); });
        const textNode = document.createTextNode(val);
        if (badge) el.insertBefore(textNode, badge);
        else if (svg) el.insertBefore(textNode, svg.nextSibling);
        else el.textContent = val;
      } else {
        el.textContent = val;
      }
    } catch (e) {
      // swallow DOM errors to avoid breaking page
      try { el.textContent = val; } catch (ee) {}
    }
  }

  function applyFaqItems() {
    document.querySelectorAll(".faq-list").forEach((list) => {
      list.querySelectorAll(".faq-item").forEach((item, index) => {
        const keys = FAQ_BINDINGS[index];
        if (!keys) return;
        const h4 = item.querySelector("h4");
        const p = item.querySelector("p");
        if (h4) {
          const icon = h4.querySelector(".faq-toggle-icon");
          h4.textContent = t(keys[0]) + " ";
          if (icon) h4.appendChild(icon);
        }
        if (p) p.textContent = t(keys[1]);
      });
    });
  }

  function applyPricingPerks() {
    PRICING_PERKS.forEach(([selector, keys]) => {
      document.querySelectorAll(selector).forEach((li, i) => {
        const key = keys[i];
        if (!key) return;
        const svg = li.querySelector("svg");
        li.textContent = "";
        if (svg) li.appendChild(svg);
        li.append(" " + t(key));
      });
    });
  }

  function applyAdminStatic() {
    const buyerLabel = document.querySelector(".admin-form label:not([for])");
    if (buyerLabel) buyerLabel.textContent = t("admin.buyerLabel");

    const triggerSpan = document.querySelector("#admin-user-select-trigger > span");
    const buyerInput = document.getElementById("admin-buyer-input");
    if (triggerSpan && !buyerInput?.value) triggerSpan.textContent = t("admin.selectUser");

    const durationMap = {
      "1": "admin.d1", "3": "admin.d3", "7": "admin.d7",
      "30": "admin.d30", "90": "admin.d90",
      lifetime: "admin.lifetime", custom: "admin.custom"
    };
    document.querySelectorAll("#admin-duration-select option").forEach((opt) => {
      const k = durationMap[opt.value];
      if (k) opt.textContent = t(k);
    });

    const filterMap = { all: "admin.filterAll", active: "admin.filterActive", revoked: "admin.filterRevoked", expired: "admin.filterExpired" };
    document.querySelectorAll("#admin-filter-select option").forEach((opt) => {
      const k = filterMap[opt.value];
      if (k) opt.textContent = t(k);
    });

    const adminSearch = document.getElementById("admin-search-input");
    const adminDurationCustomEl = document.getElementById("admin-duration-custom");
    if (adminDurationCustomEl) adminDurationCustomEl.placeholder = t("admin.customPh");
    if (adminSearch) adminSearch.placeholder = t("admin.searchPh");
    const userSearch = document.getElementById("admin-modal-user-search");
    if (userSearch) userSearch.placeholder = t("admin.userSearchPh");

    document.querySelectorAll(".admin-table thead th").forEach((th, i) => {
      if (ADMIN_TABLE_HEADERS[i]) th.textContent = t(ADMIN_TABLE_HEADERS[i]);
    });

    MODAL_LABELS.forEach(([key, valueId]) => {
      const valEl = document.getElementById(valueId);
      const label = valEl?.closest(".modal-info-item")?.querySelector(".info-label");
      if (label) label.textContent = t(key);
    });

    const discordFloat = document.querySelector(".discord-float");
    if (discordFloat) discordFloat.setAttribute("aria-label", t("discord.aria"));
  }

  // Robust t() with fallback chain and single-time missing-key warnings
  (function () {
    if (!window.__missingI18nKeys) window.__missingI18nKeys = new Set();
  })();

  function t(key, vars = {}) {
    // Resolve translation from currentLang -> ka -> en -> key
    const str =
      (TRANSLATIONS && TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) ??
      (TRANSLATIONS && TRANSLATIONS['ka'] && TRANSLATIONS['ka'][key]) ??
      (TRANSLATIONS && TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) ??
      key;

    // Replace placeholders {name}
    const replaced = Object.entries(vars).reduce((acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), v), String(str));

    // If still raw key, warn once
    if (replaced === key) {
      try {
        if (!window.__missingI18nKeys.has(key)) {
          console.warn(`Missing translation for key: "${key}" (lang: ${currentLang})`);
          window.__missingI18nKeys.add(key);
        }
      } catch (e) {}
    }

    return replaced;
  }

  function getLocale() {
    return currentLang === "en" ? "en-US" : "ka-GE";
  }

  function applyLanguage(lang) {
    currentLang = (lang === "en") ? "en" : "ka";
    try {
      localStorage.setItem("pulse_lang", currentLang);
      window.currentLang = currentLang;
      document.documentElement.lang = currentLang;
    } catch (e) {}

    // Safe DOM updates (minimal)
    try {
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const k = el.getAttribute("data-i18n");
        if (k) el.textContent = t(k);
      });

      document.querySelectorAll("[data-i18n-html]").forEach((el) => {
        const k = el.getAttribute("data-i18n-html");
        if (k) el.innerHTML = t(k);
      });

      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const k = el.getAttribute("data-i18n-placeholder");
        if (k) el.placeholder = t(k);
      });

      document.querySelectorAll("[data-i18n-title]").forEach((el) => {
        const k = el.getAttribute("data-i18n-title");
        if (k) el.title = t(k);
      });

      document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
        const k = el.getAttribute("data-i18n-aria");
        if (k) el.setAttribute("aria-label", t(k));
      });

      SELECTOR_BINDINGS.forEach(([selector, key, mode]) => {
        document.querySelectorAll(selector).forEach((el) => setElementText(el, key, mode || "text"));
      });

      applyFaqItems();
      applyPricingPerks();
      applyAdminStatic();
    } catch (err) {
      console.error("Language apply error:", err);
    }

    // update page title
    try { document.title = t("meta.title"); } catch (e) {}
    updateLangSwitcherUI();

    if (typeof window.onLanguageChanged === "function") {
      try { window.onLanguageChanged(); } catch (e) {}
    }
  }

  function toggleLanguage() {
    applyLanguage(currentLang === "ka" ? "en" : "ka");
  }

  function updateLangSwitcherUI() {
    document.querySelectorAll(".lang-switcher .lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
  }

  function initLanguage() {
    const switcher = document.getElementById("lang-switcher");
    if (switcher) {
      switcher.querySelectorAll(".lang-btn").forEach((btn) => {
        btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
      });
    }
    applyLanguage(currentLang);
  }

  // Expose APIs used by app.js and other scripts
  window.t = t;
  window.getLocale = getLocale;
  window.applyLanguage = applyLanguage;
  window.toggleLanguage = toggleLanguage;
  window.initLanguage = initLanguage;

  // mark loaded
  window.__i18n_safe_loaded = true;
})();
