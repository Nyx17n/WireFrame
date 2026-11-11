import * as React from 'react'
import {
  Bell,
  BookOpen,
  Coins,
  Compass,
  Flame,
  Globe,
  History,
  Package,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  User
} from 'lucide-react'
import type { RouteKind } from '@shared/schemas/navigation.schema'

export function RouteIcon({
  kind,
  className = 'h-3.5 w-3.5 shrink-0'
}: {
  kind: RouteKind
  className?: string
}): React.JSX.Element {
  switch (kind) {
    case 'hub':
      return <Globe className={className} />
    case 'market-home':
      return <Store className={className} />
    case 'market-catalog':
      return <Compass className={className} />
    case 'market-item':
      return <Package className={className} />
    case 'market-cart':
      return <ShoppingCart className={className} />
    case 'market-favorites':
      return <Star className={className} />
    case 'market-ducats':
      return <Coins className={className} />
    case 'market-rivens':
      return <Flame className={className} />
    case 'market-recent':
      return <History className={className} />
    case 'market-user':
      return <User className={className} />
    case 'alerts':
      return <Bell className={className} />
    case 'codex-home':
      return <BookOpen className={className} />
    case 'codex-detail':
      return <Sparkles className={className} />
  }
}
