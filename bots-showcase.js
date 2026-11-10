/* ========================================================
   PulseClient - Bots & Modules Showcase Controller
   ======================================================== */

const BOTS_DATA = [
    // PvP Modules (6)
    {
        code: "cpx01",
        name: "Crystal PvP",
        tagline: "Crystal fights, start to finish.",
        taglineKa: "კრისტალების ბრძოლა თავიდან ბოლომდე.",
        category: "PvP",
        skin: "assets/bots/cpx01.png",
        holds: [
            { name: "End Crystal", icon: "assets/bot-items/end_crystal.png" },
            { name: "Totem of Undying", icon: "assets/bot-items/totem_of_undying.png" }
        ]
    },
    {
        code: "sbx02",
        name: "Sword PvP",
        tagline: "Perfect W-taps and strafes.",
        taglineKa: "იდეალური W-tap-ები და სტრეიფები.",
        category: "PvP",
        skin: "assets/bots/sbx02.png",
        holds: [
            { name: "Diamond Sword", icon: "assets/bot-items/diamond_sword.png" }
        ]
    },
    {
        code: "mcx03",
        name: "Mace PvP",
        tagline: "Mace fights for SMP servers.",
        taglineKa: "Mace ბრძოლები SMP სერვერებისთვის.",
        category: "PvP",
        skin: "assets/bots/mcx03.png",
        holds: [
            { name: "Mace", icon: "assets/bot-items/mace.png" },
            { name: "Totem of Undying", icon: "assets/bot-items/totem_of_undying.png" }
        ]
    },
    {
        code: "dnq06",
        name: "DonutQUE",
        isNew: true,
        tagline: "Queues /rtp, banks the loot.",
        taglineKa: "რიგში დგება /rtp-ზე და ინახავს ლუთს.",
        category: "PvP",
        skin: "assets/bots/dnq06.png",
        holds: [
            { name: "End Crystal", icon: "assets/bot-items/end_crystal.png" },
            { name: "Totem of Undying", icon: "assets/bot-items/totem_of_undying.png" }
        ]
    },
    {
        code: "uhc07",
        name: "UHC PvP",
        isNew: true,
        tagline: "Traps, healing and bows.",
        taglineKa: "ხაფანგები, ჰილინგი და მშვილდი.",
        category: "PvP",
        skin: "assets/bots/uhc07.png",
        holds: [
            { name: "Bow", icon: "assets/bot-items/bow.png" },
            { name: "Golden Apple", icon: "assets/bot-items/golden_apple.png" }
        ]
    },
    {
        code: "smp05",
        name: "SMP PvP",
        isNew: true,
        tagline: "DiaSMP PVP, full utility kit.",
        taglineKa: "DiaSMP PvP სრული უტილიტებით.",
        category: "PvP",
        skin: "assets/bots/smp05.png",
        holds: [
            { name: "Diamond Sword", icon: "assets/bot-items/diamond_sword.png" },
            { name: "Totem of Undying", icon: "assets/bot-items/totem_of_undying.png" }
        ]
    },

    // Utility Modules (8)
    {
        code: "bld01",
        name: "Auto Builder",
        tagline: "Builds schematics block by block.",
        taglineKa: "აშენებს სქემატიკას ბლოკ-ბლოკ.",
        category: "Utility",
        skin: "assets/bots/bld01.png",
        holds: [
            { name: "Scaffolding", icon: "assets/bot-items/scaffolding_icon.png" }
        ]
    },
    {
        code: "min02",
        name: "Area Miner",
        tagline: "Mines out the area you pick.",
        taglineKa: "ასუფთავებს თქვენს მიერ არჩეულ ტერიტორიას.",
        category: "Utility",
        skin: "assets/bots/min02.png",
        holds: [
            { name: "Netherite Pickaxe", icon: "assets/bot-items/netherite_pickaxe.png" }
        ]
    },
    {
        code: "ore11",
        name: "Auto Ore Miner",
        isNew: true,
        tagline: "Mines your ores on safe routes.",
        taglineKa: "მაინინგობს მადანს უსაფრთხო მარშრუტებით.",
        category: "Utility",
        skin: "assets/bots/ore11.png",
        holds: [
            { name: "Diamond Pickaxe", icon: "assets/bot-items/diamond_pickaxe.png" }
        ]
    },
    {
        code: "tfm12",
        name: "Tree Farmer",
        isNew: true,
        tagline: "Plants, chops and sells the wood.",
        taglineKa: "რგავს, ჭრის და ყიდის ხეს.",
        category: "Utility",
        skin: "assets/bots/tfm12.png",
        holds: [
            { name: "Netherite Axe", icon: "assets/bot-items/netherite_axe.png" }
        ]
    },
    {
        code: "plt09",
        name: "Elytra Pilot",
        tagline: "Flies you to your coords.",
        taglineKa: "მიფრინავს თქვენს მიერ მითითებულ კოორდინატებზე.",
        category: "Utility",
        skin: "assets/bots/plt09.png",
        holds: [
            { name: "Firework Rocket", icon: "assets/bot-items/firework_rocket.png" }
        ]
    },
    {
        code: "rtp07",
        name: "Base Alert",
        tagline: "Scouts and alerts you to bases.",
        taglineKa: "ეძებს და გატყობინებთ ბაზების შესახებ.",
        category: "Utility",
        skin: "assets/bots/rtp07.png",
        holds: [
            { name: "Recovery Compass", icon: "assets/bot-items/recovery_compass.png" }
        ]
    },
    {
        code: "anc10",
        name: "Anchor Hunter",
        tagline: "RTPs and mines respawn anchors.",
        taglineKa: "RTP-ით პოულობს და ტეხავს anchor-ებს.",
        category: "Utility",
        skin: "assets/bots/anc10.png",
        holds: [
            { name: "Diamond Pickaxe", icon: "assets/bot-items/diamond_pickaxe.png" }
        ]
    },
    {
        code: "tpa08",
        name: "Auto TPA",
        tagline: "Sends /tpahere from your trap.",
        taglineKa: "უგზავნის /tpahere-ს თქვენი ხაფანგიდან.",
        category: "Utility",
        skin: "assets/bots/tpa08.png",
        holds: [
            { name: "Ender Pearl", icon: "assets/bot-items/ender_pearl.png" }
        ]
    }
];

let botSkinViewer = null;
let currentBotIndex = 0;

function createBotRowHTML(bot, index) {
    const isKa = (typeof currentLang !== 'undefined' && currentLang === 'ka') ||
                 (localStorage.getItem('pulse_lang') === 'ka');
    const tagline = isKa && bot.taglineKa ? bot.taglineKa : bot.tagline;
    const badgeHTML = bot.isNew ? '<span class="bot-badge-new">NEW</span>' : '';

    return `
        <button type="button" 
                class="bots-row ${index === currentBotIndex ? 'active' : ''}" 
                data-bot-index="${index}"
                onclick="selectBotModule(${index})"
                aria-label="${bot.name}">
            <div class="bot-head-wrapper">
                <div class="bot-head-canvas-box">
                    <div class="bot-head-layer bot-head-base" style="background-image: url('${bot.skin}');"></div>
                    <div class="bot-head-layer bot-head-hat" style="background-image: url('${bot.skin}');"></div>
                </div>
            </div>
            <div class="bot-meta">
                <div class="bot-title-line">
                    <span class="bot-name">${bot.name}</span>
                    ${badgeHTML}
                </div>
                <div class="bot-tagline">${tagline}</div>
            </div>
        </button>
    `;
}

function renderBotsList() {
    const pvpContainer = document.getElementById('bots-pvp-list');
    const utilContainer = document.getElementById('bots-util-list');
    if (!pvpContainer || !utilContainer) return;

    let pvpHTML = '';
    let utilHTML = '';

    BOTS_DATA.forEach((bot, idx) => {
        if (bot.category === 'PvP') {
            pvpHTML += createBotRowHTML(bot, idx);
        } else {
            utilHTML += createBotRowHTML(bot, idx);
        }
    });

    pvpContainer.innerHTML = pvpHTML;
    utilContainer.innerHTML = utilHTML;

    updateBotHeldItems(BOTS_DATA[currentBotIndex]);
}

function updateBotHeldItems(bot) {
    const container = document.getElementById('bot-held-items');
    if (!container || !bot.holds) return;

    const itemsHTML = bot.holds.map(item => `
        <span class="bot-held-item">
            <img src="${item.icon}" alt="${item.name}">
            <span>${item.name}</span>
        </span>
    `).join('<span class="bot-held-dot">·</span>');

    container.innerHTML = itemsHTML;
}

function selectBotModule(index) {
    if (index < 0 || index >= BOTS_DATA.length) return;
    currentBotIndex = index;
    const bot = BOTS_DATA[index];

    // Update active classes
    document.querySelectorAll('.bots-row').forEach(row => {
        const rowIdx = parseInt(row.getAttribute('data-bot-index'), 10);
        if (rowIdx === index) {
            row.classList.add('active');
        } else {
            row.classList.remove('active');
        }
    });

    // Update held items
    updateBotHeldItems(bot);

    // Update 3D skin
    if (botSkinViewer) {
        try {
            botSkinViewer.loadSkin(bot.skin);
        } catch (e) {
            console.warn('Error loading skin into skinViewer:', e);
        }
    }
}

function initBotSkinViewer() {
    const canvas = document.getElementById('bot-skin-canvas');
    if (!canvas) return;

    if (!window.skinview3d) {
        console.warn('skinview3d library not yet loaded, retrying...');
        setTimeout(initBotSkinViewer, 150);
        return;
    }

    try {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = 340;
        const h = 420;

        botSkinViewer = new window.skinview3d.SkinViewer({
            canvas: canvas,
            width: w,
            height: h,
            skin: BOTS_DATA[currentBotIndex].skin
        });

        botSkinViewer.camera.position.set(0, 0, 58);
        botSkinViewer.zoom = 0.90;
        botSkinViewer.fov = 50;

        // Subtle idle animation
        if (window.skinview3d.IdleAnimation) {
            const idle = botSkinViewer.animations.add(window.skinview3d.IdleAnimation);
            idle.speed = 0.7;
        }

        // Pointer rotation drag
        let isDragging = false;
        let prevX = 0;
        let prevY = 0;

        canvas.addEventListener('pointerdown', (e) => {
            isDragging = true;
            prevX = e.clientX;
            prevY = e.clientY;
            canvas.setPointerCapture(e.pointerId);
        });

        canvas.addEventListener('pointermove', (e) => {
            if (!isDragging || !botSkinViewer || !botSkinViewer.playerObject) return;
            const dx = e.clientX - prevX;
            const dy = e.clientY - prevY;
            prevX = e.clientX;
            prevY = e.clientY;
            botSkinViewer.playerObject.rotation.y += dx * 0.015;
            botSkinViewer.playerObject.rotation.x = Math.max(-0.4, Math.min(0.4, botSkinViewer.playerObject.rotation.x + dy * 0.01));
        });

        const stopDrag = () => { isDragging = false; };
        canvas.addEventListener('pointerup', stopDrag);
        canvas.addEventListener('pointercancel', stopDrag);

    } catch (err) {
        console.error('Failed to initialize SkinViewer:', err);
    }
}

// Auto init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        renderBotsList();
        initBotSkinViewer();
    });
} else {
    renderBotsList();
    initBotSkinViewer();
}

const prevLangChanged = window.onLanguageChanged;
window.onLanguageChanged = function() {
    if (typeof prevLangChanged === 'function') {
        try { prevLangChanged(); } catch (e) {}
    }
    renderBotsList();
};
