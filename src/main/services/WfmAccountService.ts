import type { z } from 'zod'
import type { MarketCatalogItem } from '@shared/schemas/market.schema'
import {
  WfmAccountOverviewSchema,
  WfmOwnOrderSchema,
  type CloseWfmOrderUnitInput,
  type CreateWfmOrderInput,
  type UpdateWfmOrderInput,
  type WfmAccountOverview,
  type WfmOwnOrder,
  type WfmPortfolioBucket,
  type WfmReviewItem
} from '@shared/schemas/wfm-account.schema'
import { HttpStatusError, type RateLimitedHttpClient } from '../infrastructure/http/RateLimitedHttpClient'
import type { CacheService } from './CacheService'
import type { MarketApiService } from './MarketApiService'
import type { WfmAuthService } from './WfmAuthService'
import {
  RawWfmExtendedUserResponseSchema,
  RawWfmMyOrdersResponseSchema,
  RawWfmSingleOrderResponseSchema,
  RawWfmV1ReviewsResponseSchema
} from './wfm-account-raw.schemas'
import type { RawWfmOrderSchema } from './wfm-raw.schemas'

const WFM_API_BASE = 'https://api.warframe.market'

export class WfmAccountService {
  private lastKnownOrders = new Map<string, WfmOwnOrder>()

  constructor(
    private readonly http: RateLimitedHttpClient,
    private readonly cache: CacheService,
    private readonly marketApi: MarketApiService,
    private readonly auth: WfmAuthService
  ) {}

  public async getOverview(forceRefresh = false): Promise<WfmAccountOverview> {
    // Hard gate: must be authenticated
    const { jwt, user: cachedUser } = this.auth.requireAuthenticatedContext()
    const cacheKey = `wfm:my-overview:${cachedUser.id}`

    if (!forceRefresh) {
      const cached = this.cache.get<WfmAccountOverview>(cacheKey)
      if (cached) {
        const sess = this.auth.getSessionState()
        return {
          ...cached,
          status: sess.status,
          wsConnected: sess.wsConnected,
          kpis: {
            ...cached.kpis,
            sessionSalesCount: sess.sessionSalesCount,
            sessionPlatinumEarned: sess.sessionPlatinumEarned
          }
        }
      }
    }

    const headers = this.auth.buildAuthHeaders(jwt, {
      Platform: cachedUser.platform,
      Crossplay: cachedUser.crossplay ? 'true' : 'false'
    })

    try {
      const [freshUser, catalog, myOrdersRes] = await Promise.all([
        this.auth.refreshCurrentUser(),
        this.marketApi.getCatalog(false),
        this.http.getJson(`${WFM_API_BASE}/v2/orders/my`, RawWfmMyOrdersResponseSchema, {
          headers: { ...headers, 'Cache-Control': 'no-cache' }
        })
      ])

      const itemById = new Map<string, MarketCatalogItem>()
      for (const item of catalog) {
        itemById.set(item.id, item)
      }

      // Non-blocking enrichment: public profile bio + recent reviews
      const [extendedBio, recentReviews] = await Promise.all([
        this.fetchPublicAboutSafe(freshUser.slug, headers),
        this.fetchRecentReviewsSafe(freshUser.slug, headers)
      ])

      const enrichedUser = extendedBio
        ? { ...freshUser, about: extendedBio }
        : freshUser

      const mappedOrders = myOrdersRes.data
        .filter((o) => o.quantity > 0 && o.platinum > 0)
        .map((raw) => this.mapOwnOrder(raw, itemById.get(raw.itemId)))

      const nextKnown = new Map<string, WfmOwnOrder>()
      for (const ord of mappedOrders) {
        nextKnown.set(ord.id, ord)
      }
      this.lastKnownOrders = nextKnown

      const sellOrders = mappedOrders
        .filter((o) => o.type === 'sell')
        .sort((a, b) => b.platinum * b.quantity - a.platinum * a.quantity)
      const buyOrders = mappedOrders
        .filter((o) => o.type === 'buy')
        .sort((a, b) => b.platinum - a.platinum)

      const visibleSellOrders = sellOrders.filter((o) => o.visible)
      const hiddenSellOrders = sellOrders.filter((o) => !o.visible)
      const visibleSellPlatinum = visibleSellOrders.reduce(
        (acc, o) => acc + o.platinum * o.quantity,
        0
      )
      const hiddenSellPlatinum = hiddenSellOrders.reduce(
        (acc, o) => acc + o.platinum * o.quantity,
        0
      )
      const totalSellPlatinum = visibleSellPlatinum + hiddenSellPlatinum

      const session = this.auth.getSessionState()
      const overview: WfmAccountOverview = WfmAccountOverviewSchema.parse({
        user: enrichedUser,
        status: session.status,
        wsConnected: session.wsConnected,
        sellOrders,
        buyOrders,
        kpis: {
          reputation: enrichedUser.reputation,
          visibleSellPlatinum,
          hiddenSellPlatinum,
          totalSellPlatinum,
          visibleSellCount: visibleSellOrders.length,
          totalSellCount: sellOrders.length,
          totalBuyCount: buyOrders.length,
          sessionSalesCount: session.sessionSalesCount,
          sessionPlatinumEarned: session.sessionPlatinumEarned
        },
        portfolioBreakdown: this.computePortfolioBreakdown(sellOrders, totalSellPlatinum),
        recentReviews,
        fetchedAt: new Date().toISOString()
      })

      this.cache.set(cacheKey, overview, 12)
      return overview
    } catch (err) {
      await this.handlePotentialAuthExpiry(err)
      throw err
    }
  }

  public async createOrder(input: CreateWfmOrderInput): Promise<WfmOwnOrder> {
    // Hard gate: strictly forbid selling/buying when not connected to a verified account
    const { jwt, user } = this.auth.requireAuthenticatedContext()

    const catalog = await this.marketApi.getCatalog(false)
    const catItem =
      catalog.find((c) => c.id === input.itemId) ??
      catalog.find((c) => c.slug === input.itemSlug)
    if (!catItem) {
      throw new Error(`Item introuvable dans le catalogue Warframe Market (${input.itemSlug}).`)
    }

    const body: Record<string, unknown> = {
      itemId: catItem.id,
      type: input.type,
      platinum: input.platinum,
      quantity: input.quantity,
      visible: input.visible
    }
    if (input.perTrade !== undefined) body['perTrade'] = input.perTrade
    if (input.rank !== undefined) body['rank'] = input.rank
    if (input.subtype !== undefined) body['subtype'] = input.subtype
    if (input.amberStars !== undefined) body['amberStars'] = input.amberStars
    if (input.cyanStars !== undefined) body['cyanStars'] = input.cyanStars

    try {
      const res = await this.http.sendJson(
        'POST',
        `${WFM_API_BASE}/v2/order`,
        RawWfmSingleOrderResponseSchema,
        {
          headers: this.auth.buildAuthHeaders(jwt, {
            Platform: user.platform,
            Crossplay: user.crossplay ? 'true' : 'false'
          }),
          bodyJson: body
        }
      )
      const created = this.mapOwnOrder(res.data, catItem)
      this.lastKnownOrders.set(created.id, created)
      this.invalidateOverviewCache(user.id)
      return created
    } catch (err) {
      await this.handlePotentialAuthExpiry(err)
      if (err instanceof HttpStatusError && (err.status === 400 || err.status === 409 || err.status === 422)) {
        throw new Error(
          err.detailMessage
            ? `Impossible de publier l’annonce (${err.detailMessage}).`
            : 'Impossible de publier l’annonce : vérifiez le rang/sous-type ou si vous avez déjà une annonce identique.'
        )
      }
      throw err
    }
  }

  public async updateOrder(input: UpdateWfmOrderInput): Promise<WfmOwnOrder> {
    const { jwt, user } = this.auth.requireAuthenticatedContext()

    const patchBody: Record<string, unknown> = {}
    if (input.platinum !== undefined) patchBody['platinum'] = input.platinum
    if (input.quantity !== undefined) patchBody['quantity'] = input.quantity
    if (input.visible !== undefined) patchBody['visible'] = input.visible
    if (input.perTrade !== undefined) patchBody['perTrade'] = input.perTrade
    if (input.rank !== undefined) patchBody['rank'] = input.rank
    if (input.subtype !== undefined) patchBody['subtype'] = input.subtype
    if (input.amberStars !== undefined) patchBody['amberStars'] = input.amberStars
    if (input.cyanStars !== undefined) patchBody['cyanStars'] = input.cyanStars

    try {
      const res = await this.http.sendJson(
        'PATCH',
        `${WFM_API_BASE}/v2/order/${encodeURIComponent(input.orderId)}`,
        RawWfmSingleOrderResponseSchema,
        {
          headers: this.auth.buildAuthHeaders(jwt, {
            Platform: user.platform,
            Crossplay: user.crossplay ? 'true' : 'false'
          }),
          bodyJson: patchBody
        }
      )
      const catalog = await this.marketApi.getCatalog(false)
      const catItem = catalog.find((c) => c.id === res.data.itemId)
      const updated = this.mapOwnOrder(res.data, catItem)
      this.lastKnownOrders.set(updated.id, updated)
      this.invalidateOverviewCache(user.id)
      return updated
    } catch (err) {
      await this.handlePotentialAuthExpiry(err)
      throw err
    }
  }

  public async closeOrderUnit(
    input: CloseWfmOrderUnitInput
  ): Promise<{ closed: boolean; remainingQuantity: number }> {
    const { jwt, user } = this.auth.requireAuthenticatedContext()
    const known = this.lastKnownOrders.get(input.orderId)
    const units = input.quantity

    const headers = this.auth.buildAuthHeaders(jwt, {
      Platform: user.platform,
      Crossplay: user.crossplay ? 'true' : 'false'
    })

    try {
      // Primary WFM v2 transaction close endpoint (`POST /v2/order/:id/close`)
      try {
        await this.http.sendVoid(
          'POST',
          `${WFM_API_BASE}/v2/order/${encodeURIComponent(input.orderId)}/close`,
          {
            headers,
            bodyJson: { quantity: units }
          }
        )
      } catch (closeErr) {
        // Fallback if endpoint requires PATCH/DELETE on older edge
        if (
          closeErr instanceof HttpStatusError &&
          (closeErr.status === 404 || closeErr.status === 405)
        ) {
          if (known && known.quantity > units) {
            await this.updateOrder({
              orderId: input.orderId,
              quantity: known.quantity - units
            })
          } else {
            await this.deleteOrder(input.orderId)
          }
        } else {
          throw closeErr
        }
      }

      const remaining = known ? Math.max(0, known.quantity - units) : 0
      if (known && known.type === 'sell') {
        this.auth.recordCompletedSale(known.platinum * units, units)
      }
      if (remaining <= 0) {
        this.lastKnownOrders.delete(input.orderId)
      } else if (known) {
        this.lastKnownOrders.set(input.orderId, { ...known, quantity: remaining })
      }
      this.invalidateOverviewCache(user.id)
      return { closed: true, remainingQuantity: remaining }
    } catch (err) {
      await this.handlePotentialAuthExpiry(err)
      throw err
    }
  }

  public async deleteOrder(orderId: string): Promise<boolean> {
    const { jwt, user } = this.auth.requireAuthenticatedContext()
    const safeId = encodeURIComponent(orderId.trim())
    try {
      await this.http.sendVoid('DELETE', `${WFM_API_BASE}/v2/order/${safeId}`, {
        headers: this.auth.buildAuthHeaders(jwt, {
          Platform: user.platform,
          Crossplay: user.crossplay ? 'true' : 'false'
        })
      })
      this.lastKnownOrders.delete(orderId)
      this.invalidateOverviewCache(user.id)
      return true
    } catch (err) {
      await this.handlePotentialAuthExpiry(err)
      throw err
    }
  }

  private invalidateOverviewCache(userId: string): void {
    this.cache.set(`wfm:my-overview:${userId}`, null, 0)
  }

  private async handlePotentialAuthExpiry(err: unknown): Promise<void> {
    if (err instanceof HttpStatusError && err.status === 401) {
      await this.auth.invalidateExpiredSession()
      throw new Error(
        'Session Warframe Market expirée (HTTP 401). Veuillez vous reconnecter à votre compte.'
      )
    }
  }

  private async fetchPublicAboutSafe(
    slug: string,
    headers: Record<string, string>
  ): Promise<string> {
    try {
      const res = await this.http.getJson(
        `${WFM_API_BASE}/v2/user/${encodeURIComponent(slug)}`,
        RawWfmExtendedUserResponseSchema,
        { headers }
      )
      return (res.data.aboutRaw ?? res.data.about ?? '').trim()
    } catch {
      return ''
    }
  }

  private async fetchRecentReviewsSafe(
    slug: string,
    headers: Record<string, string>
  ): Promise<WfmReviewItem[]> {
    try {
      const res = await this.http.getJson(
        `${WFM_API_BASE}/v1/profile/${encodeURIComponent(slug)}/reviews`,
        RawWfmV1ReviewsResponseSchema,
        { headers }
      )
      return res.payload.reviews.slice(0, 8).map((r, idx) => ({
        id: r.id ?? r._id ?? `rev-${idx}`,
        authorName: r.user_from?.ingame_name ?? 'Tenno',
        positive: (r.review_type ?? 1) >= 0,
        text: r.text.trim() || 'Échange rapide et courtois (+1)',
        dateIso: r.date ?? ''
      }))
    } catch {
      return []
    }
  }

  private computePortfolioBreakdown(
    sellOrders: WfmOwnOrder[],
    totalPlat: number
  ): WfmPortfolioBucket[] {
    const totals = {
      prime_sets_parts: { count: 0, plat: 0, labelFr: 'Sets & Pièces Prime' },
      mods_arcanes: { count: 0, plat: 0, labelFr: 'Mods & Arcanes' },
      relics_ayatan: { count: 0, plat: 0, labelFr: 'Reliques & Trésors Ayatan' },
      other: { count: 0, plat: 0, labelFr: 'Armes, Schémas & Divers' }
    }

    for (const ord of sellOrders) {
      const val = ord.platinum * ord.quantity
      const tags = ord.itemTags.map((t) => t.toLowerCase())
      if (tags.includes('mod') || tags.includes('arcane_enhancement')) {
        totals.mods_arcanes.count += 1
        totals.mods_arcanes.plat += val
      } else if (tags.includes('relic') || tags.includes('ayatan_sculpture') || tags.includes('ayatan_star')) {
        totals.relics_ayatan.count += 1
        totals.relics_ayatan.plat += val
      } else if (tags.includes('prime') || tags.includes('set')) {
        totals.prime_sets_parts.count += 1
        totals.prime_sets_parts.plat += val
      } else {
        totals.other.count += 1
        totals.other.plat += val
      }
    }

    const keys: Array<keyof typeof totals> = [
      'prime_sets_parts',
      'mods_arcanes',
      'relics_ayatan',
      'other'
    ]
    return keys.map((key) => {
      const b = totals[key]
      const share = totalPlat > 0 ? Math.round((b.plat / totalPlat) * 100) : 0
      return {
        key,
        labelFr: b.labelFr,
        ordersCount: b.count,
        totalPlatinum: b.plat,
        sharePercent: share
      }
    })
  }

  private mapOwnOrder(
    raw: z.infer<typeof RawWfmOrderSchema>,
    catItem?: MarketCatalogItem
  ): WfmOwnOrder {
    return WfmOwnOrderSchema.parse({
      id: raw.id,
      type: raw.type,
      platinum: Math.max(1, Math.round(raw.platinum)),
      quantity: Math.max(1, raw.quantity),
      ...(raw.perTrade !== undefined && raw.perTrade > 0 ? { perTrade: raw.perTrade } : {}),
      ...(raw.rank !== undefined ? { rank: raw.rank } : {}),
      ...(raw.subtype !== undefined ? { subtype: raw.subtype } : {}),
      ...(raw.amberStars !== undefined ? { amberStars: raw.amberStars } : {}),
      ...(raw.cyanStars !== undefined ? { cyanStars: raw.cyanStars } : {}),
      visible: raw.visible,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      itemId: raw.itemId,
      itemSlug: catItem?.slug ?? raw.itemId,
      itemNameFr: catItem?.nameFr ?? raw.itemId,
      itemNameEn: catItem?.nameEn ?? raw.itemId,
      itemThumb: catItem?.thumb ?? null,
      itemTags: catItem?.tags ?? [],
      ...(catItem?.maxRank !== undefined ? { itemMaxRank: catItem.maxRank } : {}),
      ...(catItem?.subtypes && catItem.subtypes.length > 0
        ? { itemSubtypes: catItem.subtypes }
        : {})
    })
  }
}

