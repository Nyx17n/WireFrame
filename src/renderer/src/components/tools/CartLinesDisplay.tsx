import * as React from 'react'
import { Minus, Package, Plus, Trash2 } from 'lucide-react'
import { toWfAssetUrl, type WhisperDraft } from '@shared/schemas/market.schema'
import type {
  AppLanguage,
  CatalogCardSize,
  CatalogLayoutMode
} from '@shared/schemas/settings.schema'
import type { CartLineAnalysis } from '@shared/schemas/tools.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ItemPriceRangeBadges } from '@/components/market/ItemPriceRangeBadges'
import { getCardImageClass, getCatalogGridClass } from '@/lib/catalog-layout'
import { cn } from '@/lib/utils'

export function CartLinesDisplay({
  lines,
  lang,
  layoutMode,
  cardSize,
  onSelectItem,
  onUpdateQty,
  onRemove,
  onWhisper
}: {
  lines: readonly CartLineAnalysis[]
  lang: AppLanguage
  layoutMode: CatalogLayoutMode
  cardSize: CatalogCardSize
  onSelectItem: (slug: string, title: string) => void
  onUpdateQty: (slug: string, nextQty: number) => void
  onRemove: (slug: string) => void
  onWhisper: (draft: WhisperDraft) => void
}): React.JSX.Element {
  const gridClass = getCatalogGridClass(layoutMode, cardSize)
  const imgClass = getCardImageClass(layoutMode, cardSize)

  if (layoutMode === 'square') {
    return (
      <div className={gridClass}>
        {lines.map((line) => {
          const label = lang === 'fr' ? line.nameFr : line.nameEn
          const thumb = toWfAssetUrl(line.thumb)

          return (
            <Card
              key={line.slug}
              onClick={() => onSelectItem(line.slug, label)}
              className={cn(
                'group relative flex aspect-square cursor-pointer flex-col items-center justify-between overflow-hidden text-center transition-colors hover:border-primary/60 hover:bg-secondary/40',
                cardSize === 'sm' ? 'p-2' : cardSize === 'lg' ? 'p-4' : 'p-3'
              )}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <Badge variant="default" className="text-[10px]">
                  {line.lineTotalPlat !== null ? `${line.lineTotalPlat} p` : '—'}
                </Badge>
                <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                  {line.bestSellerName && line.bestUnitPrice !== null && (
                    <Button
                      size="sm"
                      className="h-6 px-2 text-[10px]"
                      onClick={() =>
                        onWhisper({
                          ingameName: line.bestSellerName ?? '',
                          itemNameEn: line.nameEn,
                          itemNameFr: line.nameFr,
                          platinum: line.bestUnitPrice ?? 0,
                          rank: line.desiredRank
                        })
                      }
                    >
                      /w
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => onRemove(line.slug)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
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

              <div className="w-full min-w-0 space-y-1">
                <div className="truncate text-xs font-semibold">{label}</div>
                <div
                  className="inline-flex items-center gap-1 rounded border border-border bg-background/70 px-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="p-0.5 text-muted-foreground hover:text-foreground"
                    onClick={() => onUpdateQty(line.slug, line.quantity - 1)}
                  >
                    <Minus className="h-2.5 w-2.5" />
                  </button>
                  <span className="min-w-[18px] font-mono text-[10px]">×{line.quantity}</span>
                  <button
                    type="button"
                    className="p-0.5 text-muted-foreground hover:text-foreground"
                    onClick={() => onUpdateQty(line.slug, line.quantity + 1)}
                  >
                    <Plus className="h-2.5 w-2.5" />
                  </button>
                </div>
                <div className="flex justify-center">
                  <ItemPriceRangeBadges slug={line.slug} compact={cardSize === 'sm'} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className={gridClass}>
      {lines.map((line) => {
        const label = lang === 'fr' ? line.nameFr : line.nameEn
        const thumb = toWfAssetUrl(line.thumb)

        return (
          <Card key={line.slug} className="transition-colors hover:border-primary/50">
            <CardContent
              className={cn(
                'flex flex-wrap items-center justify-between gap-2.5 text-xs',
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
                onClick={() => onSelectItem(line.slug, label)}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
              >
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
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="truncate font-semibold hover:text-primary">{label}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {line.bestSellerName
                      ? `Meilleur : ${line.bestUnitPrice}p par ${line.bestSellerName}`
                      : 'Aucun vendeur actif avec ce stock'}
                  </div>
                  <ItemPriceRangeBadges slug={line.slug} compact={cardSize === 'sm'} />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <div className="flex items-center gap-0.5 rounded border border-border px-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => onUpdateQty(line.slug, line.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-5 text-center font-mono">{line.quantity}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => onUpdateQty(line.slug, line.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <Badge variant="default">
                  {line.lineTotalPlat !== null ? `${line.lineTotalPlat} p` : '—'}
                </Badge>

                {line.bestSellerName && line.bestUnitPrice !== null && (
                  <Button
                    size="sm"
                    onClick={() =>
                      onWhisper({
                        ingameName: line.bestSellerName ?? '',
                        itemNameEn: line.nameEn,
                        itemNameFr: line.nameFr,
                        platinum: line.bestUnitPrice ?? 0,
                        rank: line.desiredRank
                      })
                    }
                  >
                    /w
                  </Button>
                )}

                <Button size="icon" variant="ghost" onClick={() => onRemove(line.slug)}>
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
