import * as React from 'react'
import { ChevronDown, Hammer, MapPin, Package, Sparkles } from 'lucide-react'
import type { CodexItemDetail } from '@shared/schemas/codex.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { useTabsStore } from '@/stores/useTabsStore'

function getChanceVisual(chance: number): { barClass: string; badgeClass: string } {
  if (chance >= 50) {
    return {
      barClass: 'bg-emerald-500',
      badgeClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
    }
  }
  if (chance >= 20) {
    return {
      barClass: 'bg-sky-500',
      badgeClass: 'border-sky-500/40 bg-sky-500/10 text-sky-300'
    }
  }
  if (chance >= 8) {
    return {
      barClass: 'bg-amber-500',
      badgeClass: 'border-amber-500/40 bg-amber-500/10 text-amber-300'
    }
  }
  if (chance >= 2) {
    return {
      barClass: 'bg-orange-500',
      badgeClass: 'border-orange-500/40 bg-orange-500/10 text-orange-300'
    }
  }
  return {
    barClass: 'bg-rose-500',
    badgeClass: 'border-rose-500/40 bg-rose-500/10 text-rose-300'
  }
}

export function CodexDropsAndCraftSection({
  detail
}: {
  detail: CodexItemDetail
}): React.JSX.Element {
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const [visibleDrops, setVisibleDrops] = React.useState(60)

  React.useEffect(() => {
    setVisibleDrops(60)
  }, [detail.id])

  return (
    <div className="space-y-4">
      {detail.relicInfo && detail.relicInfo.rewards.length > 0 && (
        <Card className="space-y-2.5 p-4">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Récompenses de la Relique (Intacte vs Éclatante)</span>
          </h2>
          <div className="divide-y divide-border/60 text-xs">
            {detail.relicInfo.rewards.map((rw, idx) => {
              const isRare = rw.tier.includes('Rare')
              const isUncommon = rw.tier.includes('Inhabituel')
              const vis = getChanceVisual(rw.radiantChance)
              return (
                <div key={idx} className="flex flex-wrap items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">{rw.nameFr}</div>
                    {rw.nameEn !== rw.nameFr && (
                      <div className="text-[10px] text-muted-foreground">{rw.nameEn}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Badge
                      variant="outline"
                      className={
                        isRare
                          ? 'border-amber-500/50 text-amber-300'
                          : isUncommon
                            ? 'border-slate-400/50 text-slate-200'
                            : 'border-orange-700/50 text-orange-300'
                      }
                    >
                      {rw.tier}
                    </Badge>
                    <div className="hidden h-2 w-20 overflow-hidden rounded-full bg-secondary/80 sm:block">
                      <div
                        className={`h-full rounded-full transition-all ${vis.barClass}`}
                        style={{ width: `${Math.max(6, Math.min(100, rw.radiantChance * 3))}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      Intacte {rw.intactChance}% →{' '}
                      <strong className="text-primary">Rad {rw.radiantChance}%</strong>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {detail.components.length > 0 && (
        <Card className="space-y-3 p-4">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Hammer className="h-3.5 w-3.5 text-primary" />
            <span>Recette Fonderie & Matériaux Requis</span>
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {detail.components.map((comp, idx) => {
              const clickable = Boolean(comp.resourceSlug)
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
                  className={`flex items-center justify-between gap-2 rounded-md border border-border/70 bg-background/50 p-2.5 text-xs ${
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
                      {comp.drops[0] && (
                        <div className="truncate text-[10px] text-muted-foreground">
                          Top spot : {comp.drops[0].location} ({comp.drops[0].chance}%)
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    ×{comp.count.toLocaleString('fr-FR')}
                  </Badge>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {detail.usedFor.length > 0 && (
        <Card className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Hammer className="h-3.5 w-3.5 text-primary" />
              <span>Équipements fabriqués avec cette ressource</span>
            </h2>
            <Badge variant="secondary">{detail.totalUsedFor} schémas au total</Badge>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {detail.usedFor.map((gear) => (
              <div
                key={`${gear.category}-${gear.id}`}
                onClick={() =>
                  navigateActive(
                    { kind: 'codex-detail', category: gear.category, slug: gear.id },
                    `Codex : ${gear.nameFr}`
                  )
                }
                className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border/60 bg-background/50 p-2 text-xs transition-colors hover:border-primary/50 hover:bg-secondary/40"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <SafeAssetImage
                    src={gear.imageUrl}
                    alt={gear.nameFr}
                    className="h-8 w-8 shrink-0 rounded bg-card object-contain p-0.5"
                  />
                  <span className="truncate font-medium">{gear.nameFr}</span>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  ×{gear.count}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>Où le farmer — Tables de Drop (triées par meilleur %)</span>
          </h2>
          <Badge variant="outline">{detail.drops.length} sources</Badge>
        </div>

        {detail.drops.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Aucune table de drop directe (obtenu via Dojo, Syndicats, Baro Ki’Teer, Quête ou Marché).
          </p>
        ) : (
          <>
            <div className="max-h-96 divide-y divide-border/60 overflow-y-auto pr-2 text-xs">
              {detail.drops.slice(0, visibleDrops).map((drop, idx) => {
                const vis = getChanceVisual(drop.chance)
                return (
                  <div key={idx} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-foreground">{drop.location}</div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {drop.part && <span className="text-primary">{drop.part}</span>}
                        {drop.rarity && <span>{drop.rarity}</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary/80 sm:w-28">
                        <div
                          className={`h-full rounded-full transition-all ${vis.barClass}`}
                          style={{ width: `${Math.max(4, Math.min(100, drop.chance))}%` }}
                        />
                      </div>
                      <Badge
                        variant="outline"
                        className={`w-16 justify-center font-mono text-xs ${vis.badgeClass}`}
                      >
                        {drop.chance.toFixed(drop.chance % 1 === 0 ? 0 : 2)}%
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
            {detail.drops.length > visibleDrops && (
              <div className="flex justify-center pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setVisibleDrops((prev) => prev + 60)}
                >
                  <ChevronDown className="h-3.5 w-3.5 text-primary" />
                  <span>Afficher plus ({detail.drops.length - visibleDrops} sources restantes)</span>
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
