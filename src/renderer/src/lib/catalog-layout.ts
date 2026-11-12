import { create } from 'zustand'
import type { CodexSummaryCard } from '@shared/schemas/codex.schema'
import type { MarketCatalogItem } from '@shared/schemas/market.schema'
import type { CatalogCardSize, CatalogLayoutMode } from '@shared/schemas/settings.schema'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { normalizeSearchText } from '@/stores/useMarketStore'

const SIZE_STORAGE_KEY = 'wf.catalogCardSize'

function readStoredCardSize(): CatalogCardSize {
  try {
    const raw = window.localStorage.getItem(SIZE_STORAGE_KEY)
    if (raw === 'sm' || raw === 'md' || raw === 'lg') return raw
  } catch {
    // Ignore storage access errors
  }
  return 'md'
}

interface LocalDisplayState {
  overrideSize: CatalogCardSize | null
  setOverrideSize: (size: CatalogCardSize) => void
}

const useLocalDisplayStore = create<LocalDisplayState>((set) => ({
  overrideSize: readStoredCardSize(),
  setOverrideSize: (size) => {
    try {
      window.localStorage.setItem(SIZE_STORAGE_KEY, size)
    } catch {
      // Ignore storage access errors
    }
    set({ overrideSize: size })
  }
}))

export interface CatalogDisplayPreferences {
  layoutMode: CatalogLayoutMode
  cardSize: CatalogCardSize
  setLayoutMode: (mode: CatalogLayoutMode) => void
  setCardSize: (size: CatalogCardSize) => void
}

export function useCatalogDisplayPreferences(): CatalogDisplayPreferences {
  const layoutMode = useAppStore((s) => s.settings.appearance.catalogLayoutMode ?? 'rect')
  const persistedSize = useAppStore(
    (s) => (s.settings.appearance as { catalogCardSize?: CatalogCardSize }).catalogCardSize
  )
  const overrideSize = useLocalDisplayStore((s) => s.overrideSize)
  const setOverrideSize = useLocalDisplayStore((s) => s.setOverrideSize)

  const cardSize: CatalogCardSize = overrideSize ?? persistedSize ?? 'md'

  const setLayoutMode = (nextMode: CatalogLayoutMode): void => {
    useAppStore.setState((s) => ({
      settings: {
        ...s.settings,
        appearance: { ...s.settings.appearance, catalogLayoutMode: nextMode }
      }
    }))
    void ipcClient.settings
      .update({ appearance: { catalogLayoutMode: nextMode } })
      .then((updated) => useAppStore.setState({ settings: updated }))
      .catch(() => undefined)
  }

  const setCardSize = (nextSize: CatalogCardSize): void => {
    setOverrideSize(nextSize)
    useAppStore.setState((s) => ({
      settings: {
        ...s.settings,
        appearance: { ...s.settings.appearance, catalogCardSize: nextSize }
      }
    }))
    void ipcClient.settings
      .update({ appearance: { catalogCardSize: nextSize } })
      .then((updated) => useAppStore.setState({ settings: updated }))
      .catch(() => undefined)
  }

  return { layoutMode, cardSize, setLayoutMode, setCardSize }
}

export function getCatalogGridClass(mode: CatalogLayoutMode, size: CatalogCardSize): string {
  if (mode === 'list') {
    if (size === 'sm') return 'flex flex-col gap-1.5'
    if (size === 'lg') return 'flex flex-col gap-2.5'
    return 'flex flex-col gap-2'
  }

  if (mode === 'square') {
    if (size === 'sm') {
      return 'grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7'
    }
    if (size === 'lg') {
      return 'grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    }
    return 'grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
  }

  // 'rect'
  if (size === 'sm') {
    return 'grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  }
  if (size === 'lg') {
    return 'grid grid-cols-1 gap-3 lg:grid-cols-2'
  }
  return 'grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3'
}

export function getCardImageClass(mode: CatalogLayoutMode, size: CatalogCardSize): string {
  if (mode === 'square') {
    if (size === 'sm') return 'h-16 w-16 sm:h-20 sm:w-20'
    if (size === 'lg') return 'h-32 w-32 sm:h-40 sm:w-40'
    return 'h-24 w-24 sm:h-28 sm:w-28'
  }
  if (mode === 'list') {
    if (size === 'sm') return 'h-9 w-9'
    if (size === 'lg') return 'h-16 w-16'
    return 'h-12 w-12'
  }
  // 'rect'
  if (size === 'sm') return 'h-12 w-12'
  if (size === 'lg') return 'h-20 w-20'
  return 'h-16 w-16'
}

export function formatResourceCount(count: number): string {
  if (count >= 10_000) return `${Math.round(count / 1000)}k`
  if (count >= 1_000) return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k`
  return String(count)
}

export function resolveCodexMarketSlug(
  card: CodexSummaryCard,
  catalog: readonly MarketCatalogItem[]
): string | null {
  if (!card.isTradable || catalog.length === 0) return null
  const base = card.id.replace(/-/g, '_')
  const candidates =
    card.category === 'relics'
      ? [`${base}_relic`, `${base}_intact`, base]
      : card.category === 'warframes' || (card.category === 'weapons' && card.isPrime)
        ? [`${base}_set`, base]
        : [base, `${base}_set`]

  const slugSet = new Set(catalog.map((c) => c.slug))
  for (const cand of candidates) {
    if (slugSet.has(cand)) return cand
  }

  const normEn = normalizeSearchText(card.nameEn)
  const byName = catalog.find((c) => {
    const cNorm = normalizeSearchText(c.nameEn)
    return cNorm === normEn || cNorm === `${normEn} set` || cNorm === `${normEn} relic`
  })
  return byName?.slug ?? null
}

