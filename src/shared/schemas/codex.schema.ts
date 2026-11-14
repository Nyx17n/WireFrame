import { z } from 'zod'

export const CodexCategorySchema = z.enum([
  'resources',
  'warframes',
  'weapons',
  'mods',
  'relics'
])

export type CodexCategory = z.infer<typeof CodexCategorySchema>

export const CodexVariantFilterSchema = z.enum([
  'all',
  'prime',
  'standard',
  'tradable',
  'unvaulted'
])

export type CodexVariantFilter = z.infer<typeof CodexVariantFilterSchema>

export const CodexSearchParamsSchema = z.object({
  category: CodexCategorySchema,
  query: z.string().max(120).default(''),
  variantFilter: CodexVariantFilterSchema.default('all'),
  eraFilter: z.string().max(32).default('all'),
  slotFilter: z.string().max(32).default('all'),
  page: z.number().int().min(1).max(500).default(1),
  pageSize: z.number().int().min(12).max(96).default(36)
})

export type CodexSearchParams = z.infer<typeof CodexSearchParamsSchema>

export const CodexCraftPreviewSchema = z.object({
  nameFr: z.string().min(1).max(160),
  count: z.number().int().positive(),
  imageUrl: z.string().nullable()
})

export type CodexCraftPreview = z.infer<typeof CodexCraftPreviewSchema>

export const CodexSummaryCardSchema = z.object({
  id: z.string().min(1).max(200),
  category: CodexCategorySchema,
  nameFr: z.string().min(1).max(240),
  nameEn: z.string().min(1).max(240),
  imageUrl: z.string().nullable(),
  badgeText: z.string().max(120),
  subtitle: z.string().max(500),
  isPrime: z.boolean(),
  isVaulted: z.boolean(),
  isTradable: z.boolean(),
  subsumedAbilityName: z.string().nullable().optional(),
  craftComponents: z.array(CodexCraftPreviewSchema).optional(),
  acquisitionText: z.string().nullable().optional()
})

export type CodexSummaryCard = z.infer<typeof CodexSummaryCardSchema>

export const CodexSearchResultSchema = z.object({
  items: z.array(CodexSummaryCardSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  categoryCounts: z.object({
    resources: z.number().int().nonnegative(),
    warframes: z.number().int().nonnegative(),
    weapons: z.number().int().nonnegative(),
    mods: z.number().int().nonnegative(),
    relics: z.number().int().nonnegative()
  })
})

export type CodexSearchResult = z.infer<typeof CodexSearchResultSchema>

export const CodexDropEntrySchema = z.object({
  part: z.string().nullable(),
  location: z.string().min(1),
  chance: z.number().min(0).max(100),
  rarity: z.string()
})

export type CodexDropEntry = z.infer<typeof CodexDropEntrySchema>

export const CodexAcquisitionSourceTypeSchema = z.enum([
  'shop',
  'quest',
  'dojo',
  'duviri',
  'syndicate',
  'nemesis',
  'event',
  'drop',
  'relic'
])

export type CodexAcquisitionSourceType = z.infer<typeof CodexAcquisitionSourceTypeSchema>

export const CodexAcquisitionSourceSchema = z.object({
  type: CodexAcquisitionSourceTypeSchema,
  labelFr: z.string().min(1).max(320),
  labelEn: z.string().min(1).max(320),
  sublabelFr: z.string().max(320).nullable().default(null),
  sublabelEn: z.string().max(320).nullable().default(null),
  chancePct: z.number().min(0).max(100),
  isGuaranteed: z.boolean().default(false),
  costCredits: z.number().int().nonnegative().nullable().default(null),
  partNameFr: z.string().max(160).nullable().default(null)
})

export type CodexAcquisitionSource = z.infer<typeof CodexAcquisitionSourceSchema>

export const CodexComponentEntrySchema = z.object({
  nameFr: z.string().min(1),
  nameEn: z.string(),
  resourceSlug: z.string().nullable(),
  isResource: z.boolean().default(false),
  count: z.number().int().positive(),
  imageUrl: z.string().nullable(),
  drops: z.array(CodexDropEntrySchema),
  acquisitionSources: z.array(CodexAcquisitionSourceSchema).default([])
})

export type CodexComponentEntry = z.infer<typeof CodexComponentEntrySchema>

export const CodexUsedForEntrySchema = z.object({
  category: CodexCategorySchema,
  id: z.string().min(1),
  nameFr: z.string().min(1),
  imageUrl: z.string().nullable(),
  count: z.number().int().positive()
})

export const CodexAbilityEntrySchema = z.object({
  nameFr: z.string().min(1),
  descriptionFr: z.string(),
  imageUrl: z.string().nullable(),
  isSubsumed: z.boolean()
})

export const CodexRelicRewardEntrySchema = z.object({
  nameFr: z.string().min(1),
  nameEn: z.string(),
  tier: z.string(),
  intactChance: z.number().min(0).max(100),
  radiantChance: z.number().min(0).max(100)
})

export const CodexItemDetailSchema = z.object({
  id: z.string().min(1),
  category: CodexCategorySchema,
  nameFr: z.string().min(1),
  nameEn: z.string().min(1),
  imageUrl: z.string().nullable(),
  descriptionFr: z.string(),
  typeLabel: z.string(),
  isPrime: z.boolean(),
  isVaulted: z.boolean(),
  isTradable: z.boolean(),
  marketSlug: z.string().nullable(),
  planets: z.string().nullable(),
  utility: z.string().nullable(),
  warframeStats: z
    .object({
      masteryRank: z.number().int().nonnegative(),
      health: z.number().nonnegative(),
      shield: z.number().nonnegative(),
      armor: z.number().nonnegative(),
      energy: z.number().nonnegative(),
      sprintSpeed: z.number().nonnegative(),
      auraPolarity: z.string(),
      polarities: z.array(z.string()),
      passiveFr: z.string()
    })
    .nullable(),
  abilities: z.array(CodexAbilityEntrySchema),
  weaponStats: z
    .object({
      slotLabel: z.string(),
      masteryRank: z.number().int().nonnegative(),
      critChance: z.number().nonnegative(),
      critMultiplier: z.number().nonnegative(),
      statusChance: z.number().nonnegative(),
      fireRate: z.number().nonnegative(),
      totalDamage: z.number().nonnegative(),
      rivenDisposition: z.number().nonnegative()
    })
    .nullable(),
  modStats: z
    .object({
      compatibility: z.string(),
      polarity: z.string(),
      rarity: z.string(),
      baseDrain: z.number().int(),
      maxRank: z.number().int().nonnegative(),
      effects: z.array(z.string())
    })
    .nullable(),
  relicInfo: z
    .object({
      era: z.string(),
      rewards: z.array(CodexRelicRewardEntrySchema)
    })
    .nullable(),
  drops: z.array(CodexDropEntrySchema),
  acquisitionSources: z.array(CodexAcquisitionSourceSchema).default([]),
  components: z.array(CodexComponentEntrySchema),
  totalUsedFor: z.number().int().nonnegative(),
  usedFor: z.array(CodexUsedForEntrySchema)
})

export type CodexItemDetail = z.infer<typeof CodexItemDetailSchema>

export const HelminthOverviewSchema = z.object({
  descriptionFr: z.string(),
  exclusiveAbilities: z.array(
    z.object({
      nameFr: z.string(),
      descriptionFr: z.string(),
      imageUrl: z.string().nullable()
    })
  ),
  subsumableWarframes: z.array(
    z.object({
      warframeId: z.string(),
      warframeNameFr: z.string(),
      warframeImageUrl: z.string().nullable(),
      abilityNameFr: z.string(),
      abilityDescriptionFr: z.string(),
      abilityImageUrl: z.string().nullable(),
      isMeta: z.boolean()
    })
  ),
  secretions: z.array(
    z.object({
      id: z.string(),
      nameFr: z.string(),
      descriptionFr: z.string(),
      bestResources: z.array(
        z.object({
          slug: z.string(),
          labelFr: z.string(),
          imageUrl: z.string().nullable()
        })
      )
    })
  )
})

export type HelminthOverview = z.infer<typeof HelminthOverviewSchema>

/**
 * Converts a PascalCase WFCD image filename (`Aya.png`, `Wisp.png`) into a cached `wf-asset://wfstat/img/` URL.
 */
export function toCodexImageUrl(img: string | null | undefined): string | null {
  const clean = img?.trim()
  if (!clean) return null
  if (clean === 'helminth.jpg') return './images/helminth.jpg'
  return `wf-asset://wfstat/img/${encodeURIComponent(clean)}`
}

