import type { MarketOrder, SetVsPartsAnalysis } from '@shared/schemas/market.schema'
import type { MarketApiService } from './MarketApiService'

function findCheapestActiveSell(orders: MarketOrder[]): {
  price: number | null
  seller: string | null
} {
  const ingameSells = orders
    .filter((o) => o.type === 'sell' && o.user?.status === 'ingame')
    .sort((a, b) => a.platinum - b.platinum)

  const bestIngame = ingameSells[0]
  if (bestIngame) {
    return { price: bestIngame.platinum, seller: bestIngame.user?.ingameName ?? null }
  }

  const onlineSells = orders
    .filter((o) => o.type === 'sell' && o.user?.status === 'online')
    .sort((a, b) => a.platinum - b.platinum)

  const bestOnline = onlineSells[0]
  if (bestOnline) {
    return { price: bestOnline.platinum, seller: bestOnline.user?.ingameName ?? null }
  }

  return { price: null, seller: null }
}

/**
 * Implémente le comparateur Set Complet vs Pièces Détachées (CDC Section 3 - V3) :
 * Delta = Prix(Set Complet) - Somme(Qté_i * Prix_Pièce_i)
 */
export class SetCalculatorService {
  constructor(private readonly marketApi: MarketApiService) {}

  public async analyzeSetVsParts(slug: string, forceRefresh = false): Promise<SetVsPartsAnalysis> {
    const detail = await this.marketApi.getItemDetail(slug)
    const setRootItem = detail.setItems.find((i) => i.setRoot)
    const partItems = detail.setItems.filter((i) => !i.setRoot)

    if (!setRootItem || partItems.length < 2) {
      return {
        hasSetComparison: false,
        setSlug: detail.slug,
        setNameFr: detail.nameFr,
        setNameEn: detail.nameEn,
        bestSetPrice: null,
        bestSetSeller: null,
        totalPartsCost: null,
        deltaPlatinum: null,
        parts: []
      }
    }

    const [setOrders, ...partsOrdersList] = await Promise.all([
      this.marketApi.getItemOrders(setRootItem.slug, forceRefresh),
      ...partItems.map((part) => this.marketApi.getItemOrders(part.slug, forceRefresh))
    ])

    const bestSet = findCheapestActiveSell(setOrders)

    let allPartsAvailable = true
    let sumParts = 0

    const parts = partItems.map((part, idx) => {
      const orders = partsOrdersList[idx] ?? []
      const best = findCheapestActiveSell(orders)
      if (best.price === null) {
        allPartsAvailable = false
        return {
          id: part.id,
          slug: part.slug,
          nameFr: part.nameFr,
          nameEn: part.nameEn,
          thumb: part.thumb,
          quantityInSet: part.quantityInSet,
          bestUnitPrice: null,
          subtotalPrice: null,
          bestSellerName: null
        }
      }
      const subtotal = best.price * part.quantityInSet
      sumParts += subtotal
      return {
        id: part.id,
        slug: part.slug,
        nameFr: part.nameFr,
        nameEn: part.nameEn,
        thumb: part.thumb,
        quantityInSet: part.quantityInSet,
        bestUnitPrice: best.price,
        subtotalPrice: subtotal,
        bestSellerName: best.seller
      }
    })

    const totalPartsCost = allPartsAvailable ? sumParts : null
    const deltaPlatinum =
      bestSet.price !== null && totalPartsCost !== null ? bestSet.price - totalPartsCost : null

    return {
      hasSetComparison: true,
      setSlug: setRootItem.slug,
      setNameFr: setRootItem.nameFr,
      setNameEn: setRootItem.nameEn,
      bestSetPrice: bestSet.price,
      bestSetSeller: bestSet.seller,
      totalPartsCost,
      deltaPlatinum,
      parts
    }
  }
}

