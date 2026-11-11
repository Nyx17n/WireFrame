import * as React from 'react'
import { ChevronDown, ChevronUp, Flame, Moon, Shield, Sparkles, Snowflake, Sun } from 'lucide-react'
import type { CycleCardData, SyndicateBountyGroup } from '@shared/schemas/worldstate.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { computeCycleProgress, formatCountdown } from './hub-countdown'

function CycleIcon({ tone }: { tone: CycleCardData['tone'] }): React.JSX.Element {
  switch (tone) {
    case 'sun':
      return <Sun className="h-4 w-4 text-amber-400" />
    case 'moon':
      return <Moon className="h-4 w-4 text-indigo-400" />
    case 'warm':
      return <Flame className="h-4 w-4 text-orange-400" />
    case 'cold':
      return <Snowflake className="h-4 w-4 text-sky-400" />
    case 'fass':
      return <Flame className="h-4 w-4 text-rose-400" />
    case 'vome':
      return <Moon className="h-4 w-4 text-cyan-400" />
    case 'spiral':
      return <Sparkles className="h-4 w-4 text-primary" />
    default:
      return <Shield className="h-4 w-4 text-primary" />
  }
}

export function HubPlanetsBountiesTab({
  cycles,
  bounties,
  nowMs
}: {
  cycles: CycleCardData[]
  bounties: SyndicateBountyGroup[]
  nowMs: number
}): React.JSX.Element {
  const [selectedSyndicate, setSelectedSyndicate] = React.useState<
    'Ostrons' | 'Solaris United' | 'Entrati'
  >('Ostrons')
  const [expandedJobId, setExpandedJobId] = React.useState<string | null>(null)

  const activeGroup =
    bounties.find((b) => b.syndicateKey === selectedSyndicate) ?? bounties[0] ?? null

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cycles.map((c) => {
          const progress = computeCycleProgress(c.activation, c.expiry, nowMs)
          return (
            <Card key={c.key} className="border-border/80 bg-card/85">
              <CardContent className="space-y-2.5 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <SafeAssetImage
                      src={c.planetImageUrl}
                      alt={c.planetFr}
                      className="h-9 w-9 shrink-0 object-contain"
                    />
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {c.planetFr}
                      </div>
                      <div className="text-xs font-bold">{c.zoneFr}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-md border border-border/70 bg-background/70 px-2 py-1 text-xs font-semibold">
                    <CycleIcon tone={c.tone} />
                    <span>{c.stateLabelFr}</span>
                  </div>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{c.nextStateLabelFr}</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatCountdown(c.expiry, nowMs)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">Mises à Prix des Mondes Ouverts</h2>
            {activeGroup && (
              <p className="text-[11px] text-muted-foreground">
                Rotation des récompenses dans{' '}
                <span className="font-mono font-semibold text-primary">
                  {formatCountdown(activeGroup.expiry, nowMs)}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['Ostrons', 'Solaris United', 'Entrati'] as const).map((key) => {
              const label =
                key === 'Ostrons' ? 'Ostrons (Cetus)' : key === 'Solaris United' ? 'Solaris (Fortuna)' : 'Entrati (Deimos)'
              return (
                <Button
                  key={key}
                  size="sm"
                  variant={selectedSyndicate === key ? 'default' : 'outline'}
                  onClick={() => setSelectedSyndicate(key)}
                >
                  {label}
                </Button>
              )
            })}
          </div>
        </div>

        {!activeGroup || activeGroup.jobs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-xs text-muted-foreground">
              Aucune mise à prix disponible actuellement pour ce syndicat.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {activeGroup.jobs.map((job) => {
              const isOpen = expandedJobId === job.id
              return (
                <Card key={job.id} className="border-border/70">
                  <CardContent className="space-y-2 p-3">
                    <div
                      className="flex cursor-pointer flex-wrap items-center justify-between gap-2"
                      onClick={() => setExpandedJobId(isOpen ? null : job.id)}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold">{job.type}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Niv. {job.minLevel}–{job.maxLevel}
                          {job.totalStanding > 0 &&
                            ` · +${job.totalStanding.toLocaleString('fr-FR')} Réputation`}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {job.drops.slice(0, 3).map((d) => (
                          <Badge key={d.item} variant="secondary" className="hidden sm:inline-flex">
                            {d.count > 1 ? `${d.count}x ` : ''}
                            {d.item}
                          </Badge>
                        ))}
                        <Button size="icon" variant="ghost">
                          {isOpen ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {isOpen && job.drops.length > 0 && (
                      <div className="grid grid-cols-1 gap-1.5 border-t border-border/60 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                        {job.drops.map((d) => (
                          <div
                            key={`${job.id}-${d.item}`}
                            className="flex items-center justify-between rounded border border-border/50 bg-background/60 px-2.5 py-1 text-[11px]"
                          >
                            <span className="truncate pr-2">
                              {d.count > 1 ? `${d.count}x ` : ''}
                              {d.item}
                            </span>
                            <span className="shrink-0 font-mono text-primary">{d.chance}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

