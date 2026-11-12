import * as React from 'react'
import { Flame } from 'lucide-react'
import type { WhisperDraft } from '@shared/schemas/market.schema'
import type {
  AppLanguage,
  CatalogCardSize,
  CatalogLayoutMode
} from '@shared/schemas/settings.schema'
import type { RivenAuctionCard } from '@shared/schemas/tools.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusDot } from '@/components/market/StatusDot'
import { getCardImageClass, getCatalogGridClass } from '@/lib/catalog-layout'
import { cn } from '@/lib/utils'

export function RivenAuctionsDisplay({
  auctions,
  weaponThumbUrl,
  lang,
  layoutMode,
  cardSize,
  onWhisper
}: {
  auctions: readonly RivenAuctionCard[]
  weaponThumbUrl: string | null
  lang: AppLanguage
  layoutMode: CatalogLayoutMode
  cardSize: CatalogCardSize
  onWhisper: (draft: WhisperDraft) => void
}): React.JSX.Element {
  const gridClass = getCatalogGridClass(layoutMode, cardSize)
  const imgClass = getCardImageClass(layoutMode, cardSize)

  if (layoutMode === 'square') {
    return (
      <div className={gridClass}>
        {auctions.map((auc) => {
          const wName = lang === 'fr' ? auc.weaponNameFr : auc.weaponNameEn
          const fullTitle = `${wName} ${auc.rivenName}`
          const price = auc.buyoutPrice ?? auc.startingPrice

          return (
            <Card
              key={auc.id}
              className={cn(
                'flex aspect-square flex-col justify-between overflow-hidden text-center transition-colors hover:border-primary/60',
                cardSize === 'sm' ? 'p-2' : cardSize === 'lg' ? 'p-4' : 'p-3'
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <Badge variant="default" className="font-mono text-[10px]">
                  {price}p
                </Badge>
                <Button
                  size="sm"
                  className="h-6 px-2 text-[10px]"
                  onClick={() =>
                    onWhisper({
                      ingameName: auc.owner.ingameName,
                      itemNameEn: `${auc.weaponNameEn} ${auc.rivenName} (Riven)`,
                      itemNameFr: `${auc.weaponNameFr} ${auc.rivenName} (Riven)`,
                      platinum: price,
                      rank: auc.modRank
                    })
                  }
                >
                  /w
                </Button>
              </div>

              <div className="flex min-h-0 flex-1 items-center justify-center py-1">
                {weaponThumbUrl ? (
                  <img
                    src={weaponThumbUrl}
                    alt=""
                    className={cn(imgClass, 'max-h-full rounded-md bg-background/60 object-contain p-1.5')}
                  />
                ) : (
                  <div className={cn(imgClass, 'flex items-center justify-center rounded-md bg-background/60')}>
                    <Flame className="h-6 w-6 text-primary" />
                  </div>
                )}
              </div>

              <div className="space-y-1 text-left">
                <div className="truncate text-center text-xs font-bold capitalize">{fullTitle}</div>
                <div className="max-h-16 space-y-0.5 overflow-hidden rounded border border-border/70 bg-background/60 px-1.5 py-1 text-[10px]">
                  {auc.attributes.slice(0, cardSize === 'sm' ? 2 : 4).map((attr) => (
                    <div
                      key={attr.slug}
                      className={cn(
                        'flex items-center justify-between gap-1 truncate font-medium',
                        attr.positive ? 'text-emerald-400' : 'text-red-400'
                      )}
                    >
                      <span className="truncate">{lang === 'fr' ? attr.labelFr : attr.labelEn}</span>
                      <span className="shrink-0 font-mono">
                        {attr.value > 0 ? `+${attr.value}` : attr.value}%
                      </span>
                    </div>
                  ))}
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
      {auctions.map((auc) => {
        const wName = lang === 'fr' ? auc.weaponNameFr : auc.weaponNameEn
        const fullTitle = `${wName} ${auc.rivenName}`
        const price = auc.buyoutPrice ?? auc.startingPrice

        return (
          <Card key={auc.id} className="transition-colors hover:border-primary/50">
            <CardContent
              className={cn(
                'space-y-2.5 text-xs',
                layoutMode === 'list'
                  ? 'flex flex-wrap items-center justify-between gap-3 space-y-0 px-3 py-2.5'
                  : cardSize === 'sm'
                    ? 'p-2.5'
                    : cardSize === 'lg'
                      ? 'p-4'
                      : 'p-3.5'
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                {weaponThumbUrl ? (
                  <img
                    src={weaponThumbUrl}
                    alt=""
                    className={cn(imgClass, 'shrink-0 rounded bg-background/60 object-contain p-1')}
                  />
                ) : (
                  <div className={cn(imgClass, 'flex shrink-0 items-center justify-center rounded bg-background/60')}>
                    <Flame className="h-5 w-5 text-primary" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-bold capitalize text-foreground">{fullTitle}</span>
                    {layoutMode !== 'list' && (
                      <Badge variant="default" className="shrink-0 font-mono text-xs">
                        {price} p
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span>MR {auc.masteryLevel}</span>
                    <span>· Rang {auc.modRank}</span>
                    <span>· {auc.reRolls} relances</span>
                    <span className="capitalize">· {auc.polarity}</span>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  'rounded border border-border bg-background/60 p-2',
                  layoutMode === 'list' ? 'flex flex-1 flex-wrap gap-x-4 gap-y-1' : 'space-y-1'
                )}
              >
                {auc.attributes.map((attr) => (
                  <div
                    key={attr.slug}
                    className={cn(
                      'flex items-center justify-between gap-2 font-medium',
                      attr.positive ? 'text-emerald-400' : 'text-red-400'
                    )}
                  >
                    <span>{lang === 'fr' ? attr.labelFr : attr.labelEn}</span>
                    <span className="font-mono">
                      {attr.value > 0 ? `+${attr.value}` : attr.value}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex shrink-0 items-center justify-between gap-3 pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{auc.owner.ingameName}</span>
                  <StatusDot status={auc.owner.status} />
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    onWhisper({
                      ingameName: auc.owner.ingameName,
                      itemNameEn: `${auc.weaponNameEn} ${auc.rivenName} (Riven)`,
                      itemNameFr: `${auc.weaponNameFr} ${auc.rivenName} (Riven)`,
                      platinum: price,
                      rank: auc.modRank
                    })
                  }
                >
                  /w ({price}p)
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
