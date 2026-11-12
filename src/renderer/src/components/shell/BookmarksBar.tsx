import * as React from 'react'
import {
  BookOpen,
  Clock,
  Coins,
  Flame,
  History,
  ShoppingCart,
  Star,
  Store,
  type LucideIcon
} from 'lucide-react'
import type { AppRoute, RouteKind } from '@shared/schemas/navigation.schema'
import { getTabCurrentRoute } from '@/lib/tab-helpers'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'

interface BookmarkShortcut {
  readonly id: RouteKind
  readonly label: string
  readonly tooltip: string
  readonly icon: LucideIcon
  readonly route: AppRoute
}

const HISTORY_SHORTCUT: BookmarkShortcut = {
  id: 'browser-history',
  label: 'Historique',
  tooltip: 'Historique de navigation (Ctrl+H · wf://history)',
  icon: History,
  route: { kind: 'browser-history' }
}

const CENTER_SHORTCUTS: readonly BookmarkShortcut[] = [
  {
    id: 'market-home',
    label: 'Marché',
    tooltip: 'Accueil Warframe Market (wf://market)',
    icon: Store,
    route: { kind: 'market-home' }
  },
  {
    id: 'market-favorites',
    label: 'Favoris',
    tooltip: 'Mes items favoris (wf://market/favorites)',
    icon: Star,
    route: { kind: 'market-favorites' }
  },
  {
    id: 'market-cart',
    label: 'Panier',
    tooltip: 'Panier & Trade Bundler (wf://market/cart)',
    icon: ShoppingCart,
    route: { kind: 'market-cart' }
  },
  {
    id: 'market-recent',
    label: 'Ordres récents',
    tooltip: 'Flux des ordres récents Warframe Market (wf://market/recent)',
    icon: Clock,
    route: { kind: 'market-recent' }
  },
  {
    id: 'codex-home',
    label: 'Codex',
    tooltip: 'Codex, Tables de Farm % & Helminth (wf://codex)',
    icon: BookOpen,
    route: { kind: 'codex-home' }
  },
  {
    id: 'market-ducats',
    label: 'Ducanator',
    tooltip: 'Ducanator — Ratios Ducats / Platinum (wf://market/ducats)',
    icon: Coins,
    route: { kind: 'market-ducats' }
  },
  {
    id: 'market-rivens',
    label: 'Contrats Mod Riven',
    tooltip: 'Enchères et contrats Mods Riven (wf://market/rivens)',
    icon: Flame,
    route: { kind: 'market-rivens' }
  }
]

export function BookmarksBar(): React.JSX.Element | null {
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)
  const hubActive = useTabsStore((s) => s.hubActive)
  const activeTab = useTabsStore((s) => s.tabs.find((t) => t.id === s.activeTabId) ?? s.tabs[0])

  const favoritesCount = useAppStore((s) => s.settings.favorites.length)
  const cartCount = useAppStore((s) => s.settings.cart.length)

  if (hubActive) {
    return null
  }

  const currentKind: RouteKind | null = activeTab ? getTabCurrentRoute(activeTab).kind : null

  const getBadgeCount = (kind: RouteKind): number => {
    if (kind === 'market-favorites') return favoritesCount
    if (kind === 'market-cart') return cartCount
    return 0
  }

  const renderShortcutButton = (item: BookmarkShortcut): React.JSX.Element => {
    const Icon = item.icon
    const isActive = currentKind === item.id
    const badgeCount = getBadgeCount(item.id)

    return (
      <button
        key={item.id}
        type="button"
        title={`${item.tooltip} — Ctrl+Clic ou clic molette : nouvel onglet`}
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey) {
            openTab(item.route)
          } else {
            navigateActive(item.route)
          }
        }}
        onAuxClick={(e) => {
          if (e.button === 1) {
            e.preventDefault()
            openTab(item.route)
          }
        }}
        data-active={isActive ? 'true' : 'false'}
        className={cn(
          'wf-bookmark-link wf-interactive-btn inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors',
          isActive
            ? 'border-primary/50 bg-primary/15 text-foreground'
            : 'border-transparent text-muted-foreground hover:border-border/60 hover:bg-secondary/75 hover:text-foreground'
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="whitespace-nowrap">{item.label}</span>
        {badgeCount > 0 && (
          <span className="rounded-full bg-primary/20 px-1.5 py-0 font-mono text-[10px] font-semibold text-primary">
            {badgeCount}
          </span>
        )}
      </button>
    )
  }

  return (
    <div
      className="flex h-8 shrink-0 items-center gap-2 overflow-x-auto border-b border-border bg-card/55 px-2.5 [scrollbar-width:none] lg:grid lg:grid-cols-[1fr_auto_1fr]"
      role="navigation"
      aria-label="Barre de raccourcis et outils"
    >
      <div className="hidden lg:block" aria-hidden="true" />

      <div className="flex shrink-0 items-center justify-center gap-1 justify-self-center">
        {CENTER_SHORTCUTS.map(renderShortcutButton)}
      </div>

      <div className="ml-auto flex shrink-0 items-center justify-self-end lg:ml-0">
        {renderShortcutButton(HISTORY_SHORTCUT)}
      </div>
    </div>
  )
}

