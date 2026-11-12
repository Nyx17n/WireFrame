import * as React from 'react'
import { CalendarClock, Compass, Flame, Moon, Snowflake, Sparkles, Sun } from 'lucide-react'
import { formatCountdown } from '@/components/hub/hub-countdown'
import type { TimerTone, TimerView } from '@/lib/compact-timers'
import { cn } from '@/lib/utils'

const TONE_STYLES: Readonly<Record<TimerTone, { icon: typeof Sun; className: string }>> = {
  sun: { icon: Sun, className: 'border-amber-400/50 text-amber-300' },
  moon: { icon: Moon, className: 'border-violet-400/50 text-violet-300' },
  warm: { icon: Flame, className: 'border-orange-400/50 text-orange-300' },
  cold: { icon: Snowflake, className: 'border-sky-400/50 text-sky-300' },
  accent: { icon: Sparkles, className: 'border-emerald-400/50 text-emerald-300' },
  neutral: { icon: CalendarClock, className: 'border-border text-foreground' }
}

interface TimerChipProps {
  view: TimerView
  nowMs: number
  stale: boolean
  onOpen: () => void
}

export function TimerChip({ view, nowMs, stale, onOpen }: TimerChipProps): React.JSX.Element {
  const tone = TONE_STYLES[view.tone]
  const Icon = view.key === 'baro' ? Compass : tone.icon
  const countdown = formatCountdown(view.targetIso, nowMs)

  return (
    <button
      type="button"
      onClick={onOpen}
      title={`${view.name} · ${view.state} — ouvrir dans le Hub`}
      className={cn(
        'inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border bg-card/80 px-2.5 text-[11px] font-medium transition-colors hover:bg-secondary',
        stale ? 'border-border text-muted-foreground opacity-70' : tone.className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{view.name}</span>
      <span className="text-muted-foreground">·</span>
      <span className="max-w-[90px] truncate">{view.state}</span>
      <span className="text-muted-foreground">·</span>
      <span className="font-mono tabular-nums">{countdown}</span>
    </button>
  )
}

