import { z } from 'zod'

export const PriceSniperRuleSchema = z.object({
  id: z.string().min(1).max(64),
  slug: z.string().min(1).max(160),
  nameFr: z.string().min(1).max(160),
  nameEn: z.string().min(1).max(160),
  thumb: z.string().nullable(),
  maxPlatinum: z.number().int().min(1).max(100_000),
  desiredRank: z.number().int().min(0).max(10).optional(),
  enabled: z.boolean().default(true),
  lastTriggeredPrice: z.number().nonnegative().optional(),
  lastTriggeredSeller: z.string().max(120).optional(),
  lastTriggeredAt: z.string().optional()
})
export type PriceSniperRule = z.infer<typeof PriceSniperRuleSchema>

export const WorldAlertTogglesSchema = z.object({
  cetusNight: z.boolean().default(false),
  cetusPreNight5m: z.boolean().default(false),
  vallisWarm: z.boolean().default(false),
  cambionVome: z.boolean().default(false),
  baroArrival: z.boolean().default(false),
  fastFissure: z.boolean().default(false),
  steelPathOmniaFissure: z.boolean().default(false),
  rareInvasionCatalystForma: z.boolean().default(false),
  weaponInvasionWraithVandal: z.boolean().default(false),
  teshinUmbraForma: z.boolean().default(false),
  arbitrationSTier: z.boolean().default(false)
})
export type WorldAlertToggles = z.infer<typeof WorldAlertTogglesSchema>

export const TriggeredAlertEventSchema = z.object({
  id: z.string(),
  kind: z.enum(['price-sniper', 'worldstate']),
  title: z.string(),
  subtitle: z.string(),
  slug: z.string().optional(),
  sellerName: z.string().optional(),
  platinum: z.number().optional(),
  itemNameEn: z.string().optional(),
  itemNameFr: z.string().optional(),
  rank: z.number().int().optional(),
  triggeredAt: z.string()
})
export type TriggeredAlertEvent = z.infer<typeof TriggeredAlertEventSchema>

