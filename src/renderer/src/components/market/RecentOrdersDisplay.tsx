import * as React from 'react'
import { Package, Plus } from 'lucide-react'
import { toWfAssetUrl, type MarketOrder, type WhisperDraft } from '@shared/schemas/market.schema'
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
import { StatusDot } from '@/components/market/StatusDot'
import { getCardImageClass, getCatalogGridClass } from '@/lib/catalog-layout'
import { cn } from '@/lib/utils'

export function RecentOrdersDisplay({
  orders,
  isLoading,
  lang,
  layoutMode,
  cardSize,
  onSelectItem,
  onOpenItemNewTab,
  onOpenUser,
  onWhisper
}: {
  orders: readonly MarketOrder[]
  isLoading: boolean
  lang: AppLanguage
  layoutMode: CatalogLayoutMode
  cardSize: CatalogCardSize
  onSelectItem: (slug: string, title: string) => void
  onOpenItemNewTab: (slug: string, title: string) => void
  onOpenUser: (userSlug: string, ingameName: string) => void
  onWhisper: (draft: WhisperDraft) => void
}): React.JSX.Element {
  const gridClass = getCatalogGridClass(layoutMode, cardSize)
  const imgClass = getCardImageClass(layoutMode, cardSize)

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 12 }).map((_, idx) => (
          <Skeleton
            key={idx}
            className={cn(
              'w-full rounded-lg',
              layoutMode === 'square' ? 'aspect-square' : layoutMode === 'list' ? 'h-16' : 'h-24'
            )}
          />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-xs text-muted-foreground">
          Aucune annonce récente ne correspond à ces filtres.
        </CardContent>
      </Card>
    )
  }

  if (layoutMode === 'square') {
    return (
      <div className={gridClass}>
        {orders.map((o) => {
          const slug = o.itemSlug ?? ''
          const name =
            lang === 'fr' ? (o.itemNameFr ?? slug ?? 'Item') : (o.itemNameEn ?? slug ?? 'Item')
          const thumbUrl = toWfAssetUrl(o.itemThumb)

          return (
            <Card
              key={o.id}
              onClick={() => slug && onSelectItem(slug, name)}
              className={cn(
                'group relative flex aspect-square cursor-pointer flex-col items-center justify-between overflow-hidden text-center transition-colors hover:border-primary/60 hover:bg-secondary/40',
                cardSize === 'sm' ? 'p-2' : cardSize === 'lg' ? 'p-4' : 'p-3'
              )}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <Badge variant={o.type === 'sell' ? 'default' : 'secondary'} className="text-[10px]">
                  {o.type === 'sell' ? 'Vente' : 'Achat'} · {o.platinum}p
                </Badge>
                {o.type === 'sell' && o.user && (
                  <Button
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={(e) => {
                      e.stopPropagation()
                      onWhisper({
                        ingameName: o.user?.ingameName ?? '',
                        itemNameEn: o.itemNameEn ?? name,
                        itemNameFr: o.itemNameFr ?? name,
                        platinum: o.platinum,
                        rank: o.rank
                      })
                    }}
                  >
                    /w
                  </Button>
                )}
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
                <div className="truncate text-xs font-semibold">{name}</div>
                {o.user && (
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="truncate">{o.user.ingameName}</span>
                    <StatusDot status={o.user.status} />
                  </div>
                )}
                {slug && (
                  <div className="flex justify-center">
                    <ItemPriceRangeBadges slug={slug} compact={cardSize === 'sm'} />
                  </div>
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
      <div className={gridClass}>
        {orders.map((o) => {
          const slug = o.itemSlug ?? ''
          const name =
            lang === 'fr' ? (o.itemNameFr ?? slug ?? 'Item') : (o.itemNameEn ?? slug ?? 'Item')
          const thumbUrl = toWfAssetUrl(o.itemThumb)

          return (
            <Card key={o.id} className="transition-colors hover:border-primary/50">
              <CardContent
                className={cn(
                  'flex flex-wrap items-center justify-between gap-3 px-3 text-xs',
                  cardSize === 'sm' ? 'py-1.5' : cardSize === 'lg' ? 'py-3' : 'py-2'
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt=""
                      className={cn(imgClass, 'shrink-0 rounded bg-background/60 object-contain p-1')}
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
                      <button
                        type="button"
                        onClick={() => slug && onSelectItem(slug, name)}
                        className="truncate font-semibold hover:text-primary hover:underline"
                      >
                        {name}
                      </button>
                      {o.user && (
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <button
                            type="button"
                            onClick={() => o.user && onOpenUser(o.user.slug, o.user.ingameName)}
                            className="hover:text-foreground hover:underline"
                          >
                            {o.user.ingameName}
                          </button>
                          <StatusDot status={o.user.status} />
                          <span>· Qté {o.quantity}</span>
                        </div>
                      )}
                    </div>

                    {slug && <ItemPriceRangeBadges slug={slug} />}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge variant={o.type === 'sell' ? 'default' : 'secondary'}>
                    {o.type === 'sell' ? 'Vente' : 'Achat'} · {o.platinum} p
                  </Badge>
                  {o.type === 'sell' && o.user && (
                    <Button
                      size="sm"
                      onClick={() =>
                        onWhisper({
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
                  {slug && (
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Ouvrir la fiche dans un nouvel onglet"
                      onClick={() => onOpenItemNewTab(slug, name)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className={gridClass}>
      {orders.map((o) => {
        const slug = o.itemSlug ?? ''
        const name =
          lang === 'fr' ? (o.itemNameFr ?? slug ?? 'Item') : (o.itemNameEn ?? slug ?? 'Item')
        const thumbUrl = toWfAssetUrl(o.itemThumb)

        return (
          <Card key={o.id} className="transition-colors hover:border-primary/50">
            <CardContent
              className={cn(
                'flex items-center justify-between gap-2.5 text-xs',
                cardSize === 'sm' ? 'p-2' : cardSize === 'lg' ? 'p-3.5' : 'p-2.5'
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt=""
                    className={cn(imgClass, 'shrink-0 rounded bg-background/60 object-contain p-1')}
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
                  <button
                    type="button"
                    onClick={() => slug && onSelectItem(slug, name)}
                    className="block max-w-full truncate text-left font-semibold hover:text-primary hover:underline"
                  >
                    {name}
                  </button>
                  {o.user && (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => o.user && onOpenUser(o.user.slug, o.user.ingameName)}
                        className="truncate hover:text-foreground hover:underline"
                      >
                        {o.user.ingameName}
                      </button>
                      <StatusDot status={o.user.status} />
                    </div>
                  )}
                  {slug && <ItemPriceRangeBadges slug={slug} compact={cardSize === 'sm'} />}
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Badge variant={o.type === 'sell' ? 'default' : 'secondary'}>
                  {o.platinum} p
                </Badge>
                {o.type === 'sell' && o.user && (
                  <Button
                    size="sm"
                    onClick={() =>
                      onWhisper({
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
  )
}

