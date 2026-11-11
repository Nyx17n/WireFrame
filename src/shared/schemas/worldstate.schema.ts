import { z } from 'zod'

export function toWfStatAssetUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null
  const prefix = 'https://cdn.warframestat.us/'
  if (!rawUrl.startsWith(prefix)) return null
  const subpath = rawUrl.slice(prefix.length).replace(/^\/+/, '')
  if (!subpath || subpath.includes('..') || subpath.includes('\\')) return null
  return `wf-asset://wfstat/${subpath}`
}

export const CycleCardSchema = z.object({
  key: z.enum(['cetus', 'earth', 'vallis', 'cambion', 'duviri', 'zariman']),
  zoneFr: z.string(),
  planetFr: z.string(),
  state: z.string(),
  stateLabelFr: z.string(),
  nextStateLabelFr: z.string(),
  tone: z.enum(['sun', 'moon', 'warm', 'cold', 'fass', 'vome', 'spiral', 'corpus', 'grineer']),
  activation: z.string(),
  expiry: z.string()
})
export type CycleCardData = z.infer<typeof CycleCardSchema>

export const BountyDropSchema = z.object({
  item: z.string(),
  rarity: z.string(),
  chance: z.number(),
  count: z.number()
})
export type BountyDrop = z.infer<typeof BountyDropSchema>

export const SyndicateJobSchema = z.object({
  id: z.string(),
  type: z.string(),
  minLevel: z.number(),
  maxLevel: z.number(),
  totalStanding: z.number(),
  drops: z.array(BountyDropSchema)
})
export type SyndicateJob = z.infer<typeof SyndicateJobSchema>

export const SyndicateBountyGroupSchema = z.object({
  id: z.string(),
  syndicateKey: z.enum(['Ostrons', 'Solaris United', 'Entrati']),
  labelFr: z.string(),
  expiry: z.string(),
  jobs: z.array(SyndicateJobSchema)
})
export type SyndicateBountyGroup = z.infer<typeof SyndicateBountyGroupSchema>

export const VoidFissureEntrySchema = z.object({
  id: z.string(),
  node: z.string(),
  missionType: z.string(),
  enemy: z.string(),
  tier: z.string(),
  tierNum: z.number(),
  isHard: z.boolean(),
  isStorm: z.boolean(),
  isOmnia: z.boolean(),
  isFastMission: z.boolean(),
  expiry: z.string()
})
export type VoidFissureEntry = z.infer<typeof VoidFissureEntrySchema>

export const EndgameMissionStepSchema = z.object({
  node: z.string(),
  missionType: z.string(),
  modifier: z.string().optional()
})
export type EndgameMissionStep = z.infer<typeof EndgameMissionStepSchema>

export const ArchonSortieSnapshotSchema = z.object({
  id: z.string(),
  boss: z.string(),
  faction: z.string(),
  expiry: z.string(),
  steps: z.array(EndgameMissionStepSchema)
})
export type ArchonSortieSnapshot = z.infer<typeof ArchonSortieSnapshotSchema>

export const InvasionSideSchema = z.object({
  faction: z.string(),
  rewardLabel: z.string(),
  thumbnailUrl: z.string().nullable(),
  marketSlug: z.string().nullable()
})
export type InvasionSide = z.infer<typeof InvasionSideSchema>

export const InvasionEntrySchema = z.object({
  id: z.string(),
  node: z.string(),
  desc: z.string(),
  completion: z.number(),
  vsInfestation: z.boolean(),
  isRare: z.boolean(),
  isWeaponPart: z.boolean(),
  attacker: InvasionSideSchema,
  defender: InvasionSideSchema
})
export type InvasionEntry = z.infer<typeof InvasionEntrySchema>

export const SteelPathItemSchema = z.object({
  name: z.string(),
  cost: z.number()
})
export type SteelPathItem = z.infer<typeof SteelPathItemSchema>

export const SteelPathSnapshotSchema = z.object({
  currentReward: SteelPathItemSchema.nullable(),
  expiry: z.string(),
  isUmbraFormaWeek: z.boolean(),
  rotation: z.array(SteelPathItemSchema),
  evergreens: z.array(SteelPathItemSchema)
})
export type SteelPathSnapshot = z.infer<typeof SteelPathSnapshotSchema>

export const ArbitrationSnapshotSchema = z.object({
  node: z.string(),
  type: z.string(),
  enemy: z.string(),
  bonus: z.string(),
  expiry: z.string(),
  isSTier: z.boolean(),
  isFallback: z.boolean()
})
export type ArbitrationSnapshot = z.infer<typeof ArbitrationSnapshotSchema>

export const VitusModPriceEntrySchema = z.object({
  slug: z.string(),
  labelFr: z.string(),
  labelEn: z.string(),
  category: z.string(),
  vitusCost: z.number(),
  thumb: z.string().nullable(),
  minPlatinum: z.number().nullable(),
  sellerName: z.string().nullable(),
  platPerVitus: z.number().nullable()
})
export type VitusModPriceEntry = z.infer<typeof VitusModPriceEntrySchema>

export const LotusAlertEntrySchema = z.object({
  id: z.string(),
  node: z.string(),
  missionType: z.string(),
  faction: z.string(),
  rewardLabel: z.string(),
  credits: z.number(),
  thumbnailUrl: z.string().nullable(),
  expiry: z.string()
})
export type LotusAlertEntry = z.infer<typeof LotusAlertEntrySchema>

export const WorldEventEntrySchema = z.object({
  id: z.string(),
  description: z.string(),
  tooltip: z.string(),
  node: z.string(),
  healthPercent: z.number().nullable(),
  rewardsSummary: z.array(z.string()),
  expiry: z.string()
})
export type WorldEventEntry = z.infer<typeof WorldEventEntrySchema>

export const NightwaveChallengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  desc: z.string(),
  reputation: z.number(),
  isDaily: z.boolean(),
  isElite: z.boolean(),
  expiry: z.string()
})
export type NightwaveChallenge = z.infer<typeof NightwaveChallengeSchema>

export const DuviriCircuitSnapshotSchema = z.object({
  spiralState: z.string(),
  spiralLabelFr: z.string(),
  spiralExpiry: z.string(),
  activeWarframes: z.array(z.string()),
  activeIncarnons: z.array(z.string()),
  activeWarframeWeek: z.number().nullable(),
  activeIncarnonWeek: z.number().nullable()
})
export type DuviriCircuitSnapshot = z.infer<typeof DuviriCircuitSnapshotSchema>

export const BaroInventoryItemSchema = z.object({
  uniqueName: z.string(),
  name: z.string(),
  nameFr: z.string(),
  ducats: z.number(),
  credits: z.number(),
  marketSlug: z.string().nullable(),
  thumb: z.string().nullable(),
  minPlatinum: z.number().nullable(),
  sellerName: z.string().nullable(),
  platPer100Ducats: z.number().nullable()
})
export type BaroInventoryItem = z.infer<typeof BaroInventoryItemSchema>

export const VoidTraderSnapshotSchema = z.object({
  active: z.boolean(),
  character: z.string(),
  location: z.string(),
  activation: z.string(),
  expiry: z.string(),
  inventory: z.array(BaroInventoryItemSchema)
})
export type VoidTraderSnapshot = z.infer<typeof VoidTraderSnapshotSchema>

export const NewsEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  link: z.string(),
  imageUrl: z.string().nullable(),
  date: z.string(),
  category: z.enum(['update', 'prime', 'stream', 'community'])
})
export type NewsEntry = z.infer<typeof NewsEntrySchema>

export const GlobalBoosterSchema = z.object({
  desc: z.string(),
  expiry: z.string()
})
export type GlobalBooster = z.infer<typeof GlobalBoosterSchema>

export const DarvoDealSchema = z.object({
  id: z.string(),
  item: z.string(),
  originalPrice: z.number(),
  salePrice: z.number(),
  discount: z.number(),
  total: z.number(),
  sold: z.number(),
  expiry: z.string()
})
export type DarvoDeal = z.infer<typeof DarvoDealSchema>

export const PrimeResurgencePackSchema = z.object({
  uniqueName: z.string(),
  label: z.string(),
  regalAya: z.number(),
  matchedSetSlugs: z.array(
    z.object({
      slug: z.string(),
      nameFr: z.string()
    })
  )
})
export type PrimeResurgencePack = z.infer<typeof PrimeResurgencePackSchema>

export const WorldstateHubPayloadSchema = z.object({
  fetchedAt: z.string(),
  cycles: z.array(CycleCardSchema),
  bounties: z.array(SyndicateBountyGroupSchema),
  fissures: z.array(VoidFissureEntrySchema),
  archonHunt: ArchonSortieSnapshotSchema.nullable(),
  sortie: ArchonSortieSnapshotSchema.nullable(),
  invasions: z.array(InvasionEntrySchema),
  steelPath: SteelPathSnapshotSchema,
  arbitration: ArbitrationSnapshotSchema,
  alerts: z.array(LotusAlertEntrySchema),
  events: z.array(WorldEventEntrySchema),
  nightwave: z.array(NightwaveChallengeSchema),
  duviriCircuit: DuviriCircuitSnapshotSchema,
  voidTrader: VoidTraderSnapshotSchema,
  news: z.array(NewsEntrySchema),
  globalBoosters: z.array(GlobalBoosterSchema),
  darvoDeals: z.array(DarvoDealSchema),
  primeResurgence: z.object({
    location: z.string(),
    expiry: z.string(),
    packs: z.array(PrimeResurgencePackSchema)
  })
})
export type WorldstateHubPayload = z.infer<typeof WorldstateHubPayloadSchema>

