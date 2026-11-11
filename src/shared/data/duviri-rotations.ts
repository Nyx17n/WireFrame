export interface DuviriWarframeWeek {
  readonly week: number
  readonly frames: readonly [string, string, string]
}

export interface DuviriIncarnonWeek {
  readonly week: number
  readonly code: string
  readonly weapons: readonly [string, string, string, string, string]
}

export interface ArbitrationVitusItemDef {
  readonly slug: string
  readonly labelFr: string
  readonly labelEn: string
  readonly vitusCost: number
  readonly category: string
}

export const DUVIRI_WARFRAME_ROTATIONS: readonly DuviriWarframeWeek[] = [
  { week: 1, frames: ['Excalibur', 'Trinity', 'Ember'] },
  { week: 2, frames: ['Loki', 'Mag', 'Rhino'] },
  { week: 3, frames: ['Ash', 'Frost', 'Nyx'] },
  { week: 4, frames: ['Saryn', 'Vauban', 'Nova'] },
  { week: 5, frames: ['Nekros', 'Valkyr', 'Oberon'] },
  { week: 6, frames: ['Hydroid', 'Mirage', 'Limbo'] },
  { week: 7, frames: ['Mesa', 'Chroma', 'Atlas'] },
  { week: 8, frames: ['Ivara', 'Inaros', 'Titania'] },
  { week: 9, frames: ['Nidus', 'Octavia', 'Harrow'] },
  { week: 10, frames: ['Gara', 'Khora', 'Revenant'] },
  { week: 11, frames: ['Garuda', 'Baruuk', 'Hildryn'] }
] as const

export const DUVIRI_INCARNON_ROTATIONS: readonly DuviriIncarnonWeek[] = [
  { week: 1, code: 'Rotation A', weapons: ['Braton', 'Lato', 'Skana', 'Paris', 'Kunai'] },
  { week: 2, code: 'Rotation B', weapons: ['Bo', 'Latron', 'Furis', 'Furax', 'Strun'] },
  {
    week: 3,
    code: 'Rotation C',
    weapons: ['Lex', 'Magistar', 'Boltor', 'Bronco', 'Ceramic Dagger']
  },
  {
    week: 4,
    code: 'Rotation D',
    weapons: ['Torid', 'Dual Toxocyst', 'Dual Ichor', 'Miter', 'Atomos']
  },
  { week: 5, code: 'Rotation E', weapons: ['Ack & Brunt', 'Soma', 'Vasto', 'Nami Solo', 'Burston'] },
  { week: 6, code: 'Rotation F', weapons: ['Zylok', 'Sibear', 'Dread', 'Despair', 'Hate'] },
  { week: 7, code: 'Rotation G', weapons: ['Dera', 'Sybaris', 'Cestra', 'Sicarus', 'Okina'] },
  { week: 8, code: 'Rotation H', weapons: ['Gorgon', 'Anku', 'Angstrum', 'Gammacor', 'Boar'] }
] as const

export const ARBITRATION_VITUS_ITEMS: readonly ArbitrationVitusItemDef[] = [
  {
    slug: 'galvanized_chamber',
    labelFr: 'Chambre Galvanisée',
    labelEn: 'Galvanized Chamber',
    vitusCost: 20,
    category: 'Fusil (Tir Multiple)'
  },
  {
    slug: 'galvanized_diffusion',
    labelFr: 'Diffusion Galvanisée',
    labelEn: 'Galvanized Diffusion',
    vitusCost: 20,
    category: 'Pistolet (Tir Multiple)'
  },
  {
    slug: 'galvanized_hell',
    labelFr: 'Enfer Galvanisé',
    labelEn: 'Galvanized Hell',
    vitusCost: 20,
    category: 'Fusil à Pompe (Tir Multiple)'
  },
  {
    slug: 'galvanized_aptitude',
    labelFr: 'Aptitude Galvanisée',
    labelEn: 'Galvanized Aptitude',
    vitusCost: 20,
    category: 'Fusil (Statut)'
  },
  {
    slug: 'galvanized_shot',
    labelFr: 'Tir Galvanisé',
    labelEn: 'Galvanized Shot',
    vitusCost: 20,
    category: 'Pistolet (Statut)'
  },
  {
    slug: 'galvanized_savvy',
    labelFr: 'Astuce Galvanisée',
    labelEn: 'Galvanized Savvy',
    vitusCost: 20,
    category: 'Fusil à Pompe (Statut)'
  },
  {
    slug: 'galvanized_steel',
    labelFr: 'Acier Galvanisé',
    labelEn: 'Galvanized Steel',
    vitusCost: 20,
    category: 'Mêlée (Critique)'
  },
  {
    slug: 'galvanized_reflex',
    labelFr: 'Réflexe Galvanisé',
    labelEn: 'Galvanized Reflex',
    vitusCost: 20,
    category: 'Mêlée (Combo Initial)'
  },
  {
    slug: 'galvanized_elementalist',
    labelFr: 'Élémentaliste Galvanisé',
    labelEn: 'Galvanized Elementalist',
    vitusCost: 20,
    category: 'Mêlée (Statut)'
  },
  {
    slug: 'rolling_guard',
    labelFr: 'Roulade Parade',
    labelEn: 'Rolling Guard',
    vitusCost: 20,
    category: 'Warframe (Invulnérabilité)'
  },
  {
    slug: 'adaptation',
    labelFr: 'Adaptation',
    labelEn: 'Adaptation',
    vitusCost: 20,
    category: 'Warframe (Résistance 90%)'
  },
  {
    slug: 'preparation',
    labelFr: 'Préparation',
    labelEn: 'Preparation',
    vitusCost: 30,
    category: 'Exilus (+100% Énergie Max)'
  }
] as const

