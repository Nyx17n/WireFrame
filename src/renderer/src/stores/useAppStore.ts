import { create } from 'zustand'
import {
  DEFAULT_USER_SETTINGS,
  type UserSettings,
  type UserSettingsPatch
} from '@shared/schemas/settings.schema'
import type { SystemStatus } from '@shared/schemas/system.schema'
import type { UpdaterStatus } from '@shared/schemas/updater.schema'
import type { WindowState } from '@shared/schemas/window.schema'
import { ipcClient } from '@/services/ipc-client'
import { applyThemeToDocument } from '@/lib/theme-engine'

export type SettingsTabId = 'appearance' | 'audio' | 'window' | 'market' | 'system'

interface AppStoreState {
  settings: UserSettings
  windowState: WindowState
  systemStatus: SystemStatus | null
  updaterStatus: UpdaterStatus | null
  isLoading: boolean
  errorMessage: string | null
  isOmniboxOpen: boolean
  isSettingsOpen: boolean
  isChangelogOpen: boolean
  activeSettingsTab: SettingsTabId
  setOmniboxOpen: (open: boolean) => void
  openSettingsModal: (tab?: SettingsTabId) => void
  setSettingsOpen: (open: boolean) => void
  setChangelogOpen: (open: boolean) => void
  setActiveSettingsTab: (tab: SettingsTabId) => void
  initialize: () => Promise<() => void>
  refreshSystemStatus: () => Promise<void>
  clearSystemCache: () => Promise<void>
  checkForUpdates: () => Promise<void>
  installUpdate: () => Promise<void>
  updateSettings: (patch: UserSettingsPatch) => Promise<void>
  resetSettings: () => Promise<void>
  exportSettingsJson: () => Promise<boolean>
  importSettingsJson: () => Promise<boolean>
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
  updaterStatus: null,
  isLoading: true,
  errorMessage: null,
  isOmniboxOpen: false,
  isSettingsOpen: false,
  isChangelogOpen: false,
  activeSettingsTab: 'appearance',

  setOmniboxOpen: (open) => set({ isOmniboxOpen: open }),
  openSettingsModal: (tab) =>
    set((s) => ({
      isSettingsOpen: true,
      activeSettingsTab: tab ?? s.activeSettingsTab
    })),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setChangelogOpen: (open) => set({ isChangelogOpen: open }),
  setActiveSettingsTab: (tab) => set({ activeSettingsTab: tab }),

  initialize: async () => {
    set({ isLoading: true, errorMessage: null })
    try {
      const [settings, windowState, systemStatus, updaterStatus] = await Promise.all([
        ipcClient.settings.get(),
        ipcClient.window.getState(),
        ipcClient.system.getStatus(),
        ipcClient.updater.getStatus().catch(() => null)
      ])
      applyThemeToDocument(settings.appearance)
      set({ settings, windowState, systemStatus, updaterStatus, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur d’initialisation IPC inconnue'
      applyThemeToDocument(DEFAULT_USER_SETTINGS.appearance)
      set({ errorMessage: message, isLoading: false })
    }

    const unsubWindow = ipcClient.window.onStateChanged((nextWindowState) => {
      set({ windowState: nextWindowState })
    })
    const unsubUpdater = ipcClient.updater.onStatus((nextStatus) => {
      set({ updaterStatus: nextStatus })
    })
    return () => {
      unsubWindow()
      unsubUpdater()
    }
  },

  refreshSystemStatus: async () => {
    try {
      const systemStatus = await ipcClient.system.getStatus()
      set({ systemStatus })
    } catch (err) {
      set({ errorMessage: err instanceof Error ? err.message : 'Échec lecture statut système' })
    }
  },

  clearSystemCache: async () => {
    const systemStatus = await ipcClient.system.clearCache()
    set({ systemStatus })
  },

  checkForUpdates: async () => {
    const updaterStatus = await ipcClient.updater.check()
    set({ updaterStatus })
  },

  installUpdate: async () => {
    const updaterStatus = await ipcClient.updater.downloadAndInstall()
    set({ updaterStatus })
  },

  updateSettings: async (patch) => {
    try {
      const updated = await ipcClient.settings.update(patch)
      applyThemeToDocument(updated.appearance)
      set({ settings: updated, errorMessage: null })
    } catch (err) {
      set({ errorMessage: err instanceof Error ? err.message : 'Échec sauvegarde réglages' })
    }
  },

  resetSettings: async () => {
    const defaults = await ipcClient.settings.reset()
    applyThemeToDocument(defaults.appearance)
    const windowState = await ipcClient.window.setZoom(defaults.appearance.zoomPercent)
    set({ settings: defaults, windowState, errorMessage: null })
  },

  exportSettingsJson: async () => ipcClient.settings.exportJson(),

  importSettingsJson: async () => {
    const imported = await ipcClient.settings.importJson()
    if (!imported) return false
    applyThemeToDocument(imported.appearance)
    const windowState = await ipcClient.window.setZoom(imported.appearance.zoomPercent)
    set({ settings: imported, windowState })
    return true
  },

  toggleAlwaysOnTop: async () => {
    const windowState = await ipcClient.window.setAlwaysOnTop(!get().windowState.isAlwaysOnTop)
    set({ windowState })
  },

  toggleCompactMode: async () => {
    const windowState = await ipcClient.window.setCompactMode(!get().windowState.isCompactMode)
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
