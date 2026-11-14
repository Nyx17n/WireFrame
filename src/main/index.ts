import { app, globalShortcut, Menu, nativeImage, protocol, session, Tray } from 'electron'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { RateLimitedHttpClient } from './infrastructure/http/RateLimitedHttpClient'
import { registerCodexAndUpdaterHandlers } from './ipc/registerCodexAndUpdaterHandlers'
import { registerIpcHandlers } from './ipc/registerIpcHandlers'
import { registerMarketHandlers } from './ipc/registerMarketHandlers'
import { registerOverlayHandlers } from './ipc/registerOverlayHandlers'
import { registerToolsAndAlertsHandlers } from './ipc/registerToolsAndAlertsHandlers'
import { registerWorldstateHandlers } from './ipc/registerWorldstateHandlers'
import { AlertSchedulerService } from './services/AlertSchedulerService'
import { CacheService } from './services/CacheService'
import { CartBundlerService } from './services/CartBundlerService'
import { CodexRepository } from './services/CodexRepository'
import { FarmOverlayWindowService } from './services/FarmOverlayWindowService'
import { MarketApiService } from './services/MarketApiService'
import { SetCalculatorService } from './services/SetCalculatorService'
import { StorageService } from './services/StorageService'
import { TradingToolsService } from './services/TradingToolsService'
import { UpdaterService } from './services/UpdaterService'
import { WindowOverlayService } from './services/WindowOverlayService'
import { WorldstateService } from './services/WorldstateService'

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
  if (app.isPackaged) {
    return join(process.resourcesPath, 'icon.ico')
  }
  const fromOutDir = join(__dirname, '../../resources/icon.ico')
  if (existsSync(fromOutDir)) {
    return fromOutDir
  }
  return join(app.getAppPath(), 'resources', 'icon.ico')
}

async function bootstrap(): Promise<void> {
  await app.whenReady()

  const httpClient = new RateLimitedHttpClient(3)
  const cacheService = new CacheService(app.getPath('sessionData'), httpClient)
  const storageService = new StorageService(app.getPath('userData'))
  await storageService.load()

  const windowService = new WindowOverlayService(storageService)
  const farmOverlayService = new FarmOverlayWindowService(storageService, windowService)
  const marketApi = new MarketApiService(httpClient, cacheService, storageService)
  const setCalculator = new SetCalculatorService(marketApi)
  const cartBundler = new CartBundlerService(marketApi, storageService)
  const tradingTools = new TradingToolsService(httpClient, cacheService, storageService, marketApi)
  const worldstateService = new WorldstateService(
    httpClient,
    cacheService,
    marketApi,
    app.getPath('userData')
  )
  const codexRepository = new CodexRepository(marketApi)
  const updaterService = new UpdaterService(windowService)
  const alertScheduler = new AlertSchedulerService(
    marketApi,
    storageService,
    windowService,
    worldstateService
  )

  // Serve cached Warframe Market, Official Wiki & Warframe static assets safely via wf-asset://<host>/<subpath>
  protocol.handle('wf-asset', async (request) => {
    try {
      const parsed = new URL(request.url)
      const assetPath = parsed.pathname.replace(/^\/+/, '')
      const resolved = await cacheService.resolveAssetByHost(parsed.hostname, assetPath)
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

    const { toggleOverlay, toggleCompact, toggleAlwaysOnTop, toggleClickThrough } =
      settings.window.shortcuts
    try {
      globalShortcut.register(toggleOverlay, () => windowService.toggleVisibility())
      globalShortcut.register(toggleCompact, () => {
        void windowService.getState().then((st) => windowService.setCompactMode(!st.isCompactMode))
      })
      globalShortcut.register(toggleAlwaysOnTop, () => {
        void windowService.getState().then((st) => windowService.setAlwaysOnTop(!st.isAlwaysOnTop))
      })
      globalShortcut.register(toggleClickThrough, () => {
        void windowService.toggleClickThroughShortcut()
      })
      if (settings.extensions.codexFarmOverlay) {
        globalShortcut.register(settings.codexFarmOverlay.shortcutToggle, () => {
          void farmOverlayService.toggleWindowOpenShortcut()
        })
      }
    } catch {
      // Ignore registration failure if shortcut is already held by another OS process
    }
  }

  registerIpcHandlers({
    httpClient,
    cacheService,
    storageService,
    windowService,
    farmOverlayService,
    onShortcutsUpdated: syncGlobalShortcuts,
    onAlertsConfigUpdated: () => alertScheduler.startOrRestart()
  })
  registerOverlayHandlers({
    windowService,
    farmOverlayService,
    onOverlayShortcutChanged: syncGlobalShortcuts
  })
  registerMarketHandlers({
    marketApi,
    setCalculator,
    windowService
  })
  registerToolsAndAlertsHandlers({
    cartBundler,
    tradingTools,
    alertScheduler,
    windowService
  })
  registerWorldstateHandlers({
    windowService,
    worldstateService
  })
  registerCodexAndUpdaterHandlers({
    windowService,
    codexRepository,
    updaterService
  })

  const iconPath = resolveAppIconPath()
  farmOverlayService.setIconPath(iconPath)
  await windowService.createMainWindow(iconPath)
  await farmOverlayService.syncWithSettings()
  await syncGlobalShortcuts()
  await alertScheduler.startOrRestart()
  updaterService.startPeriodicChecks()

  // System Tray setup for background Price Sniper & Overlay control
  const trayIcon = nativeImage.createFromPath(iconPath)
  if (!trayIcon.isEmpty()) {
    systemTray = new Tray(trayIcon)
    systemTray.setToolTip('WireFrame v2 — Warframe Companion')
    systemTray.on('click', () => windowService.toggleVisibility())
    systemTray.setContextMenu(
      Menu.buildFromTemplate([
        { label: 'Afficher / Masquer WireFrame', click: () => windowService.toggleVisibility() },
        {
          label: 'Basculer Mode Compact (460×660)',
          click: () => {
            void windowService
              .getState()
              .then((st) => windowService.setCompactMode(!st.isCompactMode))
          }
        },
        {
          label: 'Afficher / Masquer Overlay Farm Codex',
          click: () => {
            void farmOverlayService.toggleWindowOpenShortcut()
          }
        },
        { type: 'separator' },
        {
          label: 'Quitter complètement WireFrame',
          click: () => {
            windowService.markQuitting()
            farmOverlayService.markQuitting()
            app.quit()
          }
        }
      ])
    )
  }

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
    farmOverlayService.markQuitting()
    alertScheduler.stop()
    updaterService.stop()
    globalShortcut.unregisterAll()
  })
}

if (gotSingleInstanceLock) {
  bootstrap().catch((err) => {
    console.error('[WireFrame Main] Erreur fatale au démarrage :', err)
    app.quit()
  })
}

