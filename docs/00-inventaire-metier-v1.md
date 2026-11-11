# Inventaire Métier & Vues de Référence (Extrait de WireFrame v1.6.2)

> **Note** : L'intégralité du code et des ressources graphiques/audio de la `v1` est conservée intacte sur la branche d'archive **`old-main`**. Ce document sert de base fonctionnelle pour concevoir le **Cahier des Charges (`01-cahier-des-charges.md`)** et les **Wireframes (`02-wireframes/`)** de la `v2` (Electron + React + TypeScript).

---

## 1. Besoin Métier Global

**WireFrame** est une application compagnon de bureau pour les joueurs de **Warframe**, réunissant en une seule interface rapide et superposable au jeu (*Overlay*) :
1. **Le trading optimisé sur Warframe Market** (consultation multi-items, comparaison Set vs Pièces, panier multi-achats avec regroupement de vendeurs, surveillance de prix en arrière-plan, génération de messages `/w`).
2. **Le suivi en temps réel de l'état du monde Warframe (*Worldstate*)** croisé avec la valeur en Platinum des récompenses (Baro Ki'Teer, Invasions, Arbitrage, Duviri, Fissures, Cycles planétaires).
3. **Une encyclopédie de Farm (*Codex*)** indiquant où obtenir chaque ressource, Warframe, arme, mod ou relique, leurs taux de drop et l'utilité Helminth.

---

## 2. Catalogue des Vues à Repenser et Maquetter

### A. Cadre Applicatif (App Shell)
- **A1. Barre de fenêtre native Electron (Frameless)** : Onglets ouverts (glisser-déposer, épinglage, fermeture doublons), accès permanent au Hub, contrôles fenêtre (Mode Compact `460×660`, Épingler au premier plan `Always-on-Top`, Réduire dans le System Tray, Agrandir, Fermer).
- **A2. Barre de commande globale** : Recherche rapide d'items (`Ctrl+K`), sélecteurs globaux **Plateforme** (`PC`, `PSN`, `XBOX`, `SWITCH`, `MOBILE`), **Crossplay** et **Langue** (`FR` / `EN`), accès rapide Panier / Favoris / Alertes / Paramètres.
- **A3. Bandeau d'échange `/w` (`WhisperDrawer/Bar`)** : Copie presse-papiers en 1 clic de la commande `/w` en anglais ou en français.
- **A4. Système de Notifications & Alertes Sonores** : Toasts in-app + notifications système + choix de sonnerie et volume.

### B. Module 1 — Hub Temps Réel Warframe (6 Vues)
- **H1. Planètes & Mises à Prix** : Cycles Cetus (Jour/Nuit), Vallée Orbis (Chaud/Froid), Puy de Cambion (Fass/Vome), Terre, Duviri (5 spirales), Zariman (Corpus/Grineer) + Mises à prix Ostrons / Union Solaris / Entrati.
- **H2. Fissures & Missions** : Fissures du Néant (Normal, Route de l'Acier, Tempêtes Railjack, Omnia) avec filtre *Missions Rapides*, Chasse à l'Archonte hebdomadaire, Sortie quotidienne.
- **H3. Invasions, Acier & Nightwave** : Invasions actives (avec cotation Platinum sur pièces Wraith/Vandal), Rotation hebdomadaire de Teshin (calendrier 8 semaines + boutique permanente), Arbitrage actif & Mods Galvanisés, Alertes du Lotus, Événements, Défis Ondes Nocturnes.
- **H4. Rotations du Circuit de Duviri** : Warframes (Normal) et Adaptateurs Incarnon Genesis (Route de l'Acier) de la semaine + calendrier complet des 9 semaines.
- **H5. Marchand Baro Ki'Teer** : Compte à rebours, relais, inventaire Ducats/Crédits et comparateur automatique `Platinum` & ratio `Plat / 100 Ducats`.
- **H6. Actualités Officielles & Darvo** : News officielles filtrées, Boosters globaux serveur actifs, Offre quotidienne de Darvo, liens rapides Résurgence Prime.

### C. Module 2 — Marché & Outils de Trading (10 Vues)
- **M1. Accueil / Dashboard Marché** : Recherche centrale, accès rapide, articles vedettes et aperçu du marché.
- **M2. Catalogue des Items** : Grille filtrable et paginée des ~3 900+ items échangeables (Sets Prime, Mods, Arcanes, Reliques, Incarnon, Syndicats...).
- **M3. Fiche Détail d'un Item** :
  - Ordres de Vente & d'Achat (filtres statut *En jeu*, rang du mod/arcane, réputation).
  - **Comparateur de rentabilité Set Complet vs Pièces Détachées**.
  - **Statistiques d'évolution des prix (48h / 90 jours)**.
  - Actions rapides : `/w`, Favori, Ajouter au Panier, Créer une alerte *Price Sniper*.
- **M4. Ordres Récents** : Flux en direct des dernières offres publiées.
- **M5. Favoris Marché** : Suivi rapide d'une liste d'items avec meilleur prix *En jeu* en direct.
- **M6. Panier Multi-Achats & Regroupeur de Vendeurs (*Trade Bundler*)** :
  - Calcul du total en Platinum et de la taxe d'échange en Crédits.
  - Détection automatique des vendeurs *En jeu* possédant plusieurs items du panier simultanément + `/w` groupé.
- **M7. Contrats (Enchères Rivens)** : Recherche par arme, affichage des attributs positifs/négatifs, maîtrise, polarité, relances et prix d'achat/enchère.
- **M8. Profil Utilisateur** : Statut, réputation et liste complète des ordres actifs d'un joueur.
- **M9. Ducanator** : Classement des pièces Prime selon le meilleur rendement `Ducats / Platinum`.
- **M10. Centre d'Alertes (*Price Sniper* & Alertes Cycles)** : Configuration des seuils de prix par item et activation des alertes sonores d'événements Worldstate.

### D. Module 3 — Codex & Farm (2 Vues)
- **C1. Explorateur du Codex** : Recherche par catégorie (*Ressources*, *Warframes*, *Armes*, *Mods*, *Reliques*).
- **C2. Fiche Détail Codex & Helminth** : Lieux de farm, rotations, taux de drop exacts (`%`), coûts de Fonderie, statistiques d'équipement et compétence de subsomption **Helminth**.

### E. Modales Transverses
- **T1. Paramètres** : Thèmes prédéfinis + personnalisation bicolore (Primaire/Secondaire + Glow), audio, raccourcis clavier globaux, comportement System Tray, mises à jour.
- **T2. Notes de Version (*Changelog*)** : Historique des versions et état de mise à jour (`electron-updater`).

