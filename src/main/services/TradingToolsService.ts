import type {
  DucatItemEntry,
  RivenAuctionCard,
  RivenSearchParams,
  RivenWeaponSummary
} from '@shared/schemas/tools.schema'
import type { RateLimitedHttpClient } from '../infrastructure/http/RateLimitedHttpClient'
import type { CacheService } from './CacheService'
import type { MarketApiService } from './MarketApiService'
import type { StorageService } from './StorageService'
import {
  RawWfmDucatsResponseSchema,
  RawWfmRivenAttributesResponseSchema,
  RawWfmRivenAuctionsResponseSchema,
  RawWfmRivenWeaponsResponseSchema
} from './wfm-tools-raw.schemas'

const WFM_API_BASE = 'https://api.warframe.market'

interface LocalizedAttr {
  fr: string
  en: string
}

export class TradingToolsService {
  private rivenAttrMap = new Map<string, LocalizedAttr>()

  constructor(
    private readonly http: RateLimitedHttpClient,
    private readonly cache: CacheService,
    private readonly storage: StorageService,
    private readonly marketApi: MarketApiService
  ) {}

  private async buildHeaders(): Promise<Record<string, string>> {
    const { market } = await this.storage.getSettings()
    return {
      Language: 'fr',
      Platform: market.platform,
      Crossplay: market.crossplay ? 'true' : 'false'
    }
  }

  public async getDucats(forceRefresh = false): Promise<DucatItemEntry[]> {
    const cacheKey = 'wfm:ducats:v1'
    if (!forceRefresh) {
      const cached = this.cache.get<DucatItemEntry[]>(cacheKey)
      if (cached) return cached
    }

    const [catalog, headers] = await Promise.all([
      this.marketApi.getCatalog(false),
      this.buildHeaders()
    ])
    const byId = new Map(catalog.map((c) => [c.id, c]))

    const raw = await this.http.getJson(
      `${WFM_API_BASE}/v1/tools/ducats`,
      RawWfmDucatsResponseSchema,
      { headers }
    )

    const sourceRows =
      raw.payload.previous_hour.length > 0 ? raw.payload.previous_hour : raw.payload.previous_day

    const entries: DucatItemEntry[] = []
    for (const row of sourceRows) {
      const cat = byId.get(row.item)
      if (!cat || row.wa_price <= 0) continue
      const platPer100 = Math.round((row.wa_price / row.ducats) * 1000) / 10
      const ducatsPerPlat = Math.round((row.ducats / row.wa_price) * 100) / 100

      entries.push({
        itemId: row.item,
        slug: cat.slug,
        nameFr: cat.nameFr,
        nameEn: cat.nameEn,
        thumb: cat.thumb,
        ducats: row.ducats,
        medianPlat: row.median,
        waPricePlat: Math.round(row.wa_price * 10) / 10,
        ducatsPerPlat,
        platPer100Ducats: platPer100,
        volume: row.volume
      })
    }

    this.cache.set(cacheKey, entries, 300)
    return entries
  }

  public async getRivenWeapons(): Promise<RivenWeaponSummary[]> {
    const cacheKey = 'wfm:riven-weapons:v2'
    const cached = this.cache.get<RivenWeaponSummary[]>(cacheKey)
    if (cached && this.rivenAttrMap.size > 0) return cached

    const headers = await this.buildHeaders()
    const [weaponsRaw, attrsRaw] = await Promise.all([
      this.http.getJson(`${WFM_API_BASE}/v2/riven/weapons`, RawWfmRivenWeaponsResponseSchema, {
        headers
      }),
      this.http.getJson(
        `${WFM_API_BASE}/v2/riven/attributes`,
        RawWfmRivenAttributesResponseSchema,
        { headers }
      )
    ])

    const nextAttrs = new Map<string, LocalizedAttr>()
    for (const a of attrsRaw.data) {
      const en = a.i18n?.['en']?.name ?? a.slug
      const fr = a.i18n?.['fr']?.name ?? en
      nextAttrs.set(a.slug, { fr, en })
    }
    this.rivenAttrMap = nextAttrs

    const weapons: RivenWeaponSummary[] = weaponsRaw.data.map((w) => {
      const en = w.i18n?.['en']
      const fr = w.i18n?.['fr']
      return {
        id: w.id,
        slug: w.slug,
        nameEn: en?.name ?? w.slug,
        nameFr: fr?.name ?? en?.name ?? w.slug,
        thumb: fr?.thumb ?? en?.thumb ?? fr?.icon ?? en?.icon ?? null,
        disposition: w.disposition,
        rivenType: w.rivenType
      }
    })

    this.cache.set(cacheKey, weapons, 3600)
    return weapons
  }

  public async searchRivens(params: RivenSearchParams): Promise<RivenAuctionCard[]> {
    const weapons = await this.getRivenWeapons()
    const weaponMeta = weapons.find((w) => w.slug === params.weaponSlug)

    const qs = new URLSearchParams({
      type: 'riven',
      weapon_url_name: params.weaponSlug,
      sort_by: params.sortBy
    })
    if (params.buyoutPolicy === 'direct') {
      qs.set('buyout_policy', 'direct')
    }
    if (params.polarity !== 'all') {
      qs.set('polarity', params.polarity)
    }
    if (params.maxRerolls !== undefined) {
      qs.set('re_rolls_max', String(params.maxRerolls))
    }

    const headers = await this.buildHeaders()
    const raw = await this.http.getJson(
      `${WFM_API_BASE}/v1/auctions/search?${qs.toString()}`,
      RawWfmRivenAuctionsResponseSchema,
      { headers }
    )

    return raw.payload.auctions
      .filter((a) => a.visible && !a.closed && !a.private)
      .slice(0, 60)
      .map((a) => ({
        id: a.id,
        weaponSlug: a.item.weapon_url_name,
        weaponNameEn: weaponMeta?.nameEn ?? a.item.weapon_url_name,
        weaponNameFr: weaponMeta?.nameFr ?? a.item.weapon_url_name,
        rivenName: a.item.name,
        buyoutPrice: a.buyout_price,
        startingPrice: a.starting_price,
        topBid: a.top_bid,
        isDirectSell: a.is_direct_sell,
        masteryLevel: a.item.mastery_level,
        modRank: a.item.mod_rank,
        reRolls: a.item.re_rolls,
        polarity: a.item.polarity,
        attributes: a.item.attributes.map((attr) => {
          const labels = this.rivenAttrMap.get(attr.url_name)
          return {
            slug: attr.url_name,
            labelEn: labels?.en ?? attr.url_name,
            labelFr: labels?.fr ?? attr.url_name,
            value: attr.value,
            positive: attr.positive
          }
        }),
        owner: {
          ingameName: a.owner.ingame_name,
          slug: a.owner.slug,
          reputation: a.owner.reputation,
          status: a.owner.status,
          platform: a.owner.platform
        }
      }))
  }
}

