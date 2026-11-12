import * as React from 'react'
import { ArrowRight, Bell, BellOff, CheckCheck, Settings2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { useNotificationStore, type AppNotification } from '@/stores/useNotificationStore'
import { useTabsStore } from '@/stores/useTabsStore'
import { formatShortTime, getActionIcon, NOTIFICATION_STYLES } from './notification-visuals'

function HistoryRow({
  entry,
  onDone
}: {
  readonly entry: AppNotification
  readonly onDone: () => void
}): React.JSX.Element {
  const visual = NOTIFICATION_STYLES[entry.kind]
  const Icon = visual.Icon
  const primaryAction = entry.actions?.[0]
  const ActIcon = getActionIcon(primaryAction?.icon)
  const isError = entry.kind === 'error'

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-2 rounded-md border px-2.5 py-2 text-xs transition-colors',
        isError
          ? 'border-destructive/50 bg-destructive/10'
          : !entry.read
            ? 'border-primary/40 bg-primary/10'
            : 'border-border/70 bg-background/50 hover:bg-secondary/40'
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <Icon className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', visual.iconClass)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-muted-foreground">
              {formatShortTime(entry.updatedAt)}
            </span>
            <span className="truncate font-medium text-foreground">{entry.title}</span>
            {entry.repeatCount > 1 && (
              <Badge variant="secondary" className="px-1 py-0 font-mono text-[9px]">
                ×{entry.repeatCount}
              </Badge>
            )}
          </div>
          {entry.message && (
            <p className="line-clamp-2 text-[11px] text-muted-foreground">{entry.message}</p>
          )}
        </div>
      </div>

      {primaryAction && (
        <Button
          size="sm"
          variant="outline"
          className="h-6 shrink-0 px-2 text-[10px]"
          onClick={() => {
            primaryAction.onClick()
            onDone()
          }}
        >
          {ActIcon && <ActIcon className="h-3 w-3" />}
          <span>{primaryAction.label}</span>
        </Button>
      )}
    </div>
  )
}

export function NotificationCenterPopover({ isCompact }: { isCompact: boolean }): React.JSX.Element {
  const [open, setOpen] = React.useState(false)
  const history = useNotificationStore((s) => s.history)
  const isHydrated = useNotificationStore((s) => s.isHydrated)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)
  const clearHistory = useNotificationStore((s) => s.clearHistory)

  const sniperCount = useAppStore((s) => s.settings.priceAlerts.filter((a) => a.enabled).length)
  const worldCount = useAppStore((s) => s.settings.worldRules.filter((r) => r.enabled).length)
  const openSettingsModal = useAppStore((s) => s.openSettingsModal)
  const navigateActive = useTabsStore((s) => s.navigateActive)

  const unreadCount = React.useMemo(
    () => history.reduce((acc, item) => (item.read ? acc : acc + 1), 0),
    [history]
  )

  const handleOpenChange = (nextOpen: boolean): void => {
    setOpen(nextOpen)
    if (nextOpen && unreadCount > 0) markAllAsRead()
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={open ? 'secondary' : 'ghost'}
          size={isCompact ? 'icon' : 'sm'}
          className="relative"
          title="Centre de notifications (session)"
          aria-label="Ouvrir le centre de notifications"
        >
          <Bell className="h-3.5 w-3.5 text-primary" />
          {unreadCount > 0 && (
            <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 font-mono text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(410px,94vw)] p-0">
        <div className="flex items-start justify-between gap-2 border-b border-border px-3 py-2.5">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <span>Notifications (session)</span>
              {history.length > 0 && (
                <Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
                  {history.length}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {sniperCount} Price Sniper · {worldCount} règles Worldstate actives
            </p>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={markAllAsRead}>
                <CheckCheck className="h-3 w-3 text-primary" />
                <span>Tout lire</span>
              </Button>
            )}
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive"
                onClick={clearHistory}
              >
                <Trash2 className="h-3 w-3" />
                <span>Effacer</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title="Paramètres Audio & Notifications"
              onClick={() => {
                setOpen(false)
                openSettingsModal('audio')
              }}
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {!isHydrated ? (
            <div className="space-y-2 p-1">
              <Skeleton className="h-11 w-full rounded-md" />
              <Skeleton className="h-11 w-full rounded-md" />
              <Skeleton className="h-11 w-3/4 rounded-md" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1.5 py-8 text-center">
              <BellOff className="h-6 w-6 text-muted-foreground/70" />
              <p className="text-xs font-medium text-muted-foreground">
                Aucune notification pendant cette session.
              </p>
              <p className="max-w-[260px] text-[11px] text-muted-foreground/80">
                Tes actions (favoris, panier, copies /w) et tes alertes s’afficheront ici.
              </p>
            </div>
          ) : (
            <div className="wf-stagger-grid space-y-1.5">
              {history.map((entry) => (
                <HistoryRow key={entry.id} entry={entry} onDone={() => setOpen(false)} />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border bg-background/50 p-2">
          <Button
            size="sm"
            variant="secondary"
            className="w-full justify-between text-xs"
            onClick={() => {
              navigateActive({ kind: 'alerts' })
              setOpen(false)
            }}
          >
            <span>Ouvrir le Centre d’Alertes (wf://alerts)</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
