// ==============================================================================
// PULSE SENTINEL // AUDIT & SURVEILLANCE CONTROLLER (LOGS.JS)
// ==============================================================================

const SUPABASE_URL = "https://qxyggegnnxdsgjcutsrl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eWdnZWdubnhkc2dqY3V0c3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzQ0ODIsImV4cCI6MjA5NTExMDQ4Mn0.mKywX8VuzrSJs8cijweg2jdKboYupE2GZUWX_LY9CMg";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PULSE_API_PRIMARY = 'https://api.pulseclient.xyz';
const PULSE_API_FALLBACK = 'https://errormissing-pulse-bot.hf.space';

// STRICT SECURITY: OWNER ONLY ACCESS
const OWNER_DISCORD_IDS = ["1475396409246089367"];

let currentOwner = null;
let allLogs = [];
let filteredLogs = [];
let activeTab = "all";
let refreshIntervalTimer = null;
let selectedStaffFilter = null;

// DOM Elements
const authGateModal = document.getElementById('auth-gate-modal');
const authGateLogin = document.getElementById('auth-gate-login');
const authGateDenied = document.getElementById('auth-gate-denied');
const deniedUserInfo = document.getElementById('denied-user-info');
const mainDashboard = document.getElementById('main-dashboard');

const headerAvatar = document.getElementById('header-avatar');
const headerUsername = document.getElementById('header-username');
const autoRefreshSelect = document.getElementById('auto-refresh-select');
const btnRefreshNow = document.getElementById('btn-refresh-now');
const btnExportCsv = document.getElementById('btn-export-csv');
const btnLogout = document.getElementById('btn-logout');
const btnGateLogout = document.getElementById('btn-gate-logout');
const btnDiscordLogin = document.getElementById('btn-discord-login');

const statStaffActions = document.getElementById('stat-staff-actions');
const statActiveStaff = document.getElementById('stat-active-staff');
const statCriticalEvents = document.getElementById('stat-critical-events');
const statUserEvents = document.getElementById('stat-user-events');
const statClientVerifies = document.getElementById('stat-client-verifies');

const tabCountAll = document.getElementById('tab-count-all');
const tabCountStaff = document.getElementById('tab-count-staff');
const tabCountUsers = document.getElementById('tab-count-users');
const tabCountClient = document.getElementById('tab-count-client');
const tabCountSecurity = document.getElementById('tab-count-security');

const staffLeaderboardSection = document.getElementById('staff-leaderboard-section');
const staffCardsContainer = document.getElementById('staff-cards-container');

const filterSearch = document.getElementById('filter-search');
const filterRole = document.getElementById('filter-role');
const filterAction = document.getElementById('filter-action');
const filterSeverity = document.getElementById('filter-severity');
const filterTimeframe = document.getElementById('filter-timeframe');
const btnResetFilters = document.getElementById('btn-reset-filters');
const filterResultsCount = document.getElementById('filter-results-count');

const auditTableBody = document.getElementById('audit-table-body');
const auditEmptyState = document.getElementById('audit-empty-state');
const auditLoadingState = document.getElementById('audit-loading-state');

const eventDrawer = document.getElementById('event-drawer');
const btnCloseDrawer = document.getElementById('btn-close-drawer');
const drawerEventId = document.getElementById('drawer-event-id');
const drawerEventTime = document.getElementById('drawer-event-time');
const drawerEventSeverity = document.getElementById('drawer-event-severity');
const drawerActorAvatar = document.getElementById('drawer-actor-avatar');
const drawerActorName = document.getElementById('drawer-actor-name');
const drawerActorId = document.getElementById('drawer-actor-id');
const drawerActorIp = document.getElementById('drawer-actor-ip');
const drawerActorUa = document.getElementById('drawer-actor-ua');
const drawerTargetName = document.getElementById('drawer-target-name');
const drawerTargetId = document.getElementById('drawer-target-id');
const drawerJson = document.getElementById('drawer-json');

// API Failover Fetcher
async function pulseApiFetch(path, options = {}) {
    let cleanPath = path;
    if (cleanPath.startsWith('https://')) {
        cleanPath = cleanPath.replace(PULSE_API_PRIMARY, '').replace(PULSE_API_FALLBACK, '');
    }
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${PULSE_API_PRIMARY}${cleanPath}`, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok || (res.status >= 400 && res.status < 500)) return res;
        throw new Error(`Primary status: ${res.status}`);
    } catch (e) {
        console.warn(`[PulseAPI] Fallback for ${cleanPath}:`, e.message);
        return fetch(`${PULSE_API_FALLBACK}${cleanPath}`, options);
    }
}

// Check Discord ID
function getDiscordId(user) {
    if (!user) return null;
    if (user.user_metadata && user.user_metadata.sub) return user.user_metadata.sub;
    if (user.user_metadata && user.user_metadata.provider_id) return user.user_metadata.provider_id;
    if (user.identities && user.identities.length > 0) {
        const discordIdentity = user.identities.find(id => id.provider === 'discord');
        if (discordIdentity && discordIdentity.id) return discordIdentity.id;
    }
    return user.id;
}

function isOwner(user) {
    if (!user) return false;
    const discordId = String(getDiscordId(user) || "");
    const username = String(user.user_metadata?.user_name || user.user_metadata?.username || user.user_metadata?.name || "").toLowerCase();
    if (OWNER_DISCORD_IDS.includes(discordId)) return true;
    if (username === "sticky._.1" || username === "errora" || username.includes("error404") || username.includes("udzlieresi")) return true;
    return false;
}

// Authentication Check
async function checkAuthGate(passedUser) {
    let user = passedUser;
    if (user === undefined) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        user = session?.user;
    }

    if (!user) {
        // Not logged in -> Show Discord Login Prompt
        if (authGateModal) authGateModal.classList.remove('hidden');
        if (authGateLogin) authGateLogin.classList.remove('hidden');
        if (authGateDenied) authGateDenied.classList.add('hidden');
        if (mainDashboard) mainDashboard.classList.add('hidden');
        return;
    }

    if (!isOwner(user)) {
        // Logged in, but NOT the Owner -> STRICT BLOCK
        const username = user.user_metadata?.user_name || user.user_metadata?.name || "User";
        const discId = getDiscordId(user) || user.id;
        if (authGateModal) authGateModal.classList.remove('hidden');
        if (authGateLogin) authGateLogin.classList.add('hidden');
        if (authGateDenied) authGateDenied.classList.remove('hidden');
        if (mainDashboard) mainDashboard.classList.add('hidden');
        if (deniedUserInfo) deniedUserInfo.textContent = `მომხმარებელი: ${username} (Discord ID: ${discId})`;
        return;
    }

    // Owner verified!
    currentOwner = user;
    if (authGateModal) authGateModal.classList.add('hidden');
    if (mainDashboard) mainDashboard.classList.remove('hidden');

    const meta = user.user_metadata || {};
    const avatar = meta.avatar_url || meta.picture || "logo.png";
    const username = meta.user_name || meta.custom_claims?.username || meta.full_name || "sticky._.1";

    if (headerAvatar) headerAvatar.src = avatar;
    if (headerUsername) headerUsername.textContent = username;

    // Start fetching logs
    loadAllAuditData();
    setupAutoRefresh();
}

// Global Auth State Change Listener
try {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log("[Auth] Event:", event);
        if (event === 'SIGNED_IN' && session) {
            checkAuthGate(session.user);
        } else if (event === 'SIGNED_OUT') {
            checkAuthGate(null);
        }
    });
} catch (e) {
    console.warn("[Auth] Listener init error:", e);
}

// Fetch Logs and Stats
async function loadAllAuditData() {
    auditLoadingState.classList.remove('hidden');
    auditEmptyState.classList.add('hidden');

    await Promise.allSettled([
        fetchAuditLogs(),
        fetchAuditStats()
    ]);

    auditLoadingState.classList.add('hidden');
}

async function fetchAuditLogs() {
    try {
        const timeframe = filterTimeframe.value;
        const res = await pulseApiFetch(`/audit/list?limit=500&timeframe=${encodeURIComponent(timeframe)}`);
        if (res.ok) {
            const data = await res.json();
            if (data.status === 'success') {
                allLogs = data.logs || [];
                applyFilters();
                return;
            }
        }
        throw new Error("Failed to load logs from API");
    } catch (err) {
        console.warn("[AuditPortal] API fetch failed, trying direct Supabase query:", err.message);
        try {
            const { data, error } = await supabaseClient
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(300);

            if (!error && data) {
                allLogs = data.map(row => ({
                    id: row.id,
                    created_at: row.created_at,
                    actor_id: row.actor_id,
                    actor_name: row.actor_name,
                    actor_role: row.actor_role,
                    action_type: row.action_type,
                    target_id: row.target_id,
                    target_name: row.target_name,
                    severity: row.severity,
                    ip_address: row.ip_address,
                    details: row.details || {}
                }));
                applyFilters();
            }
        } catch (sbErr) {
            console.error("[AuditPortal] Supabase direct query error:", sbErr);
        }
    }
}

async function fetchAuditStats() {
    try {
        const res = await pulseApiFetch('/audit/stats');
        if (res.ok) {
            const data = await res.json();
            if (data.status === 'success') {
                statStaffActions.textContent = data.staff_actions_24h || 0;
                statActiveStaff.textContent = (data.staff_breakdown || []).length;
                statCriticalEvents.textContent = data.critical_24h || 0;
                statUserEvents.textContent = data.user_actions_24h || 0;
                statClientVerifies.textContent = data.client_verifies_24h || 0;

                renderStaffLeaderboard(data.staff_breakdown || []);
            }
        }
    } catch (e) {
        console.warn("[AuditPortal] Stats error:", e.message);
    }
}

// Render Staff Leaderboard
function renderStaffLeaderboard(staffMembers) {
    if (!staffCardsContainer) return;
    staffCardsContainer.innerHTML = '';

    if (!staffMembers || staffMembers.length === 0) {
        staffCardsContainer.innerHTML = `<div style="grid-column: 1 / -1; padding: 20px; text-align: center; color: var(--text-muted);">Staff წევრების აქტივობა ბოლო 24 საათში არ ფიქსირდება.</div>`;
        return;
    }

    staffMembers.forEach(s => {
        const actions = s.action_breakdown || {};
        const keysCreated = actions['STAFF_LICENSE_CREATE'] || 0;
        const hwidsReset = actions['STAFF_HWID_RESET'] || 0;
        const cmdsSent = actions['STAFF_REMOTE_CMD'] || 0;

        const card = document.createElement('div');
        card.className = 'staff-card glass-panel';
        if (selectedStaffFilter === s.actor_id) {
            card.style.borderColor = 'var(--neon-cyan)';
            card.style.boxShadow = '0 0 16px rgba(0, 240, 255, 0.2)';
        }

        const isOwnerCard = s.actor_role === 'owner';
        const roleLabel = isOwnerCard ? '👑 Owner' : '🛡️ Staff';

        card.innerHTML = `
            <div class="staff-card-header">
                <img src="logo.png" class="staff-avatar" alt="Avatar">
                <div class="staff-meta">
                    <h3>${escapeHtml(s.actor_name)} <span class="role-badge ${isOwnerCard ? 'role-owner' : 'role-staff'}">${roleLabel}</span></h3>
                    <div class="discord-id">ID: ${escapeHtml(s.actor_id)}</div>
                </div>
            </div>
            <div class="staff-stats-row">
                <div class="staff-stat-box">
                    <div class="num">${s.total_actions || 0}</div>
                    <div class="label">სულ მოქმედება</div>
                </div>
                <div class="staff-stat-box">
                    <div class="num" style="color: #38bdf8;">${keysCreated}</div>
                    <div class="label">გასაღები</div>
                </div>
                <div class="staff-stat-box">
                    <div class="num" style="color: #fbbf24;">${hwidsReset}</div>
                    <div class="label">HWID Reset</div>
                </div>
            </div>
            <div class="staff-footer">
                <span>ბოლო IP: <code class="ip-chip">${escapeHtml(s.last_ip || 'N/A')}</code></span>
                <button type="button" class="btn-cyber" style="padding: 4px 10px; font-size: 11px;" onclick="filterBySpecificStaff('${escapeHtml(s.actor_id)}')">
                    ${selectedStaffFilter === s.actor_id ? '✕ გაუქმება' : '🔍 ლოგები'}
                </button>
            </div>
        `;
        staffCardsContainer.appendChild(card);
    });
}

window.filterBySpecificStaff = function(actorId) {
    if (selectedStaffFilter === actorId) {
        selectedStaffFilter = null;
    } else {
        selectedStaffFilter = actorId;
    }
    applyFilters();
    fetchAuditStats();
};

// Filter & Tab Logic
function applyFilters() {
    const search = filterSearch.value.toLowerCase().trim();
    const role = filterRole.value.toLowerCase().trim();
    const action = filterAction.value.trim();
    const severity = filterSeverity.value.toLowerCase().trim();

    // Tab counts
    let countAll = 0;
    let countStaff = 0;
    let countUsers = 0;
    let countClient = 0;
    let countSecurity = 0;

    allLogs.forEach(l => {
        countAll++;
        const r = (l.actor_role || '').toLowerCase();
        const a = (l.action_type || '');
        const s = (l.severity || '').toLowerCase();

        if (r === 'staff' || r === 'admin' || a.startsWith('STAFF_')) countStaff++;
        if (r === 'user' || a.startsWith('USER_')) countUsers++;
        if (r === 'client' || a.startsWith('CLIENT_')) countClient++;
        if (s === 'critical' || s === 'warning') countSecurity++;
    });

    tabCountAll.textContent = countAll;
    tabCountStaff.textContent = countStaff;
    tabCountUsers.textContent = countUsers;
    tabCountClient.textContent = countClient;
    tabCountSecurity.textContent = countSecurity;

    // Filter array
    filteredLogs = allLogs.filter(l => {
        const r = (l.actor_role || '').toLowerCase();
        const a = (l.action_type || '');
        const s = (l.severity || '').toLowerCase();
        const detailsStr = JSON.stringify(l.details || {}).toLowerCase();

        // 1. Tab filter
        if (activeTab === 'staff' && !(r === 'staff' || r === 'admin' || a.startsWith('STAFF_'))) return false;
        if (activeTab === 'users' && !(r === 'user' || a.startsWith('USER_'))) return false;
        if (activeTab === 'client' && !(r === 'client' || a.startsWith('CLIENT_'))) return false;
        if (activeTab === 'security' && !(s === 'critical' || s === 'warning')) return false;

        // 2. Specific staff filter (from card)
        if (selectedStaffFilter && l.actor_id !== selectedStaffFilter) return false;

        // 3. Dropdown filters
        if (role && r !== role) return false;
        if (action && a !== action) return false;
        if (severity && s !== severity) return false;

        // 4. Search query
        if (search) {
            const matches = 
                (l.actor_name || '').toLowerCase().includes(search) ||
                (l.actor_id || '').toLowerCase().includes(search) ||
                (l.target_name || '').toLowerCase().includes(search) ||
                (l.target_id || '').toLowerCase().includes(search) ||
                (l.action_type || '').toLowerCase().includes(search) ||
                (l.ip_address || '').toLowerCase().includes(search) ||
                detailsStr.includes(search);
            if (!matches) return false;
        }

        return true;
    });

    filterResultsCount.textContent = filteredLogs.length;
    renderAuditTable(filteredLogs);
}

// Render Audit Logs Table
function renderAuditTable(logs) {
    auditTableBody.innerHTML = '';

    if (logs.length === 0) {
        auditEmptyState.classList.remove('hidden');
        return;
    }
    auditEmptyState.classList.add('hidden');

    logs.forEach(log => {
        const tr = document.createElement('tr');

        // Formatted Time (Tbilisi Asia/Tbilisi)
        const d = new Date(log.created_at);
        const timeStr = d.toLocaleDateString('ka-GE', {
            timeZone: 'Asia/Tbilisi',
            month: 'short',
            day: 'numeric'
        }) + ' ' + d.toLocaleTimeString('ka-GE', {
            timeZone: 'Asia/Tbilisi',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        // Actor Badge
        const r = (log.actor_role || 'staff').toLowerCase();
        let roleClass = 'role-staff';
        let roleText = '🛡️ STAFF';
        if (r === 'owner') { roleClass = 'role-owner'; roleText = '👑 OWNER'; }
        else if (r === 'user') { roleClass = 'role-user'; roleText = '🎮 USER'; }
        else if (r === 'client') { roleClass = 'role-client'; roleText = '⛏️ CLIENT'; }
        else if (r === 'system') { roleClass = 'role-system'; roleText = '🤖 SYSTEM'; }

        // Action Chip
        const { actionClass, actionLabel, actionIcon } = getActionMeta(log.action_type);

        // Summary Text
        const details = log.details || {};
        let summary = details.description || details.title || log.action_type;
        if (details.cmd_type && details.payload) {
            summary = `ბრძანება: [${details.cmd_type.toUpperCase()}] ${details.payload}`;
        }

        // Severity
        const sev = (log.severity || 'info').toLowerCase();
        const sevClass = sev === 'critical' ? 'severity-critical' : (sev === 'warning' ? 'severity-warning' : 'severity-info');

        // Target
        const targetStr = log.target_name || log.target_id || '—';

        tr.innerHTML = `
            <td style="white-space: nowrap; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">${timeStr}</td>
            <td>
                <div style="display: flex; flex-direction: column;">
                    <strong style="color: #fff; font-size: 13.5px;">${escapeHtml(log.actor_name || 'Unknown')}</strong>
                    <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dim);">${escapeHtml(log.actor_id || '')}</span>
                </div>
            </td>
            <td><span class="role-badge ${roleClass}">${roleText}</span></td>
            <td>
                <span class="action-chip ${actionClass}">${actionIcon} ${actionLabel}</span>
            </td>
            <td>
                <code class="key-code" title="${escapeHtml(targetStr)}">${escapeHtml(truncate(targetStr, 22))}</code>
            </td>
            <td style="max-width: 320px; font-size: 12.5px; color: #d1d5db; line-height: 1.4;">
                ${escapeHtml(truncate(summary, 65))}
            </td>
            <td>
                <span class="ip-chip">${escapeHtml(log.ip_address || 'Hidden')}</span>
            </td>
            <td>
                <span class="severity-pill ${sevClass}">${sev.toUpperCase()}</span>
            </td>
            <td style="text-align: right;">
                <button type="button" class="btn-cyber" style="padding: 4px 10px; font-size: 12px;" onclick='openInspectorDrawer(${JSON.stringify(log).replace(/'/g, "&apos;")})'>
                    🔍 ნახვა
                </button>
            </td>
        `;

        auditTableBody.appendChild(tr);
    });
}

function getActionMeta(actionType) {
    switch (actionType) {
        case 'STAFF_LICENSE_CREATE':
            return { actionClass: 'action-create', actionLabel: 'ლიცენზიის შექმნა', actionIcon: '🔑' };
        case 'STAFF_LICENSE_REVOKE':
            return { actionClass: 'action-revoke', actionLabel: 'ლიცენზიის გაუქმება', actionIcon: '🚫' };
        case 'STAFF_LICENSE_ACTIVATE':
            return { actionClass: 'action-activate', actionLabel: 'გააქტიურება', actionIcon: '✅' };
        case 'STAFF_HWID_RESET':
            return { actionClass: 'action-hwid', actionLabel: 'HWID განულება', actionIcon: '🖥️' };
        case 'STAFF_REMOTE_CMD':
            return { actionClass: 'action-cmd', actionLabel: 'C2 ბრძანება', actionIcon: '⚡' };
        case 'STAFF_REMOTE_SCREENSHOT':
            return { actionClass: 'action-shot', actionLabel: 'სქრინშოთი', actionIcon: '📸' };
        case 'STAFF_REMOTE_INSPECT':
            return { actionClass: 'action-cmd', actionLabel: 'ინსპექცია', actionIcon: '🎒' };
        case 'STAFF_TICKET_REPLY':
            return { actionClass: 'action-ticket', actionLabel: 'თიქეთზე პასუხი', actionIcon: '💬' };
        case 'STAFF_TICKET_DELETE':
            return { actionClass: 'action-revoke', actionLabel: 'თიქეთის წაშლა', actionIcon: '🗑️' };
        case 'USER_LOGIN':
            return { actionClass: 'action-activate', actionLabel: 'ავტორიზაცია', actionIcon: '🚪' };
        case 'USER_TRIAL_CLAIM':
            return { actionClass: 'action-create', actionLabel: 'Trial აღება', actionIcon: '🎁' };
        case 'USER_PROMO_REDEEM':
            return { actionClass: 'action-create', actionLabel: 'პრომოკოდი', actionIcon: '🎟️' };
        case 'USER_CLIENT_DOWNLOAD':
            return { actionClass: 'action-default', actionLabel: 'JAR გადმოწერა', actionIcon: '📦' };
        case 'CLIENT_VERIFY_SUCCESS':
            return { actionClass: 'action-verify', actionLabel: 'კლიენტი ონლაინ', actionIcon: '🎮' };
        case 'CLIENT_VERIFY_HWID_MISMATCH':
            return { actionClass: 'action-hwid', actionLabel: 'HWID Mismatch', actionIcon: '⚠️' };
        case 'CLIENT_VERIFY_BLACKLISTED':
            return { actionClass: 'action-revoke', actionLabel: 'Blacklist Block', actionIcon: '🚨' };
        default:
            return { actionClass: 'action-default', actionLabel: actionType || 'EVENT', actionIcon: '📡' };
    }
}

// Slide-out Event Inspector Drawer
window.openInspectorDrawer = function(log) {
    if (!eventDrawer) return;

    drawerEventId.textContent = log.id || '-';
    
    const d = new Date(log.created_at);
    drawerEventTime.textContent = d.toLocaleString('ka-GE', { timeZone: 'Asia/Tbilisi' });

    const sev = (log.severity || 'info').toLowerCase();
    drawerEventSeverity.textContent = sev.toUpperCase();
    drawerEventSeverity.className = `severity-pill severity-${sev}`;

    drawerActorAvatar.src = 'logo.png';
    drawerActorName.textContent = log.actor_name || 'Unknown';
    drawerActorId.textContent = `ID: ${log.actor_id || 'N/A'}`;
    drawerActorIp.textContent = log.ip_address || 'Unknown';
    drawerActorUa.textContent = log.user_agent || 'Unknown';

    drawerTargetName.textContent = log.target_name || '—';
    drawerTargetId.textContent = log.target_id || '—';

    drawerJson.textContent = JSON.stringify(log, null, 2);

    eventDrawer.classList.add('open');
};

if (btnCloseDrawer) {
    btnCloseDrawer.addEventListener('click', () => {
        eventDrawer.classList.remove('open');
    });
}

// Auto-Refresh Logic
function setupAutoRefresh() {
    if (refreshIntervalTimer) clearInterval(refreshIntervalTimer);
    const ms = parseInt(autoRefreshSelect.value, 10);
    if (ms > 0) {
        refreshIntervalTimer = setInterval(() => {
            fetchAuditLogs();
            fetchAuditStats();
        }, ms);
    }
}

// Export to CSV
function exportLogsToCsv() {
    if (filteredLogs.length === 0) {
        alert("საექსპორტო ლოგები არ მოიძებნა!");
        return;
    }

    const headers = ["ID", "Time (Tbilisi)", "Actor Name", "Actor ID", "Actor Role", "Action", "Target", "IP", "Severity", "Details JSON"];
    const rows = filteredLogs.map(l => {
        const d = new Date(l.created_at);
        const timeStr = d.toLocaleString('ka-GE', { timeZone: 'Asia/Tbilisi' });
        return [
            `"${l.id}"`,
            `"${timeStr}"`,
            `"${(l.actor_name || '').replace(/"/g, '""')}"`,
            `"${l.actor_id || ''}"`,
            `"${l.actor_role || ''}"`,
            `"${l.action_type || ''}"`,
            `"${(l.target_name || l.target_id || '').replace(/"/g, '""')}"`,
            `"${l.ip_address || ''}"`,
            `"${l.severity || ''}"`,
            `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`
        ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pulse_Sentinel_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Utilities
function truncate(str, len) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Event Listeners
function setupListeners() {
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.dataset.tab;

            // Show/Hide staff leaderboard
            if (activeTab === 'staff') {
                staffLeaderboardSection.classList.remove('hidden');
            } else {
                staffLeaderboardSection.classList.add('hidden');
            }

            applyFilters();
        });
    });

    // Filters
    if (filterSearch) filterSearch.addEventListener('input', applyFilters);
    if (filterRole) filterRole.addEventListener('change', applyFilters);
    if (filterAction) filterAction.addEventListener('change', applyFilters);
    if (filterSeverity) filterSeverity.addEventListener('change', applyFilters);
    if (filterTimeframe) filterTimeframe.addEventListener('change', () => {
        fetchAuditLogs();
        fetchAuditStats();
    });

    if (btnResetFilters) {
        btnResetFilters.addEventListener('click', () => {
            filterSearch.value = '';
            filterRole.value = '';
            filterAction.value = '';
            filterSeverity.value = '';
            filterTimeframe.value = '24h';
            selectedStaffFilter = null;
            applyFilters();
            fetchAuditStats();
        });
    }

    if (autoRefreshSelect) {
        autoRefreshSelect.addEventListener('change', setupAutoRefresh);
    }

    if (btnRefreshNow) {
        btnRefreshNow.addEventListener('click', () => {
            btnRefreshNow.textContent = '⏳ განახლება...';
            loadAllAuditData().finally(() => {
                btnRefreshNow.textContent = '🔄 განახლება';
            });
        });
    }

    // Export
    if (btnExportCsv) {
        btnExportCsv.addEventListener('click', exportLogsToCsv);
    }
}

// Global Login With Discord Handler
async function loginWithDiscord() {
    console.log("[Auth] Initiating Discord OAuth...");
    const btn = document.getElementById('btn-discord-login');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span style="display:inline-block;animation:spin 1s linear infinite;">⏳</span> გადამისამართება...`;
    }

    try {
        const targetRedirect = window.location.origin + window.location.pathname;
        console.log("[Auth] Redirect target:", targetRedirect);

        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: targetRedirect
            }
        });

        if (data && data.url) {
            window.location.assign(data.url);
            return;
        }

        // Direct guaranteed fallback to Supabase authorize endpoint
        const directUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=discord&redirect_to=${encodeURIComponent(targetRedirect)}`;
        window.location.assign(directUrl);
    } catch (err) {
        console.warn("[Auth] SDK error, using direct redirect:", err);
        const directUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=discord&redirect_to=${encodeURIComponent(window.location.origin + '/logs')}`;
        window.location.assign(directUrl);
    }
}
window.loginWithDiscord = loginWithDiscord;

async function handleLogout() {
    try {
        await supabaseClient.auth.signOut();
    } catch (e) {}
    window.location.href = window.location.origin + '/logs';
}
window.handleLogout = handleLogout;

// Initializer
function initApp() {
    setupListeners();
    checkAuthGate();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
