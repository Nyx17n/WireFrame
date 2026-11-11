import * as React from 'react'
import type { MarketItemStats } from '@shared/schemas/market.schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ItemStatsChart({ stats }: { stats: MarketItemStats }): React.JSX.Element {
  const [range, setRange] = React.useState<'48h' | '90d'>('48h')
  const points = range === '48h' ? stats.hours48 : stats.days90

  const summary = React.useMemo(() => {
    if (points.length === 0) return null
    let totalVol = 0
    let weightedSum = 0
    let minP = Number.POSITIVE_INFINITY
    let maxP = 0
    for (const pt of points) {
      totalVol += pt.volume
      weightedSum += pt.median * pt.volume
      if (pt.minPrice < minP) minP = pt.minPrice
      if (pt.maxPrice > maxP) maxP = pt.maxPrice
    }
    const last = points[points.length - 1]
    return {
      latestMedian: last?.median ?? 0,
      avgWeighted: totalVol > 0 ? Math.round((weightedSum / totalVol) * 10) / 10 : 0,
      minPrice: Number.isFinite(minP) ? minP : 0,
      maxPrice: maxP,
      totalVolume: totalVol
    }
  }, [points])

  const svgPath = React.useMemo(() => {
    if (points.length < 2) return ''
    const w = 640
    const h = 160
    const pad = 14
    const medians = points.map((p) => p.median)
    const minVal = Math.min(...medians)
    const maxVal = Math.max(...medians)
    const span = Math.max(1, maxVal - minVal)

    return points
      .map((pt, idx) => {
        const x = pad + (idx / (points.length - 1)) * (w - pad * 2)
        const y = h - pad - ((pt.median - minVal) / span) * (h - pad * 2)
        return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }, [points])

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm">Historique des Ventes Réelles</CardTitle>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={range === '48h' ? 'default' : 'outline'}
            onClick={() => setRange('48h')}
          >
            48 dernières heures
          </Button>
          <Button
            size="sm"
            variant={range === '90d' ? 'default' : 'outline'}
            onClick={() => setRange('90d')}
          >
            90 derniers jours
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!summary || points.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Pas assez de ventes clôturées sur cette période.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div className="rounded-md border border-border bg-background/60 p-2.5 text-xs">
                <div className="text-muted-foreground">Dernier Médian</div>
                <div className="text-base font-bold text-primary">{summary.latestMedian} p</div>
              </div>
              <div className="rounded-md border border-border bg-background/60 p-2.5 text-xs">
                <div className="text-muted-foreground">Moyenne Pondérée</div>
                <div className="text-base font-bold">{summary.avgWeighted} p</div>
              </div>
              <div className="rounded-md border border-border bg-background/60 p-2.5 text-xs">
                <div className="text-muted-foreground">Fourchette Min – Max</div>
                <div className="text-base font-bold">
                  {summary.minPrice} – {summary.maxPrice} p
                </div>
              </div>
              <div className="rounded-md border border-border bg-background/60 p-2.5 text-xs">
                <div className="text-muted-foreground">Volume Échangé</div>
                <div className="text-base font-bold">{summary.totalVolume} unités</div>
              </div>
            </div>

            <div className="rounded-md border border-border bg-background/50 p-3">
              <svg viewBox="0 0 640 160" className="h-40 w-full overflow-visible">
                <path
                  d={svgPath}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

