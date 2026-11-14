import * as React from 'react'
import { ChevronLeft, ChevronRight, Copy, Globe, Loader2, Minus, Plus, Square, X } from 'lucide-react'
import { BrowserTabPill } from '@/components/shell/BrowserTabPill'
import { TabOrganizerPopover } from '@/components/shell/TabOrganizerPopover'
import { cn } from '@/lib/utils'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function TitleTabsBar(): React.JSX.Element {
  const windowState = useAppStore((s) => s.windowState)
  const hubActive = useTabsStore((s) => s.hubActive)
  const tabs = useTabsStore((s) => s.tabs)
  const activeTabId = useTabsStore((s) => s.activeTabId)
  const activateHub = useTabsStore((s) => s.activateHub)
  const openTab = useTabsStore((s) => s.openTab)
  const reorderTabs = useTabsStore((s) => s.reorderTabs)
  const isPageTransitioning = useTabsStore((s) => s.isPageTransitioning)

  const [draggedTabId, setDraggedTabId] = React.useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const tabsStripRef = React.useRef<HTMLDivElement | null>(null)

  const updateScrollIndicators = React.useCallback(() => {
    const strip = tabsStripRef.current
    if (!strip) return
    const maxScrollLeft = strip.scrollWidth - strip.clientWidth
    setCanScrollLeft(strip.scrollLeft > 2)
    setCanScrollRight(maxScrollLeft - strip.scrollLeft > 2)
  }, [])

  React.useEffect(() => {
    updateScrollIndicators()
    const strip = tabsStripRef.current
    if (!strip) return
    const observer = new ResizeObserver(() => updateScrollIndicators())
    observer.observe(strip)
    return () => observer.disconnect()
  }, [tabs.length, windowState.isCompactMode, updateScrollIndicators])

  React.useEffect(() => {
    if (hubActive) return
    const strip = tabsStripRef.current
    if (!strip) return
    const activeEl = Array.from(strip.querySelectorAll<HTMLElement>('[data-tab-id]')).find(
      (el) => el.dataset.tabId === activeTabId
    )
    if (activeEl) {
      const behavior =
        document.documentElement.dataset.motion === 'off' ? 'auto' : 'smooth'
      activeEl.scrollIntoView({ behavior, block: 'nearest', inline: 'nearest' })
    }
  }, [activeTabId, hubActive, tabs.length])

  const scrollTabsBy = (delta: number): void => {
    const strip = tabsStripRef.current
    if (!strip) return
    const behavior =
      document.documentElement.dataset.motion === 'off' ? 'auto' : 'smooth'
    strip.scrollBy({ left: delta, behavior })
  }

  const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>): void => {
    const strip = tabsStripRef.current
    if (!strip || strip.scrollWidth <= strip.clientWidth) return
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (delta !== 0) {
      strip.scrollLeft += delta
      updateScrollIndicators()
    }
  }

  return (
    <header
      className="app-drag-region flex h-9 shrink-0 select-none items-center justify-between border-b border-border bg-background/95 pl-2"
      aria-label="Barre d'onglets et contrôles fenêtre"
    >
      <div className="app-no-drag flex min-w-0 items-center gap-1">
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
            alt="TennoFrame"
            className="h-4 w-4 rounded-xs object-contain"
          />
          {hubActive && isPageTransitioning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            <Globe className="h-3.5 w-3.5 text-primary" />
          )}
          {!windowState.isCompactMode && <span>Hub</span>}
        </button>

        <div className="mx-0.5 h-4 w-px shrink-0 bg-border" />

        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollTabsBy(-220)}
            title="Faire défiler les onglets vers la gauche (ou molette souris)"
            aria-label="Défiler les onglets à gauche"
            className="inline-flex h-7 w-5 shrink-0 items-center justify-center rounded border border-border/70 bg-secondary/70 text-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}

        <div
          ref={tabsStripRef}
          onScroll={updateScrollIndicators}
          onWheel={handleWheelScroll}
          onMouseDown={(e) => {
            if (e.button === 1) e.preventDefault()
          }}
          className="wf-no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
        >
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
        </div>

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollTabsBy(220)}
            title="Faire défiler les onglets vers la droite (ou molette souris)"
            aria-label="Défiler les onglets à droite"
            className="inline-flex h-7 w-5 shrink-0 items-center justify-center rounded border border-border/70 bg-secondary/70 text-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="flex shrink-0 items-center gap-0.5 pl-0.5">
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
      </div>

      <div className="app-drag-region h-full min-w-[36px] flex-1" />

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
