import * as React from 'react'
import { Package, Plus } from 'lucide-react'
import { toWfAssetUrl } from '@shared/schemas/market.schema'
import type {
  AppLanguage,
  CatalogCardSize,
  CatalogLayoutMode
} from '@shared/schemas/settings.schema'
import type { DucatItemEntry } from '@shared/schemas/tools.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  MarketItemContextMenu,
  type MarketContextMenuState
} from '@/components/market/MarketItemContextMenu'
import { getCardImageClass, getCatalogGridClass } from '@/lib/catalog-layout'
import { cn } from '@/lib/utils'

export function DucatsItemsDisplay({
  items,
  mode,
  lang,
  layoutMode,
  cardSize,
  onSelectItem,
  onOpenNewTab
}: {
  items: readonly DucatItemEntry[]
  mode: 'buy-ducats' | 'sell-plat'
  lang: AppLanguage
  layoutMode: CatalogLayoutMode
  cardSize: CatalogCardSize
  onSelectItem: (slug: string, title: string) => void
  onOpenNewTab: (slug: string, title: string) => void
}): React.JSX.Element {
  const [ctxMenu, setCtxMenu] = React.useState<MarketContextMenuState | null>(null)
  const gridClass = getCatalogGridClass(layoutMode, cardSize)
  const imgClass = getCardImageClass(layoutMode, cardSize)

  const openDucatContextMenu = (e: React.MouseEvent, item: DucatItemEntry): void => {
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

  if (layoutMode === 'square') {
    return (
      <>
        <div className={gridClass}>
          {items.map((item) => {
            const label = lang === 'fr' ? item.nameFr : item.nameEn
            const thumb = toWfAssetUrl(item.thumb)

            return (
              <Card
                key={item.itemId}
                onClick={() => onSelectItem(item.slug, label)}
                onContextMenu={(e) => openDucatContextMenu(e, item)}
                className={cn(
                'group relative flex aspect-square cursor-pointer flex-col items-center justify-between overflow-hidden text-center transition-colors hover:border-primary/60 hover:bg-secondary/40',
                cardSize === 'sm' ? 'p-2' : cardSize === 'lg' ? 'p-4' : 'p-3'
              )}
            >
              <div className="flex w-full items-center justify-between gap-1">
                {mode === 'buy-ducats' ? (
                  <Badge variant="success" className="text-[10px]">
                    {item.ducatsPerPlat} Duc/p
                  </Badge>
                ) : (
                  <Badge variant="default" className="text-[10px]">
                    {item.platPer100Ducats} p/100D
                  </Badge>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenNewTab(item.slug, label)
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex min-h-0 flex-1 items-center justify-center py-1">
                {thumb ? (
                  <img
                    src={thumb}
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

              <div className="w-full min-w-0 space-y-0.5">
                <div className="truncate text-xs font-semibold">{label}</div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  {item.ducats} Duc · Moy {item.waPricePlat}p · Vol {item.volume}
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

  return (
    <>
      <div className={gridClass}>
        {items.map((item) => {
          const label = lang === 'fr' ? item.nameFr : item.nameEn
          const thumb = toWfAssetUrl(item.thumb)

          return (
            <Card
              key={item.itemId}
              onClick={() => onSelectItem(item.slug, label)}
              onContextMenu={(e) => openDucatContextMenu(e, item)}
              className="cursor-pointer transition-colors hover:border-primary/60"
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
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {thumb ? (
                  <img
                    src={thumb}
                    alt=""
                    className={cn(imgClass, 'shrink-0 rounded bg-background/60 object-contain p-1')}
                  />
                ) : (
                  <div className={cn(imgClass, 'flex shrink-0 items-center justify-center rounded bg-background/60')}>
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate font-semibold">{label}</div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{item.ducats} Ducats</span>
                    <span>· Moy: {item.waPricePlat}p</span>
                    <span>· Méd: {item.medianPlat}p</span>
                    <span>· Vol: {item.volume}</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {mode === 'buy-ducats' ? (
                  <Badge variant="success">{item.ducatsPerPlat} Duc/p</Badge>
                ) : (
                  <Badge variant="default">{item.platPer100Ducats} p / 100 Duc</Badge>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenNewTab(item.slug, label)
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

