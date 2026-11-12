# WireFrame — Warframe Companion, Trading Browser & Codex

[![Dernière Release](https://img.shields.io/github/v/release/Nyx17n/WireFrame?color=26b9d1&label=Release&logo=github)](https://github.com/Nyx17n/WireFrame/releases/latest)
[![Windows 10/11 x64](https://img.shields.io/badge/Windows-10%20%2F%2011%20(x64)-0078D6?logo=windows)](https://github.com/Nyx17n/WireFrame/releases/latest)
[![Serveur Discord](https://img.shields.io/badge/Discord-Rejoindre%20la%20communaut%C3%A9-5865F2?logo=discord&logoColor=white)](https://discord.gg/DhGwHPf82n)
[![Licence MIT](https://img.shields.io/badge/Licence-MIT-22c55e)](https://github.com/Nyx17n/WireFrame)

> Conçu par **Maxime (`Nyxo17`)** — Architecture **Electron 35 · Node.js · React 19 · `shadcn/ui` · TypeScript strict (`strict: true`) · Validation `zod`**.

**WireFrame v2** (`v2.5.4`) est un compagnon bureau tout-en-un pour **Warframe** combinant un navigateur de trading multi-onglets connecté à **Warframe Market**, un **Hub Worldstate temps réel** (avec règles d’alertes sur mesure et minuteurs épinglés) et une **Encyclopédie de Farm & Helminth** hors-ligne complète en FR/EN, utilisable sur second écran ou en **Mode Compact Overlay (`460×660`)** par-dessus le jeu.

---

## Téléchargement & Communauté

- **Installateur Windows (`.exe`)** : Télécharge la dernière version depuis **[GitHub Releases](https://github.com/Nyx17n/WireFrame/releases/latest)** *(les mises à jour suivantes sont téléchargées et proposées automatiquement au lancement grâce à l'auto-updater intégré avec vérification SHA-512)*.
- **Serveur Discord Officiel** : Rejoins la communauté et reçois automatiquement les annonces de patch notes sur **[discord.gg/DhGwHPf82n](https://discord.gg/DhGwHPf82n)**.

---

## Fonctionnalités Clés

1. **Navigateur de Trading Multi-Onglets, Barre de Raccourcis & Historique**
   - Onglets dynamiques réordonnables par glisser-déposer, épinglables, indicateur fluide de transition de page et navigation *Précédent / Suivant* indépendante par onglet.
   - **Barre d’adresse `wf://` pleine largeur (`Ctrl+K`)** : recherche instantanée FR/EN dans les 3 900+ items du Marché, les 3 296 fiches du Codex, ou ouverture directe d’une URL `https://warframe.market/items/...` collée.
   - **Barre de raccourcis centrée** (*Marché · Favoris · Panier · Ordres récents · Codex · Ducanator · Contrats Mod Riven*) + **Historique de navigation complet (`wf://history`, `Ctrl+H`)** aligné à droite (masquée automatiquement sur le Hub Temps Réel).
   - **Mode Compact Overlay (`460×660`, `Alt+M`)** + *Always-on-Top* (`Alt+P`) avec **souris traversante automatique en plein jeu (`Alt+G`)** + bascule rapide (`Alt+Shift+W`) + contrôle du zoom `[ − | 100% | + ]`.

2. **Marché Warframe Market Temps Réel & Outils Avancés**
   - Ordres d’achat/vente en direct, filtres statut/rang/réputation, flux complet des **annonces les plus récentes** dès l’accueil Marché et barre **`/w` Whisper** copiée en 1 clic en **EN ou FR**.
   - **Badges de prix temps réel (`Min · Moy · Max` Platines)** avec filtrage anti-outliers affichés automatiquement sur les cartes du Marché, Favoris, Panier, Ordres récents et les items échangeables du Codex.
   - **Comparateur automatique Set Complet vs Pièces Détachées** calculé en arrière-plan sans bloquer l’affichage.
   - **Panier & Trade Bundler** (détection des vendeurs possédant plusieurs pièces de ta liste), **Ducanator** (meilleurs ratios Ducats / Platinum), **Contrats Mod Riven**, **Favoris** et **Price Sniper** (surveillance sonore & notifications en arrière-plan dans le *System Tray*).

3. **Hub Worldstate Temps Réel, Règles d’Alertes sur Mesure & Minuteurs**
   - **Cycles Planétaires & Mises à prix** (Terre, Cetus, Vallée Orbis, Puy de Cambion, Zariman) + **Bandeau de Minuteurs épinglés** (jusqu’à 6 cycles/rotations visibles en permanence en Mode Compact ou Desktop).
   - **Règles d’alertes Worldstate personnalisées (9 sources)** avec bouton de test sur le Worldstate actuel, anti-spam par occurrence et historique de session.
   - **Fissures du Néant** (Normales, Route de l’Acier, Tempêtes du Néant), **Sortie**, **Chasse à l’Archonte** & **Arbitrage** (enrichi des prix Platinum des Mods d’Essence Vitus).
   - **Invasions**, **Honneurs de la Route de l’Acier (Teshin)** & **Ondes Nocturnes**.
   - **Circuit de Duviri** (Warframes Normales + Adaptateurs Genesis Incarnon avec miniatures).
   - **Baro Ki’Teer** (inventaire enrichi en Platinum ou aperçu des classiques hors visite) & **Résurgence Prime (Varzia)**.
   - **Actualités, Événements & Offre du jour de Darvo**.

4. **Codex FR/EN (3 296 Fiches) & Infirmerie Helminth**
   - **Ressources (365)**, **Warframes (122)**, **Armes (607)**, **Mods (1 402)** et **Reliques (799)**.
   - Aperçu direct des **ressources et composants de craft Fonderie** dans les cartes du Codex, tables de drop triées par **meilleure probabilité (`%`)** avec jauges visuelles colorées et passerelle bidirectionnelle **Codex ↔ Marché Platinum**.
   - **Infirmerie Helminth** : compétences subsumables par Warframe (filtre *★ Méta S-Tier*), **6 Sécrétions & Bile** et compétences natives.

5. **Personnalisation Visuelle Avancée, Notifications & Animations**
   - **3 modes d’affichage** (*Grille Carrée*, *Grille Rectangulaire*, *Liste pleine largeur*) et **3 tailles de cartes (`S` / `M` / `L`)** avec images adaptatives sur l’ensemble des catalogues et outils, couplés au chargement progressif **« Afficher plus »** sans rechargement de page.
   - **20 thèmes visuels intégrés** (*Sombre*, *Clair*, *Full Black OLED `#000`*, *Full White `#FFF`* + 16 déclinaisons chromatiques) **+ 76 couleurs prédéfinies indépendantes** (28 fonds & 48 accents) et sélecteur libre.
   - **Notifications in-app empilées & Centre de notifications (`🔔`)** : 5 styles visuels, pause du minuteur au survol, fusion anti-spam et historique de session.
   - **Animations fluides GPU désactivables** : sélecteur **Complètes / Réduites / Désactivées** dans les Paramètres + respect automatique du réglage Windows, et ouverture automatique des **« Notes de Patch »** après mise à jour.

---

## Sécurité, Architecture Pro & CI/CD

- **Zéro serveur HTTP local** : aucune écoute TCP sur `127.0.0.1` — 100 % des échanges passent par l’IPC Electron typé (`contextBridge`).
- **Durcissement Electron strict** : `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`, `webSecurity: true`, CSP stricte (`connect-src 'none'` côté Renderer), TLS/HTTPS strict vérifié par l’OS et liste blanche de domaines externes.
- **Validation Runtime `zod`** sur toutes les réponses d’APIs tierces, les fichiers JSON et les canaux IPC.
- **Pipeline GitHub Actions automatisée** : vérification TypeScript stricte à chaque commit, compilation de l’installateur NSIS + `latest.yml` SHA-512 sur tag `v*.*.*`, et publication automatique des patch notes sur GitHub Releases et Discord.
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
