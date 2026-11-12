import * as React from 'react'
import { Bell, Crosshair, Globe, History, Radar, Volume2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertHistoryPanel } from '@/components/alerts/AlertHistoryPanel'
import { PriceSniperPanel } from '@/components/alerts/PriceSniperPanel'
import { WorldAlertsGrid } from '@/components/alerts/WorldAlertsGrid'
import { WorldRulesPanel } from '@/components/alerts/rules/WorldRulesPanel'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'

type AlertsTabId = 'sniper' | 'worldstate' | 'history'

export function AlertsCenterView(): React.JSX.Element {
  const priceRulesCount = useAppStore((s) => s.settings.priceAlerts.length)
  const worldRulesCount = useAppStore((s) => s.settings.worldRules.length)
  const scanIntervalSec = useAppStore((s) => s.settings.audio.scanIntervalSec)
  const openSettingsModal = useAppStore((s) => s.openSettingsModal)

  const [tab, setTab] = React.useState<AlertsTabId>('sniper')
  const [scanning, setScanning] = React.useState(false)

  const handleScanNow = async (): Promise<void> => {
    setScanning(true)
    try {
      await ipcClient.alerts.scanNow()
      const freshSettings = await ipcClient.settings.get()
      await useAppStore.getState().updateSettings({ priceAlerts: freshSettings.priceAlerts })
    } finally {
      setScanning(false)
    }
  }

  const tabs: Array<{ id: AlertsTabId; label: string; icon: typeof Bell; count?: number }> = [
    { id: 'sniper', label: 'Price Sniper', icon: Crosshair, count: priceRulesCount },
    { id: 'worldstate', label: 'Worldstate', icon: Globe, count: worldRulesCount },
    { id: 'history', label: 'Historique (session)', icon: History }
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-bold">Centre d’Alertes</h1>
          <Badge variant="secondary">Scan toutes les {scanIntervalSec}s</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" onClick={() => openSettingsModal('audio')}>
            <Volume2 className="h-3.5 w-3.5 text-primary" />
            <span>Réglages Audio</span>
          </Button>
          <Button size="sm" disabled={scanning} onClick={() => void handleScanNow()}>
            <Radar className={`h-3.5 w-3.5 ${scanning ? 'animate-spin' : ''}`} />
            <span>Scanner maintenant</span>
          </Button>
        </div>
      </div>

      <div role="tablist" className="flex flex-wrap gap-1.5 border-b border-border pb-2">
        {tabs.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <Button
              key={t.id}
              role="tab"
              aria-selected={active}
              size="sm"
              variant={active ? 'default' : 'outline'}
              onClick={() => setTab(t.id)}
            >
              <Icon className={`h-3.5 w-3.5 ${active ? '' : 'text-primary'}`} />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <Badge variant={active ? 'secondary' : 'outline'} className="ml-0.5 px-1.5 py-0 font-mono text-[10px]">
                  {t.count}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      <div key={tab} className="wf-view-enter">
        {tab === 'sniper' && <PriceSniperPanel />}
        {tab === 'worldstate' && (
          <div className="space-y-4">
            <WorldAlertsGrid />
            <WorldRulesPanel />
          </div>
        )}
        {tab === 'history' && <AlertHistoryPanel />}
      </div>
    </div>
  )
}
