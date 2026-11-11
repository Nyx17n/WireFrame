import * as React from 'react'
import { Award, ChevronDown } from 'lucide-react'
import type { MarketItemDetail, MarketOrder } from '@shared/schemas/market.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusDot } from '@/components/market/StatusDot'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function ItemOrdersTable({
  item,
  orders
}: {
  item: MarketItemDetail
  orders: MarketOrder[]
}): React.JSX.Element {
  const defaultStatus = useAppStore((s) => s.settings.market.defaultSellerStatus)
  const isCompact = useAppStore((s) => s.windowState.isCompactMode)
  const triggerWhisper = useMarketStore((s) => s.triggerWhisper)
  const openTab = useTabsStore((s) => s.openTab)

  const [statusFilter, setStatusFilter] = React.useState<'ingame' | 'online' | 'all'>(defaultStatus)
  const [rankFilter, setRankFilter] = React.useState<'all' | 'min' | 'max'>('all')
  const [compactSide, setCompactSide] = React.useState<'sell' | 'buy'>('sell')
  const [sellLimit, setSellLimit] = React.useState(40)
  const [buyLimit, setBuyLimit] = React.useState(40)

  React.useEffect(() => {
    setSellLimit(40)
    setBuyLimit(40)
  }, [item.id, statusFilter, rankFilter])

  const filterOrder = (o: MarketOrder): boolean => {
    const st = o.user?.status ?? 'offline'
    if (statusFilter === 'ingame' && st !== 'ingame') return false
    if (statusFilter === 'online' && st === 'offline') return false
    if (item.maxRank !== undefined) {
      if (rankFilter === 'min' && (o.rank ?? 0) !== 0) return false
      if (rankFilter === 'max' && o.rank !== item.maxRank) return false
    }
    return true
  }

  const allSellOrders = React.useMemo(
    () => orders.filter((o) => o.type === 'sell' && filterOrder(o)).sort((a, b) => a.platinum - b.platinum),
    [orders, statusFilter, rankFilter, item.maxRank]
  )

  const allBuyOrders = React.useMemo(
    () => orders.filter((o) => o.type === 'buy' && filterOrder(o)).sort((a, b) => b.platinum - a.platinum),
    [orders, statusFilter, rankFilter, item.maxRank]
  )

  const renderOrderList = (
    allList: MarketOrder[],
    limit: number,
    onLoadMore: () => void,
    kind: 'sell' | 'buy'
  ): React.JSX.Element => {
    const visibleList = allList.slice(0, limit)
    const remaining = Math.max(0, allList.length - visibleList.length)
    return (
      <Card>
        <CardHeader className="py-2.5">
          <CardTitle className="flex items-center justify-between text-xs">
            <span>{kind === 'sell' ? 'Vendeurs (Tu achètes)' : 'Acheteurs (Tu vends)'}</span>
            <Badge variant="secondary">{allList.length} offres</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 pt-0">
          {visibleList.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Aucune offre correspondant aux filtres actuels.
            </p>
          ) : (
            <>
              {visibleList.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between gap-2 rounded border border-border bg-background/60 px-2.5 py-1.5 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          o.user &&
                          openTab(
                            { kind: 'market-user', slug: o.user.slug },
                            { title: `Profil : ${o.user.ingameName}` }
                          )
                        }
                        className="truncate font-semibold hover:text-primary hover:underline"
                      >
                        {o.user?.ingameName ?? 'Joueur'}
                      </button>
                      {o.user && <StatusDot status={o.user.status} showLabel={!isCompact} />}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-0.5">
                        <Award className="h-3 w-3" />
                        {o.user?.reputation ?? 0}
                      </span>
                      <span>Qté: {o.quantity}</span>
                      {o.rank !== undefined && <span>Rang {o.rank}</span>}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-sm font-bold text-primary">{o.platinum} p</span>
                    {kind === 'sell' && o.user && (
                      <Button
                        size="sm"
                        onClick={() =>
                          void triggerWhisper({
                            ingameName: o.user?.ingameName ?? '',
                            itemNameEn: item.nameEn,
                            itemNameFr: item.nameFr,
                            platinum: o.platinum,
                            rank: o.rank
                          })
                        }
                      >
                        /w
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {remaining > 0 && (
                <div className="flex justify-center pt-1.5">
                  <Button size="sm" variant="outline" onClick={onLoadMore}>
                    <ChevronDown className="h-3.5 w-3.5 text-primary" />
                    <span>Afficher plus ({remaining} offres restantes)</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {(
            [
              { id: 'ingame', label: 'En jeu' },
              { id: 'online', label: 'En jeu + En ligne' },
              { id: 'all', label: 'Tous' }
            ] as const
          ).map((st) => (
            <Button
              key={st.id}
              size="sm"
              variant={statusFilter === st.id ? 'default' : 'outline'}
              onClick={() => setStatusFilter(st.id)}
            >
              {st.label}
            </Button>
          ))}
        </div>

        {item.maxRank !== undefined && (
          <div className="flex gap-1">
            <Button size="sm" variant={rankFilter === 'all' ? 'default' : 'outline'} onClick={() => setRankFilter('all')}>
              Tous rangs
            </Button>
            <Button size="sm" variant={rankFilter === 'min' ? 'default' : 'outline'} onClick={() => setRankFilter('min')}>
              Rang 0
            </Button>
            <Button size="sm" variant={rankFilter === 'max' ? 'default' : 'outline'} onClick={() => setRankFilter('max')}>
              Rang Max ({item.maxRank})
            </Button>
          </div>
        )}
      </div>

      {isCompact ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1.5">
            <Button
              size="sm"
              variant={compactSide === 'sell' ? 'default' : 'outline'}
              onClick={() => setCompactSide('sell')}
            >
              Vendeurs ({allSellOrders.length})
            </Button>
            <Button
              size="sm"
              variant={compactSide === 'buy' ? 'default' : 'outline'}
              onClick={() => setCompactSide('buy')}
            >
              Acheteurs ({allBuyOrders.length})
            </Button>
          </div>
          {compactSide === 'sell'
            ? renderOrderList(allSellOrders, sellLimit, () => setSellLimit((n) => n + 40), 'sell')
            : renderOrderList(allBuyOrders, buyLimit, () => setBuyLimit((n) => n + 40), 'buy')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {renderOrderList(allSellOrders, sellLimit, () => setSellLimit((n) => n + 40), 'sell')}
          {renderOrderList(allBuyOrders, buyLimit, () => setBuyLimit((n) => n + 40), 'buy')}
        </div>
      )}
    </div>
  )
}

