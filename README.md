# WireFrame v2.3.0 — Warframe Companion, Trading Browser & Codex

> Conçu par **Maxime (`Nyxo_17`)** — Architecture **Electron · Node.js · React 19 · `shadcn/ui` · TypeScript strict (`strict: true`) · Validation `zod`**.

**WireFrame v2** est un compagnon bureau tout-en-un pour **Warframe** combinant un navigateur de trading multi-onglets connecté à **Warframe Market**, un **Hub Worldstate temps réel** et une **Encyclopédie de Farm & Helminth** hors-ligne complète en FR/EN, utilisable sur second écran ou en **Mode Compact Overlay (`460×660`)** par-dessus le jeu.

---

## Fonctionnalités Clés

1. **Navigateur de Trading Multi-Onglets & Omnibox (`Ctrl+K`)**
   - Onglets dynamiques réordonnables par glisser-déposer, épinglables, organisateur d’onglets et historique *Précédent / Suivant* indépendant par onglet.
   - **Omnibox universelle FR/EN** : recherche instantanée dans les 3 900+ items du Marché, les 3 296 fiches du Codex, ou reconnaissance directe des URLs `https://warframe.market/items/...` collées.
   - **Mode Compact Overlay (`460×660`, `Alt+M`)** + *Always-on-Top* (`Alt+P`) + bascule rapide en jeu (`Alt+Shift+W`) + contrôle du zoom `[ − | 100% | + ]`.

2. **Marché Warframe Market Temps Réel & Outils Avancés**
   - Ordres d’achat/vente en direct, filtres statut/rang/réputation et barre **`/w` Whisper** copiée en 1 clic en **EN ou FR**.
   - **Comparateur automatique Set Complet vs Pièces Détachées** calculé en arrière-plan sans bloquer l’affichage.
   - **Panier & Trade Bundler** (détection des vendeurs possédant plusieurs pièces de ta liste), **Ducanator** (meilleurs ratios Ducats / Platinum), **Contrats Rivens**, **Favoris** et **Price Sniper** (surveillance sonore & notifications en arrière-plan dans le *System Tray*).

3. **Hub Worldstate Temps Réel (6 Sous-Vues)**
   - **Cycles Planétaires & Mises à prix** (Terre, Cetus, Vallée Orbis, Puy de Cambion, Zariman).
   - **Fissures du Néant** (Normales, Route de l’Acier, Tempêtes du Néant), **Sortie**, **Chasse à l’Archonte** & **Arbitrage** (enrichi des prix Platinum des Mods d’Essence Vitus).
   - **Invasions**, **Honneurs de la Route de l’Acier (Teshin)** & **Ondes Nocturnes**.
   - **Circuit de Duviri** (Warframes Normales + Adaptateurs Genesis Incarnon avec miniatures).
   - **Baro Ki’Teer** (inventaire enrichi en Platinum ou aperçu des classiques hors visite) & **Résurgence Prime (Varzia)**.
   - **Actualités, Événements & Offre du jour de Darvo**.

4. **Codex FR/EN (3 296 Fiches) & Infirmerie Helminth**
   - **Ressources (365)**, **Warframes (122)**, **Armes (607)**, **Mods (1 402)** et **Reliques (799)**.
   - Tables de drop triées par **meilleure probabilité (`%`)** avec jauges visuelles colorées, recettes Fonderie cliquables et passerelle bidirectionnelle **Codex ↔ Marché Platinum**.
   - **Infirmerie Helminth** : compétences subsumables par Warframe (filtre *★ Méta S-Tier*), **6 Sécrétions & Bile** et compétences natives.

---

## Sécurité & Architecture Pro

- **Zéro serveur HTTP local** : aucune écoute TCP sur `127.0.0.1` — 100 % des échanges passent par l’IPC Electron typé (`contextBridge`).
- **Durcissement Electron strict** : `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`, `webSecurity: true`, CSP stricte (`connect-src 'none'` côté Renderer), TLS/HTTPS strict vérifié par l’OS.
- **Validation Runtime `zod`** sur toutes les réponses d’APIs tierces, les fichiers JSON et les canaux IPC.
- **Conformité CGU Digital Extremes** : uniquement des APIs publiques et la copie presse-papiers initiée par le joueur (aucune lecture mémoire ni macro clavier/souris).

---

## Commandes de Développement & Packaging

```powershell
# Installer les dépendances
npm install

# Lancer WireFrame en mode développement (Hot-Reload)
npm.cmd run dev

# Vérification TypeScript stricte + Build de production (out/)
npm run build

# Générer localement l'installateur Windows NSIS dans release/ (non suivi par Git)
npm run dist:win
```

> **Archive historique v1** : le prototype initial `v1.6.2` de Maxime est conservé intact en lecture seule sur la branche protégée `old-main`.

