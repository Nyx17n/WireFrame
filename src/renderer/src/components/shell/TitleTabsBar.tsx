import * as React from 'react'
import { Copy, Globe, Minus, Plus, Square, X } from 'lucide-react'
import { BrowserTabPill } from '@/components/shell/BrowserTabPill'
import { TabOrganizerPopover } from '@/components/shell/TabOrganizerPopover'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'
import { cn } from '@/lib/utils'

export function TitleTabsBar(): React.JSX.Element {
  const windowState = useAppStore((s) => s.windowState)
  const hubActive = useTabsStore((s) => s.hubActive)
  const tabs = useTabsStore((s) => s.tabs)
  const activeTabId = useTabsStore((s) => s.activeTabId)
  const activateHub = useTabsStore((s) => s.activateHub)
  const openTab = useTabsStore((s) => s.openTab)
  const reorderTabs = useTabsStore((s) => s.reorderTabs)

  const [draggedTabId, setDraggedTabId] = React.useState<string | null>(null)

  return (
    <header
      className="app-drag-region flex h-9 shrink-0 select-none items-center justify-between border-b border-border bg-background/95 pl-2"
      aria-label="Barre d'onglets et contrôles fenêtre"
    >
      <div className="app-no-drag flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pr-2 [scrollbar-width:none]">
        <button
          type="button"
          onClick={activateHub}
          title="Hub Temps Réel Warframe (wf://hub)"
          className={cn(
            'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition-colors',
            hubActive
              ? 'border-primary/60 bg-primary/20 text-foreground'
              : 'border-border bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
        >
          <img
            src="./images/logo.png"
            alt="WireFrame"
            className="h-4 w-4 rounded-xs object-contain"
          />
          <Globe className="h-3.5 w-3.5 text-primary" />
          {!windowState.isCompactMode && <span>Hub</span>}
        </button>

        <div className="mx-0.5 h-4 w-px shrink-0 bg-border" />

        {tabs.map((tab) => (
          <BrowserTabPill
            key={tab.id}
            tab={tab}
            isActive={!hubActive && tab.id === activeTabId}
            isCompact={windowState.isCompactMode}
            onDragStartTab={(id) => setDraggedTabId(id)}
            onDropOnTab={(targetId) => {
              if (draggedTabId) {
                reorderTabs(draggedTabId, targetId)
                setDraggedTabId(null)
              }
            }}
          />
        ))}

        <button
          type="button"
          onClick={() => openTab({ kind: 'market-home' })}
          title="Nouvel onglet (Ctrl+T)"
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        <TabOrganizerPopover />
      </div>

      <div className="app-no-drag flex h-full shrink-0 items-stretch">
        <button
          type="button"
          onClick={() => void ipcClient.window.minimize()}
          aria-label="Réduire la fenêtre"
          className="inline-flex w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => void ipcClient.window.toggleMaximize()}
          aria-label={windowState.isMaximized ? 'Restaurer la fenêtre' : 'Agrandir la fenêtre'}
          className="inline-flex w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {windowState.isMaximized ? <Copy className="h-3 w-3" /> : <Square className="h-3 w-3" />}
        </button>
        <button
          type="button"
          onClick={() => void ipcClient.window.close()}
          aria-label="Fermer la fenêtre"
          className="inline-flex w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
