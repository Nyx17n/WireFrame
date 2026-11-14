import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Génère `resources/codex-mobs-vendors.json` en croisant :
 * 1. WFCD/warframe-items (Enemy.json — ~638 ennemis, stats, regionBits, icônes, résistances)
 * 2. calamity-inc/warframe-public-export-plus (ExportEnemies, ExportRegions, ExportVendors, ExportSyndicates,
 *    ExportResources, ExportRecipes, ExportUpgrades, ExportWarframes, ExportWeapons, ExportArcanes, ExportRelics,
 *    ExportCustoms, ExportFlavour, ExportGear, ExportBoosterPacks, ExportKeys, ExportSentinels, dict.fr.json, dict.en.json)
 * 3. WFCD/warframe-drop-data (enemyModTables, enemyBlueprintTables, resourceByAvatar, additionalItemByAvatar, missionRewards)
 * 4. L'index local `resources/codex-db.json` pour lier chaque drop / offre vendue aux fiches Codex & Warframe Market.
 */

const BASE_EXPORT_URL =
  'https://raw.githubusercontent.com/calamity-inc/warframe-public-export-plus/senpai'
const WFCD_ENEMY_URL =
  'https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Enemy.json'
const WFCD_DROPS_BASE =
  'https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data'

function norm(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(value) {
  return norm(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function cleanText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\|[A-Z0-9_]+\|/gi, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

async function fetchJsonUrl(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`)
  return res.json()
}

// Curated Boss Assassination Nodes (FR/EN + exact node key in missionRewards for Warframe part drops)
const BOSS_LOCATIONS = [
  {
    match: 'captain vor',
    exclude: 'corrupted',
    planetFr: 'Mercure',
    planetEn: 'Mercury',
    locationFr: 'Mercure — Tolstoj (Assassinat)',
    locationEn: 'Mercury — Tolstoj (Assassination)',
    conditionFr: 'Boss de fin de planète garanti',
    missionKey: ['Mercury', 'Tolstoj']
  },
  {
    match: 'corrupted vor',
    planetFr: 'Néant',
    planetEn: 'Void',
    locationFr: 'Néant — Mot / Aten / Marduk / Mithra (Branche T4)',
    locationEn: 'Void — Mot / Aten / Marduk / Mithra (T4 Branch)',
    conditionFr: 'Apparaît après quelques minutes dans les missions T4 du Néant'
  },
  {
    match: 'jackal',
    exclude: 'terra',
    planetFr: 'Vénus',
    planetEn: 'Venus',
    locationFr: 'Vénus — Fossa (Assassinat) & Circuit Duviri',
    locationEn: 'Venus — Fossa (Assassination) & Duviri Undercroft',
    conditionFr: 'Boss garanti (lâche les pièces de Rhino & Stahlta)',
    missionKey: ['Venus', 'Fossa']
  },
  {
    match: 'vay hek',
    planetFr: 'Terre',
    planetEn: 'Earth',
    locationFr: 'Terre — Oro (Assassinat · Palier de Maîtrise 5+)',
    locationEn: 'Earth — Oro (Assassination · MR 5+)',
    conditionFr: 'Boss garanti (lâche les pièces d’Hydroid)',
    missionKey: ['Earth', 'Oro']
  },
  {
    match: 'lech kril',
    planetFr: 'Mars',
    planetEn: 'Mars',
    locationFr: 'Mars — War (Assassinat) & Cérès — Exta',
    locationEn: 'Mars — War (Assassination) & Ceres — Exta',
    conditionFr: 'Boss garanti (Excalibur sur Mars / Frost & Miter sur Cérès)',
    missionKey: ['Mars', 'War']
  },
  {
    match: 'the sergeant',
    planetFr: 'Phobos',
    planetEn: 'Phobos',
    locationFr: 'Phobos — Iliad (Assassinat)',
    locationEn: 'Phobos — Iliad (Assassination)',
    conditionFr: 'Boss garanti (lâche les pièces de Mag)',
    missionKey: ['Phobos', 'Iliad']
  },
  {
    match: 'alad v',
    exclude: 'mutalist',
    planetFr: 'Jupiter',
    planetEn: 'Jupiter',
    locationFr: 'Jupiter — Themisto (Assassinat)',
    locationEn: 'Jupiter — Themisto (Assassination)',
    conditionFr: 'Boss garanti + Capteurs Neuronaux (pièces de Valkyr)',
    missionKey: ['Jupiter', 'Themisto']
  },
  {
    match: 'mutalist alad v',
    planetFr: 'Éris',
    planetEn: 'Eris',
    locationFr: 'Éris — Assassinat Alad V Mutaliste (Clé requise)',
    locationEn: 'Eris — Mutalist Alad V Assassinate',
    conditionFr: 'Nécessite une Clé Assassinat Alad V Mutaliste (pièces de Mesa)',
    missionKey: ['Eris', 'Mutalist Alad V Assassinate']
  },
  {
    match: 'ropalolyst',
    planetFr: 'Jupiter',
    planetEn: 'Jupiter',
    locationFr: 'Jupiter — Le Ropalolyste (Assassinat · Post-Chimère)',
    locationEn: 'Jupiter — The Ropalolyst (Assassination)',
    conditionFr: 'Boss Sentient garanti (pièces de Wisp & Mods Amalgame)',
    missionKey: ['Jupiter', 'The Ropalolyst']
  },
  {
    match: 'raptor',
    planetFr: 'Europe',
    planetEn: 'Europa',
    locationFr: 'Europe — Naamah (Assassinat)',
    locationEn: 'Europa — Naamah (Assassination)',
    conditionFr: 'Boss garanti (lâche les pièces de Nova)',
    missionKey: ['Europa', 'Naamah']
  },
  {
    match: 'sargas ruk',
    planetFr: 'Saturne',
    planetEn: 'Saturn',
    locationFr: 'Saturne — Tethys (Assassinat)',
    locationEn: 'Saturn — Tethys (Assassination)',
    conditionFr: 'Boss garanti (pièces d’Ember & Cellule Orokin)',
    missionKey: ['Saturn', 'Tethys']
  },
  {
    match: 'tyl regor',
    planetFr: 'Uranus',
    planetEn: 'Uranus',
    locationFr: 'Uranus — Titania (Assassinat)',
    locationEn: 'Uranus — Titania (Assassination)',
    conditionFr: 'Boss garanti (8 schémas des Aspects Jour & Nuit d’Equinox)',
    missionKey: ['Uranus', 'Titania']
  },
  {
    match: 'hyena',
    planetFr: 'Neptune',
    planetEn: 'Neptune',
    locationFr: 'Neptune — Psamathe (Assassinat Meute Hyena)',
    locationEn: 'Neptune — Psamathe (Assassination)',
    conditionFr: 'Boss garanti (lâche les pièces de Loki)',
    missionKey: ['Neptune', 'Psamathe']
  },
  {
    match: 'ambulas',
    planetFr: 'Pluton',
    planetEn: 'Pluto',
    locationFr: 'Pluton — Hades (Assassinat · Balises Animo)',
    locationEn: 'Pluto — Hades (Assassination)',
    conditionFr: 'Boss garanti (lâche les pièces de Trinity)',
    missionKey: ['Pluto', 'Hades']
  },
  {
    match: 'kela de thaym',
    planetFr: 'Sedna',
    planetEn: 'Sedna',
    locationFr: 'Sedna — Merrow (Assassinat · Points de Jugement)',
    locationEn: 'Sedna — Merrow (Assassination)',
    conditionFr: 'Boss garanti (pièces de Saryn, Twin Kohmak & Mods Medi-Ray)',
    missionKey: ['Sedna', 'Merrow']
  },
  {
    match: 'lephantis',
    planetFr: 'Deimos',
    planetEn: 'Deimos',
    locationFr: 'Deimos — Magnacidium (Assassinat)',
    locationEn: 'Deimos — Magnacidium (Assassination)',
    conditionFr: 'Boss Infesté à 3 têtes garanti (pièces de Nekros)',
    missionKey: ['Deimos', 'Magnacidium']
  },
  {
    match: 'zeloid prelate',
    planetFr: 'Deimos',
    planetEn: 'Deimos',
    locationFr: 'Deimos — Exequias (Assassinat)',
    locationEn: 'Deimos — Exequias (Assassination)',
    conditionFr: 'Boss garanti (Schéma et composants de Pathocyst)',
    missionKey: ['Deimos', 'Exequias']
  },
  {
    match: 'jordas golem',
    planetFr: 'Éris',
    planetEn: 'Eris',
    locationFr: 'Éris — Assassinat Golem Jordas (Archwing)',
    locationEn: 'Eris — Jordas Golem Assassinate',
    conditionFr: 'Boss Archwing post-quête Le Précepte de Jordas (pièces d’Atlas)',
    missionKey: ['Eris', 'Jordas Golem Assassinate']
  },
  {
    match: 'teralyst',
    planetFr: 'Terre',
    planetEn: 'Earth',
    locationFr: 'Terre — Plaines d’Eidolon (Cycle Nuit uniquement)',
    locationEn: 'Earth — Plains of Eidolon (Night cycle)',
    conditionFr: 'Apparition garantie de nuit sur les Plaines (Éclats d’Eidolon & Arcanes)'
  },
  {
    match: 'gantulyst',
    planetFr: 'Terre',
    planetEn: 'Earth',
    locationFr: 'Terre — Plaines d’Eidolon (Autel Île · Cycle Nuit)',
    locationEn: 'Earth — Plains of Eidolon (Shrine · Night)',
    conditionFr: 'Invoqué avec un Éclat Brillant après capture du Teralyst'
  },
  {
    match: 'hydrolyst',
    planetFr: 'Terre',
    planetEn: 'Earth',
    locationFr: 'Terre — Plaines d’Eidolon (Autel Île · Cycle Nuit)',
    locationEn: 'Earth — Plains of Eidolon (Shrine · Night)',
    conditionFr: 'Invoqué avec un Éclat Rayonnant après capture du Gantulyst'
  },
  {
    match: 'profit-taker',
    planetFr: 'Vénus',
    planetEn: 'Venus',
    locationFr: 'Vénus — Vallée Orbis (Mise à prix Preneur de Profit · Rang 5 Solaris)',
    locationEn: 'Venus — Orb Vallis (Profit-Taker Heist)',
    conditionFr: 'Boss garanti en Phase 4 (Toride Crisma, Crédits ×125 000, Obligations)'
  },
  {
    match: 'exploiter orb',
    planetFr: 'Vénus',
    planetEn: 'Venus',
    locationFr: 'Vénus — Vallée Orbis / Pont 12 (Thermia Diluée)',
    locationEn: 'Venus — Orb Vallis / Deck 12 (Diluted Thermia)',
    conditionFr: 'Boss garanti avec 1 Thermia Diluée (pièces d’Hildryn & Toride Lazulite)'
  },
  {
    match: 'fragmented',
    planetFr: 'Deimos',
    planetEn: 'Deimos',
    locationFr: 'Deimos — Effervo (Laboratoires d’Albrecht · Assassinat)',
    locationEn: 'Deimos — Effervo (Albrecht’s Laboratories)',
    conditionFr: 'Boss du Murmure garanti après collecte des Yeux Murmure'
  },
  {
    match: 'h-09',
    planetFr: 'Höllvanie',
    planetEn: 'Höllvania',
    locationFr: 'Höllvanie (1999) — Victory Plaza (Assassinat Char Efervon)',
    locationEn: 'Höllvania (1999) — Victory Plaza (Assassination)',
    conditionFr: 'Boss garanti en mission Assassinat 1999'
  }
]

const FACTION_META = {
  grineer: {
    id: 'grineer',
    fr: 'Grineer',
    en: 'Grineer',
    weaknessesFr: ['Impact +50 %', 'Corrosif +50 %'],
    resistancesFr: []
  },
  kuva: {
    id: 'grineer',
    fr: 'Grineer Kuva',
    en: 'Kuva Grineer',
    weaknessesFr: ['Impact +50 %', 'Chaleur +50 %'],
    resistancesFr: ['Tranchant -50 %']
  },
  corpus: {
    id: 'corpus',
    fr: 'Corpus',
    en: 'Corpus',
    weaknessesFr: ['Perforation +50 %', 'Magnétique +50 %'],
    resistancesFr: []
  },
  amalgam: {
    id: 'corpus',
    fr: 'Corpus Amalgame',
    en: 'Corpus Amalgam',
    weaknessesFr: ['Électrique +50 %', 'Magnétique +50 %'],
    resistancesFr: ['Explosion -50 %']
  },
  infested: {
    id: 'infested',
    fr: 'Infestés',
    en: 'Infested',
    weaknessesFr: ['Tranchant +50 %', 'Chaleur +50 %'],
    resistancesFr: []
  },
  deimos: {
    id: 'infested',
    fr: 'Infestés Deimos',
    en: 'Deimos Infested',
    weaknessesFr: ['Explosion +50 %', 'Gaz +50 %'],
    resistancesFr: ['Viral -50 %']
  },
  orokin: {
    id: 'orokin',
    fr: 'Orokin / Corrompus',
    en: 'Orokin / Corrupted',
    weaknessesFr: ['Perforation +50 %', 'Viral +50 %'],
    resistancesFr: ['Radiation -50 %']
  },
  sentient: {
    id: 'sentient',
    fr: 'Sentients',
    en: 'Sentient',
    weaknessesFr: ['Froid +50 %', 'Radiation +50 %'],
    resistancesFr: ['Corrosif -50 %']
  },
  narmer: {
    id: 'narmer',
    fr: 'Narmer',
    en: 'Narmer',
    weaknessesFr: ['Tranchant +50 %', 'Poison +50 %'],
    resistancesFr: ['Magnétique -50 %']
  },
  murmur: {
    id: 'murmur',
    fr: 'Le Murmure',
    en: 'The Murmur',
    weaknessesFr: ['Électrique +50 %', 'Radiation +50 %'],
    resistancesFr: ['Viral -50 %']
  },
  duviri: {
    id: 'duviri',
    fr: 'Duviri / Dax',
    en: 'Duviri',
    weaknessesFr: ['Néant +50 %', 'Viral +25 %'],
    resistancesFr: []
  },
  scaldra: {
    id: 'scaldra',
    fr: 'Scaldra (1999)',
    en: 'Scaldra',
    weaknessesFr: ['Impact +50 %', 'Corrosif +50 %'],
    resistancesFr: ['Gaz -50 %']
  },
  techrot: {
    id: 'techrot',
    fr: 'Techrot (1999)',
    en: 'Techrot',
    weaknessesFr: ['Gaz +50 %', 'Magnétique +50 %'],
    resistancesFr: ['Froid -50 %']
  },
  stalker: {
    id: 'stalker',
    fr: 'Stalker & Acolytes',
    en: 'Stalker & Acolytes',
    weaknessesFr: ['Radiation +25 %', 'Viral +25 %'],
    resistancesFr: ['Adaptation aux capacités']
  },
  other: {
    id: 'other',
    fr: 'Neutre / Spécial',
    en: 'Neutral / Special',
    weaknessesFr: ['Viral +25 %'],
    resistancesFr: []
  }
}

function resolveFaction(rawType, uniqueName, enName) {
  const s = `${rawType} ${uniqueName} ${enName}`.toLowerCase()
  if (s.includes('scaldra')) return FACTION_META.scaldra
  if (s.includes('techrot') || s.includes('infested1999')) return FACTION_META.techrot
  if (s.includes('murmur') || s.includes('entratilab') || s.includes('anatomizer') || s.includes('necramech') && s.includes('rogue')) {
    return FACTION_META.murmur
  }
  if (s.includes('narmer')) return FACTION_META.narmer
  if (s.includes('duviri') || s.includes('dax') || s.includes('orowyrm')) return FACTION_META.duviri
  if (s.includes('stalker') || s.includes('acolyte')) return FACTION_META.stalker
  if (s.includes('sentient') || s.includes('eidolon') || s.includes('battalyst') || s.includes('conculyst') || s.includes('brachiolyst') || s.includes('symbilyst') || s.includes('vomvalyst') || s.includes('aerolyst') || s.includes('ropalolyst') || s.includes('archon')) {
    return FACTION_META.sentient
  }
  if (s.includes('orokin') || s.includes('corrupted')) return FACTION_META.orokin
  if (s.includes('kuva')) return FACTION_META.kuva
  if (s.includes('amalgam')) return FACTION_META.amalgam
  if (s.includes('deimos') || s.includes('carnis') || s.includes('saxum') || s.includes('jugulus')) {
    return FACTION_META.deimos
  }
  if (s.includes('grineer')) return FACTION_META.grineer
  if (s.includes('corpus')) return FACTION_META.corpus
  if (s.includes('infest')) return FACTION_META.infested
  return FACTION_META.other
}

function classifyUnitTier(uniqueName, enName, health, isBossCurated) {
  const s = `${uniqueName} ${enName}`.toLowerCase()
  if (
    isBossCurated ||
    s.includes('boss') ||
    s.includes('acolyte') ||
    s.includes('stalker') ||
    s.includes('zanuka hunter') ||
    s.includes('harvester') ||
    s.includes('grustrag') ||
    s.includes('ustrag') ||
    s.includes('wolf of saturn') ||
    s.includes('archon ') ||
    s.includes('eidolon ') ||
    s.includes('profit-taker') ||
    s.includes('exploiter orb') ||
    s.includes('orowyrm') ||
    s.includes('fragmented') ||
    s.includes('lich') ||
    s.includes('sister of parvos')
  ) {
    return 'boss'
  }
  if (
    s.includes('eximus') ||
    s.includes('heavy') ||
    s.includes('bombard') ||
    s.includes('napalm') ||
    s.includes('nox') ||
    s.includes('manic') ||
    s.includes('bursa') ||
    s.includes('nullifier') ||
    s.includes('comba') ||
    s.includes('scrambus') ||
    s.includes('juggernaut') ||
    s.includes('ancient') ||
    s.includes('thrax') ||
    s.includes('demolyst') ||
    s.includes('demolisher') ||
    s.includes('warden') ||
    s.includes('dedicant') ||
    s.includes('babau') ||
    s.includes('screamer') ||
    s.includes('necramech') ||
    s.includes('guardian') ||
    health >= 650
  ) {
    return 'eximus'
  }
  return 'standard'
}

// Curated Real In-Game Vendors & Syndicates Directory
const CURATED_VENDORS = [
  // === RELAIS TENNO & BAZAR DE MAROO ===
  {
    id: 'vendor-baro-kiteer',
    nameFr: "Baro Ki'Teer (Marchand du Néant)",
    nameEn: "Baro Ki'Teer (Void Trader)",
    roleFr: 'Mods Accrus (Primed), Armes Prisma & Reliques exclusives',
    roleEn: 'Primed Mods, Prisma Weapons & Exclusive Relics',
    hubGroup: 'relays',
    planetFr: 'Relais Tenno (Rotation toutes les 2 semaines)',
    planetEn: 'Tenno Relay (Bi-weekly rotation)',
    hubFr: 'Relais Larunda / Kronia / Orcus / Strata (Concourse central)',
    hubEn: 'Tenno Relay Concourse',
    zoneFr: 'Hall central du Relais annoncé sur la Carte Céleste (Vendredi 14h → Dimanche 14h)',
    unlockQuestFr: 'Aucun (Relais accessible selon le Palier de Maîtrise ; Relais TennoCon avec billet)',
    currencies: [
      { nameFr: 'Ducats Orokin', howToGetFr: 'Échangez vos pièces Prime aux Kiosques à Ducats des Relais' },
      { nameFr: 'Crédits', howToGetFr: 'Index (Neptune), Preneur de Profit ou Coffres Techrot 1999' }
    ],
    manifests: [],
    syndicates: [],
    curatedItems: [
      { nameEn: 'Primed Continuity', cat: 'mod_arcane', costs: [{ amount: 350, currencyFr: 'Ducats' }, { amount: 100000, currencyFr: 'Crédits' }] },
      { nameEn: 'Primed Flow', cat: 'mod_arcane', costs: [{ amount: 350, currencyFr: 'Ducats' }, { amount: 110000, currencyFr: 'Crédits' }] },
      { nameEn: 'Primed Ravage', cat: 'mod_arcane', costs: [{ amount: 280, currencyFr: 'Ducats' }, { amount: 100000, currencyFr: 'Crédits' }] },
      { nameEn: 'Primed Target Cracker', cat: 'mod_arcane', costs: [{ amount: 400, currencyFr: 'Ducats' }, { amount: 150000, currencyFr: 'Crédits' }] },
      { nameEn: 'Primed Pistol Gambit', cat: 'mod_arcane', costs: [{ amount: 400, currencyFr: 'Ducats' }, { amount: 220000, currencyFr: 'Crédits' }] },
      { nameEn: 'Primed Heated Charge', cat: 'mod_arcane', costs: [{ amount: 350, currencyFr: 'Ducats' }, { amount: 175000, currencyFr: 'Crédits' }] },
      { nameEn: 'Primed Fever Strike', cat: 'mod_arcane', costs: [{ amount: 350, currencyFr: 'Ducats' }, { amount: 200000, currencyFr: 'Crédits' }] },
      { nameEn: 'Primed Point Blank', cat: 'mod_arcane', costs: [{ amount: 300, currencyFr: 'Ducats' }, { amount: 110000, currencyFr: 'Crédits' }] },
      { nameEn: 'Primed Reach', cat: 'mod_arcane', costs: [{ amount: 300, currencyFr: 'Ducats' }, { amount: 220000, currencyFr: 'Crédits' }] },
      { nameEn: 'Primed Pressure Point', cat: 'mod_arcane', costs: [{ amount: 385, currencyFr: 'Ducats' }, { amount: 300000, currencyFr: 'Crédits' }] },
      { nameEn: 'Jolt', cat: 'mod_arcane', costs: [{ amount: 300, currencyFr: 'Ducats' }, { amount: 150000, currencyFr: 'Crédits' }] },
      { nameEn: 'Voltaic Strike', cat: 'mod_arcane', costs: [{ amount: 300, currencyFr: 'Ducats' }, { amount: 150000, currencyFr: 'Crédits' }] },
      { nameEn: 'High Voltage', cat: 'mod_arcane', costs: [{ amount: 300, currencyFr: 'Ducats' }, { amount: 150000, currencyFr: 'Crédits' }] },
      { nameEn: 'Shell Shock', cat: 'mod_arcane', costs: [{ amount: 300, currencyFr: 'Ducats' }, { amount: 150000, currencyFr: 'Crédits' }] },
      { nameEn: 'Ignis Wraith', cat: 'equipment', costs: [{ amount: 550, currencyFr: 'Ducats' }, { amount: 250000, currencyFr: 'Crédits' }] },
      { nameEn: 'Prisma Skana', cat: 'equipment', costs: [{ amount: 510, currencyFr: 'Ducats' }, { amount: 175000, currencyFr: 'Crédits' }] },
      { nameEn: 'Supra Vandal', cat: 'equipment', costs: [{ amount: 500, currencyFr: 'Ducats' }, { amount: 275000, currencyFr: 'Crédits' }] },
      { nameEn: 'Vastilok', cat: 'equipment', costs: [{ amount: 550, currencyFr: 'Ducats' }, { amount: 325000, currencyFr: 'Crédits' }] },
      { nameEn: 'Sands Of Inaros', nameFr: 'Quête : Les Sables d’Inaros (Schéma)', cat: 'equipment', costs: [{ amount: 100, currencyFr: 'Ducats' }, { amount: 25000, currencyFr: 'Crédits' }] },
      { nameEn: 'Surplus du Néant (Coffre Baro)', nameFr: 'Surplus du Néant (1 par visite)', cat: 'resource_relic', costs: [{ amount: 50000, currencyFr: 'Crédits' }] }
    ]
  },
  {
    id: 'vendor-varzia',
    nameFr: 'Varzia Dax (Résurgence Prime)',
    nameEn: 'Varzia (Prime Resurgence)',
    roleFr: 'Reliques de la Soute Prime (Vault), Warframes Prime & Cosmétiques Regal Aya',
    roleEn: 'Vaulted Prime Relics, Prime Warframes & Regal Aya Accessories',
    hubGroup: 'relays',
    planetFr: 'Mars (et Console Marché Orbiteur)',
    planetEn: 'Mars (and Orbiter Market)',
    hubFr: 'Bazar de Maroo',
    hubEn: "Maroo's Bazaar",
    zoneFr: 'Aile gauche du Bazar de Maroo (ou onglet Résurgence Prime directement depuis l’Orbiteur)',
    unlockQuestFr: 'Aucun prérequis',
    currencies: [
      { nameFr: 'Aya', howToGetFr: 'Mises à prix des mondes ouverts (Cetus, Fortuna, Deimos, Zariman) & Packs de Reliques' },
      { nameFr: 'Aya Raffiné (Regal Aya)', howToGetFr: 'Devise premium officielle Warframe' }
    ],
    manifests: [],
    syndicates: [],
    curatedItems: [
      { nameEn: 'Vaulted Lith / Meso / Neo / Axi Relic', nameFr: 'Reliques Prime en rotation Résurgence (2 Warframes Prime / mois)', cat: 'resource_relic', costs: [{ amount: 1, currencyFr: 'Aya' }] },
      { nameEn: ' Void Traces (×5)', nameFr: 'Vestiges du Néant (×5)', cat: 'resource_relic', costs: [{ amount: 1, currencyFr: 'Aya' }] },
      { nameEn: 'Ducats Orokin (×100)', nameFr: 'Pack de 100 Ducats Orokin', cat: 'resource_relic', costs: [{ amount: 1, currencyFr: 'Aya' }] },
      { nameEn: 'Burston Prime', cat: 'equipment', costs: [{ amount: 2, currencyFr: 'Aya Raffiné' }] },
      { nameEn: 'Braton Prime', cat: 'equipment', costs: [{ amount: 2, currencyFr: 'Aya Raffiné' }] },
      { nameEn: 'Fang Prime', cat: 'equipment', costs: [{ amount: 2, currencyFr: 'Aya Raffiné' }] },
      { nameEn: 'Lex Prime', cat: 'equipment', costs: [{ amount: 2, currencyFr: 'Aya Raffiné' }] },
      { nameEn: 'Filigree Prime Decoration', nameFr: 'Décoration Orbiteur Filigrane Prime', cat: 'cosmetic_misc', costs: [{ amount: 10, currencyFr: 'Aya' }] }
    ]
  },
  {
    id: 'vendor-teshin',
    nameFr: 'Teshin (Honneurs de la Route de l’Acier & Conclave)',
    nameEn: 'Teshin (Steel Path Honors & Conclave)',
    roleFr: 'Adaptateurs d’Arcane, Kuva, Forma Umbra, Reliques & Mods Conclave',
    roleEn: 'Arcane Adapters, Kuva, Umbra Forma, Relics & Conclave Mods',
    hubGroup: 'relays',
    planetFr: 'Tout Relais Tenno',
    planetEn: 'Any Tenno Relay',
    hubFr: 'Relais Tenno — Salle du Conclave',
    hubEn: 'Tenno Relay — Conclave Room',
    zoneFr: 'Voyage rapide : Menu Échap → Voyager vers → Teshin',
    unlockQuestFr: 'Tous les nœuds de la Carte Céleste terminés pour débloquer les Honneurs de la Route de l’Acier',
    currencies: [
      { nameFr: 'Essence d’Acier', howToGetFr: 'Acolytes en mission Route de l’Acier (×2) et Incursions quotidiennes (×5)' },
      { nameFr: 'Réputation Conclave', howToGetFr: 'Matchs JcJ du Conclave' }
    ],
    manifests: ['/Lotus/Types/Game/VendorManifests/Hubs/TeshinHardModeVendorManifest'],
    syndicates: ['ConclaveSyndicate']
  },
  {
    id: 'vendor-arbitration-hexis',
    nameFr: 'Officier d’Arbitrage (Boutique Essence Vitus)',
    nameEn: 'Arbitration Honors Vendor',
    roleFr: 'Mods Galvanisés, Adaptation, Grendel (Localisateurs), Kuva & Ayatan',
    roleEn: 'Galvanized Mods, Adaptation, Grendel Locators, Kuva & Ayatan',
    hubGroup: 'relays',
    planetFr: 'Tout Relais Tenno',
    planetEn: 'Any Tenno Relay',
    hubFr: 'Relais Tenno — Salle des Arbitres de Hexis',
    hubEn: 'Tenno Relay — Arbiters of Hexis Enclave',
    zoneFr: 'À gauche en entrant dans l’enclave des Arbitres de Hexis',
    unlockQuestFr: 'Carte Céleste standard complétée (débloque les Alertes d’Arbitrage)',
    currencies: [
      { nameFr: 'Essence Vitus', howToGetFr: 'Drones d’Arbitrage & Récompenses de rotation en mission d’Arbitrage' }
    ],
    manifests: ['/Lotus/Types/Game/VendorManifests/Hubs/EliteAlertVendorManifest'],
    syndicates: []
  },
  {
    id: 'vendor-cephalon-simaris',
    nameFr: 'Céphalon Simaris (Sanctuaire)',
    nameEn: 'Cephalon Simaris',
    roleFr: 'Schémas de Quêtes rejouables, Mods Conversion, Compagnons, Simulacre & Exilus',
    roleEn: 'Quest Blueprints, Conversion Mods, Simulacrum Key & Companion Mods',
    hubGroup: 'relays',
    planetFr: 'Tout Relais Tenno',
    planetEn: 'Any Tenno Relay',
    hubFr: 'Relais Tenno — Étage supérieur (Sanctuaire)',
    hubEn: 'Tenno Relay — Sanctuary',
    zoneFr: 'Voyage rapide : Menu Échap → Céphalon Simaris (2e étage du Relais)',
    unlockQuestFr: 'Quête « La Nouvelle Étrange » pour débloquer toutes les cibles de synthèse',
    currencies: [
      { nameFr: 'Réputation du Céphalon Simaris', howToGetFr: 'Scans furtifs ou Cibles de Synthèse quotidiennes avec le Scanneur de Synthèse' }
    ],
    manifests: [],
    syndicates: ['LibrarySyndicate']
  },
  {
    id: 'vendor-ergo-glast',
    nameFr: 'Ergo Glast — Armes Principe (Tenet)',
    nameEn: 'Ergo Glast (Tenet Weapons)',
    roleFr: 'Armes de Mêlée Principe (Livia, Grigori, Exec, Agendus) & Ferrox Principe',
    roleEn: 'Tenet Melee Weapons & Tenet Ferrox (Bonus Élémentaire en rotation 4j)',
    hubGroup: 'relays',
    planetFr: 'Tout Relais Tenno',
    planetEn: 'Any Tenno Relay',
    hubFr: 'Relais Tenno — Enclave de La Séquence Perrin',
    hubEn: 'Tenno Relay — Perrin Sequence Room',
    zoneFr: 'Voyage rapide : La Séquence Perrin → Marchandises d’Ergo Glast',
    unlockQuestFr: 'Aucun rang requis chez Perrin pour acheter les Armes Principe',
    currencies: [
      { nameFr: 'Holoclefs Corrompues', howToGetFr: 'Tempêtes du Néant Railjack (Proxima du Voile : ×10 à 37,5 % par mission) & Sœurs de Parvos' }
    ],
    manifests: ['/Lotus/Types/Game/VendorManifests/Hubs/PerrinSequenceWeaponVendorManifest'],
    syndicates: []
  },
  {
    id: 'vendor-maroo-darvo',
    nameFr: 'Maroo & Darvo (Ayatan & Affaires du Jour)',
    nameEn: 'Maroo & Darvo',
    roleFr: 'Extraction d’Endo des Sculptures Ayatan, Chasse hebdomadaire & Promo Platinum Darvo',
    roleEn: 'Ayatan Endo Extraction, Weekly Hunt & Daily Deal',
    hubGroup: 'relays',
    planetFr: 'Mars & Relais Tenno',
    planetEn: 'Mars & Tenno Relays',
    hubFr: 'Bazar de Maroo (Mars) & Étage supérieur des Relais (Darvo)',
    hubEn: "Maroo's Bazaar & Relay Concourse",
    zoneFr: 'Centre du Bazar de Maroo (Mars) / 2e étage des Relais pour Darvo (Missions Clem)',
    unlockQuestFr: 'Quête « Rêves Volés » (Maroo) / « Un Homme de Peu de Mots » (Clem)',
    currencies: [
      { nameFr: 'Sculptures & Étoiles Ayatan', howToGetFr: 'Chasse hebdomadaire de Maroo, Arbitrages & missions standards (donne de l’Endo)' }
    ],
    manifests: [],
    syndicates: [],
    curatedItems: [
      { nameEn: 'Chasse au Trésor Ayatan Hebdomadaire', nameFr: 'Mission : Chasse au Trésor Ayatan (1 Sculpture garantie / semaine)', cat: 'resource_relic', costs: [{ amount: 0, currencyFr: 'Gratuit (Hebdo)' }] },
      { nameEn: 'Clem Clone Blueprint', nameFr: 'Schéma de Clone de Clem (×5) — Mission hebdo Darvo', cat: 'equipment', costs: [{ amount: 0, currencyFr: 'Mission Aide à Clem' }] }
    ]
  },
  {
    id: 'vendor-palladino',
    nameFr: 'Palladino (Veillée de Fer — Riven & Kuva)',
    nameEn: 'Palladino (Iron Wake)',
    roleFr: 'Mods Riven Voilés hebdomadaires, 35 000 Kuva, Crédits & Ducats contre Brisures Riven',
    roleEn: 'Weekly Veiled Rivens, Kuva & Credits for Riven Slivers',
    hubGroup: 'relays',
    planetFr: 'Terre',
    planetEn: 'Earth',
    hubFr: 'Veillée de Fer (Iron Wake)',
    hubEn: 'Iron Wake (Earth)',
    zoneFr: 'Quartiers de Palladino au fond de la Veillée de Fer + Benne à Mods Défectueux à l’entrée',
    unlockQuestFr: 'Quête « Le Fardeau de Harrow »',
    currencies: [
      { nameFr: 'Brisures Riven (Riven Slivers)', howToGetFr: 'Unités Eximus (surtout en Route de l’Acier) & Reliques Requiem' },
      { nameFr: 'Crédits', howToGetFr: 'Pour les Mods Défectueux (Flawed Mods) de collection à l’entrée' }
    ],
    manifests: [
      '/Lotus/Types/Game/VendorManifests/Hubs/IronwakeDondaVendorManifest',
      '/Lotus/Types/Game/VendorManifests/Hubs/IronwakeFlawedModVendorManifest'
    ],
    syndicates: []
  },

  // === LES 6 SYNDICATS PRINCIPAUX ===
  {
    id: 'vendor-steel-meridian',
    nameFr: 'Méridien d’Acier (Cressa Tal)',
    nameEn: 'Steel Meridian',
    roleFr: 'Mods d’Augmentation Warframe, Armes Vaykor & Packs de Reliques',
    roleEn: 'Warframe Augment Mods, Vaykor Weapons & Relic Packs',
    hubGroup: 'syndicates',
    planetFr: 'Orbiteur & Tout Relais Tenno',
    planetEn: 'Orbiter & Any Tenno Relay',
    hubFr: 'Console Syndicats (Orbiteur) / Relais Aile Nord-Ouest',
    hubEn: 'Orbiter Syndicate Console / Relay',
    zoneFr: 'Accessible directement à gauche de la Navigation dans votre Orbiteur (Allégeance)',
    unlockQuestFr: 'Palier de Maîtrise 3',
    currencies: [{ nameFr: 'Réputation Méridien d’Acier', howToGetFr: 'Activer l’Allégeance Méridien d’Acier + Médaillons en missions syndicales' }],
    manifests: [],
    syndicates: ['SteelMeridianSyndicate']
  },
  {
    id: 'vendor-arbiters-hexis',
    nameFr: 'Arbitres de Hexis',
    nameEn: 'Arbiters of Hexis',
    roleFr: 'Mods d’Augmentation Warframe, Armes Telos & Packs de Reliques',
    roleEn: 'Warframe Augment Mods, Telos Weapons & Relic Packs',
    hubGroup: 'syndicates',
    planetFr: 'Orbiteur & Tout Relais Tenno',
    planetEn: 'Orbiter & Any Tenno Relay',
    hubFr: 'Console Syndicats (Orbiteur) / Relais Aile Ouest',
    hubEn: 'Orbiter Syndicate Console / Relay',
    zoneFr: 'Accessible directement depuis la Console Syndicats de l’Orbiteur',
    unlockQuestFr: 'Palier de Maîtrise 3',
    currencies: [{ nameFr: 'Réputation Arbitres de Hexis', howToGetFr: 'Allégeance Arbitres de Hexis + Médaillons' }],
    manifests: [],
    syndicates: ['ArbitersSyndicate']
  },
  {
    id: 'vendor-cephalon-suda',
    nameFr: 'Céphalon Suda',
    nameEn: 'Cephalon Suda',
    roleFr: 'Mods d’Augmentation Warframe, Armes Synoid & Packs de Reliques',
    roleEn: 'Warframe Augment Mods, Synoid Weapons & Relic Packs',
    hubGroup: 'syndicates',
    planetFr: 'Orbiteur & Tout Relais Tenno',
    planetEn: 'Orbiter & Any Tenno Relay',
    hubFr: 'Console Syndicats (Orbiteur) / Relais Aile Est',
    hubEn: 'Orbiter Syndicate Console / Relay',
    zoneFr: 'Accessible directement depuis la Console Syndicats de l’Orbiteur',
    unlockQuestFr: 'Palier de Maîtrise 3',
    currencies: [{ nameFr: 'Réputation Céphalon Suda', howToGetFr: 'Allégeance Céphalon Suda + Données Genius' }],
    manifests: [],
    syndicates: ['CephalonSudaSyndicate']
  },
  {
    id: 'vendor-perrin-sequence',
    nameFr: 'La Séquence Perrin (Syndicat)',
    nameEn: 'The Perrin Sequence',
    roleFr: 'Mods d’Augmentation Warframe, Armes Secura & Packs de Reliques',
    roleEn: 'Warframe Augment Mods, Secura Weapons & Relic Packs',
    hubGroup: 'syndicates',
    planetFr: 'Orbiteur & Tout Relais Tenno',
    planetEn: 'Orbiter & Any Tenno Relay',
    hubFr: 'Console Syndicats (Orbiteur) / Relais Aile Sud-Ouest',
    hubEn: 'Orbiter Syndicate Console / Relay',
    zoneFr: 'Accessible directement depuis la Console Syndicats de l’Orbiteur',
    unlockQuestFr: 'Palier de Maîtrise 3',
    currencies: [{ nameFr: 'Réputation Séquence Perrin', howToGetFr: 'Allégeance Séquence Perrin + Jetons Quorum' }],
    manifests: [],
    syndicates: ['PerrinSyndicate']
  },
  {
    id: 'vendor-red-veil',
    nameFr: 'Voile Rouge (Cantis)',
    nameEn: 'Red Veil',
    roleFr: 'Mods d’Augmentation Warframe, Armes Rakta & Packs de Reliques',
    roleEn: 'Warframe Augment Mods, Rakta Weapons & Relic Packs',
    hubGroup: 'syndicates',
    planetFr: 'Orbiteur & Tout Relais Tenno',
    planetEn: 'Orbiter & Any Tenno Relay',
    hubFr: 'Console Syndicats (Orbiteur) / Relais Aile Sud-Est',
    hubEn: 'Orbiter Syndicate Console / Relay',
    zoneFr: 'Accessible directement depuis la Console Syndicats de l’Orbiteur',
    unlockQuestFr: 'Palier de Maîtrise 3',
    currencies: [{ nameFr: 'Réputation Voile Rouge', howToGetFr: 'Allégeance Voile Rouge + Marques' }],
    manifests: [],
    syndicates: ['RedVeilSyndicate']
  },
  {
    id: 'vendor-new-loka',
    nameFr: 'Nouveau Loka (Amaryn)',
    nameEn: 'New Loka',
    roleFr: 'Mods d’Augmentation Warframe, Armes Sancti & Packs de Reliques',
    roleEn: 'Warframe Augment Mods, Sancti Weapons & Relic Packs',
    hubGroup: 'syndicates',
    planetFr: 'Orbiteur & Tout Relais Tenno',
    planetEn: 'Orbiter & Any Tenno Relay',
    hubFr: 'Console Syndicats (Orbiteur) / Relais Aile Est',
    hubEn: 'Orbiter Syndicate Console / Relay',
    zoneFr: 'Accessible directement depuis la Console Syndicats de l’Orbiteur',
    unlockQuestFr: 'Palier de Maîtrise 3',
    currencies: [{ nameFr: 'Réputation Nouveau Loka', howToGetFr: 'Allégeance Nouveau Loka + Graines' }],
    manifests: [],
    syndicates: ['NewLokaSyndicate']
  },

  // === CETUS (TERRE) ===
  {
    id: 'vendor-ostron-cetus',
    nameFr: 'Ostrons de Cetus (Konzu, Hok, Suumbaat, Hai-Luk, Teasonai)',
    nameEn: 'Cetus Ostrons (Konzu, Hok, Suumbaat, Hai-Luk, Teasonai)',
    roleFr: 'Armes modulaires Zaw, Arcanes Zaw, Minage, Pêche, Conservation & Décorations Cetus',
    roleEn: 'Modular Zaws, Exodia Arcanes, Mining, Fishing & Conservation',
    hubGroup: 'cetus',
    planetFr: 'Terre',
    planetEn: 'Earth',
    hubFr: 'Cetus (Entrée des Plaines d’Eidolon)',
    hubEn: 'Cetus (Earth)',
    zoneFr: 'Voyage rapide dans Cetus : Konzu (Mises à prix), Hok (Enclume), Vieux Suumbaat, Hai-Luk, Teasonai',
    unlockQuestFr: 'Quête « La Veillée de Saya » recommandée',
    currencies: [
      { nameFr: 'Réputation Ostron', howToGetFr: 'Mises à prix de Konzu, pêche, minage et captures d’animaux sur les Plaines' },
      { nameFr: 'Jetons d’Animaux', howToGetFr: 'Conservation de la faune avec Maître Teasonai' }
    ],
    manifests: [
      '/Lotus/Types/Game/VendorManifests/Ostron/ProspectorVendorManifest',
      '/Lotus/Types/Game/VendorManifests/Ostron/FishmongerVendorManifest',
      '/Lotus/Types/Game/VendorManifests/Ostron/PetVendorManifest',
      '/Lotus/Types/Game/VendorManifests/Ostron/ConservationRewardsManifest'
    ],
    syndicates: ['CetusSyndicate']
  },
  {
    id: 'vendor-quills-onkko',
    nameFr: 'Onkko — Les Plumes (Amplificateurs & Arcanes Opérateur)',
    nameEn: 'Quills Onkko',
    roleFr: 'Pièces d’Amplificateurs (1-2-3-4) & Arcanes Magus / Virtuos',
    roleEn: 'Operator Amp Parts & Magus / Virtuos Arcanes',
    hubGroup: 'cetus',
    planetFr: 'Terre',
    planetEn: 'Earth',
    hubFr: 'Cetus',
    hubEn: 'Cetus',
    zoneFr: 'Porte rocheuse derrière Konzu (accessible uniquement en mode Opérateur / Voyageur)',
    unlockQuestFr: 'Quêtes « La Veillée de Saya » + « La Guerre Intérieure »',
    currencies: [
      { nameFr: 'Réputation Les Plumes', howToGetFr: 'Échanger des Coeurs Sentient Intacts / Exceptionnels / Parfaits (Eidolons)' }
    ],
    manifests: [],
    syndicates: ['QuillsSyndicate']
  },
  {
    id: 'vendor-koumei-nakak',
    nameFr: 'Autel de Koumei & Nakak (Cetus)',
    nameEn: 'Koumei Shrine & Nakak',
    roleFr: 'Warframe Koumei, Higasa, Amanata, Mods Koumei, Masques & Schéma Fosfor',
    roleEn: 'Koumei Warframe, Higasa, Amanata & Nakak Curiosities',
    hubGroup: 'cetus',
    planetFr: 'Terre',
    planetEn: 'Earth',
    hubFr: 'Cetus',
    hubEn: 'Cetus',
    zoneFr: 'Quai gauche près du rivage (Autel des Visions de Saya) & Étal de Nakak au marché',
    unlockQuestFr: 'Nœud « Visions de Saya » sur Terre débloqué après la quête « La Veillée de Saya »',
    currencies: [
      { nameFr: 'Perles du Destin (Fate Pearls)', howToGetFr: 'Mission Défense d’Autel « Visions de Saya » sur Terre' },
      { nameFr: 'Ressources des Plaines', howToGetFr: 'Iradite, Grokdrul, Huile de Poisson pour Nakak' }
    ],
    manifests: [
      '/Lotus/Types/Game/VendorManifests/Ostron/FiveFatesVendorManifest',
      '/Lotus/Types/Game/VendorManifests/Ostron/MaskSalesmanManifest'
    ],
    syndicates: []
  },

  // === FORTUNA (VÉNUS) ===
  {
    id: 'vendor-solaris-fortuna',
    nameFr: 'Union Solaris (Eudico, Rude Zuud, Legs, Smokefinger, Bizness, Ticker)',
    nameEn: 'Solaris United (Fortuna Vendors)',
    roleFr: 'Kitguns, Arcanes Pax, Compagnons MOA, Obligations de Dettes, Équipage Railjack & Minage',
    roleEn: 'Modular Kitguns, Pax Arcanes, MOAs, Debt-Bonds & Railjack Crew',
    hubGroup: 'fortuna',
    planetFr: 'Vénus',
    planetEn: 'Venus',
    hubFr: 'Fortuna (Entrée de la Vallée Orbis)',
    hubEn: 'Fortuna (Venus)',
    zoneFr: 'Voyage rapide dans Fortuna : Eudico, Rude Zuud, Legs, Smokefinger, Le Bizness, Ticker (1er étage)',
    unlockQuestFr: 'Quête « Vox Solaris »',
    currencies: [
      { nameFr: 'Réputation Union Solaris', howToGetFr: 'Mises à prix d’Eudico, Obligations de dettes chez Ticker, minage et conservation' },
      { nameFr: 'Ressources & Crédits', howToGetFr: 'Rachat d’Obligations de Dettes & Recrutement d’Équipage Railjack chez Ticker' }
    ],
    manifests: [
      '/Lotus/Types/Game/VendorManifests/Solaris/DebtTokenVendorManifest',
      '/Lotus/Types/Game/VendorManifests/Solaris/ProspectorVendorManifest',
      '/Lotus/Types/Game/VendorManifests/Solaris/FishmongerVendorManifest',
      '/Lotus/Types/Game/VendorManifests/Solaris/ConservationRewardsManifest',
      '/Lotus/Types/Game/VendorManifests/Hubs/RailjackCrewMemberVendorManifest'
    ],
    syndicates: ['SolarisSyndicate']
  },
  {
    id: 'vendor-little-duck',
    nameFr: 'Little Duck — Vox Solaris (Amplificateurs 5-6-7, Baruuk & Hildryn)',
    nameEn: 'Little Duck (Vox Solaris)',
    roleFr: 'Pièces d’Amplificateurs méta (Certus/Propa/Raplak), Baruuk, Hildryn & Arcanes Magus',
    roleEn: 'Amp Parts (5-6-7), Baruuk, Hildryn & Magus Lockdown / Repair',
    hubGroup: 'fortuna',
    planetFr: 'Vénus',
    planetEn: 'Venus',
    hubFr: 'Fortuna — Salle Arrière (Backroom)',
    hubEn: 'Fortuna — Backroom',
    zoneFr: 'Parler à Little Duck en mode Opérateur / Voyageur dans la Salle Arrière derrière Eudico',
    unlockQuestFr: 'Quêtes « Vox Solaris » + « La Guerre Intérieure »',
    currencies: [
      { nameFr: 'Réputation Vox Solaris & Torides', howToGetFr: 'Torides Vega/Calda/Sola, Crisma (Preneur de Profit) et Lazulite (Orbis Exploiteur)' },
      { nameFr: 'Brisures d’Anomalie', howToGetFr: 'Anomalies Sentient dans la Proxima du Voile (Railjack) pour Caliban / Éphémères' }
    ],
    manifests: ['/Lotus/Types/Game/VendorManifests/Solaris/SentientInvasionManifest'],
    syndicates: ['VoxSyndicate']
  },
  {
    id: 'vendor-ventkids-roky',
    nameFr: 'Roky — Orphelins des Conduits & Nokko (Fortuna)',
    nameEn: 'Roky (Ventkids) & Nightcap',
    roleFr: 'Planches K-Drive, Mods K-Drive, Kompressa & Yareli (Bash Lab)',
    roleEn: 'K-Drive Parts, Mods, Kompressa & Underbrush',
    hubGroup: 'fortuna',
    planetFr: 'Vénus',
    planetEn: 'Venus',
    hubFr: 'Fortuna — Conduits d’aération (Étage supérieur)',
    hubEn: 'Fortuna — Ventkids Clubhouse',
    zoneFr: 'Voyage rapide : Roky (grille de ventilation au-dessus de Legs)',
    unlockQuestFr: 'Quête « Vox Solaris » (+ « Waverider » pour Yareli)',
    currencies: [
      { nameFr: 'Réputation Orphelins des Conduits', howToGetFr: 'Courses K-Drive dans la Vallée Orbis et le Puy de Cambion' }
    ],
    manifests: ['/Lotus/Types/Game/VendorManifests/Solaris/NightcapVendorManifest'],
    syndicates: ['VentKidsSyndicate', 'NightcapJournalSyndicate']
  },

  // === DEIMOS (NECRALISK & SANCTUM ANATOMICA) ===
  {
    id: 'vendor-otak-deimos',
    nameFr: 'Otak (Necralisk — Minage & Fragments de Citrine)',
    nameEn: 'Otak (Necralisk — Mining & Citrine)',
    roleFr: 'Warframe Citrine, Corufell, Steflos, Arcanes Défense Miroir & Schémas de Minage Deimos',
    roleEn: 'Citrine Warframe, Corufell, Steflos, Arcanes & Deimos Mining Alloys',
    hubGroup: 'deimos',
    planetFr: 'Deimos',
    planetEn: 'Deimos',
    hubFr: 'Necralisk',
    hubEn: 'Necralisk',
    zoneFr: 'Voyage rapide : Otak (Galerie inférieure droite du Necralisk)',
    unlockQuestFr: 'Quête « Cœur de Deimos »',
    currencies: [
      { nameFr: 'Cristaux de Belric & de Rania', howToGetFr: 'Mission Défense Miroir : Passe de Tyana sur Mars' },
      { nameFr: 'Réputation Entrati & Jetons d’Otak', howToGetFr: 'Échanger des minerais et gemmes du Puy de Cambion' }
    ],
    manifests: [
      '/Lotus/Types/Game/VendorManifests/Deimos/EntratiFragmentVendorProductsManifest',
      '/Lotus/Types/Game/VendorManifests/Deimos/ProspectorVendorManifest',
      '/Lotus/Types/Game/VendorManifests/Deimos/OtakLastWishManifest'
    ],
    syndicates: []
  },
  {
    id: 'vendor-entrati-family',
    nameFr: 'Famille Entrati (Mère, Père, Fille, Fils & Grand-mère)',
    nameEn: 'Entrati Family (Mother, Father, Daughter, Son, Grandmother)',
    roleFr: ' Segment Helminth, Lavos, Cedo, Armes Infestées, Prédasites/Vulpaphylas & Jetons Sériglass',
    roleEn: 'Helminth Segment, Lavos, Cedo, Kitgun Chambers, Companions & Tokens',
    hubGroup: 'deimos',
    planetFr: 'Deimos',
    planetEn: 'Deimos',
    hubFr: 'Necralisk',
    hubEn: 'Necralisk',
    zoneFr: 'Voyage rapide dans le Necralisk vers chaque membre de la Famille Entrati',
    unlockQuestFr: 'Quête « Cœur de Deimos »',
    currencies: [
      { nameFr: 'Réputation Entrati (Jetons de la Mère / Grand-mère)', howToGetFr: 'Mises à prix du Puy de Cambion et échanges de ressources' },
      { nameFr: 'Jetons du Fils / Fille / Père', howToGetFr: 'Conservation, pêche et récupération de composants sur Deimos' }
    ],
    manifests: [
      '/Lotus/Types/Game/VendorManifests/Deimos/FishmongerVendorManifest',
      '/Lotus/Types/Game/VendorManifests/Deimos/PetVendorManifest',
      '/Lotus/Types/Game/VendorManifests/Deimos/ConservationRewardsManifest',
      '/Lotus/Types/Game/VendorManifests/Deimos/HivemindTokenVendorManifest'
    ],
    syndicates: ['EntratiSyndicate']
  },
  {
    id: 'vendor-loid-necraloid',
    nameFr: 'Loid — Syndicat Nécralloid (Necramechs Voidrig & Bonewidow)',
    nameEn: 'Loid (Necraloid Syndicate)',
    roleFr: 'Schémas Voidrig, Bonewidow, Morgha, Cortege & Mods Necramech',
    roleEn: 'Voidrig, Bonewidow, Morgha, Cortege & Necramech Mods',
    hubGroup: 'deimos',
    planetFr: 'Deimos',
    planetEn: 'Deimos',
    hubFr: 'Necralisk — Salle Arrière (Chambre du Nécralloid)',
    hubEn: 'Necralisk — Necraloid Room',
    zoneFr: 'Passer la porte œsophagienne au fond du Necralisk en mode Opérateur / Voyageur',
    unlockQuestFr: 'Quêtes « Cœur de Deimos » + « La Guerre Intérieure »',
    currencies: [
      { nameFr: 'Réputation Nécralloid (Matrices Orokin)', howToGetFr: 'Salles d’Isolement (Isolation Vaults) auprès de la Mère sur Deimos' }
    ],
    manifests: [],
    syndicates: ['NecraloidSyndicate']
  },
  {
    id: 'vendor-sanctum-cavia-loid',
    nameFr: 'Oiseau-3 & Loid Humain (Sanctum Anatomica — Cavia, Dante & Vosfor)',
    nameEn: 'Bird 3 & Loid (Sanctum Anatomica)',
    roleFr: 'Warframe Dante, Ruvox, Onos, Qorvex, Fragments d’Archonte, Mods Mêlée & Dissolution d’Arcanes (Vosfor)',
    roleEn: 'Dante, Qorvex, Archon Shard Segment, Melee Arcanes & Vosfor Arcane Dissolution',
    hubGroup: 'deimos',
    planetFr: 'Deimos',
    planetEn: 'Deimos',
    hubFr: 'Sanctum Anatomica (Laboratoires d’Albrecht)',
    hubEn: 'Sanctum Anatomica',
    zoneFr: 'Voyage rapide : Oiseau-3 (Marchandises Cavia) et Loid (Recherche de Dante & Dissolution d’Arcanes)',
    unlockQuestFr: 'Quête « Murmures dans les Murs »',
    currencies: [
      { nameFr: 'Capillaires de Vaisseaux (Vessel Capillaries)', howToGetFr: 'Mission Perturbation : Armatus sur Deimos (pour Dante, Ruvox & Onos)' },
      { nameFr: 'Réputation Cavia & Vosfor', howToGetFr: 'Mises à prix de Fibonacci + Dissolution d’Arcanes en doublon auprès de Loid' }
    ],
    manifests: [
      '/Lotus/Types/Game/VendorManifests/EntratiLabs/EntratiLabsDisruptionVendorManifest',
      '/Lotus/Types/Game/VendorManifests/EntratiLabs/EntratiLabVendorManifest',
      '/Lotus/Types/Game/VendorManifests/EntratiLabs/EntratiLabsArcaneShopManifest'
    ],
    syndicates: ['EntratiLabSyndicate']
  },
  {
    id: 'vendor-triad-tau-prequel',
    nameFr: 'Marchands des Ténèbres Réfractaires (Roathe & La Triade)',
    nameEn: 'Dark Refractory Vendors (Roathe & Triad)',
    roleFr: 'Équipements, Honoria, Antiquités et Échanges des Ténèbres Réfractaires',
    roleEn: 'Dark Refractory Pity Shop, Antiques & Exchanges',
    hubGroup: 'deimos',
    planetFr: 'Deimos (Ténèbres Réfractaires)',
    planetEn: 'Dark Refractory, Deimos',
    hubFr: 'Hub des Ténèbres Réfractaires',
    hubEn: 'Dark Refractory Hub',
    zoneFr: 'Voyage rapide vers les marchands de la Triade et Roathe',
    unlockQuestFr: 'Accès à la région Ténèbres Réfractaires (Deimos)',
    currencies: [
      { nameFr: 'Devises de la Triade', howToGetFr: 'Missions des Ténèbres Réfractaires sur Deimos' }
    ],
    manifests: [
      '/Lotus/Types/Game/VendorManifests/Tau/Prequel/TriadPityVendorManifest',
      '/Lotus/Types/Game/VendorManifests/Tau/Prequel/TriadExchangeVendorManifest',
      '/Lotus/Types/Game/VendorManifests/Tau/Prequel/TriadAntiqueVendorManifest',
      '/Lotus/Types/Game/VendorManifests/Tau/Prequel/RoatheHonoriaVendorManifest'
    ],
    syndicates: []
  },

  // === ZARIMAN & DUVIRI ===
  {
    id: 'vendor-archimedean-yonta',
    nameFr: 'Archimédienne Yonta (Chrysalithe — Zariman & Survie Conjonction Lua)',
    nameEn: 'Archimedean Yonta',
    roleFr: 'Warframe Voruna, Sarofang, Perigale, Arcanes Lua, Kuva & Échange de Plumes du Néant',
    roleEn: 'Voruna, Sarofang, Perigale, Conjunction Arcanes & Voidplume Exchange',
    hubGroup: 'zariman_duviri',
    planetFr: 'Zariman Ten Zero',
    planetEn: 'Zariman Ten Zero',
    hubFr: 'Chrysalithe',
    hubEn: 'Chrysalith',
    zoneFr: 'Voyage rapide : Archimédienne Yonta (Pont principal du Chrysalithe)',
    unlockQuestFr: 'Quête « Les Anges du Zariman »',
    currencies: [
      { nameFr: 'Plasma Thrax Lua', howToGetFr: 'Survie Conjonction sur Lua : Yuvarium & Circulus (pour Voruna & ses armes)' },
      { nameFr: 'Plumes du Néant (Rémiges, Pennes…)', howToGetFr: 'Mises à prix de Quinn, Anges du Néant et médaillons sur le Zariman' }
    ],
    manifests: [
      '/Lotus/Types/Game/VendorManifests/Zariman/ArchimedeanVoidEclipseManifest',
      '/Lotus/Types/Game/VendorManifests/Zariman/ArchimedeanVendorManifest'
    ],
    syndicates: []
  },
  {
    id: 'vendor-cavalero-quinn',
    nameFr: 'Cavalero, Quinn & Hombask (Syndicat Les Irréductibles)',
    nameEn: 'Cavalero, Quinn & Hombask (The Holdfasts)',
    roleFr: 'Armes Incarnon natives (Phenmor, Laetum, Praedos, Felarx, Innodem), Gyre & Arcanes Mue (Molt)',
    roleEn: 'Incarnon Weapons, Gyre, Molt Efficiency/Augmented Arcanes & Dormizone',
    hubGroup: 'zariman_duviri',
    planetFr: 'Zariman Ten Zero',
    planetEn: 'Zariman Ten Zero',
    hubFr: 'Chrysalithe',
    hubEn: 'Chrysalith',
    zoneFr: 'Voyage rapide : Cavalero (Forge Incarnon), Quinn (Mises à prix) & Hombask (Décorations)',
    unlockQuestFr: 'Quête « Les Anges du Zariman »',
    currencies: [
      { nameFr: 'Réputation Les Irréductibles', howToGetFr: 'Échanger vos Plumes du Néant auprès de l’Archimédienne Yonta' },
      { nameFr: 'Pinces de Pathos', howToGetFr: 'Adaptateurs Genesis Incarnon supplémentaires chez Cavalero' }
    ],
    manifests: ['/Lotus/Types/Game/VendorManifests/Zariman/ZarimanWeaponsmithIncarnonShopManifest'],
    syndicates: ['ZarimanSyndicate']
  },
  {
    id: 'vendor-acrithis-duviri',
    nameFr: 'Acrithis (Duviri & Dormizone — Kullervo, Armes & Arcanes)',
    nameEn: 'Acrithis (Duviri & Dormizone)',
    roleFr: 'Warframe Kullervo, Rauta, Armes de Mêlée Duviri, Réacteurs/Catalyseurs, Rivens & Arcanes Duviri',
    roleEn: 'Kullervo, Rauta, Duviri Melee Weapons, Potatoes, Rivens & Duviri Arcanes',
    hubGroup: 'zariman_duviri',
    planetFr: 'Duviri & Zariman (Dormizone)',
    planetEn: 'Duviri & Dormizone',
    hubFr: 'Dormizone (Zariman) ou Chariot d’Acrithis après l’Orowyrm',
    hubEn: 'Dormizone or Duviri Courtyard',
    zoneFr: 'Accessible à tout moment dans le couloir d’entrée de votre Dormizone sur la Carte Céleste !',
    unlockQuestFr: 'Quête « Le Paradoxe Duviri »',
    currencies: [
      { nameFr: 'Fléau de Kullervo (Kullervo’s Bane)', howToGetFr: 'Combattre Kullervo au Donjon de Kullervo pendant les spirales Colère, Peur ou Chagrin' },
      { nameFr: 'Pinces de Pathos & Gyrum d’Énigme', howToGetFr: 'Vaincre l’Orowyrm (×10 Normal / ×15 Acier) et résoudre les Énigmes de hiboux' }
    ],
    manifests: [
      '/Lotus/Types/Game/VendorManifests/Duviri/AcrithisKullervoShopManifest',
      '/Lotus/Types/Game/VendorManifests/Duviri/AcrithisVendorManifest',
      '/Lotus/Types/Game/VendorManifests/Duviri/AcrithisEnigmaGyrumShopManifest',
      '/Lotus/Types/Game/VendorManifests/Duviri/DrifterWeaponsVendorManifest'
    ],
    syndicates: []
  },

  // === CAMP DU VOYAGEUR, ONDES NOCTURNES & HÖLLVANIE (1999) ===
  {
    id: 'vendor-nora-night',
    nameFr: 'Nora Night (Boutique Crédits des Ondes Nocturnes)',
    nameEn: 'Nora Night (Nightwave Cred Offerings)',
    roleFr: 'Extrait de Nitain (×5), Vauban, Catalyseurs & Réacteurs Orokin, Mods Aura & Casques',
    roleEn: 'Nitain Extract, Vauban Parts, Orokin Catalyst/Reactor, Aura Mods & Helmets',
    hubGroup: 'hollvania_camp',
    planetFr: 'Orbiteur (Partout)',
    planetEn: 'Orbiter / Navigation',
    hubFr: 'Console Radio des Ondes Nocturnes (ou Menu Échap → Ondes Nocturnes)',
    hubEn: 'Nightwave Menu → Cred Offerings',
    zoneFr: 'Cliquer sur la bannière Ondes Nocturnes en bas à droite du menu Échap puis « Boutique de Crédits »',
    unlockQuestFr: 'Aucun prérequis (Accessible dès le début du jeu !)',
    currencies: [
      { nameFr: 'Crédits de Nora (Saison en cours)', howToGetFr: 'Compléter les défis hebdomadaires des Ondes Nocturnes (Rang 1 donne immédiatement 150 Crédits !)' }
    ],
    manifests: ['/Lotus/Types/Game/VendorManifests/Events/RadioLegionIntermission16VendorManifest'],
    syndicates: ['RadioLegionIntermission16Syndicate'],
    curatedItems: [
      { nameEn: 'Nitain Extract', nameFr: 'Extrait de Nitain (Lot ×5)', cat: 'resource_relic', costs: [{ amount: 15, currencyFr: 'Crédits Nora' }] },
      { nameEn: 'Vauban Neuroptics Blueprint', nameFr: 'Vauban — Schéma Neuroptiques', cat: 'equipment', costs: [{ amount: 25, currencyFr: 'Crédits Nora' }] },
      { nameEn: 'Vauban Chassis Blueprint', nameFr: 'Vauban — Schéma Châssis', cat: 'equipment', costs: [{ amount: 25, currencyFr: 'Crédits Nora' }] },
      { nameEn: 'Vauban Systems Blueprint', nameFr: 'Vauban — Schéma Systèmes', cat: 'equipment', costs: [{ amount: 25, currencyFr: 'Crédits Nora' }] },
      { nameEn: 'Orokin Catalyst', nameFr: 'Catalyseur Orokin (Prêt à l’emploi)', cat: 'resource_relic', costs: [{ amount: 75, currencyFr: 'Crédits Nora' }] },
      { nameEn: 'Orokin Reactor', nameFr: 'Réacteur Orokin (Prêt à l’emploi)', cat: 'resource_relic', costs: [{ amount: 75, currencyFr: 'Crédits Nora' }] },
      { nameEn: 'Corrosive Projection', cat: 'mod_arcane', costs: [{ amount: 20, currencyFr: 'Crédits Nora' }] },
      { nameEn: 'Energy Siphon', cat: 'mod_arcane', costs: [{ amount: 20, currencyFr: 'Crédits Nora' }] },
      { nameEn: 'Steel Charge', cat: 'mod_arcane', costs: [{ amount: 20, currencyFr: 'Crédits Nora' }] },
      { nameEn: 'Kuva (×10 000)', nameFr: 'Kuva (Lot ×10 000)', cat: 'resource_relic', costs: [{ amount: 50, currencyFr: 'Crédits Nora' }] }
    ]
  },
  {
    id: 'vendor-chipper-kahl',
    nameFr: 'Chipper — Garnison de Kahl (Styanax & Mods Archonte)',
    nameEn: 'Chipper (Kahl’s Garrison)',
    roleFr: 'Warframe Styanax, Afentis, Aegrit, Slaytra & Mods Archonte (Vitalité/Continuité/Flux Archonte)',
    roleEn: 'Styanax, Archon Mods, Afentis, Aegrit & Slaytra',
    hubGroup: 'hollvania_camp',
    planetFr: 'Terre',
    planetEn: 'Earth',
    hubFr: 'Camp du Voyageur (Drifter’s Camp)',
    hubEn: "Drifter's Camp",
    zoneFr: 'Campement de la Garnison de Kahl sur la colline à droite de votre vaisseau au Camp du Voyageur',
    unlockQuestFr: 'Quêtes « La Nouvelle Guerre » + « Brise-Voile »',
    currencies: [
      { nameFr: 'Stock', howToGetFr: 'Mission hebdomadaire Brise-Voile de Kahl-175 et ses défis secondaires (jusqu’à 105 Stock/semaine)' }
    ],
    manifests: ['/Lotus/Types/Game/VendorManifests/Kahl/ChipperVendorManifest'],
    syndicates: ['KahlSyndicate']
  },
  {
    id: 'vendor-ordis-jade',
    nameFr: 'Ordis — Vestiges de Jade (Ascension)',
    nameEn: 'Ordis (Jade Shadows Vendor)',
    roleFr: 'Warframe Jade, Evensong, Cantare, Harmony & Arcanes d’Ascension',
    roleEn: 'Jade Warframe, Evensong, Cantare, Harmony & Arcanes',
    hubGroup: 'hollvania_camp',
    planetFr: 'Terre (Camp du Voyageur)',
    planetEn: "Earth (Drifter's Camp)",
    hubFr: 'Camp du Voyageur',
    hubEn: "Drifter's Camp",
    zoneFr: 'Près du vaisseau de débarquement au Camp du Voyageur (à droite de Kahl)',
    unlockQuestFr: 'Quête « Les Ombres de Jade »',
    currencies: [
      { nameFr: 'Granules Vestigiaux (Vestigial Motes)', howToGetFr: 'Mission Ascension : Brutus sur Uranus' }
    ],
    manifests: ['/Lotus/Types/Game/VendorManifests/GameModes/AscensionVendorManifest'],
    syndicates: []
  },
  {
    id: 'vendor-eleanor-1999',
    nameFr: 'Eleanor Nightingale (Höllvanie 1999 — Armes Coda & Arcanes)',
    nameEn: 'Eleanor Nightingale (1999)',
    roleFr: 'Armes Technocyte Coda (en rotation 4j) & Tous les Arcanes 1999',
    roleEn: 'Technocyte Coda Weapons & 1999 Arcanes',
    hubGroup: 'hollvania_camp',
    planetFr: 'Höllvanie (1999)',
    planetEn: 'Höllvania (1999)',
    hubFr: 'Centre Commercial d’Höllvanie (Höllvania Central Mall)',
    hubEn: 'Höllvania Central Mall',
    zoneFr: 'Voyage rapide : Eleanor (Mezzanine du Centre Commercial d’Höllvanie)',
    unlockQuestFr: 'Quête « L’Hexagone (1999) »',
    currencies: [
      { nameFr: 'Cellules Cardiaques Vivantes (Live Heartcells)', howToGetFr: 'Vaincre votre Némésis Technocyte Coda en Confrontation Proxima de la Terre' },
      { nameFr: 'Réputation L’Hexagone', howToGetFr: 'Mises à prix 1999 et Trésors de l’Hexagone auprès de Lettie' }
    ],
    manifests: ['/Lotus/Types/Game/VendorManifests/TheHex/InfestedLichWeaponVendorManifest'],
    syndicates: []
  },
  {
    id: 'vendor-hex-mall-1999',
    nameFr: 'L’Hexagone (Arthur, Amir, Quincy, Aoi, Flare & Velimir/Minerva)',
    nameEn: 'The Hex Mall Vendors (1999)',
    roleFr: 'Warframe Cyte-09, Temple, Reconifex, Vesper 77, Armes Scaldra, Mods 1999 & Mobilier',
    roleEn: 'Cyte-09, Temple, Scaldra Weapons, 1999 Mods, Somachord & Decor',
    hubGroup: 'hollvania_camp',
    planetFr: 'Höllvanie (1999)',
    planetEn: 'Höllvania (1999)',
    hubFr: 'Centre Commercial d’Höllvanie',
    hubEn: 'Höllvania Central Mall',
    zoneFr: 'Voyage rapide dans le Centre Commercial vers Amir (Cyte-09/Armes), Arthur, Flare (Temple), Velimir/Minerva, Quincy & Aoi',
    unlockQuestFr: 'Quête « L’Hexagone (1999) »',
    currencies: [
      { nameFr: 'Réputation L’Hexagone', howToGetFr: 'Mises à prix du tableau de garage et Trésors Hex chez Lettie' },
      { nameFr: 'Cordes Battantes / Ressources 1999', howToGetFr: 'Défense de Scène (Solstice Square) pour Temple & Riot-848 auprès de Flare' }
    ],
    manifests: [
      '/Lotus/Types/Game/VendorManifests/TheHex/AmirNightwaveVendorManifest',
      '/Lotus/Types/Game/VendorManifests/TheHex/Temple1999VendorManifest',
      '/Lotus/Types/Game/VendorManifests/TheHex/HexScaldranWeaponsVendorManifest',
      '/Lotus/Types/Game/VendorManifests/TheHex/Nova1999ConquestShopManifest',
      '/Lotus/Types/Game/VendorManifests/TheHex/HexFurnitureVendorManifest'
    ],
    syndicates: ['HexSyndicate']
  }
]

function classifyOfferingCategory(storeItemPath, enName, frName) {
  const s = `${storeItemPath} ${enName} ${frName}`.toLowerCase()
  if (
    s.includes('/upgrades/') ||
    s.includes('/arcanes/') ||
    s.includes('arcane ') ||
    s.includes('mod ') ||
    s.includes('primed ') ||
    s.includes('galvanized ') ||
    s.includes('archon ')
  ) {
    return 'mod_arcane'
  }
  if (
    s.includes('/powersuits/') ||
    s.includes('/weapons/') ||
    s.includes('neuroptic') ||
    s.includes('chassis') ||
    s.includes('systems') ||
    s.includes('barrel') ||
    s.includes('receiver') ||
    s.includes('stock') ||
    s.includes('blade') ||
    s.includes('hilt') ||
    s.includes('wraith') ||
    s.includes('vandal') ||
    s.includes('prisma') ||
    s.includes('tenet') ||
    s.includes('coda ')
  ) {
    return 'equipment'
  }
  if (
    s.includes('shipdeco') ||
    s.includes('plushy') ||
    s.includes('sigil') ||
    s.includes('emblem') ||
    s.includes('glyph') ||
    s.includes('scene') ||
    s.includes('captura') ||
    s.includes('emote') ||
    s.includes('armor') ||
    s.includes('syandana') ||
    s.includes('helmet') ||
    s.includes('skin') ||
    s.includes('title') ||
    s.includes('poster') ||
    s.includes('furniture') ||
    s.includes('song')
  ) {
    return 'cosmetic_misc'
  }
  return 'resource_relic'
}

async function main() {
  console.log('⏳ Chargement de resources/codex-db.json et téléchargement des exports officiels...')
  const codexDb = JSON.parse(readFileSync(resolve('resources/codex-db.json'), 'utf8'))

  // Build lookup maps to existing Codex entries for cross-linking + icons + WFM slugs
  const codexLookup = new Map()
  for (const cat of ['resources', 'warframes', 'weapons', 'mods', 'relics']) {
    for (const item of codexDb[cat] || []) {
      const entry = {
        id: item.id,
        category: cat,
        nameFr: item.name,
        nameEn: item.en,
        img: item.img || undefined,
        tradable: Boolean(item.tradable)
      }
      if (item.en) codexLookup.set(norm(item.en), entry)
      if (item.name) codexLookup.set(norm(item.name), entry)
    }
  }

  const [
    wfcdEnemies,
    expEnemies,
    expRegions,
    expVendors,
    expSyndicates,
    expResources,
    expRecipes,
    expUpgrades,
    expWarframes,
    expWeapons,
    expArcanes,
    expRelics,
    expCustoms,
    expFlavour,
    expGear,
    expBoosters,
    expKeys,
    expSentinels,
    dictFr,
    dictEn,
    modTablesWrap,
    bpTablesWrap,
    resByAvatarWrap,
    addItemByAvatarWrap,
    missionRewardsWrap
  ] = await Promise.all([
    fetchJsonUrl(WFCD_ENEMY_URL),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportEnemies.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportRegions.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportVendors.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportSyndicates.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportResources.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportRecipes.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportUpgrades.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportWarframes.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportWeapons.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportArcanes.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportRelics.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportCustoms.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportFlavour.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportGear.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportBoosterPacks.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportKeys.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/ExportSentinels.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/dict.fr.json`),
    fetchJsonUrl(`${BASE_EXPORT_URL}/dict.en.json`),
    fetchJsonUrl(`${WFCD_DROPS_BASE}/enemyModTables.json`),
    fetchJsonUrl(`${WFCD_DROPS_BASE}/enemyBlueprintTables.json`),
    fetchJsonUrl(`${WFCD_DROPS_BASE}/resourceByAvatar.json`),
    fetchJsonUrl(`${WFCD_DROPS_BASE}/additionalItemByAvatar.json`),
    fetchJsonUrl(`${WFCD_DROPS_BASE}/missionRewards.json`)
  ])

  // 1. Build System Bitmask Map (0..24) from ExportRegions
  const systemBitMap = new Map()
  for (const r of Object.values(expRegions)) {
    if (r.systemIndex !== undefined && !systemBitMap.has(r.systemIndex)) {
      systemBitMap.set(r.systemIndex, {
        fr: cleanText(dictFr[r.systemName] || dictEn[r.systemName] || ''),
        en: cleanText(dictEn[r.systemName] || '')
      })
    }
  }

  // 2. Build Universal Item & Currency Dictionary (for Vendor storeItems & itemPrices)
  const universalItems = new Map()
  const exportSources = [
    expResources,
    expUpgrades,
    expWarframes,
    expWeapons,
    expArcanes,
    expRelics,
    expCustoms,
    expFlavour,
    expGear,
    expBoosters,
    expKeys,
    expSentinels
  ]
  for (const src of exportSources) {
    for (const [uName, obj] of Object.entries(src || {})) {
      if (!obj || typeof obj !== 'object') continue
      const nameKey = obj.name || ''
      const fr = cleanText(dictFr[nameKey] || dictEn[nameKey] || '')
      const en = cleanText(dictEn[nameKey] || fr || '')
      const icon =
        typeof obj.icon === 'string' && obj.icon.startsWith('/Lotus/') ? obj.icon : undefined
      if (fr || en) {
        universalItems.set(uName, { fr: fr || en, en: en || fr, isBlueprint: false, icon })
      }
    }
  }
  for (const [rKey, rec] of Object.entries(expRecipes || {})) {
    if (!rec || !rec.resultType) continue
    const target = universalItems.get(rec.resultType)
    if (target) {
      const recIcon =
        typeof rec.icon === 'string' && rec.icon.startsWith('/Lotus/') ? rec.icon : target.icon
      universalItems.set(rKey, {
        fr: target.fr.toLowerCase().includes('schéma') ? target.fr : `${target.fr} (Schéma)`,
        en: target.en.toLowerCase().includes('blueprint') ? target.en : `${target.en} Blueprint`,
        isBlueprint: true,
        baseEn: target.en,
        baseFr: target.fr,
        icon: recIcon
      })
    }
  }

  function normWords(value) {
    return norm(value)
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Build Official Enemy & Wildlife Icon Lookups (`/Lotus/Interface/Icons/...` + Wiki fallbacks)
  const avatarIconByWords = new Map()
  for (const av of Object.values(expEnemies.avatars || {})) {
    if (!av?.icon || typeof av.icon !== 'string' || !av.icon.startsWith('/Lotus/')) continue
    const enLabel = normWords(cleanText(dictEn[av.name] || ''))
    if (enLabel && !avatarIconByWords.has(enLabel)) {
      avatarIconByWords.set(enLabel, av.icon)
    }
  }

  const tagFloofIconByWords = new Map()
  for (const src of [expResources, expCustoms, expFlavour, expSentinels]) {
    for (const obj of Object.values(src || {})) {
      if (!obj?.icon || typeof obj.icon !== 'string' || !obj.icon.startsWith('/Lotus/')) continue
      const rawEn = cleanText(dictEn[obj.name] || '')
      if (!rawEn) continue
      const w = normWords(rawEn)
      tagFloofIconByWords.set(w, obj.icon)
      if (w.endsWith(' floof')) {
        tagFloofIconByWords.set(w.slice(0, -' floof'.length).trim(), obj.icon)
      } else if (w.endsWith(' tag') && !tagFloofIconByWords.has(w.slice(0, -' tag'.length).trim())) {
        tagFloofIconByWords.set(w.slice(0, -' tag'.length).trim(), obj.icon)
      }
    }
  }

  const MOB_WIKI_ICON_FALLBACKS = {
    clem: 'wiki:ClemAvatar.png',
    condroc: 'wiki:CondrocCommon.png',
    kuaka: 'wiki:KuakaCommon.png',
    kubrow: avatarIconByWords.get('feral kubrow') || 'wiki:IconKubrow(xWhite).png',
    kavat: avatarIconByWords.get('feral kavat') || 'wiki:IconKavat(xWhite).png',
    'ghoul expired deserter': avatarIconByWords.get('ghoul expired') || 'wiki:ClemAvatar.png',
    'tomb guardian': 'wiki:HostileRockman.png',
    'nemes ranger': 'wiki:Nemes.png',
    'nemes scout': 'wiki:Nemes.png'
  }

  function resolveOfficialMobIcon(uniqueName, enName) {
    const directAvatar = expEnemies.avatars?.[uniqueName]
    if (directAvatar?.icon && directAvatar.icon.startsWith('/Lotus/')) {
      return directAvatar.icon
    }
    const w = normWords(enName)
    if (avatarIconByWords.has(w)) return avatarIconByWords.get(w)
    if (tagFloofIconByWords.has(`${w} floof`)) return tagFloofIconByWords.get(`${w} floof`)
    if (tagFloofIconByWords.has(`${w} tag`)) return tagFloofIconByWords.get(`${w} tag`)
    if (tagFloofIconByWords.has(w)) return tagFloofIconByWords.get(w)
    if (MOB_WIKI_ICON_FALLBACKS[w]) return MOB_WIKI_ICON_FALLBACKS[w]
    if (w.includes('infested hive')) return 'wiki:InfestedHiveF.png'
    return undefined
  }

  // Curated Verified Official NPC Portraits & Syndicate Avatars for all 33 Vendors
  const VENDOR_PORTRAITS_BY_ID = {
    'vendor-baro-kiteer': '/Lotus/Interface/Icons/Player/BaroKiteerAvatar.png',
    'vendor-varzia': '/Lotus/Interface/Icons/StoreIcons/MarketBundles/MegaPrimeVault/Varzia.png',
    'vendor-teshin': 'wiki:Teshin.png',
    'vendor-arbitration-hexis': 'wiki:thumb/Arbitrations.png/256px-Arbitrations.png',
    'vendor-cephalon-simaris': '/Lotus/Interface/Icons/Player/Syndicates/CephalonSimarisAvatar.png',
    'vendor-ergo-glast': 'wiki:Ergo_Glast.png',
    'vendor-maroo-darvo': 'wiki:Maroo.png',
    'vendor-palladino': 'wiki:thumb/Palladino.png/256px-Palladino.png',
    'vendor-steel-meridian': '/Lotus/Interface/Icons/Player/Syndicates/SteelMeridianAvatar.png',
    'vendor-arbiters-hexis': '/Lotus/Interface/Icons/Player/Syndicates/ArbitersHexisAvatar.png',
    'vendor-cephalon-suda': '/Lotus/Interface/Icons/Player/Syndicates/CephalonSudaAvatar.png',
    'vendor-perrin-sequence': '/Lotus/Interface/Icons/Player/Syndicates/PerrinSequenceAvatar.png',
    'vendor-red-veil': '/Lotus/Interface/Icons/Player/Syndicates/RedVeilAvatar.png',
    'vendor-new-loka': '/Lotus/Interface/Icons/Player/Syndicates/NewLokaAvatar.png',
    'vendor-ostron-cetus': 'wiki:thumb/Konzu_1SH.png/256px-Konzu_1SH.png',
    'vendor-quills-onkko': 'wiki:thumb/Onkko_Primary_1SH.png/256px-Onkko_Primary_1SH.png',
    'vendor-koumei-nakak': 'wiki:thumb/Nakak_1SH.png/256px-Nakak_1SH.png',
    'vendor-solaris-fortuna': 'wiki:thumb/Eudico_1SH.png/256px-Eudico_1SH.png',
    'vendor-little-duck': 'wiki:thumb/Little_Duck_3SH.png/256px-Little_Duck_3SH.png',
    'vendor-ventkids-roky': 'wiki:thumb/Roky_1SH.png/256px-Roky_1SH.png',
    'vendor-otak-deimos': 'wiki:thumb/Otak.jpg/256px-Otak.jpg',
    'vendor-entrati-family': 'wiki:thumb/MotherEntrati.jpg/256px-MotherEntrati.jpg',
    'vendor-loid-necraloid': 'wiki:NecraloidIcon.png',
    'vendor-sanctum-cavia-loid': 'wiki:thumb/Bird_3.jpg/256px-Bird_3.jpg',
    'vendor-triad-tau-prequel': 'wiki:RoatheGeminiSkin.png',
    'vendor-archimedean-yonta': 'wiki:thumb/ArchimedeanYonta.png/256px-ArchimedeanYonta.png',
    'vendor-cavalero-quinn': 'wiki:thumb/Cavalero.png/256px-Cavalero.png',
    'vendor-acrithis-duviri': 'wiki:thumb/Acrithis.png/256px-Acrithis.png',
    'vendor-nora-night': 'wiki:thumb/Nora_Night_transmission.png/256px-Nora_Night_transmission.png',
    'vendor-chipper-kahl': 'wiki:thumb/ChipperInGame.png/256px-ChipperInGame.png',
    'vendor-ordis-jade': 'wiki:OrdisArchwingtrailer.png',
    'vendor-eleanor-1999': 'wiki:EleanorGeminiSkin.png',
    'vendor-hex-mall-1999': 'wiki:ArthurGeminiSkin.png'
  }

  // Reverse English -> French translation map across all items/mods/resources for drop tables
  const enToFrItemName = new Map()
  for (const [, val] of universalItems.entries()) {
    if (val.en && val.fr) {
      enToFrItemName.set(norm(val.en), val.fr)
    }
  }
  for (const [, entry] of codexLookup.entries()) {
    if (entry.nameEn && entry.nameFr) {
      enToFrItemName.set(norm(entry.nameEn), entry.nameFr)
    }
  }

  function translateDropItemFr(rawEnName) {
    const cleanEn = cleanText(rawEnName)
    if (norm(cleanEn) === 'region resource') return 'Ressource régionale de la planète'
    const direct = enToFrItemName.get(norm(cleanEn))
    if (direct) return direct
    if (cleanEn.endsWith(' Blueprint')) {
      const base = cleanEn.slice(0, -' Blueprint'.length).trim()
      const baseFr = enToFrItemName.get(norm(base))
      if (baseFr) return `${baseFr} (Schéma)`
    }
    return cleanEn.replace(/\bEndo\b/g, 'Endo').replace(/\bBlueprint\b/g, 'Schéma')
  }

  function matchCodexEntry(enName, frName) {
    const cleanEn = norm(enName).replace(/ blueprint$/, '').trim()
    const cleanFr = norm(frName).replace(/ \(schema\)$/, '').replace(/ schema$/, '').trim()
    return (
      codexLookup.get(norm(enName)) ||
      codexLookup.get(norm(frName)) ||
      codexLookup.get(cleanEn) ||
      codexLookup.get(cleanFr) ||
      null
    )
  }

  // 3. Index Enemy Drop Tables by normalized English enemy name
  const dropsByEnemyEn = new Map()
  function pushEnemyDrop(enemyEn, itemEn, chancePct, rarity, typeLabelFr) {
    if (!enemyEn || !itemEn || !(chancePct > 0)) return
    const key = norm(enemyEn)
    const list = dropsByEnemyEn.get(key) || []
    list.push({
      itemEn: cleanText(itemEn),
      chancePct: Number(Math.min(100, Math.max(0.01, chancePct)).toFixed(2)),
      rarity: rarity || 'Common',
      typeLabelFr
    })
    dropsByEnemyEn.set(key, list)
  }

  for (const tbl of modTablesWrap.enemyModTables || []) {
    const tableChance = parseFloat(tbl.enemyModDropChance || tbl.ememyModDropChance || '0')
    if (!(tableChance > 0)) continue
    for (const m of tbl.mods || []) {
      const eff = (tableChance / 100) * Number(m.chance || 0)
      pushEnemyDrop(tbl.enemyName, m.modName, eff, m.rarity, 'Mod / Arcane')
    }
  }

  for (const tbl of bpTablesWrap.enemyBlueprintTables || []) {
    const bpChance = parseFloat(tbl.blueprintDropChance || '100')
    for (const it of tbl.items || tbl.mods || []) {
      const name = it.itemName || it.modName
      const eff = ((Number.isFinite(bpChance) ? bpChance : 100) / 100) * Number(it.chance || 0)
      pushEnemyDrop(tbl.enemyName, name, eff, it.rarity, 'Schéma / Objet')
    }
  }

  for (const tbl of resByAvatarWrap.resourceByAvatar || []) {
    for (const it of tbl.items || []) {
      pushEnemyDrop(tbl.source, it.item, Number(it.chance || 0), it.rarity, 'Ressource')
    }
  }

  for (const tbl of addItemByAvatarWrap.additionalItemByAvatar || []) {
    for (const it of tbl.items || []) {
      pushEnemyDrop(tbl.source, it.item, Number(it.chance || 0), it.rarity, 'Butin bonus')
    }
  }

  // 4. Build Mobs List (~600+ clean entries)
  const avatarsMap = expEnemies.avatars || {}
  const mobsByKey = new Map()

  for (const raw of wfcdEnemies) {
    if (!raw || !raw.name || !raw.uniqueName) continue
    const enName = cleanText(raw.name)
    if (!enName || enName.length < 2) continue

    const avatar = avatarsMap[raw.uniqueName]
    const frFromDict = avatar?.name ? cleanText(dictFr[avatar.name] || '') : ''
    const frName = frFromDict || enName
    const descKey = avatar?.description || ''
    const descFr = cleanText(dictFr[descKey] || raw.description || '')

    const lowerEn = enName.toLowerCase()
    const curatedBoss = BOSS_LOCATIONS.find(
      (b) => lowerEn.includes(b.match) && (!b.exclude || !lowerEn.includes(b.exclude))
    )

    const faction = resolveFaction(raw.type || avatar?.faction || '', raw.uniqueName, enName)
    const health = Math.max(0, Math.round(Number(raw.health ?? avatar?.health ?? 100)))
    const shield = Math.max(0, Math.round(Number(raw.shield ?? avatar?.shield ?? 0)))
    const armor = Math.max(0, Math.round(Number(raw.armor ?? avatar?.armor ?? 0)))
    const unitTier = classifyUnitTier(raw.uniqueName, enName, health, Boolean(curatedBoss))

    // Decode regionBits (0..24)
    const bits = Number(raw.regionBits || 0)
    const decodedRegions = []
    for (let bit = 0; bit <= 24; bit += 1) {
      if ((bits & (1 << bit)) !== 0) {
        const reg = systemBitMap.get(bit)
        if (reg && reg.fr) decodedRegions.push(reg)
      }
    }

    // Build Spawns with explicit spawnChancePct (for colored bar under %)
    const spawns = []
    const planetsFrSet = new Set()
    const planetsEnSet = new Set()

    if (curatedBoss) {
      planetsFrSet.add(curatedBoss.planetFr)
      planetsEnSet.add(curatedBoss.planetEn)
      spawns.push({
        locationFr: curatedBoss.locationFr,
        locationEn: curatedBoss.locationEn,
        conditionFr: curatedBoss.conditionFr,
        spawnChancePct: 100
      })
    }

    const baseSpawnPct =
      unitTier === 'boss' ? 100 : unitTier === 'eximus' ? 24 : 72

    if (decodedRegions.length > 0) {
      for (const reg of decodedRegions) {
        planetsFrSet.add(reg.fr)
        planetsEnSet.add(reg.en)
        if (!curatedBoss || reg.fr !== curatedBoss.planetFr) {
          spawns.push({
            locationFr: `${reg.fr} — Missions ${faction.fr}`,
            locationEn: `${reg.en} — ${faction.en} Missions`,
            conditionFr:
              unitTier === 'eximus'
                ? 'Apparition régulière (fréquence accrue en Survie / Défense / Route de l’Acier)'
                : 'Unité régionale standard dans les escouades ennemies',
            spawnChancePct: baseSpawnPct
          })
        }
      }
    }

    // Fallback smart location inference when regionBits === 0
    if (spawns.length === 0) {
      const uLow = `${raw.uniqueName} ${enName}`.toLowerCase()
      if (uLow.includes('acolyte')) {
        planetsFrSet.add('Route de l’Acier')
        planetsEnSet.add('Steel Path')
        spawns.push({
          locationFr: 'Toute planète (Mode Route de l’Acier actif)',
          locationEn: 'Any Planet (Steel Path active)',
          conditionFr: '1 Acolyte apparaît toutes les 3 à 8 minutes en tuant des ennemis',
          spawnChancePct: 100
        })
      } else if (uLow.includes('stalker')) {
        planetsFrSet.add('Système Origine')
        planetsEnSet.add('Origin System')
        spawns.push({
          locationFr: 'Toute mission standard (Joueur marqué après un Boss)',
          locationEn: 'Any Standard Mission (Death Mark)',
          conditionFr: '1,5 % base + 0,5 % par joueur marqué dans l’escouade (jusqu’à 3,5 %)',
          spawnChancePct: 3.5
        })
      } else if (uLow.includes('zanuka') || uLow.includes('harvester')) {
        planetsFrSet.add('Missions Corpus')
        planetsEnSet.add('Corpus Missions')
        spawns.push({
          locationFr: 'Missions Corpus (Marqué après 5 Invasions pro-Grineer)',
          locationEn: 'Corpus Missions (Marked by Alad V)',
          conditionFr: 'Jusqu’à 3,5 % dans les 4 premières minutes de mission',
          spawnChancePct: 3.5
        })
      } else if (uLow.includes('grustrag') || uLow.includes('ustrag')) {
        planetsFrSet.add('Missions Grineer')
        planetsEnSet.add('Grineer Missions')
        spawns.push({
          locationFr: 'Missions Grineer (Marqué après 5 Invasions pro-Corpus)',
          locationEn: 'Grineer Missions (Marked by Vay Hek)',
          conditionFr: 'Jusqu’à 3,5 % dans les 4 premières minutes de mission',
          spawnChancePct: 3.5
        })
      } else if (faction.id === 'scaldra' || faction.id === 'techrot') {
        planetsFrSet.add('Höllvanie')
        planetsEnSet.add('Höllvania')
        spawns.push({
          locationFr: `Höllvanie (1999) — Mises à prix & Missions ${faction.fr}`,
          locationEn: `Höllvania (1999) — ${faction.en} Missions`,
          conditionFr: unitTier === 'eximus' ? 'Unité lourde / élite 1999' : 'Troupe fréquente à Höllvanie',
          spawnChancePct: unitTier === 'eximus' ? 28 : 75
        })
      } else if (faction.id === 'murmur') {
        planetsFrSet.add('Deimos')
        planetsEnSet.add('Deimos')
        spawns.push({
          locationFr: 'Deimos — Laboratoires d’Albrecht (Sanctum Anatomica)',
          locationEn: "Deimos — Albrecht's Laboratories",
          conditionFr: 'Mises à prix Cavia, Cellules de Netra & Archimédée Profonde',
          spawnChancePct: unitTier === 'eximus' ? 26 : 70
        })
      } else if (faction.id === 'duviri') {
        planetsFrSet.add('Duviri')
        planetsEnSet.add('Duviri')
        spawns.push({
          locationFr: 'Duviri — L’Expérience Duviri & Le Circuit (Hypogée)',
          locationEn: 'Duviri Experience & The Circuit',
          conditionFr: 'Rencontres Dax à Duviri et vagues du Circuit',
          spawnChancePct: unitTier === 'eximus' ? 30 : 75
        })
      } else if (uLow.includes('thrax') || uLow.includes('zariman')) {
        planetsFrSet.add('Zariman')
        planetsEnSet.add('Zariman')
        spawns.push({
          locationFr: 'Zariman Ten Zero & Survie Conjonction (Lua)',
          locationEn: 'Zariman Ten Zero & Lua Conjunction Survival',
          conditionFr: 'Cascade du Néant, Déluge, Armageddon & Conjonction Lua',
          spawnChancePct: 45
        })
      } else if (faction.id === 'narmer') {
        planetsFrSet.add('Terre')
        planetsFrSet.add('Vénus')
        planetsEnSet.add('Earth')
        planetsEnSet.add('Venus')
        spawns.push({
          locationFr: 'Mises à prix Narmer (Cetus / Fortuna) & Chasse à l’Archonte',
          locationEn: 'Narmer Bounties & Archon Hunt',
          conditionFr: 'Disponible après la quête « La Nouvelle Guerre »',
          spawnChancePct: unitTier === 'eximus' ? 25 : 70
        })
      } else if (uLow.includes('kosma') || uLow.includes('gyre') || uLow.includes('exo ') || uLow.includes('taro') || uLow.includes('vorac') || uLow.includes('orm') || uLow.includes('aurax')) {
        planetsFrSet.add('Empyrée (Railjack)')
        planetsEnSet.add('Empyrean (Railjack)')
        spawns.push({
          locationFr: 'Missions Empyrée (Railjack — Proxima Terre, Vénus, Saturne, Neptune, Pluton, Voile)',
          locationEn: 'Empyrean Railjack Proxima Missions',
          conditionFr: 'Équipage de vaisseaux amiraux, transporteurs et objectifs Railjack',
          spawnChancePct: unitTier === 'eximus' ? 30 : 72
        })
      } else if (uLow.includes('tusk')) {
        planetsFrSet.add('Terre')
        planetsEnSet.add('Earth')
        spawns.push({
          locationFr: 'Terre — Plaines d’Eidolon (Mises à prix & Camps Grineer Ivoire)',
          locationEn: 'Earth — Plains of Eidolon',
          conditionFr: 'Unité Grineer Ivoire spécifique aux Plaines',
          spawnChancePct: unitTier === 'eximus' ? 25 : 78
        })
      } else if (uLow.includes('terra')) {
        planetsFrSet.add('Vénus')
        planetsEnSet.add('Venus')
        spawns.push({
          locationFr: 'Vénus — Vallée Orbis (Niveau d’Alerte Balises Corpus Terra)',
          locationEn: 'Venus — Orb Vallis',
          conditionFr: 'Unité Corpus Terra spécifique à la Vallée Orbis',
          spawnChancePct: unitTier === 'eximus' ? 25 : 78
        })
      } else if (faction.id === 'orokin') {
        planetsFrSet.add('Néant')
        planetsEnSet.add('Void')
        spawns.push({
          locationFr: 'Néant & Missions de Fissures du Néant (Reliques)',
          locationEn: 'Void & Void Fissure Missions',
          conditionFr: 'Apparaît nativement dans le Néant ou par corruption de fissure',
          spawnChancePct: unitTier === 'eximus' ? 25 : 68
        })
      } else if (faction.id === 'sentient') {
        planetsFrSet.add('Lua')
        planetsFrSet.add('Proxima du Voile')
        planetsEnSet.add('Lua')
        planetsEnSet.add('Veil Proxima')
        spawns.push({
          locationFr: 'Lua (Platon / Tycho), Anomalie Proxima du Voile & Chasse à l’Archonte',
          locationEn: 'Lua, Veil Proxima Anomaly & Archon Hunt',
          conditionFr: 'Escouades d’éclaireurs Sentient',
          spawnChancePct: 35
        })
      } else {
        planetsFrSet.add(`Missions ${faction.fr}`)
        planetsEnSet.add(`${faction.en} Missions`)
        spawns.push({
          locationFr: `Carte Céleste — Nœuds de mission ${faction.fr}`,
          locationEn: `Star Chart — ${faction.en} Nodes`,
          conditionFr: unitTier === 'eximus' ? 'Apparition graduelle avec le niveau d’alarme' : 'Troupe régulière de la faction',
          spawnChancePct: unitTier === 'eximus' ? 18 : 65
        })
      }
    }

    // Collect & deduplicate Drops for this Mob
    const dropMap = new Map()
    const directTableDrops = dropsByEnemyEn.get(norm(enName)) || []
    for (const d of directTableDrops) {
      const prev = dropMap.get(norm(d.itemEn))
      if (!prev || d.chancePct > prev.chancePct) {
        dropMap.set(norm(d.itemEn), d)
      }
    }

    // Also include Enemy.json drops with numeric chance
    for (const d of raw.drops || []) {
      if (d && d.location && typeof d.chance === 'number' && d.chance > 0) {
        // Enemy.json `chance` is sometimes 0..1 or 0..100; in Enemy.json 0.7588 means 0.76% or 75.88%?
        // Note: WFCD Enemy.json stores `chance` ALREADY multiplied as percentage or fraction: let's prefer enemyModTables first, only add if missing
        const dKey = norm(d.location)
        if (!dropMap.has(dKey)) {
          const pct = d.chance <= 1 ? Number((d.chance * 100).toFixed(2)) : Number(d.chance.toFixed(2))
          dropMap.set(dKey, {
            itemEn: cleanText(d.location),
            chancePct: Math.min(100, Math.max(0.01, pct)),
            rarity: d.rarity || 'Common',
            typeLabelFr: 'Butin'
          })
        }
      }
    }

    // If curated Boss has mission assassination rewards (e.g., Sargas Ruk -> Ember parts!), include them!
    if (curatedBoss?.missionKey) {
      const [pKey, nKey] = curatedBoss.missionKey
      const nodeData = missionRewardsWrap?.missionRewards?.[pKey]?.[nKey]
      const rewardsList = Array.isArray(nodeData?.rewards)
        ? nodeData.rewards
        : nodeData?.rewards?.A || []
      for (const rw of rewardsList) {
        if (rw?.itemName && rw?.chance) {
          const rKey = norm(rw.itemName)
          if (!dropMap.has(rKey) || rw.chance > dropMap.get(rKey).chancePct) {
            dropMap.set(rKey, {
              itemEn: cleanText(rw.itemName),
              chancePct: Number(Number(rw.chance).toFixed(2)),
              rarity: rw.rarity || 'Common',
              typeLabelFr: 'Récompense Assassinat'
            })
          }
        }
      }
    }

    const finalDrops = Array.from(dropMap.values())
      .map((d) => {
        const nameFr = translateDropItemFr(d.itemEn)
        const matched = matchCodexEntry(d.itemEn, nameFr)
        return {
          nameFr,
          nameEn: d.itemEn,
          chancePct: d.chancePct,
          rarity: d.rarity,
          typeLabelFr: d.typeLabelFr,
          ...(matched ? { linkedCodexId: matched.id, linkedCategory: matched.category } : {})
        }
      })
      .sort((a, b) => b.chancePct - a.chancePct)
      .slice(0, 28)

    // Deduplicate identical display-name + faction variants by merging drops/spawns
    const officialMobImg = resolveOfficialMobIcon(raw.uniqueName, enName)
    const dedupKey = `${norm(frName)}::${faction.id}::${unitTier}`
    const existing = mobsByKey.get(dedupKey)
    if (!existing) {
      const baseSlug = `mob-${slugify(enName)}`
      mobsByKey.set(dedupKey, {
        id: baseSlug,
        uniqueName: raw.uniqueName,
        name: frName,
        en: enName,
        desc: descFr,
        img: officialMobImg,
        factionId: faction.id,
        factionFr: faction.fr,
        factionEn: faction.en,
        unitTier,
        health,
        shield,
        armor,
        scansRequired: Number(avatar?.codexScansRequired || 3),
        weaknessesFr: faction.weaknessesFr,
        resistancesFr: faction.resistancesFr,
        planetsFr: Array.from(planetsFrSet),
        planetsEn: Array.from(planetsEnSet),
        spawns: spawns.slice(0, 6),
        drops: finalDrops
      })
    } else {
      // Merge extra planets & drops if a technical sub-avatar had additional ones
      for (const pf of planetsFrSet) {
        if (!existing.planetsFr.includes(pf)) existing.planetsFr.push(pf)
      }
      for (const pe of planetsEnSet) {
        if (!existing.planetsEn.includes(pe)) existing.planetsEn.push(pe)
      }
      const existingDropNames = new Set(existing.drops.map((x) => norm(x.nameEn)))
      for (const fd of finalDrops) {
        if (!existingDropNames.has(norm(fd.nameEn)) && existing.drops.length < 32) {
          existing.drops.push(fd)
          existingDropNames.add(norm(fd.nameEn))
        }
      }
      existing.drops.sort((a, b) => b.chancePct - a.chancePct)
      if (!existing.img && officialMobImg) existing.img = officialMobImg
    }
  }

  // Ensure unique IDs across all mobs
  const usedMobIds = new Set()
  const mobs = Array.from(mobsByKey.values())
    .map((m) => {
      let id = m.id
      let seq = 2
      while (usedMobIds.has(id)) {
        id = `${m.id}-${seq}`
        seq += 1
      }
      usedMobIds.add(id)
      return { ...m, id }
    })
    .sort((a, b) => {
      // Bosses & iconic units with drops stay crisp and alphabetical in French
      return a.name.localeCompare(b.name, 'fr')
    })

  // 5. Build Vendors List with complete FR/EN offerings
  function resolveStoreItemMeta(storeItemPath) {
    if (!storeItemPath) return null
    const directPath = storeItemPath.replace('/Lotus/StoreItems/', '/Lotus/')
    const meta = universalItems.get(directPath) || universalItems.get(storeItemPath)
    if (meta) return meta
    // Fallback humanized leaf name
    const leaf = storeItemPath.split('/').pop() || storeItemPath
    const humanized = leaf
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/StoreItem|Product|Manifest/gi, '')
      .trim()
    return { fr: humanized, en: humanized, isBlueprint: false }
  }

  function resolveCurrencyNameFr(itemTypePath) {
    if (!itemTypePath) return 'Ressource'
    const directPath = itemTypePath.replace('/Lotus/StoreItems/', '/Lotus/')
    const meta = universalItems.get(directPath) || universalItems.get(itemTypePath)
    if (meta?.fr) return meta.fr
    const low = itemTypePath.toLowerCase()
    if (low.includes('belric')) return 'Cristaux de Belric'
    if (low.includes('rania')) return 'Cristaux de Rania'
    if (low.includes('vitus')) return 'Essence Vitus'
    if (low.includes('steelessence') || low.includes('hardmode')) return 'Essence d’Acier'
    if (low.includes('holokey')) return 'Holoclefs Corrompues'
    if (low.includes('pathos')) return 'Pinces de Pathos'
    if (low.includes('kullervo')) return 'Fléau de Kullervo'
    if (low.includes('gyrum')) return 'Gyrum d’Énigme'
    if (low.includes('capillar')) return 'Capillaires de Vaisseaux'
    if (low.includes('heartcell')) return 'Cellules Cardiaques Vivantes'
    if (low.includes('fatepearl') || low.includes('koumei')) return 'Perles du Destin'
    if (low.includes('vestigial') || low.includes('ascension')) return 'Granules Vestigiaux'
    if (low.includes('rivensliver') || low.includes('donda')) return 'Brisures Riven'
    if (low.includes('kahl') || low.includes('stock')) return 'Stock'
    if (low.includes('thrax')) return 'Plasma Thrax Lua'
    return (itemTypePath.split('/').pop() || 'Jeton').replace(/([a-z])([A-Z])/g, '$1 $2')
  }

  const vendors = CURATED_VENDORS.map((vDef) => {
    const offeringsByKey = new Map()

    function addOffering(rawOff) {
      const key = norm(rawOff.nameEn || rawOff.nameFr)
      if (!key || key.length < 2) return
      // Skip internal invisible dummy tokens
      if (key.includes('dummy') || key.includes('test')) return
      if (offeringsByKey.has(key)) return

      const matched = matchCodexEntry(rawOff.nameEn, rawOff.nameFr)
      const cat =
        rawOff.category || classifyOfferingCategory(rawOff.storePath || '', rawOff.nameEn, rawOff.nameFr)
      const offeringImage = matched?.img || rawOff.icon || undefined

      offeringsByKey.set(key, {
        id: `${vDef.id}-off-${offeringsByKey.size + 1}`,
        nameFr: rawOff.nameFr,
        nameEn: rawOff.nameEn,
        category: cat,
        ...(offeringImage ? { imageName: offeringImage } : {}),
        ...(rawOff.rankRequiredFr ? { rankRequiredFr: rawOff.rankRequiredFr } : {}),
        costs:
          rawOff.costs.length > 0
            ? rawOff.costs
            : [{ amount: 1, currencyFr: 'Ressources locales (Rotation)' }],
        ...(matched ? { linkedCodexId: matched.id, linkedCategory: matched.category } : {}),
        ...(matched?.tradable ? { isTradable: true } : {})
      })
    }

    // A. Curated items first (e.g. Baro, Varzia, Nora)
    for (const cIt of vDef.curatedItems || []) {
      const nameEn = cIt.nameEn
      const nameFr = cIt.nameFr || translateDropItemFr(nameEn)
      addOffering({
        nameFr,
        nameEn,
        category: cIt.cat,
        costs: cIt.costs
      })
    }

    // B. Official ExportVendors manifests
    for (const mKey of vDef.manifests || []) {
      const manifest = expVendors[mKey]
      if (!manifest || !Array.isArray(manifest.items)) continue
      for (const entry of manifest.items) {
        if (!entry?.storeItem) continue
        const meta = resolveStoreItemMeta(entry.storeItem)
        if (!meta) continue
        const qtySuffix = entry.quantity && entry.quantity > 1 ? ` (×${entry.quantity})` : ''
        const costs = []
        if (entry.credits && entry.credits > 0) {
          costs.push({ amount: Number(entry.credits), currencyFr: 'Crédits' })
        }
        if (Array.isArray(entry.regularPrice) && entry.regularPrice[0] > 0) {
          costs.push({ amount: Number(entry.regularPrice[0]), currencyFr: 'Crédits' })
        }
        for (const ip of entry.itemPrices || []) {
          if (ip?.ItemCount > 0 && ip?.ItemType) {
            costs.push({
              amount: Number(ip.ItemCount),
              currencyFr: resolveCurrencyNameFr(ip.ItemType)
            })
          }
        }
        addOffering({
          storePath: entry.storeItem,
          nameFr: `${meta.fr}${qtySuffix}`,
          nameEn: `${meta.en}${qtySuffix}`,
          icon: meta.icon,
          costs
        })
      }
    }

    // C. Official ExportSyndicates favours
    for (const sKey of vDef.syndicates || []) {
      const syn = expSyndicates[sKey]
      if (!syn || !Array.isArray(syn.favours)) continue
      const synNameFr = cleanText(dictFr[syn.name] || vDef.nameFr)
      for (const fav of syn.favours) {
        if (!fav?.storeItem) continue
        const meta = resolveStoreItemMeta(fav.storeItem)
        if (!meta) continue
        const costs = []
        if (fav.standingCost && fav.standingCost > 0) {
          costs.push({
            amount: Number(fav.standingCost),
            currencyFr: sKey.startsWith('RadioLegion') ? 'Crédits Nora' : `Réputation (${synNameFr})`
          })
        }
        if (fav.creditsCost && fav.creditsCost > 0) {
          costs.push({ amount: Number(fav.creditsCost), currencyFr: 'Crédits' })
        }
        addOffering({
          storePath: fav.storeItem,
          nameFr: meta.fr,
          nameEn: meta.en,
          icon: meta.icon,
          rankRequiredFr:
            typeof fav.requiredLevel === 'number' && fav.requiredLevel > 0
              ? `Rang ${fav.requiredLevel}`
              : undefined,
          costs
        })
      }
    }

    // Sort offerings: equipment & mods/arcanes first, then resources/relics, then cosmetics!
    const catOrder = { equipment: 0, mod_arcane: 1, resource_relic: 2, cosmetic_misc: 3 }
    const offerings = Array.from(offeringsByKey.values()).sort((a, b) => {
      const ca = catOrder[a.category] ?? 9
      const cb = catOrder[b.category] ?? 9
      if (ca !== cb) return ca - cb
      return a.nameFr.localeCompare(b.nameFr, 'fr')
    })

    const vendorImg =
      vDef.img ||
      VENDOR_PORTRAITS_BY_ID[vDef.id] ||
      (vDef.syndicates?.[0] ? expSyndicates[vDef.syndicates[0]]?.icon : undefined)

    return {
      id: vDef.id,
      name: vDef.nameFr,
      en: vDef.nameEn,
      img: vendorImg,
      roleFr: vDef.roleFr,
      roleEn: vDef.roleEn,
      hubGroup: vDef.hubGroup,
      planetFr: vDef.planetFr,
      planetEn: vDef.planetEn,
      hubFr: vDef.hubFr,
      hubEn: vDef.hubEn,
      zoneFr: vDef.zoneFr,
      unlockQuestFr: vDef.unlockQuestFr,
      currencies: vDef.currencies,
      offerings
    }
  })

  const outPayload = {
    generatedAt: new Date().toISOString(),
    mobsCount: mobs.length,
    vendorsCount: vendors.length,
    mobs,
    vendors
  }

  const outPath = resolve('resources/codex-mobs-vendors.json')
  writeFileSync(outPath, JSON.stringify(outPayload))

  const sizeKb = Math.round(Buffer.byteLength(JSON.stringify(outPayload), 'utf8') / 1024)
  const totalOfferings = vendors.reduce((acc, v) => acc + v.offerings.length, 0)
  const mobsWithDrops = mobs.filter((m) => m.drops.length > 0).length
  console.log(
    `✅ Généré ${outPath} (${sizeKb} Ko) : ${mobs.length} Mobs (${mobsWithDrops} avec tables de drops) & ${vendors.length} Marchands (${totalOfferings} articles vendus) !`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
