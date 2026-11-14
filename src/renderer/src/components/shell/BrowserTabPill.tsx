import * as React from 'react'
import { CopyPlus, Loader2, Pin, Trash2, X } from 'lucide-react'
import type { BrowserTab } from '@shared/schemas/navigation.schema'
import {
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuSeparator,
  type ContextMenuPosition
} from '@/components/ui/context-menu-portal'
import { RouteIcon } from '@/components/shell/RouteIcon'
import { getTabCurrentRoute } from '@/lib/tab-helpers'
import { cn } from '@/lib/utils'
import { useTabsStore } from '@/stores/useTabsStore'

interface BrowserTabPillProps {
  tab: BrowserTab
  isActive: boolean
  isCompact: boolean
  onDragStartTab: (id: string) => void
  onDropOnTab: (targetId: string) => void
}

export function BrowserTabPill({
  tab,
  isActive,
  isCompact,
  onDragStartTab,
  onDropOnTab
}: BrowserTabPillProps): React.JSX.Element {
  const activateTab = useTabsStore((s) => s.activateTab)
  const closeTab = useTabsStore((s) => s.closeTab)
  const togglePinTab = useTabsStore((s) => s.togglePinTab)
  const duplicateTab = useTabsStore((s) => s.duplicateTab)
  const closeDuplicateTabs = useTabsStore((s) => s.closeDuplicateTabs)
  const closeOtherTabs = useTabsStore((s) => s.closeOtherTabs)
  const closeTabsToRight = useTabsStore((s) => s.closeTabsToRight)
  const isPageTransitioning = useTabsStore((s) => s.isPageTransitioning)

  const [menuPos, setMenuPos] = React.useState<ContextMenuPosition | null>(null)
  const currentRoute = getTabCurrentRoute(tab)
  const middlePressedRef = React.useRef(false)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.button === 1) {
      // Bloque l'autoscroll natif Windows/Chromium sur les conteneurs overflow-x-auto
      e.preventDefault()
      e.stopPropagation()
      middlePressedRef.current = true
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.button === 1 && middlePressedRef.current) {
      e.preventDefault()
      e.stopPropagation()
      middlePressedRef.current = false
      closeTab(tab.id, true)
    }
  }

  const handleAuxClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.button === 1) {
      e.preventDefault()
      e.stopPropagation()
      if (middlePressedRef.current) {
        middlePressedRef.current = false
        closeTab(tab.id, true)
      }
    }
  }

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setMenuPos({ x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <div
        data-tab-id={tab.id}
        draggable
        onDragStart={() => onDragStartTab(tab.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => onDropOnTab(tab.id)}
        onClick={() => activateTab(tab.id)}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          middlePressedRef.current = false
        }}
        onAuxClick={handleAuxClick}
        title={`${tab.title}${tab.pinned ? ' (Épinglé)' : ''} — Clic droit pour les options · Clic molette pour fermer`}
        className={cn(
          'wf-tab-pill group relative flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-2 text-xs transition-colors',
          isActive
            ? 'border-primary/50 bg-primary/15 font-semibold text-foreground'
            : 'border-border/70 bg-secondary/40 text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
          tab.pinned ? 'px-2' : isCompact ? 'max-w-[130px]' : 'max-w-[195px]'
        )}
      >
        {isActive && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-2 bottom-0 h-[1.5px] rounded-full bg-primary"
          />
        )}
        {isActive && isPageTransitioning ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
        ) : (
          <RouteIcon
            kind={currentRoute.kind}
            className={cn(
              'h-3.5 w-3.5 shrink-0',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          />
        )}

        {!tab.pinned && <span className="truncate">{tab.title}</span>}

        {tab.pinned && <Pin className="h-2.5 w-2.5 shrink-0 text-primary" />}

        {!tab.pinned && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              closeTab(tab.id)
            }}
            aria-label={`Fermer ${tab.title}`}
            className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <ContextMenuPortal position={menuPos} onClose={() => setMenuPos(null)}>
        <ContextMenuItem onSelect={() => togglePinTab(tab.id)}>
          <Pin className="h-3.5 w-3.5 text-primary" />
          <span>{tab.pinned ? 'Désépingler l’onglet' : 'Épingler l’onglet'}</span>
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => duplicateTab(tab.id)}>
          <CopyPlus className="h-3.5 w-3.5" />
          <span>Dupliquer l’onglet</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => closeDuplicateTabs()}>
          <Trash2 className="h-3.5 w-3.5" />
          <span>Fermer les doublons</span>
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => closeOtherTabs(tab.id)}>
          <span>Fermer les autres onglets</span>
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => closeTabsToRight(tab.id)}>
          <span>Fermer les onglets à droite</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem destructive onSelect={() => closeTab(tab.id, true)}>
          <X className="h-3.5 w-3.5 text-destructive" />
          <span>Fermer cet onglet</span>
        </ContextMenuItem>
      </ContextMenuPortal>
    </>
  )
}
