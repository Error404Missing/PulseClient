// Initialize Supabase Client
const supabaseUrl = "https://qxyggegnnxdsgjcutsrl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eWdnZWdubnhkc2dqY3V0c3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzQ0ODIsImV4cCI6MjA5NTExMDQ4Mn0.mKywX8VuzrSJs8cijweg2jdKboYupE2GZUWX_LY9CMg";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

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

let currentUser = null;

// App Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Check active session
    const { data: { session }, error } = await supabase.auth.getSession();
    if (session) {
        handleUserSignIn(session.user);
    } else {
        handleUserSignOut();
    }

    // Set up OAuth redirect listener
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            handleUserSignIn(session.user);
        } else if (event === 'SIGNED_OUT') {
            handleUserSignOut();
        }
    });

    // Event Listeners
    navLoginBtn.addEventListener('click', signInWithDiscord);
    navLogoutBtn.addEventListener('click', signOut);
    dashLogoutBtn.addEventListener('click', signOut);
    refreshLicensesBtn.addEventListener('click', fetchUserLicenses);
    bindLicenseForm.addEventListener('submit', bindLicenseKey);

    // Set default mock download file link
    downloadModBtn.href = "MotionBlur1.031.1.21.11.jar";
});

// Auth Functions
async function signInWithDiscord() {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: window.location.origin + window.location.pathname
            }
        });
        if (error) throw error;
    } catch (err) {
        console.error("Login failed:", err.message);
        alert("შესვლა ვერ მოხერხდა: " + err.message);
    }
}

async function signOut() {
    await supabase.auth.signOut();
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

    // Fetch Licenses
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
        const { data, error } = await supabase
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
        showBanner("ლიცენზიების ჩატვირთვის შეცდომა: " + err.message, "error");
        licensesLoading.classList.add('hidden');
    }
}

function renderLicenses(licenses) {
    licensesList.innerHTML = '';
    
    licenses.forEach(lic => {
        const item = document.createElement('div');
        item.className = 'license-item';

        // Format expiry date
        let expiryDisplay = "უვადოდ";
        if (lic.expires_at) {
            const expDate = new Date(lic.expires_at);
            const now = new Date();
            if (expDate < now) {
                expiryDisplay = "ვადა გასულია";
            } else {
                const diffTime = Math.abs(expDate - now);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 365 * 10) {
                    expiryDisplay = "სამუდამო";
                } else {
                    expiryDisplay = `${diffDays} დღე დარჩა`;
                }
            }
        }

        const statusClass = lic.is_active ? 'active' : 'revoked';
        const statusText = lic.is_active ? 'აქტიური' : 'გაუქმებული';

        item.innerHTML = `
            <div class="lic-key-info">
                <h4>ლიცენზიის გასაღები</h4>
                <code>${lic.license_key}</code>
            </div>
            <div class="lic-status-badge ${statusClass}">
                ${statusText}
            </div>
            <div class="lic-expiry-info">
                <span class="label">ვადა</span>
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
    bindSubmitBtn.textContent = "მიმდინარეობს დაკავშირება...";

    const metadata = currentUser.user_metadata;
    const username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name;

    try {
        // 1. Check if the key exists in database
        const { data: license, error: fetchError } = await supabase
            .from('licenses')
            .select('*')
            .eq('license_key', key)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (!license) {
            showBanner("ლიცენზიის გასაღები ვერ მოიძებნა. გადაამოწმეთ და სცადეთ თავიდან.", "error");
            bindSubmitBtn.disabled = false;
            bindSubmitBtn.textContent = "დაკავშირება";
            return;
        }

        // 2. Check if key is already linked to someone else
        if (license.note && license.note.includes("Buyer:") && !license.note.includes(username)) {
            // Note contains another buyer name
            showBanner("ეს გასაღები უკვე სხვა Discord მომხმარებელზეა მიბმული.", "error");
            bindSubmitBtn.disabled = false;
            bindSubmitBtn.textContent = "დაკავშირება";
            return;
        }

        // 3. Update the note column to associate with current user
        const newNote = `Product: PulseClient | Buyer: ${username} (Linked via Dashboard)`;
        const { error: updateError } = await supabase
            .from('licenses')
            .update({ note: newNote })
            .eq('license_key', key);

        if (updateError) throw updateError;

        showBanner("ლიცენზიის გასაღები წარმატებით დაუკავშირდა თქვენს Discord ანგარიშს!", "success");
        bindKeyInput.value = '';
        fetchUserLicenses();
    } catch (err) {
        console.error("Binding failed:", err.message);
        showBanner("გასაღების დაკავშირება ვერ მოხერხდა: " + err.message, "error");
    } finally {
        bindSubmitBtn.disabled = false;
        bindSubmitBtn.textContent = "დაკავშირება";
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
