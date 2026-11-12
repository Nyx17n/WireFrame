import {
  ARBITRATION_VITUS_ITEMS,
  BARO_CLASSIC_STOCK
} from '@shared/data/duviri-rotations'
import {
  toWfAssetUrl,
  type MarketCatalogItem,
  type MarketOrder
} from '@shared/schemas/market.schema'
import {
  toWfStatAssetUrl,
  toWikiItemAssetUrl,
  type BaroInventoryItem,
  type NewsEntry,
  type VitusModPriceEntry,
  type VoidTraderSnapshot,
  type WorldstateHubPayload
} from '@shared/schemas/worldstate.schema'
import type { RateLimitedHttpClient } from '../infrastructure/http/RateLimitedHttpClient'
import type { CacheService } from './CacheService'
import type { MarketApiService } from './MarketApiService'
import {
  extractRewardLabel,
  findCatalogItemByLabel,
  isFastMissionType,
  mapBounties,
  mapCycles,
  mapDuviriCircuit,
  mapInvasions,
  mapPrimeResurgencePacks,
  resolveArbitration,
  resolveRewardThumbnailUrl,
  translateMissionType
} from './worldstate-mappers'
import { fetchResilientWfStatRaw, WorldstateSnapshotFallback } from './worldstate-upstream'

function cheapestIngameSell(orders: MarketOrder[], maxRankZeroOnly = false): {
  platinum: number | null
  sellerName: string | null
} {
  const candidates = orders
    .filter((o) => {
      if (o.type !== 'sell' || o.user?.status !== 'ingame') return false
      if (maxRankZeroOnly && o.rank !== undefined && o.rank > 0) return false
      return true
    })
    .sort((a, b) => a.platinum - b.platinum)

  const best = candidates[0]
  if (best && best.user) {
    return { platinum: best.platinum, sellerName: best.user.ingameName }
  }
  return { platinum: null, sellerName: null }
}

export class WorldstateService {
  private readonly snapshotFallback: WorldstateSnapshotFallback

  constructor(
    private readonly http: RateLimitedHttpClient,
    private readonly cache: CacheService,
    private readonly marketApi: MarketApiService,
    userDataPath?: string
  ) {
    this.snapshotFallback = new WorldstateSnapshotFallback(userDataPath)
  }

  private async getCatalogLookup(): Promise<{
    bySlug: Map<string, MarketCatalogItem>
    byLowerName: Map<string, MarketCatalogItem>
  }> {
    const bySlug = new Map<string, MarketCatalogItem>()
    const byLowerName = new Map<string, MarketCatalogItem>()
    try {
      const catalog = await this.marketApi.getCatalog(false)
      for (const item of catalog) {
        bySlug.set(item.slug, item)
        byLowerName.set(item.nameEn.toLowerCase(), item)
        byLowerName.set(item.nameFr.toLowerCase(), item)
      }
    } catch {
      // Non-fatal if WFM catalog is temporarily unreachable
    }
    return { bySlug, byLowerName }
  }

  public async getCurrent(forceRefresh = false): Promise<WorldstateHubPayload> {
    const cacheKey = 'wfstat:worldstate:pc:fr'
    if (!forceRefresh) {
      const cached = this.cache.get<WorldstateHubPayload>(cacheKey)
      if (cached) return cached
    }

    let raw: Awaited<ReturnType<typeof fetchResilientWfStatRaw>>
    let lookup: Awaited<ReturnType<typeof this.getCatalogLookup>>
    try {
      ;[raw, lookup] = await Promise.all([
        fetchResilientWfStatRaw(this.http),
        this.getCatalogLookup()
      ])
    } catch (upstreamError) {
      const fallback = await this.snapshotFallback.loadLastGood()
      if (fallback) {
        this.cache.set(cacheKey, fallback, 20)
        return fallback
      }
      throw upstreamError
    }

    const now = Date.now()
    const vt = raw.voidTrader
    const vtActMs = vt ? Date.parse(vt.activation) : NaN
    const vtExpMs = vt ? Date.parse(vt.expiry) : NaN
    const baroActive =
      Boolean(vt?.active) ||
      (Number.isFinite(vtActMs) && Number.isFinite(vtExpMs) && now >= vtActMs && now < vtExpMs)

    const hasLiveBaroStock = Boolean(vt?.inventory && vt.inventory.length > 0)
    const sourceBaroList = hasLiveBaroStock
      ? vt!.inventory
      : BARO_CLASSIC_STOCK.map((c, i) => ({
          uniqueName: `classic-${i}`,
          item: c.item,
          ducats: c.ducats,
          credits: c.credits
        }))

    const baroItems: BaroInventoryItem[] = sourceBaroList.map((entry) => {
      const matched = findCatalogItemByLabel(entry.item, lookup.bySlug, lookup.byLowerName)
      return {
        uniqueName: entry.uniqueName,
        name: entry.item,
        nameFr: matched?.nameFr ?? entry.item,
        ducats: entry.ducats ?? 0,
        credits: entry.credits ?? 0,
        marketSlug: matched?.slug ?? null,
        thumb: toWfAssetUrl(matched?.thumb) ?? toWikiItemAssetUrl(entry.item),
        minPlatinum: null,
        sellerName: null,
        platPer100Ducats: null
      }
    })

    const spCurrent = raw.steelPath?.currentReward ?? null
    const isUmbraFormaWeek = Boolean(
      spCurrent?.name.toLowerCase().includes('umbra')
    )

    const news: NewsEntry[] = [...raw.news]
      .filter((n) => n.link.startsWith('https://'))
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      .slice(0, 24)
      .map((n) => ({
        id: n.id,
        title: n.translations['fr'] ?? n.translations['en'] ?? n.message,
        link: n.link,
        imageUrl: toWfStatAssetUrl(n.imageLink),
        date: n.date,
        category: n.primeAccess
          ? 'prime'
          : n.update
            ? 'update'
            : n.stream
              ? 'stream'
              : 'community'
      }))

    const payload: WorldstateHubPayload = {
      fetchedAt: new Date().toISOString(),
      cycles: mapCycles(raw),
      bounties: mapBounties(raw),
      fissures: raw.fissures
        .filter((f) => !f.expired && Date.parse(f.expiry) > now)
        .sort((a, b) => a.tierNum - b.tierNum)
        .map((f) => {
          const rawMType = f.missionTypeKey ?? f.missionType
          return {
            id: f.id,
            node: f.node,
            missionType: translateMissionType(f.missionType),
            enemy: f.enemy,
            tier: f.tier,
            tierNum: f.tierNum,
            isHard: f.isHard,
            isStorm: f.isStorm,
            isOmnia: f.tier.toLowerCase() === 'omnia' || f.tierNum === 6,
            isFastMission: isFastMissionType(rawMType) || isFastMissionType(f.missionType),
            expiry: f.expiry
          }
        }),
      archonHunt: raw.archonHunt
        ? {
            id: raw.archonHunt.id,
            boss: raw.archonHunt.boss,
            faction: raw.archonHunt.faction,
            expiry: raw.archonHunt.expiry,
            steps: raw.archonHunt.missions.map((m) => ({
              node: m.node,
              missionType: translateMissionType(m.type)
            }))
          }
        : null,
      sortie: raw.sortie
        ? {
            id: raw.sortie.id,
            boss: raw.sortie.boss,
            faction: raw.sortie.faction,
            expiry: raw.sortie.expiry,
            steps: raw.sortie.variants.map((v) => ({
              node: v.node,
              missionType: translateMissionType(v.missionType),
              modifier: v.modifier
            }))
          }
        : null,
      invasions: mapInvasions(raw, lookup.bySlug, lookup.byLowerName),
      steelPath: {
        currentReward: spCurrent,
        expiry: raw.steelPath?.expiry ?? new Date(now + 86_400_000).toISOString(),
        isUmbraFormaWeek,
        rotation: raw.steelPath?.rotation ?? [],
        evergreens: raw.steelPath?.evergreens ?? []
      },
      arbitration: resolveArbitration(raw.arbitration),
      alerts: raw.alerts
        .filter((a) => Date.parse(a.expiry) > now)
        .map((a) => {
          const rewardLabel = extractRewardLabel(a.mission?.reward)
          const matchedItem = rewardLabel
            ? findCatalogItemByLabel(rewardLabel, lookup.bySlug, lookup.byLowerName)
            : null
          return {
            id: a.id,
            node: a.mission?.node ?? '',
            missionType: translateMissionType(a.mission?.type ?? ''),
            faction: a.mission?.faction ?? '',
            rewardLabel,
            credits: a.mission?.reward?.credits ?? 0,
            thumbnailUrl: resolveRewardThumbnailUrl(
              rewardLabel,
              matchedItem,
              a.mission?.reward?.thumbnail
            ),
            expiry: a.expiry
          }
        }),
      events: raw.events
        .filter((e) => Date.parse(e.expiry) > now)
        .map((e) => ({
          id: e.id,
          description: e.description,
          tooltip: e.tooltip,
          node: e.node,
          healthPercent: e.health,
          rewardsSummary: e.rewards.map((r) => extractRewardLabel(r)).filter(Boolean),
          expiry: e.expiry
        })),
      nightwave: (raw.nightwave?.activeChallenges ?? []).map((ch) => ({
        id: ch.id,
        title: ch.title,
        desc: ch.desc,
        reputation: ch.reputation,
        isDaily: ch.isDaily,
        isElite: ch.isElite,
        expiry: ch.expiry
      })),
      duviriCircuit: mapDuviriCircuit(raw),
      voidTrader: {
        active: baroActive,
        isPreviewStock: !hasLiveBaroStock,
        character: vt?.character ?? "Baro Ki'Teer",
        location: vt?.location ?? 'Relais',
        activation: vt?.activation ?? new Date(now).toISOString(),
        expiry: vt?.expiry ?? new Date(now).toISOString(),
        inventory: baroItems
      },
      news,
      globalBoosters: raw.globalUpgrades.filter((g) => Date.parse(g.expiry) > now),
      darvoDeals: raw.dailyDeals.map((deal) => {
        const matched = findCatalogItemByLabel(deal.item, lookup.bySlug, lookup.byLowerName)
        return {
          ...deal,
          imageUrl: toWfAssetUrl(matched?.thumb) ?? toWikiItemAssetUrl(deal.item)
        }
      }),
      primeResurgence: {
        location: raw.vaultTrader?.location ?? 'Bazar de Maroo (Mars)',
        expiry: raw.vaultTrader?.expiry ?? new Date(now).toISOString(),
        packs: mapPrimeResurgencePacks(raw, lookup.bySlug)
      }
    }

    this.cache.set(cacheKey, payload, 45)
    this.snapshotFallback.recordSuccess(payload)
    return payload
  }

  public async getBaroWithPrices(forceRefresh = false): Promise<VoidTraderSnapshot> {
    const cacheKey = 'wfstat:baro:prices'
    if (!forceRefresh) {
      const cached = this.cache.get<VoidTraderSnapshot>(cacheKey)
      if (cached) return cached
    }

    const ws = await this.getCurrent(forceRefresh)
    const vt = ws.voidTrader
    if (vt.inventory.length === 0) {
      return vt
    }

    const enriched: BaroInventoryItem[] = await Promise.all(
      vt.inventory.map(async (item) => {
        if (!item.marketSlug) return item
        try {
          const orders = await this.marketApi.getItemOrders(item.marketSlug, forceRefresh)
          const best = cheapestIngameSell(orders, true)
          const platPer100Ducats =
            best.platinum !== null && item.ducats > 0
              ? Math.round(((best.platinum * 100) / item.ducats) * 10) / 10
              : null
          return {
            ...item,
            minPlatinum: best.platinum,
            sellerName: best.sellerName,
            platPer100Ducats
          }
        } catch {
          return item
        }
      })
    )

    const result: VoidTraderSnapshot = { ...vt, inventory: enriched }
    this.cache.set(cacheKey, result, 300)
    return result
  }

  public async getVitusWithPrices(forceRefresh = false): Promise<VitusModPriceEntry[]> {
    const cacheKey = 'wfstat:vitus:prices'
    if (!forceRefresh) {
      const cached = this.cache.get<VitusModPriceEntry[]>(cacheKey)
      if (cached) return cached
    }

    const lookup = await this.getCatalogLookup()
    const entries: VitusModPriceEntry[] = await Promise.all(
      ARBITRATION_VITUS_ITEMS.map(async (def) => {
        const catItem = lookup.bySlug.get(def.slug)
        try {
          const orders = await this.marketApi.getItemOrders(def.slug, forceRefresh)
          const best = cheapestIngameSell(orders, true)
          const platPerVitus =
            best.platinum !== null && def.vitusCost > 0
              ? Math.round((best.platinum / def.vitusCost) * 100) / 100
              : null
          return {
            slug: def.slug,
            labelFr: def.labelFr,
            labelEn: def.labelEn,
            category: def.category,
            vitusCost: def.vitusCost,
            thumb: catItem?.thumb ?? null,
            minPlatinum: best.platinum,
            sellerName: best.sellerName,
            platPerVitus
          }
        } catch {
          return {
            slug: def.slug,
            labelFr: def.labelFr,
            labelEn: def.labelEn,
            category: def.category,
            vitusCost: def.vitusCost,
            thumb: catItem?.thumb ?? null,
            minPlatinum: null,
            sellerName: null,
            platPerVitus: null
          }
        }
      })
    )

    const sorted = entries.sort((a, b) => (b.platPerVitus ?? -1) - (a.platPerVitus ?? -1))
    this.cache.set(cacheKey, sorted, 300)
    return sorted
  }
}

