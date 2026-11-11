import * as React from 'react'
import type { SellerOnlineStatus } from '@shared/schemas/market.schema'
import { cn } from '@/lib/utils'

const STATUS_META: Record<SellerOnlineStatus, { label: string; dotClass: string; textClass: string }> = {
  ingame: {
    label: 'En jeu',
    dotClass: 'bg-emerald-400',
    textClass: 'text-emerald-400'
  },
  online: {
    label: 'En ligne',
    dotClass: 'bg-sky-400',
    textClass: 'text-sky-400'
  },
  offline: {
    label: 'Hors ligne',
    dotClass: 'bg-muted-foreground/50',
    textClass: 'text-muted-foreground'
  }
}

export function StatusDot({
  status,
  showLabel = true
}: {
  status: SellerOnlineStatus
  showLabel?: boolean
}): React.JSX.Element {
  const meta = STATUS_META[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium', meta.textClass)}>
      <span className={cn('h-2 w-2 shrink-0 rounded-full', meta.dotClass)} />
      {showLabel && <span>{meta.label}</span>}
    </span>
  )
}

