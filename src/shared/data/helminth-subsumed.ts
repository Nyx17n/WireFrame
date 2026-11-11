export interface HelminthSecretionGuide {
  readonly id: string
  readonly nameFr: string
  readonly descriptionFr: string
  readonly bestResources: ReadonlyArray<{
    readonly slug: string
    readonly labelFr: string
  }>
}

/**
 * Index (0, 1 ou 2) de la compétence donnée par subsomption au Helminth
 * dans le tableau `abilities` de chaque Warframe standard.
 */
export const HELMINTH_SUBSUMED_INDEX_BY_WARFRAME: Readonly<
  Record<string, { abilityIndex: number; isMeta?: boolean }>
> = {
  ash: { abilityIndex: 0 },
  atlas: { abilityIndex: 2 },
  banshee: { abilityIndex: 2 },
  baruuk: { abilityIndex: 1 },
  caliban: { abilityIndex: 1 },
  chroma: { abilityIndex: 1 },
  citrine: { abilityIndex: 0 },
  'cyte-09': { abilityIndex: 2 },
  dagath: { abilityIndex: 0 },
  dante: { abilityIndex: 1 },
  ember: { abilityIndex: 2 },
  equinox: { abilityIndex: 1 },
  excalibur: { abilityIndex: 1 },
  frost: { abilityIndex: 1 },
  gara: { abilityIndex: 2 },
  garuda: { abilityIndex: 1 },
  gauss: { abilityIndex: 2, isMeta: true },
  grendel: { abilityIndex: 1, isMeta: true },
  gyre: { abilityIndex: 1 },
  harrow: { abilityIndex: 0 },
  hildryn: { abilityIndex: 1, isMeta: true },
  hydroid: { abilityIndex: 0 },
  inaros: { abilityIndex: 0 },
  ivara: { abilityIndex: 0 },
  jade: { abilityIndex: 1 },
  khora: { abilityIndex: 1 },
  koumei: { abilityIndex: 1 },
  kullervo: { abilityIndex: 0, isMeta: true },
  lavos: { abilityIndex: 1 },
  limbo: { abilityIndex: 0 },
  loki: { abilityIndex: 0 },
  mag: { abilityIndex: 0 },
  mesa: { abilityIndex: 1 },
  mirage: { abilityIndex: 2, isMeta: true },
  nekros: { abilityIndex: 1, isMeta: true },
  nezha: { abilityIndex: 0 },
  nidus: { abilityIndex: 1 },
  nokko: { abilityIndex: 1 },
  nova: { abilityIndex: 0 },
  nyx: { abilityIndex: 1 },
  oberon: { abilityIndex: 0 },
  octavia: { abilityIndex: 1 },
  oraxia: { abilityIndex: 1 },
  protea: { abilityIndex: 2, isMeta: true },
  qorvex: { abilityIndex: 0 },
  revenant: { abilityIndex: 2 },
  rhino: { abilityIndex: 2, isMeta: true },
  saryn: { abilityIndex: 1 },
  sevagoth: { abilityIndex: 2, isMeta: true },
  styanax: { abilityIndex: 1, isMeta: true },
  temple: { abilityIndex: 0 },
  titania: { abilityIndex: 0 },
  trinity: { abilityIndex: 0 },
  uriel: { abilityIndex: 1 },
  valkyr: { abilityIndex: 1 },
  vauban: { abilityIndex: 0 },
  volt: { abilityIndex: 0 },
  voruna: { abilityIndex: 2 },
  wisp: { abilityIndex: 2, isMeta: true },
  wukong: { abilityIndex: 2 },
  xaku: { abilityIndex: 0, isMeta: true },
  yareli: { abilityIndex: 2 },
  zephyr: { abilityIndex: 1 }
}

export const HELMINTH_SECRETIONS: readonly HelminthSecretionGuide[] = [
  {
    id: 'oxides',
    nameFr: 'Oxydes',
    descriptionFr: 'Substances métalliques abondantes obtenues sur l’ensemble de la Carte Céleste.',
    bestResources: [
      { slug: 'ferrite', labelFr: 'Ferrite' },
      { slug: 'alloy-plate', labelFr: 'Plaque d’Alliage' },
      { slug: 'salvage', labelFr: 'Récupération' },
      { slug: 'gallium', labelFr: 'Gallium' }
    ]
  },
  {
    id: 'calx',
    nameFr: 'Calx',
    descriptionFr: 'Minéraux cristallins et sédiments rocheux pour renforcer la carapace Helminth.',
    bestResources: [
      { slug: 'rubedo', labelFr: 'Rubedo' },
      { slug: 'grokdrul', labelFr: 'Grokdrul' },
      { slug: 'iradite', labelFr: 'Iradite' },
      { slug: 'cryotic', labelFr: 'Cryotique' }
    ]
  },
  {
    id: 'biotics',
    nameFr: 'Biotiques',
    descriptionFr: 'Matière végétale et spores organiques faciles à récolter en masse.',
    bestResources: [
      { slug: 'nano-spores', labelFr: 'Nano Spores' },
      { slug: 'plastids', labelFr: 'Plastides' },
      { slug: 'ganglion', labelFr: 'Ganglion (Deimos)' }
    ]
  },
  {
    id: 'synthetics',
    nameFr: 'Synthétiques',
    descriptionFr: 'Circuits, polymères et matériaux technologiques Corpus.',
    bestResources: [
      { slug: 'circuits', labelFr: 'Circuits' },
      { slug: 'polymer-bundle', labelFr: 'Pack Polymère' },
      { slug: 'control-module', labelFr: 'Module de Contrôle' }
    ]
  },
  {
    id: 'pheromones',
    nameFr: 'Phéromones',
    descriptionFr: 'Tissus infestés nécessaires à l’assimilation des Warframes.',
    bestResources: [
      { slug: 'pustulite', labelFr: 'Pustulite (Deimos)' },
      { slug: 'techrot-chitin', labelFr: 'Chitine Techrot (1999)' },
      { slug: 'mutagen-sample', labelFr: 'Échantillon Mutagène' },
      { slug: 'neurodes', labelFr: 'Neurodes' }
    ]
  },
  {
    id: 'bile',
    nameFr: 'Bile (Critique — Fragments d’Archonte)',
    descriptionFr: 'Sécrétion la plus consommée pour retirer les Fragments d’Archonte et infuser des pouvoirs.',
    bestResources: [
      { slug: 'morphics', labelFr: 'Morphics' },
      { slug: 'argon-crystal', labelFr: 'Cristal d’Argon' },
      { slug: 'thermal-sludge', labelFr: 'Boue Thermique (Fortuna)' },
      { slug: 'voidgel-orb', labelFr: 'Orbe de Gel du Néant (Zariman)' }
    ]
  }
] as const
