import * as React from 'react'
import { ChevronDown, ChevronUp, Pin, Settings2, WifiOff } from 'lucide-react'
import type { CompactTimersSettings } from '@shared/schemas/settings.schema'
import { useNowTick } from '@/components/hub/hub-countdown'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { buildTimerView, type TimerView } from '@/lib/compact-timers'
import { openHubSection } from '@/lib/hub-navigation'
import { useAppStore } from '@/stores/useAppStore'
import { WORLDSTATE_STALE_AFTER_MS, useWorldstateStore } from '@/stores/useWorldstateStore'
import { CompactTimersSettingsPanel } from './CompactTimersSettingsPanel'
import { TimerChip } from './TimerChip'

/** Bandeau Minuteurs (CDC 7.B) : en bas, au-dessus de la barre de statut, en Mode Compact. */
export function CompactTimersBar(): React.JSX.Element | null {
  const isCompact = useAppStore((s) => s.windowState.isCompactMode)
  const timers = useAppStore((s) => s.settings.appearance.compactTimers)
  const visible = timers.enabled && (isCompact || timers.showOnDesktop)
  return visible ? <TimersBarContent timers={timers} /> : null
}

function TimersBarContent({ timers }: { timers: CompactTimersSettings }): React.JSX.Element {
  const updateSettings = useAppStore((s) => s.updateSettings)
  const subscribe = useWorldstateStore((s) => s.subscribe)
  const data = useWorldstateStore((s) => s.data)
  const lastSuccessAt = useWorldstateStore((s) => s.lastSuccessAt)
  const lastError = useWorldstateStore((s) => s.lastError)
  const nowMs = useNowTick(1000)
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  React.useEffect(() => subscribe(), [subscribe])

  const save = (next: CompactTimersSettings): void => {
    void updateSettings({ appearance: { compactTimers: next } })
  }

  const isLoading = data === null && lastError === null
  const isStale =
    (data === null && lastError !== null) ||
    (lastSuccessAt !== null && nowMs - lastSuccessAt > WORLDSTATE_STALE_AFTER_MS)
  const views = timers.pinned
    .map((key) => buildTimerView(key, data, nowMs))
    .filter((v): v is TimerView => v !== null)

  if (timers.collapsed) {
    return (
      <div className="flex h-3.5 shrink-0 items-center justify-end border-t border-border bg-card/90 px-2">
        <button type="button" aria-label="Déplier les minuteurs" onClick={() => save({ ...timers, collapsed: false })} className="text-muted-foreground hover:text-foreground">
          <ChevronUp className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-8 shrink-0 items-center gap-1 border-t border-border bg-card/90 pl-1.5 pr-1">
      <div
        className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_8px,black_calc(100%-16px),transparent)] [scrollbar-width:none]"
        onWheel={(e) => {
          if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY
        }}
      >
        {isLoading &&
          timers.pinned.map((key) => <Skeleton key={key} className="h-6 w-24 shrink-0 rounded-full" />)}
        {!isLoading && timers.pinned.length === 0 && (
          <Button size="sm" variant="ghost" className="h-6 text-[11px]" onClick={() => setSettingsOpen(true)}>
            <Pin className="h-3 w-3" />
            <span>Aucun minuteur épinglé — Épingler des minuteurs</span>
          </Button>
        )}
        {!isLoading &&
          views.map((view) => (
            <TimerChip key={view.key} view={view} nowMs={nowMs} stale={isStale} onOpen={() => openHubSection(view.hubSection)} />
          ))}
      </div>

      {isStale && (
        <span className="flex shrink-0 items-center gap-1 text-[10px] text-destructive" title={lastError ?? 'Données périmées'}>
          <WifiOff className="h-3 w-3" />
          <span>hors-ligne</span>
        </span>
      )}

      <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
        <PopoverTrigger asChild>
          <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" aria-label="Choisir les minuteurs">
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="end">
          <CompactTimersSettingsPanel value={timers} onChange={save} />
        </PopoverContent>
      </Popover>
      <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" aria-label="Replier les minuteurs" onClick={() => save({ ...timers, collapsed: true })}>
        <ChevronDown className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

