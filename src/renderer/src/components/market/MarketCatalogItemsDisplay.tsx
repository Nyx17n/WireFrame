import * as React from 'react'
import { Package, Plus, Star } from 'lucide-react'
import { toWfAssetUrl, type MarketCatalogItem } from '@shared/schemas/market.schema'
import type {
  AppLanguage,
  CatalogCardSize,
  CatalogLayoutMode
} from '@shared/schemas/settings.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ItemPriceRangeBadges } from '@/components/market/ItemPriceRangeBadges'
import {
  MarketItemContextMenu,
  type MarketContextMenuState
} from '@/components/market/MarketItemContextMenu'
import { getCardImageClass, getCatalogGridClass } from '@/lib/catalog-layout'
import { cn } from '@/lib/utils'

export function MarketCatalogItemsDisplay({
  items,
  isLoading,
  lang,
  favorites,
  layoutMode,
  cardSize,
  query,
  onSelectItem,
  onOpenNewTab,
  onToggleFavorite
}: {
  items: readonly MarketCatalogItem[]
  isLoading: boolean
  lang: AppLanguage
  favorites: readonly string[]
  layoutMode: CatalogLayoutMode
  cardSize: CatalogCardSize
  query: string
  onSelectItem: (slug: string, title: string) => void
  onOpenNewTab: (slug: string, title: string, background?: boolean) => void
  onToggleFavorite: (slug: string) => void
}): React.JSX.Element {
  const [ctxMenu, setCtxMenu] = React.useState<MarketContextMenuState | null>(null)
  const gridClass = getCatalogGridClass(layoutMode, cardSize)
  const imgClass = getCardImageClass(layoutMode, cardSize)

  const openItemContextMenu = (
    e: React.MouseEvent,
    item: MarketCatalogItem
  ): void => {
    e.preventDefault()
    e.stopPropagation()
    setCtxMenu({
      position: { x: e.clientX, y: e.clientY },
      item: {
        slug: item.slug,
        nameFr: item.nameFr,
        nameEn: item.nameEn,
        thumb: item.thumb
      }
    })
  }

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              'w-full rounded-lg',
              layoutMode === 'square' ? 'aspect-square' : layoutMode === 'list' ? 'h-14' : 'h-20'
            )}
          />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-xs text-muted-foreground">
          Aucun item ne correspond à « {query} » dans cette catégorie.
        </CardContent>
      </Card>
    )
  }

  if (layoutMode === 'square') {
    return (
      <>
        <div className={gridClass}>
          {items.map((item) => {
            const primaryName = lang === 'fr' ? item.nameFr : item.nameEn
            const subName = lang === 'fr' ? item.nameEn : item.nameFr
            const thumbUrl = toWfAssetUrl(item.thumb)
            const isFav = favorites.includes(item.slug)

            return (
              <Card
                key={item.id}
                onClick={() => onSelectItem(item.slug, primaryName)}
                onContextMenu={(e) => openItemContextMenu(e, item)}
                onAuxClick={(e) => {
                  if (e.button === 1) {
                    e.preventDefault()
                    onOpenNewTab(item.slug, primaryName, true)
                  }
                }}
                className={cn(
                  'group relative flex aspect-square cursor-pointer flex-col items-center justify-between overflow-hidden text-center transition-colors hover:border-primary/60 hover:bg-secondary/40',
                  cardSize === 'sm' ? 'p-2' : cardSize === 'lg' ? 'p-4' : 'p-3'
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    title={isFav ? 'Retirer des Favoris' : 'Ajouter aux Favoris'}
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleFavorite(item.slug)
                    }}
                  >
                    <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-primary text-primary' : ''}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                    title="Ouvrir dans un nouvel onglet"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenNewTab(item.slug, primaryName)
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
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
                    <div
                      className={cn(
                        imgClass,
                        'flex items-center justify-center rounded-md bg-background/60'
                      )}
                    >
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="w-full min-w-0 space-y-1">
                  <div className="truncate text-xs font-semibold">{primaryName}</div>
                  {cardSize !== 'sm' && subName !== primaryName && (
                    <div className="truncate text-[10px] text-muted-foreground">{subName}</div>
                  )}
                  <div className="flex justify-center">
                    <ItemPriceRangeBadges slug={item.slug} compact={cardSize === 'sm'} />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
        <MarketItemContextMenu state={ctxMenu} onClose={() => setCtxMenu(null)} />
      </>
    )
  }

  if (layoutMode === 'list') {
    return (
      <>
        <div className={gridClass}>
          {items.map((item) => {
            const primaryName = lang === 'fr' ? item.nameFr : item.nameEn
            const subName = lang === 'fr' ? item.nameEn : item.nameFr
            const thumbUrl = toWfAssetUrl(item.thumb)
            const isFav = favorites.includes(item.slug)

            return (
              <Card
                key={item.id}
                onClick={() => onSelectItem(item.slug, primaryName)}
                onContextMenu={(e) => openItemContextMenu(e, item)}
                onAuxClick={(e) => {
                  if (e.button === 1) {
                    e.preventDefault()
                    onOpenNewTab(item.slug, primaryName, true)
                  }
                }}
                className="group cursor-pointer transition-colors hover:border-primary/60 hover:bg-secondary/40"
              >
                <CardContent
                  className={cn(
                    'flex flex-wrap items-center justify-between gap-3 px-3',
                    cardSize === 'sm' ? 'py-1.5' : cardSize === 'lg' ? 'py-3' : 'py-2'
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt=""
                        className={cn(
                          imgClass,
                          'shrink-0 rounded bg-background/60 object-contain p-1'
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          imgClass,
                          'flex shrink-0 items-center justify-center rounded bg-background/60'
                        )}
                      >
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold">{primaryName}</div>
                        {subName !== primaryName && (
                          <div className="truncate text-[10px] text-muted-foreground">{subName}</div>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:mt-0">
                        <ItemPriceRangeBadges slug={item.slug} />
                        {item.ducats !== undefined && item.ducats > 0 && (
                          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                            {item.ducats} Ducats
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      title={isFav ? 'Retirer des Favoris' : 'Ajouter aux Favoris'}
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleFavorite(item.slug)
                      }}
                    >
                      <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-primary text-primary' : ''}`} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Ouvrir dans un nouvel onglet"
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenNewTab(item.slug, primaryName)
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        <MarketItemContextMenu state={ctxMenu} onClose={() => setCtxMenu(null)} />
      </>
    )
  }

  return (
    <>
      <div className={gridClass}>
        {items.map((item) => {
          const primaryName = lang === 'fr' ? item.nameFr : item.nameEn
          const subName = lang === 'fr' ? item.nameEn : item.nameFr
          const thumbUrl = toWfAssetUrl(item.thumb)
          const isFav = favorites.includes(item.slug)

          return (
            <Card
              key={item.id}
              onClick={() => onSelectItem(item.slug, primaryName)}
              onContextMenu={(e) => openItemContextMenu(e, item)}
              onAuxClick={(e) => {
                if (e.button === 1) {
                  e.preventDefault()
                  onOpenNewTab(item.slug, primaryName, true)
                }
              }}
              className="cursor-pointer transition-colors hover:border-primary/60"
            >
              <CardContent
                className={cn(
                  'flex items-center justify-between gap-2.5',
                  cardSize === 'sm' ? 'p-2' : cardSize === 'lg' ? 'p-3.5' : 'p-2.5'
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt=""
                      className={cn(
                        imgClass,
                        'shrink-0 rounded bg-background/60 object-contain p-1'
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        imgClass,
                        'flex shrink-0 items-center justify-center rounded bg-background/60'
                      )}
                    >
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="truncate text-xs font-semibold">{primaryName}</div>
                    {subName !== primaryName && (
                      <div className="truncate text-[11px] text-muted-foreground">{subName}</div>
                    )}
                    <ItemPriceRangeBadges slug={item.slug} compact={cardSize === 'sm'} />
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    title={isFav ? 'Retirer des Favoris' : 'Ajouter aux Favoris'}
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleFavorite(item.slug)
                    }}
                  >
                    <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-primary text-primary' : ''}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    title="Ouvrir dans un nouvel onglet"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenNewTab(item.slug, primaryName)
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <MarketItemContextMenu state={ctxMenu} onClose={() => setCtxMenu(null)} />
    </>
  )
}
