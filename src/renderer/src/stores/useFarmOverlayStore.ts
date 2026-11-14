import { create } from 'zustand'
import type { CodexCategory, CodexItemDetail } from '@shared/schemas/codex.schema'
import {
  CODEX_OVERLAY_MAX_ENTRIES,
  type CodexOverlayPinnedEntry,
  type FarmOverlayLiveState,
  type OverlayDensity
} from '@shared/schemas/extensions.schema'
import {
  buildItemKey,
  buildSingleItemOverlayEntry,
  getEquipmentEntriesByMode,
  type EquipmentPinMode
} from '@/lib/codex-overlay-entries'
import { ipcClient } from '@/services/ipc-client'
import { notify } from '@/stores/useNotificationStore'

interface FarmOverlayStoreState {
  liveState: FarmOverlayLiveState
  isHydrated: boolean
  errorMessage: string | null
  hydrate: () => Promise<() => void>
  setWindowOpen: (open: boolean) => Promise<void>
  setClickThrough: (enabled: boolean) => Promise<void>
  setSize: (size: OverlayDensity) => Promise<void>
  setOpacity: (opacityPercent: number) => Promise<void>
  setShowObtained: (showObtained: boolean) => Promise<void>
  setShortcut: (shortcutToggle: string) => Promise<void>
  toggleEntry: (entry: CodexOverlayPinnedEntry, openWindow?: boolean) => Promise<void>
  pinEquipmentSelection: (
    detail: CodexItemDetail,
    mode: EquipmentPinMode,
    openWindow?: boolean
  ) => Promise<void>
  toggleCraftResources: (detail: CodexItemDetail) => Promise<void>
  unpinItemGroup: (category: CodexCategory, itemId: string) => Promise<void>
  pinQuickItem: (category: CodexCategory, itemId: string) => Promise<void>
  toggleObtained: (entryId: string) => Promise<void>
  removeEntry: (entryId: string) => Promise<void>
  clearAllEntries: () => Promise<void>
}

const DEFAULT_LIVE_STATE: FarmOverlayLiveState = {
  extensionEnabled: true,
  windowOpen: false,
  isClickThrough: true,
  size: 'md',
  opacityPercent: 88,
  shortcutToggle: 'Alt+O',
  showObtained: false,
  pinnedEntries: []
}

export const useFarmOverlayStore = create<FarmOverlayStoreState>((set, get) => ({
  liveState: DEFAULT_LIVE_STATE,
  isHydrated: false,
  errorMessage: null,

  hydrate: async () => {
    try {
      const state = await ipcClient.overlay.getState()
      set({ liveState: state, isHydrated: true, errorMessage: null })
    } catch (err) {
      set({
        isHydrated: true,
        errorMessage: err instanceof Error ? err.message : 'Erreur lecture Overlay Farm'
      })
    }

    const unsub = ipcClient.overlay.onStateChanged((next) => {
      set({ liveState: next, isHydrated: true, errorMessage: null })
    })
    return unsub
  },

  setWindowOpen: async (open) => {
    try {
      const liveState = await ipcClient.overlay.setWindowOpen(open)
      set({ liveState, errorMessage: null })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Échec bascule fenêtre Overlay'
      set({ errorMessage: message })
      notify({ kind: 'error', title: 'Erreur Overlay Farm', message })
    }
  },

  setClickThrough: async (enabled) => {
    const liveState = await ipcClient.overlay.setClickThrough(enabled)
    set({ liveState })
  },

  setSize: async (size) => {
    const liveState = await ipcClient.overlay.updateState({ size })
    set({ liveState })
  },

  setOpacity: async (opacityPercent) => {
    const clamped = Math.max(40, Math.min(98, Math.round(opacityPercent)))
    const liveState = await ipcClient.overlay.updateState({ opacityPercent: clamped })
    set({ liveState })
  },

  setShowObtained: async (showObtained) => {
    const liveState = await ipcClient.overlay.updateState({ showObtained })
    set({ liveState })
  },

  setShortcut: async (shortcutToggle) => {
    const clean = shortcutToggle.trim()
    if (!clean) return
    const liveState = await ipcClient.overlay.updateState({ shortcutToggle: clean })
    set({ liveState })
  },

  toggleEntry: async (entry, openWindow = false) => {
    const current = get().liveState.pinnedEntries
    const exists = current.some((e) => e.entryId === entry.entryId)
    let next: CodexOverlayPinnedEntry[]

    if (exists) {
      next = current.filter((e) => e.entryId !== entry.entryId)
    } else {
      if (current.length >= CODEX_OVERLAY_MAX_ENTRIES) {
        notify({
          kind: 'warning',
          title: 'Limite de l’Overlay atteinte',
          message: `Maximum ${CODEX_OVERLAY_MAX_ENTRIES} entrées simultanées dans le Codex Farm Overlay.`
        })
        return
      }
      next = [...current, entry]
    }

    const liveState = await ipcClient.overlay.updateState({
      pinnedEntries: next,
      ...(!exists && openWindow ? { windowOpen: true } : {})
    })
    set({ liveState })
  },

  pinEquipmentSelection: async (detail, mode, openWindow = true) => {
    const itemKey = buildItemKey(detail.category, detail.id)
    const desired = getEquipmentEntriesByMode(detail, mode)
    if (desired.length === 0) return

    const current = get().liveState.pinnedEntries
    const preservedObtained = new Map(
      current.filter((e) => e.itemKey === itemKey).map((e) => [e.entryId, e.obtained])
    )
    const others = current.filter((e) => e.itemKey !== itemKey)
    const mergedDesired = desired.map((d) => ({
      ...d,
      obtained: preservedObtained.get(d.entryId) ?? false
    }))
    const next = [...others, ...mergedDesired].slice(0, CODEX_OVERLAY_MAX_ENTRIES)

    const liveState = await ipcClient.overlay.updateState({
      pinnedEntries: next,
      ...(openWindow ? { windowOpen: true } : {})
    })
    set({ liveState })
    const modeLabel =
      mode === 'resources'
        ? 'Ressources de craft'
        : mode === 'parts'
          ? 'Pièces & Schémas'
          : 'Pièces + Ressources de craft'
    notify({
      kind: 'success',
      title: `${detail.nameFr} envoyé dans l’Overlay`,
      message: `${mergedDesired.length} entrée(s) (${modeLabel}) affichée(s) en jeu.`
    })
  },

  toggleCraftResources: async (detail) => {
    const resDesired = getEquipmentEntriesByMode(detail, 'resources')
    if (resDesired.length === 0) return

    const current = get().liveState.pinnedEntries
    const desiredIds = new Set(resDesired.map((d) => d.entryId))
    const allAlreadyPinned = resDesired.every((d) =>
      current.some((c) => c.entryId === d.entryId)
    )

    if (allAlreadyPinned) {
      const next = current.filter((c) => !desiredIds.has(c.entryId))
      const liveState = await ipcClient.overlay.updateState({ pinnedEntries: next })
      set({ liveState })
      notify({
        kind: 'info',
        title: `Ressources de ${detail.nameFr} retirées`,
        message: 'Les matériaux de Fonderie ont été retirés de l’Overlay.'
      })
      return
    }

    const preservedObtained = new Map(current.map((e) => [e.entryId, e.obtained]))
    const kept = current.filter((c) => !desiredIds.has(c.entryId))
    const mergedRes = resDesired.map((d) => ({
      ...d,
      obtained: preservedObtained.get(d.entryId) ?? false
    }))
    const next = [...kept, ...mergedRes].slice(0, CODEX_OVERLAY_MAX_ENTRIES)
    const liveState = await ipcClient.overlay.updateState({
      pinnedEntries: next,
      windowOpen: true
    })
    set({ liveState })
    notify({
      kind: 'success',
      title: `Ressources de craft (${detail.nameFr}) en Overlay`,
      message: `${mergedRes.length} matériau(x) requis affichés avec quantités et spots de farm.`
    })
  },

  unpinItemGroup: async (category, itemId) => {
    const itemKey = buildItemKey(category, itemId)
    const next = get().liveState.pinnedEntries.filter((e) => e.itemKey !== itemKey)
    const liveState = await ipcClient.overlay.updateState({ pinnedEntries: next })
    set({ liveState })
  },

  pinQuickItem: async (category, itemId) => {
    const itemKey = buildItemKey(category, itemId)
    const current = get().liveState.pinnedEntries
    const alreadyPinned = current.some((e) => e.itemKey === itemKey)
    if (alreadyPinned) {
      const next = current.filter((e) => e.itemKey !== itemKey)
      const liveState = await ipcClient.overlay.updateState({ pinnedEntries: next })
      set({ liveState })
      notify({
        kind: 'info',
        title: 'Retiré de l’Overlay Farm',
        message: 'L’entrée a été retirée de votre liste active.'
      })
      return
    }

    const detail = await ipcClient.codex.getItemDetail(category, itemId)
    if (
      (detail.category === 'warframes' || detail.category === 'weapons') &&
      detail.components.length > 0
    ) {
      await get().pinEquipmentSelection(detail, 'all', true)
    } else {
      const single = buildSingleItemOverlayEntry(detail)
      if (current.length >= CODEX_OVERLAY_MAX_ENTRIES) {
        notify({
          kind: 'warning',
          title: 'Limite de l’Overlay atteinte',
          message: `Maximum ${CODEX_OVERLAY_MAX_ENTRIES} entrées simultanées.`
        })
        return
      }
      const liveState = await ipcClient.overlay.updateState({
        pinnedEntries: [...current, single],
        windowOpen: true
      })
      set({ liveState })
      notify({
        kind: 'success',
        title: `${detail.nameFr} épinglé à l’Overlay`,
        message: 'Localisations et % de drop affichés en jeu.'
      })
    }
  },

  toggleObtained: async (entryId) => {
    const next = get().liveState.pinnedEntries.map((e) =>
      e.entryId === entryId ? { ...e, obtained: !e.obtained } : e
    )
    const liveState = await ipcClient.overlay.updateState({ pinnedEntries: next })
    set({ liveState })
  },

  removeEntry: async (entryId) => {
    const next = get().liveState.pinnedEntries.filter((e) => e.entryId !== entryId)
    const liveState = await ipcClient.overlay.updateState({ pinnedEntries: next })
    set({ liveState })
  },

  clearAllEntries: async () => {
    const liveState = await ipcClient.overlay.updateState({ pinnedEntries: [] })
    set({ liveState })
    notify({
      kind: 'info',
      title: 'Overlay Farm vidé',
      message: 'Tous les objectifs suivis ont été effacés.'
    })
  }
}))
