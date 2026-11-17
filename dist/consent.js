/* ==========================================================================
   consent.js — cookie / storage consent for PulseClient
   No dependencies. Essential storage only by default; optional categories
   (analytics, marketing) are blocked until the visitor opts in.
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'pulse_consent_v1';
  var VERSION = 1;
  var CATEGORIES = ['necessary', 'analytics', 'marketing'];

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || data.v !== VERSION) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function write(choice) {
    var data = {
      v: VERSION,
      necessary: true,
      analytics: !!choice.analytics,
      marketing: !!choice.marketing,
      ts: new Date().toISOString()
    };
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
    return data;
  }

  function has(category) {
    if (category === 'necessary') return true;
    var data = read();
    return !!(data && data[category]);
  }

  // Activate any <script type="text/plain" data-consent="analytics" data-src="...">
  function activateConsented() {
    var nodes = document.querySelectorAll('script[type="text/plain"][data-consent]');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var category = node.getAttribute('data-consent');
      if (!has(category) || node.dataset.pcActivated) continue;
      var fresh = document.createElement('script');
      fresh.src = node.getAttribute('data-src') || '';
      fresh.async = true;
      if (node.getAttribute('data-integrity')) fresh.integrity = node.getAttribute('data-integrity');
      if (node.getAttribute('crossorigin')) fresh.crossOrigin = node.getAttribute('crossorigin');
      document.head.appendChild(fresh);
      node.dataset.pcActivated = '1';
    }
  }

  var banner = null;

  function buildBanner() {
    if (banner) return banner;

    banner = document.createElement('div');
    banner.className = 'pc-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie and storage notice');
    banner.innerHTML =
      '<div class="pc-banner-copy">' +
        '<strong>Cookies &amp; local storage</strong>' +
        '<p>We use only what the site needs: your Discord session, your license state and this choice. ' +
        'No advertising or analytics cookies are set today. ' +
        '<a href="/cookies">Cookie Policy</a></p>' +
      '</div>' +
      '<div class="pc-banner-actions">' +
        '<button type="button" class="pc-btn pc-btn-ghost" data-pc-choice="necessary">Necessary only</button>' +
        '<button type="button" class="pc-btn pc-btn-primary" data-pc-choice="all">Accept all</button>' +
      '</div>';

    banner.addEventListener('click', function (event) {
      var button = event.target.closest('[data-pc-choice]');
      if (!button) return;
      var all = button.getAttribute('data-pc-choice') === 'all';
      write({ analytics: all, marketing: all });
      hideBanner();
      activateConsented();
      try {
        document.dispatchEvent(new CustomEvent('pulse:consent', {
          detail: { analytics: all, marketing: all }
        }));
      } catch (e) {}
    });

    document.body.appendChild(banner);
    return banner;
  }

  function showBanner() {
    buildBanner();
    banner.style.display = 'flex';
  }

  function hideBanner() {
    if (banner) banner.style.display = 'none';
  }

  function open() {
    // Re-opens the banner without wiping the stored choice, so the visitor can
    // review or change it at any time (footer "Cookie settings").
    showBanner();
  }

  window.PulseConsent = {
    has: has,
    open: open,
    get choice() { return read(); }
  };

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-cookie-settings]')) {
      event.preventDefault();
      open();
    }
  });

  function init() {
    if (!read()) showBanner();
    activateConsented();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
