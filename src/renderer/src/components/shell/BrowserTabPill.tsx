import * as React from 'react'
import { CopyPlus, MoreHorizontal, Pin, Trash2, X } from 'lucide-react'
import type { BrowserTab } from '@shared/schemas/navigation.schema'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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

  const currentRoute = getTabCurrentRoute(tab)

  const handleAuxClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.button === 1 && !tab.pinned) {
      e.preventDefault()
      closeTab(tab.id)
    }
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStartTab(tab.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDropOnTab(tab.id)}
      onClick={() => activateTab(tab.id)}
      onAuxClick={handleAuxClick}
      title={`${tab.title}${tab.pinned ? ' (Épinglé)' : ' — Clic molette pour fermer'}`}
      className={cn(
        'group flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-2 text-xs transition-colors',
        isActive
          ? 'border-primary/50 bg-primary/15 font-semibold text-foreground'
          : 'border-border/70 bg-secondary/40 text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
        tab.pinned ? 'px-2' : isCompact ? 'max-w-[130px]' : 'max-w-[195px]'
      )}
    >
      <RouteIcon
        kind={currentRoute.kind}
        className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
      />

      {!tab.pinned && <span className="truncate">{tab.title}</span>}

      {tab.pinned && <Pin className="h-2.5 w-2.5 shrink-0 text-primary" />}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            aria-label="Actions de l'onglet"
            className="rounded p-0.5 opacity-0 transition-opacity hover:bg-background/60 group-hover:opacity-100 data-[state=open]:opacity-100"
          >
            <MoreHorizontal className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => togglePinTab(tab.id)}>
            <Pin className="h-3.5 w-3.5 text-primary" />
            <span>{tab.pinned ? 'Désépingler l’onglet' : 'Épingler l’onglet'}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => duplicateTab(tab.id)}>
            <CopyPlus className="h-3.5 w-3.5" />
            <span>Dupliquer l’onglet</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => closeDuplicateTabs()}>
            <Trash2 className="h-3.5 w-3.5" />
            <span>Fermer les doublons</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => closeOtherTabs(tab.id)}>
            <span>Fermer les autres onglets</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => closeTabsToRight(tab.id)}>
            <span>Fermer les onglets à droite</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => closeTab(tab.id, true)}>
            <X className="h-3.5 w-3.5 text-destructive" />
            <span>Fermer cet onglet</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
  )
}
