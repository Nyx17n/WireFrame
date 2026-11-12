import * as React from 'react'
import { Package, Plus, Star } from 'lucide-react'
import { toWfAssetUrl, type MarketCatalogItem } from '@shared/schemas/market.schema'
import type { AppLanguage, CatalogLayoutMode } from '@shared/schemas/settings.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function MarketCatalogItemsDisplay({
  items,
  isLoading,
  lang,
  favorites,
  layoutMode,
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
  query: string
  onSelectItem: (slug: string, title: string) => void
  onOpenNewTab: (slug: string, title: string, background?: boolean) => void
  onToggleFavorite: (slug: string) => void
}): React.JSX.Element {
  if (isLoading) {
    if (layoutMode === 'square') {
      return (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      )
    }
    if (layoutMode === 'list') {
      return (
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )
    }
    return (
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
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
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => {
          const primaryName = lang === 'fr' ? item.nameFr : item.nameEn
          const subName = lang === 'fr' ? item.nameEn : item.nameFr
          const thumbUrl = toWfAssetUrl(item.thumb)
          const isFav = favorites.includes(item.slug)

          return (
            <Card
              key={item.id}
              onClick={() => onSelectItem(item.slug, primaryName)}
              onAuxClick={(e) => {
                if (e.button === 1) {
                  e.preventDefault()
                  onOpenNewTab(item.slug, primaryName, true)
                }
              }}
              className="group relative flex aspect-square cursor-pointer flex-col items-center justify-between overflow-hidden p-3 text-center transition-colors hover:border-primary/60 hover:bg-secondary/40"
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

              {thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-md bg-background/60 object-contain p-1.5 transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-background/60">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              <div className="w-full min-w-0 space-y-0.5">
                <div className="truncate text-xs font-semibold">{primaryName}</div>
                {subName !== primaryName && (
                  <div className="truncate text-[10px] text-muted-foreground">{subName}</div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  if (layoutMode === 'list') {
    return (
      <div className="flex flex-col gap-1.5">
        {items.map((item) => {
          const primaryName = lang === 'fr' ? item.nameFr : item.nameEn
          const subName = lang === 'fr' ? item.nameEn : item.nameFr
          const thumbUrl = toWfAssetUrl(item.thumb)
          const isFav = favorites.includes(item.slug)

          return (
            <Card
              key={item.id}
              onClick={() => onSelectItem(item.slug, primaryName)}
              onAuxClick={(e) => {
                if (e.button === 1) {
                  e.preventDefault()
                  onOpenNewTab(item.slug, primaryName, true)
                }
              }}
              className="group cursor-pointer transition-colors hover:border-primary/60 hover:bg-secondary/40"
            >
              <CardContent className="flex items-center justify-between gap-4 px-3 py-2">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {thumbUrl && (
                    <img
                      src={thumbUrl}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded bg-background/60 object-contain p-1"
                    />
                  )}
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold">{primaryName}</div>
                      {subName !== primaryName && (
                        <div className="truncate text-[10px] text-muted-foreground">{subName}</div>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 sm:mt-0">
                      {item.ducats !== undefined && item.ducats > 0 && (
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                          {item.ducats} Ducats
                        </Badge>
                      )}
                      {item.maxRank !== undefined && (
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                          Rang Max {item.maxRank}
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
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const primaryName = lang === 'fr' ? item.nameFr : item.nameEn
        const subName = lang === 'fr' ? item.nameEn : item.nameFr
        const thumbUrl = toWfAssetUrl(item.thumb)
        const isFav = favorites.includes(item.slug)

        return (
          <Card
            key={item.id}
            onClick={() => onSelectItem(item.slug, primaryName)}
            onAuxClick={(e) => {
              if (e.button === 1) {
                e.preventDefault()
                onOpenNewTab(item.slug, primaryName, true)
              }
            }}
            className="cursor-pointer transition-colors hover:border-primary/60"
          >
            <CardContent className="flex items-center justify-between gap-2 p-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                {thumbUrl && (
                  <img
                    src={thumbUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded bg-background/60 object-contain p-1"
                  />
                )}
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold">{primaryName}</div>
                  {subName !== primaryName && (
                    <div className="truncate text-[11px] text-muted-foreground">{subName}</div>
                  )}
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {item.ducats !== undefined && item.ducats > 0 && (
                      <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                        {item.ducats} Ducats
                      </Badge>
                    )}
                    {item.maxRank !== undefined && (
                      <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                        Rang Max {item.maxRank}
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
  )
}

