import * as React from 'react'
import { Crosshair, Hammer, Layers, Package } from 'lucide-react'
import type { CodexItemDetail } from '@shared/schemas/codex.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { ChanceBadgeWithUnderBar } from '@/components/codex/ChanceBadgeWithUnderBar'
import {
  buildComponentOverlayEntry,
  getEquipmentEntriesByMode
} from '@/lib/codex-overlay-entries'
import { useAppStore } from '@/stores/useAppStore'
import { useFarmOverlayStore } from '@/stores/useFarmOverlayStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function CodexCraftComponentsSection({
  detail
}: {
  detail: CodexItemDetail
}): React.JSX.Element | null {
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const extensionEnabled = useAppStore((s) => s.settings.extensions.codexFarmOverlay)
  const pinnedEntries = useFarmOverlayStore((s) => s.liveState.pinnedEntries)
  const toggleEntry = useFarmOverlayStore((s) => s.toggleEntry)
  const pinEquipmentSelection = useFarmOverlayStore((s) => s.pinEquipmentSelection)
  const toggleCraftResources = useFarmOverlayStore((s) => s.toggleCraftResources)

  if (detail.components.length === 0) {
    return null
  }

  const pinnedIdSet = new Set(pinnedEntries.map((e) => e.entryId))
  const gearParts = detail.components
    .map((comp, idx) => ({ comp, idx }))
    .filter(({ comp }) => !comp.isResource)
  const craftResources = detail.components
    .map((comp, idx) => ({ comp, idx }))
    .filter(({ comp }) => comp.isResource)

  const resEntries = getEquipmentEntriesByMode(detail, 'resources')
  const allResPinned =
    resEntries.length > 0 && resEntries.every((e) => pinnedIdSet.has(e.entryId))

  return (
    <div className="space-y-4">
      {gearParts.length > 0 && (
        <Card className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Hammer className="h-3.5 w-3.5 text-primary" />
              <span>Schémas & Pièces d’Équipement ({gearParts.length})</span>
            </h2>
            {extensionEnabled && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-[11px]"
                onClick={() => void pinEquipmentSelection(detail, 'parts', true)}
              >
                <Crosshair className="h-3.5 w-3.5 text-primary" />
                <span>Épingler les pièces à l’Overlay</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {gearParts.map(({ comp, idx }) => {
              const topSource = comp.acquisitionSources[0]
              const overlayEntry = buildComponentOverlayEntry(detail, comp, idx)
              const isPinned = pinnedIdSet.has(overlayEntry.entryId)

              return (
                <div
                  key={`${comp.nameFr}-${idx}`}
                  className="flex flex-col justify-between gap-2 rounded-md border border-border/70 bg-background/50 p-2.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <SafeAssetImage
                        src={comp.imageUrl}
                        alt={comp.nameFr}
                        className="h-9 w-9 shrink-0 rounded bg-card object-contain p-1"
                        fallback={<Package className="h-4 w-4 text-muted-foreground" />}
                      />
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{comp.nameFr}</div>
                        {topSource && (
                          <div className="truncate text-[10px] text-muted-foreground">
                            {topSource.labelFr}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {topSource && (
                        <ChanceBadgeWithUnderBar
                          chancePct={topSource.chancePct}
                          isGuaranteed={topSource.isGuaranteed}
                          compact
                        />
                      )}
                      {comp.count > 1 && (
                        <Badge variant="secondary" className="font-mono">
                          ×{comp.count.toLocaleString('fr-FR')}
                        </Badge>
                      )}
                      {extensionEnabled && (
                        <Button
                          size="icon"
                          variant={isPinned ? 'default' : 'ghost'}
                          className="h-7 w-7"
                          title={isPinned ? 'Retirer de l’Overlay' : 'Mettre en Overlay'}
                          onClick={() => void toggleEntry(overlayEntry, true)}
                        >
                          <Crosshair className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {comp.subResources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 border-t border-border/50 pt-1.5">
                      <span className="text-[10px] text-muted-foreground">Craft pièce :</span>
                      {comp.subResources.map((sr) => (
                        <button
                          key={`${comp.nameFr}-${sr.nameFr}`}
                          type="button"
                          onClick={() => {
                            if (sr.resourceSlug) {
                              navigateActive(
                                {
                                  kind: 'codex-detail',
                                  category: 'resources',
                                  slug: sr.resourceSlug
                                },
                                `Codex : ${sr.nameFr}`
                              )
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded border border-border/60 bg-card/70 px-1.5 py-0.5 text-[10px] hover:border-primary/50"
                        >
                          <SafeAssetImage
                            src={sr.imageUrl}
                            alt=""
                            className="h-3.5 w-3.5 shrink-0 object-contain"
                          />
                          <span className="font-mono font-semibold text-primary">
                            {sr.count.toLocaleString('fr-FR')}×
                          </span>
                          <span>{sr.nameFr}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {craftResources.length > 0 && (
        <Card className="space-y-3 border-amber-500/30 bg-card/90 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Layers className="h-4 w-4" />
                <span>Ressources Requises pour Craft ({craftResources.length})</span>
              </h2>
              {detail.totalBuildCredits !== null && detail.totalBuildCredits > 0 && (
                <Badge variant="outline" className="font-mono text-[10px]">
                  Fonderie : {detail.totalBuildCredits.toLocaleString('fr-FR')} Crédits
                </Badge>
              )}
            </div>

            {extensionEnabled && (
              <Button
                size="sm"
                variant={allResPinned ? 'secondary' : 'default'}
                className="h-7 px-2.5 text-[11px]"
                onClick={() => void toggleCraftResources(detail)}
              >
                <Crosshair className="h-3.5 w-3.5" />
                <span>
                  {allResPinned
                    ? 'Retirer les ressources de l’Overlay'
                    : 'Mettre les ressources en Overlay'}
                </span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {craftResources.map(({ comp, idx }) => {
              const clickable = Boolean(comp.resourceSlug)
              const topSource = comp.acquisitionSources[0]
              const overlayEntry = buildComponentOverlayEntry(detail, comp, idx)
              const isPinned = pinnedIdSet.has(overlayEntry.entryId)

              return (
                <div
                  key={`${comp.nameFr}-${idx}`}
                  onClick={() => {
                    if (comp.resourceSlug) {
                      navigateActive(
                        { kind: 'codex-detail', category: 'resources', slug: comp.resourceSlug },
                        `Codex : ${comp.nameFr}`
                      )
                    }
                  }}
                  className={`flex items-center justify-between gap-2 rounded-md border border-border/70 bg-background/55 p-2.5 text-xs ${
                    clickable ? 'cursor-pointer hover:border-primary/50 hover:bg-secondary/40' : ''
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <SafeAssetImage
                      src={comp.imageUrl}
                      alt={comp.nameFr}
                      className="h-9 w-9 shrink-0 rounded bg-card object-contain p-1"
                      fallback={<Package className="h-4 w-4 text-muted-foreground" />}
                    />
                    <div className="min-w-0">
                      <div className="truncate font-semibold">
                        {comp.nameFr} {clickable && <span className="text-primary">↗</span>}
                      </div>
                      {topSource && (
                        <div className="truncate text-[10px] text-muted-foreground">
                          {topSource.labelFr}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {topSource && (
                      <ChanceBadgeWithUnderBar
                        chancePct={topSource.chancePct}
                        isGuaranteed={topSource.isGuaranteed}
                        compact
                      />
                    )}
                    <Badge
                      variant="outline"
                      className="border-amber-500/45 bg-amber-500/15 font-mono text-amber-300"
                    >
                      ×{comp.count.toLocaleString('fr-FR')}
                    </Badge>
                    {extensionEnabled && (
                      <Button
                        size="icon"
                        variant={isPinned ? 'default' : 'ghost'}
                        className="h-7 w-7"
                        title={
                          isPinned
                            ? 'Retirer cette ressource de l’Overlay'
                            : 'Mettre cette ressource en Overlay'
                        }
                        onClick={(e) => {
                          e.stopPropagation()
                          void toggleEntry(overlayEntry, true)
                        }}
                      >
                        <Crosshair className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

