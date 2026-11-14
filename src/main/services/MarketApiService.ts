import type { z } from 'zod'
import type {
  MarketCatalogItem,
  MarketItemDetail,
  MarketItemStats,
  MarketOrder,
  MarketUserProfile
} from '@shared/schemas/market.schema'
import type { RateLimitedHttpClient } from '../infrastructure/http/RateLimitedHttpClient'
import type { CacheService } from './CacheService'
import type { StorageService } from './StorageService'
import {
  RawWfmCatalogResponseSchema,
  RawWfmOrderSchema,
  RawWfmOrdersResponseSchema,
  RawWfmSetResponseSchema,
  RawWfmUserProfileResponseSchema,
  RawWfmV1StatsResponseSchema
} from './wfm-raw.schemas'

const WFM_API_BASE = 'https://api.warframe.market'

export class MarketApiService {
  private itemById = new Map<string, MarketCatalogItem>()

  constructor(
    private readonly http: RateLimitedHttpClient,
    private readonly cache: CacheService,
    private readonly storage: StorageService
  ) {}

  private async buildHeaders(): Promise<Record<string, string>> {
    const { market } = await this.storage.getSettings()
    return {
      Language: 'fr',
      Platform: market.platform,
      Crossplay: market.crossplay ? 'true' : 'false'
    }
  }

  private async getCacheKeyPrefix(): Promise<string> {
    const { market } = await this.storage.getSettings()
    return `${market.platform}:${market.crossplay ? 'cx' : 'nocx'}`
  }

  public async getCatalog(forceRefresh = false): Promise<MarketCatalogItem[]> {
    const cacheKey = 'wfm:catalog:v2'
    if (!forceRefresh) {
      const cached = this.cache.get<MarketCatalogItem[]>(cacheKey)
      if (cached) return cached
    }

    const headers = await this.buildHeaders()
    const raw = await this.http.getJson(
      `${WFM_API_BASE}/v2/items`,
      RawWfmCatalogResponseSchema,
      { headers }
    )

    const items: MarketCatalogItem[] = raw.data.map((entry) => {
      const en = entry.i18n?.['en']
      const fr = entry.i18n?.['fr']
      return {
        id: entry.id,
        slug: entry.slug,
        nameEn: en?.name ?? entry.slug,
        nameFr: fr?.name ?? en?.name ?? entry.slug,
        thumb: fr?.thumb ?? en?.thumb ?? fr?.icon ?? en?.icon ?? null,
        tags: entry.tags,
        ...(entry.maxRank !== undefined ? { maxRank: entry.maxRank } : {}),
        ...(entry.ducats !== undefined ? { ducats: entry.ducats } : {}),
        ...(entry.subtypes && entry.subtypes.length > 0 ? { subtypes: entry.subtypes } : {}),
        ...(entry.maxAmberStars !== undefined ? { maxAmberStars: entry.maxAmberStars } : {}),
        ...(entry.maxCyanStars !== undefined ? { maxCyanStars: entry.maxCyanStars } : {}),
        ...(entry.bulkTradable !== undefined ? { bulkTradable: entry.bulkTradable } : {})
      }
    })

    const nextMap = new Map<string, MarketCatalogItem>()
    for (const item of items) {
      nextMap.set(item.id, item)
    }
    this.itemById = nextMap
    this.cache.set(cacheKey, items, 3600)
    return items
  }

  private async ensureCatalogIndex(): Promise<Map<string, MarketCatalogItem>> {
    if (this.itemById.size === 0) {
      await this.getCatalog(false)
    }
    return this.itemById
  }

  public async getItemDetail(slug: string): Promise<MarketItemDetail> {
    const safeSlug = encodeURIComponent(slug.trim().toLowerCase())
    const cacheKey = `wfm:item-set:${safeSlug}`
    const cached = this.cache.get<MarketItemDetail>(cacheKey)
    if (cached) return cached

    const headers = await this.buildHeaders()
    const raw = await this.http.getJson(
      `${WFM_API_BASE}/v2/item/${safeSlug}/set`,
      RawWfmSetResponseSchema,
      { headers }
    )

    const target = raw.data.items.find((i) => i.slug === slug) ?? raw.data.items[0]
    if (!target) {
      throw new Error(`Item introuvable sur Warframe Market : ${slug}`)
    }

    const en = target.i18n?.['en']
    const fr = target.i18n?.['fr']

    const detail: MarketItemDetail = {
      id: target.id,
      slug: target.slug,
      nameEn: en?.name ?? target.slug,
      nameFr: fr?.name ?? en?.name ?? target.slug,
      descriptionEn: en?.description ?? '',
      descriptionFr: fr?.description ?? en?.description ?? '',
      wikiLink: en?.wikiLink ?? null,
      icon: fr?.icon ?? en?.icon ?? null,
      thumb: fr?.thumb ?? en?.thumb ?? null,
      tags: target.tags,
      ...(target.ducats !== undefined ? { ducats: target.ducats } : {}),
      ...(target.tradingTax !== undefined ? { tradingTax: target.tradingTax } : {}),
      ...(target.reqMasteryRank !== undefined ? { reqMasteryRank: target.reqMasteryRank } : {}),
      ...(target.maxRank !== undefined ? { maxRank: target.maxRank } : {}),
      ...(target.subtypes && target.subtypes.length > 0 ? { subtypes: target.subtypes } : {}),
      ...(target.maxAmberStars !== undefined ? { maxAmberStars: target.maxAmberStars } : {}),
      ...(target.maxCyanStars !== undefined ? { maxCyanStars: target.maxCyanStars } : {}),
      ...(target.bulkTradable !== undefined ? { bulkTradable: target.bulkTradable } : {}),
      setRoot: Boolean(target.setRoot),
      setItems: raw.data.items.map((part) => {
        const pEn = part.i18n?.['en']
        const pFr = part.i18n?.['fr']
        return {
          id: part.id,
          slug: part.slug,
          nameEn: pEn?.name ?? part.slug,
          nameFr: pFr?.name ?? pEn?.name ?? part.slug,
          thumb: pFr?.thumb ?? pEn?.thumb ?? null,
          setRoot: Boolean(part.setRoot),
          quantityInSet: part.quantityInSet ?? 1,
          ...(part.ducats !== undefined ? { ducats: part.ducats } : {})
        }
      })
    }

    this.cache.set(cacheKey, detail, 900)
    return detail
  }

  public async getItemOrders(slug: string, forceRefresh = false): Promise<MarketOrder[]> {
    const safeSlug = encodeURIComponent(slug.trim().toLowerCase())
    const prefix = await this.getCacheKeyPrefix()
    const cacheKey = `wfm:orders:${prefix}:${safeSlug}`
    if (!forceRefresh) {
      const cached = this.cache.get<MarketOrder[]>(cacheKey)
      if (cached) return cached
    }

    const headers = await this.buildHeaders()
    const raw = await this.http.getJson(
      `${WFM_API_BASE}/v2/orders/item/${safeSlug}`,
      RawWfmOrdersResponseSchema,
      { headers }
    )

    const orders = raw.data.filter((o) => o.visible).map((o) => this.mapOrder(o))
    this.cache.set(cacheKey, orders, 20)
    return orders
  }

  public async getItemStats(slug: string): Promise<MarketItemStats> {
    const safeSlug = encodeURIComponent(slug.trim().toLowerCase())
    const prefix = await this.getCacheKeyPrefix()
    const cacheKey = `wfm:stats:${prefix}:${safeSlug}`
    const cached = this.cache.get<MarketItemStats>(cacheKey)
    if (cached) return cached

    const headers = await this.buildHeaders()
    const raw = await this.http.getJson(
      `${WFM_API_BASE}/v1/items/${safeSlug}/statistics`,
      RawWfmV1StatsResponseSchema,
      { headers }
    )

    const mapPoint = (pt: {
      datetime: string
      volume: number
      min_price: number
      max_price: number
      avg_price: number
      median: number
    }) => ({
      datetime: pt.datetime,
      volume: pt.volume,
      minPrice: pt.min_price,
      maxPrice: pt.max_price,
      avgPrice: pt.avg_price,
      median: pt.median
    })

    const stats: MarketItemStats = {
      hours48: raw.payload.statistics_closed['48hours'].slice(-48).map(mapPoint),
      days90: raw.payload.statistics_closed['90days'].slice(-90).map(mapPoint)
    }
    this.cache.set(cacheKey, stats, 300)
    return stats
  }

  public async getRecentOrders(forceRefresh = false): Promise<MarketOrder[]> {
    const prefix = await this.getCacheKeyPrefix()
    const cacheKey = `wfm:recent:${prefix}`
    if (!forceRefresh) {
      const cached = this.cache.get<MarketOrder[]>(cacheKey)
      if (cached) return cached
    }

    const [headers, index] = await Promise.all([this.buildHeaders(), this.ensureCatalogIndex()])
    const raw = await this.http.getJson(
      `${WFM_API_BASE}/v2/orders/recent`,
      RawWfmOrdersResponseSchema,
      { headers }
    )

    const orders = raw.data
      .filter((o) => o.visible)
      .slice(0, 120)
      .map((o) => this.mapOrder(o, index.get(o.itemId)))

    this.cache.set(cacheKey, orders, 20)
    return orders
  }

  public async getUserProfile(userSlug: string, forceRefresh = false): Promise<MarketUserProfile> {
    const safeSlug = encodeURIComponent(userSlug.trim())
    const cacheKey = `wfm:user:${safeSlug}`
    if (!forceRefresh) {
      const cached = this.cache.get<MarketUserProfile>(cacheKey)
      if (cached) return cached
    }

    const [headers, index] = await Promise.all([this.buildHeaders(), this.ensureCatalogIndex()])
    const [userRes, ordersRes] = await Promise.all([
      this.http.getJson(`${WFM_API_BASE}/v2/user/${safeSlug}`, RawWfmUserProfileResponseSchema, {
        headers
      }),
      this.http.getJson(
        `${WFM_API_BASE}/v2/orders/user/${safeSlug}`,
        RawWfmOrdersResponseSchema,
        { headers }
      )
    ])

    const u = userRes.data
    const mapped = ordersRes.data
      .filter((o) => o.visible)
      .map((o) => this.mapOrder(o, index.get(o.itemId)))

    const profile: MarketUserProfile = {
      id: u.id,
      ingameName: u.ingameName,
      slug: u.slug,
      avatar: u.avatar ?? null,
      reputation: u.reputation,
      masteryRank: u.masteryRank ?? 0,
      platform: u.platform,
      crossplay: u.crossplay,
      status: u.status,
      sellOrders: mapped.filter((o) => o.type === 'sell').sort((a, b) => a.platinum - b.platinum),
      buyOrders: mapped.filter((o) => o.type === 'buy').sort((a, b) => b.platinum - a.platinum)
    }

    this.cache.set(cacheKey, profile, 30)
    return profile
  }

  private mapOrder(
    raw: z.infer<typeof RawWfmOrderSchema>,
    catItem?: MarketCatalogItem
  ): MarketOrder {
    return {
      id: raw.id,
      type: raw.type,
      platinum: raw.platinum,
      quantity: raw.quantity,
      ...(raw.perTrade !== undefined ? { perTrade: raw.perTrade } : {}),
      ...(raw.rank !== undefined ? { rank: raw.rank } : {}),
      ...(raw.subtype !== undefined ? { subtype: raw.subtype } : {}),
      ...(raw.amberStars !== undefined ? { amberStars: raw.amberStars } : {}),
      ...(raw.cyanStars !== undefined ? { cyanStars: raw.cyanStars } : {}),
      updatedAt: raw.updatedAt,
      itemId: raw.itemId,
      ...(catItem
        ? {
            itemSlug: catItem.slug,
            itemNameFr: catItem.nameFr,
            itemNameEn: catItem.nameEn,
            itemThumb: catItem.thumb
          }
        : {}),
      ...(raw.user
        ? {
            user: {
              id: raw.user.id,
              ingameName: raw.user.ingameName,
              slug: raw.user.slug,
              avatar: raw.user.avatar ?? null,
              reputation: raw.user.reputation,
              platform: raw.user.platform,
              crossplay: raw.user.crossplay,
              status: raw.user.status
            }
          }
        : {})
    }
  }
}

