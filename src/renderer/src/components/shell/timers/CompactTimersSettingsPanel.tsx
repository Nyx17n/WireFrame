import * as React from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import {
  COMPACT_TIMERS_MAX_PINNED,
  type CompactTimerKey,
  type CompactTimersSettings
} from '@shared/schemas/settings.schema'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { COMPACT_TIMER_KEYS, COMPACT_TIMER_LABELS } from '@/lib/compact-timers'

interface Props {
  value: CompactTimersSettings
  onChange: (next: CompactTimersSettings) => void
}

/** Choix, ordre (↑/↓) et options du bandeau Minuteurs. */
export function CompactTimersSettingsPanel({ value, onChange }: Props): React.JSX.Element {
  const pinned = value.pinned
  const unpinned = COMPACT_TIMER_KEYS.filter((k) => !pinned.includes(k))
  const isFull = pinned.length >= COMPACT_TIMERS_MAX_PINNED

  const setPinned = (next: CompactTimerKey[]): void => onChange({ ...value, pinned: next })

  const move = (index: number, delta: -1 | 1): void => {
    const target = index + delta
    if (target < 0 || target >= pinned.length) return
    const next = [...pinned]
    const current = next[index]
    const swapped = next[target]
    if (current === undefined || swapped === undefined) return
    next[index] = swapped
    next[target] = current
    setPinned(next)
  }

  return (
    <div className="w-72 space-y-3 text-xs">
      <div className="font-semibold">
        Minuteurs épinglés ({pinned.length} / {COMPACT_TIMERS_MAX_PINNED})
      </div>

      <ul className="space-y-1">
        {pinned.map((key, index) => (
          <li key={key} className="flex items-center gap-1.5 rounded-md bg-secondary/50 px-2 py-1">
            <input
              type="checkbox"
              checked
              aria-label={`Retirer ${COMPACT_TIMER_LABELS[key]}`}
              onChange={() => setPinned(pinned.filter((k) => k !== key))}
            />
            <span className="flex-1 truncate">{COMPACT_TIMER_LABELS[key]}</span>
            <Button size="icon" variant="ghost" className="h-6 w-6" aria-label="Monter" disabled={index === 0} onClick={() => move(index, -1)}>
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" aria-label="Descendre" disabled={index === pinned.length - 1} onClick={() => move(index, 1)}>
              <ArrowDown className="h-3 w-3" />
            </Button>
          </li>
        ))}
        {unpinned.map((key) => (
          <li key={key} className="flex items-center gap-1.5 px-2 py-1 text-muted-foreground">
            <input
              type="checkbox"
              checked={false}
              disabled={isFull}
              aria-label={`Épingler ${COMPACT_TIMER_LABELS[key]}`}
              onChange={() => setPinned([...pinned, key])}
            />
            <span className="flex-1 truncate">{COMPACT_TIMER_LABELS[key]}</span>
          </li>
        ))}
      </ul>

      {isFull && <p className="text-[10px] text-muted-foreground">Maximum atteint : retire un minuteur pour en ajouter un autre.</p>}

      <label className="flex items-center gap-2 border-t border-border pt-2">
        <Switch checked={value.showOnDesktop} onCheckedChange={(showOnDesktop) => onChange({ ...value, showOnDesktop })} />
        <span>Afficher aussi en mode Desktop</span>
      </label>
    </div>
  )
}

