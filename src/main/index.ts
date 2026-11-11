import { app, globalShortcut, Menu, nativeImage, protocol, session, Tray } from 'electron'
import { join } from 'node:path'
import { RateLimitedHttpClient } from './infrastructure/http/RateLimitedHttpClient'
import { registerIpcHandlers } from './ipc/registerIpcHandlers'
import { CacheService } from './services/CacheService'
import { StorageService } from './services/StorageService'
import { WindowOverlayService } from './services/WindowOverlayService'

// Register `wf-asset://` as a read-only privileged image scheme before app ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'wf-asset',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: false,
      corsEnabled: false
    }
  }
])

const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) {
  app.quit()
}

let systemTray: Tray | null = null

function resolveAppIconPath(): string {
  return app.isPackaged
    ? join(process.resourcesPath, 'icon.ico')
    : join(app.getAppPath(), 'resources', 'icon.ico')
}

async function bootstrap(): Promise<void> {
  await app.whenReady()

  const httpClient = new RateLimitedHttpClient(3)
  const cacheService = new CacheService(app.getPath('sessionData'), httpClient)
  const storageService = new StorageService(app.getPath('userData'))
  await storageService.load()

  const windowService = new WindowOverlayService(storageService)

  // Serve cached Warframe Market static icons safely via wf-asset://icons/<subpath>
  protocol.handle('wf-asset', async (request) => {
    try {
      const parsed = new URL(request.url)
      const assetPath = parsed.pathname.replace(/^\/+/, '')
      const resolved = await cacheService.resolveWfmAsset(assetPath)
      return new Response(resolved.bytes, {
        status: 200,
        headers: {
          'Content-Type': resolved.contentType,
          'Cache-Control': 'public, max-age=604800, immutable'
        }
      })
    } catch {
      return new Response(null, { status: 404 })
    }
  })

  // Enforce strict Content-Security-Policy in production builds
  if (app.isPackaged) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' wf-asset: data:; media-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
          ]
        }
      })
    })
  }

  const syncGlobalShortcuts = async (): Promise<void> => {
    globalShortcut.unregisterAll()
    const settings = await storageService.getSettings()
    if (!settings.window.globalShortcutsEnabled) return

    const { toggleOverlay, toggleCompact, toggleAlwaysOnTop } = settings.window.shortcuts
    try {
      globalShortcut.register(toggleOverlay, () => windowService.toggleVisibility())
      globalShortcut.register(toggleCompact, () => {
        void windowService.getState().then((st) => windowService.setCompactMode(!st.isCompactMode))
      })
      globalShortcut.register(toggleAlwaysOnTop, () => {
        void windowService.getState().then((st) => windowService.setAlwaysOnTop(!st.isAlwaysOnTop))
      })
    } catch {
      // Ignore registration failure if shortcut is already held by another OS process
    }
  }

  registerIpcHandlers({
    httpClient,
    cacheService,
    storageService,
    windowService,
    onShortcutsUpdated: syncGlobalShortcuts
  })

  const iconPath = resolveAppIconPath()
  await windowService.createMainWindow(iconPath)
  await syncGlobalShortcuts()

  // System Tray setup for background Price Sniper & Overlay control
  const trayIcon = nativeImage.createFromPath(iconPath)
  systemTray = new Tray(trayIcon)
  systemTray.setToolTip('WireFrame v2 — Warframe Companion')
  systemTray.on('click', () => windowService.toggleVisibility())
  systemTray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Afficher / Masquer WireFrame', click: () => windowService.toggleVisibility() },
      {
        label: 'Basculer Mode Compact (460×660)',
        click: () => {
          void windowService.getState().then((st) => windowService.setCompactMode(!st.isCompactMode))
        }
      },
      { type: 'separator' },
      {
        label: 'Quitter complètement WireFrame',
        click: () => {
          windowService.markQuitting()
          app.quit()
        }
      }
    ])
  )

  app.on('second-instance', () => {
    const win = windowService.getMainWindow()
    if (win) {
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
    }
  })

  app.on('before-quit', () => {
    windowService.markQuitting()
    globalShortcut.unregisterAll()
  })
}

void bootstrap()

