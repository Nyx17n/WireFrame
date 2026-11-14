import * as React from 'react'
import { Crosshair, ExternalLink, Plus, Store } from 'lucide-react'
import type { CodexSummaryCard } from '@shared/schemas/codex.schema'
import {
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuSeparator,
  type ContextMenuPosition
} from '@/components/ui/context-menu-portal'
import { resolveCodexMarketSlug } from '@/lib/catalog-layout'
import { buildItemKey } from '@/lib/codex-overlay-entries'
import { cn } from '@/lib/utils'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useFarmOverlayStore } from '@/stores/useFarmOverlayStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

export interface CodexContextMenuState {
  readonly position: ContextMenuPosition
  readonly card: CodexSummaryCard
}

export function CodexItemContextMenu({
  state,
  onClose
}: {
  readonly state: CodexContextMenuState | null
  readonly onClose: () => void
}): React.JSX.Element | null {
  const overlayEnabled = useAppStore((s) => s.settings.extensions.codexFarmOverlay)
  const pinnedEntries = useFarmOverlayStore((s) => s.liveState.pinnedEntries)
  const pinQuickItem = useFarmOverlayStore((s) => s.pinQuickItem)
  const catalog = useMarketStore((s) => s.catalog)
  const openTab = useTabsStore((s) => s.openTab)

  if (!state) return null

  const { card, position } = state
  const isPinned = pinnedEntries.some((e) => e.itemKey === buildItemKey(card.category, card.id))
  const marketSlug = card.isTradable ? resolveCodexMarketSlug(card, catalog) : null
  const wikiTitle = (card.nameEn || card.nameFr).trim().replace(/\s+/g, '_')

  return (
    <ContextMenuPortal position={position} onClose={onClose}>
      <ContextMenuLabel>{card.nameFr}</ContextMenuLabel>
      <ContextMenuSeparator />

      {overlayEnabled && (
        <>
          <ContextMenuItem onSelect={() => void pinQuickItem(card.category, card.id)}>
            <Crosshair
              className={cn('h-3.5 w-3.5', isPinned ? 'text-emerald-400' : 'text-primary')}
            />
            <span>
              {isPinned ? 'Retirer de l’Overlay Farm' : 'Afficher dans l’Overlay Farm'}
            </span>
          </ContextMenuItem>
          <ContextMenuSeparator />
        </>
      )}

      <ContextMenuItem
        onSelect={() =>
          openTab(
            { kind: 'codex-detail', category: card.category, slug: card.id },
            { title: `Codex : ${card.nameFr}` }
          )
        }
      >
        <Plus className="h-3.5 w-3.5 text-primary" />
        <span>Ouvrir dans un nouvel onglet</span>
      </ContextMenuItem>

      {card.isTradable && marketSlug && (
        <ContextMenuItem
          onSelect={() =>
            openTab({ kind: 'market-item', slug: marketSlug }, { title: card.nameFr })
          }
        >
          <Store className="h-3.5 w-3.5 text-primary" />
          <span>Voir sur Warframe Market</span>
        </ContextMenuItem>
      )}

      <ContextMenuItem
        onSelect={() =>
          void ipcClient.window.openExternalUrl(
            `https://wiki.warframe.com/w/${encodeURIComponent(wikiTitle)}`
          )
        }
      >
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        <span>Voir sur le Wiki Officiel</span>
      </ContextMenuItem>
    </ContextMenuPortal>
  )
}
