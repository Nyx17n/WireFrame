import * as React from 'react'
import { ChevronDown, ChevronUp, Crosshair, ListChecks } from 'lucide-react'
import type { CodexItemDetail } from '@shared/schemas/codex.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { CodexOverlayPickerPanel } from '@/components/codex/CodexOverlayPickerPanel'
import { buildItemKey } from '@/lib/codex-overlay-entries'
import { useAppStore } from '@/stores/useAppStore'
import { useFarmOverlayStore } from '@/stores/useFarmOverlayStore'

export function CodexOverlayToolbar({
  detail
}: {
  detail?: CodexItemDetail
}): React.JSX.Element | null {
  const extensionEnabled = useAppStore((s) => s.settings.extensions.codexFarmOverlay)
  const liveState = useFarmOverlayStore((s) => s.liveState)
  const setWindowOpen = useFarmOverlayStore((s) => s.setWindowOpen)
  const pinEquipmentSelection = useFarmOverlayStore((s) => s.pinEquipmentSelection)
  const unpinItemGroup = useFarmOverlayStore((s) => s.unpinItemGroup)

  const [isPickerOpen, setIsPickerOpen] = React.useState(false)

  if (!extensionEnabled) {
    return null
  }

  const isDetailPinned = detail
    ? liveState.pinnedEntries.some((e) => e.itemKey === buildItemKey(detail.category, detail.id))
    : false

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex cursor-pointer items-center gap-2 font-semibold text-foreground">
            <Switch
              checked={liveState.windowOpen}
              onCheckedChange={(checked) => void setWindowOpen(checked)}
            />
            <Crosshair className="h-3.5 w-3.5 text-primary" />
            <span>Overlay Farm en jeu</span>
          </label>
          <Badge variant="outline" className="font-mono text-[10px]">
            {liveState.shortcutToggle}
          </Badge>
          <span className="hidden text-[11px] text-muted-foreground md:inline">
            Affiche Quêtes FR, Boutique, Dojo & % de drop (barre colorée sous le %) par-dessus Warframe.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {detail && (
            <Button
              size="sm"
              variant={isDetailPinned ? 'secondary' : 'default'}
              className="h-7 px-2.5 text-[11px]"
              onClick={() => {
                if (isDetailPinned) {
                  void unpinItemGroup(detail.category, detail.id)
                } else {
                  void pinEquipmentSelection(detail, false, true)
                }
              }}
            >
              <Crosshair className="h-3.5 w-3.5" />
              <span>
                {isDetailPinned
                  ? `Retirer ${detail.nameFr}`
                  : `Tout afficher : ${detail.nameFr}`}
              </span>
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-[11px]"
            onClick={() => setIsPickerOpen((v) => !v)}
          >
            <ListChecks className="h-3.5 w-3.5 text-primary" />
            <span>Choisir quoi afficher ({liveState.pinnedEntries.length})</span>
            {isPickerOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {isPickerOpen && (
        <CodexOverlayPickerPanel detail={detail} onClose={() => setIsPickerOpen(false)} />
      )}
    </div>
  )
}

