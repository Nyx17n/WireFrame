import { BrowserWindow } from 'electron'
import { join } from 'node:path'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import type { WindowState } from '@shared/schemas/window.schema'
import { openAllowedExternalHttpsUrl } from '../ipc/security'
import type { StorageService } from './StorageService'

/**
 * Manages the hardened Electron BrowserWindow, Frameless custom chrome,
 * Always-on-Top ('screen-saver' level for borderless Warframe), and Compact Mode (460x660).
 */
export class WindowOverlayService {
  private mainWindow: BrowserWindow | null = null
  private isCompactMode = false
  private isQuitting = false

  constructor(private readonly storageService: StorageService) {}

  public markQuitting(): void {
    this.isQuitting = true
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  public async createMainWindow(iconPath: string): Promise<BrowserWindow> {
    const settings = await this.storageService.getSettings()
    const { desktopBounds, alwaysOnTop } = settings.window

    const win = new BrowserWindow({
      width: desktopBounds.width,
      height: desktopBounds.height,
      x: desktopBounds.x,
      y: desktopBounds.y,
      minWidth: 1024,
      minHeight: 680,
      frame: false,
      show: false,
      icon: iconPath,
      backgroundColor: '#0f161d',
      webPreferences: {
        preload: join(__dirname, '../preload/index.cjs'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        spellcheck: false
      }
    })

    this.mainWindow = win
    this.applyAlwaysOnTopInternal(alwaysOnTop)
    win.webContents.setZoomFactor(settings.appearance.zoomPercent / 100)

    this.hardenNavigation(win)
    this.attachWindowListeners(win)

    win.once('ready-to-show', () => {
      win.show()
      this.emitStateChanged()
    })

    if (process.env['ELECTRON_RENDERER_URL']) {
      await win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      await win.loadFile(join(__dirname, '../renderer/index.html'))
    }

    return win
  }

  public async getState(): Promise<WindowState> {
    const settings = await this.storageService.getSettings()
    return {
      isMaximized: this.mainWindow?.isMaximized() ?? false,
      isAlwaysOnTop: this.mainWindow?.isAlwaysOnTop() ?? settings.window.alwaysOnTop,
      isCompactMode: this.isCompactMode,
      zoomPercent: settings.appearance.zoomPercent
    }
  }

  public minimize(): void {
    this.mainWindow?.minimize()
  }

  public async toggleMaximize(): Promise<WindowState> {
    if (this.mainWindow && !this.isCompactMode) {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.unmaximize()
      } else {
        this.mainWindow.maximize()
      }
    }
    const state = await this.getState()
    this.emitStateChanged()
    return state
  }

  public async requestClose(): Promise<void> {
    if (!this.mainWindow) return
    const settings = await this.storageService.getSettings()
    if (settings.window.closeToTray && !this.isQuitting) {
      this.mainWindow.hide()
    } else {
      this.mainWindow.close()
    }
  }

  public toggleVisibility(): void {
    if (!this.mainWindow) return
    if (this.mainWindow.isVisible() && this.mainWindow.isFocused()) {
      this.mainWindow.hide()
    } else {
      if (this.mainWindow.isMinimized()) this.mainWindow.restore()
      this.mainWindow.show()
      this.mainWindow.focus()
    }
  }

  public async setAlwaysOnTop(enabled: boolean): Promise<WindowState> {
    this.applyAlwaysOnTopInternal(enabled)
    await this.storageService.updateSettings({ window: { alwaysOnTop: enabled } })
    const state = await this.getState()
    this.emitStateChanged()
    return state
  }

  public async setCompactMode(enabled: boolean): Promise<WindowState> {
    if (!this.mainWindow || this.isCompactMode === enabled) {
      return this.getState()
    }

    const settings = await this.storageService.getSettings()
    if (this.mainWindow.isMaximized()) {
      this.mainWindow.unmaximize()
    }

    if (enabled) {
      await this.saveCurrentBounds('desktop')
      this.isCompactMode = true
      this.mainWindow.setMinimumSize(380, 520)
      const cb = settings.window.compactBounds
      this.mainWindow.setBounds({
        width: cb.width,
        height: cb.height,
        ...(cb.x !== undefined && cb.y !== undefined ? { x: cb.x, y: cb.y } : {})
      })
      this.applyAlwaysOnTopInternal(true)
    } else {
      await this.saveCurrentBounds('compact')
      this.isCompactMode = false
      this.mainWindow.setMinimumSize(1024, 680)
      const db = settings.window.desktopBounds
      this.mainWindow.setBounds({
        width: db.width,
        height: db.height,
        ...(db.x !== undefined && db.y !== undefined ? { x: db.x, y: db.y } : {})
      })
      this.applyAlwaysOnTopInternal(settings.window.alwaysOnTop)
    }

    const state = await this.getState()
    this.emitStateChanged()
    return state
  }

  public async setZoom(zoomPercent: number): Promise<WindowState> {
    const clamped = Math.min(200, Math.max(50, Math.round(zoomPercent / 10) * 10))
    this.mainWindow?.webContents.setZoomFactor(clamped / 100)
    await this.storageService.updateSettings({ appearance: { zoomPercent: clamped } })
    const state = await this.getState()
    this.emitStateChanged()
    return state
  }

  public async openExternalSafe(rawUrl: string): Promise<boolean> {
    return openAllowedExternalHttpsUrl(rawUrl)
  }

  private applyAlwaysOnTopInternal(enabled: boolean): void {
    if (!this.mainWindow) return
    if (enabled) {
      this.mainWindow.setAlwaysOnTop(true, 'screen-saver')
    } else {
      this.mainWindow.setAlwaysOnTop(false)
    }
  }

  private hardenNavigation(win: BrowserWindow): void {
    win.webContents.setWindowOpenHandler(({ url }) => {
      void this.openExternalSafe(url)
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

  private attachWindowListeners(win: BrowserWindow): void {
    win.on('maximize', () => this.emitStateChanged())
    win.on('unmaximize', () => this.emitStateChanged())
    win.on('close', (event) => {
      const settings = this.storageService.getSettingsSync()
      if (settings.window.closeToTray && !this.isQuitting) {
        event.preventDefault()
        win.hide()
      }
    })
  }

  private async saveCurrentBounds(mode: 'desktop' | 'compact'): Promise<void> {
    if (!this.mainWindow || this.mainWindow.isMaximized() || this.mainWindow.isMinimized()) return
    const b = this.mainWindow.getBounds()
    if (mode === 'desktop') {
      await this.storageService.updateSettings({ window: { desktopBounds: b } })
    } else {
      await this.storageService.updateSettings({ window: { compactBounds: b } })
    }
  }

  private emitStateChanged(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return
    void this.getState().then((state) => {
      this.mainWindow?.webContents.send(IPC_CHANNELS.WINDOW_ON_STATE_CHANGED, state)
    })
  }
}
