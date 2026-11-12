/**
 * Couleurs prédéfinies pour la personnalisation libre (preset « custom »).
 * Ce ne sont pas des thèmes : chaque pastille ne change QUE la couleur ciblée
 * (fond ou accent) et conserve l'autre couleur choisie par l'utilisateur.
 * Toutes les valeurs respectent le format `#RRGGBB` validé par `HexColorSchema`.
 */

export interface ColorSwatch {
  hex: string
  name: string
}

export interface ColorSwatchGroup {
  label: string
  swatches: readonly ColorSwatch[]
}

export const BACKGROUND_SWATCH_GROUPS: readonly ColorSwatchGroup[] = [
  {
    label: 'Fonds sombres',
    swatches: [
      { hex: '#000000', name: 'Noir OLED' },
      { hex: '#0b0d10', name: 'Charbon' },
      { hex: '#0f161d', name: 'Orokin Nuit' },
      { hex: '#111827', name: 'Ardoise' },
      { hex: '#18181b', name: 'Zinc' },
      { hex: '#1c1917', name: 'Pierre' },
      { hex: '#0a1628', name: 'Abysse' },
      { hex: '#0b1d2e', name: 'Océan profond' },
      { hex: '#0d1f1a', name: 'Forêt nocturne' },
      { hex: '#132013', name: 'Mousse' },
      { hex: '#1a1033', name: 'Néant violet' },
      { hex: '#21102a', name: 'Améthyste' },
      { hex: '#2a0f16', name: 'Kuva' },
      { hex: '#26140a', name: 'Ambre brûlé' },
      { hex: '#1f1a0a', name: 'Or terni' },
      { hex: '#2b1020', name: 'Prune' }
    ]
  },
  {
    label: 'Fonds clairs',
    swatches: [
      { hex: '#ffffff', name: 'Blanc pur' },
      { hex: '#f8fafc', name: 'Neige' },
      { hex: '#f1f5f9', name: 'Brume' },
      { hex: '#f5f5f4', name: 'Calcaire' },
      { hex: '#fdf6e3', name: 'Parchemin' },
      { hex: '#fef3c7', name: 'Crème' },
      { hex: '#ecfdf5', name: 'Menthe' },
      { hex: '#eff6ff', name: 'Ciel pâle' },
      { hex: '#f5f3ff', name: 'Lavande' },
      { hex: '#fdf2f8', name: 'Rose poudré' },
      { hex: '#fff1f2', name: 'Pétale' },
      { hex: '#fff7ed', name: 'Pêche' }
    ]
  }
]

export const ACCENT_SWATCH_GROUPS: readonly ColorSwatchGroup[] = [
  {
    label: 'Bleus & Cyans',
    swatches: [
      { hex: '#26b9d1', name: 'Cyan Lotus' },
      { hex: '#06b6d4', name: 'Cyan' },
      { hex: '#22d3ee', name: 'Turquoise' },
      { hex: '#0ea5e9', name: 'Azur' },
      { hex: '#3b82f6', name: 'Bleu' },
      { hex: '#2563eb', name: 'Bleu roi' },
      { hex: '#6366f1', name: 'Indigo' },
      { hex: '#38bdf8', name: 'Ciel' }
    ]
  },
  {
    label: 'Verts',
    swatches: [
      { hex: '#10b981', name: 'Émeraude' },
      { hex: '#22c55e', name: 'Vert' },
      { hex: '#4ade80', name: 'Vert néon' },
      { hex: '#84cc16', name: 'Citron vert' },
      { hex: '#14b8a6', name: 'Sarcelle' },
      { hex: '#2dd4bf', name: 'Aqua' },
      { hex: '#65a30d', name: 'Olive' },
      { hex: '#a3e635', name: 'Acide' }
    ]
  },
  {
    label: 'Jaunes & Oranges',
    swatches: [
      { hex: '#facc15', name: 'Jaune' },
      { hex: '#eab308', name: 'Or' },
      { hex: '#d4af37', name: 'Or Prime' },
      { hex: '#f59e0b', name: 'Ambre' },
      { hex: '#f97316', name: 'Orange' },
      { hex: '#fb923c', name: 'Mandarine' },
      { hex: '#ea580c', name: 'Rouille' },
      { hex: '#fbbf24', name: 'Miel' }
    ]
  },
  {
    label: 'Rouges & Roses',
    swatches: [
      { hex: '#ef4444', name: 'Rouge' },
      { hex: '#dc2626', name: 'Rouge Kuva' },
      { hex: '#f43f5e', name: 'Rose framboise' },
      { hex: '#e11d48', name: 'Cramoisi' },
      { hex: '#ec4899', name: 'Rose' },
      { hex: '#f472b6', name: 'Rose bonbon' },
      { hex: '#db2777', name: 'Fuchsia' },
      { hex: '#fb7185', name: 'Corail' }
    ]
  },
  {
    label: 'Violets',
    swatches: [
      { hex: '#8b5cf6', name: 'Violet' },
      { hex: '#a855f7', name: 'Pourpre' },
      { hex: '#c084fc', name: 'Lilas' },
      { hex: '#7c3aed', name: 'Améthyste' },
      { hex: '#d946ef', name: 'Magenta' },
      { hex: '#9333ea', name: 'Néant' },
      { hex: '#a78bfa', name: 'Lavande' },
      { hex: '#e879f9', name: 'Orchidée' }
    ]
  },
  {
    label: 'Neutres',
    swatches: [
      { hex: '#ffffff', name: 'Blanc' },
      { hex: '#e5e7eb', name: 'Argent' },
      { hex: '#94a3b8', name: 'Acier' },
      { hex: '#64748b', name: 'Ardoise' },
      { hex: '#a8a29e', name: 'Pierre' },
      { hex: '#b45309', name: 'Bronze' },
      { hex: '#78716c', name: 'Taupe' },
      { hex: '#000000', name: 'Noir' }
    ]
  }
]
