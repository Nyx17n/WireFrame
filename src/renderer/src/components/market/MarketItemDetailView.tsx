import * as React from 'react'
import { AlertTriangle, BarChart3, ExternalLink, ListOrdered, RefreshCw, Star } from 'lucide-react'
import {
  toWfAssetUrl,
  type MarketItemDetail,
  type MarketItemStats,
  type MarketOrder,
  type SetVsPartsAnalysis
} from '@shared/schemas/market.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ItemOrdersTable } from '@/components/market/ItemOrdersTable'
import { ItemStatsChart } from '@/components/market/ItemStatsChart'
import { SetVsPartsBanner } from '@/components/market/SetVsPartsBanner'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function MarketItemDetailView({ slug }: { slug: string }): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const favorites = useAppStore((s) => s.settings.favorites)
  const toggleFavorite = useMarketStore((s) => s.toggleFavorite)
  const refreshRevision = useTabsStore((s) => s.refreshRevision)

  const [detail, setDetail] = React.useState<MarketItemDetail | null>(null)
  const [orders, setOrders] = React.useState<MarketOrder[]>([])
  const [setAnalysis, setSetAnalysis] = React.useState<SetVsPartsAnalysis | null>(null)
  const [stats, setStats] = React.useState<MarketItemStats | null>(null)
  const [subTab, setSubTab] = React.useState<'orders' | 'stats'>('orders')
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(
    async (force = false) => {
      setIsLoading(true)
      setError(null)
      try {
        const [d, ord, analysis, st] = await Promise.all([
          ipcClient.market.getItemDetail(slug),
          ipcClient.market.getItemOrders(slug, force),
          ipcClient.market.analyzeSetVsParts(slug, force),
          ipcClient.market.getItemStats(slug).catch(() => ({ hours48: [], days90: [] }))
        ])
        setDetail(d)
        setOrders(ord)
        setSetAnalysis(analysis)
        setStats(st)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la fiche item')
      } finally {
        setIsLoading(false)
      }
    },
    [slug]
  )

  React.useEffect(() => {
    void loadData(refreshRevision > 0)
  }, [loadData, refreshRevision])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-xs text-muted-foreground">{error ?? 'Item introuvable'}</p>
        <Button onClick={() => void loadData(true)}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Réessayer</span>
        </Button>
      </div>
    )
  }

  const primaryName = lang === 'fr' ? detail.nameFr : detail.nameEn
  const secondaryName = lang === 'fr' ? detail.nameEn : detail.nameFr
  const desc = lang === 'fr' ? detail.descriptionFr : detail.descriptionEn
  const iconUrl = toWfAssetUrl(detail.icon ?? detail.thumb)
  const isFav = favorites.includes(detail.slug)

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <Card>
        <CardContent className="flex flex-wrap items-start justify-between gap-4 p-4">
          <div className="flex min-w-0 flex-1 items-start gap-3.5">
            {iconUrl && (
              <img
                src={iconUrl}
                alt={primaryName}
                className="h-16 w-16 shrink-0 rounded-md border border-border bg-background/70 object-contain p-1.5"
              />
            )}
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-bold">{primaryName}</h1>
                {secondaryName !== primaryName && (
                  <span className="text-xs text-muted-foreground">({secondaryName})</span>
                )}
              </div>
              {desc && <p className="line-clamp-2 text-xs text-muted-foreground">{desc}</p>}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {detail.ducats !== undefined && detail.ducats > 0 && (
                  <Badge variant="default">{detail.ducats} Ducats</Badge>
                )}
                {detail.tradingTax !== undefined && detail.tradingTax > 0 && (
                  <Badge variant="secondary">
                    Taxe : {detail.tradingTax.toLocaleString('fr-FR')} Crédits
                  </Badge>
                )}
                {detail.reqMasteryRank !== undefined && detail.reqMasteryRank > 0 && (
                  <Badge variant="outline">Palier {detail.reqMasteryRank}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            <Button
              size="sm"
              variant={isFav ? 'default' : 'outline'}
              onClick={() => void toggleFavorite(detail.slug)}
              title="Raccourci Ctrl+D"
            >
              <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
              <span>{isFav ? 'Favori' : 'Ajouter Favori'}</span>
            </Button>

            {detail.wikiLink && detail.wikiLink.startsWith('https://wiki.warframe.com') && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => void ipcClient.window.openExternalUrl(detail.wikiLink ?? '')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Wiki Officiel</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {setAnalysis && <SetVsPartsBanner analysis={setAnalysis} />}

      <div className="flex items-center gap-1.5 border-b border-border pb-2">
        <Button
          size="sm"
          variant={subTab === 'orders' ? 'default' : 'ghost'}
          onClick={() => setSubTab('orders')}
        >
          <ListOrdered className="h-3.5 w-3.5" />
          <span>Ordres en Direct ({orders.length})</span>
        </Button>
        <Button
          size="sm"
          variant={subTab === 'stats' ? 'default' : 'ghost'}
          onClick={() => setSubTab('stats')}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Statistiques 48h & 90j</span>
        </Button>
      </div>

      {subTab === 'orders' ? (
        <ItemOrdersTable item={detail} orders={orders} />
      ) : (
        stats && <ItemStatsChart stats={stats} />
      )}
    </div>
  )
}

