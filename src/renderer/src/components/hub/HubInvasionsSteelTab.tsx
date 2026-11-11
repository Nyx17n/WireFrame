import * as React from 'react'
import { AlertCircle, ArrowUpRight, Radio, Sparkles, Swords } from 'lucide-react'
import type {
  ArbitrationSnapshot,
  InvasionEntry,
  LotusAlertEntry,
  NightwaveChallenge,
  SteelPathSnapshot,
  WorldEventEntry
} from '@shared/schemas/worldstate.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { useTabsStore } from '@/stores/useTabsStore'
import { ArbitrationVitusSection } from './ArbitrationVitusSection'
import { formatCountdown } from './hub-countdown'

export function HubInvasionsSteelTab({
  invasions,
  steelPath,
  arbitration,
  alerts,
  events,
  nightwave,
  nowMs
}: {
  invasions: InvasionEntry[]
  steelPath: SteelPathSnapshot
  arbitration: ArbitrationSnapshot
  alerts: LotusAlertEntry[]
  events: WorldEventEntry[]
  nightwave: NightwaveChallenge[]
  nowMs: number
}): React.JSX.Element {
  const openTab = useTabsStore((s) => s.openTab)

  return (
    <div className="space-y-5">
      {(alerts.length > 0 || events.length > 0) && (
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {alerts.map((al) => (
            <Card key={al.id} className="border-amber-500/40 bg-amber-500/5">
              <CardContent className="flex items-center justify-between gap-2 p-3 text-xs">
                <div className="flex min-w-0 items-center gap-2.5">
                  <SafeAssetImage
                    src={al.thumbnailUrl}
                    alt=""
                    className="h-8 w-8 shrink-0 object-contain"
                    fallback={<AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />}
                  />
                  <div className="min-w-0">
                    <div className="truncate font-bold">
                      Alerte du Lotus : {al.rewardLabel || `${al.credits.toLocaleString('fr-FR')} Cr`}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {al.missionType} · {al.node} ({al.faction})
                    </div>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[11px] font-semibold text-amber-400">
                  {formatCountdown(al.expiry, nowMs)}
                </span>
              </CardContent>
            </Card>
          ))}

          {events.map((ev) => (
            <Card key={ev.id} className="border-primary/40 bg-primary/5">
              <CardContent className="flex items-center justify-between gap-2 p-3 text-xs">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate">{ev.description}</span>
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {ev.node} {ev.rewardsSummary.length > 0 && `· ${ev.rewardsSummary[0]}`}
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[11px] font-semibold text-primary">
                  {formatCountdown(ev.expiry, nowMs)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Swords className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold">Invasions Actives ({invasions.length})</h2>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {invasions.map((inv) => (
            <Card key={inv.id} className={inv.isRare ? 'border-amber-500/50' : 'border-border/75'}>
              <CardContent className="space-y-2 p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{inv.node}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {inv.completion}% · {inv.desc}
                  </span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${inv.completion}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline">{inv.attacker.faction}</Badge>
                    <SafeAssetImage
                      src={inv.attacker.thumbnailUrl}
                      alt=""
                      className="h-5 w-5 shrink-0 object-contain"
                    />
                    {inv.attacker.rewardLabel && (
                      <span className="font-semibold text-foreground">
                        {inv.attacker.rewardLabel}
                      </span>
                    )}
                    {inv.attacker.marketSlug && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-1.5 text-[10px] text-primary"
                        onClick={() =>
                          openTab(
                            { kind: 'market-item', slug: inv.attacker.marketSlug! },
                            { title: inv.attacker.rewardLabel }
                          )
                        }
                      >
                        <span>Prix Plat</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <SafeAssetImage
                      src={inv.defender.thumbnailUrl}
                      alt=""
                      className="h-5 w-5 shrink-0 object-contain"
                    />
                    {inv.defender.rewardLabel && (
                      <span className="font-semibold text-foreground">
                        {inv.defender.rewardLabel}
                      </span>
                    )}
                    {inv.defender.marketSlug && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-1.5 text-[10px] text-primary"
                        onClick={() =>
                          openTab(
                            { kind: 'market-item', slug: inv.defender.marketSlug! },
                            { title: inv.defender.rewardLabel }
                          )
                        }
                      >
                        <span>Prix Plat</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    )}
                    <Badge variant="outline">{inv.defender.faction}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ArbitrationVitusSection arbitration={arbitration} steelPath={steelPath} nowMs={nowMs} />

      {nightwave.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">Ondes Nocturnes — Nightwave ({nightwave.length})</h2>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {nightwave.map((ch) => (
              <Card key={ch.id} className="border-border/70">
                <CardContent className="space-y-1 p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-bold">{ch.title}</span>
                    <Badge variant={ch.isElite ? 'default' : 'secondary'}>
                      +{ch.reputation.toLocaleString('fr-FR')}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{ch.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

