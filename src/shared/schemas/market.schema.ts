import { z } from 'zod'
import type { AppLanguage } from './settings.schema'

export const SellerOnlineStatusSchema = z.enum(['ingame', 'online', 'offline'])
export type SellerOnlineStatus = z.infer<typeof SellerOnlineStatusSchema>

export const MarketCatalogItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nameFr: z.string(),
  nameEn: z.string(),
  thumb: z.string().nullable(),
  tags: z.array(z.string()),
  maxRank: z.number().int().nonnegative().optional(),
  ducats: z.number().int().nonnegative().optional(),
  subtypes: z.array(z.string()).optional(),
  maxAmberStars: z.number().int().nonnegative().optional(),
  maxCyanStars: z.number().int().nonnegative().optional(),
  bulkTradable: z.boolean().optional()
})
export type MarketCatalogItem = z.infer<typeof MarketCatalogItemSchema>

export const MarketSetPartSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  nameFr: z.string(),
  nameEn: z.string(),
  thumb: z.string().nullable(),
  setRoot: z.boolean(),
  quantityInSet: z.number().int().positive(),
  ducats: z.number().int().nonnegative().optional()
})
export type MarketSetPartSummary = z.infer<typeof MarketSetPartSummarySchema>

export const MarketItemDetailSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nameFr: z.string(),
  nameEn: z.string(),
  descriptionFr: z.string(),
  descriptionEn: z.string(),
  wikiLink: z.string().nullable(),
  icon: z.string().nullable(),
  thumb: z.string().nullable(),
  tags: z.array(z.string()),
  ducats: z.number().int().nonnegative().optional(),
  tradingTax: z.number().int().nonnegative().optional(),
  reqMasteryRank: z.number().int().nonnegative().optional(),
  maxRank: z.number().int().nonnegative().optional(),
  subtypes: z.array(z.string()).optional(),
  maxAmberStars: z.number().int().nonnegative().optional(),
  maxCyanStars: z.number().int().nonnegative().optional(),
  bulkTradable: z.boolean().optional(),
  setRoot: z.boolean(),
  setItems: z.array(MarketSetPartSummarySchema)
})
export type MarketItemDetail = z.infer<typeof MarketItemDetailSchema>

export const MarketUserSummarySchema = z.object({
  id: z.string(),
  ingameName: z.string(),
  slug: z.string(),
  avatar: z.string().nullable(),
  reputation: z.number(),
  platform: z.string(),
  crossplay: z.boolean(),
  status: SellerOnlineStatusSchema
})
export type MarketUserSummary = z.infer<typeof MarketUserSummarySchema>

export const MarketOrderSchema = z.object({
  id: z.string(),
  type: z.enum(['sell', 'buy']),
  platinum: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  perTrade: z.number().int().nonnegative().optional(),
  rank: z.number().int().nonnegative().optional(),
  subtype: z.string().optional(),
  amberStars: z.number().int().nonnegative().optional(),
  cyanStars: z.number().int().nonnegative().optional(),
  updatedAt: z.string(),
  itemId: z.string(),
  itemSlug: z.string().optional(),
  itemNameFr: z.string().optional(),
  itemNameEn: z.string().optional(),
  itemThumb: z.string().nullable().optional(),
  itemMaxRank: z.number().int().nonnegative().optional(),
  itemTags: z.array(z.string()).optional(),
  user: MarketUserSummarySchema.optional()
})
export type MarketOrder = z.infer<typeof MarketOrderSchema>

export const SetPartPriceBreakdownSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nameFr: z.string(),
  nameEn: z.string(),
  thumb: z.string().nullable(),
  quantityInSet: z.number().int().positive(),
  bestUnitPrice: z.number().nullable(),
  subtotalPrice: z.number().nullable(),
  bestSellerName: z.string().nullable()
})
export type SetPartPriceBreakdown = z.infer<typeof SetPartPriceBreakdownSchema>

export const SetVsPartsAnalysisSchema = z.object({
  hasSetComparison: z.boolean(),
  setSlug: z.string(),
  setNameFr: z.string(),
  setNameEn: z.string(),
  bestSetPrice: z.number().nullable(),
  bestSetSeller: z.string().nullable(),
  totalPartsCost: z.number().nullable(),
  deltaPlatinum: z.number().nullable(),
  parts: z.array(SetPartPriceBreakdownSchema)
})
export type SetVsPartsAnalysis = z.infer<typeof SetVsPartsAnalysisSchema>

export const MarketStatPointSchema = z.object({
  datetime: z.string(),
  volume: z.number().nonnegative(),
  minPrice: z.number().nonnegative(),
  maxPrice: z.number().nonnegative(),
  avgPrice: z.number().nonnegative(),
  median: z.number().nonnegative()
})
export type MarketStatPoint = z.infer<typeof MarketStatPointSchema>

export const MarketItemStatsSchema = z.object({
  hours48: z.array(MarketStatPointSchema),
  days90: z.array(MarketStatPointSchema)
})
export type MarketItemStats = z.infer<typeof MarketItemStatsSchema>

export const MarketProfileBucketSchema = z.object({
  key: z.enum(['prime_sets_parts', 'mods_arcanes', 'relics_ayatan', 'other']),
  labelFr: z.string(),
  ordersCount: z.number().int().nonnegative(),
  totalPlatinum: z.number().nonnegative(),
  sharePercent: z.number().nonnegative()
})
export type MarketProfileBucket = z.infer<typeof MarketProfileBucketSchema>

export const MarketProfileReviewSchema = z.object({
  id: z.string(),
  authorName: z.string(),
  positive: z.boolean(),
  text: z.string(),
  dateIso: z.string()
})
export type MarketProfileReview = z.infer<typeof MarketProfileReviewSchema>

export const MarketUserProfileSchema = z.object({
  id: z.string(),
  ingameName: z.string(),
  slug: z.string(),
  avatar: z.string().nullable(),
  reputation: z.number(),
  masteryRank: z.number().int().nonnegative(),
  platform: z.string(),
  crossplay: z.boolean(),
  status: SellerOnlineStatusSchema,
  verified: z.boolean().optional(),
  locale: z.string().optional(),
  about: z.string().optional(),
  sellOrders: z.array(MarketOrderSchema),
  buyOrders: z.array(MarketOrderSchema),
  portfolioBreakdown: z.array(MarketProfileBucketSchema).optional(),
  recentReviews: z.array(MarketProfileReviewSchema).optional()
})
export type MarketUserProfile = z.infer<typeof MarketUserProfileSchema>

export interface WhisperDraft {
  ingameName: string
  itemNameEn: string
  itemNameFr: string
  platinum: number
  rank?: number
  quantity?: number
  customCommandEn?: string
  customCommandFr?: string
}

export function toWfAssetUrl(rawSubPath?: string | null): string | null {
  if (!rawSubPath) return null
  if (rawSubPath.startsWith('wf-asset://')) return rawSubPath
  const withoutQuery = rawSubPath.split('?')[0]?.replace(/^\/+/, '') ?? ''
  if (!withoutQuery || withoutQuery.includes('..')) return null
  return `wf-asset://wfm/${withoutQuery}`
}

export function buildWhisperCommand(draft: WhisperDraft, lang: AppLanguage): string {
  if (lang === 'fr' && draft.customCommandFr) return draft.customCommandFr
  if (lang === 'en' && draft.customCommandEn) return draft.customCommandEn
  const rankEn = draft.rank !== undefined ? ` (rank ${draft.rank})` : ''
  const rankFr = draft.rank !== undefined ? ` (rang ${draft.rank})` : ''
  if (lang === 'fr') {
    return `/w ${draft.ingameName} Bonjour ! Je voudrais acheter : "${draft.itemNameFr}"${rankFr} pour ${draft.platinum} platinum. (warframe.market)`
  }
  return `/w ${draft.ingameName} Hi! I want to buy: "${draft.itemNameEn}"${rankEn} for ${draft.platinum} platinum. (warframe.market)`
}

