import type { MarketOrder } from '@shared/schemas/market.schema'
import type {
  BundledItemMatch,
  BundledSellerMatch,
  CartBundleAnalysis,
  CartLineAnalysis
} from '@shared/schemas/tools.schema'
import type { MarketApiService } from './MarketApiService'
import type { StorageService } from './StorageService'

function matchesCartRequirements(
  order: MarketOrder,
  quantity: number,
  desiredRank?: number
): boolean {
  if (order.type !== 'sell') return false
  if (order.user?.status !== 'ingame' && order.user?.status !== 'online') return false
  if (order.quantity < quantity) return false
  if (desiredRank !== undefined && order.rank !== desiredRank) return false
  return true
}

/**
 * Calcule le budget total du Panier, la taxe en Crédits et l'algorithme Trade Bundler
 * détectant les vendeurs qui possèdent >= 2 articles distincts du panier simultanément.
 */
export class CartBundlerService {
  constructor(
    private readonly marketApi: MarketApiService,
    private readonly storage: StorageService
  ) {}

  public async analyzeCartBundles(forceRefresh = false): Promise<CartBundleAnalysis> {
    const settings = await this.storage.getSettings()
    const cart = settings.cart

    if (cart.length === 0) {
      return {
        lines: [],
        estimatedTotalPlat: 0,
        totalCreditsTax: 0,
        missingItemsCount: 0,
        bundledSellers: []
      }
    }

    const lines: CartLineAnalysis[] = []
    let estimatedTotalPlat = 0
    let totalCreditsTax = 0
    let missingItemsCount = 0

    interface SellerAccumulator {
      sellerName: string
      sellerSlug: string
      status: 'ingame' | 'online' | 'offline'
      reputation: number
      itemsBySlug: Map<string, BundledItemMatch>
    }

    const sellersMap = new Map<string, SellerAccumulator>()

    for (const entry of cart) {
      const [detail, orders] = await Promise.all([
        this.marketApi.getItemDetail(entry.slug),
        this.marketApi.getItemOrders(entry.slug, forceRefresh)
      ])

      const taxUnit = detail.tradingTax ?? 2000
      const lineTax = taxUnit * entry.quantity
      totalCreditsTax += lineTax

      const validSells = orders
        .filter((o) => matchesCartRequirements(o, entry.quantity, entry.desiredRank))
        .sort((a, b) => {
          const aIngame = a.user?.status === 'ingame' ? 0 : 1
          const bIngame = b.user?.status === 'ingame' ? 0 : 1
          if (aIngame !== bIngame) return aIngame - bIngame
          return a.platinum - b.platinum
        })

      const best = validSells[0]
      const bestUnitPrice = best?.platinum ?? null
      const lineTotalPlat = bestUnitPrice !== null ? bestUnitPrice * entry.quantity : null

      if (lineTotalPlat !== null) {
        estimatedTotalPlat += lineTotalPlat
      } else {
        missingItemsCount += 1
      }

      lines.push({
        slug: detail.slug,
        nameFr: detail.nameFr,
        nameEn: detail.nameEn,
        thumb: detail.thumb,
        quantity: entry.quantity,
        ...(entry.desiredRank !== undefined ? { desiredRank: entry.desiredRank } : {}),
        ...(detail.maxRank !== undefined ? { maxRank: detail.maxRank } : {}),
        tradingTaxUnit: taxUnit,
        bestUnitPrice,
        bestSellerName: best?.user?.ingameName ?? null,
        lineTotalPlat,
        lineTotalCreditsTax: lineTax
      })

      if (bestUnitPrice !== null) {
        for (const order of validSells) {
          const u = order.user
          if (!u) continue
          let acc = sellersMap.get(u.slug)
          if (!acc) {
            acc = {
              sellerName: u.ingameName,
              sellerSlug: u.slug,
              status: u.status,
              reputation: u.reputation,
              itemsBySlug: new Map()
            }
            sellersMap.set(u.slug, acc)
          }
          const prev = acc.itemsBySlug.get(detail.slug)
          if (!prev || order.platinum < prev.unitPrice) {
            acc.itemsBySlug.set(detail.slug, {
              slug: detail.slug,
              nameFr: detail.nameFr,
              nameEn: detail.nameEn,
              quantity: entry.quantity,
              ...(entry.desiredRank !== undefined ? { rank: entry.desiredRank } : {}),
              unitPrice: order.platinum,
              optimalUnitPrice: bestUnitPrice
            })
          }
        }
      }
    }

    const bundledSellers: BundledSellerMatch[] = []
    for (const acc of sellersMap.values()) {
      if (acc.itemsBySlug.size < 2) continue
      const matchedItems = Array.from(acc.itemsBySlug.values())
      const bundleTotalPlat = matchedItems.reduce((s, m) => s + m.unitPrice * m.quantity, 0)
      const optimalSeparatePlat = matchedItems.reduce(
        (s, m) => s + m.optimalUnitPrice * m.quantity,
        0
      )
      const extraPlatDelta = bundleTotalPlat - optimalSeparatePlat

      const partsEn = matchedItems
        .map(
          (m) =>
            `${m.quantity > 1 ? `${m.quantity}x ` : ''}"${m.nameEn}"${m.rank !== undefined ? ` (rank ${m.rank})` : ''} (${m.unitPrice * m.quantity}p)`
        )
        .join(' + ')
      const partsFr = matchedItems
        .map(
          (m) =>
            `${m.quantity > 1 ? `${m.quantity}x ` : ''}"${m.nameFr}"${m.rank !== undefined ? ` (rang ${m.rank})` : ''} (${m.unitPrice * m.quantity}p)`
        )
        .join(' + ')

      bundledSellers.push({
        sellerName: acc.sellerName,
        sellerSlug: acc.sellerSlug,
        status: acc.status,
        reputation: acc.reputation,
        matchedItems,
        bundleTotalPlat,
        optimalSeparatePlat,
        extraPlatDelta,
        dojoTripsSaved: matchedItems.length - 1,
        groupedWhisperEn: `/w ${acc.sellerName} Hi! I want to buy bundle: ${partsEn} = ${bundleTotalPlat}p total. (warframe.market)`,
        groupedWhisperFr: `/w ${acc.sellerName} Bonjour ! Je voudrais acheter ce lot : ${partsFr} = ${bundleTotalPlat}p au total. (warframe.market)`
      })
    }

    bundledSellers.sort((a, b) => {
      if (b.matchedItems.length !== a.matchedItems.length) {
        return b.matchedItems.length - a.matchedItems.length
      }
      return a.extraPlatDelta - b.extraPlatDelta
    })

    return {
      lines,
      estimatedTotalPlat,
      totalCreditsTax,
      missingItemsCount,
      bundledSellers: bundledSellers.slice(0, 15)
    }
  }
}

