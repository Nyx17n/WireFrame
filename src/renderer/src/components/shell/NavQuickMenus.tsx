import * as React from 'react'
import {
  Bell,
  BookOpen,
  ChevronDown,
  Coins,
  Flame,
  History,
  Menu,
  ShoppingCart,
  Star,
  Store,
  Wrench
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { QuickMarketPopover } from '@/components/shell/QuickMarketPopover'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function NavQuickMenus({ isCompact }: { isCompact: boolean }): React.JSX.Element {
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const cartCount = useAppStore((s) => s.settings.cart.length)
  const activeAlertsCount = useAppStore(
    (s) => s.settings.priceAlerts.filter((a) => a.enabled).length
  )

  if (isCompact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" title="Menu rapide Mode Compact">
            <Menu className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigateActive({ kind: 'market-home' })}>
            <Store className="h-3.5 w-3.5 text-primary" />
            <span>Marché</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigateActive({ kind: 'codex-home' })}>
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span>Codex & Helminth</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigateActive({ kind: 'market-cart' })}>
            <ShoppingCart className="h-3.5 w-3.5 text-primary" />
            <span>Panier & Bundler</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigateActive({ kind: 'market-ducats' })}>
            <Coins className="h-3.5 w-3.5 text-primary" />
            <span>Ducanator</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigateActive({ kind: 'alerts' })}>
            <Bell className="h-3.5 w-3.5 text-primary" />
            <span>Alertes & Price Sniper</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => navigateActive({ kind: 'market-home' })}>
        <Store className="h-3.5 w-3.5 text-primary" />
        <span>Marché</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => navigateActive({ kind: 'codex-home' })}>
        <BookOpen className="h-3.5 w-3.5 text-primary" />
        <span>Codex</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Wrench className="h-3.5 w-3.5 text-primary" />
            <span>Outils</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigateActive({ kind: 'market-ducats' })}>
            <Coins className="h-3.5 w-3.5 text-primary" />
            <span>Ducanator (Ducats / Plat)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigateActive({ kind: 'market-rivens' })}>
            <Flame className="h-3.5 w-3.5 text-primary" />
            <span>Contrats Mods Riven</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigateActive({ kind: 'market-recent' })}>
            <History className="h-3.5 w-3.5" />
            <span>Ordres Récents</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigateActive({ kind: 'market-favorites' })}>
            <Star className="h-3.5 w-3.5 text-primary" />
            <span>Mes Favoris</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="sm"
        title="Panier & Bundler"
        onClick={() => navigateActive({ kind: 'market-cart' })}
      >
        <ShoppingCart className="h-3.5 w-3.5 text-primary" />
        {cartCount > 0 && <span className="font-mono text-[11px]">{cartCount}</span>}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        title="Alertes & Price Sniper"
        onClick={() => navigateActive({ kind: 'alerts' })}
      >
        <Bell className="h-3.5 w-3.5 text-primary" />
        {activeAlertsCount > 0 && (
          <span className="font-mono text-[11px]">{activeAlertsCount}</span>
        )}
      </Button>
      <QuickMarketPopover />
    </>
  )
}

