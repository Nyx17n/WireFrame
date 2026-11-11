import * as React from 'react'
import { Flame, Rocket, ShieldAlert, Skull, Zap } from 'lucide-react'
import type { ArchonSortieSnapshot, VoidFissureEntry } from '@shared/schemas/worldstate.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCountdown } from './hub-countdown'

const TIER_FILTERS = ['all', 'Lith', 'Meso', 'Neo', 'Axi', 'Requiem', 'Omnia'] as const

export function HubFissuresMissionsTab({
  fissures,
  archonHunt,
  sortie,
  nowMs
}: {
  fissures: VoidFissureEntry[]
  archonHunt: ArchonSortieSnapshot | null
  sortie: ArchonSortieSnapshot | null
  nowMs: number
}): React.JSX.Element {
  const [modeFilter, setModeFilter] = React.useState<'all' | 'normal' | 'hard' | 'storm'>('all')
  const [tierFilter, setTierFilter] = React.useState<(typeof TIER_FILTERS)[number]>('all')
  const [fastOnly, setFastOnly] = React.useState(false)

  const filtered = React.useMemo(() => {
    return fissures.filter((f) => {
      if (modeFilter === 'normal' && (f.isHard || f.isStorm)) return false
      if (modeFilter === 'hard' && !f.isHard) return false
      if (modeFilter === 'storm' && !f.isStorm) return false
      if (tierFilter !== 'all' && f.tier.toLowerCase() !== tierFilter.toLowerCase()) return false
      if (fastOnly && !f.isFastMission) return false
      return true
    })
  }, [fissures, modeFilter, tierFilter, fastOnly])

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ['all', 'Toutes'],
                ['normal', 'Normal'],
                ['hard', 'Route de l’Acier'],
                ['storm', 'Tempêtes Railjack']
              ] as const
            ).map(([k, label]) => (
              <Button
                key={k}
                size="sm"
                variant={modeFilter === k ? 'default' : 'outline'}
                onClick={() => setModeFilter(k)}
              >
                {k === 'storm' && <Rocket className="h-3.5 w-3.5" />}
                <span>{label}</span>
              </Button>
            ))}
          </div>

          <Button
            size="sm"
            variant={fastOnly ? 'default' : 'outline'}
            onClick={() => setFastOnly((v) => !v)}
            title="Capture, Extermination, Sabotage, Sauvetage, Perturbation"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Missions Rapides uniquement</span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          {TIER_FILTERS.map((t) => (
            <Button
              key={t}
              size="sm"
              variant={tierFilter === t ? 'secondary' : 'ghost'}
              onClick={() => setTierFilter(t)}
            >
              {t === 'all' ? 'Toutes Ères' : t}
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-xs text-muted-foreground">
              Aucune fissure active ne correspond à ces filtres ({fissures.length} au total).
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {filtered.map((f) => (
              <Card key={f.id} className="border-border/75">
                <CardContent className="flex items-center justify-between gap-2 p-2.5 text-xs">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={f.isOmnia ? 'default' : 'secondary'}>{f.tier}</Badge>
                      <span className="font-bold">{f.missionType}</span>
                      {f.isFastMission && (
                        <Badge variant="success" className="px-1.5 py-0 text-[10px]">
                          ⚡ Rapide
                        </Badge>
                      )}
                      {f.isHard && (
                        <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                          Acier
                        </Badge>
                      )}
                      {f.isStorm && (
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                          Railjack
                        </Badge>
                      )}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {f.node} · {f.enemy}
                    </div>
                  </div>
                  <div className="shrink-0 font-mono text-[11px] font-semibold text-primary">
                    {formatCountdown(f.expiry, nowMs)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {archonHunt && (
          <Card className="border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <Skull className="h-4 w-4 text-primary" />
                  <span>Chasse à l’Archonte — {archonHunt.boss}</span>
                </span>
                <span className="font-mono text-[11px] text-primary">
                  {formatCountdown(archonHunt.expiry, nowMs)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs">
              {archonHunt.steps.map((st, idx) => (
                <div
                  key={`${st.node}-${idx}`}
                  className="flex items-center justify-between rounded border border-border/60 bg-background/60 px-2.5 py-1.5"
                >
                  <span className="font-semibold">
                    {idx + 1}. {st.missionType}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{st.node}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {sortie && (
          <Card className="border-border/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-amber-400" />
                  <span>
                    Sortie Quotidienne — {sortie.boss} ({sortie.faction})
                  </span>
                </span>
                <span className="font-mono text-[11px] text-primary">
                  {formatCountdown(sortie.expiry, nowMs)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs">
              {sortie.steps.map((st, idx) => (
                <div
                  key={`${st.node}-${idx}`}
                  className="space-y-0.5 rounded border border-border/60 bg-background/60 px-2.5 py-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {idx + 1}. {st.missionType}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{st.node}</span>
                  </div>
                  {st.modifier && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-400/90">
                      <Flame className="h-3 w-3 shrink-0" />
                      <span className="truncate">{st.modifier}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

