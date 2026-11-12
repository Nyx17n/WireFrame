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
import { notify } from '@/stores/useNotificationStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function resolveSlugLabel(catalog: readonly MarketCatalogItem[], slug: string): string {
  const match = catalog.find((i) => i.slug === slug)
  if (!match) return slug.replace(/_/g, ' ')
  const lang = useAppStore.getState().settings.market.language
  return lang === 'fr' ? match.nameFr : match.nameEn
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
      const message = err instanceof Error ? err.message : 'Échec chargement catalogue Market'
      set({ catalogError: message, isCatalogLoading: false })
      notify({
        kind: 'error',
        title: 'Catalogue Warframe Market indisponible',
        message,
        actions: [{ label: 'Réessayer', icon: 'retry', onClick: () => void get().ensureCatalogLoaded(true) }]
      })
    }
  },

  triggerWhisper: async (draft) => {
    const lang = useAppStore.getState().settings.market.whisperLanguage
    await ipcClient.clipboard.writeText(buildWhisperCommand(draft, lang))
    set({ activeWhisper: draft, whisperCopiedAt: Date.now() })
    notify({
      kind: 'info',
      title: 'Commande /w copiée',
      message: `@${draft.ingameName} (${draft.platinum}p) · Colle en jeu avec Ctrl+V`
    })
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
    notify({
      kind: 'info',
      title: 'Message groupé /w copié',
      message: `@${sellerName} · Colle en jeu avec Ctrl+V`
    })
  },

  dismissWhisper: () => set({ activeWhisper: null }),
  setLatestAlertToast: (alert) => set({ latestAlertToast: alert }),

  toggleFavorite: async (slug) => {
    const clean = slug.trim().toLowerCase()
    if (!clean) return
    const current = useAppStore.getState().settings.favorites
    const removing = current.includes(clean)
    const next = removing
      ? current.filter((s) => s !== clean)
      : [clean, ...current].slice(0, 300)
    await useAppStore.getState().updateSettings({ favorites: next })
    const label = resolveSlugLabel(get().catalog, clean)
    notify({
      kind: removing ? 'info' : 'success',
      title: removing ? 'Retiré des favoris' : 'Ajouté aux favoris',
      message: label
    })
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
    } else if (current.length >= 50) {
      notify({
        kind: 'warning',
        title: 'Panier complet (50 max)',
        message: 'Retire un article avant d’en ajouter un nouveau.'
      })
      return
    } else {
      current.push(entry)
    }
    await useAppStore.getState().updateSettings({ cart: current })
    notify({
      kind: 'success',
      title: 'Ajouté au panier',
      message: `${resolveSlugLabel(get().catalog, entry.slug)} · ${current.length} article(s)`,
      actions: [
        {
          label: 'Ouvrir le panier',
          icon: 'cart',
          variant: 'outline',
          onClick: () => useTabsStore.getState().navigateActive({ kind: 'market-cart' })
        }
      ]
    })
  },

  toggleCartItem: async (entry) => {
    const current = useAppStore.getState().settings.cart
    const exists = current.some((c) => c.slug === entry.slug)
    if (exists) {
      await useAppStore.getState().updateSettings({
        cart: current.filter((c) => c.slug !== entry.slug)
      })
      notify({
        kind: 'info',
        title: 'Retiré du panier',
        message: resolveSlugLabel(get().catalog, entry.slug)
      })
    } else if (current.length >= 50) {
      notify({
        kind: 'warning',
        title: 'Panier complet (50 max)',
        message: 'Retire un article avant d’en ajouter un nouveau.'
      })
    } else {
      await useAppStore.getState().updateSettings({
        cart: [...current, entry]
      })
      notify({
        kind: 'success',
        title: 'Ajouté au panier',
        message: resolveSlugLabel(get().catalog, entry.slug),
        actions: [
          {
            label: 'Ouvrir le panier',
            icon: 'cart',
            variant: 'outline',
            onClick: () => useTabsStore.getState().navigateActive({ kind: 'market-cart' })
          }
        ]
      })
    }
  },

  updateCartItem: async (slug, patch) => {
    const next = useAppStore.getState().settings.cart.map((c) =>
      c.slug === slug
        ? { ...c, ...patch, quantity: Math.max(1, Math.min(99, patch.quantity ?? c.quantity)) }
        : c
    )
    await useAppStore.getState().updateSettings({ cart: next })
  },

  removeFromCart: async (slug) => {
    const next = useAppStore.getState().settings.cart.filter((c) => c.slug !== slug)
    await useAppStore.getState().updateSettings({ cart: next })
    notify({
      kind: 'info',
      title: 'Retiré du panier',
      message: resolveSlugLabel(get().catalog, slug)
    })
  },

  clearCart: async () => {
    await useAppStore.getState().updateSettings({ cart: [] })
    notify({ kind: 'info', title: 'Panier vidé' })
  },

  addPriceAlert: async (ruleInput) => {
    const current = [...useAppStore.getState().settings.priceAlerts]
    if (current.length >= 40) {
      notify({
        kind: 'warning',
        title: 'Limite de 40 règles Price Sniper atteinte',
        message: 'Supprime une règle existante pour en créer une nouvelle.'
      })
      return
    }
    const newRule: PriceSniperRule = {
      ...ruleInput,
      id: `sniper-${Date.now().toString(36)}`,
      enabled: true
    }
    const lang = useAppStore.getState().settings.market.language
    const ruleLabel = lang === 'fr' ? ruleInput.nameFr : ruleInput.nameEn
    await useAppStore.getState().updateSettings({ priceAlerts: [newRule, ...current] })
    notify({
      kind: 'success',
      title: 'Règle Price Sniper activée',
      message: `${ruleLabel} ≤ ${ruleInput.maxPlatinum}p`
    })
  },

  togglePriceAlert: async (id) => {
    const next = useAppStore.getState().settings.priceAlerts.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    )
    await useAppStore.getState().updateSettings({ priceAlerts: next })
  },

  removePriceAlert: async (id) => {
    const target = useAppStore.getState().settings.priceAlerts.find((r) => r.id === id)
    const next = useAppStore.getState().settings.priceAlerts.filter((r) => r.id !== id)
    await useAppStore.getState().updateSettings({ priceAlerts: next })
    const lang = useAppStore.getState().settings.market.language
    notify({
      kind: 'info',
      title: 'Règle Price Sniper supprimée',
      ...(target ? { message: lang === 'fr' ? target.nameFr : target.nameEn } : {})
    })
  }
}))
