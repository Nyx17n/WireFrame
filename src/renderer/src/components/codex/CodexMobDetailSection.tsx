import * as React from 'react'
import { ArrowUpRight, Crosshair, MapPin, Search, Shield, Swords } from 'lucide-react'
import type { CodexItemDetail } from '@shared/schemas/codex.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ChanceBadgeWithUnderBar } from '@/components/codex/ChanceBadgeWithUnderBar'
import { buildMobDropOverlayEntry } from '@/lib/codex-overlay-entries'
import { useAppStore } from '@/stores/useAppStore'
import { useFarmOverlayStore } from '@/stores/useFarmOverlayStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function CodexMobDetailSection({
  detail
}: {
  detail: CodexItemDetail
}): React.JSX.Element | null {
  const mob = detail.mobInfo
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)
  const overlayEnabled = useAppStore((s) => s.settings.extensions.codexFarmOverlay)
  const pinnedEntries = useFarmOverlayStore((s) => s.liveState.pinnedEntries)
  const toggleEntry = useFarmOverlayStore((s) => s.toggleEntry)

  const [dropQuery, setDropQuery] = React.useState('')

  const pinnedIds = React.useMemo(
    () => new Set(pinnedEntries.map((e) => e.entryId)),
    [pinnedEntries]
  )

  if (!mob) return null

  const q = dropQuery.trim().toLowerCase()
  const filteredDrops = q
    ? mob.mobDrops.filter(
        (d) => d.nameFr.toLowerCase().includes(q) || d.nameEn.toLowerCase().includes(q)
      )
    : mob.mobDrops

  return (
    <div className="space-y-4">
      <Card className="space-y-3 border-emerald-500/35 bg-emerald-950/10 p-4">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
          <MapPin className="h-3.5 w-3.5" />
          <span>Où trouver ce Mob & % de Chance de Spawn</span>
        </h2>

        <div className="space-y-2">
          {mob.spawns.map((sp, idx) => (
            <div
              key={`${sp.locationFr}-${idx}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/65 bg-background/65 px-3 py-2.5 text-xs"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="font-semibold text-foreground">{sp.locationFr}</div>
                {sp.conditionFr && (
                  <div className="text-[11px] text-muted-foreground">{sp.conditionFr}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Spawn</span>
                <ChanceBadgeWithUnderBar
                  chancePct={sp.spawnChancePct}
                  isGuaranteed={sp.spawnChancePct >= 99.9}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span>Défenses de Base & Vulnérabilités Élémentaires</span>
        </h2>

        <div className="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
          <div className="rounded border border-border/60 bg-background/50 p-2">
            <div className="text-[10px] text-muted-foreground">Santé de base</div>
            <div className="font-bold text-rose-400">{mob.health}</div>
          </div>
          <div className="rounded border border-border/60 bg-background/50 p-2">
            <div className="text-[10px] text-muted-foreground">Armure de base</div>
            <div className="font-bold text-amber-400">{mob.armor}</div>
          </div>
          <div className="rounded border border-border/60 bg-background/50 p-2">
            <div className="text-[10px] text-muted-foreground">Bouclier</div>
            <div className="font-bold text-sky-400">{mob.shield}</div>
          </div>
          <div className="rounded border border-border/60 bg-background/50 p-2">
            <div className="text-[10px] text-muted-foreground">Scans Simaris</div>
            <div className="font-bold text-primary">{mob.scansRequired}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {mob.weaknessesFr.map((w) => (
            <Badge
              key={w}
              variant="outline"
              className="border-emerald-500/45 bg-emerald-500/15 text-emerald-300"
            >
              ++ Faiblesse : {w}
            </Badge>
          ))}
          {mob.resistancesFr.map((r) => (
            <Badge
              key={r}
              variant="outline"
              className="border-rose-500/45 bg-rose-500/15 text-rose-300"
            >
              -- Résistance : {r}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Swords className="h-3.5 w-3.5 text-primary" />
            <span>Tables de Drop du Mob ({mob.mobDrops.length})</span>
          </h2>

          {mob.mobDrops.length > 6 && (
            <div className="relative w-60">
              <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={dropQuery}
                onChange={(e) => setDropQuery(e.target.value)}
                placeholder="Filtrer un drop (FR / EN)…"
                className="h-7 pl-8 text-xs"
              />
            </div>
          )}
        </div>

        {filteredDrops.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            Aucun butin référencé pour ce filtre sur cette unité.
          </p>
        ) : (
          <div className="space-y-2">
            {filteredDrops.map((drop, idx) => {
              const entry = buildMobDropOverlayEntry(detail, drop, idx)
              const isPinned = pinnedIds.has(entry.entryId)
              return (
                <div
                  key={`${drop.nameEn}-${idx}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/65 bg-background/50 px-3 py-2 text-xs"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">{drop.nameFr}</span>
                      {drop.nameEn !== drop.nameFr && (
                        <span className="text-[11px] text-muted-foreground">({drop.nameEn})</span>
                      )}
                      <Badge variant="secondary" className="text-[10px]">
                        {drop.typeLabelFr}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {drop.linkedCodexId && drop.linkedCategory && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-[11px]"
                        onClick={(e) => {
                          const route = {
                            kind: 'codex-detail' as const,
                            category: drop.linkedCategory!,
                            slug: drop.linkedCodexId!
                          }
                          if (e.ctrlKey || e.metaKey) openTab(route, { title: drop.nameFr })
                          else navigateActive(route, `Codex : ${drop.nameFr}`)
                        }}
                      >
                        <ArrowUpRight className="h-3 w-3" />
                        <span>Codex</span>
                      </Button>
                    )}

                    <ChanceBadgeWithUnderBar
                      chancePct={drop.chancePct}
                      isGuaranteed={drop.chancePct >= 99.9}
                    />

                    {overlayEnabled && (
                      <Button
                        size="icon"
                        variant={isPinned ? 'default' : 'outline'}
                        className="h-7 w-7"
                        title="Épingler ce drop à l'Overlay Farm"
                        onClick={() => void toggleEntry(entry, true)}
                      >
                        <Crosshair className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

