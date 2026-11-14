// Global HTML Sanitizer
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
window.escapeHtml = escapeHtml;





// ==========================================



// CENTRALIZED AUDIT & SURVEILLANCE ENGINE



// ==========================================



async function logAuditEvent({



    action_type = "ACTION",



    title = "",



    description = "",



    target_id = null,



    target_name = null,



    severity = "info",



    details = {},



    actor_id = null,



    actor_name = null,



    actor_role = null



}) {



    try {



        let finalActorId = actor_id;



        let finalActorName = actor_name;



        let finalActorRole = actor_role;







        if (!finalActorId && typeof currentUser !== 'undefined' && currentUser) {



            finalActorId = String((typeof getDiscordId === 'function' ? getDiscordId(currentUser) : null) || currentUser.id || "guest");



            const meta = currentUser.user_metadata || {};



            finalActorName = meta.user_name || meta.custom_claims?.username || meta.full_name || meta.name || "User";



        }



        if (!finalActorName) finalActorName = "User";







        if (!finalActorRole) {



            if (typeof isOwner === 'function' && isOwner()) finalActorRole = "owner";



            else if (typeof isAdmin === 'function' && isAdmin()) finalActorRole = "staff";



            else finalActorRole = "user";



        }







        const payload = {



            actor_id: String(finalActorId || "anonymous"),



            actor_name: String(finalActorName),



            actor_role: String(finalActorRole),



            action_type: String(action_type),



            target_id: target_id ? String(target_id) : null,



            target_name: target_name ? String(target_name) : null,



            severity: severity || "info",



            details: {



                title: title || "",



                description: description || "",



                path: window.location.pathname,



                ...details



            }



        };







        // Dispatch to central API Gateway



        if (typeof pulseApiFetch === 'function') {



            pulseApiFetch('/audit/log', {



                method: 'POST',



                headers: { 'Content-Type': 'application/json' },



                body: JSON.stringify(payload)



            }).catch(e => console.warn('[Audit] API log error:', e.message));



        }







        // Direct push to Supabase if client initialized



        try {



            if (window.supabaseClient) {



                window.supabaseClient.from('audit_logs').insert([{



                    actor_id: payload.actor_id,



                    actor_name: payload.actor_name,



                    actor_role: payload.actor_role,



                    action_type: payload.action_type,



                    target_id: payload.target_id,



                    target_name: payload.target_name,



                    severity: payload.severity,



                    details: payload.details



                }]).then(() => {}).catch(() => {});



            }



        } catch (e) {}







    } catch (err) {



        console.warn("[Audit] logAuditEvent failed:", err);



    }



}



window.logAuditEvent = logAuditEvent;







async function sendDiscordAuditLog(title, description, color, fields = []) {



    let actionType = "WEBSITE_EVENT";



    let severity = "info";



    let details = {};







    if (Array.isArray(fields)) {



        fields.forEach(f => {



            if (f && f.name) details[f.name] = f.value;



        });



    }







    const tLower = (title || "").toLowerCase();



    if (tLower.includes("create") || tLower.includes("New license")) {



        actionType = "STAFF_LICENSE_CREATE";



        severity = "info";



    } else if (tLower.includes("has been cancelled") || tLower.includes("revoke")) {



        actionType = "STAFF_LICENSE_REVOKE";



        severity = "warning";



    } else if (tLower.includes("permanently deleted") || tLower.includes("purge") || tLower.includes("permanent delete")) {



        actionType = "OWNER_LICENSE_PERMANENT_DELETE";



        severity = "critical";



    } else if (tLower.includes("is activated") || tLower.includes("activate")) {



        actionType = "STAFF_LICENSE_ACTIVATE";



        severity = "info";



    } else if (tLower.includes("hwid")) {



        actionType = tLower.includes("admin") ? "STAFF_HWID_RESET" : "USER_HWID_RESET";



        severity = "warning";



    } else if (tLower.includes("trial")) {



        actionType = "USER_TRIAL_CLAIM";



        severity = "info";



    } else if (tLower.includes("promo code")) {



        actionType = "USER_PROMO_REDEEM";



        severity = "info";



    } else if (tLower.includes("log in") || tLower.includes("Authorization")) {



        actionType = "USER_LOGIN";



        severity = "info";



    } else if (tLower.includes("Download") || tLower.includes(".jar")) {



        actionType = "USER_CLIENT_DOWNLOAD";



        severity = "info";



    } else if (tLower.includes("config")) {



        actionType = "USER_CONFIG_SHARE";



        severity = "info";



    }







    return logAuditEvent({



        action_type: actionType,



        title: title,



        description: description,



        severity: severity,



        details: details



    });



}



window.sendDiscordAuditLog = sendDiscordAuditLog;











// Central PulseClient API Gateway with Zero-Downtime Failover



const PULSE_API_PRIMARY = 'https://api.pulseclient.xyz';



const PULSE_API_FALLBACK = 'https://errormissing-pulse-bot.hf.space';







// Server Clock Synchronization & Drift Compensation



let serverClockOffset = 0; // serverTime - Date.now()



let hasServerTimeSync = false;







function recordServerTime(serverMs) {



    if (!serverMs || isNaN(serverMs) || serverMs <= 0) return;



    serverClockOffset = serverMs - Date.now();



    hasServerTimeSync = true;



}







function extractServerTimeFromResponse(res) {



    if (!res || !res.headers) return;



    try {



        const sTime = res.headers.get('x-server-time');



        if (sTime) {



            const parsed = parseInt(sTime, 10);



            if (!isNaN(parsed) && parsed > 0) {



                recordServerTime(parsed);



                return;



            }



        }



        const dateHeader = res.headers.get('date');



        if (dateHeader) {



            const d = new Date(dateHeader).getTime();



            if (!isNaN(d) && d > 0) {



                recordServerTime(d);



            }



        }



    } catch (e) {}



}







function getServerNow() {



    return Date.now() + serverClockOffset;



}







async function pulseApiFetch(urlOrPath, options = {}) {



    if (typeof isVpnBlocked !== 'undefined' && isVpnBlocked && !(typeof isOwner === 'function' && isOwner())) {



        console.warn("[PulseGuard] Outgoing API request blocked due to active VPN barrier:", urlOrPath);



        throw new Error("Action blocked by Anti-VPN Protection");



    }



    let path = urlOrPath;



    if (path.startsWith('https://errormissing-pulse-bot.hf.space')) {



        path = path.replace('https://errormissing-pulse-bot.hf.space', '');



    } else if (path.startsWith('https://api.pulseclient.xyz')) {



        path = path.replace('https://api.pulseclient.xyz', '');



    }



    if (!path.startsWith('/')) path = '/' + path;







    try {



        const primaryUrl = `${PULSE_API_PRIMARY}${path}`;



        const controller = new AbortController();



        const timeoutMs = options.timeout || 6000;



        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);



        const res = await fetch(primaryUrl, { ...options, signal: controller.signal });



        clearTimeout(timeoutId);



        extractServerTimeFromResponse(res);



        if (res.ok || (res.status >= 400 && res.status < 500)) {



            return res;



        }



        throw new Error(`Primary status: ${res.status}`);



    } catch (err) {



        console.warn(`[PulseAPI] Primary failed (${path}), falling back to HF:`, err.message);



        const fallbackUrl = `${PULSE_API_FALLBACK}${path}`;



        const fallbackRes = await fetch(fallbackUrl, options);



        extractServerTimeFromResponse(fallbackRes);



        return fallbackRes;



    }



}







// Proactively sync server time on page load



(async function initServerTimeSync() {



    try {



        const res = await pulseApiFetch('/status');



        extractServerTimeFromResponse(res);



    } catch (e) {}



})();











// Initialize Supabase Client



const supabaseUrl = "https://qxyggegnnxdsgjcutsrl.supabase.co";



const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eWdnZWdubnhkc2dqY3V0c3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzQ0ODIsImV4cCI6MjA5NTExMDQ4Mn0.mKywX8VuzrSJs8cijweg2jdKboYupE2GZUWX_LY9CMg";







const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Cached licenses for the device-slot / HWID widgets.
let userLicenses = [];







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



const GITHUB_JAR_FILE = 'PulseClient-Fabric-1.21.11-v8.jar';



const GITHUB_PVP_JAR_FILE = GITHUB_JAR_FILE;



const GITHUB_BASEFIND_JAR_FILE = GITHUB_JAR_FILE;







const GITHUB_CLIENT_DOWNLOAD_URL = "./PulseClient-Fabric-1.21.11-v8.jar";



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



const ADMIN_DISCORD_IDS = ["1475396409246089367", "1158855771031867432", "1272601735051083797", "1350538035342737441", ""];



let currentUser = null;
let currentUserProfile = null;
let supabaseAdminRecords = [];



let adminLicenses = [];



let allUserProfiles = [];



let activeOnlineUsersCount = 0;







// -----------------------------



// PRICING: centralized plan data & formatter



// -----------------------------



const PRICING_PLANS = [



  // cardIndex corresponds to DOM nth-child() inside #pricing .pricing-grid



  { cardIndex: 2, planId: 'weekly', price_cents: 199, currency: 'USD', periodKey: 'pricing.per7' },



  { cardIndex: 3, planId: 'lifetime', price_cents: 1500, currency: 'USD', periodKey: 'pricing.once' },



  { cardIndex: 4, planId: 'monthly', price_cents: 1000, currency: 'USD', periodKey: 'pricing.per30' }



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
  return; // Pricing plans removed (PulseClient is now 100% Free)



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



// PURCHASE FLOW — KISA.GE DONATION



// ==========================================



const KISA_DONATE_URL = "https://www.kisa.ge/donate/av4d6186h6";



const USD_GEL_FALLBACK_RATE = 2.60;



const PURCHASE_PLANS = {



    weekly: { name: "Weekly", priceUsd: 1.99, durationKey: "pay.dur7" },



    monthly: { name: "Monthly", priceUsd: 10.00, durationKey: "pay.dur30" },



    lifetime: { name: "Lifetime", priceUsd: 15.00, durationKey: "pay.durLifetime" }



};







let activePurchasePlan = "lifetime";



let usdGelRate = USD_GEL_FALLBACK_RATE;







function purchaseT(key, vars = {}) {



    return (typeof window.t === "function") ? window.t(key, vars) : key;



}







async function fetchUsdGelRate() {



    try {



        const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });



        if (!res.ok) return;



        const data = await res.json();



        const rate = data && data.rates && Number(data.rates.GEL);



        if (rate > 0.5 && rate < 20) usdGelRate = rate;



    } catch (e) {



        console.warn("GEL rate fetch fallback:", e);



    }



}







function getPurchaseGelAmount(planKey) {



    const plan = PURCHASE_PLANS[planKey] || PURCHASE_PLANS.lifetime;



    return Math.ceil(plan.priceUsd * usdGelRate).toFixed(0);



}







function buildDonationMessage(planKey) {



    const plan = PURCHASE_PLANS[planKey] || PURCHASE_PLANS.lifetime;



    const discordId = currentUser ? (getDiscordId(currentUser) || currentUser.id || "-") : "-";



    return purchaseT("pay.msgTemplate", {



        id: String(discordId),



        duration: purchaseT(plan.durationKey)



    });



}







function updatePurchaseModalUI() {



    const plan = PURCHASE_PLANS[activePurchasePlan] || PURCHASE_PLANS.lifetime;







    const gelEl = document.getElementById("pay-gel-amount");



    if (gelEl) gelEl.textContent = `₾${getPurchaseGelAmount(activePurchasePlan)}`;







    const usdEl = document.getElementById("pay-usd-amount");



    if (usdEl) usdEl.textContent = `$${plan.priceUsd.toFixed(2)} USD`;







    const nameEl = document.getElementById("pay-plan-name");



    if (nameEl) nameEl.textContent = plan.name;







    const durationEl = document.getElementById("pay-plan-duration");



    if (durationEl) durationEl.textContent = purchaseT(plan.durationKey);







    const rateEl = document.getElementById("pay-rate-note");



    if (rateEl) rateEl.textContent = purchaseT("pay.rate", { rate: usdGelRate.toFixed(4) });







    const stepAmountEl = document.getElementById("pay-step-amount");



    if (stepAmountEl) stepAmountEl.textContent = `₾${getPurchaseGelAmount(activePurchasePlan)}`;







    const messageEl = document.getElementById("pay-message");



    if (messageEl) messageEl.value = buildDonationMessage(activePurchasePlan);







    document.querySelectorAll(".crypto-plan-card[data-purchase-plan]").forEach((card) => {



        card.classList.toggle("active", card.getAttribute("data-purchase-plan") === activePurchasePlan);



    });



}



window.updatePurchaseModalUI = updatePurchaseModalUI;







function setPayCopiedState(done) {



    const step2 = document.getElementById("pay-step-2");



    const step3 = document.getElementById("pay-step-3");



    if (!step2 || !step3) return;







    step2.classList.toggle("completed", done);



    step3.classList.toggle("is-next", done);







    const num = step2.querySelector(".pay-step-num");



    if (num) num.textContent = done ? "✓" : "2";



}







function resetPayCopyState() {



    setPayCopiedState(false);



    const statusEl = document.getElementById("pay-copy-status");



    if (statusEl) {



        statusEl.textContent = "";



        statusEl.className = "pay-copy-status";



    }



}



window.resetPayCopyState = resetPayCopyState;







function selectPurchasePlan(plan) {



    if (!PURCHASE_PLANS[plan]) return;



    activePurchasePlan = plan;



    resetPayCopyState();



    updatePurchaseModalUI();



}



window.selectPurchasePlan = selectPurchasePlan;







async function showPurchaseModal(plan = "lifetime", event) {



    if (event) event.preventDefault();







    if (!currentUser) {



        showBanner("Please authenticate with Discord so that your Discord ID is included in the message!", "info");



        signInWithDiscord();



        return;



    }







    activePurchasePlan = PURCHASE_PLANS[plan] ? plan : "lifetime";



    resetPayCopyState();



    updatePurchaseModalUI();







    const modal = document.getElementById("crypto-purchase-modal");



    if (modal) modal.classList.remove("hidden");







    await fetchUsdGelRate();



    updatePurchaseModalUI();



}



window.showPurchaseModal = showPurchaseModal;







function closePurchaseModal() {



    const modal = document.getElementById("crypto-purchase-modal");



    if (modal) modal.classList.add("hidden");



}



window.closePurchaseModal = closePurchaseModal;







function copyDonationMessage(btn) {



    const input = document.getElementById("pay-message");



    if (!input) return;







    const statusEl = document.getElementById("pay-copy-status");







    const setStatus = (message, isError) => {



        if (!statusEl) return;



        statusEl.textContent = message;



        statusEl.className = isError ? "pay-copy-status visible error" : "pay-copy-status visible";



    };







    const showCopied = () => {



        setStatus(purchaseT("pay.copySuccess"), false);



        setPayCopiedState(true);



        input.blur();







        const step3 = document.getElementById("pay-step-3");



        if (step3 && step3.scrollIntoView) {



            step3.scrollIntoView({ behavior: "smooth", block: "nearest" });



        }



        if (!btn) return;



        const original = btn.innerHTML;



        btn.classList.add("copied");



        btn.innerHTML = `<span>${purchaseT("pay.copied")}</span>`;



        setTimeout(() => {



            btn.classList.remove("copied");



            btn.innerHTML = original;



        }, 2400);



    };







    const showFailed = () => {



        setStatus(purchaseT("pay.copyFail"), true);



        if (statusEl) statusEl.classList.add("visible", "error");



    };







    const fallbackCopy = () => {



        input.focus();



        input.select();



        input.setSelectionRange(0, input.value.length);



        try {



            const ok = document.execCommand("copy");



            if (ok) showCopied();



            else showFailed();



        } catch (e) {



            // Clipboard is unavailable; the message stays selectable.



            showFailed();



        }



    };







    if (navigator.clipboard && navigator.clipboard.writeText) {



        navigator.clipboard.writeText(input.value).then(showCopied).catch(fallbackCopy);



    } else {



        fallbackCopy();



    }



}



window.copyDonationMessage = copyDonationMessage;







function goToKisaDonation(event) {



    if (event) event.preventDefault();







    const input = document.getElementById("pay-message");



    const message = input ? input.value : "";



    const go = () => { window.location.href = KISA_DONATE_URL; };







    if (!message) {



        go();



        return;



    }







    if (navigator.clipboard && navigator.clipboard.writeText) {



        navigator.clipboard.writeText(message).then(() => {



            showBanner("The message has been copied! Paste it into the 'message' field on the wallet.", "info");



            setTimeout(go, 700);



        }).catch(go);



    } else {



        go();



    }



}



window.goToKisaDonation = goToKisaDonation;







let isVpnBlocked = false;







// Comprehensive Datacenter, Hosting, Cloud, and VPN Provider Signatures



const HOSTING_DATACENTER_REGEX = /\b(?:vpn|proxy|tor|datacenter|vps|m247|ovh|digitalocean|linode|hetzner|vultr|leaseweb|choopa|datacamp|cogent|clouvider|datapacket|hostinger|contabo|scaleway|zenlayer|kamatera|reliablesite|fdcservers|worldstream|smartdc|quadranet|serverius|buyvm|hostwinds|colocrossing|internap|nord|expressvpn|surfshark|mullvad|proton|cyberghost|windscribe|purevpn|tunnelbear|ipvanish|shadowsocks|wireguard|openvpn|socks5|exitnode)\b/i;







// WebRTC Candidate Public IP detector



function getWebRtcCandidateIp() {



    return new Promise((resolve) => {



        try {



            const RTC = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;



            if (!RTC) return resolve(null);



            const pc = new RTC({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });



            let done = false;



            pc.createDataChannel('');



            pc.createOffer().then(o => pc.setLocalDescription(o)).catch(() => {});



            pc.onicecandidate = (e) => {



                if (!e || !e.candidate || !e.candidate.candidate) return;



                const match = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(e.candidate.candidate);



                if (match) {



                    const ip = match[1];



                    if (!/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.|0\.)/.test(ip)) {



                        if (!done) {



                            done = true;



                            try { pc.close(); } catch(err){}



                            resolve(ip);



                        }



                    }



                }



            };



            setTimeout(() => {



                if (!done) {



                    try { pc.close(); } catch(err){}



                    resolve(null);



                }



            }, 1200);



        } catch (e) {



            resolve(null);



        }



    });



}







// Multi-layered Anti-VPN & Anti-Proxy Intelligence Engine



async function checkVpnProxy() {



    if (typeof isOwner === 'function' && isOwner()) {



        if (typeof releaseVpnLock === 'function') releaseVpnLock();



        return false;



    }







    // Check if previously flagged in this session



    if (sessionStorage.getItem('pulse_vpn_blocked') === 'true') {



        if (typeof isOwner === 'function' && isOwner()) {



            if (typeof releaseVpnLock === 'function') releaseVpnLock();



            return false;



        }



        return true;



    }







    let detectedIp = null;



    let isFlagged = false;



    const reasons = [];







    const fetchWithTimeout = (url, opts = {}, ms = 3000) => {



        const controller = new AbortController();



        const id = setTimeout(() => controller.abort(), ms);



        return fetch(url, { ...opts, credentials: 'omit', signal: controller.signal })



            .finally(() => clearTimeout(id));



    };







    // Layer 1: freeipapi.com (Client IP resolution + isProxy + ASN check)



    try {



        const res = await fetchWithTimeout('https://freeipapi.com/api/json/');



        if (res.ok) {



            const data = await res.json();



            detectedIp = data.ipAddress;



            if (data.isProxy === true) {



                isFlagged = true;



                reasons.push('Proxy flagged by freeipapi');



            }



            const org = String(data.asnOrganization || '');



            if (HOSTING_DATACENTER_REGEX.test(org)) {



                isFlagged = true;



                reasons.push(`Datacenter ASN matched: ${org}`);



            }



        }



    } catch (e) {}







    // Layer 2: Blackbox Threat Intelligence Lookup



    if (detectedIp) {



        try {



            const res = await fetchWithTimeout(`https://blackbox.ipinfo.app/lookup/${detectedIp}`);



            if (res.ok) {



                const text = (await res.text()).trim();



                if (text === 'Y') {



                    isFlagged = true;



                    reasons.push('Flagged by Blackbox IP intelligence');



                }



            }



        } catch (e) {}



    }







    // Layer 3: api.ipquery.io Dedicated Threat Engine



    if (!isFlagged) {



        try {



            const targetUrl = detectedIp ? `https://api.ipquery.io/${detectedIp}` : 'https://api.ipquery.io/';



            const res = await fetchWithTimeout(targetUrl);



            if (res.ok) {



                const data = await res.json();



                if (!detectedIp && data.ip) detectedIp = data.ip;



                const risk = data.risk || {};



                const isp = data.isp || {};



                if (risk.is_vpn || risk.is_tor || risk.is_proxy || (risk.risk_score && risk.risk_score >= 80)) {



                    isFlagged = true;



                    reasons.push(`IPQuery risk flag (VPN: ${risk.is_vpn}, Proxy: ${risk.is_proxy})`);



                }



                const ispDetails = `${isp.org || ''} ${isp.isp || ''} ${isp.asn || ''}`;



                if (HOSTING_DATACENTER_REGEX.test(ispDetails)) {



                    isFlagged = true;



                    reasons.push(`Datacenter provider matched: ${ispDetails}`);



                }



            }



        } catch (e) {}



    }







    // Layer 4: ipwho.is Deep Provider & Security Analysis



    if (!isFlagged) {



        try {



            const targetUrl = detectedIp ? `https://ipwho.is/${detectedIp}` : 'https://ipwho.is/';



            const res = await fetchWithTimeout(targetUrl);



            if (res.ok) {



                const data = await res.json();



                if (!detectedIp && data.ip) detectedIp = data.ip;



                const conn = data.connection || {};



                const sec = data.security || {};



                if (sec.vpn || sec.proxy || sec.tor) {



                    isFlagged = true;



                    reasons.push('ipwho.is security flag (vpn/proxy/tor)');



                }



                const connStr = `${conn.org || ''} ${conn.isp || ''} ${conn.domain || ''}`;



                if (HOSTING_DATACENTER_REGEX.test(connStr)) {



                    isFlagged = true;



                    reasons.push(`Datacenter match: ${connStr}`);



                }



            }



        } catch (e) {}



    }







        if (isFlagged) {

        console.warn(`[PulseGuard] Anti-VPN / Anti-Proxy BLOCKED! Reasons:`, reasons);

        sessionStorage.setItem('pulse_vpn_blocked', 'true');

        if (detectedIp) sessionStorage.setItem('pulse_vpn_blocked_ip', detectedIp);

        return true;

    }







    sessionStorage.removeItem('pulse_vpn_blocked');



    return false;



}







function enforceVpnLock() {



    if (typeof isOwner === 'function' && isOwner()) {



        releaseVpnLock();



        return;



    }



    isVpnBlocked = true;



    document.body.classList.add('vpn-locked');



    if (vpnBlockPage) vpnBlockPage.classList.remove('hidden');



    if (authGatePage) authGatePage.classList.add('hidden');



    if (landingPage) landingPage.classList.add('hidden');



    if (dashboardPage) dashboardPage.classList.add('hidden');



    if (navLinks) navLinks.classList.add('hidden');



    const navProfile = document.getElementById('nav-user-profile');



    if (navProfile) navProfile.classList.add('hidden');



    const navDashBtn = document.getElementById('nav-dashboard-link');



    if (navDashBtn) navDashBtn.classList.add('hidden');



    const faqSec = document.getElementById('faq');



    if (faqSec) faqSec.classList.add('hidden');



        const footerEl = document.querySelector('footer');

    if (footerEl) footerEl.classList.add('hidden');

    if (!sessionStorage.getItem('pulse_vpn_blocked_ip')) {

        fetchPublicIp().then(ip => {

            if (ip && isVpnBlocked) sessionStorage.setItem('pulse_vpn_blocked_ip', ip);

        });

    }

    startVpnAutoRecheck();

}



function releaseVpnLock() {



        isVpnBlocked = false;

    document.body.classList.remove('vpn-locked');

    if (vpnBlockPage) vpnBlockPage.classList.add('hidden');

    stopVpnAutoRecheck();

    sessionStorage.removeItem('pulse_vpn_blocked');

    sessionStorage.removeItem('pulse_vpn_blocked_ip');



    const faqSec = document.getElementById('faq');



    if (faqSec) faqSec.classList.remove('hidden');



    const footerEl = document.querySelector('footer');



        if (footerEl) footerEl.classList.remove('hidden');
}

// ==================== AUTO VPN/PROXY RECHECK ====================
// While the blocker is visible, watch the public IP. A changed IP means the
// VPN/proxy was turned off or switched, so the page re-runs the full check.
// The manual Reload button remains for split-tunnel/proxy cases where the IP
// does not change.
let vpnRecheckTimer = null;
let vpnRecheckInFlight = false;

function stopVpnAutoRecheck() {
    if (vpnRecheckTimer) {
        clearInterval(vpnRecheckTimer);
        vpnRecheckTimer = null;
    }
}

async function fetchPublicIp() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
        const res = await fetch('https://api.ipify.org?format=json', {
            cache: 'no-store',
            credentials: 'omit',
            signal: controller.signal
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data && data.ip ? String(data.ip) : null;
    } catch (e) {
        return null;
    } finally {
        clearTimeout(timer);
    }
}

function reloadAfterVpnCleared() {
    sessionStorage.removeItem('pulse_vpn_blocked');
    sessionStorage.removeItem('pulse_vpn_blocked_ip');
    window.location.reload();
}
window.reloadFromVpnBlock = reloadAfterVpnCleared;

async function recheckVpnClear() {
    if (!isVpnBlocked || vpnRecheckInFlight || document.visibilityState === 'hidden') return;
    vpnRecheckInFlight = true;
    try {
        const ip = await fetchPublicIp();
        const baseline = sessionStorage.getItem('pulse_vpn_blocked_ip');
        if (ip && baseline && ip !== baseline) {
            reloadAfterVpnCleared();
            return;
        }
        if (ip && !baseline) sessionStorage.setItem('pulse_vpn_blocked_ip', ip);
    } finally {
        vpnRecheckInFlight = false;
    }
}

function startVpnAutoRecheck() {
    stopVpnAutoRecheck();
    setTimeout(() => recheckVpnClear(), 3000);
    vpnRecheckTimer = setInterval(() => recheckVpnClear(), 12000);
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isVpnBlocked) recheckVpnClear();
});

window.enforceVpnLock = enforceVpnLock;
window.releaseVpnLock = releaseVpnLock;







// App Initialization



document.addEventListener('DOMContentLoaded', async () => {



    // Immediate pre-render barrier if flagged in current session



    if (sessionStorage.getItem('pulse_vpn_blocked') === 'true' && !(typeof isOwner === 'function' && isOwner())) {



        enforceVpnLock();



    }







    // Check for VPN / Proxy in background



    checkVpnProxy().then(isVpn => {



        if (isVpn && !(typeof isOwner === 'function' && isOwner())) {



            enforceVpnLock();



        } else if (!isVpn || (typeof isOwner === 'function' && isOwner())) {



            releaseVpnLock();



            if (!currentUser) {



                if (authGatePage) authGatePage.classList.remove('hidden');



                if (landingPage) landingPage.classList.add('hidden');



                if (dashboardPage) dashboardPage.classList.add('hidden');



                if (navLinks) navLinks.classList.add('hidden');



            }



        }



    });







    // Check active session



    const { data: { session }, error } = await supabaseClient.auth.getSession();



    if (session) {



        await handleUserSignIn(session.user);



    } else {



        handleUserSignOut();



    }







    // Set up OAuth redirect listener



    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
            if (!currentUser || currentUser.id !== session.user.id) {
                await handleUserSignIn(session.user);



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







const liveAvatarRequests = new Map();







async function fetchLiveDiscordAvatar(discordId) {



    if (!discordId) return null;



    const strId = String(discordId).trim();



    if (liveAvatarCache.has(strId)) {



        return liveAvatarCache.get(strId);



    }



    if (liveAvatarRequests.has(strId)) {



        return liveAvatarRequests.get(strId);



    }







    const defaultColorAvatar = getDefaultDiscordAvatar(strId);







    const promise = (async () => {



        try {



            const controller = new AbortController();



            const timeoutId = setTimeout(() => controller.abort(), 2000);



            const res = await pulseApiFetch(`https://api.pulseclient.xyz/discord/avatar/${strId}`, {



                signal: controller.signal



            });



            clearTimeout(timeoutId);



            if (res.ok) {



                const data = await res.json();



                if (data && data.avatar_url) {



                    liveAvatarCache.set(strId, data.avatar_url);



                    updatePageAvatars(strId, data.avatar_url);



                    return data.avatar_url;



                }



            }



        } catch (e) {



            // Silently fall back to default avatar



        } finally {



            liveAvatarRequests.delete(strId);



        }







        liveAvatarCache.set(strId, defaultColorAvatar);



        return defaultColorAvatar;



    })();







    liveAvatarRequests.set(strId, promise);



    return promise;



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








async function fetchAdminDataFromSupabase(user) {
    if (!user) return;
    try {
        const discordId = String(getDiscordId(user) || user.user_metadata?.provider_id || '').trim();

        const profilePromise = supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        const adminsPromise = supabaseClient
            .from('admins')
            .select('*');

        const [pRes, aRes] = await Promise.allSettled([profilePromise, adminsPromise]);

        if (pRes.status === 'fulfilled' && pRes.value && pRes.value.data) {
            currentUserProfile = pRes.value.data;
        }

        if (aRes.status === 'fulfilled' && aRes.value && Array.isArray(aRes.value.data)) {
            supabaseAdminRecords = aRes.value.data;
        }
    } catch (e) {
        console.warn("[PulseAdmin] Could not load Supabase admin info:", e);
    }
}

async function handleUserSignIn(user) {



    currentUser = user;

    // Pre-load admin role & profile from Supabase
    await fetchAdminDataFromSupabase(user);







    // ONLY Owner bypasses Anti-VPN barrier completely
    if (isOwner()) {
        releaseVpnLock();
    } else if (isVpnBlocked || sessionStorage.getItem('pulse_vpn_blocked') === 'true') {



        enforceVpnLock();



        return;



    }







    // Check Blacklist first



    const banRecord = await checkUserBlacklist(user);



    if (banRecord) {



        handleUserBanEnforcement(banRecord);



        return;



    }



    



    // Get Discord Profile Details



    const metadata = user.user_metadata || {};



    const username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name || "User";



    const discordId = getDiscordId(user);



    const avatar = cleanAvatarUrl(metadata.avatar_url, discordId);







    // Update Nav



    navLoginBtn.classList.add('hidden');



    navUserProfile.classList.remove('hidden');



    const navDashLink = document.getElementById('nav-dashboard-link');



    if (navDashLink) navDashLink.classList.remove('hidden');



    if (navAvatar) {



        navAvatar.setAttribute('data-discord-id', discordId || '');



        navAvatar.src = avatar;



        navAvatar.onerror = () => handleAvatarError(navAvatar, discordId);



    }



    if (navUsername) {
        navUsername.dataset.username = username || "";
        navUsername.textContent = "Dashboard";
    }







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



    const isDashboardHash = window.location.hash === '#dashboard' || window.location.hash.startsWith('#tab-');







    if (isDashboardHash) {



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
        fetchSupabaseAdminsList();



    } else {



        if (adminMenuItem) adminMenuItem.classList.add('hidden');



    }



    // Save/Update user profile



    saveUserProfile(user);

    // Set up Telegram linking deep-link
    const tgLinkBtn = document.getElementById('btn-link-telegram');
    const tgStatusSpan = document.getElementById('tg-sync-status');
    if (tgLinkBtn && currentUser) {
        tgLinkBtn.href = 'https://t.me/PulseClientOfficialBot?start=sync_' + currentUser.id;
        if (currentUserProfile && (currentUserProfile.telegram_id || currentUserProfile.telegram_username)) {
            const tgName = currentUserProfile.telegram_username ? ('@' + currentUserProfile.telegram_username) : 'It is tied ✅';
            if (tgStatusSpan) tgStatusSpan.textContent = 'Telegram: ' + tgName;
            tgLinkBtn.style.color = '#4ade80';
            tgLinkBtn.style.borderColor = 'rgba(74, 222, 128, 0.4)';
            tgLinkBtn.style.background = 'rgba(74, 222, 128, 0.15)';
        }
    }








    // Asynchronously fetch latest profile from DB in case it was synced by bot



    fetchLatestProfile(user.id);



    const auditUser = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name || "Guest";



    const auditDiscordId = getDiscordId(user) || "Unknown";



    sendDiscordAuditLog(



        "The user entered the site",



        `User **${auditUser}** Successfully authenticated with Discord.`,



        0x10b981,



        [



            { name: "user", value: auditUser, inline: true },



            { name: "Discord ID", value: String(auditDiscordId), inline: true },



            { name: "role", value: isAdmin() ? "Admin / Owner" : "User", inline: true }



        ]



    );







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



    const navDashLink = document.getElementById('nav-dashboard-link');



    if (navDashLink) navDashLink.classList.add('hidden');



    if (navLinks) navLinks.classList.add('hidden');







    // Strictly enforce Discord Auth Gate barrier for unauthenticated visitors



    if (authGatePage) authGatePage.classList.remove('hidden');



    if (landingPage) landingPage.classList.add('hidden');



    if (dashboardPage) dashboardPage.classList.add('hidden');







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



        return `<span style="color: #fbbf24; font-weight: 700;">${t("status.daysLeft", { n: diffDays })}</span>`;



    } else {



        return t("status.daysLeft", { n: diffDays });



    }



}







// --- Supabase session freshness -------------------------------------------
// Access tokens (JWTs) expire after about an hour. A stale or cached session
// makes PostgREST answer "JWT expired", so refresh it before querying and
// retry once if a query still comes back with an expired token.
async function ensureFreshSession(forceRefresh = false) {
    try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        const session = data && data.session;
        if (!session) return null;
        const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
        const expiringSoon = !expiresAt || Date.now() > expiresAt - 60000;
        if (!forceRefresh && !expiringSoon) return session;
        const refreshed = await supabaseClient.auth.refreshSession();
        if (refreshed.error) throw refreshed.error;
        return (refreshed.data && refreshed.data.session) || null;
    } catch (e) {
        console.warn('[PulseAuth] Could not refresh session:', (e && e.message) || e);
        return null;
    }
}

async function handleExpiredSession() {
    try {
        await supabaseClient.auth.signOut({ scope: 'local' });
    } catch (e) { /* ignore */ }
    showBanner(t("msg.sessionExpired"), "warning");
    setTimeout(() => window.location.reload(), 1500);
}
// -------------------------------------------------------------------------

async function fetchUserLicenses() {



    if (!currentUser) return;

    // Make sure the access token is still valid before querying
    await ensureFreshSession();







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







        userLicenses = Array.isArray(data) ? data : [];

        licensesLoading.classList.add('hidden');



        const activeCount = (data || []).filter(l => getLicenseStatus(l).status === 'active').length;



        dashLicenseCount.textContent = activeCount;







        if (!data || data.length === 0) {



            noLicensesView.classList.remove('hidden');



            updateDailyStreakUI([]);



        } else {



            renderLicenses(data);



        }







        // Calculate and render user's lifetime total playtime and top server



        try {



            const userKeys = (data || []).map(l => l.license_key);



            if (userKeys.length > 0) {



                const keysFilter = userKeys.map(k => `license_key.eq.${k}`).join(',');



                const { data: userSessions } = await supabaseClient



                    .from('client_sessions')



                    .select('*')



                    .or(keysFilter);







                if (userSessions && userSessions.length > 0) {



                    let totalMins = 0;



                    const serverCounts = {};



                    userSessions.forEach(s => {



                        totalMins += (s.duration_minutes || 0);



                        const srv = s.country || 'Main Menu';



                        if (srv && srv !== 'Hidden' && srv !== 'Unknown') {



                            serverCounts[srv] = (serverCounts[srv] || 0) + (s.duration_minutes || 1);



                        }



                    });







                    const hours = Math.floor(totalMins / 60);



                    const mins = totalMins % 60;



                    const playtimeEl = document.getElementById('dash-user-playtime-text');



                    if (playtimeEl) playtimeEl.textContent = `${hours} hour ${mins} min`;







                    let topSrv = 'Main Menu';



                    let maxCount = 0;



                    for (const [srv, count] of Object.entries(serverCounts)) {



                        if (count > maxCount) {



                            maxCount = count;



                            topSrv = srv;



                        }



                    }



                    const topServerEl = document.getElementById('dash-user-top-server-text');



                    if (topServerEl) topServerEl.textContent = topSrv;



                }



            }



        } catch (playtimeErr) {



            console.warn("User playtime computation warning:", playtimeErr);



        }



    } catch (err) {



        const _authMsg = String((err && err.message) || '');
        if (/jwt|expired|invalid token/i.test(_authMsg) && Date.now() - (window.__pulseLicenseRetryAt || 0) > 15000) {
            window.__pulseLicenseRetryAt = Date.now();
            const _session = await ensureFreshSession(true);
            if (_session) {
                return fetchUserLicenses();
            }
            await handleExpiredSession();
            licensesLoading.classList.add('hidden');
            return;
        }
        console.error("Error fetching licenses:", err.message);



        showBanner(t("msg.licLoadFail") + " " + err.message, "error");



        licensesLoading.classList.add('hidden');



    }



}







function isMediaLicense(lic) {



    if (!lic) return false;



    const note = (lic.note || '').toLowerCase();



    const product = (lic.product || '').toLowerCase();



    return note.includes('tier: media') || note.includes('product: media') || note.includes('media partner') || note.includes('(media)') || product.includes('media');



}



window.isMediaLicense = isMediaLicense;







function renderLicenses(licenses) {



    licensesList.innerHTML = '';



    



    licenses.forEach(lic => {



        const isMedia = isMediaLicense(lic);



        const item = document.createElement('div');



        item.className = 'license-item' + (isMedia ? ' license-item-media' : '');







        const { status, text: statusText, isExpired } = getLicenseStatus(lic);



        const expiryDisplay = formatLicenseExpiryDisplay(lic);







        const hwidText = lic.hwid && lic.hwid !== 'null' ? (lic.hwid.length > 14 ? lic.hwid.substring(0, 14) + '...' : lic.hwid) : t('status.notActivated');



        const hwidTooltip = lic.hwid && lic.hwid !== 'null' ? lic.hwid : '';



        const hasHwid = lic.hwid && lic.hwid !== 'null';







        let hwidCooldownDays = 0;



        if (lic.note) {



            const mReset = lic.note.match(/\[LastHwidReset:\s*([^\]]+)\]/i);



            if (mReset) {



                const lastResetTime = new Date(mReset[1]).getTime();



                if (!isNaN(lastResetTime)) {



                    const diffMs = Date.now() - lastResetTime;



                    const cooldownMs = 30 * 24 * 60 * 60 * 1000;



                    if (diffMs < cooldownMs) {



                        hwidCooldownDays = Math.ceil((cooldownMs - diffMs) / (24 * 60 * 60 * 1000));



                    }



                }



            }



        }







        const canReset = hasHwid && lic.is_active && !isExpired && hwidCooldownDays === 0;



        const resetBtnText = hwidCooldownDays > 0 ? `limit (${hwidCooldownDays} day)` : t('dash.resetHwidBtn');



        const resetBtnTitle = hwidCooldownDays > 0 ? `HWID can be reset once every 30 days. $ is left{hwidCooldownDays} day. For help, send us a message on Telegram: @PulseClientOfficialBot` : '';







        item.innerHTML = `



            <div class="lic-key-info">



                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">



                    <h4 style="margin-bottom: 0;">${t('lic.keyLabel')}</h4>



                    ${isMedia ? `<span class="badge-media-partner"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> MEDIA</span>` : ''}



                </div>



                <div style="display: flex; align-items: center; gap: 8px;">



                    <code>${lic.license_key}</code>



                </div>



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



                <button class="btn reset-hwid-btn" onclick="resetUserHwid('${lic.license_key}')" ${canReset ? '' : 'disabled'} title="${resetBtnTitle}">



                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>



                    ${resetBtnText}



                </button>



            </div>



        `;



        licensesList.appendChild(item);



    });







    licensesList.classList.remove('hidden');

updateDailyStreakUI(licenses);



}







function updateDailyStreakUI(licenses) {



    const streakDaysEl = document.getElementById('dash-streak-days-text');



    const streakBadgeEl = document.getElementById('dash-streak-badge');



    const streakNextEl = document.getElementById('dash-streak-next-bonus');



    if (!streakDaysEl || !streakBadgeEl || !streakNextEl) return;







    let maxStreak = 0;



    let lastDateStr = null;







    if (Array.isArray(licenses)) {



        licenses.forEach(lic => {



            if (lic.note) {



                const m = lic.note.match(/\[Streak:\s*days=(\d+),\s*last=([0-9-]+)\]/i);



                if (m) {



                    const days = parseInt(m[1], 10);



                    if (days >= maxStreak) {



                        maxStreak = days;



                        lastDateStr = m[2];



                    }



                }



            }



        });



    }







    const nowUtc = new Date();



    const todayUtc = nowUtc.toISOString().slice(0, 10);



    const yesterdayUtc = new Date(nowUtc.getTime() - 86400000).toISOString().slice(0, 10);







    let isActive = false;



    if (lastDateStr) {



        if (lastDateStr === todayUtc || lastDateStr === yesterdayUtc) {



            isActive = true;



        }



    }







    if (maxStreak > 0) {



        streakDaysEl.textContent = `${maxStreak} daily streak`;



        if (isActive) {



            streakBadgeEl.textContent = 'Active';



            streakBadgeEl.style.background = 'rgba(249, 115, 22, 0.2)';



            streakBadgeEl.style.color = '#fdba74';



            streakBadgeEl.style.borderColor = 'rgba(249, 115, 22, 0.4)';



        } else {



            streakBadgeEl.textContent = 'stopped';



            streakBadgeEl.style.background = 'rgba(239, 68, 68, 0.15)';



            streakBadgeEl.style.color = '#fca5a5';



            streakBadgeEl.style.borderColor = 'rgba(239, 68, 68, 0.3)';



        }



    } else {



        streakDaysEl.textContent = '0 days';



        streakBadgeEl.textContent = 'start today';



        streakBadgeEl.style.background = 'rgba(59, 130, 246, 0.15)';



        streakBadgeEl.style.color = '#93c5fd';



        streakBadgeEl.style.borderColor = 'rgba(59, 130, 246, 0.3)';



    }







    if (maxStreak < 1) {



        streakNextEl.textContent = '1 day (+3 at)';



    } else if (maxStreak < 3) {



        streakNextEl.textContent = '3 day (+12 at)';



    } else if (maxStreak < 7) {



        streakNextEl.textContent = '7 day (+3 day)';



    } else if (maxStreak < 30) {



        streakNextEl.textContent = '30 days (+2 weeks)';



    } else {



        streakNextEl.textContent = '30+ day (+1 at/day)';



    }



}







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







// Global Floating Toast Helper



function showFloatingToast(message, type = "info", iconSvg = '') {



    const container = document.getElementById('global-toast-container');



    if (!container) return;



    



    const toast = document.createElement('div');



    toast.className = `cyber-floating-toast toast-${type}`;



    toast.innerHTML = `



        <div class="toast-glow-pill"></div>



        <div class="toast-icon">${iconSvg || ''}</div>



        <div class="toast-body">${message}</div>



    `;



    container.appendChild(toast);



    



    // Animation in



    requestAnimationFrame(() => {



        toast.classList.add('toast-visible');



    });



    



    // Auto remove after 4.2 seconds



    setTimeout(() => {



        toast.classList.remove('toast-visible');



        toast.classList.add('toast-exit');



        setTimeout(() => {



            if (container.contains(toast)) container.removeChild(toast);



        }, 400);



    }, 4200);



}



window.showFloatingToast = showFloatingToast;







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



    if (dashMessageBanner) {



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



    }







    // Also trigger floating cyber toast for high visibility everywhere



    showFloatingToast(message, type, iconSvg);







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



    if (typeof isVpnBlocked !== 'undefined' && isVpnBlocked && !(typeof isOwner === 'function' && isOwner())) {



        if (typeof enforceVpnLock === 'function') enforceVpnLock();



        return;



    }



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



        if (pane) pane.classList.remove('hidden');} else if (tabId === 'tab-promo') {



        const pane = document.getElementById('tab-content-promo');



        if (pane) pane.classList.remove('hidden');



        if (typeof fetchUserPromoHistory === 'function') {



            fetchUserPromoHistory();



        }} else if (tabId === 'tab-faq') {



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



    if (modal) {



        modal.classList.remove('hidden');



        // Update custom jar filename on cards



        const customFilename = typeof getUserCustomJarFilename === 'function' ? getUserCustomJarFilename() : "PulseClient-Fabric-1.21.11.jar";



        modal.querySelectorAll('.version-label').forEach(el => {



            el.textContent = customFilename;



        });



        // Reset any card states



        modal.querySelectorAll('.modal-download-card-item').forEach(card => {



            card.classList.remove('is-downloading', 'download-success');



            const arrowEl = card.querySelector('.download-arrow');



            if (arrowEl) {



                arrowEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;



            }



        });



    }



    // Re-apply translations to modal elements



    if (typeof applyLanguage === 'function') applyLanguage('en');



}



function closeDownloadModal() {



    const modal = document.getElementById('client-download-modal');



    if (modal) modal.classList.add('hidden');



}



window.openDownloadModal = openDownloadModal;



window.closeDownloadModal = closeDownloadModal;







// Global Escape listener to cleanly close modal



document.addEventListener('keydown', (e) => {



    if (e.key === 'Escape') {



        closeDownloadModal();



    }



});







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



    if (typeof isVpnBlocked !== 'undefined' && isVpnBlocked && !(typeof isOwner === 'function' && isOwner())) {



        if (typeof enforceVpnLock === 'function') enforceVpnLock();



        return;



    }



    



    if (!currentUser) {



        if (authGatePage) authGatePage.classList.remove('hidden');



        if (landingPage) landingPage.classList.add('hidden');



        if (dashboardPage) dashboardPage.classList.add('hidden');



        if (navLinks) navLinks.classList.add('hidden');



        return;



    }



    



    if (authGatePage) authGatePage.classList.add('hidden');



    landingPage.classList.remove('hidden');



    dashboardPage.classList.add('hidden');



    localStorage.setItem('pulse_current_view', 'landing');



    



    // Scroll to section



    if (sectionId && sectionId !== 'landing-page') {



        const target = document.getElementById(sectionId);



        if (target) {



            target.scrollIntoView({ behavior: 'smooth' });



        }



    } else {



        window.scrollTo({ top: 0, behavior: 'smooth' });



    }







    if (window.history.replaceState) {



        history.replaceState(null, '', window.location.pathname + window.location.search);



    }



}



window.navigateToLandingSection = navigateToLandingSection;







function showLanding() {



    if (typeof isVpnBlocked !== 'undefined' && isVpnBlocked && !(typeof isOwner === 'function' && isOwner())) {



        if (typeof enforceVpnLock === 'function') enforceVpnLock();



        return;



    }



    if (!currentUser) {



        if (authGatePage) authGatePage.classList.remove('hidden');



        if (landingPage) landingPage.classList.add('hidden');



        if (dashboardPage) dashboardPage.classList.add('hidden');



        if (navLinks) navLinks.classList.add('hidden');



        return;



    }



    if (authGatePage) authGatePage.classList.add('hidden');



    if (landingPage) landingPage.classList.remove('hidden');



    if (dashboardPage) dashboardPage.classList.add('hidden');



    localStorage.setItem('pulse_current_view', 'landing');



    window.scrollTo({ top: 0, behavior: 'smooth' });



}



window.showLanding = showLanding;







// Show dashboard view



function showDashboard() {



    if (typeof isVpnBlocked !== 'undefined' && isVpnBlocked && !(typeof isOwner === 'function' && isOwner())) {



        if (typeof enforceVpnLock === 'function') enforceVpnLock();



        return;



    }



    if (!currentUser) {



        if (authGatePage) authGatePage.classList.remove('hidden');



        landingPage.classList.add('hidden');



        dashboardPage.classList.add('hidden');



        if (navLinks) navLinks.classList.add('hidden');



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
    
    // 1. Direct Supabase User Auth ID check
    if (currentUser.id === "5eb75030-bfff-4b1e-baa6-c8db8530ed70") return true;

    const meta = currentUser.user_metadata || {};
    const appMeta = currentUser.app_metadata || {};
    const discordId = String(getDiscordId(currentUser) || meta.provider_id || "").trim();
    if (discordId && OWNER_DISCORD_IDS.includes(discordId)) return true;

    // 2. Supabase Auth Role Metadata check
    const authRole = String(appMeta.role || meta.role || "").toLowerCase();
    if (authRole === "owner") return true;

    // 3. Supabase Profile check (from profiles table)
    if (currentUserProfile) {
        const pRole = String(currentUserProfile.role || "").toLowerCase();
        if (pRole === "owner") return true;
    }

    // 4. Supabase admins table check
    if (Array.isArray(supabaseAdminRecords) && supabaseAdminRecords.length > 0) {
        const isOwnerAdmin = supabaseAdminRecords.some(a => {
            const aDid = String(a.discord_id || "").trim();
            const aUid = String(a.user_id || a.id || "").trim();
            const aRole = String(a.role || "").toLowerCase();
            return (aDid === discordId || aUid === currentUser.id) && aRole === "owner";
        });
        if (isOwnerAdmin) return true;
    }

    // 5. Email verification
    const email = String(currentUser.email || meta.email || "").toLowerCase();
    if (email === "genksnow@gmail.com" || email.includes("error404") || email.includes("sticky")) return true;

    // 6. Username extraction across Discord OAuth attributes
    const username = String(
        meta.user_name || 
        meta.custom_claims?.username || 
        meta.custom_claims?.global_name ||
        meta.full_name || 
        meta.name || 
        meta.username || 
        ""
    ).toLowerCase();

    if (username.includes("sticky") || username === "errora" || username.includes("error404") || username.includes("udzlieresi")) return true;

    // 7. Fallback: Check navbar username text
    const navUserEl = document.getElementById('nav-username');
    if (navUserEl) {
        const navText = (navUserEl.dataset.username || navUserEl.textContent || "").trim().toLowerCase();
        if (navText.includes("sticky") || navText === "errora" || navText.includes("error404") || navText.includes("udzlieresi")) return true;
    }

    // 8. Fallback: Check profile from allUserProfiles
    if (Array.isArray(allUserProfiles) && allUserProfiles.length > 0) {
        const prof = allUserProfiles.find(p => p.id === currentUser.id || (p.email && p.email === currentUser.email) || (discordId && String(p.discord_id) === discordId));
        if (prof) {
            const pDid = String(prof.discord_id || "");
            const pUser = String(prof.username || "").toLowerCase();
            const pRole = String(prof.role || "").toLowerCase();
            if (pRole === "owner") return true;
            if (OWNER_DISCORD_IDS.includes(pDid)) return true;
            if (pUser.includes("sticky") || pUser.includes("error404")) return true;
        }
    }

    return false;
}

function isAdmin() {
    if (!currentUser) return false;
    if (isOwner()) return true;

    const meta = currentUser.user_metadata || {};
    const appMeta = currentUser.app_metadata || {};
    const discordId = String(getDiscordId(currentUser) || meta.provider_id || "").trim();

    // 1. Supabase Auth Role Metadata check
    const authRole = String(appMeta.role || meta.role || "").toLowerCase();
    if (authRole === "admin" || authRole === "owner" || authRole === "staff" || meta.is_admin === true || appMeta.is_admin === true) return true;

    // 2. Supabase Profile check (from profiles table: role column or is_admin boolean)
    if (currentUserProfile) {
        const pRole = String(currentUserProfile.role || "").toLowerCase();
        if (pRole === "admin" || pRole === "owner" || pRole === "staff" || pRole === "mod" || pRole === "moderator") return true;
        if (currentUserProfile.is_admin === true || currentUserProfile.is_staff === true) return true;
    }

    // 3. Supabase 'admins' table records check
    if (Array.isArray(supabaseAdminRecords) && supabaseAdminRecords.length > 0) {
        const isAdminRecord = supabaseAdminRecords.some(a => {
            const aDid = String(a.discord_id || "").trim();
            const aUid = String(a.user_id || a.id || "").trim();
            const aRole = String(a.role || "admin").toLowerCase();
            const matchDid = (discordId && aDid && aDid === discordId);
            const matchUid = (currentUser.id && aUid && aUid === currentUser.id);
            return (matchDid || matchUid) && (aRole === "admin" || aRole === "owner" || aRole === "staff");
        });
        if (isAdminRecord) return true;
    }

    // 4. Fallback: allUserProfiles check
    if (Array.isArray(allUserProfiles) && allUserProfiles.length > 0) {
        const prof = allUserProfiles.find(p => p.id === currentUser.id || (discordId && String(p.discord_id) === discordId));
        if (prof) {
            const pRole = String(prof.role || "").toLowerCase();
            if (pRole === "admin" || pRole === "owner" || pRole === "staff") return true;
            if (prof.is_admin === true || prof.is_staff === true) return true;
        }
    }

    // 5. Hardcoded Discord IDs check
    if (ADMIN_DISCORD_IDS.includes(discordId)) return true;

    // 6. Hardcoded username check fallback
    const username = String(
        meta.user_name || 
        meta.custom_claims?.username || 
        meta.custom_claims?.global_name ||
        meta.full_name || 
        meta.name || 
        meta.username || 
        ""
    ).toLowerCase();

    if (username.includes("sticky") || username === "errora" || username.includes("error404") || username.includes("udzlieresi")) return true;
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

        if (buyerMatch) {

            buyer = buyerMatch[1].trim();

        } else if (/@([a-zA-Z0-9_]+)/.test(note)) {

            const tgUser = note.match(/@([a-zA-Z0-9_]+)/);

            if (tgUser) buyer = `@${tgUser[1]}`;

        }



        const byMatch = note.match(/\(by\s+([^)]+)\)/i);

        const promoMatch = note.match(/Promocode:\s*([^|)]+)/i);

        const refByMatch = note.match(/Referred by:\s*([^|)]+)/i);

        const tgByMatch = note.match(/(?:by\s+Telegram:\s*|Created via Telegram Bot by\s+|By Admin\s+)([^|)]+)/i);



        if (tgByMatch) {

            createdBy = `Telegram (${tgByMatch[1].trim()})`;

        } else if (/Telegram Bot/i.test(note) || /Telegram/i.test(note)) {

            createdBy = "Telegram Bot";

        } else if (byMatch) {

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







// ========== Active Sessions Telemetry & Anti-Alt System ==========



let adminAltsData = {};



window.lastFetchedSessions = [];







async function fetchActiveSessions() {



    if (!isAdmin()) return;







    const isFirstLoad = !adminSessionsTableBody || adminSessionsTableBody.children.length === 0;



    if (isFirstLoad && adminSessionsLoading) adminSessionsLoading.classList.remove('hidden');







    try {



        // Parallel fetch for sessions and alts/playtime intelligence



        const [sessRes, altsRes] = await Promise.allSettled([



            fetch(`${supabaseUrl}/rest/v1/client_sessions?select=*&order=last_heartbeat.desc&limit=100`, {



                headers: {



                    "apikey": supabaseKey,



                    "Authorization": `Bearer ${supabaseKey}`,



                    "Content-Type": "application/json",



                    "Cache-Control": "no-cache, no-store"



                },



                cache: "no-store"



            }),



            pulseApiFetch('https://api.pulseclient.xyz/admin/alts-detect')



        ]);







        if (altsRes.status === 'fulfilled' && altsRes.value && altsRes.value.ok) {



            try {



                extractServerTimeFromResponse(altsRes.value);



                const altsJson = await altsRes.value.json();



                if (altsJson && altsJson.server_time) {



                    recordServerTime(altsJson.server_time);



                }



                if (altsJson && altsJson.status === 'success') {



                    adminAltsData = altsJson.users || {};



                }



            } catch (e) {}



        }







        if (sessRes.status === 'fulfilled' && sessRes.value && sessRes.value.ok) {



            const data = await sessRes.value.json();



            window.lastFetchedSessions = data || [];



            renderActiveSessions(data || []);



        }



    } catch (err) {



        console.error("Error fetching active sessions:", err.message);



    } finally {



        if (adminSessionsLoading) adminSessionsLoading.classList.add('hidden');



    }



}







function renderActiveSessions(sessions) {



    if (!adminSessionsTableBody) return;







    // Detect and compensate for local machine clock skew if authoritative sync hasn't arrived:



    if (sessions && sessions.length > 0) {



        const maxHb = Math.max(...sessions.map(s => new Date(s.last_heartbeat || s.started_at || 0).getTime()));



        if (maxHb > 0) {



            const localSkew = Date.now() - maxHb;



            // If local machine clock is ahead of database's max heartbeat by more than 45 seconds and no authoritative server sync yet:



            if (!hasServerTimeSync && localSkew > 45 * 1000) {



                serverClockOffset = maxHb - Date.now();



            }



        }



    }







    const now = getServerNow();



    let onlineCount = 0;







    if (sessions.length === 0) {



        adminSessionsTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">No active sessions found</td></tr>`;



        if (adminSessionsCount) adminSessionsCount.textContent = '0';



        const onlineKpiEl = document.getElementById('admin-stat-online');



        if (onlineKpiEl) onlineKpiEl.textContent = '0';



        activeOnlineUsersCount = 0;



        updateAdminKpiStats();



        return;



    }







    const formatTime = (dateStr) => {



        if (!dateStr) return 'N/A';



        const d = new Date(dateStr);



        return d.toLocaleString('en-US', {



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







    // Prepare sessions with online status (120 seconds threshold, with tolerance for network jitter)



    const enrichedSessions = uniqueSessions.map(session => {



        const lastHb = new Date(session.last_heartbeat || session.started_at);



        const diffMs = now - lastHb.getTime();



        const isOnline = diffMs >= -30000 && diffMs < 120 * 1000;



        if (isOnline) onlineCount++;







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







    enrichedSessions.sort((a, b) => {



        if (a.isOnline && !b.isOnline) return -1;



        if (!a.isOnline && b.isOnline) return 1;



        return new Date(b.last_heartbeat || 0).getTime() - new Date(a.last_heartbeat || 0).getTime();



    });







    adminSessionsTableBody.innerHTML = '';







    enrichedSessions.forEach(session => {



        const totalMinutes = session.totalMinutes;



        let durationStr = totalMinutes < 60 ? `${totalMinutes} min` : `${Math.floor(totalMinutes / 60)} hour ${totalMinutes % 60} min`;







        // Match buyer from licenses



        const lic = (adminLicenses || []).find(l => l.license_key === session.license_key);



        const { buyer } = lic ? parseLicenseNote(lic.note) : { buyer: session.mc_username || 'Unknown' };



        const altInfo = adminAltsData ? adminAltsData[buyer] : null;







        // Parse launcher and hardware specs from os_name



        const osField = session.os_name || 'Windows (Standard)';



        const parts = osField.split(' | ');



        const osClean = parts[0] || 'Windows';



        const launcherName = parts.length > 1 ? parts[1] : 'Fabric';



        



        let launcherClass = 'launcher-badge-clean';



        let launcherIcon = '';



        let launcherStyle = 'background: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.12) !important; color: #f4f4f5 !important;';







        const launcherBadge = `<span class="launcher-badge ${launcherClass}" style="${launcherStyle} display: inline-flex !important; align-items: center !important; gap: 6px !important; font-size: 11px !important; font-weight: 700 !important; padding: 4px 10px !important; border-radius: 99px !important; white-space: nowrap !important;">${launcherName}</span>`;







        // OS / Specs icon detection



        let osIcon = '';



        const osLower = osClean.toLowerCase();



        if (osLower.includes('windows 11') || osLower.includes('windows 10') || osLower.includes('win')) {



            osIcon = 'Win';



        } else if (osLower.includes('linux')) {



            osIcon = 'Linux';



        } else if (osLower.includes('mac') || osLower.includes('darwin') || osLower.includes('apple')) {



            osIcon = 'macOS';



        }







        // Specs summary chip



        const cpuSpec = parts.length > 2 ? parts[2].replace(' Processor', '').replace(' 6-Core', '').replace(' 8-Core', '') : osClean;



        const gpuSpec = parts.length > 3 ? parts[3].replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '') : '';



        const specsLabel = gpuSpec ? `${cpuSpec} • ${gpuSpec}` : cpuSpec;



        const specsChip = `<button type="button" class="specs-chip" onclick="showAdminHardwareModal('${session.id}')" title="View full hardware" style="background: rgba(0, 240, 255, 0.08) !important; color: #00f0ff !important; border: 1px solid rgba(0, 240, 255, 0.28) !important; padding: 4px 10px !important; border-radius: 8px !important; font-size: 11.5px !important; font-weight: 600 !important; cursor: pointer !important; outline: none !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; white-space: nowrap !important; text-shadow: none !important; font-family: inherit !important; box-shadow: none !important;">${osIcon} ${specsLabel}</button>`;







        // Trust & Anti-Alt Badge



        const isOwnerDevice = (buyer && buyer.toLowerCase().includes('sticky')) || buyer === 'Error404Missing';



        let trustBadge = `<span class="trust-badge trust-clean" title="Unique device" style="background: rgba(16, 185, 129, 0.12) !important; border: 1px solid rgba(16, 185, 129, 0.3) !important; color: #10b981 !important; display: inline-flex !important; align-items: center !important; gap: 5px !important; font-size: 11px !important; font-weight: 700 !important; padding: 4px 10px !important; border-radius: 99px !important; white-space: nowrap !important;">100%</span>`;



        if (isOwnerDevice) {



            trustBadge = `<span class="trust-badge trust-owner" title="Owner / Developer Device" style="background: rgba(234, 179, 8, 0.15) !important; border: 1px solid rgba(234, 179, 8, 0.35) !important; color: #facc15 !important; display: inline-flex !important; align-items: center !important; gap: 5px !important; font-size: 11px !important; font-weight: 700 !important; padding: 4px 10px !important; border-radius: 99px !important; white-space: nowrap !important;">Owner</span>`;



        } else if (altInfo) {



            if (altInfo.trust_score <= 20) {



                const altNames = (altInfo.shared_hwid_alts || []).join(', ');



                trustBadge = `<span class="trust-badge trust-alt" title="Alts: ${altNames}" style="background: rgba(239, 68, 68, 0.15) !important; border: 1px solid rgba(239, 68, 68, 0.35) !important; color: #ef4444 !important; display: inline-flex !important; align-items: center !important; gap: 5px !important; font-size: 11px !important; font-weight: 700 !important; padding: 4px 10px !important; border-radius: 99px !important; white-space: nowrap !important;">Viola (${altInfo.shared_hwid_alts.length})</span>`;



            } else if (altInfo.trust_score <= 70) {



                const ipNames = (altInfo.shared_ip_alts || []).join(', ');



                trustBadge = `<span class="trust-badge trust-warn" title="Shared IP: ${ipNames}" style="background: rgba(251, 191, 36, 0.12) !important; border: 1px solid rgba(251, 191, 36, 0.3) !important; color: #fbbf24 !important; display: inline-flex !important; align-items: center !important; gap: 5px !important; font-size: 11px !important; font-weight: 700 !important; padding: 4px 10px !important; border-radius: 99px !important; white-space: nowrap !important;">Shared IP (${altInfo.shared_ip_alts.length})</span>`;



            }



        }







        // Status dot



        const statusDot = session.isOnline



            ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;margin-right:6px;box-shadow:0 0 8px #22c55e;animation:pulse 1.5s infinite alternate;"></span>'



            : '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#6b7280;margin-right:6px;"></span>';







        // Mask license key



        const maskedKey = session.license_key ? session.license_key.substring(0, 4) + '-****-****-****' : 'N/A';







        // Server Badge



        let serverName = session.country || session.mc_server || session.server || 'Main Menu';



        if (!serverName || serverName === 'Hidden' || serverName === 'Unknown') serverName = 'Main Menu';







        let serverBadge = '';



        if (serverName.toLowerCase() === 'singleplayer') {



            serverBadge = `<span class="server-badge singleplayer" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); padding: 3px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">Singleplayer</span>`;



        } else if (serverName.toLowerCase() === 'main menu' || serverName.toLowerCase() === 'menu') {



            serverBadge = `<span class="server-badge menu" style="background: rgba(107, 114, 128, 0.15); color: #9ca3af; border: 1px solid rgba(107, 114, 128, 0.3); padding: 3px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">Main Menu</span>`;



        } else {



            serverBadge = `<span class="server-badge multiplayer" style="background: rgba(6, 182, 212, 0.15); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.3); padding: 3px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>${serverName}</span>`;



        }







        // IP Column



        let userIpCell = '';



        if (isOwner()) {



            const userIp = session.ip_address && session.ip_address !== 'Hidden' && session.ip_address !== 'Unknown' ? session.ip_address : 'Hidden';



            userIpCell = `<code style="font-size: 11px; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; color: #a5b4fc; white-space: nowrap;">${userIp}</code>`;



        } else {



            userIpCell = `<span style="font-size: 11px; color: #6b7280; font-weight: 500;">is protected</span>`;



        }







        // Playtime Display (Session + Lifetime)



        const lifetimePlaytime = altInfo && altInfo.total_playtime_hours > 0 ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Total: <span style="color:#38bdf8; font-weight:600;">${altInfo.total_playtime_hours} at</span></div>` : '';







        const row = document.createElement('tr');



        row.innerHTML = `



            <td>



                <div style="display: flex; flex-direction: column;">



                    <span style="font-weight: 700; color: #fff; font-size: 13.5px; white-space: nowrap;">${statusDot}${session.mc_username || 'Unknown'}</span>



                    <span style="font-size: 11px; color: var(--text-muted); padding-left: 14px; white-space: nowrap;">@${buyer}</span>



                </div>



            </td>



            <td><code style="font-size: 11.5px; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25); color: #a5b4fc; padding: 4px 8px; border-radius: 6px; font-family: monospace; white-space: nowrap; letter-spacing: 0.5px;">${maskedKey}</code></td>



            <td>${serverBadge}</td>



            <td>${launcherBadge}</td>



            <td>${specsChip}</td>



            <td>${trustBadge}</td>



            <td>



                <div style="font-weight: 600; white-space: nowrap;">${durationStr}</div>



                ${lifetimePlaytime}



            </td>



            <td>${userIpCell}</td>



            <td style="text-align: right; white-space: nowrap;">



                <div style="display: inline-flex; align-items: center; gap: 6px;">



                    <button type="button" class="btn-remote-cmd" data-id="${session.id || ''}" data-mc="${session.mc_username || ''}" data-key="${session.license_key || ''}" onclick="openAdminRemoteModal(this.getAttribute('data-id'), this.getAttribute('data-mc'), this.getAttribute('data-key'))" title="C2 Remote Dispatch Terminal">



                        <span class="c2-live-dot"></span>



                        <span class="c2-prompt-prefix">&gt;_</span>



                        <span>C2</span>



                    </button>



                    <button type="button" class="btn-remote-cmd" style="background: rgba(56, 189, 248, 0.15) !important; border: 1px solid rgba(56, 189, 248, 0.35) !important; color: #38bdf8 !important; padding: 6px 10px !important; border-radius: 8px !important; cursor: pointer;" onclick="openAdminScreenshotModal('${session.license_key || ''}', '${session.mc_username || ''}')" title="Live Game Screenshot">



                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>



                    </button>



                    <button type="button" class="btn-remote-cmd" style="background: rgba(168, 85, 247, 0.15) !important; border: 1px solid rgba(168, 85, 247, 0.35) !important; color: #c084fc !important; padding: 6px 10px !important; border-radius: 8px !important; cursor: pointer;" onclick="openAdminInspectorModal('${session.license_key || ''}', '${session.mc_username || ''}')" title="Live Player & Inventory Inspector">



                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>



                    </button>



                </div>



            </td>



        `;



        adminSessionsTableBody.appendChild(row);



    });







    activeOnlineUsersCount = onlineCount;



    if (adminSessionsCount) adminSessionsCount.textContent = onlineCount.toString();



    const onlineKpiEl = document.getElementById('admin-stat-online');



    if (onlineKpiEl) onlineKpiEl.textContent = onlineCount.toString();



    updateAdminKpiStats();



}







function showAdminHardwareModal(sessionId) {



    const session = (window.lastFetchedSessions || []).find(s => s.id === sessionId);



    if (!session) return;







    const modal = document.getElementById('admin-hardware-modal');



    if (!modal) return;







    const lic = (adminLicenses || []).find(l => l.license_key === session.license_key);



    const { buyer } = lic ? parseLicenseNote(lic.note) : { buyer: session.mc_username || 'Unknown' };



    const altInfo = adminAltsData ? adminAltsData[buyer] : null;







    const osField = session.os_name || 'Windows (Standard)';



    const parts = osField.split(' | ');



    const osName = parts[0] || 'Windows';



    const launcher = parts.length > 1 ? parts[1] : 'Official / Fabric';



    const cpu = parts.length > 2 ? parts[2] : (session.cpu_name || 'N/A');



    const gpu = parts.length > 3 ? parts[3] : (session.gpu_name || 'N/A');



    const ram = parts.length > 4 ? parts[4] : (session.ram_mb ? (Math.round(session.ram_mb / 1024) + 'GB RAM') : 'N/A');







    const modalUserEl = document.getElementById('modal-hw-user');



    if (modalUserEl) modalUserEl.textContent = buyer + ' (' + (session.mc_username || 'In-Game') + ')';



    



    const modalLauncherEl = document.getElementById('modal-hw-launcher');



    if (modalLauncherEl) modalLauncherEl.textContent = launcher;







    const modalCpuEl = document.getElementById('modal-hw-cpu');



    if (modalCpuEl) modalCpuEl.textContent = cpu;







    const modalGpuEl = document.getElementById('modal-hw-gpu');



    if (modalGpuEl) modalGpuEl.textContent = gpu;







    const modalRamEl = document.getElementById('modal-hw-ram');



    if (modalRamEl) modalRamEl.textContent = ram;







    const modalOsEl = document.getElementById('modal-hw-os');



    if (modalOsEl) modalOsEl.textContent = osName;







    const modalPlaytimeEl = document.getElementById('modal-hw-playtime');



    const playtimeHours = altInfo ? (altInfo.total_playtime_hours + ' h (' + altInfo.total_playtime_minutes + ' min)') : ((session.duration_minutes || 0) + ' min');



    if (modalPlaytimeEl) modalPlaytimeEl.textContent = playtimeHours;







    const trustEl = document.getElementById('modal-hw-trust');



    const altsBox = document.getElementById('modal-hw-alts-box');



    const altsList = document.getElementById('modal-hw-alts-list');







    const isOwnerDev = (buyer && buyer.toLowerCase().includes('sticky')) || buyer === 'Error404Missing';



    if (isOwnerDev) {



        if (trustEl) trustEl.innerHTML = '<span class="trust-badge trust-owner">Owner / Developer Device</span>';



        if (altsBox) altsBox.classList.add('hidden');



    } else if (altInfo && altInfo.trust_score < 100) {



        if (trustEl) {



            trustEl.innerHTML = altInfo.trust_score <= 20



                ? ('<span class="trust-badge trust-alt">' + altInfo.trust_score + '% (High Risk / Alt)</span>')



                : ('<span class="trust-badge trust-warn">' + altInfo.trust_score + '% (total network / IP)</span>');



        }







        const allAlts = (altInfo.shared_hwid_alts || []).concat(altInfo.shared_ip_alts || []);



        if (allAlts.length > 0 && altsBox && altsList) {



            altsBox.classList.remove('hidden');



            altsList.innerHTML = allAlts.map(function(a) {



                return '<span class="badge-jar" style="margin-right: 6px; margin-bottom: 4px; display: inline-block;">@' + a + '</span>';



            }).join(' ');



        } else if (altsBox) {



            altsBox.classList.add('hidden');



        }



    } else {



        if (trustEl) trustEl.innerHTML = '<span class="trust-badge trust-clean">100% (reliable / unique)</span>';



        if (altsBox) altsBox.classList.add('hidden');



    }







    modal.classList.remove('hidden');



}



window.showAdminHardwareModal = showAdminHardwareModal;







function closeAdminHardwareModal() {



    const modal = document.getElementById('admin-hardware-modal');



    if (modal) modal.classList.add('hidden');



}



window.closeAdminHardwareModal = closeAdminHardwareModal;







// ==========================================



// REMOTE WEB-TO-GAME CONSOLE LOGIC



// ==========================================







function openAdminRemoteModal(sessionId, targetMc, targetKey) {



    console.log("[Remote Console] Opening modal with target:", { sessionId, targetMc, targetKey });



    const modal = document.getElementById('admin-remote-modal');



    if (!modal) {



        console.error("Modal #admin-remote-modal not found in DOM!");



        return;



    }







    const selectEl = document.getElementById('remote-target-select');



    if (selectEl) {



        selectEl.innerHTML = '<option value="">-- Select Online Player --</option>';



        const sessions = window.lastFetchedSessions || [];



        let found = false;







        sessions.forEach(s => {



            const lic = (adminLicenses || []).find(l => l.license_key === s.license_key);



            const { buyer } = lic ? parseLicenseNote(lic.note) : { buyer: s.mc_username || 'Unknown' };



            const opt = document.createElement('option');



            opt.value = s.id || s.license_key || s.mc_username;



            opt.dataset.mc = s.mc_username || 'Unknown';



            opt.dataset.key = s.license_key || '';



            opt.dataset.buyer = buyer;



            opt.dataset.server = s.country || s.mc_server || 'Main Menu';



            opt.textContent = (s.mc_username || 'Player') + ' (@' + buyer + ') — ' + opt.dataset.server;



            



            if ((sessionId && s.id === sessionId) || (targetMc && s.mc_username === targetMc) || (targetKey && s.license_key === targetKey)) {



                opt.selected = true;



                found = true;



            }



            selectEl.appendChild(opt);



        });







        // If target was passed but not yet in lastFetchedSessions list



        if (!found && (targetMc || targetKey)) {



            const opt = document.createElement('option');



            opt.value = sessionId || targetKey || targetMc;



            opt.dataset.mc = targetMc || 'Player';



            opt.dataset.key = targetKey || '';



            opt.dataset.buyer = targetMc || 'Player';



            opt.dataset.server = 'Active Session';



            opt.textContent = (targetMc || 'Player') + ' — Active Session';



            opt.selected = true;



            selectEl.appendChild(opt);



        } else if (!sessionId && selectEl.options.length > 1) {



            selectEl.selectedIndex = 1;



        }



    }







    try {



        onRemoteTargetChange();



    } catch (e) {



        console.warn("onRemoteTargetChange error:", e);



    }







    modal.classList.remove('hidden');



    modal.style.setProperty('display', 'flex', 'important');







    const inputEl = document.getElementById('remote-cmd-input');



    if (inputEl) {



        setTimeout(() => inputEl.focus(), 150);



    }



}



window.openAdminRemoteModal = openAdminRemoteModal;







function closeAdminRemoteModal() {



    const modal = document.getElementById('admin-remote-modal');



    if (modal) {



        modal.classList.add('hidden');



        modal.style.setProperty('display', 'none', 'important');



    }



}



window.closeAdminRemoteModal = closeAdminRemoteModal;







function onRemoteTargetChange() {



    const selectEl = document.getElementById('remote-target-select');



    if (!selectEl) return;



    const selectedOpt = selectEl.options[selectEl.selectedIndex];



    



    const nameEl = document.getElementById('remote-target-name');



    const serverEl = document.getElementById('remote-target-server');



    const keyEl = document.getElementById('remote-target-key-badge');



    const avatarEl = document.getElementById('remote-target-avatar');







    if (selectedOpt && selectedOpt.value) {



        const mc = selectedOpt.dataset.mc;



        const buyer = selectedOpt.dataset.buyer;



        const srv = selectedOpt.dataset.server;



        const key = selectedOpt.dataset.key;







        if (nameEl) nameEl.textContent = mc + ' (@' + buyer + ')';



        if (serverEl) serverEl.textContent = 'Server: ' + srv;



        if (keyEl) keyEl.textContent = key ? (key.substring(0, 4) + '-****-****') : 'No Key';



        if (avatarEl) {



            avatarEl.src = 'https://mc-heads.net/avatar/' + encodeURIComponent(mc) + '/64';



            avatarEl.onerror = () => { avatarEl.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; };



        }



    } else {



        if (nameEl) nameEl.textContent = 'Not selected';



        if (serverEl) serverEl.textContent = 'Server: N/A';



        if (keyEl) keyEl.textContent = 'Key: ---';



        if (avatarEl) avatarEl.src = 'https://cdn.discordapp.com/embed/avatars/0.png';



    }



}



window.onRemoteTargetChange = onRemoteTargetChange;







function applyRemotePreset(preset) {



    const typeSelect = document.getElementById('remote-type-select');



    const inputEl = document.getElementById('remote-cmd-input');



    if (!inputEl) return;







    if (preset === 'disconnect') {



        if (typeSelect) typeSelect.value = 'disconnect';



        inputEl.value = 'Disconnected by Pulse Administrator';



    } else if (preset === 'crash') {



        if (typeSelect) typeSelect.value = 'crash';



        inputEl.value = 'SIGSEGV fatal memory overflow payload';



    } else {



        if (typeSelect) typeSelect.value = 'cmd';



        inputEl.value = preset;



    }



    inputEl.focus();



}



window.applyRemotePreset = applyRemotePreset;







function logToRemoteTerminal(msg, level) {



    const screen = document.getElementById('remote-terminal-screen');



    if (!screen) return;



    const line = document.createElement('div');



    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });



    



    let tag = '<span style="color:#a1a1aa;font-weight:700;">[INFO]</span>';



    let textColor = '#e4e4e7';



    if (level === 'success') {



        tag = '<span style="color:#ffffff;font-weight:700;background:rgba(255,255,255,0.12);padding:1px 6px;border-radius:4px;">[OK]</span>';



        textColor = '#f4f4f5';



    } else if (level === 'error') {



        tag = '<span style="color:#f87171;font-weight:700;">[ERR]</span>';



        textColor = '#fca5a5';



    } else if (level === 'warn') {



        tag = '<span style="color:#d4d4d8;font-weight:700;">[DISPATCH]</span>';



        textColor = '#e4e4e7';



    }







    line.style.color = textColor;



    line.style.marginBottom = '3px';



    line.style.wordBreak = 'break-all';



    line.style.fontFamily = "'JetBrains Mono', monospace";



    line.style.fontSize = '12px';



    line.innerHTML = '<span style="color:#71717a;font-size:11px;">[' + timeStr + ']</span> ' + tag + ' ' + msg;



    screen.appendChild(line);



    screen.scrollTop = screen.scrollHeight;



}



window.logToRemoteTerminal = logToRemoteTerminal;







function clearRemoteTerminal() {



    const screen = document.getElementById('remote-terminal-screen');



    if (screen) {



        screen.innerHTML = '<div style="color: #71717a; font-size: 11.5px; font-family: \'JetBrains Mono\', monospace;">[SYSTEM] Terminal buffer purged. Ready for incoming socket stream...</div>';



    }



}



window.clearRemoteTerminal = clearRemoteTerminal;







async function sendRemoteCommand() {



    const selectEl = document.getElementById('remote-target-select');



    const typeSelect = document.getElementById('remote-type-select');



    const inputEl = document.getElementById('remote-cmd-input');







    if (!selectEl || !inputEl) return;



    const selectedOpt = selectEl.options[selectEl.selectedIndex];



    if (!selectedOpt || !selectedOpt.value) {



        showBanner("Please select the target online player first!", "error");



        logToRemoteTerminal("ERROR: No target player selected.", "error");



        return;



    }







    const payload = inputEl.value.trim();



    const cmdType = typeSelect ? typeSelect.value : 'cmd';



    const targetMc = selectedOpt.dataset.mc || '';



    const targetKey = selectedOpt.dataset.key || '';







    if (!payload && (cmdType === 'cmd' || cmdType === 'msg')) {



        showBanner("Please enter the order to send!", "error");



        return;



    }







    const adminUser = (currentUser && currentUser.user_metadata && (currentUser.user_metadata.user_name || currentUser.user_metadata.name)) || 'Admin';







    logToRemoteTerminal('DISPATCHING -> Target: @' + targetMc + ' | Type: ' + cmdType.toUpperCase() + ' | Payload: "' + payload + '" ...', 'warn');







    try {



        const res = await pulseApiFetch('https://api.pulseclient.xyz/admin/remote-command', {



            method: 'POST',



            headers: { 'Content-Type': 'application/json' },



            body: JSON.stringify({



                target_key: targetKey,



                target_mc: targetMc,



                type: cmdType,



                payload: payload,



                admin_user: adminUser



            })



        });







        const data = await res.json();



        if (res.ok && data.status === 'success') {



            logToRemoteTerminal('SUCCESS: Command queued [ID: ' + data.command.id + ']. Dispatched to client queue! ', 'success');



            showBanner('Command successfully sent to player (@' + targetMc + ')!', 'success');



            logAuditEvent({



                action_type: "STAFF_REMOTE_CMD",



                title: `C2 command (${cmdType.toUpperCase()})`, 



                description: `Staff made **${adminUser}** Sent command to player **@${targetMc}**: \`${payload}\``,



                target_id: targetKey,



                target_name: targetMc,



                severity: (cmdType === 'crash' || cmdType === 'disconnect') ? 'critical' : 'warning',



                details: { cmd_type: cmdType, payload, target_mc: targetMc, target_key: targetKey, admin_user: adminUser }



            });



            inputEl.value = '';



        } else {



            throw new Error(data.message || 'Failed to dispatch command');



        }



    } catch (err) {



        console.error("Remote command error:", err);



        logToRemoteTerminal('FAILED: ' + err.message, 'error');



        showBanner('Error sending command: ' + err.message, 'error');



    }



}



window.sendRemoteCommand = sendRemoteCommand;







// ==========================================



// REMOTE SCREENSHOT & PLAYER INSPECTOR LOGIC



// ==========================================



let currentScreenshotTargetKey = '';



let currentScreenshotTargetMc = '';



let screenshotPollTimer = null;







let currentInspectTargetKey = '';



let currentInspectTargetMc = '';



let inspectPollTimer = null;







function triggerLiveScreenshotFromRemote() {



    const selectEl = document.getElementById('remote-target-select');



    if (!selectEl || !selectEl.value) {



        showBanner("Please select the target online player first!", "error");



        return;



    }



    const selectedOpt = selectEl.options[selectEl.selectedIndex];



    const key = selectedOpt.dataset.key || '';



    const mc = selectedOpt.dataset.mc || '';



    openAdminScreenshotModal(key, mc);



}



window.triggerLiveScreenshotFromRemote = triggerLiveScreenshotFromRemote;







function triggerLiveInspectFromRemote() {



    const selectEl = document.getElementById('remote-target-select');



    if (!selectEl || !selectEl.value) {



        showBanner("Please select the target online player first!", "error");



        return;



    }



    const selectedOpt = selectEl.options[selectEl.selectedIndex];



    const key = selectedOpt.dataset.key || '';



    const mc = selectedOpt.dataset.mc || '';



    openAdminInspectorModal(key, mc);



}



window.triggerLiveInspectFromRemote = triggerLiveInspectFromRemote;







async function openAdminScreenshotModal(targetKey, targetMc) {



    currentScreenshotTargetKey = targetKey || '';



    currentScreenshotTargetMc = targetMc || '';







    const modal = document.getElementById('admin-screenshot-modal');



    if (!modal) return;







    modal.classList.remove('hidden');



    modal.style.setProperty('display', 'flex', 'important');







    const userLabel = document.getElementById('shot-meta-user');



    if (userLabel) userLabel.textContent = 'Player: ' + (targetMc || targetKey || 'Unknown');



    const timeLabel = document.getElementById('shot-meta-time');



    if (timeLabel) timeLabel.textContent = 'Time: ' + new Date().toLocaleTimeString('en-US');







    const loader = document.getElementById('screenshot-modal-loader');



    const imgEl = document.getElementById('screenshot-modal-img');



    if (loader) {



        loader.style.display = 'flex';



        loader.innerHTML = `



            <div style="width: 38px; height: 38px; border: 3px solid rgba(56, 189, 248, 0.2); border-top-color: #38bdf8; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>



            <div style="font-size: 13px; font-family: 'JetBrains Mono', monospace; font-weight: 600;">The frame is taken from the player client...</div>



            <div style="font-size: 11px; color: var(--text-muted);">Please wait (1-2 seconds)</div>



        `;



    }



    if (imgEl) {



        imgEl.style.display = 'none';



        imgEl.src = '';



    }







    await requestScreenshotPayload();



}



window.openAdminScreenshotModal = openAdminScreenshotModal;







function closeAdminScreenshotModal() {



    if (screenshotPollTimer) {



        clearInterval(screenshotPollTimer);



        screenshotPollTimer = null;



    }



    const modal = document.getElementById('admin-screenshot-modal');



    if (modal) {



        modal.classList.add('hidden');



        modal.style.setProperty('display', 'none', 'important');



    }



}



window.closeAdminScreenshotModal = closeAdminScreenshotModal;







async function retakeAdminScreenshot() {



    const loader = document.getElementById('screenshot-modal-loader');



    const imgEl = document.getElementById('screenshot-modal-img');



    if (loader) {



        loader.style.display = 'flex';



        loader.innerHTML = `



            <div style="width: 38px; height: 38px; border: 3px solid rgba(56, 189, 248, 0.2); border-top-color: #38bdf8; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>



            <div style="font-size: 13px; font-family: 'JetBrains Mono', monospace; font-weight: 600;">Taking a new frame from the player client...</div>



            <div style="font-size: 11px; color: var(--text-muted);">Please wait (1-2 seconds)</div>



        `;



    }



    if (imgEl) imgEl.style.display = 'none';



    await requestScreenshotPayload();



}



window.retakeAdminScreenshot = retakeAdminScreenshot;







async function requestScreenshotPayload() {



    if (screenshotPollTimer) {



        clearInterval(screenshotPollTimer);



        screenshotPollTimer = null;



    }







    try {



        const metadata = (currentUser && currentUser.user_metadata) || {};



        const adminName = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name || 'Admin';







        const res = await pulseApiFetch("https://api.pulseclient.xyz/admin/remote-screenshot", {



            method: "POST",



            headers: { "Content-Type": "application/json" },



            body: JSON.stringify({



                target_key: currentScreenshotTargetKey,



                target_mc: currentScreenshotTargetMc,



                admin_user: adminName



            })



        });







        const data = await res.json();



        console.log("[Screenshot] Request response:", data);







        let attempts = 0;



        const targetLookup = currentScreenshotTargetMc || currentScreenshotTargetKey;







        screenshotPollTimer = setInterval(async () => {



            attempts++;



            if (attempts > 20) {



                clearInterval(screenshotPollTimer);



                screenshotPollTimer = null;



                const loader = document.getElementById('screenshot-modal-loader');



                if (loader) {



                    loader.innerHTML = `



                        <div style="font-size: 28px; color: #f43f5e;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>



                        <div style="font-size: 13px; color: #f43f5e; font-weight: 700;">We couldn't get a shot from the player in time.</div>



                        <div style="font-size: 11px; color: var(--text-muted);">Maybe the player has left the server or is in the menu.</div>



                    `;



                }



                return;



            }







            try {



                const pollRes = await pulseApiFetch(`https://api.pulseclient.xyz/admin/screenshot-view/${encodeURIComponent(targetLookup)}?t=${Date.now()}`);



                if (pollRes.ok) {



                    const pollData = await pollRes.json();



                    if (pollData && pollData.screenshot && pollData.screenshot.image_data) {



                        clearInterval(screenshotPollTimer);



                        screenshotPollTimer = null;



                        renderScreenshotImage(pollData.screenshot);



                    }



                }



            } catch (err) {



                console.warn("[Screenshot poll warning]", err);



            }



        }, 800);







    } catch (e) {



        console.error("Screenshot request failed:", e);



        showBanner("Screenshot request error: " + e.message, "error");



    }



}







function renderScreenshotImage(shot) {



    const loader = document.getElementById('screenshot-modal-loader');



    const imgEl = document.getElementById('screenshot-modal-img');



    const dlBtn = document.getElementById('screenshot-modal-download-btn');



    const timeLabel = document.getElementById('shot-meta-time');







    if (loader) loader.style.display = 'none';



    if (imgEl) {



        imgEl.src = shot.image_data;



        imgEl.style.display = 'block';



    }



    if (dlBtn) {



        dlBtn.href = shot.image_data;



        dlBtn.download = `Pulse_Screenshot_${shot.mc_user || 'player'}_${Date.now()}.png`;



    }



    if (timeLabel && shot.created_at) {



        timeLabel.textContent = 'Time: ' + new Date(shot.created_at).toLocaleTimeString('en-US');



    }



}







async function openAdminInspectorModal(targetKey, targetMc) {



    currentInspectTargetKey = targetKey || '';



    currentInspectTargetMc = targetMc || '';







    const modal = document.getElementById('admin-inspector-modal');



    if (!modal) return;







    modal.classList.remove('hidden');



    modal.style.setProperty('display', 'flex', 'important');







    const playerTag = document.getElementById('inspect-modal-player-tag');



    if (playerTag) playerTag.textContent = '@' + (targetMc || targetKey || 'Player');







    const loader = document.getElementById('inspect-modal-loader');



    const content = document.getElementById('inspect-modal-content');



    if (loader) {



        loader.style.display = 'flex';



        loader.innerHTML = `



            <div style="width: 38px; height: 38px; border: 3px solid rgba(168, 85, 247, 0.2); border-top-color: #c084fc; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>



            <div style="font-size: 13px; font-family: 'JetBrains Mono', monospace; font-weight: 600;">Loading player inventory and status...</div>



        `;



    }



    if (content) content.style.display = 'none';







    await requestInspectPayload();



}



window.openAdminInspectorModal = openAdminInspectorModal;







function closeAdminInspectorModal() {



    if (inspectPollTimer) {



        clearInterval(inspectPollTimer);



        inspectPollTimer = null;



    }



    const modal = document.getElementById('admin-inspector-modal');



    if (modal) {



        modal.classList.add('hidden');



        modal.style.setProperty('display', 'none', 'important');



    }



}



window.closeAdminInspectorModal = closeAdminInspectorModal;







async function refreshAdminInspect() {



    const loader = document.getElementById('inspect-modal-loader');



    const content = document.getElementById('inspect-modal-content');



    if (loader) {



        loader.style.display = 'flex';



        loader.innerHTML = `



            <div style="width: 38px; height: 38px; border: 3px solid rgba(168, 85, 247, 0.2); border-top-color: #c084fc; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>



            <div style="font-size: 13px; font-family: 'JetBrains Mono', monospace; font-weight: 600;">Data is being updated...</div>



        `;



    }



    if (content) content.style.display = 'none';



    await requestInspectPayload();



}



window.refreshAdminInspect = refreshAdminInspect;







async function requestInspectPayload() {



    if (inspectPollTimer) {



        clearInterval(inspectPollTimer);



        inspectPollTimer = null;



    }







    try {



        const metadata = (currentUser && currentUser.user_metadata) || {};



        const adminName = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name || 'Admin';







        const res = await pulseApiFetch("https://api.pulseclient.xyz/admin/remote-inspect", {



            method: "POST",



            headers: { "Content-Type": "application/json" },



            body: JSON.stringify({



                target_key: currentInspectTargetKey,



                target_mc: currentInspectTargetMc,



                admin_user: adminName



            })



        });







        const data = await res.json();



        console.log("[Inspect] Request response:", data);







        let attempts = 0;



        const targetLookup = currentInspectTargetMc || currentInspectTargetKey;







        inspectPollTimer = setInterval(async () => {



            attempts++;



            if (attempts > 20) {



                clearInterval(inspectPollTimer);



                inspectPollTimer = null;



                const loader = document.getElementById('inspect-modal-loader');



                if (loader) {



                    loader.innerHTML = `



                        <div style="font-size: 28px; color: #f43f5e;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>



                        <div style="font-size: 13px; color: #f43f5e; font-weight: 700;">Failed to inspect player.</div>



                        <div style="font-size: 11px; color: var(--text-muted);">The client did not respond in time.</div>



                    `;



                }



                return;



            }







            try {



                const pollRes = await pulseApiFetch(`https://api.pulseclient.xyz/admin/inspect-view/${encodeURIComponent(targetLookup)}?t=${Date.now()}`);



                if (pollRes.ok) {



                    const pollData = await pollRes.json();



                    if (pollData && pollData.inspect && pollData.inspect.inspect_data) {



                        clearInterval(inspectPollTimer);



                        inspectPollTimer = null;



                        renderInspectDetails(pollData.inspect.inspect_data);



                    }



                }



            } catch (err) {



                console.warn("[Inspect poll warning]", err);



            }



        }, 800);







    } catch (e) {



        console.error("Inspect request failed:", e);



        showBanner("Inspection error: " + e.message, "error");



    }



}







function renderInspectDetails(data) {



    const loader = document.getElementById('inspect-modal-loader');



    const content = document.getElementById('inspect-modal-content');



    if (loader) loader.style.display = 'none';



    if (content) content.style.display = 'flex';







    const hpEl = document.getElementById('insp-hp-text');



    if (hpEl) {



        const hp = parseFloat(data.health || 20).toFixed(1);



        const maxHp = parseFloat(data.max_health || 20).toFixed(1);



        hpEl.textContent = `${hp} / ${maxHp} HP`;



    }



    const foodEl = document.getElementById('insp-food-text');



    if (foodEl) foodEl.textContent = `${data.food || 0} / 20`;



    const armorEl = document.getElementById('insp-armor-text');



    if (armorEl) armorEl.textContent = `${data.armor || 0} Armor (Lvl ${data.xp_level || 0})`;



    const coordsEl = document.getElementById('insp-coords-text');



    if (coordsEl) coordsEl.textContent = `X: ${data.x || 0}, Y: ${data.y || 0}, Z: ${data.z || 0}`;



    const dimEl = document.getElementById('insp-dim-text');



    if (dimEl) {



        let dimName = data.dimension || 'Overworld';



        if (dimName.includes('nether')) dimName = 'The Nether';



        else if (dimName.includes('end')) dimName = 'The End';



        else dimName = 'Overworld';



        dimEl.textContent = `${dimName} • ${data.server || 'Main Menu'}`;



    }







    const mainEl = document.getElementById('insp-item-main');



    if (mainEl) mainEl.textContent = data.main_hand && data.main_hand !== 'Air' ? `${data.main_hand} (x${data.main_hand_count || 1})` : 'empty (air)';



    const offEl = document.getElementById('insp-item-off');



    if (offEl) offEl.textContent = data.off_hand && data.off_hand !== 'Air' ? `${data.off_hand} (x${data.off_hand_count || 1})` : 'empty (air)';



    const helmEl = document.getElementById('insp-item-helm');



    if (helmEl) helmEl.textContent = data.helmet || 'None';



    const chestEl = document.getElementById('insp-item-chest');



    if (chestEl) chestEl.textContent = data.chest || 'None';



    const legsEl = document.getElementById('insp-item-legs');



    if (legsEl) legsEl.textContent = data.legs || 'None';



    const bootsEl = document.getElementById('insp-item-boots');



    if (bootsEl) bootsEl.textContent = data.boots || 'None';







    const gridEl = document.getElementById('insp-inventory-grid');



    if (gridEl) {



        gridEl.innerHTML = '';



        const items = data.inventory || [];



        const itemMap = {};



        items.forEach(it => { itemMap[it.slot] = it; });







        for (let i = 0; i < 36; i++) {



            const slotBox = document.createElement('div');



            const isHotbar = (i >= 0 && i <= 8);



            slotBox.style.cssText = `



                aspect-ratio: 1;



                background: ${isHotbar ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.03)'};



                border: 1px solid ${isHotbar ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.08)'};



                border-radius: 6px;



                display: flex;



                flex-direction: column;



                align-items: center;



                justify-content: center;



                padding: 3px;



                position: relative;



                font-family: 'JetBrains Mono', monospace;



                min-height: 48px;



            `;







            const it = itemMap[i];



            if (it) {



                slotBox.title = `${it.name} (x${it.count})`;



                slotBox.innerHTML = `



                    <div style="font-size: 10px; color: #f8fafc; font-weight: 700; text-align: center; line-height: 1.1; max-height: 24px; overflow: hidden; text-overflow: ellipsis;">${it.name.replace('block.minecraft.', '').replace('item.minecraft.', '')}</div>



                    <div style="font-size: 10px; font-weight: 800; color: #38bdf8; position: absolute; bottom: 2px; right: 4px;">x${it.count}</div>



                `;



            } else {



                slotBox.innerHTML = `<span style="font-size: 9px; color: rgba(255,255,255,0.15);">${i}</span>`;



            }



            gridEl.appendChild(slotBox);



        }



    }







    const effContainer = document.getElementById('insp-effects-container');



    if (effContainer) {



        effContainer.innerHTML = '';



        const effects = data.effects || [];



        if (effects.length === 0) {



            effContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 11.5px;">There are no active effects</span>';



        } else {



            effects.forEach(ef => {



                const badge = document.createElement('div');



                badge.style.cssText = `



                    background: rgba(16, 185, 129, 0.15);



                    border: 1px solid rgba(16, 185, 129, 0.35);



                    color: #34d399;



                    padding: 4px 10px;



                    border-radius: 6px;



                    font-weight: 700;



                    font-size: 11.5px;



                    display: inline-flex;



                    align-items: center;



                    gap: 6px;



                `;



                const cleanName = (ef.name || 'Effect').replace('effect.minecraft.', '').replace('_', ' ').toUpperCase();



                const mins = Math.floor((ef.duration_seconds || 0) / 60);



                const secs = ((ef.duration_seconds || 0) % 60).toString().padStart(2, '0');



                badge.innerHTML = `<span>${cleanName} ${ef.amplifier > 0 ? (ef.amplifier + 1) : ''}</span><span style="color: #a7f3d0; font-family: monospace;">(${mins}:${secs})</span>`;



                effContainer.appendChild(badge);



            });



        }



    }



}







// ==========================================



// ADMIN CRASH REPORTS & DIAGNOSTICS LOGIC



// ==========================================



let adminCrashReports = [];



let adminCrashReportsLoading = false;







async function fetchAdminCrashReports(showFeedback = false) {



    try {



        adminCrashReportsLoading = true;



        const res = await pulseApiFetch("https://api.pulseclient.xyz/admin/crash-reports");



        if (res.ok) {



            const data = await res.json();



            adminCrashReports = data.reports || [];



            updateCrashBadges(adminCrashReports.length);



            renderAdminCrashReports();



            if (showFeedback && typeof showToast === 'function') {



                showToast("Crash reports updated successfully", "success");



            }



        }



    } catch (err) {



        console.error("Error fetching crash reports:", err);



    } finally {



        adminCrashReportsLoading = false;



    }



}



window.fetchAdminCrashReports = fetchAdminCrashReports;







function updateCrashBadges(count) {



    const badge = document.getElementById('admin-crash-badge');



    const tag = document.getElementById('admin-crashes-count-tag');



    if (badge) {



        badge.textContent = count.toString();



        if (count > 0) {



            badge.classList.remove('hidden');



        } else {



            badge.classList.add('hidden');



        }



    }



    if (tag) {



        tag.textContent = count + " Crash";



    }



}







function renderAdminCrashReports() {



    const tbody = document.getElementById('admin-crashes-table-body');



    if (!tbody) return;







    const searchInput = document.getElementById('admin-crashes-search-input');



    const filterText = (searchInput ? searchInput.value : "").toLowerCase().trim();







    let filtered = adminCrashReports;



    if (filterText) {



        filtered = adminCrashReports.filter(r => 



            (r.mc_username || '').toLowerCase().includes(filterText) ||



            (r.license_key || '').toLowerCase().includes(filterText) ||



            (r.error_title || '').toLowerCase().includes(filterText) ||



            (r.os_name || '').toLowerCase().includes(filterText) ||



            (r.stack_trace || '').toLowerCase().includes(filterText)



        );



    }







    if (!filtered || filtered.length === 0) {



        tbody.innerHTML = `



            <tr>



                <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 32px;">



                    <div style="font-size: 24px; margin-bottom: 8px;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>



                    <div>No crash reports found</div>



                </td>



            </tr>



        `;



        return;



    }







    tbody.innerHTML = '';



    filtered.forEach(report => {



        const row = document.createElement('tr');



        const timeStr = report.created_at ? new Date(report.created_at).toLocaleString('en-US') : 'Unknown';



        const maskedKey = report.license_key && report.license_key.length > 8 ? 



            (report.license_key.substring(0, 4) + '-****-****') : (report.license_key || 'No Key');







        const titleEscaped = (report.error_title || 'Unknown Error').replace(/</g, "&lt;").replace(/>/g, "&gt;");



        const mcUser = (report.mc_username || 'Unknown').replace(/</g, "&lt;").replace(/>/g, "&gt;");



        const osName = (report.os_name || 'Windows (x64)').replace(/</g, "&lt;").replace(/>/g, "&gt;");



        const modVer = (report.mod_version || 'v8.0.0').replace(/</g, "&lt;").replace(/>/g, "&gt;");







        row.innerHTML = `



            <td>



                <span style="font-size: 12px; color: var(--text-muted); white-space: nowrap;">${timeStr}</span>



            </td>



            <td>



                <div style="display: flex; flex-direction: column;">



                    <span style="font-weight: 700; color: #fff; font-size: 13.5px;">${mcUser}</span>



                    <code style="font-size: 11px; color: #a5b4fc; font-family: monospace;">${maskedKey}</code>



                </div>



            </td>



            <td>



                <div style="max-width: 340px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">



                    <span class="badge-jar" style="background: rgba(239, 68, 68, 0.18); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); margin-right: 6px;">ERROR</span>



                    <strong style="color: #fca5a5; font-size: 12.5px;">${titleEscaped}</strong>



                </div>



            </td>



            <td>



                <div style="display: flex; flex-direction: column; font-size: 12px;">



                    <span style="color: #e2e8f0;">${osName}</span>



                    <span style="font-size: 11px; color: #38bdf8; font-weight: 600;">Pulse ${modVer}</span>



                </div>



            </td>



            <td style="text-align: right;">



                <button type="button" class="btn-remote-cmd" style="background: rgba(239, 68, 68, 0.12) !important; border-color: rgba(239, 68, 68, 0.35) !important; color: #ef4444 !important;" data-id="${report.id}" onclick="openAdminCrashDetailModal(this.getAttribute('data-id'))">



                    Stack Trace



                </button>



            </td>



        `;



        tbody.appendChild(row);



    });



}



window.renderAdminCrashReports = renderAdminCrashReports;







let activeViewingCrashReport = null;







function openAdminCrashDetailModal(reportId) {



    const report = adminCrashReports.find(r => r.id === reportId);



    if (!report) return;



    activeViewingCrashReport = report;







    const modal = document.getElementById('admin-crash-detail-modal');



    if (!modal) return;







    const titleEl = document.getElementById('crash-modal-title');



    const subtitleEl = document.getElementById('crash-modal-subtitle');



    const metaEl = document.getElementById('crash-modal-meta');



    const traceEl = document.getElementById('crash-modal-trace');







    if (titleEl) titleEl.textContent = report.error_title || 'Crash Report';



    if (subtitleEl) subtitleEl.textContent = (report.mc_username || 'Player') + ' — ' + (new Date(report.created_at).toLocaleString('en-US'));







    if (metaEl) {



        metaEl.innerHTML = `



            <span class="badge-jar" style="background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc; padding: 4px 10px;">${(report.mc_username || 'Unknown')}</span>



            <span class="badge-jar" style="background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #10b981; padding: 4px 10px;">${(report.license_key || 'No Key')}</span>



            <span class="badge-jar" style="background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.3); color: #38bdf8; padding: 4px 10px;">${(report.os_name || 'OS Unknown')}</span>



            <span class="badge-jar" style="background: rgba(234,179,8,0.15); border: 1px solid rgba(234,179,8,0.3); color: #facc15; padding: 4px 10px;">Version: ${(report.mod_version || 'v8.0.0')}</span>



            <span class="badge-jar" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; padding: 4px 10px;">IP: ${(report.ip_address || 'Unknown')}</span>



        `;



    }







    if (traceEl) {



        const fullContent = report.stack_trace || report.crash_report_text || 'No stack trace provided.';



        traceEl.textContent = fullContent;



    }







    modal.classList.remove('hidden');



    modal.style.setProperty('display', 'flex', 'important');



}



window.openAdminCrashDetailModal = openAdminCrashDetailModal;







function closeAdminCrashDetailModal() {



    const modal = document.getElementById('admin-crash-detail-modal');



    if (modal) {



        modal.classList.add('hidden');



        modal.style.setProperty('display', 'none', 'important');



    }



    activeViewingCrashReport = null;



}



window.closeAdminCrashDetailModal = closeAdminCrashDetailModal;







function copyCrashStackTrace() {



    if (!activeViewingCrashReport) return;



    const content = activeViewingCrashReport.stack_trace || activeViewingCrashReport.crash_report_text || '';



    if (navigator.clipboard) {



        navigator.clipboard.writeText(content).then(() => {



            if (typeof showToast === 'function') showToast("Stack Trace copied to clipboard!", "success");



            else alert("Stack Trace copied!");



        }).catch(() => {});



    }



}



window.copyCrashStackTrace = copyCrashStackTrace;







async function clearAdminCrashReports() {



    if (!confirm("Are you sure you want to clear all crash reports?")) return;



    try {



        const res = await pulseApiFetch("https://api.pulseclient.xyz/admin/crash-reports/clear", {



            method: "POST",



            headers: { "Content-Type": "application/json" }



        });



        if (res.ok) {



            adminCrashReports = [];



            updateCrashBadges(0);



            renderAdminCrashReports();



            if (typeof showToast === 'function') showToast("Crash reports have been cleared", "success");



        }



    } catch (e) {



        console.error("Error clearing crash reports:", e);



    }



}



window.clearAdminCrashReports = clearAdminCrashReports;







// ==========================================



// ADMIN LIVE SUPPORT DESK (/pulse help)



// ==========================================



let adminSupportTickets = [];



let supportTicketsMap = new Map();



let deletedSupportTicketIds = new Set(JSON.parse(localStorage.getItem('pulse_deleted_tickets') || '[]'));



let supportFilterTab = 'open'; // 'open' | 'resolved' | 'all'



let knownSupportTicketIds = new Set();



let adminSupportFirstLoad = true;



let lastSupportRenderedJson = '';







function playSupportChime() {



    try {



        const ctx = new (window.AudioContext || window.webkitAudioContext)();



        const osc = ctx.createOscillator();



        const gain = ctx.createGain();



        osc.type = 'sine';



        osc.frequency.setValueAtTime(587.33, ctx.currentTime);



        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1);



        gain.gain.setValueAtTime(0.2, ctx.currentTime);



        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);



        osc.connect(gain);



        gain.connect(ctx.destination);



        osc.start();



        osc.stop(ctx.currentTime + 0.45);



    } catch (e) {}



}







function setSupportFilterTab(tab) {



    supportFilterTab = tab;



    ['open', 'resolved', 'all'].forEach(t => {



        const btn = document.getElementById(`btn-support-filter-${t}`);



        if (btn) {



            if (t === tab) {



                btn.style.border = '1px solid #00ff9d';



                btn.style.background = 'rgba(0, 255, 157, 0.12)';



                btn.style.color = '#00ff9d';



            } else {



                btn.style.border = '1px solid rgba(255, 255, 255, 0.1)';



                btn.style.background = 'rgba(255, 255, 255, 0.03)';



                btn.style.color = '#94a3b8';



            }



        }



    });



    renderAdminSupportTickets(true);



}



window.setSupportFilterTab = setSupportFilterTab;







async function fetchAdminSupportTickets(showFeedback = false) {



    try {



        const res = await pulseApiFetch("https://api.pulseclient.xyz/admin/support-tickets");



        if (!res.ok) return;



        const data = await res.json();



        const incoming = data.tickets || [];







        // Merge incoming tickets without dropping existing tickets on temporary empty replica responses



        let hasNew = false;



        incoming.forEach(t => {



            if (deletedSupportTicketIds.has(t.id)) return;



            const prev = supportTicketsMap.get(t.id);



            if (!prev || JSON.stringify(prev) !== JSON.stringify(t)) {



                supportTicketsMap.set(t.id, t);



            }



            if (!knownSupportTicketIds.has(t.id)) {



                knownSupportTicketIds.add(t.id);



                if (!adminSupportFirstLoad && t.status === 'open') {



                    hasNew = true;



                }



            }



        });







        if (hasNew) {



            playSupportChime();



            if (typeof showToast === 'function') {



                showToast("New message from a player!", "info");



            }



        }



        adminSupportFirstLoad = false;







        // Sync adminSupportTickets array for external references



        adminSupportTickets = Array.from(supportTicketsMap.values())



            .filter(t => !deletedSupportTicketIds.has(t.id))



            .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));







        // Update counts



        let openCount = 0;



        let resolvedCount = 0;



        adminSupportTickets.forEach(t => {



            if (t.status === 'open') openCount++;



            else resolvedCount++;



        });







        const badge = document.getElementById('admin-support-badge');



        if (badge) {



            if (openCount > 0) {



                badge.textContent = openCount;



                badge.classList.remove('hidden');



                badge.style.display = 'inline-block';



            } else {



                badge.classList.add('hidden');



                badge.style.display = 'none';



            }



        }







        const tabOpen = document.getElementById('support-tab-open-count');



        if (tabOpen) tabOpen.textContent = openCount;



        const tabRes = document.getElementById('support-tab-resolved-count');



        if (tabRes) tabRes.textContent = resolvedCount;



        const tabAll = document.getElementById('support-tab-all-count');



        if (tabAll) tabAll.textContent = openCount + resolvedCount;







        renderAdminSupportTickets(showFeedback);



        populateSupportDirectTargets();







        if (showFeedback && typeof showToast === 'function') {



            showToast("Support messages have been updated", "success");



        }



    } catch (e) {



        console.error("Error fetching support tickets:", e);



    }



}



window.fetchAdminSupportTickets = fetchAdminSupportTickets;







function renderAdminSupportTickets(force = false) {



    const container = document.getElementById('admin-support-tickets-container');



    if (!container) return;







    // Filter tickets according to active tab



    const filtered = (adminSupportTickets || []).filter(t => {



        if (deletedSupportTicketIds.has(t.id)) return false;



        if (supportFilterTab === 'open') return t.status === 'open';



        if (supportFilterTab === 'resolved') return t.status === 'replied' || t.status === 'closed';



        return true;



    });







    const currentHash = JSON.stringify({ tab: supportFilterTab, tickets: filtered });



    if (!force && currentHash === lastSupportRenderedJson) {



        return; // ZERO DOM modifications when nothing changed -> ZERO flickering!



    }



    lastSupportRenderedJson = currentHash;







    // Save input drafts & focus



    const drafts = {};



    let focusedId = null;



    let focusStart = 0, focusEnd = 0;



    container.querySelectorAll('input[id^="support-reply-input-"]').forEach(inp => {



        drafts[inp.id] = inp.value;



        if (document.activeElement === inp) {



            focusedId = inp.id;



            focusStart = inp.selectionStart || 0;



            focusEnd = inp.selectionEnd || 0;



        }



    });







    if (filtered.length === 0) {



        let emptyMsg = "There are no incoming messages";



        if (supportFilterTab === 'open') emptyMsg = "No active messages (all answered!)";



        else if (supportFilterTab === 'resolved') emptyMsg = "The history of replied messages is empty";







        container.innerHTML = `



            <div style="text-align: center; color: var(--text-muted); padding: 42px 20px; border: 1px dashed rgba(255, 255, 255, 0.1); border-radius: 12px; background: rgba(0,0,0,0.2);">



                <div style="font-size: 24px; margin-bottom: 8px;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>



                <div style="font-size: 13.5px; font-weight: 600;">${emptyMsg}</div>



                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">When a player logs into a game <code>/pulse help &lt;text&gt;</code>, the message will appear momentarily here.</div>



            </div>



        `;



        return;



    }







    container.innerHTML = '';



    filtered.forEach(t => {



        const isOpen = t.status === "open";



        const isClosed = t.status === "closed";



        const isReplied = t.status === "replied";



        const dateStr = t.created_at ? new Date(t.created_at).toLocaleString('en-US') : 'recently';



        const repliedDateStr = t.replied_at ? new Date(t.replied_at).toLocaleString('en-US') : '';



        const mcUser = (t.mc_username || 'Unknown').replace(/</g, "&lt;").replace(/>/g, "&gt;");



        const msgEscaped = (t.message || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");



        const replyEscaped = (t.reply || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");



        const maskedKey = t.license_key && t.license_key.length > 8 ? 



            (t.license_key.substring(0, 4) + '-****-****') : (t.license_key || 'No Key');







        const card = document.createElement('div');



        card.className = 'support-ticket-card';



        card.style.cssText = `



            background: ${isOpen ? 'rgba(0, 255, 157, 0.04)' : 'rgba(15, 23, 42, 0.45)'};



            border: 1px solid ${isOpen ? 'rgba(0, 255, 157, 0.35)' : 'rgba(255, 255, 255, 0.08)'};



            border-left: 4px solid ${isOpen ? '#00ff9d' : (isReplied ? '#10b981' : '#64748b')};



            border-radius: 12px;



            padding: 16px 18px;



            box-shadow: ${isOpen ? '0 4px 20px rgba(0, 255, 157, 0.08)' : 'none'};



            transition: all 0.2s ease;



        `;







        let statusBadge = '';



        if (isOpen) {



            statusBadge = `<span class="badge-jar" style="background: rgba(239, 68, 68, 0.18); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px;">Awaiting response (OPEN)</span>`;



        } else if (isReplied) {



            statusBadge = `<span class="badge-jar" style="background: rgba(16, 185, 129, 0.18); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4); font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px;">REPLIED</span>`;



        } else {



            statusBadge = `<span class="badge-jar" style="background: rgba(100, 116, 139, 0.2); color: #94a3b8; border: 1px solid rgba(100, 116, 139, 0.4); font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px;">CLOSED</span>`;



        }







        card.innerHTML = `



            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">



                <div style="display: flex; align-items: center; gap: 12px;">



                    <img src="https://mc-heads.net/avatar/${encodeURIComponent(t.mc_username || 'Steve')}/42" alt="${mcUser}" 



                         style="width: 38px; height: 38px; border-radius: 8px; border: 1px solid rgba(0, 255, 157, 0.4); background: #0b1120;"



                         onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'38\\' height=\\'38\\' viewBox=\\'0 0 24 24\\' fill=\\'%2364748b\\'><circle cx=\\'12\\' cy=\\'8\\' r=\\'5\\'/><path d=\\'M20 21a8 8 0 0 0-16 0\\'/></svg>'">



                    <div>



                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">



                            <strong style="font-size: 14px; color: #fff;">${mcUser}</strong>



                            <span class="badge-jar" style="background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-size: 11px;">



                                ${t.server_name || 'Singleplayer'}



                            </span>



                            <code style="font-size: 11px; color: #a5b4fc; font-family: monospace;">${maskedKey}</code>



                        </div>



                        <span style="font-size: 11.5px; color: var(--text-muted);">${dateStr}</span>



                    </div>



                </div>



                <div style="display: flex; align-items: center; gap: 8px;">



                    ${statusBadge}



                    ${isOpen ? `



                        <button type="button" class="btn btn-secondary" onclick="closeSupportTicket('${t.id}')" style="padding: 4px 9px; font-size: 11px; border-radius: 6px; color: #94a3b8;" title="Mark as closed">



Close



                        </button>



                    ` : ''}



                    <button type="button" class="btn btn-secondary" onclick="deleteSupportTicket('${t.id}')" style="padding: 4px 9px; font-size: 11px; border-radius: 6px; color: #ef4444; border-color: rgba(239,68,68,0.3); display: inline-flex; align-items: center;" title="Delete message">



                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>



                    </button>



                </div>



            </div>







            <!-- Question Quote -->



            <div style="background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">



                <div style="font-size: 10.5px; text-transform: uppercase; font-weight: 700; color: #94a3b8; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">



                    <span>Message from the game (/pulse help):</span>



                </div>



                <div style="font-size: 13.5px; color: #f1f5f9; font-weight: 600; line-height: 1.5;">${msgEscaped}</div>



            </div>







            ${t.reply ? `



                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 10px 14px; margin-bottom: 12px;">



                    <div style="font-size: 10.5px; font-weight: 700; color: #10b981; margin-bottom: 2px;">Admin response (${repliedDateStr}):</div>



                    <div style="font-size: 13px; color: #e2e8f0;">${replyEscaped}</div>



                </div>



            ` : ''}







            <!-- Reply Box -->



            <div style="display: flex; gap: 8px; align-items: center; margin-top: 8px;">



                <input type="text" id="support-reply-input-${t.id}" 



                       placeholder="${isOpen ? 'Type a reply for the player (it appears in the center of their screen)...' : 'Send an additional message...'}" 



                       class="custom-dark-input" 



                       style="font-size: 13px; padding: 9px 12px; flex: 1; border-radius: 8px; background: #070c18 !important; border: 1px solid rgba(0, 255, 157, 0.3) !important; color: #fff;"



                       onkeydown="if(event.key==='Enter') handleSendSupportReply('${t.id}')">



                <button type="button" class="btn-remote-cmd" 



                        style="background: linear-gradient(135deg, #00ff9d 0%, #059669 100%) !important; color: #022c22 !important; border: 1px solid #00ff9d !important; font-weight: 800 !important; padding: 8px 16px !important; border-radius: 8px !important; white-space: nowrap !important;"



                        onclick="handleSendSupportReply('${t.id}')">



                    SEND REPLY



                </button>



            </div>



        `;



        container.appendChild(card);



    });







    // Restore drafts & focus



    Object.keys(drafts).forEach(id => {



        const el = document.getElementById(id);



        if (el) el.value = drafts[id];



    });



    if (focusedId) {



        const el = document.getElementById(focusedId);



        if (el) {



            el.focus();



            try { el.setSelectionRange(focusStart, focusEnd); } catch (e) {}



        }



    }



}



window.renderAdminSupportTickets = renderAdminSupportTickets;







async function deleteSupportTicket(ticketId) {



    if (!confirm("Are you sure you want to delete this message?")) return;



    deletedSupportTicketIds.add(ticketId);



    try {



        localStorage.setItem('pulse_deleted_tickets', JSON.stringify(Array.from(deletedSupportTicketIds)));



    } catch(e) {}



    supportTicketsMap.delete(ticketId);



    adminSupportTickets = Array.from(supportTicketsMap.values())



        .filter(t => !deletedSupportTicketIds.has(t.id));



    lastSupportRenderedJson = '';



    renderAdminSupportTickets(true);



    if (typeof showToast === 'function') showToast("The message has been deleted", "info");







    try {



        await pulseApiFetch("https://api.pulseclient.xyz/admin/support-tickets/delete", {



            method: "POST",



            headers: { "Content-Type": "application/json" },



            body: JSON.stringify({ ticket_id: ticketId })



        });



    } catch (e) {



        console.warn("Delete ticket backend sync:", e);



    }



}



window.deleteSupportTicket = deleteSupportTicket;







async function clearAllSupportTickets() {



    if (!confirm("Are you sure you want to clear all message history?")) return;



    supportTicketsMap.forEach((_, id) => deletedSupportTicketIds.add(id));



    try {



        localStorage.setItem('pulse_deleted_tickets', JSON.stringify(Array.from(deletedSupportTicketIds)));



    } catch(e) {}



    supportTicketsMap.clear();



    adminSupportTickets = [];



    lastSupportRenderedJson = '';



    renderAdminSupportTickets(true);



    if (typeof showToast === 'function') showToast("History cleared", "success");







    try {



        await pulseApiFetch("https://api.pulseclient.xyz/admin/support-tickets/clear", {



            method: "POST"



        });



    } catch (e) {



        console.warn("Clear tickets backend sync:", e);



    }



}



window.clearAllSupportTickets = clearAllSupportTickets;







async function closeSupportTicket(ticketId) {



    const t = supportTicketsMap.get(ticketId);



    if (t) {



        t.status = "closed";



        t.closed_at = new Date().toISOString();



        adminSupportTickets = Array.from(supportTicketsMap.values())



            .filter(x => !deletedSupportTicketIds.has(x.id));



        lastSupportRenderedJson = '';



        renderAdminSupportTickets(true);



        if (typeof showToast === 'function') showToast("Message closed", "info");



    }







    try {



        await pulseApiFetch("https://api.pulseclient.xyz/admin/support-tickets/close", {



            method: "POST",



            headers: { "Content-Type": "application/json" },



            body: JSON.stringify({ ticket_id: ticketId })



        });



    } catch (e) {



        console.warn("Close ticket backend sync:", e);



    }



}



window.closeSupportTicket = closeSupportTicket;







async function handleSendSupportReply(ticketId) {



    const input = document.getElementById(`support-reply-input-${ticketId}`);



    if (!input) return;



    const replyText = input.value.trim();



    if (!replyText) {



        if (typeof showToast === 'function') showToast("Please write the answer", "warning");



        else alert("Please write the answer");



        return;



    }







    try {



        input.disabled = true;



        const res = await pulseApiFetch("https://api.pulseclient.xyz/admin/support-reply", {



            method: "POST",



            headers: { "Content-Type": "application/json" },



            body: JSON.stringify({ ticket_id: ticketId, reply: replyText })



        });



        const data = await res.json();



        if (data.status === "success") {



            if (typeof showToast === 'function') {



                showToast("The answer was sent to the player in the center of the screen!", "success");



            }



            input.value = '';



            const t = supportTicketsMap.get(ticketId);



            if (t) {



                t.status = "replied";



                t.reply = replyText;



                t.replied_at = new Date().toISOString();



            }



            lastSupportRenderedJson = '';



            renderAdminSupportTickets(true);



        } else {



            if (typeof showToast === 'function') showToast(data.message || "error", "error");



        }



    } catch (e) {



        console.error("Error sending support reply:", e);



        if (typeof showToast === 'function') showToast("Connection error", "error");



    } finally {



        if (input) input.disabled = false;



    }



}



window.handleSendSupportReply = handleSendSupportReply;







function populateSupportDirectTargets() {



    const selectEl = document.getElementById('support-direct-target');



    if (!selectEl) return;



    const currentVal = selectEl.value;







    const options = [



        { value: "ALL", text: "All online players", mc: "ALL", key: "ALL" }



    ];







    const addedKeys = new Set();



    // From active sessions



    const sessions = window.lastFetchedSessions || [];



    sessions.forEach(s => {



        const mc = s.mc_username || 'Unknown';



        const key = s.license_key || '';



        const idKey = key || mc;



        if (idKey && !addedKeys.has(idKey)) {



            addedKeys.add(idKey);



            options.push({



                value: idKey,



                text: `${mc} (${s.mc_server || s.country || 'Online'})`,



                mc: mc,



                key: key



            });



        }



    });







    // From support tickets



    (adminSupportTickets || []).forEach(t => {



        const mc = t.mc_username;



        const key = t.license_key;



        const idKey = key || mc;



        if (idKey && !addedKeys.has(idKey)) {



            addedKeys.add(idKey);



            options.push({



                value: idKey,



                text: `${mc || 'Player'} (Ticket #${t.id || ''})`,



                mc: mc || '',



                key: key || ''



            });



        }



    });







    selectEl.innerHTML = '';



    options.forEach(opt => {



        const o = document.createElement('option');



        o.value = opt.value;



        o.textContent = opt.text;



        o.dataset.mc = opt.mc;



        o.dataset.key = opt.key;



        if (opt.value === currentVal) o.selected = true;



        selectEl.appendChild(o);



    });



}



window.populateSupportDirectTargets = populateSupportDirectTargets;







async function sendSupportDirectMessage() {



    const selectEl = document.getElementById('support-direct-target');



    const inputEl = document.getElementById('support-direct-msg');



    if (!inputEl) return;



    const text = inputEl.value.trim();



    if (!text) {



        if (typeof showToast === 'function') showToast("Please enter the message text", "warning");



        else alert("Please enter the message text");



        return;



    }







    const selectedOpt = selectEl && selectEl.options[selectEl.selectedIndex];



    const targetMc = (selectedOpt && selectedOpt.dataset.mc) || (selectEl ? selectEl.value : 'ALL');



    const targetKey = (selectedOpt && selectedOpt.dataset.key) || '';



    const adminUser = (currentUser && currentUser.user_metadata && (currentUser.user_metadata.user_name || currentUser.user_metadata.name)) || 'Admin';







    try {



        inputEl.disabled = true;



        const res = await pulseApiFetch('https://api.pulseclient.xyz/admin/remote-command', {



            method: 'POST',



            headers: { 'Content-Type': 'application/json' },



            body: JSON.stringify({



                target_key: targetKey,



                target_mc: targetMc,



                type: 'msg',



                payload: text,



                admin_user: adminUser



            })



        });



        const data = await res.json();



        if (res.ok && data.status === 'success') {



            if (typeof showToast === 'function') {



                showToast(`A message has been sent to the player (${targetMc})!`, "success");



            }



            inputEl.value = '';



        } else {



            throw new Error(data.message || 'Failed to send message');



        }



    } catch (err) {



        console.error("Direct support message error:", err);



        if (typeof showToast === 'function') {



            showToast("Error sending message: " + err.message, "error");



        }



    } finally {



        inputEl.disabled = false;



        inputEl.focus();



    }



}



window.sendSupportDirectMessage = sendSupportDirectMessage;







// ==========================================



// REMOTE MULTIMEDIA STUDIO & WALKIE-TALKIE



// ==========================================







function populateMultimediaTargets() {



    const selectEl = document.getElementById('multimedia-target');



    if (!selectEl) return;



    const currentVal = selectEl.value;







    const options = [



        { value: "ALL", text: "All online players (Broadcast to Everyone)", mc: "ALL", key: "ALL" }



    ];







    const addedKeys = new Set();



    const sessions = window.lastFetchedSessions || [];



    sessions.forEach(s => {



        const mc = s.mc_username || 'Unknown';



        const key = s.license_key || '';



        const idKey = key || mc;



        if (idKey && !addedKeys.has(idKey)) {



            addedKeys.add(idKey);



            options.push({



                value: idKey,



                text: `${mc} (${s.mc_server || s.country || 'Online'})`,



                mc: mc,



                key: key



            });



        }



    });







    (window.adminSupportTickets || []).forEach(t => {



        const mc = t.mc_username;



        const key = t.license_key;



        const idKey = key || mc;



        if (idKey && !addedKeys.has(idKey)) {



            addedKeys.add(idKey);



            options.push({



                value: idKey,



                text: `${mc || 'Player'}`,



                mc: mc || '',



                key: key || ''



            });



        }



    });







    selectEl.innerHTML = '';



    options.forEach(opt => {



        const o = document.createElement('option');



        o.value = opt.value;



        o.textContent = opt.text;



        o.dataset.mc = opt.mc;



        o.dataset.key = opt.key;



        if (opt.value === currentVal) o.selected = true;



        selectEl.appendChild(o);



    });



}



window.populateMultimediaTargets = populateMultimediaTargets;







// AudioBuffer to 16-bit PCM WAV Blob (Clean Java AudioSystem compatibility)



function audioBufferToWav(audioBuffer) {



    const numChannels = 1;



    const targetSampleRate = 22050;



    const sourceRate = audioBuffer.sampleRate;



    const channelData = audioBuffer.getChannelData(0);



    const ratio = sourceRate / targetSampleRate;



    const newLength = Math.round(channelData.length / ratio);



    const samples = new Float32Array(newLength);







    for (let i = 0; i < newLength; i++) {



        const srcIdx = Math.round(i * ratio);



        samples[i] = channelData[Math.min(srcIdx, channelData.length - 1)];



    }







    const buffer = new ArrayBuffer(44 + samples.length * 2);



    const view = new DataView(buffer);







    function writeString(view, offset, str) {



        for (let i = 0; i < str.length; i++) {



            view.setUint8(offset + i, str.charCodeAt(i));



        }



    }







    writeString(view, 0, 'RIFF');



    view.setUint32(4, 36 + samples.length * 2, true);



    writeString(view, 8, 'WAVE');



    writeString(view, 12, 'fmt ');



    view.setUint32(16, 16, true);



    view.setUint16(20, 1, true);



    view.setUint16(22, numChannels, true);



    view.setUint32(24, targetSampleRate, true);



    view.setUint32(28, targetSampleRate * numChannels * 2, true);



    view.setUint16(32, numChannels * 2, true);



    view.setUint16(34, 16, true);



    writeString(view, 36, 'data');



    view.setUint32(40, samples.length * 2, true);







    let offset = 44;



    for (let i = 0; i < samples.length; i++) {



        let s = Math.max(-1, Math.min(1, samples[i]));



        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);



        offset += 2;



    }







    return new Blob([view], { type: 'audio/wav' });



}







let walkieMediaStream = null;



let walkieMediaRecorder = null;



let walkieRecordedChunks = [];



let walkieRecordTimer = null;



let walkieRecordStartTime = 0;



let isWalkieRecording = false;







async function startWalkieTalkieRecording() {



    if (isWalkieRecording) return;



    try {



        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {



            throw new Error("Your browser does not support the microphone, or HTTPS is not enabled");



        }



        walkieMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });



        walkieRecordedChunks = [];



        walkieMediaRecorder = new MediaRecorder(walkieMediaStream);







        walkieMediaRecorder.ondataavailable = (e) => {



            if (e.data && e.data.size > 0) {



                walkieRecordedChunks.push(e.data);



            }



        };







        walkieMediaRecorder.onstop = async () => {



            await finalizeAndSendWalkieClip();



        };







        walkieMediaRecorder.start();



        isWalkieRecording = true;



        updateWalkieRecordingUI(true, false);



    } catch (err) {



        console.error("Mic access error:", err);



        if (typeof showToast === 'function') {



            showToast("The microphone could not be accessed: " + err.message, "error");



        } else {



            alert("The microphone could not be accessed: " + err.message);



        }



        updateWalkieRecordingUI(false, false);



    }



}



window.startWalkieTalkieRecording = startWalkieTalkieRecording;







function stopWalkieTalkieRecording() {



    if (!isWalkieRecording) return;



    isWalkieRecording = false;



    updateWalkieRecordingUI(false, true);







    try {



        if (walkieMediaRecorder && walkieMediaRecorder.state !== 'inactive') {



            walkieMediaRecorder.stop();



        }



    } catch (e) {



        console.error("Stop error:", e);



    }







    if (walkieMediaStream) {



        walkieMediaStream.getTracks().forEach(t => t.stop());



        walkieMediaStream = null;



    }



}



window.stopWalkieTalkieRecording = stopWalkieTalkieRecording;







function updateWalkieRecordingUI(recording, sending) {



    const btn = document.getElementById('btn-walkie-ptt');



    const dot = document.getElementById('walkie-indicator-dot');



    const txt = document.getElementById('walkie-status-text');



    const btnTxt = document.getElementById('walkie-btn-text');







    if (walkieRecordTimer) {



        clearInterval(walkieRecordTimer);



        walkieRecordTimer = null;



    }







    if (recording) {



        if (btn) btn.classList.add('recording');



        if (dot) {



            dot.style.background = '#ef4444';



            dot.style.boxShadow = '0 0 10px #ef4444';



        }



        if (btnTxt) btnTxt.textContent = "RECORDING...";



        walkieRecordStartTime = Date.now();



        if (txt) txt.textContent = "Writing... 00:00";







        walkieRecordTimer = setInterval(() => {



            const elapsed = Math.floor((Date.now() - walkieRecordStartTime) / 1000);



            const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');



            const secs = String(elapsed % 60).padStart(2, '0');



            if (txt) txt.textContent = `It is written... ${mins}:${secs}`;



            if (elapsed >= 30) {



                stopWalkieTalkieRecording();



            }



        }, 500);



    } else if (sending) {



        if (btn) btn.classList.remove('recording');



        if (dot) {



            dot.style.background = '#eab308';



            dot.style.boxShadow = '0 0 10px #eab308';



        }



        if (btnTxt) btnTxt.textContent = "SENDING...";



        if (txt) txt.textContent = "Sent to the player's headset...";



    } else {



        if (btn) btn.classList.remove('recording');



        if (dot) {



            dot.style.background = '#64748b';



            dot.style.boxShadow = 'none';



        }



        if (btnTxt) btnTxt.textContent = "HOLD TO TALK";



        if (txt) txt.textContent = "STANDBY (ready to talk)";



    }



}







async function finalizeAndSendWalkieClip() {



    try {



        if (!walkieRecordedChunks || walkieRecordedChunks.length === 0) {



            updateWalkieRecordingUI(false, false);



            return;



        }







        const rawBlob = new Blob(walkieRecordedChunks, { type: (walkieMediaRecorder && walkieMediaRecorder.mimeType) || 'audio/webm' });



        const arrayBuf = await rawBlob.arrayBuffer();







        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;



        const audioCtx = new AudioCtxClass();



        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuf);







        const wavBlob = audioBufferToWav(decodedBuffer);



        audioCtx.close();







        const reader = new FileReader();



        reader.readAsDataURL(wavBlob);



        reader.onloadend = async () => {



            const base64Audio = reader.result;



            await sendWalkieVoiceClip(base64Audio);



        };



    } catch (err) {



        console.error("Voice processing error:", err);



        if (typeof showToast === 'function') {



            showToast("Sound processing error: " + err.message, "error");



        }



        updateWalkieRecordingUI(false, false);



    }



}







async function sendWalkieVoiceClip(base64Audio) {



    const selectEl = document.getElementById('multimedia-target') || document.getElementById('support-direct-target');



    const selectedOpt = selectEl && selectEl.options[selectEl.selectedIndex];



    const targetMc = (selectedOpt && selectedOpt.dataset.mc) || (selectEl ? selectEl.value : 'ALL');



    const targetKey = (selectedOpt && selectedOpt.dataset.key) || '';



    const adminUser = (currentUser && currentUser.user_metadata && (currentUser.user_metadata.user_name || currentUser.user_metadata.name)) || 'Admin';







    try {



        const res = await pulseApiFetch('https://api.pulseclient.xyz/admin/broadcast-voice', {



            method: 'POST',



            headers: { 'Content-Type': 'application/json' },



            body: JSON.stringify({



                target_key: targetKey,



                target_mc: targetMc,



                audio_data: base64Audio,



                admin_user: adminUser



            })



        });



        const data = await res.json();



        if (res.ok && data.status === 'success') {



            if (typeof showToast === 'function') {



                showToast(`A voice call was sent to the player (@${targetMc})!`, "success");



            }



        } else {



            throw new Error(data.message || 'Failed to transmit the walkie-talkie');



        }



    } catch (err) {



        console.error("Voice broadcast error:", err);



        if (typeof showToast === 'function') {



            showToast("Radio transmission error: " + err.message, "error");



        }



    } finally {



        updateWalkieRecordingUI(false, false);



    }



}







async function sendAdminPlayMusic() {



    const selectTarget = document.getElementById('multimedia-target');



    const selectDisc = document.getElementById('multimedia-disc-select');



    const customUrlInput = document.getElementById('multimedia-custom-url');







    let track = '';



    if (customUrlInput && customUrlInput.value.trim()) {



        track = customUrlInput.value.trim();



    } else if (selectDisc) {



        track = selectDisc.value;



    }







    if (!track) {



        if (typeof showToast === 'function') showToast("Please select a drive or enter a link", "warning");



        return;



    }







    const selectedOpt = selectTarget && selectTarget.options[selectTarget.selectedIndex];



    const targetMc = (selectedOpt && selectedOpt.dataset.mc) || (selectTarget ? selectTarget.value : 'ALL');



    const targetKey = (selectedOpt && selectedOpt.dataset.key) || '';



    const adminUser = (currentUser && currentUser.user_metadata && (currentUser.user_metadata.user_name || currentUser.user_metadata.name)) || 'Admin';







    try {



        const res = await pulseApiFetch('https://api.pulseclient.xyz/admin/play-music', {



            method: 'POST',



            headers: { 'Content-Type': 'application/json' },



            body: JSON.stringify({



                target_key: targetKey,



                target_mc: targetMc,



                track: track,



                admin_user: adminUser



            })



        });



        const data = await res.json();



        if (res.ok && data.status === 'success') {



            if (typeof showToast === 'function') {



                showToast(`Music on (@${targetMc}): ${track}`, "success");



            }



            const statusEl = document.getElementById('multimedia-music-status');



            if (statusEl) {



                statusEl.textContent = `Now playing: ${track} (@${targetMc})`;



                statusEl.classList.remove('hidden');



            }



        } else {



            throw new Error(data.message || 'Failed to connect');



        }



    } catch (err) {



        if (typeof showToast === 'function') showToast("Error playing music: " + err.message, "error");



    }



}



window.sendAdminPlayMusic = sendAdminPlayMusic;







async function sendAdminStopMusic() {



    const selectTarget = document.getElementById('multimedia-target');



    const selectedOpt = selectTarget && selectTarget.options[selectTarget.selectedIndex];



    const targetMc = (selectedOpt && selectedOpt.dataset.mc) || (selectTarget ? selectTarget.value : 'ALL');



    const targetKey = (selectedOpt && selectedOpt.dataset.key) || '';



    const adminUser = (currentUser && currentUser.user_metadata && (currentUser.user_metadata.user_name || currentUser.user_metadata.name)) || 'Admin';







    try {



        const res = await pulseApiFetch('https://api.pulseclient.xyz/admin/stop-music', {



            method: 'POST',



            headers: { 'Content-Type': 'application/json' },



            body: JSON.stringify({



                target_key: targetKey,



                target_mc: targetMc,



                admin_user: adminUser



            })



        });



        const data = await res.json();



        if (res.ok && data.status === 'success') {



            if (typeof showToast === 'function') {



                showToast(`Music is paused (@${targetMc})`, "info");



            }



            const statusEl = document.getElementById('multimedia-music-status');



            if (statusEl) {



                statusEl.textContent = `The music is paused`;



            }



        } else {



            throw new Error(data.message || 'Failed to stop');



        }



    } catch (err) {



        if (typeof showToast === 'function') showToast("Error when stopping music: " + err.message, "error");



    }



}



window.sendAdminStopMusic = sendAdminStopMusic;







function renderAdminLicenses(licenses) {



    adminLicensesTableBody.innerHTML = '';



    adminTotalCount.textContent = licenses.length;







    if (licenses.length === 0) {



        const row = document.createElement('tr');



        row.innerHTML = '<td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">' + t("msg.noLicenses") + '</td>';



        adminLicensesTableBody.appendChild(row);



        return;



    }







    licenses.forEach(lic => {



        const { product, buyer, createdBy } = parseLicenseNote(lic.note);



        const { status, text: statusText } = getLicenseStatus(lic);



        const isMedia = isMediaLicense(lic);







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







        const actionRevokeBtn = lic.is_active



            ? '<button type="button" class="btn-action btn-revoke" onclick="revokeLicense(\'' + lic.license_key + '\')" title="' + t('admin.actionRevoke') + '" aria-label="' + t('admin.actionRevoke') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></button>'



            : '<button type="button" class="btn-action btn-activate" onclick="activateLicense(\'' + lic.license_key + '\')" title="' + t('admin.actionActivate') + '" aria-label="' + t('admin.actionActivate') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></button>';







        const isUserOwner = typeof isOwner === 'function' && isOwner();



        const actionDeleteBtn = isUserOwner



            ? '<button type="button" class="btn-action btn-delete" onclick="deleteLicensePermanently(\'' + lic.license_key + '\')" title="' + (t('admin.actionDelete') || 'Delete permanently') + '" aria-label="' + (t('admin.actionDelete') || 'Delete permanently') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>'



            : '';







        const hwidDisabled = lic.hwid ? '' : 'disabled';



        const tr = document.createElement('tr');



        if (isMedia) tr.className = 'admin-row-media';







        const productHtml = isMedia 



            ? '<span class="badge-media-partner" style="font-size: 10px; padding: 2px 7px; margin-right: 6px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> MEDIA</span>' + product



            : product;







        const keyHtml = '<span class="key-cell" title="' + lic.license_key + '">' + lic.license_key + '</span>' + 



            (isMedia ? ' <span class="badge-media-pill">MEDIA</span>' : '');







        tr.innerHTML = [



            '<td class="product-cell">' + productHtml + '</td>',



            '<td class="buyer-cell">' + buyer + '</td>',



            '<td class="creator-cell">' + createdBy + '</td>',



            '<td>' + keyHtml + '</td>',



            '<td><span class="admin-status ' + status + '">' + statusText + '</span></td>',



            '<td>' + expiryDisplay + '</td>',



            '<td>',



            '    <div class="admin-actions" style="display: flex; align-items: center; gap: 6px; justify-content: flex-end;">',



            '        <button type="button" class="btn-action btn-media-toggle ' + (isMedia ? 'is-media-active' : '') + '" onclick="toggleAdminLicenseMedia(\'' + lic.license_key + '\')" title="' + (isMedia ? 'Remove media status' : 'Grant media status') + '" aria-label="Media"><svg width="13" height="13" viewBox="0 0 24 24" fill="' + (isMedia ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>',



            '        <button type="button" class="extend-btn" onclick="extendLicenseDays(\'' + lic.license_key + '\', 7)" title="Add 7 days">+7d</button>',



            '        <button type="button" class="extend-btn" onclick="extendLicenseDays(\'' + lic.license_key + '\', 30)" title="Add 30 days">+30d</button>',



            '        <button type="button" class="btn-action btn-info" onclick="showLicenseDetails(\'' + lic.license_key + '\')" title="' + t('admin.actionInfo') + '" aria-label="' + t('admin.actionInfo') + '">',



            '            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',



            '        </button>',



            '        <button type="button" class="btn-action btn-hwid-reset" onclick="resetLicenseHwid(\'' + lic.license_key + '\')" title="' + t('admin.actionHwid') + '" aria-label="' + t('admin.actionHwid') + '" ' + hwidDisabled + '>',



            '            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>',



            '        </button>',



            '        ' + actionRevokeBtn,



            '        ' + actionDeleteBtn,



            '    </div>',



            '</td>'



        ].join('');



        adminLicensesTableBody.appendChild(tr);



    });



}







async function toggleAdminLicenseMedia(key) {



    if (!isAdmin()) return;



    const lic = adminLicenses.find(l => l.license_key === key);



    if (!lic) return;



    



    let currentNote = lic.note || '';



    let newNote = '';



    const currentlyMedia = isMediaLicense(lic);



    



    if (currentlyMedia) {



        // Remove Media marker



        newNote = currentNote.replace(/\|\s*Tier:\s*Media/gi, '')



                             .replace(/Product:\s*PulseClient\s*\(Media\)/gi, 'Product: PulseClient')



                             .replace(/\|\s*Media/gi, '')



                             .replace(/\|\s*\|/g, '|')



                             .trim();



    } else {



        // Add Media marker



        newNote = currentNote ? `${currentNote} | Tier: Media` : `Tier: Media`;



    }



    



    try {



        const res = await fetch(`${supabaseUrl}/rest/v1/licenses?license_key=eq.${encodeURIComponent(key)}`, {



            method: 'PATCH',



            headers: {



                'apikey': supabaseKey,



                'Authorization': `Bearer ${supabaseKey}`,



                'Content-Type': 'application/json',



                'Prefer': 'return=representation'



            },



            body: JSON.stringify({ note: newNote })



        });



        



        if (!res.ok) throw new Error(await res.text());



        lic.note = newNote;



        renderAdminLicenses(adminLicenses);



        showBanner(currentlyMedia ? "Media status removed" : "✨ The license was granted the status of Media partner!", "success");



    } catch (err) {



        showBanner("Error when changing Media status: " + err.message, "error");



    }



}



window.toggleAdminLicenseMedia = toggleAdminLicenseMedia;







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



            (query === 'media' && isMediaLicense(lic)) ||



            (lic.note && lic.note.toLowerCase().includes(query))



        );







        let matchesFilter = true;



        if (filter === 'active') {



            matchesFilter = (status === 'active');



        } else if (filter === 'media') {



            matchesFilter = isMediaLicense(lic);



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



        let action = "Create a license";



        let details = `was created <strong>${product}</strong> License to User: <strong>${buyer}</strong>. License: <code>${lic.license_key}</code>`;



        



        if (lic.note && lic.note.includes("Free Trial")) {



            action = "Get a trial version";



            details = `The user has taken a 3-day free trial license: <code>${lic.license_key}</code>`;



        }







        logs.push({



            dateObj: new Date(lic.created_at),



            date: timestamp,



            user: createdBy || "system",



            action: action,



            details: details



        });







        // 2. Referral event if present in note



        if (lic.note && lic.note.includes("Referred by:")) {



            const refMatch = lic.note.match(/Referred by:\s*([^|]+)/i);



            const referrer = refMatch ? refMatch[1].trim() : "Unknown";



            logs.push({



                dateObj: new Date(lic.created_at),



                date: timestamp,



                user: buyer,



                action: "Using a referral",



                details: `Signed up with a referral link. Invitation: <strong>${referrer}</strong>`



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



                    action: "Referral bonus (+3 days)",



                    details: `Added 3 days of friend (<strong>${invited}</strong>) for the invitation.`



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



                    action: "Using a promo code",



                    details: `Promo code used: <strong>${pCode}</strong> On the license: <code>${lic.license_key}</code>`



                });



            });



        }







        // 4. Revocation event if inactive



        if (!lic.is_active) {



            // Estimate revocation time as a bit after creation or use updated_at if we had one, but we'll use created_at as reference



            logs.push({



                dateObj: new Date(lic.created_at),



                date: timestamp,



                user: "administrator",



                action: "Cancellation of license",



                details: `License revoked: <code>${lic.license_key}</code>`



            });



        }



    });







    // Sort logs descending by timestamp



    logs.sort((a, b) => b.dateObj - a.dateObj);







    if (logs.length === 0) {



        adminLogsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px;">No activities found</td></tr>`;



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







        // If created for self or currently logged in user, trigger live activation modal



        const currentAlertUser = typeof getCurrentUsernameForAlert === 'function' ? getCurrentUsernameForAlert() : null;



        if (currentAlertUser && buyer === currentAlertUser && typeof showLicenseActivatedModal === 'function') {



            showLicenseActivatedModal({



                license_key: key,



                note: note,



                expires_at: expiresAt



            });



        }







        // Dispatch Official Digital Invoice to user's Discord Gmail



        const adminEmailInput = document.getElementById('admin-buyer-email-input');



        const typedEmail = adminEmailInput ? adminEmailInput.value.trim() : '';



        const buyerProfile = Array.isArray(allUserProfiles) ? allUserProfiles.find(p => p.username === buyer) : null;



        const buyerEmail = typedEmail || (buyerProfile ? (buyerProfile.email || null) : null);



        const buyerDiscordId = buyerProfile ? (buyerProfile.discord_id || null) : null;







        pulseApiFetch('/admin/send-license-invoice', {



            method: 'POST',



            headers: { 'Content-Type': 'application/json' },



            body: JSON.stringify({



                buyer_email: buyerEmail,



                buyer_username: buyer,



                buyer_discord_id: buyerDiscordId,



                license_key: key,



                duration: durationDays === null ? "Lifetime" : `${durationDays} Days`,



                product: product



            })



        }).then(res => res.json()).then(invoiceRes => {



            if (invoiceRes && invoiceRes.sent) {



                showBanner(`📧 Invoice sent: ${invoiceRes.recipient}`, "success");



            } else if (invoiceRes && invoiceRes.status === "warning") {



                console.info("Invoice skipped:", invoiceRes.message);



            }



        }).catch(emailErr => {



            console.warn("Invoice email delivery skipped:", emailErr);



        });







        // Reset input



        adminBuyerInput.value = '';



        if (adminEmailInput) adminEmailInput.value = '';



        const options = adminUserOptionsList.querySelectorAll('.user-option');



        options.forEach(opt => opt.classList.remove('selected'));







        showBanner(t("msg.keyCreated"), "success");



        sendDiscordAuditLog(



            "New license created (Admin)",



            `Admin **${adminName}** Create new license for user **${buyer}**.`,



            0x3b82f6,



            [



                { name: "Admin", value: adminName, inline: true },



                { name: "buyer", value: buyer, inline: true },



                { name: "product", value: product, inline: true },



                { name: "the key", value: key, inline: false },



                { name: "duration", value: durationDays === null ? "Lifetime" : `${durationDays} day`, inline: true }



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



            "License revoked",



            `Admin **${revokerName}** License revoked.`,



            0xff0000,



            [



                { name: "Admin", value: revokerName, inline: true },



                { name: "the key", value: key, inline: false }



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



            "The license is activated",



            `Admin **${activatorName}** Reactivated the license.`,



            0x00ff88,



            [



                { name: "Admin", value: activatorName, inline: true },



                { name: "the key", value: key, inline: false }



            ]



        );



        fetchAllLicenses();



    } catch (err) {



        console.error("Error activating license:", err.message);



        showBanner(t("msg.activateFail") + err.message, "error");



    }



}







async function deleteLicensePermanently(key) {



    if (typeof isOwner !== 'function' || !isOwner()) {



        showBanner("Restricted access: This feature is only available to the primary owner", "error");



        return;



    }







    const confirmMsg = `${t("msg.deleteConfirm") || "Are you sure you want to permanently remove this license from Supabase data? This action is irreversible and the license cannot be restored!\n\nKey: "}${key}`;



    const confirmed = await showCustomConfirm(t("confirm.title") || "Confirmation", confirmMsg);



    if (!confirmed) return;







    try {



        // 1. Delete associated client_sessions first to prevent orphaned records in Supabase



        try {



            await fetch(`${supabaseUrl}/rest/v1/client_sessions?license_key=eq.${encodeURIComponent(key)}`, {



                method: "DELETE",



                headers: {



                    "apikey": supabaseKey,



                    "Authorization": `Bearer ${supabaseKey}`



                }



            });



        } catch (sessErr) {



            console.warn("Could not delete associated client_sessions:", sessErr);



        }







        // 2. Delete license from Supabase licenses table



        const res = await fetch(`${supabaseUrl}/rest/v1/licenses?license_key=eq.${encodeURIComponent(key)}`, {



            method: "DELETE",



            headers: {



                "apikey": supabaseKey,



                "Authorization": `Bearer ${supabaseKey}`,



                "Content-Type": "application/json"



            }



        });







        if (!res.ok) {



            const errBody = await res.text();



            throw new Error(errBody || `HTTP ${res.status}`);



        }







        // 3. Extra safeguard: run delete via supabaseClient if initialized



        try {



            if (window.supabaseClient) {



                await window.supabaseClient.from('licenses').delete().eq('license_key', key);



            }



        } catch (scErr) {



            console.warn("Supabase client delete safeguard:", scErr);



        }







        // 4. Update local state



        adminLicenses = adminLicenses.filter(l => l.license_key !== key);



        renderAdminLicenses(adminLicenses);



        renderAdminLogs(adminLicenses);







        // 5. Close info modal if opened for this license



        const modalKeyEl = document.getElementById('modal-key');



        if (modalKeyEl && modalKeyEl.textContent === key) {



            closeLicenseModal();



        }







        // 6. Show success feedback



        showBanner(t("msg.deleteSuccess") || "The license has been successfully deleted from Supabase", "success");







        // 7. Discord & Surveillance Audit Logs



        const ownerName = currentUser ? (currentUser.user_metadata?.user_name || currentUser.user_metadata?.name || "Owner") : "Owner";



        if (typeof sendDiscordAuditLog === 'function') {



            sendDiscordAuditLog(



                "License permanently deleted (Supabase Database Purge)",



                `Owner **${ownerName}** Permanently removed license from Supabase data.`,



                0xef4444,



                [



                    { name: "Owner", value: ownerName, inline: true },



                    { name: "Deleted key", value: key, inline: false }



                ]



            );



        }







        if (typeof logAuditEvent === 'function') {



            logAuditEvent({



                action_type: "OWNER_LICENSE_PERMANENT_DELETE",



                title: "Permanent cancellation of license",



                description: `License ${key} Permanently removed from Supabase database by owner`,



                target_id: key,



                target_name: key,



                severity: "warning",



                actor_role: "owner",



                details: { license_key: key }



            });



        }







        // 8. Re-fetch all licenses to stay completely in sync with database



        fetchAllLicenses();



    } catch (err) {



        console.error("Error permanently deleting license:", err);



        showBanner((t("msg.deleteFail") || "Failed to delete license: ") + err.message, "error");



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



        const adminHwidActor = currentUser ? (currentUser.user_metadata?.user_name || currentUser.user_metadata?.name || "Admin") : "Admin";



        logAuditEvent({



            action_type: "STAFF_HWID_RESET",



            title: "Staff deleted HWID",



            description: `Staff made **${adminHwidActor}** Omitted device HWID for license **${key}**.`,



            target_id: key,



            severity: "warning",



            details: { key, admin: adminHwidActor }



        });



        fetchAllLicenses();



    } catch (err) {



        console.error("Error resetting HWID:", err.message);



        showBanner(t("msg.hwidFail") + err.message, "error");



    }



}







async function resetUserHwid(key) {



    try {



        // 1. Fetch license to check 30-day cooldown



        const { data: licData, error: fetchErr } = await supabaseClient



            .from('licenses')



            .select('*')



            .eq('license_key', key)



            .single();







        if (fetchErr || !licData) {



            showBanner("License not found.", "error");



            return;



        }







        if (licData.note) {



            const mReset = licData.note.match(/\[LastHwidReset:\s*([^\]]+)\]/i);



            if (mReset) {



                const lastResetTime = new Date(mReset[1]).getTime();



                if (!isNaN(lastResetTime)) {



                    const diffMs = Date.now() - lastResetTime;



                    const cooldownMs = 30 * 24 * 60 * 60 * 1000;



                    if (diffMs < cooldownMs) {



                        const daysLeft = Math.ceil((cooldownMs - diffMs) / (24 * 60 * 60 * 1000));



                        showBanner(`HWID can only be reset once every 30 days. ${daysLeft} day(s) remaining. For help, open a ticket on Telegram: @PulseClientOfficialBot`, "error");



                        return;



                    }



                }



            }



        }







        const confirmed = await showCustomConfirm(



            t("confirm.title") || "HWID reset",



            (t("msg.hwidResetConfirm") || "Are you sure you want to reset the HWID for this license?") + "\n\n(Note: the next reset will be available in 30 days)"



        );



        if (!confirmed) return;







        const nowIso = new Date().toISOString();



        let newNote = licData.note || '';



        if (newNote.includes('[LastHwidReset:')) {



            newNote = newNote.replace(/\[LastHwidReset:\s*[^\\\]]+\]/gi, `[LastHwidReset: ${nowIso}]`);



        } else {



            newNote = (newNote + ` [LastHwidReset: ${nowIso}]`).trim();



        }







        const { error } = await supabaseClient



            .from('licenses')



            .update({ hwid: null, note: newNote })



            .eq('license_key', key);







        if (error) throw error;







        showBanner(t("msg.hwidSuccess") || "HWID reset successfully!", "success");



        fetchUserLicenses();



    } catch (err) {



        console.error("Error resetting HWID:", err.message);



        showBanner((t("msg.hwidFail") || "Error: ") + err.message, "error");



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







// Process referral bonus if applicable



async function processReferralBonus(referredUsername) {



    const refDiscordId = localStorage.getItem('pulse_referral_discord_id');



    if (!refDiscordId) return null;







    try {



        // Find referrer's profile using discord_id or referral code



        let referrerProfile = null;



        const { data: profiles, error: profileError } = await supabaseClient



            .from('profiles')



            .select('*');







        if (profiles && profiles.length > 0) {



            const cleanRef = String(refDiscordId).trim().toUpperCase();



            referrerProfile = profiles.find(p => {



                if (!p.discord_id) return false;



                const dId = String(p.discord_id).trim();



                return (



                    dId === String(refDiscordId).trim() ||



                    generateReferralCodeFromDiscordId(dId) === cleanRef ||



                    generateOldReferralCodeFromDiscordId(dId) === cleanRef



                );



            });



        }







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







// Redeem a referral code (supports 7-character referral code, Discord ID, link, or username)



function showLicenseDetails(key) {



    const lic = adminLicenses.find(l => l.license_key === key);



    if (!lic) return;







    const { product, buyer, createdBy } = parseLicenseNote(lic.note);



    const { status, text: statusText } = getLicenseStatus(lic);



    const isMedia = isMediaLicense(lic);







    modalKey.innerHTML = `${lic.license_key}` + (isMedia ? ` <span class="badge-media-partner" style="font-size: 10px; padding: 2px 8px; margin-left: 8px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> MEDIA</span>` : '');



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



            modalIp.textContent = "Loading...";







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







                modalIp.textContent = foundIp || "N/A (not recorded)";



            })();



        } else {



            modalIpContainer.style.display = 'none';



        }



    }







    const ownerActions = document.getElementById('modal-owner-actions');



    const modalDeleteBtn = document.getElementById('modal-delete-lic-btn');



    if (ownerActions && modalDeleteBtn) {



        if (typeof isOwner === 'function' && isOwner()) {



            ownerActions.style.display = 'flex';



            modalDeleteBtn.onclick = () => {



                deleteLicensePermanently(lic.license_key);



            };



        } else {



            ownerActions.style.display = 'none';



            modalDeleteBtn.onclick = null;



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



window.deleteLicensePermanently = deleteLicensePermanently;



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
            currentUserProfile = data;
            if (isAdmin() && adminMenuItem && adminMenuItem.classList.contains("hidden")) {
                adminMenuItem.classList.remove("hidden");
                fetchAdminLicenses();
                fetchActiveSessions();
                fetchProfilesForAdmin();
                fetchBlacklistEntries();
                fetchSupabaseAdminsList();
            }



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
        if (existingProfile) currentUserProfile = existingProfile;



    } catch (err) {



        console.warn("Could not fetch existing profile:", err);



    }







    const currentLoginCount = (existingProfile && typeof existingProfile.login_count === 'number') 



        ? existingProfile.login_count + 1 



        : 1;



    const currentLang = window.currentLang || localStorage.getItem('pulse_lang') || 'en';



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







    if (user.email) payload.email = user.email;



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



    



    const adminEmailInput = document.getElementById('admin-buyer-email-input');



    if (adminEmailInput) {



        adminEmailInput.value = profile.email || '';



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



    document.body.classList.add('banned-locked');



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



        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">The blacklist is empty or the table does not exist</td></tr>`;



    }



}







function renderBlacklistEntries(entries) {



    const tableBody = document.getElementById('admin-blacklist-table-body');



    if (!tableBody) return;



    tableBody.innerHTML = '';







    if (!entries || entries.length === 0) {



        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">No blocked records found</td></tr>`;



        return;



    }







    entries.forEach(item => {



        let badgeClass = 'type-ip';



        let typeName = 'IP address';



        if (item.type === 'discord_id') { badgeClass = 'type-discord'; typeName = 'Discord ID'; }



        else if (item.type === 'hwid') { badgeClass = 'type-hwid'; typeName = 'HWID'; }







        const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('en-US') : 'N/A';



        const row = document.createElement('tr');



        row.innerHTML = `



            <td><span class="ban-badge ${badgeClass}">${typeName}</span></td>



            <td><code style="font-size: 12px; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;">${item.value}</code></td>



            <td style="color: #fca5a5; font-size: 13px;">${item.reason || 'Violation of the rules'}</td>



            <td style="font-size: 12px; color: var(--text-muted);">${dateStr}</td>



            <td style="text-align: right;">



                <button type="button" onclick="handleRemoveBan('${item.id}')" class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px; color: #4ade80; border-color: rgba(34, 197, 94, 0.3);">



                    Unlock



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



        showBanner("User successfully blocked!", "success");



        document.getElementById('admin-ban-value').value = '';



        document.getElementById('admin-ban-reason').value = '';



        fetchBlacklistEntries();



    } catch (err) {



        showBanner("Blocking error: " + err.message, "error");



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



        showBanner("The block is removed!", "success");



        fetchBlacklistEntries();



    } catch (err) {



        showBanner("Unlock error: " + err.message, "error");



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



    } else if (panelId === 'admin-subpanel-crashes') {



        fetchAdminCrashReports();



    } else if (panelId === 'admin-subpanel-support') {



        fetchAdminSupportTickets(true);



        populateSupportDirectTargets();



    } else if (panelId === 'admin-subpanel-multimedia') {



        populateMultimediaTargets();



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



        showBanner(`+$ was successfully added to the license{days} Day!`, "success");



        await fetchAdminLicenses();



        updateAdminKpiStats();



    } catch (err) {



        showBanner("Error extending the term: " + err.message, "error");



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



    if (typeof updatePurchaseModalUI === "function") updatePurchaseModalUI();



}







// Auto-refresh active sessions, telemetry, and crash reports every 10 seconds



setInterval(() => {



    if (typeof isAdmin === "function" && isAdmin() && currentUser) {



        fetchActiveSessions();



        fetchAdminCrashReports();



    }



}, 10000);







// Auto-refresh live support tickets every 2.5 seconds for instant two-way communication



setInterval(() => {



    if (typeof isAdmin === "function" && isAdmin() && currentUser) {



        fetchAdminSupportTickets();



    }



}, 2500);







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



            " Promo code has been used",



            `User **${username}** Used promo code **${code}**.`,



            0xa855f7,



            [



                { name: "user", value: username || "Unknown", inline: true },



                { name: "Code", value: code, inline: true },



                { name: "added", value: `${promo.duration_days} day`, inline: true }



            ]



        );



        promoInput.value = '';



        fetchUserLicenses();



        if (typeof fetchUserPromoHistory === 'function') {



            fetchUserPromoHistory();



        }



    } catch (err) {



        console.error("Promocode redemption failed:", err.message);



        showBanner(t("msg.promoRedeemFail") + err.message, "error");



    } finally {



        submitBtn.disabled = false;



        submitBtn.textContent = originalBtnText;



    }



}



window.redeemPromoCode = redeemPromoCode;







// Paste from clipboard into promo input



async function pastePromoFromClipboard() {



    try {



        const text = await navigator.clipboard.readText();



        if (text) {



            const input = document.getElementById('promo-code-input');



            if (input) {



                input.value = text.trim().toUpperCase();



                input.focus();



                showBanner(t("msg.promoPasted") || "Code pasted from clipboard!", "success");



            }



        }



    } catch (e) {



        console.warn("Clipboard read error:", e);



        const input = document.getElementById('promo-code-input');



        if (input) {



            input.focus();



            showBanner("Please use Ctrl+V to paste", "info");



        }



    }



}



window.pastePromoFromClipboard = pastePromoFromClipboard;







// User Promo Statistics and Redemption History



async function fetchUserPromoHistory() {



    if (!currentUser) return;



    const historyList = document.getElementById('user-promo-history-list');



    const countEl = document.getElementById('user-promo-count');



    const daysEl = document.getElementById('user-promo-days');



    const licStatusEl = document.getElementById('user-promo-lic-status');



    const licSubEl = document.getElementById('user-promo-lic-sub');







    const metadata = currentUser.user_metadata || {};



    const username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name;







    try {



        // 1. Fetch user redemptions from Supabase



        const { data: redemptions, error: redError } = await supabaseClient



            .from('promocode_redemptions')



            .select('*')



            .eq('user_id', currentUser.id)



            .order('redeemed_at', { ascending: false });







        if (redError) throw redError;







        // 2. Fetch promocodes metadata to calculate duration_days



        const { data: allPromos } = await supabaseClient



            .from('promocodes')



            .select('code, duration_days');







        const promoMap = {};



        if (allPromos) {



            allPromos.forEach(p => {



                if (p.code) promoMap[p.code.trim().toUpperCase()] = p.duration_days;



            });



        }







        const redList = redemptions || [];



        if (countEl) countEl.textContent = redList.length;







        let totalDays = 0;



        redList.forEach(r => {



            const codeKey = (r.code || "").trim().toUpperCase();



            totalDays += (promoMap[codeKey] || 0);



        });



        if (daysEl) daysEl.textContent = `+${totalDays} day`;







        // 3. User's active license status



        try {



            const { data: userLicenses } = await supabaseClient



                .from('licenses')



                .select('*')



                .like('note', `%Buyer: ${username}%`);







            const activeLicense = userLicenses ? userLicenses.find(l => l.is_active && (!l.expires_at || new Date(l.expires_at) > new Date())) : null;







            if (licStatusEl) {



                if (activeLicense) {



                    licStatusEl.textContent = "Active";



                    licStatusEl.className = "stat-card-value status-active";



                    if (licSubEl) {



                        if (activeLicense.expires_at) {



                            const diffDays = Math.ceil((new Date(activeLicense.expires_at) - new Date()) / (1000 * 60 * 60 * 24));



                            licSubEl.textContent = `${diffDays} day left`;



                        } else {



                            licSubEl.textContent = "Lifetime license";



                        }



                    }



                } else {



                    licStatusEl.textContent = "inactive";



                    licStatusEl.className = "stat-card-value status-inactive";



                    if (licSubEl) licSubEl.textContent = "Activate the code to receive the days";



                }



            }



        } catch (licErr) {



            console.warn("License check error:", licErr);



        }







        // 4. Render redemption history items



        if (historyList) {



            historyList.innerHTML = '';



            if (redList.length === 0) {



                historyList.innerHTML = `



                    <div class="promo-history-empty">



                        <div class="empty-icon-bubble"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg></div>



                        <h5>You have not used a promo code yet</h5>



                        <p>Enter the promo code in the box above, or visit our Discord to receive new bonuses.</p>



                    </div>



                `;



            } else {



                redList.forEach(r => {



                    const codeKey = (r.code || "").trim().toUpperCase();



                    const days = promoMap[codeKey] || 0;



                    const dateStr = r.redeemed_at ? new Date(r.redeemed_at).toLocaleDateString(getLocale(), {



                        year: 'numeric',



                        month: 'short',



                        day: 'numeric',



                        hour: '2-digit',



                        minute: '2-digit'



                    }) : "is activated";







                    const item = document.createElement('div');



                    item.className = 'promo-history-item';



                    item.innerHTML = `



                        <div class="history-item-left">



                            <span class="history-code-badge">${r.code}</span>



                            <span class="history-days-badge">+${days} day</span>



                        </div>



                        <div class="history-item-right">



                            <span class="history-date">${dateStr}</span>



                            <span class="history-status-pill">



                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>



                                is activated



                            </span>



                        </div>



                    `;



                    historyList.appendChild(item);



                });



            }



        }



    } catch (err) {



        console.error("Error fetching user promo history:", err.message);



        if (historyList) {



            historyList.innerHTML = `



                <div class="promo-history-empty">



                    <p style="color: var(--text-muted);">Failed to load history</p>



                </div>



            `;



        }



    }



}



window.fetchUserPromoHistory = fetchUserPromoHistory;







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



    if (hasAny(['Hello', 'Hello', 'Zdarova', 'hello', 'hello', 'hi', 'hey', 'sup', 'yo', 'how are you', 'how are you'])) {



        if (isGeorgian) {



            return "Hello! I am <strong>Pulse AI</strong>, the official PulseClient Assistant. how can i help you<br><br>• Client download & installation<br>• Menu keys (Right Shift)<br>• Purchase & License<br>• HWID and troubleshooting";



        }



        return "Hello! I am <strong>Pulse AI</strong>, the official PulseClient support bot. How can I help you today?<br><br>• Client Download & Installation<br>• Keybinds (Right Shift)<br>• Purchase & Licensing<br>• HWID & Troubleshooting";



    }







    // 2. Identity / Capabilities



    if (hasAny(['who are you', 'what are you', 'what can you do', 'who are you', 'what are you', 'what can you do'])) {



        if (isGeorgian) {



            return "I am <strong>Pulse AI</strong> — Assistant of artificial intelligence. I can answer any questions you have about PulseClient, installation, buttons, license, anti-client workarounds and bugs!";



        }



        return "I am <strong>Pulse AI</strong> — an AI support assistant for PulseClient. I can help answer questions about installation, keybinds, license key management, bypasses, and troubleshooting!";



    }







    // 3. Keybinds & Menu Triggers



    if (hasAny(['f12', 'shift', 'right shift', 'button', 'menu', 'opening', 'How do I open it?', 'keybind', 'bind', 'menu', 'open', 'controls', 'Which button?'])) {



        if (isGeorgian) {



            return "<strong>PulseClient menu buttons:</strong><br>• <strong>Pulse PvP Client:</strong> The menu opens <strong>Right Shift</strong> Button (Optimized FPS, Kill Trigger, Watermark fix).<br>• <strong>Pulse Base Find:</strong> The menu opens <strong>Right Shift</strong> (Right Shift) button (Matrix/GrimAC bypass).";



        }



        return "<strong>PulseClient Keybinds:</strong><br>• <strong>Pulse PvP Client:</strong> Menu opens with <strong>Right Shift</strong> (Optimized FPS, Kill Trigger).<br>• <strong>Pulse Base Find:</strong> Menu opens with <strong>Right Shift</strong> (Matrix/GrimAC bypass).";



    }







    // 4. Installation & Mods folder



    if (hasAny(['Installation too', 'put', 'throw in', 'How did I drop it?', 'Where did I drop it?', 'install', 'setup', 'mods', 'folder', 'fabric', 'jar'])) {



        if (isGeorgian) {



            return "<strong>Installation steps:</strong><br>1. Download it `.jar` File from site (PvP or Base Find).<br>2. Open it `%appdata%/.minecraft/mods` folder.<br>3. Throw in a shot `.jar` file in the mods folder.<br>4. Start Minecraft <strong>Fabric 1.21.11</strong> profile (with Java 21).";



        }



        return "<strong>Installation Steps:</strong><br>1. Download the `.jar` file from our website.<br>2. Open `%appdata%/.minecraft/mods` folder.<br>3. Drop the downloaded `.jar` file into the mods directory.<br>4. Launch Minecraft using <strong>Fabric 1.21.11</strong> (Java 21 required).";



    }







    // 5. Version & Java Requirements



    if (hasAny(['1.21', '1.21.11', 'version', 'version', 'java', 'java 21', 'java21'])) {



        if (isGeorgian) {



            return "<strong>Version and requirements:</strong><br>• Minecraft version: <strong>1.21.11</strong><br>• Mod Loader: <strong>Fabric Loader</strong> (0.16.0+)<br>• Java version: <strong>Java 21</strong> (Temurin Java 21 or Oracle Java 21 is recommended).";



        }



        return "<strong>Versions & Requirements:</strong><br>• Minecraft Version: <strong>1.21.11</strong><br>• Mod Loader: <strong>Fabric Loader</strong> (0.16.0+)<br>• Java Version: <strong>Java 21</strong> (Temurin/Oracle Java 21 recommended).";



    }







    // 6. Launchers Compatibility



    if (hasAny(['tlauncher', 'lunar', 'feather', 'prism', 'curseforge', 'modrinth', 'official launcher', 'Launcher', 'launcher'])) {



        if (isGeorgian) {



            return " <strong>Compatible Launchers:</strong><br>PulseClient works on almost all launchers where Fabric 1.21.11 can be enabled:<br>• TLauncher (select Fabric 1.21.11)<br>• Prism Launcher / MultiMC<br>• Feather Launcher<br>• Lunar Client (with Fabric module)<br>• Official Minecraft Launcher.";



        }



        return " <strong>Compatible Launchers:</strong><br>PulseClient works with any launcher supporting Fabric 1.21.11:<br>• TLauncher (Select Fabric 1.21.11)<br>• Prism Launcher / MultiMC<br>• Feather Launcher<br>• Official Minecraft Launcher";



    }







    // 7. PvP vs Base Finder differences



    if (hasAny(['the difference', 'difference', 'pvp', 'basefind', 'base finder', 'difference', 'which one', 'Which one should I download?'])) {



        if (isGeorgian) {



            return "<strong>Which version should I choose?</strong><br>• <strong>Pulse PvP Client:</strong> Best for PvP battles, increased FPS, Kill Trigger, OpSec security. (opens <strong>Right Shift</strong> with).<br>• <strong>Pulse Base Find:</strong> Specifically for finding and tracking bases, bypassing Matrix & GrimAC. (opens <strong>Right Shift</strong> with).";



        }



        return "<strong>Which version to pick?</strong><br>• <strong>Pulse PvP Client:</strong> Best for combat, max FPS, Kill Trigger & OpSec (Opens with <strong>Right Shift</strong>).<br>• <strong>Pulse Base Find:</strong> Built for base tracking with Matrix & GrimAC bypasses (Opens with <strong>Right Shift</strong>).";



    }







    // 8. Purchasing & Price



    if (hasAny(['buy', 'you buy', 'the price', 'worth it', 'what is it worth', 'buy', 'price', 'cost', 'purchase', 'ticket', 'discord', 'paypal', 'card', 'crypto'])) {



        if (isGeorgian) {



            return "<strong>How to purchase a license?</strong><br>1. Come to us <a href='https://discord.gg/PEh8KP9hTE' target='_blank' style='color:#a5b4fc;text-decoration:underline;'>on the Discord server</a>.<br>2. Open **Ticket** 'Buy / Purchase' in the channel.<br>3. The administration will help you with payment and key activation in a few minutes!";



        }



        return "<strong>How to buy a license?</strong><br>1. Join our <a href='https://discord.gg/PEh8KP9hTE' target='_blank' style='color:#a5b4fc;text-decoration:underline;'>Discord Server</a>.<br>2. Open a **Ticket** in the 'Buy / Purchase' channel.<br>3. Support will help you complete payment and activate your key in minutes!";



    }







    // 9. Promocodes & Referrals & Free trial



    if (hasAny(['Promo', 'promo code', 'Code', 'Referral', 'free', 'free', 'promo', 'referral', 'bonus', 'trial', 'test'])) {



        if (isGeorgian) {



            return " <strong>Free Days & Promo Codes:</strong><br>• <strong>Referral System:</strong> See your personal code in the dashboard. When a friend takes him in, <strong>Both will add +3 free days</strong>!<br>• <strong>Promo codes:</strong> Go to the dashboard to enter the promo code 'Redeem' tab.";



        }



        return " <strong>Free Days & Promo Codes:</strong><br>• <strong>Referral System:</strong> Find your invite code in the dashboard. When a friend uses it, <strong>both get +3 bonus days</strong>!<br>• <strong>Promo Codes:</strong> Redeem codes under the 'Redeem' tab in your dashboard.";



    }







    // 10. HWID & PC Lock



    if (hasAny(['hwid', 'pc', 'computer', 'to change', 'reset', 'lock', 'device'])) {



        if (isGeorgian) {



            return "<strong>HWID and devices:</strong><br>Your license is automatically linked to your PC the first time you turn it on. If you've changed your computer, you can request a HWID Reset from the dashboard or message us on Discord.";



        }



        return "<strong>HWID & Devices:</strong><br>Your license auto-binds to your PC hardware upon first launch. If you upgrade your PC, request a HWID reset via Dashboard or Discord support.";



    }







    // 11. Crashing & Troubleshooting



    if (hasAny(['It fades', 'does not open', 'error', 'crash', 'problem', 'problem', 'fault', 'does not turn on', 'hang up', 'error'])) {



        if (isGeorgian) {



            return "<strong>Troubleshooting:</strong><br>1. Make sure you have <strong>Java 21</strong> installed.<br>2. Check the Fabric Loader version (should be 0.16.0 or newer).<br>3. If you have other mods `.minecraft/mods`in , temporarily remove (eg: OptiFine / Iris).<br>4. If it still fades, write to us in Discord Ticket and send it to us `latest.log`.";



        }



        return "<strong>Troubleshooting Guide:</strong><br>1. Ensure you have <strong>Java 21</strong> installed.<br>2. Verify Fabric Loader is version 0.16.0 or newer.<br>3. Try removing conflicting mods from `.minecraft/mods`.<br>4. If crashes persist, send your `latest.log` in a Discord Ticket!";



    }







    // 12. Ban Safety / Anticheat / OpSec



    if (hasAny(['ban', 'Bunny', 'they wash me', 'anticheat', 'safe', 'safe', 'undetected', 'opsec', 'grim', 'matrix'])) {



        if (isGeorgian) {



            return "<strong>Anti-Birds & OpSec:</strong><br>PulseClient is equipped with a special <strong>OpSec Mod</strong>and Matrix/GrimAC bypass algorithms. Ban risk is minimal when playing with the right settings!";



        }



        return "<strong>Anticheat Safety & OpSec:</strong><br>PulseClient includes an advanced <strong>OpSec Mod</strong> and Matrix/GrimAC bypass features designed to keep your gameplay safe and undetected.";



    }







    // 13. Gratitude / Thanks



    if (hasAny(['Thank you', 'thank you', 'thanks', 'thank you', 'thx', 'kk', 'Kai', 'ok'])) {



        if (isGeorgian) {



            return "Nothing!  If you have any questions, write me anytime. I wish you a successful game with PulseClient! ";



        }



        return "You're welcome!  If you have any other questions, feel free to ask anytime. Enjoy gaming with PulseClient! ";



    }







    // Default Smart Fallback



    if (isGeorgian) {



        return "<strong>Pulse AI:</strong> I didn't quite understand that. Try asking something like:<br>• <em>Which key opens the menu?</em><br>• <em>How do I install the mod?</em><br>• <em>How do I get a license?</em><br>• <em>How do I fix a crash?</em><br><br>Or reach us on <a href='https://discord.gg/PEh8KP9hTE' target='_blank' style='color:#a5b4fc;text-decoration:underline;'>Discord</a>!";



    }



    return "<strong>Pulse AI:</strong> I didn't quite catch that. You can ask me questions like:<br>• <em>\"How to open the menu?\"</em><br>• <em>\"How to install the mod?\"</em><br>• <em>\"How to buy a license?\"</em><br>• <em>\"How to fix crashes?\"</em><br><br>Or reach us on <a href='https://discord.gg/PEh8KP9hTE' target='_blank' style='color:#a5b4fc;text-decoration:underline;'>Discord</a>!";



}











// Register OS download button handlers



const downloadLinuxBtn = document.getElementById('download-linux-btn-modal');



const downloadMacBtn = document.getElementById('download-mac-btn-modal');







[downloadPvpBtn, downloadBasefindBtn, downloadLinuxBtn, downloadMacBtn, updateDownloadBtn].forEach(btn => {



    if (btn) {



        btn.href = GITHUB_BASEFIND_DOWNLOAD_URL;



        btn.setAttribute('download', GITHUB_BASEFIND_JAR_FILE);



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



        const hwid = activeLic.hwid && activeLic.hwid !== 'null' ? activeLic.hwid : 'not attached';



        hwidEl.textContent = 'HWID: ' + hwid;



    } else {



        hwidEl.textContent = 'HWID: No license found';



    }



}







async function resetDeviceSlotHwid() {



    if (!userLicenses || userLicenses.length === 0) {



        showBanner("No active license found", "error");



        return;



    }



    const activeLic = userLicenses.find(l => l.is_active) || userLicenses[0];



    await resetUserHwid(activeLic.license_key);



    const resetUser = currentUser ? (currentUser.user_metadata?.user_name || currentUser.user_metadata?.name || "User") : "User";



    sendDiscordAuditLog(



        "HWID Reset Request",



        `User **${resetUser}** Cleared device slot (HWID).`,



        0xf59e0b,



        [



            { name: "user", value: resetUser, inline: true },



            { name: "the key", value: activeLic.license_key, inline: true }



        ]



    );



    updateDeviceSlotModalInfo();



}



window.resetDeviceSlotHwid = resetDeviceSlotHwid;











// Custom User Discord Username JAR Download Handler



let isClientDownloading = false;







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







function handleCustomClientDownload(e, osType = 'windows') {



    if (e) {



        e.preventDefault();



        e.stopPropagation();



    }



    



    // Concurrency / Debounce Lock: Prevent multiple rapid clicks from freezing or repeated downloads



    if (isClientDownloading) {



        showBanner("Downloading in progress, please wait...", "info");



        return;



    }



    isClientDownloading = true;







    const customFilename = getUserCustomJarFilename();



    const currentUsername = currentUser ? (currentUser.user_metadata?.user_name || currentUser.user_metadata?.name || "Guest") : "Guest";



    const jarLocalPath = `./${GITHUB_JAR_FILE}`;







    // Target the clicked card for rich visual animation



    let targetCard = null;



    if (e && e.currentTarget) {



        targetCard = e.currentTarget.closest ? e.currentTarget.closest('.modal-download-card-item') : e.currentTarget;



    }



    if (!targetCard && osType) {



        targetCard = document.querySelector(`.modal-download-card-item.${osType}-card`);



    }







    if (targetCard) {



        targetCard.classList.add('is-downloading');



        const arrowEl = targetCard.querySelector('.download-arrow');



        if (arrowEl) {



            arrowEl.innerHTML = `<svg class="spin-loader" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke="#ffffff" stroke-linecap="round"></path></svg>`;



        }



        const versionEl = targetCard.querySelector('.version-label');



        if (versionEl) {



            versionEl.textContent = `Prepared: ${customFilename}`;



        }



    }







    // Fire audit logs and download tracking asynchronously without blocking UI



    try {



        sendDiscordAuditLog(



            "Download the client (.jar).",



            `User downloaded client file **${customFilename}** (${osType.toUpperCase()}).`,



            0x38bdf8,



            [



                { name: "user", value: currentUsername, inline: true },



                { name: "OS", value: osType.toUpperCase(), inline: true },



                { name: "file", value: customFilename, inline: true }



            ]



        ).catch(() => {});



        if (typeof trackUserDownload === 'function') {



            trackUserDownload().catch(() => {});



        }



    } catch (err) {



        console.warn("Download telemetry notice:", err);



    }







    showBanner(`PulseClient download started: ${customFilename}`, "success");







    // Native immediate browser download (0ms delay, 0MB RAM heap allocation, zero freezing!)



    try {



        const a = document.createElement('a');



        a.style.display = 'none';



        a.href = jarLocalPath;



        a.download = customFilename;



        a.setAttribute('download', customFilename);



        document.body.appendChild(a);



        a.click();



        setTimeout(() => {



            if (document.body.contains(a)) document.body.removeChild(a);



        }, 400);



    } catch (err) {



        console.warn("Direct download link trigger failed, attempting window location:", err);



        window.location.href = jarLocalPath;



    }







    // Success feedback animation on card after 500ms



    setTimeout(() => {



        if (targetCard) {



            targetCard.classList.remove('is-downloading');



            targetCard.classList.add('download-success');



            const arrowEl = targetCard.querySelector('.download-arrow');



            if (arrowEl) {



                arrowEl.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;



            }



            const versionEl = targetCard.querySelector('.version-label');



            if (versionEl) {



                versionEl.textContent = `Downloaded from: ${customFilename}`;



            }



        }



    }, 500);







    // Smoothly close modal after showing success state



    setTimeout(() => {



        closeDownloadModal();



        if (targetCard) {



            targetCard.classList.remove('download-success');



            const arrowEl = targetCard.querySelector('.download-arrow');



            if (arrowEl) {



                arrowEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;



            }



            const versionEl = targetCard.querySelector('.version-label');



            if (versionEl) {



                versionEl.textContent = customFilename;



            }



        }



        // Unlock download cooldown after 2.5 seconds



        isClientDownloading = false;



    }, 1300);



}



window.handleCustomClientDownload = handleCustomClientDownload;











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



            span.textContent = "Copied!";



            setTimeout(() => { span.textContent = orig; }, 2000);



        }



        showBanner("OpSec Cleaner script code copied to clipboard!", "success");



    });



}



window.copyOpSecCleaner = copyOpSecCleaner;







// ==========================================



// NEXT-GEN LIVING CYBER CANVAS & PARTICLES



// ==========================================



function initLiquidCanvas() {



    const canvas = document.getElementById("liquid-canvas");



    if (!canvas) return;
    // The motion layer replaces this canvas; skipping it also stops its
    // particle loop and pointer listeners from burning frames while hidden.
    if (getComputedStyle(canvas).display === "none") return;



    const ctx = canvas.getContext("2d");



    const dpr = Math.min(window.devicePixelRatio || 1, 2);







    let width = window.innerWidth;



    let height = window.innerHeight;







    function resize() {



        width = window.innerWidth;



        height = window.innerHeight;



        canvas.width = width * dpr;



        canvas.height = height * dpr;



        canvas.style.width = width + "px";



        canvas.style.height = height + "px";



        ctx.scale(dpr, dpr);



    }



    resize();







    let mouse = { x: width / 2, y: height / 2, radius: 190, active: false };



    const ripples = [];







    window.addEventListener("resize", () => {



        resize();



    });







    window.addEventListener("mousemove", (e) => {



        mouse.x = e.clientX;



        mouse.y = e.clientY;



        mouse.active = true;



    });







    window.addEventListener("mouseleave", () => {



        mouse.active = false;



    });







    // Dynamic Shockwave on Click / Tap



    window.addEventListener("pointerdown", (e) => {



        // Only trigger on main body canvas or interactive targets



        ripples.push({



            x: e.clientX,



            y: e.clientY,



            radius: 2,



            maxRadius: Math.min(width, 360),



            speed: 7.5,



            strength: 1.0,



            color: Math.random() > 0.4 ? "244, 63, 94" : "255, 45, 85"



        });



        if (ripples.length > 8) ripples.shift();



    });







    const COLOR_PALETTES = [



        { r: 244, g: 63, b: 94, name: "crimson" },     // Crimson Rose



        { r: 255, g: 45, b: 85, name: "electric" },    // Electric Rose



        { r: 255, g: 255, b: 255, name: "pearl" },     // Specular Pearl



        { r: 0, g: 245, b: 212, name: "cyan" },        // Neon Cyber Cyan spark



        { r: 255, g: 190, b: 11, name: "amber" }       // Warm Spark



    ];







    class CyberParticle {



        constructor() {



            this.palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];



            this.reset();



            this.y = Math.random() * height;



        }







        reset() {



            this.x = Math.random() * width;



            this.y = height + 15 + Math.random() * 40;



            this.size = Math.random() * 2.8 + 1.2;



            this.baseSize = this.size;



            this.speedY = Math.random() * 0.45 + 0.22;



            this.speedX = (Math.random() - 0.5) * 0.3;



            this.opacity = Math.random() * 0.45 + 0.2;



            this.pulse = Math.random() * Math.PI * 2;



            this.pulseSpeed = Math.random() * 0.025 + 0.015;



            this.waveAmp = Math.random() * 0.5 + 0.2;



            this.vx = 0;



            this.vy = 0;



        }







        update() {



            // Apply residual physics impulse



            this.vx *= 0.93;



            this.vy *= 0.93;







            this.y -= this.speedY - this.vy;



            this.x += this.speedX + Math.sin(this.pulse) * this.waveAmp + this.vx;



            this.pulse += this.pulseSpeed;







            // Mouse proximity interactive physics (elastic deflection)



            if (mouse.active) {



                const dx = mouse.x - this.x;



                const dy = mouse.y - this.y;



                const dist = Math.sqrt(dx * dx + dy * dy);



                if (dist < mouse.radius && dist > 1) {



                    const force = (1 - dist / mouse.radius) * 1.8;



                    const angle = Math.atan2(dy, dx);



                    this.x -= Math.cos(angle) * force;



                    this.y -= Math.sin(angle) * force;



                }



            }







            // Shockwave impulse interaction



            for (let i = 0; i < ripples.length; i++) {



                const rip = ripples[i];



                const rdx = this.x - rip.x;



                const rdy = this.y - rip.y;



                const rDist = Math.sqrt(rdx * rdx + rdy * rdy);



                const diff = Math.abs(rDist - rip.radius);



                if (diff < 32 && rDist > 1) {



                    const pushFactor = (1 - diff / 32) * rip.strength * 2.4;



                    const angle = Math.atan2(rdy, rdx);



                    this.vx += Math.cos(angle) * pushFactor;



                    this.vy += Math.sin(angle) * pushFactor;



                }



            }







            if (this.y < -30 || this.x < -30 || this.x > width + 30) {



                this.reset();



            }



        }







        draw() {



            const glowAlpha = Math.max(0.08, this.opacity * (0.8 + Math.sin(this.pulse) * 0.25));



            const p = this.palette;







            ctx.beginPath();



            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);







            const grad = ctx.createRadialGradient(



                this.x - this.size * 0.25,



                this.y - this.size * 0.25,



                0,



                this.x,



                this.y,



                this.size * 1.8



            );



            grad.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, ${glowAlpha})`);



            grad.addColorStop(0.5, `rgba(${p.r}, ${p.g}, ${p.b}, ${glowAlpha * 0.45})`);



            grad.addColorStop(1, `rgba(${p.r}, ${p.g}, ${p.b}, 0)`);



            ctx.fillStyle = grad;



            ctx.fill();



        }



    }







    const count = Math.min(Math.floor(width / 24), 48);



    const particles = [];



    for (let i = 0; i < count; i++) {



        particles.push(new CyberParticle());



    }







    function render() {



        ctx.clearRect(0, 0, width, height);







        // 1. Ambient mouse spotlight glow



        if (mouse.active) {



            const spotGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 340);



            spotGrad.addColorStop(0, "rgba(192, 132, 252, 0.06)");



            spotGrad.addColorStop(0.35, "rgba(168, 85, 247, 0.03)");



            spotGrad.addColorStop(0.8, "rgba(255, 255, 255, 0.005)");



            spotGrad.addColorStop(1, "rgba(0, 0, 0, 0)");



            ctx.fillStyle = spotGrad;



            ctx.fillRect(0, 0, width, height);



        }







        // 2. Render expanding shockwave ripples



        for (let i = ripples.length - 1; i >= 0; i--) {



            const rip = ripples[i];



            rip.radius += rip.speed;



            rip.strength = Math.max(0, 1 - rip.radius / rip.maxRadius);







            if (rip.strength <= 0 || rip.radius >= rip.maxRadius) {



                ripples.splice(i, 1);



                continue;



            }







            ctx.save();



            ctx.beginPath();



            ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);



            ctx.strokeStyle = `rgba(${rip.color}, ${rip.strength * 0.35})`;



            ctx.lineWidth = Math.max(1, 3.5 * rip.strength);



            ctx.shadowColor = `rgba(${rip.color}, ${rip.strength * 0.8})`;



            ctx.shadowBlur = 16;



            ctx.stroke();







            // Inner subtle specular ripple



            if (rip.radius > 15) {



                ctx.beginPath();



                ctx.arc(rip.x, rip.y, Math.max(0, rip.radius - 8), 0, Math.PI * 2);



                ctx.strokeStyle = `rgba(255, 255, 255, ${rip.strength * 0.18})`;



                ctx.lineWidth = 1;



                ctx.stroke();



            }



            ctx.restore();



        }







        // 3. Constellation connection lines between nearby particles



        ctx.lineWidth = 0.55;



        for (let i = 0; i < particles.length; i++) {



            const pi = particles[i];



            for (let j = i + 1; j < particles.length; j++) {



                const pj = particles[j];



                const dx = pi.x - pj.x;



                const dy = pi.y - pj.y;



                const distSq = dx * dx + dy * dy;



                if (distSq < 7200) { // < ~85px



                    const dist = Math.sqrt(distSq);



                    const alpha = (1 - dist / 85) * 0.18;



                    ctx.strokeStyle = `rgba(244, 63, 94, ${alpha})`;



                    ctx.beginPath();



                    ctx.moveTo(pi.x, pi.y);



                    ctx.lineTo(pj.x, pj.y);



                    ctx.stroke();



                }



            }







            // Connect particles to mouse cursor when close



            if (mouse.active) {



                const mdx = pi.x - mouse.x;



                const mdy = pi.y - mouse.y;



                const mDistSq = mdx * mdx + mdy * mdy;



                if (mDistSq < 19600) { // < 140px



                    const mDist = Math.sqrt(mDistSq);



                    const mAlpha = (1 - mDist / 140) * 0.24;



                    ctx.strokeStyle = `rgba(255, 255, 255, ${mAlpha})`;



                    ctx.beginPath();



                    ctx.moveTo(pi.x, pi.y);



                    ctx.lineTo(mouse.x, mouse.y);



                    ctx.stroke();



                }



            }



        }







        // 4. Update and draw particles



        for (let i = 0; i < particles.length; i++) {



            particles[i].update();



            particles[i].draw();



        }







        requestAnimationFrame(render);



    }



    render();



}







// ==========================================



// INTERACTIVE CARDS: SPOTLIGHT BORDERS & 3D TILT



// ==========================================



function initInteractiveCardEffects() {



    const cardSelectors = [



        '.glass-panel',



        '.dqrkis-team-card',



        '.feature-card',



        '.pricing-card',



        '.anticheat-card',



        '.setup-card',



        '.krypton-download-card',



        '.step-card',



        '.launcher-card',



        '.user-streak-card',



        '.user-playtime-card',



        '.auth-gate-card'



    ];







    const cards = document.querySelectorAll(cardSelectors.join(', '));



    cards.forEach((card) => {



        card.addEventListener('mousemove', (e) => {



            const rect = card.getBoundingClientRect();



            const x = e.clientX - rect.left;



            const y = e.clientY - rect.top;



            card.style.setProperty('--mouse-x', `${x}px`);



            card.style.setProperty('--mouse-y', `${y}px`);







            // Apply 3D Perspective Tilt on Creator Showcase Card



            if (card.classList.contains('dqrkis-team-card')) {



                const centerX = rect.width / 2;



                const centerY = rect.height / 2;



                const rotateX = ((y - centerY) / centerY) * -9;



                const rotateY = ((x - centerX) / centerX) * 9;



                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`;



            }



        });







        card.addEventListener('mouseleave', () => {



            card.style.removeProperty('--mouse-x');



            card.style.removeProperty('--mouse-y');



            if (card.classList.contains('dqrkis-team-card')) {



                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';



            }



        });



    });



}







// ==========================================



// TACTILE CLICK SPARKS MICRO-BURST SYSTEM



// ==========================================



function initClickSparks() {



    const SPARKS_COLORS = ['#f43f5e', '#ff1e56', '#ffffff', '#00f5d4', '#ffd166'];







    window.addEventListener('pointerdown', (e) => {



        // Target interactive elements like buttons, links, cards, pills



        const target = e.target.closest('button, a, .glass-panel, .dqrkis-team-card, .btn, .lang-btn, .menu-item, input, select');



        if (!target) return;







        const count = 9;



        const container = document.body;



        const clickX = e.clientX;



        const clickY = e.clientY;







        for (let i = 0; i < count; i++) {



            const spark = document.createElement('div');



            spark.className = 'click-spark-particle';



            const color = SPARKS_COLORS[Math.floor(Math.random() * SPARKS_COLORS.length)];



            const size = Math.random() * 4 + 2.5;



            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;



            const distance = Math.random() * 38 + 18;



            const destX = Math.cos(angle) * distance;



            const destY = Math.sin(angle) * distance;







            spark.style.cssText = `



                position: fixed;



                left: ${clickX}px;



                top: ${clickY}px;



                width: ${size}px;



                height: ${size}px;



                background-color: ${color};



                border-radius: 50%;



                pointer-events: none;



                z-index: 99999;



                box-shadow: 0 0 8px ${color};



                transform: translate(-50%, -50%) scale(1);



                transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.55s ease-out;



            `;







            container.appendChild(spark);







            requestAnimationFrame(() => {



                spark.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(0)`;



                spark.style.opacity = '0';



            });







            setTimeout(() => {



                if (spark.parentNode) spark.parentNode.removeChild(spark);



            }, 600);



        }



    });



}







// ==========================================



// NAVBAR SCROLL STATE



// ==========================================



function initNavbarScroll() {



    const navbar = document.getElementById('main-navbar');



    if (!navbar) return;







    const update = () => navbar.classList.toggle('is-scrolled', window.scrollY > 24);



    update();



    window.addEventListener('scroll', update, { passive: true });



}







// ==========================================



// SCROLL-TRIGGERED CINEMATIC REVEAL ENGINE



// ==========================================



function initScrollReveals() {



    if (!('IntersectionObserver' in window)) return;







    const revealSelectors = [



        '.section-header',



        '.feature-card',



        '.anticheat-card',



        '.pricing-card',



        '.setup-card',



        '.hero-tech-ticker',



        '.dqrkis-team-card',



        '.krypton-download-card'



    ];







    const elements = document.querySelectorAll(revealSelectors.join(', '));



    const observer = new IntersectionObserver(



        (entries, obs) => {



            entries.forEach((entry) => {



                if (entry.isIntersecting) {



                    entry.target.classList.add('reveal-visible');



                    obs.unobserve(entry.target);



                }



            });



        },



        { rootMargin: '0px 0px -50px 0px', threshold: 0.12 }



    );







    elements.forEach((el) => {



        const siblings = el.parentElement



            ? Array.from(el.parentElement.children).filter((node) => node.classList.contains('reveal-on-scroll') || revealSelectors.some((selector) => node.matches(selector)))



            : [el];



        const order = Math.max(0, siblings.indexOf(el));



        el.classList.add('reveal-on-scroll');



        el.style.setProperty('--reveal-delay', `${Math.min(order, 5) * 0.07}s`);



        observer.observe(el);



    });



}







document.addEventListener("DOMContentLoaded", () => {



    initLiquidCanvas();



    initInteractiveCardEffects();



    initClickSparks();



    initNavbarScroll();



    initScrollReveals();



    initEvilaClicker();



});







// ==========================================



// EVILA CLICKER MINI-GAME & ANTICHEAT ENGINE



// ==========================================



(function() {



    const DAILY_LIMIT = 360; // 6 hours = 360 minutes / 360 clicks per day



    const AUDIO_POOL_SIZE = 10;



    const EVILA_AUDIO_PATH = 'evila.mp3';







    // Audio pool for zero-latency overlapping audio playback



    const audioPool = [];



    let audioIndex = 0;



    try {



        for (let i = 0; i < AUDIO_POOL_SIZE; i++) {



            const aud = new Audio(EVILA_AUDIO_PATH);



            aud.preload = 'auto';



            audioPool.push(aud);



        }



    } catch (e) {



        console.warn("[EvilaClicker] Audio init error:", e);



    }







    function playEvilaSound() {



        try {



            if (audioPool.length > 0) {



                const snd = audioPool[audioIndex];



                audioIndex = (audioIndex + 1) % audioPool.length;



                snd.currentTime = 0;



                const p = snd.play();



                if (p && typeof p.catch === 'function') {



                    p.catch(() => {



                        try { new Audio(EVILA_AUDIO_PATH).play().catch(() => {}); } catch (err) {}



                    });



                }



            } else {



                new Audio(EVILA_AUDIO_PATH).play().catch(() => {});



            }



        } catch (err) {



            console.warn("[EvilaClicker] Sound playback failed:", err);



        }



    }







    // Anticheat Tracking & Cooldown State



    const clickTimestamps = [];



    let isFrozen = false;



    let freezeTimer = null;







    // License Synchronization State



    let uncommittedMinutes = 0;



    let syncTimer = null;







    function getTodayKey() {



        const d = new Date();



        return `pulse_evila_${d.getFullYear()}_${String(d.getMonth() + 1).padStart(2, '0')}_${String(d.getDate()).padStart(2, '0')}`;



    }







    function getTodayClicks() {



        return parseInt(localStorage.getItem(getTodayKey()) || '0', 10);



    }







    function setTodayClicks(val) {



        localStorage.setItem(getTodayKey(), String(val));



    }







    function getUnclaimedMinutes() {



        return parseInt(localStorage.getItem('pulse_evila_unclaimed_mins') || '0', 10);



    }







    function setUnclaimedMinutes(val) {



        localStorage.setItem('pulse_evila_unclaimed_mins', String(val));



    }







    // Freeze & Cooldown Management (Persistent across refresh)



    function checkAndSyncFreezeState() {



        const freezeUntilStr = localStorage.getItem('pulse_evila_freeze_until');



        if (!freezeUntilStr) {



            clearFreezeUI();



            return false;



        }



        const freezeUntil = parseInt(freezeUntilStr, 10);



        const now = Date.now();



        if (now < freezeUntil) {



            startFreezeCountdown(freezeUntil);



            return true;



        } else {



            localStorage.removeItem('pulse_evila_freeze_until');



            clearFreezeUI();



            return false;



        }



    }







    function clearFreezeUI() {



        isFrozen = false;



        if (freezeTimer) {



            clearInterval(freezeTimer);



            freezeTimer = null;



        }



        const overlay = document.getElementById('evila-anticheat-overlay');



        const card = document.getElementById('evila-clicker-card');



        if (overlay) overlay.classList.add('hidden');



        if (card) card.classList.remove('evila-shaking');



        clickTimestamps.length = 0;



    }







    function startFreezeCountdown(freezeUntil) {



        isFrozen = true;



        const overlay = document.getElementById('evila-anticheat-overlay');



        const timerVal = document.getElementById('evila-freeze-seconds');



        const card = document.getElementById('evila-clicker-card');







        if (overlay) overlay.classList.remove('hidden');



        if (card) card.classList.add('evila-shaking');







        const updateTimer = () => {



            const now = Date.now();



            const remaining = Math.max(0, Math.ceil((freezeUntil - now) / 1000));



            if (timerVal) timerVal.textContent = String(remaining);



            if (remaining <= 0) {



                clearFreezeUI();



                localStorage.removeItem('pulse_evila_freeze_until');



            }



        };







        updateTimer();



        if (freezeTimer) clearInterval(freezeTimer);



        freezeTimer = setInterval(updateTimer, 500);



    }







    function triggerFreezePenalty(reason = "autoclicker") {



        console.warn(`[Anticheat] Freeze penalty triggered: ${reason}`);



        const freezeUntil = Date.now() + 20000;



        localStorage.setItem('pulse_evila_freeze_until', String(freezeUntil));



        startFreezeCountdown(freezeUntil);



    }







    // Autoclicker & Bot Detection (Zero false-positive tuned)



    function checkAutoclicker(e) {



        // 1. Synthetic event check (Programmatic .click() / untrusted events)



        if (e.isTrusted === false) {



            console.warn("[Anticheat] Synthetic event detected (isTrusted: false)");



            return true;



        }







        const now = performance.now();



        clickTimestamps.push(now);







        // Keep rolling timestamps from the last 1500ms



        while (clickTimestamps.length > 0 && (now - clickTimestamps[0]) > 1500) {



            clickTimestamps.shift();



        }







        // 2. Strict Rolling CPS Check (Max 10 CPS per second limit)



        const clicksInLastSecond = clickTimestamps.filter(t => (now - t) <= 1000).length;



        if (clicksInLastSecond > 10) {



            console.warn(`[Anticheat] Max 10 CPS limit exceeded: ${clicksInLastSecond} clicks in 1000ms`);



            return true;



        }







        // 3. Consecutive impossible click intervals (< 35ms -> > 28.5 CPS)



        // Single fast interval can happen due to mouse switch bounce or browser frame delay;



        // Require 3 consecutive impossible intervals (< 35ms) to avoid false positives



        if (clickTimestamps.length >= 4) {



            const len = clickTimestamps.length;



            const i1 = clickTimestamps[len - 1] - clickTimestamps[len - 2];



            const i2 = clickTimestamps[len - 2] - clickTimestamps[len - 3];



            const i3 = clickTimestamps[len - 3] - clickTimestamps[len - 4];



            if (i1 < 35 && i2 < 35 && i3 < 35) {



                console.warn(`[Anticheat] Impossible burst intervals flagged: ${i1.toFixed(1)}ms, ${i2.toFixed(1)}ms, ${i3.toFixed(1)}ms`);



                return true;



            }



        }







        // 4. Fixed-Interval Macro / Machine Rhythm Check (Standard deviation)



        // Autoclickers use a fixed sleep/delay timer (e.g., 50ms, 100ms) with stdDev < 1.5ms



        // Human hands have natural variation (tremor, finger muscle fatigue) with stdDev > 6ms



        // Require at least 14 samples clicking rapidly (< 160ms mean -> > 6.25 CPS)



        if (clickTimestamps.length >= 14) {



            const recent = clickTimestamps.slice(-14);



            const intervals = [];



            for (let i = 1; i < recent.length; i++) {



                intervals.push(recent[i] - recent[i - 1]);



            }



            const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;



            if (mean < 160) {



                const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (intervals.length - 1);



                const stdDev = Math.sqrt(variance);



                if (stdDev < 2.0) { // Robotic precision



                    console.warn(`[Anticheat] Robotic zero-jitter macro flagged (stdDev: ${stdDev.toFixed(2)}ms, mean: ${mean.toFixed(1)}ms)`);



                    return true;



                }



            }



        }







        return false;



    }







    function spawnParticle(cardX, cardY) {



        const container = document.getElementById('evila-floating-container');



        if (!container) return;







        const particle = document.createElement('div');



        particle.className = 'evila-particle';



        



        const badges = ['+1 min', '+1 min', '+1 min', '+1 min'];



        particle.textContent = badges[Math.floor(Math.random() * badges.length)];



        



        // Random slight horizontal wobble



        const wobbleX = (Math.random() - 0.5) * 40;



        particle.style.left = `${cardX + wobbleX}px`;



        particle.style.top = `${cardY}px`;







        container.appendChild(particle);



        setTimeout(() => {



            if (particle.parentNode) particle.parentNode.removeChild(particle);



        }, 900);



    }







    function updateUI() {



        const count = getTodayClicks();



        const countEl = document.getElementById('evila-today-count');



        const barEl = document.getElementById('evila-progress-bar');



        const limitBanner = document.getElementById('evila-limit-banner');



        const statusText = document.getElementById('evila-status-text');



        const targetContainer = document.getElementById('evila-click-target');







        if (countEl) countEl.textContent = String(count);



        



        const pct = Math.min(100, Math.round((count / DAILY_LIMIT) * 100));



        if (barEl) barEl.style.width = `${pct}%`;







        if (count >= DAILY_LIMIT) {



            if (limitBanner) limitBanner.classList.remove('hidden');



            if (targetContainer) {



                targetContainer.style.opacity = '0.7';



                targetContainer.style.cursor = 'not-allowed';



            }



            if (statusText) statusText.textContent = "The daily limit of 6 hours has expired!";



        } else {



            if (limitBanner) limitBanner.classList.add('hidden');



            if (targetContainer) {



                targetContainer.style.opacity = '1';



                targetContainer.style.cursor = 'pointer';



            }



            if (statusText) {



                if (typeof currentUser !== 'undefined' && currentUser) {



                    statusText.textContent = `PulseClient has expired (+${count} min today)`;



                } else {



                    const unclaimed = getUnclaimedMinutes();



                    if (unclaimed > 0) {



                        statusText.innerHTML = `accumulated <strong>${unclaimed} min</strong> — Log in with Discord to activate!`;



                    } else {



                        statusText.textContent = "Click and expand PulseClient";



                    }



                }



            }



        }



    }







    async function syncToSupabase() {



        if (uncommittedMinutes <= 0) return;



        const minsToSync = uncommittedMinutes;



        uncommittedMinutes = 0;







        // If not logged in, accumulate in unclaimed local pool



        if (typeof currentUser === 'undefined' || !currentUser) {



            const currentUnclaimed = getUnclaimedMinutes();



            setUnclaimedMinutes(currentUnclaimed + minsToSync);



            updateUI();



            return;



        }







        try {



            const metadata = currentUser.user_metadata || {};



            const username = metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name || "User";



            const discordId = typeof getDiscordId === 'function' ? getDiscordId(currentUser) : (metadata.sub || currentUser.id);







            // Server-side sync: minutes are validated, capped and traced by the backend.



            // The browser can no longer write expires_at directly (that was exploitable).



            const res = await pulseApiFetch('/clicker/sync', {



                method: 'POST',



                headers: { 'Content-Type': 'application/json' },



                body: JSON.stringify({ minutes: minsToSync, username, discord_id: discordId })



            });







            if (!res.ok) throw new Error(`clicker sync HTTP ${res.status}`);







            const result = await res.json().catch(() => ({}));



            if (result.status !== 'success') throw new Error(result.message || 'clicker sync rejected');







            const granted = result.granted_minutes || 0;



            if (granted < minsToSync) {



                console.log(`[EvilaClicker] Server granted ${granted}/${minsToSync} mins (daily cap).`);



                if (granted === 0 && typeof showBanner === 'function') {



                    showBanner('Daily limit reached — come back tomorrow!', 'error');



                }



            }







            // Silently refresh dashboard licenses if visible



            if (typeof fetchUserLicenses === 'function') {



                fetchUserLicenses().catch(() => {});



            }



        } catch (err) {



            console.error("[EvilaClicker] Failed to sync minutes to Supabase:", err);



            uncommittedMinutes += minsToSync; // Retry next time



        } finally {



            updateUI();



        }



    }







    function queueSync(minutes) {



        uncommittedMinutes += minutes;



        if (syncTimer) clearTimeout(syncTimer);







        if (uncommittedMinutes >= 15) {



            syncToSupabase();



        } else {



            syncTimer = setTimeout(syncToSupabase, 2500);



        }



    }







    // Called on Discord login to claim any offline accumulated clicks



    async function claimPendingMinutesOnSignIn() {



        const unclaimed = Math.min(getUnclaimedMinutes(), DAILY_LIMIT);



        if (unclaimed > 0) {



            console.log(`[EvilaClicker] Claiming ${unclaimed} pending minutes on login (offline pool capped at ${DAILY_LIMIT})...`);



            setUnclaimedMinutes(0);



            uncommittedMinutes += unclaimed;



            await syncToSupabase();



            if (typeof showBanner === 'function') {



                showBanner(`You got +${unclaimed} Minutes on PulseClient!`, 'success');



            }



        }



    }







    function handleEvilaClick(e) {



        if (checkAndSyncFreezeState()) {



            e.preventDefault();



            return;



        }







        const currentCount = getTodayClicks();



        if (currentCount >= DAILY_LIMIT) {



            updateUI();



            return;



        }







        // Run Autoclicker Anticheat



        if (checkAutoclicker(e)) {



            triggerFreezePenalty();



            e.preventDefault();



            return;



        }







        // Play Sound



        playEvilaSound();







        // Bounce Animation



        const targetImg = document.getElementById('evila-target-img');



        if (targetImg) {



            targetImg.classList.add('clicked');



            setTimeout(() => targetImg.classList.remove('clicked'), 90);



        }







        // Spawn Particle



        const card = document.getElementById('evila-clicker-card');



        if (card) {



            const rect = card.getBoundingClientRect();



            const relX = (e.clientX && e.clientX > 0) ? (e.clientX - rect.left) : (rect.width / 2);



            const relY = (e.clientY && e.clientY > 0) ? (e.clientY - rect.top) : (rect.height / 2 - 20);



            spawnParticle(relX, relY);



        }







        // Increment Day Quota



        setTodayClicks(currentCount + 1);



        queueSync(1);



        updateUI();



    }







    function initEvilaClicker() {



        const target = document.getElementById('evila-click-target');



        if (!target) return;







        // Restore freeze cooldown if page was refreshed during freeze



        checkAndSyncFreezeState();







        target.addEventListener('click', handleEvilaClick);



        target.addEventListener('keydown', (e) => {



            if (e.repeat) {



                e.preventDefault();



                return;



            }



            if (e.key === 'Enter' || e.key === ' ') {



                e.preventDefault();



                handleEvilaClick(e);



            }



        });







        // Listen for Supabase login to credit pending minutes



        if (typeof supabaseClient !== 'undefined' && supabaseClient.auth) {



            supabaseClient.auth.onAuthStateChange((event, session) => {



                if (event === 'SIGNED_IN' && session) {



                    setTimeout(claimPendingMinutesOnSignIn, 1500);



                }



                updateUI();



            });



        }







        updateUI();



        console.log("[EvilaClicker] Initialized successfully. Daily limit:", DAILY_LIMIT, "mins. Sound pool ready.");



    }







    window.initEvilaClicker = initEvilaClicker;



    window.claimPendingMinutesOnSignIn = claimPendingMinutesOnSignIn;



})();







/* ==========================================================================



   LIVE LICENSE ACTIVATION NOTIFICATION SYSTEM



   Shows real-time obsidian popup when admin issues a key:



   - Instant live alert if user is currently browsing the site



   - Offline catch-up alert when user enters the site later



   - Reminds user to check Gmail (Inbox and Spam folder)



   ========================================================================== */







function getCurrentUsernameForAlert() {



    if (typeof currentUser === 'undefined' || !currentUser) return null;



    const metadata = currentUser.user_metadata || {};



    return metadata.user_name || metadata.custom_claims?.username || metadata.full_name || metadata.name || null;



}



window.getCurrentUsernameForAlert = getCurrentUsernameForAlert;







function showLicenseActivatedModal(license) {



    if (!license || !license.license_key) return;



    const modal = document.getElementById('user-license-activated-modal');



    if (!modal) return;







    const keyDisplay = document.getElementById('user-popup-key-display');



    const durDisplay = document.getElementById('user-popup-duration-display');







    if (keyDisplay) keyDisplay.textContent = license.license_key;







    // Parse duration



    let durText = "Status: Active";



    if (license.note && license.note.includes("Duration:")) {



        const match = license.note.match(/Duration:\s*([^\s|]+)/);



        if (match && match[1]) {



            durText = `Term: ${match[1]} day`;



        }



    } else if (license.expires_at) {



        if (String(license.expires_at).startsWith("2099")) {



            durText = "Term: Lifetime";



        } else {



            const expDate = new Date(license.expires_at);



            if (!isNaN(expDate.getTime())) {



                const daysLeft = Math.max(0, Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24)));



                durText = daysLeft > 0 ? `Term: ${daysLeft} day` : "Term: 1 day";



            }



        }



    }



    if (durDisplay) durDisplay.textContent = durText;







    modal.classList.remove('hidden');







    // Mark as seen in localStorage immediately so it won't repeat on refresh



    try {



        localStorage.setItem('pulse_notified_key_' + license.license_key, 'seen');



    } catch (_) {}



}



window.showLicenseActivatedModal = showLicenseActivatedModal;







function closeLicenseActivatedModal() {



    const modal = document.getElementById('user-license-activated-modal');



    if (modal) modal.classList.add('hidden');



}



window.closeLicenseActivatedModal = closeLicenseActivatedModal;







function copyUserPopupKey() {



    const keyDisplay = document.getElementById('user-popup-key-display');



    const btn = document.getElementById('user-popup-copy-btn');



    if (!keyDisplay) return;







    const keyText = keyDisplay.textContent.trim();



    if (!keyText || keyText.includes('XXXX')) return;







    navigator.clipboard.writeText(keyText).then(() => {



        if (btn) {



            const origHtml = btn.innerHTML;



            btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>✔ Copied!</span>`;



            btn.style.background = '#10b981';



            btn.style.color = '#ffffff';



            setTimeout(() => {



                btn.innerHTML = origHtml;



                btn.style.background = '#ffffff';



                btn.style.color = '#07080b';



            }, 2000);



        }



    }).catch(() => {



        if (typeof showBanner === 'function') showBanner("Copying failed", "error");



    });



}



window.copyUserPopupKey = copyUserPopupKey;







// Background poller for live active tabs



async function pollLiveLicenseAlerts() {



    try {



        const username = getCurrentUsernameForAlert();



        if (!username || typeof supabaseClient === 'undefined') return;







        const { data: userLics, error } = await supabaseClient



            .from('licenses')



            .select('*')



            .like('note', `%Buyer: ${username}%`)



            .order('id', { ascending: false })



            .limit(1);



    } catch (_) {



        // silent polling catch



    }



}



window.pollLiveLicenseAlerts = pollLiveLicenseAlerts;







// Initialize Realtime & Poller



function initLicenseAlertListener() {



    // 1. Supabase Realtime WebSocket listener



    try {



        if (typeof supabaseClient !== 'undefined' && typeof supabaseClient.channel === 'function') {



            supabaseClient



                .channel('realtime:pulse_license_live_alerts')



                .on('postgres_changes', {



                    event: 'INSERT',



                    schema: 'public',



                    table: 'licenses'



                }, (payload) => {



                    if (payload && payload.new) {



                        const newLic = payload.new;



                        const username = getCurrentUsernameForAlert();



                        if (username && newLic.note && newLic.note.includes(`Buyer: ${username}`)) {



                            showLicenseActivatedModal(newLic);



                        }



                    }



                })



                .subscribe();



        }



    } catch (rtErr) {



        console.warn("[LiveAlerts] Realtime subscription init notice:", rtErr);



    }







    // 2. Poll every 12 seconds for tabs that are active



    setInterval(pollLiveLicenseAlerts, 12000);







    // 3. Initial check after boot



    setTimeout(pollLiveLicenseAlerts, 2000);



}







if (document.readyState === 'loading') {



    document.addEventListener('DOMContentLoaded', initLicenseAlertListener);



} else {



    initLicenseAlertListener();



}











const removedAdminDiscordIds = new Set();
window.removedAdminDiscordIds = removedAdminDiscordIds;

// DYNAMIC SUPABASE ADMIN MANAGEMENT
// ==========================================

async function fetchSupabaseAdminsList() {
    if (!isAdmin()) return;
    try {
        const { data: admins, error } = await supabaseClient
            .from('admins')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error && Array.isArray(admins)) {
            supabaseAdminRecords = admins;
        }
    } catch (e) {
        console.warn("[AdminStaff] Could not fetch admins table:", e);
    }
    renderAdminStaffPanel();
}

function renderAdminStaffPanel() {
    const tableBody = document.getElementById('admin-staff-table-body');
    if (!tableBody) return;

    const adminMap = new Map();

    const recordAdmin = (did, username, role, source, createdAt = null) => {
        if (!did) return;
        const cleanDid = String(did).trim();
        if (!cleanDid || removedAdminDiscordIds.has(cleanDid)) return;
        const existing = adminMap.get(cleanDid);
        if (!existing || role === 'owner') {
            adminMap.set(cleanDid, {
                discord_id: cleanDid,
                username: username || existing?.username || cleanDid,
                role: role || existing?.role || 'admin',
                source: source,
                created_at: createdAt || existing?.created_at || null
            });
        }
    };

    if (Array.isArray(supabaseAdminRecords)) {
        supabaseAdminRecords.forEach(a => {
            recordAdmin(a.discord_id, a.username, a.role, 'Supabase (admins)', a.created_at);
        });
    }

    if (Array.isArray(allUserProfiles)) {
        allUserProfiles.forEach(p => {
            const r = String(p.role || '').toLowerCase();
            if (r === 'admin' || r === 'owner' || r === 'staff') {
                recordAdmin(p.discord_id, p.username, r, 'Supabase (profiles)');
            }
        });
    }

    OWNER_DISCORD_IDS.forEach(did => {
        if (did) recordAdmin(did, 'Owner (Permanent)', 'owner', 'Config (Hardcoded)');
    });
    ADMIN_DISCORD_IDS.forEach(did => {
        if (did && !adminMap.has(did)) recordAdmin(did, 'Admin', 'admin', 'Config (Hardcoded)');
    });

    const adminsList = Array.from(adminMap.values());

    if (adminsList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 18px;">No administrators found</td></tr>';
        return;
    }

    tableBody.innerHTML = '';
    adminsList.forEach(admin => {
        const tr = document.createElement('tr');
        const isOwnerRole = admin.role === 'owner';
        const roleBadge = isOwnerRole 
            ? '<span style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 11px;">OWNER</span>'
            : '<span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 11px;">ADMIN</span>';

        const matchingProfile = Array.isArray(allUserProfiles) ? allUserProfiles.find(p => String(p.discord_id) === admin.discord_id) : null;
        const avatarUrl = matchingProfile ? cleanAvatarUrl(matchingProfile.avatar_url, admin.discord_id) : 'https://cdn.discordapp.com/embed/avatars/0.png';
        const displayName = (matchingProfile && matchingProfile.username) ? matchingProfile.username : admin.username;

        const isProtectedOwner = OWNER_DISCORD_IDS.includes(admin.discord_id) || (currentUser && currentUser.id === '5eb75030-bfff-4b1e-baa6-c8db8530ed70' && admin.discord_id === '1475396409246089367');
        const canDelete = (isOwner() || isAdmin()) && !isProtectedOwner;

        tr.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${avatarUrl}" alt="Avatar" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" onerror="this.onerror=null; this.src='https://cdn.discordapp.com/embed/avatars/0.png';">
                    <span style="font-weight: 600; color: #fff;">${escapeHtml(displayName)}</span>
                </div>
            </td>
            <td><code style="background: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #94a3b8;">${escapeHtml(admin.discord_id)}</code></td>
            <td>${roleBadge}</td>
            <td><span style="font-size: 12px; color: #94a3b8;">${escapeHtml(admin.source)}</span></td>
            <td style="text-align: right;" class="admin-del-cell">
                ${!canDelete ? '<span style="font-size: 11px; color: var(--text-muted);">—</span>' : ''}
            </td>
        `;
        if (canDelete) {
            const delCell = tr.querySelector('.admin-del-cell');
            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'btn btn-secondary btn-sm';
            delBtn.style.cssText = 'padding: 4px 10px; font-size: 11.5px; color: #f87171; border-color: rgba(239, 68, 68, 0.3);';
            delBtn.textContent = 'Delete';
            delBtn.addEventListener('click', () => handleRemoveAdminStaff(admin.discord_id, displayName));
            delCell.appendChild(delBtn);
        }
        tableBody.appendChild(tr);
    });
}

async function handleCreateAdminStaff(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!isAdmin()) return;

    const idInput = document.getElementById('admin-staff-discord-id');
    const nameInput = document.getElementById('admin-staff-username');
    const roleSelect = document.getElementById('admin-staff-role');

    const discordId = idInput ? idInput.value.trim() : '';
    const username = nameInput ? nameInput.value.trim() : '';
    const role = roleSelect ? roleSelect.value : 'admin';

    if (!discordId) {
        showBanner("Please enter your Discord ID", "warning");
        return;
    }

    try {
        // 1. Insert or update in Supabase 'admins' table
        const { error: adminError } = await supabaseClient
            .from('admins')
            .upsert({
                discord_id: discordId,
                username: username || 'Admin',
                role: role,
                created_by: currentUser ? (currentUser.user_metadata?.user_name || currentUser.email || 'Admin') : 'Admin'
            }, { onConflict: 'discord_id' });

        if (adminError && !adminError.message.includes('Could not find')) {
            console.warn("Could not upsert into admins table:", adminError.message);
        }

        // 2. Also update 'profiles' table if user exists there
        try {
            await supabaseClient
                .from('profiles')
                .update({ role: role })
                .eq('discord_id', discordId);
        } catch(ignored) {}

        if (idInput) idInput.value = '';
        if (nameInput) nameInput.value = '';

        removedAdminDiscordIds.delete(discordId.trim());
        showBanner(`Administrator (${discordId}) successfully added!`, "success");

        sendDiscordAuditLog(
            "Admin added (Staff)",
            `Admin **${currentUser?.user_metadata?.user_name || 'Admin'}** Added new admin: **${username || discordId}** (Discord ID: \`${discordId}\`, role: \`${role}\`).`,
            0x22c55e,
            [
                { name: "Discord ID", value: discordId, inline: true },
                { name: "role", value: role, inline: true },
                { name: "performer", value: currentUser?.user_metadata?.user_name || 'Admin', inline: true }
            ]
        );

        await fetchSupabaseAdminsList();
        if (typeof fetchProfilesForAdmin === 'function') fetchProfilesForAdmin();

    } catch (err) {
        console.error("Error adding admin:", err);
        showBanner("Error adding admin: " + err.message, "error");
    }
}

async function handleRemoveAdminStaff(discordId, displayName) {
    if (!isAdmin() && !isOwner()) {
        showBanner("You do not have permission to remove the administrator", "error");
        return;
    }

    const didStr = String(discordId || '').trim();
    if (!didStr) {
        showBanner("No Discord ID specified", "warning");
        return;
    }

    const nameStr = displayName || didStr;
    const confirmMessage = `Are you sure you want to remove the administrator rights for the user (${nameStr})?`;
    
    let confirmed = false;
    if (typeof showCustomConfirm === 'function') {
        confirmed = await showCustomConfirm("Delete the administrator", confirmMessage);
    } else {
        confirmed = window.confirm(confirmMessage);
    }
    if (!confirmed) return;

    try {
        // 1. Add to in-memory blacklist immediately so it won't resurrect
        removedAdminDiscordIds.add(didStr);

        // 2. Remove from Supabase 'admins' table
        const { error: adminDelError } = await supabaseClient
            .from('admins')
            .delete()
            .eq('discord_id', didStr);

        if (adminDelError && !adminDelError.message.includes('Could not find')) {
            console.warn("[AdminStaff] admins table delete notice:", adminDelError.message);
        }

        // 3. Update 'profiles' table role to 'user'
        try {
            const { error: profUpdateError } = await supabaseClient
                .from('profiles')
                .update({ role: 'user', is_admin: false, is_staff: false })
                .eq('discord_id', didStr);
            if (profUpdateError) {
                console.warn("[AdminStaff] profiles update notice:", profUpdateError.message);
            }
        } catch(ignored) {}

        // 4. Update in-memory collections
        if (Array.isArray(supabaseAdminRecords)) {
            supabaseAdminRecords = supabaseAdminRecords.filter(a => String(a.discord_id).trim() !== didStr);
        }
        if (Array.isArray(allUserProfiles)) {
            allUserProfiles.forEach(p => {
                if (String(p.discord_id).trim() === didStr) {
                    p.role = 'user';
                    p.is_admin = false;
                    p.is_staff = false;
                }
            });
        }

        showBanner(`Administrator (${nameStr}) was successfully deleted!`, "success");

        sendDiscordAuditLog(
            "Administrator deleted (Staff)",
            `Admin **${currentUser?.user_metadata?.user_name || 'Admin'}** Admin rights revoked: **${nameStr}** (\`${didStr}\`).`,
            0xef4444,
            [
                { name: "Discord ID", value: didStr, inline: true },
                { name: "performer", value: currentUser?.user_metadata?.user_name || 'Admin', inline: true }
            ]
        );

        // 5. Re-render UI immediately
        renderAdminStaffPanel();
        await fetchSupabaseAdminsList();
        if (typeof fetchProfilesForAdmin === 'function') fetchProfilesForAdmin();

    } catch (err) {
        console.error("Error removing admin:", err);
        showBanner("Error deleting admin: " + err.message, "error");
    }
}
window.handleCreateAdminStaff = handleCreateAdminStaff;
window.handleRemoveAdminStaff = handleRemoveAdminStaff;
window.fetchSupabaseAdminsList = fetchSupabaseAdminsList;


// ==========================================
// FREE CLIENT INSTRUCTION MODAL
// ==========================================
function openFreeClientModal() {
    const modal = document.getElementById('free-client-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeFreeClientModal() {
    const modal = document.getElementById('free-client-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function closeFreeClientModalOnBackdrop(e) {
    if (e && e.target && e.target.id === 'free-client-modal') {
        closeFreeClientModal();
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeFreeClientModal();
    }
});

window.openFreeClientModal = openFreeClientModal;
window.closeFreeClientModal = closeFreeClientModal;
window.closeFreeClientModalOnBackdrop = closeFreeClientModalOnBackdrop;
