import * as React from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Pin,
  RefreshCw,
  Search,
  Settings
} from 'lucide-react'
import { formatRouteUri } from '@shared/schemas/navigation.schema'
import { Button } from '@/components/ui/button'
import { NavQuickMenus } from '@/components/shell/NavQuickMenus'
import { getTabCurrentRoute } from '@/lib/tab-helpers'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function CommandNavBar(): React.JSX.Element {
  const windowState = useAppStore((s) => s.windowState)
  const setOmniboxOpen = useAppStore((s) => s.setOmniboxOpen)
  const openSettingsModal = useAppStore((s) => s.openSettingsModal)
  const refreshSystemStatus = useAppStore((s) => s.refreshSystemStatus)
  const toggleAlwaysOnTop = useAppStore((s) => s.toggleAlwaysOnTop)
  const toggleCompactMode = useAppStore((s) => s.toggleCompactMode)

  const hubActive = useTabsStore((s) => s.hubActive)
  const tabs = useTabsStore((s) => s.tabs)
  const activeTabId = useTabsStore((s) => s.activeTabId)
  const goBack = useTabsStore((s) => s.goBack)
  const goForward = useTabsStore((s) => s.goForward)
  const reloadActive = useTabsStore((s) => s.reloadActive)

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]
  const canGoBack = !hubActive && Boolean(activeTab && activeTab.historyIndex > 0)
  const canGoForward =
    !hubActive && Boolean(activeTab && activeTab.historyIndex < activeTab.history.length - 1)
  const currentUri = hubActive
    ? 'wf://hub'
    : activeTab
      ? formatRouteUri(getTabCurrentRoute(activeTab))
      : 'wf://market'

  return (
    <div
      className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-border bg-card/80 px-2.5"
      role="navigation"
      aria-label="Barre Omnibox et actions rapides"
    >
      <div className="flex shrink-0 items-center gap-0.5">
        <Button variant="ghost" size="icon" disabled={!canGoBack} onClick={goBack} title="Précédent">
          <ArrowLeft className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" disabled={!canGoForward} onClick={goForward} title="Suivant">
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            reloadActive()
            void refreshSystemStatus()
          }}
          title="Actualiser l'onglet actif (Ctrl+R)"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setOmniboxOpen(true)}
        className="flex h-7 min-w-0 max-w-xl flex-1 items-center justify-between gap-2 rounded-md border border-input bg-background/80 px-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate font-mono text-[11px] text-foreground/90">{currentUri}</span>
          {!windowState.isCompactMode && (
            <span className="truncate text-muted-foreground">
              — Rechercher un item, Codex ou coller une URL...
            </span>
          )}
        </span>
        <kbd className="hidden shrink-0 rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] sm:inline">
          Ctrl+K
        </kbd>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <NavQuickMenus isCompact={windowState.isCompactMode} />

        <Button
          variant={windowState.isAlwaysOnTop ? 'default' : 'outline'}
          size="icon"
          onClick={() => void toggleAlwaysOnTop()}
          title="Épingler au-dessus de Warframe (Alt+P)"
        >
          <Pin className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant={windowState.isCompactMode ? 'default' : 'outline'}
          size="icon"
          onClick={() => void toggleCompactMode()}
          title="Mode Compact 460×660 (Alt+M)"
        >
          {windowState.isCompactMode ? (
            <Maximize2 className="h-3.5 w-3.5" />
          ) : (
            <Minimize2 className="h-3.5 w-3.5" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => openSettingsModal()}
          title="Paramètres WireFrame (Ctrl+,)"
        >
          <Settings className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
