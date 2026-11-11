import * as React from 'react'
import {
  AlertTriangle,
  BarChart3,
  Check,
  Crosshair,
  ExternalLink,
  ListOrdered,
  RefreshCw,
  ShoppingCart,
  Star
} from 'lucide-react'
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
  const cart = useAppStore((s) => s.settings.cart)
  const toggleFavorite = useMarketStore((s) => s.toggleFavorite)
  const toggleCartItem = useMarketStore((s) => s.toggleCartItem)
  const addPriceAlert = useMarketStore((s) => s.addPriceAlert)
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const refreshRevision = useTabsStore((s) => s.refreshRevision)

  const [detail, setDetail] = React.useState<MarketItemDetail | null>(null)
  const [orders, setOrders] = React.useState<MarketOrder[]>([])
  const [setAnalysis, setSetAnalysis] = React.useState<SetVsPartsAnalysis | null>(null)
  const [isSetLoading, setIsSetLoading] = React.useState(false)
  const [stats, setStats] = React.useState<MarketItemStats | null>(null)
  const [isStatsLoading, setIsStatsLoading] = React.useState(false)
  const [subTab, setSubTab] = React.useState<'orders' | 'stats'>('orders')
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const lastRefreshRef = React.useRef(refreshRevision)
  const requestIdRef = React.useRef(0)

  const loadData = React.useCallback(
    async (force = false) => {
      const reqId = ++requestIdRef.current
      setIsLoading(true)
      setIsSetLoading(false)
      setError(null)
      setSetAnalysis(null)
      setStats(null)
      try {
        // 1. Priorité absolue : fiche + ordres de l'item (2 requêtes -> immédiat sous la limite 3 req/s)
        const [d, ord] = await Promise.all([
          ipcClient.market.getItemDetail(slug),
          ipcClient.market.getItemOrders(slug, force)
        ])
        if (reqId !== requestIdRef.current) return
        setDetail(d)
        setOrders(ord)
        setIsLoading(false)

        // 2. Arrière-plan non bloquant : comparateur Set vs Pièces uniquement si l'item appartient à un set
        if (d.setItems.length > 1) {
          setIsSetLoading(true)
          void ipcClient.market
            .analyzeSetVsParts(slug, force)
            .then((analysis) => {
              if (reqId === requestIdRef.current) setSetAnalysis(analysis)
            })
            .catch(() => {
              if (reqId === requestIdRef.current) setSetAnalysis(null)
            })
            .finally(() => {
              if (reqId === requestIdRef.current) setIsSetLoading(false)
            })
        }
      } catch (err) {
        if (reqId !== requestIdRef.current) return
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la fiche item')
        setIsLoading(false)
      }
    },
    [slug]
  )

  // Charge la fiche au changement de slug (avec cache rapide)
  React.useEffect(() => {
    setSubTab('orders')
    void loadData(false)
  }, [loadData])

  // Force le rafraîchissement uniquement sur action explicite Actualiser (Ctrl+R / F5)
  React.useEffect(() => {
    if (refreshRevision !== lastRefreshRef.current) {
      lastRefreshRef.current = refreshRevision
      void loadData(true)
    }
  }, [loadData, refreshRevision])

  // 3. Lazy-loading : charge les statistiques 48h/90j uniquement à l'ouverture de l'onglet Stats
  React.useEffect(() => {
    if (subTab !== 'stats' || stats !== null || isStatsLoading) return
    let cancelled = false
    setIsStatsLoading(true)
    void ipcClient.market
      .getItemStats(slug)
      .then((st) => {
        if (!cancelled) setStats(st)
      })
      .catch(() => {
        if (!cancelled) setStats({ hours48: [], days90: [] })
      })
      .finally(() => {
        if (!cancelled) setIsStatsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [subTab, slug, stats, isStatsLoading])

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
  const inCart = cart.some((c) => c.slug === detail.slug)

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
              variant={inCart ? 'default' : 'outline'}
              onClick={() => void toggleCartItem({ slug: detail.slug, quantity: 1 })}
              title={inCart ? 'Retirer du panier' : 'Ajouter au panier'}
            >
              {inCart ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <ShoppingCart className="h-3.5 w-3.5 text-primary" />
              )}
              <span>Panier</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const cheapest =
                  orders
                    .filter((o) => o.type === 'sell' && o.user?.status === 'ingame')
                    .sort((a, b) => a.platinum - b.platinum)[0]?.platinum ?? 50
                void addPriceAlert({
                  slug: detail.slug,
                  nameFr: detail.nameFr,
                  nameEn: detail.nameEn,
                  thumb: detail.thumb,
                  maxPlatinum: Math.max(1, cheapest - 5)
                }).then(() => navigateActive({ kind: 'alerts' }))
              }}
              title="Créer une surveillance Price Sniper sur cet item"
            >
              <Crosshair className="h-3.5 w-3.5 text-primary" />
              <span>Sniper</span>
            </Button>

            <Button
              size="sm"
              variant={isFav ? 'default' : 'outline'}
              onClick={() => void toggleFavorite(detail.slug)}
              title="Raccourci Ctrl+D"
            >
              <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
              <span>{isFav ? 'Favori' : 'Favori'}</span>
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

      {isSetLoading && !setAnalysis && (
        <div className="flex items-center gap-2 rounded-md border border-border/60 bg-card/50 px-3 py-2 text-xs text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
          <span>Calcul comparatif Set Complet vs Pièces détachées en arrière-plan...</span>
        </div>
      )}
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
      ) : isStatsLoading || !stats ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <ItemStatsChart stats={stats} />
      )}
    </div>
  )
}

