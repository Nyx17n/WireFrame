import * as React from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { ToastCard } from './ToastCard'

export function NotificationViewport(): React.JSX.Element | null {
  const queue = useNotificationStore((s) => s.activeQueue)
  const dismissToast = useNotificationStore((s) => s.dismissToast)
  const dismissAllToasts = useNotificationStore((s) => s.dismissAllToasts)

  const isCompactMode = useAppStore((s) => s.windowState.isCompactMode)
  const compactTimers = useAppStore((s) => s.settings.appearance.compactTimers)
  const hasWhisperBar = useMarketStore((s) => s.activeWhisper !== null)

  if (queue.length === 0) return null

  const maxVisible = isCompactMode ? 1 : 3
  const visibleItems = queue.slice(0, maxVisible)
  const pendingCount = Math.max(0, queue.length - visibleItems.length)

  const timersShown = compactTimers.enabled && (isCompactMode || compactTimers.showOnDesktop)
  const timersHeightPx = timersShown ? (compactTimers.collapsed ? 14 : 32) : 0
  const whisperHeightPx = hasWhisperBar ? 40 : 0
  // StatusBar = 24px; in Desktop we also keep 52px clearance above the floating Discord button
  const discordClearancePx = isCompactMode ? 10 : 56
  const bottomOffsetPx = 24 + timersHeightPx + whisperHeightPx + discordClearancePx

  return (
    <section
      aria-label="Notifications récentes"
      style={{ bottom: `${bottomOffsetPx}px` }}
      className={cn(
        'pointer-events-none fixed z-40 flex flex-col gap-2',
        isCompactMode ? 'left-3 right-3' : 'right-4 w-[360px] max-w-[92vw]'
      )}
    >
      {(pendingCount > 0 || visibleItems.length >= 2) && (
        <div className="pointer-events-auto flex items-center justify-end gap-1.5">
          {pendingCount > 0 && (
            <Badge
              variant="secondary"
              className="border border-border/80 bg-card/95 px-2 py-0.5 text-[10px] shadow-md"
            >
              +{pendingCount} en attente
            </Badge>
          )}
          {visibleItems.length >= 2 && (
            <button
              type="button"
              onClick={dismissAllToasts}
              className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card/95 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-md transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <X className="h-2.5 w-2.5" />
              <span>Tout fermer</span>
            </button>
          )}
        </div>
      )}

      {visibleItems.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={dismissToast} />
      ))}
    </section>
  )
}

