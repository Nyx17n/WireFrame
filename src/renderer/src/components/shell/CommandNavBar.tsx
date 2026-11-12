import * as React from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Minus,
  Pin,
  Plus,
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
  const updaterStatus = useAppStore((s) => s.updaterStatus)
  const setOmniboxOpen = useAppStore((s) => s.setOmniboxOpen)
  const openSettingsModal = useAppStore((s) => s.openSettingsModal)
  const refreshSystemStatus = useAppStore((s) => s.refreshSystemStatus)
  const toggleAlwaysOnTop = useAppStore((s) => s.toggleAlwaysOnTop)
  const toggleCompactMode = useAppStore((s) => s.toggleCompactMode)
  const setWindowZoom = useAppStore((s) => s.setWindowZoom)

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
        className="flex h-7 min-w-0 flex-1 items-center justify-between gap-2 rounded-md border border-input bg-background/80 px-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
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

        {!windowState.isCompactMode && (
          <div
            className="inline-flex h-7 items-center rounded-md border border-input bg-background/60 text-[11px]"
            title="Zoom de l'interface (clic sur le % pour remettre à 100%)"
          >
            <button
              type="button"
              onClick={() => void setWindowZoom(windowState.zoomPercent - 10)}
              disabled={windowState.zoomPercent <= 50}
              className="flex h-full w-6 items-center justify-center rounded-l-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
              aria-label="Zoom arrière"
            >
              <Minus className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => void setWindowZoom(100)}
              className="flex h-full min-w-[38px] items-center justify-center border-x border-border/60 px-1 font-mono text-[10px] font-semibold text-foreground/90 transition-colors hover:bg-secondary hover:text-primary"
              aria-label="Réinitialiser le zoom à 100%"
            >
              {windowState.zoomPercent}%
            </button>
            <button
              type="button"
              onClick={() => void setWindowZoom(windowState.zoomPercent + 10)}
              disabled={windowState.zoomPercent >= 200}
              className="flex h-full w-6 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
              aria-label="Zoom avant"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        )}

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
          className="relative"
          onClick={() =>
            openSettingsModal(updaterStatus?.state === 'downloaded' ? 'system' : undefined)
          }
          title={
            updaterStatus?.state === 'downloaded'
              ? `Mise à jour v${updaterStatus.availableVersion} prête à installer`
              : 'Paramètres WireFrame (Ctrl+,)'
          }
        >
          <Settings className="h-3.5 w-3.5" />
          {(updaterStatus?.state === 'downloaded' || updaterStatus?.state === 'available') && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-background bg-emerald-400" />
          )}
        </Button>
      </div>
    </div>
  )
}
