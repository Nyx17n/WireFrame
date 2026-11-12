import * as React from 'react'
import { BellOff, History, MessageSquare, Radar, Trash2 } from 'lucide-react'
import type { TriggeredAlertEvent } from '@shared/schemas/alerts.schema'
import { ALERT_HISTORY_MAX } from '@shared/schemas/alerts.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { openHubSection } from '@/lib/hub-navigation'
import { ipcClient } from '@/services/ipc-client'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

function formatTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function AlertHistoryPanel(): React.JSX.Element {
  const triggerWhisper = useMarketStore((s) => s.triggerWhisper)
  const openTab = useTabsStore((s) => s.openTab)
  const [entries, setEntries] = React.useState<TriggeredAlertEvent[] | null>(null)

  React.useEffect(() => {
    let alive = true
    const load = (): void => {
      void ipcClient.alerts
        .getHistory()
        .then((list) => {
          if (alive) setEntries(list)
        })
        .catch(() => {
          if (alive) setEntries([])
        })
    }
    load()
    const unsubscribe = ipcClient.alerts.onTriggered(load)
    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  const handleClear = async (): Promise<void> => {
    await ipcClient.alerts.clearHistory()
    setEntries([])
  }

  const renderAction = (entry: TriggeredAlertEvent): React.JSX.Element | null => {
    const { hubSection } = entry
    if (entry.kind === 'worldstate' && hubSection) {
      return (
        <Button size="sm" variant="ghost" onClick={() => openHubSection(hubSection)}>
          <Radar className="h-3.5 w-3.5" />
          <span>Voir</span>
        </Button>
      )
    }
    if (entry.kind === 'price-sniper' && entry.sellerName && entry.platinum !== undefined) {
      return (
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            void triggerWhisper({
              ingameName: entry.sellerName ?? '',
              itemNameEn: entry.itemNameEn ?? entry.title,
              itemNameFr: entry.itemNameFr ?? entry.title,
              platinum: entry.platinum ?? 0,
              rank: entry.rank
            })
          }
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>/w</span>
        </Button>
      )
    }
    if (entry.slug) {
      const slug = entry.slug
      return (
        <Button size="sm" variant="ghost" onClick={() => openTab({ kind: 'market-item', slug })}>
          Voir
        </Button>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <History className="h-4 w-4 text-primary" />
          <span>Historique des alertes — session en cours</span>
          <Badge variant="outline" className="font-mono text-[10px]">
            {entries?.length ?? 0} / {ALERT_HISTORY_MAX}
          </Badge>
        </CardTitle>
        <Button size="sm" variant="outline" disabled={!entries?.length} onClick={() => void handleClear()}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
          <span>Effacer l’historique</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <p className="text-[11px] text-muted-foreground">
          Conservé uniquement en mémoire : l’historique est vidé à la fermeture de WireFrame.
        </p>
        {entries === null &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        {entries?.length === 0 && (
          <div className="flex flex-col items-center gap-1.5 py-6 text-center text-xs text-muted-foreground">
            <BellOff className="h-5 w-5" />
            <span>Aucune alerte déclenchée depuis le lancement.</span>
            <span>Tes règles actives sont surveillées en arrière-plan.</span>
          </div>
        )}
        {entries?.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-2.5 rounded-md border border-border bg-background/60 px-3 py-1.5 text-xs"
          >
            <span className="w-10 shrink-0 font-mono text-[11px] text-muted-foreground">
              {formatTime(entry.triggeredAt)}
            </span>
            <Badge variant={entry.kind === 'price-sniper' ? 'default' : 'secondary'} className="shrink-0 text-[10px]">
              {entry.kind === 'price-sniper' ? 'Price Sniper' : 'Worldstate'}
            </Badge>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{entry.title}</div>
              <div className="truncate text-[11px] text-muted-foreground">{entry.subtitle}</div>
            </div>
            {renderAction(entry)}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
