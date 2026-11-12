import * as React from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AppNotification } from '@/stores/useNotificationStore'
import { getActionIcon, NOTIFICATION_STYLES } from './notification-visuals'

interface ToastCardProps {
  readonly item: AppNotification
  readonly onDismiss: (id: string) => void
}

export function ToastCard({ item, onDismiss }: ToastCardProps): React.JSX.Element {
  const style = NOTIFICATION_STYLES[item.kind]
  const Icon = style.Icon

  const [paused, setPaused] = React.useState(false)
  const [exiting, setExiting] = React.useState(false)
  const [remainingMs, setRemainingMs] = React.useState<number>(item.durationMs ?? 0)

  const triggerExit = React.useCallback(() => {
    const motion = document.documentElement.dataset.motion
    if (motion === 'off') {
      onDismiss(item.id)
      return
    }
    setExiting(true)
    const exitDelay = motion === 'reduced' ? 110 : 170
    window.setTimeout(() => onDismiss(item.id), exitDelay)
  }, [item.id, onDismiss])

  // Reset countdown whenever a duplicate increments repeatCount / updatedAt
  React.useEffect(() => {
    if (item.durationMs !== null) {
      setRemainingMs(item.durationMs)
    }
  }, [item.durationMs, item.updatedAt])

  React.useEffect(() => {
    if (item.durationMs === null || paused || exiting) return
    const tickMs = 50
    const timer = window.setInterval(() => {
      setRemainingMs((prev) => {
        const next = prev - tickMs
        if (next <= 0) {
          window.clearInterval(timer)
          triggerExit()
          return 0
        }
        return next
      })
    }, tickMs)
    return () => window.clearInterval(timer)
  }, [item.durationMs, paused, exiting, triggerExit])

  const progressPct =
    item.durationMs !== null && item.durationMs > 0
      ? Math.max(0, Math.min(100, (remainingMs / item.durationMs) * 100))
      : 0

  return (
    <div
      role={item.kind === 'error' || item.kind === 'alert' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn(
        'pointer-events-auto relative overflow-hidden rounded-lg border bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md',
        style.borderClass,
        exiting ? 'wf-toast-exit' : 'wf-toast-enter'
      )}
    >
      <div className={cn('absolute inset-y-0 left-0 w-1', style.stripeClass)} aria-hidden="true" />

      <div className="flex items-start justify-between gap-2.5 py-2.5 pl-3.5 pr-2.5">
        <div className="flex min-w-0 flex-1 items-start gap-2.5 text-xs">
          <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', style.iconClass)} />

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-semibold text-foreground">{item.title}</span>
              {item.repeatCount > 1 && (
                <Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
                  ×{item.repeatCount}
                </Badge>
              )}
            </div>

            {item.message && (
              <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                {item.message}
              </p>
            )}

            {item.actions && item.actions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {item.actions.map((act) => {
                  const ActIcon = getActionIcon(act.icon)
                  return (
                    <Button
                      key={act.label}
                      size="sm"
                      variant={act.variant ?? 'default'}
                      className="h-6 px-2 text-[11px]"
                      onClick={() => {
                        act.onClick()
                        triggerExit()
                      }}
                    >
                      {ActIcon && <ActIcon className="h-3 w-3" />}
                      <span>{act.label}</span>
                    </Button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={triggerExit}
          aria-label="Fermer la notification"
          className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {item.durationMs !== null && (
        <div className="h-[2.5px] w-full bg-secondary/60" aria-hidden="true">
          <div
            className={cn('h-full transition-[width] duration-75 ease-linear', style.progressClass)}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  )
}
