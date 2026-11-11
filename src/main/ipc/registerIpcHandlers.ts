import { app, clipboard, ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import { UserSettingsPatchSchema } from '@shared/schemas/settings.schema'
import {
  BooleanTogglePayloadSchema,
  ExternalUrlPayloadSchema,
  ZoomPayloadSchema
} from '@shared/schemas/window.schema'
import type { RateLimitedHttpClient } from '../infrastructure/http/RateLimitedHttpClient'
import type { CacheService } from '../services/CacheService'
import type { StorageService } from '../services/StorageService'
import type { WindowOverlayService } from '../services/WindowOverlayService'
import { assertTrustedSender } from './security'

const ClipboardTextSchema = z.object({
  text: z.string().min(1).max(1024)
})

export interface MainServicesContainer {
  httpClient: RateLimitedHttpClient
  cacheService: CacheService
  storageService: StorageService
  windowService: WindowOverlayService
  onShortcutsUpdated: () => Promise<void>
}

export function registerIpcHandlers(services: MainServicesContainer): void {
  const { httpClient, cacheService, storageService, windowService, onShortcutsUpdated } = services

  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_STATUS, (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return {
      appVersion: app.getVersion(),
      apiConnected: httpClient.isHealthy(),
      rateLimiterInWindow: httpClient.getActiveCountInWindow(),
      rateLimiterMaxPerSec: httpClient.getMaxPerSecond(),
      memoryCacheEntries: cacheService.getMemorySize(),
      userDataPath: app.getPath('userData')
    }
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return storageService.getSettings()
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_UPDATE, async (event, rawPatch: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const patch = UserSettingsPatchSchema.parse(rawPatch)
    const updated = await storageService.updateSettings(patch)
    if (patch.window?.globalShortcutsEnabled !== undefined || patch.window?.shortcuts !== undefined) {
      await onShortcutsUpdated()
    }
    return updated
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_RESET, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const reset = await storageService.resetSettings()
    await onShortcutsUpdated()
    return reset
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_GET_STATE, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return windowService.getState()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    windowService.minimize()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_TOGGLE_MAXIMIZE, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return windowService.toggleMaximize()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    await windowService.requestClose()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_SET_ALWAYS_ON_TOP, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { enabled } = BooleanTogglePayloadSchema.parse(rawPayload)
    return windowService.setAlwaysOnTop(enabled)
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_SET_COMPACT_MODE, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { enabled } = BooleanTogglePayloadSchema.parse(rawPayload)
    return windowService.setCompactMode(enabled)
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_SET_ZOOM, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { zoomPercent } = ZoomPayloadSchema.parse(rawPayload)
    return windowService.setZoom(zoomPercent)
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_OPEN_EXTERNAL, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { url } = ExternalUrlPayloadSchema.parse(rawPayload)
    return windowService.openExternalSafe(url)
  })

  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_WRITE_TEXT, (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { text } = ClipboardTextSchema.parse(rawPayload)
    clipboard.writeText(text)
  })
}

