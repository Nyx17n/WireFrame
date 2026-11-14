import * as React from 'react'
import {
  AlertTriangle,
  ChevronDown,
  Info,
  PackageOpen,
  RefreshCw,
  ShoppingCart,
  User,
  X
} from 'lucide-react'
import type {
  MarketFacetedSearchResult,
  MarketFilterChip
} from '@shared/schemas/market-search.schema'
import { toWfAssetUrl, type MarketOrder } from '@shared/schemas/market.schema'
import { Button } from '@/components/ui/button'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MarketItemContextMenu,
  type MarketContextMenuState
} from '@/components/market/MarketItemContextMenu'
import { MarketSellerSpotlightBanner } from '@/components/market/MarketSellerSpotlightBanner'
import { StatusDot } from '@/components/market/StatusDot'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

const PAGE_STEP = 40

interface MarketFacetedResultsSectionProps {
  readonly chips: readonly MarketFilterChip[]
  readonly result: MarketFacetedSearchResult | null
  readonly isLoading: boolean
  readonly error: string | null
  readonly isCompact: boolean
  readonly lang: 'fr' | 'en'
  readonly onRetry: () => void
  readonly onRemoveChip: (chipId: string) => void
  readonly onShowFullSellerShop: () => void
  readonly onAddSellerChip: (ingameName: string, slug: string) => void
}

export function MarketFacetedResultsSection({
  chips,
  result,
  isLoading,
  error,
  isCompact,
  lang,
  onRetry,
  onRemoveChip,
  onShowFullSellerShop,
  onAddSellerChip
}: MarketFacetedResultsSectionProps): React.JSX.Element {
  const [ctxMenu, setCtxMenu] = React.useState<MarketContextMenuState | null>(null)
  const triggerWhisper = useMarketStore((s) => s.triggerWhisper)
  const addToCart = useMarketStore((s) => s.addToCart)
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)

  const [visibleCount, setVisibleCount] = React.useState(PAGE_STEP)
  React.useEffect(() => {
    setVisibleCount(PAGE_STEP)
  }, [chips])

  if (isLoading && !result) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (error) {
    const sellerChips = chips.filter((c) => c.kind === 'seller')
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center">
        <AlertTriangle className="h-7 w-7 text-destructive" />
        <p className="text-xs text-foreground">{error}</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Réessayer</span>
          </Button>
          {sellerChips.map((sc) => (
            <Button
              key={sc.id}
              size="sm"
              variant="secondary"
              onClick={() => onRemoveChip(sc.id)}
            >
              <X className="h-3.5 w-3.5" />
              <span>Retirer « {sc.label} »</span>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  if (!result) return <></>

  const hasItemFilters = chips.some((c) => c.kind === 'item' || c.kind === 'category')
  const hasSellerChip = chips.some((c) => c.kind === 'seller')

  const handleAddSellerBundleToCart = async (orders: readonly MarketOrder[]): Promise<void> => {
    for (const ord of orders) {
      if (!ord.itemSlug) continue
      await addToCart({
        slug: ord.itemSlug,
        quantity: 1,
        ...(ord.rank !== undefined ? { desiredRank: ord.rank } : {})
      })
    }
  }

  return (
    <div className="space-y-3">
      {result.sellers.map((seller) => (
        <MarketSellerSpotlightBanner
          key={seller.id}
          seller={seller}
          matchedOrders={result.orders}
          hasItemFilters={hasItemFilters}
          isCompact={isCompact}
          onAddAllToCart={() =>
            void handleAddSellerBundleToCart(
              result.orders.filter((o) => o.user?.slug.toLowerCase() === seller.slug.toLowerCase())
            )
          }
          onShowFullShop={onShowFullSellerShop}
          onOpenSellerProfile={(slug, name) =>
            openTab({ kind: 'market-user', slug }, { title: `Profil : ${name}` })
          }
        />
      ))}

      {result.cappedByItemLimit && !hasSellerChip && (
        <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-[11px] text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>
            Affichage des offres en direct sur les <strong>{result.scannedItemCount}</strong> premiers
            items ({result.matchedTotalCatalogItems} correspondants). Ajoutez un autre mot-clé ou le
            pseudo d’un vendeur pour cibler davantage !
          </span>
        </div>
      )}

      {result.orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card/60 p-8 text-center">
          <PackageOpen className="h-8 w-8 text-muted-foreground" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Aucune offre ne croise toutes vos pastilles</h3>
            <p className="text-xs text-muted-foreground">
              Retirez un critère ci-dessous en 1 clic pour élargir les résultats :
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {chips.map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant="outline"
                onClick={() => onRemoveChip(c.id)}
                className="h-7 gap-1 text-xs"
              >
                <X className="h-3 w-3" />
                <span>Retirer « {c.label} »</span>
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {result.orders.slice(0, visibleCount).map((ord) => {
            const label =
              lang === 'fr'
                ? (ord.itemNameFr ?? ord.itemSlug ?? 'Item')
                : (ord.itemNameEn ?? ord.itemSlug ?? 'Item')
            const thumb = toWfAssetUrl(ord.itemThumb)
            const seller = ord.user

            return (
              <div
                key={ord.id}
                onContextMenu={(e) => {
                  if (!ord.itemSlug) return
                  e.preventDefault()
                  e.stopPropagation()
                  setCtxMenu({
                    position: { x: e.clientX, y: e.clientY },
                    item: {
                      slug: ord.itemSlug,
                      nameFr: ord.itemNameFr ?? ord.itemSlug,
                      nameEn: ord.itemNameEn ?? ord.itemSlug,
                      thumb: ord.itemThumb ?? null
                    }
                  })
                }}
                className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:border-primary/40"
              >
                <div
                  onClick={() =>
                    ord.itemSlug && navigateActive({ kind: 'market-item', slug: ord.itemSlug }, label)
                  }
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5"
                >
                  <SafeAssetImage
                    src={thumb}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded border border-border/60 bg-secondary/40 object-contain p-1"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-foreground hover:text-primary">
                      {label}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span>Stock ×{ord.quantity}</span>
                      {ord.rank !== undefined && <span>· Rang {ord.rank}</span>}
                      {ord.subtype && <span>· {ord.subtype}</span>}
                      {seller && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onAddSellerChip(seller.ingameName, seller.slug)
                          }}
                          title="Cliquer pour filtrer uniquement ce vendeur"
                          className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-violet-300 hover:bg-violet-500/15"
                        >
                          <User className="h-3 w-3" />
                          <span className="font-medium">{seller.ingameName}</span>
                          <StatusDot status={seller.status} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
                    {ord.platinum} Plat
                  </span>
                  {ord.itemSlug && !isCompact && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void addToCart({
                          slug: ord.itemSlug!,
                          quantity: 1,
                          ...(ord.rank !== undefined ? { desiredRank: ord.rank } : {})
                        })
                      }
                      className="h-7 gap-1 px-2 text-xs"
                      title="Ajouter au Panier Bundler"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {seller && ord.type === 'sell' && (
                    <Button
                      size="sm"
                      onClick={() =>
                        void triggerWhisper({
                          ingameName: seller.ingameName,
                          itemNameEn: ord.itemNameEn ?? label,
                          itemNameFr: ord.itemNameFr ?? label,
                          platinum: ord.platinum,
                          rank: ord.rank
                        })
                      }
                      className="h-7 px-2.5 text-xs"
                    >
                      {isCompact ? '/w' : 'Copier /w'}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}

          {result.orders.length > visibleCount && (
            <div className="flex justify-center pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setVisibleCount((prev) => prev + PAGE_STEP)}
              >
                <ChevronDown className="h-3.5 w-3.5 text-primary" />
                <span>Afficher plus ({result.orders.length - visibleCount} restantes)</span>
              </Button>
            </div>
          )}
        </div>
      )}
      <MarketItemContextMenu state={ctxMenu} onClose={() => setCtxMenu(null)} />
    </div>
  )
}
