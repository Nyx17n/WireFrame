import * as React from 'react'
import { Crosshair, Ghost, LockOpen, X } from 'lucide-react'
import type { FarmOverlayLiveState, OverlayDensity } from '@shared/schemas/extensions.schema'
import { cn } from '@/lib/utils'

const DWELL_UNLOCK_MS = 550
const OPACITY_STEPS = [55, 72, 86, 96] as const
const DENSITIES: readonly { id: OverlayDensity; label: string }[] = [
  { id: 'sm', label: 'S' },
  { id: 'md', label: 'M' },
  { id: 'lg', label: 'L' }
]

const DRAG_STYLE = { WebkitAppRegion: 'drag' } as React.CSSProperties
const NO_DRAG_STYLE = { WebkitAppRegion: 'no-drag' } as React.CSSProperties

export function CodexFarmOverlayHeader({
  liveState,
  activeCount,
  onSetSize,
  onSetOpacity,
  onSetClickThrough,
  onCloseWindow
}: {
  liveState: FarmOverlayLiveState
  activeCount: number
  onSetSize: (size: OverlayDensity) => void
  onSetOpacity: (opacityPercent: number) => void
  onSetClickThrough: (enabled: boolean) => void
  onCloseWindow: () => void
}): React.JSX.Element {
  const [dwellPct, setDwellPct] = React.useState(0)
  const dwellTimerRef = React.useRef<number | null>(null)

  const clearDwell = React.useCallback(() => {
    if (dwellTimerRef.current !== null) {
      window.clearInterval(dwellTimerRef.current)
      dwellTimerRef.current = null
    }
    setDwellPct(0)
  }, [])

  React.useEffect(() => () => clearDwell(), [clearDwell])

  const startUnlockDwell = (): void => {
    if (!liveState.isClickThrough || dwellTimerRef.current !== null) return
    const startedAt = performance.now()
    dwellTimerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - startedAt
      const pct = Math.min(100, Math.round((elapsed / DWELL_UNLOCK_MS) * 100))
      setDwellPct(pct)
      if (elapsed >= DWELL_UNLOCK_MS) {
        clearDwell()
        onSetClickThrough(false)
      }
    }, 35)
  }

  const cycleOpacity = (): void => {
    const next =
      OPACITY_STEPS.find((step) => step > liveState.opacityPercent) ?? OPACITY_STEPS[0]
    onSetOpacity(next)
  }

  return (
    <header
      style={liveState.isClickThrough ? undefined : DRAG_STYLE}
      className="flex shrink-0 select-none items-center justify-between gap-2 border-b border-border/75 bg-card/95 px-2.5 py-2 text-xs"
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <Crosshair className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="truncate font-semibold text-foreground">
          Overlay Farm ({activeCount})
        </span>
      </div>

      <div style={NO_DRAG_STYLE} className="flex shrink-0 items-center gap-1">
        {liveState.isClickThrough ? (
          <button
            type="button"
            onMouseEnter={startUnlockDwell}
            onMouseLeave={clearDwell}
            onClick={() => {
              clearDwell()
              onSetClickThrough(false)
            }}
            className="relative inline-flex h-6 items-center gap-1 overflow-hidden rounded border border-primary/55 bg-background/90 px-2 text-[10px] font-medium text-foreground"
          >
            {dwellPct > 0 && (
              <span
                aria-hidden="true"
                style={{ width: `${dwellPct}%` }}
                className="pointer-events-none absolute inset-y-0 left-0 bg-primary/30"
              />
            )}
            <LockOpen className="relative z-10 h-3 w-3 text-primary" />
            <span className="relative z-10">🔓 0.5s</span>
          </button>
        ) : (
          <>
            <div className="flex items-center rounded border border-border/70 bg-background/60 p-0.5">
              {DENSITIES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onSetSize(d.id)}
                  className={cn(
                    'h-5 w-5 rounded text-[10px] font-semibold transition-colors',
                    liveState.size === d.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={cycleOpacity}
              title="Changer l’opacité du fond"
              className="h-6 rounded border border-border/70 bg-background/60 px-1.5 font-mono text-[10px] text-muted-foreground hover:text-foreground"
            >
              {liveState.opacityPercent}%
            </button>

            <button
              type="button"
              onClick={() => onSetClickThrough(true)}
              title="Réactiver la souris traversante (Click-Through)"
              className="inline-flex h-6 items-center gap-1 rounded border border-primary/40 bg-primary/15 px-1.5 text-[10px] font-medium text-primary hover:bg-primary/25"
            >
              <Ghost className="h-3 w-3" />
              <span>👻</span>
            </button>

            <button
              type="button"
              onClick={onCloseWindow}
              title={`Masquer (${liveState.shortcutToggle})`}
              className="inline-flex h-6 w-6 items-center justify-center rounded border border-border/70 bg-background/60 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </header>
  )
}

