export interface ChangelogRelease {
  readonly version: string
  readonly date: string
  readonly titleFr: string
  readonly badgeFr: string
  readonly highlightsFr: readonly string[]
}

export const CHANGELOG_RELEASES: readonly ChangelogRelease[] = [
  {
    version: '2.1.0',
    date: 'Novembre 2026',
    titleFr: 'Animation Cinétique « Pulsation du Lotus » & Mises à jour GitHub Releases',
    badgeFr: 'Nouveauté v2.1',
    highlightsFr: [
      'Animation d’ouverture cinétique au lancement : ondes du Lotus teintées selon ton thème actif et défilement fluide Wire Frame → Doc → Companion → Market → Index → Codex avec centrage final sur « Wire ».',
      'Option d’activation/désactivation et bouton « Rejouer » à la demande dans Paramètres → Apparence.',
      'Collection complète des 20 thèmes d’interface (Sombre, Clair, Full Black OLED #000, Full White #FFF et 16 déclinaisons Bleu, Cyan, Vert, Jaune, Rouge, Orange, Violet et Rose).',
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

