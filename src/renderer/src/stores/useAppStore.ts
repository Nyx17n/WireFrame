import { create } from 'zustand'
import {
  DEFAULT_USER_SETTINGS,
  type UserSettings,
  type UserSettingsPatch
} from '@shared/schemas/settings.schema'
import type { SystemStatus } from '@shared/schemas/system.schema'
import type { WindowState } from '@shared/schemas/window.schema'
import { ipcClient } from '@/services/ipc-client'
import { applyThemeToDocument } from '@/lib/theme-engine'

interface AppStoreState {
  settings: UserSettings
  windowState: WindowState
  systemStatus: SystemStatus | null
  isLoading: boolean
  errorMessage: string | null
  initialize: () => Promise<() => void>
  refreshSystemStatus: () => Promise<void>
  updateSettings: (patch: UserSettingsPatch) => Promise<void>
  resetSettings: () => Promise<void>
  toggleAlwaysOnTop: () => Promise<void>
  toggleCompactMode: () => Promise<void>
  setWindowZoom: (zoomPercent: number) => Promise<void>
}

const DEFAULT_WINDOW_STATE: WindowState = {
  isMaximized: false,
  isAlwaysOnTop: false,
  isCompactMode: false,
  zoomPercent: 100
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  settings: DEFAULT_USER_SETTINGS,
  windowState: DEFAULT_WINDOW_STATE,
  systemStatus: null,
  isLoading: true,
  errorMessage: null,

  initialize: async () => {
    set({ isLoading: true, errorMessage: null })
    try {
      const [settings, windowState, systemStatus] = await Promise.all([
        ipcClient.settings.get(),
        ipcClient.window.getState(),
        ipcClient.system.getStatus()
      ])
      applyThemeToDocument(settings.appearance)
      set({ settings, windowState, systemStatus, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur d’initialisation IPC inconnue'
      applyThemeToDocument(DEFAULT_USER_SETTINGS.appearance)
      set({ errorMessage: message, isLoading: false })
    }

    const unsubscribe = ipcClient.window.onStateChanged((nextWindowState) => {
      set({ windowState: nextWindowState })
    })
    return unsubscribe
  },

  refreshSystemStatus: async () => {
    try {
      const systemStatus = await ipcClient.system.getStatus()
      set({ systemStatus })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Échec lecture statut système'
      set({ errorMessage: message })
    }
  },

  updateSettings: async (patch) => {
    try {
      const updated = await ipcClient.settings.update(patch)
      applyThemeToDocument(updated.appearance)
      set({ settings: updated, errorMessage: null })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de sauvegarder les réglages'
      set({ errorMessage: message })
    }
  },

  resetSettings: async () => {
    try {
      const defaults = await ipcClient.settings.reset()
      applyThemeToDocument(defaults.appearance)
      const windowState = await ipcClient.window.setZoom(defaults.appearance.zoomPercent)
      set({ settings: defaults, windowState, errorMessage: null })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de réinitialiser les réglages'
      set({ errorMessage: message })
    }
  },

  toggleAlwaysOnTop: async () => {
    const next = !get().windowState.isAlwaysOnTop
    const windowState = await ipcClient.window.setAlwaysOnTop(next)
    set({ windowState })
  },

  toggleCompactMode: async () => {
    const next = !get().windowState.isCompactMode
    const windowState = await ipcClient.window.setCompactMode(next)
    set({ windowState })
  },

  setWindowZoom: async (zoomPercent) => {
    const clamped = Math.max(50, Math.min(200, Math.round(zoomPercent)))
    const [windowState, settings] = await Promise.all([
      ipcClient.window.setZoom(clamped),
      ipcClient.settings.update({ appearance: { zoomPercent: clamped } })
    ])
    set({ windowState, settings })
  }
}))

