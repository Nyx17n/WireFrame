import * as React from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Minimize2,
  Maximize2,
  Pin,
  RefreshCw,
  Search,
  ShoppingCart,
  Star
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/useAppStore'

export function CommandNavBar(): React.JSX.Element {
  const settings = useAppStore((s) => s.settings)
  const windowState = useAppStore((s) => s.windowState)
  const refreshSystemStatus = useAppStore((s) => s.refreshSystemStatus)
  const toggleAlwaysOnTop = useAppStore((s) => s.toggleAlwaysOnTop)
  const toggleCompactMode = useAppStore((s) => s.toggleCompactMode)

  return (
    <div
      className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-border bg-card/80 px-2.5"
      role="navigation"
      aria-label="Barre Omnibox et actions rapides"
    >
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon" disabled title="Précédent (Jalon 2)">
          <ArrowLeft className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" disabled title="Suivant (Jalon 2)">
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void refreshSystemStatus()}
          title="Rafraîchir l'état système IPC"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="relative flex min-w-0 flex-1 items-center max-w-xl">
        <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          readOnly
          placeholder={
            windowState.isCompactMode
              ? 'Omnibox Market & Codex (Jalon 2)...'
              : 'Rechercher un Set Prime, Mod, Arcane, Relique ou Riven... (Ctrl+K au Jalon 2)'
          }
          className="h-7 w-full cursor-default rounded-md border border-input bg-background/80 pl-8 pr-3 text-xs text-muted-foreground outline-none focus:border-primary"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {!windowState.isCompactMode && (
          <>
            <Badge variant="secondary" className="uppercase">
              {settings.market.platform}
              {settings.market.crossplay ? ' · Cross' : ''}
            </Badge>
            <Button variant="ghost" size="icon" disabled title="Panier & Bundler (Jalon 4)">
              <ShoppingCart className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" disabled title="Favoris (Jalon 3)">
              <Star className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" disabled title="Price Sniper (Jalon 4)">
              <Bell className="h-3.5 w-3.5" />
            </Button>
          </>
        )}

        <Button
          variant={windowState.isAlwaysOnTop ? 'default' : 'outline'}
          size="sm"
          onClick={() => void toggleAlwaysOnTop()}
          title="Épingler au-dessus de Warframe (Alt+P)"
        >
          <Pin className="h-3.5 w-3.5" />
          {!windowState.isCompactMode && <span>Pin</span>}
        </Button>

        <Button
          variant={windowState.isCompactMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => void toggleCompactMode()}
          title="Basculer Mode Compact Overlay 460×660 (Alt+M)"
        >
          {windowState.isCompactMode ? (
            <Maximize2 className="h-3.5 w-3.5" />
          ) : (
            <Minimize2 className="h-3.5 w-3.5" />
          )}
          {!windowState.isCompactMode && <span>Compact</span>}
        </Button>
      </div>
    </div>
  )
}

