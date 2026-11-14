import * as React from 'react'
import { BookOpen, Check, Crosshair, ExternalLink, Plus, ShoppingCart, Star } from 'lucide-react'
import {
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuSeparator,
  type ContextMenuPosition
} from '@/components/ui/context-menu-portal'
import {
  openMarketItemInCodex,
  openMarketItemOnWiki,
  snipeMarketItemQuick,
  type MarketContextItemTarget
} from '@/lib/market-item-actions'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

export interface MarketContextMenuState {
  readonly position: ContextMenuPosition
  readonly item: MarketContextItemTarget
}

export function MarketItemContextMenu({
  state,
  onClose
}: {
  readonly state: MarketContextMenuState | null
  readonly onClose: () => void
}): React.JSX.Element | null {
  const favorites = useAppStore((s) => s.settings.favorites)
  const cart = useAppStore((s) => s.settings.cart)
  const lang = useAppStore((s) => s.settings.market.language)
  const toggleFavorite = useMarketStore((s) => s.toggleFavorite)
  const toggleCartItem = useMarketStore((s) => s.toggleCartItem)
  const openTab = useTabsStore((s) => s.openTab)

  if (!state) return null

  const { item, position } = state
  const slugClean = item.slug.trim().toLowerCase()
  const isFav = favorites.includes(slugClean)
  const inCart = cart.some((c) => c.slug === slugClean)
  const displayTitle = lang === 'fr' ? item.nameFr || item.nameEn : item.nameEn || item.nameFr

  return (
    <ContextMenuPortal position={position} onClose={onClose}>
      <ContextMenuLabel>{displayTitle}</ContextMenuLabel>
      <ContextMenuSeparator />

      <ContextMenuItem onSelect={() => void toggleFavorite(item.slug)}>
        <Star className={cn('h-3.5 w-3.5', isFav ? 'fill-primary text-primary' : 'text-primary')} />
        <span>{isFav ? 'Retirer des favoris' : 'Mettre en favoris'}</span>
      </ContextMenuItem>

      <ContextMenuItem
        onSelect={() =>
          openTab({ kind: 'market-item', slug: item.slug }, { title: displayTitle })
        }
      >
        <Plus className="h-3.5 w-3.5 text-primary" />
        <span>Ouvrir dans un nouvel onglet</span>
      </ContextMenuItem>

      <ContextMenuItem
        onSelect={() => void toggleCartItem({ slug: item.slug, quantity: 1 })}
      >
        {inCart ? (
          <Check className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <ShoppingCart className="h-3.5 w-3.5 text-primary" />
        )}
        <span>{inCart ? 'Retirer du panier' : 'Mettre dans le panier'}</span>
      </ContextMenuItem>

      <ContextMenuItem onSelect={() => void snipeMarketItemQuick(item)}>
        <Crosshair className="h-3.5 w-3.5 text-primary" />
        <span>Snipe (Surveiller le prix)</span>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem onSelect={() => void openMarketItemInCodex(item)}>
        <BookOpen className="h-3.5 w-3.5 text-primary" />
        <span>Voir dans le Codex</span>
      </ContextMenuItem>

      <ContextMenuItem onSelect={() => void openMarketItemOnWiki(item)}>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        <span>Voir sur le Wiki Officiel</span>
      </ContextMenuItem>
    </ContextMenuPortal>
  )
}
