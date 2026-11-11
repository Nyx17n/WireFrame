import {
  UserSettingsSchema,
  type UserSettings,
  type UserSettingsPatch
} from '@shared/schemas/settings.schema'
import { SystemStatusSchema, type SystemStatus } from '@shared/schemas/system.schema'
import { WindowStateSchema, type WindowState } from '@shared/schemas/window.schema'
import type { WireframeBridgeApi } from '@shared/ipc-channels'

function getBridge(): WireframeBridgeApi {
  if (typeof window === 'undefined' || !window.wireframeApi) {
    throw new Error('Pont IPC preload indisponible (window.wireframeApi manquant).')
  }
  return window.wireframeApi
}

/**
 * Client IPC typé côté Renderer.
 * Valide systématiquement les réponses via les schémas Zod partagés.
 */
export const ipcClient = {
  system: {
    async getStatus(): Promise<SystemStatus> {
      const raw = await getBridge().system.getStatus()
      return SystemStatusSchema.parse(raw)
    },
    async clearCache(): Promise<SystemStatus> {
      const bridge = getBridge()
      if (typeof bridge.system.clearCache !== 'function') {
        throw new Error('Relance npm.cmd run dev pour charger le canal IPC clearCache.')
      }
      const raw = await bridge.system.clearCache()
      return SystemStatusSchema.parse(raw)
    }
  },
  settings: {
    async get(): Promise<UserSettings> {
      const raw = await getBridge().settings.get()
      return UserSettingsSchema.parse(raw)
    },
    async update(patch: UserSettingsPatch): Promise<UserSettings> {
      const raw = await getBridge().settings.update(patch)
      return UserSettingsSchema.parse(raw)
    },
    async reset(): Promise<UserSettings> {
      const raw = await getBridge().settings.reset()
      return UserSettingsSchema.parse(raw)
    },
    async exportJson(): Promise<boolean> {
      const bridge = getBridge()
      if (typeof bridge.settings.exportJson !== 'function') {
        throw new Error('Relance npm.cmd run dev pour charger le canal IPC exportJson.')
      }
      return bridge.settings.exportJson()
    },
    async importJson(): Promise<UserSettings | null> {
      const bridge = getBridge()
      if (typeof bridge.settings.importJson !== 'function') {
        throw new Error('Relance npm.cmd run dev pour charger le canal IPC importJson.')
      }
      const raw = await bridge.settings.importJson()
      if (!raw) return null
      return UserSettingsSchema.parse(raw)
    }
  },
  window: {
    async getState(): Promise<WindowState> {
      const raw = await getBridge().window.getState()
      return WindowStateSchema.parse(raw)
    },
    minimize(): Promise<void> {
      return getBridge().window.minimize()
    },
    async toggleMaximize(): Promise<WindowState> {
      const raw = await getBridge().window.toggleMaximize()
      return WindowStateSchema.parse(raw)
    },
    close(): Promise<void> {
      return getBridge().window.close()
    },
    async setAlwaysOnTop(enabled: boolean): Promise<WindowState> {
      const raw = await getBridge().window.setAlwaysOnTop(enabled)
      return WindowStateSchema.parse(raw)
    },
    async setCompactMode(enabled: boolean): Promise<WindowState> {
      const raw = await getBridge().window.setCompactMode(enabled)
      return WindowStateSchema.parse(raw)
    },
    async setZoom(zoomPercent: number): Promise<WindowState> {
      const raw = await getBridge().window.setZoom(zoomPercent)
      return WindowStateSchema.parse(raw)
    },
    openExternalUrl(url: string): Promise<boolean> {
      return getBridge().window.openExternalUrl(url)
    },
    onStateChanged(listener: (state: WindowState) => void): () => void {
      return getBridge().window.onStateChanged((rawState) => {
        const parsed = WindowStateSchema.safeParse(rawState)
        if (parsed.success) {
          listener(parsed.data)
        }
      })
    }
  },
  clipboard: {
    writeText(text: string): Promise<void> {
      return getBridge().clipboard.writeText(text)
    }
  }
} as const
