import { BrowserWindow } from 'electron'
import { join } from 'node:path'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import type {
  CodexFarmOverlayPatch,
  FarmOverlayLiveState
} from '@shared/schemas/extensions.schema'
import { openAllowedExternalHttpsUrl } from '../ipc/security'
import type { StorageService } from './StorageService'
import type { WindowOverlayService } from './WindowOverlayService'

/**
 * Manages the hardened, passive, ToS-compliant secondary Electron BrowserWindow
 * for the `Codex Farm Overlay` extension (`?view=codex-farm-overlay`).
 * When the extension is disabled in Settings -> Extensions, the window is destroyed (0 MB RAM).
 */
export class FarmOverlayWindowService {
  private overlayWindow: BrowserWindow | null = null
  private isClickThrough = false
  private boundsSaveTimer: NodeJS.Timeout | null = null
  private iconPath = ''
  private isQuitting = false

  public constructor(
    private readonly storageService: StorageService,
    private readonly mainWindowService: WindowOverlayService
  ) {}

  public setIconPath(iconPath: string): void {
    this.iconPath = iconPath
  }

  public markQuitting(): void {
    this.isQuitting = true
    if (this.boundsSaveTimer) {
      clearTimeout(this.boundsSaveTimer)
      this.boundsSaveTimer = null
    }
    this.destroyOverlayWindow()
  }

  public getOverlayWindow(): BrowserWindow | null {
    return this.overlayWindow && !this.overlayWindow.isDestroyed() ? this.overlayWindow : null
  }

  public async getLiveState(): Promise<FarmOverlayLiveState> {
    const settings = await this.storageService.getSettings()
    const extOn = settings.extensions.codexFarmOverlay
    const cfg = settings.codexFarmOverlay
    const win = this.getOverlayWindow()
    const windowOpen = extOn && Boolean(win ? win.isVisible() : cfg.windowOpen)

    return {
      extensionEnabled: extOn,
      windowOpen,
      isClickThrough: windowOpen ? this.isClickThrough : cfg.clickThrough,
      size: cfg.size,
      opacityPercent: cfg.opacityPercent,
      shortcutToggle: cfg.shortcutToggle,
      showObtained: cfg.showObtained,
      pinnedEntries: cfg.pinnedEntries
    }
  }

  public async syncWithSettings(): Promise<FarmOverlayLiveState> {
    const settings = await this.storageService.getSettings()
    if (!settings.extensions.codexFarmOverlay) {
      this.destroyOverlayWindow()
      const state = await this.getLiveState()
      this.broadcastState(state)
      return state
    }

    if (settings.codexFarmOverlay.windowOpen) {
      await this.ensureWindowShown()
    } else {
      const win = this.getOverlayWindow()
      if (win && win.isVisible()) {
        win.hide()
      }
    }

    const state = await this.getLiveState()
    this.broadcastState(state)
    return state
  }

  public async setWindowOpen(open: boolean): Promise<FarmOverlayLiveState> {
    const settings = await this.storageService.getSettings()
    if (!settings.extensions.codexFarmOverlay) {
      this.destroyOverlayWindow()
      const state = await this.getLiveState()
      this.broadcastState(state)
      return state
    }

    await this.storageService.updateSettings({
      codexFarmOverlay: { windowOpen: open }
    })

    if (open) {
      await this.ensureWindowShown()
    } else {
      const win = this.getOverlayWindow()
      if (win && win.isVisible()) {
        win.hide()
      }
    }

    const state = await this.getLiveState()
    this.broadcastState(state)
    return state
  }

  public async toggleWindowOpenShortcut(): Promise<FarmOverlayLiveState> {
    const current = await this.getLiveState()
    if (!current.extensionEnabled) return current
    return this.setWindowOpen(!current.windowOpen)
  }

  public async setClickThrough(enabled: boolean): Promise<FarmOverlayLiveState> {
    await this.storageService.updateSettings({
      codexFarmOverlay: { clickThrough: enabled }
    })
    this.applyClickThroughInternal(enabled)
    const state = await this.getLiveState()
    this.broadcastState(state)
    return state
  }

  public async updateOverlayState(patch: CodexFarmOverlayPatch): Promise<FarmOverlayLiveState> {
    if (patch.bounds !== undefined) {
      const win = this.getOverlayWindow()
      if (win) {
        const cur = win.getBounds()
        win.setBounds({
          x: patch.bounds.x ?? cur.x,
          y: patch.bounds.y ?? cur.y,
          width: Math.max(280, Math.round(patch.bounds.width)),
          height: Math.max(200, Math.round(patch.bounds.height))
        })
      }
    }

    await this.storageService.updateSettings({
      codexFarmOverlay: patch
    })

    if (patch.clickThrough !== undefined) {
      this.applyClickThroughInternal(patch.clickThrough)
    }
    if (patch.windowOpen !== undefined) {
      return this.setWindowOpen(patch.windowOpen)
    }

    const state = await this.getLiveState()
    this.broadcastState(state)
    return state
  }

  private async ensureWindowShown(): Promise<BrowserWindow> {
    const existing = this.getOverlayWindow()
    const settings = await this.storageService.getSettings()
    const cfg = settings.codexFarmOverlay

    if (existing) {
      existing.setAlwaysOnTop(true, 'screen-saver')
      if (!existing.isVisible()) {
        existing.showInactive()
      }
      this.applyClickThroughInternal(cfg.clickThrough && !existing.isFocused())
      return existing
    }

    const win = new BrowserWindow({
      title: '',
      width: cfg.bounds.width,
      height: cfg.bounds.height,
      ...(cfg.bounds.x !== undefined && cfg.bounds.y !== undefined
        ? { x: cfg.bounds.x, y: cfg.bounds.y }
        : {}),
      minWidth: 280,
      minHeight: 200,
      frame: false,
      transparent: true,
      thickFrame: false,
      hasShadow: false,
      resizable: false,
      autoHideMenuBar: true,
      maximizable: false,
      minimizable: false,
      skipTaskbar: true,
      show: false,
      ...(this.iconPath ? { icon: this.iconPath } : {}),
      backgroundColor: '#00000000',
      webPreferences: {
        preload: join(__dirname, '../preload/index.cjs'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        spellcheck: false
      }
    })

    win.on('page-title-updated', (event) => {
      event.preventDefault()
    })

    this.overlayWindow = win
    win.setAlwaysOnTop(true, 'screen-saver')
    this.hardenNavigation(win)
    this.attachOverlayListeners(win)

    const devUrl = process.env['ELECTRON_RENDERER_URL']
    if (devUrl) {
      const separator = devUrl.includes('?') ? '&' : '?'
      await win.loadURL(`${devUrl}${separator}view=codex-farm-overlay`)
    } else {
      await win.loadFile(join(__dirname, '../renderer/index.html'), {
        query: { view: 'codex-farm-overlay' }
      })
    }

    if (!win.isDestroyed()) {
      win.setAlwaysOnTop(true, 'screen-saver')
      win.showInactive()
      this.applyClickThroughInternal(cfg.clickThrough)
    }

    return win
  }

  private applyClickThroughInternal(enabled: boolean): void {
    const win = this.getOverlayWindow()
    if (!win) {
      this.isClickThrough = false
      return
    }
    if (enabled) {
      win.setIgnoreMouseEvents(true, { forward: true })
      this.isClickThrough = true
    } else {
      win.setIgnoreMouseEvents(false)
      this.isClickThrough = false
    }
  }

  private hardenNavigation(win: BrowserWindow): void {
    win.webContents.setWindowOpenHandler(({ url }) => {
      void openAllowedExternalHttpsUrl(url)
      return { action: 'deny' }
    })

    win.webContents.on('will-navigate', (event, targetUrl) => {
      const devUrl = process.env['ELECTRON_RENDERER_URL']
      if (devUrl && targetUrl.startsWith(devUrl)) {
        return
      }
      event.preventDefault()
    })
  }

  private attachOverlayListeners(win: BrowserWindow): void {
    const scheduleBoundsSave = (): void => {
      if (this.boundsSaveTimer) clearTimeout(this.boundsSaveTimer)
      this.boundsSaveTimer = setTimeout(() => {
        const active = this.getOverlayWindow()
        if (!active) return
        const b = active.getBounds()
        void this.storageService.updateSettings({
          codexFarmOverlay: { bounds: b }
        })
      }, 350)
    }

    win.on('moved', scheduleBoundsSave)
    win.on('resized', scheduleBoundsSave)

    win.on('blur', () => {
      const cfg = this.storageService.getSettingsSync().codexFarmOverlay
      if (cfg.clickThrough && !this.isClickThrough) {
        this.applyClickThroughInternal(true)
        void this.getLiveState().then((st) => this.broadcastState(st))
      }
    })

    win.on('close', (event) => {
      if (!this.isQuitting) {
        event.preventDefault()
        win.hide()
        void this.storageService
          .updateSettings({ codexFarmOverlay: { windowOpen: false } })
          .then(() => this.getLiveState())
          .then((st) => this.broadcastState(st))
      }
    })

    win.on('closed', () => {
      this.overlayWindow = null
      this.isClickThrough = false
    })
  }

  private destroyOverlayWindow(): void {
    const win = this.overlayWindow
    this.overlayWindow = null
    this.isClickThrough = false
    if (win && !win.isDestroyed()) {
      win.removeAllListeners('close')
      win.destroy()
    }
  }

  public broadcastState(state: FarmOverlayLiveState): void {
    const mainWin = this.mainWindowService.getMainWindow()
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.webContents.send(IPC_CHANNELS.OVERLAY_ON_STATE_CHANGED, state)
    }
    const overWin = this.getOverlayWindow()
    if (overWin) {
      overWin.webContents.send(IPC_CHANNELS.OVERLAY_ON_STATE_CHANGED, state)
    }
  }
}

