import * as React from 'react'
import { BarChart3, Flame, RefreshCw, Zap } from 'lucide-react'
import type { MarketOrder } from '@shared/schemas/market.schema'
import { Button } from '@/components/ui/button'
import { ipcClient } from '@/services/ipc-client'

interface WfmPriceHelperPanelProps {
  slug: string
  orderType: 'sell' | 'buy'
  rank?: number
  subtype?: string
  onSelectPrice: (platinum: number) => void
}

export function WfmPriceHelperPanel({
  slug,
  orderType,
  rank,
  subtype,
  onSelectPrice
}: WfmPriceHelperPanelProps): React.JSX.Element {
  const [orders, setOrders] = React.useState<MarketOrder[]>([])
  const [avg48h, setAvg48h] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      ipcClient.market.getItemOrders(slug, false),
      ipcClient.market.getItemStats(slug).catch(() => ({ hours48: [], days90: [] }))
    ])
      .then(([ordList, st]) => {
        if (cancelled) return
        setOrders(ordList)
        const pts = st.hours48
        if (pts.length > 0) {
          const totalVol = pts.reduce((a, p) => a + Math.max(1, p.volume), 0)
          const weighted = pts.reduce((a, p) => a + p.median * Math.max(1, p.volume), 0)
          setAvg48h(Math.max(1, Math.round(weighted / totalVol)))
        } else {
          setAvg48h(null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOrders([])
          setAvg48h(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  const matchingIngamePrices = React.useMemo(() => {
    const filtered = orders.filter((o) => {
      if (o.type !== orderType) return false
      if (o.user?.status !== 'ingame') return false
      if (rank !== undefined && o.rank !== undefined && o.rank !== rank) return false
      if (subtype && o.subtype && o.subtype !== subtype) return false
      return o.platinum > 0
    })
    const sorted = filtered
      .map((o) => Math.round(o.platinum))
      .sort((a, b) => (orderType === 'sell' ? a - b : b - a))
    return sorted.slice(0, 5)
  }, [orders, orderType, rank, subtype])

  const bestIngame = matchingIngamePrices[0] ?? null
  const fastPrice =
    bestIngame !== null
      ? orderType === 'sell'
        ? Math.max(1, bestIngame - 1)
        : bestIngame + 1
      : null

  return (
    <div className="space-y-2 rounded-md border border-cyan-500/35 bg-cyan-500/10 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-cyan-300">
          📊 Aide au Prix en Direct ({orderType === 'sell' ? 'Vendeurs 🟢 En jeu' : 'Acheteurs 🟢 En jeu'}
          {rank !== undefined ? ` · Rang ${rank}` : ''}
          {subtype ? ` · ${subtype}` : ''})
        </span>
        {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-300" />}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span>
          {orderType === 'sell' ? 'Plus bas 🟢 :' : 'Plus haut 🟢 :'}{' '}
          <strong className="font-mono text-foreground">
            {bestIngame !== null ? `${bestIngame}p` : '—'}
          </strong>
        </span>
        <span className="text-muted-foreground">
          Top 5 🟢 :{' '}
          <span className="font-mono text-foreground">
            {matchingIngamePrices.length > 0
              ? matchingIngamePrices.map((p) => `${p}p`).join(' · ')
              : 'Aucune offre en jeu'}
          </span>
        </span>
        <span>
          Médiane 48h :{' '}
          <strong className="font-mono text-foreground">
            {avg48h !== null ? `${avg48h}p` : '—'}
          </strong>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {bestIngame !== null && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-7 gap-1 text-[11px]"
            onClick={() => onSelectPrice(bestIngame)}
          >
            <Zap className="h-3 w-3 text-primary" />
            <span>S’aligner ({bestIngame}p)</span>
          </Button>
        )}
        {fastPrice !== null && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-7 gap-1 text-[11px]"
            onClick={() => onSelectPrice(fastPrice)}
          >
            <Flame className="h-3 w-3 text-emerald-400" />
            <span>
              {orderType === 'sell' ? `Vente rapide -1p (${fastPrice}p)` : `Surenchérir +1p (${fastPrice}p)`}
            </span>
          </Button>
        )}
        {avg48h !== null && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-[11px]"
            onClick={() => onSelectPrice(avg48h)}
          >
            <BarChart3 className="h-3 w-3" />
            <span>Médiane 48h ({avg48h}p)</span>
          </Button>
        )}
      </div>
    </div>
  )
}

