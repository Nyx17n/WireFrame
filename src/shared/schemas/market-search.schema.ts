import { z } from 'zod'
import {
  MarketOrderSchema,
  SellerOnlineStatusSchema,
  type MarketCatalogItem
} from './market.schema'

export const MarketFilterChipKindSchema = z.enum([
  'item',
  'seller',
  'category',
  'maxPrice',
  'status',
  'orderType'
])
export type MarketFilterChipKind = z.infer<typeof MarketFilterChipKindSchema>

export const MarketFilterChipSchema = z.object({
  id: z.string().min(1).max(80),
  kind: MarketFilterChipKindSchema,
  value: z.string().min(1).max(120),
  label: z.string().min(1).max(140)
})
export type MarketFilterChip = z.infer<typeof MarketFilterChipSchema>

export const MarketFacetedSearchInputSchema = z.object({
  chips: z.array(MarketFilterChipSchema).max(20),
  forceOrdersMode: z.boolean().optional(),
  forceRefresh: z.boolean().optional()
})
export type MarketFacetedSearchInput = z.infer<typeof MarketFacetedSearchInputSchema>

export const MarketSellerSpotlightSchema = z.object({
  id: z.string(),
  ingameName: z.string(),
  slug: z.string(),
  avatar: z.string().nullable(),
  reputation: z.number(),
  masteryRank: z.number().int().nonnegative(),
  platform: z.string(),
  crossplay: z.boolean(),
  status: SellerOnlineStatusSchema,
  totalActiveSellOrders: z.number().int().nonnegative(),
  totalActiveBuyOrders: z.number().int().nonnegative()
})
export type MarketSellerSpotlight = z.infer<typeof MarketSellerSpotlightSchema>

export const MarketFacetedSearchResultSchema = z.object({
  orders: z.array(MarketOrderSchema),
  sellers: z.array(MarketSellerSpotlightSchema),
  scannedItemCount: z.number().int().nonnegative(),
  cappedByItemLimit: z.boolean(),
  matchedTotalCatalogItems: z.number().int().nonnegative()
})
export type MarketFacetedSearchResult = z.infer<typeof MarketFacetedSearchResultSchema>

export function normalizeMarketToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function createMarketChipId(kind: MarketFilterChipKind, value: string): string {
  const slug = normalizeMarketToken(value).replace(/[^a-z0-9_-]+/g, '-').slice(0, 48) || 'chip'
  return `${kind}:${slug}`
}

/**
 * Checks whether a Warframe Market catalog item satisfies ALL active `item` and `category` chips.
 */
export function doesCatalogItemMatchChips(
  item: MarketCatalogItem,
  chips: readonly MarketFilterChip[]
): boolean {
  const haystack = `${normalizeMarketToken(item.nameFr)} ${normalizeMarketToken(item.nameEn)} ${item.slug.toLowerCase()} ${item.tags.join(' ').toLowerCase()}`

  for (const chip of chips) {
    if (chip.kind === 'category') {
      if (chip.value !== 'all' && !item.tags.includes(chip.value)) {
        return false
      }
    } else if (chip.kind === 'item') {
      const tokens = normalizeMarketToken(chip.value)
        .split(/\s+/)
        .filter(Boolean)
      for (const tk of tokens) {
        if (!haystack.includes(tk)) {
          return false
        }
      }
    }
  }
  return true
}

/**
 * Returns true if the current chip list contains any order-level facet
 * (seller, maxPrice, status, orderType) that requires live orders rather than static catalog cards.
 */
export function hasOrderLevelChips(chips: readonly MarketFilterChip[]): boolean {
  return chips.some(
    (c) =>
      c.kind === 'seller' ||
      c.kind === 'maxPrice' ||
      c.kind === 'status' ||
      c.kind === 'orderType'
  )
}

/**
 * Parses a raw user input string into a typed `MarketFilterChip` draft.
 * Automatically detects `@seller`, `vendeur:xxx`, `<=30p`, status keywords,
 * or falls back to `seller` when 0 catalog items match a username-shaped token.
 */
export function buildSmartMarketChip(
  rawInput: string,
  matchingCatalogCount: number,
  forcedKind?: MarketFilterChipKind
): MarketFilterChip | null {
  const trimmed = rawInput.trim()
  if (!trimmed) return null

  if (forcedKind === 'seller') {
    const cleanSeller = trimmed.replace(/^(@|vendeur:|seller:|user:)/i, '').trim()
    if (!cleanSeller) return null
    return {
      id: createMarketChipId('seller', cleanSeller),
      kind: 'seller',
      value: cleanSeller,
      label: cleanSeller
    }
  }

  if (forcedKind === 'item') {
    return {
      id: createMarketChipId('item', trimmed),
      kind: 'item',
      value: trimmed,
      label: trimmed
    }
  }

  const sellerPrefix = /^(?:@|vendeur:|seller:|user:)\s*(.+)$/i.exec(trimmed)
  if (sellerPrefix?.[1]) {
    const cleanSeller = sellerPrefix[1].trim()
    return {
      id: createMarketChipId('seller', cleanSeller),
      kind: 'seller',
      value: cleanSeller,
      label: cleanSeller
    }
  }

  const priceMatch = /^(?:<=|<|max:|prix:)?\s*(\d{1,5})\s*(?:p|plat|platinum)?$/i.exec(trimmed)
  if (
    priceMatch?.[1] &&
    (/^(?:<=|<|max:|prix:)/i.test(trimmed) || /(?:p|plat|platinum)$/i.test(trimmed))
  ) {
    const maxPlat = String(Math.max(1, Number(priceMatch[1])))
    return {
      id: createMarketChipId('maxPrice', maxPlat),
      kind: 'maxPrice',
      value: maxPlat,
      label: `≤ ${maxPlat} Plat`
    }
  }

  const norm = normalizeMarketToken(trimmed)
  if (norm === 'en jeu' || norm === 'ingame') {
    return {
      id: 'status:ingame',
      kind: 'status',
      value: 'ingame',
      label: 'En jeu uniquement'
    }
  }
  if (norm === 'achats' || norm === 'achat' || norm === 'wtb') {
    return {
      id: 'orderType:buy',
      kind: 'orderType',
      value: 'buy',
      label: 'Achats (WTB)'
    }
  }
  if (norm === 'ventes' || norm === 'vente' || norm === 'wts') {
    return {
      id: 'orderType:sell',
      kind: 'orderType',
      value: 'sell',
      label: 'Ventes (WTS)'
    }
  }

  // If 0 catalog items match and the text looks like a player IGN, automatically treat it as a Seller chip!
  if (matchingCatalogCount === 0 && /^[a-zA-Z0-9_.-]{3,32}$/.test(trimmed)) {
    return {
      id: createMarketChipId('seller', trimmed),
      kind: 'seller',
      value: trimmed,
      label: trimmed
    }
  }

  return {
    id: createMarketChipId('item', trimmed),
    kind: 'item',
    value: trimmed,
    label: trimmed
  }
}
