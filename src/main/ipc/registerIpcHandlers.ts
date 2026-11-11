import { app, clipboard, dialog, ipcMain } from 'electron'
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
  onAlertsConfigUpdated?: () => Promise<void>
}

export function registerIpcHandlers(services: MainServicesContainer): void {
  const {
    httpClient,
    cacheService,
    storageService,
    windowService,
    onShortcutsUpdated,
    onAlertsConfigUpdated
  } = services

  const buildSystemStatus = () => ({
    appVersion: app.getVersion(),
    apiConnected: httpClient.isHealthy(),
    rateLimiterInWindow: httpClient.getActiveCountInWindow(),
    rateLimiterMaxPerSec: httpClient.getMaxPerSecond(),
    memoryCacheEntries: cacheService.getMemorySize(),
    userDataPath: app.getPath('userData')
  })

  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_STATUS, (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return buildSystemStatus()
  })

  ipcMain.handle(IPC_CHANNELS.SYSTEM_CLEAR_CACHE, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    await cacheService.clearAll()
    return buildSystemStatus()
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
    if (patch.audio?.scanIntervalSec !== undefined || patch.priceAlerts !== undefined) {
      await onAlertsConfigUpdated?.()
    }
    return updated
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_RESET, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const reset = await storageService.resetSettings()
    await onShortcutsUpdated()
    return reset
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_EXPORT_JSON, async (event) => {
    const win = windowService.getMainWindow()
    assertTrustedSender(event, win)
    if (!win) return false
    const result = await dialog.showSaveDialog(win, {
      title: 'Exporter la configuration WireFrame v2',
      defaultPath: 'wireframe-config.json',
      filters: [{ name: 'Fichier JSON', extensions: ['json'] }]
    })
    if (result.canceled || !result.filePath) return false
    await storageService.exportToPath(result.filePath)
    return true
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_IMPORT_JSON, async (event) => {
    const win = windowService.getMainWindow()
    assertTrustedSender(event, win)
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      title: 'Importer une configuration WireFrame v2',
      properties: ['openFile'],
      filters: [{ name: 'Fichier JSON', extensions: ['json'] }]
    })
    const firstFile = result.filePaths[0]
    if (result.canceled || !firstFile) return null
    const imported = await storageService.importFromPath(firstFile)
    await onShortcutsUpdated()
    return imported
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

