import * as React from 'react'
import { ChevronDown, Clock, Compass, RefreshCw, Search, Star, TrendingUp } from 'lucide-react'
import type { MarketOrder } from '@shared/schemas/market.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ViewModeToggle } from '@/components/ui/view-mode-toggle'
import { MarketCatalogItemsDisplay } from '@/components/market/MarketCatalogItemsDisplay'
import { RecentOrdersDisplay } from '@/components/market/RecentOrdersDisplay'
import { useCatalogDisplayPreferences } from '@/lib/catalog-layout'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { normalizeSearchText, useMarketStore } from '@/stores/useMarketStore'
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

const RECENT_STEP = 36

export function MarketHomeView(): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const favorites = useAppStore((s) => s.settings.favorites)
  const { layoutMode, cardSize, setLayoutMode, setCardSize } = useCatalogDisplayPreferences()

  const catalog = useMarketStore((s) => s.catalog)
  const isCatalogLoading = useMarketStore((s) => s.isCatalogLoading)
  const ensureCatalogLoaded = useMarketStore((s) => s.ensureCatalogLoaded)
  const toggleFavorite = useMarketStore((s) => s.toggleFavorite)
  const triggerWhisper = useMarketStore((s) => s.triggerWhisper)

  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)
  const refreshRevision = useTabsStore((s) => s.refreshRevision)

  const [searchText, setSearchText] = React.useState('')
  const [recentFilterText, setRecentFilterText] = React.useState('')
  const [recentType, setRecentType] = React.useState<'all' | 'sell' | 'buy'>('sell')
  const [recentOrders, setRecentOrders] = React.useState<MarketOrder[]>([])
  const [visibleRecent, setVisibleRecent] = React.useState(RECENT_STEP)
  const [loadingRecent, setLoadingRecent] = React.useState(true)

  React.useEffect(() => {
    void ensureCatalogLoaded()
  }, [ensureCatalogLoaded])

  const loadRecentListings = React.useCallback(async (force = false) => {
    setLoadingRecent(true)
    try {
      const orders = await ipcClient.market.getRecentOrders(force)
      setRecentOrders(orders.filter((o) => Boolean(o.itemSlug)))
    } catch {
      // Keep previous list if transient network error
    } finally {
      setLoadingRecent(false)
    }
  }, [])

  React.useEffect(() => {
    void loadRecentListings(refreshRevision > 0)
  }, [loadRecentListings, refreshRevision])

  const featuredItems = React.useMemo(() => {
    const bySlug = new Map(catalog.map((i) => [i.slug, i]))
    return FEATURED_SLUGS.map((slug) => bySlug.get(slug)).filter((x) => x !== undefined)
  }, [catalog])

  const filteredRecent = React.useMemo(() => {
    const q = normalizeSearchText(recentFilterText)
    return recentOrders.filter((o) => {
      if (recentType !== 'all' && o.type !== recentType) return false
      if (!q) return true
      return (
        normalizeSearchText(o.itemNameFr ?? '').includes(q) ||
        normalizeSearchText(o.itemNameEn ?? '').includes(q) ||
        normalizeSearchText(o.user?.ingameName ?? '').includes(q)
      )
    })
  }, [recentOrders, recentType, recentFilterText])

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <Card className="border-primary/30 bg-gradient-to-r from-primary/15 via-card to-card">
        <CardContent className="space-y-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-base font-bold">Warframe Market — Trading Multi-Onglets</h1>
              <p className="text-xs text-muted-foreground">
                Compare les prix Min / Moy / Max, parcours les annonces en direct et copie tes `/w` en 1 clic.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigateActive({ kind: 'market-catalog' })}
              >
                <Compass className="h-3.5 w-3.5 text-primary" />
                <span>Catalogue ({catalog.length || '...'})</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateActive({ kind: 'market-favorites' })}
              >
                <Star className="h-3.5 w-3.5 text-primary" />
                <span>Favoris ({favorites.length})</span>
              </Button>
              <ViewModeToggle
                value={layoutMode}
                onChange={setLayoutMode}
                size={cardSize}
                onSizeChange={setCardSize}
              />
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

      <div className="space-y-2">
        <div className="flex items-center gap-2 px-0.5">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold">Items Populaires & Sets Prime</h2>
        </div>

        <MarketCatalogItemsDisplay
          items={featuredItems}
          isLoading={isCatalogLoading && featuredItems.length === 0}
          lang={lang}
          favorites={favorites}
          layoutMode={layoutMode}
          cardSize={cardSize}
          query=""
          onSelectItem={(slug, title) => navigateActive({ kind: 'market-item', slug }, title)}
          onOpenNewTab={(slug, title, background) =>
            openTab({ kind: 'market-item', slug }, { title, background })
          }
          onToggleFavorite={(slug) => void toggleFavorite(slug)}
        />
      </div>

      <Card>
        <CardHeader className="space-y-2.5 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>Toutes les Annonces les Plus Récentes</span>
              <Badge variant="secondary" className="font-mono text-[11px]">
                {filteredRecent.length}
              </Badge>
            </CardTitle>

            <div className="flex flex-wrap items-center gap-1.5">
              {(['sell', 'buy', 'all'] as const).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={recentType === t ? 'default' : 'outline'}
                  onClick={() => {
                    setRecentType(t)
                    setVisibleRecent(RECENT_STEP)
                  }}
                >
                  {t === 'sell' ? 'Ventes' : t === 'buy' ? 'Achats' : 'Toutes'}
                </Button>
              ))}
              <Button
                size="sm"
                variant="outline"
                disabled={loadingRecent}
                onClick={() => void loadRecentListings(true)}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingRecent ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={recentFilterText}
              onChange={(e) => {
                setRecentFilterText(e.target.value)
                setVisibleRecent(RECENT_STEP)
              }}
              placeholder="Filtrer les annonces récentes par item ou pseudo vendeur..."
              className="h-8 pl-8 text-xs"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <RecentOrdersDisplay
            orders={filteredRecent.slice(0, visibleRecent)}
            isLoading={loadingRecent && recentOrders.length === 0}
            lang={lang}
            layoutMode={layoutMode}
            cardSize={cardSize}
            onSelectItem={(slug, title) => navigateActive({ kind: 'market-item', slug }, title)}
            onOpenItemNewTab={(slug, title) =>
              openTab({ kind: 'market-item', slug }, { title })
            }
            onOpenUser={(userSlug, ingameName) =>
              openTab(
                { kind: 'market-user', slug: userSlug },
                { title: `Profil : ${ingameName}` }
              )
            }
            onWhisper={(draft) => void triggerWhisper(draft)}
          />

          {filteredRecent.length > 0 && (
            <div className="flex flex-col items-center gap-2 pt-2 text-xs text-muted-foreground">
              <span>
                {Math.min(visibleRecent, filteredRecent.length)} sur {filteredRecent.length} annonces récentes affichées
              </span>
              {filteredRecent.length > visibleRecent && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setVisibleRecent((prev) => prev + RECENT_STEP)}
                >
                  <ChevronDown className="h-3.5 w-3.5 text-primary" />
                  <span>
                    Afficher plus ({filteredRecent.length - visibleRecent} restantes)
                  </span>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
