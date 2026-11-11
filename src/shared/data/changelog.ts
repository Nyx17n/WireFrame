export interface ChangelogRelease {
  readonly version: string
  readonly date: string
  readonly titleFr: string
  readonly badgeFr: string
  readonly highlightsFr: readonly string[]
}

export const CHANGELOG_RELEASES: readonly ChangelogRelease[] = [
  {
    version: '2.3.0',
    date: 'Novembre 2026',
    titleFr: 'Chargement Progressif « Afficher plus » Sans Changement de Page',
    badgeFr: 'Nouveauté v2.3',
    highlightsFr: [
      'Codex principal : remplacement des boutons Précédent / Suivant par un bouton « Afficher plus » qui ajoute la suite directement en bas de la grille sans rechargement ni perte du défilement.',
      'Tables de Drop du Codex : ajout du bouton « Afficher plus » pour consulter toutes les sources au-delà des 60 premières.',
      'Harmonisation complète du chargement progressif « Afficher plus » sur le Catalogue Warframe Market, les tableaux d’offres Vendeurs / Acheteurs et le Ducanator.'
    ]
  },
  {
    version: '2.2.0',
    date: 'Novembre 2026',
    titleFr: 'Collection Complète des 20 Thèmes (OLED / Clair / Néon) & Patch Notes Auto',
    badgeFr: 'Nouveauté v2.2',
    highlightsFr: [
      'Ajout de la collection intégrale des 20 thèmes d’interface : Sombre (Défaut), Clair, Full Black OLED (#000) et Full White (#FFF).',
      '16 déclinaisons chromatiques sombres et claires : Bleu, Cyan, Vert, Jaune, Rouge, Orange, Violet et Rose avec rendu achromatique pur sur les modes OLED et Blanc.',
      'Nouvelle grille visuelle 4×5 dans Paramètres → Apparence avec symboles géométriques, sous-titres thématiques Warframe et halo lumineux actif.',
      'Ouverture automatique unique de la fenêtre « Notes de Patch » au premier démarrage suivant l’installation d’une nouvelle mise à jour.',
      'Migration transparente des anciens profils de couleurs sans perte de favoris, d’onglets ni d’alertes.'
    ]
  },
  {
    version: '2.1.0',
    date: 'Novembre 2026',
    titleFr: 'Animation Cinétique « Pulsation du Lotus » & Mises à jour GitHub Releases',
    badgeFr: 'Mise à jour v2.1',
    highlightsFr: [
      'Animation d’ouverture cinétique au lancement : ondes du Lotus teintées selon ton thème actif et défilement fluide Wire Frame → Doc → Companion → Market → Index → Codex avec centrage final sur « Wire ».',
      'Option d’activation/désactivation et bouton « Rejouer » à la demande dans Paramètres → Apparence.',
      'Migration officielle du canal de mise à jour automatique SHA-512 (electron-updater) vers GitHub Releases.'
    ]
  },
  {
    version: '2.0.0',
    date: 'Novembre 2026',
    titleFr: 'Refonte Architecture Pro — Navigateur Multi-Onglets, Hub Live & Codex',
    badgeFr: 'Majeure v2.0',
    highlightsFr: [
      'Architecture Electron + React 19 + TypeScript strict sécurisée (sandbox, CSP stricte, TLS vérifié, zéro serveur HTTP local).',
      'Navigateur de Trading multi-onglets façon Chrome avec Omnibox universelle (Ctrl+K), historique par onglet, épinglage et Mode Compact Overlay (460×660).',
      'Marché Warframe Market v2 temps réel : Set vs Pièces non bloquant, barre Whisper /w FR ↔ EN instantanée, profils joueurs et favoris.',
      'Outils avancés : Panier & Trade Bundler (vendeurs groupés), Ducanator (ratios Ducats/Platinum), Contrats Rivens et Price Sniper en arrière-plan.',
      'Hub Worldstate Temps Réel : Cycles planétaires & Mises à prix, Fissures & Arbitrage, Invasions & Route de l’Acier, Circuit de Duviri (Normal + Incarnon), Baro Ki’Teer & Varzia.',
      'Codex complet (3 296 fiches FR/EN : Ressources, Warframes, Armes, Mods, Reliques) avec tables de drop %, recettes Fonderie cliquables et Infirmerie Helminth.',
      'Auto-Updater natif electron-updater avec vérification d’intégrité cryptographique SHA-512.'
    ]
  },
  {
    version: '1.6.2',
    date: 'Archive Legacy (old-main)',
    titleFr: 'Dernière édition Prototype Python / PyWebView de Maxime',
    badgeFr: 'Historique v1',
    highlightsFr: [
      'Fondation fonctionnelle imaginée et conçue par Maxime (Nyxo_17) ayant servi de référence métier intégrale pour WireFrame v2.0.',
      'Conservée intacte sur la branche protégée old-main.'
    ]
  }
] as const
