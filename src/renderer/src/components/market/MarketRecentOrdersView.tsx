import * as React from 'react'
import { AlertTriangle, History, RefreshCw } from 'lucide-react'
import { toWfAssetUrl, type MarketOrder } from '@shared/schemas/market.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusDot } from '@/components/market/StatusDot'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function MarketRecentOrdersView(): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const triggerWhisper = useMarketStore((s) => s.triggerWhisper)
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)
  const refreshRevision = useTabsStore((s) => s.refreshRevision)

  const [orders, setOrders] = React.useState<MarketOrder[]>([])
  const [typeFilter, setTypeFilter] = React.useState<'sell' | 'buy'>('sell')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadRecent = React.useCallback(async (force = false) => {
    setLoading(true)
    setError(null)
    try {
      const data = await ipcClient.market.getRecentOrders(force)
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec lecture des ordres récents')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadRecent(refreshRevision > 0)
  }, [loadRecent, refreshRevision])

  const filtered = orders.filter((o) => o.type === typeFilter && o.itemSlug)

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-bold">Ordres Récents en Direct</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant={typeFilter === 'sell' ? 'default' : 'outline'} onClick={() => setTypeFilter('sell')}>
            Offres de Vente
          </Button>
          <Button size="sm" variant={typeFilter === 'buy' ? 'default' : 'outline'} onClick={() => setTypeFilter('buy')}>
            Offres d’Achat
          </Button>
          <Button size="sm" variant="ghost" onClick={() => void loadRecent(true)}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-2 p-8 text-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {filtered.map((o) => {
            const name = lang === 'fr' ? (o.itemNameFr ?? o.itemSlug ?? 'Item') : (o.itemNameEn ?? o.itemSlug ?? 'Item')
            const thumb = toWfAssetUrl(o.itemThumb)
            return (
              <Card key={o.id}>
                <CardContent className="flex items-center justify-between gap-2 p-2.5 text-xs">
                  <div className="flex min-w-0 items-center gap-2.5">
                    {thumb && <img src={thumb} alt="" className="h-8 w-8 shrink-0 object-contain" />}
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => o.itemSlug && navigateActive({ kind: 'market-item', slug: o.itemSlug }, name)}
                        className="truncate font-semibold hover:text-primary hover:underline"
                      >
                        {name}
                      </button>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        {o.user && (
                          <button
                            type="button"
                            onClick={() =>
                              o.user &&
                              openTab({ kind: 'market-user', slug: o.user.slug }, { title: `Profil : ${o.user.ingameName}` })
                            }
                            className="hover:text-foreground hover:underline"
                          >
                            {o.user.ingameName}
                          </button>
                        )}
                        {o.user && <StatusDot status={o.user.status} />}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge variant="default">{o.platinum} p</Badge>
                    {typeFilter === 'sell' && o.user && (
                      <Button
                        size="sm"
                        onClick={() =>
                          void triggerWhisper({
                            ingameName: o.user?.ingameName ?? '',
                            itemNameEn: o.itemNameEn ?? name,
                            itemNameFr: o.itemNameFr ?? name,
                            platinum: o.platinum,
                            rank: o.rank
                          })
                        }
                      >
                        /w
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

