import * as React from 'react'
import { Package, Plus, RefreshCw, Star, Trash2 } from 'lucide-react'
import { toWfAssetUrl } from '@shared/schemas/market.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ViewModeToggle } from '@/components/ui/view-mode-toggle'
import { ItemPriceRangeBadges } from '@/components/market/ItemPriceRangeBadges'
import {
  MarketItemContextMenu,
  type MarketContextMenuState
} from '@/components/market/MarketItemContextMenu'
import {
  getCardImageClass,
  getCatalogGridClass,
  useCatalogDisplayPreferences
} from '@/lib/catalog-layout'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { useItemPriceRangeStore } from '@/stores/useItemPriceRangeStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function MarketFavoritesView(): React.JSX.Element {
  const [ctxMenu, setCtxMenu] = React.useState<MarketContextMenuState | null>(null)
  const favorites = useAppStore((s) => s.settings.favorites)
  const lang = useAppStore((s) => s.settings.market.language)
  const { layoutMode, cardSize, setLayoutMode, setCardSize } = useCatalogDisplayPreferences()

  const catalog = useMarketStore((s) => s.catalog)
  const ensureCatalogLoaded = useMarketStore((s) => s.ensureCatalogLoaded)
  const toggleFavorite = useMarketStore((s) => s.toggleFavorite)
  const triggerWhisper = useMarketStore((s) => s.triggerWhisper)
  const summaries = useItemPriceRangeStore((s) => s.summaries)
  const requestPriceSummary = useItemPriceRangeStore((s) => s.requestPriceSummary)

  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)

  React.useEffect(() => {
    void ensureCatalogLoaded()
  }, [ensureCatalogLoaded])

  const handleRefreshAll = (): void => {
    for (const slug of favorites) {
      requestPriceSummary(slug, true)
    }
  }

  const catalogBySlug = React.useMemo(
    () => new Map(catalog.map((i) => [i.slug, i])),
    [catalog]
  )

  const gridClass = getCatalogGridClass(layoutMode, cardSize)
  const imgClass = getCardImageClass(layoutMode, cardSize)

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <h1 className="text-sm font-bold">Mes Favoris Marché ({favorites.length})</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {favorites.length > 0 && (
            <Button size="sm" variant="outline" onClick={handleRefreshAll}>
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Actualiser les prix</span>
            </Button>
          )}
          <ViewModeToggle
            value={layoutMode}
            onChange={setLayoutMode}
            size={cardSize}
            onSizeChange={setCardSize}
          />
        </div>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-xs text-muted-foreground">
            Aucun favori enregistré. Clique sur l’étoile d’un item dans le Catalogue ou utilise Ctrl+D sur une fiche item !
          </CardContent>
        </Card>
      ) : layoutMode === 'square' ? (
        <div className={gridClass}>
          {favorites.map((slug) => {
            const cat = catalogBySlug.get(slug)
            const nameFr = cat?.nameFr ?? slug
            const nameEn = cat?.nameEn ?? slug
            const label = lang === 'fr' ? nameFr : nameEn
            const thumbUrl = toWfAssetUrl(cat?.thumb)
            const summary = summaries[slug]

            return (
              <Card
                key={slug}
                onClick={() => navigateActive({ kind: 'market-item', slug }, label)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCtxMenu({
                    position: { x: e.clientX, y: e.clientY },
                    item: { slug, nameFr, nameEn, thumb: cat?.thumb ?? null }
                  })
                }}
                className={cn(
                  'group relative flex aspect-square cursor-pointer flex-col items-center justify-between overflow-hidden text-center transition-colors hover:border-primary/60 hover:bg-secondary/40',
                  cardSize === 'sm' ? 'p-2' : cardSize === 'lg' ? 'p-4' : 'p-3'
                )}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  {summary?.bestIngamePlat !== null && summary?.bestIngamePlat !== undefined ? (
                    <Badge variant="default" className="text-[10px]">
                      {summary.bestIngamePlat} p
                    </Badge>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-0.5">
                    {summary?.bestIngameSeller && summary.bestIngamePlat !== null && (
                      <Button
                        size="sm"
                        className="h-6 px-2 text-[10px]"
                        onClick={(e) => {
                          e.stopPropagation()
                          void triggerWhisper({
                            ingameName: summary.bestIngameSeller ?? '',
                            itemNameEn: nameEn,
                            itemNameFr: nameFr,
                            platinum: summary.bestIngamePlat ?? 0,
                            rank: summary.bestIngameRank
                          })
                        }}
                      >
                        /w
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      title="Retirer des favoris"
                      onClick={(e) => {
                        e.stopPropagation()
                        void toggleFavorite(slug)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="flex min-h-0 flex-1 items-center justify-center py-1">
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt=""
                      className={cn(
                        imgClass,
                        'max-h-full rounded-md bg-background/60 object-contain p-1.5 transition-transform group-hover:scale-105'
                      )}
                    />
                  ) : (
                    <div className={cn(imgClass, 'flex items-center justify-center rounded-md bg-background/60')}>
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="w-full min-w-0 space-y-1">
                  <div className="truncate text-xs font-semibold">{label}</div>
                  <div className="flex justify-center">
                    <ItemPriceRangeBadges slug={slug} compact={cardSize === 'sm'} />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className={gridClass}>
          {favorites.map((slug) => {
            const cat = catalogBySlug.get(slug)
            const nameFr = cat?.nameFr ?? slug
            const nameEn = cat?.nameEn ?? slug
            const label = lang === 'fr' ? nameFr : nameEn
            const thumbUrl = toWfAssetUrl(cat?.thumb)
            const summary = summaries[slug]

            return (
              <Card
                key={slug}
                onContextMenu={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCtxMenu({
                    position: { x: e.clientX, y: e.clientY },
                    item: { slug, nameFr, nameEn, thumb: cat?.thumb ?? null }
                  })
                }}
                className="transition-colors hover:border-primary/50"
              >
                <CardContent
                  className={cn(
                    'flex items-center justify-between gap-2.5 text-xs',
                    layoutMode === 'list'
                      ? cardSize === 'sm'
                        ? 'px-3 py-1.5'
                        : cardSize === 'lg'
                          ? 'px-3 py-3'
                          : 'px-3 py-2'
                      : cardSize === 'sm'
                        ? 'p-2'
                        : cardSize === 'lg'
                          ? 'p-3.5'
                          : 'p-2.5'
                  )}
                >
                  <div
                    onClick={() => navigateActive({ kind: 'market-item', slug }, label)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                  >
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt=""
                        className={cn(imgClass, 'shrink-0 rounded bg-background/60 object-contain p-1')}
                      />
                    ) : (
                      <div className={cn(imgClass, 'flex shrink-0 items-center justify-center rounded bg-background/60')}>
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="truncate font-semibold hover:text-primary">{label}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {summary?.bestIngameSeller
                          ? `Meilleur En jeu : ${summary.bestIngameSeller} (${summary.bestIngamePlat}p)`
                          : 'Cliquer pour ouvrir les offres'}
                      </div>
                      <ItemPriceRangeBadges slug={slug} compact={cardSize === 'sm'} />
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {summary?.bestIngameSeller && summary.bestIngamePlat !== null && (
                      <Button
                        size="sm"
                        onClick={() =>
                          void triggerWhisper({
                            ingameName: summary.bestIngameSeller ?? '',
                            itemNameEn: nameEn,
                            itemNameFr: nameFr,
                            platinum: summary.bestIngamePlat ?? 0,
                            rank: summary.bestIngameRank
                          })
                        }
                      >
                        /w
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Ouvrir dans un nouvel onglet"
                      onClick={() => openTab({ kind: 'market-item', slug }, { title: label })}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Retirer des favoris"
                      onClick={() => void toggleFavorite(slug)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      <MarketItemContextMenu state={ctxMenu} onClose={() => setCtxMenu(null)} />
    </div>
  )
}
