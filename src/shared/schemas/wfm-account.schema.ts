import { z } from 'zod'

export const WfmPresenceStatusSchema = z.enum(['ingame', 'online', 'invisible'])
export type WfmPresenceStatus = z.infer<typeof WfmPresenceStatusSchema>

export const WfmAccountUserSchema = z.object({
  id: z.string().min(1),
  ingameName: z.string().min(1),
  slug: z.string().min(1),
  avatar: z.string().nullable(),
  reputation: z.number(),
  masteryRank: z.number().int().nonnegative(),
  platform: z.string().min(1),
  crossplay: z.boolean(),
  locale: z.string().default('fr'),
  verified: z.boolean(),
  banned: z.boolean().default(false),
  about: z.string().default('')
})
export type WfmAccountUser = z.infer<typeof WfmAccountUserSchema>

export const WfmSessionStateSchema = z.object({
  connected: z.boolean(),
  encryptionAvailable: z.boolean(),
  persistedOnDisk: z.boolean(),
  status: WfmPresenceStatusSchema,
  wsConnected: z.boolean(),
  user: WfmAccountUserSchema.nullable(),
  sessionSalesCount: z.number().int().nonnegative(),
  sessionPlatinumEarned: z.number().nonnegative()
})
export type WfmSessionState = z.infer<typeof WfmSessionStateSchema>

export const WfmSignInCredentialsInputSchema = z.object({
  email: z.string().trim().email('Adresse e-mail invalide').max(180),
  password: z.string().min(1, 'Mot de passe requis').max(256),
  initialStatus: WfmPresenceStatusSchema.default('ingame')
})
export type WfmSignInCredentialsInput = z.infer<typeof WfmSignInCredentialsInputSchema>

export const WfmSignInTokenInputSchema = z.object({
  jwtToken: z.string().trim().min(20, 'Jeton de session JWT invalide').max(4096),
  initialStatus: WfmPresenceStatusSchema.default('ingame')
})
export type WfmSignInTokenInput = z.infer<typeof WfmSignInTokenInputSchema>

export const WfmOwnOrderSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['sell', 'buy']),
  platinum: z.number().int().positive(),
  quantity: z.number().int().positive(),
  perTrade: z.number().int().positive().optional(),
  rank: z.number().int().nonnegative().optional(),
  subtype: z.string().min(1).optional(),
  amberStars: z.number().int().nonnegative().optional(),
  cyanStars: z.number().int().nonnegative().optional(),
  visible: z.boolean(),
  createdAt: z.string().default(''),
  updatedAt: z.string().default(''),
  itemId: z.string().min(1),
  itemSlug: z.string().min(1),
  itemNameFr: z.string().min(1),
  itemNameEn: z.string().min(1),
  itemThumb: z.string().nullable(),
  itemTags: z.array(z.string()).default([]),
  itemMaxRank: z.number().int().nonnegative().optional(),
  itemSubtypes: z.array(z.string()).optional()
})
export type WfmOwnOrder = z.infer<typeof WfmOwnOrderSchema>

export const WfmPortfolioBucketSchema = z.object({
  key: z.enum(['prime_sets_parts', 'mods_arcanes', 'relics_ayatan', 'other']),
  labelFr: z.string(),
  ordersCount: z.number().int().nonnegative(),
  totalPlatinum: z.number().nonnegative(),
  sharePercent: z.number().min(0).max(100)
})
export type WfmPortfolioBucket = z.infer<typeof WfmPortfolioBucketSchema>

export const WfmReviewItemSchema = z.object({
  id: z.string().min(1),
  authorName: z.string().min(1),
  positive: z.boolean(),
  text: z.string(),
  dateIso: z.string().default('')
})
export type WfmReviewItem = z.infer<typeof WfmReviewItemSchema>

export const WfmAccountKpisSchema = z.object({
  reputation: z.number(),
  visibleSellPlatinum: z.number().nonnegative(),
  hiddenSellPlatinum: z.number().nonnegative(),
  totalSellPlatinum: z.number().nonnegative(),
  visibleSellCount: z.number().int().nonnegative(),
  totalSellCount: z.number().int().nonnegative(),
  totalBuyCount: z.number().int().nonnegative(),
  sessionSalesCount: z.number().int().nonnegative(),
  sessionPlatinumEarned: z.number().nonnegative()
})
export type WfmAccountKpis = z.infer<typeof WfmAccountKpisSchema>

export const WfmAccountOverviewSchema = z.object({
  user: WfmAccountUserSchema,
  status: WfmPresenceStatusSchema,
  wsConnected: z.boolean(),
  sellOrders: z.array(WfmOwnOrderSchema),
  buyOrders: z.array(WfmOwnOrderSchema),
  kpis: WfmAccountKpisSchema,
  portfolioBreakdown: z.array(WfmPortfolioBucketSchema),
  recentReviews: z.array(WfmReviewItemSchema),
  fetchedAt: z.string()
})
export type WfmAccountOverview = z.infer<typeof WfmAccountOverviewSchema>

export const CreateWfmOrderInputSchema = z.object({
  itemId: z.string().trim().min(1).max(80),
  itemSlug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-zA-Z0-9_.-]+$/),
  type: z.enum(['sell', 'buy']),
  platinum: z.number().int().min(1).max(999_999),
  quantity: z.number().int().min(1).max(999),
  visible: z.boolean().default(true),
  perTrade: z.number().int().min(1).max(999).optional(),
  rank: z.number().int().min(0).max(20).optional(),
  subtype: z.string().trim().min(1).max(64).optional(),
  amberStars: z.number().int().min(0).max(10).optional(),
  cyanStars: z.number().int().min(0).max(10).optional()
})
export type CreateWfmOrderInput = z.infer<typeof CreateWfmOrderInputSchema>

export const UpdateWfmOrderInputSchema = z.object({
  orderId: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-zA-Z0-9_-]+$/),
  platinum: z.number().int().min(1).max(999_999).optional(),
  quantity: z.number().int().min(1).max(999).optional(),
  visible: z.boolean().optional(),
  perTrade: z.number().int().min(1).max(999).optional(),
  rank: z.number().int().min(0).max(20).optional(),
  subtype: z.string().trim().min(1).max(64).optional(),
  amberStars: z.number().int().min(0).max(10).optional(),
  cyanStars: z.number().int().min(0).max(10).optional()
})
export type UpdateWfmOrderInput = z.infer<typeof UpdateWfmOrderInputSchema>

export const CloseWfmOrderUnitInputSchema = z.object({
  orderId: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-zA-Z0-9_-]+$/),
  quantity: z.number().int().min(1).max(999).default(1)
})
export type CloseWfmOrderUnitInput = z.infer<typeof CloseWfmOrderUnitInputSchema>

export const SUBTYPE_LABELS_FR: Readonly<Record<string, string>> = {
  intact: 'Intacte',
  exceptional: 'Exceptionnelle',
  flawless: 'Impeccable',
  radiant: 'Éclatante',
  small: 'Petit',
  medium: 'Moyen',
  large: 'Grand',
  basic: 'Basique',
  adorned: 'Orné',
  magnificent: 'Magnifique',
  blueprint: 'Schéma',
  crafted: 'Fabriqué'
}

export function formatWfmSubtypeLabel(subtype: string): string {
  return SUBTYPE_LABELS_FR[subtype.toLowerCase()] ?? subtype
}
