import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  ExternalLink,
  Info,
  MessageSquare,
  Radar,
  RefreshCw,
  ShoppingCart,
  XCircle,
  type LucideIcon
} from 'lucide-react'
import type {
  NotificationActionIcon,
  NotificationKind
} from '@/stores/useNotificationStore'

export interface NotificationVisualStyle {
  readonly Icon: LucideIcon
  readonly borderClass: string
  readonly stripeClass: string
  readonly iconClass: string
  readonly progressClass: string
}

export const NOTIFICATION_STYLES: Readonly<Record<NotificationKind, NotificationVisualStyle>> = {
  success: {
    Icon: CheckCircle2,
    borderClass: 'border-emerald-500/45',
    stripeClass: 'bg-emerald-500',
    iconClass: 'text-emerald-400',
    progressClass: 'bg-emerald-500'
  },
  info: {
    Icon: Info,
    borderClass: 'border-primary/45',
    stripeClass: 'bg-primary',
    iconClass: 'text-primary',
    progressClass: 'bg-primary'
  },
  warning: {
    Icon: AlertTriangle,
    borderClass: 'border-amber-500/50',
    stripeClass: 'bg-amber-500',
    iconClass: 'text-amber-400',
    progressClass: 'bg-amber-500'
  },
  error: {
    Icon: XCircle,
    borderClass: 'border-destructive/60',
    stripeClass: 'bg-destructive',
    iconClass: 'text-destructive',
    progressClass: 'bg-destructive'
  },
  alert: {
    Icon: BellRing,
    borderClass: 'border-primary shadow-[0_0_22px_-6px_hsl(var(--primary)/0.55)]',
    stripeClass: 'bg-primary',
    iconClass: 'text-primary',
    progressClass: 'bg-primary'
  }
}

export function getActionIcon(icon?: NotificationActionIcon): LucideIcon | null {
  switch (icon) {
    case 'whisper':
      return MessageSquare
    case 'hub':
      return Radar
    case 'external':
      return ExternalLink
    case 'cart':
      return ShoppingCart
    case 'retry':
      return RefreshCw
    default:
      return null
  }
}

export function formatShortTime(epochMs: number): string {
  const d = new Date(epochMs)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

