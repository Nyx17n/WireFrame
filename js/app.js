/**
 * WireMarket — Navigateur dédié Warframe Market
 * Connecté en direct à l'API officielle https://api.warframe.market via le proxy local
 */

const DEFAULT_FAVICON = "logo.png";

/* ==================== ICÔNES VECTORIELLES STYLE WARFRAME / OROKIN ==================== */
const WF_ICON_PATHS = {
    prime: `<polygon points="12 2 14.6 9.4 22 12 14.6 14.6 12 22 9.4 14.6 2 12 9.4 9.4"/><circle cx="12" cy="12" r="2"/>`,
    star: `<polygon points="12 2 14.8 9.2 22 12 14.8 14.8 12 22 9.2 14.8 2 12 9.2 9.2"/>`,
    warframe: `<polygon points="12 2 20 6 18 16 12 22 6 16 4 6"/><polyline points="8 10 12 14 16 10"/><line x1="12" y1="2" x2="12" y2="9"/>`,
    weapon: `<line x1="4" y1="20" x2="19" y2="5"/><polyline points="13 5 19 5 19 11"/><line x1="6" y1="14" x2="10" y2="18"/><line x1="20" y1="20" x2="5" y2="5"/>`,
    mod: `<polygon points="12 2 20 8 20 16 12 22 4 16 4 8"/><polygon points="12 7 16 12 12 17 8 12"/>`,
    arcane: `<polygon points="12 2 21 19 3 19"/><polygon points="12 8 16.5 16.5 7.5 16.5"/>`,
    relic: `<polygon points="12 2 19 9 19 15 12 22 5 15 5 9"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="5" y1="12" x2="19" y2="12"/>`,
    syndicate: `<polygon points="12 2 21 7 18 19 12 22 6 19 3 7"/><circle cx="12" cy="12" r="3.5"/>`,
    ducats: `<polygon points="12 2 20 6.5 20 17.5 12 22 4 17.5 4 6.5"/><polygon points="12 6.5 16 12 12 17.5 8 12"/>`,
    credits: `<polygon points="7 4 19 4 16 10 4 10"/><polygon points="8 14 20 14 17 20 5 20"/>`,
    plat: `<polygon points="12 2 21 7 21 17 12 22 3 17 3 7"/><polygon points="12 6 17 9 17 15 12 18 7 15 7 9"/>`,
    mastery: `<polygon points="12 2 21 8 17 20 7 20 3 8"/><polyline points="8 13 12 9 16 13"/>`,
    rank: `<polyline points="7 17 12 12 17 17"/><polyline points="7 11 12 6 17 11"/>`,
    codex: `<polygon points="12 3 21 7 21 17 12 21 3 17 3 7"/><line x1="12" y1="3" x2="12" y2="21"/>`,
    compare: `<line x1="12" y1="3" x2="12" y2="21"/><polyline points="5 9 12 5 19 9"/><polygon points="5 9 8 15 2 15"/><polygon points="19 9 22 15 16 15"/>`,
    chart: `<polyline points="3 18 9 12 13 15 21 6"/><polyline points="16 6 21 6 21 11"/>`,
    alert: `<polygon points="12 2 19 9 19 16 21 18 3 18 5 16 5 9"/><polyline points="9.5 18 12 22 14.5 18"/><circle cx="12" cy="10" r="2"/>`,
    target: `<circle cx="12" cy="12" r="8"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="2"/>`,
    sound: `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>`,
    gear: `<polygon points="12 2 20 7 20 17 12 22 4 17 4 7"/><circle cx="12" cy="12" r="3"/>`,
    play: `<polygon points="6 4 20 12 6 20 6 4"/>`,
    pause: `<line x1="8" y1="5" x2="8" y2="19"/><line x1="16" y1="5" x2="16" y2="19"/>`,
    trash: `<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>`,
    repeat: `<polyline points="17 2 21 6 17 10"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 22 3 18 7 14"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>`,
    rep: `<polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9"/>`,
    sun: `<circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="22"/><line x1="4.9" y1="4.9" x2="6.7" y2="6.7"/><line x1="17.3" y1="17.3" x2="19.1" y2="19.1"/><line x1="2" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="22" y2="12"/><line x1="4.9" y1="19.1" x2="6.7" y2="17.3"/><line x1="17.3" y1="6.7" x2="19.1" y2="4.9"/>`,
    moon: `<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/>`,
    planet: `<circle cx="12" cy="12" r="6"/><ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-22 12 12)"/>`,
    void: `<polygon points="12 2 19 8 16 21 12 18 8 21 5 8"/><polygon points="12 6 15.5 10 12 15 8.5 10"/>`,
    clock: `<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>`,
    cart: `<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>`,
    flame: `<path d="M12 2c1.5 3.5 4 5.5 4 9a4 4 0 1 1-8 0c0-2 1-3.5 2-5 0 2 1.5 2.5 2 1.5 0-2 0-3.8 0-5.5z"/>`
};

function wfIcon(name, extraClass = "") {
    const svgBody = WF_ICON_PATHS[name] || WF_ICON_PATHS.star;
    return `<svg class="wf-icon ${extraClass}" viewBox="0 0 24 24" aria-hidden="true">${svgBody}</svg>`;
}

const FEATURED_SLUGS = [
    "wisp_prime_set",
    "gauss_prime_set",
    "protea_prime_set",
    "sevagoth_prime_set",
    "revenant_prime_set",
    "nikana_prime_set",
    "glaive_prime_set",
    "torid_incarnon_genesis",
    "arcane_energize",
    "molt_augmented",
    "galvanized_chamber",
    "primed_continuity"
];

const State = {
    lang: localStorage.getItem("wm_lang") || "fr",
    platform: localStorage.getItem("wm_platform") || "pc",
    crossplay: localStorage.getItem("wm_crossplay") !== "false",
    whisperLang: localStorage.getItem("wm_whisper_lang") || "en",
    zoom: Number(localStorage.getItem("wm_zoom")) || 100,
    theme: localStorage.getItem("wm_theme") || "dark",
    primaryColor: localStorage.getItem("wm_primary_color") || "",
    secondaryColor: localStorage.getItem("wm_secondary_color") || "",
    glowEnabled: localStorage.getItem("wm_glow") !== "false",
    alwaysOnTop: localStorage.getItem("wm_always_on_top") === "true",
    compactMode: false,
    lastWhisperData: null,

    // Catalogue complet Warframe Market
    itemsList: [],
    itemsById: new Map(),
    itemsBySlug: new Map(),
    catalogReady: false,

    // Onglets du navigateur (+ Onglet permanent inamovible WireMarket Hub)
    tabs: [],
    activeTabId: null,
    lastRegularTabId: null,
    nextTabId: 1,
    hubTab: {
        id: "hub",
        isPermanentHub: true,
        url: "https://warframe.market/worldstate",
        title: "WireMarket Hub — Rotations Warframe & Baro Ki'Teer",
        icon: DEFAULT_FAVICON,
        loading: false,
        history: ["https://warframe.market/worldstate"],
        historyIndex: 0,
        viewState: {
            hubSection: "planets",   // "planets" | "fissures" | "duviri" | "baro"
            fissureMode: "all",      // "all" | "normal" | "hard" | "storm"
            fissureTier: "all",      // "all" | "Lith" | "Meso" | "Neo" | "Axi" | "Requiem" | "Omnia"
            fissureFastOnly: false,  // true = Capture / Extermination / Sauvetage / Perturbation / Sabotage
            baroFilter: "all",       // "all" | "tradable" | "mods" | "weapons"
            baroSort: "plat_desc",   // "plat_desc" | "ratio_desc" | "ducats_desc" | "name_asc"
            baroSearch: "",
            bountySyndicate: "Ostrons" // "Ostrons" | "Solaris United" | "Entrati"
        },
        cachedData: {}
    },
    worldstateData: null,
    worldstateFetchedAt: 0,
    baroPricesBySlug: new Map(),
    baroPricesLoading: false,

    // Favoris & Historique
    bookmarks: (JSON.parse(localStorage.getItem("wm_bookmarks") || "null") || [
        { title: "Accueil Marché", url: "https://warframe.market/", icon: DEFAULT_FAVICON },
        { title: "Catalogue Complet", url: "https://warframe.market/items", icon: DEFAULT_FAVICON },
        { title: "Ordres Récents", url: "https://warframe.market/recent", icon: DEFAULT_FAVICON },
        { title: "Ducanator (Ducats)", url: "https://warframe.market/tools/ducats", icon: DEFAULT_FAVICON }
    ]).filter(b => {
        const favs = JSON.parse(localStorage.getItem("wm_fav_items") || "[]");
        const m = (b.url || "").match(/warframe\.market\/items\/([a-z0-9_]+)/i);
        if (m && ["wisp_prime_set", "nikana_prime_set", "arcane_energize"].includes(m[1]) && !favs.includes(m[1])) {
            return false;
        }
        return true;
    }),
    history: JSON.parse(localStorage.getItem("wm_history") || "[]"),
    favoriteItems: JSON.parse(localStorage.getItem("wm_fav_items") || "[]"),
    activeDrawerTab: "history",

    // Système d'Alertes de Prix (Price Sniper) & Paramètres Sonores
    priceAlerts: JSON.parse(localStorage.getItem("wm_price_alerts") || "[]"),
    alertSoundEnabled: localStorage.getItem("wm_alert_sound") !== "false",
    alertSoundChoice: localStorage.getItem("wm_alert_sound_choice") || "default", // "default" (notification.mp3) | "bell" (notification-bell.wav)
    alertVolume: localStorage.getItem("wm_alert_volume") !== null ? Number(localStorage.getItem("wm_alert_volume")) : 80,
    alertRepeat: localStorage.getItem("wm_alert_repeat") !== "false",
    alertRepeatInterval: Math.max(5, Number(localStorage.getItem("wm_alert_interval")) || 30),
    lastSniperScanTime: 0,
    sniperScanning: false,

    // Panier Multi-Achats & Liste de Courses (Option 5)
    shoppingCart: JSON.parse(localStorage.getItem("wm_shopping_cart") || "[]"),

    // Alertes de Cycles Planétaires & Fissures (Option 7)
    worldAlerts: JSON.parse(localStorage.getItem("wm_world_alerts") || "{}"),
    worldAlertLastNotified: {}
};

/* ==================== PANIER MULTI-ACHATS & LISTE DE COURSES ==================== */

function saveShoppingCart() {
    localStorage.setItem("wm_shopping_cart", JSON.stringify(State.shoppingCart));
    updateCartCountBadge();
}

function isItemInCart(slug) {
    return State.shoppingCart.some(c => c.slug === slug);
}

function getCartEntry(slug) {
    return State.shoppingCart.find(c => c.slug === slug) || null;
}

function updateCartCountBadge() {
    const el = document.getElementById("cart-count-badge");
    if (el) {
        const totalQty = State.shoppingCart.reduce((acc, c) => acc + (Number(c.quantity) || 1), 0);
        el.textContent = String(totalQty);
    }
}

function toggleCartItem(slug, defaultQty = 1) {
    if (!slug) return;
    const idx = State.shoppingCart.findIndex(c => c.slug === slug);
    if (idx >= 0) {
        State.shoppingCart.splice(idx, 1);
    } else {
        State.shoppingCart.unshift({
            slug,
            quantity: Math.max(1, Number(defaultQty) || 1),
            desiredRank: "any"
        });
    }
    saveShoppingCart();
    const tab = getActiveTab();
    if (tab) {
        const parsed = parseWfmUrl(tab.url);
        if (parsed.route === "cart") {
            navigateTab(tab.id, tab.url, { pushHistory: false, forceRefresh: false });
        } else {
            renderActiveTabPage();
        }
    }
}

function addOrUpdateCartItem(slug, quantity = 1, desiredRank = "any") {
    if (!slug) return;
    const cleanQty = Math.max(1, Math.min(99, Math.round(Number(quantity) || 1)));
    const existing = getCartEntry(slug);
    if (existing) {
        existing.quantity = cleanQty;
        if (desiredRank) existing.desiredRank = desiredRank;
    } else {
        State.shoppingCart.unshift({
            slug,
            quantity: cleanQty,
            desiredRank: desiredRank || "any"
        });
    }
    saveShoppingCart();
}

function removeCartItem(slug) {
    State.shoppingCart = State.shoppingCart.filter(c => c.slug !== slug);
    saveShoppingCart();
}

function clearShoppingCart() {
    State.shoppingCart = [];
    saveShoppingCart();
}

/* ==================== ALERTES SONORES DE CYCLES PLANÉTAIRES & FISSURES ==================== */

const WORLD_ALERT_RULES = [
    {
        id: "cetusNight",
        category: "planets",
        icon: "moon",
        title: "Nuit sur Cetus (Chasse aux Eidolons)",
        desc: "Notification sonore dès que la Nuit commence sur les Plaines d'Eidolon (Terre)"
    },
    {
        id: "cetusNightSoon",
        category: "planets",
        icon: "clock",
        title: "Pré-alerte : 5 min avant la Nuit sur Cetus",
        desc: "Vous prévient 5 minutes avant la tombée de la Nuit pour préparer votre escouade Eidolon"
    },
    {
        id: "vallisWarm",
        category: "planets",
        icon: "sun",
        title: "Cycle Chaud sur Vénus (Vallée Orbis)",
        desc: "Notification sonore au début des 6m40s de cycle Chaud à Fortuna"
    },
    {
        id: "cambionFassVome",
        category: "planets",
        icon: "prime",
        title: "Cycle Vome sur Deimos (Puy de Cambion)",
        desc: "Notification sonore lorsque Vome prend le contrôle de Deimos"
    },
    {
        id: "baroPresent",
        category: "planets",
        icon: "ducats",
        title: "Arrivée de Baro Ki'Teer au Relais",
        desc: "Notification sonore dès que le Marchand du Néant est présent"
    },
    {
        id: "fissureFastSp",
        category: "fissures",
        icon: "flame",
        title: "Fissure Rapide — Route de l'Acier",
        desc: "Capture, Extermination, Sauvetage ou Perturbation en Route de l'Acier (Steel Path)"
    },
    {
        id: "fissureCaptureAny",
        category: "fissures",
        icon: "relic",
        title: "Fissure Capture (Normal ou Route de l'Acier)",
        desc: "Notification dès qu'une Fissure de type Capture (< 1 min) apparaît"
    },
    {
        id: "fissureOmnia",
        category: "fissures",
        icon: "void",
        title: "Fissure Omnia Active (Cascade / Conjonction / Alchimie)",
        desc: "Notification dès qu'une Fissure Omnia permettant d'ouvrir n'importe quelle relique est active"
    },
    {
        id: "invasionRare",
        category: "invasions",
        icon: "prime",
        title: "Invasion / Alerte Rare (Catalyseur, Réacteur, Forma, Exilus)",
        desc: "Notification sonore dès qu'un Catalyseur/Réacteur Orokin, Forma ou Adaptateur apparaît"
    },
    {
        id: "invasionWeapon",
        category: "invasions",
        icon: "weapon",
        title: "Invasion Arme Wraith / Vandal (Vendable en Platinum)",
        desc: "Notification sonore lorsqu'une pièce d'arme Wraith ou Vandal est en récompense d'invasion"
    },
    {
        id: "steelpathUmbra",
        category: "invasions",
        icon: "relic",
        title: "Route de l'Acier (Teshin) : Schéma Forma Umbra disponible",
        desc: "Vous alerte lorsque la rotation hebdomadaire de Teshin propose le Forma Umbra"
    },
    {
        id: "arbiEndurance",
        category: "invasions",
        icon: "flame",
        title: "Arbitrage S-Tier (Survie, Défense, Excavation, Perturbation)",
        desc: "Notification sonore pour farmer l'Essence Vitus et les Mods Galvanisés à revendre"
    }
];

function isWorldAlertEnabled(ruleId) {
    return !!State.worldAlerts[ruleId];
}

function toggleWorldAlert(ruleId) {
    State.worldAlerts[ruleId] = !State.worldAlerts[ruleId];
    if (!State.worldAlerts[ruleId]) {
        delete State.worldAlertLastNotified[ruleId];
    } else {
        // Réinitialiser le verrou pour vérifier immédiatement
        delete State.worldAlertLastNotified[ruleId];
    }
    localStorage.setItem("wm_world_alerts", JSON.stringify(State.worldAlerts));
    updateAlertCountBadge();
    if (State.worldAlerts[ruleId]) {
        checkWorldstateAlerts(true);
    }
}

function showWorldAlertToast(ruleId, badgeText, title, subtitle, targetHubSec = "planets") {
    const container = document.getElementById("price-alert-toast-container");
    if (!container) return;

    const toastKey = `world_${ruleId}`;
    let toast = container.querySelector(`.price-alert-toast[data-toast-slug="${CSS.escape(toastKey)}"]`);
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "price-alert-toast world-alert-toast";
        toast.dataset.toastSlug = toastKey;
        container.prepend(toast);
    } else {
        toast.classList.remove("toast-pulse");
        void toast.offsetWidth;
        toast.classList.add("toast-pulse");
    }

    toast.innerHTML = `
        <div class="toast-header">
            <span class="toast-badge" style="color:var(--accent-cyan);">${wfIcon("alert", "wf-icon-sm")} ${escapeHtml(badgeText)}</span>
            <div style="display:flex;align-items:center;gap:6px;">
                <button class="toast-mute-btn" data-world-toast-mute="${escapeHtml(ruleId)}" title="Désactiver cette alerte">${wfIcon("pause", "wf-icon-sm")} Désactiver</button>
                <button class="chrome-icon-btn toast-close-btn" data-world-toast-close="1" title="Fermer">✕</button>
            </div>
        </div>
        <div class="toast-body">
            <img class="toast-thumb" src="${DEFAULT_FAVICON}" alt="" />
            <div class="toast-info">
                <div class="toast-item-title">${escapeHtml(title)}</div>
                <div class="toast-price-line" style="color:var(--text-secondary);font-size:12.5px;">
                    ${escapeHtml(subtitle)}
                </div>
            </div>
        </div>
        <div class="toast-actions">
            <button class="btn-primary btn-sm" data-world-toast-go="${escapeHtml(targetHubSec)}">Ouvrir dans WireMarket Hub →</button>
        </div>
    `;

    toast.querySelector("[data-world-toast-close]")?.addEventListener("click", () => toast.remove());
    toast.querySelector("[data-world-toast-mute]")?.addEventListener("click", () => {
        toggleWorldAlert(ruleId);
        toast.remove();
        renderActiveTabPage();
    });
    toast.querySelector("[data-world-toast-go]")?.addEventListener("click", () => {
        switchHubSection(targetHubSec);
        toast.remove();
    });
}

function isFastMissionType(missionTypeStr) {
    const m = normalizeSearch(missionTypeStr || "");
    return m.includes("capture") || m.includes("extermination") || m.includes("exterminate") || m.includes("sauvetage") || m.includes("rescue") || m.includes("perturbation") || m.includes("disruption") || m.includes("sabotage");
}

async function checkWorldstateAlerts(forceCheck = false) {
    const anyActive = WORLD_ALERT_RULES.some(r => isWorldAlertEnabled(r.id));
    if (!anyActive) return;

    const ws = await fetchWorldstateData(false);
    if (!ws) return;

    const now = Date.now();
    const repeatMs = Math.max(15, Number(State.alertRepeatInterval) || 30) * 1000;

    const canFire = (ruleId, stateSignature) => {
        const prev = State.worldAlertLastNotified[ruleId];
        if (!prev || prev.sig !== stateSignature) {
            State.worldAlertLastNotified[ruleId] = { sig: stateSignature, time: now };
            return true;
        }
        if (State.alertRepeat && (now - prev.time >= repeatMs)) {
            State.worldAlertLastNotified[ruleId].time = now;
            return true;
        }
        return false;
    };

    // 1. Nuit sur Cetus
    const cetusLive = resolveLiveCycle(ws.cetusCycle || {}, "cetus");
    const isCetusDay = cetusLive.isFirstPhase;
    const cetusRemMs = Date.parse(cetusLive.expiry) - now;

    if (isWorldAlertEnabled("cetusNight") && !isCetusDay) {
        if (canFire("cetusNight", `night_${cetusLive.expiry.slice(0, 13)}`)) {
            showWorldAlertToast(
                "cetusNight",
                "ALERTE CYCLE PLANÉTAIRE",
                "La Nuit est tombée sur Cetus (Plaines d'Eidolon) !",
                `Les Eidolons sont actifs — Temps restant : ${formatCountdownMs(cetusRemMs)}`,
                "planets"
            );
            playAlertNotificationSound(false);
        }
    }

    // 2. Pré-alerte 5 min avant la Nuit sur Cetus
    if (isWorldAlertEnabled("cetusNightSoon") && isCetusDay && cetusRemMs > 0 && cetusRemMs <= 5 * 60 * 1000) {
        if (canFire("cetusNightSoon", `soon_${cetusLive.expiry.slice(0, 13)}`)) {
            showWorldAlertToast(
                "cetusNightSoon",
                "PRÉ-ALERTE EIDOLONS (5 MIN)",
                "La Nuit sur Cetus commence dans moins de 5 minutes !",
                `Début de la Nuit dans : ${formatCountdownMs(cetusRemMs)}`,
                "planets"
            );
            playAlertNotificationSound(false);
        }
    }

    // 3. Cycle Chaud sur Vénus
    const vallisLive = resolveLiveCycle(ws.vallisCycle || {}, "vallis");
    if (isWorldAlertEnabled("vallisWarm") && vallisLive.isFirstPhase) {
        if (canFire("vallisWarm", `warm_${vallisLive.expiry.slice(0, 15)}`)) {
            showWorldAlertToast(
                "vallisWarm",
                "ALERTE CYCLE VÉNUS",
                "Cycle CHAUD actif dans la Vallée Orbis (Fortuna) !",
                `Temps restant en phase Chaude : ${formatCountdownMs(Date.parse(vallisLive.expiry) - now)}`,
                "planets"
            );
            playAlertNotificationSound(false);
        }
    }

    // 4. Cycle Vome sur Deimos
    const cambionLive = resolveLiveCycle(ws.cambionCycle || {}, "cambion");
    if (isWorldAlertEnabled("cambionFassVome") && !cambionLive.isFirstPhase) {
        if (canFire("cambionFassVome", `vome_${cambionLive.expiry.slice(0, 13)}`)) {
            showWorldAlertToast(
                "cambionFassVome",
                "ALERTE CYCLE DEIMOS",
                "Le Wyrm VOME domine le Puy de Cambion (Deimos) !",
                `Temps restant sous Vome : ${formatCountdownMs(Date.parse(cambionLive.expiry) - now)}`,
                "planets"
            );
            playAlertNotificationSound(false);
        }
    }

    // 5. Baro Ki'Teer présent
    if (isWorldAlertEnabled("baroPresent") && ws.voidTrader?.active) {
        if (canFire("baroPresent", `baro_${ws.voidTrader.expiry}`)) {
            showWorldAlertToast(
                "baroPresent",
                "MARCHAND DU NÉANT PRÉSENT",
                `Baro Ki'Teer est arrivé à ${ws.voidTrader.location || "Relais Tenno"} !`,
                `Consultez son stock et les prix Platinum en direct dans le Hub.`,
                "baro"
            );
            playAlertNotificationSound(false);
        }
    }

    // 6. Fissures du Néant
    const fissures = (ws.fissures || []).filter(f => !f.expired && (Date.parse(f.expiry) - now > 0));

    if (isWorldAlertEnabled("fissureFastSp")) {
        const fastSp = fissures.filter(f => f.isHard && isFastMissionType(f.missionType));
        if (fastSp.length > 0) {
            const topF = fastSp[0];
            if (canFire("fissureFastSp", `fsp_${topF.id}`)) {
                showWorldAlertToast(
                    "fissureFastSp",
                    "FISSURE RAPIDE — ROUTE DE L'ACIER",
                    `${topF.tier} · ${topF.missionType} (Route de l'Acier)`,
                    `Nœud : ${topF.node} (${topF.enemy}) — Expire dans ${formatCountdownMs(Date.parse(topF.expiry) - now)}`,
                    "fissures"
                );
                playAlertNotificationSound(false);
            }
        }
    }

    if (isWorldAlertEnabled("fissureCaptureAny")) {
        const capFissures = fissures.filter(f => normalizeSearch(f.missionType).includes("capture"));
        if (capFissures.length > 0) {
            const topC = capFissures[0];
            if (canFire("fissureCaptureAny", `fcap_${topC.id}`)) {
                showWorldAlertToast(
                    "fissureCaptureAny",
                    "FISSURE CAPTURE RAPIDE",
                    `${topC.tier} · ${topC.missionType} ${topC.isHard ? "(Route de l'Acier)" : "(Normal)"}`,
                    `Nœud : ${topC.node} (${topC.enemy}) — Expire dans ${formatCountdownMs(Date.parse(topC.expiry) - now)}`,
                    "fissures"
                );
                playAlertNotificationSound(false);
            }
        }
    }

    if (isWorldAlertEnabled("fissureOmnia")) {
        const omniaFissures = fissures.filter(f => String(f.tier || "").toLowerCase().includes("omnia") || f.tierNum === 6);
        if (omniaFissures.length > 0) {
            const topO = omniaFissures[0];
            if (canFire("fissureOmnia", `fom_${topO.id}`)) {
                showWorldAlertToast(
                    "fissureOmnia",
                    "FISSURE OMNIA EN DIRECT",
                    `Omnia · ${topO.missionType} ${topO.isHard ? "(Route de l'Acier)" : ""}`,
                    `Nœud : ${topO.node} (${topO.enemy}) — Expire dans ${formatCountdownMs(Date.parse(topO.expiry) - now)}`,
                    "fissures"
                );
                playAlertNotificationSound(false);
            }
        }
    }

    // 7. Invasions & Alertes du Lotus (Catalyseur / Réacteur / Forma / Armes Wraith & Vandal)
    const activeInvasions = (ws.invasions || []).filter(inv => !inv.completed);
    if (isWorldAlertEnabled("invasionRare")) {
        const rareInv = activeInvasions.find(inv => {
            const rTypes = (inv.rewardTypes || []).map(x => String(x).toLowerCase());
            const txt = JSON.stringify([inv.attacker?.reward, inv.defender?.reward]).toLowerCase();
            return rTypes.includes("reactor") || rTypes.includes("catalyst") || rTypes.includes("forma") || rTypes.includes("exilus") ||
                txt.includes("cataly") || txt.includes("react") || txt.includes("réact") || txt.includes("forma") || txt.includes("exilus");
        });
        const rareAlert = (ws.alerts || []).find(al => {
            const txt = JSON.stringify(al.mission?.reward || {}).toLowerCase();
            return txt.includes("forma") || txt.includes("cataly") || txt.includes("react") || txt.includes("réact");
        });
        if (rareInv || rareAlert) {
            const sig = rareInv ? `invrare_${rareInv.id}` : `alrare_${rareAlert.id}`;
            if (canFire("invasionRare", sig)) {
                showWorldAlertToast(
                    "invasionRare",
                    "RÉCOMPENSE RARE EN DIRECT",
                    rareInv ? `Invasion Rare sur ${rareInv.node} !` : `Alerte du Lotus sur ${rareAlert.mission?.node || "Secteur"} !`,
                    "Catalyseur / Réacteur Orokin ou Forma disponible en récompense de mission.",
                    "invasions"
                );
                playAlertNotificationSound(false);
            }
        }
    }

    if (isWorldAlertEnabled("invasionWeapon")) {
        const weapInv = activeInvasions.find(inv => {
            const rTypes = (inv.rewardTypes || []).map(x => String(x).toLowerCase());
            const txt = JSON.stringify([inv.attacker?.reward, inv.defender?.reward]).toLowerCase();
            return rTypes.includes("vandal") || rTypes.includes("wraith") || rTypes.includes("sheev") ||
                txt.includes("vandal") || txt.includes("wraith") || txt.includes("sheev");
        });
        if (weapInv) {
            if (canFire("invasionWeapon", `invweap_${weapInv.id}`)) {
                showWorldAlertToast(
                    "invasionWeapon",
                    "INVASION ARME WRAITH / VANDAL",
                    `Pièces d'arme disponibles sur ${weapInv.node} !`,
                    "Pièces d'armes d'invasion échangeables contre du Platinum sur Warframe Market.",
                    "invasions"
                );
                playAlertNotificationSound(false);
            }
        }
    }

    // 8. Route de l'Acier (Teshin Forma Umbra) & Arbitrage S-Tier
    if (isWorldAlertEnabled("steelpathUmbra")) {
        const curSpName = String(ws.steelPath?.currentReward?.name || "").toLowerCase();
        if (curSpName.includes("umbra")) {
            if (canFire("steelpathUmbra", `sp_umbra_${ws.steelPath?.expiry || "wk"}`)) {
                showWorldAlertToast(
                    "steelpathUmbra",
                    "HONNEURS DE LA ROUTE DE L'ACIER",
                    "Teshin propose le Schéma Forma Umbra cette semaine !",
                    "Coût : 150 Essences d'Acier — Ne manquez pas cette rotation.",
                    "invasions"
                );
                playAlertNotificationSound(false);
            }
        }
    }

    if (isWorldAlertEnabled("arbiEndurance")) {
        const liveArbi = resolveLiveArbitration(ws.arbitration);
        const mType = normalizeSearch(liveArbi.type || "");
        if (mType.includes("survie") || mType.includes("survival") || mType.includes("defense") || mType.includes("excavation") || mType.includes("perturbation") || mType.includes("disruption")) {
            if (canFire("arbiEndurance", `arbi_${liveArbi.expiry.slice(0, 13)}`)) {
                showWorldAlertToast(
                    "arbiEndurance",
                    "ARBITRAGE S-TIER (ESSENCE VITUS)",
                    `Arbitrage : ${liveArbi.type} sur ${liveArbi.node} (${liveArbi.enemy})`,
                    `Bonus : ${liveArbi.bonus} — Parfait pour farmer les Mods Galvanisés !`,
                    "invasions"
                );
                playAlertNotificationSound(false);
            }
        }
    }
}

function renderWorldAlertsPanelHtml(filterCategory = "all") {
    const rules = filterCategory === "all"
        ? WORLD_ALERT_RULES
        : WORLD_ALERT_RULES.filter(r => r.category === filterCategory);
    const activeWorldCount = WORLD_ALERT_RULES.filter(r => isWorldAlertEnabled(r.id)).length;

    return `
        <div class="world-alerts-panel">
            <div class="world-alerts-header">
                <div>
                    <div class="world-alerts-title">
                        ${wfIcon("alert", "wf-icon-cyan")}
                        <span>Alertes Sonores de Cycles Planétaires & Fissures (${activeWorldCount} actives)</span>
                    </div>
                    <div class="world-alerts-sub">
                        Activez les notifications sonores automatiques pour être prévenu en jeu sans avoir à surveiller le compteur.
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <select class="select-sm" data-select-world-sound="1" title="Choisir le son de notification">
                        <option value="default" ${State.alertSoundChoice !== "bell" ? "selected" : ""}>🔔 Son 1 : Classique</option>
                        <option value="bell" ${State.alertSoundChoice === "bell" ? "selected" : ""}>🔔 Son 2 : Cloche (Bell)</option>
                    </select>
                    <button class="btn-secondary btn-sm" data-test-world-sound="1">${wfIcon("sound", "wf-icon-sm wf-icon-cyan")} Tester le son</button>
                </div>
            </div>
            <div class="world-alerts-grid">
                ${rules.map(r => {
                    const active = isWorldAlertEnabled(r.id);
                    return `
                        <button class="world-alert-toggle-card ${active ? "active" : ""}" data-toggle-world-alert="${escapeHtml(r.id)}">
                            <div class="world-alert-card-left">
                                ${wfIcon(r.icon, active ? "wf-icon-cyan" : "")}
                                <div>
                                    <div class="world-alert-card-title">${escapeHtml(r.title)}</div>
                                    <div class="world-alert-card-desc">${escapeHtml(r.desc)}</div>
                                </div>
                            </div>
                            <span class="toolbar-pill ${active ? "active" : ""}" style="pointer-events:none;flex-shrink:0;">
                                <span class="dot"></span>
                                <span>${active ? "Activé" : "Off"}</span>
                            </span>
                        </button>
                    `;
                }).join("")}
            </div>
        </div>
    `;
}

function bindWorldAlertsPanelEvents(container) {
    container.querySelectorAll("[data-toggle-world-alert]").forEach(btn => {
        btn.addEventListener("click", () => {
            toggleWorldAlert(btn.dataset.toggleWorldAlert);
            renderActiveTabPage();
        });
    });
    container.querySelectorAll("[data-test-world-sound]").forEach(btn => {
        btn.addEventListener("click", () => playAlertNotificationSound(true));
    });
    container.querySelectorAll("[data-select-world-sound]").forEach(sel => {
        sel.addEventListener("change", () => {
            setAlertSoundChoice(sel.value, true);
        });
    });
}

function isItemFavorite(slug) {
    return State.favoriteItems.includes(slug);
}

function updateFavCountBadge() {
    const el = document.getElementById("fav-count-badge");
    if (el) el.textContent = State.favoriteItems.length;
}

function toggleFavoriteItem(slug) {
    if (!slug) return;
    const itemUrl = `https://warframe.market/items/${slug}`;
    const idx = State.favoriteItems.indexOf(slug);
    if (idx >= 0) {
        State.favoriteItems.splice(idx, 1);
        State.bookmarks = State.bookmarks.filter(b => b.url !== itemUrl);
    } else {
        State.favoriteItems.unshift(slug);
        if (!State.bookmarks.some(b => b.url === itemUrl)) {
            const catItem = State.itemsBySlug.get(slug);
            State.bookmarks.push({
                title: catItem ? getItemName(catItem) : slug,
                url: itemUrl,
                icon: catItem ? getItemThumb(catItem) : DEFAULT_FAVICON
            });
        }
    }
    localStorage.setItem("wm_fav_items", JSON.stringify(State.favoriteItems));
    saveBookmarks();
    renderBookmarksBar();
    updateFavCountBadge();
    syncBrowserChromeToActiveTab();

    // Si l'onglet actif est la page Favoris, recharger ses données
    const tab = getActiveTab();
    if (tab) {
        const parsed = parseWfmUrl(tab.url);
        if (parsed.route === "favorites") {
            navigateTab(tab.id, tab.url, { pushHistory: false, forceRefresh: false });
        } else {
            renderActiveTabPage();
        }
    }
}

/* ==================== SYSTÈME D'ALERTES DE PRIX (PRICE SNIPER) & SON ==================== */

let alertAudioInstance = null;

function getAlertSoundFile(choice = State.alertSoundChoice) {
    return choice === "bell" ? "notification-bell.wav" : "notification.mp3";
}

function getAlertSoundLabel(choice = State.alertSoundChoice) {
    return choice === "bell" ? "Son 2 : Cloche (Bell)" : "Son 1 : Classique";
}

function setAlertSoundChoice(choice, preview = true) {
    const clean = choice === "bell" ? "bell" : "default";
    State.alertSoundChoice = clean;
    localStorage.setItem("wm_alert_sound_choice", clean);
    document.querySelectorAll(".btn-sound-choice").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.soundChoice === clean);
    });
    document.querySelectorAll("[data-select-world-sound], #select-alerts-sound-choice").forEach(sel => {
        if (sel.value !== clean) sel.value = clean;
    });
    if (preview) {
        playAlertNotificationSound(true, clean);
    }
}

function playAlertNotificationSound(forcePlay = false, overrideChoice = null) {
    if (!forcePlay && !State.alertSoundEnabled) return;
    const vol = Math.max(0, Math.min(1, (Number(State.alertVolume) || 0) / 100));
    if (vol <= 0 && !forcePlay) return;

    const soundFile = getAlertSoundFile(overrideChoice || State.alertSoundChoice);

    const tryPlaySrc = (src, onFail) => {
        try {
            if (!alertAudioInstance || alertAudioInstance.dataset?.src !== src) {
                alertAudioInstance = new Audio(src);
                alertAudioInstance.dataset = { src };
            }
            alertAudioInstance.pause();
            alertAudioInstance.currentTime = 0;
            alertAudioInstance.volume = vol > 0 ? vol : 0.8;
            const p = alertAudioInstance.play();
            if (p && typeof p.catch === "function") {
                p.catch(() => {
                    if (onFail) onFail();
                });
            }
        } catch (e) {
            if (onFail) onFail();
        }
    };

    tryPlaySrc(soundFile, () => {
        tryPlaySrc(`http://127.0.0.1:8484/${soundFile}`);
    });
}

function savePriceAlerts() {
    localStorage.setItem("wm_price_alerts", JSON.stringify(State.priceAlerts));
    updateAlertCountBadge();
}

function updateAlertCountBadge() {
    const el = document.getElementById("alert-count-badge");
    if (el) {
        const activePriceCount = State.priceAlerts.filter(a => a.enabled !== false).length;
        const activeWorldCount = WORLD_ALERT_RULES.filter(r => isWorldAlertEnabled(r.id)).length;
        const totalActive = activePriceCount + activeWorldCount;
        el.textContent = String(totalActive);
    }
}

function getAlertForSlug(slug) {
    return State.priceAlerts.find(a => a.slug === slug) || null;
}

function upsertPriceAlert(slug, targetPrice, statusMode = "ingame") {
    const cleanPrice = Math.max(1, Math.round(Number(targetPrice) || 1));
    const existing = getAlertForSlug(slug);
    if (existing) {
        existing.targetPrice = cleanPrice;
        existing.statusMode = statusMode || existing.statusMode || "ingame";
        existing.enabled = true;
        existing.notifiedOnce = false;
        existing.lastNotifiedAt = 0;
    } else {
        State.priceAlerts.unshift({
            id: Date.now() + "_" + Math.random().toString(36).slice(2, 6),
            slug,
            targetPrice: cleanPrice,
            statusMode: statusMode || "ingame",
            enabled: true,
            notifiedOnce: false,
            lastNotifiedAt: 0,
            lastBestPrice: null,
            lastBestSeller: null,
            lastCheckedAt: null
        });
    }
    savePriceAlerts();
    // Lancer une vérification immédiate
    checkSinglePriceAlert( getAlertForSlug(slug), true ).then(() => {
        renderActiveTabPage();
    });
}

function removePriceAlert(slug) {
    State.priceAlerts = State.priceAlerts.filter(a => a.slug !== slug);
    savePriceAlerts();
    const toastEl = document.querySelector(`.price-alert-toast[data-toast-slug="${CSS.escape(slug)}"]`);
    if (toastEl) toastEl.remove();
    renderActiveTabPage();
}

function togglePriceAlertActive(slug) {
    const alertObj = getAlertForSlug(slug);
    if (!alertObj) return;
    alertObj.enabled = alertObj.enabled === false ? true : false;
    if (alertObj.enabled) {
        alertObj.notifiedOnce = false;
        alertObj.lastNotifiedAt = 0;
    } else {
        const toastEl = document.querySelector(`.price-alert-toast[data-toast-slug="${CSS.escape(slug)}"]`);
        if (toastEl) toastEl.remove();
    }
    savePriceAlerts();
    if (alertObj.enabled) {
        checkSinglePriceAlert(alertObj, true).then(() => renderActiveTabPage());
    } else {
        renderActiveTabPage();
    }
}

async function checkSinglePriceAlert(alertObj, forceRefresh = true) {
    if (!alertObj || alertObj.enabled === false) return false;
    try {
        const res = await apiFetch(`/api/v2/orders/item/${alertObj.slug}`, forceRefresh);
        const orders = Array.isArray(res.data) ? res.data : [];
        const validSells = orders.filter(o => {
            if (!o.visible || o.type !== "sell") return false;
            const st = o.user?.status || "offline";
            if (alertObj.statusMode === "online") return st === "ingame" || st === "online";
            return st === "ingame";
        }).sort((a, b) => a.platinum - b.platinum);

        alertObj.lastCheckedAt = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

        if (validSells.length > 0) {
            const best = validSells[0];
            alertObj.lastBestPrice = best.platinum;
            alertObj.lastBestSeller = {
                ingameName: best.user?.ingameName || "Tenno",
                slug: best.user?.slug || best.user?.ingameName || "",
                reputation: best.user?.reputation ?? 0,
                status: best.user?.status || "ingame",
                rank: best.rank,
                quantity: best.quantity || 1
            };

            if (best.platinum <= alertObj.targetPrice) {
                const now = Date.now();
                const intervalMs = Math.max(5, Number(State.alertRepeatInterval) || 30) * 1000;
                const shouldNotify = !alertObj.notifiedOnce || (State.alertRepeat && (now - (alertObj.lastNotifiedAt || 0) >= intervalMs - 500));

                if (shouldNotify) {
                    alertObj.notifiedOnce = true;
                    alertObj.lastNotifiedAt = now;
                    savePriceAlerts();
                    showPriceAlertToast(alertObj);
                    playAlertNotificationSound(false);
                    return true;
                }
            } else {
                // Si le prix est remonté au-dessus de la cible, réarmer l'alerte pour la prochaine baisse
                alertObj.notifiedOnce = false;
            }
        } else {
            alertObj.lastBestPrice = null;
            alertObj.lastBestSeller = null;
            alertObj.notifiedOnce = false;
        }
        savePriceAlerts();
    } catch (e) {
        console.warn("Erreur scan alerte:", alertObj.slug, e);
    }
    return false;
}

async function checkAllPriceAlerts(forceRefresh = true) {
    if (State.sniperScanning) return;
    const activeAlerts = State.priceAlerts.filter(a => a.enabled !== false);
    if (!activeAlerts.length) return;

    State.sniperScanning = true;
    State.lastSniperScanTime = Date.now();
    try {
        for (const alertObj of activeAlerts) {
            await checkSinglePriceAlert(alertObj, forceRefresh);
        }
        const tab = getActiveTab();
        if (tab && parseWfmUrl(tab.url).route === "alerts") {
            renderActiveTabPage();
        }
    } finally {
        State.sniperScanning = false;
    }
}

function showPriceAlertToast(alertObj) {
    const container = document.getElementById("price-alert-toast-container");
    if (!container) return;

    const item = State.itemsBySlug.get(alertObj.slug);
    const itemName = item ? getItemName(item) : alertObj.slug;
    const itemEnName = item ? getItemEnName(item) : itemName;
    const thumb = item ? getItemThumb(item) : DEFAULT_FAVICON;
    const seller = alertObj.lastBestSeller || {};
    const price = alertObj.lastBestPrice;
    const itemUrl = `https://warframe.market/items/${alertObj.slug}`;

    let toast = container.querySelector(`.price-alert-toast[data-toast-slug="${CSS.escape(alertObj.slug)}"]`);
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "price-alert-toast";
        toast.dataset.toastSlug = alertObj.slug;
        container.prepend(toast);
    } else {
        // Animation de pulsation lors d'une répétition
        toast.classList.remove("toast-pulse");
        void toast.offsetWidth;
        toast.classList.add("toast-pulse");
    }

    toast.innerHTML = `
        <div class="toast-header">
            <span class="toast-badge">${wfIcon("target", "wf-icon-sm")} ALERTE DE PRIX ATTEINTE !</span>
            <div style="display:flex;align-items:center;gap:6px;">
                <button class="toast-mute-btn" data-toast-pause="${escapeHtml(alertObj.slug)}" title="Mettre cette alerte en pause (arrêter les répétitions)">${wfIcon("pause", "wf-icon-sm")} Pause</button>
                <button class="chrome-icon-btn toast-close-btn" data-toast-close="${escapeHtml(alertObj.slug)}" title="Fermer la notification">✕</button>
            </div>
        </div>
        <div class="toast-body">
            <img class="toast-thumb" src="${escapeHtml(thumb)}" alt="" onerror="this.src='${DEFAULT_FAVICON}'" />
            <div class="toast-info">
                <div class="toast-item-title" data-toast-open="${escapeHtml(itemUrl)}">${escapeHtml(itemName)}</div>
                <div class="toast-price-line">
                    Vendu à <strong style="color:var(--sell-color);font-size:15px;">${price} Platinum</strong>
                    <span style="color:var(--text-muted);font-size:11.5px;">(Cible : ≤ ${alertObj.targetPrice}p)</span>
                </div>
                <div class="toast-seller-line">
                    Vendeur : <strong>${escapeHtml(seller.ingameName || "Tenno")}</strong> (${wfIcon("rep", "wf-icon-sm wf-icon-gold")} ${seller.reputation ?? 0})
                </div>
            </div>
        </div>
        <div class="toast-actions">
            <button class="btn-secondary btn-sm" data-toast-open="${escapeHtml(itemUrl)}">Voir l'item</button>
            <button class="btn-trade sell"
                data-toast-whisper="1"
                data-whisper-user="${escapeHtml(seller.ingameName || "")}"
                data-whisper-item-en="${escapeHtml(itemEnName)}"
                data-whisper-item-fr="${escapeHtml(itemName)}"
                data-whisper-price="${price}"
                data-whisper-type="sell"
                data-whisper-rank="${seller.rank ?? ""}"
                data-whisper-maxrank="${item?.maxRank ?? ""}">
                Acheter ${price}p (/w)
            </button>
        </div>
    `;

    toast.querySelector("[data-toast-close]")?.addEventListener("click", () => {
        toast.remove();
    });
    toast.querySelector("[data-toast-pause]")?.addEventListener("click", () => {
        togglePriceAlertActive(alertObj.slug);
        toast.remove();
    });
    toast.querySelectorAll("[data-toast-open]").forEach(el => {
        el.addEventListener("click", () => {
            navigateTab(State.activeTabId, el.dataset.toastOpen);
        });
    });
    toast.querySelector("[data-toast-whisper]")?.addEventListener("click", (e) => {
        const btn = e.currentTarget;
        triggerWhisper({
            user: btn.dataset.whisperUser,
            itemEn: btn.dataset.whisperItemEn,
            itemFr: btn.dataset.whisperItemFr,
            price: btn.dataset.whisperPrice,
            type: btn.dataset.whisperType,
            rank: btn.dataset.whisperRank,
            maxRank: btn.dataset.whisperMaxrank
        });
    });
}

function startPriceSniperScheduler() {
    setInterval(() => {
        if (!State.catalogReady) return;
        const activeAlerts = State.priceAlerts.filter(a => a.enabled !== false);
        if (!activeAlerts.length) return;
        const intervalMs = Math.max(5, Number(State.alertRepeatInterval) || 30) * 1000;
        if (Date.now() - State.lastSniperScanTime >= intervalMs) {
            checkAllPriceAlerts(true);
        }
    }, 1000);

    // Vérification périodique des Alertes de Cycles Planétaires & Fissures (toutes les 15s)
    setInterval(() => {
        checkWorldstateAlerts(false);
    }, 15000);
}

/* ==================== UTILITAIRES API & FORMATAGE ==================== */

async function apiFetch(path, forceRefresh = false) {
    const headers = {
        "X-WM-Language": State.lang,
        "X-WM-Platform": State.platform,
        "X-WM-Crossplay": State.crossplay ? "true" : "false"
    };
    if (forceRefresh) {
        headers["X-WM-Refresh"] = "true";
    }

    // 1. Si ouvert via le serveur local (http://127.0.0.1:8484)
    if (window.location.protocol.startsWith("http")) {
        try {
            const res = await fetch(path, { headers });
            if (res.ok) return await res.json();
        } catch (e) {}
    }

    // 2. Si l'utilisateur a double-cliqué sur index.html (file://), essayer d'abord le serveur local sur 127.0.0.1:8484
    try {
        const localRes = await fetch(`http://127.0.0.1:8484${path}`, { headers });
        if (localRes.ok) return await localRes.json();
    } catch (e) {}

    // 3. Fallback sans serveur local (si index.html est ouvert tout seul sans WireMarket.exe)
    const remotePath = path.replace(/^\/api/, "");
    const targetUrl = `https://api.warframe.market${remotePath}`;
    const proxyUrls = [
        `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    ];

    for (const pUrl of proxyUrls) {
        try {
            const pRes = await fetch(pUrl);
            if (pRes.ok) return await pRes.json();
        } catch (e) {}
    }

    throw new Error(`Impossible de joindre l'API warframe.market (${path})`);
}

function assetUrl(relPath) {
    if (!relPath) return DEFAULT_FAVICON;
    if (relPath.startsWith("http") || relPath.startsWith("data:")) return relPath;
    const clean = relPath.replace(/^\/+/, "");
    if (window.location.protocol === "file:") {
        return `https://warframe.market/static/assets/${clean}`;
    }
    return `/assets/${clean}`;
}

function getItemName(item, lang = State.lang) {
    if (!item) return "Item inconnu";
    if (item.i18n) {
        if (item.i18n[lang] && item.i18n[lang].name) return item.i18n[lang].name;
        if (item.i18n.fr && item.i18n.fr.name) return item.i18n.fr.name;
        if (item.i18n.en && item.i18n.en.name) return item.i18n.en.name;
    }
    return item.name || item.slug || "Item";
}

function getItemEnName(item) {
    if (!item) return "";
    if (item.i18n && item.i18n.en && item.i18n.en.name) return item.i18n.en.name;
    return getItemName(item, "en");
}

function getItemThumb(item) {
    if (!item || !item.i18n) return DEFAULT_FAVICON;
    const loc = item.i18n[State.lang] || item.i18n.en || item.i18n.fr || Object.values(item.i18n)[0];
    if (!loc) return DEFAULT_FAVICON;
    return assetUrl(loc.thumb || loc.icon);
}

function getItemIcon(item) {
    if (!item || !item.i18n) return DEFAULT_FAVICON;
    const loc = item.i18n[State.lang] || item.i18n.en || item.i18n.fr || Object.values(item.i18n)[0];
    if (!loc) return DEFAULT_FAVICON;
    return assetUrl(loc.icon || loc.thumb);
}

function getItemDescription(item) {
    if (!item || !item.i18n) return "";
    const loc = item.i18n[State.lang] || item.i18n.fr || item.i18n.en;
    return (loc && loc.description) ? loc.description.replace(/<[^>]*>/g, "") : "";
}

function getItemWikiLink(item) {
    if (!item || !item.i18n) return "https://warframe.fandom.com";
    const loc = item.i18n[State.lang] || item.i18n.en;
    return (loc && loc.wikiLink) ? loc.wikiLink : "https://warframe.fandom.com";
}

function escapeHtml(str) {
    return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function normalizeSearch(str) {
    return String(str || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function saveBookmarks() {
    localStorage.setItem("wm_bookmarks", JSON.stringify(State.bookmarks));
}

function recordHistory(title, url, icon = DEFAULT_FAVICON) {
    State.history = State.history.filter(h => h.url !== url);
    State.history.unshift({
        title,
        url,
        icon,
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    });
    if (State.history.length > 80) State.history.length = 80;
    localStorage.setItem("wm_history", JSON.stringify(State.history));
    if (!document.getElementById("side-drawer").classList.contains("hidden")) {
        renderDrawer();
    }
}

/* ==================== CHARGEMENT DU CATALOGUE (3893 ITEMS) ==================== */

async function loadItemsCatalog() {
    const statusEl = document.getElementById("status-items-loaded");
    const connEl = document.getElementById("status-connection");
    try {
        statusEl.textContent = "Synchronisation du catalogue warframe.market...";
        const json = await apiFetch("/api/v2/items");
        const items = json.data || [];
        State.itemsList = items;
        State.itemsById.clear();
        State.itemsBySlug.clear();

        for (const item of items) {
            const frName = item.i18n?.fr?.name || "";
            const enName = item.i18n?.en?.name || "";
            item._searchKey = normalizeSearch(`${frName} ${enName} ${item.slug} ${(item.tags || []).join(" ")}`);
            State.itemsById.set(item.id, item);
            State.itemsBySlug.set(item.slug, item);
        }

        State.catalogReady = true;
        document.getElementById("catalog-count-badge").textContent = items.length;
        statusEl.textContent = `${items.length} items Warframe indexés (FR/EN)`;
        connEl.className = "status-indicator online";
        connEl.textContent = "● API warframe.market connectée";

        // Mettre à jour les icônes des favoris si ce sont des items
        for (const bm of State.bookmarks) {
            const m = bm.url.match(/warframe\.market\/items\/([a-z0-9_]+)/i);
            if (m && State.itemsBySlug.has(m[1])) {
                bm.icon = getItemThumb(State.itemsBySlug.get(m[1]));
            }
        }
        renderBookmarksBar();
    } catch (err) {
        console.error(err);
        connEl.className = "status-indicator error";
        connEl.textContent = "● Erreur de connexion API";
        statusEl.textContent = "Impossible de joindre api.warframe.market";
    }
}

function searchCatalog(query, limit = 12) {
    const q = normalizeSearch(query);
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    const scored = [];

    for (const item of State.itemsList) {
        const key = item._searchKey || "";
        let matchAll = true;
        for (const t of tokens) {
            if (!key.includes(t)) {
                matchAll = false;
                break;
            }
        }
        if (!matchAll) continue;

        const nameNorm = normalizeSearch(getItemName(item));
        const enNorm = normalizeSearch(getItemEnName(item));
        let score = 0;
        if (nameNorm === q || enNorm === q || item.slug === q) score += 100;
        else if (nameNorm.startsWith(q) || enNorm.startsWith(q)) score += 50;
        if ((item.tags || []).includes("set")) score += 12;
        if ((item.tags || []).includes("prime")) score += 6;

        scored.push({ item, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(s => s.item);
}

/* ==================== MOTEUR D'ONGLETS DU NAVIGATEUR ==================== */

function createTab(url = "https://warframe.market/", switchTo = true) {
    const id = State.nextTabId++;
    const tab = {
        id,
        url,
        title: "Nouvel onglet - Warframe Market",
        icon: DEFAULT_FAVICON,
        loading: false,
        history: [url],
        historyIndex: 0,
        // État des filtres propres à l'onglet
        viewState: {
            subtab: "orders",        // "orders" | "statistics"
            statusFilter: "ingame",  // "ingame" | "online" | "all"
            rankFilter: "all",       // "all" | "0" | "max"
            sellerQuery: "",
            sortBy: "price_asc",
            statsRange: "48hours",   // "48hours" | "90days"
            catalogCategory: "all",
            catalogQuery: ""
        },
        cachedData: {}
    };
    State.tabs.push(tab);
    renderTabsBar();
    if (switchTo) {
        activateTab(id);
    }
    navigateTab(id, url, { pushHistory: false });
    return tab;
}

function closeTab(id, event) {
    if (event) event.stopPropagation();
    if (id === "hub") return; // L'onglet logo WireMarket est permanent et ne peut pas être fermé
    if (State.tabs.length <= 1) {
        // Si c'est le dernier onglet standard, retour à l'accueil
        navigateTab(State.tabs[0].id, "https://warframe.market/");
        return;
    }
    const idx = State.tabs.findIndex(t => t.id === id);
    if (idx === -1) return;
    const wasActive = (State.activeTabId === id);
    State.tabs.splice(idx, 1);
    if (wasActive) {
        const nextTab = State.tabs[Math.max(0, idx - 1)];
        State.activeTabId = nextTab.id;
        State.lastRegularTabId = nextTab.id;
        syncBrowserChromeToActiveTab();
        renderActiveTabPage();
    }
    renderTabsBar();
}

function activateTab(id) {
    if (id === "hub") {
        State.activeTabId = "hub";
        renderTabsBar();
        syncBrowserChromeToActiveTab();
        if (!State.hubTab.cachedData.worldstate && !State.hubTab.loading) {
            loadTabRouteData(State.hubTab, { route: "worldstate", params: new URLSearchParams() }, false);
        } else {
            renderActiveTabPage();
        }
        return;
    }
    const tab = State.tabs.find(t => t.id === id);
    if (!tab) return;
    State.activeTabId = id;
    State.lastRegularTabId = id;
    renderTabsBar();
    syncBrowserChromeToActiveTab();
    renderActiveTabPage();
}

function getActiveTab() {
    if (State.activeTabId === "hub") return State.hubTab;
    return State.tabs.find(t => t.id === State.activeTabId) || State.tabs[0] || State.hubTab;
}

function renderTabsBar() {
    const brandTab = document.getElementById("app-brand-tab");
    if (brandTab) {
        const isHubActive = State.activeTabId === "hub";
        brandTab.classList.toggle("active", isHubActive);
        brandTab.setAttribute("aria-selected", isHubActive ? "true" : "false");
    }

    const container = document.getElementById("tabs-container");
    container.classList.toggle("tabs-crowded", State.tabs.length >= 8);
    container.classList.toggle("tabs-very-crowded", State.tabs.length >= 18);
    container.innerHTML = State.tabs.map(tab => {
        const isActive = tab.id === State.activeTabId;
        const iconHtml = tab.loading
            ? `<div class="tab-spinner"></div>`
            : `<img class="tab-favicon" src="${escapeHtml(tab.icon)}" alt="" onerror="this.src='${DEFAULT_FAVICON}'"/>`;
        return `
            <div class="browser-tab ${isActive ? "active" : ""}" data-tab-id="${tab.id}" title="${escapeHtml(tab.title)}\n${escapeHtml(tab.url)}">
                ${iconHtml}
                <span class="tab-title">${escapeHtml(tab.title)}</span>
                <button class="tab-close" data-close-tab="${tab.id}" title="Fermer l'onglet (Ctrl+W)">✕</button>
            </div>
        `;
    }).join("");

    container.querySelectorAll(".browser-tab").forEach(el => {
        const id = Number(el.dataset.tabId);
        el.addEventListener("click", () => activateTab(id));
        el.addEventListener("auxclick", (e) => {
            if (e.button === 1) closeTab(id, e);
        });
    });

    container.querySelectorAll("[data-close-tab]").forEach(btn => {
        btn.addEventListener("click", (e) => closeTab(Number(btn.dataset.closeTab), e));
    });
}

function syncBrowserChromeToActiveTab() {
    const tab = getActiveTab();
    if (!tab) return;
    const isHub = State.activeTabId === "hub";

    // Basculer la barre supérieure : masquer la barre du Market quand on est dans l'onglet Hub (Rotations & Marchand)
    // et afficher à la place la barre de navigation dédiée aux 3 vues séparées (Planètes, Warframes & Armes, Marchand)
    const wfmBanner = document.getElementById("wfm-top-banner");
    const hubBanner = document.getElementById("wm-hub-top-banner");
    const bookmarksBar = document.getElementById("bookmarks-bar");
    if (wfmBanner) wfmBanner.classList.toggle("hidden", isHub);
    if (hubBanner) hubBanner.classList.toggle("hidden", !isHub);
    if (bookmarksBar) bookmarksBar.classList.toggle("hidden", isHub);

    if (isHub) {
        const currentSec = State.hubTab.viewState.hubSection || "planets";
        document.querySelectorAll("[data-hub-sec]").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.hubSec === currentSec);
        });
    }

    const addrInput = document.getElementById("address-input");
    if (document.activeElement !== addrInput) {
        addrInput.value = tab.url;
    }
    document.getElementById("status-url-preview").textContent = tab.url;
    document.getElementById("btn-back").disabled = tab.historyIndex <= 0;
    document.getElementById("btn-forward").disabled = tab.historyIndex >= tab.history.length - 1;

    // État du bouton favori
    const isBookmarked = State.bookmarks.some(b => b.url === tab.url);
    document.getElementById("btn-bookmark-toggle").classList.toggle("bookmarked", isBookmarked);

    // Surligner le lien actif dans la bannière interne Warframe Market
    document.querySelectorAll(".wfm-nav-link:not(.hub-nav-link)").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.nav === tab.url);
    });
}

/* ==================== ROUTEUR D'URL WARFRAME.MARKET ==================== */

function normalizeInputToUrl(rawInput) {
    const val = String(rawInput || "").trim();
    if (!val) return "https://warframe.market/";

    // Si c'est déjà une URL warframe.market
    if (val.startsWith("https://warframe.market") || val.startsWith("http://warframe.market")) {
        return val.replace(/^http:/, "https:");
    }
    if (val.startsWith("warframe.market")) {
        return `https://${val}`;
    }
    if (val.startsWith("/")) {
        return `https://warframe.market${val}`;
    }

    // Si le texte correspond exactement à un slug d'item
    const slugCandidate = val.toLowerCase().replace(/\s+/g, "_");
    if (State.itemsBySlug.has(slugCandidate)) {
        return `https://warframe.market/items/${slugCandidate}`;
    }

    // Sinon, chercher le meilleur item correspondant dans le catalogue
    const matches = searchCatalog(val, 1);
    if (matches.length > 0) {
        return `https://warframe.market/items/${matches[0].slug}`;
    }

    // Sinon ouvrir le catalogue filtré sur la recherche
    return `https://warframe.market/items?q=${encodeURIComponent(val)}`;
}

function parseWfmUrl(url) {
    let clean = url.replace(/^https?:\/\/warframe\.market/i, "");
    if (!clean.startsWith("/")) clean = "/" + clean;
    const [pathname, queryString] = clean.split("?");
    const params = new URLSearchParams(queryString || "");

    if (pathname === "/" || pathname === "") {
        return { route: "home", params };
    }
    if (pathname === "/recent") {
        return { route: "recent", params };
    }
    if (pathname === "/favorites" || pathname === "/favoris") {
        return { route: "favorites", params };
    }
    if (pathname === "/cart" || pathname === "/panier") {
        return { route: "cart", params };
    }
    if (pathname === "/alerts" || pathname === "/alertes") {
        return { route: "alerts", params };
    }
    if (pathname === "/tools/ducats" || pathname === "/ducats") {
        return { route: "ducats", params };
    }
    if (pathname === "/contracts" || pathname === "/riven" || pathname === "/auctions") {
        return { route: "contracts", params };
    }
    if (pathname === "/worldstate" || pathname.startsWith("/worldstate/") || pathname === "/rotations" || pathname === "/baro" || pathname === "/fissures" || pathname === "/invasions") {
        let hubSec = null;
        if (pathname === "/baro" || pathname === "/worldstate/baro") hubSec = "baro";
        else if (pathname === "/fissures" || pathname === "/worldstate/fissures") hubSec = "fissures";
        else if (pathname === "/invasions" || pathname === "/worldstate/invasions") hubSec = "invasions";
        else if (pathname === "/worldstate/duviri") hubSec = "duviri";
        else if (pathname === "/worldstate/planets") hubSec = "planets";
        return { route: "worldstate", hubSec, params };
    }
    if (pathname === "/items" || pathname === "/items/") {
        return { route: "catalog", params };
    }

    const itemStatsMatch = pathname.match(/^\/items\/([a-z0-9_]+)\/statistics\/?$/i);
    if (itemStatsMatch) {
        return { route: "item", slug: itemStatsMatch[1].toLowerCase(), subtab: "statistics", params };
    }

    const itemMatch = pathname.match(/^\/items\/([a-z0-9_]+)\/?$/i);
    if (itemMatch) {
        return { route: "item", slug: itemMatch[1].toLowerCase(), subtab: "orders", params };
    }

    const profileMatch = pathname.match(/^\/(?:profile|user)\/([^\/]+)\/?$/i);
    if (profileMatch) {
        return { route: "profile", slug: decodeURIComponent(profileMatch[1]), params };
    }

    return { route: "home", params };
}

async function navigateTab(tabId, rawUrl, options = { pushHistory: true, forceRefresh: false }) {
    const url = normalizeInputToUrl(rawUrl);
    const parsed = parseWfmUrl(url);

    // Si on navigue vers /worldstate, activer directement l'onglet permanent WireMarket Hub
    if (parsed.route === "worldstate") {
        State.activeTabId = "hub";
        if (parsed.hubSec) {
            State.hubTab.viewState.hubSection = parsed.hubSec;
        }
        const sec = State.hubTab.viewState.hubSection || "planets";
        State.hubTab.url = `https://warframe.market/worldstate/${sec}`;
        renderTabsBar();
        syncBrowserChromeToActiveTab();
        await loadTabRouteData(State.hubTab, parsed, options.forceRefresh);
        return;
    }

    // Si l'utilisateur clique sur un item ou une autre page depuis l'onglet permanent Hub,
    // ouvrir/naviguer dans l'onglet de marché actif afin de ne jamais remplacer l'onglet Hub WireMarket
    let tab = (tabId === "hub") ? null : State.tabs.find(t => t.id === tabId);
    if (!tab) {
        tab = State.tabs.find(t => t.id === State.lastRegularTabId) || State.tabs[0];
        if (!tab) {
            createTab(url, true);
            return;
        }
        State.activeTabId = tab.id;
        State.lastRegularTabId = tab.id;
        renderTabsBar();
    }

    tab.url = url;

    if (options.pushHistory) {
        tab.history = tab.history.slice(0, tab.historyIndex + 1);
        if (tab.history[tab.history.length - 1] !== url) {
            tab.history.push(url);
            tab.historyIndex = tab.history.length - 1;
        }
    }

    if (parsed.subtab) {
        tab.viewState.subtab = parsed.subtab;
    }
    if (parsed.params && parsed.params.get("q")) {
        tab.viewState.catalogQuery = parsed.params.get("q");
    }

    if (tab.id === State.activeTabId) {
        syncBrowserChromeToActiveTab();
    }

    await loadTabRouteData(tab, parsed, options.forceRefresh);
}

async function loadTabRouteData(tab, parsed, forceRefresh = false) {
    tab.loading = true;
    renderTabsBar();
    if (tab.id === State.activeTabId) {
        renderActiveTabPage();
    }

    try {
        // Attendre que le catalogue soit prêt si possible
        if (!State.catalogReady) {
            await loadItemsCatalog();
        }

        if (parsed.route === "worldstate") {
            tab.title = "WireMarket Hub — Rotations Warframe & Baro Ki'Teer";
            tab.icon = DEFAULT_FAVICON;
            const ws = await fetchWorldstateData(forceRefresh);
            tab.cachedData.worldstate = ws;
            // Lancer le chargement des prix Platinum de Baro Ki'Teer
            loadBaroPlatinumPrices(ws?.voidTrader?.inventory || [], forceRefresh);
        } else if (parsed.route === "home" || parsed.route === "recent") {
            tab.title = parsed.route === "recent"
                ? "Ordres Récents - Warframe Market"
                : "Warframe Market — Acheter et Vendre des items";
            tab.icon = DEFAULT_FAVICON;
            const recentRes = await apiFetch("/api/v2/orders/recent", forceRefresh);
            tab.cachedData.recentOrders = recentRes.data || [];
            recordHistory(tab.title, tab.url, tab.icon);
        } else if (parsed.route === "catalog") {
            tab.title = "Catalogue des Items - Warframe Market";
            tab.icon = DEFAULT_FAVICON;
            recordHistory(tab.title, tab.url, tab.icon);
        } else if (parsed.route === "favorites") {
            tab.title = `✦ Mes Items Favoris (${State.favoriteItems.length}) - Warframe Market`;
            tab.icon = DEFAULT_FAVICON;
            const favDetails = await Promise.all(State.favoriteItems.map(async (slug) => {
                const [itemRes, ordersRes] = await Promise.allSettled([
                    apiFetch(`/api/v2/item/${slug}`, forceRefresh),
                    apiFetch(`/api/v2/orders/item/${slug}`, forceRefresh)
                ]);
                const itemData = (itemRes.status === "fulfilled" && itemRes.value.data)
                    ? itemRes.value.data
                    : State.itemsBySlug.get(slug);
                const ordersData = (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value.data))
                    ? ordersRes.value.data
                    : [];
                return { slug, item: itemData, orders: ordersData };
            }));
            tab.cachedData.favoritesDetails = favDetails.filter(f => f.item);
            recordHistory(tab.title, tab.url, tab.icon);
        } else if (parsed.route === "cart") {
            tab.title = `Panier Multi-Achats (${State.shoppingCart.length}) - Warframe Market`;
            tab.icon = DEFAULT_FAVICON;
            const cartDetails = await Promise.all(State.shoppingCart.map(async (entry) => {
                const slug = entry.slug;
                const [itemRes, ordersRes] = await Promise.allSettled([
                    apiFetch(`/api/v2/item/${slug}`, forceRefresh),
                    apiFetch(`/api/v2/orders/item/${slug}`, forceRefresh)
                ]);
                const itemData = (itemRes.status === "fulfilled" && itemRes.value.data)
                    ? itemRes.value.data
                    : State.itemsBySlug.get(slug);
                const ordersData = (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value.data))
                    ? ordersRes.value.data
                    : [];
                return { entry, slug, qty: entry.qty, rank: entry.rank, item: itemData, orders: ordersData };
            }));
            tab.cachedData.cartDetails = cartDetails.filter(c => c.item);
            recordHistory(tab.title, tab.url, tab.icon);
        } else if (parsed.route === "alerts") {
            tab.title = `◈ Alertes de Prix (${State.priceAlerts.length}) - Warframe Market`;
            tab.icon = DEFAULT_FAVICON;
            if (forceRefresh && State.priceAlerts.length > 0) {
                await checkAllPriceAlerts(true);
            }
            recordHistory(tab.title, tab.url, tab.icon);
        } else if (parsed.route === "ducats") {
            tab.title = "Ducanator (Ducats / Platinum) - Warframe Market";
            tab.icon = DEFAULT_FAVICON;
            try {
                const ducatRes = await apiFetch("/api/v1/tools/ducats", forceRefresh);
                tab.cachedData.ducatsData = ducatRes.payload?.previous_hour || ducatRes.payload?.previous_day || [];
            } catch (e) {
                tab.cachedData.ducatsData = [];
            }
            recordHistory(tab.title, tab.url, tab.icon);
        } else if (parsed.route === "contracts") {
            const weaponSlug = tab.viewState.rivenWeapon || parsed.params?.get("weapon") || "torid";
            tab.viewState.rivenWeapon = weaponSlug;
            tab.title = `Contrats Riven (${weaponSlug}) - Warframe Market`;
            tab.icon = DEFAULT_FAVICON;
            if (!State.rivenWeapons) {
                const [wRes, aRes] = await Promise.allSettled([
                    apiFetch("/api/v2/riven/weapons"),
                    apiFetch("/api/v2/riven/attributes")
                ]);
                State.rivenWeapons = (wRes.status === "fulfilled" && wRes.value.data) ? wRes.value.data : [];
                State.rivenAttrsBySlug = new Map();
                if (aRes.status === "fulfilled" && Array.isArray(aRes.value.data)) {
                    for (const attr of aRes.value.data) {
                        State.rivenAttrsBySlug.set(attr.slug, attr);
                    }
                }
            }
            const aucRes = await apiFetch(`/api/v1/auctions/search?type=riven&weapon_url_name=${encodeURIComponent(weaponSlug)}&sort_by=price_asc`, forceRefresh);
            tab.cachedData.auctions = aucRes.payload?.auctions || [];
            recordHistory(tab.title, tab.url, tab.icon);
        } else if (parsed.route === "item") {
            const slug = parsed.slug;
            const catalogItem = State.itemsBySlug.get(slug);
            if (catalogItem) {
                tab.title = `${getItemName(catalogItem)} - Warframe Market`;
                tab.icon = getItemThumb(catalogItem);
            } else {
                tab.title = `${slug} - Warframe Market`;
            }

            // Charger en parallèle : détails de l'item, son set, ses ordres en direct, et ses statistiques
            const [itemRes, setRes, ordersRes, statsRes] = await Promise.allSettled([
                apiFetch(`/api/v2/item/${slug}`, forceRefresh),
                apiFetch(`/api/v2/item/${slug}/set`, forceRefresh),
                apiFetch(`/api/v2/orders/item/${slug}`, forceRefresh),
                apiFetch(`/api/v1/items/${slug}/statistics`, forceRefresh)
            ]);

            if (itemRes.status === "fulfilled" && itemRes.value.data) {
                tab.cachedData.item = itemRes.value.data;
                tab.title = `${getItemName(tab.cachedData.item)} - Warframe Market`;
                tab.icon = getItemThumb(tab.cachedData.item);
            } else if (catalogItem) {
                tab.cachedData.item = catalogItem;
            }

            tab.cachedData.setItems = (setRes.status === "fulfilled" && setRes.value.data?.items)
                ? setRes.value.data.items
                : [];

            tab.cachedData.orders = (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value.data))
                ? ordersRes.value.data
                : [];

            tab.cachedData.stats = (statsRes.status === "fulfilled" && statsRes.value.payload?.statistics_closed)
                ? statsRes.value.payload.statistics_closed
                : null;

            recordHistory(tab.title, tab.url, tab.icon);
        } else if (parsed.route === "profile") {
            const userSlug = parsed.slug;
            tab.title = `${userSlug} - Profil Warframe Market`;
            tab.icon = DEFAULT_FAVICON;

            const [userRes, userOrdersRes] = await Promise.allSettled([
                apiFetch(`/api/v2/user/${encodeURIComponent(userSlug)}`, forceRefresh),
                apiFetch(`/api/v2/orders/user/${encodeURIComponent(userSlug)}`, forceRefresh)
            ]);

            tab.cachedData.profileUser = (userRes.status === "fulfilled" && userRes.value.data)
                ? userRes.value.data
                : { ingameName: userSlug, slug: userSlug, status: "offline", reputation: 0 };

            tab.cachedData.profileOrders = (userOrdersRes.status === "fulfilled" && Array.isArray(userOrdersRes.value.data))
                ? userOrdersRes.value.data
                : [];

            if (tab.cachedData.profileUser?.ingameName) {
                tab.title = `${tab.cachedData.profileUser.ingameName} - Profil Warframe Market`;
            }
            recordHistory(tab.title, tab.url, tab.icon);
        }
    } catch (err) {
        console.error("Erreur chargement onglet:", err);
        tab.cachedData.error = err.message;
    } finally {
        tab.loading = false;
        renderTabsBar();
        if (tab.id === State.activeTabId) {
            syncBrowserChromeToActiveTab();
            renderActiveTabPage();
        }
    }
}

/* ==================== RENDU DES PAGES WARFRAME MARKET ==================== */

function renderActiveTabPage() {
    const tab = getActiveTab();
    const container = document.getElementById("tab-page-content");
    if (!tab) return;

    const parsed = parseWfmUrl(tab.url);

    if (tab.loading && !tab.cachedData.item && !tab.cachedData.recentOrders && !tab.cachedData.worldstate && parsed.route !== "catalog") {
        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner-lg"></div>
                <div>Chargement de <strong>${escapeHtml(tab.url)}</strong>...</div>
            </div>
        `;
        return;
    }

    if (parsed.route === "worldstate") {
        renderWorldstateHubPage(container, tab);
    } else if (parsed.route === "home") {
        renderHomePage(container, tab);
    } else if (parsed.route === "recent") {
        renderRecentOrdersPage(container, tab);
    } else if (parsed.route === "favorites") {
        renderFavoritesPage(container, tab);
    } else if (parsed.route === "cart") {
        renderCartPage(container, tab);
    } else if (parsed.route === "alerts") {
        renderAlertsPage(container, tab);
    } else if (parsed.route === "catalog") {
        renderCatalogPage(container, tab);
    } else if (parsed.route === "ducats") {
        renderDucanatorPage(container, tab);
    } else if (parsed.route === "contracts") {
        renderContractsPage(container, tab);
    } else if (parsed.route === "item") {
        renderItemPage(container, tab, parsed.slug);
    } else if (parsed.route === "profile") {
        renderProfilePage(container, tab);
    }
}

/* ==================== 0. ONGLET PERMANENT WIREMARKET HUB : ROTATIONS WARFRAME & BARO KI'TEER ==================== */

// Table complète des 8 semaines de rotation d'Armes Incarnon Genesis (Duviri — Route de l'Acier)
const DUVIRI_INCARNON_ROTATIONS = [
    { week: 1, code: "Semaine A", weapons: ["Braton", "Lato", "Skana", "Paris", "Kunai"] },
    { week: 2, code: "Semaine B", weapons: ["Bo", "Latron", "Furis", "Furax", "Strun"] },
    { week: 3, code: "Semaine C", weapons: ["Lex", "Magistar", "Boltor", "Bronco", "Ceramic Dagger"] },
    { week: 4, code: "Semaine D", weapons: ["Torid", "Dual Toxocyst", "Dual Ichor", "Miter", "Atomos"] },
    { week: 5, code: "Semaine E", weapons: ["Ack & Brunt", "Soma", "Vasto", "Nami Solo", "Burston"] },
    { week: 6, code: "Semaine F", weapons: ["Zylok", "Sibear", "Dread", "Despair", "Hate"] },
    { week: 7, code: "Semaine G", weapons: ["Dera", "Sybaris", "Cestra", "Sicarus", "Okina"] },
    { week: 8, code: "Semaine H", weapons: ["Gorgon", "Anku", "Angstrum", "Gammacor", "Boar"] }
];

// Table complète des 11 semaines de rotation de Warframes (Duviri — Circuit Normal)
const DUVIRI_WARFRAME_ROTATIONS = [
    { week: 1, frames: ["Excalibur", "Trinity", "Ember"] },
    { week: 2, frames: ["Loki", "Mag", "Rhino"] },
    { week: 3, frames: ["Ash", "Frost", "Nyx"] },
    { week: 4, frames: ["Saryn", "Vauban", "Nova"] },
    { week: 5, frames: ["Nekros", "Valkyr", "Oberon"] },
    { week: 6, frames: ["Hydroid", "Mirage", "Limbo"] },
    { week: 7, frames: ["Mesa", "Chroma", "Atlas"] },
    { week: 8, frames: ["Ivara", "Inaros", "Titania"] },
    { week: 9, frames: ["Nidus", "Octavia", "Harrow"] },
    { week: 10, frames: ["Gara", "Khora", "Revenant"] },
    { week: 11, frames: ["Garuda", "Baruuk", "Hildryn"] }
];

// Dictionnaire de correspondance des noms internes DE de Baro Ki'Teer vers les slugs Warframe Market
const BARO_INTERNAL_TO_SLUG = {
    "weapon glaive secondary headshot kill mod": "mark_of_the_beast",
    "primed weapon faction damage murmurs": "primed_bane_of_the_murmur",
    "grn orokin rifle weapon": "gotva_prime",
    "archwing rifle ammo max mod expert": "primed_magazine_warp",
    "primed Smite Corpus": "primed_smite_corpus",
    "primed smite corpus": "primed_smite_corpus",
    "primed rubedo-lined barrel": "primed_rubedo_lined_barrel",
    "primed quickdraw": "primed_quickdraw",
    "primed shotgun ammo mutation": "primed_shotgun_ammo_mutation",
    "primed animal instinct": "primed_animal_instinct",
    "vermillion storm": "vermillion_storm",
    "split flights": "split_flights",
    "fae path ephemera": "fae_path_ephemera",
    "vastilok": "vastilok",
    "zylok": "zylok",
    "ignis wraith": "ignis_wraith_blueprint",
    "supra vandal": "supra_vandal",
    "glaxion vandal": "glaxion_vandal",
    "opticor vandal": "opticor_vandal",
    "quanta vandal": "quanta_vandal",
    "mara detron": "mara_detron",
    "prisma grinlok": "prisma_grinlok",
    "prisma gorgon": "prisma_gorgon",
    "prisma skana": "prisma_skana",
    "prisma dual cleavers": "prisma_dual_cleavers",
    "prisma obex": "prisma_obex",
    "prisma angstrum": "prisma_angstrum",
    "prisma twin gremlins": "prisma_twin_gremlins",
    "prisma veritux": "prisma_veritux",
    "prisma shade": "prisma_shade",
    "prisma lenz": "prisma_lenz",
    "prisma ohma": "prisma_ohma",
    "vulkar wraith": "vulkar_wraith",
    "halikar wraith": "halikar_wraith",
    "viper wraith": "viper_wraith",
    "machete wraith": "machete_wraith",
    "prova vandal": "prova_vandal"
};

// Traductions lisibles pour les cosmétiques internes DE de Baro Ki'Teer
const BARO_INTERNAL_LABELS = {
    "weapon glaive secondary headshot kill mod": "Mark of the Beast (Marque de la Bête)",
    "primed weapon faction damage murmurs": "Primed Bane of The Murmur (Fléau Accru du Murmure)",
    "grn orokin rifle weapon": "Gotva Prime",
    "archwing rifle ammo max mod expert": "Primed Magazine Warp / Munitions Accrues",
    "baro void signal": "Signal du Néant de Baro (Clé de mission)",
    "akvasto tang prime skin": "Aspect Akvasto Tekelu / Tang",
    "dante owl glyph": "Glyphe Dante Hibou",
    "void trader Gauss Floof": "Peluche Gauss de Baro Ki'Teer",
    "void trader gauss floof": "Peluche Gauss de Baro Ki'Teer",
    "garasu kubrow armor": "Armure de Kubrow Ki'Teer / Garasu",
    "grineer settlement artillery scene": "Scène d'Artillerie de Colonie Grineer",
    "pagefromthe waitresses": "Note perdue de Parvos / Fragment de Codex",
    "redeemer saloon skin": "Aspect Redeemer Elixis / Saloon",
    "corinth solstice skin": "Aspect Corinth Immortel / Solstice"
};

// Classiques vendables de Baro Ki'Teer (affichés si Baro est absent entre deux visites pour toujours voir les prix du marché)
const BARO_CLASSIC_STOCK = [
    { item: "Primed Continuity", ducats: 350, credits: 100000 },
    { item: "Primed Flow", ducats: 350, credits: 110000 },
    { item: "Primed Heated Charge", ducats: 350, credits: 175000 },
    { item: "Primed Target Cracker", ducats: 400, credits: 150000 },
    { item: "Primed Pistol Gambit", ducats: 400, credits: 220000 },
    { item: "Primed Reach", ducats: 300, credits: 220000 },
    { item: "Primed Point Blank", ducats: 300, credits: 110000 },
    { item: "Primed Pressure Point", ducats: 385, credits: 300000 },
    { item: "Primed Ravage", ducats: 280, credits: 100000 },
    { item: "Primed Animal Instinct", ducats: 300, credits: 200000 },
    { item: "Primed Rubedo-Lined Barrel", ducats: 350, credits: 175000 },
    { item: "Primed Weapon Faction Damage Murmurs", ducats: 350, credits: 200000 },
    { item: "Grn Orokin Rifle Weapon", ducats: 675, credits: 625000 },
    { item: "Vastilok", ducats: 550, credits: 325000 },
    { item: "Prisma Skana", ducats: 510, credits: 175000 },
    { item: "Supra Vandal", ducats: 500, credits: 275000 },
    { item: "Jolt", ducats: 300, credits: 150000 },
    { item: "High Voltage", ducats: 300, credits: 150000 },
    { item: "Voltaic Strike", ducats: 300, credits: 150000 },
    { item: "Shell Shock", ducats: 300, credits: 150000 }
];

async function fetchWorldstateData(forceRefresh = false) {
    if (!forceRefresh && State.worldstateData && (Date.now() - State.worldstateFetchedAt < 45000)) {
        return State.worldstateData;
    }

    const headers = forceRefresh ? { "X-WM-Refresh": "true" } : {};

    // 1. Proxy local /worldstate (Launcher.cs / server.py)
    if (window.location.protocol.startsWith("http")) {
        try {
            const res = await fetch("/worldstate", { headers });
            if (res.ok) {
                const data = await res.json();
                if (data && (data.cetusCycle || data.voidTrader)) {
                    State.worldstateData = data;
                    State.worldstateFetchedAt = Date.now();
                    return data;
                }
            }
        } catch (e) {}
    }

    // 2. Essai via 127.0.0.1:8484 si ouvert en file://
    try {
        const res = await fetch("http://127.0.0.1:8484/worldstate", { headers });
        if (res.ok) {
            const data = await res.json();
            if (data && (data.cetusCycle || data.voidTrader)) {
                State.worldstateData = data;
                State.worldstateFetchedAt = Date.now();
                return data;
            }
        }
    } catch (e) {}

    // 3. Essai direct vers api.warframestat.us
    try {
        const directRes = await fetch("https://api.warframestat.us/pc/?language=fr");
        if (directRes.ok) {
            const data = await directRes.json();
            if (data && (data.cetusCycle || data.voidTrader)) {
                State.worldstateData = data;
                State.worldstateFetchedAt = Date.now();
                return data;
            }
        }
    } catch (e) {}

    return State.worldstateData || buildFallbackWorldstate();
}

function buildFallbackWorldstate() {
    const now = Date.now();
    // Calcul déterministe de secours si hors-ligne
    const earthPeriod = 8 * 3600 * 1000;
    const earthRem = earthPeriod - (now % earthPeriod);
    const isEarthDay = (now % earthPeriod) < (4 * 3600 * 1000);

    return {
        cetusCycle: { isDay: true, state: "day", expiry: new Date(now + 3600 * 1000).toISOString() },
        vallisCycle: { isWarm: false, state: "cold", expiry: new Date(now + 900 * 1000).toISOString() },
        cambionCycle: { state: "fass", active: "fass", expiry: new Date(now + 2400 * 1000).toISOString() },
        earthCycle: { isDay: isEarthDay, state: isEarthDay ? "day" : "night", expiry: new Date(now + earthRem).toISOString() },
        duviriCycle: {
            state: "Joie",
            expiry: new Date(now + 5400 * 1000).toISOString(),
            choices: [
                { category: "normal", choices: DUVIRI_WARFRAME_ROTATIONS[0].frames },
                { category: "hard", choices: DUVIRI_INCARNON_ROTATIONS[0].weapons }
            ]
        },
        zarimanCycle: { isCorpus: true, state: "corpus", expiry: new Date(now + 4500 * 1000).toISOString() },
        voidTrader: {
            character: "Baro Ki'Teer",
            active: false,
            location: "Relais du Néant",
            activation: new Date(now + 5 * 86400 * 1000).toISOString(),
            expiry: new Date(now + 7 * 86400 * 1000).toISOString(),
            inventory: BARO_CLASSIC_STOCK
        },
        fissures: [
            { id: "fb1", node: "Hepit (Néant)", missionType: "Capture", enemy: "Orokin", tier: "Lith", tierNum: 1, expiry: new Date(now + 3200 * 1000).toISOString(), isStorm: false, isHard: false },
            { id: "fb2", node: "Ukko (Néant)", missionType: "Capture", enemy: "Orokin", tier: "Neo", tierNum: 3, expiry: new Date(now + 2800 * 1000).toISOString(), isStorm: false, isHard: true },
            { id: "fb3", node: "Telesto (Saturne)", missionType: "Extermination", enemy: "Grineer", tier: "Meso", tierNum: 2, expiry: new Date(now + 4100 * 1000).toISOString(), isStorm: false, isHard: false },
            { id: "fb4", node: "Apollo (Lua)", missionType: "Perturbation", enemy: "Corpus", tier: "Axi", tierNum: 4, expiry: new Date(now + 3900 * 1000).toISOString(), isStorm: false, isHard: true },
            { id: "fb5", node: "Yuvarium (Lua)", missionType: "Survie Conjonction", enemy: "Orokin", tier: "Omnia", tierNum: 6, expiry: new Date(now + 4500 * 1000).toISOString(), isStorm: false, isHard: true }
        ],
        archonHunt: {
            boss: "Archonte Amar",
            faction: "Narmer",
            expiry: new Date(now + 4 * 86400 * 1000).toISOString(),
            missions: [
                { node: "Ares (Mars)", type: "Extermination" },
                { node: "Vallée (Mars)", type: "Défense Mobile" },
                { node: "War (Mars)", type: "Assassinat (Affrontement)" }
            ]
        },
        sortie: {
            boss: "Général Sargas Ruk",
            faction: "Grineer",
            expiry: new Date(now + 14 * 3600 * 1000).toISOString(),
            variants: [
                { node: "Tethys (Saturne)", missionType: "Sauvetage", modifier: "Eximus Stronghold" },
                { node: "Helene (Saturne)", missionType: "Défense", modifier: "Energy Reduction" },
                { node: "Rhea (Saturne)", missionType: "Sabotage", modifier: "Augmented Enemy Armor" }
            ]
        },
        steelPath: {
            currentReward: { name: "Shotgun Riven Mod", cost: 75 },
            expiry: new Date(now + 3 * 86400 * 1000).toISOString(),
            rotation: [
                { name: "Umbra Forma Blueprint", cost: 150 },
                { name: "50,000 Kuva", cost: 55 },
                { name: "Kitgun Riven Mod", cost: 75 },
                { name: "3x Forma", cost: 75 },
                { name: "Zaw Riven Mod", cost: 75 },
                { name: "30,000 Endo", cost: 150 },
                { name: "Rifle Riven Mod", cost: 75 },
                { name: "Shotgun Riven Mod", cost: 75 }
            ],
            evergreens: [
                { name: "Veiled Riven Cipher", cost: 20 },
                { name: "10k Kuva", cost: 15 },
                { name: "Primary Arcane Adapter", cost: 15 },
                { name: "Secondary Arcane Adapter", cost: 15 },
                { name: "Relic Pack", cost: 15 },
                { name: "Stance Forma Blueprint", cost: 10 }
            ]
        },
        invasions: [
            {
                id: "inv1",
                node: "Hydron (Sedna)",
                desc: "Siège Corpus",
                attacker: { faction: "Corpus", reward: { itemString: "Dera Vandal Schéma", thumbnail: "https://cdn.warframestat.us/img/dera-vandal.png" } },
                defender: { faction: "Grineer", reward: { itemString: "Karak Wraith Canon", thumbnail: "https://cdn.warframestat.us/img/furax-wraith.png" } },
                completion: 42.5,
                completed: false,
                rewardTypes: ["vandal", "wraith"]
            },
            {
                id: "inv2",
                node: "Cerberus (Pluton)",
                desc: "Éclosion Infestée",
                attacker: { faction: "Infested", reward: {} },
                defender: { faction: "Corpus", reward: { itemString: "3x Fieldron", thumbnail: "https://cdn.warframestat.us/img/fieldron.png" } },
                completion: 74.2,
                completed: false,
                rewardTypes: ["fieldron"]
            }
        ],
        alerts: [
            {
                id: "al1",
                expiry: new Date(now + 5 * 86400 * 1000).toISOString(),
                mission: {
                    description: "Don du Lotus",
                    node: "Stephano (Uranus)",
                    type: "Défense",
                    faction: "Grineer",
                    minEnemyLevel: 20,
                    maxEnemyLevel: 30,
                    reward: { itemString: "3x Forma", credits: 10000, thumbnail: "https://cdn.warframestat.us/img/forma.png" }
                }
            }
        ],
        events: [
            {
                id: "ev1",
                description: "Crevasses Thermia",
                tooltip: "Scellez les crevasses à travers la Vallée Orbis",
                node: "Vallée Orbis (Vénus)",
                expiry: new Date(now + 8 * 86400 * 1000).toISOString(),
                rewards: [{ itemString: "Opticor Vandal + Mods Amalgame", thumbnail: "https://cdn.warframestat.us/img/dera-vandal.png" }]
            }
        ],
        nightwave: {
            season: 12,
            tag: "Le Mix de Nora",
            activeChallenges: [
                { id: "nw1", title: "Exécuteur", desc: "Éliminer 10 ennemis avec des Coups de Grâce", reputation: 1000, isDaily: true, isElite: false, expiry: new Date(now + 2 * 86400 * 1000).toISOString() },
                { id: "nw2", title: "Chasseur de Reliques", desc: "Ouvrir 3 Reliques du Néant", reputation: 4500, isDaily: false, isElite: false, expiry: new Date(now + 5 * 86400 * 1000).toISOString() },
                { id: "nw3", title: "Survivant de l'Acier", desc: "Terminer une mission de Survie d'au moins 30 minutes", reputation: 7000, isDaily: false, isElite: true, expiry: new Date(now + 5 * 86400 * 1000).toISOString() }
            ]
        },
        syndicateMissions: []
    };
}

function matchBaroItemToWfm(rawName) {
    if (!rawName || !State.catalogReady) return null;
    const cleanRaw = String(rawName).trim();
    const low = cleanRaw.toLowerCase();

    // 1. Dictionnaire explicite des noms internes DE
    if (BARO_INTERNAL_TO_SLUG[low]) {
        const direct = State.itemsBySlug.get(BARO_INTERNAL_TO_SLUG[low]);
        if (direct) return direct;
    }

    // 2. Reliques (ex: "Neo O1 Relic (Intact)" -> "neo_o1_relic")
    const relicMatch = cleanRaw.match(/\b(Lith|Meso|Neo|Axi|Requiem)\s+([A-Z0-9]+)\s+Relic/i);
    if (relicMatch) {
        const rSlug = `${relicMatch[1].toLowerCase()}_${relicMatch[2].toLowerCase()}_relic`;
        if (State.itemsBySlug.has(rSlug)) return State.itemsBySlug.get(rSlug);
    }

    // 3. Slug direct normalisé (avec variantes _set et _blueprint)
    const baseSlug = low
        .replace(/\s*\(intact\)\s*/g, "")
        .replace(/\s*blueprint\s*$/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

    const candidates = [
        baseSlug,
        `${baseSlug}_set`,
        `${baseSlug}_blueprint`
    ];
    for (const c of candidates) {
        if (State.itemsBySlug.has(c)) return State.itemsBySlug.get(c);
    }

    // 4. Recherche exacte par nom anglais ou français dans le catalogue
    const normTarget = normalizeSearch(cleanRaw.replace(/\s*\(Intact\)\s*/i, ""));
    for (const it of State.itemsList) {
        if (normalizeSearch(getItemEnName(it)) === normTarget || normalizeSearch(getItemName(it)) === normTarget) {
            return it;
        }
    }

    return null;
}

function matchDuviriWeaponToWfm(weaponName) {
    if (!weaponName || !State.catalogReady) return null;
    const baseSlug = String(weaponName).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    // Priorité : Adaptateur Incarnon Genesis sur Warframe Market, puis Set Prime / Arme
    const candidates = [
        `${baseSlug}_incarnon_genesis`,
        `${baseSlug}_prime_set`,
        `${baseSlug}_vandal_set`,
        `${baseSlug}_wraith_set`,
        `prisma_${baseSlug}`,
        baseSlug
    ];
    for (const c of candidates) {
        if (State.itemsBySlug.has(c)) return State.itemsBySlug.get(c);
    }
    const matches = searchCatalog(weaponName, 1);
    return matches[0] || null;
}

function matchDuviriWarframeToWfm(frameName) {
    if (!frameName || !State.catalogReady) return null;
    const baseSlug = String(frameName).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    const candidates = [
        `${baseSlug}_prime_set`,
        `${baseSlug}_prime_blueprint`,
        baseSlug
    ];
    for (const c of candidates) {
        if (State.itemsBySlug.has(c)) return State.itemsBySlug.get(c);
    }
    const matches = searchCatalog(`${frameName} Prime Set`, 1);
    return matches[0] || null;
}

async function loadBaroPlatinumPrices(inventoryList, forceRefresh = false) {
    if (!State.catalogReady) {
        await loadItemsCatalog();
    }
    const sourceItems = (Array.isArray(inventoryList) && inventoryList.length > 0)
        ? inventoryList
        : BARO_CLASSIC_STOCK;

    const slugsToFetch = [];
    for (const entry of sourceItems) {
        const wfmItem = matchBaroItemToWfm(entry.item);
        if (wfmItem && wfmItem.slug) {
            if (forceRefresh || !State.baroPricesBySlug.has(wfmItem.slug)) {
                if (!slugsToFetch.includes(wfmItem.slug)) {
                    slugsToFetch.push(wfmItem.slug);
                }
            }
        }
    }

    if (slugsToFetch.length === 0) return;

    State.baroPricesLoading = true;
    try {
        const batchSize = 5;
        for (let i = 0; i < slugsToFetch.length; i += batchSize) {
            const batch = slugsToFetch.slice(i, i + batchSize);
            await Promise.allSettled(batch.map(async (slug) => {
                try {
                    const res = await apiFetch(`/api/v2/orders/item/${slug}`, forceRefresh);
                    const orders = Array.isArray(res.data) ? res.data : [];

                    // Vendeurs (Prix d'achat / Prix de revente listé)
                    let sells = orders.filter(o => o.visible && o.type === "sell" && o.user?.status === "ingame")
                        .sort((a, b) => a.platinum - b.platinum);
                    if (sells.length === 0) {
                        sells = orders.filter(o => o.visible && o.type === "sell" && (o.user?.status === "online" || o.user?.status === "ingame"))
                            .sort((a, b) => a.platinum - b.platinum);
                    }

                    // Acheteurs (Prix de revente instantané)
                    let buys = orders.filter(o => o.visible && o.type === "buy" && o.user?.status === "ingame")
                        .sort((a, b) => b.platinum - a.platinum);
                    if (buys.length === 0) {
                        buys = orders.filter(o => o.visible && o.type === "buy" && (o.user?.status === "online" || o.user?.status === "ingame"))
                            .sort((a, b) => b.platinum - a.platinum);
                    }

                    const bestSell = sells[0] || null;
                    const bestBuy = buys[0] || null;

                    State.baroPricesBySlug.set(slug, {
                        loaded: true,
                        minSell: bestSell ? bestSell.platinum : null,
                        bestSeller: bestSell ? {
                            ingameName: bestSell.user?.ingameName || "Tenno",
                            reputation: bestSell.user?.reputation ?? 0,
                            status: bestSell.user?.status || "ingame",
                            rank: bestSell.rank ?? ""
                        } : null,
                        sellCount: sells.length,
                        maxBuy: bestBuy ? bestBuy.platinum : null,
                        bestBuyer: bestBuy ? {
                            ingameName: bestBuy.user?.ingameName || "Tenno",
                            reputation: bestBuy.user?.reputation ?? 0,
                            status: bestBuy.user?.status || "ingame",
                            rank: bestBuy.rank ?? ""
                        } : null,
                        buyCount: buys.length
                    });
                } catch (err) {
                    State.baroPricesBySlug.set(slug, { loaded: true, minSell: null, maxBuy: null, sellCount: 0, buyCount: 0 });
                }
            }));

            // Mettre à jour la grille Baro en direct au fil du chargement
            if (State.activeTabId === "hub") {
                const baroGridWrap = document.getElementById("baro-shop-dynamic-area");
                if (baroGridWrap) {
                    renderBaroShopDynamicArea(baroGridWrap, State.hubTab);
                }
            }
        }
    } finally {
        State.baroPricesLoading = false;
        if (State.activeTabId === "hub") {
            const baroGridWrap = document.getElementById("baro-shop-dynamic-area");
            if (baroGridWrap) {
                renderBaroShopDynamicArea(baroGridWrap, State.hubTab);
            }
        }
    }
}

function formatCountdownMs(ms) {
    if (!Number.isFinite(ms) || ms <= 0) return "Rotation en cours...";
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (days > 0) {
        return `${days}j ${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
    }
    if (hours > 0) {
        return `${hours}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
    }
    return `${mins}m ${String(secs).padStart(2, "0")}s`;
}

function updateLiveWorldstateTimers() {
    const now = Date.now();
    document.querySelectorAll("[data-ws-expiry]").forEach(el => {
        const exp = Date.parse(el.dataset.wsExpiry);
        if (!Number.isNaN(exp)) {
            el.textContent = formatCountdownMs(exp - now);
        }
    });
}

// Images officielles 3D haute résolution (512x512, non aplaties) des Planètes Warframe (Digital Extremes / Wiki Officiel)
const WF_PLANET_IMAGES = {
    earth: "https://wiki.warframe.com/images/TheSteelPathEarth.png",
    venus: "https://wiki.warframe.com/images/TheSteelPathVenus.png",
    deimos: "https://wiki.warframe.com/images/TheSteelPathDeimos.png",
    mercury: "https://wiki.warframe.com/images/TheSteelPathMercury.png",
    mars: "https://wiki.warframe.com/images/TheSteelPathMars.png",
    phobos: "https://wiki.warframe.com/images/TheSteelPathPhobos.png",
    ceres: "https://wiki.warframe.com/images/TheSteelPathCeres.png",
    jupiter: "https://wiki.warframe.com/images/TheSteelPathJupiter.png",
    europa: "https://wiki.warframe.com/images/TheSteelPathEuropa.png",
    saturn: "https://wiki.warframe.com/images/TheSteelPathSaturn.png",
    uranus: "https://wiki.warframe.com/images/TheSteelPathUranus.png",
    neptune: "https://wiki.warframe.com/images/TheSteelPathNeptune.png",
    pluto: "https://wiki.warframe.com/images/TheSteelPathPluto.png",
    sedna: "https://wiki.warframe.com/images/TheSteelPathSedna.png",
    eris: "https://wiki.warframe.com/images/TheSteelPathEris.png",
    lua: "https://wiki.warframe.com/images/TheSteelPathLua.png",
    void: "https://wiki.warframe.com/images/TheSteelPathVoid.png",
    kuva: "https://wiki.warframe.com/images/TheSteelPathKuvaFortress.png",
    zariman: "https://wiki.warframe.com/images/TheSteelPathZariman.png",
    duviri: "https://wiki.warframe.com/images/TheSteelPathDuviri.png",
    baro_portrait: "https://wiki.warframe.com/images/BaroKiTeer.jpg"
};

function getDuviriSpiralImage() {
    return WF_PLANET_IMAGES.duviri;
}

// Recalcule automatiquement la phase actuelle et le prochain timer si l'API renvoie un cycle décalé dans le passé
function resolveLiveCycle(rawCycle, cycleType) {
    const now = Date.now();
    const c = rawCycle || {};
    const expMs = Date.parse(c.expiry || "");
    const actMs = Date.parse(c.activation || "");

    if (cycleType === "cetus" || cycleType === "cambion") {
        // Cycle de 150 min : 100 min Jour/Fass (6 000 000 ms) + 50 min Nuit/Vome (3 000 000 ms)
        const period = 9000000;
        const firstPhaseLen = 6000000;
        const wasFirstPhase = cycleType === "cetus"
            ? (c.isDay !== undefined ? c.isDay : String(c.state).toLowerCase() === "day")
            : (String(c.state || c.active || "fass").toLowerCase() === "fass");

        if (Number.isFinite(expMs) && expMs > now) {
            return { isFirstPhase: wasFirstPhase, expiry: c.expiry };
        }
        const anchorStart = Number.isFinite(actMs)
            ? (wasFirstPhase ? actMs : actMs - firstPhaseLen)
            : (Number.isFinite(expMs) ? (wasFirstPhase ? expMs - firstPhaseLen : expMs - period) : 1700000000000);
        const elapsed = ((now - anchorStart) % period + period) % period;
        if (elapsed < firstPhaseLen) {
            return { isFirstPhase: true, expiry: new Date(now + (firstPhaseLen - elapsed)).toISOString() };
        }
        return { isFirstPhase: false, expiry: new Date(now + (period - elapsed)).toISOString() };
    }

    if (cycleType === "vallis") {
        // Cycle de 26m40s (1 600 000 ms) : 6m40s Chaud (400 000 ms) + 20m Froid (1 200 000 ms)
        const period = 1600000;
        const warmLen = 400000;
        const wasWarm = c.isWarm !== undefined ? c.isWarm : (String(c.state).toLowerCase() === "warm");
        if (Number.isFinite(expMs) && expMs > now) {
            return { isFirstPhase: wasWarm, expiry: c.expiry };
        }
        const anchorStart = Number.isFinite(actMs)
            ? (wasWarm ? actMs : actMs - warmLen)
            : (Number.isFinite(expMs) ? (wasWarm ? expMs - warmLen : expMs - period) : 1700000000000);
        const elapsed = ((now - anchorStart) % period + period) % period;
        if (elapsed < warmLen) {
            return { isFirstPhase: true, expiry: new Date(now + (warmLen - elapsed)).toISOString() };
        }
        return { isFirstPhase: false, expiry: new Date(now + (period - elapsed)).toISOString() };
    }

    // Pour Terre (4h), Duviri (2h), Zariman (2.5h)
    if (Number.isFinite(expMs) && expMs > now) {
        return { expiry: c.expiry };
    }
    const step = cycleType === "earth" ? 14400000 : (cycleType === "duviri" ? 7200000 : 9000000);
    const base = Number.isFinite(expMs) ? expMs : now;
    const rem = step - (((now - base) % step + step) % step);
    return { expiry: new Date(now + rem).toISOString() };
}

function getDuviriMoodFrenchLabel(moodState) {
    const m = String(moodState || "").toLowerCase();
    if (m.includes("joy") || m.includes("joie")) return "JOIE (Joy)";
    if (m.includes("anger") || m.includes("colère") || m.includes("colere")) return "COLÈRE (Anger)";
    if (m.includes("envy") || m.includes("envie")) return "ENVIE (Envy)";
    if (m.includes("sorrow") || m.includes("chagrin")) return "CHAGRIN (Sorrow)";
    if (m.includes("fear") || m.includes("peur")) return "PEUR (Fear)";
    return String(moodState || "JOIE").toUpperCase();
}

function getPlanetImageForLocation(locationStr) {
    const loc = String(locationStr || "").toLowerCase();
    if (loc.includes("saturn") || loc.includes("kronia")) return WF_PLANET_IMAGES.saturn;
    if (loc.includes("mercur") || loc.includes("larunda")) return WF_PLANET_IMAGES.mercury;
    if (loc.includes("pluto") || loc.includes("orcus")) return WF_PLANET_IMAGES.pluto;
    if (loc.includes("earth") || loc.includes("terre") || loc.includes("strata") || loc.includes("cetus")) return WF_PLANET_IMAGES.earth;
    if (loc.includes("mars") || loc.includes("maroo")) return WF_PLANET_IMAGES.mars;
    if (loc.includes("venus") || loc.includes("vénus") || loc.includes("fortuna")) return WF_PLANET_IMAGES.venus;
    if (loc.includes("deimos") || loc.includes("necralisk") || loc.includes("sanctum")) return WF_PLANET_IMAGES.deimos;
    if (loc.includes("eris") || loc.includes("éris")) return WF_PLANET_IMAGES.eris;
    if (loc.includes("europa") || loc.includes("europe")) return WF_PLANET_IMAGES.europa;
    if (loc.includes("phobos")) return WF_PLANET_IMAGES.phobos;
    if (loc.includes("ceres") || loc.includes("cérès")) return WF_PLANET_IMAGES.ceres;
    if (loc.includes("jupiter")) return WF_PLANET_IMAGES.jupiter;
    if (loc.includes("uranus")) return WF_PLANET_IMAGES.uranus;
    if (loc.includes("neptune") || loc.includes("proxim")) return WF_PLANET_IMAGES.neptune;
    if (loc.includes("sedna")) return WF_PLANET_IMAGES.sedna;
    if (loc.includes("lua")) return WF_PLANET_IMAGES.lua;
    if (loc.includes("kuva") || loc.includes("forteresse")) return WF_PLANET_IMAGES.kuva;
    if (loc.includes("zariman")) return WF_PLANET_IMAGES.zariman;
    if (loc.includes("duviri")) return WF_PLANET_IMAGES.duviri;
    return WF_PLANET_IMAGES.void;
}

// Catalogue des Mods Galvanisés & Mods d'Arbitrage (Essence Vitus -> Platinum sur Warframe Market)
const ARBITRATION_VITUS_ITEMS = [
    { slug: "galvanized_chamber", labelFr: "Chambre Galvanisée", labelEn: "Galvanized Chamber", vitus: 20, cat: "Fusil (Tir Multiple)" },
    { slug: "galvanized_diffusion", labelFr: "Diffusion Galvanisée", labelEn: "Galvanized Diffusion", vitus: 20, cat: "Pistolet (Tir Multiple)" },
    { slug: "galvanized_hell", labelFr: "Enfer Galvanisé", labelEn: "Galvanized Hell", vitus: 20, cat: "Fusil à Pompe (Tir Multiple)" },
    { slug: "galvanized_aptitude", labelFr: "Aptitude Galvanisée", labelEn: "Galvanized Aptitude", vitus: 20, cat: "Fusil (Statut)" },
    { slug: "galvanized_shot", labelFr: "Tir Galvanisé", labelEn: "Galvanized Shot", vitus: 20, cat: "Pistolet (Statut)" },
    { slug: "galvanized_savvy", labelFr: "astuce Galvanisée", labelEn: "Galvanized Savvy", vitus: 20, cat: "Fusil à Pompe (Statut)" },
    { slug: "galvanized_steel", labelFr: "Acier Galvanisé", labelEn: "Galvanized Steel", vitus: 20, cat: "Mêlée (Critique)" },
    { slug: "galvanized_reflex", labelFr: "Réflexe Galvanisé", labelEn: "Galvanized Reflex", vitus: 20, cat: "Mêlée (Combo Initial)" },
    { slug: "galvanized_elementalist", labelFr: "Élémentaliste Galvanisé", labelEn: "Galvanized Elementalist", vitus: 20, cat: "Mêlée (Statut)" },
    { slug: "rolling_guard", labelFr: "Roulade Parade", labelEn: "Rolling Guard", vitus: 20, cat: "Warframe (Invulnérabilité)" },
    { slug: "adaptation", labelFr: "Adaptation", labelEn: "Adaptation", vitus: 20, cat: "Warframe (Résistance 90%)" },
    { slug: "preparation", labelFr: "Préparation", labelEn: "Preparation", vitus: 30, cat: "Exilus (+100% Énergie Max)" }
];

const ARBITRATION_HOURLY_ROTATION_POOL = [
    { node: "Seimeni (Cérès)", type: "Défense", enemy: "Infestés", bonus: "+300% Puissance : Saryn · Torid" },
    { node: "Hydron (Sedna)", type: "Défense", enemy: "Grineer", bonus: "+300% Puissance : Wisp · Kuva Bramma" },
    { node: "Apollo (Lua)", type: "Perturbation", enemy: "Corpus", bonus: "+300% Puissance : Volt · Laetum" },
    { node: "Mot (Néant)", type: "Survie", enemy: "Orokin", bonus: "+300% Puissance : Revenant · Glaive" },
    { node: "Hieracon (Pluton)", type: "Excavation", enemy: "Infestés", bonus: "+300% Puissance : Frost · Phenmor" },
    { node: "Helene (Saturne)", type: "Défense", enemy: "Grineer", bonus: "+300% Puissance :Mirage · Acceltra" },
    { node: "Xini (Éris)", type: "Interception", enemy: "Infestés", bonus: "+300% Puissance : Nova · Ocucor" },
    { node: "Ophelia (Uranus)", type: "Survie", enemy: "Grineer", bonus: "+300% Puissance : Khora · Kronen" }
];

function resolveLiveArbitration(rawArbi) {
    const now = Date.now();
    const hourIndex = Math.floor(now / 3600000);
    const nextHourIso = new Date((hourIndex + 1) * 3600000).toISOString();
    const poolEntry = ARBITRATION_HOURLY_ROTATION_POOL[hourIndex % ARBITRATION_HOURLY_ROTATION_POOL.length];

    if (rawArbi && rawArbi.node && !String(rawArbi.node).includes("SolNode000") && rawArbi.type && rawArbi.type !== "Unknown") {
        const expMs = Date.parse(rawArbi.expiry || "");
        const validExpiry = (Number.isFinite(expMs) && expMs > now && expMs < now + 86400000) ? rawArbi.expiry : nextHourIso;
        return {
            node: rawArbi.node,
            type: rawArbi.type,
            enemy: rawArbi.enemy || poolEntry.enemy,
            bonus: poolEntry.bonus,
            expiry: validExpiry
        };
    }

    return {
        node: poolEntry.node,
        type: poolEntry.type,
        enemy: poolEntry.enemy,
        bonus: poolEntry.bonus,
        expiry: nextHourIso
    };
}

function extractRewardSummary(rewardObj) {
    if (!rewardObj) return { label: "", thumb: "", marketUrl: "", isRare: false, isTradableWeapon: false };
    const parts = [];
    if (Array.isArray(rewardObj.countedItems)) {
        for (const ci of rewardObj.countedItems) {
            if (ci && typeof ci === "object") {
                const cnt = ci.count && ci.count > 1 ? `${ci.count}x ` : "";
                parts.push(`${cnt}${ci.type || ci.key || ""}`.trim());
            } else if (typeof ci === "string" && ci.trim()) {
                const m = ci.match(/type=([^;}]+)/i);
                const c = ci.match(/count=(\d+)/i);
                if (m) {
                    const cnt = (c && Number(c[1]) > 1) ? `${c[1]}x ` : "";
                    parts.push(`${cnt}${m[1].trim()}`);
                }
            }
        }
    }
    if (Array.isArray(rewardObj.items)) {
        for (const it of rewardObj.items) {
            if (typeof it === "string" && it.trim() && !parts.includes(it.trim())) {
                parts.push(it.trim());
            }
        }
    } else if (typeof rewardObj.items === "string" && rewardObj.items.trim()) {
        parts.push(rewardObj.items.trim());
    }
    if (parts.length === 0 && rewardObj.itemString) {
        parts.push(String(rewardObj.itemString).trim());
    }
    if (parts.length === 0 && rewardObj.asString) {
        parts.push(String(rewardObj.asString).trim());
    }
    if (rewardObj.credits && rewardObj.credits > 0) {
        parts.push(`${Number(rewardObj.credits).toLocaleString("fr-FR")} Cr`);
    }

    const label = parts.filter(Boolean).join(" + ");
    const low = label.toLowerCase();
    const isRare = low.includes("forma") || low.includes("cataly") || low.includes("react") || low.includes("réact") || low.includes("exilus") || low.includes("adapter");
    const isTradableWeapon = low.includes("wraith") || low.includes("vandal") || low.includes("sheev") || low.includes("dera") || low.includes("karak") || low.includes("snipetron") || low.includes("strun") || low.includes("latron") || low.includes("twin vipers");

    let marketUrl = "";
    if (isTradableWeapon) {
        const cleanSearch = label.replace(/^\d+x\s+/i, "").replace(/\s*\+\s*[\d\s]+Cr.*$/i, "").trim();
        const wfmMatch = matchBaroItemToWfm(cleanSearch) || searchCatalog(cleanSearch, 1)[0];
        marketUrl = wfmMatch
            ? `https://warframe.market/items/${wfmMatch.slug}`
            : `https://warframe.market/items?q=${encodeURIComponent(cleanSearch)}`;
    }

    return {
        label,
        thumb: rewardObj.thumbnail || "",
        marketUrl,
        isRare,
        isTradableWeapon
    };
}

function translateSteelPathRewardName(enName) {
    const raw = String(enName || "").trim();
    const map = {
        "Umbra Forma Blueprint": "Schéma Forma Umbra",
        "50,000 Kuva": "50 000 Kuva",
        "Kitgun Riven Mod": "Mod Riven de Kitgun (Voilé)",
        "3x Forma": "Pack de 3 Formas Construits",
        "Zaw Riven Mod": "Mod Riven de Zaw (Voilé)",
        "30,000 Endo": "30 000 Endo",
        "Rifle Riven Mod": "Mod Riven de Fusil (Voilé)",
        "Shotgun Riven Mod": "Mod Riven de Fusil à Pompe (Voilé)",
        "Veiled Riven Cipher": "Décodeur de Riven Voilé",
        "10k Kuva": "10 000 Kuva",
        "Primary Arcane Adapter": "Adaptateur d'Arcane (Arme Principale)",
        "Secondary Arcane Adapter": "Adaptateur d'Arcane (Arme Secondaire)",
        "Relic Pack": "Pack de 3 Reliques du Néant",
        "Stance Forma Blueprint": "Schéma Forma de Posture"
    };
    return map[raw] || raw;
}

function renderInvasionsAndSteelPathSectionHtml(ws, tab) {
    const now = Date.now();
    // 1. Données #8 : Route de l'Acier (Teshin) & Arbitrage (Essence Vitus / Mods Galvanisés)
    const sp = ws.steelPath || {};
    const spCur = sp.currentReward || { name: "Shotgun Riven Mod", cost: 75 };
    const spRotations = Array.isArray(sp.rotation) && sp.rotation.length > 0
        ? sp.rotation
        : [
            { name: "Umbra Forma Blueprint", cost: 150 },
            { name: "50,000 Kuva", cost: 55 },
            { name: "Kitgun Riven Mod", cost: 75 },
            { name: "3x Forma", cost: 75 },
            { name: "Zaw Riven Mod", cost: 75 },
            { name: "30,000 Endo", cost: 150 },
            { name: "Rifle Riven Mod", cost: 75 },
            { name: "Shotgun Riven Mod", cost: 75 }
        ];
    const spEvergreens = (sp.evergreens || []).slice(0, 8);
    const spExpiry = sp.expiry || new Date(now + 3 * 86400 * 1000).toISOString();

    const liveArbi = resolveLiveArbitration(ws.arbitration);
    const arbiPlanetImg = getPlanetImageForLocation(liveArbi.node);

    // 2. Données #7 : Invasions, Alertes du Lotus, Événements & Ondes Nocturnes (Nightwave)
    const activeInvasions = (ws.invasions || []).filter(inv => !inv.completed);
    const activeAlerts = (ws.alerts || []).filter(al => !al.expired);
    const activeEvents = (ws.events || []).filter(ev => !ev.expired);
    const nw = ws.nightwave || {};
    const nwChallenges = Array.isArray(nw.activeChallenges) ? nw.activeChallenges.slice() : [];
    nwChallenges.sort((a, b) => (b.reputation || 0) - (a.reputation || 0));

    return `
        <!-- #8 : ARBITRAGE EN DIRECT (ESSENCE VITUS) & HONNEURS DE LA ROUTE DE L'ACIER (TESHIN) -->
        <section id="hub-sec-steelpath-arbi" class="ws-section">
            <div class="section-header">
                <div>
                    <h2 class="section-title">${wfIcon("flame", "wf-icon-gold")} Arbitrage (Essence Vitus) & Honneurs de la Route de l'Acier (Teshin)</h2>
                    <span style="color:var(--text-secondary);font-size:12.5px;">Suivez la rotation hebdomadaire d'Essence d'Acier chez Teshin, l'Arbitrage horaire et les Mods Galvanisés les plus rentables à revendre en Platinum.</span>
                </div>
            </div>

            <div class="duviri-active-columns">
                <!-- Boutique Hebdomadaire de Teshin (Route de l'Acier) -->
                <div class="duviri-panel incarnon-panel">
                    <div class="duviri-panel-header">
                        <div>
                            <span class="duviri-mode-badge hard">${wfIcon("weapon", "wf-icon-sm")} HONNEURS DE LA ROUTE DE L'ACIER — TESHIN</span>
                            <h3>Offre de la semaine : <span style="color:var(--accent-gold)">${escapeHtml(translateSteelPathRewardName(spCur.name))}</span> (${spCur.cost || 75} Essences d'Acier)</h3>
                        </div>
                        <span class="ws-cycle-timer" data-ws-expiry="${escapeHtml(spExpiry)}">
                            ${formatCountdownMs(Date.parse(spExpiry) - now)}
                        </span>
                    </div>

                    <div class="duviri-rotation-list" style="margin-top:4px;">
                        ${spRotations.map((r, idx) => {
                            const isCur = String(r.name || "").toLowerCase() === String(spCur.name || "").toLowerCase();
                            const frLabel = translateSteelPathRewardName(r.name);
                            const isRiven = String(r.name || "").toLowerCase().includes("riven");
                            const wfmUrl = isRiven ? `https://warframe.market/items?q=${encodeURIComponent(r.name)}` : "";
                            return `
                                <div class="duviri-rotation-row ${isCur ? "active-week" : ""}" ${wfmUrl ? `data-open-url="${escapeHtml(wfmUrl)}" style="cursor:pointer;" title="Voir le prix en Platinum sur Warframe Market"` : ""}>
                                    <div class="rot-week-label">
                                        <strong>Semaine ${idx + 1}</strong>
                                        ${isCur ? `<span class="rot-current-pill">EN COURS</span>` : ""}
                                    </div>
                                    <div style="display:flex;align-items:center;justify-content:space-between;flex:1;gap:8px;flex-wrap:wrap;">
                                        <span style="font-weight:700;color:var(--text-main);font-size:12.5px;">${escapeHtml(frLabel)}</span>
                                        <span class="meta-pill ducats">${wfIcon("flame", "wf-icon-sm wf-icon-gold")} <strong>${r.cost} Essences d'Acier</strong></span>
                                    </div>
                                </div>
                            `;
                        }).join("")}
                    </div>

                    ${spEvergreens.length > 0 ? `
                        <div style="margin-top:6px;">
                            <div style="font-size:11.5px;font-weight:800;color:var(--text-secondary);margin-bottom:6px;text-transform:uppercase;">Boutique Permanente de Teshin (Evergreens) :</div>
                            <div class="rot-weapons-chips">
                                ${spEvergreens.map(ev => `
                                    <span class="rot-item-chip" data-open-url="https://warframe.market/items?q=${encodeURIComponent(ev.name)}">
                                        ${escapeHtml(translateSteelPathRewardName(ev.name))} · <strong style="color:var(--accent-cyan)">${ev.cost} EA</strong>
                                    </span>
                                `).join("")}
                            </div>
                        </div>
                    ` : ""}
                </div>

                <!-- Arbitrage en Direct & Mods Galvanisés (Essence Vitus -> Platinum) -->
                <div class="duviri-panel warframe-panel">
                    <div class="duviri-panel-header">
                        <div>
                            <span class="duviri-mode-badge normal">${wfIcon("prime", "wf-icon-sm")} ARBITRAGE EN DIRECT & BOUTIQUE ESSENCE VITUS</span>
                            <h3>${escapeHtml(liveArbi.type)} — <span style="color:var(--accent-cyan)">${escapeHtml(liveArbi.node)}</span> (${escapeHtml(liveArbi.enemy)})</h3>
                        </div>
                        <span class="ws-cycle-timer" data-ws-expiry="${escapeHtml(liveArbi.expiry)}">
                            ${formatCountdownMs(Date.parse(liveArbi.expiry) - now)}
                        </span>
                    </div>

                    <div class="mission-stage-row" style="margin-bottom:4px;">
                        <img class="mission-stage-planet" src="${escapeHtml(arbiPlanetImg)}" alt="" onerror="this.src='${DEFAULT_FAVICON}'"/>
                        <div class="mission-stage-info">
                            <div class="mission-stage-type">Bonus d'Arbitrage actif : <span style="color:var(--accent-gold)">${escapeHtml(liveArbi.bonus)}</span></div>
                            <div class="mission-stage-node">Récompenses : Essence Vitus, Endo, Statues Ayatan & Mods d'Arbitrage échangeables en Platinum.</div>
                        </div>
                    </div>

                    <div style="font-size:11.5px;font-weight:800;color:var(--text-secondary);margin:4px 0 4px;text-transform:uppercase;">
                        ${wfIcon("plat", "wf-icon-sm wf-icon-cyan")} Mods Galvanisés & Arbitrage à acheter en Essence Vitus pour revendre en Platinum :
                    </div>
                    <div class="duviri-active-items-grid">
                        ${ARBITRATION_VITUS_ITEMS.map(vItem => {
                            const wfmItem = State.itemsBySlug.get(vItem.slug) || searchCatalog(vItem.labelEn, 1)[0];
                            const img = wfmItem ? getItemThumb(wfmItem) : DEFAULT_FAVICON;
                            const url = wfmItem ? `https://warframe.market/items/${wfmItem.slug}` : `https://warframe.market/items?q=${encodeURIComponent(vItem.labelEn)}`;
                            const displayTitle = wfmItem ? getItemName(wfmItem) : vItem.labelFr;
                            return `
                                <div class="duviri-item-card" data-open-url="${escapeHtml(url)}" title="Voir les ordres de ${escapeHtml(displayTitle)} sur Warframe Market">
                                    <img src="${escapeHtml(img)}" alt="${escapeHtml(displayTitle)}" onerror="this.src='${DEFAULT_FAVICON}'"/>
                                    <div class="duviri-item-info">
                                        <div class="duviri-item-name">${escapeHtml(displayTitle)}</div>
                                        <div class="duviri-item-sub">${escapeHtml(vItem.cat)} · <strong style="color:var(--accent-cyan)">${vItem.vitus} EV</strong></div>
                                    </div>
                                    <button class="item-card-newtab" data-newtab-url="${escapeHtml(url)}" title="Ouvrir dans un nouvel onglet">↗</button>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>
            </div>
        </section>

        <!-- #7A : INVASIONS EN DIRECT (ARMES WRAITH/VANDAL, CATALYSEURS, FORMAS, FIELDRON, DÉTONITE, MUTAGÈNE) -->
        <section id="hub-sec-invasions-list" class="ws-section">
            <div class="section-header">
                <div>
                    <h2 class="section-title">${wfIcon("syndicate", "wf-icon-gold")} Invasions en Direct (${activeInvasions.length} actives)</h2>
                    <span style="color:var(--text-secondary);font-size:12.5px;">Suivez la progression des invasions et cliquez sur les pièces d'armes Wraith / Vandal pour consulter leur prix en Platinum.</span>
                </div>
            </div>

            ${activeInvasions.length === 0 ? `
                <div class="orders-panel" style="padding:24px;text-align:center;color:var(--text-muted);">Aucune invasion active en ce moment.</div>
            ` : `
                <div class="invasions-grid">
                    ${activeInvasions.map(inv => {
                        const planetImg = getPlanetImageForLocation(inv.node);
                        const pct = Math.max(0, Math.min(100, Number(inv.completion) || 50));
                        const attReward = extractRewardSummary(inv.attacker?.reward);
                        const defReward = extractRewardSummary(inv.defender?.reward);
                        const hasAttReward = !!attReward.label;
                        const hasDefReward = !!defReward.label;
                        const isRare = attReward.isRare || defReward.isRare;
                        return `
                            <div class="invasion-card ${isRare ? "invasion-rare" : ""}">
                                <div class="invasion-card-top">
                                    <div class="invasion-node-group">
                                        <img class="fissure-planet-img" src="${escapeHtml(planetImg)}" alt="" onerror="this.src='${DEFAULT_FAVICON}'"/>
                                        <div>
                                            <div class="invasion-node-title">${escapeHtml(inv.node || "Secteur")}</div>
                                            <div class="invasion-desc-sub">${escapeHtml(inv.desc || "Conflit de Factions")} · <strong>${pct.toFixed(1)}%</strong></div>
                                        </div>
                                    </div>
                                    <div class="invasion-factions-pills">
                                        <span class="fissure-mode-pill normal">${escapeHtml(inv.attacker?.faction || "Attaquant")}</span>
                                        <span style="color:var(--text-muted);font-weight:800;font-size:11px;">VS</span>
                                        <span class="fissure-mode-pill hard">${escapeHtml(inv.defender?.faction || "Défenseur")}</span>
                                    </div>
                                </div>

                                <div class="invasion-progress-track" title="Progression : ${pct.toFixed(1)}%">
                                    <div class="invasion-progress-fill" style="width:${pct.toFixed(1)}%;"></div>
                                </div>

                                <div class="invasion-rewards-row">
                                    ${hasAttReward ? `
                                        <div class="invasion-reward-box ${attReward.isTradableWeapon ? "tradable" : ""}" ${attReward.marketUrl ? `data-open-url="${escapeHtml(attReward.marketUrl)}" title="Voir sur Warframe Market"` : ""}>
                                            ${attReward.thumb ? `<img src="${escapeHtml(attReward.thumb)}" alt="" onerror="this.style.display='none'"/>` : ""}
                                            <div class="invasion-reward-text">
                                                <span class="invasion-reward-side">${escapeHtml(inv.attacker?.faction || "Attaquant")}</span>
                                                <strong>${escapeHtml(attReward.label)}</strong>
                                            </div>
                                            ${attReward.marketUrl ? `<span class="invasion-plat-link">Plat ↗</span>` : ""}
                                        </div>
                                    ` : `<div class="invasion-reward-box muted"><span>Invasion Infestée (Aucune récompense attaquant)</span></div>`}

                                    ${hasDefReward ? `
                                        <div class="invasion-reward-box ${defReward.isTradableWeapon ? "tradable" : ""}" ${defReward.marketUrl ? `data-open-url="${escapeHtml(defReward.marketUrl)}" title="Voir sur Warframe Market"` : ""}>
                                            ${defReward.thumb ? `<img src="${escapeHtml(defReward.thumb)}" alt="" onerror="this.style.display='none'"/>` : ""}
                                            <div class="invasion-reward-text">
                                                <span class="invasion-reward-side">${escapeHtml(inv.defender?.faction || "Défenseur")}</span>
                                                <strong>${escapeHtml(defReward.label)}</strong>
                                            </div>
                                            ${defReward.marketUrl ? `<span class="invasion-plat-link">Plat ↗</span>` : ""}
                                        </div>
                                    ` : ""}
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            `}
        </section>

        <!-- #7B : ALERTES DU LOTUS, ÉVÉNEMENTS ACTIFS & ONDES NOCTURNES (NIGHTWAVE) -->
        <section id="hub-sec-events-nightwave" class="ws-section">
            <div class="duviri-active-columns">
                <!-- Alertes du Lotus & Événements Spéciaux -->
                <div class="duviri-panel incarnon-panel">
                    <div class="duviri-panel-header">
                        <div>
                            <span class="duviri-mode-badge hard">${wfIcon("alert", "wf-icon-sm")} ALERTES DU LOTUS & ÉVÉNEMENTS MONDIAUX</span>
                            <h3>Dons du Lotus, Alertes Tactiques & Événements en cours</h3>
                        </div>
                    </div>

                    <div class="mission-stages-list">
                        ${activeAlerts.map(al => {
                            const m = al.mission || {};
                            const rew = extractRewardSummary(m.reward);
                            return `
                                <div class="mission-stage-row">
                                    <img class="mission-stage-planet" src="${escapeHtml(rew.thumb || getPlanetImageForLocation(m.node))}" alt="" onerror="this.src='${DEFAULT_FAVICON}'"/>
                                    <div class="mission-stage-info" style="flex:1;">
                                        <div class="mission-stage-type">${escapeHtml(m.description || "Alerte du Lotus")} — <span style="color:var(--accent-gold)">${escapeHtml(rew.label || "Récompense spéciale")}</span></div>
                                        <div class="mission-stage-node">${escapeHtml(m.node || "Secteur")} · ${escapeHtml(m.type || "Mission")} (${escapeHtml(m.faction || "")} Niv. ${m.minEnemyLevel || 1}-${m.maxEnemyLevel || 30})</div>
                                    </div>
                                    ${al.expiry ? `<span class="ws-cycle-timer" data-ws-expiry="${escapeHtml(al.expiry)}">${formatCountdownMs(Date.parse(al.expiry) - now)}</span>` : ""}
                                </div>
                            `;
                        }).join("")}

                        ${activeEvents.map(ev => {
                            const firstRew = Array.isArray(ev.rewards) && ev.rewards.length > 0 ? extractRewardSummary(ev.rewards[0]) : { label: "", thumb: "" };
                            return `
                                <div class="mission-stage-row">
                                    <img class="mission-stage-planet" src="${escapeHtml(firstRew.thumb || getPlanetImageForLocation(ev.node || ev.victimNode))}" alt="" onerror="this.src='${DEFAULT_FAVICON}'"/>
                                    <div class="mission-stage-info" style="flex:1;">
                                        <div class="mission-stage-type">${escapeHtml(ev.description || "Événement Actif")} ${firstRew.label ? `— <span style="color:var(--accent-cyan)">${escapeHtml(firstRew.label)}</span>` : ""}</div>
                                        <div class="mission-stage-node">${escapeHtml(ev.tooltip || ev.node || "Événement spécial Warframe")}</div>
                                    </div>
                                    ${ev.expiry ? `<span class="ws-cycle-timer" data-ws-expiry="${escapeHtml(ev.expiry)}">${formatCountdownMs(Date.parse(ev.expiry) - now)}</span>` : ""}
                                </div>
                            `;
                        }).join("")}

                        ${activeAlerts.length === 0 && activeEvents.length === 0 ? `
                            <div style="padding:16px;text-align:center;color:var(--text-muted);">Aucune alerte du Lotus ou événement spécial actif pour le moment.</div>
                        ` : ""}
                    </div>
                </div>

                <!-- Ondes Nocturnes (Nightwave — Nora Night) -->
                <div class="duviri-panel warframe-panel">
                    <div class="duviri-panel-header">
                        <div>
                            <span class="duviri-mode-badge normal">${wfIcon("star", "wf-icon-sm")} ONDES NOCTURNES — NORA NIGHT</span>
                            <h3>Défis Actifs de la Semaine (${nwChallenges.length} défis)</h3>
                        </div>
                    </div>

                    <div class="nightwave-challenges-list">
                        ${nwChallenges.length > 0 ? nwChallenges.map(ch => {
                            const badgeType = ch.isElite
                                ? `<span class="nw-rep-badge elite">ÉLITE +${(ch.reputation || 7000).toLocaleString("fr-FR")}</span>`
                                : (ch.isDaily
                                    ? `<span class="nw-rep-badge daily">QUOTIDIEN +${(ch.reputation || 1000).toLocaleString("fr-FR")}</span>`
                                    : `<span class="nw-rep-badge weekly">HEBDO +${(ch.reputation || 4500).toLocaleString("fr-FR")}</span>`);
                            return `
                                <div class="nightwave-challenge-row">
                                    <div style="flex:1;min-width:0;">
                                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                                            ${badgeType}
                                            <strong style="font-size:13px;color:var(--text-main);">${escapeHtml(ch.title || "Défi Nightwave")}</strong>
                                        </div>
                                        <div style="font-size:12px;color:var(--text-secondary);margin-top:3px;">${escapeHtml(ch.desc || "")}</div>
                                    </div>
                                    ${ch.expiry ? `<span class="ws-cycle-timer" data-ws-expiry="${escapeHtml(ch.expiry)}">${formatCountdownMs(Date.parse(ch.expiry) - now)}</span>` : ""}
                                </div>
                            `;
                        }).join("") : `
                            <div style="padding:16px;text-align:center;color:var(--text-muted);">Synchronisation des défis des Ondes Nocturnes...</div>
                        `}
                    </div>
                </div>
            </div>
        </section>

        <!-- ALERTES SONORES D'INVASIONS, ROUTE DE L'ACIER & ARBITRAGE -->
        <section class="ws-section">
            ${renderWorldAlertsPanelHtml("invasions")}
        </section>
    `;
}

function renderWorldstateHubPage(container, tab) {
    const ws = tab.cachedData.worldstate || State.worldstateData || buildFallbackWorldstate();

    // 1. Données Cycles Planétaires (avec projection périodique en temps réel si l'ancre API vient d'expirer)
    const cetus = ws.cetusCycle || {};
    const vallis = ws.vallisCycle || {};
    const cambion = ws.cambionCycle || {};
    const earth = ws.earthCycle || {};
    const duviri = ws.duviriCycle || {};
    const zariman = ws.zarimanCycle || {};

    const cetusLive = resolveLiveCycle(cetus, "cetus");
    const vallisLive = resolveLiveCycle(vallis, "vallis");
    const cambionLive = resolveLiveCycle(cambion, "cambion");
    const earthLive = resolveLiveCycle(earth, "earth");
    const duviriLive = resolveLiveCycle(duviri, "duviri");
    const zarimanLive = resolveLiveCycle(zariman, "zariman");

    const isCetusDay = cetusLive.isFirstPhase;
    const isVallisWarm = vallisLive.isFirstPhase;
    const isCambionFass = cambionLive.isFirstPhase;
    const isEarthDay = earth.isDay !== undefined ? earth.isDay : (String(earth.state).toLowerCase() === "day");
    const duviriMood = duviri.state || "Joie";
    const duviriSpiralImg = getDuviriSpiralImage(duviriMood);
    const duviriMoodFr = getDuviriMoodFrenchLabel(duviriMood);
    const isZarimanCorpus = zariman.isCorpus !== undefined ? zariman.isCorpus : (String(zariman.state).toLowerCase() === "corpus");

    // 2. Données Rotations Duviri (Armes Incarnon & Warframes)
    const duviriChoices = Array.isArray(duviri.choices) ? duviri.choices : [];
    const hardChoiceObj = duviriChoices.find(c => c.category === "hard" || c.categoryKey === "EXC_HARD");
    const normalChoiceObj = duviriChoices.find(c => c.category === "normal" || c.categoryKey === "EXC_NORMAL");

    const activeIncarnonWeapons = (hardChoiceObj && Array.isArray(hardChoiceObj.choices) && hardChoiceObj.choices.length > 0)
        ? hardChoiceObj.choices
        : DUVIRI_INCARNON_ROTATIONS[0].weapons;

    const activeDuviriFrames = (normalChoiceObj && Array.isArray(normalChoiceObj.choices) && normalChoiceObj.choices.length > 0)
        ? normalChoiceObj.choices
        : DUVIRI_WARFRAME_ROTATIONS[0].frames;

    // Identifier l'index de la semaine active dans les tables complètes
    const activeIncarnonWeekIdx = DUVIRI_INCARNON_ROTATIONS.findIndex(r =>
        r.weapons.some(w => activeIncarnonWeapons.map(x => x.toLowerCase()).includes(w.toLowerCase()))
    );
    const activeFrameWeekIdx = DUVIRI_WARFRAME_ROTATIONS.findIndex(r =>
        r.frames.some(f => activeDuviriFrames.map(x => x.toLowerCase()).includes(f.toLowerCase()))
    );

    // Calcul de la fin de semaine (Lundi 00:00 UTC) pour la rotation hebdomadaire Duviri
    const nowDate = new Date();
    const daysUntilMonday = (8 - nowDate.getUTCDay()) % 7 || 7;
    const nextMondayUtc = new Date(Date.UTC(
        nowDate.getUTCFullYear(),
        nowDate.getUTCMonth(),
        nowDate.getUTCDate() + daysUntilMonday,
        0, 0, 0
    )).toISOString();

    // 3. Mises à Prix des Planètes (Syndicate Missions)
    const syndicates = Array.isArray(ws.syndicateMissions) ? ws.syndicateMissions : [];
    const selectedSyndicateKey = tab.viewState.bountySyndicate || "Ostrons";

    // 4. Baro Ki'Teer
    const vt = ws.voidTrader || {};
    const baroActive = !!vt.active;
    const baroTargetIso = baroActive ? vt.expiry : vt.activation;
    const baroPlanetImg = getPlanetImageForLocation(vt.location);

    const activeSection = tab.viewState.hubSection || "planets";

    const planetsSectionHtml = `
        <!-- VUE 1 : CYCLES JOUR / NUIT DES PLANÈTES & MISES À PRIX -->
        <section id="hub-sec-cycles" class="ws-section">
            <div class="section-header">
                <h2 class="section-title">${wfIcon("sun", "wf-icon-gold")} Cycles Jour / Nuit & États des Planètes en Direct</h2>
                <span style="color:var(--text-muted);font-size:12px;">Compte à rebours synchronisé à la seconde</span>
            </div>
            <div class="ws-cycles-grid">
                <!-- Cetus / Plaines d'Eidolon -->
                <div class="ws-cycle-card ${isCetusDay ? "cycle-day" : "cycle-night"}">
                    <div class="ws-cycle-main-row">
                        <div class="ws-planet-img-wrap">
                            <img class="ws-planet-img" src="${WF_PLANET_IMAGES.earth}" alt="Terre" onerror="this.src='${DEFAULT_FAVICON}'"/>
                        </div>
                        <div class="ws-cycle-body">
                            <div class="ws-cycle-top">
                                <div>
                                    <div class="ws-cycle-planet">TERRE · PLAINES D'EIDOLON (CETUS)</div>
                                    <div class="ws-cycle-state">
                                        ${isCetusDay ? wfIcon("sun", "wf-icon-gold") : wfIcon("moon", "wf-icon-cyan")}
                                        <span>${isCetusDay ? "JOUR" : "NUIT (Eidolons Actifs)"}</span>
                                    </div>
                                </div>
                                <span class="ws-cycle-timer" data-ws-expiry="${escapeHtml(cetusLive.expiry)}">
                                    ${formatCountdownMs(Date.parse(cetusLive.expiry) - Date.now())}
                                </span>
                            </div>
                            <div class="ws-cycle-sub">
                                ${isCetusDay
                                    ? "Les Eidolons dorment. Prochaine nuit dans le compteur ci-dessus."
                                    : "Chasse au Teralyst, Gantulyst et Hydrolyst disponible (Arcanes Légendaires) !"}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Vallée Orbis / Fortuna -->
                <div class="ws-cycle-card ${isVallisWarm ? "cycle-warm" : "cycle-cold"}">
                    <div class="ws-cycle-main-row">
                        <div class="ws-planet-img-wrap">
                            <img class="ws-planet-img" src="${WF_PLANET_IMAGES.venus}" alt="Vénus" onerror="this.src='${DEFAULT_FAVICON}'"/>
                        </div>
                        <div class="ws-cycle-body">
                            <div class="ws-cycle-top">
                                <div>
                                    <div class="ws-cycle-planet">VÉNUS · VALLÉE ORBIS (FORTUNA)</div>
                                    <div class="ws-cycle-state">
                                        ${wfIcon(isVallisWarm ? "sun" : "prime", isVallisWarm ? "wf-icon-gold" : "wf-icon-cyan")}
                                        <span>${isVallisWarm ? "CHAUD" : "FROID"}</span>
                                    </div>
                                </div>
                                <span class="ws-cycle-timer" data-ws-expiry="${escapeHtml(vallisLive.expiry)}">
                                    ${formatCountdownMs(Date.parse(vallisLive.expiry) - Date.now())}
                                </span>
                            </div>
                            <div class="ws-cycle-sub">
                                Cycle thermique de la Vallée Orbis (Pêche des Servopoissons & Preneur de Profit).
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Puy de Cambion / Deimos -->
                <div class="ws-cycle-card ${isCambionFass ? "cycle-fass" : "cycle-vome"}">
                    <div class="ws-cycle-main-row">
                        <div class="ws-planet-img-wrap">
                            <img class="ws-planet-img" src="${WF_PLANET_IMAGES.deimos}" alt="Deimos" onerror="this.src='${DEFAULT_FAVICON}'"/>
                        </div>
                        <div class="ws-cycle-body">
                            <div class="ws-cycle-top">
                                <div>
                                    <div class="ws-cycle-planet">DEIMOS · PUY DE CAMBION (NECRALISK)</div>
                                    <div class="ws-cycle-state">
                                        ${wfIcon("prime", isCambionFass ? "wf-icon-gold" : "wf-icon-cyan")}
                                        <span>${isCambionFass ? "FASS (Chaos)" : "VOME (Ordre)"}</span>
                                    </div>
                                </div>
                                <span class="ws-cycle-timer" data-ws-expiry="${escapeHtml(cambionLive.expiry)}">
                                    ${formatCountdownMs(Date.parse(cambionLive.expiry) - Date.now())}
                                </span>
                            </div>
                            <div class="ws-cycle-sub">
                                ${isCambionFass
                                    ? "Le Wyrm Fass domine Deimos — Necramechs & résidus de Vome au sol."
                                    : "Le Wyrm Vome apaise Deimos — Résidus de Fass & faune nocturne."}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Forêts de la Terre -->
                <div class="ws-cycle-card ${isEarthDay ? "cycle-day" : "cycle-night"}">
                    <div class="ws-cycle-main-row">
                        <div class="ws-planet-img-wrap">
                            <img class="ws-planet-img" src="${WF_PLANET_IMAGES.earth}" alt="Terre" onerror="this.src='${DEFAULT_FAVICON}'"/>
                        </div>
                        <div class="ws-cycle-body">
                            <div class="ws-cycle-top">
                                <div>
                                    <div class="ws-cycle-planet">TERRE · FORÊTS TERRESTRES (4H)</div>
                                    <div class="ws-cycle-state">
                                        ${isEarthDay ? wfIcon("sun", "wf-icon-gold") : wfIcon("moon", "wf-icon-cyan")}
                                        <span>${isEarthDay ? "JOUR" : "NUIT"}</span>
                                    </div>
                                </div>
                                <span class="ws-cycle-timer" data-ws-expiry="${escapeHtml(earthLive.expiry)}">
                                    ${formatCountdownMs(Date.parse(earthLive.expiry) - Date.now())}
                                </span>
                            </div>
                            <div class="ws-cycle-sub">
                                Plantes du Bosquet d'Argent : ${isEarthDay ? "Pomme de Pin Solaire & Lys Dragon" : "Jadefeuille Nocturne & Sarracénie Crépusculaire"}.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Duviri Spirale d'Émotion -->
                <div class="ws-cycle-card cycle-duviri">
                    <div class="ws-cycle-main-row">
                        <div class="ws-planet-img-wrap">
                            <img class="ws-planet-img" src="${escapeHtml(duviriSpiralImg)}" alt="Duviri" onerror="this.src='${DEFAULT_FAVICON}'"/>
                        </div>
                        <div class="ws-cycle-body">
                            <div class="ws-cycle-top">
                                <div>
                                    <div class="ws-cycle-planet">DUVIRI · SPIRALE D'ÉMOTION</div>
                                    <div class="ws-cycle-state">
                                        ${wfIcon("void", "wf-icon-riven")}
                                        <span>${escapeHtml(duviriMoodFr)}</span>
                                    </div>
                                </div>
                                <span class="ws-cycle-timer" data-ws-expiry="${escapeHtml(duviriLive.expiry)}">
                                    ${formatCountdownMs(Date.parse(duviriLive.expiry) - Date.now())}
                                </span>
                            </div>
                            <div class="ws-cycle-sub">
                                Détermine le prince Wyrmling actif et les dégâts élémentaires de l'Orowyrm à Duviri.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Zariman Ten Zero -->
                <div class="ws-cycle-card cycle-zariman">
                    <div class="ws-cycle-main-row">
                        <div class="ws-planet-img-wrap">
                            <img class="ws-planet-img" src="${WF_PLANET_IMAGES.zariman}" alt="Zariman Ten Zero" onerror="this.src='${DEFAULT_FAVICON}'"/>
                        </div>
                        <div class="ws-cycle-body">
                            <div class="ws-cycle-top">
                                <div>
                                    <div class="ws-cycle-planet">ZARIMAN TEN ZERO · OCCUPATION</div>
                                    <div class="ws-cycle-state">
                                        ${wfIcon("syndicate", isZarimanCorpus ? "wf-icon-cyan" : "wf-icon-gold")}
                                        <span>${isZarimanCorpus ? "CORPUS" : "GRINEER"}</span>
                                    </div>
                                </div>
                                <span class="ws-cycle-timer" data-ws-expiry="${escapeHtml(zarimanLive.expiry)}">
                                    ${formatCountdownMs(Date.parse(zarimanLive.expiry) - Date.now())}
                                </span>
                            </div>
                            <div class="ws-cycle-sub">
                                Faction ennemie occupant actuellement les missions et mises à prix des Irréductibles.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- MISES À PRIX DES PLANÈTES (BOUNTIES) -->
        <section id="hub-sec-bounties" class="ws-section">
            <div class="section-header">
                <h2 class="section-title">${wfIcon("target", "wf-icon-gold")} Mises à Prix des Planètes en Direct (Cetus, Fortuna, Necralisk)</h2>
                <div class="bounty-syndicate-tabs">
                    <button class="filter-chip bounty-planet-tab ${selectedSyndicateKey === "Ostrons" ? "active" : ""}" data-bounty-synd="Ostrons">
                        <img class="bounty-tab-planet-img" src="${WF_PLANET_IMAGES.earth}" alt="Terre"/>
                        <span>Ostrons (Cetus — Terre)</span>
                    </button>
                    <button class="filter-chip bounty-planet-tab ${selectedSyndicateKey === "Solaris United" ? "active" : ""}" data-bounty-synd="Solaris United">
                        <img class="bounty-tab-planet-img" src="${WF_PLANET_IMAGES.venus}" alt="Vénus"/>
                        <span>Union Solaris (Fortuna — Vénus)</span>
                    </button>
                    <button class="filter-chip bounty-planet-tab ${selectedSyndicateKey === "Entrati" ? "active" : ""}" data-bounty-synd="Entrati">
                        <img class="bounty-tab-planet-img" src="${WF_PLANET_IMAGES.deimos}" alt="Deimos"/>
                        <span>Entrati (Necralisk — Deimos)</span>
                    </button>
                </div>
            </div>
            <div id="bounties-dynamic-area">
                ${renderBountiesForSyndicateHtml(syndicates, selectedSyndicateKey)}
            </div>
        </section>

        <!-- ALERTES SONORES DE CYCLES PLANÉTAIRES -->
        <section class="ws-section">
            ${renderWorldAlertsPanelHtml("planets")}
        </section>
    `;

    // 5. Données Fissures du Néant, Chasse à l'Archonte & Sortie
    const archon = ws.archonHunt || {};
    const archonMissions = Array.isArray(archon.missions) ? archon.missions : [];
    const sortie = ws.sortie || {};
    const sortieVariants = Array.isArray(sortie.variants) ? sortie.variants : [];
    const curFissureMode = tab.viewState.fissureMode || "all";
    const curFissureTier = tab.viewState.fissureTier || "all";
    const curFissureFastOnly = !!tab.viewState.fissureFastOnly;

    const fissuresSectionHtml = `
        <!-- VUE FISSURES DU NÉANT, CHASSE À L'ARCHONTE & SORTIE -->
        <section id="hub-sec-fissures" class="ws-section">
            <div class="section-header">
                <div>
                    <h2 class="section-title">${wfIcon("flame", "wf-icon-gold")} Fissures du Néant en Direct (Ouverture de Reliques)</h2>
                    <span style="color:var(--text-secondary);font-size:12.5px;">Filtrez par difficulté, ère de relique ou missions rapides pour ouvrir vos reliques et farmer le Platinum.</span>
                </div>
                <button class="filter-chip ${curFissureFastOnly ? "active" : ""}" id="btn-fissure-fast-only">
                    ${wfIcon("target", "wf-icon-sm wf-icon-gold")}
                    <span>⚡ Missions Rapides uniquement (Capture / Exterm / Sauvetage / Perturbation)</span>
                </button>
            </div>

            <div class="fissures-filter-bar">
                <div class="filter-group">
                    <span class="filter-label">Mode :</span>
                    <button class="filter-chip ${curFissureMode === "all" ? "active" : ""}" data-fissure-mode="all">Toutes</button>
                    <button class="filter-chip ${curFissureMode === "normal" ? "active" : ""}" data-fissure-mode="normal">${wfIcon("relic", "wf-icon-sm wf-icon-cyan")} Normal</button>
                    <button class="filter-chip ${curFissureMode === "hard" ? "active" : ""}" data-fissure-mode="hard">${wfIcon("weapon", "wf-icon-sm wf-icon-gold")} Route de l'Acier</button>
                    <button class="filter-chip ${curFissureMode === "storm" ? "active" : ""}" data-fissure-mode="storm">${wfIcon("void", "wf-icon-sm wf-icon-riven")} Tempêtes du Néant (Railjack)</button>
                </div>
                <div class="filter-group">
                    <span class="filter-label">Ère :</span>
                    <button class="filter-chip ${curFissureTier === "all" ? "active" : ""}" data-fissure-tier="all">Toutes</button>
                    <button class="filter-chip ${curFissureTier === "Lith" ? "active" : ""}" data-fissure-tier="Lith">Lith</button>
                    <button class="filter-chip ${curFissureTier === "Meso" ? "active" : ""}" data-fissure-tier="Meso">Meso</button>
                    <button class="filter-chip ${curFissureTier === "Neo" ? "active" : ""}" data-fissure-tier="Neo">Neo</button>
                    <button class="filter-chip ${curFissureTier === "Axi" ? "active" : ""}" data-fissure-tier="Axi">Axi</button>
                    <button class="filter-chip ${curFissureTier === "Requiem" ? "active" : ""}" data-fissure-tier="Requiem">Requiem</button>
                    <button class="filter-chip ${curFissureTier === "Omnia" ? "active" : ""}" data-fissure-tier="Omnia">Omnia</button>
                </div>
            </div>

            <div id="fissures-dynamic-area"></div>
        </section>

        <!-- CHASSE À L'ARCHONTE & SORTIE DU JOUR -->
        <section id="hub-sec-archon-sortie" class="ws-section">
            <div class="section-header">
                <h2 class="section-title">${wfIcon("target", "wf-icon-cyan")} Chasse à l'Archonte (Hebdomadaire) & Sortie du Jour</h2>
            </div>
            <div class="duviri-active-columns">
                <!-- Chasse à l'Archonte -->
                <div class="duviri-panel incarnon-panel">
                    <div class="duviri-panel-header">
                        <div>
                            <span class="duviri-mode-badge hard">${wfIcon("flame", "wf-icon-sm")} CHASSE À L'ARCHONTE — HEBDOMADAIRE</span>
                            <h3>${escapeHtml(archon.boss || "Archonte Narmer")} ${archon.faction ? `(${escapeHtml(archon.faction)})` : ""}</h3>
                        </div>
                        ${archon.expiry ? `
                            <span class="ws-cycle-timer" data-ws-expiry="${escapeHtml(archon.expiry)}">
                                ${formatCountdownMs(Date.parse(archon.expiry) - Date.now())}
                            </span>
                        ` : ""}
                    </div>
                    <div class="mission-stages-list">
                        ${archonMissions.length > 0 ? archonMissions.map((m, idx) => `
                            <div class="mission-stage-row">
                                <div class="mission-stage-num">Étape ${idx + 1}</div>
                                <img class="mission-stage-planet" src="${escapeHtml(getPlanetImageForLocation(m.node))}" alt="" onerror="this.src='${DEFAULT_FAVICON}'"/>
                                <div class="mission-stage-info">
                                    <div class="mission-stage-type">${escapeHtml(m.type || "Mission Archonte")}</div>
                                    <div class="mission-stage-node">${escapeHtml(m.node || "Secteur Narmer")}</div>
                                </div>
                            </div>
                        `).join("") : `<div style="padding:14px;color:var(--text-muted);">Données de la Chasse à l'Archonte en cours de synchronisation...</div>`}
                    </div>
                </div>

                <!-- Sortie du Jour -->
                <div class="duviri-panel warframe-panel">
                    <div class="duviri-panel-header">
                        <div>
                            <span class="duviri-mode-badge normal">${wfIcon("syndicate", "wf-icon-sm")} SORTIE DU JOUR — QUOTIDIENNE</span>
                            <h3>${escapeHtml(sortie.boss || "Commandant Ennemi")} ${sortie.faction ? `(${escapeHtml(sortie.faction)})` : ""}</h3>
                        </div>
                        ${sortie.expiry ? `
                            <span class="ws-cycle-timer" data-ws-expiry="${escapeHtml(sortie.expiry)}">
                                ${formatCountdownMs(Date.parse(sortie.expiry) - Date.now())}
                            </span>
                        ` : ""}
                    </div>
                    <div class="mission-stages-list">
                        ${sortieVariants.length > 0 ? sortieVariants.map((v, idx) => `
                            <div class="mission-stage-row">
                                <div class="mission-stage-num">Mission ${idx + 1}</div>
                                <img class="mission-stage-planet" src="${escapeHtml(getPlanetImageForLocation(v.node))}" alt="" onerror="this.src='${DEFAULT_FAVICON}'"/>
                                <div class="mission-stage-info">
                                    <div class="mission-stage-type">${escapeHtml(v.missionType || "Mission")} — <span style="color:var(--accent-cyan)">${escapeHtml(v.node || "")}</span></div>
                                    <div class="mission-stage-node">${escapeHtml(v.modifier || "Condition spéciale")}</div>
                                </div>
                            </div>
                        `).join("") : `<div style="padding:14px;color:var(--text-muted);">Données de la Sortie en cours de synchronisation...</div>`}
                    </div>
                </div>
            </div>
        </section>

        <!-- ALERTES SONORES DE FISSURES -->
        <section class="ws-section">
            ${renderWorldAlertsPanelHtml("fissures")}
        </section>
    `;

    const duviriSectionHtml = `
        <!-- VUE 2 : ROTATIONS DUVIRI (WARFRAMES & ARMES INCARNON) -->
        <section id="hub-sec-duviri" class="ws-section">
            <div class="section-header">
                <h2 class="section-title">${wfIcon("weapon", "wf-icon-riven")} Rotations du Circuit de Duviri (Armes Incarnon Genesis & Warframes)</h2>
                <div class="ws-rot-timer-pill">
                    ${wfIcon("clock", "wf-icon-sm wf-icon-cyan")}
                    <span>Prochaine rotation hebdomadaire dans : <strong data-ws-expiry="${escapeHtml(nextMondayUtc)}">${formatCountdownMs(Date.parse(nextMondayUtc) - Date.now())}</strong></span>
                </div>
            </div>

            <div class="duviri-active-columns">
                <!-- Armes Incarnon de la Semaine (Route de l'Acier) -->
                <div class="duviri-panel incarnon-panel">
                    <div class="duviri-panel-header">
                        <div>
                            <span class="duviri-mode-badge hard">${wfIcon("weapon", "wf-icon-sm")} ROUTE DE L'ACIER — EN COURS</span>
                            <h3>Armes Incarnon Genesis de cette semaine ${activeIncarnonWeekIdx >= 0 ? `(${DUVIRI_INCARNON_ROTATIONS[activeIncarnonWeekIdx].code})` : ""}</h3>
                        </div>
                    </div>
                    <div class="duviri-active-items-grid">
                        ${activeIncarnonWeapons.map(wName => {
                            const wfmItem = matchDuviriWeaponToWfm(wName);
                            const img = wfmItem ? getItemThumb(wfmItem) : DEFAULT_FAVICON;
                            const url = wfmItem
                                ? `https://warframe.market/items/${wfmItem.slug}`
                                : `https://warframe.market/items?q=${encodeURIComponent(wName)}`;
                            const subLabel = wfmItem ? getItemName(wfmItem) : `${wName} Incarnon`;
                            return `
                                <div class="duviri-item-card" data-open-url="${escapeHtml(url)}" title="Voir ${escapeHtml(wName)} sur Warframe Market">
                                    <img src="${escapeHtml(img)}" alt="${escapeHtml(wName)}" onerror="this.src='${DEFAULT_FAVICON}'"/>
                                    <div class="duviri-item-info">
                                        <div class="duviri-item-name">${escapeHtml(wName)}</div>
                                        <div class="duviri-item-sub">${escapeHtml(subLabel)}</div>
                                    </div>
                                    <button class="item-card-newtab" data-newtab-url="${escapeHtml(url)}" title="Ouvrir dans un nouvel onglet">↗</button>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>

                <!-- Warframes de la Semaine (Circuit Normal) -->
                <div class="duviri-panel warframe-panel">
                    <div class="duviri-panel-header">
                        <div>
                            <span class="duviri-mode-badge normal">${wfIcon("warframe", "wf-icon-sm")} CIRCUIT NORMAL — EN COURS</span>
                            <h3>Warframes disponibles cette semaine ${activeFrameWeekIdx >= 0 ? `(Semaine ${activeFrameWeekIdx + 1}/11)` : ""}</h3>
                        </div>
                    </div>
                    <div class="duviri-active-items-grid">
                        ${activeDuviriFrames.map(fName => {
                            const wfmItem = matchDuviriWarframeToWfm(fName);
                            const img = wfmItem ? getItemThumb(wfmItem) : DEFAULT_FAVICON;
                            const url = wfmItem
                                ? `https://warframe.market/items/${wfmItem.slug}`
                                : `https://warframe.market/items?q=${encodeURIComponent(fName)}`;
                            const subLabel = wfmItem ? getItemName(wfmItem) : `${fName} Prime Set`;
                            return `
                                <div class="duviri-item-card" data-open-url="${escapeHtml(url)}" title="Voir ${escapeHtml(fName)} Prime sur Warframe Market">
                                    <img src="${escapeHtml(img)}" alt="${escapeHtml(fName)}" onerror="this.src='${DEFAULT_FAVICON}'"/>
                                    <div class="duviri-item-info">
                                        <div class="duviri-item-name">${escapeHtml(fName)}</div>
                                        <div class="duviri-item-sub">${escapeHtml(subLabel)}</div>
                                    </div>
                                    <button class="item-card-newtab" data-newtab-url="${escapeHtml(url)}" title="Ouvrir dans un nouvel onglet">↗</button>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>
            </div>

            <!-- Calendrier Complet des Rotations Duviri (8 semaines Incarnon + 11 semaines Warframes) -->
            <div class="duviri-schedule-columns">
                <div class="orders-panel" style="padding:14px 16px;">
                    <h4 class="schedule-subtitle">${wfIcon("weapon", "wf-icon-sm wf-icon-riven")} Calendrier Complet des 8 Rotations d'Armes Incarnon (Route de l'Acier)</h4>
                    <div class="duviri-rotation-list">
                        ${DUVIRI_INCARNON_ROTATIONS.map((rot, idx) => {
                            const isCurrent = idx === activeIncarnonWeekIdx;
                            return `
                                <div class="duviri-rotation-row ${isCurrent ? "active-week" : ""}">
                                    <div class="rot-week-label">
                                        <strong>${escapeHtml(rot.code)}</strong>
                                        ${isCurrent ? `<span class="rot-current-pill">EN COURS</span>` : ""}
                                    </div>
                                    <div class="rot-weapons-chips">
                                        ${rot.weapons.map(w => {
                                            const wfm = matchDuviriWeaponToWfm(w);
                                            const u = wfm ? `https://warframe.market/items/${wfm.slug}` : `https://warframe.market/items?q=${encodeURIComponent(w)}`;
                                            return `<span class="rot-item-chip" data-open-url="${escapeHtml(u)}">${escapeHtml(w)}</span>`;
                                        }).join("")}
                                    </div>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>

                <div class="orders-panel" style="padding:14px 16px;">
                    <h4 class="schedule-subtitle">${wfIcon("warframe", "wf-icon-sm wf-icon-cyan")} Calendrier Complet des 11 Rotations de Warframes (Circuit Normal)</h4>
                    <div class="duviri-rotation-list">
                        ${DUVIRI_WARFRAME_ROTATIONS.map((rot, idx) => {
                            const isCurrent = idx === activeFrameWeekIdx;
                            return `
                                <div class="duviri-rotation-row ${isCurrent ? "active-week" : ""}">
                                    <div class="rot-week-label">
                                        <strong>Semaine ${rot.week}</strong>
                                        ${isCurrent ? `<span class="rot-current-pill">EN COURS</span>` : ""}
                                    </div>
                                    <div class="rot-weapons-chips">
                                        ${rot.frames.map(f => {
                                            const wfm = matchDuviriWarframeToWfm(f);
                                            const u = wfm ? `https://warframe.market/items/${wfm.slug}` : `https://warframe.market/items?q=${encodeURIComponent(f)}`;
                                            return `<span class="rot-item-chip" data-open-url="${escapeHtml(u)}">${escapeHtml(f)}</span>`;
                                        }).join("")}
                                    </div>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>
            </div>
        </section>
    `;

    const baroSectionHtml = `
        <!-- VUE 3 : BOUTIQUE DE BARO KI'TEER -->
        <section id="hub-sec-baro" class="ws-section">
            <div class="baro-hero-banner ${baroActive ? "baro-active" : "baro-away"}">
                <div class="baro-hero-left">
                    <div class="baro-emblem">
                        <img class="baro-portrait-img" src="${WF_PLANET_IMAGES.baro_portrait}" alt="Baro Ki'Teer" onerror="this.style.display='none'"/>
                    </div>
                    <div>
                        <div class="baro-status-row">
                            <span class="baro-status-badge ${baroActive ? "present" : "incoming"}">
                                ${baroActive ? "● BARO KI'TEER EST PRÉSENT AU RELAIS" : "● EN APPROCHE DANS LE NÉANT"}
                            </span>
                            <span class="baro-location-pill">
                                <img class="baro-loc-planet-img" src="${escapeHtml(baroPlanetImg)}" alt=""/>
                                <span>${escapeHtml(vt.location || "Relais Tenno")}</span>
                            </span>
                        </div>
                        <h2 class="baro-title">Boutique de Baro Ki'Teer — Marchand du Néant</h2>
                        <div class="baro-subtitle">
                            ${baroActive
                                ? `Départ du relais dans : <strong class="baro-countdown" data-ws-expiry="${escapeHtml(baroTargetIso || "")}">${formatCountdownMs(Date.parse(baroTargetIso || "") - Date.now())}</strong>`
                                : `Prochaine arrivée dans : <strong class="baro-countdown" data-ws-expiry="${escapeHtml(baroTargetIso || "")}">${formatCountdownMs(Date.parse(baroTargetIso || "") - Date.now())}</strong> (Affichage du catalogue de Baro Ki'Teer ci-dessous)`}
                        </div>
                    </div>
                </div>
                <div class="baro-hero-controls">
                    <input type="text" id="baro-search-input" class="seller-search" placeholder="Rechercher un item de Baro..." value="${escapeHtml(tab.viewState.baroSearch || "")}"/>
                    <select id="baro-sort-select" class="alert-inline-select">
                        <option value="plat_desc" ${tab.viewState.baroSort === "plat_desc" ? "selected" : ""}>Trier : Prix Platinum (Décroissant)</option>
                        <option value="ratio_desc" ${tab.viewState.baroSort === "ratio_desc" ? "selected" : ""}>Trier : Rentabilité (Plat / 100 Ducats)</option>
                        <option value="ducats_desc" ${tab.viewState.baroSort === "ducats_desc" ? "selected" : ""}>Trier : Coût en Ducats</option>
                        <option value="name_asc" ${tab.viewState.baroSort === "name_asc" ? "selected" : ""}>Trier : Nom (A → Z)</option>
                    </select>
                </div>
            </div>

            <div class="baro-filter-bar">
                <div class="filter-group">
                    <span class="filter-label">Afficher :</span>
                    <button class="filter-chip ${tab.viewState.baroFilter === "all" ? "active" : ""}" data-baro-filter="all">Tous les items</button>
                    <button class="filter-chip ${tab.viewState.baroFilter === "tradable" ? "active" : ""}" data-baro-filter="tradable">${wfIcon("plat", "wf-icon-sm wf-icon-cyan")} Vendables en Platinum uniquement</button>
                    <button class="filter-chip ${tab.viewState.baroFilter === "mods" ? "active" : ""}" data-baro-filter="mods">${wfIcon("mod", "wf-icon-sm wf-icon-gold")} Mods Accrus & Mods</button>
                    <button class="filter-chip ${tab.viewState.baroFilter === "weapons" ? "active" : ""}" data-baro-filter="weapons">${wfIcon("weapon", "wf-icon-sm wf-icon-cyan")} Armes & Reliques</button>
                </div>
                <button class="btn-secondary btn-sm" id="btn-baro-reload-prices">${wfIcon("repeat", "wf-icon-sm wf-icon-cyan")} Recalculer les prix Platinum</button>
            </div>

            <div id="baro-shop-dynamic-area"></div>
        </section>
    `;

    const invasionsSectionHtml = renderInvasionsAndSteelPathSectionHtml(ws, tab);

    if (activeSection === "fissures") {
        container.innerHTML = fissuresSectionHtml;
    } else if (activeSection === "invasions") {
        container.innerHTML = invasionsSectionHtml;
    } else if (activeSection === "duviri") {
        container.innerHTML = duviriSectionHtml;
    } else if (activeSection === "baro") {
        container.innerHTML = baroSectionHtml;
    } else {
        container.innerHTML = planetsSectionHtml;
    }

    // Rendu dynamique des Fissures si on est sur la vue Fissures & Missions
    const fissuresArea = container.querySelector("#fissures-dynamic-area");
    if (fissuresArea) {
        renderFissuresDynamicArea(fissuresArea, tab, ws);
    }

    // Filtres Fissures du Néant
    container.querySelectorAll("[data-fissure-mode]").forEach(btn => {
        btn.addEventListener("click", () => {
            tab.viewState.fissureMode = btn.dataset.fissureMode;
            container.querySelectorAll("[data-fissure-mode]").forEach(b => b.classList.toggle("active", b === btn));
            if (fissuresArea) renderFissuresDynamicArea(fissuresArea, tab, ws);
        });
    });

    container.querySelectorAll("[data-fissure-tier]").forEach(btn => {
        btn.addEventListener("click", () => {
            tab.viewState.fissureTier = btn.dataset.fissureTier;
            container.querySelectorAll("[data-fissure-tier]").forEach(b => b.classList.toggle("active", b === btn));
            if (fissuresArea) renderFissuresDynamicArea(fissuresArea, tab, ws);
        });
    });

    const fastFissureBtn = container.querySelector("#btn-fissure-fast-only");
    fastFissureBtn?.addEventListener("click", () => {
        tab.viewState.fissureFastOnly = !tab.viewState.fissureFastOnly;
        fastFissureBtn.classList.toggle("active", tab.viewState.fissureFastOnly);
        if (fissuresArea) renderFissuresDynamicArea(fissuresArea, tab, ws);
    });

    // Rendu de la grille Baro Ki'Teer si on est sur la vue Marchand
    const baroArea = container.querySelector("#baro-shop-dynamic-area");
    if (baroArea) {
        renderBaroShopDynamicArea(baroArea, tab);
    }

    // Changement de Syndicat pour les Mises à Prix
    container.querySelectorAll("[data-bounty-synd]").forEach(btn => {
        btn.addEventListener("click", () => {
            tab.viewState.bountySyndicate = btn.dataset.bountySynd;
            container.querySelectorAll("[data-bounty-synd]").forEach(b => b.classList.toggle("active", b === btn));
            const bArea = container.querySelector("#bounties-dynamic-area");
            if (bArea) {
                bArea.innerHTML = renderBountiesForSyndicateHtml(syndicates, tab.viewState.bountySyndicate);
                bindCommonPageEvents(bArea, tab);
            }
        });
    });

    // Filtres Baro Ki'Teer
    container.querySelectorAll("[data-baro-filter]").forEach(btn => {
        btn.addEventListener("click", () => {
            tab.viewState.baroFilter = btn.dataset.baroFilter;
            container.querySelectorAll("[data-baro-filter]").forEach(b => b.classList.toggle("active", b === btn));
            if (baroArea) renderBaroShopDynamicArea(baroArea, tab);
        });
    });

    const baroSearch = container.querySelector("#baro-search-input");
    baroSearch?.addEventListener("input", () => {
        tab.viewState.baroSearch = baroSearch.value;
        if (baroArea) renderBaroShopDynamicArea(baroArea, tab);
    });

    const baroSort = container.querySelector("#baro-sort-select");
    baroSort?.addEventListener("change", () => {
        tab.viewState.baroSort = baroSort.value;
        if (baroArea) renderBaroShopDynamicArea(baroArea, tab);
    });

    container.querySelector("#btn-baro-reload-prices")?.addEventListener("click", () => {
        loadBaroPlatinumPrices(ws?.voidTrader?.inventory || [], true);
    });

    bindWorldAlertsPanelEvents(container);
    bindCommonPageEvents(container, tab);
}

function switchHubSection(secId) {
    const valid = ["planets", "fissures", "invasions", "duviri", "baro"].includes(secId) ? secId : "planets";
    State.hubTab.viewState.hubSection = valid;
    State.hubTab.url = `https://warframe.market/worldstate/${valid}`;
    if (State.activeTabId !== "hub") {
        activateTab("hub");
    } else {
        syncBrowserChromeToActiveTab();
        renderActiveTabPage();
    }
}

function renderFissuresDynamicArea(areaContainer, tab, ws) {
    const rawFissures = Array.isArray(ws?.fissures) ? ws.fissures : [];
    const now = Date.now();
    const modeFilter = tab.viewState.fissureMode || "all";
    const tierFilter = tab.viewState.fissureTier || "all";
    const fastOnly = !!tab.viewState.fissureFastOnly;

    const activeFissures = rawFissures.filter(f => {
        if (!f || f.expired) return false;
        const expMs = Date.parse(f.expiry || "");
        if (Number.isFinite(expMs) && expMs <= now) return false;

        if (modeFilter === "normal" && (f.isHard || f.isStorm)) return false;
        if (modeFilter === "hard" && !f.isHard) return false;
        if (modeFilter === "storm" && !f.isStorm) return false;

        if (tierFilter !== "all" && String(f.tier || "").toLowerCase() !== tierFilter.toLowerCase()) {
            return false;
        }
        if (fastOnly && !isFastMissionType(f.missionType)) {
            return false;
        }
        return true;
    });

    activeFissures.sort((a, b) => {
        const tA = a.tierNum || 1;
        const tB = b.tierNum || 1;
        if (tA !== tB) return tA - tB;
        if (!!a.isHard !== !!b.isHard) return a.isHard ? -1 : 1;
        return Date.parse(a.expiry || "") - Date.parse(b.expiry || "");
    });

    if (activeFissures.length === 0) {
        areaContainer.innerHTML = `
            <div class="orders-panel" style="padding:28px;text-align:center;color:var(--text-muted);">
                Aucune fissure active ne correspond aux filtres sélectionnés.
            </div>
        `;
        return;
    }

    areaContainer.innerHTML = `
        <div class="fissures-grid">
            ${activeFissures.map(f => {
                const planetImg = getPlanetImageForLocation(f.node);
                const isFast = isFastMissionType(f.missionType);
                const relicUrl = `https://warframe.market/items?q=${encodeURIComponent(f.tier || "Relic")}`;
                const modeBadge = f.isHard
                    ? `<span class="fissure-mode-pill hard">Route de l'Acier</span>`
                    : (f.isStorm ? `<span class="fissure-mode-pill storm">Tempête Railjack</span>` : `<span class="fissure-mode-pill normal">Normal</span>`);
                return `
                    <div class="fissure-card ${f.isHard ? "fissure-hard" : ""} ${isFast ? "fissure-fast" : ""}" data-open-url="${escapeHtml(relicUrl)}" title="Voir les reliques ${escapeHtml(f.tier || "")} sur Warframe Market">
                        <div class="fissure-card-left">
                            <img class="fissure-planet-img" src="${escapeHtml(planetImg)}" alt="" onerror="this.src='${DEFAULT_FAVICON}'"/>
                            <div class="fissure-info">
                                <div class="fissure-top-badges">
                                    <span class="fissure-tier-badge">${wfIcon("relic", "wf-icon-sm wf-icon-gold")} ${escapeHtml(f.tier || "Relique")}</span>
                                    ${modeBadge}
                                    ${isFast ? `<span class="fissure-fast-badge">⚡ RAPIDE</span>` : ""}
                                </div>
                                <div class="fissure-mission-title">
                                    ${escapeHtml(f.missionType || "Mission")} · <span style="color:var(--text-secondary);font-weight:600;">${escapeHtml(f.enemy || "")}</span>
                                </div>
                                <div class="fissure-node-sub">${escapeHtml(f.node || "Secteur")}</div>
                            </div>
                        </div>
                        <div class="fissure-card-right">
                            <span class="ws-cycle-timer" data-ws-expiry="${escapeHtml(f.expiry || "")}">
                                ${formatCountdownMs(Date.parse(f.expiry || "") - now)}
                            </span>
                        </div>
                    </div>
                `;
            }).join("")}
        </div>
    `;
    bindCommonPageEvents(areaContainer, tab);
}

function renderBountiesForSyndicateHtml(syndicates, syndicateKey) {
    const syndObj = (syndicates || []).find(s =>
        s.syndicateKey === syndicateKey ||
        String(s.syndicate || "").toLowerCase().includes(syndicateKey.toLowerCase())
    );

    if (!syndObj || !Array.isArray(syndObj.jobs) || syndObj.jobs.length === 0) {
        return `<div class="orders-panel" style="padding:24px;text-align:center;color:var(--text-muted);">Chargement des mises à prix en cours pour ${escapeHtml(syndicateKey)}...</div>`;
    }

    const expiryIso = resolveLiveCycle({ expiry: syndObj.expiry }, "zariman").expiry;
    const planetImg = syndicateKey === "Solaris United"
        ? WF_PLANET_IMAGES.venus
        : (syndicateKey === "Entrati" ? WF_PLANET_IMAGES.deimos : WF_PLANET_IMAGES.earth);
    const planetZoneLabel = syndicateKey === "Solaris United"
        ? "Vénus · Vallée Orbis (Fortuna)"
        : (syndicateKey === "Entrati" ? "Deimos · Puy de Cambion (Necralisk)" : "Terre · Plaines d'Eidolon (Cetus)");

    return `
        <div class="bounty-header-strip">
            <div class="bounty-header-planet-info">
                <img class="bounty-header-planet-img" src="${planetImg}" alt=""/>
                <span><strong>${escapeHtml(syndObj.syndicate || syndicateKey)}</strong> (${escapeHtml(planetZoneLabel)}) — ${syndObj.jobs.length} Mises à Prix actives</span>
            </div>
            <span>Renouvellement des récompenses dans : <strong class="ws-inline-timer" data-ws-expiry="${escapeHtml(expiryIso)}">${formatCountdownMs(Date.parse(expiryIso) - Date.now())}</strong></span>
        </div>
        <div class="bounties-grid">
            ${syndObj.jobs.map(job => {
                const levels = Array.isArray(job.enemyLevels) && job.enemyLevels.length >= 2
                    ? `Niv. ${job.enemyLevels[0]} - ${job.enemyLevels[1]}`
                    : "Niv. Variable";
                const totalStanding = Array.isArray(job.standingStages)
                    ? job.standingStages.reduce((a, b) => a + (Number(b) || 0), 0)
                    : 0;
                const rewards = Array.isArray(job.rewardPool) ? job.rewardPool : [];

                return `
                    <div class="bounty-card">
                        <div class="bounty-card-top">
                            <div class="bounty-title">${escapeHtml(job.type || "Mise à Prix")}</div>
                            <div class="bounty-badges">
                                <span class="bounty-lvl-badge">${escapeHtml(levels)}</span>
                                ${totalStanding > 0 ? `<span class="bounty-rep-badge">${wfIcon("rep", "wf-icon-sm wf-icon-gold")} +${totalStanding.toLocaleString("fr-FR")}</span>` : ""}
                            </div>
                        </div>
                        <div class="bounty-rewards-label">Récompenses de la rotation actuelle :</div>
                        <div class="bounty-rewards-pool">
                            ${rewards.length > 0 ? rewards.map(rName => {
                                const wfm = matchBaroItemToWfm(rName);
                                if (wfm) {
                                    const itemUrl = `https://warframe.market/items/${wfm.slug}`;
                                    return `<span class="bounty-reward-chip tradable" data-open-url="${escapeHtml(itemUrl)}" title="Échangeable sur Warframe Market — Cliquer pour voir le prix en Platinum">${wfIcon("plat", "wf-icon-sm wf-icon-cyan")} ${escapeHtml(rName)}</span>`;
                                }
                                return `<span class="bounty-reward-chip">${escapeHtml(rName)}</span>`;
                            }).join("") : `<span style="color:var(--text-muted);font-size:12px;">Pool de récompenses standard du syndicat</span>`}
                        </div>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}

function renderBaroShopDynamicArea(areaContainer, tab) {
    const ws = tab.cachedData.worldstate || State.worldstateData || buildFallbackWorldstate();
    const rawInventory = (ws.voidTrader && Array.isArray(ws.voidTrader.inventory) && ws.voidTrader.inventory.length > 0)
        ? ws.voidTrader.inventory
        : BARO_CLASSIC_STOCK;

    const enriched = rawInventory.map(entry => {
        const rawName = String(entry.item || "Item du Néant");
        const lowName = rawName.toLowerCase();
        const wfmItem = matchBaroItemToWfm(rawName);
        const isTradable = !!wfmItem;
        const priceInfo = (wfmItem && State.baroPricesBySlug.get(wfmItem.slug)) || null;

        const displayName = wfmItem
            ? getItemName(wfmItem)
            : (BARO_INTERNAL_LABELS[lowName] || BARO_INTERNAL_LABELS[rawName] || rawName);

        const enSubName = wfmItem
            ? getItemEnName(wfmItem)
            : rawName;

        const ducats = Number(entry.ducats) || 0;
        const credits = Number(entry.credits) || 0;
        const minSell = priceInfo?.minSell ?? null;
        const maxBuy = priceInfo?.maxBuy ?? null;
        const ratio = (minSell && ducats > 0) ? ((minSell / ducats) * 100) : 0;

        const tags = wfmItem ? (wfmItem.tags || []) : [];
        const isMod = tags.includes("mod") || lowName.includes("primed") || lowName.includes("mod");
        const isWeaponOrRelic = tags.includes("weapon") || tags.includes("relic") || lowName.includes("relic") || lowName.includes("vandal") || lowName.includes("wraith") || lowName.includes("prisma") || lowName.includes("weapon");

        return {
            rawName,
            displayName,
            enSubName,
            ducats,
            credits,
            wfmItem,
            isTradable,
            priceInfo,
            minSell,
            maxBuy,
            ratio,
            isMod,
            isWeaponOrRelic
        };
    });

    // Filtrage
    const filterMode = tab.viewState.baroFilter || "all";
    const searchQ = normalizeSearch(tab.viewState.baroSearch || "");

    let filtered = enriched.filter(it => {
        if (filterMode === "tradable" && !it.isTradable) return false;
        if (filterMode === "mods" && !it.isMod) return false;
        if (filterMode === "weapons" && !it.isWeaponOrRelic) return false;
        if (searchQ) {
            const hay = normalizeSearch(`${it.displayName} ${it.enSubName} ${it.rawName}`);
            if (!hay.includes(searchQ)) return false;
        }
        return true;
    });

    // Tri
    const sortMode = tab.viewState.baroSort || "plat_desc";
    filtered.sort((a, b) => {
        if (sortMode === "plat_desc") {
            if (a.isTradable !== b.isTradable) return a.isTradable ? -1 : 1;
            return (b.minSell || 0) - (a.minSell || 0) || (b.ducats - a.ducats);
        }
        if (sortMode === "ratio_desc") {
            if (a.isTradable !== b.isTradable) return a.isTradable ? -1 : 1;
            return (b.ratio || 0) - (a.ratio || 0);
        }
        if (sortMode === "ducats_desc") {
            return b.ducats - a.ducats;
        }
        return a.displayName.localeCompare(b.displayName, "fr");
    });

    const totalTradable = enriched.filter(x => x.isTradable).length;

    areaContainer.innerHTML = `
        <div class="baro-summary-strip">
            <span><strong>${filtered.length}</strong> / ${enriched.length} items affichés · <strong>${totalTradable} items vendables en Platinum</strong> sur Warframe Market</span>
            ${State.baroPricesLoading ? `<span style="color:var(--accent-cyan);">${wfIcon("repeat", "wf-icon-sm wf-icon-cyan")} Synchronisation des prix Platinum en direct...</span>` : `<span style="color:var(--sell-color);">● Prix Platinum synchronisés avec Warframe Market</span>`}
        </div>

        <div class="baro-shop-grid">
            ${filtered.map(it => {
                const itemUrl = it.wfmItem ? `https://warframe.market/items/${it.wfmItem.slug}` : "";
                const thumb = it.wfmItem ? getItemThumb(it.wfmItem) : DEFAULT_FAVICON;
                const isFav = it.wfmItem ? isItemFavorite(it.wfmItem.slug) : false;

                let platSectionHtml = "";
                if (it.isTradable) {
                    const pInfo = it.priceInfo;
                    const sellText = pInfo
                        ? (it.minSell !== null ? `${it.minSell} Platinum` : "Aucune offre en jeu")
                        : "Calcul en cours...";
                    const buyText = pInfo
                        ? (it.maxBuy !== null ? `${it.maxBuy} Platinum` : "Aucun acheteur direct")
                        : "Calcul en cours...";

                    platSectionHtml = `
                        <div class="baro-plat-box tradable">
                            <div class="baro-plat-row">
                                <span class="baro-plat-label">${wfIcon("plat", "wf-icon-sm wf-icon-cyan")} Prix d'Achat en Platinum (Vendeur) :</span>
                                <strong class="baro-plat-val sell">${escapeHtml(sellText)}</strong>
                            </div>
                            <div class="baro-plat-row">
                                <span class="baro-plat-label">${wfIcon("chart", "wf-icon-sm wf-icon-gold")} Prix de Revente Marché (Liste) :</span>
                                <strong class="baro-plat-val sell">${it.minSell !== null ? `${it.minSell} Platinum` : "—"}</strong>
                            </div>
                            <div class="baro-plat-row">
                                <span class="baro-plat-label">${wfIcon("plat", "wf-icon-sm wf-icon-riven")} Revente Directe (Acheteur immédiat) :</span>
                                <strong class="baro-plat-val buy">${escapeHtml(buyText)}</strong>
                            </div>
                            ${it.ratio > 0 ? `
                                <div class="baro-ratio-line">
                                    Rentabilité Ducats → Plat : <strong>${it.ratio.toFixed(1)} Plat / 100 Ducats</strong>
                                </div>
                            ` : ""}
                            <div class="baro-plat-actions">
                                <button class="btn-secondary btn-sm" data-open-url="${escapeHtml(itemUrl)}">Fiche Marché</button>
                                ${it.minSell !== null && pInfo?.bestSeller ? `
                                    <button class="btn-trade sell"
                                        data-whisper-user="${escapeHtml(pInfo.bestSeller.ingameName)}"
                                        data-whisper-item-en="${escapeHtml(getItemEnName(it.wfmItem))}"
                                        data-whisper-item-fr="${escapeHtml(getItemName(it.wfmItem))}"
                                        data-whisper-price="${it.minSell}"
                                        data-whisper-type="sell"
                                        data-whisper-rank="${pInfo.bestSeller.rank}"
                                        data-whisper-maxrank="${it.wfmItem.maxRank ?? ""}">
                                        Acheter ${it.minSell}p (/w)
                                    </button>
                                ` : ""}
                                ${it.maxBuy !== null && pInfo?.bestBuyer ? `
                                    <button class="btn-trade buy"
                                        data-whisper-user="${escapeHtml(pInfo.bestBuyer.ingameName)}"
                                        data-whisper-item-en="${escapeHtml(getItemEnName(it.wfmItem))}"
                                        data-whisper-item-fr="${escapeHtml(getItemName(it.wfmItem))}"
                                        data-whisper-price="${it.maxBuy}"
                                        data-whisper-type="buy"
                                        data-whisper-rank="${pInfo.bestBuyer.rank}"
                                        data-whisper-maxrank="${it.wfmItem.maxRank ?? ""}">
                                        Revendre ${it.maxBuy}p (/w)
                                    </button>
                                ` : ""}
                            </div>
                        </div>
                    `;
                } else {
                    platSectionHtml = `
                        <div class="baro-plat-box non-tradable">
                            <div class="non-tradable-badge">
                                ${wfIcon("syndicate", "wf-icon-sm")} Cosmétique / Objet lié au compte (Non échangeable en Platinum)
                            </div>
                        </div>
                    `;
                }

                return `
                    <div class="baro-item-card ${it.isTradable ? "is-tradable" : "is-cosmetic"}">
                        <div class="baro-card-top">
                            <div class="baro-thumb-wrap" ${itemUrl ? `data-open-url="${escapeHtml(itemUrl)}"` : ""}>
                                ${it.wfmItem
                                    ? `<img class="baro-item-img" src="${escapeHtml(thumb)}" alt="${escapeHtml(it.displayName)}" loading="lazy" onerror="this.src='${DEFAULT_FAVICON}'"/>`
                                    : `<div class="baro-cosmetic-icon">${wfIcon("void", "wf-icon-gold")}</div>`
                                }
                            </div>
                            <div class="baro-item-head-info">
                                <div class="baro-badge-line">
                                    ${it.isTradable
                                        ? `<span class="baro-tag tradable-tag">${wfIcon("plat", "wf-icon-sm")} VENDABLE EN PLATINUM</span>`
                                        : `<span class="baro-tag cosmetic-tag">COLLECTION DU NÉANT</span>`
                                    }
                                    ${it.wfmItem ? `
                                        <div style="display:flex;gap:4px;">
                                            <button class="item-card-fav-btn ${isFav ? "active" : ""}" data-fav-slug="${escapeHtml(it.wfmItem.slug)}" title="Ajouter aux favoris">${wfIcon("star", "wf-icon-sm")}</button>
                                            <button class="item-card-newtab" data-newtab-url="${escapeHtml(itemUrl)}" title="Ouvrir dans un nouvel onglet">↗</button>
                                        </div>
                                    ` : ""}
                                </div>
                                <div class="baro-item-title" ${itemUrl ? `data-open-url="${escapeHtml(itemUrl)}"` : ""}>
                                    ${escapeHtml(it.displayName)}
                                </div>
                                ${it.enSubName !== it.displayName ? `<div class="baro-item-sub">${escapeHtml(it.enSubName)}</div>` : ""}
                            </div>
                        </div>

                        <!-- Coût d'achat chez Baro Ki'Teer (Ducats + Crédits) -->
                        <div class="baro-cost-bar">
                            <div class="baro-cost-pill ducats">
                                ${wfIcon("ducats", "wf-icon-sm wf-icon-gold")}
                                <span>Achat Baro : <strong>${it.ducats.toLocaleString("fr-FR")} Ducats</strong></span>
                            </div>
                            <div class="baro-cost-pill credits">
                                ${wfIcon("credits", "wf-icon-sm wf-icon-cyan")}
                                <span>+ <strong>${it.credits.toLocaleString("fr-FR")} Crédits</strong></span>
                            </div>
                        </div>

                        <!-- Prix d'achat & de revente en Platinum -->
                        ${platSectionHtml}
                    </div>
                `;
            }).join("")}
        </div>
    `;

    bindCommonPageEvents(areaContainer, tab);
}

/* ---------- 1. PAGE D'ACCUEIL (https://warframe.market/) ---------- */

function renderHomePage(container, tab) {
    const featuredItems = FEATURED_SLUGS
        .map(slug => State.itemsBySlug.get(slug))
        .filter(Boolean);

    const recentOrders = (tab.cachedData.recentOrders || []).slice(0, 20);

    container.innerHTML = `
        <section class="home-hero">
            <div class="hero-text">
                <h1>Bienvenue sur <span>Warframe Market</span> (WireMarket)</h1>
                <p>Consultez les ordres d'achat et de vente en temps réel, ouvrez plusieurs items dans des onglets dédiés et copiez vos messages d'échange <code>/w</code> en un clic.</p>
                <div class="quick-tags">
                    <button class="tag-chip" data-quick-cat="prime_set">${wfIcon("prime", "wf-icon-gold")} Sets Prime</button>
                    <button class="tag-chip" data-quick-cat="warframe">${wfIcon("warframe", "wf-icon-cyan")} Warframes</button>
                    <button class="tag-chip" data-quick-cat="weapon">${wfIcon("weapon", "wf-icon-cyan")} Armes</button>
                    <button class="tag-chip" data-quick-cat="mod">${wfIcon("mod", "wf-icon-cyan")} Mods</button>
                    <button class="tag-chip" data-quick-cat="arcane_enhancement">${wfIcon("arcane", "wf-icon-riven")} Arcanes</button>
                    <button class="tag-chip" data-quick-cat="relic">${wfIcon("relic", "wf-icon-gold")} Reliques</button>
                </div>
            </div>
            <div>
                <button class="btn-primary" id="btn-hero-refresh">↻ Actualiser le marché en direct</button>
            </div>
        </section>

        <section>
            <div class="section-header">
                <h2 class="section-title">Items Populaires & Sets Prime</h2>
                <span style="color:var(--text-muted);font-size:12.5px;">Astuce : Clic molette ou bouton ↗ pour ouvrir dans un nouvel onglet</span>
            </div>
            <div class="featured-grid">
                ${featuredItems.map(item => renderItemCardHtml(item)).join("")}
            </div>
        </section>

        <section>
            <div class="section-header">
                <h2 class="section-title">Derniers Ordres Mis en Ligne (Temps Réel)</h2>
                <button class="btn-secondary btn-sm" data-open-url="https://warframe.market/recent">Voir tous les ordres récents →</button>
            </div>
            ${renderRecentOrdersTableHtml(recentOrders)}
        </section>
    `;

    bindCommonPageEvents(container, tab);
    const refreshBtn = container.querySelector("#btn-hero-refresh");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => navigateTab(tab.id, tab.url, { pushHistory: false, forceRefresh: true }));
    }
    container.querySelectorAll("[data-quick-cat]").forEach(btn => {
        btn.addEventListener("click", () => {
            tab.viewState.catalogCategory = btn.dataset.quickCat;
            navigateTab(tab.id, "https://warframe.market/items");
        });
    });
}

function renderItemCardHtml(item) {
    const url = `https://warframe.market/items/${item.slug}`;
    const name = getItemName(item);
    const enName = getItemEnName(item);
    const tags = (item.tags || []).slice(0, 3).join(" · ");
    const isFav = isItemFavorite(item.slug);
    const inCart = isItemInCart(item.slug);
    return `
        <div class="item-card" data-open-url="${escapeHtml(url)}">
            <img class="item-card-img" src="${escapeHtml(getItemThumb(item))}" alt="${escapeHtml(name)}" loading="lazy" onerror="this.src='${DEFAULT_FAVICON}'"/>
            <div class="item-card-body">
                <div class="item-card-title">${escapeHtml(name)}</div>
                <div class="item-card-sub">${escapeHtml(State.lang === "fr" && enName !== name ? enName : tags)}</div>
            </div>
            <div class="item-card-actions">
                <button class="item-card-cart-btn ${inCart ? "active" : ""}" data-cart-slug="${escapeHtml(item.slug)}" title="${inCart ? "Retirer du panier d'achats" : "Ajouter au panier d'achats"}">${wfIcon("cart", "wf-icon-sm")}</button>
                <button class="item-card-fav-btn ${isFav ? "active" : ""}" data-fav-slug="${escapeHtml(item.slug)}" title="${isFav ? "Retirer des items favoris" : "Ajouter aux items favoris"}">${wfIcon("star", "wf-icon-sm")}</button>
                <button class="item-card-newtab" data-newtab-url="${escapeHtml(url)}" title="Ouvrir dans un nouvel onglet">↗</button>
            </div>
        </div>
    `;
}

function renderRecentOrdersTableHtml(orders) {
    if (!orders || orders.length === 0) {
        return `<div class="orders-panel" style="padding:24px;text-align:center;color:var(--text-muted);">Aucun ordre récent disponible.</div>`;
    }

    return `
        <div class="orders-panel">
            <table class="orders-table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Item</th>
                        <th>Joueur</th>
                        <th>Statut</th>
                        <th>Prix unitaire</th>
                        <th>Qté</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => {
                        const item = State.itemsById.get(order.itemId);
                        const itemName = item ? getItemName(item) : "Item #" + order.itemId;
                        const itemUrl = item ? `https://warframe.market/items/${item.slug}` : "https://warframe.market/";
                        const isSell = order.type === "sell";
                        const user = order.user || {};
                        const status = user.status || "offline";
                        return `
                            <tr>
                                <td>
                                    <span class="rank-badge" style="color:${isSell ? "var(--sell-color)" : "var(--buy-color)"};border-color:${isSell ? "rgba(46,204,113,0.4)" : "rgba(230,126,34,0.4)"}">
                                        ${isSell ? "VEND" : "ACHÈTE"}
                                    </span>
                                </td>
                                <td>
                                    <div class="trader-cell">
                                        <img class="trader-avatar" style="border-radius:4px;" src="${escapeHtml(item ? getItemThumb(item) : DEFAULT_FAVICON)}" alt=""/>
                                        <div>
                                            <span class="trader-name" data-open-url="${escapeHtml(itemUrl)}">${escapeHtml(itemName)}</span>
                                            ${order.rank !== undefined ? `<span class="rank-badge" style="margin-left:6px;">Rang ${order.rank}</span>` : ""}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="trader-cell">
                                        <span class="trader-name" data-open-url="https://warframe.market/profile/${encodeURIComponent(user.slug || user.ingameName || "")}">${escapeHtml(user.ingameName || "Tenno")}</span>
                                        <span class="trader-rep" title="Réputation">${wfIcon("rep", "wf-icon-sm wf-icon-gold")} ${user.reputation ?? 0}</span>
                                    </div>
                                </td>
                                <td>${renderStatusBadge(status)}</td>
                                <td>
                                    <span class="plat-price">
                                        <span>${order.platinum}</span>
                                        <span class="plat-icon" title="Platinum"></span>
                                    </span>
                                </td>
                                <td>${order.quantity || 1}</td>
                                <td>
                                    <button class="btn-trade ${isSell ? "sell" : "buy"}"
                                        data-whisper-user="${escapeHtml(user.ingameName || "")}"
                                        data-whisper-item-en="${escapeHtml(item ? getItemEnName(item) : itemName)}"
                                        data-whisper-item-fr="${escapeHtml(itemName)}"
                                        data-whisper-price="${order.platinum}"
                                        data-whisper-type="${order.type}"
                                        data-whisper-rank="${order.rank ?? ""}"
                                        data-whisper-maxrank="${item?.maxRank ?? ""}">
                                        ${isSell ? "Acheter (/w)" : "Vendre (/w)"}
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        </div>
    `;
}

/* ---------- 2. PAGE D'ITEM (https://warframe.market/items/{slug}) ---------- */

function renderItemPage(container, tab, slug) {
    const item = tab.cachedData.item || State.itemsBySlug.get(slug);
    if (!item) {
        container.innerHTML = `
            <div class="orders-panel" style="padding:32px;text-align:center;">
                <h2>Item introuvable : <code>${escapeHtml(slug)}</code></h2>
                <p style="color:var(--text-secondary);margin:10px 0 18px;">Vérifiez l'URL dans la barre d'adresse ou utilisez la recherche.</p>
                <button class="btn-primary" data-open-url="https://warframe.market/">Retour à l'accueil</button>
            </div>
        `;
        bindCommonPageEvents(container, tab);
        return;
    }

    const name = getItemName(item);
    const enName = getItemEnName(item);
    const desc = getItemDescription(item);
    const wikiLink = getItemWikiLink(item);
    const setItems = tab.cachedData.setItems || [];
    const orders = tab.cachedData.orders || [];
    const vs = tab.viewState;
    const hasRank = typeof item.maxRank === "number" && item.maxRank > 0;

    // Filtrage des ordres
    const filteredOrders = orders.filter(o => {
        if (!o.visible) return false;
        const st = o.user?.status || "offline";
        if (vs.statusFilter === "ingame" && st !== "ingame") return false;
        if (vs.statusFilter === "online" && st !== "ingame" && st !== "online") return false;
        if (hasRank && vs.rankFilter !== "all") {
            if (vs.rankFilter === "max" && o.rank !== item.maxRank) return false;
            if (vs.rankFilter === "0" && o.rank !== 0) return false;
        }
        if (vs.sellerQuery) {
            const uName = (o.user?.ingameName || "").toLowerCase();
            if (!uName.includes(vs.sellerQuery.toLowerCase())) return false;
        }
        return true;
    });

    const sellOrders = filteredOrders.filter(o => o.type === "sell");
    const buyOrders = filteredOrders.filter(o => o.type === "buy");

    // Tri des ordres (par défaut: Vendeurs du moins cher au plus cher, Acheteurs du plus offrant au moins offrant)
    const statusWeight = { ingame: 0, online: 1, offline: 2 };
    sellOrders.sort((a, b) => {
        if (vs.sortBy === "price_asc") return a.platinum - b.platinum || (statusWeight[a.user?.status] ?? 2) - (statusWeight[b.user?.status] ?? 2);
        if (vs.sortBy === "price_desc") return b.platinum - a.platinum;
        if (vs.sortBy === "rep_desc") return (b.user?.reputation || 0) - (a.user?.reputation || 0);
        return a.platinum - b.platinum;
    });
    buyOrders.sort((a, b) => {
        if (vs.sortBy === "price_asc") return b.platinum - a.platinum || (statusWeight[a.user?.status] ?? 2) - (statusWeight[b.user?.status] ?? 2);
        if (vs.sortBy === "price_desc") return a.platinum - b.platinum;
        if (vs.sortBy === "rep_desc") return (b.user?.reputation || 0) - (a.user?.reputation || 0);
        return b.platinum - a.platinum;
    });

    const lowestSell = sellOrders.length > 0 ? sellOrders[0].platinum : "—";
    const highestBuy = buyOrders.length > 0 ? buyOrders[0].platinum : "—";
    const existingAlert = getAlertForSlug(item.slug);
    const defaultTargetPrice = existingAlert
        ? existingAlert.targetPrice
        : (typeof lowestSell === "number" ? Math.max(1, lowestSell - 2) : 20);

    container.innerHTML = `
        <div class="item-page-header">
            <div class="item-header-top">
                <img class="item-hero-thumb" src="${escapeHtml(getItemIcon(item))}" alt="${escapeHtml(name)}" onerror="this.src='${DEFAULT_FAVICON}'"/>
                <div class="item-header-info">
                    <div class="item-title-row">
                        <h1>${escapeHtml(name)}</h1>
                        ${enName !== name ? `<span class="item-en-subtitle">(${escapeHtml(enName)})</span>` : ""}
                        <button class="btn-fav-hero ${isItemFavorite(item.slug) ? "active" : ""}" data-fav-slug="${escapeHtml(item.slug)}">
                            ${wfIcon("star", "wf-icon-gold")} ${isItemFavorite(item.slug) ? "Dans vos Favoris" : "Ajouter aux Favoris"}
                        </button>
                        <button class="btn-alert-hero ${isItemInCart(item.slug) ? "active" : ""}" data-cart-slug="${escapeHtml(item.slug)}">
                            ${wfIcon("cart", "wf-icon-cyan")} ${isItemInCart(item.slug) ? "Dans le Panier" : "+ Ajouter au Panier"}
                        </button>
                        <button class="btn-alert-hero ${existingAlert && existingAlert.enabled !== false ? "active" : ""}" id="btn-toggle-item-alert-box">
                            ${wfIcon("alert", "wf-icon-cyan")} ${existingAlert ? `Alerte : ≤ ${existingAlert.targetPrice} Plat ${existingAlert.enabled === false ? "(Pause)" : ""}` : "Créer une alerte de prix"}
                        </button>
                    </div>

                    <div id="item-alert-creator-box" class="item-alert-creator-box ${vs.showAlertBox || existingAlert ? "" : "hidden"}">
                        <div class="item-alert-creator-left">
                            <span>${wfIcon("target", "wf-icon-cyan")} <strong>Price Sniper :</strong> Me notifier dès qu'un vendeur</span>
                            <select id="item-alert-status-select" class="alert-inline-select">
                                <option value="ingame" ${(!existingAlert || existingAlert.statusMode === "ingame") ? "selected" : ""}>◆ En jeu (In Game)</option>
                                <option value="online" ${(existingAlert && existingAlert.statusMode === "online") ? "selected" : ""}>◇ En jeu + En ligne</option>
                            </select>
                            <span>vend à <strong>≤</strong></span>
                            <input type="number" id="item-alert-price-input" class="alert-inline-input" min="1" max="99999" value="${defaultTargetPrice}" />
                            <span><strong>Platinum</strong></span>
                        </div>
                        <div class="item-alert-creator-actions">
                            <button class="btn-primary btn-sm" id="btn-save-item-alert">
                                ${existingAlert ? `${wfIcon("target", "wf-icon-sm")} Mettre à jour l'alerte` : `${wfIcon("alert", "wf-icon-sm")} Activer l'alerte`}
                            </button>
                            ${existingAlert ? `
                                <button class="btn-secondary btn-sm" id="btn-pause-item-alert">
                                    ${existingAlert.enabled === false ? `${wfIcon("play", "wf-icon-sm")} Réactiver` : `${wfIcon("pause", "wf-icon-sm")} Pause`}
                                </button>
                                <button class="btn-secondary btn-sm" id="btn-delete-item-alert" style="color:#ff7675;">${wfIcon("trash", "wf-icon-sm")} Supprimer</button>
                            ` : ""}
                        </div>
                    </div>

                    <div class="item-meta-badges">
                        <span class="meta-pill">Prix Vente Min : <strong style="color:var(--sell-color)">${lowestSell} Plat</strong></span>
                        <span class="meta-pill">Offre Achat Max : <strong style="color:var(--buy-color)">${highestBuy} Plat</strong></span>
                        ${item.ducats ? `<span class="meta-pill ducats">${wfIcon("ducats", "wf-icon-sm wf-icon-gold")} Ducats : <strong>${item.ducats}</strong></span>` : ""}
                        ${item.reqMasteryRank !== undefined ? `<span class="meta-pill">${wfIcon("mastery", "wf-icon-sm wf-icon-cyan")} Palier Maîtrise : <strong>${item.reqMasteryRank}</strong></span>` : ""}
                        ${item.tradingTax ? `<span class="meta-pill tax">${wfIcon("credits", "wf-icon-sm wf-icon-cyan")} Taxe d'échange : <strong>${item.tradingTax.toLocaleString("fr-FR")} Crédits</strong></span>` : ""}
                        ${hasRank ? `<span class="meta-pill">${wfIcon("rank", "wf-icon-sm wf-icon-gold")} Rang Max : <strong>${item.maxRank}</strong></span>` : ""}
                        <a class="meta-pill" href="${escapeHtml(wikiLink)}" target="_blank" rel="noopener" style="color:var(--accent-cyan);text-decoration:none;">${wfIcon("codex", "wf-icon-sm wf-icon-cyan")} Wiki Officiel ↗</a>
                    </div>

                    ${desc ? `<p class="item-description">${escapeHtml(desc)}</p>` : ""}
                </div>
            </div>

            ${setItems.length > 1 ? `
                <div class="set-parts-bar">
                    <span style="font-size:12px;color:var(--text-muted);font-weight:700;margin-right:4px;">COMPOSANTS DU SET :</span>
                    ${setItems.map(part => {
                        const isCurrent = part.slug === item.slug;
                        const partUrl = `https://warframe.market/items/${part.slug}`;
                        return `
                            <button class="set-part-btn ${isCurrent ? "active" : ""}" data-open-url="${escapeHtml(partUrl)}" title="Clic molette pour ouvrir dans un nouvel onglet">
                                <img src="${escapeHtml(getItemThumb(part))}" alt="" onerror="this.src='${DEFAULT_FAVICON}'"/>
                                <span>${escapeHtml(getItemName(part))}</span>
                            </button>
                        `;
                    }).join("")}
                </div>
                <div class="set-calc-box" id="set-calc-container">
                    ${tab.cachedData.setComparisonHtml || `
                        <div style="font-size:13px;color:var(--text-secondary);">
                            ${wfIcon("prime", "wf-icon-gold")} <strong>Astuce d'achat :</strong> Vérifiez s'il est moins cher d'acheter le Set complet ou chaque composant séparément en jeu.
                        </div>
                        <button class="btn-secondary btn-sm" id="btn-calc-set-parts">${wfIcon("compare", "wf-icon-cyan")} Comparer Set complet vs Pièces séparées</button>
                    `}
                </div>
            ` : ""}
        </div>

        <!-- Barre Sous-onglets (Ordres / Statistiques) & Filtres -->
        <div class="item-subtabs-bar">
            <div class="subtabs-left">
                <button class="subtab-btn ${vs.subtab === "orders" ? "active" : ""}" data-subtab="orders">
                    Ordres en direct (${filteredOrders.length})
                </button>
                <button class="subtab-btn ${vs.subtab === "statistics" ? "active" : ""}" data-subtab="statistics">
                    ${wfIcon("chart", "wf-icon-sm")} Statistiques de prix (48h / 90j)
                </button>
            </div>

            ${vs.subtab === "orders" ? `
                <div class="orders-filters">
                    <div class="filter-group">
                        <label>Statut vendeur :</label>
                        <select id="filter-status">
                            <option value="ingame" ${vs.statusFilter === "ingame" ? "selected" : ""}>◆ En jeu (In Game)</option>
                            <option value="online" ${vs.statusFilter === "online" ? "selected" : ""}>◇ En jeu + En ligne</option>
                            <option value="all" ${vs.statusFilter === "all" ? "selected" : ""}>▫ Tous (incl. Hors ligne)</option>
                        </select>
                    </div>

                    ${hasRank ? `
                        <div class="filter-group">
                            <label>Rang :</label>
                            <select id="filter-rank">
                                <option value="all" ${vs.rankFilter === "all" ? "selected" : ""}>Tous les rangs</option>
                                <option value="max" ${vs.rankFilter === "max" ? "selected" : ""}>Rang Max (${item.maxRank})</option>
                                <option value="0" ${vs.rankFilter === "0" ? "selected" : ""}>Rang 0</option>
                            </select>
                        </div>
                    ` : ""}

                    <div class="filter-group">
                        <label>Trier :</label>
                        <select id="filter-sort">
                            <option value="price_asc" ${vs.sortBy === "price_asc" ? "selected" : ""}>Meilleur prix</option>
                            <option value="rep_desc" ${vs.sortBy === "rep_desc" ? "selected" : ""}>Meilleure réputation</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <input type="text" id="filter-seller" placeholder="Filtrer par joueur..." value="${escapeHtml(vs.sellerQuery)}" />
                    </div>

                    <button class="btn-secondary btn-sm" id="btn-refresh-orders" title="Rafraîchir les ordres">↻ Actualiser</button>
                </div>
            ` : `
                <div class="orders-filters">
                    <button class="subtab-btn ${vs.statsRange === "48hours" ? "active" : ""}" data-stats-range="48hours">Dernières 48 Heures</button>
                    <button class="subtab-btn ${vs.statsRange === "90days" ? "active" : ""}" data-stats-range="90days">Derniers 90 Jours</button>
                </div>
            `}
        </div>

        ${vs.subtab === "orders" ? `
            <div class="orders-columns">
                <!-- Colonne Vendeurs -->
                <div class="orders-panel">
                    <div class="orders-panel-header sell-header">
                        <span>Vendeurs (Sell Orders)</span>
                        <span>${sellOrders.length} offres</span>
                    </div>
                    ${renderOrderSideTableHtml(sellOrders, item, "sell")}
                </div>

                <!-- Colonne Acheteurs -->
                <div class="orders-panel">
                    <div class="orders-panel-header buy-header">
                        <span>Acheteurs (Buy Orders)</span>
                        <span>${buyOrders.length} offres</span>
                    </div>
                    ${renderOrderSideTableHtml(buyOrders, item, "buy")}
                </div>
            </div>
        ` : renderItemStatsHtml(tab, item)}
    `;

    bindCommonPageEvents(container, tab);

    // Événements des sous-onglets & filtres
    container.querySelectorAll("[data-subtab]").forEach(btn => {
        btn.addEventListener("click", () => {
            tab.viewState.subtab = btn.dataset.subtab;
            tab.url = btn.dataset.subtab === "statistics"
                ? `https://warframe.market/items/${item.slug}/statistics`
                : `https://warframe.market/items/${item.slug}`;
            syncBrowserChromeToActiveTab();
            renderActiveTabPage();
        });
    });

    const statusSel = container.querySelector("#filter-status");
    if (statusSel) {
        statusSel.addEventListener("change", () => {
            tab.viewState.statusFilter = statusSel.value;
            renderActiveTabPage();
        });
    }

    const rankSel = container.querySelector("#filter-rank");
    if (rankSel) {
        rankSel.addEventListener("change", () => {
            tab.viewState.rankFilter = rankSel.value;
            renderActiveTabPage();
        });
    }

    const sortSel = container.querySelector("#filter-sort");
    if (sortSel) {
        sortSel.addEventListener("change", () => {
            tab.viewState.sortBy = sortSel.value;
            renderActiveTabPage();
        });
    }

    const sellerInput = container.querySelector("#filter-seller");
    if (sellerInput) {
        sellerInput.addEventListener("input", () => {
            tab.viewState.sellerQuery = sellerInput.value;
            renderActiveTabPage();
            const newInput = document.getElementById("filter-seller");
            if (newInput) {
                newInput.focus();
                newInput.setSelectionRange(newInput.value.length, newInput.value.length);
            }
        });
    }

    const refreshBtn = container.querySelector("#btn-refresh-orders");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => navigateTab(tab.id, tab.url, { pushHistory: false, forceRefresh: true }));
    }

    const calcBtn = container.querySelector("#btn-calc-set-parts");
    if (calcBtn && setItems.length > 1) {
        calcBtn.addEventListener("click", async () => {
            calcBtn.disabled = true;
            calcBtn.textContent = "⏳ Calcul en cours sur toutes les pièces...";
            try {
                const results = await Promise.all(setItems.map(async (part) => {
                    const res = await apiFetch(`/api/v2/orders/item/${part.slug}`);
                    const sells = (res.data || []).filter(o => o.visible && o.type === "sell" && o.user?.status === "ingame");
                    sells.sort((a, b) => a.platinum - b.platinum);
                    const minPlat = sells.length > 0 ? sells[0].platinum : null;
                    const qty = part.quantityInSet || 1;
                    return { part, minPlat, qty, isRoot: !!part.setRoot };
                }));

                const rootInfo = results.find(r => r.isRoot);
                const partInfos = results.filter(r => !r.isRoot);
                const partsTotal = partInfos.reduce((sum, r) => sum + ((r.minPlat || 0) * r.qty), 0);
                const setPrice = rootInfo?.minPlat ?? null;

                const breakdown = partInfos.map(r =>
                    `<span class="meta-pill" data-open-url="https://warframe.market/items/${r.part.slug}" style="cursor:pointer;">${escapeHtml(getItemName(r.part))}${r.qty > 1 ? ` ×${r.qty}` : ""} : <strong>${r.minPlat !== null ? r.minPlat * r.qty + "p" : "N/A"}</strong></span>`
                ).join(" ");

                let verdict = "";
                if (setPrice !== null && partsTotal > 0) {
                    const diff = setPrice - partsTotal;
                    if (diff > 0) {
                        verdict = `<span style="color:var(--sell-color);font-weight:700;">${wfIcon("target", "wf-icon-sm")} Acheter les pièces séparément économise ${diff} Platinum ! (${partsTotal}p vs ${setPrice}p)</span>`;
                    } else if (diff < 0) {
                        verdict = `<span style="color:var(--accent-cyan);font-weight:700;">${wfIcon("target", "wf-icon-sm")} Le Set complet est moins cher de ${Math.abs(diff)} Platinum ! (${setPrice}p vs ${partsTotal}p)</span>`;
                    } else {
                        verdict = `<span>${wfIcon("target", "wf-icon-sm")} Le Set complet et les pièces séparées coûtent exactement le même prix (${setPrice}p).</span>`;
                    }
                }

                tab.cachedData.setComparisonHtml = `
                    <div style="display:flex;flex-direction:column;gap:8px;width:100%;">
                        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                            <div><strong>Comparatif En Jeu :</strong> Set complet = <strong style="color:var(--accent-cyan)">${setPrice ?? "—"}p</strong> | Somme des pièces = <strong style="color:var(--accent-gold)">${partsTotal}p</strong></div>
                            ${verdict}
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">${breakdown}</div>
                    </div>
                `;
                renderActiveTabPage();
            } catch (e) {
                calcBtn.textContent = "Erreur lors du calcul";
            }
        });
    }

    container.querySelectorAll("[data-stats-range]").forEach(btn => {
        btn.addEventListener("click", () => {
            tab.viewState.statsRange = btn.dataset.statsRange;
            renderActiveTabPage();
        });
    });

    if (vs.subtab === "statistics") {
        drawStatsCanvas(tab);
    }

    // Événements du créateur d'alerte sur la page de l'item
    container.querySelector("#btn-toggle-item-alert-box")?.addEventListener("click", () => {
        vs.showAlertBox = !vs.showAlertBox;
        const box = container.querySelector("#item-alert-creator-box");
        if (box) box.classList.toggle("hidden");
    });

    container.querySelector("#btn-save-item-alert")?.addEventListener("click", () => {
        const priceVal = Number(container.querySelector("#item-alert-price-input")?.value || 1);
        const statusVal = container.querySelector("#item-alert-status-select")?.value || "ingame";
        vs.showAlertBox = true;
        upsertPriceAlert(item.slug, priceVal, statusVal);
    });

    container.querySelector("#btn-pause-item-alert")?.addEventListener("click", () => {
        togglePriceAlertActive(item.slug);
    });

    container.querySelector("#btn-delete-item-alert")?.addEventListener("click", () => {
        vs.showAlertBox = false;
        removePriceAlert(item.slug);
    });
}

function renderOrderSideTableHtml(orders, item, side) {
    const isSell = side === "sell";
    const hasRank = typeof item.maxRank === "number" && item.maxRank > 0;

    if (orders.length === 0) {
        return `<div style="padding:28px;text-align:center;color:var(--text-muted);">Aucun ordre ne correspond aux filtres actuels.</div>`;
    }

    return `
        <table class="orders-table">
            <thead>
                <tr>
                    <th>Joueur</th>
                    <th>Statut</th>
                    ${hasRank ? `<th>Rang</th>` : ""}
                    <th>Prix</th>
                    <th>Qté</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${orders.slice(0, 80).map(order => {
                    const user = order.user || {};
                    const avatar = user.avatar ? assetUrl(user.avatar) : DEFAULT_FAVICON;
                    const profileUrl = `https://warframe.market/profile/${encodeURIComponent(user.slug || user.ingameName || "")}`;
                    return `
                        <tr>
                            <td>
                                <div class="trader-cell">
                                    <img class="trader-avatar" src="${escapeHtml(avatar)}" alt="" loading="lazy" onerror="this.src='${DEFAULT_FAVICON}'"/>
                                    <div>
                                        <div class="trader-name" data-open-url="${escapeHtml(profileUrl)}">${escapeHtml(user.ingameName || "Tenno")}</div>
                                        <div class="trader-rep">${wfIcon("rep", "wf-icon-sm wf-icon-gold")} ${user.reputation ?? 0}</div>
                                    </div>
                                </div>
                            </td>
                            <td>${renderStatusBadge(user.status || "offline")}</td>
                            ${hasRank ? `<td><span class="rank-badge">${order.rank ?? 0} / ${item.maxRank}</span></td>` : ""}
                            <td>
                                <span class="plat-price">
                                    <span>${order.platinum}</span>
                                    <span class="plat-icon" title="Platinum"></span>
                                </span>
                            </td>
                            <td>${order.quantity || 1}</td>
                            <td>
                                <button class="btn-trade ${isSell ? "sell" : "buy"}"
                                    data-whisper-user="${escapeHtml(user.ingameName || "")}"
                                    data-whisper-item-en="${escapeHtml(getItemEnName(item))}"
                                    data-whisper-item-fr="${escapeHtml(getItemName(item))}"
                                    data-whisper-price="${order.platinum}"
                                    data-whisper-type="${order.type}"
                                    data-whisper-rank="${order.rank ?? ""}"
                                    data-whisper-maxrank="${item.maxRank ?? ""}">
                                    ${isSell ? "Acheter (/w)" : "Vendre (/w)"}
                                </button>
                            </td>
                        </tr>
                    `;
                }).join("")}
            </tbody>
        </table>
    `;
}

function renderStatusBadge(status) {
    if (status === "ingame") {
        return `<span class="status-badge ingame">◆ En jeu</span>`;
    }
    if (status === "online") {
        return `<span class="status-badge online">◆ En ligne</span>`;
    }
    return `<span class="status-badge offline">◇ Hors ligne</span>`;
}

/* ---------- 3. ONGLET STATISTIQUES & GRAPHIQUE CANVAS ---------- */

function renderItemStatsHtml(tab, item) {
    const stats = tab.cachedData.stats;
    const range = tab.viewState.statsRange || "48hours";
    const series = (stats && stats[range]) ? stats[range] : [];

    if (!series.length) {
        return `<div class="stats-container"><p style="color:var(--text-muted);text-align:center;padding:30px;">Aucune donnée statistique disponible pour cet item.</p></div>`;
    }

    const totalVolume = series.reduce((acc, p) => acc + (p.volume || 0), 0);
    const avgPrices = series.map(p => p.avg_price || p.wa_price || p.median || 0).filter(v => v > 0);
    const minPrices = series.map(p => p.min_price || 0).filter(v => v > 0);
    const maxPrices = series.map(p => p.max_price || 0).filter(v => v > 0);

    const meanPrice = avgPrices.length ? (avgPrices.reduce((a, b) => a + b, 0) / avgPrices.length).toFixed(1) : "—";
    const lowestPrice = minPrices.length ? Math.min(...minPrices) : "—";
    const highestPrice = maxPrices.length ? Math.max(...maxPrices) : "—";

    return `
        <div class="stats-container">
            <div class="stats-summary-cards">
                <div class="stat-metric-card">
                    <div class="stat-metric-label">Prix Moyen (${range === "48hours" ? "48h" : "90j"})</div>
                    <div class="stat-metric-value">${meanPrice} Plat</div>
                </div>
                <div class="stat-metric-card">
                    <div class="stat-metric-label">Prix Minimum vendu</div>
                    <div class="stat-metric-value" style="color:var(--sell-color)">${lowestPrice} Plat</div>
                </div>
                <div class="stat-metric-card">
                    <div class="stat-metric-label">Prix Maximum vendu</div>
                    <div class="stat-metric-value" style="color:var(--accent-gold)">${highestPrice} Plat</div>
                </div>
                <div class="stat-metric-card">
                    <div class="stat-metric-label">Volume total échangé</div>
                    <div class="stat-metric-value" style="color:#fff">${totalVolume.toLocaleString("fr-FR")} unités</div>
                </div>
            </div>

            <div class="chart-canvas-wrap">
                <canvas id="stats-chart-canvas" width="1100" height="290"></canvas>
            </div>
        </div>
    `;
}

function drawStatsCanvas(tab) {
    const canvas = document.getElementById("stats-chart-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const stats = tab.cachedData.stats;
    const range = tab.viewState.statsRange || "48hours";
    const rawSeries = (stats && stats[range]) ? stats[range] : [];
    // Garder uniquement les points globaux (sans doublon de rang) ou les 60 derniers points
    const series = rawSeries.slice(-60);
    if (!series.length) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const padL = 52, padR = 24, padT = 20, padB = 34;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const prices = series.map(p => p.wa_price || p.avg_price || p.median || 0);
    const maxVol = Math.max(...series.map(p => p.volume || 1), 1);
    const minP = Math.max(0, Math.floor(Math.min(...prices) * 0.9));
    const maxP = Math.ceil(Math.max(...prices) * 1.1) || 10;

    // Grille horizontale
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.fillStyle = "#66788a";
    ctx.font = "11px Segoe UI";
    for (let i = 0; i <= 4; i++) {
        const y = padT + (plotH * i) / 4;
        const val = Math.round(maxP - ((maxP - minP) * i) / 4);
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(W - padR, y);
        ctx.stroke();
        ctx.fillText(`${val}p`, 10, y + 4);
    }

    // Barres de volume en bas
    const barW = Math.max(3, plotW / series.length - 3);
    ctx.fillStyle = "rgba(38, 185, 209, 0.18)";
    series.forEach((pt, idx) => {
        const x = padL + (idx / Math.max(1, series.length - 1)) * plotW;
        const bh = ((pt.volume || 0) / maxVol) * (plotH * 0.35);
        ctx.fillRect(x - barW / 2, padT + plotH - bh, barW, bh);
    });

    // Courbe de prix moyen pondéré
    ctx.strokeStyle = "#26b9d1";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    series.forEach((pt, idx) => {
        const val = pt.wa_price || pt.avg_price || pt.median || 0;
        const x = padL + (idx / Math.max(1, series.length - 1)) * plotW;
        const y = padT + plotH - ((val - minP) / Math.max(1, maxP - minP)) * plotH;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Points et dates
    ctx.fillStyle = "#e6c365";
    series.forEach((pt, idx) => {
        const val = pt.wa_price || pt.avg_price || pt.median || 0;
        const x = padL + (idx / Math.max(1, series.length - 1)) * plotW;
        const y = padT + plotH - ((val - minP) / Math.max(1, maxP - minP)) * plotH;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();

        if (idx % Math.max(1, Math.floor(series.length / 6)) === 0) {
            const d = new Date(pt.datetime);
            const label = range === "48hours"
                ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
            ctx.fillStyle = "#9fb1c3";
            ctx.fillText(label, x - 16, H - 10);
            ctx.fillStyle = "#e6c365";
        }
    });
}

/* ---------- 3B. ONGLET MES ITEMS FAVORIS (https://warframe.market/favorites) ---------- */

function renderFavoritesPage(container, tab) {
    const details = tab.cachedData.favoritesDetails || [];

    if (!State.favoriteItems.length || !details.length) {
        container.innerHTML = `
            <div class="orders-panel" style="padding:42px 24px;text-align:center;">
                <h2 style="margin-bottom:8px;">${wfIcon("star", "wf-icon-gold")} Vous n'avez aucun item en favori pour le moment</h2>
                <p style="color:var(--text-secondary);margin-bottom:18px;">Cliquez sur l'étoile <strong>✦</strong> sur n'importe quel item (dans l'Accueil, le Catalogue ou sur la page d'un item) pour l'afficher ici avec toutes ses informations et ses prix en direct.</p>
                <button class="btn-primary" data-open-url="https://warframe.market/items">Explorer le Catalogue des Items →</button>
            </div>
        `;
        bindCommonPageEvents(container, tab);
        return;
    }

    let totalMinPlat = 0;
    let totalDucats = 0;
    let totalTax = 0;

    const enriched = details.map(({ slug, item, orders }) => {
        const visibleSellsIngame = orders.filter(o => o.visible && o.type === "sell" && o.user?.status === "ingame")
            .sort((a, b) => a.platinum - b.platinum);
        const visibleBuysIngame = orders.filter(o => o.visible && o.type === "buy" && (o.user?.status === "ingame" || o.user?.status === "online"))
            .sort((a, b) => b.platinum - a.platinum);

        const bestSell = visibleSellsIngame[0] || null;
        const bestBuy = visibleBuysIngame[0] || null;

        if (bestSell) totalMinPlat += bestSell.platinum;
        if (item.ducats) totalDucats += item.ducats;
        if (item.tradingTax) totalTax += item.tradingTax;

        return {
            slug,
            item,
            bestSell,
            bestBuy,
            sellersCount: visibleSellsIngame.length,
            buyersCount: visibleBuysIngame.length
        };
    });

    container.innerHTML = `
        <div class="fav-summary-banner">
            <div>
                <h2 class="section-title" style="margin-bottom:4px;">${wfIcon("star", "wf-icon-gold")} Mes Items Favoris (${enriched.length})</h2>
                <p style="font-size:12.5px;color:var(--text-secondary);">Toutes les informations, caractéristiques et prix en temps réel de vos items favoris.</p>
            </div>
            <div class="fav-summary-metrics">
                <span class="meta-pill">${wfIcon("plat", "wf-icon-sm wf-icon-cyan")} Coût Total Achat (En jeu) : <strong style="color:var(--sell-color)">${totalMinPlat} Platinum</strong></span>
                <span class="meta-pill ducats">${wfIcon("ducats", "wf-icon-sm wf-icon-gold")} Total Ducats : <strong>${totalDucats}</strong></span>
                <span class="meta-pill tax">${wfIcon("credits", "wf-icon-sm wf-icon-cyan")} Taxes d'échange cumulées : <strong>${totalTax.toLocaleString("fr-FR")} Crédits</strong></span>
                <button class="btn-primary btn-sm" id="btn-refresh-favs">↻ Actualiser tous les prix</button>
            </div>
        </div>

        <div class="fav-details-grid">
            ${enriched.map(({ slug, item, bestSell, bestBuy, sellersCount, buyersCount }) => {
                const name = getItemName(item);
                const enName = getItemEnName(item);
                const desc = getItemDescription(item);
                const wikiLink = getItemWikiLink(item);
                const itemUrl = `https://warframe.market/items/${slug}`;
                const tags = (item.tags || []).join(" · ");
                return `
                    <div class="fav-detail-card">
                        <div>
                            <div class="fav-card-top">
                                <img class="fav-card-thumb" src="${escapeHtml(getItemIcon(item))}" alt="${escapeHtml(name)}" data-open-url="${escapeHtml(itemUrl)}" onerror="this.src='${DEFAULT_FAVICON}'"/>
                                <div class="fav-card-info">
                                    <div class="fav-card-title-row">
                                        <span class="fav-card-title" data-open-url="${escapeHtml(itemUrl)}">${escapeHtml(name)}</span>
                                        <div style="display:flex;gap:6px;">
                                            <button class="item-card-newtab" style="opacity:1;" data-newtab-url="${escapeHtml(itemUrl)}" title="Ouvrir dans un nouvel onglet">↗</button>
                                            <button class="item-card-fav-btn active" data-fav-slug="${escapeHtml(slug)}" title="Retirer des favoris">${wfIcon("star", "wf-icon-sm")}</button>
                                        </div>
                                    </div>
                                    <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">
                                        ${enName !== name ? `<strong>${escapeHtml(enName)}</strong> · ` : ""}${escapeHtml(tags)}
                                    </div>
                                    ${desc ? `<p class="fav-card-desc" title="${escapeHtml(desc)}">${escapeHtml(desc)}</p>` : ""}
                                </div>
                            </div>

                            <div class="item-meta-badges" style="margin:12px 0;">
                                ${item.ducats ? `<span class="meta-pill ducats">${wfIcon("ducats", "wf-icon-sm wf-icon-gold")} Ducats : <strong>${item.ducats}</strong></span>` : ""}
                                ${item.reqMasteryRank !== undefined ? `<span class="meta-pill">${wfIcon("mastery", "wf-icon-sm wf-icon-cyan")} MR : <strong>${item.reqMasteryRank}</strong></span>` : ""}
                                ${item.tradingTax ? `<span class="meta-pill tax">${wfIcon("credits", "wf-icon-sm wf-icon-cyan")} Taxe : <strong>${item.tradingTax.toLocaleString("fr-FR")} Cr</strong></span>` : ""}
                                ${typeof item.maxRank === "number" ? `<span class="meta-pill">${wfIcon("rank", "wf-icon-sm wf-icon-gold")} Rang Max : <strong>${item.maxRank}</strong></span>` : ""}
                                <a class="meta-pill" href="${escapeHtml(wikiLink)}" target="_blank" rel="noopener" style="color:var(--accent-cyan);text-decoration:none;">${wfIcon("codex", "wf-icon-sm wf-icon-cyan")} Wiki ↗</a>
                            </div>

                            <div class="fav-price-box">
                                <div class="fav-price-col">
                                    <span class="fav-price-label">Meilleur Prix Vente (En jeu)</span>
                                    <span class="fav-price-val" style="color:var(--sell-color)">
                                        ${bestSell ? `${bestSell.platinum} Plat` : "Aucun"}
                                    </span>
                                </div>
                                <div class="fav-price-col">
                                    <span class="fav-price-label">Meilleure Offre Achat</span>
                                    <span class="fav-price-val" style="color:var(--buy-color)">
                                        ${bestBuy ? `${bestBuy.platinum} Plat` : "Aucune"}
                                    </span>
                                </div>
                                <div class="fav-price-col">
                                    <span class="fav-price-label">Offres En Ligne</span>
                                    <span class="fav-price-val">
                                        ${sellersCount} Vend. / ${buyersCount} Ach.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="fav-card-footer">
                            ${bestSell ? `
                                <div style="font-size:12px;color:var(--text-secondary);">
                                    Moins cher : <strong class="trader-name" data-open-url="https://warframe.market/profile/${encodeURIComponent(bestSell.user?.slug || bestSell.user?.ingameName || "")}">${escapeHtml(bestSell.user?.ingameName || "Tenno")}</strong> (${wfIcon("rep", "wf-icon-sm wf-icon-gold")} ${bestSell.user?.reputation ?? 0})
                                </div>
                                <div style="display:flex;gap:8px;">
                                    <button class="btn-secondary btn-sm" data-open-url="${escapeHtml(itemUrl)}">Voir tous les ordres</button>
                                    <button class="btn-trade sell"
                                        data-whisper-user="${escapeHtml(bestSell.user?.ingameName || "")}"
                                        data-whisper-item-en="${escapeHtml(enName)}"
                                        data-whisper-item-fr="${escapeHtml(name)}"
                                        data-whisper-price="${bestSell.platinum}"
                                        data-whisper-type="sell"
                                        data-whisper-rank="${bestSell.rank ?? ""}"
                                        data-whisper-maxrank="${item.maxRank ?? ""}">
                                        Acheter ${bestSell.platinum}p (/w)
                                    </button>
                                </div>
                            ` : `
                                <span style="font-size:12px;color:var(--text-muted);">Aucun vendeur "En jeu" actuellement</span>
                                <button class="btn-secondary btn-sm" data-open-url="${escapeHtml(itemUrl)}">Voir la page complète →</button>
                            `}
                        </div>
                    </div>
                `;
            }).join("")}
        </div>
    `;

    bindCommonPageEvents(container, tab);
    const refreshBtn = container.querySelector("#btn-refresh-favs");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => navigateTab(tab.id, tab.url, { pushHistory: false, forceRefresh: true }));
    }
}

/* ---------- 3B-BIS. ONGLET PANIER MULTI-ACHATS & LISTE DE COURSES (https://warframe.market/cart) ---------- */

function renderCartPage(container, tab) {
    const details = tab.cachedData.cartDetails || [];
    const cartList = State.shoppingCart || [];

    // Calcul des totaux et détection des vendeurs multi-items (« Groupage d'Échanges »)
    let totalPlat = 0;
    let totalTax = 0;
    let totalUnits = 0;
    const sellerOfferMap = new Map(); // sellerIngameName -> { user, items: [{ item, qty, unitPlat, rank }] }

    const enriched = details.map(({ slug, qty, rank, item, orders }) => {
        const quantity = Math.max(1, Number(qty) || 1);
        const hasRank = typeof item.maxRank === "number" && item.maxRank > 0;
        totalUnits += quantity;
        if (item.tradingTax) {
            totalTax += item.tradingTax * quantity;
        }

        let visibleSells = orders.filter(o => o.visible && o.type === "sell" && o.user?.status === "ingame");
        if (hasRank && rank === "max") {
            const maxRankSells = visibleSells.filter(o => o.rank === item.maxRank);
            if (maxRankSells.length > 0) visibleSells = maxRankSells;
        } else if (hasRank && rank === "0") {
            const r0Sells = visibleSells.filter(o => o.rank === 0);
            if (r0Sells.length > 0) visibleSells = r0Sells;
        }

        if (visibleSells.length === 0) {
            visibleSells = orders.filter(o => o.visible && o.type === "sell" && (o.user?.status === "ingame" || o.user?.status === "online"));
        }
        visibleSells.sort((a, b) => a.platinum - b.platinum);

        const bestSell = visibleSells[0] || null;
        if (bestSell) {
            totalPlat += bestSell.platinum * quantity;
        }

        // Enregistrer tous les vendeurs "En jeu" de cet item pour détecter les vendeurs multi-items
        const seenSellersForThisItem = new Set();
        for (const o of visibleSells.slice(0, 35)) {
            const uName = o.user?.ingameName;
            if (!uName || seenSellersForThisItem.has(uName)) continue;
            seenSellersForThisItem.add(uName);
            if (!sellerOfferMap.has(uName)) {
                sellerOfferMap.set(uName, {
                    user: o.user,
                    offers: []
                });
            }
            sellerOfferMap.get(uName).offers.push({
                slug,
                item,
                qty: quantity,
                unitPlat: o.platinum,
                rank: o.rank ?? ""
            });
        }

        return {
            slug,
            qty: quantity,
            rank: rank || "any",
            item,
            bestSell,
            sellersCount: visibleSells.length
        };
    });

    // Trouver les vendeurs qui possèdent au moins 2 items différents du panier
    const multiItemSellers = Array.from(sellerOfferMap.values())
        .filter(entry => entry.offers.length >= 2)
        .sort((a, b) => {
            if (b.offers.length !== a.offers.length) return b.offers.length - a.offers.length;
            const sumA = a.offers.reduce((acc, x) => acc + x.unitPlat * x.qty, 0);
            const sumB = b.offers.reduce((acc, x) => acc + x.unitPlat * x.qty, 0);
            return sumA - sumB;
        })
        .slice(0, 6);

    container.innerHTML = `
        <div class="fav-summary-banner">
            <div>
                <h2 class="section-title" style="margin-bottom:4px;">${wfIcon("cart", "wf-icon-cyan")} Panier Multi-Achats & Liste de Courses (${cartList.length} items · ${totalUnits} unités)</h2>
                <p style="font-size:12.5px;color:var(--text-secondary);">
                    Préparez votre liste d'achats (Sets, Pièces Prime, Mods, Arcanes) : calcul automatique du budget Platinum, de la taxe en Crédits et détection des vendeurs possédant plusieurs de vos items !
                </p>
            </div>
            <div class="fav-summary-metrics">
                <span class="meta-pill">${wfIcon("plat", "wf-icon-sm wf-icon-cyan")} Budget Total Estimé : <strong style="color:var(--sell-color)">${totalPlat} Platinum</strong></span>
                <span class="meta-pill tax">${wfIcon("credits", "wf-icon-sm wf-icon-gold")} Taxe en Crédits à prévoir : <strong>${totalTax.toLocaleString("fr-FR")} Crédits</strong></span>
                <button class="btn-primary btn-sm" id="btn-refresh-cart">↻ Actualiser les prix</button>
                ${cartList.length > 0 ? `<button class="btn-secondary btn-sm" id="btn-clear-cart" style="color:#ff7675;">${wfIcon("trash", "wf-icon-sm")} Vider le panier</button>` : ""}
            </div>
        </div>

        <!-- Ajout rapide d'un item au Panier -->
        <div class="alert-create-panel">
            <h3 style="font-size:14px;font-weight:800;margin-bottom:10px;color:var(--accent-cyan);">+ Ajouter un item à votre Panier d'achats</h3>
            <div class="alert-create-form">
                <div class="alert-search-wrap">
                    <label>Rechercher un item Warframe Market :</label>
                    <input type="text" id="cart-item-search-input" autocomplete="off" placeholder="Ex: Saryn Prime Châssis, Flux Accru, Arcane Énergétique..." />
                    <input type="hidden" id="cart-selected-slug" value="" />
                    <div id="cart-item-suggestions" class="omnibox-dropdown hidden"></div>
                </div>
                <div class="alert-field-wrap">
                    <label>Quantité :</label>
                    <input type="number" id="cart-item-qty-input" min="1" max="99" value="1" />
                </div>
                <button class="btn-primary" id="btn-add-to-cart-submit">${wfIcon("cart", "wf-icon-sm")} Ajouter au Panier</button>
            </div>
        </div>

        ${multiItemSellers.length > 0 ? `
            <div class="cart-bundle-panel">
                <div class="cart-bundle-header">
                    <div>
                        <span class="duviri-mode-badge hard">${wfIcon("target", "wf-icon-sm")} GROUPAGE D'ÉCHANGES DÉTECTÉ</span>
                        <h3 style="font-size:15px;font-weight:800;margin-top:4px;">Vendeurs En Jeu possédant plusieurs items de votre panier simultanément</h3>
                    </div>
                    <span style="font-size:12px;color:var(--text-secondary);">Économisez des échanges quotidiens en achetant plusieurs items au même joueur !</span>
                </div>
                <div class="cart-bundle-grid">
                    ${multiItemSellers.map(bundle => {
                        const u = bundle.user || {};
                        const bundleTotal = bundle.offers.reduce((s, o) => s + o.unitPlat * o.qty, 0);
                        const profileUrl = `https://warframe.market/profile/${encodeURIComponent(u.slug || u.ingameName || "")}`;
                        const itemsListFr = bundle.offers.map(o => `${getItemName(o.item)}${o.qty > 1 ? ` x${o.qty}` : ""} (${o.unitPlat * o.qty}p)`).join(" + ");
                        const itemsListEn = bundle.offers.map(o => `${getItemEnName(o.item)}${o.qty > 1 ? ` x${o.qty}` : ""} (${o.unitPlat * o.qty}p)`).join(" + ");
                        return `
                            <div class="cart-bundle-card">
                                <div class="cart-bundle-top">
                                    <div>
                                        <span class="trader-name" data-open-url="${escapeHtml(profileUrl)}">${escapeHtml(u.ingameName || "Tenno")}</span>
                                        <span class="trader-rep" style="margin-left:8px;">${wfIcon("rep", "wf-icon-sm wf-icon-gold")} ${u.reputation ?? 0}</span>
                                    </div>
                                    <span class="status-badge ingame">◆ ${bundle.offers.length} items dispo (${bundleTotal}p)</span>
                                </div>
                                <div class="cart-bundle-items">
                                    ${bundle.offers.map(o => `
                                        <span class="rot-item-chip" data-open-url="https://warframe.market/items/${escapeHtml(o.slug)}">
                                            ${escapeHtml(getItemName(o.item))}${o.qty > 1 ? ` ×${o.qty}` : ""} : <strong style="color:var(--sell-color)">${o.unitPlat * o.qty}p</strong>
                                        </span>
                                    `).join("")}
                                </div>
                                <div class="cart-bundle-footer">
                                    <span style="font-size:12px;color:var(--text-secondary);">Total groupé : <strong style="color:var(--sell-color)">${bundleTotal} Platinum</strong></span>
                                    <button class="btn-trade sell"
                                        data-whisper-user="${escapeHtml(u.ingameName || "")}"
                                        data-whisper-item-en="${escapeHtml(itemsListEn)}"
                                        data-whisper-item-fr="${escapeHtml(itemsListFr)}"
                                        data-whisper-price="${bundleTotal}"
                                        data-whisper-type="sell"
                                        data-whisper-rank=""
                                        data-whisper-maxrank="">
                                        Message Groupé ${bundleTotal}p (/w)
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        ` : ""}

        ${enriched.length === 0 ? `
            <div class="orders-panel" style="padding:42px 24px;text-align:center;">
                <h2 style="margin-bottom:8px;">${wfIcon("cart", "wf-icon-cyan")} Votre panier d'achats est vide</h2>
                <p style="color:var(--text-secondary);margin-bottom:18px;">
                    Utilisez la barre de recherche ci-dessus ou cliquez sur l'icône <strong>Panier</strong> sur n'importe quel item du catalogue pour préparer vos achats.
                </p>
                <button class="btn-primary" data-open-url="https://warframe.market/items">Parcourir le Catalogue →</button>
            </div>
        ` : `
            <div class="fav-details-grid">
                ${enriched.map(({ slug, qty, rank, item, bestSell, sellersCount }) => {
                    const name = getItemName(item);
                    const enName = getItemEnName(item);
                    const itemUrl = `https://warframe.market/items/${slug}`;
                    const hasRank = typeof item.maxRank === "number" && item.maxRank > 0;
                    const unitPlat = bestSell ? bestSell.platinum : null;
                    const linePlat = unitPlat !== null ? unitPlat * qty : null;
                    const lineTax = (item.tradingTax || 0) * qty;

                    return `
                        <div class="fav-detail-card">
                            <div>
                                <div class="fav-card-top">
                                    <img class="fav-card-thumb" src="${escapeHtml(getItemIcon(item))}" alt="${escapeHtml(name)}" data-open-url="${escapeHtml(itemUrl)}" onerror="this.src='${DEFAULT_FAVICON}'"/>
                                    <div class="fav-card-info">
                                        <div class="fav-card-title-row">
                                            <span class="fav-card-title" data-open-url="${escapeHtml(itemUrl)}">${escapeHtml(name)}</span>
                                            <div class="cart-qty-controls">
                                                <button class="btn-qty-step" data-cart-dec="${escapeHtml(slug)}" title="Diminuer la quantité">−</button>
                                                <span class="cart-qty-val">×${qty}</span>
                                                <button class="btn-qty-step" data-cart-inc="${escapeHtml(slug)}" title="Augmenter la quantité">+</button>
                                                <button class="btn-secondary btn-sm" data-cart-remove="${escapeHtml(slug)}" style="color:#ff7675;padding:3px 7px;" title="Retirer du panier">✕</button>
                                            </div>
                                        </div>
                                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:6px;">
                                            <span class="meta-pill tax">${wfIcon("credits", "wf-icon-sm wf-icon-cyan")} Taxe : <strong>${lineTax.toLocaleString("fr-FR")} Cr</strong></span>
                                            ${item.ducats ? `<span class="meta-pill ducats">${wfIcon("ducats", "wf-icon-sm wf-icon-gold")} ${item.ducats * qty} Ducats</span>` : ""}
                                            ${hasRank ? `
                                                <select class="alert-inline-select" data-cart-rank-slug="${escapeHtml(slug)}" style="padding:2px 8px;font-size:11.5px;">
                                                    <option value="any" ${rank === "any" ? "selected" : ""}>Tous rangs</option>
                                                    <option value="max" ${rank === "max" ? "selected" : ""}>Rang Max (${item.maxRank})</option>
                                                    <option value="0" ${rank === "0" ? "selected" : ""}>Rang 0</option>
                                                </select>
                                            ` : ""}
                                        </div>
                                    </div>
                                </div>

                                <div class="fav-price-box" style="margin-top:12px;">
                                    <div class="fav-price-col">
                                        <span class="fav-price-label">Prix Unitaire (En jeu)</span>
                                        <span class="fav-price-val" style="color:var(--sell-color)">
                                            ${unitPlat !== null ? `${unitPlat} Plat` : "Aucun"}
                                        </span>
                                    </div>
                                    <div class="fav-price-col">
                                        <span class="fav-price-label">Sous-total (×${qty})</span>
                                        <span class="fav-price-val" style="color:var(--accent-cyan)">
                                            ${linePlat !== null ? `${linePlat} Plat` : "—"}
                                        </span>
                                    </div>
                                    <div class="fav-price-col">
                                        <span class="fav-price-label">Vendeurs Actifs</span>
                                        <span class="fav-price-val">${sellersCount} en ligne</span>
                                    </div>
                                </div>
                            </div>

                            <div class="fav-card-footer">
                                ${bestSell ? `
                                    <div style="font-size:12px;color:var(--text-secondary);">
                                        Vendeur : <strong class="trader-name" data-open-url="https://warframe.market/profile/${encodeURIComponent(bestSell.user?.slug || bestSell.user?.ingameName || "")}">${escapeHtml(bestSell.user?.ingameName || "Tenno")}</strong> (${wfIcon("rep", "wf-icon-sm wf-icon-gold")} ${bestSell.user?.reputation ?? 0})
                                    </div>
                                    <div style="display:flex;gap:8px;">
                                        <button class="btn-secondary btn-sm" data-open-url="${escapeHtml(itemUrl)}">Ordres</button>
                                        <button class="btn-trade sell"
                                            data-whisper-user="${escapeHtml(bestSell.user?.ingameName || "")}"
                                            data-whisper-item-en="${escapeHtml(enName)}${qty > 1 ? ` x${qty}` : ""}"
                                            data-whisper-item-fr="${escapeHtml(name)}${qty > 1 ? ` x${qty}` : ""}"
                                            data-whisper-price="${linePlat}"
                                            data-whisper-type="sell"
                                            data-whisper-rank="${bestSell.rank ?? ""}"
                                            data-whisper-maxrank="${item.maxRank ?? ""}">
                                            Acheter ${linePlat}p (/w)
                                        </button>
                                    </div>
                                ` : `
                                    <span style="font-size:12px;color:var(--text-muted);">Aucun vendeur disponible</span>
                                    <button class="btn-secondary btn-sm" data-open-url="${escapeHtml(itemUrl)}">Fiche →</button>
                                `}
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `}
    `;

    bindCommonPageEvents(container, tab);

    container.querySelector("#btn-refresh-cart")?.addEventListener("click", () => {
        navigateTab(tab.id, tab.url, { pushHistory: false, forceRefresh: true });
    });

    container.querySelector("#btn-clear-cart")?.addEventListener("click", () => {
        clearShoppingCart();
    });

    // Autocomplétion d'ajout au panier
    const searchIn = container.querySelector("#cart-item-search-input");
    const slugIn = container.querySelector("#cart-selected-slug");
    const sugDrop = container.querySelector("#cart-item-suggestions");

    if (searchIn && sugDrop) {
        searchIn.addEventListener("input", () => {
            const q = searchIn.value.trim();
            slugIn.value = "";
            if (!q) {
                sugDrop.classList.add("hidden");
                return;
            }
            const results = searchCatalog(q, 8);
            if (!results.length) {
                sugDrop.classList.add("hidden");
                return;
            }
            sugDrop.innerHTML = results.map(it => `
                <div class="omnibox-item" data-pick-slug="${escapeHtml(it.slug)}" data-pick-name="${escapeHtml(getItemName(it))}">
                    <img src="${escapeHtml(getItemThumb(it))}" alt="" onerror="this.src='${DEFAULT_FAVICON}'"/>
                    <div class="omnibox-info">
                        <div class="omnibox-title">${escapeHtml(getItemName(it))}</div>
                        <div class="omnibox-url">${escapeHtml(it.slug)}</div>
                    </div>
                </div>
            `).join("");
            sugDrop.classList.remove("hidden");

            sugDrop.querySelectorAll("[data-pick-slug]").forEach(row => {
                row.addEventListener("mousedown", (e) => {
                    e.preventDefault();
                    slugIn.value = row.dataset.pickSlug;
                    searchIn.value = row.dataset.pickName;
                    sugDrop.classList.add("hidden");
                });
            });
        });

        searchIn.addEventListener("blur", () => {
            setTimeout(() => sugDrop.classList.add("hidden"), 150);
        });
    }

    container.querySelector("#btn-add-to-cart-submit")?.addEventListener("click", () => {
        let slug = slugIn?.value?.trim();
        if (!slug && searchIn?.value?.trim()) {
            const matches = searchCatalog(searchIn.value.trim(), 1);
            if (matches.length > 0) slug = matches[0].slug;
        }
        if (!slug || !State.itemsBySlug.has(slug)) {
            searchIn?.focus();
            return;
        }
        const qtyVal = Math.max(1, Math.min(99, Number(container.querySelector("#cart-item-qty-input")?.value || 1)));
        const existing = getCartEntry(slug);
        addOrUpdateCartItem(slug, existing ? existing.qty + qtyVal : qtyVal, existing ? existing.rank : "any");
    });

    container.querySelectorAll("[data-cart-inc]").forEach(btn => {
        btn.addEventListener("click", () => {
            const slug = btn.dataset.cartInc;
            const entry = getCartEntry(slug);
            if (entry) addOrUpdateCartItem(slug, entry.qty + 1, entry.rank);
        });
    });

    container.querySelectorAll("[data-cart-dec]").forEach(btn => {
        btn.addEventListener("click", () => {
            const slug = btn.dataset.cartDec;
            const entry = getCartEntry(slug);
            if (!entry) return;
            if (entry.qty <= 1) removeCartItem(slug);
            else addOrUpdateCartItem(slug, entry.qty - 1, entry.rank);
        });
    });

    container.querySelectorAll("[data-cart-remove]").forEach(btn => {
        btn.addEventListener("click", () => removeCartItem(btn.dataset.cartRemove));
    });

    container.querySelectorAll("[data-cart-rank-slug]").forEach(sel => {
        sel.addEventListener("change", () => {
            const slug = sel.dataset.cartRankSlug;
            const entry = getCartEntry(slug);
            if (entry) addOrUpdateCartItem(slug, entry.qty, sel.value);
        });
    });
}

/* ---------- 3C. ONGLET ALERTES DE PRIX / PRICE SNIPER (https://warframe.market/alerts) ---------- */

function renderAlertsPage(container, tab) {
    const alerts = State.priceAlerts || [];
    const activeCount = alerts.filter(a => a.enabled !== false).length;

    container.innerHTML = `
        <div class="fav-summary-banner">
            <div>
                <h2 class="section-title" style="margin-bottom:4px;">${wfIcon("alert", "wf-icon-cyan")} Système d'Alertes de Prix — Price Sniper (${activeCount} actives / ${alerts.length})</h2>
                <p style="font-size:12.5px;color:var(--text-secondary);">
                    Définissez votre prix cible en Platinum sur n'importe quel item : WireMarket surveille le marché en arrière-plan (toutes les <strong>${State.alertRepeatInterval}s</strong>) et vous alerte avec une notification visuelle et sonore dès qu'un joueur vend à votre prix.
                </p>
            </div>
            <div class="fav-summary-metrics">
                <select class="select-sm" id="select-alerts-sound-choice" title="Choisir le son de notification">
                    <option value="default" ${State.alertSoundChoice !== "bell" ? "selected" : ""}>🔔 Son 1 : Classique</option>
                    <option value="bell" ${State.alertSoundChoice === "bell" ? "selected" : ""}>🔔 Son 2 : Cloche (Bell)</option>
                </select>
                <button class="btn-secondary btn-sm" id="btn-alerts-test-sound">${wfIcon("sound", "wf-icon-sm wf-icon-cyan")} Tester le son (${State.alertVolume}%)</button>
                <button class="btn-secondary btn-sm" id="btn-alerts-open-settings">${wfIcon("gear", "wf-icon-sm wf-icon-cyan")} Paramètres Son & Répétition</button>
                <button class="btn-primary btn-sm" id="btn-alerts-scan-now">↻ Scanner toutes les alertes maintenant</button>
            </div>
        </div>

        <!-- Formulaire d'ajout rapide d'une alerte -->
        <div class="alert-create-panel">
            <h3 style="font-size:14px;font-weight:800;margin-bottom:10px;color:var(--accent-cyan);">+ Créer une nouvelle Alerte de Prix</h3>
            <div class="alert-create-form">
                <div class="alert-search-wrap">
                    <label>Item Warframe Market :</label>
                    <input type="text" id="alert-item-search-input" autocomplete="off" placeholder="Tapez le nom d'un item (ex: Wisp Prime Set, Arcane Énergétique, Glaive Prime...)" />
                    <input type="hidden" id="alert-selected-slug" value="" />
                    <div id="alert-item-suggestions" class="omnibox-dropdown hidden"></div>
                </div>
                <div class="alert-field-wrap">
                    <label>Prix cible max (≤ Platinum) :</label>
                    <input type="number" id="alert-target-price-input" min="1" max="99999" value="40" />
                </div>
                <div class="alert-field-wrap">
                    <label>Statut vendeur :</label>
                    <select id="alert-status-mode-select">
                        <option value="ingame" selected>◆ En jeu uniquement (In Game)</option>
                        <option value="online">◇ En jeu + En ligne</option>
                    </select>
                </div>
                <button class="btn-primary" id="btn-create-new-alert">${wfIcon("alert", "wf-icon-sm")} Ajouter l'alerte</button>
            </div>
        </div>

        ${alerts.length === 0 ? `
            <div class="orders-panel" style="padding:40px 24px;text-align:center;">
                <h3 style="margin-bottom:8px;">${wfIcon("alert", "wf-icon-cyan")} Aucune alerte de prix configurée</h3>
                <p style="color:var(--text-secondary);margin-bottom:16px;">
                    Utilisez le formulaire ci-dessus ou cliquez sur le bouton <strong>« Créer une alerte de prix »</strong> directement sur la page de n'importe quel item.
                </p>
                <button class="btn-secondary" data-open-url="https://warframe.market/items">Parcourir le Catalogue →</button>
            </div>
        ` : `
            <div class="fav-details-grid">
                ${alerts.map(alertObj => {
                    const item = State.itemsBySlug.get(alertObj.slug);
                    const name = item ? getItemName(item) : alertObj.slug;
                    const enName = item ? getItemEnName(item) : name;
                    const thumb = item ? getItemIcon(item) : DEFAULT_FAVICON;
                    const itemUrl = `https://warframe.market/items/${alertObj.slug}`;
                    const isEnabled = alertObj.enabled !== false;
                    const bestPrice = alertObj.lastBestPrice;
                    const seller = alertObj.lastBestSeller;
                    const isTriggered = isEnabled && bestPrice !== null && bestPrice <= alertObj.targetPrice;

                    return `
                        <div class="fav-detail-card alert-card ${isTriggered ? "alert-triggered" : ""} ${!isEnabled ? "alert-paused" : ""}">
                            <div>
                                <div class="fav-card-top">
                                    <img class="fav-card-thumb" src="${escapeHtml(thumb)}" alt="${escapeHtml(name)}" data-open-url="${escapeHtml(itemUrl)}" onerror="this.src='${DEFAULT_FAVICON}'"/>
                                    <div class="fav-card-info">
                                        <div class="fav-card-title-row">
                                            <span class="fav-card-title" data-open-url="${escapeHtml(itemUrl)}">${escapeHtml(name)}</span>
                                            <div style="display:flex;gap:6px;align-items:center;">
                                                <span class="status-badge ${isTriggered ? "online" : (isEnabled ? "ingame" : "offline")}">
                                                    ${isTriggered ? `${wfIcon("target", "wf-icon-sm")} CIBLE ATTEINTE !` : (isEnabled ? "◆ Surveillance active" : "◇ En pause")}
                                                </span>
                                            </div>
                                        </div>
                                        <div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;">
                                            Condition : Vendeur ${alertObj.statusMode === "online" ? "En jeu / En ligne" : "En jeu"} · Dernier scan : ${escapeHtml(alertObj.lastCheckedAt || "En attente...")}
                                        </div>
                                    </div>
                                </div>

                                <div class="fav-price-box" style="margin-top:12px;">
                                    <div class="fav-price-col">
                                        <span class="fav-price-label">Votre Prix Cible</span>
                                        <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
                                            <span style="font-weight:800;color:var(--accent-cyan);">≤</span>
                                            <input type="number" class="alert-card-price-input" data-alert-price-slug="${escapeHtml(alertObj.slug)}" value="${alertObj.targetPrice}" min="1" max="99999" />
                                            <span style="font-size:12px;font-weight:700;">Plat</span>
                                        </div>
                                    </div>
                                    <div class="fav-price-col">
                                        <span class="fav-price-label">Meilleur Prix Actuel</span>
                                        <span class="fav-price-val" style="color:${isTriggered ? "var(--sell-color)" : "var(--text-main)"}">
                                            ${bestPrice !== null ? `${bestPrice} Plat` : "—"}
                                        </span>
                                    </div>
                                    <div class="fav-price-col">
                                        <span class="fav-price-label">Vendeur détecté</span>
                                        <span class="fav-price-val" style="font-size:13px;">
                                            ${seller ? escapeHtml(seller.ingameName) : "Aucun"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="fav-card-footer">
                                <div style="display:flex;gap:6px;">
                                    <button class="btn-secondary btn-sm" data-toggle-alert="${escapeHtml(alertObj.slug)}">
                                        ${isEnabled ? `${wfIcon("pause", "wf-icon-sm")} Pause` : `${wfIcon("play", "wf-icon-sm")} Activer`}
                                    </button>
                                    <button class="btn-secondary btn-sm" data-delete-alert="${escapeHtml(alertObj.slug)}" style="color:#ff7675;">
                                        ${wfIcon("trash", "wf-icon-sm")} Supprimer
                                    </button>
                                </div>
                                <div style="display:flex;gap:8px;">
                                    <button class="btn-secondary btn-sm" data-open-url="${escapeHtml(itemUrl)}">Voir l'item</button>
                                    ${seller && bestPrice !== null ? `
                                        <button class="btn-trade sell"
                                            data-whisper-user="${escapeHtml(seller.ingameName || "")}"
                                            data-whisper-item-en="${escapeHtml(enName)}"
                                            data-whisper-item-fr="${escapeHtml(name)}"
                                            data-whisper-price="${bestPrice}"
                                            data-whisper-type="sell"
                                            data-whisper-rank="${seller.rank ?? ""}"
                                            data-whisper-maxrank="${item?.maxRank ?? ""}">
                                            Acheter ${bestPrice}p (/w)
                                        </button>
                                    ` : ""}
                                </div>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `}

        <div style="margin-top:22px;">
            ${renderWorldAlertsPanelHtml("all")}
        </div>
    `;

    bindWorldAlertsPanelEvents(container);
    bindCommonPageEvents(container, tab);

    container.querySelector("#btn-alerts-test-sound")?.addEventListener("click", () => {
        playAlertNotificationSound(true);
    });

    container.querySelector("#select-alerts-sound-choice")?.addEventListener("change", (e) => {
        setAlertSoundChoice(e.target.value, true);
    });

    container.querySelector("#btn-alerts-open-settings")?.addEventListener("click", () => {
        renderThemesGrid();
        document.getElementById("settings-modal")?.classList.remove("hidden");
    });

    container.querySelector("#btn-alerts-scan-now")?.addEventListener("click", async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;
        btn.textContent = "⏳ Scan en cours...";
        await checkAllPriceAlerts(true);
        renderActiveTabPage();
    });

    // Autocomplétion du champ d'ajout d'alerte
    const searchIn = container.querySelector("#alert-item-search-input");
    const slugIn = container.querySelector("#alert-selected-slug");
    const sugDrop = container.querySelector("#alert-item-suggestions");

    if (searchIn && sugDrop) {
        searchIn.addEventListener("input", () => {
            const q = searchIn.value.trim();
            slugIn.value = "";
            if (!q) {
                sugDrop.classList.add("hidden");
                return;
            }
            const results = searchCatalog(q, 8);
            if (!results.length) {
                sugDrop.classList.add("hidden");
                return;
            }
            sugDrop.innerHTML = results.map(it => `
                <div class="omnibox-item" data-pick-slug="${escapeHtml(it.slug)}" data-pick-name="${escapeHtml(getItemName(it))}">
                    <img src="${escapeHtml(getItemThumb(it))}" alt="" onerror="this.src='${DEFAULT_FAVICON}'"/>
                    <div class="omnibox-info">
                        <div class="omnibox-title">${escapeHtml(getItemName(it))}</div>
                        <div class="omnibox-url">${escapeHtml(it.slug)}</div>
                    </div>
                </div>
            `).join("");
            sugDrop.classList.remove("hidden");

            sugDrop.querySelectorAll("[data-pick-slug]").forEach(row => {
                row.addEventListener("mousedown", (e) => {
                    e.preventDefault();
                    slugIn.value = row.dataset.pickSlug;
                    searchIn.value = row.dataset.pickName;
                    sugDrop.classList.add("hidden");
                });
            });
        });

        searchIn.addEventListener("blur", () => {
            setTimeout(() => sugDrop.classList.add("hidden"), 150);
        });
    }

    container.querySelector("#btn-create-new-alert")?.addEventListener("click", () => {
        let slug = slugIn?.value?.trim();
        if (!slug && searchIn?.value?.trim()) {
            const matches = searchCatalog(searchIn.value.trim(), 1);
            if (matches.length > 0) slug = matches[0].slug;
        }
        if (!slug || !State.itemsBySlug.has(slug)) {
            searchIn?.focus();
            return;
        }
        const priceVal = Number(container.querySelector("#alert-target-price-input")?.value || 40);
        const statusMode = container.querySelector("#alert-status-mode-select")?.value || "ingame";
        upsertPriceAlert(slug, priceVal, statusMode);
    });

    container.querySelectorAll("[data-toggle-alert]").forEach(btn => {
        btn.addEventListener("click", () => togglePriceAlertActive(btn.dataset.toggleAlert));
    });

    container.querySelectorAll("[data-delete-alert]").forEach(btn => {
        btn.addEventListener("click", () => removePriceAlert(btn.dataset.deleteAlert));
    });

    container.querySelectorAll("[data-alert-price-slug]").forEach(inp => {
        inp.addEventListener("change", () => {
            const slug = inp.dataset.alertPriceSlug;
            const alertObj = getAlertForSlug(slug);
            if (alertObj) {
                upsertPriceAlert(slug, Number(inp.value || 1), alertObj.statusMode);
            }
        });
    });
}

/* ---------- 4. CATALOGUE COMPLET DES ITEMS (https://warframe.market/items) ---------- */

function renderCatalogPage(container, tab) {
    const vs = tab.viewState;
    const cat = vs.catalogCategory || "all";
    const q = normalizeSearch(vs.catalogQuery || "");

    const filtered = State.itemsList.filter(item => {
        const tags = item.tags || [];
        if (cat === "prime_set" && !(tags.includes("prime") && tags.includes("set"))) return false;
        else if (cat !== "all" && cat !== "prime_set" && !tags.includes(cat)) return false;
        if (q && !(item._searchKey || "").includes(q)) return false;
        return true;
    });

    container.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">Catalogue Warframe Market (${filtered.length} items)</h2>
            <div class="orders-filters">
                <input type="text" id="catalog-filter-input" placeholder="Filtrer dans le catalogue..." value="${escapeHtml(vs.catalogQuery || "")}" style="min-width:240px;" />
            </div>
        </div>

        <div class="quick-tags" style="margin-bottom:18px;">
            <button class="tag-chip ${cat === "all" ? "active" : ""}" data-cat="all">Tous (${State.itemsList.length})</button>
            <button class="tag-chip ${cat === "prime_set" ? "active" : ""}" data-cat="prime_set">${wfIcon("prime", "wf-icon-gold")} Sets Prime</button>
            <button class="tag-chip ${cat === "warframe" ? "active" : ""}" data-cat="warframe">${wfIcon("warframe", "wf-icon-cyan")} Warframes</button>
            <button class="tag-chip ${cat === "weapon" ? "active" : ""}" data-cat="weapon">${wfIcon("weapon", "wf-icon-cyan")} Armes</button>
            <button class="tag-chip ${cat === "mod" ? "active" : ""}" data-cat="mod">${wfIcon("mod", "wf-icon-cyan")} Mods</button>
            <button class="tag-chip ${cat === "arcane_enhancement" ? "active" : ""}" data-cat="arcane_enhancement">${wfIcon("arcane", "wf-icon-riven")} Arcanes</button>
            <button class="tag-chip ${cat === "relic" ? "active" : ""}" data-cat="relic">${wfIcon("relic", "wf-icon-gold")} Reliques</button>
            <button class="tag-chip ${cat === "syndicate" ? "active" : ""}" data-cat="syndicate">${wfIcon("syndicate", "wf-icon-gold")} Syndicats</button>
        </div>

        <div class="featured-grid">
            ${filtered.slice(0, 96).map(item => renderItemCardHtml(item)).join("")}
        </div>
    `;

    bindCommonPageEvents(container, tab);

    container.querySelectorAll("[data-cat]").forEach(btn => {
        btn.addEventListener("click", () => {
            tab.viewState.catalogCategory = btn.dataset.cat;
            renderActiveTabPage();
        });
    });

    const input = container.querySelector("#catalog-filter-input");
    if (input) {
        input.addEventListener("input", () => {
            tab.viewState.catalogQuery = input.value;
            renderActiveTabPage();
            const el = document.getElementById("catalog-filter-input");
            if (el) {
                el.focus();
                el.setSelectionRange(el.value.length, el.value.length);
            }
        });
    }
}

/* ---------- 5. PAGE ORDRES RÉCENTS & DUCANATOR & PROFIL ---------- */

function renderRecentOrdersPage(container, tab) {
    const orders = tab.cachedData.recentOrders || [];
    container.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">Flux en Direct des Ordres Récents</h2>
            <button class="btn-primary btn-sm" id="btn-refresh-recent">↻ Actualiser le flux</button>
        </div>
        ${renderRecentOrdersTableHtml(orders)}
    `;
    bindCommonPageEvents(container, tab);
    const btn = container.querySelector("#btn-refresh-recent");
    if (btn) {
        btn.addEventListener("click", () => navigateTab(tab.id, tab.url, { pushHistory: false, forceRefresh: true }));
    }
}

function renderDucanatorPage(container, tab) {
    const ducatsList = (tab.cachedData.ducatsData || []).slice().sort((a, b) => (b.ducats_per_platinum_wa || 0) - (a.ducats_per_platinum_wa || 0));

    if (ducatsList.length > 0) {
        container.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">${wfIcon("ducats", "wf-icon-gold")} Ducanator — Meilleurs Ratios Ducats / Platinum (En direct)</h2>
                <button class="btn-primary btn-sm" id="btn-refresh-ducats">↻ Actualiser les ratios</button>
            </div>
            <div class="orders-panel">
                <table class="orders-table">
                    <thead>
                        <tr>
                            <th>Pièce Prime</th>
                            <th>Valeur Ducats</th>
                            <th>Ratio (Ducats / Plat)</th>
                            <th>Prix Moyen (WA)</th>
                            <th>Volume vendu</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ducatsList.slice(0, 60).map(row => {
                            const item = State.itemsById.get(row.item);
                            if (!item) return "";
                            const url = `https://warframe.market/items/${item.slug}`;
                            return `
                                <tr>
                                    <td>
                                        <div class="trader-cell">
                                            <img class="trader-avatar" style="border-radius:4px;" src="${escapeHtml(getItemThumb(item))}" alt=""/>
                                            <span class="trader-name" data-open-url="${escapeHtml(url)}">${escapeHtml(getItemName(item))}</span>
                                        </div>
                                    </td>
                                    <td><span class="rank-badge">${wfIcon("ducats", "wf-icon-sm wf-icon-gold")} ${row.ducats} Ducats</span></td>
                                    <td><strong style="color:var(--sell-color)">${(row.ducats_per_platinum_wa || row.ducats_per_platinum || 0).toFixed(2)} Ducats/Plat</strong></td>
                                    <td>
                                        <span class="plat-price">
                                            <span>${(row.wa_price || row.median || 0).toFixed(1)}</span>
                                            <span class="plat-icon"></span>
                                        </span>
                                    </td>
                                    <td>${row.volume || 0}</td>
                                    <td>
                                        <button class="btn-secondary btn-sm" data-open-url="${escapeHtml(url)}">Voir les offres →</button>
                                    </td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        `;
        bindCommonPageEvents(container, tab);
        const btn = container.querySelector("#btn-refresh-ducats");
        if (btn) {
            btn.addEventListener("click", () => navigateTab(tab.id, tab.url, { pushHistory: false, forceRefresh: true }));
        }
        return;
    }

    const primeParts = State.itemsList.filter(i => {
        const tags = i.tags || [];
        return tags.includes("prime") && !tags.includes("set");
    }).slice(0, 80);

    container.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">${wfIcon("ducats", "wf-icon-gold")} Ducanator — Parties Prime pour Baro Ki'Teer</h2>
            <span style="color:var(--text-secondary);font-size:13px;">Cliquez sur n'importe quel composant Prime pour consulter ses vendeurs en Platinum et sa valeur en Ducats.</span>
        </div>
        <div class="featured-grid">
            ${primeParts.map(item => renderItemCardHtml(item)).join("")}
        </div>
    `;
    bindCommonPageEvents(container, tab);
}

function renderContractsPage(container, tab) {
    const weapons = State.rivenWeapons || [];
    const currentWeapon = tab.viewState.rivenWeapon || "torid";
    const auctions = (tab.cachedData.auctions || []).filter(a => a.visible && !a.closed);

    container.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">${wfIcon("arcane", "wf-icon-riven")} Contrats & Enchères de Mods Riven</h2>
            <div class="orders-filters">
                <div class="filter-group">
                    <label>Arme :</label>
                    <select id="riven-weapon-select">
                        ${weapons.map(w => `
                            <option value="${escapeHtml(w.slug)}" ${w.slug === currentWeapon ? "selected" : ""}>
                                ${escapeHtml(getItemName(w))}
                            </option>
                        `).join("")}
                    </select>
                </div>
                <button class="btn-primary btn-sm" id="btn-refresh-rivens">↻ Rechercher</button>
            </div>
        </div>

        <div class="riven-grid">
            ${auctions.slice(0, 48).map(auc => {
                const riven = auc.item || {};
                const owner = auc.owner || {};
                const attrs = riven.attributes || [];
                const price = auc.buyout_price || auc.starting_price || 0;
                const weaponObj = weapons.find(w => w.slug === riven.weapon_url_name);
                const weaponTitle = weaponObj ? getItemName(weaponObj) : (riven.weapon_url_name || "").replace(/_/g, " ");
                const fullRivenName = `${weaponTitle} ${riven.name || ""}`;
                return `
                    <div class="riven-card">
                        <div>
                            <div class="riven-header">
                                <div class="riven-title">${escapeHtml(fullRivenName)}</div>
                                ${renderStatusBadge(owner.status || "offline")}
                            </div>
                            <div class="riven-meta-pills" style="margin:8px 0 10px;">
                                <span class="riven-pill">MR ${riven.mastery_level ?? 8}</span>
                                <span class="riven-pill">Rang ${riven.mod_rank ?? 0}</span>
                                <span class="riven-pill">${wfIcon("repeat", "wf-icon-sm wf-icon-riven")} ${riven.re_rolls ?? 0} Rolls</span>
                                ${riven.polarity ? `<span class="riven-pill">Polarité: ${escapeHtml(riven.polarity)}</span>` : ""}
                            </div>
                            <div class="riven-stats-list">
                                ${attrs.map(at => {
                                    const attrDef = State.rivenAttrsBySlug?.get(at.url_name);
                                    const attrName = attrDef ? getItemName(attrDef) : at.url_name.replace(/_/g, " ");
                                    const sign = at.value > 0 ? "+" : "";
                                    return `<div class="riven-stat ${at.positive ? "pos" : "neg"}">${sign}${at.value}% ${escapeHtml(attrName)}</div>`;
                                }).join("")}
                            </div>
                        </div>
                        <div class="riven-footer">
                            <div>
                                <div class="trader-name" data-open-url="https://warframe.market/profile/${encodeURIComponent(owner.ingame_name || "")}">${escapeHtml(owner.ingame_name || "Tenno")}</div>
                                <div class="trader-rep">${wfIcon("rep", "wf-icon-sm wf-icon-gold")} ${owner.reputation ?? 0}</div>
                            </div>
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span class="plat-price">
                                    <span>${price}</span>
                                    <span class="plat-icon"></span>
                                </span>
                                <button class="btn-trade sell"
                                    data-whisper-user="${escapeHtml(owner.ingame_name || "")}"
                                    data-whisper-item-en="${escapeHtml(fullRivenName)} (Riven)"
                                    data-whisper-item-fr="${escapeHtml(fullRivenName)} (Riven)"
                                    data-whisper-price="${price}"
                                    data-whisper-type="sell"
                                    data-whisper-rank=""
                                    data-whisper-maxrank="">
                                    Acheter (/w)
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join("")}
        </div>
    `;

    bindCommonPageEvents(container, tab);
    const wSel = container.querySelector("#riven-weapon-select");
    if (wSel) {
        wSel.addEventListener("change", () => {
            tab.viewState.rivenWeapon = wSel.value;
            navigateTab(tab.id, `https://warframe.market/contracts?weapon=${encodeURIComponent(wSel.value)}`);
        });
    }
    const rBtn = container.querySelector("#btn-refresh-rivens");
    if (rBtn) {
        rBtn.addEventListener("click", () => navigateTab(tab.id, tab.url, { pushHistory: false, forceRefresh: true }));
    }
}

function renderProfilePage(container, tab) {
    const user = tab.cachedData.profileUser || {};
    const orders = tab.cachedData.profileOrders || [];
    const sellOrders = orders.filter(o => o.type === "sell" && o.visible);
    const buyOrders = orders.filter(o => o.type === "buy" && o.visible);
    const avatar = user.avatar ? assetUrl(user.avatar) : DEFAULT_FAVICON;

    container.innerHTML = `
        <div class="item-page-header">
            <div class="item-header-top">
                <img class="item-hero-thumb" style="border-radius:50%;" src="${escapeHtml(avatar)}" alt="" onerror="this.src='${DEFAULT_FAVICON}'"/>
                <div class="item-header-info">
                    <div class="item-title-row">
                        <h1>${escapeHtml(user.ingameName || user.slug || "Profil Tenno")}</h1>
                        ${renderStatusBadge(user.status || "offline")}
                    </div>
                    <div class="item-meta-badges">
                        <span class="meta-pill">${wfIcon("rep", "wf-icon-sm wf-icon-gold")} Réputation : <strong>${user.reputation ?? 0}</strong></span>
                        <span class="meta-pill">${wfIcon("codex", "wf-icon-sm wf-icon-cyan")} Plateforme : <strong>${(user.platform || "PC").toUpperCase()}</strong></span>
                        <span class="meta-pill">${wfIcon("plat", "wf-icon-sm wf-icon-cyan")} Ordres de vente : <strong style="color:var(--sell-color)">${sellOrders.length}</strong></span>
                        <span class="meta-pill">${wfIcon("credits", "wf-icon-sm wf-icon-gold")} Ordres d'achat : <strong style="color:var(--buy-color)">${buyOrders.length}</strong></span>
                    </div>
                </div>
            </div>
        </div>

        <div class="orders-columns">
            <div class="orders-panel">
                <div class="orders-panel-header sell-header">
                    <span>Ses Ventes (${sellOrders.length})</span>
                </div>
                ${renderProfileOrdersTable(sellOrders, user, "sell")}
            </div>
            <div class="orders-panel">
                <div class="orders-panel-header buy-header">
                    <span>Ses Achats (${buyOrders.length})</span>
                </div>
                ${renderProfileOrdersTable(buyOrders, user, "buy")}
            </div>
        </div>
    `;
    bindCommonPageEvents(container, tab);
}

function renderProfileOrdersTable(orders, user, side) {
    if (!orders.length) {
        return `<div style="padding:24px;text-align:center;color:var(--text-muted);">Aucun ordre actif.</div>`;
    }
    const isSell = side === "sell";
    return `
        <table class="orders-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Prix</th>
                    <th>Qté</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${orders.slice(0, 80).map(order => {
                    const item = State.itemsById.get(order.itemId);
                    const itemName = item ? getItemName(item) : "Item #" + order.itemId;
                    const itemUrl = item ? `https://warframe.market/items/${item.slug}` : "https://warframe.market/";
                    return `
                        <tr>
                            <td>
                                <div class="trader-cell">
                                    <img class="trader-avatar" style="border-radius:4px;" src="${escapeHtml(item ? getItemThumb(item) : DEFAULT_FAVICON)}" alt=""/>
                                    <div>
                                        <span class="trader-name" data-open-url="${escapeHtml(itemUrl)}">${escapeHtml(itemName)}</span>
                                        ${order.rank !== undefined ? `<span class="rank-badge" style="margin-left:6px;">Rang ${order.rank}</span>` : ""}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="plat-price">
                                    <span>${order.platinum}</span>
                                    <span class="plat-icon"></span>
                                </span>
                            </td>
                            <td>${order.quantity || 1}</td>
                            <td>
                                <button class="btn-trade ${isSell ? "sell" : "buy"}"
                                    data-whisper-user="${escapeHtml(user.ingameName || "")}"
                                    data-whisper-item-en="${escapeHtml(item ? getItemEnName(item) : itemName)}"
                                    data-whisper-item-fr="${escapeHtml(itemName)}"
                                    data-whisper-price="${order.platinum}"
                                    data-whisper-type="${order.type}"
                                    data-whisper-rank="${order.rank ?? ""}"
                                    data-whisper-maxrank="${item?.maxRank ?? ""}">
                                    ${isSell ? "Acheter (/w)" : "Vendre (/w)"}
                                </button>
                            </td>
                        </tr>
                    `;
                }).join("")}
            </tbody>
        </table>
    `;
}

/* ==================== ÉVÉNEMENTS COMMUNS AUX PAGES ==================== */

function bindCommonPageEvents(container, tab) {
    // Liens internes data-open-url (clic gauche = onglet actif, Ctrl+Clic ou Clic molette = nouvel onglet)
    container.querySelectorAll("[data-open-url]").forEach(el => {
        el.addEventListener("click", (e) => {
            if (e.target.closest("[data-newtab-url]") || e.target.closest("[data-fav-slug]") || e.target.closest("[data-cart-slug]")) return;
            const url = el.dataset.openUrl;
            if (e.ctrlKey || e.metaKey) {
                createTab(url, true);
            } else {
                navigateTab(tab.id, url);
            }
        });
        el.addEventListener("auxclick", (e) => {
            if (e.button === 1) {
                e.preventDefault();
                createTab(el.dataset.openUrl, false);
            }
        });
    });

    // Boutons étoile (Ajouter/Retirer des items favoris)
    container.querySelectorAll("[data-fav-slug]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFavoriteItem(btn.dataset.favSlug);
        });
    });

    // Boutons panier (Ajouter/Retirer du panier d'achats)
    container.querySelectorAll("[data-cart-slug]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleCartItem(btn.dataset.cartSlug);
        });
    });

    // Boutons ouvrir dans un nouvel onglet (↗)
    container.querySelectorAll("[data-newtab-url]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            createTab(btn.dataset.newtabUrl, true);
        });
    });

    // Boutons Whisper (/w)
    container.querySelectorAll("[data-whisper-user]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            triggerWhisper({
                user: btn.dataset.whisperUser,
                itemEn: btn.dataset.whisperItemEn,
                itemFr: btn.dataset.whisperItemFr,
                price: btn.dataset.whisperPrice,
                type: btn.dataset.whisperType,
                rank: btn.dataset.whisperRank,
                maxRank: btn.dataset.whisperMaxrank
            });
        });
    });
}

/* ==================== SYSTÈME DE MESSAGE /W WARFRAME ==================== */

function formatWhisperMessage(data) {
    if (!data) return "";
    const rankSuffix = (data.rank !== "" && data.maxRank !== "")
        ? ` (rank ${data.rank})`
        : "";
    const rankSuffixFr = (data.rank !== "" && data.maxRank !== "")
        ? ` (rang ${data.rank})`
        : "";

    if (State.whisperLang === "fr") {
        const actionFr = data.type === "sell" ? "acheter" : "te vendre";
        return `/w ${data.user} Salut ! Je voudrais ${actionFr} : "${data.itemFr}"${rankSuffixFr} pour ${data.price} platinum. (warframe.market)`;
    }
    const actionEn = data.type === "sell" ? "buy" : "sell";
    return `/w ${data.user} Hi! I want to ${actionEn}: "${data.itemEn}"${rankSuffix} for ${data.price} platinum. (warframe.market)`;
}

function triggerWhisper(data) {
    State.lastWhisperData = data;
    const msg = formatWhisperMessage(data);
    const bar = document.getElementById("whisper-bar");
    const input = document.getElementById("whisper-input");
    input.value = msg;
    bar.classList.remove("hidden");

    navigator.clipboard?.writeText(msg).catch(() => {
        input.select();
        document.execCommand("copy");
    });
}

/* ==================== FAVORIS & TIROIR HISTORIQUE ==================== */

function renderBookmarksBar() {
    const bar = document.getElementById("bookmarks-bar");
    bar.innerHTML = State.bookmarks.map(bm => `
        <div class="bookmark-chip" data-bm-url="${escapeHtml(bm.url)}" title="${escapeHtml(bm.title)}\n${escapeHtml(bm.url)} (Clic molette = nouvel onglet)">
            <img src="${escapeHtml(bm.icon || DEFAULT_FAVICON)}" alt="" onerror="this.src='${DEFAULT_FAVICON}'"/>
            <span>${escapeHtml(bm.title)}</span>
        </div>
    `).join("");

    bar.querySelectorAll(".bookmark-chip").forEach(chip => {
        chip.addEventListener("click", (e) => {
            const url = chip.dataset.bmUrl;
            if (e.ctrlKey || e.metaKey) createTab(url, true);
            else navigateTab(State.activeTabId, url);
        });
        chip.addEventListener("auxclick", (e) => {
            if (e.button === 1) createTab(chip.dataset.bmUrl, false);
        });
    });
}

function toggleBookmarkCurrentTab() {
    const tab = getActiveTab();
    if (!tab) return;
    const parsed = parseWfmUrl(tab.url);
    if (parsed.route === "item" && parsed.slug) {
        toggleFavoriteItem(parsed.slug);
        return;
    }
    const idx = State.bookmarks.findIndex(b => b.url === tab.url);
    if (idx >= 0) {
        State.bookmarks.splice(idx, 1);
    } else {
        State.bookmarks.push({
            title: tab.title.replace(/\s*-\s*Warframe Market.*$/i, ""),
            url: tab.url,
            icon: tab.icon || DEFAULT_FAVICON
        });
    }
    saveBookmarks();
    renderBookmarksBar();
    syncBrowserChromeToActiveTab();
}

function renderDrawer() {
    const body = document.getElementById("drawer-body");
    if (State.activeDrawerTab === "history") {
        if (!State.history.length) {
            body.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted);">Aucun historique de navigation.</div>`;
            return;
        }
        body.innerHTML = State.history.map(h => `
            <div class="drawer-entry" data-drawer-url="${escapeHtml(h.url)}">
                <div>
                    <div class="drawer-entry-title">${escapeHtml(h.title)}</div>
                    <div class="drawer-entry-sub">${escapeHtml(h.time)} · ${escapeHtml(h.url)}</div>
                </div>
            </div>
        `).join("");
    } else {
        body.innerHTML = State.bookmarks.map((b, i) => `
            <div class="drawer-entry" data-drawer-url="${escapeHtml(b.url)}">
                <div>
                    <div class="drawer-entry-title">${escapeHtml(b.title)}</div>
                    <div class="drawer-entry-sub">${escapeHtml(b.url)}</div>
                </div>
                <button class="tab-close" data-del-bm="${i}" title="Supprimer des favoris">✕</button>
            </div>
        `).join("");
    }

    body.querySelectorAll("[data-drawer-url]").forEach(el => {
        el.addEventListener("click", (e) => {
            if (e.target.closest("[data-del-bm]")) return;
            navigateTab(State.activeTabId, el.dataset.drawerUrl);
        });
    });

    body.querySelectorAll("[data-del-bm]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            State.bookmarks.splice(Number(btn.dataset.delBm), 1);
            saveBookmarks();
            renderBookmarksBar();
            renderDrawer();
            syncBrowserChromeToActiveTab();
        });
    });
}

/* ==================== AUTOCOMPLÉTION RECHERCHE & OMNIBOX ==================== */

function renderSearchSuggestions(query, dropdownEl, onSelectUrl) {
    const q = query.trim();
    if (!q) {
        dropdownEl.classList.add("hidden");
        return;
    }

    const results = searchCatalog(q, 10);
    if (results.length === 0) {
        dropdownEl.innerHTML = `
            <div class="omnibox-item" data-sug-url="https://warframe.market/items?q=${encodeURIComponent(q)}">
                <div class="omnibox-info">
                    <div class="omnibox-title">Rechercher "${escapeHtml(q)}" dans le catalogue</div>
                    <div class="omnibox-url">https://warframe.market/items?q=${escapeHtml(q)}</div>
                </div>
            </div>
        `;
    } else {
        dropdownEl.innerHTML = results.map(item => {
            const url = `https://warframe.market/items/${item.slug}`;
            const name = getItemName(item);
            const enName = getItemEnName(item);
            return `
                <div class="omnibox-item" data-sug-url="${escapeHtml(url)}">
                    <img src="${escapeHtml(getItemThumb(item))}" alt="" onerror="this.src='${DEFAULT_FAVICON}'"/>
                    <div class="omnibox-info">
                        <div class="omnibox-title">${escapeHtml(name)} ${enName !== name ? `<span style="color:var(--text-muted);font-weight:400;">(${escapeHtml(enName)})</span>` : ""}</div>
                        <div class="omnibox-url">${escapeHtml(url)}</div>
                    </div>
                    <button class="omnibox-newtab-btn" data-sug-newtab="${escapeHtml(url)}" title="Ouvrir dans un nouvel onglet">+ Onglet</button>
                </div>
            `;
        }).join("");
    }

    dropdownEl.classList.remove("hidden");

    dropdownEl.querySelectorAll("[data-sug-url]").forEach(row => {
        row.addEventListener("mousedown", (e) => {
            if (e.target.closest("[data-sug-newtab]")) return;
            e.preventDefault();
            dropdownEl.classList.add("hidden");
            onSelectUrl(row.dataset.sugUrl, false);
        });
    });

    dropdownEl.querySelectorAll("[data-sug-newtab]").forEach(btn => {
        btn.addEventListener("mousedown", (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdownEl.classList.add("hidden");
            onSelectUrl(btn.dataset.sugNewtab, true);
        });
    });
}

/* ==================== SYSTÈME DE 20 THÈMES & PARAMÈTRES ==================== */

const THEMES = [
    // Classiques
    { id: "dark", label: "Sombre (Défaut)", mode: "dark", bg: "#0f161d", card: "#17212b", chrome: "#0a0e12", accent: "#26b9d1" },
    { id: "light", label: "Clair", mode: "light", bg: "#f1f5f9", card: "#ffffff", chrome: "#e2e8f0", accent: "#0284c7" },
    { id: "full-black", label: "Full Black", mode: "dark", bg: "#000000", card: "#080808", chrome: "#000000", accent: "#26b9d1" },
    { id: "full-white", label: "Full White", mode: "light", bg: "#ffffff", card: "#ffffff", chrome: "#f8fafc", accent: "#0f172a" },

    // Bleu
    { id: "blue-dark", label: "Bleu Sombre", mode: "dark", bg: "#0b132b", card: "#14213d", chrome: "#070b19", accent: "#3b82f6" },
    { id: "blue-light", label: "Bleu Clair", mode: "light", bg: "#eff6ff", card: "#ffffff", chrome: "#dbeafe", accent: "#2563eb" },

    // Cyan
    { id: "cyan-dark", label: "Cyan Sombre", mode: "dark", bg: "#081c24", card: "#0e2a35", chrome: "#051217", accent: "#06b6d4" },
    { id: "cyan-light", label: "Cyan Clair", mode: "light", bg: "#ecfeff", card: "#ffffff", chrome: "#cffafe", accent: "#0891b2" },

    // Vert
    { id: "green-dark", label: "Vert Sombre", mode: "dark", bg: "#091e16", card: "#112d22", chrome: "#05120d", accent: "#10b981" },
    { id: "green-light", label: "Vert Clair", mode: "light", bg: "#ecfdf5", card: "#ffffff", chrome: "#d1fae5", accent: "#059669" },

    // Jaune
    { id: "yellow-dark", label: "Jaune Sombre", mode: "dark", bg: "#1c190a", card: "#292410", chrome: "#121006", accent: "#eab308" },
    { id: "yellow-light", label: "Jaune Clair", mode: "light", bg: "#fefce8", card: "#ffffff", chrome: "#fef08a", accent: "#ca8a04" },

    // Rouge
    { id: "red-dark", label: "Rouge Sombre", mode: "dark", bg: "#1f0b0e", card: "#2e1216", chrome: "#130608", accent: "#ef4444" },
    { id: "red-light", label: "Rouge Clair", mode: "light", bg: "#fef2f2", card: "#ffffff", chrome: "#fee2e2", accent: "#dc2626" },

    // Orange
    { id: "orange-dark", label: "Orange Sombre", mode: "dark", bg: "#1f1209", card: "#2e1c0f", chrome: "#140b05", accent: "#f97316" },
    { id: "orange-light", label: "Orange Clair", mode: "light", bg: "#fff7ed", card: "#ffffff", chrome: "#ffedd5", accent: "#ea580c" },

    // Violet
    { id: "purple-dark", label: "Violet Sombre", mode: "dark", bg: "#160d29", card: "#22153d", chrome: "#0d0719", accent: "#a855f7" },
    { id: "purple-light", label: "Violet Clair", mode: "light", bg: "#faf5ff", card: "#ffffff", chrome: "#f3e8ff", accent: "#9333ea" },

    // Rose
    { id: "pink-dark", label: "Rose Sombre", mode: "dark", bg: "#210b18", card: "#331226", chrome: "#14060e", accent: "#ec4899" },
    { id: "pink-light", label: "Rose Clair", mode: "light", bg: "#fdf2f8", card: "#ffffff", chrome: "#fce7f3", accent: "#db2777" }
];

const PRIMARY_COLOR_PRESETS = [
    { id: "p-dark", label: "Sombre (Défaut)", hex: "#0f161d" },
    { id: "p-black", label: "Full Black", hex: "#000000" },
    { id: "p-blue-dark", label: "Bleu Sombre", hex: "#0b132b" },
    { id: "p-cyan-dark", label: "Cyan Sombre", hex: "#081c24" },
    { id: "p-green-dark", label: "Vert Sombre", hex: "#091e16" },
    { id: "p-yellow-dark", label: "Jaune Sombre", hex: "#1c190a" },
    { id: "p-red-dark", label: "Rouge Sombre", hex: "#1f0b0e" },
    { id: "p-orange-dark", label: "Orange Sombre", hex: "#1f1209" },
    { id: "p-purple-dark", label: "Violet Sombre", hex: "#160d29" },
    { id: "p-pink-dark", label: "Rose Sombre", hex: "#210b18" },
    { id: "p-light", label: "Gris Clair", hex: "#f1f5f9" },
    { id: "p-white", label: "Full White", hex: "#ffffff" }
];

const SECONDARY_COLOR_PRESETS = [
    { id: "s-cyan", label: "Cyan Tenno", hex: "#26b9d1" },
    { id: "s-gold", label: "Or Orokin", hex: "#e6c365" },
    { id: "s-blue", label: "Bleu", hex: "#3b82f6" },
    { id: "s-green", label: "Vert", hex: "#10b981" },
    { id: "s-yellow", label: "Jaune", hex: "#eab308" },
    { id: "s-red", label: "Rouge", hex: "#ef4444" },
    { id: "s-orange", label: "Orange", hex: "#f97316" },
    { id: "s-purple", label: "Violet", hex: "#a855f7" },
    { id: "s-pink", label: "Rose", hex: "#ec4899" },
    { id: "s-teal", label: "Turquoise", hex: "#14b8a6" },
    { id: "s-white", label: "Blanc", hex: "#f8fafc" },
    { id: "s-dark", label: "Ardoise Sombre", hex: "#0f172a" }
];

function parseHexToRgb(hex) {
    const clean = String(hex || "#0f161d").replace("#", "").trim();
    const full = clean.length === 3
        ? clean.split("").map(c => c + c).join("")
        : clean.padEnd(6, "0").slice(0, 6);
    const num = parseInt(full, 16) || 0;
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

function rgbToHex(r, g, b) {
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
    return "#" + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, "0")).join("");
}

function shiftHexBrightness(hex, delta) {
    const { r, g, b } = parseHexToRgb(hex);
    return rgbToHex(r + delta, g + delta, b + delta);
}

function applyCustomDualColors(primaryHex, secondaryHex, matchedThemeId = null) {
    const normPrimary = (primaryHex || "#0f161d").toLowerCase();
    const normSecondary = (secondaryHex || "#26b9d1").toLowerCase();

    State.primaryColor = normPrimary;
    State.secondaryColor = normSecondary;
    localStorage.setItem("wm_primary_color", normPrimary);
    localStorage.setItem("wm_secondary_color", normSecondary);

    // Vérifier si le couple correspond exactement à l'un des 20 thèmes prédéfinis
    const exactPreset = matchedThemeId
        ? THEMES.find(t => t.id === matchedThemeId)
        : THEMES.find(t => t.bg.toLowerCase() === normPrimary && t.accent.toLowerCase() === normSecondary);

    State.theme = exactPreset ? exactPreset.id : "custom";
    localStorage.setItem("wm_theme", State.theme);

    // Chercher si la couleur principale correspond au fond d'un des thèmes connus pour récupérer ses nuances card/chrome
    const bgPreset = THEMES.find(t => t.bg.toLowerCase() === normPrimary);
    const { r, g, b } = parseHexToRgb(normPrimary);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const isLight = bgPreset ? (bgPreset.mode === "light") : (luminance > 0.55);

    const cardColor = bgPreset
        ? bgPreset.card
        : (isLight ? "#ffffff" : shiftHexBrightness(normPrimary, 14));
    const chromeColor = bgPreset
        ? bgPreset.chrome
        : (isLight ? shiftHexBrightness(normPrimary, -14) : shiftHexBrightness(normPrimary, -8));

    const secRgb = parseHexToRgb(normSecondary);
    const root = document.documentElement;

    root.style.setProperty("--bg-chrome", chromeColor);
    root.style.setProperty("--bg-tab-bar", chromeColor);
    root.style.setProperty("--bg-tab-inactive", isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.03)");
    root.style.setProperty("--bg-tab-active", cardColor);
    root.style.setProperty("--bg-nav-bar", cardColor);
    root.style.setProperty("--bg-bookmarks", isLight ? chromeColor : normPrimary);
    root.style.setProperty("--bg-page", normPrimary);
    root.style.setProperty("--bg-card", cardColor);
    root.style.setProperty("--bg-card-hover", isLight ? shiftHexBrightness(normPrimary, 6) : "rgba(255,255,255,0.06)");
    root.style.setProperty("--bg-elevated", isLight ? shiftHexBrightness(normPrimary, -6) : "rgba(255,255,255,0.07)");
    root.style.setProperty("--bg-input", isLight ? "#ffffff" : chromeColor);

    root.style.setProperty("--text-main", isLight ? "#0f172a" : "#e6eef6");
    root.style.setProperty("--text-secondary", isLight ? "#334155" : "#9fb1c3");
    root.style.setProperty("--text-muted", isLight ? "#64748b" : "#66788a");

    // Appliquer la Couleur Secondaire sur tous les accents, boutons, icônes et lueur Glow
    root.style.setProperty("--accent-cyan", normSecondary);
    root.style.setProperty("--accent-cyan-hover", shiftHexBrightness(normSecondary, 18));
    root.style.setProperty("--accent-cyan-dim", `rgba(${secRgb.r}, ${secRgb.g}, ${secRgb.b}, 0.15)`);
    root.style.setProperty("--accent-gold", normSecondary);
    root.style.setProperty("--accent-gold-dim", `rgba(${secRgb.r}, ${secRgb.g}, ${secRgb.b}, 0.16)`);
    root.style.setProperty("--border-subtle", isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.08)");
    root.style.setProperty("--border-medium", `rgba(${secRgb.r}, ${secRgb.g}, ${secRgb.b}, 0.36)`);
    root.style.setProperty("--border-bright", normSecondary);

    renderThemesGrid();
}

function applyTheme(themeId) {
    if (themeId === "custom" && State.primaryColor && State.secondaryColor) {
        applyCustomDualColors(State.primaryColor, State.secondaryColor, null);
        return;
    }
    const t = THEMES.find(x => x.id === themeId) || THEMES[0];
    applyCustomDualColors(t.bg, t.accent, t.id);
}

function renderThemesGrid() {
    const curPrimary = (State.primaryColor || "#0f161d").toLowerCase();
    const curSecondary = (State.secondaryColor || "#26b9d1").toLowerCase();

    // Sync des sélecteurs de couleur libre (<input type="color">)
    const pInput = document.getElementById("input-custom-primary");
    const pLabel = document.getElementById("label-custom-primary");
    if (pInput && document.activeElement !== pInput) pInput.value = curPrimary;
    if (pLabel) pLabel.textContent = curPrimary.toUpperCase();

    const sInput = document.getElementById("input-custom-secondary");
    const sLabel = document.getElementById("label-custom-secondary");
    if (sInput && document.activeElement !== sInput) sInput.value = curSecondary;
    if (sLabel) sLabel.textContent = curSecondary.toUpperCase();

    // 1. Grille Couleur Principale
    const pGrid = document.getElementById("primary-colors-grid");
    if (pGrid) {
        pGrid.innerHTML = PRIMARY_COLOR_PRESETS.map(p => {
            const isAct = p.hex.toLowerCase() === curPrimary;
            return `
                <button class="color-swatch-chip ${isAct ? "active" : ""}" data-primary-hex="${p.hex}" title="${escapeHtml(p.label)} (${p.hex})">
                    <span class="swatch-dot" style="background:${p.hex};"></span>
                    <span>${escapeHtml(p.label)}</span>
                </button>
            `;
        }).join("");

        pGrid.querySelectorAll("[data-primary-hex]").forEach(btn => {
            btn.addEventListener("click", () => {
                applyCustomDualColors(btn.dataset.primaryHex, State.secondaryColor || "#26b9d1");
            });
        });
    }

    // 2. Grille Couleur Secondaire
    const sGrid = document.getElementById("secondary-colors-grid");
    if (sGrid) {
        sGrid.innerHTML = SECONDARY_COLOR_PRESETS.map(s => {
            const isAct = s.hex.toLowerCase() === curSecondary;
            return `
                <button class="color-swatch-chip ${isAct ? "active" : ""}" data-secondary-hex="${s.hex}" title="${escapeHtml(s.label)} (${s.hex})">
                    <span class="swatch-dot" style="background:${s.hex};"></span>
                    <span>${escapeHtml(s.label)}</span>
                </button>
            `;
        }).join("");

        sGrid.querySelectorAll("[data-secondary-hex]").forEach(btn => {
            btn.addEventListener("click", () => {
                applyCustomDualColors(State.primaryColor || "#0f161d", btn.dataset.secondaryHex);
            });
        });
    }

    // 3. Grille des 20 Thèmes Rapides
    const grid = document.getElementById("themes-grid");
    if (!grid) return;
    grid.innerHTML = THEMES.map(t => `
        <button class="theme-card ${State.theme === t.id ? "active" : ""}" data-theme-id="${t.id}">
            <span class="theme-swatch" style="background: linear-gradient(135deg, ${t.bg} 50%, ${t.accent} 50%);"></span>
            <span>${escapeHtml(t.label)}</span>
        </button>
    `).join("");

    grid.querySelectorAll("[data-theme-id]").forEach(btn => {
        btn.addEventListener("click", () => applyTheme(btn.dataset.themeId));
    });
}

/* ==================== INITIALISATION DU NAVIGATEUR ==================== */

function initBrowserEvents() {
    // Onglet permanent inamovible sur le logo WireMarket (#app-brand-tab)
    const brandTab = document.getElementById("app-brand-tab");
    if (brandTab) {
        brandTab.addEventListener("click", () => {
            activateTab("hub");
        });
        brandTab.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                activateTab("hub");
            }
        });
    }

    // Bouton Nouvel Onglet
    document.getElementById("btn-new-tab").addEventListener("click", () => {
        createTab("https://warframe.market/", true);
    });

    // Contrôles Navigation (Précédent, Suivant, Actualiser, Accueil)
    document.getElementById("btn-back").addEventListener("click", () => {
        const tab = getActiveTab();
        if (tab && tab.historyIndex > 0) {
            tab.historyIndex--;
            navigateTab(tab.id, tab.history[tab.historyIndex], { pushHistory: false });
        }
    });

    document.getElementById("btn-forward").addEventListener("click", () => {
        const tab = getActiveTab();
        if (tab && tab.historyIndex < tab.history.length - 1) {
            tab.historyIndex++;
            navigateTab(tab.id, tab.history[tab.historyIndex], { pushHistory: false });
        }
    });

    document.getElementById("btn-reload").addEventListener("click", () => {
        const tab = getActiveTab();
        if (tab) navigateTab(tab.id, tab.url, { pushHistory: false, forceRefresh: true });
    });

    document.getElementById("btn-home").addEventListener("click", () => {
        navigateTab(State.activeTabId, "https://warframe.market/");
    });

    document.getElementById("wfm-brand-home").addEventListener("click", () => {
        navigateTab(State.activeTabId, "https://warframe.market/");
    });

    // Liens de la barre Warframe Market interne
    document.querySelectorAll(".wfm-nav-link:not(.hub-nav-link)").forEach(btn => {
        btn.addEventListener("click", () => {
            navigateTab(State.activeTabId, btn.dataset.nav);
        });
    });

    // Liens de la barre dédiée au Hub WireMarket (Planètes / Warframes & Armes / Marchand Baro)
    document.querySelectorAll("[data-hub-sec]").forEach(btn => {
        btn.addEventListener("click", () => {
            switchHubSection(btn.dataset.hubSec);
        });
    });

    document.getElementById("wm-hub-brand-logo")?.addEventListener("click", () => {
        switchHubSection("planets");
    });

    document.getElementById("btn-hub-header-refresh")?.addEventListener("click", () => {
        loadTabRouteData(State.hubTab, { route: "worldstate", params: new URLSearchParams() }, true);
    });

    // Barre d'adresse (Omnibox)
    const addrInput = document.getElementById("address-input");
    const omniDrop = document.getElementById("omnibox-suggestions");

    addrInput.addEventListener("focus", () => addrInput.select());
    addrInput.addEventListener("input", () => {
        const val = addrInput.value.trim();
        const cleanQuery = val.replace(/^https?:\/\/warframe\.market\/?(items\/)?/i, "");
        renderSearchSuggestions(cleanQuery, omniDrop, (url, inNewTab) => {
            if (inNewTab) createTab(url, true);
            else navigateTab(State.activeTabId, url);
            addrInput.blur();
        });
    });

    addrInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            omniDrop.classList.add("hidden");
            navigateTab(State.activeTabId, addrInput.value);
            addrInput.blur();
        } else if (e.key === "Escape") {
            omniDrop.classList.add("hidden");
            syncBrowserChromeToActiveTab();
            addrInput.blur();
        }
    });

    addrInput.addEventListener("blur", () => {
        setTimeout(() => omniDrop.classList.add("hidden"), 150);
    });

    // Barre de recherche centrale Warframe Market
    const searchInput = document.getElementById("wfm-search-input");
    const searchDrop = document.getElementById("wfm-search-dropdown");

    searchInput.addEventListener("input", () => {
        renderSearchSuggestions(searchInput.value, searchDrop, (url, inNewTab) => {
            searchInput.value = "";
            if (inNewTab) createTab(url, true);
            else navigateTab(State.activeTabId, url);
        });
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            searchDrop.classList.add("hidden");
            if (searchInput.value.trim()) {
                navigateTab(State.activeTabId, searchInput.value.trim());
                searchInput.value = "";
            }
        } else if (e.key === "Escape") {
            searchDrop.classList.add("hidden");
        }
    });

    searchInput.addEventListener("blur", () => {
        setTimeout(() => searchDrop.classList.add("hidden"), 150);
    });

    // Favori étoile
    document.getElementById("btn-bookmark-toggle").addEventListener("click", toggleBookmarkCurrentTab);

    // Sélecteurs Plateforme, Crossplay, Langue
    const platSel = document.getElementById("select-platform");
    platSel.value = State.platform;
    platSel.addEventListener("change", () => {
        State.platform = platSel.value;
        localStorage.setItem("wm_platform", State.platform);
        const tab = getActiveTab();
        if (tab) navigateTab(tab.id, tab.url, { pushHistory: false, forceRefresh: true });
    });

    const crossBtn = document.getElementById("btn-crossplay");
    crossBtn.classList.toggle("active", State.crossplay);
    crossBtn.addEventListener("click", () => {
        State.crossplay = !State.crossplay;
        localStorage.setItem("wm_crossplay", String(State.crossplay));
        crossBtn.classList.toggle("active", State.crossplay);
        const tab = getActiveTab();
        if (tab) navigateTab(tab.id, tab.url, { pushHistory: false, forceRefresh: true });
    });

    const langSel = document.getElementById("select-lang");
    langSel.value = State.lang;
    langSel.addEventListener("change", () => {
        State.lang = langSel.value;
        localStorage.setItem("wm_lang", State.lang);
        const tab = getActiveTab();
        if (tab) navigateTab(tab.id, tab.url, { pushHistory: false, forceRefresh: true });
    });

    // Contrôles de Zoom / Dézoom
    function applyZoom(val) {
        const clamped = Math.min(200, Math.max(50, Math.round(val / 5) * 5));
        State.zoom = clamped;
        localStorage.setItem("wm_zoom", String(clamped));
        const viewport = document.getElementById("browser-viewport");
        if (viewport) {
            viewport.style.zoom = `${clamped}%`;
        }
        const resetBtn = document.getElementById("btn-zoom-reset");
        if (resetBtn) {
            resetBtn.textContent = `${clamped}%`;
        }
        const modalResetBtn = document.getElementById("btn-modal-zoom-reset");
        if (modalResetBtn) {
            modalResetBtn.textContent = `${clamped}%`;
        }
    }

    function applyGlow(enabled) {
        State.glowEnabled = !!enabled;
        localStorage.setItem("wm_glow", String(State.glowEnabled));
        document.body.classList.toggle("glow-enabled", State.glowEnabled);
        const glowBtn = document.getElementById("btn-toggle-glow");
        const glowText = document.getElementById("glow-status-text");
        if (glowBtn) glowBtn.classList.toggle("active", State.glowEnabled);
        if (glowText) glowText.textContent = State.glowEnabled ? "Activé" : "Désactivé";
    }

    function sendNativeWindowCommand(queryStr) {
        fetch(`/__window?${queryStr}`).catch(() => {});
        if (window.location.protocol === "file:") {
            fetch(`http://127.0.0.1:8484/__window?${queryStr}`).catch(() => {});
        }
    }

    function applyAlwaysOnTop(enabled, syncNative = true) {
        State.alwaysOnTop = !!enabled;
        localStorage.setItem("wm_always_on_top", String(State.alwaysOnTop));
        document.getElementById("btn-pin-topmost")?.classList.toggle("active-pin", State.alwaysOnTop);
        const modalBtn = document.getElementById("btn-modal-toggle-topmost");
        const modalTxt = document.getElementById("topmost-status-text");
        if (modalBtn) modalBtn.classList.toggle("active", State.alwaysOnTop);
        if (modalTxt) modalTxt.textContent = State.alwaysOnTop ? "Activé (Épinglé)" : "Désactivé";
        if (syncNative) {
            sendNativeWindowCommand(`topmost=${State.alwaysOnTop ? "true" : "false"}`);
        }
    }

    function applyCompactMode(enabled) {
        State.compactMode = !!enabled;
        document.body.classList.toggle("compact-mode", State.compactMode);
        document.getElementById("btn-compact-mode")?.classList.toggle("active-pin", State.compactMode);
        document.getElementById("btn-exit-compact-top")?.classList.toggle("hidden", !State.compactMode);

        const modalBtn = document.getElementById("btn-modal-toggle-compact");
        const modalTxt = document.getElementById("compact-status-text");
        if (modalBtn) modalBtn.classList.toggle("active", State.compactMode);
        if (modalTxt) modalTxt.textContent = State.compactMode ? "Activé (Mini-fenêtre)" : "Désactivé";

        if (State.compactMode) {
            // En mode compact, activer automatiquement l'épingle au premier plan pour rester visible en jeu
            applyAlwaysOnTop(true, false);
            sendNativeWindowCommand("compact=true&topmost=true");
            try { window.resizeTo(460, 660); } catch (e) {}
        } else {
            sendNativeWindowCommand(`compact=false&topmost=${State.alwaysOnTop ? "true" : "false"}`);
            try { window.resizeTo(1440, 900); } catch (e) {}
        }
    }

    function syncAlertSettingsUI() {
        const soundBtn = document.getElementById("btn-toggle-alert-sound");
        const soundText = document.getElementById("alert-sound-status-text");
        if (soundBtn) soundBtn.classList.toggle("active", State.alertSoundEnabled);
        if (soundText) soundText.textContent = State.alertSoundEnabled ? "Activé" : "Désactivé";

        document.querySelectorAll(".btn-sound-choice").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.soundChoice === (State.alertSoundChoice === "bell" ? "bell" : "default"));
        });

        const volSlider = document.getElementById("slider-alert-volume");
        const volLabel = document.getElementById("alert-volume-label");
        if (volSlider) volSlider.value = String(State.alertVolume);
        if (volLabel) volLabel.textContent = `${State.alertVolume}%`;

        const repBtn = document.getElementById("btn-toggle-alert-repeat");
        const repText = document.getElementById("alert-repeat-status-text");
        if (repBtn) repBtn.classList.toggle("active", State.alertRepeat);
        if (repText) repText.textContent = State.alertRepeat ? "Activé" : "Désactivé";

        const intInput = document.getElementById("input-alert-interval");
        if (intInput && document.activeElement !== intInput) {
            intInput.value = String(State.alertRepeatInterval);
        }
        document.querySelectorAll(".btn-interval-preset").forEach(chip => {
            chip.classList.toggle("active", Number(chip.dataset.intervalSec) === Number(State.alertRepeatInterval));
        });
    }

    applyZoom(State.zoom);
    if (State.primaryColor && State.secondaryColor) {
        applyCustomDualColors(State.primaryColor, State.secondaryColor);
    } else {
        applyTheme(State.theme);
    }
    applyGlow(State.glowEnabled);
    syncAlertSettingsUI();

    document.getElementById("input-custom-primary")?.addEventListener("input", (e) => {
        applyCustomDualColors(e.target.value, State.secondaryColor || "#26b9d1");
    });

    document.getElementById("input-custom-secondary")?.addEventListener("input", (e) => {
        applyCustomDualColors(State.primaryColor || "#0f161d", e.target.value);
    });
    if (State.alwaysOnTop) {
        setTimeout(() => applyAlwaysOnTop(true, true), 400);
    }

    document.getElementById("btn-pin-topmost")?.addEventListener("click", () => {
        applyAlwaysOnTop(!State.alwaysOnTop, true);
    });
    document.getElementById("btn-modal-toggle-topmost")?.addEventListener("click", () => {
        applyAlwaysOnTop(!State.alwaysOnTop, true);
    });

    document.getElementById("btn-compact-mode")?.addEventListener("click", () => {
        applyCompactMode(!State.compactMode);
    });
    document.getElementById("btn-exit-compact-top")?.addEventListener("click", () => {
        applyCompactMode(false);
    });
    document.getElementById("btn-modal-toggle-compact")?.addEventListener("click", () => {
        applyCompactMode(!State.compactMode);
    });

    document.getElementById("btn-toggle-glow")?.addEventListener("click", () => {
        applyGlow(!State.glowEnabled);
    });

    document.getElementById("btn-toggle-alert-sound")?.addEventListener("click", () => {
        State.alertSoundEnabled = !State.alertSoundEnabled;
        localStorage.setItem("wm_alert_sound", String(State.alertSoundEnabled));
        syncAlertSettingsUI();
    });

    document.getElementById("slider-alert-volume")?.addEventListener("input", (e) => {
        State.alertVolume = Math.max(0, Math.min(100, Number(e.target.value) || 0));
        localStorage.setItem("wm_alert_volume", String(State.alertVolume));
        if (alertAudioInstance) {
            alertAudioInstance.volume = State.alertVolume / 100;
        }
        syncAlertSettingsUI();
        const tab = getActiveTab();
        if (tab && parseWfmUrl(tab.url).route === "alerts") {
            const testBtn = document.getElementById("btn-alerts-test-sound");
            if (testBtn) testBtn.innerHTML = `${wfIcon("sound", "wf-icon-sm wf-icon-cyan")} Tester le son (${State.alertVolume}%)`;
        }
    });

    document.getElementById("btn-test-alert-sound")?.addEventListener("click", () => {
        playAlertNotificationSound(true);
    });

    document.querySelectorAll(".btn-sound-choice").forEach(btn => {
        btn.addEventListener("click", () => {
            setAlertSoundChoice(btn.dataset.soundChoice, true);
        });
    });

    document.getElementById("btn-toggle-alert-repeat")?.addEventListener("click", () => {
        State.alertRepeat = !State.alertRepeat;
        localStorage.setItem("wm_alert_repeat", String(State.alertRepeat));
        syncAlertSettingsUI();
    });

    function setAlertIntervalSeconds(sec) {
        const clamped = Math.max(5, Math.min(3600, Math.round(Number(sec) || 30)));
        State.alertRepeatInterval = clamped;
        localStorage.setItem("wm_alert_interval", String(clamped));
        syncAlertSettingsUI();
        const tab = getActiveTab();
        if (tab && parseWfmUrl(tab.url).route === "alerts") {
            renderActiveTabPage();
        }
    }

    document.getElementById("input-alert-interval")?.addEventListener("change", (e) => {
        setAlertIntervalSeconds(e.target.value);
    });

    document.querySelectorAll(".btn-interval-preset").forEach(btn => {
        btn.addEventListener("click", () => {
            setAlertIntervalSeconds(btn.dataset.intervalSec);
        });
    });

    document.getElementById("btn-zoom-in")?.addEventListener("click", () => applyZoom(State.zoom + 10));
    document.getElementById("btn-zoom-out")?.addEventListener("click", () => applyZoom(State.zoom - 10));
    document.getElementById("btn-zoom-reset")?.addEventListener("click", () => applyZoom(100));

    document.getElementById("btn-modal-zoom-in")?.addEventListener("click", () => applyZoom(State.zoom + 10));
    document.getElementById("btn-modal-zoom-out")?.addEventListener("click", () => applyZoom(State.zoom - 10));
    document.getElementById("btn-modal-zoom-reset")?.addEventListener("click", () => applyZoom(100));

    // Modale des Paramètres (Engrenage)
    const settingsModal = document.getElementById("settings-modal");
    document.getElementById("btn-settings")?.addEventListener("click", () => {
        renderThemesGrid();
        settingsModal.classList.remove("hidden");
    });
    document.getElementById("btn-close-settings")?.addEventListener("click", () => {
        settingsModal.classList.add("hidden");
    });
    settingsModal?.addEventListener("click", (e) => {
        if (e.target === settingsModal) settingsModal.classList.add("hidden");
    });

    document.getElementById("btn-clear-history")?.addEventListener("click", () => {
        State.history = [];
        localStorage.setItem("wm_history", "[]");
        renderDrawer();
        const btn = document.getElementById("btn-clear-history");
        if (btn) {
            btn.innerHTML = `${wfIcon("target", "wf-icon-sm wf-icon-cyan")} <span>Historique effacé !</span>`;
            setTimeout(() => { btn.innerHTML = `${wfIcon("trash", "wf-icon-sm")} <span>Effacer l'historique</span>`; }, 1500);
        }
    });

    // Zoom avec Ctrl + Molette de la souris
    window.addEventListener("wheel", (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.deltaY < 0) applyZoom(State.zoom + 10);
            else if (e.deltaY > 0) applyZoom(State.zoom - 10);
        }
    }, { passive: false });

    // Tiroir Historique & Favoris
    const drawer = document.getElementById("side-drawer");
    document.getElementById("btn-history-drawer").addEventListener("click", () => {
        drawer.classList.toggle("hidden");
        if (!drawer.classList.contains("hidden")) renderDrawer();
    });
    document.getElementById("btn-close-drawer").addEventListener("click", () => {
        drawer.classList.add("hidden");
    });
    document.querySelectorAll(".drawer-tab").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".drawer-tab").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            State.activeDrawerTab = btn.dataset.drawer;
            renderDrawer();
        });
    });

    // Barre Whisper (/w)
    document.getElementById("btn-copy-whisper").addEventListener("click", () => {
        const input = document.getElementById("whisper-input");
        navigator.clipboard?.writeText(input.value);
        const badge = document.querySelector(".whisper-badge");
        badge.textContent = "RECOPIÉ !";
        setTimeout(() => { badge.textContent = "COPIÉ !"; }, 1200);
    });

    const whisperLangBtn = document.getElementById("btn-whisper-lang");
    whisperLangBtn.textContent = `MSG: ${State.whisperLang.toUpperCase()}`;
    whisperLangBtn.addEventListener("click", () => {
        State.whisperLang = State.whisperLang === "en" ? "fr" : "en";
        localStorage.setItem("wm_whisper_lang", State.whisperLang);
        whisperLangBtn.textContent = `MSG: ${State.whisperLang.toUpperCase()}`;
        if (State.lastWhisperData) {
            triggerWhisper(State.lastWhisperData);
        }
    });

    document.getElementById("btn-close-whisper").addEventListener("click", () => {
        document.getElementById("whisper-bar").classList.add("hidden");
    });

    // Raccourcis clavier de navigateur
    window.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "t") {
            e.preventDefault();
            createTab("https://warframe.market/", true);
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "w") {
            e.preventDefault();
            closeTab(State.activeTabId);
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
            e.preventDefault();
            addrInput.focus();
            addrInput.select();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
            e.preventDefault();
            const tab = getActiveTab();
            if (tab) navigateTab(tab.id, tab.url, { pushHistory: false, forceRefresh: true });
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
            e.preventDefault();
            toggleBookmarkCurrentTab();
        } else if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
            e.preventDefault();
            applyZoom(State.zoom + 10);
        } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
            e.preventDefault();
            applyZoom(State.zoom - 10);
        } else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
            e.preventDefault();
            applyZoom(100);
        } else if (e.altKey && e.key.toLowerCase() === "p") {
            e.preventDefault();
            applyAlwaysOnTop(!State.alwaysOnTop, true);
        } else if (e.altKey && e.key.toLowerCase() === "m") {
            e.preventDefault();
            applyCompactMode(!State.compactMode);
        }
    });
}

/* ==================== SYSTÈME DE MISE À JOUR (.ZIP GITHUB) & NOTES DE PATCH (CHANGELOG) ==================== */

const DEFAULT_VERSION_MANIFEST = {
    version: "1.6.1",
    date: "2026-11-08",
    title: "Hub Complet (Fissures, Invasions, Route de l'Acier, Nightwave), Panier Multi-Achats & Auto-Updater",
    repo: "Nyxo-17/wiremarket_v1",
    zipUrl: "https://raw.githubusercontent.com/Nyxo-17/wiremarket_v1/main/WireMarket.zip",
    changelog: [
        {
            version: "1.6.1",
            date: "08/11/2026",
            title: "Invasions, Route de l'Acier (Teshin), Arbitrage, Nightwave & Système de Mise à Jour",
            badge: "NOUVEAU",
            changes: [
                "Nouvelle tab Hub « Invasions, Acier & Nightwave » : suivi en direct des Invasions (Catalyseurs, Formas, pièces Wraith/Vandal avec lien Platinum), Alertes du Lotus, Événements et Défis des Ondes Nocturnes.",
                "Rotation Hebdomadaire de Teshin (Honneurs de la Route de l'Acier) avec calendrier des 8 semaines + Boutique Permanente (Evergreens).",
                "Arbitrage en Direct & Catalogue Essence Vitus : accès rapide à tous les Mods Galvanisés et Mods d'Arbitrage pour vérifier leur rentabilité en Platinum.",
                "Système de Mise à Jour .zip via GitHub (Releases + branche main) avec protection anti-blocage antivirus (Rollback automatique) et fenêtre « Quoi de neuf ? (Patch Notes) ».",
                "4 nouvelles alertes sonores : Invasion Rare (Catalyseur/Forma), Invasion Arme Wraith/Vandal, Forma Umbra chez Teshin, et Arbitrage S-Tier."
            ]
        },
        {
            version: "1.5.0",
            date: "08/11/2026",
            title: "Fissures du Néant, Chasse à l'Archonte, Sortie, Panier Multi-Achats & Thème Bicolore",
            badge: "MAJEUR",
            changes: [
                "Nouvelle tab Hub « Fissures & Missions » : Fissures du Néant en direct avec filtre ⚡ Missions Rapides uniquement.",
                "Suivi en direct de la Chasse à l'Archonte hebdomadaire et de la Sortie quotidienne avec images 3D des planètes.",
                "Panier Multi-Achats & Liste de Courses avec Détecteur de Groupage d'Échanges (vendeurs possédant plusieurs items de votre panier).",
                "Personnalisation de Thème Bicolore : Couleur Principale + Couleur Secondaire indépendantes.",
                "Alertes sonores automatiques de Cycles Planétaires & Fissures."
            ]
        }
    ]
};

const UpdaterState = {
    localManifest: DEFAULT_VERSION_MANIFEST,
    remoteManifest: null,
    githubRelease: null,
    updateAvailable: false,
    remoteVersion: "1.6.1",
    downloadZipUrl: "https://raw.githubusercontent.com/Nyxo-17/wiremarket_v1/main/WireMarket.zip"
};

function compareSemver(vA, vB) {
    const clean = (v) => String(v || "0.0.0").replace(/^v/i, "").trim().split(".").map(n => parseInt(n, 10) || 0);
    const a = clean(vA);
    const b = clean(vB);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const x = a[i] || 0;
        const y = b[i] || 0;
        if (x > y) return 1;
        if (x < y) return -1;
    }
    return 0;
}

function renderChangelogModalContent() {
    const localVer = UpdaterState.localManifest?.version || "1.6.0";
    const remoteVer = UpdaterState.remoteVersion || localVer;
    const hasUpdate = UpdaterState.updateAvailable;

    const settingsLocalVerEl = document.getElementById("settings-local-version");
    if (settingsLocalVerEl) settingsLocalVerEl.textContent = `v${localVer}`;

    const settingsStatusEl = document.getElementById("settings-update-status-text");
    if (settingsStatusEl) {
        if (hasUpdate) {
            settingsStatusEl.innerHTML = `<strong style="color:var(--sell-color);">⬆ Nouvelle version v${escapeHtml(remoteVer)} disponible sur GitHub !</strong>`;
        } else {
            settingsStatusEl.textContent = `Votre application est à jour (v${localVer})`;
        }
    }

    const navUpdateBtn = document.getElementById("btn-update-available");
    const navUpdateLabel = document.getElementById("update-nav-version-label");
    if (navUpdateBtn) {
        navUpdateBtn.classList.toggle("hidden", !hasUpdate);
    }
    if (navUpdateLabel) {
        navUpdateLabel.textContent = `v${remoteVer}`;
    }

    const curVerPill = document.getElementById("changelog-current-ver-pill");
    if (curVerPill) {
        curVerPill.textContent = hasUpdate
            ? `MISE À JOUR DISPONIBLE : v${localVer} → v${remoteVer}`
            : `VERSION INSTALLÉE : v${localVer}`;
        curVerPill.classList.toggle("has-update", hasUpdate);
    }

    const bannerStatus = document.getElementById("changelog-banner-status");
    if (bannerStatus) {
        bannerStatus.innerHTML = hasUpdate
            ? `<span style="color:var(--sell-color);font-weight:700;">Une nouvelle version (v${escapeHtml(remoteVer)}) est prête sur GitHub !</span> Cliquez sur « Installer la dernière version (.zip) » pour mettre à jour WireMarket.`
            : `Connecté au dépôt GitHub <strong>Nyxo-17/wiremarket_v1</strong> — Protection Rollback Antivirus active.`;
    }

    const entriesContainer = document.getElementById("changelog-entries-container");
    if (!entriesContainer) return;

    // Fusionner les notes de patch distantes (si plus récentes) avec les notes locales
    const entries = [];
    const seenVersions = new Set();

    if (UpdaterState.githubRelease && UpdaterState.githubRelease.tag_name) {
        const relVer = String(UpdaterState.githubRelease.tag_name).replace(/^v/i, "");
        if (!seenVersions.has(relVer)) {
            seenVersions.add(relVer);
            const rawBody = String(UpdaterState.githubRelease.body || "").split(/\r?\n/).map(l => l.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);
            entries.push({
                version: relVer,
                date: UpdaterState.githubRelease.published_at ? new Date(UpdaterState.githubRelease.published_at).toLocaleDateString("fr-FR") : "GitHub Release",
                title: UpdaterState.githubRelease.name || `Release GitHub v${relVer}`,
                badge: "GITHUB RELEASE",
                changes: rawBody.length > 0 ? rawBody : ["Archive WireMarket.zip disponible dans la Release GitHub."]
            });
        }
    }

    for (const src of [UpdaterState.remoteManifest, UpdaterState.localManifest, DEFAULT_VERSION_MANIFEST]) {
        if (src && Array.isArray(src.changelog)) {
            for (const item of src.changelog) {
                if (item && item.version && !seenVersions.has(item.version)) {
                    seenVersions.add(item.version);
                    entries.push(item);
                }
            }
        }
    }

    entriesContainer.innerHTML = entries.map((entry, idx) => {
        const isCurrent = entry.version === localVer;
        return `
            <div class="changelog-card ${idx === 0 ? "latest-release" : ""}">
                <div class="changelog-card-header">
                    <div class="changelog-card-title-group">
                        <span class="changelog-version-tag">v${escapeHtml(entry.version)}</span>
                        ${entry.badge ? `<span class="changelog-type-badge">${escapeHtml(entry.badge)}</span>` : ""}
                        ${isCurrent ? `<span class="rot-current-pill">INSTALLÉE</span>` : ""}
                        <h3 class="changelog-card-title">${escapeHtml(entry.title || "")}</h3>
                    </div>
                    <span class="changelog-card-date">${escapeHtml(entry.date || "")}</span>
                </div>
                <ul class="changelog-bullet-list">
                    ${(entry.changes || []).map(line => `
                        <li>${escapeHtml(line)}</li>
                    `).join("")}
                </ul>
            </div>
        `;
    }).join("");
}

function openChangelogModal() {
    renderChangelogModalContent();
    document.getElementById("changelog-modal")?.classList.remove("hidden");
    const curVer = UpdaterState.localManifest?.version || "1.6.0";
    localStorage.setItem("wm_last_seen_version", curVer);
}

async function checkForGitHubUpdates(showFeedback = false) {
    const checkBtns = [
        document.getElementById("btn-settings-check-update"),
        document.getElementById("btn-modal-check-update")
    ].filter(Boolean);

    if (showFeedback) {
        checkBtns.forEach(b => {
            b.disabled = true;
            b.textContent = "⏳ Vérification GitHub...";
        });
    }

    try {
        // 1. Charger version.json local
        try {
            const localRes = await fetch(`version.json?t=${Date.now()}`);
            if (localRes.ok) {
                const localData = await localRes.json();
                if (localData && localData.version) {
                    UpdaterState.localManifest = localData;
                }
            }
        } catch (e) {}

        // 2. Interroger le serveur local /__update/check (ou GitHub directement en fallback)
        let remoteManifest = null;
        let githubRelease = null;

        try {
            const srvRes = await fetch(`/__update/check?t=${Date.now()}`);
            if (srvRes.ok) {
                const srvData = await srvRes.json();
                if (srvData.local && srvData.local.version) UpdaterState.localManifest = srvData.local;
                if (srvData.remote && srvData.remote.version) remoteManifest = srvData.remote;
                if (srvData.githubRelease && srvData.githubRelease.tag_name) githubRelease = srvData.githubRelease;
            }
        } catch (e) {}

        if (!remoteManifest) {
            try {
                const directRes = await fetch(`https://raw.githubusercontent.com/Nyxo-17/wiremarket_v1/main/version.json?t=${Date.now()}`);
                if (directRes.ok) remoteManifest = await directRes.json();
            } catch (e) {}
        }

        if (!githubRelease) {
            try {
                const relRes = await fetch("https://api.github.com/repos/Nyxo-17/wiremarket_v1/releases/latest");
                if (relRes.ok) {
                    const relData = await relRes.json();
                    if (relData && relData.tag_name) githubRelease = relData;
                }
            } catch (e) {}
        }

        UpdaterState.remoteManifest = remoteManifest;
        UpdaterState.githubRelease = githubRelease;

        const localVer = UpdaterState.localManifest?.version || "1.6.0";
        let bestRemoteVer = localVer;
        let bestZipUrl = UpdaterState.localManifest?.zipUrl || "https://raw.githubusercontent.com/Nyxo-17/wiremarket_v1/main/WireMarket.zip";

        if (remoteManifest && remoteManifest.version) {
            if (compareSemver(remoteManifest.version, bestRemoteVer) >= 0) {
                bestRemoteVer = remoteManifest.version;
                if (remoteManifest.zipUrl) bestZipUrl = remoteManifest.zipUrl;
            }
        }

        if (githubRelease && githubRelease.tag_name) {
            const relVer = String(githubRelease.tag_name).replace(/^v/i, "");
            if (compareSemver(relVer, bestRemoteVer) > 0) {
                bestRemoteVer = relVer;
            }
            if (Array.isArray(githubRelease.assets)) {
                const zipAsset = githubRelease.assets.find(a => String(a.name || "").toLowerCase().endsWith(".zip"));
                if (zipAsset && zipAsset.browser_download_url) {
                    bestZipUrl = zipAsset.browser_download_url;
                }
            }
        }

        UpdaterState.remoteVersion = bestRemoteVer;
        UpdaterState.downloadZipUrl = bestZipUrl;
        UpdaterState.updateAvailable = compareSemver(bestRemoteVer, localVer) > 0;

        renderChangelogModalContent();

        if (showFeedback) {
            checkBtns.forEach(b => {
                b.disabled = false;
                b.textContent = UpdaterState.updateAvailable
                    ? `⬆ v${bestRemoteVer} disponible !`
                    : "✓ Aucune MAJ (À jour)";
                setTimeout(() => {
                    b.textContent = b.id === "btn-modal-check-update" ? "↻ Vérifier GitHub" : "↻ Vérifier les mises à jour";
                }, 2500);
            });
        }
    } catch (err) {
        if (showFeedback) {
            checkBtns.forEach(b => {
                b.disabled = false;
                b.textContent = "↻ Vérifier GitHub";
            });
        }
    }
}

async function applyGitHubZipUpdate() {
    const installBtns = [
        document.getElementById("btn-settings-apply-update"),
        document.getElementById("btn-modal-install-update")
    ].filter(Boolean);

    const progBox = document.getElementById("changelog-progress-box");
    const progLabel = document.getElementById("changelog-progress-label");
    const progBar = document.getElementById("changelog-progress-bar");

    // Ouvrir la modale de suivi si elle n'est pas déjà ouverte
    document.getElementById("changelog-modal")?.classList.remove("hidden");
    if (progBox) progBox.classList.remove("hidden");
    if (progLabel) progLabel.textContent = "Téléchargement de WireMarket.zip depuis GitHub et vérification anti-blocage...";
    if (progBar) progBar.style.width = "45%";

    installBtns.forEach(b => {
        b.disabled = true;
        b.textContent = "⏳ Installation en cours...";
    });

    try {
        const zipParam = encodeURIComponent(UpdaterState.downloadZipUrl || "https://raw.githubusercontent.com/Nyxo-17/wiremarket_v1/main/WireMarket.zip");
        const res = await fetch(`/__update/apply?zipUrl=${zipParam}`);
        const data = await res.json();

        if (!res.ok || data.status !== "ok") {
            throw new Error(data.message || "Échec de la mise à jour.");
        }

        if (progBar) progBar.style.width = "100%";
        const rollbackNote = data.exeStatus === "antivirus_protected_rollback"
            ? " (Protection Antivirus : interface mise à jour à 100%, exécutable conservé en sécurité)"
            : "";

        if (progLabel) {
            progLabel.innerHTML = `<span style="color:var(--sell-color);font-weight:800;">✓ Mise à jour installée avec succès${escapeHtml(rollbackNote)} ! Rechargement dans 2 secondes...</span>`;
        }

        setTimeout(() => {
            window.location.reload();
        }, 1800);
    } catch (err) {
        if (progBar) progBar.style.width = "100%";
        if (progLabel) {
            progLabel.innerHTML = `<span style="color:#ff7675;font-weight:700;">⚠ ${escapeHtml(err.message || "Impossible de télécharger WireMarket.zip depuis GitHub.")}</span>`;
        }
        installBtns.forEach(b => {
            b.disabled = false;
            b.textContent = "⬇ Télécharger & Installer (.zip)";
        });
    }
}

async function initUpdaterAndChangelog() {
    const changelogModal = document.getElementById("changelog-modal");

    document.getElementById("btn-close-changelog")?.addEventListener("click", () => {
        changelogModal?.classList.add("hidden");
    });
    changelogModal?.addEventListener("click", (e) => {
        if (e.target === changelogModal) changelogModal.classList.add("hidden");
    });

    document.getElementById("btn-settings-open-changelog")?.addEventListener("click", () => {
        openChangelogModal();
    });
    document.getElementById("btn-update-available")?.addEventListener("click", () => {
        openChangelogModal();
    });

    document.getElementById("btn-settings-check-update")?.addEventListener("click", () => {
        checkForGitHubUpdates(true);
    });
    document.getElementById("btn-modal-check-update")?.addEventListener("click", () => {
        checkForGitHubUpdates(true);
    });

    document.getElementById("btn-settings-apply-update")?.addEventListener("click", () => {
        applyGitHubZipUpdate();
    });
    document.getElementById("btn-modal-install-update")?.addEventListener("click", () => {
        applyGitHubZipUpdate();
    });

    await checkForGitHubUpdates(false);

    // Option 4 : Afficher automatiquement la fenêtre « Quoi de neuf ? (Patch Notes) » une seule fois après chaque nouvelle version
    const currentVer = UpdaterState.localManifest?.version || "1.6.0";
    const lastSeenVer = localStorage.getItem("wm_last_seen_version");
    if (lastSeenVer !== currentVer) {
        localStorage.setItem("wm_last_seen_version", currentVer);
        setTimeout(() => {
            openChangelogModal();
        }, 650);
    }

    // Vérifier silencieusement toutes les 30 minutes si une nouvelle version a été publiée sur GitHub
    setInterval(() => {
        checkForGitHubUpdates(false);
    }, 30 * 60 * 1000);
}

// Démarrage de l'application WireMarket
document.addEventListener("DOMContentLoaded", async () => {
    updateFavCountBadge();
    updateCartCountBadge();
    updateAlertCountBadge();
    renderBookmarksBar();
    initBrowserEvents();
    startPriceSniperScheduler();
    setInterval(updateLiveWorldstateTimers, 1000);
    createTab("https://warframe.market/", true);
    initUpdaterAndChangelog();
    // Précharger les rotations Warframe & Baro Ki'Teer en arrière-plan pour un affichage instantané au clic sur WireMarket
    fetchWorldstateData(false).then(ws => {
        State.hubTab.cachedData.worldstate = ws;
    }).catch(() => {});
});

