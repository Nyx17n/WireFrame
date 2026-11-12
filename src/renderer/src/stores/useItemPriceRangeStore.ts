import { create } from 'zustand'
import type { MarketOrder } from '@shared/schemas/market.schema'
import { ipcClient } from '@/services/ipc-client'

export interface ItemPriceRangeSummary {
  readonly minPlat: number | null
  readonly avgPlat: number | null
  readonly maxPlat: number | null
  readonly bestIngameSeller: string | null
  readonly bestIngamePlat: number | null
  readonly bestIngameRank?: number
  readonly fetchedAt: number
}

interface ItemPriceRangeStoreState {
  summaries: Record<string, ItemPriceRangeSummary>
  loadingSlugs: Record<string, boolean>
  requestPriceSummary: (slug: string, forceRefresh?: boolean) => void
}

const CACHE_TTL_MS = 5 * 60 * 1000
const QUEUE_INTERVAL_MS = 360

const pendingQueue: Array<{ slug: string; force: boolean }> = []
const queuedSet = new Set<string>()
let workerRunning = false

export function computePriceRangeFromOrders(orders: readonly MarketOrder[]): ItemPriceRangeSummary {
  const allSells = orders.filter((o) => o.type === 'sell' && o.platinum > 0)
  const activeOnlineSells = allSells.filter(
    (o) => o.user?.status === 'ingame' || o.user?.status === 'online'
  )
  const ingameSells = allSells
    .filter((o) => o.user?.status === 'ingame')
    .sort((a, b) => a.platinum - b.platinum)

  const pool = activeOnlineSells.length > 0 ? activeOnlineSells : allSells
  if (pool.length === 0) {
    return {
      minPlat: null,
      avgPlat: null,
      maxPlat: null,
      bestIngameSeller: null,
      bestIngamePlat: null,
      fetchedAt: Date.now()
    }
  }

  const sortedPrices = pool.map((o) => o.platinum).sort((a, b) => a - b)
  const median = sortedPrices[Math.floor(sortedPrices.length / 2)] ?? sortedPrices[0] ?? 0

  // Écarte les offres aberrantes ("troll orders" à 99 999p) au-delà de 4x la médiane
  const realistic =
    sortedPrices.length >= 4 && median > 0
      ? sortedPrices.filter((p) => p <= Math.max(median * 4, median + 150))
      : sortedPrices

  const cleanPrices = realistic.length > 0 ? realistic : sortedPrices
  const minPlat = cleanPrices[0] ?? null
  const maxPlat = cleanPrices[cleanPrices.length - 1] ?? null
  const sum = cleanPrices.reduce((acc, p) => acc + p, 0)
  const avgPlat = cleanPrices.length > 0 ? Math.round(sum / cleanPrices.length) : null

  const bestIngame = ingameSells[0]

  return {
    minPlat,
    avgPlat,
    maxPlat,
    bestIngameSeller: bestIngame?.user?.ingameName ?? null,
    bestIngamePlat: bestIngame?.platinum ?? null,
    ...(bestIngame?.rank !== undefined ? { bestIngameRank: bestIngame.rank } : {}),
    fetchedAt: Date.now()
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export const useItemPriceRangeStore = create<ItemPriceRangeStoreState>((set, get) => {
  const processQueue = async (): Promise<void> => {
    if (workerRunning) return
    workerRunning = true
    try {
      while (pendingQueue.length > 0) {
        const next = pendingQueue.shift()
        if (!next) break
        queuedSet.delete(next.slug)

        set((s) => ({ loadingSlugs: { ...s.loadingSlugs, [next.slug]: true } }))
        try {
          const orders = await ipcClient.market.getItemOrders(next.slug, next.force)
          const summary = computePriceRangeFromOrders(orders)
          set((s) => {
            const nextLoading = { ...s.loadingSlugs }
            delete nextLoading[next.slug]
            return {
              summaries: { ...s.summaries, [next.slug]: summary },
              loadingSlugs: nextLoading
            }
          })
        } catch {
          set((s) => {
            const nextLoading = { ...s.loadingSlugs }
            delete nextLoading[next.slug]
            return {
              summaries: {
                ...s.summaries,
                [next.slug]: {
                  minPlat: null,
                  avgPlat: null,
                  maxPlat: null,
                  bestIngameSeller: null,
                  bestIngamePlat: null,
                  fetchedAt: Date.now()
                }
              },
              loadingSlugs: nextLoading
            }
          })
        }
        if (pendingQueue.length > 0) {
          await sleep(QUEUE_INTERVAL_MS)
        }
      }
    } finally {
      workerRunning = false
    }
  }

  return {
    summaries: {},
    loadingSlugs: {},
    requestPriceSummary: (rawSlug, forceRefresh = false) => {
      const slug = rawSlug.trim().toLowerCase()
      if (!slug) return
      const existing = get().summaries[slug]
      if (!forceRefresh && existing && Date.now() - existing.fetchedAt < CACHE_TTL_MS) {
        return
      }
      if (queuedSet.has(slug) || get().loadingSlugs[slug]) return

      queuedSet.add(slug)
      pendingQueue.push({ slug, force: forceRefresh })
      void processQueue()
    }
  }
})

