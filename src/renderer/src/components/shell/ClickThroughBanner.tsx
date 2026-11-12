import * as React from 'react'
import { Ghost, LockOpen } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

const DWELL_UNLOCK_MS = 550
const AUTO_RELOCK_IDLE_MS = 2600

export function ClickThroughBanner(): React.JSX.Element | null {
  const isAlwaysOnTop = useAppStore((s) => s.windowState.isAlwaysOnTop)
  const isClickThrough = useAppStore((s) => s.windowState.isClickThrough)
  const shortcut = useAppStore((s) => s.settings.window.shortcuts.toggleClickThrough)
  const setClickThrough = useAppStore((s) => s.setClickThrough)

  const [dwellPct, setDwellPct] = React.useState(0)
  const [hoverUnlocked, setHoverUnlocked] = React.useState(false)
  const dwellTimerRef = React.useRef<number | null>(null)
  const relockTimerRef = React.useRef<number | null>(null)

  const clearTimers = React.useCallback(() => {
    if (dwellTimerRef.current !== null) {
      window.clearInterval(dwellTimerRef.current)
      dwellTimerRef.current = null
    }
    if (relockTimerRef.current !== null) {
      window.clearTimeout(relockTimerRef.current)
      relockTimerRef.current = null
    }
  }, [])

  React.useEffect(() => {
    const onWindowFocus = (): void => {
      clearTimers()
      setDwellPct(0)
      setHoverUnlocked(false)
    }
    window.addEventListener('focus', onWindowFocus)
    return () => {
      window.removeEventListener('focus', onWindowFocus)
      clearTimers()
    }
  }, [clearTimers])

  React.useEffect(() => {
    if (!isAlwaysOnTop) {
      clearTimers()
      setDwellPct(0)
      setHoverUnlocked(false)
    }
  }, [isAlwaysOnTop, clearTimers])

  if (!isAlwaysOnTop || (!isClickThrough && !hoverUnlocked)) {
    return null
  }

  const startDwell = (): void => {
    if (hoverUnlocked || dwellTimerRef.current !== null) return
    const startedAt = performance.now()
    dwellTimerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - startedAt
      const pct = Math.min(100, Math.round((elapsed / DWELL_UNLOCK_MS) * 100))
      setDwellPct(pct)
      if (elapsed >= DWELL_UNLOCK_MS) {
        if (dwellTimerRef.current !== null) {
          window.clearInterval(dwellTimerRef.current)
          dwellTimerRef.current = null
        }
        setHoverUnlocked(true)
        void setClickThrough(false)
        relockTimerRef.current = window.setTimeout(() => {
          if (!document.hasFocus()) {
            setHoverUnlocked(false)
            setDwellPct(0)
            void setClickThrough(true)
          }
        }, AUTO_RELOCK_IDLE_MS)
      }
    }, 35)
  }

  const cancelOrRelock = (): void => {
    clearTimers()
    setDwellPct(0)
    if (hoverUnlocked && !document.hasFocus()) {
      setHoverUnlocked(false)
      void setClickThrough(true)
    }
  }

  return (
    <div className="flex h-7 shrink-0 select-none items-center justify-between gap-2 border-b border-primary/35 bg-primary/10 px-2.5 text-[11px]">
      <div className="flex min-w-0 items-center gap-1.5 text-foreground/90">
        <Ghost className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="truncate">
          Souris traversante en jeu active — raccourci{' '}
          <kbd className="rounded border border-primary/40 bg-background/80 px-1 py-0.5 font-mono text-[10px] text-primary">
            {shortcut}
          </kbd>
        </span>
      </div>

      <button
        type="button"
        onMouseEnter={startDwell}
        onMouseLeave={cancelOrRelock}
        onClick={() => {
          clearTimers()
          setHoverUnlocked(false)
          setDwellPct(0)
          void setClickThrough(false)
        }}
        className="relative inline-flex h-5 shrink-0 items-center gap-1 overflow-hidden rounded border border-primary/50 bg-card/90 px-2 font-medium text-foreground transition-colors hover:border-primary"
      >
        {dwellPct > 0 && !hoverUnlocked && (
          <span
            aria-hidden="true"
            style={{ width: `${dwellPct}%` }}
            className="pointer-events-none absolute inset-y-0 left-0 bg-primary/25"
          />
        )}
        <LockOpen className="relative z-10 h-3 w-3 text-primary" />
        <span className="relative z-10">
          {hoverUnlocked ? 'Cliquer pour interagir' : 'Maintenir 0.5s'}
        </span>
      </button>
    </div>
  )
}
