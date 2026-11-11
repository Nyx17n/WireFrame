import {
  DUVIRI_INCARNON_ROTATIONS,
  DUVIRI_WARFRAME_ROTATIONS
} from '@shared/data/duviri-rotations'
import type { MarketCatalogItem } from '@shared/schemas/market.schema'
import {
  toWfStatAssetUrl,
  type ArbitrationSnapshot,
  type CycleCardData,
  type DuviriCircuitSnapshot,
  type InvasionEntry,
  type PrimeResurgencePack,
  type SyndicateBountyGroup
} from '@shared/schemas/worldstate.schema'
import type { RawWfStatResponse } from './wfstat-raw.schemas'

const SPIRAL_LABELS: Record<string, { current: string; next: string }> = {
  joy: { current: 'Spirale de la Joie', next: 'Prochaine : Colère' },
  anger: { current: 'Spirale de la Colère', next: 'Prochaine : Envie' },
  envy: { current: 'Spirale de l’Envie', next: 'Prochaine : Tristesse' },
  sorrow: { current: 'Spirale de la Tristesse', next: 'Prochaine : Peur' },
  fear: { current: 'Spirale de la Peur', next: 'Prochaine : Joie' }
}

const MISSION_FR: Record<string, string> = {
  capture: 'Capture',
  extermination: 'Extermination',
  exterminate: 'Extermination',
  sabotage: 'Sabotage',
  rescue: 'Sauvetage',
  disruption: 'Perturbation',
  defense: 'Défense',
  'mobile defense': 'Défense Mobile',
  survival: 'Survie',
  interception: 'Interception',
  excavation: 'Excavation',
  spy: 'Espionnage',
  assassination: 'Assassinat',
  hive: 'Ruche',
  skirmish: 'Escarmouche',
  volatile: 'Volatile',
  orphix: 'Orphix',
  alchemy: 'Alchimie',
  'void cascade': 'Cascade du Néant',
  'void flood': 'Déluge du Néant'
}

const ARBITRATION_FALLBACK_POOL = [
  { node: 'Seimeni (Cérès)', type: 'Défense', enemy: 'Infestés', bonus: '+300% Puissance : Saryn · Torid' },
  { node: 'Hydron (Sedna)', type: 'Défense', enemy: 'Grineer', bonus: '+300% Puissance : Wisp · Glaive' },
  { node: 'Apollo (Lua)', type: 'Perturbation', enemy: 'Corpus', bonus: '+300% Puissance : Volt · Laetum' },
  { node: 'Mot (Néant)', type: 'Survie', enemy: 'Orokin', bonus: '+300% Puissance : Revenant · Phenmor' },
  { node: 'Hieracon (Pluton)', type: 'Excavation', enemy: 'Infestés', bonus: '+300% Puissance : Frost · Nikana' },
  { node: 'Olympus (Mars)', type: 'Perturbation', enemy: 'Grineer', bonus: '+300% Puissance : Gauss · Burston' }
] as const

const BARO_NAME_OVERRIDES: Record<string, string> = {
  'weapon glaive secondary headshot kill mod': 'mark_of_the_beast',
  'primed weapon faction damage murmurs': 'primed_bane_of_the_murmur',
  'grn orokin rifle weapon': 'gotva_prime',
  'archwing rifle ammo max mod expert': 'primed_magazine_warp'
}

export function translateMissionType(rawType: string): string {
  const clean = rawType.trim()
  return MISSION_FR[clean.toLowerCase()] ?? clean
}

export function isFastMissionType(rawType: string): boolean {
  const k = rawType.toLowerCase()
  return (
    k.includes('capture') ||
    k.includes('exterminat') ||
    k.includes('sabotage') ||
    k.includes('rescue') ||
    k.includes('sauvetage') ||
    k.includes('disruption') ||
    k.includes('perturbation')
  )
}

export function toMarketSlugCandidate(label: string): string {
  return label
    .toLowerCase()
    .replace(/^\d+x\s+/i, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function findCatalogItemByLabel(
  label: string,
  bySlug: Map<string, MarketCatalogItem>,
  byLowerName: Map<string, MarketCatalogItem>
): MarketCatalogItem | null {
  const cleaned = label.replace(/^\d+x\s+/i, '').trim()
  if (!cleaned) return null
  const lower = cleaned.toLowerCase()
  const override = BARO_NAME_OVERRIDES[lower]
  if (override && bySlug.has(override)) {
    return bySlug.get(override) ?? null
  }
  const byName = byLowerName.get(lower)
  if (byName) return byName
  const slug = toMarketSlugCandidate(cleaned)
  return bySlug.get(slug) ?? bySlug.get(`${slug}_blueprint`) ?? null
}

export function mapCycles(raw: RawWfStatResponse): CycleCardData[] {
  const cards: CycleCardData[] = []

  if (raw.cetusCycle) {
    const isDay = raw.cetusCycle.state === 'day' || Boolean(raw.cetusCycle.isDay)
    cards.push({
      key: 'cetus',
      zoneFr: 'Plaines d’Eidolon (Cetus)',
      planetFr: 'Terre',
      state: isDay ? 'day' : 'night',
      stateLabelFr: isDay ? 'Jour' : 'Nuit (Eidolons)',
      nextStateLabelFr: isDay ? 'Nuit dans' : 'Jour dans',
      tone: isDay ? 'sun' : 'moon',
      activation: raw.cetusCycle.activation,
      expiry: raw.cetusCycle.expiry
    })
  }

  if (raw.vallisCycle) {
    const isWarm = raw.vallisCycle.state === 'warm' || Boolean(raw.vallisCycle.isWarm)
    cards.push({
      key: 'vallis',
      zoneFr: 'Vallée Orbis (Fortuna)',
      planetFr: 'Vénus',
      state: isWarm ? 'warm' : 'cold',
      stateLabelFr: isWarm ? 'Chaud' : 'Froid',
      nextStateLabelFr: isWarm ? 'Froid dans' : 'Chaud dans',
      tone: isWarm ? 'warm' : 'cold',
      activation: raw.vallisCycle.activation,
      expiry: raw.vallisCycle.expiry
    })
  }

  if (raw.cambionCycle) {
    const isVome = raw.cambionCycle.state.toLowerCase() === 'vome'
    cards.push({
      key: 'cambion',
      zoneFr: 'Puy de Cambion (Nécrallisk)',
      planetFr: 'Deimos',
      state: isVome ? 'vome' : 'fass',
      stateLabelFr: isVome ? 'Vome (Ordre)' : 'Fass (Chaos)',
      nextStateLabelFr: isVome ? 'Fass dans' : 'Vome dans',
      tone: isVome ? 'vome' : 'fass',
      activation: raw.cambionCycle.activation,
      expiry: raw.cambionCycle.expiry
    })
  }

  if (raw.duviriCycle) {
    const st = raw.duviriCycle.state.toLowerCase()
    const spiral = SPIRAL_LABELS[st] ?? { current: `Spirale : ${st}`, next: 'Rotation dans' }
    cards.push({
      key: 'duviri',
      zoneFr: 'Royaume de Duviri',
      planetFr: 'Néant / Paradoxe',
      state: st,
      stateLabelFr: spiral.current,
      nextStateLabelFr: spiral.next,
      tone: 'spiral',
      activation: raw.duviriCycle.activation,
      expiry: raw.duviriCycle.expiry
    })
  }

  if (raw.zarimanCycle) {
    const isCorpus = raw.zarimanCycle.state.toLowerCase() === 'corpus' || Boolean(raw.zarimanCycle.isCorpus)
    cards.push({
      key: 'zariman',
      zoneFr: 'Zariman Ten Zero',
      planetFr: 'Chrysalithe',
      state: isCorpus ? 'corpus' : 'grineer',
      stateLabelFr: isCorpus ? 'Occupation Corpus' : 'Occupation Grineer',
      nextStateLabelFr: isCorpus ? 'Grineer dans' : 'Corpus dans',
      tone: isCorpus ? 'corpus' : 'grineer',
      activation: raw.zarimanCycle.activation,
      expiry: raw.zarimanCycle.expiry
    })
  }

  if (raw.earthCycle) {
    const isDay = raw.earthCycle.state === 'day' || Boolean(raw.earthCycle.isDay)
    cards.push({
      key: 'earth',
      zoneFr: 'Forêts de la Terre',
      planetFr: 'Terre (Botanique)',
      state: isDay ? 'day' : 'night',
      stateLabelFr: isDay ? 'Jour' : 'Nuit',
      nextStateLabelFr: isDay ? 'Nuit dans' : 'Jour dans',
      tone: isDay ? 'sun' : 'moon',
      activation: raw.earthCycle.activation,
      expiry: raw.earthCycle.expiry
    })
  }

  return cards
}

export function mapBounties(raw: RawWfStatResponse): SyndicateBountyGroup[] {
  const wanted: Array<{ key: 'Ostrons' | 'Solaris United' | 'Entrati'; labelFr: string }> = [
    { key: 'Ostrons', labelFr: 'Ostrons — Plaines d’Eidolon (Cetus)' },
    { key: 'Solaris United', labelFr: 'Union Solaris — Vallée Orbis (Fortuna)' },
    { key: 'Entrati', labelFr: 'Entrati — Puy de Cambion (Deimos)' }
  ]

  const result: SyndicateBountyGroup[] = []
  for (const target of wanted) {
    const found = raw.syndicateMissions.find((s) => s.syndicate === target.key && s.jobs.length > 0)
    if (!found) continue
    result.push({
      id: found.id || target.key,
      syndicateKey: target.key,
      labelFr: target.labelFr,
      expiry: found.expiry,
      jobs: found.jobs.map((j, idx) => {
        const dropMap = new Map<string, { item: string; rarity: string; chance: number; count: number }>()
        for (const d of j.rewardPoolDrops) {
          if (!d.item) continue
          const prev = dropMap.get(d.item)
          if (!prev || d.chance > prev.chance) {
            dropMap.set(d.item, {
              item: d.item,
              rarity: d.rarity,
              chance: Math.round(d.chance * 100) / 100,
              count: d.count
            })
          }
        }
        return {
          id: j.id || `${target.key}-${idx}`,
          type: j.type,
          minLevel: j.enemyLevels[0] ?? 5,
          maxLevel: j.enemyLevels[1] ?? j.enemyLevels[0] ?? 15,
          totalStanding: j.standingStages.reduce((acc, v) => acc + v, 0),
          drops: [...dropMap.values()].sort((a, b) => a.chance - b.chance).slice(0, 12)
        }
      })
    })
  }
  return result
}

export function extractRewardLabel(
  reward:
    | {
        items: string[]
        countedItems: Array<{ type?: string | undefined; key?: string | undefined; count: number }>
      }
    | undefined
): string {
  if (!reward) return ''
  const parts: string[] = []
  for (const ci of reward.countedItems) {
    const name = (ci.type ?? ci.key ?? '').trim()
    if (name) {
      parts.push(ci.count > 1 ? `${ci.count}x ${name}` : name)
    }
  }
  for (const it of reward.items) {
    if (it.trim() && !parts.includes(it.trim())) {
      parts.push(it.trim())
    }
  }
  return parts.join(' + ')
}

export function mapInvasions(
  raw: RawWfStatResponse,
  bySlug: Map<string, MarketCatalogItem>,
  byLowerName: Map<string, MarketCatalogItem>
): InvasionEntry[] {
  return raw.invasions
    .filter((inv) => !inv.completed && inv.completion >= 0 && inv.completion <= 100)
    .map((inv) => {
      const atkLabel = extractRewardLabel(inv.attacker?.reward)
      const defLabel = extractRewardLabel(inv.defender?.reward)
      const combined = `${atkLabel} ${defLabel}`.toLowerCase()
      const isWeaponPart = combined.includes('wraith') || combined.includes('vandal')
      const isRare =
        combined.includes('forma') ||
        combined.includes('catalyst') ||
        combined.includes('catalyseur') ||
        combined.includes('reactor') ||
        combined.includes('réacteur') ||
        combined.includes('exilus')

      const atkItem = atkLabel ? findCatalogItemByLabel(atkLabel, bySlug, byLowerName) : null
      const defItem = defLabel ? findCatalogItemByLabel(defLabel, bySlug, byLowerName) : null

      return {
        id: inv.id,
        node: inv.node,
        desc: inv.desc,
        completion: Math.max(0, Math.min(100, Math.round(inv.completion * 10) / 10)),
        vsInfestation: inv.vsInfestation,
        isRare,
        isWeaponPart,
        attacker: {
          faction: inv.attacker?.faction ?? 'Attaquant',
          rewardLabel: atkLabel,
          thumbnailUrl: toWfStatAssetUrl(inv.attacker?.reward?.thumbnail),
          marketSlug: atkItem?.slug ?? null
        },
        defender: {
          faction: inv.defender?.faction ?? 'Défenseur',
          rewardLabel: defLabel,
          thumbnailUrl: toWfStatAssetUrl(inv.defender?.reward?.thumbnail),
          marketSlug: defItem?.slug ?? null
        }
      }
    })
}

export function resolveArbitration(raw: RawWfStatResponse['arbitration']): ArbitrationSnapshot {
  const now = Date.now()
  const hourIndex = Math.floor(now / 3_600_000)
  const nextHourIso = new Date((hourIndex + 1) * 3_600_000).toISOString()
  const fallback = ARBITRATION_FALLBACK_POOL[hourIndex % ARBITRATION_FALLBACK_POOL.length]!

  const isValidLive =
    raw !== null &&
    !raw.expired &&
    raw.node !== 'SolNode000' &&
    raw.type !== 'Unknown' &&
    raw.type.trim().length > 0

  const node = isValidLive ? raw.node : fallback.node
  const type = isValidLive ? translateMissionType(raw.type) : fallback.type
  const enemy = isValidLive && raw.enemy ? raw.enemy : fallback.enemy
  const expMs = isValidLive ? Date.parse(raw.expiry) : NaN
  const expiry =
    Number.isFinite(expMs) && expMs > now && expMs < now + 86_400_000 ? raw!.expiry : nextHourIso

  const lowerType = type.toLowerCase()
  const isSTier =
    lowerType.includes('survie') ||
    lowerType.includes('survival') ||
    lowerType.includes('défense') ||
    lowerType.includes('defense') ||
    lowerType.includes('excavation') ||
    lowerType.includes('perturbation') ||
    lowerType.includes('disruption')

  return {
    node,
    type,
    enemy,
    bonus: fallback.bonus,
    expiry,
    isSTier,
    isFallback: !isValidLive
  }
}

export function mapDuviriCircuit(raw: RawWfStatResponse): DuviriCircuitSnapshot {
  const duviri = raw.duviriCycle
  const spiralState = duviri?.state.toLowerCase() ?? 'joy'
  const spiralLabelFr = SPIRAL_LABELS[spiralState]?.current ?? `Spirale : ${spiralState}`

  const normalGroup = duviri?.choices.find((c) => c.category.toLowerCase() === 'normal')
  const hardGroup = duviri?.choices.find((c) => c.category.toLowerCase() === 'hard')
  const activeWarframes = normalGroup?.choices ?? []
  const activeIncarnons = hardGroup?.choices ?? []

  const matchedWfWeek = DUVIRI_WARFRAME_ROTATIONS.find((r) =>
    r.frames.every((f) => activeWarframes.some((aw) => aw.toLowerCase() === f.toLowerCase()))
  )
  const matchedIncWeek = DUVIRI_INCARNON_ROTATIONS.find((r) =>
    r.weapons.every((w) => activeIncarnons.some((ai) => ai.toLowerCase() === w.toLowerCase()))
  )

  return {
    spiralState,
    spiralLabelFr,
    spiralExpiry: duviri?.expiry ?? new Date(Date.now() + 3_600_000).toISOString(),
    activeWarframes,
    activeIncarnons,
    activeWarframeWeek: matchedWfWeek?.week ?? null,
    activeIncarnonWeek: matchedIncWeek?.week ?? null
  }
}

export function mapPrimeResurgencePacks(
  raw: RawWfStatResponse,
  bySlug: Map<string, MarketCatalogItem>
): PrimeResurgencePack[] {
  const inv = raw.vaultTrader?.inventory ?? []
  return inv.map((entry) => {
    const cleanLabel = entry.item.replace(/^M\s*P\s*V\s+/i, '').trim()
    const words = cleanLabel.split(/[^a-zA-Z]+/).filter(Boolean)
    const matched: Array<{ slug: string; nameFr: string }> = []
    for (const w of words) {
      const candidateSlug = `${w.toLowerCase()}_prime_set`
      const item = bySlug.get(candidateSlug)
      if (item && !matched.some((m) => m.slug === item.slug)) {
        matched.push({ slug: item.slug, nameFr: item.nameFr })
      }
    }
    return {
      uniqueName: entry.uniqueName,
      label: cleanLabel,
      regalAya: entry.ducats ?? 0,
      matchedSetSlugs: matched
    }
  })
}

