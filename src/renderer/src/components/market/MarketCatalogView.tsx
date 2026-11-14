import * as React from 'react'
import { AlertTriangle, ChevronDown, Compass, RefreshCw, Zap } from 'lucide-react'
import {
  createMarketChipId,
  doesCatalogItemMatchChips,
  hasOrderLevelChips,
  type MarketFacetedSearchResult,
  type MarketFilterChip
} from '@shared/schemas/market-search.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ViewModeToggle } from '@/components/ui/view-mode-toggle'
import { MarketCatalogItemsDisplay } from '@/components/market/MarketCatalogItemsDisplay'
import { MarketFacetedResultsSection } from '@/components/market/MarketFacetedResultsSection'
import { MarketTokenFilterBar } from '@/components/market/MarketTokenFilterBar'
import { useCatalogDisplayPreferences } from '@/lib/catalog-layout'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

const CATEGORY_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'set', label: 'Sets Prime' },
  { id: 'warframe', label: 'Warframes' },
  { id: 'weapon', label: 'Armes' },
  { id: 'mod', label: 'Mods' },
  { id: 'arcane_enhancement', label: 'Arcanes' },
  { id: 'relic', label: 'Reliques' }
] as const

function buildInitialChips(
  initialQuery: string,
  initialChips?: readonly MarketFilterChip[]
): MarketFilterChip[] {
  if (initialChips && initialChips.length > 0) return [...initialChips]
  const q = initialQuery.trim()
  if (!q) return []
  return [{ id: createMarketChipId('item', q), kind: 'item', value: q, label: q }]
}

export function MarketCatalogView({
  initialQuery = '',
  initialChips
}: {
  initialQuery?: string
  initialChips?: readonly MarketFilterChip[]
}): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const isCompact = useAppStore((s) => s.windowState.isCompactMode)
  const favorites = useAppStore((s) => s.settings.favorites)
  const { layoutMode, cardSize, setLayoutMode, setCardSize } = useCatalogDisplayPreferences()

  const catalog = useMarketStore((s) => s.catalog)
  const isCatalogLoading = useMarketStore((s) => s.isCatalogLoading)
  const catalogError = useMarketStore((s) => s.catalogError)
  const ensureCatalogLoaded = useMarketStore((s) => s.ensureCatalogLoaded)
  const toggleFavorite = useMarketStore((s) => s.toggleFavorite)

  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)
  const refreshRevision = useTabsStore((s) => s.refreshRevision)

  const [chips, setChips] = React.useState<MarketFilterChip[]>(() =>
    buildInitialChips(initialQuery, initialChips)
  )
  const [liveOrdersToggle, setLiveOrdersToggle] = React.useState(false)
  const [visibleLimit, setVisibleLimit] = React.useState(60)
  const [facetedResult, setFacetedResult] = React.useState<MarketFacetedSearchResult | null>(null)
  const [loadingOrders, setLoadingOrders] = React.useState(false)
  const [ordersError, setOrdersError] = React.useState<string | null>(null)
  const [knownSellers, setKnownSellers] = React.useState<{ ingameName: string; slug: string }[]>([])

  React.useEffect(() => {
    void ensureCatalogLoaded()
    void ipcClient.market
      .getRecentOrders(false)
      .then((orders) => {
        setKnownSellers(
          orders
            .map((o) => o.user)
            .filter((u): u is NonNullable<typeof u> => Boolean(u))
            .map((u) => ({ ingameName: u.ingameName, slug: u.slug }))
        )
      })
      .catch(() => undefined)
  }, [ensureCatalogLoaded])

  const isOrdersMode = hasOrderLevelChips(chips) || liveOrdersToggle
  const activeCategory = chips.find((c) => c.kind === 'category')?.value ?? 'all'
  const activeIngameOnly = chips.some((c) => c.kind === 'status' && c.value === 'ingame')

  const addOrReplaceChip = React.useCallback((nextChip: MarketFilterChip) => {
    setChips((prev) => {
      if (nextChip.kind === 'category' || nextChip.kind === 'maxPrice' || nextChip.kind === 'status' || nextChip.kind === 'orderType') {
        return [...prev.filter((c) => c.kind !== nextChip.kind), nextChip]
      }
      if (prev.some((c) => c.id === nextChip.id)) return prev
      return [...prev, nextChip].slice(0, 20)
    })
    setVisibleLimit(60)
  }, [])

  const removeChip = React.useCallback((chipId: string) => {
    setChips((prev) => prev.filter((c) => c.id !== chipId))
    setVisibleLimit(60)
  }, [])

  const runFacetedOrdersSearch = React.useCallback(
    async (forceRefresh = false) => {
      if (!isOrdersMode) return
      setLoadingOrders(true)
      setOrdersError(null)
      try {
        const res = await ipcClient.market.searchFacetedOrders({
          chips,
          forceOrdersMode: liveOrdersToggle,
          forceRefresh
        })
        setFacetedResult(res)
      } catch (err) {
        setOrdersError(err instanceof Error ? err.message : 'Échec de la recherche croisée.')
      } finally {
        setLoadingOrders(false)
      }
    },
    [chips, isOrdersMode, liveOrdersToggle]
  )

  React.useEffect(() => {
    if (isOrdersMode) {
      void runFacetedOrdersSearch(refreshRevision > 0)
    } else {
      setFacetedResult(null)
      setOrdersError(null)
    }
  }, [isOrdersMode, runFacetedOrdersSearch, refreshRevision])

  const filteredCatalog = React.useMemo(
    () => catalog.filter((item) => doesCatalogItemMatchChips(item, chips)),
    [catalog, chips]
  )

  if (catalogError && catalog.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-xs text-muted-foreground">{catalogError}</p>
        <Button onClick={() => void ensureCatalogLoaded(true)}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Réessayer</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-3.5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Compass className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-bold">Catalogue & Recherche à Pastilles</h1>
          <Badge variant={isOrdersMode ? 'default' : 'secondary'}>
            {isOrdersMode
              ? `${facetedResult?.orders.length ?? '…'} offre(s) croisée(s)`
              : `${filteredCatalog.length} items`}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {!hasOrderLevelChips(chips) && chips.length > 0 && (
            <Button
              size="sm"
              variant={liveOrdersToggle ? 'default' : 'outline'}
              onClick={() => setLiveOrdersToggle((v) => !v)}
              className="h-7 gap-1.5 text-xs"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{liveOrdersToggle ? 'Mode Offres Actif' : 'Voir Offres en Direct'}</span>
            </Button>
          )}
          {!isOrdersMode && (
            <ViewModeToggle
              value={layoutMode}
              onChange={setLayoutMode}
              size={cardSize}
              onSizeChange={setCardSize}
            />
          )}
        </div>
      </div>

      <MarketTokenFilterBar
        chips={chips}
        catalog={catalog}
        knownSellers={knownSellers}
        isCompact={isCompact}
        onAddChip={addOrReplaceChip}
        onRemoveChip={removeChip}
        onClearAll={() => {
          setChips([])
          setLiveOrdersToggle(false)
        }}
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {CATEGORY_FILTERS.map((cat) => (
          <Button
            key={cat.id}
            size="sm"
            variant={activeCategory === cat.id ? 'default' : 'outline'}
            onClick={() => {
              if (cat.id === 'all') {
                setChips((prev) => prev.filter((c) => c.kind !== 'category'))
              } else {
                addOrReplaceChip({
                  id: createMarketChipId('category', cat.id),
                  kind: 'category',
                  value: cat.id,
                  label: cat.label
                })
              }
            }}
            className="h-7 px-2.5 text-xs"
          >
            {cat.label}
          </Button>
        ))}

        <Button
          size="sm"
          variant={activeIngameOnly ? 'secondary' : 'outline'}
          onClick={() =>
            activeIngameOnly
              ? removeChip('status:ingame')
              : addOrReplaceChip({
                  id: 'status:ingame',
                  kind: 'status',
                  value: 'ingame',
                  label: 'En jeu uniquement'
                })
          }
          className="h-7 px-2.5 text-xs"
        >
          🟢 En jeu
        </Button>
      </div>

      {isOrdersMode ? (
        <MarketFacetedResultsSection
          chips={chips}
          result={facetedResult}
          isLoading={loadingOrders}
          error={ordersError}
          isCompact={isCompact}
          lang={lang}
          onRetry={() => void runFacetedOrdersSearch(true)}
          onRemoveChip={removeChip}
          onShowFullSellerShop={() =>
            setChips((prev) => prev.filter((c) => c.kind !== 'item' && c.kind !== 'category'))
          }
          onAddSellerChip={(ingameName, slug) =>
            addOrReplaceChip({
              id: createMarketChipId('seller', slug),
              kind: 'seller',
              value: slug,
              label: ingameName
            })
          }
        />
      ) : (
        <>
          <MarketCatalogItemsDisplay
            items={filteredCatalog.slice(0, visibleLimit)}
            isLoading={isCatalogLoading && catalog.length === 0}
            lang={lang}
            favorites={favorites}
            layoutMode={layoutMode}
            cardSize={cardSize}
            query={chips
              .filter((c) => c.kind === 'item')
              .map((c) => c.value)
              .join(' ')}
            onSelectItem={(slug, title) => navigateActive({ kind: 'market-item', slug }, title)}
            onOpenNewTab={(slug, title, background) =>
              openTab({ kind: 'market-item', slug }, { title, background })
            }
            onToggleFavorite={(slug) => void toggleFavorite(slug)}
          />

          {filteredCatalog.length > visibleLimit && (
            <div className="flex justify-center pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setVisibleLimit((prev) => prev + 60)}
              >
                <ChevronDown className="h-3.5 w-3.5 text-primary" />
                <span>Afficher plus ({filteredCatalog.length - visibleLimit} restants)</span>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
