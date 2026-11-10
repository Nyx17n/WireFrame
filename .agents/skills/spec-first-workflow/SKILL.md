---
name: spec-first-workflow
description: >-
  Enforces the mandatory Spec-First & Wireframe-First engineering workflow for
  WireFrame v2 (Electron + React + TypeScript). Activate this skill whenever
  planning, specifying, wireframing, or implementing any view, service, or
  feature with Maxime.
---

# Workflow d'Ingénierie WireFrame v2 (CDC -> Wireframes -> Code)

Suis rigoureusement ces étapes dans l'ordre lors du travail avec Maxime :

## Étape 1 — Contrôle d'Hygiène Git
1. Exécute `git branch --show-current`.
2. Si la branche active est `main` ou `old-main`, explique brièvement la règle de flux Git à Maxime et bascule sur une branche dédiée (`docs/...` pour la conception, `feat/...` ou `fix/...` pour le code).
3. Vérifie que `.gitignore` est présent et à jour.

## Étape 2 — Cahier des Charges (CDC) dans `docs/01-cahier-des-charges.md`
Avant tout wireframe ou code sur un module, assure-toi que le CDC définit :
- L'objectif métier côté joueur Warframe.
- Les sources de données externes et leurs règles de cache/rafraîchissement.
- Les règles de gestion (calculs de taxes, ratios Ducats/Plat, filtres, alertes).
- Les contrats IPC (`src/shared/`) et les exigences de sécurité/validation (`zod`).

## Étape 3 — Wireframes dans `docs/02-wireframes/`
Pour chaque vue retenue dans le CDC, produis et valide avec Maxime un wireframe couvrant :
1. **Disposition Desktop normale (`1440×900`)** : zones, hiérarchie visuelle, navigation, actions principales.
2. **Adaptation Mode Compact Overlay (`460×660`)** : ce qui est condensé ou replié pour rester lisible par-dessus Warframe.
3. **Les 4 états UI obligatoires** : Chargement (*Skeleton*), Vide (*Empty state*), Nominal, Erreur réseau/API.

> **JALON BLOQUANT** : Tant que Maxime (ou son père) n'a pas explicitement validé le CDC et les Wireframes du périmètre visé, **n'écris aucun fichier `.ts`, `.tsx`, `.js`, `.css` ni `package.json`**.

## Étape 4 — Implémentation en Couches & Revue Sécurité (Post-Validation uniquement)
Une fois le jalon validé, implémente toujours du bas vers le haut :
1. `src/shared/` : Interfaces TypeScript strictes + schémas `zod`.
2. `src/main/` : Services métier/infra isolés (TLS strict, aucun serveur HTTP) + handlers IPC validés.
3. `src/preload/` : Exposition unitaire typée dans `contextBridge`.
4. `src/renderer/` : Client IPC -> Store/Hooks -> Composants React purs (< 200 lignes, zéro `dangerouslySetInnerHTML`).
5. Avant tout `git commit`, exécute `git status` pour vérifier qu'aucun binaire (`.exe`, `.zip`, `dist/`, `node_modules/`) n'est suivi.
