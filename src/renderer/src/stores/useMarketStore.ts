import { create } from 'zustand'
import {
  buildWhisperCommand,
  type MarketCatalogItem,
  type WhisperDraft
} from '@shared/schemas/market.schema'
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
  ensureCatalogLoaded: (forceRefresh?: boolean) => Promise<void>
  triggerWhisper: (draft: WhisperDraft) => Promise<void>
  dismissWhisper: () => void
  toggleFavorite: (slug: string) => Promise<void>
}

export const useMarketStore = create<MarketStoreState>((set, get) => ({
  catalog: [],
  isCatalogLoading: false,
  catalogError: null,
  activeWhisper: null,
  whisperCopiedAt: 0,

  ensureCatalogLoaded: async (forceRefresh = false) => {
    if (!forceRefresh && (get().catalog.length > 0 || get().isCatalogLoading)) {
      return
    }
    set({ isCatalogLoading: true, catalogError: null })
    try {
      const catalog = await ipcClient.market.getCatalog(forceRefresh)
      set({ catalog, isCatalogLoading: false })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Échec du chargement du catalogue Market'
      set({ catalogError: msg, isCatalogLoading: false })
    }
  },

  triggerWhisper: async (draft) => {
    const lang = useAppStore.getState().settings.market.whisperLanguage
    const cmd = buildWhisperCommand(draft, lang)
    await ipcClient.clipboard.writeText(cmd)
    set({ activeWhisper: draft, whisperCopiedAt: Date.now() })
  },

  dismissWhisper: () => set({ activeWhisper: null }),

  toggleFavorite: async (slug) => {
    const clean = slug.trim().toLowerCase()
    if (!clean) return
    const current = useAppStore.getState().settings.favorites
    const next = current.includes(clean)
      ? current.filter((s) => s !== clean)
      : [clean, ...current].slice(0, 300)
    await useAppStore.getState().updateSettings({ favorites: next })
  }
}))

