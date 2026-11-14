import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { getChanceVisualStyle } from '@/lib/codex-overlay-entries'
import { cn } from '@/lib/utils'

export function ChanceBadgeWithUnderBar({
  chancePct,
  isGuaranteed = false,
  compact = false,
  className
}: {
  chancePct: number
  isGuaranteed?: boolean
  compact?: boolean
  className?: string
}): React.JSX.Element {
  const vis = getChanceVisualStyle(chancePct, isGuaranteed)
  const formattedPct = isGuaranteed || chancePct >= 99.95
    ? '100 %'
    : `${chancePct.toFixed(chancePct % 1 === 0 ? 0 : 2)} %`

  const barWidthPct = isGuaranteed || chancePct >= 99.95
    ? 100
    : Math.max(8, Math.min(100, chancePct))

  return (
    <div className={cn('inline-flex shrink-0 flex-col items-end gap-1', className)}>
      <Badge
        variant="outline"
        className={cn(
          'justify-center font-mono leading-none',
          compact ? 'px-1.5 py-0.5 text-[10px]' : 'min-w-[4.5rem] px-2 py-0.5 text-[11px]',
          vis.badgeClass
        )}
      >
        {formattedPct}
      </Badge>
      <div
        className={cn(
          'overflow-hidden rounded-full bg-secondary/85',
          compact ? 'h-1 w-14' : 'h-1.5 w-[4.5rem]'
        )}
      >
        <div
          className={cn('h-full rounded-full transition-all', vis.barClass)}
          style={{ width: `${barWidthPct}%` }}
        />
      </div>
    </div>
  )
}

