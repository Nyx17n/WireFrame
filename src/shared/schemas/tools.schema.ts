import { z } from 'zod'
import { SellerOnlineStatusSchema } from './market.schema'

export const CartItemEntrySchema = z.object({
  slug: z.string().min(1).max(160),
  quantity: z.number().int().min(1).max(99).default(1),
  desiredRank: z.number().int().min(0).max(10).optional()
})
export type CartItemEntry = z.infer<typeof CartItemEntrySchema>

export const CartLineAnalysisSchema = z.object({
  slug: z.string(),
  nameFr: z.string(),
  nameEn: z.string(),
  thumb: z.string().nullable(),
  quantity: z.number().int().positive(),
  desiredRank: z.number().int().nonnegative().optional(),
  maxRank: z.number().int().nonnegative().optional(),
  tradingTaxUnit: z.number().int().nonnegative(),
  bestUnitPrice: z.number().nullable(),
  bestSellerName: z.string().nullable(),
  lineTotalPlat: z.number().nullable(),
  lineTotalCreditsTax: z.number().int().nonnegative()
})
export type CartLineAnalysis = z.infer<typeof CartLineAnalysisSchema>

export const BundledItemMatchSchema = z.object({
  slug: z.string(),
  nameFr: z.string(),
  nameEn: z.string(),
  quantity: z.number().int().positive(),
  rank: z.number().int().nonnegative().optional(),
  unitPrice: z.number().nonnegative(),
  optimalUnitPrice: z.number().nonnegative()
})
export type BundledItemMatch = z.infer<typeof BundledItemMatchSchema>

export const BundledSellerMatchSchema = z.object({
  sellerName: z.string(),
  sellerSlug: z.string(),
  status: SellerOnlineStatusSchema,
  reputation: z.number(),
  matchedItems: z.array(BundledItemMatchSchema),
  bundleTotalPlat: z.number().nonnegative(),
  optimalSeparatePlat: z.number().nonnegative(),
  extraPlatDelta: z.number(),
  dojoTripsSaved: z.number().int().nonnegative(),
  groupedWhisperEn: z.string(),
  groupedWhisperFr: z.string()
})
export type BundledSellerMatch = z.infer<typeof BundledSellerMatchSchema>

export const CartBundleAnalysisSchema = z.object({
  lines: z.array(CartLineAnalysisSchema),
  estimatedTotalPlat: z.number().nonnegative(),
  totalCreditsTax: z.number().int().nonnegative(),
  missingItemsCount: z.number().int().nonnegative(),
  bundledSellers: z.array(BundledSellerMatchSchema)
})
export type CartBundleAnalysis = z.infer<typeof CartBundleAnalysisSchema>

export const DucatItemEntrySchema = z.object({
  itemId: z.string(),
  slug: z.string(),
  nameFr: z.string(),
  nameEn: z.string(),
  thumb: z.string().nullable(),
  ducats: z.number().int().positive(),
  medianPlat: z.number().nonnegative(),
  waPricePlat: z.number().nonnegative(),
  ducatsPerPlat: z.number().nonnegative(),
  platPer100Ducats: z.number().nonnegative(),
  volume: z.number().int().nonnegative()
})
export type DucatItemEntry = z.infer<typeof DucatItemEntrySchema>

export const RivenWeaponSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  nameFr: z.string(),
  nameEn: z.string(),
  thumb: z.string().nullable(),
  disposition: z.number().nonnegative(),
  rivenType: z.string()
})
export type RivenWeaponSummary = z.infer<typeof RivenWeaponSummarySchema>

export const RivenSearchParamsSchema = z.object({
  weaponSlug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9_-]+$/),
  polarity: z.enum(['all', 'madurai', 'vazarin', 'naramon']).default('all'),
  maxRerolls: z.number().int().min(0).max(500).optional(),
  buyoutPolicy: z.enum(['direct', 'all']).default('direct'),
  sortBy: z.enum(['price_asc', 'price_desc']).default('price_asc')
})
export type RivenSearchParams = z.infer<typeof RivenSearchParamsSchema>

export const RivenAttributeValueSchema = z.object({
  slug: z.string(),
  labelFr: z.string(),
  labelEn: z.string(),
  value: z.number(),
  positive: z.boolean()
})

export const RivenAuctionCardSchema = z.object({
  id: z.string(),
  weaponSlug: z.string(),
  weaponNameFr: z.string(),
  weaponNameEn: z.string(),
  rivenName: z.string(),
  buyoutPrice: z.number().nullable(),
  startingPrice: z.number().nonnegative(),
  topBid: z.number().nullable(),
  isDirectSell: z.boolean(),
  masteryLevel: z.number().int().nonnegative(),
  modRank: z.number().int().nonnegative(),
  reRolls: z.number().int().nonnegative(),
  polarity: z.string(),
  attributes: z.array(RivenAttributeValueSchema),
  owner: z.object({
    ingameName: z.string(),
    slug: z.string(),
    reputation: z.number(),
    status: SellerOnlineStatusSchema,
    platform: z.string()
  })
})
export type RivenAuctionCard = z.infer<typeof RivenAuctionCardSchema>

