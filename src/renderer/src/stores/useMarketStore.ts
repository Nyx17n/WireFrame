import { create } from 'zustand'
import type { PriceSniperRule, TriggeredAlertEvent } from '@shared/schemas/alerts.schema'
import {
  buildWhisperCommand,
  type MarketCatalogItem,
  type WhisperDraft
} from '@shared/schemas/market.schema'
import type { CartItemEntry } from '@shared/schemas/tools.schema'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

interface MarketStoreState {
  catalog: MarketCatalogItem[]
  isCatalogLoading: boolean
  catalogError: string | null
  activeWhisper: WhisperDraft | null
  whisperCopiedAt: number
  latestAlertToast: TriggeredAlertEvent | null
  ensureCatalogLoaded: (forceRefresh?: boolean) => Promise<void>
  triggerWhisper: (draft: WhisperDraft) => Promise<void>
  triggerRawWhisperText: (sellerName: string, commandEn: string, commandFr: string) => Promise<void>
  dismissWhisper: () => void
  setLatestAlertToast: (alert: TriggeredAlertEvent | null) => void
  toggleFavorite: (slug: string) => Promise<void>
  addToCart: (entry: CartItemEntry) => Promise<void>
  toggleCartItem: (entry: CartItemEntry) => Promise<void>
  updateCartItem: (slug: string, patch: Partial<CartItemEntry>) => Promise<void>
  removeFromCart: (slug: string) => Promise<void>
  clearCart: () => Promise<void>
  addPriceAlert: (rule: Omit<PriceSniperRule, 'id' | 'enabled'>) => Promise<void>
  togglePriceAlert: (id: string) => Promise<void>
  removePriceAlert: (id: string) => Promise<void>
}

export const useMarketStore = create<MarketStoreState>((set, get) => ({
  catalog: [],
  isCatalogLoading: false,
  catalogError: null,
  activeWhisper: null,
  whisperCopiedAt: 0,
  latestAlertToast: null,

  ensureCatalogLoaded: async (forceRefresh = false) => {
    if (!forceRefresh && (get().catalog.length > 0 || get().isCatalogLoading)) return
    set({ isCatalogLoading: true, catalogError: null })
    try {
      const catalog = await ipcClient.market.getCatalog(forceRefresh)
      set({ catalog, isCatalogLoading: false })
    } catch (err) {
      set({
        catalogError: err instanceof Error ? err.message : 'Échec chargement catalogue Market',
        isCatalogLoading: false
      })
    }
  },

  triggerWhisper: async (draft) => {
    const lang = useAppStore.getState().settings.market.whisperLanguage
    await ipcClient.clipboard.writeText(buildWhisperCommand(draft, lang))
    set({ activeWhisper: draft, whisperCopiedAt: Date.now() })
  },

  triggerRawWhisperText: async (sellerName, commandEn, commandFr) => {
    const draft: WhisperDraft = {
      ingameName: sellerName,
      itemNameEn: 'Bundle',
      itemNameFr: 'Lot groupé',
      platinum: 0,
      customCommandEn: commandEn,
      customCommandFr: commandFr
    }
    const lang = useAppStore.getState().settings.market.whisperLanguage
    await ipcClient.clipboard.writeText(buildWhisperCommand(draft, lang))
    set({ activeWhisper: draft, whisperCopiedAt: Date.now() })
  },

  dismissWhisper: () => set({ activeWhisper: null }),
  setLatestAlertToast: (alert) => set({ latestAlertToast: alert }),

  toggleFavorite: async (slug) => {
    const clean = slug.trim().toLowerCase()
    if (!clean) return
    const current = useAppStore.getState().settings.favorites
    const next = current.includes(clean)
      ? current.filter((s) => s !== clean)
      : [clean, ...current].slice(0, 300)
    await useAppStore.getState().updateSettings({ favorites: next })
  },

  addToCart: async (entry) => {
    const current = [...useAppStore.getState().settings.cart]
    const existingIdx = current.findIndex((c) => c.slug === entry.slug)
    const existing = existingIdx !== -1 ? current[existingIdx] : undefined
    if (existing && existingIdx !== -1) {
      current[existingIdx] = {
        ...existing,
        quantity: Math.min(99, existing.quantity + entry.quantity),
        ...(entry.desiredRank !== undefined ? { desiredRank: entry.desiredRank } : {})
      }
    } else if (current.length < 50) {
      current.push(entry)
    }
    await useAppStore.getState().updateSettings({ cart: current })
  },

  toggleCartItem: async (entry) => {
    const current = useAppStore.getState().settings.cart
    const exists = current.some((c) => c.slug === entry.slug)
    if (exists) {
      await useAppStore.getState().updateSettings({
        cart: current.filter((c) => c.slug !== entry.slug)
      })
    } else if (current.length < 50) {
      await useAppStore.getState().updateSettings({
        cart: [...current, entry]
      })
    }
  },

  updateCartItem: async (slug, patch) => {
    const next = useAppStore.getState().settings.cart.map((c) =>
      c.slug === slug ? { ...c, ...patch, quantity: Math.max(1, Math.min(99, patch.quantity ?? c.quantity)) } : c
    )
    await useAppStore.getState().updateSettings({ cart: next })
  },

  removeFromCart: async (slug) => {
    const next = useAppStore.getState().settings.cart.filter((c) => c.slug !== slug)
    await useAppStore.getState().updateSettings({ cart: next })
  },

  clearCart: async () => {
    await useAppStore.getState().updateSettings({ cart: [] })
  },

  addPriceAlert: async (ruleInput) => {
    const current = [...useAppStore.getState().settings.priceAlerts]
    if (current.length >= 40) return
    const newRule: PriceSniperRule = {
      ...ruleInput,
      id: `sniper-${Date.now().toString(36)}`,
      enabled: true
    }
    await useAppStore.getState().updateSettings({ priceAlerts: [newRule, ...current] })
  },

  togglePriceAlert: async (id) => {
    const next = useAppStore.getState().settings.priceAlerts.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    )
    await useAppStore.getState().updateSettings({ priceAlerts: next })
  },

  removePriceAlert: async (id) => {
    const next = useAppStore.getState().settings.priceAlerts.filter((r) => r.id !== id)
    await useAppStore.getState().updateSettings({ priceAlerts: next })
  }
}))
