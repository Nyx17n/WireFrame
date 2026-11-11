import * as React from 'react'
import { Compass, Flame, History, Plus, Search, Star, TrendingUp } from 'lucide-react'
import { toWfAssetUrl, type MarketOrder } from '@shared/schemas/market.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusDot } from '@/components/market/StatusDot'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

const FEATURED_SLUGS = [
  'glaive_prime_set',
  'wisp_prime_set',
  'gauss_prime_set',
  'torid_incarnon_genesis',
  'arcane_energize',
  'galvanized_chamber',
  'nikana_prime_set',
  'revenant_prime_set'
] as const

export function MarketHomeView(): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const favorites = useAppStore((s) => s.settings.favorites)
  const catalog = useMarketStore((s) => s.catalog)
  const isCatalogLoading = useMarketStore((s) => s.isCatalogLoading)
  const ensureCatalogLoaded = useMarketStore((s) => s.ensureCatalogLoaded)
  const triggerWhisper = useMarketStore((s) => s.triggerWhisper)

  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)
  const refreshRevision = useTabsStore((s) => s.refreshRevision)

  const [searchText, setSearchText] = React.useState('')
  const [recentOrders, setRecentOrders] = React.useState<MarketOrder[]>([])
  const [loadingRecent, setLoadingRecent] = React.useState(true)

  React.useEffect(() => {
    void ensureCatalogLoaded()
  }, [ensureCatalogLoaded])

  React.useEffect(() => {
    let cancelled = false
    setLoadingRecent(true)
    void ipcClient.market
      .getRecentOrders(refreshRevision > 0)
      .then((orders) => {
        if (!cancelled) {
          setRecentOrders(orders.filter((o) => o.type === 'sell' && o.itemSlug).slice(0, 8))
          setLoadingRecent(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingRecent(false)
      })
    return () => {
      cancelled = true
    }
  }, [refreshRevision])

  const featuredItems = React.useMemo(() => {
    const bySlug = new Map(catalog.map((i) => [i.slug, i]))
    return FEATURED_SLUGS.map((slug) => bySlug.get(slug)).filter((x) => x !== undefined)
  }, [catalog])

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <Card className="border-primary/30 bg-gradient-to-r from-primary/15 via-card to-card">
        <CardContent className="space-y-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-base font-bold">Warframe Market — Trading Multi-Onglets</h1>
              <p className="text-xs text-muted-foreground">
                Compare plusieurs items en parallèle, vérifie l’écart Set vs Pièces et copie tes `/w` en 1 clic.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="secondary" onClick={() => navigateActive({ kind: 'market-catalog' })}>
                <Compass className="h-3.5 w-3.5 text-primary" />
                <span>Catalogue ({catalog.length || '...'})</span>
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigateActive({ kind: 'market-favorites' })}>
                <Star className="h-3.5 w-3.5 text-primary" />
                <span>Favoris ({favorites.length})</span>
              </Button>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              navigateActive({ kind: 'market-catalog', query: searchText.trim() })
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-primary" />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Rechercher en FR ou EN parmi tous les Sets Prime, Mods, Arcanes, Reliques..."
                className="h-9 pl-9"
              />
            </div>
            <Button type="submit" className="h-9 px-4">
              Rechercher
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Items Populaires & Sets Prime</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCatalogLoading && featuredItems.length === 0 ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <Skeleton key={idx} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredItems.map((item) => {
                const name = lang === 'fr' ? item.nameFr : item.nameEn
                const thumbUrl = toWfAssetUrl(item.thumb)
                return (
                  <div
                    key={item.id}
                    onClick={() => navigateActive({ kind: 'market-item', slug: item.slug }, name)}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-background/60 p-2.5 text-xs transition-colors hover:border-primary/50 hover:bg-secondary/60"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {thumbUrl ? (
                        <img src={thumbUrl} alt="" className="h-8 w-8 shrink-0 object-contain" />
                      ) : (
                        <Flame className="h-5 w-5 shrink-0 text-primary" />
                      )}
                      <span className="truncate font-semibold">{name}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Ouvrir dans un nouvel onglet"
                      onClick={(e) => {
                        e.stopPropagation()
                        openTab({ kind: 'market-item', slug: item.slug }, { title: name })
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4 text-primary" />
            <span>Dernières Offres de Vente en Direct</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigateActive({ kind: 'market-recent' })}>
            Tout voir →
          </Button>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {recentOrders.map((o) => {
                const itemName = lang === 'fr' ? (o.itemNameFr ?? o.itemSlug ?? 'Item') : (o.itemNameEn ?? o.itemSlug ?? 'Item')
                const thumbUrl = toWfAssetUrl(o.itemThumb)
                return (
                  <div
                    key={o.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-background/50 px-3 py-2 text-xs"
                  >
                    <div
                      onClick={() =>
                        o.itemSlug && navigateActive({ kind: 'market-item', slug: o.itemSlug }, itemName)
                      }
                      className="flex min-w-0 cursor-pointer items-center gap-2 hover:text-primary"
                    >
                      {thumbUrl && <img src={thumbUrl} alt="" className="h-7 w-7 shrink-0 object-contain" />}
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{itemName}</div>
                        {o.user && <StatusDot status={o.user.status} />}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="default">{o.platinum} p</Badge>
                      {o.user && o.itemNameEn && o.itemNameFr && (
                        <Button
                          size="sm"
                          onClick={() =>
                            void triggerWhisper({
                              ingameName: o.user?.ingameName ?? '',
                              itemNameEn: o.itemNameEn ?? itemName,
                              itemNameFr: o.itemNameFr ?? itemName,
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
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

