
// Webhook logging disabled
async function sendDiscordAuditLog() {}
window.sendDiscordAuditLog = sendDiscordAuditLog;

// Initialize Supabase Client
const supabaseUrl = "https://qxyggegnnxdsgjcutsrl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eWdnZWdubnhkc2dqY3V0c3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzQ0ODIsImV4cCI6MjA5NTExMDQ4Mn0.mKywX8VuzrSJs8cijweg2jdKboYupE2GZUWX_LY9CMg";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const authGatePage = document.getElementById('auth-gate-page');
const vpnBlockPage = document.getElementById('vpn-block-page');
const navLinks = document.querySelector('.nav-links');
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
const downloadPvpBtn = document.getElementById('download-pvp-btn-modal');
const downloadBasefindBtn = document.getElementById('download-basefind-btn-modal');

const GITHUB_REPO_OWNER = 'Error404Missing';
const GITHUB_REPO_NAME = 'PulseClient';
const GITHUB_JAR_FILE = 'PulseClient-Fabric-1.21.11.jar';
const GITHUB_PVP_JAR_FILE = GITHUB_JAR_FILE;
const GITHUB_BASEFIND_JAR_FILE = GITHUB_JAR_FILE;

const GITHUB_CLIENT_DOWNLOAD_URL = "./PulseClient-Fabric-1.21.11.jar";
const GITHUB_PVP_DOWNLOAD_URL = GITHUB_CLIENT_DOWNLOAD_URL;
const GITHUB_BASEFIND_DOWNLOAD_URL = GITHUB_CLIENT_DOWNLOAD_URL;

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
const adminSessionsTableBody = document.getElementById('admin-sessions-table-body');
const adminSessionsLoading = document.getElementById('admin-sessions-loading');
const adminSessionsCount = document.getElementById('admin-sessions-count');

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

const OWNER_DISCORD_IDS = ["1475396409246089367"];
const ADMIN_DISCORD_IDS = ["1475396409246089367", "1158855771031867432"];
let currentUser = null;
let adminLicenses = [];
let allUserProfiles = [];
let activeOnlineUsersCount = 0;

// -----------------------------
// PRICING: centralized plan data & formatter
// -----------------------------
const PRICING_PLANS = [
  // cardIndex corresponds to DOM nth-child() inside #pricing .pricing-grid
  { cardIndex: 2, planId: 'weekly', price_cents: 199, currency: 'USD', periodKey: 'pricing.per7' },
  { cardIndex: 3, planId: 'lifetime', price_cents: 999, currency: 'USD', periodKey: 'pricing.once' },
  { cardIndex: 4, planId: 'monthly', price_cents: 499, currency: 'USD', periodKey: 'pricing.per30' }
];

function formatCurrency(cents, currency = 'USD') {
  if (cents === 0) return window.t ? window.t("pricing.free") : "Free";
  const locale = (typeof window.getLocale === "function") ? window.getLocale() : "en-US";
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(cents / 100);
  } catch (err) {
    if (currency === 'GEL') return `${(cents / 100).toFixed(2)} â‚¾`;
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function applyPricingNumbers() {
  PRICING_PLANS.forEach(p => {
    try {
      const priceEl = document.querySelector(`#pricing .pricing-card:nth-child(${p.cardIndex}) .price`);
      if (!priceEl) return;
      const periodText = (typeof window.t === "function") ? window.t(p.periodKey) : "";
      priceEl.innerHTML = `${formatCurrency(p.price_cents, p.currency)}<span>${periodText}</span>`;
    } catch (e) {
      // non-fatal
    }
  });
}
window.applyPricingNumbers = applyPricingNumbers;

// ==========================================
// LTC CRYPTO CHECKOUT SYSTEM
// ==========================================
const OWNER_LTC_ADDRESS = "LQtSmXMDmwS9keBF1sAi6s9dEmfBZ5dW38";
const CRYPTO_PLAN_USD = {
    weekly: 1.99,
    monthly: 4.99,
    lifetime: 9.99
};

let activeCryptoPlan = "lifetime";
let liveLtcUsdRate = 90.0;
let cryptoPollInterval = null;
let isCheckingCryptoPayment = false;

async function fetchLiveLtcRate() {
    try {
        const res = await fetch('https://errormissing-pulse-bot.hf.space/crypto/ltc-rate');
        if (res.ok) {
            const data = await res.json();
            if (data && data.rate_usd > 10) {
                liveLtcUsdRate = data.rate_usd;
                return;
            }
        }
    } catch (e) {
        console.warn("Backend LTC rate fetch fallback:", e);
    }

    try {
        const res2 = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=litecoin&vs_currencies=usd');
        if (res2.ok) {
            const d2 = await res2.json();
            if (d2 && d2.litecoin && d2.litecoin.usd > 10) {
                liveLtcUsdRate = d2.litecoin.usd;
            }
        }
    } catch (e2) {
        console.warn("CoinGecko LTC rate fallback:", e2);
    }
}

function updateCryptoCheckoutUI() {
    const usd = CRYPTO_PLAN_USD[activeCryptoPlan] || 9.99;
    const ltcAmount = (usd / liveLtcUsdRate).toFixed(5);

    const amountDisplay = document.getElementById('crypto-amount-display');
    const usdApprox = document.getElementById('crypto-usd-approx');
    const qrImg = document.getElementById('crypto-qr-img');
    const walletLink = document.getElementById('crypto-wallet-deep-link');

    if (amountDisplay) amountDisplay.textContent = ltcAmount;
    if (usdApprox) usdApprox.textContent = `~$${usd} USD (1 LTC ≈ $${liveLtcUsdRate.toFixed(2)})`;

    const uri = `litecoin:${OWNER_LTC_ADDRESS}?amount=${ltcAmount}`;
    if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(uri)}&margin=1`;
    }
    if (walletLink) {
        walletLink.href = uri;
    }

    // Update active plan card highlight
    ['weekly', 'lifetime', 'monthly'].forEach(p => {
        const card = document.getElementById(`crypto-card-${p}`);
        if (card) {
            if (p === activeCryptoPlan) card.classList.add('active');
            else card.classList.remove('active');
        }
    });
}

function selectCryptoPlan(plan) {
    activeCryptoPlan = plan;
    updateCryptoCheckoutUI();
}
window.selectCryptoPlan = selectCryptoPlan;

function switchPaymentMethod(method) {
    const btnLtc = document.getElementById('crypto-tab-btn-ltc');
    const btnDiscord = document.getElementById('crypto-tab-btn-discord');
    const viewLtc = document.getElementById('crypto-view-ltc');
    const viewDiscord = document.getElementById('crypto-view-discord');

    if (method === 'ltc') {
        if (btnLtc) btnLtc.classList.add('active');
        if (btnDiscord) btnDiscord.classList.remove('active');
        if (viewLtc) viewLtc.classList.remove('hidden');
        if (viewDiscord) viewDiscord.classList.add('hidden');
    } else {
        if (btnDiscord) btnDiscord.classList.add('active');
        if (btnLtc) btnLtc.classList.remove('active');
        if (viewDiscord) viewDiscord.classList.remove('hidden');
        if (viewLtc) viewLtc.classList.add('hidden');
    }
}
window.switchPaymentMethod = switchPaymentMethod;

async function showCryptoPurchaseModal(plan = 'lifetime', event) {
    if (event) event.preventDefault();

    if (!currentUser) {
        showBanner("გთხოვთ გაიაროთ ავტორიზაცია Discord-ით, რომ გასაღები თქვენს ანგარიშს მიებას!", "info");
        signInWithDiscord();
        return;
    }

    activeCryptoPlan = plan;
    const modal = document.getElementById('crypto-purchase-modal');
    const payBox = document.getElementById('crypto-payment-box');
    const successScreen = document.getElementById('crypto-success-screen');

    if (payBox) payBox.classList.remove('hidden');
    if (successScreen) successScreen.classList.add('hidden');
    switchPaymentMethod('ltc');

    if (modal) modal.classList.remove('hidden');

    await fetchLiveLtcRate();
    updateCryptoCheckoutUI();
    startCryptoPaymentPolling();
}
window.showCryptoPurchaseModal = showCryptoPurchaseModal;
window.showPurchaseModal = (e) => showCryptoPurchaseModal('lifetime', e);

function closeCryptoPurchaseModal() {
    const modal = document.getElementById('crypto-purchase-modal');
    if (modal) modal.classList.add('hidden');
    stopCryptoPaymentPolling();
}
window.closeCryptoPurchaseModal = closeCryptoPurchaseModal;

function startCryptoPaymentPolling() {
    stopCryptoPaymentPolling();
    // Poll every 8 seconds
    cryptoPollInterval = setInterval(() => {
        checkCryptoPayment();
    }, 8000);
}

function stopCryptoPaymentPolling() {
    if (cryptoPollInterval) {
        clearInterval(cryptoPollInterval);
        cryptoPollInterval = null;
    }
}

async function checkCryptoPayment(manualTxid = null) {
    if (isCheckingCryptoPayment) return;
    if (!currentUser) return;

    isCheckingCryptoPayment = true;
    const metadata = currentUser.user_metadata || {};
    const username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name || "User";
    const discordId = getDiscordId(currentUser);

    const statusBadge = document.getElementById('crypto-status-badge');
    const statusDesc = document.getElementById('crypto-status-desc');

    try {
        const res = await fetch('https://errormissing-pulse-bot.hf.space/crypto/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                plan: activeCryptoPlan,
                discord_id: String(discordId),
                username: username,
                txid: manualTxid || ''
            })
        });

        if (res.ok) {
            const data = await res.json();
            if (data.status === 'success') {
                stopCryptoPaymentPolling();
                handleCryptoPaymentSuccess(data);
            } else if (data.status === 'pending') {
                if (statusBadge) {
                    statusBadge.className = 'crypto-status-pill pending';
                    statusBadge.textContent = 'ველოდებით ტრანზაქციას';
                }
                if (statusDesc) {
                    statusDesc.textContent = 'გაგზავნეთ LTC თქვენი საფულიდან. ბლოკჩეინი მოწმდება ავტომატურად.';
                }
            }
        }
    } catch (e) {
        console.warn("Crypto payment poll error:", e);
    } finally {
        isCheckingCryptoPayment = false;
    }
}

function handleCryptoPaymentSuccess(data) {
    const payBox = document.getElementById('crypto-payment-box');
    const successScreen = document.getElementById('crypto-success-screen');
    const successKey = document.getElementById('crypto-success-key');

    if (payBox) payBox.classList.add('hidden');
    if (successScreen) successScreen.classList.remove('hidden');
    if (successKey && data.license_key) {
        successKey.value = data.license_key;
    }

    showBanner("🎉 გადახდა წარმატებით დადასტურდა! ლიცენზია შეიქმნა.", "success");
    if (typeof fetchUserLicenses === 'function') {
        fetchUserLicenses();
    }
}

function copyCryptoAddress(btn) {
    const input = document.getElementById('crypto-address-input');
    if (!input) return;
    navigator.clipboard.writeText(input.value.trim()).then(() => {
        if (btn) {
            const orig = btn.innerHTML;
            btn.classList.add('copied');
            btn.innerHTML = `<span>დაკოპირდა! ✅</span>`;
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = orig;
            }, 2000);
        }
    });
}
window.copyCryptoAddress = copyCryptoAddress;

function copyCryptoAmount(btn) {
    const amountEl = document.getElementById('crypto-amount-display');
    if (!amountEl) return;
    navigator.clipboard.writeText(amountEl.textContent.trim()).then(() => {
        if (btn) {
            const orig = btn.innerHTML;
            btn.classList.add('copied');
            btn.innerHTML = `<span>დაკოპირდა! ✅</span>`;
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = orig;
            }, 2000);
        }
    });
}
window.copyCryptoAmount = copyCryptoAmount;

function copyCryptoSuccessKey(btn) {
    const input = document.getElementById('crypto-success-key');
    if (!input) return;
    navigator.clipboard.writeText(input.value.trim()).then(() => {
        if (btn) {
            const orig = btn.innerHTML;
            btn.classList.add('copied');
            btn.innerHTML = `<span>დაკოპირდა! ✅</span>`;
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = orig;
            }, 2000);
        }
    });
}
window.copyCryptoSuccessKey = copyCryptoSuccessKey;

function toggleManualTxidInput() {
    const form = document.getElementById('crypto-manual-txid-form');
    if (form) form.classList.toggle('hidden');
}
window.toggleManualTxidInput = toggleManualTxidInput;

async function verifyManualTxid() {
    const input = document.getElementById('crypto-txid-input');
    const btn = document.getElementById('crypto-txid-verify-btn');
    if (!input) return;
    const txid = input.value.trim();
    if (!txid) {
        showBanner("გთხოვთ ჩაწეროთ LTC Transaction Hash (TXID)", "error");
        return;
    }
    if (btn) {
        btn.disabled = true;
        btn.textContent = "მოწმდება...";
    }
    await checkCryptoPayment(txid);
    if (btn) {
        btn.disabled = false;
        btn.textContent = "შემოწმება";
    }
}
window.verifyManualTxid = verifyManualTxid;

function handleCryptoSuccessDone() {
    closeCryptoPurchaseModal();
    if (typeof showDashboard === 'function') {
        showDashboard();
        switchDashTab(null, 'tab-downloads');
    }
}
window.handleCryptoSuccessDone = handleCryptoSuccessDone;

function goToFreeTrial(event) {
    if (event) event.preventDefault();
    if (!currentUser) {
        signInWithDiscord();
    } else {
        showDashboard();
        switchDashTab(null, 'tab-redeem');
        const trialCard = document.querySelector('.trial-card');
        if (trialCard) {
            trialCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            trialCard.classList.remove('trial-card-highlight');
            void trialCard.offsetWidth; // trigger reflow
            trialCard.classList.add('trial-card-highlight');
        }
    }
}
window.goToFreeTrial = goToFreeTrial;

let isVpnBlocked = false;

async function checkVpnProxy() {
    if (isAdmin()) return false;

    try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
            const data = await res.json();
            if (data.proxy || data.hosting || (data.org && /vpn|proxy|datacenter|hosting|m247|ovh|digitalocean|linode|hetzner|vultr|leaseweb|choopa|packetexchange|hydra/i.test(data.org))) {
                return true;
            }
        }
    } catch (e) {
        try {
            const res2 = await fetch('https://ipwho.is/');
            if (res2.ok) {
                const data2 = await res2.json();
                if (data2.security && (data2.security.vpn || data2.security.proxy || data2.security.tor || data2.security.hosting)) {
                    return true;
                }
            }
        } catch (e2) {}
    }
    return false;
}

// App Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Check for VPN / Proxy in background
    checkVpnProxy().then(isVpn => {
        if (isVpn && !isAdmin()) {
            isVpnBlocked = true;
            if (vpnBlockPage) vpnBlockPage.classList.remove('hidden');
            if (authGatePage) authGatePage.classList.add('hidden');
            landingPage.classList.add('hidden');
            dashboardPage.classList.add('hidden');
            if (navLinks) navLinks.classList.add('hidden');
        }
    });

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
            if (!currentUser || currentUser.id !== session.user.id) {
                handleUserSignIn(session.user);
            }
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

    const redeemPromoForm = document.getElementById('redeem-promo-form');
    if (redeemPromoForm) redeemPromoForm.addEventListener('submit', redeemPromoCode);

    const adminPromoCreateForm = document.getElementById('admin-promo-create-form');
    if (adminPromoCreateForm) adminPromoCreateForm.addEventListener('submit', createPromoCodeFromAdmin);

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

    // Set default download links
    if (downloadPvpBtn) {
        downloadPvpBtn.href = GITHUB_PVP_DOWNLOAD_URL;
        downloadPvpBtn.setAttribute('download', GITHUB_PVP_JAR_FILE);
    }
    if (downloadBasefindBtn) {
        downloadBasefindBtn.href = GITHUB_BASEFIND_DOWNLOAD_URL;
        downloadBasefindBtn.setAttribute('download', GITHUB_BASEFIND_JAR_FILE);
    }
    if (updateDownloadBtn) {
        updateDownloadBtn.href = GITHUB_PVP_DOWNLOAD_URL;
        updateDownloadBtn.setAttribute('download', GITHUB_PVP_JAR_FILE);
    }

    // Apply saved language after all listeners are attached
    if (typeof initLanguage === "function") initLanguage();

    // Purchase Modal Event Listeners
    const purchaseInfoModal = document.getElementById('purchase-info-modal');
    const purchaseModalCloseBtn = document.getElementById('purchase-modal-close-btn');
    if (purchaseModalCloseBtn && purchaseInfoModal) {
        purchaseModalCloseBtn.addEventListener('click', () => {
            purchaseInfoModal.classList.add('hidden');
        });
    }
    if (purchaseInfoModal) {
        purchaseInfoModal.addEventListener('click', (e) => {
            if (e.target === purchaseInfoModal) {
                purchaseInfoModal.classList.add('hidden');
            }
        });
    }

    // Apply pricing numbers after i18n initialization
    try { applyPricingNumbers(); } catch (e) {}

    // Ensure correct sidebar tab switching handlers are registered
    try {
        document.querySelectorAll('.sidebar-menu .menu-item').forEach((el) => {
            el.addEventListener('click', (ev) => {
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

// Update Notification DOM Elements
const updateNotification = document.getElementById('update-notification');
const updateDateText = document.getElementById('update-date-text');
const updateDownloadBtn = document.getElementById('update-download-btn');
const updateDismissBtn = document.getElementById('update-dismiss-btn');

// GitHub update check
async function checkForUpdates() {
    try {
        // Fetch commits for the current jar file to know the last update time
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commits?path=${encodeURIComponent(GITHUB_JAR_FILE)}&page=1&per_page=1`);
        if (!res.ok) throw new Error("GitHub API rate limit or error");
        const commits = await res.json();
        if (commits && commits.length > 0) {
            const latestCommitSha = commits[0].sha;
            const latestCommitDate = commits[0].commit.committer.date;
            const latestDateObj = new Date(latestCommitDate);
            
            // Update local download link date display on downloads tab if needed
            const updatedDateEl = document.querySelector('.updated-date');
            if (updatedDateEl) {
                updatedDateEl.textContent = t("msg.lastUpdated") + latestDateObj.toLocaleDateString(getLocale()) + " " + latestDateObj.toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' });
            }

            // Check if user dismissed this update
            const dismissedSha = localStorage.getItem('pulse_dismissed_update_sha');
            if (dismissedSha !== latestCommitSha) {
                // Show update notification
                if (updateNotification) {
                    updateNotification.classList.remove('hidden');
                    if (updateDateText) {
                        updateDateText.textContent = t("msg.updateAvailable", { date: latestDateObj.toLocaleDateString(getLocale()) });
                    }
                }

                if (updateDismissBtn) {
                    updateDismissBtn.onclick = () => {
                        localStorage.setItem('pulse_dismissed_update_sha', latestCommitSha);
                        updateNotification.classList.add('hidden');
                    };
                }
            }
        }
    } catch (err) {
        console.warn("Could not check for updates via GitHub:", err.message);
    }
}

// Auth Functions
async function signInWithDiscord() {
    try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: window.location.origin + window.location.pathname
            }
        });
        if (error) throw error;
    } catch (err) {
        console.error("Login failed:", err.message);
        alert(t("msg.loginFail") + err.message);
    }
}

async function signOut() {
    await supabaseClient.auth.signOut();
}
window.signInWithDiscord = signInWithDiscord;
window.signOut = signOut;

// ==========================================
// LIVE DISCORD AVATAR SYSTEM
// ==========================================
const liveAvatarCache = new Map();

function getDefaultDiscordAvatar(discordId) {
    if (!discordId) return "https://cdn.discordapp.com/embed/avatars/0.png";
    try {
        const id = BigInt(String(discordId).trim());
        const index = Number((id >> 22n) % 6n);
        return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
    } catch (e) {
        return "https://cdn.discordapp.com/embed/avatars/0.png";
    }
}
window.getDefaultDiscordAvatar = getDefaultDiscordAvatar;

function cleanAvatarUrl(url, discordId = null) {
    if (!url || url.includes('embed/avatars/0.png')) {
        if (discordId) return getDefaultDiscordAvatar(discordId);
        return "https://cdn.discordapp.com/embed/avatars/0.png";
    }
    // Standardize Discord CDN URL with size=128
    if (url.includes('cdn.discordapp.com/avatars/')) {
        const base = url.split('?')[0];
        return `${base}?size=128`;
    }
    return url;
}
window.cleanAvatarUrl = cleanAvatarUrl;

function updatePageAvatars(discordId, avatarUrl) {
    if (!discordId || !avatarUrl) return;
    const imgs = document.querySelectorAll(`img[data-discord-id="${discordId}"]`);
    imgs.forEach(img => {
        if (img.src !== avatarUrl) {
            img.src = avatarUrl;
        }
    });

    if (currentUser && String(getDiscordId(currentUser)) === String(discordId)) {
        if (navAvatar && navAvatar.src !== avatarUrl) navAvatar.src = avatarUrl;
        if (dashAvatar && dashAvatar.src !== avatarUrl) dashAvatar.src = avatarUrl;
    }
}

async function fetchLiveDiscordAvatar(discordId) {
    if (!discordId) return null;
    const strId = String(discordId).trim();
    if (liveAvatarCache.has(strId)) {
        return liveAvatarCache.get(strId);
    }

    const defaultColorAvatar = getDefaultDiscordAvatar(strId);

    try {
        // 1. Try our backend live resolver
        const res = await fetch(`https://errormissing-pulse-bot.hf.space/discord/avatar/${strId}`);
        if (res.ok) {
            const data = await res.json();
            if (data && data.avatar_url) {
                liveAvatarCache.set(strId, data.avatar_url);
                updatePageAvatars(strId, data.avatar_url);
                return data.avatar_url;
            }
        }
    } catch (e) {
        console.warn(`[Live Avatar] Backend lookup fallback for ${strId}:`, e);
    }

    try {
        // 2. Direct JAPI fallback
        const res2 = await fetch(`https://japi.rest/discord/v1/user/${strId}`);
        if (res2.ok) {
            const d2 = await res2.json();
            const avatarHash = d2.data?.avatar;
            if (avatarHash) {
                const ext = String(avatarHash).startsWith('a_') ? 'gif' : 'png';
                const liveUrl = `https://cdn.discordapp.com/avatars/${strId}/${avatarHash}.${ext}?size=128`;
                liveAvatarCache.set(strId, liveUrl);
                updatePageAvatars(strId, liveUrl);
                return liveUrl;
            }
        }
    } catch (e2) {
        console.warn(`[Live Avatar] Direct JAPI fallback error for ${strId}:`, e2);
    }

    liveAvatarCache.set(strId, defaultColorAvatar);
    return defaultColorAvatar;
}
window.fetchLiveDiscordAvatar = fetchLiveDiscordAvatar;

function handleAvatarError(img, discordId = null) {
    if (!img) return;
    img.onerror = null;
    const defaultAvatar = getDefaultDiscordAvatar(discordId);
    img.src = defaultAvatar;
    if (discordId) {
        fetchLiveDiscordAvatar(discordId).then(liveUrl => {
            if (liveUrl && liveUrl !== defaultAvatar) {
                img.src = liveUrl;
            }
        }).catch(() => {});
    }
}
window.handleAvatarError = handleAvatarError;

async function handleUserSignIn(user) {
    // Check Blacklist first
    const banRecord = await checkUserBlacklist(user);
    if (banRecord) {
        handleUserBanEnforcement(banRecord);
        return;
    }

    currentUser = user;
    
    // Get Discord Profile Details
    const metadata = user.user_metadata || {};
    const username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name || "User";
    const discordId = getDiscordId(user);
    const avatar = cleanAvatarUrl(metadata.avatar_url, discordId);

    // Update Nav
    navLoginBtn.classList.add('hidden');
    navUserProfile.classList.remove('hidden');
    if (navAvatar) {
        navAvatar.setAttribute('data-discord-id', discordId || '');
        navAvatar.src = avatar;
        navAvatar.onerror = () => handleAvatarError(navAvatar, discordId);
    }
    if (navUsername) navUsername.textContent = username;

    // Update Dashboard Profile
    if (dashAvatar) {
        dashAvatar.setAttribute('data-discord-id', discordId || '');
        dashAvatar.src = avatar;
        dashAvatar.onerror = () => handleAvatarError(dashAvatar, discordId);
    }
    if (dashUsername) dashUsername.textContent = username;

    // Fetch live Discord avatar in real-time
    if (discordId) {
        fetchLiveDiscordAvatar(discordId);
    }

    // Hide Auth Gate Barrier & Show Nav Links
    if (authGatePage) authGatePage.classList.add('hidden');
    if (navLinks) navLinks.classList.remove('hidden');

    // Switch Views while preserving user's current view and tab
    const savedView = localStorage.getItem('pulse_current_view');
    const isDashboardAlreadyVisible = dashboardPage && !dashboardPage.classList.contains('hidden');
    const isDashboardHash = window.location.hash === '#dashboard' || window.location.hash.startsWith('#tab-');

    if (isDashboardAlreadyVisible || savedView === 'dashboard' || isDashboardHash) {
        landingPage.classList.add('hidden');
        dashboardPage.classList.remove('hidden');
        localStorage.setItem('pulse_current_view', 'dashboard');
        
        const savedTab = localStorage.getItem('pulse_current_tab') || (window.location.hash.startsWith('#tab-') ? window.location.hash.replace('#', '') : 'tab-downloads');
        switchDashTab(null, savedTab, false);
    } else {
        landingPage.classList.remove('hidden');
        dashboardPage.classList.add('hidden');
        localStorage.setItem('pulse_current_view', 'landing');
    }

    // Show/Hide Admin menu item
    if (isAdmin()) {
        if (adminMenuItem) adminMenuItem.classList.remove('hidden');
        fetchAdminLicenses();
        fetchActiveSessions();
        fetchProfilesForAdmin();
        fetchBlacklistEntries();
    } else {
        if (adminMenuItem) adminMenuItem.classList.add('hidden');
    }
    // Save/Update user profile
    saveUserProfile(user);

    // Asynchronously fetch latest profile from DB in case it was synced by bot
    fetchLatestProfile(user.id);
    const auditUser = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name || "Guest";
    const auditDiscordId = getDiscordId(user) || "Unknown";
    sendDiscordAuditLog(
        "მომხმარებელი შევიდა საიტზე",
        `მომხმარებელმა **${auditUser}** წარმატებით გაიარა Discord ავტორიზაცია.`,
        0x10b981,
        [
            { name: "👤 მომხმარებელი", value: auditUser, inline: true },
            { name: "🆔 Discord ID", value: String(auditDiscordId), inline: true },
            { name: "👑 როლი", value: isAdmin() ? "Admin / Owner ⚡" : "User 🎮", inline: true }
        ]
    );

    // Set up referral link for the logged in user
    const refLinkInput = document.getElementById('referral-link-input');
    if (refLinkInput && discordId) {
        refLinkInput.value = `${window.location.origin}${window.location.pathname}?ref=${discordId}`;
    }
    const copyRefBtn = document.getElementById('copy-referral-btn');
    if (copyRefBtn && refLinkInput) {
        copyRefBtn.onclick = () => {
            navigator.clipboard.writeText(refLinkInput.value).then(() => {
                const origText = copyRefBtn.textContent;
                copyRefBtn.textContent = t("msg.copied");
                setTimeout(() => { copyRefBtn.textContent = origText; }, 2000);
            });
        };
    }

    // Set up referral code display for the logged in user
    const refCodeDisplay = document.getElementById('referral-code-display');
    if (refCodeDisplay && discordId) {
        refCodeDisplay.value = generateReferralCodeFromDiscordId(String(discordId));
    }
    const copyRefCodeBtn = document.getElementById('copy-referral-code-btn');
    if (copyRefCodeBtn && refCodeDisplay) {
        copyRefCodeBtn.onclick = () => {
            navigator.clipboard.writeText(refCodeDisplay.value).then(() => {
                const origText = copyRefCodeBtn.textContent;
                copyRefCodeBtn.textContent = t("msg.copied");
                setTimeout(() => { copyRefCodeBtn.textContent = origText; }, 2000);
            });
        };
    }

    // Set up referral code redemption form
    const refCodeForm = document.getElementById('referral-code-form');
    if (refCodeForm) {
        refCodeForm.onsubmit = async (e) => {
            e.preventDefault();
            await redeemReferralCode();
        };
    }

    // Fetch Licenses
    fetchUserLicenses();

    // Check for mod updates
    checkForUpdates();
}

function handleUserSignOut() {
    currentUser = null;

    // Update Nav
    navLoginBtn.classList.remove('hidden');
    navUserProfile.classList.add('hidden');
    if (navLinks) navLinks.classList.add('hidden');

    // Show Auth Gate Barrier and hide all internal pages
    if (authGatePage) authGatePage.classList.remove('hidden');
    landingPage.classList.add('hidden');
    dashboardPage.classList.add('hidden');

    // Hide Admin menu item
    if (adminMenuItem) {
        adminMenuItem.classList.add('hidden');
    }
}

// Database / Licenses Helper Functions
function parseLicenseExpiryDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const clean = dateStr.trim();
    if (!clean || clean.startsWith("2000-01-01")) return null;
    
    // Normalize date string for cross-browser parsing
    let iso = clean.replace(' ', 'T');
    if (!iso.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(iso)) {
        iso += 'Z';
    }
    
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return d;
    
    const fallback = new Date(clean);
    return !isNaN(fallback.getTime()) ? fallback : null;
}

function getLicenseStatus(lic) {
    if (!lic) {
        return { status: 'revoked', text: t('status.revoked'), isExpired: false, isLifetime: false, isUnactivated: false, expDate: null };
    }
    
    if (!lic.is_active) {
        return { status: 'revoked', text: t('status.revoked'), isExpired: false, isLifetime: false, isUnactivated: false, expDate: null };
    }
    
    if (!lic.expires_at) {
        return { status: 'active', text: t('status.active'), isExpired: false, isLifetime: true, isUnactivated: false, expDate: null };
    }
    
    if (typeof lic.expires_at === 'string' && lic.expires_at.startsWith("2000-01-01")) {
        return { status: 'active', text: t('status.active'), isExpired: false, isLifetime: false, isUnactivated: true, expDate: null };
    }
    
    const expDate = parseLicenseExpiryDate(lic.expires_at);
    if (!expDate) {
        return { status: 'active', text: t('status.active'), isExpired: false, isLifetime: false, isUnactivated: false, expDate: null };
    }
    
    const now = Date.now();
    if (expDate.getTime() <= now) {
        return { status: 'expired', text: t('status.expired'), isExpired: true, isLifetime: false, isUnactivated: false, expDate: expDate };
    }
    
    return { status: 'active', text: t('status.active'), isExpired: false, isLifetime: false, isUnactivated: false, expDate: expDate };
}

function formatLicenseExpiryDisplay(lic) {
    if (!lic.expires_at) {
        return t("status.lifetime");
    }
    if (typeof lic.expires_at === 'string' && lic.expires_at.startsWith("2000-01-01")) {
        return t("status.notActivated");
    }
    
    const expDate = parseLicenseExpiryDate(lic.expires_at);
    if (!expDate) {
        return t("status.lifetime");
    }
    
    const now = new Date();
    if (expDate.getTime() <= now.getTime()) {
        return `<span style="color: #fbbf24; font-weight: 700;">${t("status.expiredShort")}</span>`;
    }
    
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 365 * 10) {
        return t("status.lifetime");
    } else if (diffDays <= 2 && diffDays > 0) {
        return `<span style="color: #fbbf24; font-weight: 700;">${t("status.daysLeft", { n: diffDays })} ⚠️</span>`;
    } else {
        return t("status.daysLeft", { n: diffDays });
    }
}

async function fetchUserLicenses() {
    if (!currentUser) return;

    licensesLoading.classList.remove('hidden');
    noLicensesView.classList.add('hidden');
    licensesList.classList.add('hidden');

    const metadata = currentUser.user_metadata;
    const username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name;

    try {
        // Query licenses matching "Buyer: <username>" in the note column
        const { data, error } = await supabaseClient
            .from('licenses')
            .select('*')
            .like('note', `%Buyer: ${username}%`);

        if (error) throw error;

        licensesLoading.classList.add('hidden');
        const activeCount = (data || []).filter(l => getLicenseStatus(l).status === 'active').length;
        dashLicenseCount.textContent = activeCount;

        if (!data || data.length === 0) {
            noLicensesView.classList.remove('hidden');
        } else {
            renderLicenses(data);
        }
    } catch (err) {
        console.error("Error fetching licenses:", err.message);
        showBanner(t("msg.licLoadFail") + err.message, "error");
        licensesLoading.classList.add('hidden');
    }
}

function renderLicenses(licenses) {
    licensesList.innerHTML = '';
    
    licenses.forEach(lic => {
        const item = document.createElement('div');
        item.className = 'license-item';

        const { status, text: statusText, isExpired } = getLicenseStatus(lic);
        const expiryDisplay = formatLicenseExpiryDisplay(lic);

        const hwidText = lic.hwid && lic.hwid !== 'null' ? (lic.hwid.length > 14 ? lic.hwid.substring(0, 14) + '...' : lic.hwid) : t('status.notActivated');
        const hwidTooltip = lic.hwid && lic.hwid !== 'null' ? lic.hwid : '';
        const hasHwid = lic.hwid && lic.hwid !== 'null';

        item.innerHTML = `
            <div class="lic-key-info">
                <h4>${t('lic.keyLabel')}</h4>
                <code>${lic.license_key}</code>
            </div>
            <div class="lic-status-badge ${status}">
                ${statusText}
            </div>
            <div class="lic-expiry-info">
                <span class="label">${t('lic.expiryLabel')}</span>
                <span class="val">${expiryDisplay}</span>
            </div>
            <div class="lic-hwid-info">
                <span class="label">${t('lic.hwidLabel')}</span>
                <span class="val mono" title="${hwidTooltip}">${hwidText}</span>
            </div>
            <div class="lic-actions-info">
                <button class="btn reset-hwid-btn" onclick="resetUserHwid('${lic.license_key}')" ${hasHwid && lic.is_active && !isExpired ? '' : 'disabled'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                    ${t('dash.resetHwidBtn')}
                </button>
            </div>
        `;
        licensesList.appendChild(item);
    });

    licensesList.classList.remove('hidden');

    // Single-use referral protection: check if user already redeemed a referral code
    const hasUsedReferral = licenses.some(l => l.note && l.note.includes('Referred by:'));
    updateReferralRedeemUI(hasUsedReferral);
}

function updateReferralRedeemUI(hasUsedReferral) {
    const codeInput = document.getElementById('referral-code-input');
    const submitBtn = document.getElementById('referral-code-submit-btn');
    if (!codeInput || !submitBtn) return;

    if (hasUsedReferral) {
        codeInput.value = '';
        codeInput.disabled = true;
        codeInput.placeholder = "თქვენ უკვე გამოიყენეთ რეფერალური კოდი (1/1) ✅";
        submitBtn.disabled = true;
        submitBtn.textContent = "გამოყენებულია ✅";
        submitBtn.style.opacity = "0.5";
        submitBtn.style.cursor = "not-allowed";
    } else {
        codeInput.disabled = false;
        codeInput.placeholder = t("dash.referralRedeemPlaceholder") || "მაგ: RFGS313";
        submitBtn.disabled = false;
        submitBtn.textContent = t("dash.referralRedeemBtn") || "გააქტიურება";
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
    }
}

// Bind License Key to User
async function bindLicenseKey(e) {
    e.preventDefault();
    const key = bindKeyInput.value.trim();
    if (!key) return;

    bindSubmitBtn.disabled = true;
    bindSubmitBtn.textContent = t("msg.bindLoading");

    const metadata = currentUser.user_metadata;
    const username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name;

    try {
        // 1. Check if the key exists in database
        const { data: license, error: fetchError } = await supabaseClient
            .from('licenses')
            .select('*')
            .eq('license_key', key)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (!license) {
            showBanner(t("msg.keyNotFound"), "error");
            bindSubmitBtn.disabled = false;
            bindSubmitBtn.textContent = t("dash.bindBtn");
            return;
        }

        // 2. Check if key is already linked to someone else
        if (license.note && license.note.includes("Buyer:") && !license.note.includes(username)) {
            // Note contains another buyer name
            showBanner(t("msg.keyTaken"), "error");
            bindSubmitBtn.disabled = false;
            bindSubmitBtn.textContent = t("dash.bindBtn");
            return;
        }

        // 3. Check if user has already triggered a referral
        const { data: userLicenses } = await supabaseClient
            .from('licenses')
            .select('*')
            .like('note', `%Buyer: ${username}%`);
        const hasTriggeredRef = userLicenses && userLicenses.some(l => l.note && l.note.includes("Referred by:"));

        let referrerName = null;
        if (!hasTriggeredRef) {
            referrerName = await processReferralBonus(username);
        }

        // 4. Update the note column to associate with current user, preserving original creator/metadata info
        const originalNote = license.note || "";
        let newNote = originalNote;
        let expiresAtUpdate = license.expires_at;

        // If the license has not been activated/timed yet, and has a Duration: X in its note:
        if ((!license.expires_at || license.expires_at.startsWith("2000-01-01")) && /Duration:\s*(\d+)/i.test(originalNote)) {
            const durationMatch = originalNote.match(/Duration:\s*(\d+)/i);
            if (durationMatch) {
                const days = parseInt(durationMatch[1], 10);
                expiresAtUpdate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
            }
        }

        // Replace or add Buyer in the note dynamically while keeping other metadata intact
        if (/Buyer:\s*([^|()]+)/i.test(newNote)) {
            newNote = newNote.replace(/Buyer:\s*([^|()]+)/i, `Buyer: ${username} `);
        } else {
            newNote = `Product: PulseClient | Buyer: ${username} | ${newNote}`;
        }

        // Append Linked via Dashboard if not already present
        if (!newNote.includes("Linked via Dashboard")) {
            newNote += ` (Linked via Dashboard)`;
        }

        if (referrerName && expiresAtUpdate && !expiresAtUpdate.startsWith("2000-01-01")) {
            const currentExpiry = new Date(expiresAtUpdate);
            expiresAtUpdate = new Date(currentExpiry.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
        }

        if (referrerName && !newNote.includes("Referred by:")) {
            newNote += ` | Referred by: ${referrerName}`;
        }

        const { error: updateError } = await supabaseClient
            .from('licenses')
            .update({ note: newNote, expires_at: expiresAtUpdate })
            .eq('license_key', key);

        if (updateError) throw updateError;

        showBanner(t("msg.bindSuccess"), "success");
        bindKeyInput.value = '';
        fetchUserLicenses();
    } catch (err) {
        console.error("Binding failed:", err.message);
        showBanner(t("msg.bindFail") + err.message, "error");
    } finally {
        bindSubmitBtn.disabled = false;
        bindSubmitBtn.textContent = t("dash.bindBtn");
    }
}

// Alert Banner helper functions
function showBanner(message, type = "info") {
    // Select icon based on type
    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    // Set structure
    dashMessageBanner.innerHTML = `
        <div class="alert-banner-content">
            <div class="alert-banner-icon">${iconSvg}</div>
            <span id="banner-text">${message}</span>
        </div>
        <button onclick="hideBanner()" class="close-banner" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    dashMessageBanner.className = `alert-banner ${type}`;
    dashMessageBanner.classList.remove('hidden', 'banner-hide');

    // Auto hide after 5 seconds
    if (window.bannerTimeout) clearTimeout(window.bannerTimeout);
    window.bannerTimeout = setTimeout(hideBanner, 5000);
}

function hideBanner() {
    if (dashMessageBanner.classList.contains('hidden')) return;
    dashMessageBanner.classList.add('banner-hide');
    setTimeout(() => {
        dashMessageBanner.classList.add('hidden');
        dashMessageBanner.classList.remove('banner-hide');
    }, 300);
}

// Utility smooth scroll
function scrollToAuth() {
    if (currentUser) {
        document.getElementById('dashboard-page').scrollIntoView();
    } else {
        signInWithDiscord();
    }
}
window.scrollToAuth = scrollToAuth;
// Sidebar Dashboard Tab Switcher
function switchDashTab(event, tabId, shouldScroll = true) {
    if (event && event.preventDefault) event.preventDefault();
    if (!tabId) tabId = 'tab-downloads';
    
    // Save to localStorage so state is preserved across minimize/unfocus/refresh
    localStorage.setItem('pulse_current_view', 'dashboard');
    localStorage.setItem('pulse_current_tab', tabId);

    // Hide all tabs
    const allTabPanes = document.querySelectorAll('.dashboard-main .tab-pane');
    allTabPanes.forEach(pane => pane.classList.add('hidden'));
    
    // Show active tab
    if (tabId === 'tab-downloads') {
        const pane = document.getElementById('tab-content-downloads');
        if (pane) pane.classList.remove('hidden');
    } else if (tabId === 'tab-redeem') {
        const pane = document.getElementById('tab-content-redeem');
        if (pane) pane.classList.remove('hidden');
    } else if (tabId === 'tab-referral') {
        const pane = document.getElementById('tab-content-referral');
        if (pane) pane.classList.remove('hidden');
    } else if (tabId === 'tab-promo') {
        const pane = document.getElementById('tab-content-promo');
        if (pane) pane.classList.remove('hidden');
    } else if (tabId === 'tab-configs') {
        const pane = document.getElementById('tab-content-configs');
        if (pane) pane.classList.remove('hidden');
        if (typeof renderCommunityConfigs === 'function') {
            renderCommunityConfigs();
        }
    } else if (tabId === 'tab-faq') {
        const pane = document.getElementById('tab-content-faq');
        if (pane) pane.classList.remove('hidden');
    } else if (tabId === 'tab-admin') {
        const pane = document.getElementById('tab-content-admin');
        if (pane) pane.classList.remove('hidden');
        fetchAdminLicenses();
        fetchProfilesForAdmin();
        fetchAdminPromocodes();
        fetchActiveSessions();
        fetchBlacklistEntries();

        // Restore saved admin sub-panel if any
        const savedSubtab = localStorage.getItem('pulse_admin_subtab') || 'admin-subpanel-licenses';
        if (typeof switchAdminSubTab === 'function') {
            switchAdminSubTab(null, savedSubtab);
        }
    }    
    // Deactivate all menu items
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    menuItems.forEach(item => {
        const href = item.getAttribute('href') || '';
        if (href === '#' + tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Activate clicked menu item
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    if (window.history.replaceState) {
        window.history.replaceState(null, '', '#' + tabId);
    }

    if (shouldScroll) {
        const dbPage = document.getElementById('dashboard-page');
        if (dbPage) {
            dbPage.scrollIntoView({ behavior: 'smooth' });
        }
    }
}
window.switchDashTab = switchDashTab;

// Scroll to specific section
function scrollToElement(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    }
}
window.scrollToElement = scrollToElement;

// Client Download Modal Actions
function openDownloadModal() {
    const modal = document.getElementById('client-download-modal');
    if (modal) modal.classList.remove('hidden');
    // Re-apply translations to modal elements
    if (typeof applyLanguage === 'function') applyLanguage(window.currentLang || 'ka');
}
function closeDownloadModal() {
    const modal = document.getElementById('client-download-modal');
    if (modal) modal.classList.add('hidden');
}
window.openDownloadModal = openDownloadModal;
window.closeDownloadModal = closeDownloadModal;

// Toggle FAQ item expansion
function toggleFaq(event) {
    const item = event.currentTarget;
    item.classList.toggle('active');
    
    const p = item.querySelector('p');
    if (p) {
        if (item.classList.contains('active')) {
            p.style.maxHeight = p.scrollHeight + 'px';
            p.style.marginTop = '12px';
            p.style.opacity = '1';
        } else {
            p.style.maxHeight = '0';
            p.style.marginTop = '0';
            p.style.opacity = '0';
        }
    }
}
window.toggleFaq = toggleFaq;

// Navigate to landing page sections from navbar/logo
function navigateToLandingSection(event, sectionId) {
    if (event && event.preventDefault) event.preventDefault();
    
    if (!currentUser) {
        if (authGatePage) authGatePage.classList.remove('hidden');
        landingPage.classList.add('hidden');
        dashboardPage.classList.add('hidden');
        return;
    }

    if (authGatePage) authGatePage.classList.add('hidden');
    // Switch views to show landing page
    landingPage.classList.remove('hidden');
    dashboardPage.classList.add('hidden');
    localStorage.setItem('pulse_current_view', 'landing');
    
    // Scroll to section
    if (sectionId) {
        const target = document.getElementById(sectionId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }

    if (window.history.replaceState) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
}
window.navigateToLandingSection = navigateToLandingSection;

// Show dashboard view
function showDashboard() {
    if (!currentUser) {
        if (authGatePage) authGatePage.classList.remove('hidden');
        landingPage.classList.add('hidden');
        dashboardPage.classList.add('hidden');
        return;
    }
    if (authGatePage) authGatePage.classList.add('hidden');
    landingPage.classList.add('hidden');
    dashboardPage.classList.remove('hidden');
    localStorage.setItem('pulse_current_view', 'dashboard');

    const savedTab = localStorage.getItem('pulse_current_tab') || 'tab-downloads';
    switchDashTab(null, savedTab);
}
window.showDashboard = showDashboard;

// ==========================================
// ADMIN PANEL FUNCTIONS
// ==========================================

function isOwner() {
    if (!currentUser) return false;
    const discordId = String(getDiscordId(currentUser) || "");
    const username = String(currentUser.user_metadata?.user_name || currentUser.user_metadata?.username || currentUser.user_metadata?.name || "").toLowerCase();
    if (OWNER_DISCORD_IDS.includes(discordId)) return true;
    if (username === "sticky._.1" || username === "errora" || username.includes("error404") || username.includes("udzlieresi")) return true;
    return false;
}

function isAdmin() {
    if (!currentUser) return false;
    if (isOwner()) return true;
    const discordId = String(getDiscordId(currentUser) || "");
    const username = String(currentUser.user_metadata?.user_name || currentUser.user_metadata?.username || currentUser.user_metadata?.name || "").toLowerCase();
    if (ADMIN_DISCORD_IDS.includes(discordId)) return true;
    if (username === "sticky._.1" || username === "errora" || username.includes("error404") || username.includes("udzlieresi")) return true;
    return false;
}

function parseLicenseNote(note) {
    let product = "PulseClient";
    let buyer = "Unknown";
    let createdBy = "—";
    
    if (note) {
        const prodMatch = note.match(/Product:\s*([^|]+)/i);
        if (prodMatch) product = prodMatch[1].trim();
        
        const buyerMatch = note.match(/Buyer:\s*([^|(]+)/i);
        if (buyerMatch) buyer = buyerMatch[1].trim();

        const byMatch = note.match(/\(by\s+([^)]+)\)/i);
        const promoMatch = note.match(/Promocode:\s*([^|)]+)/i);
        const refByMatch = note.match(/Referred by:\s*([^|)]+)/i);
        
        if (byMatch) {
            createdBy = byMatch[1].trim();
        } else if (promoMatch) {
            createdBy = `Promocode: ${promoMatch[1].trim()}`;
        } else if (refByMatch) {
            createdBy = `Referral (${refByMatch[1].trim()})`;
        } else if (/Referral Bonus/i.test(note)) {
            createdBy = "Referral Bonus";
        } else if (/Free Trial/i.test(note)) {
            createdBy = "Free Trial";
        } else if (/Linked via Dashboard/i.test(note)) {
            createdBy = t("creator.dashboard") || "Dashboard";
        }
    }
    
    return { product, buyer, createdBy };
}

function generateLicenseKey() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

async function fetchAllLicenses() {
    if (!isAdmin()) return;

    if (adminLicensesLoading) adminLicensesLoading.classList.remove('hidden');
    if (adminLicensesTableBody) adminLicensesTableBody.innerHTML = '';

    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/licenses?select=*&order=created_at.desc`, {
            headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        adminLicenses = data || [];
        renderAdminLicenses(adminLicenses);
        renderAdminLogs(adminLicenses);
        updateAdminKpiStats();
    } catch (err) {
        console.error("Error fetching all licenses:", err.message);
        showBanner(t("msg.dataLoadFail") + err.message, "error");
    } finally {
        if (adminLicensesLoading) adminLicensesLoading.classList.add('hidden');
    }
}

const fetchAdminLicenses = fetchAllLicenses;
window.fetchAllLicenses = fetchAllLicenses;
window.fetchAdminLicenses = fetchAdminLicenses;

// ========== Active Sessions Telemetry ==========

async function fetchActiveSessions() {
    if (!isAdmin()) return;

    if (adminSessionsLoading) adminSessionsLoading.classList.remove('hidden');
    if (adminSessionsTableBody) adminSessionsTableBody.innerHTML = '';

    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/client_sessions?select=*&order=last_heartbeat.desc&limit=100`, {
            headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        renderActiveSessions(data || []);
    } catch (err) {
        console.error("Error fetching active sessions:", err.message);
    } finally {
        if (adminSessionsLoading) adminSessionsLoading.classList.add('hidden');
    }
}

function renderActiveSessions(sessions) {
    if (!adminSessionsTableBody) return;
    adminSessionsTableBody.innerHTML = '';

    const now = Date.now();
    let onlineCount = 0;

    if (sessions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">აქტიური სესიები ვერ მოიძებნა</td>`;
        adminSessionsTableBody.appendChild(row);
        if (adminSessionsCount) adminSessionsCount.textContent = '0';
        return;
    }

    const formatTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleString('ka-GE', {
            timeZone: 'Asia/Tbilisi',
            day: '2-digit', month: '2-digit',
            hour: '2-digit', minute: '2-digit',
            hour12: false
        });
    };

    // Deduplicate: Keep only the latest session per license_key / device
    const uniqueSessionsMap = new Map();
    sessions.forEach(s => {
        const uniqueKey = s.license_key || s.hwid || s.id;
        if (!uniqueSessionsMap.has(uniqueKey)) {
            uniqueSessionsMap.set(uniqueKey, s);
        } else {
            const existing = uniqueSessionsMap.get(uniqueKey);
            const existingTime = new Date(existing.last_heartbeat || 0).getTime();
            const currentTime = new Date(s.last_heartbeat || 0).getTime();
            if (currentTime > existingTime) {
                uniqueSessionsMap.set(uniqueKey, s);
            }
        }
    });
    const uniqueSessions = Array.from(uniqueSessionsMap.values());

    // Prepare sessions with online status (90 seconds threshold since client heartbeat runs every 30s)
    const enrichedSessions = uniqueSessions.map(session => {
        const lastHb = new Date(session.last_heartbeat || session.started_at);
        const diffMs = now - lastHb.getTime();
        const isOnline = diffMs < 90 * 1000;
        if (isOnline) onlineCount++;

        // Calculate live duration
        let totalMinutes = session.duration_minutes || 0;
        const startTs = new Date(session.started_at || session.last_heartbeat).getTime();
        if (!isNaN(startTs)) {
            const calculatedMins = Math.max(0, Math.floor(( (isOnline ? now : lastHb.getTime()) - startTs ) / (60 * 1000)));
            if (calculatedMins > totalMinutes) {
                totalMinutes = calculatedMins;
            }
        }

        return {
            ...session,
            isOnline,
            totalMinutes
        };
    });

    // Sort: Online sessions first, then most recently active
    enrichedSessions.sort((a, b) => {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return new Date(b.last_heartbeat || 0).getTime() - new Date(a.last_heartbeat || 0).getTime();
    });

    enrichedSessions.forEach(session => {
        const totalMinutes = session.totalMinutes;
        let durationStr;
        if (totalMinutes < 60) {
            durationStr = `${totalMinutes} წთ`;
        } else {
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            durationStr = `${hours} სთ ${mins} წთ`;
        }

        // Status dot
        const statusDot = session.isOnline
            ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;margin-right:6px;box-shadow:0 0 8px #22c55e;animation:pulse 1.5s infinite alternate;"></span>'
            : '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#6b7280;margin-right:6px;"></span>';

        // Mask license key
        const maskedKey = session.license_key
            ? session.license_key.substring(0, 4) + '-****-****-****'
            : 'N/A';

        // Server Badge (Minecraft server)
        let serverName = session.country || session.mc_server || session.server || 'Main Menu';
        if (!serverName || serverName === 'Hidden' || serverName === 'Unknown') {
            serverName = 'Main Menu';
        }

        let serverBadge = '';
        if (serverName.toLowerCase() === 'singleplayer') {
            serverBadge = `<span class="server-badge singleplayer" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); padding: 3px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">🎮 Singleplayer</span>`;
        } else if (serverName.toLowerCase() === 'main menu' || serverName.toLowerCase() === 'menu') {
            serverBadge = `<span class="server-badge menu" style="background: rgba(107, 114, 128, 0.15); color: #9ca3af; border: 1px solid rgba(107, 114, 128, 0.3); padding: 3px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">🏠 Main Menu</span>`;
        } else {
            serverBadge = `<span class="server-badge multiplayer" style="background: rgba(6, 182, 212, 0.15); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.3); padding: 3px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>${serverName}</span>`;
        }

        // User Real Public IP (Strictly restricted to Owner)
        let userIpCell = '';
        if (isOwner()) {
            const userIp = session.ip_address && session.ip_address !== 'Hidden' && session.ip_address !== 'Unknown'
                ? session.ip_address
                : 'Hidden';
            userIpCell = `<code style="font-size: 11px; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; color: #a5b4fc;">${userIp}</code>`;
        } else {
            userIpCell = `<span style="font-size: 11px; color: #6b7280; font-weight: 500;">🔒 დაცულია</span>`;
        }

        // Started at
        const startedStr = formatTime(session.started_at);
        // Finished at (last heartbeat) — if online, show "ონლაინშია ⚡"
        const finishedStr = session.isOnline
            ? '<span style="color: #22c55e; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">ონლაინშია ⚡</span>'
            : formatTime(session.last_heartbeat);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight: 600;">${statusDot}${session.mc_username || 'Unknown'}</td>
            <td><code style="font-size: 11px; background: rgba(99,102,241,0.1); padding: 2px 6px; border-radius: 4px;">${maskedKey}</code></td>
            <td>${serverBadge}</td>
            <td>${userIpCell}</td>
            <td>${session.os_name || 'N/A'}</td>
            <td style="font-size: 12px; color: var(--text-muted);">${startedStr}</td>
            <td style="font-weight: 600;">${durationStr}</td>
            <td style="font-size: 12px;">${finishedStr}</td>
        `;
        adminSessionsTableBody.appendChild(row);
    });

    activeOnlineUsersCount = onlineCount;
    if (adminSessionsCount) adminSessionsCount.textContent = onlineCount.toString();
    const onlineKpiEl = document.getElementById('admin-stat-online');
    if (onlineKpiEl) onlineKpiEl.textContent = onlineCount.toString();
    updateAdminKpiStats();
}

function renderAdminLicenses(licenses) {
    adminLicensesTableBody.innerHTML = '';
    adminTotalCount.textContent = licenses.length;

    if (licenses.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">${t("msg.noLicenses")}</td>`;
        adminLicensesTableBody.appendChild(row);
        return;
    }

    licenses.forEach(lic => {
        const { product, buyer, createdBy } = parseLicenseNote(lic.note);
        const { status, text: statusText } = getLicenseStatus(lic);

        let expiryDisplay = t("status.lifetime");
        if (lic.expires_at) {
            if (typeof lic.expires_at === 'string' && lic.expires_at.startsWith("2000-01-01")) {
                expiryDisplay = t("status.notActivated");
            } else {
                const expDate = parseLicenseExpiryDate(lic.expires_at);
                if (expDate) {
                    expiryDisplay = expDate.toLocaleDateString(getLocale(), { year: 'numeric', month: '2-digit', day: '2-digit' });
                }
            }
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="product-cell">${product}</td>
            <td class="buyer-cell">${buyer}</td>
            <td class="creator-cell">${createdBy}</td>
            <td><span class="key-cell" title="${lic.license_key}">${lic.license_key}</span></td>
            <td><span class="admin-status ${status}">${statusText}</span></td>
            <td>${expiryDisplay}</td>
            <td>
                <div class="admin-actions" style="display: flex; align-items: center; gap: 6px; justify-content: flex-end;">
                    <button type="button" class="extend-btn" onclick="extendLicenseDays('${lic.license_key}', 7)" title="+7 დღის დამატება">+7d</button>
                    <button type="button" class="extend-btn" onclick="extendLicenseDays('${lic.license_key}', 30)" title="+30 დღის დამატება">+30d</button>
                    <button type="button" class="btn-action btn-info" onclick="showLicenseDetails('${lic.license_key}')" title="${t('admin.actionInfo')}" aria-label="${t('admin.actionInfo')}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    </button>
                    <button type="button" class="btn-action btn-hwid-reset" onclick="resetLicenseHwid('${lic.license_key}')" title="${t('admin.actionHwid')}" aria-label="${t('admin.actionHwid')}" ${lic.hwid ? '' : 'disabled'}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                    </button>
                    ${lic.is_active ? `
                    <button type="button" class="btn-action btn-revoke" onclick="revokeLicense('${lic.license_key}')" title="${t('admin.actionRevoke')}" aria-label="${t('admin.actionRevoke')}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    </button>
                    ` : `
                    <button type="button" class="btn-action btn-activate" onclick="activateLicense('${lic.license_key}')" title="${t('admin.actionActivate')}" aria-label="${t('admin.actionActivate')}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </button>
                    `}
                </div>
            </td>
        `;
        adminLicensesTableBody.appendChild(tr);
    });
}

function filterAdminLicenses() {
    const query = adminSearchInput.value.toLowerCase().trim();
    const filter = adminFilterSelect.value;

    const filtered = adminLicenses.filter(lic => {
        const { product, buyer, createdBy } = parseLicenseNote(lic.note);
        const { status } = getLicenseStatus(lic);

        const matchesQuery = !query || (
            lic.license_key.toLowerCase().includes(query) ||
            buyer.toLowerCase().includes(query) ||
            createdBy.toLowerCase().includes(query) ||
            product.toLowerCase().includes(query) ||
            (lic.note && lic.note.toLowerCase().includes(query))
        );

        let matchesFilter = true;
        if (filter === 'active') {
            matchesFilter = (status === 'active');
        } else if (filter === 'revoked') {
            matchesFilter = (status === 'revoked');
        } else if (filter === 'expired') {
            matchesFilter = (status === 'expired');
        }

        return matchesQuery && matchesFilter;
    });

    renderAdminLicenses(filtered);
}

function renderAdminLogs(licenses) {
    if (!adminLogsTableBody) return;
    adminLogsTableBody.innerHTML = '';

    // Transform licenses data into individual activities/events
    const logs = [];

    licenses.forEach(lic => {
        const { product, buyer, createdBy } = parseLicenseNote(lic.note);
        const timestamp = new Date(lic.created_at).toLocaleString(getLocale());

        // 1. Generation event
        let action = "ლიცენზიის შექმნა";
        let details = `შეიქმნა <strong>${product}</strong> ლიცენზია მომხმარებლისთვის: <strong>${buyer}</strong>. ლიცენზია: <code>${lic.license_key}</code>`;
        
        if (lic.note && lic.note.includes("Free Trial")) {
            action = "საცდელი ვერსიის აღება";
            details = `მომხმარებელმა აიღო 3-დღიანი უფასო საცდელი ლიცენზია: <code>${lic.license_key}</code>`;
        }

        logs.push({
            dateObj: new Date(lic.created_at),
            date: timestamp,
            user: createdBy || "სისტემა",
            action: action,
            details: details
        });

        // 2. Referral event if present in note
        if (lic.note && lic.note.includes("Referred by:")) {
            const refMatch = lic.note.match(/Referred by:\s*([^|]+)/i);
            const referrer = refMatch ? refMatch[1].trim() : "უცნობი";
            logs.push({
                dateObj: new Date(lic.created_at),
                date: timestamp,
                user: buyer,
                action: "რეფერალის გამოყენება",
                details: `დარეგისტრირდა რეფერალური ბმულით. მოწვევა: <strong>${referrer}</strong>`
            });
        }

        // 3. Referral Bonus event
        if (lic.note && lic.note.includes("Referral Bonus for inviting")) {
            const matches = [...lic.note.matchAll(/Referral Bonus for inviting\s+([^|)]+)/gi)];
            matches.forEach(match => {
                const invited = match[1].trim();
                logs.push({
                    dateObj: new Date(lic.created_at),
                    date: timestamp,
                    user: buyer,
                    action: "რეფერალ ბონუსი (+3 დღე)",
                    details: `დაემატა 3 დღე მეგობრის (<strong>${invited}</strong>) მოწვევისთვის.`
                });
            });
        }

        // 3.5 Promocode redemption event
        if (lic.note && lic.note.includes("Promocode:")) {
            const promoMatches = [...lic.note.matchAll(/Promocode:\s*([^|)]+)/gi)];
            promoMatches.forEach(match => {
                const pCode = match[1].trim();
                logs.push({
                    dateObj: new Date(lic.created_at),
                    date: timestamp,
                    user: buyer,
                    action: "პრომო კოდის გამოყენება",
                    details: `გამოყენებულ იქნა პრომო კოდი: <strong>${pCode}</strong> ლიცენზიაზე: <code>${lic.license_key}</code>`
                });
            });
        }

        // 4. Revocation event if inactive
        if (!lic.is_active) {
            // Estimate revocation time as a bit after creation or use updated_at if we had one, but we'll use created_at as reference
            logs.push({
                dateObj: new Date(lic.created_at),
                date: timestamp,
                user: "ადმინისტრატორი",
                action: "ლიცენზიის გაუქმება",
                details: `გაუქმდა ლიცენზია: <code>${lic.license_key}</code>`
            });
        }
    });

    // Sort logs descending by timestamp
    logs.sort((a, b) => b.dateObj - a.dateObj);

    if (logs.length === 0) {
        adminLogsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px;">აქტივობები არ მოიძებნა</td></tr>`;
        return;
    }

    logs.forEach(log => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="white-space: nowrap; color: var(--text-muted);">${log.date}</td>
            <td style="font-weight: 600;">${log.user}</td>
            <td><span class="admin-status info" style="background: rgba(124, 77, 255, 0.1); color: #7C4DFF;">${log.action}</span></td>
            <td>${log.details}</td>
        `;
        adminLogsTableBody.appendChild(tr);
    });
}

function filterAdminLogs() {
    if (!adminLogsSearchInput) return;
    const query = adminLogsSearchInput.value.toLowerCase().trim();

    const filteredLicenses = adminLicenses.filter(lic => {
        const { product, buyer, createdBy } = parseLicenseNote(lic.note);
        return lic.license_key.toLowerCase().includes(query) ||
               buyer.toLowerCase().includes(query) ||
               createdBy.toLowerCase().includes(query) ||
               (lic.note && lic.note.toLowerCase().includes(query));
    });

    renderAdminLogs(filteredLicenses);
}

window.filterAdminLogs = filterAdminLogs;
window.renderAdminLogs = renderAdminLogs;

function toggleCustomDurationInput() {
    if (!adminDurationCustom || !adminDurationSelect) return;
    const isCustom = adminDurationSelect.value === 'custom';
    adminDurationCustom.classList.toggle('hidden', !isCustom);
    adminDurationCustom.required = isCustom;
    if (isCustom) {
        adminDurationCustom.focus();
    } else {
        adminDurationCustom.value = '';
    }
}

function getSelectedDurationDays() {
    const duration = adminDurationSelect.value;
    if (duration === 'lifetime') return null;
    if (duration === 'custom') {
        const days = parseInt(adminDurationCustom?.value, 10);
        if (!days || days < 1) return NaN;
        return days;
    }
    return parseInt(duration, 10);
}

async function createLicenseFromAdmin(e) {
    e.preventDefault();
    if (!isAdmin()) return;

    const buyer = adminBuyerInput.value.trim();
    const product = adminProductSelect.value;
    const durationDays = getSelectedDurationDays();

    if (!buyer) return;

    if (Number.isNaN(durationDays)) {
        showBanner(t("msg.invalidDays"), "error");
        return;
    }

    const createBtn = document.getElementById('admin-create-btn');
    createBtn.disabled = true;
    createBtn.textContent = t("msg.creating");

    const key = generateLicenseKey();
    
    let expiresAt = "2000-01-01T00:00:00.000Z"; // Default placeholder meaning "Not Activated" (bypasses DB NOT NULL constraint)
    if (durationDays === null) {
        expiresAt = "2099-12-31T23:59:59.000Z"; // Lifetime indicator
    }
    const adminMetadata = currentUser.user_metadata;
    const adminName = adminMetadata.user_name || adminMetadata.custom_claims?.username || adminMetadata.full_name || "Admin";
    let note = `Product: ${product} | Buyer: ${buyer} (by ${adminName})`;
    if (durationDays !== null) {
        note += ` | Duration: ${durationDays}`;
    }

    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/licenses`, {
            method: "POST",
            headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            body: JSON.stringify({
                license_key: key,
                expires_at: expiresAt,
                is_active: true,
                note: note
            })
        });

        if (!res.ok) throw new Error(await res.text());

        // Show result card
        adminGeneratedKey.textContent = key;
        adminKeyResult.classList.remove('hidden');

        // Reset input
        adminBuyerInput.value = '';
        const options = adminUserOptionsList.querySelectorAll('.user-option');
        options.forEach(opt => opt.classList.remove('selected'));

        showBanner(t("msg.keyCreated"), "success");
        sendDiscordAuditLog(
            "🆕 ახალი ლიცენზია შეიქმნა (Admin)",
            `ადმინმა **${adminName}** შექმნა ახალი ლიცენზია მომხმარებლისთვის **${buyer}**.`,
            0x3b82f6,
            [
                { name: "👑 ადმინი", value: adminName, inline: true },
                { name: "👤 მყიდველი", value: buyer, inline: true },
                { name: "📦 პროდუქტი", value: product, inline: true },
                { name: "გასაღები", value: key, inline: false },
                { name: "⏰ ხანგრძლივობა", value: durationDays === null ? "♾️ Lifetime" : `${durationDays} დღე`, inline: true }
            ]
        );
        fetchAllLicenses();
    } catch (err) {
        console.error("Error creating license:", err.message);
        showBanner(t("msg.keyCreateFail") + err.message, "error");
    } finally {
        createBtn.disabled = false;
        createBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> ${t("admin.createBtn")}`;
    }
}

function copyCreatedKey() {
    const keyText = adminGeneratedKey.textContent;
    navigator.clipboard.writeText(keyText).then(() => {
        const copyBtn = document.getElementById('admin-copy-key-btn');
        const origText = copyBtn.textContent;
        copyBtn.textContent = t("msg.copied");
        setTimeout(() => { copyBtn.textContent = origText; }, 2000);
    });
}

async function revokeLicense(key) {
    if (!isAdmin()) return;
    const confirmed = await showCustomConfirm(t("confirm.title"), t("msg.revokeConfirm") + key);
    if (!confirmed) return;

    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/licenses?license_key=eq.${key}`, {
            method: "PATCH",
            headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ is_active: false })
        });

        if (!res.ok) throw new Error(await res.text());

        showBanner(t("msg.revokeSuccess"), "success");
        const revokerName = currentUser ? (currentUser.user_metadata?.user_name || currentUser.user_metadata?.name || "Admin") : "Admin";
        sendDiscordAuditLog(
            "🚫 ლიცენზია გაუქმებულია",
            `ადმინმა **${revokerName}** გააუქმა ლიცენზია.`,
            0xff0000,
            [
                { name: "👑 ადმინი", value: revokerName, inline: true },
                { name: "გასაღები", value: key, inline: false }
            ]
        );
        fetchAllLicenses();
    } catch (err) {
        console.error("Error revoking license:", err.message);
        showBanner(t("msg.revokeFail") + err.message, "error");
    }
}

async function activateLicense(key) {
    if (!isAdmin()) return;
    const confirmed = await showCustomConfirm(t("confirm.title"), t("msg.activateConfirm") + key);
    if (!confirmed) return;

    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/licenses?license_key=eq.${key}`, {
            method: "PATCH",
            headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ is_active: true })
        });

        if (!res.ok) throw new Error(await res.text());

        showBanner(t("msg.activateSuccess"), "success");
        const activatorName = currentUser ? (currentUser.user_metadata?.user_name || currentUser.user_metadata?.name || "Admin") : "Admin";
        sendDiscordAuditLog(
            "✅ ლიცენზია გააქტიურებულია",
            `ადმინმა **${activatorName}** ხელახლა გაააქტიურა ლიცენზია.`,
            0x00ff88,
            [
                { name: "👑 ადმინი", value: activatorName, inline: true },
                { name: "გასაღები", value: key, inline: false }
            ]
        );
        fetchAllLicenses();
    } catch (err) {
        console.error("Error activating license:", err.message);
        showBanner(t("msg.activateFail") + err.message, "error");
    }
}

async function resetLicenseHwid(key) {
    if (!isAdmin()) return;
    const confirmed = await showCustomConfirm(t("confirm.title"), t("msg.hwidConfirm") + key);
    if (!confirmed) return;

    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/licenses?license_key=eq.${key}`, {
            method: "PATCH",
            headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ hwid: null })
        });

        if (!res.ok) throw new Error(await res.text());

        showBanner(t("msg.hwidSuccess"), "success");
        fetchAllLicenses();
    } catch (err) {
        console.error("Error resetting HWID:", err.message);
        showBanner(t("msg.hwidFail") + err.message, "error");
    }
}

async function resetUserHwid(key) {
    const confirmed = await showCustomConfirm(t("confirm.title"), t("msg.hwidResetConfirm") || "ნამდვილად გსურთ მოწყობილობის (HWID) განულება ამ ლიცენზიისთვის?");
    if (!confirmed) return;

    try {
        const { error } = await supabaseClient
            .from('licenses')
            .update({ hwid: null })
            .eq('license_key', key);

        if (error) throw error;

        showBanner(t("msg.hwidSuccess"), "success");
        fetchUserLicenses();
    } catch (err) {
        console.error("Error resetting HWID:", err.message);
        showBanner(t("msg.hwidFail") + err.message, "error");
    }
}


// Custom Confirmation Modal Helper using Promises
function showCustomConfirm(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-confirm-modal');
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const cancelBtn = document.getElementById('confirm-cancel-btn');
        const okBtn = document.getElementById('confirm-ok-btn');

        if (!modal || !titleEl || !messageEl || !cancelBtn || !okBtn) {
            resolve(confirm(message));
            return;
        }

        titleEl.textContent = title;
        messageEl.textContent = message;
        
        cancelBtn.textContent = t("confirm.no");
        okBtn.textContent = t("confirm.yes");

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        const onCancel = () => {
            cleanup();
            resolve(false);
        };

        const onConfirm = () => {
            cleanup();
            resolve(true);
        };

        const cleanup = () => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            cancelBtn.removeEventListener('click', onCancel);
            okBtn.removeEventListener('click', onConfirm);
            modal.removeEventListener('click', onOverlayClick);
        };

        const onOverlayClick = (e) => {
            if (e.target === modal) {
                onCancel();
            }
        };

        cancelBtn.addEventListener('click', onCancel);
        okBtn.addEventListener('click', onConfirm);
        modal.addEventListener('click', onOverlayClick);
    });
}

// Free Trial Claiming Logic
async function claimFreeTrial() {
    if (!currentUser) {
        showBanner(t("msg.loginFail") + "Please log in first", "error");
        return;
    }

    const claimTrialBtn = document.getElementById('claim-trial-btn');
    if (claimTrialBtn) {
        claimTrialBtn.disabled = true;
        claimTrialBtn.textContent = t("msg.creating");
    }

    const metadata = currentUser.user_metadata;
    const username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name;
    const discordId = metadata.provider_id || (currentUser.identities && currentUser.identities[0]?.id);

    try {
        // 0. IP-based Multi-Account Trial Abuse check
        let clientIp = null;
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            if (ipRes.ok) {
                const ipJson = await ipRes.json();
                clientIp = ipJson.ip;
            }
        } catch (ignored) {}

        if (clientIp) {
            try {
                const { data: ipProfiles } = await supabaseClient
                    .from('profiles')
                    .select('id, username, discord_id, trial_claimed_at')
                    .eq('last_ip', clientIp)
                    .not('trial_claimed_at', 'is', null);

                if (ipProfiles && ipProfiles.length > 0) {
                    const otherProfile = ipProfiles.find(p => p.id !== currentUser.id && p.discord_id !== String(discordId));
                    if (otherProfile) {
                        showBanner("🚫 ამ IP მისამართიდან უფასო საცდელი ვერსია უკვე აღებულია!", "error");
                        return;
                    }
                }
            } catch (ipCheckErr) {
                console.warn("IP trial abuse check skipped:", ipCheckErr);
            }
        }

        // 1. Age check on Discord account using snowflake creation date
        if (discordId) {
            try {
                const snowflake = BigInt(discordId);
                const createdAtMs = Number((snowflake >> 22n) + 1420070400000n);
                const diffDays = (Date.now() - createdAtMs) / (1000 * 60 * 60 * 24);
                if (diffDays < 30) {
                    showBanner(t("msg.trialAccountTooNew"), "error");
                    return;
                }
            } catch (err) {
                console.error("Failed to parse discord account age:", err);
            }
        }

        // 2. Check if user already has a key associated with their DiscordID or username in the licenses table
        const queryDiscordId = `%DiscordID: ${discordId}%`;
        const queryUsername = `%Buyer: ${username}%`;
        
        const { data: existingLicenses, error: queryError } = await supabaseClient
            .from('licenses')
            .select('*')
            .or(`note.like.${queryDiscordId},note.like.${queryUsername}`);

        if (queryError) throw queryError;

        if (existingLicenses && existingLicenses.length > 0) {
            const hasClaimedTrial = existingLicenses.some(l => l.note && l.note.includes("Free Trial"));
            const hasOtherLicense = existingLicenses.some(l => l.note && !l.note.includes("Free Trial") && !l.note.includes("Referral Bonus"));
            if (hasClaimedTrial || hasOtherLicense) {
                showBanner(t("msg.trialAlreadyClaimed"), "error");
                return;
            }
        }

        // 3. Process referral bonus if this is their first license
        const hasTriggeredRef = existingLicenses && existingLicenses.some(l => l.note && l.note.includes("Referred by:"));
        let referrerName = null;
        if (!hasTriggeredRef) {
            referrerName = await processReferralBonus(username);
        }

        // 4. Generate a key and save it (6 days if referred, 3 days standard)
        const key = generateLicenseKey();
        const trialDays = referrerName ? 6 : 3;
        const expiresAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();
        let note = `Product: PulseClient | Buyer: ${username} | DiscordID: ${discordId} (Free Trial)`;
        if (referrerName) {
            note += ` | Referred by: ${referrerName}`;
        }

        const { error: insertError } = await supabaseClient
            .from('licenses')
            .insert({
                license_key: key,
                expires_at: expiresAt,
                is_active: true,
                note: note
            });

        if (insertError) throw insertError;

        // Silently record trial_claimed_at in profiles table
        try {
            await supabaseClient
                .from('profiles')
                .update({ trial_claimed_at: new Date().toISOString() })
                .eq('id', currentUser.id);
        } catch (ignored) {}

        showBanner(t("msg.trialSuccess"), "success");
        sendDiscordAuditLog(
            "🎮 უფასო Trial აღებულია",
            `მომხმარებელმა **${username}** აიღო **${trialDays} დღიანი** უფასო საცდელი ვერსია.`,
            0x10b981,
            [
                { name: "👤 მომხმარებელი", value: username || "Unknown", inline: true },
                { name: "🆔 Discord ID", value: String(discordId || "N/A"), inline: true },
                { name: "გასაღები", value: key, inline: false },
                { name: "⏰ ხანგრძლივობა", value: `${trialDays} დღე`, inline: true },
                { name: "📝 რეფერალი", value: referrerName ? `კი (${referrerName})` : "არა", inline: true }
            ]
        );
        fetchUserLicenses();
    } catch (err) {
        console.error("Error claiming trial key:", err.message);
        showBanner(t("msg.keyCreateFail") + err.message, "error");
    } finally {
        if (claimTrialBtn) {
            claimTrialBtn.disabled = false;
            claimTrialBtn.textContent = t("dash.trialBtn");
        }
    }
}

// Process referral bonus if applicable
async function processReferralBonus(referredUsername) {
    const refDiscordId = localStorage.getItem('pulse_referral_discord_id');
    if (!refDiscordId) return null;

    try {
        // Find referrer's profile using discord_id
        const { data: referrerProfile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('discord_id', refDiscordId)
            .maybeSingle();

        if (profileError || !referrerProfile) {
            console.warn("Referrer profile not found or error:", profileError);
            return null;
        }

        const referrerUsername = referrerProfile.username;

        // Fetch referrer's licenses
        const { data: licenses, error: licError } = await supabaseClient
            .from('licenses')
            .select('*')
            .like('note', `%Buyer: ${referrerUsername}%`);

        if (licError) throw licError;

        // Find an active license to extend
        const activeLicense = licenses.find(l => l.is_active && (!l.expires_at || new Date(l.expires_at) > new Date()));
        
        if (activeLicense && activeLicense.expires_at) {
            // Extend by 3 days
            const currentExpiry = new Date(activeLicense.expires_at);
            const newExpiry = new Date(currentExpiry.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
            const currentNote = activeLicense.note || "";
            const newNote = currentNote + ` | Referral Bonus for inviting ${referredUsername}`;
            
            const { error: updateError } = await supabaseClient
                .from('licenses')
                .update({ 
                    expires_at: newExpiry,
                    note: newNote
                })
                .eq('id', activeLicense.id);
                
            if (updateError) throw updateError;
            console.log(`Extended active license for referrer ${referrerUsername} by 3 days.`);
        } else {
            // Create a new 3-day license for referrer
            const newKey = generateLicenseKey();
            const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
            const note = `Product: PulseClient | Buyer: ${referrerUsername} (by Referral Bonus for inviting ${referredUsername})`;
            
            const { error: insertError } = await supabaseClient
                .from('licenses')
                .insert({
                    license_key: newKey,
                    expires_at: expiresAt,
                    is_active: true,
                    note: note
                });
                
            if (insertError) throw insertError;
            console.log(`Created new 3-day referral license key for referrer ${referrerUsername}.`);
        }

        // Clean up localStorage after successful processing
        localStorage.removeItem('pulse_referral_discord_id');
        return referrerUsername;
    } catch (err) {
        console.error("Error processing referral bonus:", err.message);
        return null;
    }
}

function getDiscordId(user) {
    if (!user) return '';
    const meta = user.user_metadata || {};
    if (meta.provider_id) return String(meta.provider_id).trim();
    if (meta.sub && /^\d+$/.test(meta.sub)) return String(meta.sub).trim();
    if (user.identities && Array.isArray(user.identities)) {
        const discordIdentity = user.identities.find(i => i.provider === 'discord' || (i.identity_data && i.identity_data.provider_id));
        if (discordIdentity) {
            return String(discordIdentity.id || discordIdentity.identity_data?.provider_id || '').trim();
        }
        if (user.identities[0] && user.identities[0].id) {
            return String(user.identities[0].id).trim();
        }
    }
    return '';
}

// Generate a deterministic referral code from discordId (aligned 100% with backend Python logic)
function generateReferralCodeFromDiscordId(discordId) {
    if (!discordId) return '';
    let hash = 0;
    discordId = String(discordId).trim();
    for (let i = 0; i < discordId.length; i++) {
        const char = discordId.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit signed integer
    }
    // Match Python unsigned 32-bit conversion (h if h >= 0 else h + 0x100000000)
    if (hash < 0) {
        hash += 4294967296;
    }
    
    // Map to 7 characters using a 32-character alphabet (excludes confusing 0, O, 1, I)
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    let temp = hash;
    for (let i = 0; i < 7; i++) {
        code += alphabet.charAt(temp % alphabet.length);
        temp = Math.floor(temp / alphabet.length);
    }
    return code;
}

function generateOldReferralCodeFromDiscordId(discordId) {
    if (!discordId) return '';
    let hash = 0;
    discordId = String(discordId).trim();
    for (let i = 0; i < discordId.length; i++) {
        const char = discordId.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    hash = Math.abs(hash);
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    let temp = hash;
    for (let i = 0; i < 7; i++) {
        code += alphabet.charAt(temp % alphabet.length);
        temp = Math.floor(temp / alphabet.length);
    }
    return code;
}

// Redeem a referral code (7-character random format)
async function redeemReferralCode() {
    const codeInput = document.getElementById('referral-code-input');
    const submitBtn = document.getElementById('referral-code-submit-btn');
    if (!codeInput || !submitBtn) return;

    if (!currentUser) {
        showBanner(t("msg.loginFail") || "Please log in first", "error");
        return;
    }

    const code = codeInput.value.trim().toUpperCase();
    if (!code) return;

    // Validate format (7 characters, alphanumeric using our alphabet)
    if (code.length !== 7 || !/^[A-Z2-9]{7}$/.test(code)) {
        showBanner(t("msg.refCodeInvalid"), "error");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "⏳";

    const metadata = currentUser.user_metadata;
    const username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name;
    const discordId = getDiscordId(currentUser);

    let codeToSend = code;

    // Dual-algorithm referral resolution: check profiles table for old or new code match
    try {
        const { data: profiles } = await supabaseClient
            .from('profiles')
            .select('discord_id, username');

        if (profiles && profiles.length > 0) {
            const matchedReferrer = profiles.find(p => 
                generateReferralCodeFromDiscordId(p.discord_id) === code ||
                generateOldReferralCodeFromDiscordId(p.discord_id) === code
            );
            if (matchedReferrer) {
                codeToSend = generateReferralCodeFromDiscordId(matchedReferrer.discord_id);
                console.log("[Pulse AI Referral Debug] Dual-algorithm matched referrer:", matchedReferrer.username, "sending server code:", codeToSend);
            }
        }
    } catch (profileErr) {
        console.warn("[Pulse AI Referral Debug] Profile lookup warning:", profileErr.message);
    }

    try {
        // Call the backend endpoint — it uses the service_role key to bypass RLS
        const response = await fetch('https://errormissing-pulse-bot.hf.space/referral/redeem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: codeToSend, discord_id: String(discordId), username })
        });

        console.log("[Pulse AI Referral Debug] HTTP status:", response.status, "ok:", response.ok);
        const result = await response.json();
        console.log("[Pulse AI Referral Debug] Server result:", JSON.stringify(result));

        if (result.status === 'success') {
            showBanner(t("msg.refCodeSuccess") || result.message, "success");
            codeInput.value = '';
            // Clean up localStorage if it contained this referral
            localStorage.removeItem('pulse_referral_discord_id');
            fetchUserLicenses();
        } else {
            // Map known Georgian/backend messages to i18n keys if available
            const msg = result.message || '';
            if (msg.includes('საკუთარი კოდის')) showBanner(t("msg.refCodeSelf"), "error");
            else if (msg.includes('უკვე გამოიყენეთ')) showBanner(t("msg.refCodeAlreadyUsed") || msg, "error");
            else if (msg.includes('ვერ მოიძებნა')) showBanner(t("msg.refCodeNotFound"), "error");
            else showBanner(t("msg.refCodeFail") + msg, "error");
        }
    } catch (err) {
        console.error("[Pulse AI Referral Debug] CATCH error:", err);
        showBanner(t("msg.refCodeFail") + err.message, "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = t("msg.refCodeBtn") || "გააქტიურება";
    }
}

function showLicenseDetails(key) {
    const lic = adminLicenses.find(l => l.license_key === key);
    if (!lic) return;

    const { product, buyer, createdBy } = parseLicenseNote(lic.note);
    const { status, text: statusText } = getLicenseStatus(lic);

    modalKey.textContent = lic.license_key;
    modalBuyer.textContent = buyer;
    if (modalCreator) modalCreator.textContent = createdBy;
    modalStatus.textContent = statusText;
    modalStatus.className = `info-value admin-status ${status}`;
    modalCreated.textContent = new Date(lic.created_at).toLocaleString(getLocale());
    
    let expiryDisplay = t("status.lifetime");
    if (lic.expires_at) {
        if (typeof lic.expires_at === 'string' && lic.expires_at.startsWith("2000-01-01")) {
            expiryDisplay = t("status.notActivated");
        } else {
            const expDate = parseLicenseExpiryDate(lic.expires_at);
            if (expDate) {
                const now = new Date();
                if (expDate.getTime() <= now.getTime()) {
                    expiryDisplay = t("status.expiredShort");
                } else {
                    const diffTime = expDate.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    expiryDisplay = t("status.days", { n: diffDays });
                }
            }
        }
    }
    modalExpires.textContent = expiryDisplay;
    modalHwid.textContent = lic.hwid || t("status.notActivated");
    modalNote.textContent = lic.note || "-";

    const modalIpContainer = document.getElementById('modal-ip-container');
    const modalIp = document.getElementById('modal-ip');
    if (modalIpContainer && modalIp) {
        // Show IP container ONLY for owner
        if (isOwner()) {
            modalIpContainer.style.display = 'block';
            modalIp.textContent = "იტვირთება...";

            (async () => {
                let foundIp = null;

                // 1. Check in-memory adminSessions
                if (typeof adminSessions !== 'undefined' && adminSessions.length > 0) {
                    const s = adminSessions.find(x => x.license_key === lic.license_key || (lic.hwid && x.hwid === lic.hwid));
                    if (s && s.ip_address && s.ip_address !== 'Hidden' && s.ip_address !== 'Unknown') {
                        foundIp = s.ip_address;
                    }
                }

                // 2. Fetch directly from client_sessions by license key
                if (!foundIp) {
                    try {
                        const res = await fetch(`${supabaseUrl}/rest/v1/client_sessions?license_key=eq.${encodeURIComponent(lic.license_key)}&order=last_heartbeat.desc&limit=1`, {
                            headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
                        });
                        if (res.ok) {
                            const sessions = await res.json();
                            if (sessions && sessions.length > 0 && sessions[0].ip_address && sessions[0].ip_address !== 'Hidden' && sessions[0].ip_address !== 'Unknown') {
                                foundIp = sessions[0].ip_address;
                            }
                        }
                    } catch (e) {
                        console.warn("Error fetching session IP by key:", e);
                    }
                }

                // 3. Fetch directly from client_sessions by HWID
                if (!foundIp && lic.hwid && lic.hwid !== 'null') {
                    try {
                        const res2 = await fetch(`${supabaseUrl}/rest/v1/client_sessions?hwid=eq.${encodeURIComponent(lic.hwid)}&order=last_heartbeat.desc&limit=1`, {
                            headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
                        });
                        if (res2.ok) {
                            const sessions2 = await res2.json();
                            if (sessions2 && sessions2.length > 0 && sessions2[0].ip_address && sessions2[0].ip_address !== 'Hidden' && sessions2[0].ip_address !== 'Unknown') {
                                foundIp = sessions2[0].ip_address;
                            }
                        }
                    } catch (e2) {
                        console.warn("Error fetching session IP by hwid:", e2);
                    }
                }

                // 4. Fallback to profiles table match
                if (!foundIp && buyer) {
                    const matchedProfile = allUserProfiles.find(p => p.username === buyer);
                    if (matchedProfile && matchedProfile.last_ip) {
                        foundIp = matchedProfile.last_ip;
                    }
                }

                modalIp.textContent = foundIp || "N/A (არ არის ჩაწერილი)";
            })();
        } else {
            modalIpContainer.style.display = 'none';
        }
    }

    licenseInfoModal.classList.remove('hidden');
}

function closeLicenseModal() {
    licenseInfoModal.classList.add('hidden');
}

// Attach functions to window scope for onclick handlers in dynamically generated HTML
window.showLicenseDetails = showLicenseDetails;
window.resetLicenseHwid = resetLicenseHwid;
window.resetUserHwid = resetUserHwid;
window.revokeLicense = revokeLicense;
window.activateLicense = activateLicense;
window.closeLicenseModal = closeLicenseModal;
window.copyCreatedKey = copyCreatedKey;
window.filterAdminLicenses = filterAdminLicenses;

// User Profiles sync and dropdown logic
async function fetchLatestProfile(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        if (error) throw error;
        if (data) {
            const did = data.discord_id || (currentUser ? getDiscordId(currentUser) : null);
            const cleanedAvatar = cleanAvatarUrl(data.avatar_url, did);
            if (navAvatar) {
                navAvatar.setAttribute('data-discord-id', did || '');
                navAvatar.src = cleanedAvatar;
            }
            if (dashAvatar) {
                dashAvatar.setAttribute('data-discord-id', did || '');
                dashAvatar.src = cleanedAvatar;
            }
            if (did) {
                fetchLiveDiscordAvatar(did);
            }
        }
    } catch (err) {
        console.warn("Failed to fetch latest profile:", err.message);
    }
}

function getDeviceInfo() {
    try {
        const ua = navigator.userAgent || "";
        let os = "Unknown OS";
        if (ua.indexOf("Win") !== -1) os = "Windows";
        else if (ua.indexOf("Mac") !== -1 && ua.indexOf("iPhone") === -1 && ua.indexOf("iPad") === -1) os = "macOS";
        else if (ua.indexOf("Android") !== -1) os = "Android";
        else if (ua.indexOf("iPhone") !== -1 || ua.indexOf("iPad") !== -1) os = "iOS";
        else if (ua.indexOf("Linux") !== -1) os = "Linux";

        let browser = "Unknown Browser";
        if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
        else if (ua.indexOf("Opera") !== -1 || ua.indexOf("OPR") !== -1) browser = "Opera";
        else if (ua.indexOf("Edge") !== -1 || ua.indexOf("Edg") !== -1) browser = "Edge";
        else if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
        else if (ua.indexOf("Safari") !== -1) browser = "Safari";

        return `${browser} (${os})`;
    } catch (e) {
        return "Unknown";
    }
}

// Silent Download Tracking (Stores count and timestamp in Supabase profiles)
async function trackUserDownload() {
    if (!currentUser) return;
    try {
        const { data: prof } = await supabaseClient
            .from('profiles')
            .select('download_count')
            .eq('id', currentUser.id)
            .maybeSingle();

        const currentCount = (prof && typeof prof.download_count === 'number') ? prof.download_count : 0;
        await supabaseClient
            .from('profiles')
            .update({
                download_count: currentCount + 1,
                last_downloaded_at: new Date().toISOString()
            })
            .eq('id', currentUser.id);
    } catch (e) {
        // Silently skip if table/column does not exist
    }
}

// User Profiles sync and metadata tracking (Silently stored in Supabase profiles table)
async function saveUserProfile(user) {
    const metadata = user.user_metadata || {};
    const username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name;
    const discordId = getDiscordId(user);
    const avatar = cleanAvatarUrl(metadata.avatar_url, discordId);

    if (!username) return;

    // Trigger background live Discord avatar lookup
    if (discordId) {
        fetchLiveDiscordAvatar(discordId).then(liveUrl => {
            if (liveUrl && liveUrl !== avatar) {
                supabaseClient.from('profiles').update({ avatar_url: liveUrl, updated_at: new Date().toISOString() }).eq('id', user.id);
            }
        }).catch(() => {});
    }

    let userIp = null;
    try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        if (ipRes.ok) {
            const ipData = await ipRes.json();
            userIp = ipData.ip;
        }
    } catch (e) {
        console.warn("Could not determine client IP:", e);
    }

    let existingProfile = null;
    try {
        const { data } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
        existingProfile = data;
    } catch (err) {
        console.warn("Could not fetch existing profile:", err);
    }

    const currentLoginCount = (existingProfile && typeof existingProfile.login_count === 'number') 
        ? existingProfile.login_count + 1 
        : 1;
    const currentLang = window.currentLang || localStorage.getItem('pulse_lang') || 'ka';
    const refCode = localStorage.getItem('pulse_referral_code') || localStorage.getItem('pulse_referral_discord_id') || (existingProfile ? existingProfile.referred_by : null);

    const payload = {
        id: user.id,
        discord_id: String(discordId),
        username: username,
        avatar_url: avatar,
        updated_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        login_count: currentLoginCount,
        device_info: getDeviceInfo(),
        preferred_language: currentLang
    };

    if (userIp) payload.last_ip = userIp;
    if (refCode) payload.referred_by = refCode;

    // Resilient upsert that strips unsupported schema columns if table doesn't have them yet
    let activePayload = { ...payload };
    for (let attempt = 0; attempt < 6; attempt++) {
        const { error } = await supabaseClient
            .from('profiles')
            .upsert(activePayload, { onConflict: 'id' });

        if (!error) break;

        const missingMatch = error.message && error.message.match(/Could not find the '([^']+)' column/);
        if (missingMatch && missingMatch[1] && activePayload.hasOwnProperty(missingMatch[1])) {
            delete activePayload[missingMatch[1]];
            continue;
        } else if (error.message && error.message.includes('last_ip') && activePayload.last_ip) {
            delete activePayload.last_ip;
            continue;
        } else {
            console.warn("Profiles upsert warning:", error.message);
            break;
        }
    }
}

async function fetchProfilesForAdmin() {
    if (!isAdmin()) return;

    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*&order=username.asc`, {
            headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error(await res.text());
        allUserProfiles = await res.json();
        renderDropdownUsers(allUserProfiles);
        updateAdminKpiStats();
    } catch (err) {
        console.error("Error fetching profiles:", err.message);
    }
}

function renderDropdownUsers(profiles) {
    if (!adminUserOptionsList) return;
    adminUserOptionsList.innerHTML = '';
    
    if (profiles.length === 0) {
        adminUserOptionsList.innerHTML = `<div style="padding: 10px; text-align: center; color: var(--text-muted); font-size: 13px;">${t("msg.noUsers")}</div>`;
        return;
    }

    profiles.forEach(profile => {
        const option = document.createElement('div');
        option.className = 'user-option';
        const did = profile.discord_id || '';
        const initialAvatar = cleanAvatarUrl(profile.avatar_url, did);
        option.innerHTML = `
            <img src="${initialAvatar}" alt="Avatar" data-discord-id="${did}" onerror="handleAvatarError(this, '${did}')">
            <div class="user-option-text">
                <span class="user-name">${profile.username}</span>
                <span class="user-discord-id">@${profile.username}</span>
            </div>
        `;
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            selectDropdownUser(profile.username);
        });
        adminUserOptionsList.appendChild(option);

        // Fetch live avatar in real-time
        if (did) {
            fetchLiveDiscordAvatar(did);
        }
    });
}

function selectDropdownUser(username) {
    const profile = allUserProfiles.find(p => p.username === username);
    if (!profile) return;

    adminBuyerInput.value = profile.username;
    
    // Update trigger UI text
    if (adminUserSelectTrigger) {
        const did = profile.discord_id || '';
        const initialAvatar = cleanAvatarUrl(profile.avatar_url, did);
        adminUserSelectTrigger.querySelector('span').innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <img src="${initialAvatar}" data-discord-id="${did}" style="width: 20px; height: 20px; border-radius: 50%;" onerror="handleAvatarError(this, '${did}')">
                <span>${profile.username}</span>
            </div>
        `;
        if (did) fetchLiveDiscordAvatar(did);
    }
    
    closeUserSelectionModal();
}

function filterDropdownUsers() {
    const searchInput = document.getElementById('admin-modal-user-search');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const filtered = allUserProfiles.filter(p => 
        p.username.toLowerCase().includes(query) ||
        (p.discord_id && p.discord_id.toLowerCase().includes(query))
    );
    renderDropdownUsers(filtered);
}

async function openUserSelectionModal(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('user-selection-modal');
    if (!modal) return;

    if (allUserProfiles.length === 0) {
        await fetchProfilesForAdmin();
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    const searchInput = document.getElementById('admin-modal-user-search');
    if (searchInput) {
        searchInput.value = '';
        setTimeout(() => searchInput.focus(), 100);
    }
    renderDropdownUsers(allUserProfiles);
}

function closeUserSelectionModal() {
    const modal = document.getElementById('user-selection-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

window.filterDropdownUsers = filterDropdownUsers;
window.openUserSelectionModal = openUserSelectionModal;
window.closeUserSelectionModal = closeUserSelectionModal;

// ==========================================
// BLACKLIST & BANS SYSTEM
// ==========================================

let adminBlacklist = [];

async function checkUserBlacklist(user) {
    if (!user) return null;
    try {
        const discordId = getDiscordId(user);
        let userIp = null;
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            if (ipRes.ok) {
                const ipData = await ipRes.json();
                userIp = ipData.ip;
            }
        } catch (ignored) {}

        const filters = [];
        if (discordId) filters.push(`value.eq.${discordId}`);
        if (userIp) filters.push(`value.eq.${userIp}`);

        if (filters.length === 0) return null;

        const { data, error } = await supabaseClient
            .from('blacklist')
            .select('*')
            .or(filters.join(','))
            .limit(1);

        if (!error && data && data.length > 0) {
            return data[0];
        }
    } catch (e) {
        console.warn("Blacklist check skipped:", e);
    }
    return null;
}

function handleUserBanEnforcement(ban) {
    const bannedPage = document.getElementById('banned-page');
    const banReasonText = document.getElementById('ban-reason-text');
    if (banReasonText && ban.reason) {
        banReasonText.textContent = ban.reason;
    }
    if (bannedPage) {
        bannedPage.classList.remove('hidden');
    }
    if (landingPage) landingPage.classList.add('hidden');
    if (dashboardPage) dashboardPage.classList.add('hidden');
    if (authGatePage) authGatePage.classList.add('hidden');
    if (navLinks) navLinks.classList.add('hidden');
    if (navUserProfile) navUserProfile.classList.add('hidden');
    
    // Sign out
    supabaseClient.auth.signOut();
}

async function fetchBlacklistEntries() {
    if (!isAdmin()) return;
    const tableBody = document.getElementById('admin-blacklist-table-body');
    if (!tableBody) return;

    try {
        const { data, error } = await supabaseClient
            .from('blacklist')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        adminBlacklist = data || [];
        renderBlacklistEntries(adminBlacklist);
        updateAdminKpiStats();
    } catch (e) {
        console.warn("Failed to fetch blacklist:", e.message);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">შავი სია ცარიელია ან ცხრილი არ არსებობს</td></tr>`;
    }
}

function renderBlacklistEntries(entries) {
    const tableBody = document.getElementById('admin-blacklist-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (!entries || entries.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">დაბლოკილი ჩანაწერები არ მოიძებნა</td></tr>`;
        return;
    }

    entries.forEach(item => {
        let badgeClass = 'type-ip';
        let typeName = 'IP მისამართი';
        if (item.type === 'discord_id') { badgeClass = 'type-discord'; typeName = 'Discord ID'; }
        else if (item.type === 'hwid') { badgeClass = 'type-hwid'; typeName = 'HWID'; }

        const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('ka-GE') : 'N/A';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="ban-badge ${badgeClass}">${typeName}</span></td>
            <td><code style="font-size: 12px; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;">${item.value}</code></td>
            <td style="color: #fca5a5; font-size: 13px;">${item.reason || 'წესების დარღვევა'}</td>
            <td style="font-size: 12px; color: var(--text-muted);">${dateStr}</td>
            <td style="text-align: right;">
                <button type="button" onclick="handleRemoveBan('${item.id}')" class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px; color: #4ade80; border-color: rgba(34, 197, 94, 0.3);">
                    განბლოკვა
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function handleAddBan(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!isAdmin()) return;

    const type = document.getElementById('admin-ban-type').value;
    const value = document.getElementById('admin-ban-value').value.trim();
    const reason = document.getElementById('admin-ban-reason').value.trim() || 'Terms of Service Violation';

    if (!value) return;

    try {
        const { error } = await supabaseClient
            .from('blacklist')
            .insert({
                type: type,
                value: value,
                reason: reason,
                banned_by: currentUser ? (currentUser.user_metadata?.user_name || 'Admin') : 'Admin'
            });

        if (error) throw error;
        showBanner("მომხმარებელი წარმატებით დაიბლოკა!", "success");
        document.getElementById('admin-ban-value').value = '';
        document.getElementById('admin-ban-reason').value = '';
        fetchBlacklistEntries();
    } catch (err) {
        showBanner("ბლოკირების შეცდომა: " + err.message, "error");
    }
}

async function handleRemoveBan(id) {
    if (!isAdmin()) return;
    try {
        const { error } = await supabaseClient
            .from('blacklist')
            .delete()
            .eq('id', id);

        if (error) throw error;
        showBanner("ბლოკი მოხსნილია!", "success");
        fetchBlacklistEntries();
    } catch (err) {
        showBanner("განბლოკვის შეცდომა: " + err.message, "error");
    }
}

window.handleAddBan = handleAddBan;
window.handleRemoveBan = handleRemoveBan;
window.fetchBlacklistEntries = fetchBlacklistEntries;

// ==========================================
// ADMIN SUB-TABS & KPI STATS
// ==========================================

function switchAdminSubTab(e, panelId) {
    if (e && e.preventDefault) e.preventDefault();
    if (!panelId) panelId = 'admin-subpanel-licenses';

    localStorage.setItem('pulse_admin_subtab', panelId);

    // Remove active class from all subtab buttons
    document.querySelectorAll('.admin-subtab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked or matching button
    const targetBtn = (e && e.currentTarget) || document.querySelector(`[onclick*="${panelId}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }

    // Hide all admin subpanels
    document.querySelectorAll('.admin-subpanel').forEach(panel => panel.classList.add('hidden'));

    // Show target panel
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
        targetPanel.classList.remove('hidden');
    }

    // Refresh specific panel data
    if (panelId === 'admin-subpanel-sessions') {
        fetchActiveSessions();
    } else if (panelId === 'admin-subpanel-blacklist') {
        fetchBlacklistEntries();
    } else if (panelId === 'admin-subpanel-promos') {
        fetchAdminPromocodes();
    } else if (panelId === 'admin-subpanel-licenses') {
        fetchAllLicenses();
    }
}
window.switchAdminSubTab = switchAdminSubTab;
window.fetchPromocodes = fetchAdminPromocodes;

async function extendLicenseDays(key, days) {
    if (!isAdmin()) return;
    try {
        const lic = adminLicenses.find(l => l.license_key === key);
        if (!lic) return;

        let baseDate = new Date();
        if (lic.expires_at && !lic.expires_at.startsWith("2000-01-01") && new Date(lic.expires_at) > baseDate) {
            baseDate = new Date(lic.expires_at);
        }

        const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

        const { error } = await supabaseClient
            .from('licenses')
            .update({ expires_at: newExpiry, is_active: true })
            .eq('license_key', key);

        if (error) throw error;
        showBanner(`ლიცენზიას წარმატებით დაემატა +${days} დღე!`, "success");
        await fetchAdminLicenses();
        updateAdminKpiStats();
    } catch (err) {
        showBanner("შეცდომა ვადის გაგრძელებისას: " + err.message, "error");
    }
}
window.extendLicenseDays = extendLicenseDays;

function updateAdminKpiStats() {
    const onlineEl = document.getElementById('admin-stat-online');
    const licensesEl = document.getElementById('admin-stat-licenses');
    const usersEl = document.getElementById('admin-stat-users');
    const bansEl = document.getElementById('admin-stat-bans');

    if (onlineEl) {
        onlineEl.textContent = activeOnlineUsersCount.toString();
    }
    if (licensesEl && adminLicenses && adminLicenses.length > 0) {
        const activeCount = adminLicenses.filter(l => getLicenseStatus(l).status === 'active').length;
        licensesEl.textContent = activeCount.toString();
    }
    if (usersEl && allUserProfiles && allUserProfiles.length > 0) {
        usersEl.textContent = allUserProfiles.length.toString();
    }
    if (bansEl && adminBlacklist) {
        bansEl.textContent = adminBlacklist.length.toString();
    }
}
window.updateAdminKpiStats = updateAdminKpiStats;

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
    try {
        if (typeof applyPricingNumbers === "function") applyPricingNumbers();
    } catch (err) {
        console.warn("applyPricingNumbers failed:", err);
    }
}

// Auto-refresh active sessions and telemetry every 20 seconds for real-time online count
setInterval(() => {
    if (typeof isAdmin === "function" && isAdmin() && currentUser) {
        fetchActiveSessions();
    }
}, 20000);

window.onLanguageChanged = onLanguageChanged;

// ==========================================
// PROMOCODE FUNCTIONS
// ==========================================

async function redeemPromoCode(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!currentUser) {
        showBanner(t("msg.loginFail") + "Please log in first", "error");
        return;
    }

    const promoInput = document.getElementById('promo-code-input');
    const submitBtn = document.getElementById('promo-submit-btn');
    const code = promoInput.value.trim().toUpperCase();

    if (!code) return;

    submitBtn.disabled = true;
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = t("msg.bindLoading");

    const metadata = currentUser.user_metadata;
    const username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name;
    const discordId = metadata.provider_id || (currentUser.identities && currentUser.identities[0]?.id);

    try {
        // 1. Fetch promocode details
        const { data: promo, error: promoError } = await supabaseClient
            .from('promocodes')
            .select('*')
            .eq('code', code)
            .eq('is_active', true)
            .maybeSingle();

        if (promoError) throw promoError;

        if (!promo) {
            showBanner(t("msg.promoNotFound"), "error");
            return;
        }

        // 2. Check if user already redeemed this code
        const { data: existingRedemption, error: redError } = await supabaseClient
            .from('promocode_redemptions')
            .select('*')
            .eq('code', code)
            .eq('user_id', currentUser.id)
            .maybeSingle();

        if (redError) throw redError;

        if (existingRedemption) {
            showBanner(t("msg.promoAlreadyUsed"), "error");
            return;
        }

        // 3. Check usage limit
        if (promo.max_uses !== null) {
            const { count, error: countError } = await supabaseClient
                .from('promocode_redemptions')
                .select('*', { count: 'exact', head: true })
                .eq('code', code);

            if (countError) throw countError;

            if (count >= promo.max_uses) {
                showBanner(t("msg.promoExpired"), "error");
                return;
            }
        }

        // 4. Check if user already has an active license to extend
        const { data: userLicenses, error: licFetchError } = await supabaseClient
            .from('licenses')
            .select('*')
            .like('note', `%Buyer: ${username}%`);

        if (licFetchError) throw licFetchError;

        const activeLicense = userLicenses ? userLicenses.find(l => l.is_active && (!l.expires_at || new Date(l.expires_at) > new Date())) : null;

        if (activeLicense) {
            // Extend active license
            let newExpiry = null;
            if (activeLicense.expires_at) {
                const currentExpiry = new Date(activeLicense.expires_at);
                const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
                newExpiry = new Date(baseDate.getTime() + promo.duration_days * 24 * 60 * 60 * 1000).toISOString();
            }

            const currentNote = activeLicense.note || "";
            const newNote = currentNote + ` | Promocode: ${code}`;

            const { error: updateLicError } = await supabaseClient
                .from('licenses')
                .update({
                    expires_at: newExpiry,
                    note: newNote
                })
                .eq('id', activeLicense.id);

            if (updateLicError) throw updateLicError;
        } else {
            // Create a new license key
            const key = generateLicenseKey();
            const expiresAt = new Date(Date.now() + promo.duration_days * 24 * 60 * 60 * 1000).toISOString();
            const note = `Product: PulseClient | Buyer: ${username} | DiscordID: ${discordId} (by Promocode: ${code})`;

            const { error: insertLicError } = await supabaseClient
                .from('licenses')
                .insert({
                    license_key: key,
                    expires_at: expiresAt,
                    is_active: true,
                    note: note
                });

            if (insertLicError) throw insertLicError;
        }

        // 5. Save redemption
        const { error: insertRedError } = await supabaseClient
            .from('promocode_redemptions')
            .insert({
                code: code,
                user_id: currentUser.id,
                username: username
            });

        if (insertRedError) throw insertRedError;

        showBanner(t("msg.promoRedeemed", { n: promo.duration_days }), "success");
        sendDiscordAuditLog(
            " პრომოკოდი გამოყენებულია",
            `მომხმარებელმა **${username}** გამოიყენა პრომოკოდი **${code}**.`,
            0xa855f7,
            [
                { name: "👤 მომხმარებელი", value: username || "Unknown", inline: true },
                { name: "🎟️ კოდი", value: code, inline: true },
                { name: "⏰ დამატებული", value: `${promo.duration_days} დღე`, inline: true }
            ]
        );
        promoInput.value = '';
        fetchUserLicenses();
    } catch (err) {
        console.error("Promocode redemption failed:", err.message);
        showBanner(t("msg.promoRedeemFail") + err.message, "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}
window.redeemPromoCode = redeemPromoCode;

async function createPromoCodeFromAdmin(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!isAdmin()) return;

    const codeInput = document.getElementById('admin-promo-code-input');
    const daysInput = document.getElementById('admin-promo-days-input');
    const usesInput = document.getElementById('admin-promo-uses-input');
    const createBtn = document.getElementById('admin-promo-create-btn');

    const code = codeInput.value.trim().toUpperCase();
    const durationDays = parseInt(daysInput.value, 10);
    const maxUsesVal = usesInput.value.trim();
    const maxUses = maxUsesVal !== "" ? parseInt(maxUsesVal, 10) : null;

    if (!code || isNaN(durationDays) || durationDays < 1) return;

    createBtn.disabled = true;
    const origBtnText = createBtn.textContent;
    createBtn.textContent = t("msg.creating");

    const adminMetadata = currentUser.user_metadata;
    const adminName = adminMetadata.user_name || adminMetadata.custom_claims?.username || adminMetadata.full_name || "Admin";

    try {
        const { error } = await supabaseClient
            .from('promocodes')
            .insert({
                code: code,
                duration_days: durationDays,
                max_uses: maxUses,
                is_active: true,
                created_by: adminName
            });

        if (error) throw error;

        showBanner(t("msg.promoCreated"), "success");
        codeInput.value = '';
        daysInput.value = '';
        usesInput.value = '';

        fetchAdminPromocodes();
    } catch (err) {
        console.error("Error creating promocode:", err.message);
        showBanner(t("msg.promoCreateFail") + err.message, "error");
    } finally {
        createBtn.disabled = false;
        createBtn.textContent = origBtnText;
    }
}
window.createPromoCodeFromAdmin = createPromoCodeFromAdmin;

async function fetchAdminPromocodes() {
    if (!isAdmin()) return;

    try {
        // 1. Fetch promocodes
        const { data: promocodes, error: promoError } = await supabaseClient
            .from('promocodes')
            .select('*')
            .order('created_at', { ascending: false });

        if (promoError) throw promoError;

        // 2. Fetch redemptions
        const { data: redemptions, error: redError } = await supabaseClient
            .from('promocode_redemptions')
            .select('*')
            .order('redeemed_at', { ascending: false });

        if (redError) throw redError;

        renderAdminPromocodes(promocodes || [], redemptions || []);
    } catch (err) {
        console.error("Error fetching admin promocode data:", err.message);
    }
}
window.fetchAdminPromocodes = fetchAdminPromocodes;

function renderAdminPromocodes(promocodes, redemptions) {
    const promosBody = document.getElementById('admin-promos-table-body');
    const redemptionsBody = document.getElementById('admin-promo-redemptions-table-body');

    if (promosBody) {
        promosBody.innerHTML = '';
        if (promocodes.length === 0) {
            promosBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">No promocodes found</td></tr>`;
        } else {
            promocodes.forEach(p => {
                const codeRedemptions = redemptions.filter(r => r.code === p.code);
                const count = codeRedemptions.length;
                const limitDisplay = p.max_uses !== null ? p.max_uses : 'âˆž';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><span class="promo-code-badge">${p.code}</span></td>
                    <td>${t("status.days", { n: p.duration_days })}</td>
                    <td>${count} / ${limitDisplay}</td>
                    <td>${p.created_by || "Admin"}</td>
                    <td>
                        <div class="admin-actions">
                            <button type="button" class="btn-action btn-revoke" onclick="deletePromocode('${p.code}')" title="${t('admin.actionRevoke')}" aria-label="${t('admin.actionRevoke')}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </td>
                `;
                promosBody.appendChild(tr);
            });
        }
    }

    if (redemptionsBody) {
        redemptionsBody.innerHTML = '';
        if (redemptions.length === 0) {
            redemptionsBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 24px;">No redemptions found</td></tr>`;
        } else {
            redemptions.forEach(r => {
                const tr = document.createElement('tr');
                const timestamp = new Date(r.redeemed_at).toLocaleString(getLocale());
                tr.innerHTML = `
                    <td><span class="promo-code-badge">${r.code}</span></td>
                    <td><strong>${r.username}</strong></td>
                    <td style="color: var(--text-muted);">${timestamp}</td>
                `;
                redemptionsBody.appendChild(tr);
            });
        }
    }
}
window.renderAdminPromocodes = renderAdminPromocodes;

async function deletePromocode(code) {
    if (!isAdmin()) return;
    const confirmed = await showCustomConfirm(t("confirm.title"), "Delete promocode " + code + "?");
    if (!confirmed) return;

    try {
        const { error } = await supabaseClient
            .from('promocodes')
            .delete()
            .eq('code', code);

        if (error) throw error;

        showBanner("Promocode deleted successfully", "success");
        fetchAdminPromocodes();
    } catch (err) {
        console.error("Error deleting promocode:", err.message);
        showBanner("Delete failed: " + err.message, "error");
    }
}
window.deletePromocode = deletePromocode;

// ==========================================
// PULSE AI ASSISTANT ENGINE
// ==========================================

function togglePulseAIChat() {
    const win = document.getElementById('pulse-ai-chat-window');
    if (!win) return;
    win.classList.toggle('hidden');
    if (!win.classList.contains('hidden')) {
        const input = document.getElementById('pulse-ai-input');
        if (input) input.focus();
        scrollPulseAIMessages();
    }
}
window.togglePulseAIChat = togglePulseAIChat;

function scrollPulseAIMessages() {
    const area = document.getElementById('pulse-ai-messages');
    if (area) {
        area.scrollTop = area.scrollHeight;
    }
}

function askPulseAIQuick(questionText) {
    const input = document.getElementById('pulse-ai-input');
    if (input) {
        input.value = questionText;
        handlePulseAISubmit(new Event('submit'));
    }
}
window.askPulseAIQuick = askPulseAIQuick;

function escapePulseHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

function handlePulseAISubmit(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('pulse-ai-input');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    // Append User Message
    appendPulseAIMessage('user', escapePulseHTML(query));
    input.value = '';

    // Show Typing indicator / response
    setTimeout(() => {
        const reply = generatePulseAIResponse(query);
        appendPulseAIMessage('bot', reply);
    }, 350);
}
window.handlePulseAISubmit = handlePulseAISubmit;

function appendPulseAIMessage(sender, text) {
    const area = document.getElementById('pulse-ai-messages');
    if (!area) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `pulse-ai-msg ${sender}`;
    msgDiv.innerHTML = `<div class="pulse-ai-msg-bubble">${text}</div>`;
    area.appendChild(msgDiv);
    scrollPulseAIMessages();
}

function generatePulseAIResponse(input) {
    const lower = input.toLowerCase().trim();
    const isGeorgian = /[\u10A0-\u10FF]/.test(input);

    const hasAny = (keywords) => keywords.some(k => lower.includes(k));

    // 1. Greetings / Conversational
    if (hasAny(['გამარჯობა', 'სალამი', 'ზდაროვა', 'გამარჯობათ', 'hello', 'hi', 'hey', 'sup', 'yo', 'როგორ ხარ', 'როგორ ხართ'])) {
        if (isGeorgian) {
            return "გამარჯობა! 👋 მე ვარ <strong>Pulse AI</strong>, PulseClient-ის ოფიციალური ასისტენტი. რით შემიძლია დაგეხმარო?<br><br>• კლიენტის ჩამოტვირთვა & ინსტალაცია<br>• მენიუს ღილაკები (F12 / Shift)<br>• შეძენა & ლიცენზია<br>• HWID და პრობლემების მოგვარება";
        }
        return "Hello! 👋 I am <strong>Pulse AI</strong>, the official PulseClient support bot. How can I help you today?<br><br>• Client Download & Installation<br>• Keybinds (F12 / Shift)<br>• Purchase & Licensing<br>• HWID & Troubleshooting";
    }

    // 2. Identity / Capabilities
    if (hasAny(['ვინ ხარ', 'რა ხარ', 'რა შეგიძლია', 'who are you', 'what are you', 'what can you do'])) {
        if (isGeorgian) {
            return "მე ვარ <strong>Pulse AI</strong> — ხელოვნური ინტელექტის ასისტენტი. შემიძლია პასუხი გავცე შენს ნებისმიერ კითხვას PulseClient-ის, ინსტალაციის, ღილაკების, ლიცენზიის, ანტიკლიენტის შემოვლებისა და ხარვეზების შესახებ!";
        }
        return "I am <strong>Pulse AI</strong> — an AI support assistant for PulseClient. I can help answer questions about installation, keybinds, license key management, bypasses, and troubleshooting!";
    }

    // 3. Keybinds & Menu Triggers
    if (hasAny(['f12', 'shift', 'right shift', 'ღილაკ', 'მენიუ', 'გახსნა', 'როგორ გავხსნა', 'keybind', 'bind', 'menu', 'open', 'controls', 'რომელი ღილაკით'])) {
        if (isGeorgian) {
            return "⌨️ <strong>PulseClient მენიუს ღილაკები:</strong><br>• <strong>Pulse PvP Client:</strong> მენიუ იხსნება <strong>F12</strong> ღილაკით (ოპტიმიზირებული FPS, Kill Trigger, Watermark fix).<br>• <strong>Pulse Base Find:</strong> მენიუ იხსნება <strong>Right Shift</strong> (მარჯვენა Shift) ღილაკით (Matrix/GrimAC bypass).";
        }
        return "⌨️ <strong>PulseClient Keybinds:</strong><br>• <strong>Pulse PvP Client:</strong> Menu opens with <strong>F12</strong> (Optimized FPS, Kill Trigger).<br>• <strong>Pulse Base Find:</strong> Menu opens with <strong>Right Shift</strong> (Matrix/GrimAC bypass).";
    }

    // 4. Installation & Mods folder
    if (hasAny(['ინსტალაც', 'დაყენებ', 'ჩაგდება', 'როგორ ჩავაგდო', 'სად ჩავაგდო', 'install', 'setup', 'mods', 'folder', 'fabric', 'jar'])) {
        if (isGeorgian) {
            return "💡 <strong>ინსტალაციის ნაბიჯები:</strong><br>1. ჩამოტვირთეთ `.jar` ფაილი საიტიდან (PvP ან Base Find).<br>2. გახსენით `%appdata%/.minecraft/mods` საქაღალდე.<br>3. ჩააგდეთ ნასროლი `.jar` ფაილი მოდების საქაღალდეში.<br>4. ჩართეთ Minecraft <strong>Fabric 1.21.11</strong> პროფილით (Java 21-ით).";
        }
        return "💡 <strong>Installation Steps:</strong><br>1. Download the `.jar` file from our website.<br>2. Open `%appdata%/.minecraft/mods` folder.<br>3. Drop the downloaded `.jar` file into the mods directory.<br>4. Launch Minecraft using <strong>Fabric 1.21.11</strong> (Java 21 required).";
    }

    // 5. Version & Java Requirements
    if (hasAny(['1.21', '1.21.11', 'ვერსია', 'version', 'java', 'java 21', 'java21'])) {
        if (isGeorgian) {
            return "<strong>ვერსია და მოთხოვნები:</strong><br>• Minecraft ვერსია: <strong>1.21.11</strong><br>• Mod Loader: <strong>Fabric Loader</strong> (0.16.0+)<br>• Java ვერსია: <strong>Java 21</strong> (რეკომენდებულია Temurin Java 21 ან Oracle Java 21).";
        }
        return "<strong>Versions & Requirements:</strong><br>• Minecraft Version: <strong>1.21.11</strong><br>• Mod Loader: <strong>Fabric Loader</strong> (0.16.0+)<br>• Java Version: <strong>Java 21</strong> (Temurin/Oracle Java 21 recommended).";
    }

    // 6. Launchers Compatibility
    if (hasAny(['tlauncher', 'lunar', 'feather', 'prism', 'curseforge', 'modrinth', 'official launcher', 'ლაუნჩერ', 'launcher'])) {
        if (isGeorgian) {
            return " <strong>თავსებადი ლაუნჩერები:</strong><br>PulseClient მუშაობს თითქმის ყველა ლაუნჩერზე, სადაც Fabric 1.21.11-ის ჩართვა შეიძლება:<br>• TLauncher (აირჩიეთ Fabric 1.21.11)<br>• Prism Launcher / MultiMC<br>• Feather Launcher<br>• Lunar Client (Fabric-ის მოდულით)<br>• ოფიციალური Minecraft Launcher.";
        }
        return " <strong>Compatible Launchers:</strong><br>PulseClient works with any launcher supporting Fabric 1.21.11:<br>• TLauncher (Select Fabric 1.21.11)<br>• Prism Launcher / MultiMC<br>• Feather Launcher<br>• Official Minecraft Launcher";
    }

    // 7. PvP vs Base Finder differences
    if (hasAny(['განსხვავება', 'სხვაობა', 'pvp', 'basefind', 'base finder', 'difference', 'which one', 'რომელი გადმოვწერო'])) {
        if (isGeorgian) {
            return "⚖️ <strong>რომელი ვერსია ავირჩიო?</strong><br>• <strong>Pulse PvP Client:</strong> საუკეთესოა PvP ბრძოლებისთვის, გაზრდილი FPS, Kill Trigger, OpSec უსაფრთხოება. (იხსნება <strong>F12</strong>-ით).<br>• <strong>Pulse Base Find:</strong> სპეციალურად ბაზების საპოვნელად და სათვალთვალოდ, Matrix & GrimAC შემოვლით. (იხსნება <strong>Right Shift</strong>-ით).";
        }
        return "⚖️ <strong>Which version to pick?</strong><br>• <strong>Pulse PvP Client:</strong> Best for combat, max FPS, Kill Trigger & OpSec (Opens with <strong>F12</strong>).<br>• <strong>Pulse Base Find:</strong> Built for base tracking with Matrix & GrimAC bypasses (Opens with <strong>Right Shift</strong>).";
    }

    // 8. Purchasing & Price
    if (hasAny(['ყიდვა', 'ყიდვ', 'ფასი', 'ღირს', 'რა ღირს', 'buy', 'price', 'cost', 'purchase', 'ticket', 'discord', 'paypal', 'card', 'crypto'])) {
        if (isGeorgian) {
            return "🛒 <strong>როგორ შევიძინოთ ლიცენზია?</strong><br>1. შემობრძანდით ჩვენს <a href='https://discord.gg/kAFr2Bpyxw' target='_blank' style='color:#a5b4fc;text-decoration:underline;'>Discord სერვერზე</a>.<br>2. გახსენით **Ticket** 'Buy / Purchase' არხში.<br>3. ადმინისტრაცია რამდენიმე წუთში დაგეხმარებათ გადახდასა და გასაღების აქტივაციაში!";
        }
        return "🛒 <strong>How to buy a license?</strong><br>1. Join our <a href='https://discord.gg/kAFr2Bpyxw' target='_blank' style='color:#a5b4fc;text-decoration:underline;'>Discord Server</a>.<br>2. Open a **Ticket** in the 'Buy / Purchase' channel.<br>3. Support will help you complete payment and activate your key in minutes!";
    }

    // 9. Promocodes & Referrals & Free trial
    if (hasAny(['პრომო', 'პრომოკოდი', 'კოდი', 'რეფერალ', 'უფასო', 'free', 'promo', 'referral', 'bonus', 'trial', 'ტესტ'])) {
        if (isGeorgian) {
            return " <strong>უფასო დღეები & პრომოკოდები:</strong><br>• <strong>რეფერალური სისტემა:</strong> შენი პირადი კოდი ნახე დეშბორდში. როცა მეგობარი შეიყვანს მას, <strong>ორივეს დაგემატებათ +3 უფასო დღე</strong>!<br>• <strong>პრომოკოდები:</strong> პრომოკოდის შესაყვანად გადადი დეშბორდში 'Redeem' ჩანართზე.";
        }
        return " <strong>Free Days & Promo Codes:</strong><br>• <strong>Referral System:</strong> Find your invite code in the dashboard. When a friend uses it, <strong>both get +3 bonus days</strong>!<br>• <strong>Promo Codes:</strong> Redeem codes under the 'Redeem' tab in your dashboard.";
    }

    // 10. HWID & PC Lock
    if (hasAny(['hwid', 'pc', 'კომპიუტერ', 'შეცვლა', 'reset', 'lock', 'device'])) {
        if (isGeorgian) {
            return "<strong>HWID და მოწყობილობები:</strong><br>თქვენი ლიცენზია პირველივე ჩართვისას ავტომატურად უკავშირდება თქვენს PC-ს. თუ კომპიუტერი შეცვალეთ, დეშბორდიდან შეგიძლიათ მოითხოვოთ HWID Reset ან მოგვწეროთ Discord-ზე.";
        }
        return "<strong>HWID & Devices:</strong><br>Your license auto-binds to your PC hardware upon first launch. If you upgrade your PC, request a HWID reset via Dashboard or Discord support.";
    }

    // 11. Crashing & Troubleshooting
    if (hasAny(['ქრაშავს', 'არ იხსნება', 'error', 'crash', 'problem', 'პრობლემა', 'ხარვეზი', 'არ რთავს', 'გათიშვა', 'შეცდომა'])) {
        if (isGeorgian) {
            return "<strong>პრობლემის მოგვარება (Troubleshooting):</strong><br>1. დარწმუნდით რომ გაქვთ <strong>Java 21</strong> დაყენებული.<br>2. შეამოწმეთ Fabric Loader-ის ვერსია (უნდა იყოს 0.16.0 ან ახალი).<br>3. თუ სხვა მოდებიც გაქვთ `.minecraft/mods`-ში, დროებით ამოიღეთ (მაგ: OptiFine / Iris).<br>4. თუ მაინც ქრაშავს, მოგვწერეთ Discord Ticket-ში და გამოგვიგზავნეთ `latest.log`.";
        }
        return "<strong>Troubleshooting Guide:</strong><br>1. Ensure you have <strong>Java 21</strong> installed.<br>2. Verify Fabric Loader is version 0.16.0 or newer.<br>3. Try removing conflicting mods from `.minecraft/mods`.<br>4. If crashes persist, send your `latest.log` in a Discord Ticket!";
    }

    // 12. Ban Safety / Anticheat / OpSec
    if (hasAny(['ban', 'ბანი', 'დამბანენ', 'anticheat', 'safe', 'უსაფრთხო', 'undetected', 'opsec', 'grim', 'matrix'])) {
        if (isGeorgian) {
            return "<strong>ანტიჩითები & OpSec:</strong><br>PulseClient აღჭურვილია სპეციალური <strong>OpSec Mod</strong>-ით და Matrix/GrimAC შემოვლითი ალგორითმებით. სწორი პარამეტრებით თამაშისას ბანის რისკი მინიმალურია!";
        }
        return "<strong>Anticheat Safety & OpSec:</strong><br>PulseClient includes an advanced <strong>OpSec Mod</strong> and Matrix/GrimAC bypass features designed to keep your gameplay safe and undetected.";
    }

    // 13. Gratitude / Thanks
    if (hasAny(['მადლობა', 'გმადლობ', 'thanks', 'thank you', 'thx', 'kk', 'კაი', 'კარგი'])) {
        if (isGeorgian) {
            return "არაფრის!  თუ რამე კითხვა გექნება, ნებისმიერ დროს მომწერე. წარმატებულ თამაშს გისურვებ PulseClient-თან ერთად! ";
        }
        return "You're welcome!  If you have any other questions, feel free to ask anytime. Enjoy gaming with PulseClient! ";
    }

    // Default Smart Fallback
    if (isGeorgian) {
        return "<strong>Pulse AI:</strong> ვერ მივხვდი ზუსტად რას გულისხმობ. შეგიძლია იკითხო მაგალითად:<br>• <em>\"რომელი ღილაკით იხსნება მენიუ?\"</em><br>• <em>\"როგორ დავაინსტალირო მოდი?\"</em><br>• <em>\"როგორ შევიძინო ლიცენზია?\"</em><br>• <em>\"როგორ გავასწორო ქრაში?\"</em><br><br>ან მოგვწერე <a href='https://discord.gg/kAFr2Bpyxw' target='_blank' style='color:#a5b4fc;text-decoration:underline;'>Discord-ზე</a>!";
    }
    return "<strong>Pulse AI:</strong> I didn't quite catch that. You can ask me questions like:<br>• <em>\"How to open the menu?\"</em><br>• <em>\"How to install the mod?\"</em><br>• <em>\"How to buy a license?\"</em><br>• <em>\"How to fix crashes?\"</em><br><br>Or reach us on <a href='https://discord.gg/kAFr2Bpyxw' target='_blank' style='color:#a5b4fc;text-decoration:underline;'>Discord</a>!";
}


// Register OS download button handlers
const downloadLinuxBtn = document.getElementById('download-linux-btn-modal');
const downloadMacBtn = document.getElementById('download-mac-btn-modal');

[downloadPvpBtn, downloadBasefindBtn, downloadLinuxBtn, downloadMacBtn, updateDownloadBtn].forEach(btn => {
    if (btn) {
        btn.href = GITHUB_BASEFIND_DOWNLOAD_URL;
        btn.setAttribute('download', GITHUB_BASEFIND_JAR_FILE);
        btn.addEventListener('click', () => {
            trackUserDownload();
        });
    }
});


// Device Slot Modal functions
function openDeviceSlotModal() {
    const modal = document.getElementById('device-slot-modal');
    if (modal) {
        modal.classList.remove('hidden');
        updateDeviceSlotModalInfo();
    }
}
window.openDeviceSlotModal = openDeviceSlotModal;

function closeDeviceSlotModal() {
    const modal = document.getElementById('device-slot-modal');
    if (modal) modal.classList.add('hidden');
}
window.closeDeviceSlotModal = closeDeviceSlotModal;

function updateDeviceSlotModalInfo() {
    const hwidEl = document.getElementById('device-modal-hwid-text');
    if (!hwidEl) return;
    if (userLicenses && userLicenses.length > 0) {
        const activeLic = userLicenses.find(l => l.is_active) || userLicenses[0];
        const hwid = activeLic.hwid && activeLic.hwid !== 'null' ? activeLic.hwid : 'არ არის მიბმული';
        hwidEl.textContent = 'HWID: ' + hwid;
    } else {
        hwidEl.textContent = 'HWID: ლიცენზია არ მოიძებნა';
    }
}

async function resetDeviceSlotHwid() {
    if (!userLicenses || userLicenses.length === 0) {
        showBanner("აქტიური ლიცენზია არ მოიძებნა", "error");
        return;
    }
    const activeLic = userLicenses.find(l => l.is_active) || userLicenses[0];
    await resetUserHwid(activeLic.license_key);
    const resetUser = currentUser ? (currentUser.user_metadata?.user_name || currentUser.user_metadata?.name || "User") : "User";
    sendDiscordAuditLog(
        "🖥️ HWID Reset-ის მოთხოვნა",
        `მომხმარებელმა **${resetUser}** გაასუფთავა მოწყობილობის სლოტი (HWID).`,
        0xf59e0b,
        [
            { name: "👤 მომხმარებელი", value: resetUser, inline: true },
            { name: "გასაღები", value: activeLic.license_key, inline: true }
        ]
    );
    updateDeviceSlotModalInfo();
}
window.resetDeviceSlotHwid = resetDeviceSlotHwid;


// Custom User Discord Username JAR Download Handler
function getUserCustomJarFilename() {
    let username = "Guest";
    if (currentUser) {
        const metadata = currentUser.user_metadata || {};
        username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name || username;
    }
    // Sanitize username for safe OS filename (alphanumeric, underscore, dash)
    const cleanUser = username.replace(/[^a-zA-Z0-9_\-]/g, "_").replace(/_+/g, "_").trim() || "User";
    return `PulseClient-Fabric.1.21.11-${cleanUser}.jar`;
}
window.getUserCustomJarFilename = getUserCustomJarFilename;

async function handleCustomClientDownload(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const customFilename = getUserCustomJarFilename();
    const currentUsername = currentUser ? (currentUser.user_metadata?.user_name || currentUser.user_metadata?.name || "Guest") : "Guest";
    
    sendDiscordAuditLog(
        "📦 კლიენტის (.jar) გადმოწერა",
        `მომხმარებელმა ჩამოტვირთა კლიენტის ფაილი **${customFilename}**.`,
        0x38bdf8,
        [
            { name: "👤 მომხმარებელი", value: currentUsername, inline: true },
            { name: "📄 ფაილი", value: customFilename, inline: true }
        ]
    );
    showBanner(`ფაილის გადმოწერა დაიწყო: ${customFilename}`, "info");

    const jarLocalPath = `./${GITHUB_JAR_FILE}`;
    try {
        const response = await fetch(jarLocalPath, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = customFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
        closeDownloadModal();
    } catch (err) {
        console.warn("Direct blob fetch failed, falling back to local static download anchor:", err);
        const a = document.createElement('a');
        a.href = jarLocalPath;
        a.download = customFilename;
        a.setAttribute('download', customFilename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        closeDownloadModal();
    }
}
window.handleCustomClientDownload = handleCustomClientDownload;


// ==========================================
// PULSECLIENT CONFIG CLOUD LOGIC
// ==========================================
const PULSE_PRESETS = {
    "donutsmp_basefinder": {
        "name": "DonutSMP BaseFinder",
        "author": "Pulse Official",
        "version": "1.21.11",
        "modules": {
            "ChunkRadar": { "enabled": true, "radius": 32, "highlightNewChunks": true },
            "StorageInspector": { "enabled": true, "chests": true, "shulkers": true, "barrels": true, "minValuableCount": 1 },
            "HoleESP": { "enabled": true, "mode": "CustomGradient", "opacity": 0.65 },
            "AutoWebhook": { "enabled": true, "sendCoords": true, "sendItemSummary": true },
            "Speed": { "enabled": false },
            "OpSecGuard": { "enabled": true, "hidePlayerNames": true, "spoofLogs": true }
        }
    },
    "grimac_safe_pvp": {
        "name": "GrimAC / Matrix Safe PvP",
        "author": "Pulse Official",
        "version": "1.21.11",
        "modules": {
            "AimAssist": { "enabled": true, "smoothness": 4.5, "fov": 65.0 },
            "Reach": { "enabled": true, "distance": 3.12 },
            "Velocity": { "enabled": true, "horizontal": 85, "vertical": 100 },
            "AutoClicker": { "enabled": true, "minCps": 12, "maxCps": 16, "jitter": true },
            "PlayerChams": { "enabled": true, "color": "#ff003c" },
            "OpSecGuard": { "enabled": true }
        }
    },
    "blatant_anarchy": {
        "name": "Blatant Anarchy PvP",
        "author": "Pulse Official",
        "version": "1.21.11",
        "modules": {
            "Killaura": { "enabled": true, "range": 4.8, "target": "Players", "autoBlock": true },
            "AutoTotem": { "enabled": true, "slot": "Offhand", "fastSwitch": true },
            "CrystalAura": { "enabled": true, "placeSpeed": 20, "breakSpeed": 20 },
            "Velocity": { "enabled": true, "horizontal": 0, "vertical": 0 },
            "Tracers": { "enabled": true, "color": "#ff003c" }
        }
    },
    "hypixel_duel": {
        "name": "Hypixel / Minemen Duel",
        "author": "Pulse Official",
        "version": "1.21.11",
        "modules": {
            "AutoClicker": { "enabled": true, "minCps": 11, "maxCps": 15, "rightClick": false },
            "WTap": { "enabled": true, "mode": "Packet" },
            "Eagle": { "enabled": true, "edgeDistance": 0.1 },
            "Sprint": { "enabled": true, "omni": false },
            "BoxESP": { "enabled": true, "lineWidth": 1.5 }
        }
    }
};

function downloadPresetConfig(presetKey) {
    const config = PULSE_PRESETS[presetKey];
    if (!config) return;

    const filename = `PulseClient_${presetKey}.json`;
    const jsonStr = JSON.stringify(config, null, 4);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    showBanner(`კონფიგი გადმოწერილია: ${filename}`, "success");
}
window.downloadPresetConfig = downloadPresetConfig;

function copyPresetConfig(presetKey, btnElement) {
    const config = PULSE_PRESETS[presetKey];
    if (!config) return;

    const jsonStr = JSON.stringify(config, null, 4);
    navigator.clipboard.writeText(jsonStr).then(() => {
        if (btnElement) {
            const originalText = btnElement.textContent;
            btnElement.textContent = "კოპირებულია!";
            setTimeout(() => { btnElement.textContent = originalText; }, 2000);
        }
        showBanner("კონფიგის JSON კოდი დაკოპირდა ბუფერში!", "success");
    });
}
window.copyPresetConfig = copyPresetConfig;


// ==========================================
// COMMUNITY CONFIG SHARING & UPLOAD LOGIC
// ==========================================

function handleConfigFileSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const textarea = document.getElementById('share-config-json');
        if (textarea) {
            textarea.value = content;
        }
    };
    reader.readAsText(file);
}
window.handleConfigFileSelect = handleConfigFileSelect;

async function handleShareConfigSubmit(event) {
    if (event) event.preventDefault();

    if (!currentUser) {
        showBanner("გთხოვთ გაიაროთ ავტორიზაცია Discord-ით!", "error");
        return;
    }

    // Check if user has an active license
    const metadata = currentUser.user_metadata || {};
    const username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name || "User";
    const discordId = getDiscordId(currentUser) || "N/A";

    const nameInput = document.getElementById('share-config-name');
    const descInput = document.getElementById('share-config-desc');
    const jsonInput = document.getElementById('share-config-json');
    const submitBtn = document.getElementById('share-config-btn');

    const configName = (nameInput.value || '').trim();
    const configDesc = (descInput.value || '').trim();
    const jsonCode = (jsonInput.value || '').trim();

    if (!configName || !jsonCode) {
        showBanner("გთხოვთ შეავსოთ ყველა ველი!", "error");
        return;
    }

    // Validate JSON
    let parsedJson = null;
    try {
        parsedJson = JSON.parse(jsonCode);
    } catch (e) {
        showBanner("JSON კოდის ფორმატი არასწორია!", "error");
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "მოწმდება ლიცენზია...";
    }

    try {
        // Query user licenses to verify active license key
        const { data: licenses, error: licErr } = await supabaseClient
            .from('licenses')
            .select('*')
            .like('note', `%Buyer: ${username}%`);

        const now = new Date();
        const hasActiveLicense = licenses && licenses.some(l => {
            if (!l.is_active) return false;
            if (!l.expires_at) return true;
            if (l.expires_at.startsWith("2000-01-01")) return false; // not activated yet
            return new Date(l.expires_at) > now;
        });

        if (!hasActiveLicense && !isAdmin()) {
            showBanner("კონფიგის გასაზიარებლად საჭიროა გქონდეთ აქტიური PulseClient ლიცენზია!", "error");
            return;
        }

        // Save community config
        const configItem = {
            id: 'cfg_' + Date.now(),
            name: configName,
            description: configDesc || "Community preset",
            author: username,
            discord_id: discordId,
            config_data: parsedJson,
            created_at: new Date().toISOString()
        };

        // 1. Try Supabase insert
        try {
            await supabaseClient.from('community_configs').insert(configItem);
        } catch (dbErr) {
            console.warn("Supabase community_configs table fallback:", dbErr);
        }

        // 2. Cache in LocalStorage
        let localConfigs = [];
        try {
            localConfigs = JSON.parse(localStorage.getItem('pulse_community_configs') || '[]');
        } catch (e) {}
        localConfigs.unshift(configItem);
        localStorage.setItem('pulse_community_configs', JSON.stringify(localConfigs));

        // 3. Discord Audit Log Notification
        sendDiscordAuditLog(
            "☁️ ახალი კონფიგი გაზიარდა",
            `მომხმარებელმა **${username}** გააზიარა ახალი კონფიგი: **${configName}**.`,
            0x38bdf8,
            [
                { name: "👤 ავტორი", value: username, inline: true },
                { name: "📝 სახელი", value: configName, inline: true },
                { name: "📋 აღწერა", value: configDesc || "N/A", inline: false }
            ]
        );

        showBanner("თქვენი კონფიგი წარმატებით გაზიარდა!", "success");
        nameInput.value = '';
        descInput.value = '';
        jsonInput.value = '';
        renderCommunityConfigs();
    } catch (err) {
        console.error("Config share error:", err);
        showBanner("კონფიგის გაზიარებისას დაფიქსირდა შეცდომა: " + err.message, "error");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "კონფიგის გაზიარება";
        }
    }
}
window.handleShareConfigSubmit = handleShareConfigSubmit;

function renderCommunityConfigs() {
    const container = document.getElementById('community-configs-list');
    if (!container) return;

    let configs = [];
    try {
        configs = JSON.parse(localStorage.getItem('pulse_community_configs') || '[]');
    } catch (e) {}

    if (configs.length === 0) {
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 20px; font-size: 13px;">საზოგადოების მიერ გაზიარებული კონფიგები ჯერ არ არის. იყავით პირველი!</div>`;
        return;
    }

    container.innerHTML = configs.map(c => `
        <div class="glass-panel preset-card" style="padding: 20px; border: 1px solid rgba(255, 0, 60, 0.2); background: rgba(14, 14, 18, 0.7);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <h4 style="font-size: 1.05rem; color: #fff; font-weight: 700;">${c.name}</h4>
                <span style="background: rgba(255, 0, 60, 0.15); color: #ff003c; border: 1px solid rgba(255, 0, 60, 0.3); font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">USER</span>
            </div>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; line-height: 1.4;">${c.description}</p>
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 14px;">ავტორი: <strong style="color: #ff3366;">${c.author}</strong></div>
            <div style="display: flex; gap: 8px;">
                <button type="button" class="btn btn-primary" onclick="downloadCustomConfigById('${c.id}')" style="flex: 1; padding: 6px 10px; font-size: 11px;">ჩამოტვირთვა</button>
                <button type="button" class="btn btn-secondary" onclick="copyCustomConfigById('${c.id}', this)" style="padding: 6px 12px; font-size: 11px;">კოპირება</button>
            </div>
        </div>
    `).join('');
}
window.renderCommunityConfigs = renderCommunityConfigs;

function downloadCustomConfigById(configId) {
    let configs = [];
    try { configs = JSON.parse(localStorage.getItem('pulse_community_configs') || '[]'); } catch (e) {}
    const found = configs.find(c => c.id === configId);
    if (!found) return;

    const safeName = found.name.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const filename = `PulseClient_${safeName}.json`;
    const jsonStr = JSON.stringify(found.config_data, null, 4);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    showBanner(`კონფიგი გადმოწერილია: ${filename}`, "success");
}
window.downloadCustomConfigById = downloadCustomConfigById;

function copyCustomConfigById(configId, btnEl) {
    let configs = [];
    try { configs = JSON.parse(localStorage.getItem('pulse_community_configs') || '[]'); } catch (e) {}
    const found = configs.find(c => c.id === configId);
    if (!found) return;

    const jsonStr = JSON.stringify(found.config_data, null, 4);
    navigator.clipboard.writeText(jsonStr).then(() => {
        if (btnEl) {
            const orig = btnEl.textContent;
            btnEl.textContent = "კოპირებულია!";
            setTimeout(() => { btnEl.textContent = orig; }, 2000);
        }
        showBanner("კონფიგის JSON კოდი დაკოპირდა ბუფერში!", "success");
    });
}
window.copyCustomConfigById = copyCustomConfigById;

// Call render on init
setTimeout(renderCommunityConfigs, 500);


// ==========================================
// OPSEC TRACE CLEANER LOGIC
// ==========================================
const OPSEC_BATCH_SCRIPT = `@echo off
title PulseClient - OpSec Trace Cleaner
color 0c
echo ===================================================
echo        PULSECLIENT OPSEC TRACE CLEANER
echo ===================================================
echo.
echo [*] Cleaning Minecraft Logs and Crash Reports...
del /f /q /s "%appdata%\\.minecraft\\logs\\*.*" >nul 2>&1
del /f /q /s "%appdata%\\.minecraft\\crash-reports\\*.*" >nul 2>&1
echo [*] Cleaning Windows Temp & Prefetch Traces...
del /f /q /s "%temp%\\*.*" >nul 2>&1
del /f /q /s "C:\\Windows\\Temp\\*.*" >nul 2>&1
echo [*] Cleaning Windows Recent Activity...
del /f /q /s "%appdata%\\Microsoft\\Windows\\Recent\\*.*" >nul 2>&1
echo [*] Flushing DNS Cache...
ipconfig /flushdns >nul 2>&1
echo.
echo ===================================================
echo [SUCCESS] OpSec traces successfully wiped!
echo You are now clean and safe for checks.
echo ===================================================
timeout /t 3 >nul
exit`;

function copyOpSecCleaner(btnEl) {
    navigator.clipboard.writeText(OPSEC_BATCH_SCRIPT).then(() => {
        if (btnEl) {
            const span = btnEl.querySelector('span') || btnEl;
            const orig = span.textContent;
            span.textContent = "კოპირებულია!";
            setTimeout(() => { span.textContent = orig; }, 2000);
        }
        showBanner("OpSec Cleaner სკრიპტის კოდი დაკოპირდა ბუფერში!", "success");
    });
}
window.copyOpSecCleaner = copyOpSecCleaner;
