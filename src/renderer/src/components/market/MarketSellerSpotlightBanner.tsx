import * as React from 'react'
import { Award, ExternalLink, ShoppingCart, User } from 'lucide-react'
import type { MarketSellerSpotlight } from '@shared/schemas/market-search.schema'
import { toWfAssetUrl, type MarketOrder } from '@shared/schemas/market.schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { StatusDot } from '@/components/market/StatusDot'

interface MarketSellerSpotlightBannerProps {
  readonly seller: MarketSellerSpotlight
  readonly matchedOrders: readonly MarketOrder[]
  readonly hasItemFilters: boolean
  readonly isCompact: boolean
  readonly onAddAllToCart: () => void
  readonly onShowFullShop: () => void
  readonly onOpenSellerProfile: (slug: string, ingameName: string) => void
}

export function MarketSellerSpotlightBanner({
  seller,
  matchedOrders,
  hasItemFilters,
  isCompact,
  onAddAllToCart,
  onShowFullShop,
  onOpenSellerProfile
}: MarketSellerSpotlightBannerProps): React.JSX.Element {
  const sellerOrders = matchedOrders.filter(
    (o) => o.user?.slug.toLowerCase() === seller.slug.toLowerCase()
  )
  const bundlePlat = sellerOrders.reduce((sum, o) => sum + o.platinum, 0)
  const avatarUrl = toWfAssetUrl(seller.avatar)

  return (
    <Card className="border-violet-500/40 bg-violet-500/10">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <SafeAssetImage
            src={avatarUrl}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full border border-violet-500/40 object-cover"
            fallback={
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary">
                <User className="h-5 w-5 text-violet-400" />
              </div>
            }
          />
          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-bold text-foreground">
                Boutique filtrée de {seller.ingameName}
              </span>
              <StatusDot status={seller.status} />
              <span className="inline-flex items-center gap-1 rounded border border-violet-500/35 bg-background/60 px-1.5 py-0.5 text-[10px] text-violet-200">
                <Award className="h-3 w-3 text-amber-400" />+{seller.reputation} Rép
                {seller.masteryRank > 0 ? ` · PM ${seller.masteryRank}` : ''}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">{sellerOrders.length}</span> offre(s)
              correspondent sur {seller.totalActiveSellOrders} ventes actives
              {sellerOrders.length > 0 && ` · Total (1 unité de chaque) : ${bundlePlat} Plat`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {sellerOrders.length > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onAddAllToCart}
              className="h-7 gap-1.5 text-xs"
            >
              <ShoppingCart className="h-3.5 w-3.5 text-emerald-400" />
              <span>{isCompact ? `Panier (${bundlePlat}p)` : `Tout au Panier (${bundlePlat}p)`}</span>
            </Button>
          )}
          {hasItemFilters && (
            <Button
              size="sm"
              variant="outline"
              onClick={onShowFullShop}
              className="h-7 text-xs"
            >
              Voir ses {seller.totalActiveSellOrders} offres
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenSellerProfile(seller.slug, seller.ingameName)}
            className="h-7 gap-1 px-2 text-xs"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Profil</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
