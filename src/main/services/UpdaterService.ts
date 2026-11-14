import { app } from 'electron'
import { autoUpdater } from 'electron-updater'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import type { UpdaterStatus } from '@shared/schemas/updater.schema'
import type { WindowOverlayService } from './WindowOverlayService'

const AUTO_CHECK_INTERVAL_MS = 30 * 60_000

export class UpdaterService {
  private status: UpdaterStatus
  private intervalHandle: NodeJS.Timeout | null = null

  public constructor(private readonly windowService: WindowOverlayService) {
    this.status = {
      state: app.isPackaged ? 'idle' : 'dev-mode',
      currentVersion: app.getVersion(),
      availableVersion: null,
      progressPercent: null,
      message: app.isPackaged
        ? 'Prêt à vérifier les mises à jour signées SHA-512.'
        : 'Mode développement actif — auto-update SHA-512 actif dans l’installateur packagé (NSIS).',
      checkedAt: null,
      isPackaged: app.isPackaged
    }

    if (app.isPackaged) {
      this.configureAutoUpdater()
    }
  }

  private configureAutoUpdater(): void {
    autoUpdater.autoDownload = true
    autoUpdater.autoInstallOnAppQuit = true

    autoUpdater.on('checking-for-update', () => {
      this.updateStatus({
        state: 'checking',
        message: 'Recherche d’une nouvelle version sur le dépôt officiel…',
        checkedAt: new Date().toISOString()
      })
    })

    autoUpdater.on('update-available', (info) => {
      this.updateStatus({
        state: 'available',
        availableVersion: info.version,
        progressPercent: 0,
        message: `Version v${info.version} détectée — téléchargement et vérification SHA-512 en cours…`,
        checkedAt: new Date().toISOString()
      })
    })

    autoUpdater.on('update-not-available', () => {
      this.updateStatus({
        state: 'up-to-date',
        availableVersion: null,
        progressPercent: null,
        message: `TennoFrame v${app.getVersion()} est à jour.`,
        checkedAt: new Date().toISOString()
      })
    })

    autoUpdater.on('download-progress', (progress) => {
      this.updateStatus({
        state: 'downloading',
        progressPercent: Math.round(progress.percent),
        message: `Téléchargement de la mise à jour : ${Math.round(progress.percent)}%`
      })
    })

    autoUpdater.on('update-downloaded', (info) => {
      this.updateStatus({
        state: 'downloaded',
        availableVersion: info.version,
        progressPercent: 100,
        message: `Mise à jour v${info.version} vérifiée (SHA-512) et prête à installer.`
      })
    })

    autoUpdater.on('error', (err) => {
      this.updateStatus({
        state: 'error',
        progressPercent: null,
        message: `Vérification indisponible : ${err.message.slice(0, 180)}`,
        checkedAt: new Date().toISOString()
      })
    })
  }

  private updateStatus(patch: Partial<UpdaterStatus>): void {
    this.status = { ...this.status, ...patch }
    const win = this.windowService.getMainWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.UPDATER_ON_STATUS, this.status)
    }
  }

  public startPeriodicChecks(): void {
    if (!app.isPackaged) return
    setTimeout(() => {
      void this.checkForUpdates()
    }, 8_000)

    this.intervalHandle = setInterval(() => {
      void this.checkForUpdates()
    }, AUTO_CHECK_INTERVAL_MS)
  }

  public stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle)
      this.intervalHandle = null
    }
  }

  public getStatus(): UpdaterStatus {
    return this.status
  }

  public async checkForUpdates(): Promise<UpdaterStatus> {
    if (!app.isPackaged) {
      this.updateStatus({
        state: 'dev-mode',
        checkedAt: new Date().toISOString(),
        message:
          'Mode développement actif — la vérification distante SHA-512 s’exécute sur l’application installée.'
      })
      return this.status
    }

    try {
      await autoUpdater.checkForUpdates()
    } catch (err) {
      this.updateStatus({
        state: 'error',
        message: err instanceof Error ? err.message.slice(0, 180) : 'Erreur réseau auto-updater',
        checkedAt: new Date().toISOString()
      })
    }
    return this.status
  }

  public async downloadAndInstall(): Promise<UpdaterStatus> {
    if (!app.isPackaged) return this.status
    if (this.status.state === 'downloaded') {
      this.windowService.markQuitting()
      autoUpdater.quitAndInstall(false, true)
      return this.status
    }
    if (this.status.state === 'available') {
      await autoUpdater.downloadUpdate()
    }
    return this.status
  }
}

