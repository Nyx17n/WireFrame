/**
 * WireMarket — Navigateur dédié Warframe Market
 * Connecté en direct à l'API officielle https://api.warframe.market via le proxy local
 */

const DEFAULT_FAVICON = "logo.png";

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
    lastWhisperData: null,

    // Catalogue complet Warframe Market
    itemsList: [],
    itemsById: new Map(),
    itemsBySlug: new Map(),
    catalogReady: false,

    // Onglets du navigateur
    tabs: [],
    activeTabId: null,
    nextTabId: 1,

    // Favoris & Historique
    bookmarks: JSON.parse(localStorage.getItem("wm_bookmarks") || "null") || [
        { title: "Accueil Marché", url: "https://warframe.market/", icon: DEFAULT_FAVICON },
        { title: "Catalogue Complet", url: "https://warframe.market/items", icon: DEFAULT_FAVICON },
        { title: "Ordres Récents", url: "https://warframe.market/recent", icon: DEFAULT_FAVICON },
        { title: "Ducanator (Ducats)", url: "https://warframe.market/tools/ducats", icon: DEFAULT_FAVICON },
        { title: "Wisp Prime Set", url: "https://warframe.market/items/wisp_prime_set", icon: DEFAULT_FAVICON },
        { title: "Nikana Prime Set", url: "https://warframe.market/items/nikana_prime_set", icon: DEFAULT_FAVICON },
        { title: "Arcane Énergétique", url: "https://warframe.market/items/arcane_energize", icon: DEFAULT_FAVICON }
    ],
    history: JSON.parse(localStorage.getItem("wm_history") || "[]"),
    activeDrawerTab: "history"
};

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
    const res = await fetch(path, { headers });
    if (!res.ok) {
        throw new Error(`Erreur API (${res.status}) sur ${path}`);
    }
    return await res.json();
}

function assetUrl(relPath) {
    if (!relPath) return DEFAULT_FAVICON;
    if (relPath.startsWith("http") || relPath.startsWith("data:")) return relPath;
    const clean = relPath.replace(/^\/+/, "");
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
    if (State.tabs.length <= 1) {
        // Si c'est le dernier onglet, retour à l'accueil
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
        syncBrowserChromeToActiveTab();
        renderActiveTabPage();
    }
    renderTabsBar();
}

function activateTab(id) {
    const tab = State.tabs.find(t => t.id === id);
    if (!tab) return;
    State.activeTabId = id;
    renderTabsBar();
    syncBrowserChromeToActiveTab();
    renderActiveTabPage();
}

function getActiveTab() {
    return State.tabs.find(t => t.id === State.activeTabId) || State.tabs[0];
}

function renderTabsBar() {
    const container = document.getElementById("tabs-container");
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
    document.querySelectorAll(".wfm-nav-link").forEach(btn => {
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
    if (pathname === "/tools/ducats" || pathname === "/ducats") {
        return { route: "ducats", params };
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
    const tab = State.tabs.find(t => t.id === tabId);
    if (!tab) return;

    const url = normalizeInputToUrl(rawUrl);
    tab.url = url;

    if (options.pushHistory) {
        tab.history = tab.history.slice(0, tab.historyIndex + 1);
        if (tab.history[tab.history.length - 1] !== url) {
            tab.history.push(url);
            tab.historyIndex = tab.history.length - 1;
        }
    }

    const parsed = parseWfmUrl(url);
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

        if (parsed.route === "home" || parsed.route === "recent") {
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
        } else if (parsed.route === "ducats") {
            tab.title = "Ducanator (Ducats / Platinum) - Warframe Market";
            tab.icon = DEFAULT_FAVICON;
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

    if (tab.loading && !tab.cachedData.item && !tab.cachedData.recentOrders && parseWfmUrl(tab.url).route !== "catalog") {
        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner-lg"></div>
                <div>Chargement de <strong>${escapeHtml(tab.url)}</strong> depuis warframe.market...</div>
            </div>
        `;
        return;
    }

    const parsed = parseWfmUrl(tab.url);
    if (parsed.route === "home") {
        renderHomePage(container, tab);
    } else if (parsed.route === "recent") {
        renderRecentOrdersPage(container, tab);
    } else if (parsed.route === "catalog") {
        renderCatalogPage(container, tab);
    } else if (parsed.route === "ducats") {
        renderDucanatorPage(container, tab);
    } else if (parsed.route === "item") {
        renderItemPage(container, tab, parsed.slug);
    } else if (parsed.route === "profile") {
        renderProfilePage(container, tab);
    }
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
                    <button class="tag-chip" data-quick-cat="prime_set">✨ Sets Prime</button>
                    <button class="tag-chip" data-quick-cat="warframe">🛡️ Warframes</button>
                    <button class="tag-chip" data-quick-cat="weapon">⚔️ Armes</button>
                    <button class="tag-chip" data-quick-cat="mod">💠 Mods</button>
                    <button class="tag-chip" data-quick-cat="arcane_enhancement">🔮 Arcanes</button>
                    <button class="tag-chip" data-quick-cat="relic">🏺 Reliques</button>
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
    return `
        <div class="item-card" data-open-url="${escapeHtml(url)}">
            <img class="item-card-img" src="${escapeHtml(getItemThumb(item))}" alt="${escapeHtml(name)}" loading="lazy" onerror="this.src='${DEFAULT_FAVICON}'"/>
            <div class="item-card-body">
                <div class="item-card-title">${escapeHtml(name)}</div>
                <div class="item-card-sub">${escapeHtml(State.lang === "fr" && enName !== name ? enName : tags)}</div>
            </div>
            <button class="item-card-newtab" data-newtab-url="${escapeHtml(url)}" title="Ouvrir dans un nouvel onglet">↗</button>
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
                                        <span class="trader-rep" title="Réputation">☺ ${user.reputation ?? 0}</span>
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

    container.innerHTML = `
        <div class="item-page-header">
            <div class="item-header-top">
                <img class="item-hero-thumb" src="${escapeHtml(getItemIcon(item))}" alt="${escapeHtml(name)}" onerror="this.src='${DEFAULT_FAVICON}'"/>
                <div class="item-header-info">
                    <div class="item-title-row">
                        <h1>${escapeHtml(name)}</h1>
                        ${enName !== name ? `<span class="item-en-subtitle">(${escapeHtml(enName)})</span>` : ""}
                    </div>

                    <div class="item-meta-badges">
                        <span class="meta-pill">Prix Vente Min : <strong style="color:var(--sell-color)">${lowestSell} Plat</strong></span>
                        <span class="meta-pill">Offre Achat Max : <strong style="color:var(--buy-color)">${highestBuy} Plat</strong></span>
                        ${item.ducats ? `<span class="meta-pill ducats">🪙 Ducats : <strong>${item.ducats}</strong></span>` : ""}
                        ${item.reqMasteryRank !== undefined ? `<span class="meta-pill">🏆 Palier Maîtrise : <strong>${item.reqMasteryRank}</strong></span>` : ""}
                        ${item.tradingTax ? `<span class="meta-pill tax">💳 Taxe d'échange : <strong>${item.tradingTax.toLocaleString("fr-FR")} Crédits</strong></span>` : ""}
                        ${hasRank ? `<span class="meta-pill">🔼 Rang Max : <strong>${item.maxRank}</strong></span>` : ""}
                        <a class="meta-pill" href="${escapeHtml(wikiLink)}" target="_blank" rel="noopener" style="color:var(--accent-cyan);text-decoration:none;">📖 Wiki Officiel ↗</a>
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
            ` : ""}
        </div>

        <!-- Barre Sous-onglets (Ordres / Statistiques) & Filtres -->
        <div class="item-subtabs-bar">
            <div class="subtabs-left">
                <button class="subtab-btn ${vs.subtab === "orders" ? "active" : ""}" data-subtab="orders">
                    Ordres en direct (${filteredOrders.length})
                </button>
                <button class="subtab-btn ${vs.subtab === "statistics" ? "active" : ""}" data-subtab="statistics">
                    📈 Statistiques de prix (48h / 90j)
                </button>
            </div>

            ${vs.subtab === "orders" ? `
                <div class="orders-filters">
                    <div class="filter-group">
                        <label>Statut vendeur :</label>
                        <select id="filter-status">
                            <option value="ingame" ${vs.statusFilter === "ingame" ? "selected" : ""}>🟣 En jeu (In Game)</option>
                            <option value="online" ${vs.statusFilter === "online" ? "selected" : ""}>🟢 En jeu + En ligne</option>
                            <option value="all" ${vs.statusFilter === "all" ? "selected" : ""}>⚫ Tous (incl. Hors ligne)</option>
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

    container.querySelectorAll("[data-stats-range]").forEach(btn => {
        btn.addEventListener("click", () => {
            tab.viewState.statsRange = btn.dataset.statsRange;
            renderActiveTabPage();
        });
    });

    if (vs.subtab === "statistics") {
        drawStatsCanvas(tab);
    }
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
                                        <div class="trader-rep">☺ ${user.reputation ?? 0}</div>
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
        return `<span class="status-badge ingame">● En jeu</span>`;
    }
    if (status === "online") {
        return `<span class="status-badge online">● En ligne</span>`;
    }
    return `<span class="status-badge offline">● Hors ligne</span>`;
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
            <button class="tag-chip" data-cat="prime_set">✨ Sets Prime</button>
            <button class="tag-chip" data-cat="warframe">🛡️ Warframes</button>
            <button class="tag-chip" data-cat="weapon">⚔️ Armes</button>
            <button class="tag-chip" data-cat="mod">💠 Mods</button>
            <button class="tag-chip" data-cat="arcane_enhancement">🔮 Arcanes</button>
            <button class="tag-chip" data-cat="relic">🏺 Reliques</button>
            <button class="tag-chip" data-cat="syndicate">🎖️ Syndicats</button>
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
    const primeParts = State.itemsList.filter(i => {
        const tags = i.tags || [];
        return tags.includes("prime") && !tags.includes("set");
    }).slice(0, 80);

    container.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">🪙 Ducanator — Parties Prime pour Baro Ki'Teer</h2>
            <span style="color:var(--text-secondary);font-size:13px;">Cliquez sur n'importe quel composant Prime pour consulter ses vendeurs en Platinum et sa valeur en Ducats.</span>
        </div>
        <div class="featured-grid">
            ${primeParts.map(item => renderItemCardHtml(item)).join("")}
        </div>
    `;
    bindCommonPageEvents(container, tab);
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
                        <span class="meta-pill">☺ Réputation : <strong>${user.reputation ?? 0}</strong></span>
                        <span class="meta-pill">🖥️ Plateforme : <strong>${(user.platform || "PC").toUpperCase()}</strong></span>
                        <span class="meta-pill">📦 Ordres de vente : <strong style="color:var(--sell-color)">${sellOrders.length}</strong></span>
                        <span class="meta-pill">🛒 Ordres d'achat : <strong style="color:var(--buy-color)">${buyOrders.length}</strong></span>
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
            if (e.target.closest("[data-newtab-url]")) return;
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

/* ==================== INITIALISATION DU NAVIGATEUR ==================== */

function initBrowserEvents() {
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
    document.querySelectorAll(".wfm-nav-link").forEach(btn => {
        btn.addEventListener("click", () => {
            navigateTab(State.activeTabId, btn.dataset.nav);
        });
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
        }
    });
}

// Démarrage de l'application WireMarket
document.addEventListener("DOMContentLoaded", async () => {
    renderBookmarksBar();
    initBrowserEvents();
    createTab("https://warframe.market/", true);
});

