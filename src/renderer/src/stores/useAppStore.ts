import { create } from 'zustand'
import {
  DEFAULT_USER_SETTINGS,
  type UserSettings,
  type UserSettingsPatch
} from '@shared/schemas/settings.schema'
import type { SystemStatus } from '@shared/schemas/system.schema'
import type { UpdaterStatus } from '@shared/schemas/updater.schema'
import type { WindowState } from '@shared/schemas/window.schema'
import {
  clearModule8Cache,
  mergeModule8Fallback,
  rememberModule8Patch
} from '@/lib/motion-prefs-cache'
import { applyThemeToDocument } from '@/lib/theme-engine'
import { ipcClient } from '@/services/ipc-client'
import { useFarmOverlayStore } from '@/stores/useFarmOverlayStore'
import { notify, useNotificationStore } from '@/stores/useNotificationStore'

export type SettingsTabId = 'appearance' | 'audio' | 'window' | 'market' | 'extensions' | 'system'

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
  splashRunId: number
  activeSettingsTab: SettingsTabId
  setOmniboxOpen: (open: boolean) => void
  openSettingsModal: (tab?: SettingsTabId) => void
  setSettingsOpen: (open: boolean) => void
  setChangelogOpen: (open: boolean) => void
  replayStartupAnimation: () => void
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
  setClickThrough: (enabled: boolean) => Promise<void>
  setWindowZoom: (zoomPercent: number) => Promise<void>
}

const DEFAULT_WINDOW_STATE: WindowState = {
  isMaximized: false,
  isAlwaysOnTop: false,
  isCompactMode: false,
  isClickThrough: false,
  zoomPercent: 100
}

function syncNotificationPrefs(settings: UserSettings): void {
  useNotificationStore
    .getState()
    .setActionNotificationsEnabled(settings.audio.actionNotificationsEnabled !== false)
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
  splashRunId: 1,
  activeSettingsTab: 'appearance',

  setOmniboxOpen: (open) => set({ isOmniboxOpen: open }),
  openSettingsModal: (tab) =>
    set((s) => ({
      isSettingsOpen: true,
      activeSettingsTab: tab ?? s.activeSettingsTab
    })),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setChangelogOpen: (open) => set({ isChangelogOpen: open }),
  replayStartupAnimation: () =>
    set((s) => ({ isSettingsOpen: false, splashRunId: s.splashRunId + 1 })),
  setActiveSettingsTab: (tab) => set({ activeSettingsTab: tab }),

  initialize: async () => {
    set({ isLoading: true, errorMessage: null })
    try {
      const [rawSettings, windowState, systemStatus, updaterStatus] = await Promise.all([
        ipcClient.settings.get(),
        ipcClient.window.getState(),
        ipcClient.system.getStatus(),
        ipcClient.updater.getStatus().catch(() => null)
      ])
      const settings = mergeModule8Fallback(rawSettings)
      applyThemeToDocument(settings.appearance)
      syncNotificationPrefs(settings)
      useNotificationStore.getState().setHydrated(true)
      set({ settings, windowState, systemStatus, updaterStatus, isLoading: false })

      try {
        const seenKey = 'wf.lastSeenVersion'
        const previousSeen = window.localStorage.getItem(seenKey)
        if (systemStatus.appVersion && previousSeen !== systemStatus.appVersion) {
          window.localStorage.setItem(seenKey, systemStatus.appVersion)
          const delayMs = settings.appearance.startupAnimationEnabled ? 2700 : 350
          window.setTimeout(() => {
            set({ isChangelogOpen: true })
          }, delayMs)
        }
      } catch {
        // Ignore storage access errors in restricted contexts
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur d’initialisation IPC inconnue'
      applyThemeToDocument(DEFAULT_USER_SETTINGS.appearance)
      useNotificationStore.getState().setHydrated(true)
      notify({ kind: 'error', title: 'Erreur d’initialisation IPC', message })
      set({ errorMessage: message, isLoading: false })
    }

    const unsubWindow = ipcClient.window.onStateChanged((nextWindowState) => {
      set({ windowState: nextWindowState })
    })
    const unsubOverlayPromise = useFarmOverlayStore.getState().hydrate()
    const unsubUpdater = ipcClient.updater.onStatus((nextStatus) => {
      const prevState = get().updaterStatus?.state
      set({ updaterStatus: nextStatus })
      if (nextStatus.state !== prevState) {
        if (nextStatus.state === 'available' && nextStatus.availableVersion) {
          notify({
            kind: 'info',
            title: `Mise à jour v${nextStatus.availableVersion} disponible`,
            message: 'Téléchargement différentiel en arrière-plan…'
          })
        } else if (nextStatus.state === 'downloaded' && nextStatus.availableVersion) {
          notify({
            kind: 'success',
            title: `Mise à jour v${nextStatus.availableVersion} prête`,
            message: 'Cliquez pour installer et redémarrer WireFrame.',
            actions: [{ label: 'Installer', onClick: () => void get().installUpdate() }]
          })
        } else if (nextStatus.state === 'error' && nextStatus.message) {
          notify({
            kind: 'error',
            title: 'Échec de mise à jour',
            message: nextStatus.message
          })
        }
      }
    })
    return () => {
      unsubWindow()
      unsubUpdater()
      void unsubOverlayPromise.then((fn) => fn())
    }
  },

  refreshSystemStatus: async () => {
    try {
      const systemStatus = await ipcClient.system.getStatus()
      set({ systemStatus })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Échec lecture statut système'
      notify({ kind: 'error', title: 'Erreur statut système', message })
      set({ errorMessage: message })
    }
  },

  clearSystemCache: async () => {
    const systemStatus = await ipcClient.system.clearCache()
    set({ systemStatus })
    notify({
      kind: 'info',
      title: 'Cache vidé',
      message: 'Le cache mémoire et les miniatures disque ont été purgés.'
    })
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
    rememberModule8Patch(patch)
    const optimistic = mergeModule8Fallback(
      {
        ...get().settings,
        appearance: {
          ...get().settings.appearance,
          ...patch.appearance,
          backgroundGradient: {
            ...get().settings.appearance.backgroundGradient,
            ...patch.appearance?.backgroundGradient
          },
          compactTimers: {
            ...get().settings.appearance.compactTimers,
            ...patch.appearance?.compactTimers
          }
        },
        audio: { ...get().settings.audio, ...patch.audio },
        extensions: { ...get().settings.extensions, ...patch.extensions },
        codexFarmOverlay: {
          ...get().settings.codexFarmOverlay,
          ...patch.codexFarmOverlay,
          bounds: {
            ...get().settings.codexFarmOverlay.bounds,
            ...patch.codexFarmOverlay?.bounds
          },
          pinnedEntries:
            patch.codexFarmOverlay?.pinnedEntries ?? get().settings.codexFarmOverlay.pinnedEntries
        }
      },
      patch
    )
    applyThemeToDocument(optimistic.appearance)
    syncNotificationPrefs(optimistic)

    try {
      const saved = await ipcClient.settings.update(patch)
      const updated = mergeModule8Fallback(saved, patch)
      applyThemeToDocument(updated.appearance)
      syncNotificationPrefs(updated)
      set({ settings: updated, errorMessage: null })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Échec sauvegarde réglages'
      notify({ kind: 'error', title: 'Échec de sauvegarde des réglages', message })
      set({ errorMessage: message })
    }
  },

  resetSettings: async () => {
    clearModule8Cache()
    const defaults = await ipcClient.settings.reset()
    applyThemeToDocument(defaults.appearance)
    syncNotificationPrefs(defaults)
    const windowState = await ipcClient.window.setZoom(defaults.appearance.zoomPercent)
    set({ settings: defaults, windowState, errorMessage: null })
    notify({
      kind: 'info',
      title: 'Réglages réinitialisés',
      message: 'Toutes les préférences ont été remises par défaut.'
    })
  },

  exportSettingsJson: async () => {
    const ok = await ipcClient.settings.exportJson()
    if (ok) {
      notify({
        kind: 'success',
        title: 'Paramètres exportés',
        message: 'Sauvegarde JSON enregistrée avec succès.'
      })
    }
    return ok
  },

  importSettingsJson: async () => {
    const imported = await ipcClient.settings.importJson()
    if (!imported) return false
    clearModule8Cache()
    applyThemeToDocument(imported.appearance)
    syncNotificationPrefs(imported)
    const windowState = await ipcClient.window.setZoom(imported.appearance.zoomPercent)
    set({ settings: imported, windowState })
    notify({
      kind: 'success',
      title: 'Paramètres importés',
      message: 'Configuration validée par Zod et appliquée.'
    })
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

  setClickThrough: async (enabled) => {
    const windowState = await ipcClient.window.setClickThrough(enabled)
    set({ windowState })
  },

  setWindowZoom: async (zoomPercent) => {
    const clamped = Math.max(50, Math.min(200, Math.round(zoomPercent)))
    const [windowState, saved] = await Promise.all([
      ipcClient.window.setZoom(clamped),
      ipcClient.settings.update({ appearance: { zoomPercent: clamped } })
    ])
    set({ windowState, settings: mergeModule8Fallback(saved) })
  }
}))
