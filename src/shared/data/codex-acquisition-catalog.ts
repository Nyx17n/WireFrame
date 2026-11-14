import type { CodexAcquisitionSource } from '../schemas/codex.schema'

/**
 * Official English -> French Warframe Quest titles used to translate
 * `Cephalon Simaris, Complete <Quest>` and quest-reward equipment.
 */
export const WARFRAME_QUEST_NAMES_FR: Readonly<Record<string, string>> = {
  'Awakening': 'L’Éveil',
  "Vor's Prize": 'Le Trophée de Vor',
  "Saya's Vigil": 'La Veillée de Saya',
  'Vox Solaris': 'Vox Solaris',
  'Vox Solaris (Quest)': 'Vox Solaris',
  'Once Awake': 'Autrefois Éveillés',
  'Heart of Deimos': 'Cœur de Deimos',
  'The Archwing': 'L’Archwing',
  'Stolen Dreams': 'Rêves Volés',
  'The New Strange': 'La Nouvelle Étrange',
  'Natah': 'Natah',
  'The Second Dream': 'Le Second Rêve',
  'The War Within': 'La Guerre Intérieure',
  'Chains of Harrow': 'Le Fardeau de Harrow',
  'Apostasy Prologue': 'Prologue de l’Apostasie',
  'The Sacrifice': 'Le Sacrifice',
  'Chimera Prologue': 'Prologue de la Chimère',
  'Rising Tide': 'Marée Montante',
  'The New War': 'La Nouvelle Guerre',
  'Angels of the Zariman': 'Les Anges du Zariman',
  'Veilbreaker': 'Brise-Voile',
  'The Duviri Paradox': 'Le Paradoxe du Duviri',
  'Whispers in the Walls': 'Murmures dans les Murs',
  'Jade Shadows': 'Ombres de Jade',
  'The Lotus Eaters': 'Les Mangeurs de Lotus',
  'The Hex': 'L’Hexagone (1999)',
  'Hidden Messages': 'Messages Cachés',
  'The Limbo Theorem': 'Le Théorème de Limbo',
  'Patient Zero': 'Patient Zéro',
  'The Jordas Precept': 'Le Précepte de Jordas',
  'Sands of Inaros': 'Les Sables d’Inaros',
  'The Silver Grove': 'Le Bosquet d’Argent',
  'The Glast Gambit': 'Le Stratagème de Glast',
  "Octavia's Anthem": 'L’Hymne d’Octavia',
  'Mask of the Revenant': 'Le Masque du Revenant',
  'The Deadlock Protocol': 'Le Protocole Moribond',
  'Call of the Tempestarii': 'Appel du Tempestarii',
  'The Waverider': 'La Propre des Flots'
}

/**
 * Standard Warframes whose Main Blueprint is purchased for Credits in the in-game Market Console.
 * (Fixes missing Main Blueprint acquisition on Ember, Gauss, Mirage, Excalibur, etc.)
 */
export const WARFRAME_MARKET_BP_CREDITS: Readonly<Record<string, number>> = {
  ash: 35000,
  caliban: 50000,
  ember: 25000,
  equinox: 35000,
  excalibur: 35000,
  frost: 25000,
  gauss: 30000,
  grendel: 35000,
  hydroid: 35000,
  ivara: 35000,
  khora: 35000,
  limbo: 35000,
  loki: 35000,
  mag: 25000,
  mesa: 35000,
  mirage: 35000,
  nekros: 35000,
  nova: 35000,
  nyx: 35000,
  oberon: 30000,
  rhino: 35000,
  saryn: 35000,
  trinity: 25000,
  valkyr: 35000,
  vauban: 35000
}

/**
 * Standard Warframes available in the weekly Normal Duviri Circuit reward path (100% guaranteed).
 */
export const DUVIRI_NORMAL_CIRCUIT_WARFRAMES: ReadonlySet<string> = new Set([
  'ash',
  'atlas',
  'banshee',
  'baruuk',
  'chroma',
  'ember',
  'excalibur',
  'frost',
  'gara',
  'garuda',
  'harrow',
  'hildryn',
  'hydroid',
  'inaros',
  'ivara',
  'khora',
  'limbo',
  'loki',
  'mag',
  'mesa',
  'mirage',
  'nekros',
  'nezha',
  'nidus',
  'nova',
  'nyx',
  'oberon',
  'octavia',
  'protea',
  'revenant',
  'rhino',
  'saryn',
  'titania',
  'trinity',
  'valkyr',
  'vauban',
  'volt',
  'wukong',
  'zephyr'
])

export interface WarframeSpecialRule {
  readonly mainBlueprint?: CodexAcquisitionSource
  readonly allParts?: CodexAcquisitionSource
  readonly fullItem?: CodexAcquisitionSource
}

function makeSource(
  partial: Omit<CodexAcquisitionSource, 'sublabelFr' | 'sublabelEn' | 'costCredits' | 'partNameFr'> & {
    sublabelFr?: string | null
    sublabelEn?: string | null
    costCredits?: number | null
    partNameFr?: string | null
  }
): CodexAcquisitionSource {
  return {
    type: partial.type,
    labelFr: partial.labelFr,
    labelEn: partial.labelEn,
    sublabelFr: partial.sublabelFr ?? null,
    sublabelEn: partial.sublabelEn ?? null,
    chancePct: partial.chancePct,
    isGuaranteed: partial.isGuaranteed,
    costCredits: partial.costCredits ?? null,
    partNameFr: partial.partNameFr ?? null
  }
}

export const WARFRAME_SPECIAL_ACQUISITIONS: Readonly<Record<string, WarframeSpecialRule>> = {
  banshee: {
    allParts: makeSource({
      type: 'dojo',
      labelFr: 'Dojo de Clan — Laboratoire Tenno',
      labelEn: 'Clan Dojo — Tenno Lab',
      sublabelFr: 'Schéma Principal + Neuroptiques + Châssis + Systèmes en Crédits',
      sublabelEn: 'Main Blueprint + Neuroptics + Chassis + Systems for Credits',
      chancePct: 100,
      isGuaranteed: true
    })
  },
  volt: {
    allParts: makeSource({
      type: 'dojo',
      labelFr: 'Dojo de Clan — Laboratoire Tenno',
      labelEn: 'Clan Dojo — Tenno Lab',
      sublabelFr: 'Schéma Principal + Neuroptiques + Châssis + Systèmes en Crédits',
      sublabelEn: 'Main Blueprint + Neuroptics + Chassis + Systems for Credits',
      chancePct: 100,
      isGuaranteed: true
    })
  },
  zephyr: {
    allParts: makeSource({
      type: 'dojo',
      labelFr: 'Dojo de Clan — Laboratoire Tenno',
      labelEn: 'Clan Dojo — Tenno Lab',
      sublabelFr: 'Schéma Principal + Neuroptiques + Châssis + Systèmes en Crédits',
      sublabelEn: 'Main Blueprint + Neuroptics + Chassis + Systems for Credits',
      chancePct: 100,
      isGuaranteed: true
    })
  },
  wukong: {
    allParts: makeSource({
      type: 'dojo',
      labelFr: 'Dojo de Clan — Laboratoire Tenno',
      labelEn: 'Clan Dojo — Tenno Lab',
      sublabelFr: 'Schéma Principal + Neuroptiques + Châssis + Systèmes en Crédits',
      sublabelEn: 'Main Blueprint + Neuroptics + Chassis + Systems for Credits',
      chancePct: 100,
      isGuaranteed: true
    })
  },
  nezha: {
    allParts: makeSource({
      type: 'dojo',
      labelFr: 'Dojo de Clan — Laboratoire Tenno',
      labelEn: 'Clan Dojo — Tenno Lab',
      sublabelFr: 'Schéma Principal + Neuroptiques + Châssis + Systèmes en Crédits',
      sublabelEn: 'Main Blueprint + Neuroptics + Chassis + Systems for Credits',
      chancePct: 100,
      isGuaranteed: true
    })
  },
  dagath: {
    allParts: makeSource({
      type: 'dojo',
      labelFr: 'Dojo de Clan — Antre de Dagath',
      labelEn: "Clan Dojo — Dagath's Hollow",
      sublabelFr: 'Schéma + 3 composants (Épines Vain en Zone Abyssale de Cérès)',
      sublabelEn: 'Blueprint + 3 parts (Vainthorns from Ceres Abyssal Zone)',
      chancePct: 100,
      isGuaranteed: true
    })
  },
  yareli: {
    mainBlueprint: makeSource({
      type: 'quest',
      labelFr: 'Quête : « La Propre des Flots »',
      labelEn: 'Quest: "The Waverider"',
      sublabelFr: 'Rachat disponible auprès du Céphalon Simaris (Relais)',
      sublabelEn: 'Re-purchasable from Cephalon Simaris',
      chancePct: 100,
      isGuaranteed: true
    }),
    allParts: makeSource({
      type: 'dojo',
      labelFr: 'Dojo de Clan — Labo des Orphelins des Conduits (VentKids)',
      labelEn: 'Clan Dojo — VentKids Bash Lab',
      sublabelFr: 'Neuroptiques, Châssis & Systèmes recherchés en Crédits',
      sublabelEn: 'Neuroptics, Chassis & Systems researched for Credits',
      chancePct: 100,
      isGuaranteed: true
    })
  },
  mirage: {
    allParts: makeSource({
      type: 'quest',
      labelFr: 'Quête : « Messages Cachés »',
      labelEn: 'Quest: "Hidden Messages"',
      sublabelFr: 'Neuroptiques (Mars) · Systèmes (Saturne) · Châssis (Sedna) + Rachat Simaris',
      sublabelEn: 'Neuroptics, Systems & Chassis awarded per quest stage + Simaris',
      chancePct: 100,
      isGuaranteed: true
    })
  },
  'excalibur-umbra': {
    fullItem: makeSource({
      type: 'quest',
      labelFr: 'Quête : « Le Sacrifice »',
      labelEn: 'Quest: "The Sacrifice"',
      sublabelFr: 'Warframe complète Rang 30 avec Réacteur Orokin et emplacement gratuits',
      sublabelEn: 'Fully built Rank 30 Warframe with Orokin Reactor and slot',
      chancePct: 100,
      isGuaranteed: true
    })
  },
  grendel: {
    allParts: makeSource({
      type: 'syndicate',
      labelFr: 'Arbitres de Hexis (Arbitrage — 25 Essences Vitus / Localisateur)',
      labelEn: 'Arbitration Honors (25 Vitus Essence per Grendel Locator)',
      sublabelFr: '3 missions garanties sur Europe (Champs de Glace, Mines, Archéologie)',
      sublabelEn: '3 guaranteed no-mod missions on Europa',
      chancePct: 100,
      isGuaranteed: true
    })
  },
  vauban: {
    allParts: makeSource({
      type: 'syndicate',
      labelFr: 'Boutique des Ondes Nocturnes (Nora Night)',
      labelEn: 'Nightwave Cred Offerings (Nora Night)',
      sublabelFr: 'Neuroptiques, Châssis & Systèmes à 25 Jetons par schéma',
      sublabelEn: '25 Nightwave Creds per part blueprint',
      chancePct: 100,
      isGuaranteed: true
    })
  },
  kullervo: {
    allParts: makeSource({
      type: 'duviri',
      labelFr: 'Duviri — Havre de Kullervo (Acrithis)',
      labelEn: "Duviri — Kullervo's Hold (Acrithis)",
      sublabelFr: 'Échangé contre des Fléaux de Kullervo (Spirales Colère, Peur, Chagrin)',
      sublabelEn: "Traded for Kullervo's Bane",
      chancePct: 100,
      isGuaranteed: true
    })
  },
  voidrig: {
    allParts: makeSource({
      type: 'quest',
      labelFr: 'Quête : « Cœur de Deimos » + Syndicat Nécraloide (Loid)',
      labelEn: 'Quest: "Heart of Deimos" + NecraLoid (Loid)',
      sublabelFr: 'Tous les schémas offerts en terminant Cœur de Deimos',
      sublabelEn: 'All blueprints awarded upon completing Heart of Deimos',
      chancePct: 100,
      isGuaranteed: true
    })
  },
  jade: {
    mainBlueprint: makeSource({
      type: 'quest',
      labelFr: 'Quête : « Ombres de Jade » (+ Ordis au Camp du Voyageur)',
      labelEn: 'Quest: "Jade Shadows" (+ Ordis at Drifter Camp)',
      sublabelFr: 'Schéma Principal garanti en fin de quête ou contre Vestiges Granules',
      sublabelEn: 'Guaranteed Main Blueprint from quest or Vestigial Motes',
      chancePct: 100,
      isGuaranteed: true
    })
  },
  qorvex: {
    mainBlueprint: makeSource({
      type: 'quest',
      labelFr: 'Quête : « Murmures dans les Murs » + Syndicat Cavia (Deimos)',
      labelEn: 'Quest: "Whispers in the Walls" + Cavia Syndicate',
      sublabelFr: 'Schéma Principal offert par la quête ou achetable chez Bird 3 (Sanctum)',
      sublabelEn: 'Awarded by quest or purchased from Bird 3',
      chancePct: 100,
      isGuaranteed: true
    })
  },
  'cyte-09': {
    mainBlueprint: makeSource({
      type: 'quest',
      labelFr: 'Quête : « L’Hexagone (1999) » + Amir Beckett (Höllvania)',
      labelEn: 'Quest: "The Hex" + Amir Beckett (Höllvania)',
      sublabelFr: 'Schéma Principal offert en quête ou échangé contre Réputation Hexagone',
      sublabelEn: 'Awarded by quest or Hex Syndicate standing',
      chancePct: 100,
      isGuaranteed: true
    })
  },
  uriel: {
    mainBlueprint: makeSource({
      type: 'syndicate',
      labelFr: 'La Descendia — Roathe (Échange de schémas)',
      labelEn: 'The Descendia — Roathe',
      sublabelFr: 'Échange garanti contre ressources de mission',
      sublabelEn: 'Guaranteed vendor exchange',
      chancePct: 100,
      isGuaranteed: true
    })
  }
}

/**
 * Curated Quest / Special Weapons guaranteed acquisition rules.
 */
export const WEAPON_QUEST_AND_SPECIAL_SOURCES: Readonly<Record<string, CodexAcquisitionSource>> = {
  nataruk: makeSource({
    type: 'quest',
    labelFr: 'Quête : « La Nouvelle Guerre »',
    labelEn: 'Quest: "The New War"',
    sublabelFr: 'Arc livré forgé avec emplacement d’arme et Catalyseur Orokin',
    sublabelEn: 'Delivered built with weapon slot and Orokin Catalyst',
    chancePct: 100,
    isGuaranteed: true
  }),
  sirocco: makeSource({
    type: 'quest',
    labelFr: 'Quête : « La Nouvelle Guerre »',
    labelEn: 'Quest: "The New War"',
    sublabelFr: 'Amplificateur offert en terminant la quête',
    sublabelEn: 'Amp awarded upon quest completion',
    chancePct: 100,
    isGuaranteed: true
  }),
  rumblejack: makeSource({
    type: 'quest',
    labelFr: 'Quête : « La Nouvelle Guerre » (+ Céphalon Simaris)',
    labelEn: 'Quest: "The New War" (+ Cephalon Simaris)',
    sublabelFr: 'Poignard livré forgé avec emplacement et Catalyseur',
    sublabelEn: 'Delivered built with slot and Catalyst',
    chancePct: 100,
    isGuaranteed: true
  }),
  skiajati: makeSource({
    type: 'quest',
    labelFr: 'Quête : « Le Sacrifice »',
    labelEn: 'Quest: "The Sacrifice"',
    sublabelFr: 'Nikana Umbra livré Rang 30 avec Catalyseur et emplacement',
    sublabelEn: 'Delivered Rank 30 with Catalyst and slot',
    chancePct: 100,
    isGuaranteed: true
  }),
  xoris: makeSource({
    type: 'quest',
    labelFr: 'Quête : « Le Protocole Moribond » (+ Céphalon Simaris)',
    labelEn: 'Quest: "The Deadlock Protocol" (+ Cephalon Simaris)',
    sublabelFr: 'Schéma et pièces obtenus gratuitement au cours de la quête',
    sublabelEn: 'Blueprint and parts awarded during the quest',
    chancePct: 100,
    isGuaranteed: true
  }),
  paracesis: makeSource({
    type: 'quest',
    labelFr: 'Quête : « Prologue de la Chimère »',
    labelEn: 'Quest: "Chimera Prologue"',
    sublabelFr: 'Schéma Principal octroyé à la fin du prologue',
    sublabelEn: 'Main Blueprint awarded upon completion',
    chancePct: 100,
    isGuaranteed: true
  }),
  grimoire: makeSource({
    type: 'quest',
    labelFr: 'Quête : « Murmures dans les Murs »',
    labelEn: 'Quest: "Whispers in the Walls"',
    sublabelFr: 'Tome livré forgé avec Catalyseur (+ rachat Sanctum Anatomica)',
    sublabelEn: 'Delivered built with Catalyst',
    chancePct: 100,
    isGuaranteed: true
  }),
  'broken-war': makeSource({
    type: 'quest',
    labelFr: 'Quête : « Le Second Rêve » (100 %) ou Shadow Stalker',
    labelEn: 'Quest: "The Second Dream" (100%) or Shadow Stalker',
    sublabelFr: 'Épée livrée forgée avec Catalyseur en fin de quête',
    sublabelEn: 'Delivered built with Catalyst upon completing The Second Dream',
    chancePct: 100,
    isGuaranteed: true
  }),
  'broken-scepter': makeSource({
    type: 'quest',
    labelFr: 'Quête : « La Guerre Intérieure » (+ Céphalon Simaris)',
    labelEn: 'Quest: "The War Within" (+ Cephalon Simaris)',
    sublabelFr: 'Sceptre livré forgé avec Catalyseur en fin de quête',
    sublabelEn: 'Delivered built with Catalyst',
    chancePct: 100,
    isGuaranteed: true
  }),
  orvius: makeSource({
    type: 'quest',
    labelFr: 'Quête : « La Guerre Intérieure » (+ Céphalon Simaris)',
    labelEn: 'Quest: "The War Within" (+ Cephalon Simaris)',
    sublabelFr: 'Schéma offert en fin de quête ; pièces sur Gardiens Kuva',
    sublabelEn: 'Blueprint from quest; parts from Kuva Guardians',
    chancePct: 100,
    isGuaranteed: true
  }),
  'sun-moon': makeSource({
    type: 'quest',
    labelFr: 'Quête : « Le Paradoxe du Duviri »',
    labelEn: 'Quest: "The Duviri Paradox"',
    sublabelFr: 'Schéma Principal offert en terminant la quête',
    sublabelEn: 'Main Blueprint awarded upon completing the quest',
    chancePct: 100,
    isGuaranteed: true
  }),
  'ignis-wraith': makeSource({
    type: 'dojo',
    labelFr: 'Dojo de Clan — Laboratoire Chimique (Rang Clan 10) ou Railjack',
    labelEn: 'Clan Dojo — Chem Lab (Clan Rank 10) or Railjack',
    sublabelFr: 'Schéma Principal recherché en Crédits dans le Dojo',
    sublabelEn: 'Main Blueprint researched for Credits in Clan Dojo',
    chancePct: 100,
    isGuaranteed: true
  }),
  'opticor-vandal': makeSource({
    type: 'event',
    labelFr: 'Événement récurrent : Crevasses Thermia (Vallée d’Orbis — 100 pts)',
    labelEn: 'Recurring Event: Thermia Fractures (Orb Vallis — 100 pts)',
    sublabelFr: 'Arme livrée forgée avec emplacement et Catalyseur Orokin',
    sublabelEn: 'Delivered built with weapon slot and Catalyst',
    chancePct: 100,
    isGuaranteed: true
  }),
  dorrclave: makeSource({
    type: 'dojo',
    labelFr: 'Dojo de Clan — Antre de Dagath',
    labelEn: "Clan Dojo — Dagath's Hollow",
    sublabelFr: 'Schéma + composants contre Épines Vain',
    sublabelEn: 'Blueprint + parts for Vainthorns',
    chancePct: 100,
    isGuaranteed: true
  }),
  rauta: makeSource({
    type: 'duviri',
    labelFr: 'Duviri — Havre de Kullervo (Acrithis)',
    labelEn: "Duviri — Kullervo's Hold (Acrithis)",
    sublabelFr: 'Échangé contre des Fléaux de Kullervo',
    sublabelEn: "Traded for Kullervo's Bane",
    chancePct: 100,
    isGuaranteed: true
  }),
  cinta: makeSource({
    type: 'duviri',
    labelFr: 'Duviri — Énigmes Enigma (Hiboux de Duviri)',
    labelEn: 'Duviri — Enigma Gyrum Puzzles',
    sublabelFr: 'Schémas obtenus en résolvant les énigmes d’Architis à Duviri',
    sublabelEn: 'Blueprints drop from Duviri Enigma puzzles',
    chancePct: 100,
    isGuaranteed: false
  }),
  'kuva-ghoulsaw': makeSource({
    type: 'dojo',
    labelFr: 'Dojo de Clan — Labo des Orphelins des Conduits (VentKids)',
    labelEn: 'Clan Dojo — VentKids Bash Lab',
    sublabelFr: 'Schéma + 4 composants recherchés en Crédits',
    sublabelEn: 'Blueprint + 4 parts researched for Credits',
    chancePct: 100,
    isGuaranteed: true
  })
}

export const TENET_HOLOKEY_MELEE_IDS: ReadonlySet<string> = new Set([
  'tenet-agendus',
  'tenet-exec',
  'tenet-ferrox',
  'tenet-grigori',
  'tenet-livia'
])

export const INVASION_WEAPON_IDS: ReadonlySet<string> = new Set([
  'dera-vandal',
  'karak-wraith',
  'latron-wraith',
  'sheev',
  'snipetron-vandal',
  'strun-wraith',
  'twin-vipers-wraith'
])

export const HEX_1999_WEAPON_IDS: ReadonlySet<string> = new Set([
  'efv-5-jupiter',
  'efv-8-mars',
  'dual-viciss',
  'purgator-1'
])

export const DOJO_WEAPON_LAB_BY_ID: Readonly<Record<string, string>> = {
  'dual-cestra': 'Laboratoire d’Énergie',
  'twin-krohkur': 'Laboratoire Chimique',
  'amx-arca-plasmor': 'Laboratoire d’Énergie',
  'arca-plasmor': 'Laboratoire d’Énergie',
  'lenz': 'Laboratoire d’Énergie',
  'opticor': 'Laboratoire d’Énergie',
  'lanka': 'Laboratoire d’Énergie',
  'supra': 'Laboratoire d’Énergie',
  'falcor': 'Laboratoire d’Énergie',
  'jat-kittag': 'Laboratoire Chimique',
  'ignis': 'Laboratoire Chimique',
  'kohmak': 'Laboratoire Chimique',
  'grinlok': 'Laboratoire Chimique',
  'marelok': 'Laboratoire Chimique',
  'torid': 'Laboratoire Biologique',
  'lesion': 'Laboratoire Biologique',
  'bubonico': 'Laboratoire Biologique',
  'cerata': 'Laboratoire Biologique',
  'dual-ichor': 'Laboratoire Biologique',
  'hema': 'Laboratoire Biologique',
  'synapse': 'Laboratoire Biologique',
  'guandao': 'Laboratoire Tenno',
  'cassowar': 'Laboratoire Tenno',
  'nikana': 'Laboratoire Tenno',
  'venka': 'Laboratoire Tenno',
  'sybaris': 'Laboratoire Tenno',
  'baza': 'Laboratoire Tenno',
  'daikyu': 'Laboratoire Tenno',
  'kompressa': 'Syndicat Orphelins des Conduits (VentKids — Fortuna)'
}

