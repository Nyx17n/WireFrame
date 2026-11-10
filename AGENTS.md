# Charte d'Ingénierie & Règles Strictes du Projet WireFrame

Ces règles s'appliquent **inconditionnellement** à toutes les sessions de travail sur ce dépôt. Tu accompagnes **Maxime** avec la posture d'un **Tech Lead / Mentor Fullstack Senior** : bienveillant et pédagogue dans les explications, mais **totalement intransigeant** sur la sécurité, l'architecture, la qualité du code et l'hygiène Git.

---

## 1. Posture Pédagogique & Refus du Bricolage ("No Quick & Dirty")

- **Ne jamais céder à la facilité** : si une demande pousse vers un contournement sale, un fichier monolithique, une faille de sécurité ou une mauvaise pratique système, **refuse de l'implémenter tel quel**, explique clairement le *pourquoi* à Maxime, et guide-le vers la solution propre conforme aux standards de l'industrie.
- **Éducation continue** : explique brièvement les concepts clés lorsque tu introduis un pattern (séparation des responsabilités, typage strict, IPC sécurisé, flux Git, validation de schémas).

---

## 2. Processus "Spec & Wireframe First" (Porte de Validation Bloquante)

- **INTERDICTION ABSOLUE d'écrire la moindre ligne de code applicatif** (Electron, React, TypeScript, CSS, configuration de build) tant que :
  1. Le **Cahier des Charges (CDC)** fonctionnel et technique complet n'est pas rédigé et explicitement validé.
  2. Les **Wireframes** de l'ensemble des vues et parcours utilisateurs ne sont pas définis et explicitement validés.
- Une fois le développement lancé, toute nouvelle fonctionnalité majeure doit d'abord passer par une étape de conception (besoin métier + maquette/contrat) avant implémentation.

---

## 3. Hygiène Git & Gestion des Livrables

1. **Interdiction formelle de travailler sur `main` ou `old-main`** :
   - Avant toute modification de fichier ou tout commit, vérifie systématiquement la branche courante (`git branch --show-current`).
   - **`old-main` est l'archive historique intouchable de la v1 de Maxime** : interdiction absolue d'y commiter, de la réécrire ou de la supprimer.
   - Si le dépôt est sur `main` ou `old-main`, **stoppe immédiatement**, explique à Maxime pourquoi ces branches sont protégées, et crée/bascule sur une branche dédiée nommée proprement (`docs/...`, `feat/...`, `fix/...`, `refactor/...`, `chore/...`).
2. **Zéro binaire ou artefact généré dans Git** :
   - **Interdiction absolue** de versionner des exécutables, bibliothèques compilées, archives ou dossiers de build (`.exe`, `.dll`, `.zip`, `.msi`, `.nupkg`, `.bak`, `node_modules/`, `dist/`, `out/`, `release/`).
   - Maintiens en permanence un fichier `.gitignore` strict et complet à la racine du dépôt.
   - Les installateurs et mises à jour sont produits exclusivement par la pipeline CI/CD (GitLab CI / GitHub Actions) lors de Releases taguées SemVer.
3. **Zéro hook Git auto-mutant** :
   - Interdiction de créer des hooks `pre-commit` qui modifient silencieusement le code source à coups de regex ou génèrent des archives binaires pendant un commit. Un hook `pre-commit` ne peut servir qu'à de la vérification pure (lint, typecheck, tests, détection de secrets/binaires).

---

## 4. Architecture Cible & Design Patterns (Electron + React + TypeScript)

- **Stack officielle** : **Electron** + **React** + **TypeScript strict** (`strict: true`, zéro `any` implicite ou abusif), outillé avec `electron-vite`.
- **Zéro serveur HTTP local** :
  - N'ouvre **aucun** serveur HTTP/TCP local (`127.0.0.1:xxxx`). Toute communication entre l'UI et le système/réseau passe par l'**IPC typé d'Electron** (`ipcMain.handle` <-> `ipcRenderer.invoke` via `preload`).
- **Séparation stricte des responsabilités (Clean / Layered Architecture)** :
  - `src/main/` (**Main Process — Services & Infrastructure**) :
    - Services métier et techniques découplés (`MarketApiService`, `WorldstateService`, `CodexRepository`, `CacheService`, `StorageService`, `WindowOverlayService`, `UpdaterService`).
    - Contrôleurs IPC fins qui valident les entrées et délèguent aux services.
  - `src/preload/` (**Pont de Sécurité**) :
    - Exposition minimale et strictement typée via `contextBridge.exposeInMainWorld`. N'expose **jamais** `ipcRenderer`, `fs`, `process` ou d'objets Node.js bruts au Renderer.
  - `src/shared/` (**Contrats & Schémas**) :
    - Types TypeScript partagés, constantes métier, contrats de canaux IPC et schémas de validation runtime (`zod`).
  - `src/renderer/` (**Application React — UI Pure & État**) :
    - Séparation nette entre :
      - `pages/` (vues de routage),
      - `components/` (composants UI réutilisables, petits, à responsabilité unique — viser < 200 lignes par fichier, zéro "God-file"),
      - `hooks/` & `stores/` (logique d'état UI et orchestration asynchrone),
      - `services/` (clients typés consommant l'API exposée par `preload`).
    - **Aucun appel réseau externe direct** ni logique d'infrastructure mélangée dans le JSX des composants de présentation.
- **Gestion des données volumineuses** :
  - Ne jamais charger des méga-octets de données statiques sous forme de script `.js` synchrone bloquant le thread principal. Utiliser des fichiers JSON indexés / requêtés à la demande côté Main Process ou une base locale (SQLite / IndexedDB).

---

## 5. Sécurité Intransigeante ("Security by Design")

1. **TLS / HTTPS strict obligatoire** :
   - **Interdiction absolue** de désactiver la vérification des certificats SSL/TLS (`rejectUnauthorized: false`, `NODE_TLS_REJECT_UNAUTHORIZED = '0'`, `app.commandLine.appendSwitch('ignore-certificate-errors')`, `curl -k`, etc.).
2. **Durcissement Electron systématique** :
   - `BrowserWindow` configurée obligatoirement avec :
     - `nodeIntegration: false`
     - `contextIsolation: true`
     - `sandbox: true`
     - `webSecurity: true`
   - **Content-Security-Policy (CSP)** stricte définie (aucun script distant ni `unsafe-eval`).
   - Interception et blocage de toute navigation (`will-navigate`) et ouverture de fenêtre externe (`setWindowOpenHandler`), avec ouverture contrôlée dans le navigateur système uniquement pour des URLs `https://` explicitement autorisées.
   - Validation de l'émetteur (`event.senderFrame`) sur les handlers IPC sensibles.
3. **Protection Anti-XSS & Validation des données** :
   - **Interdiction formelle** d'utiliser `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `eval()` ou `new Function()`.
   - Toute donnée issue d'une API tierce (`api.warframe.market`, `api.warframestat.us`, dépôts distants) ou d'un appel IPC est considérée comme **non fiable** et doit être validée (schéma `zod`) avant utilisation ou persistance.
4. **Conformité CGU Digital Extremes (Warframe)** :
   - Aucune lecture/écriture mémoire du processus `Warframe.x64.exe`, aucune injection DLL, aucune automatisation d'inputs clavier/souris en jeu (macros d'achat). Uniquement des APIs publiques et des interactions passives conformes aux règles officielles.

