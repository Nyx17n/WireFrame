import { Notification } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import type { PriceSniperRule, TriggeredAlertEvent } from '@shared/schemas/alerts.schema'
import type { MarketApiService } from './MarketApiService'
import type { StorageService } from './StorageService'
import type { WindowOverlayService } from './WindowOverlayService'

/**
 * Orchestrateur d'arrière-plan (Main Process) du Price Sniper & des Notifications OS.
 * Continue de fonctionner silencieusement lorsque WireFrame est réduit dans le System Tray.
 */
export class AlertSchedulerService {
  private timer: NodeJS.Timeout | null = null
  private scanning = false
  private readonly notifiedOrderIds = new Set<string>()

  constructor(
    private readonly marketApi: MarketApiService,
    private readonly storage: StorageService,
    private readonly windowService: WindowOverlayService
  ) {}

  public async startOrRestart(): Promise<void> {
    this.stop()
    const settings = await this.storage.getSettings()
    const intervalMs = Math.max(15, settings.audio.scanIntervalSec) * 1000
    this.timer = setInterval(() => {
      void this.scanNow()
    }, intervalMs)
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  public async scanNow(): Promise<TriggeredAlertEvent[]> {
    if (this.scanning) return []
    this.scanning = true

    const triggered: TriggeredAlertEvent[] = []
    try {
      const settings = await this.storage.getSettings()
      const activeRules = settings.priceAlerts.filter((r) => r.enabled)
      if (activeRules.length === 0) return []

      let rulesMutated = false
      const updatedRules: PriceSniperRule[] = [...settings.priceAlerts]

      for (const rule of activeRules) {
        try {
          const orders = await this.marketApi.getItemOrders(rule.slug, true)
          const matchingSells = orders
            .filter((o) => {
              if (o.type !== 'sell') return false
              if (o.user?.status !== 'ingame') return false
              if (o.platinum > rule.maxPlatinum) return false
              if (rule.desiredRank !== undefined && o.rank !== rule.desiredRank) return false
              return true
            })
            .sort((a, b) => a.platinum - b.platinum)

          const best = matchingSells[0]
          if (!best || !best.user) continue

          const dedupeKey = `${rule.id}:${best.id}:${best.platinum}`
          if (!settings.audio.repeatAlerts && this.notifiedOrderIds.has(dedupeKey)) {
            continue
          }
          this.notifiedOrderIds.add(dedupeKey)

          const nowIso = new Date().toISOString()
          const idx = updatedRules.findIndex((r) => r.id === rule.id)
          if (idx !== -1 && updatedRules[idx]) {
            updatedRules[idx] = {
              ...updatedRules[idx],
              lastTriggeredPrice: best.platinum,
              lastTriggeredSeller: best.user.ingameName,
              lastTriggeredAt: nowIso
            }
            rulesMutated = true
          }

          const displayName = settings.market.language === 'fr' ? rule.nameFr : rule.nameEn
          const eventPayload: TriggeredAlertEvent = {
            id: `${rule.id}-${Date.now()}`,
            kind: 'price-sniper',
            title: `Price Sniper : ${displayName} à ${best.platinum} p !`,
            subtitle: `Seuil <= ${rule.maxPlatinum} p · Vendeur En jeu : ${best.user.ingameName}`,
            slug: rule.slug,
            sellerName: best.user.ingameName,
            platinum: best.platinum,
            itemNameEn: rule.nameEn,
            itemNameFr: rule.nameFr,
            ...(best.rank !== undefined ? { rank: best.rank } : {}),
            triggeredAt: nowIso
          }

          triggered.push(eventPayload)
          this.emitAlertEvent(eventPayload, settings.audio.nativeOsNotifications)
        } catch {
          // Continue scanning remaining rules if one item fails temporarily
        }
      }

      if (rulesMutated) {
        await this.storage.updateSettings({ priceAlerts: updatedRules })
      }
    } finally {
      this.scanning = false
    }

    return triggered
  }

  public emitAlertEvent(eventPayload: TriggeredAlertEvent, sendOsNotification: boolean): void {
    const win = this.windowService.getMainWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.ALERTS_ON_TRIGGERED, eventPayload)
    }

    if (sendOsNotification && Notification.isSupported()) {
      const osNotif = new Notification({
        title: eventPayload.title,
        body: eventPayload.subtitle,
        silent: true
      })
      osNotif.on('click', () => {
        const targetWin = this.windowService.getMainWindow()
        if (targetWin && !targetWin.isDestroyed()) {
          if (targetWin.isMinimized()) targetWin.restore()
          targetWin.show()
          targetWin.focus()
        }
      })
      osNotif.show()
    }
  }
}

