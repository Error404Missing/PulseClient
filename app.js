// app.js - safe, copy-paste ready version with fallbacks and pricing + i18n integration
// Replace your project's app.js with this file and hard-refresh (Ctrl+F5).

// -----------------------------
// FALLBACKS (prevent ReferenceError crashes)
// -----------------------------
(function () {
  // navigateToLandingSection: scroll to a section by id
  if (typeof window.navigateToLandingSection !== 'function') {
    window.navigateToLandingSection = function (event, sectionId) {
      try { if (event && event.preventDefault) event.preventDefault(); } catch (e) {}
      try {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else console.warn('navigateToLandingSection: element not found', sectionId);
      } catch (err) { console.warn('navigateToLandingSection error', err); }
    };
  }

  // basic showDashboard: hide landing, show dashboard
  if (typeof window.showDashboard !== 'function') {
    window.showDashboard = function () {
      try {
        const landing = document.getElementById('landing-page');
        const dashboard = document.getElementById('dashboard-page');
        if (landing) landing.classList.add('hidden');
        if (dashboard) dashboard.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (typeof window.onDashboardShown === 'function') {
          try { window.onDashboardShown(); } catch (e) { console.warn(e); }
        }
      } catch (err) { console.warn('showDashboard fallback error', err); }
    };
  }

  // handleUserSignIn fallback (will be wrapped if real implementation exists)
  if (typeof window.handleUserSignIn !== 'function') {
    window.handleUserSignIn = function (user) {
      try {
        window.currentUser = user || null;
        const navLoginBtn = document.getElementById('nav-login-btn');
        const navUserProfile = document.getElementById('nav-user-profile');
        const navUsername = document.getElementById('nav-username');
        const navAvatar = document.getElementById('nav-avatar');
        if (navLoginBtn) navLoginBtn.classList.add('hidden');
        if (navUserProfile) navUserProfile.classList.remove('hidden');
        if (navUsername) navUsername.textContent = (user && (user.user_metadata?.full_name || user.email)) || (window.t ? window.t('nav.user') : 'User');
        if (navAvatar && user?.user_metadata?.avatar_url) navAvatar.src = user.user_metadata.avatar_url;
        try { window.showDashboard(); } catch (e) {}
      } catch (err) { console.warn('handleUserSignIn fallback error', err); }
    };
  } else {
    // keep original but ensure it shows dashboard afterwards
    const _originalHandleUserSignIn = window.handleUserSignIn;
    window.handleUserSignIn = function (user) {
      try { _originalHandleUserSignIn(user); } catch (e) { console.warn('original handleUserSignIn threw', e); }
      try { window.showDashboard(); } catch (e) {}
    };
  }
})();

// -----------------------------
// Supabase client (use your real keys)
// -----------------------------
const supabaseUrl = "https://qxyggegnnxdsgjcutsrl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eWdnZWdubnhkc2pqY3V0c3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzQ0ODIsImV4cCI6MjA5NTExMDQ4Mn0.mKywX8VuzrSJs8[...]";
let supabaseClient = null;
try {
  supabaseClient = window.supabase?.createClient ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;
} catch (e) {
  console.warn('Supabase init failed', e);
}

// -----------------------------
// DOM elements (safe queries)
// -----------------------------
const navLoginBtn = document.getElementById('nav-login-btn');
const navUserProfile = document.getElementById('nav-user-profile');
const navAvatar = document.getElementById('nav-avatar');
const navUsername = document.getElementById('nav-username');
const navLogoutBtn = document.getElementById('nav-logout-btn');

const landingPage = document.getElementById('landing-page');
const dashboardPage = document.getElementById('dashboard-page');

const dashAvatar = document.getElementById('dash-avatar');
const dashUsername = document.getElementById('dash-username');
const dashLicenseCount = document.getElementById('dash-license-count');
const dashLogoutBtn = document.getElementById('dash-logout-btn');

const dashMessageBanner = document.getElementById('dash-message-banner');
const bannerText = document.getElementById('banner-text');

const licensesLoading = document.getElementById('licenses-loading');
const noLicensesView = document.getElementById('no-licenses-view');
const licensesList = document.getElementById('licenses-list');
const refreshLicensesBtn = document.getElementById('refresh-licenses-btn');

const bindLicenseForm = document.getElementById('bind-license-form');
const bindKeyInput = document.getElementById('bind-key-input');
const bindSubmitBtn = document.getElementById('bind-submit-btn');
const downloadModBtn = document.getElementById('download-mod-btn');

const adminMenuItem = document.getElementById('admin-menu-item');
const tabContentAdmin = document.getElementById('tab-content-admin');
const adminCreateForm = document.getElementById('admin-create-form');
const adminBuyerInput = document.getElementById('admin-buyer-input');
const adminProductSelect = document.getElementById('admin-product-select');
const adminDurationSelect = document.getElementById('admin-duration-select');
const adminDurationCustom = document.getElementById('admin-duration-custom');
const adminKeyResult = document.getElementById('admin-key-result');
const adminGeneratedKey = document.getElementById('admin-generated-key');
const adminCopyKeyBtn = document.getElementById('admin-copy-key-btn');
const adminSearchInput = document.getElementById('admin-search-input');
const adminFilterSelect = document.getElementById('admin-filter-select');
const adminLicensesLoading = document.getElementById('admin-licenses-loading');
const adminLicensesTableBody = document.getElementById('admin-licenses-table-body');
const adminTotalCount = document.getElementById('admin-total-count');
const adminLogsTableBody = document.getElementById('admin-logs-table-body');
const adminLogsSearchInput = document.getElementById('admin-logs-search-input');

const licenseInfoModal = document.getElementById('license-info-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalKey = document.getElementById('modal-key');
const modalBuyer = document.getElementById('modal-buyer');
const modalCreator = document.getElementById('modal-creator');
const modalStatus = document.getElementById('modal-status');
const modalCreated = document.getElementById('modal-created');
const modalExpires = document.getElementById('modal-expires');
const modalHwid = document.getElementById('modal-hwid');
const modalNote = document.getElementById('modal-note');

const adminUserSelectWrapper = document.getElementById('admin-user-select-wrapper');
const adminUserSelectTrigger = document.getElementById('admin-user-select-trigger');
const adminUserSearch = document.getElementById('admin-modal-user-search');
const adminUserOptionsList = document.getElementById('admin-modal-user-options-list');

const updateNotification = document.getElementById('update-notification');
const updateDateText = document.getElementById('update-date-text');
const updateDownloadBtn = document.getElementById('update-download-btn');
const updateDismissBtn = document.getElementById('update-dismiss-btn');

// -----------------------------
// App state
// -----------------------------
const ADMIN_DISCORD_IDS = ["1475396409246089367", "1350538035342737441", "1158855771031867432"];
let currentUser = null;
let adminLicenses = [];
let allUserProfiles = [];

// -----------------------------
// PRICING: centralized plan data & formatter
// -----------------------------
const PRICING_PLANS = [
  // cardIndex corresponds to DOM nth-child() inside #pricing .pricing-grid
  { cardIndex: 2, planId: 'weekly', price_cents: 199, periodKey: 'pricing.per7' },   // $1.99 / 7 days
  { cardIndex: 3, planId: 'lifetime', price_cents: 1499, periodKey: 'pricing.once' }, // $14.99 one-time
  { cardIndex: 4, planId: 'monthly', price_cents: 499, periodKey: 'pricing.per30' }   // $4.99 / 30 days
];

function formatCurrency(cents) {
  if (cents === 0) return window.t ? window.t("pricing.free") : "Free";
  const locale = (typeof window.getLocale === "function") ? window.getLocale() : "en-US";
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(cents / 100);
  } catch (err) {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function applyPricingNumbers() {
  PRICING_PLANS.forEach(p => {
    try {
      const priceEl = document.querySelector(`#pricing .pricing-card:nth-child(${p.cardIndex}) .price`);
      if (!priceEl) return;
      const periodText = (typeof window.t === "function") ? window.t(p.periodKey) : "";
      priceEl.innerHTML = `${formatCurrency(p.price_cents)}<span>${periodText}</span>`;
    } catch (e) {
      // non-fatal
    }
  });
}
window.applyPricingNumbers = applyPricingNumbers;

// -----------------------------
// Utility & small safe implementations (non-fatal stubs)
// -----------------------------
function showBanner(message, type = "info") {
  if (!dashMessageBanner || !bannerText) return;
  bannerText.textContent = message;
  dashMessageBanner.classList.remove('hidden');
  dashMessageBanner.dataset.type = type;
}
function hideBanner() {
  if (dashMessageBanner) dashMessageBanner.classList.add('hidden');
}

function isAdmin() {
  try {
    return currentUser && ADMIN_DISCORD_IDS.includes(String(currentUser?.id ?? currentUser?.user?.id ?? ''));
  } catch (e) { return false; }
}

// Minimal sign-in / sign-out helpers (non-blocking)
// They try to use Supabase auth if available, otherwise open a notice.
async function signInWithDiscord() {
  if (supabaseClient && supabaseClient.auth && supabaseClient.auth.signInWithOAuth) {
    try {
      await supabaseClient.auth.signInWithOAuth({ provider: 'discord' });
    } catch (e) { console.warn('Supabase signIn failed', e); showBanner('Login failed', 'error'); }
  } else {
    showBanner('Login is not available in this environment.', 'info');
  }
}
async function signOut() {
  try {
    if (supabaseClient && supabaseClient.auth && supabaseClient.auth.signOut) {
      await supabaseClient.auth.signOut();
    }
  } catch (e) { console.warn('signOut failed', e); }
  // fallback UI changes
  try {
    const navLoginBtn = document.getElementById('nav-login-btn');
    const navUserProfile = document.getElementById('nav-user-profile');
    if (navLoginBtn) navLoginBtn.classList.remove('hidden');
    if (navUserProfile) navUserProfile.classList.add('hidden');
    window.currentUser = null;
  } catch (e) {}
}

// handleUserSignOut safe stub (if real implementation not present)
function handleUserSignOut() {
  try { if (navLoginBtn) navLoginBtn.classList.remove('hidden'); if (navUserProfile) navUserProfile.classList.add('hidden'); } catch (e) {}
  currentUser = null;
  if (landingPage) landingPage.classList.remove('hidden');
  if (dashboardPage) dashboardPage.classList.add('hidden');
}

// Minimal licenses fetch/render stubs (non-fatal)
async function fetchUserLicenses() {
  // If you have API, implement actual fetch here. For now, show placeholder behavior.
  try {
    if (licensesList) licensesList.innerHTML = '<div class="placeholder">No licenses loaded.</div>';
    if (dashLicenseCount) dashLicenseCount.textContent = '0';
  } catch (e) {}
}
function renderLicenses(licenses) {
  try {
    if (!licensesList) return;
    licensesList.innerHTML = '';
    (licenses || []).forEach(l => {
      const div = document.createElement('div');
      div.className = 'license-item';
      div.textContent = l.key || JSON.stringify(l);
      licensesList.appendChild(div);
    });
    if (dashLicenseCount) dashLicenseCount.textContent = String((licenses || []).length);
  } catch (e) {}
}

// Bind license key (simple UI-only)
async function bindLicenseKey(e) {
  try {
    if (e && e.preventDefault) e.preventDefault();
    const key = bindKeyInput?.value?.trim();
    if (!key) { showBanner('Please enter a key', 'warning'); return; }
    showBanner('Binding key...', 'info');
    // TODO: call backend to bind
    setTimeout(() => { showBanner('Key bound (simulated)', 'success'); }, 800);
  } catch (err) { console.warn(err); showBanner('Bind failed', 'error'); }
}

// Purchase modal / free trial helpers (stubs)
function showPurchaseModal(event) {
  try { event?.preventDefault(); showBanner('Open Discord to purchase', 'info'); } catch (e) {}
}
window.showPurchaseModal = showPurchaseModal;

function goToFreeTrial(event) {
  try { event?.preventDefault(); claimFreeTrial(); } catch (e) {}
}

async function claimFreeTrial() {
  // Simulated: in production this should call server to generate and attach a trial license
  try {
    showBanner('Claiming free trial...', 'info');
    setTimeout(() => { showBanner('Trial granted (simulated)', 'success'); }, 900);
  } catch (e) { console.warn(e); showBanner('Trial claim failed', 'error'); }
}

// Navigation & dashboard tab switching (minimal)
function switchDashTab(event, tabId) {
  try {
    event?.preventDefault();
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
    const el = document.getElementById('tab-content-' + tabId.replace(/^tab-/, ''));
    if (el) el.classList.remove('hidden');
  } catch (e) { console.warn(e); }
}
function scrollToElement(id) {
  try { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); } catch (e) {}
}
function toggleFaq(event) {
  try {
    const item = event?.currentTarget?.closest('.faq-item') || event?.currentTarget;
    if (!item) return;
    item.classList.toggle('active');
    const p = item.querySelector('p');
    if (p) {
      if (item.classList.contains('active')) { p.style.maxHeight = p.scrollHeight + 'px'; p.style.opacity = '1'; }
      else { p.style.maxHeight = '0'; p.style.opacity = '0'; }
    }
  } catch (e) {}
}

// Admin / license helpers minimal stubs
function generateLicenseKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

// -----------------------------
// Event wiring & initialization
// -----------------------------
document.addEventListener('DOMContentLoaded', async () => {
  // Apply saved language if initLanguage exists (i18n.js exposes initLanguage)
  try { if (typeof window.initLanguage === 'function') window.initLanguage(); } catch (e) {}

  // Attach UI listeners safely
  try {
    if (navLoginBtn) navLoginBtn.addEventListener('click', signInWithDiscord);
    if (navLogoutBtn) navLogoutBtn.addEventListener('click', (e) => { e.stopPropagation(); signOut(); });
    if (dashLogoutBtn) dashLogoutBtn.addEventListener('click', signOut);
    if (refreshLicensesBtn) refreshLicensesBtn.addEventListener('click', fetchUserLicenses);
    if (bindLicenseForm) bindLicenseForm.addEventListener('submit', bindLicenseKey);
    const claimTrialBtn = document.getElementById('claim-trial-btn');
    if (claimTrialBtn) claimTrialBtn.addEventListener('click', goToFreeTrial);
    if (adminCreateForm) adminCreateForm.addEventListener('submit', (e) => { e.preventDefault(); showBanner('Create license: not implemented', 'info'); });
    if (adminCopyKeyBtn) adminCopyKeyBtn.addEventListener('click', () => { try { navigator.clipboard?.writeText(adminGeneratedKey?.textContent || ''); showBanner('Copied', 'success'); } catch (e) {} });
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => { try { if (licenseInfoModal) licenseInfoModal.classList.add('hidden'); } catch (e) {} });
    if (licenseInfoModal) licenseInfoModal.addEventListener('click', (e) => { if (e.target === licenseInfoModal) licenseInfoModal.classList.add('hidden'); });
  } catch (e) { console.warn('Event wiring failed', e); }

  // Apply pricing numbers after i18n initialization
  try { applyPricingNumbers(); } catch (e) {}
  // Also ensure pricing updates on language change
  try {
    if (typeof window.onLanguageChanged === 'function') {
      const prevOnLang = window.onLanguageChanged;
      window.onLanguageChanged = function () {
        try { prevOnLang(); } catch (e) {}
        try { applyPricingNumbers(); } catch (e) {}
      };
    } else {
      window.onLanguageChanged = function () { try { applyPricingNumbers(); } catch (e) {} };
    }
  } catch (e) {}

  // Minimal Supabase auth listener wiring (if supabase loaded)
  try {
    if (supabaseClient && supabaseClient.auth && typeof supabaseClient.auth.getSession === 'function') {
      const { data: { session } = {} } = await supabaseClient.auth.getSession().catch(() => ({ data: {} }));
      if (session?.user) {
        try { handleUserSignIn(session.user); } catch (e) {}
      } else {
        try { handleUserSignOut(); } catch (e) {}
      }
      // Listen to auth state changes
      try {
        supabaseClient.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session?.user) handleUserSignIn(session.user);
          else if (event === 'SIGNED_OUT') handleUserSignOut();
        });
      } catch (e) {}
    }
  } catch (e) { console.warn('Supabase auth init failed', e); }

  // tidy: attach click handlers for sidebar menu items if present
  try {
    document.querySelectorAll('.sidebar-menu .menu-item').forEach((el) => {
      el.addEventListener('click', (ev) => {
        // ensure correct tab switching by id if present
        const href = el.getAttribute('href') || '';
        if (href.startsWith('#tab-')) {
          ev.preventDefault();
          const target = href.replace('#', '');
          switchDashTab(ev, target);
        }
      });
    });
  } catch (e) {}
});

// expose some methods for debugging
window.applyPricingNumbers = applyPricingNumbers;
window.fetchUserLicenses = fetchUserLicenses;
window.signInWithDiscord = signInWithDiscord;
window.signOut = signOut;
window.showPurchaseModal = showPurchaseModal;
window.goToFreeTrial = goToFreeTrial;
window.handleUserSignIn = window.handleUserSignIn || function (u) { currentUser = u; };
window.handleUserSignOut = handleUserSignOut;
window.generateLicenseKey = generateLicenseKey;

// Keep rest of app-specific functions as no-op safe stubs if not defined elsewhere
if (typeof window.showCustomConfirm !== 'function') {
  window.showCustomConfirm = async function (title, message) {
    // fallback confirm using native confirm (synchronous) wrapped in Promise
    return Promise.resolve(confirm(title + '\n\n' + message));
  };
}
if (typeof window.openUserSelectionModal !== 'function') {
  window.openUserSelectionModal = function () { showBanner('User selection not implemented here', 'info'); };
}
