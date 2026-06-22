// Initialize Supabase Client
const supabaseUrl = "https://qxyggegnnxdsgjcutsrl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eWdnZWdubnhkc2pqY3V0c3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzQ0ODIsImV4cCI6MjA5NTExMDQ4Mn0.mKywX8VuzrSJs8[...]";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
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

// Admin DOM Elements
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

const ADMIN_DISCORD_IDS = ["1475396409246089367", "1350538035342737441", "1158855771031867432"];
let currentUser = null;
let adminLicenses = [];
let allUserProfiles = [];

// --- PRICING: centralized plan data & formatter ---
// prices are in cents (USD). Adjust values here if needed.
const PRICING_PLANS = [
    // cardIndex corresponds to DOM nth-child() inside #pricing .pricing-grid
    { cardIndex: 2, planId: 'weekly', price_cents: 199, periodKey: 'pricing.per7' },   // $1.99 / 7 days
    { cardIndex: 3, planId: 'lifetime', price_cents: 1499, periodKey: 'pricing.once' }, // $14.99 one-time
    { cardIndex: 4, planId: 'monthly', price_cents: 499, periodKey: 'pricing.per30' }   // $4.99 / 30 days
];

function formatCurrency(cents) {
    if (cents === 0) return window.t ? window.t("pricing.free") : "Free";
    const locale = (typeof window.getLocale === "function") ? window.getLocale() : "en-US";
    // use USD by default (site currently shows $); change currency code if you want GEL or others
    try {
        return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(cents / 100);
    } catch (err) {
        // fallback simple formatting
        return `$${(cents / 100).toFixed(2)}`;
    }
}

function applyPricingNumbers() {
    PRICING_PLANS.forEach(p => {
        const priceEl = document.querySelector(`#pricing .pricing-card:nth-child(${p.cardIndex}) .price`);
        if (!priceEl) return;
        const periodText = (typeof window.t === "function") ? window.t(p.periodKey) : "";
        priceEl.innerHTML = `${formatCurrency(p.price_cents)}<span>${periodText}</span>`;
    });
}
window.applyPricingNumbers = applyPricingNumbers; // expose for debugging

// App Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Capture referral ID from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get('ref');
    if (refId && refId.trim() !== "") {
        localStorage.setItem('pulse_referral_discord_id', refId.trim());
        // Clean URL to keep it neat
        if (window.history.replaceState) {
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({path: cleanUrl}, '', cleanUrl);
        }
    }

    // Check active session
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (session) {
        handleUserSignIn(session.user);
    } else {
        handleUserSignOut();
    }

    // Set up OAuth redirect listener
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            handleUserSignIn(session.user);
        } else if (event === 'SIGNED_OUT') {
            handleUserSignOut();
        }
    });

    // Event Listeners
    if (navLoginBtn) navLoginBtn.addEventListener('click', signInWithDiscord);
    if (navLogoutBtn) navLogoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        signOut();
    });
    if (dashLogoutBtn) dashLogoutBtn.addEventListener('click', signOut);
    if (refreshLicensesBtn) refreshLicensesBtn.addEventListener('click', fetchUserLicenses);
    if (bindLicenseForm) bindLicenseForm.addEventListener('submit', bindLicenseKey);
    const claimTrialBtn = document.getElementById('claim-trial-btn');
    if (claimTrialBtn) claimTrialBtn.addEventListener('click', claimFreeTrial);

    // Admin Event Listeners
    if (adminCreateForm) adminCreateForm.addEventListener('submit', createLicenseFromAdmin);
    if (adminCopyKeyBtn) adminCopyKeyBtn.addEventListener('click', copyCreatedKey);
    if (adminSearchInput) adminSearchInput.addEventListener('input', filterAdminLicenses);
    if (adminFilterSelect) adminFilterSelect.addEventListener('change', filterAdminLicenses);
    if (adminLogsSearchInput) adminLogsSearchInput.addEventListener('input', filterAdminLogs);
    if (adminDurationSelect) adminDurationSelect.addEventListener('change', toggleCustomDurationInput);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeLicenseModal);
    if (licenseInfoModal) {
        licenseInfoModal.addEventListener('click', (e) => {
            if (e.target === licenseInfoModal) closeLicenseModal();
        });
    }

    const userSelectionModal = document.getElementById('user-selection-modal');
    if (userSelectionModal) {
        userSelectionModal.addEventListener('click', (e) => {
            if (e.target === userSelectionModal) closeUserSelectionModal();
        });
    }

    if (currentUser) {
        checkForUpdates();
    }

    // Set default mock download file link
    if (downloadModBtn) downloadModBtn.href = "MotionBlur1.031.1.21.11.jar";

    // Apply saved language after all listeners are attached
    if (typeof initLanguage === "function") initLanguage();

    // Ensure pricing numbers are applied on load (language may override via onLanguageChanged)
    applyPricingNumbers();
});

// ... rest of app.js (unchanged) ...

// Update Notification DOM Elements
const updateNotification = document.getElementById('update-notification');
const updateDateText = document.getElementById('update-date-text');
const updateDownloadBtn = document.getElementById('update-download-btn');
const updateDismissBtn = document.getElementById('update-dismiss-btn');

// (keep all existing functions unchanged, omitted here for brevity in this snippet — copy original file content)
// NOTE: The full file continues unchanged after this point in your codebase; the important additions are above:
//  - PRICING_PLANS
//  - formatCurrency()
//  - applyPricingNumbers()
// and calling applyPricingNumbers() after initLanguage.

// Make sure onLanguageChanged calls applyPricingNumbers as well:
function onLanguageChanged() {
    if (currentUser) {
        fetchUserLicenses();
        if (isAdmin() && tabContentAdmin && !tabContentAdmin.classList.contains('hidden')) {
            renderAdminLicenses(adminLicenses);
        }
    }
    if (bindSubmitBtn && !bindSubmitBtn.disabled) {
        bindSubmitBtn.textContent = t("dash.bindBtn");
    }
    // Re-apply pricing numbers so periods / translations reflect the new language
    try {
        if (typeof applyPricingNumbers === "function") applyPricingNumbers();
    } catch (err) {
        console.warn("applyPricingNumbers failed:", err);
    }
}
window.onLanguageChanged = onLanguageChanged;

// (rest of app.js file — ensure the original content remains; above we've injected pricing logic and onLanguageChanged modification)
