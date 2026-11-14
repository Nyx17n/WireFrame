import {
  doesCatalogItemMatchChips,
  normalizeMarketToken,
  type MarketFacetedSearchInput,
  type MarketFacetedSearchResult,
  type MarketSellerSpotlight
} from '@shared/schemas/market-search.schema'
import type {
  MarketCatalogItem,
  MarketOrder,
  MarketUserProfile,
  SellerOnlineStatus
} from '@shared/schemas/market.schema'
import type { MarketApiService } from './MarketApiService'

const MAX_SCANNED_ITEMS = 6
const MAX_SELLERS = 3

const STATUS_RANK: Record<SellerOnlineStatus, number> = {
  ingame: 0,
  online: 1,
  offline: 2
}

export class MarketFacetedSearchService {
  constructor(private readonly marketApi: MarketApiService) {}

  public async searchFacetedOrders(
    input: MarketFacetedSearchInput
  ): Promise<MarketFacetedSearchResult> {
    const { chips, forceRefresh = false } = input
    const catalog = await this.marketApi.getCatalog(false)
    const catalogBySlug = new Map<string, MarketCatalogItem>(catalog.map((it) => [it.slug, it]))
    const catalogById = new Map<string, MarketCatalogItem>(catalog.map((it) => [it.id, it]))

    const sellerChips = chips.filter((c) => c.kind === 'seller').slice(0, MAX_SELLERS)
    const itemOrCatChips = chips.filter((c) => c.kind === 'item' || c.kind === 'category')
    const maxPriceValues = chips
      .filter((c) => c.kind === 'maxPrice')
      .map((c) => Number(c.value))
      .filter((n) => Number.isFinite(n) && n > 0)
    const maxAllowedPlat =
      maxPriceValues.length > 0 ? Math.min(...maxPriceValues) : Number.POSITIVE_INFINITY

    const requireIngame = chips.some((c) => c.kind === 'status' && c.value === 'ingame')
    const targetOrderType: 'sell' | 'buy' = chips.some(
      (c) => c.kind === 'orderType' && c.value === 'buy'
    )
      ? 'buy'
      : 'sell'

    // Branch 1: One or more [👤 Seller] chips are active -> fetch seller shop(s) & intersect with item/price chips!
    if (sellerChips.length > 0) {
      const profiles = await Promise.all(
        sellerChips.map((sc) => this.resolveSellerProfile(sc.value, forceRefresh))
      )

      const sellers: MarketSellerSpotlight[] = profiles.map((p) => ({
        id: p.id,
        ingameName: p.ingameName,
        slug: p.slug,
        avatar: p.avatar,
        reputation: p.reputation,
        masteryRank: p.masteryRank,
        platform: p.platform,
        crossplay: p.crossplay,
        status: p.status,
        totalActiveSellOrders: p.sellOrders.length,
        totalActiveBuyOrders: p.buyOrders.length
      }))

      const combinedOrders: MarketOrder[] = []
      for (const profile of profiles) {
        if (requireIngame && profile.status !== 'ingame') continue

        const sourceList = targetOrderType === 'buy' ? profile.buyOrders : profile.sellOrders
        for (const ord of sourceList) {
          if (ord.platinum > maxAllowedPlat) continue
          const catItem =
            catalogById.get(ord.itemId) ??
            (ord.itemSlug ? catalogBySlug.get(ord.itemSlug) : undefined)

          if (itemOrCatChips.length > 0) {
            const matches = catItem
              ? doesCatalogItemMatchChips(catItem, itemOrCatChips)
              : this.doesFallbackOrderTextMatch(ord, itemOrCatChips.map((c) => c.value))
            if (!matches) continue
          }

          combinedOrders.push({
            ...ord,
            user: {
              id: profile.id,
              ingameName: profile.ingameName,
              slug: profile.slug,
              avatar: profile.avatar,
              reputation: profile.reputation,
              platform: profile.platform,
              crossplay: profile.crossplay,
              status: profile.status
            }
          })
        }
      }

      combinedOrders.sort((a, b) =>
        targetOrderType === 'sell' ? a.platinum - b.platinum : b.platinum - a.platinum
      )

      return {
        orders: combinedOrders,
        sellers,
        scannedItemCount: itemOrCatChips.length > 0 ? 1 : 0,
        cappedByItemLimit: false,
        matchedTotalCatalogItems:
          itemOrCatChips.length > 0
            ? catalog.filter((it) => doesCatalogItemMatchChips(it, itemOrCatChips)).length
            : catalog.length
      }
    }

    // Branch 2: No seller chip, no item/category chip -> filter live recent orders
    if (itemOrCatChips.length === 0) {
      const recent = await this.marketApi.getRecentOrders(forceRefresh)
      const filtered = recent.filter((ord) => {
        if (ord.type !== targetOrderType) return false
        if (ord.platinum > maxAllowedPlat) return false
        if (requireIngame && ord.user?.status !== 'ingame') return false
        return Boolean(ord.itemSlug)
      })
      return {
        orders: filtered,
        sellers: [],
        scannedItemCount: 0,
        cappedByItemLimit: false,
        matchedTotalCatalogItems: catalog.length
      }
    }

    // Branch 3: Item/category chips without a seller chip -> aggregate live orders for top matched items (capped at 6)
    const matchedItems = catalog.filter((it) => doesCatalogItemMatchChips(it, itemOrCatChips))
    const targetItems = matchedItems.slice(0, MAX_SCANNED_ITEMS)

    const perItemOrders = await Promise.all(
      targetItems.map(async (item) => {
        const orders = await this.marketApi.getItemOrders(item.slug, forceRefresh)
        return orders.map<MarketOrder>((o) => ({
          ...o,
          itemSlug: item.slug,
          itemNameFr: item.nameFr,
          itemNameEn: item.nameEn,
          itemThumb: item.thumb
        }))
      })
    )

    const merged = perItemOrders
      .flat()
      .filter((ord) => {
        if (ord.type !== targetOrderType) return false
        if (ord.platinum > maxAllowedPlat) return false
        if (requireIngame) return ord.user?.status === 'ingame'
        return ord.user?.status !== 'offline'
      })
      .sort((a, b) => {
        const sa = STATUS_RANK[a.user?.status ?? 'offline']
        const sb = STATUS_RANK[b.user?.status ?? 'offline']
        if (sa !== sb) return sa - sb
        return targetOrderType === 'sell' ? a.platinum - b.platinum : b.platinum - a.platinum
      })

    return {
      orders: merged.slice(0, 150),
      sellers: [],
      scannedItemCount: targetItems.length,
      cappedByItemLimit: matchedItems.length > MAX_SCANNED_ITEMS,
      matchedTotalCatalogItems: matchedItems.length
    }
  }

  private doesFallbackOrderTextMatch(ord: MarketOrder, rawTokens: readonly string[]): boolean {
    const text = `${normalizeMarketToken(ord.itemNameFr ?? '')} ${normalizeMarketToken(ord.itemNameEn ?? '')} ${(ord.itemSlug ?? '').toLowerCase()}`
    return rawTokens.every((raw) =>
      normalizeMarketToken(raw)
        .split(/\s+/)
        .filter(Boolean)
        .every((tk) => text.includes(tk))
    )
  }

  private async resolveSellerProfile(
    rawSellerInput: string,
    forceRefresh: boolean
  ): Promise<MarketUserProfile> {
    const clean = rawSellerInput.trim().replace(/^@+/, '')
    const candidates = Array.from(
      new Set([
        clean.toLowerCase().replace(/\s+/g, '-'),
        clean,
        clean.toLowerCase().replace(/[._\s]+/g, '-')
      ])
    ).filter(Boolean)

    // Also check cached recent orders in case the player's IGN differs slightly from their WFM slug
    try {
      const recent = await this.marketApi.getRecentOrders(false)
      const normClean = clean.toLowerCase()
      const hit = recent.find(
        (o) =>
          o.user &&
          (o.user.ingameName.toLowerCase() === normClean || o.user.slug.toLowerCase() === normClean)
      )
      if (hit?.user?.slug && !candidates.includes(hit.user.slug)) {
        candidates.unshift(hit.user.slug)
      }
    } catch {
      // Ignore optional recent lookup failure
    }

    let lastErr: unknown
    for (const candidateSlug of candidates) {
      try {
        return await this.marketApi.getUserProfile(candidateSlug, forceRefresh)
      } catch (err) {
        lastErr = err
      }
    }

    throw new Error(
      lastErr instanceof Error
        ? `Vendeur « ${clean} » introuvable sur Warframe Market.`
        : `Impossible de charger la boutique de « ${clean} ».`
    )
  }
}
