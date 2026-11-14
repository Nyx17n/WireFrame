import * as React from 'react'
import { Compass, Crosshair } from 'lucide-react'
import type { CodexItemDetail } from '@shared/schemas/codex.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChanceBadgeWithUnderBar } from '@/components/codex/ChanceBadgeWithUnderBar'
import {
  buildItemKey,
  buildSingleItemOverlayEntry,
  getSourceTypePrefix
} from '@/lib/codex-overlay-entries'
import { useAppStore } from '@/stores/useAppStore'
import { useFarmOverlayStore } from '@/stores/useFarmOverlayStore'

export function CodexAcquisitionSourcesCard({
  detail
}: {
  detail: CodexItemDetail
}): React.JSX.Element | null {
  const extensionEnabled = useAppStore((s) => s.settings.extensions.codexFarmOverlay)
  const pinnedEntries = useFarmOverlayStore((s) => s.liveState.pinnedEntries)
  const toggleEntry = useFarmOverlayStore((s) => s.toggleEntry)
  const pinEquipmentSelection = useFarmOverlayStore((s) => s.pinEquipmentSelection)
  const unpinItemGroup = useFarmOverlayStore((s) => s.unpinItemGroup)

  if (detail.acquisitionSources.length === 0) {
    return null
  }

  const itemKey = buildItemKey(detail.category, detail.id)
  const isGroupPinned = pinnedEntries.some((e) => e.itemKey === itemKey)
  const hasMultipleGearParts =
    (detail.category === 'warframes' || detail.category === 'weapons') &&
    detail.components.filter((c) => !c.isResource).length > 1

  const handleQuickPin = (): void => {
    if (isGroupPinned) {
      void unpinItemGroup(detail.category, detail.id)
      return
    }
    if (hasMultipleGearParts) {
      void pinEquipmentSelection(detail, false, true)
    } else {
      void toggleEntry(buildSingleItemOverlayEntry(detail))
    }
  }

  return (
    <Card className="space-y-3 border-primary/30 bg-card/85 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          <Compass className="h-4 w-4" />
          <span>Comment l’obtenir — Quêtes, Boutique, Dojo & Meilleurs Spots</span>
        </h2>

        {extensionEnabled && (
          <Button
            size="sm"
            variant={isGroupPinned ? 'secondary' : 'outline'}
            className="h-7 px-2.5 text-[11px]"
            onClick={handleQuickPin}
          >
            <Crosshair className="h-3.5 w-3.5 text-primary" />
            <span>
              {isGroupPinned
                ? 'Retirer de l’Overlay Farm'
                : hasMultipleGearParts
                  ? `Épingler tout ${detail.nameFr} à l’Overlay`
                  : 'Épingler à l’Overlay Farm'}
            </span>
          </Button>
        )}
      </div>

      <div className="divide-y divide-border/60 text-xs">
        {detail.acquisitionSources.map((src, idx) => {
          const prefix = getSourceTypePrefix(src.type)
          return (
            <div
              key={`${src.type}-${src.labelFr}-${idx}`}
              className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className={`px-1.5 py-0 text-[10px] ${prefix.badgeClass}`}>
                    {prefix.tagFr}
                  </Badge>
                  {src.partNameFr && (
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                      {src.partNameFr}
                    </Badge>
                  )}
                  <span className="font-semibold text-foreground">{src.labelFr}</span>
                </div>
                {src.sublabelFr && (
                  <p className="text-[11px] text-muted-foreground">{src.sublabelFr}</p>
                )}
              </div>

              <ChanceBadgeWithUnderBar
                chancePct={src.chancePct}
                isGuaranteed={src.isGuaranteed}
              />
            </div>
          )
        })}
      </div>
    </Card>
  )
}

