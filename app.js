// Initialize Supabase Client
const supabaseUrl = "https://qxyggegnnxdsgjcutsrl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eWdnZWdubnhkc2dqY3V0c3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzQ0ODIsImV4cCI6MjA5NTExMDQ4Mn0.mKywX8VuzrSJs8cijweg2jdKboYupE2GZUWX_LY9CMg";

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
});

// Update Notification DOM Elements
const updateNotification = document.getElementById('update-notification');
const updateDateText = document.getElementById('update-date-text');
const updateDownloadBtn = document.getElementById('update-download-btn');
const updateDismissBtn = document.getElementById('update-dismiss-btn');

// GitHub update check
async function checkForUpdates() {
    try {
        // Fetch commits for the jar file to know the last update time
        const res = await fetch("https://api.github.com/repos/Error404Missing/PulseClient/commits?path=MotionBlur1.031.1.21.11.jar&page=1&per_page=1");
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

function handleUserSignIn(user) {
    currentUser = user;
    
    // Get Discord Profile Details
    const metadata = user.user_metadata;
    const username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name || "მომხმარებელი";
    const avatar = metadata.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png";

    // Update Nav
    navLoginBtn.classList.add('hidden');
    navUserProfile.classList.remove('hidden');
    navAvatar.src = avatar;
    navUsername.textContent = username;

    // Update Dashboard Profile
    dashAvatar.src = avatar;
    dashUsername.textContent = username;

    // Switch Views
    landingPage.classList.add('hidden');
    dashboardPage.classList.remove('hidden');

    // Show/Hide Admin menu item
    if (isAdmin()) {
        if (adminMenuItem) adminMenuItem.classList.remove('hidden');
    } else {
        if (adminMenuItem) adminMenuItem.classList.add('hidden');
    }
    // Save/Update user profile
    saveUserProfile(user);

    // Asynchronously fetch latest profile from DB in case it was synced by bot
    fetchLatestProfile(user.id);

    // Set up referral link for the logged in user
    const discordId = metadata.provider_id || (user.identities && user.identities[0]?.id);
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

    // Auto claim free trial for new users on login (and trigger referral instantly)
    autoClaimTrialForNewUser(user);

    // Check for mod updates
    checkForUpdates();
}

async function autoClaimTrialForNewUser(user) {
    const metadata = user.user_metadata;
    const username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name;
    const discordId = metadata.provider_id || (user.identities && user.identities[0]?.id);

    try {
        const queryDiscordId = `%DiscordID: ${discordId}%`;
        const queryUsername = `%Buyer: ${username}%`;
        
        const { data: existingLicenses, error: queryError } = await supabaseClient
            .from('licenses')
            .select('*')
            .or(`note.like.${queryDiscordId},note.like.${queryUsername}`);

        if (queryError) throw queryError;

        if (!existingLicenses || existingLicenses.length === 0) {
            // New user, let's auto-claim trial
            // Age check
            if (discordId) {
                try {
                    const snowflake = BigInt(discordId);
                    const createdAtMs = Number((snowflake >> 22n) + 1420070400000n);
                    const diffDays = (Date.now() - createdAtMs) / (1000 * 60 * 60 * 24);
                    if (diffDays < 30) {
                        fetchUserLicenses();
                        return;
                    }
                } catch (err) {
                    console.error("Failed to parse discord account age:", err);
                }
            }

            // Check referral
            const refDiscordId = localStorage.getItem('pulse_referral_discord_id');
            let referrerName = null;
            if (refDiscordId) {
                referrerName = await processReferralBonus(username);
            }

            // Create key
            const key = generateLicenseKey();
            const trialDays = referrerName ? 6 : 3; // 6 days (3 trial + 3 bonus) if referred, otherwise 3 days
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

            if (referrerName) {
                showBanner(t("msg.referredSuccessNotice", { ref: referrerName }), "success");
            } else {
                showBanner(t("msg.trialSuccess"), "success");
            }
        }
    } catch (err) {
        console.error("Auto claim trial error:", err.message);
    } finally {
        fetchUserLicenses();
    }

function handleUserSignOut() {
    currentUser = null;

    // Update Nav
    navLoginBtn.classList.remove('hidden');
    navUserProfile.classList.add('hidden');

    // Switch Views
    landingPage.classList.remove('hidden');
    dashboardPage.classList.add('hidden');

    // Hide Admin menu item
    if (adminMenuItem) {
        adminMenuItem.classList.add('hidden');
    }
}

// Database / Licenses Functions
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
        dashLicenseCount.textContent = data.length;

        if (data.length === 0) {
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

        // Format expiry date
        let expiryDisplay = t("status.lifetime");
        if (lic.expires_at) {
            const expDate = new Date(lic.expires_at);
            const now = new Date();
            if (expDate < now) {
                expiryDisplay = t("status.expiredShort");
            } else {
                const diffTime = Math.abs(expDate - now);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 365 * 10) {
                    expiryDisplay = t("status.lifetime");
                } else {
                    expiryDisplay = t("status.daysLeft", { n: diffDays });
                }
            }
        }

        const statusClass = lic.is_active ? 'active' : 'revoked';
        const statusText = lic.is_active ? t('status.active') : t('status.revoked');

        item.innerHTML = `
            <div class="lic-key-info">
                <h4>${t('lic.keyLabel')}</h4>
                <code>${lic.license_key}</code>
            </div>
            <div class="lic-status-badge ${statusClass}">
                ${statusText}
            </div>
            <div class="lic-expiry-info">
                <span class="label">${t('lic.expiryLabel')}</span>
                <span class="val">${expiryDisplay}</span>
            </div>
        `;
        licensesList.appendChild(item);
    });

    licensesList.classList.remove('hidden');
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

        // 4. Update the note column to associate with current user, preserving original creator info
        const originalNote = license.note || "";
        const byMatch = originalNote.match(/\(by\s+([^)]+)\)/i);
        const originalCreator = byMatch ? byMatch[1].trim() : null;

        let newNote = `Product: PulseClient | Buyer: ${username}`;
        if (originalCreator) {
            newNote += ` (by ${originalCreator})`;
        }
        newNote += ` (Linked via Dashboard)`;
        if (referrerName) {
            newNote += ` | Referred by: ${referrerName}`;
        }

        const { error: updateError } = await supabaseClient
            .from('licenses')
            .update({ note: newNote })
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
    bannerText.textContent = message;
    dashMessageBanner.className = `alert-banner ${type}`;
    dashMessageBanner.classList.remove('hidden');
    // Auto hide after 5 seconds
    setTimeout(hideBanner, 5000);
}

function hideBanner() {
    dashMessageBanner.classList.add('hidden');
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
function switchDashTab(event, tabId) {
    if (event) event.preventDefault();
    
    // Hide all tabs
    document.getElementById('tab-content-downloads').classList.add('hidden');
    document.getElementById('tab-content-redeem').classList.add('hidden');
    document.getElementById('tab-content-faq').classList.add('hidden');
    if (document.getElementById('tab-content-referral')) {
        document.getElementById('tab-content-referral').classList.add('hidden');
    }
    if (document.getElementById('tab-content-admin')) {
        document.getElementById('tab-content-admin').classList.add('hidden');
    }
    
    // Show active tab
    if (tabId === 'tab-downloads') {
        document.getElementById('tab-content-downloads').classList.remove('hidden');
    } else if (tabId === 'tab-redeem') {
        document.getElementById('tab-content-redeem').classList.remove('hidden');
    } else if (tabId === 'tab-referral') {
        if (document.getElementById('tab-content-referral')) {
            document.getElementById('tab-content-referral').classList.remove('hidden');
        }
    } else if (tabId === 'tab-faq') {
        document.getElementById('tab-content-faq').classList.remove('hidden');
    } else if (tabId === 'tab-admin') {
        if (document.getElementById('tab-content-admin')) {
            document.getElementById('tab-content-admin').classList.remove('hidden');
        }
        fetchAllLicenses();
        fetchProfilesForAdmin();
    }    
    // Deactivate all menu items
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    
    // Activate clicked menu item
    if (event) {
        event.currentTarget.classList.add('active');
    }

    // Scroll smoothly to dashboard top
    const dbPage = document.getElementById('dashboard-page');
    if (dbPage) {
        dbPage.scrollIntoView({ behavior: 'smooth' });
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
    if (event) event.preventDefault();
    
    // Switch views to show landing page
    landingPage.classList.remove('hidden');
    dashboardPage.classList.add('hidden');
    
    // Scroll to section
    const target = document.getElementById(sectionId);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }

    if (window.history.replaceState) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
}
window.navigateToLandingSection = navigateToLandingSection;

// Show dashboard view
function showDashboard() {
    landingPage.classList.add('hidden');
    dashboardPage.classList.remove('hidden');
    // Default to downloads tab
    switchDashTab(null, 'tab-downloads');
}
window.showDashboard = showDashboard;

// ==========================================
// ADMIN PANEL FUNCTIONS
// ==========================================

function isAdmin() {
    if (!currentUser) return false;
    const providerId = currentUser.user_metadata?.provider_id || (currentUser.identities && currentUser.identities[0]?.id);
    return ADMIN_DISCORD_IDS.includes(String(providerId));
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
        if (byMatch) {
            createdBy = byMatch[1].trim();
        } else if (/Free Trial/i.test(note)) {
            createdBy = "Free Trial";
        } else if (/Linked via Dashboard/i.test(note)) {
            createdBy = t("creator.dashboard");
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

    adminLicensesLoading.classList.remove('hidden');
    adminLicensesTableBody.innerHTML = '';

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
    } catch (err) {
        console.error("Error fetching all licenses:", err.message);
        showBanner(t("msg.dataLoadFail") + err.message, "error");
    } finally {
        adminLicensesLoading.classList.add('hidden');
    }
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

        let status = 'active';
        let statusText = t('status.active');
        
        if (!lic.is_active) {
            status = 'revoked';
            statusText = t('status.revoked');
        } else if (lic.expires_at && new Date(lic.expires_at) < new Date()) {
            status = 'expired';
            statusText = t('status.expired');
        }

        let expiryDisplay = t("status.lifetime");
        if (lic.expires_at) {
            const expDate = new Date(lic.expires_at);
            expiryDisplay = expDate.toLocaleDateString(getLocale(), { year: 'numeric', month: '2-digit', day: '2-digit' });
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
                <div class="admin-actions">
                    <button type="button" class="btn-action btn-info" onclick="showLicenseDetails('${lic.license_key}')" title="${t('admin.actionInfo')}" aria-label="${t('admin.actionInfo')}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    </button>
                    <button type="button" class="btn-action btn-hwid-reset" onclick="resetLicenseHwid('${lic.license_key}')" title="${t('admin.actionHwid')}" aria-label="${t('admin.actionHwid')}" ${lic.hwid ? '' : 'disabled'}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                    </button>
                    <button type="button" class="btn-action btn-revoke" onclick="revokeLicense('${lic.license_key}')" title="${t('admin.actionRevoke')}" aria-label="${t('admin.actionRevoke')}" ${lic.is_active ? '' : 'disabled'}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    </button>
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
        const matchesQuery = 
            lic.license_key.toLowerCase().includes(query) ||
            buyer.toLowerCase().includes(query) ||
            createdBy.toLowerCase().includes(query) ||
            product.toLowerCase().includes(query) ||
            (lic.note && lic.note.toLowerCase().includes(query));

        let matchesFilter = true;
        if (filter === 'active') {
            matchesFilter = lic.is_active && (!lic.expires_at || new Date(lic.expires_at) >= new Date());
        } else if (filter === 'revoked') {
            matchesFilter = !lic.is_active;
        } else if (filter === 'expired') {
            matchesFilter = lic.is_active && lic.expires_at && new Date(lic.expires_at) < new Date();
        }

        return matchesQuery && matchesFilter;
    });

    renderAdminLicenses(filtered);
}

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
    
    let expiresAt = null;
    if (durationDays !== null) {
        expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    }

    const adminMetadata = currentUser.user_metadata;
    const adminName = adminMetadata.user_name || adminMetadata.custom_claims?.username || adminMetadata.full_name || "Admin";
    const note = `Product: ${product} | Buyer: ${buyer} (by ${adminName})`;

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
        fetchAllLicenses();
    } catch (err) {
        console.error("Error revoking license:", err.message);
        showBanner(t("msg.revokeFail") + err.message, "error");
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
            showBanner(t("msg.trialAlreadyClaimed"), "error");
            return;
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

        showBanner(t("msg.trialSuccess"), "success");
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
            
            const { error: updateError } = await supabaseClient
                .from('licenses')
                .update({ expires_at: newExpiry })
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

function showLicenseDetails(key) {
    const lic = adminLicenses.find(l => l.license_key === key);
    if (!lic) return;

    const { product, buyer, createdBy } = parseLicenseNote(lic.note);

    let statusText = t("status.active");
    if (!lic.is_active) {
        statusText = t("status.revoked");
    } else if (lic.expires_at && new Date(lic.expires_at) < new Date()) {
        statusText = t("status.expired");
    }

    modalKey.textContent = lic.license_key;
    modalBuyer.textContent = buyer;
    if (modalCreator) modalCreator.textContent = createdBy;
    modalStatus.textContent = statusText;
    modalCreated.textContent = new Date(lic.created_at).toLocaleString(getLocale());
    
    let expiryDisplay = t("status.lifetime");
    if (lic.expires_at) {
        const expDate = new Date(lic.expires_at);
        const now = new Date();
        if (expDate < now) {
            expiryDisplay = t("status.expiredShort");
        } else {
            const diffTime = Math.abs(expDate - now);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            expiryDisplay = t("status.days", { n: diffDays });
        }
    }
    modalExpires.textContent = expiryDisplay;
    modalHwid.textContent = lic.hwid || t("status.notActivated");
    modalNote.textContent = lic.note || "-";

    licenseInfoModal.classList.remove('hidden');
}

function closeLicenseModal() {
    licenseInfoModal.classList.add('hidden');
}

// Attach functions to window scope for onclick handlers in dynamically generated HTML
window.showLicenseDetails = showLicenseDetails;
window.resetLicenseHwid = resetLicenseHwid;
window.revokeLicense = revokeLicense;
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
            console.log("Latest profile fetched:", data);
        }
    } catch (err) {
        console.warn("Failed to fetch latest profile:", err.message);
    }
}

// User Profiles sync and dropdown logic
async function saveUserProfile(user) {
    const metadata = user.user_metadata;
    const username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name;
    const avatar = metadata.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png";
    const discordId = metadata.provider_id || (user.identities && user.identities[0]?.id);

    if (!username) return;

    try {
        const { error } = await supabaseClient
            .from('profiles')
            .upsert({
                id: user.id,
                discord_id: String(discordId),
                username: username,
                avatar_url: avatar,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (error) throw error;
    } catch (err) {
        console.warn("Failed to upsert user profile (table might not exist yet):", err.message);
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
        option.innerHTML = `
            <img src="${profile.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}" alt="Avatar">
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
    });
}

function selectDropdownUser(username) {
    const profile = allUserProfiles.find(p => p.username === username);
    if (!profile) return;

    adminBuyerInput.value = profile.username;
    
    // Update trigger UI text
    if (adminUserSelectTrigger) {
        adminUserSelectTrigger.querySelector('span').innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <img src="${profile.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}" style="width: 20px; height: 20px; border-radius: 50%;">
                <span>${profile.username}</span>
            </div>
        `;
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
}
window.onLanguageChanged = onLanguageChanged;
