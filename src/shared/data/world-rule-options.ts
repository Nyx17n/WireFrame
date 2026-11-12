/**
 * Listes d'options des règles d'alertes Worldstate personnalisées (Module 7 du CDC).
 * Partagées entre le Main Process (validation & évaluation) et le Renderer (formulaire).
 */

export const WORLD_RULE_SOURCES = [
  'fissure',
  'invasion',
  'arbitration',
  'cycle',
  'baro',
  'sortie',
  'archon',
  'bounty',
  'nightwave'
] as const
export type WorldRuleSource = (typeof WORLD_RULE_SOURCES)[number]

export const WORLD_RULE_SOURCE_LABELS: Readonly<Record<WorldRuleSource, string>> = {
  fissure: 'Fissure du Néant',
  invasion: 'Invasion',
  arbitration: 'Arbitrage',
  cycle: 'Cycle',
  baro: "Baro Ki'Teer",
  sortie: 'Sortie',
  archon: "Chasse à l'Archonte",
  bounty: 'Mises à prix',
  nightwave: 'Nightwave'
}

export const FISSURE_ERAS = ['Lith', 'Meso', 'Neo', 'Axi', 'Requiem', 'Omnia'] as const
export type FissureEra = (typeof FISSURE_ERAS)[number]

export const FISSURE_MODES = ['any', 'normal', 'steel', 'storm'] as const
export type FissureMode = (typeof FISSURE_MODES)[number]
export const FISSURE_MODE_LABELS: Readonly<Record<FissureMode, string>> = {
  any: 'Tous',
  normal: 'Normal',
  steel: "Route de l'Acier",
  storm: 'Tempête du Néant'
}

/** Libellés FR tels que produits par `translateMissionType` (worldstate-mappers.ts). */
export const WORLD_MISSION_TYPES = [
  'Survie',
  'Défense',
  'Défense Mobile',
  'Capture',
  'Extermination',
  'Sabotage',
  'Sauvetage',
  'Perturbation',
  'Interception',
  'Excavation',
  'Espionnage',
  'Assassinat',
  'Ruche',
  'Escarmouche',
  'Volatile',
  'Orphix',
  'Alchimie',
  'Cascade du Néant',
  'Déluge du Néant'
] as const
export type WorldMissionType = (typeof WORLD_MISSION_TYPES)[number]

export const WORLD_FACTIONS = ['any', 'grineer', 'corpus', 'infested', 'orokin', 'narmer', 'murmur'] as const
export type WorldFaction = (typeof WORLD_FACTIONS)[number]
export const WORLD_FACTION_LABELS: Readonly<Record<WorldFaction, string>> = {
  any: 'Toutes',
  grineer: 'Grineer',
  corpus: 'Corpus',
  infested: 'Infestés',
  orokin: 'Corrompus (Orokin)',
  narmer: 'Narmer',
  murmur: 'Murmure (Sentients)'
}
/** Fragments de texte (normalisés) reconnus dans les champs faction/ennemi de l'API. */
export const WORLD_FACTION_ALIASES: Readonly<Record<Exclude<WorldFaction, 'any'>, readonly string[]>> = {
  grineer: ['grineer'],
  corpus: ['corpus'],
  infested: ['infest'],
  orokin: ['orokin', 'corrupt', 'corrompu'],
  narmer: ['narmer'],
  murmur: ['murmur', 'sentient']
}

export const INVASION_CATEGORIES = ['catalyst', 'reactor', 'forma', 'exilus', 'weapon-part'] as const
export type InvasionCategory = (typeof INVASION_CATEGORIES)[number]
export const INVASION_CATEGORY_LABELS: Readonly<Record<InvasionCategory, string>> = {
  catalyst: 'Catalyseur Orokin',
  reactor: 'Réacteur Orokin',
  forma: 'Forma',
  exilus: 'Adaptateur Exilus',
  'weapon-part': 'Pièce Wraith / Vandal'
}
export const INVASION_CATEGORY_ALIASES: Readonly<Record<InvasionCategory, readonly string[]>> = {
  catalyst: ['catalyst', 'catalyseur'],
  reactor: ['reactor', 'reacteur'],
  forma: ['forma'],
  exilus: ['exilus'],
  'weapon-part': ['wraith', 'vandal']
}

export const CYCLE_LOCATIONS = ['cetus', 'vallis', 'cambion', 'zariman'] as const
export type CycleLocation = (typeof CYCLE_LOCATIONS)[number]
export const CYCLE_LOCATION_LABELS: Readonly<Record<CycleLocation, string>> = {
  cetus: 'Cetus (Plaines d’Eidolon)',
  vallis: 'Vallée Orbis',
  cambion: 'Puy de Cambion',
  zariman: 'Zariman Ten Zero'
}
export const CYCLE_STATES: Readonly<Record<CycleLocation, readonly { id: string; label: string }[]>> = {
  cetus: [
    { id: 'night', label: 'Nuit' },
    { id: 'day', label: 'Jour' }
  ],
  vallis: [
    { id: 'warm', label: 'Chaud' },
    { id: 'cold', label: 'Froid' }
  ],
  cambion: [
    { id: 'vome', label: 'Vome' },
    { id: 'fass', label: 'Fass' }
  ],
  zariman: [
    { id: 'corpus', label: 'Occupation Corpus' },
    { id: 'grineer', label: 'Occupation Grineer' }
  ]
}

export const BARO_TRIGGERS = ['arrival', 'pre-arrival', 'item'] as const
export type BaroTrigger = (typeof BARO_TRIGGERS)[number]
export const BARO_TRIGGER_LABELS: Readonly<Record<BaroTrigger, string>> = {
  arrival: 'Arrivée',
  'pre-arrival': 'Pré-alerte avant arrivée',
  item: 'Article présent dans l’inventaire'
}

export const ARCHON_BOSSES = ['amar', 'nira', 'boreal'] as const
export type ArchonBoss = (typeof ARCHON_BOSSES)[number]
export const ARCHON_BOSS_LABELS: Readonly<Record<ArchonBoss, string>> = {
  amar: 'Amar (Fragment Écarlate)',
  nira: 'Nira (Fragment Ambre)',
  boreal: 'Boréal (Fragment Azur)'
}

export const BOUNTY_SYNDICATES = ['Ostrons', 'Solaris United', 'Entrati'] as const
export type BountySyndicate = (typeof BOUNTY_SYNDICATES)[number]
export const BOUNTY_SYNDICATE_LABELS: Readonly<Record<BountySyndicate, string>> = {
  Ostrons: 'Ostrons',
  'Solaris United': 'Union Solaris',
  Entrati: 'Entrati'
}

export const NIGHTWAVE_KINDS = ['daily', 'weekly', 'elite'] as const
export type NightwaveKind = (typeof NIGHTWAVE_KINDS)[number]
export const NIGHTWAVE_KIND_LABELS: Readonly<Record<NightwaveKind, string>> = {
  daily: 'Quotidien',
  weekly: 'Hebdomadaire',
  elite: 'Élite'
}

export const WORLD_RULES_MAX = 30
export const WORLD_RULE_TEXT_MAX = 60

