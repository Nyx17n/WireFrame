import * as React from 'react'
import { Crosshair, Package, Plus, Sparkles } from 'lucide-react'
import type { CodexCategory, CodexSummaryCard } from '@shared/schemas/codex.schema'
import type { CatalogCardSize, CatalogLayoutMode } from '@shared/schemas/settings.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { Skeleton } from '@/components/ui/skeleton'
import { CodexCardRequirements } from '@/components/codex/CodexCardRequirements'
import {
  CodexItemContextMenu,
  type CodexContextMenuState
} from '@/components/codex/CodexItemContextMenu'
import { ItemPriceRangeBadges } from '@/components/market/ItemPriceRangeBadges'
import {
  getCardImageClass,
  getCatalogGridClass,
  resolveCodexMarketSlug
} from '@/lib/catalog-layout'
import { buildItemKey } from '@/lib/codex-overlay-entries'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { useFarmOverlayStore } from '@/stores/useFarmOverlayStore'
import { useMarketStore } from '@/stores/useMarketStore'

interface CodexDetailRoute {
  readonly kind: 'codex-detail'
  readonly category: CodexCategory
  readonly slug: string
}

export function CodexItemsDisplay({
  items,
  isLoading,
  layoutMode,
  cardSize,
  onSelectCard,
  onOpenNewTab
}: {
  items: readonly CodexSummaryCard[]
  isLoading: boolean
  layoutMode: CatalogLayoutMode
  cardSize: CatalogCardSize
  onSelectCard: (route: CodexDetailRoute, title: string, inNewTab: boolean) => void
  onOpenNewTab: (route: CodexDetailRoute, title: string) => void
}): React.JSX.Element {
  const [ctxMenu, setCtxMenu] = React.useState<CodexContextMenuState | null>(null)
  const catalog = useMarketStore((s) => s.catalog)
  const ensureCatalogLoaded = useMarketStore((s) => s.ensureCatalogLoaded)
  const overlayEnabled = useAppStore((s) => s.settings.extensions.codexFarmOverlay)
  const pinnedEntries = useFarmOverlayStore((s) => s.liveState.pinnedEntries)
  const pinQuickItem = useFarmOverlayStore((s) => s.pinQuickItem)

  const openCardContextMenu = (e: React.MouseEvent, card: CodexSummaryCard): void => {
    e.preventDefault()
    e.stopPropagation()
    setCtxMenu({
      position: { x: e.clientX, y: e.clientY },
      card
    })
  }

  const pinnedItemKeys = React.useMemo(
    () => new Set(pinnedEntries.map((e) => e.itemKey)),
    [pinnedEntries]
  )

  const hasTradable = React.useMemo(() => items.some((i) => i.isTradable), [items])

  React.useEffect(() => {
    if (hasTradable) {
      void ensureCatalogLoaded()
    }
  }, [hasTradable, ensureCatalogLoaded])

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

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center text-xs text-muted-foreground">
        Aucune entrée trouvée dans cette catégorie pour ces filtres.
      </Card>
    )
  }

  if (layoutMode === 'square') {
    const maxReqs = cardSize === 'sm' ? 2 : cardSize === 'lg' ? 4 : 3
    return (
      <>
        <div className={gridClass}>
          {items.map((card) => {
            const route: CodexDetailRoute = {
              kind: 'codex-detail',
              category: card.category,
              slug: card.id
            }
            const title = `Codex : ${card.nameFr}`
            const marketSlug = card.isTradable ? resolveCodexMarketSlug(card, catalog) : null

            return (
              <Card
                key={`${card.category}-${card.id}`}
                onClick={(e) => onSelectCard(route, title, e.ctrlKey || e.metaKey)}
                onContextMenu={(e) => openCardContextMenu(e, card)}
                className={cn(
                  'group relative flex aspect-square cursor-pointer flex-col items-center justify-between overflow-hidden text-center transition-colors hover:border-primary/55 hover:bg-secondary/40',
                  cardSize === 'sm' ? 'p-2' : cardSize === 'lg' ? 'p-4' : 'p-3'
                )}
              >
                <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5">
                  {overlayEnabled && (
                    <Button
                      variant={
                        pinnedItemKeys.has(buildItemKey(card.category, card.id))
                          ? 'default'
                          : 'ghost'
                      }
                      size="icon"
                      className={cn(
                        'h-6 w-6 transition-opacity',
                        pinnedItemKeys.has(buildItemKey(card.category, card.id))
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      )}
                      title="Épingler / Retirer du Codex Farm Overlay"
                      onClick={(e) => {
                        e.stopPropagation()
                        void pinQuickItem(card.category, card.id)
                      }}
                    >
                      <Crosshair className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                    title="Ouvrir dans un nouvel onglet"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenNewTab(route, title)
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Badge variant="secondary" className="max-w-[85%] truncate px-1.5 py-0 text-[10px]">
                  {card.badgeText}
                </Badge>

                <div className="flex min-h-0 flex-1 items-center justify-center py-1">
                  <SafeAssetImage
                    src={card.imageUrl}
                    alt={card.nameFr}
                    className={cn(
                      imgClass,
                      'max-h-full rounded-md border border-border/60 bg-background/70 transition-transform group-hover:scale-105',
                      card.category === 'vendors'
                        ? 'object-cover object-top p-0'
                        : 'object-contain p-1.5'
                    )}
                    fallback={
                      <div
                        className={cn(
                          imgClass,
                          'flex items-center justify-center rounded-md border border-border/60 bg-background/70'
                        )}
                      >
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    }
                  />
                </div>

                <div className="w-full min-w-0 space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <span className="truncate text-xs font-semibold text-foreground">
                      {card.nameFr}
                    </span>
                    {card.isPrime && <Sparkles className="h-3 w-3 shrink-0 text-amber-400" />}
                  </div>
                  <CodexCardRequirements card={card} maxItems={maxReqs} centered />
                  {card.isTradable && marketSlug && (
                    <div className="flex justify-center">
                      <ItemPriceRangeBadges slug={marketSlug} compact={cardSize === 'sm'} />
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
        <CodexItemContextMenu state={ctxMenu} onClose={() => setCtxMenu(null)} />
      </>
    )
  }

  if (layoutMode === 'list') {
    return (
      <>
        <div className={gridClass}>
          {items.map((card) => {
            const route: CodexDetailRoute = {
              kind: 'codex-detail',
              category: card.category,
              slug: card.id
            }
            const title = `Codex : ${card.nameFr}`
            const marketSlug = card.isTradable ? resolveCodexMarketSlug(card, catalog) : null

            return (
              <Card
                key={`${card.category}-${card.id}`}
                onClick={(e) => onSelectCard(route, title, e.ctrlKey || e.metaKey)}
                onContextMenu={(e) => openCardContextMenu(e, card)}
                className={cn(
                  'group flex cursor-pointer items-center justify-between gap-4 px-3 transition-colors hover:border-primary/50 hover:bg-secondary/40',
                  cardSize === 'sm' ? 'py-1.5' : cardSize === 'lg' ? 'py-3' : 'py-2'
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <SafeAssetImage
                    src={card.imageUrl}
                    alt={card.nameFr}
                    className={cn(
                      imgClass,
                      'shrink-0 rounded-md border border-border/60 bg-background/70',
                      card.category === 'vendors'
                        ? 'object-cover object-top p-0'
                        : 'object-contain p-1'
                    )}
                    fallback={
                      <div
                        className={cn(
                          imgClass,
                          'flex shrink-0 items-center justify-center rounded-md border border-border/60 bg-background/70'
                        )}
                      >
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    }
                  />

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-xs font-semibold text-foreground">
                        {card.nameFr}
                      </span>
                      {card.isPrime && <Sparkles className="h-3 w-3 shrink-0 text-amber-400" />}
                      <span className="truncate text-[11px] text-primary/90">{card.subtitle}</span>
                    </div>
                    <CodexCardRequirements card={card} maxItems={5} />
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  {card.isTradable && marketSlug && <ItemPriceRangeBadges slug={marketSlug} />}
                  <Badge variant="secondary" className="text-[10px]">
                    {card.badgeText}
                  </Badge>
                  {overlayEnabled && (
                    <Button
                      variant={
                        pinnedItemKeys.has(buildItemKey(card.category, card.id))
                          ? 'default'
                          : 'ghost'
                      }
                      size="icon"
                      className="h-7 w-7 opacity-75 transition-opacity hover:opacity-100 group-hover:opacity-100"
                      title="Épingler / Retirer du Codex Farm Overlay"
                      onClick={(e) => {
                        e.stopPropagation()
                        void pinQuickItem(card.category, card.id)
                      }}
                    >
                      <Crosshair className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-60 transition-opacity hover:opacity-100 group-hover:opacity-100"
                    title="Ouvrir dans un nouvel onglet"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenNewTab(route, title)
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
        <CodexItemContextMenu state={ctxMenu} onClose={() => setCtxMenu(null)} />
      </>
    )
  }

  return (
    <>
      <div className={gridClass}>
        {items.map((card) => {
          const route: CodexDetailRoute = {
            kind: 'codex-detail',
            category: card.category,
            slug: card.id
          }
          const title = `Codex : ${card.nameFr}`
          const marketSlug = card.isTradable ? resolveCodexMarketSlug(card, catalog) : null

          return (
            <Card
              key={`${card.category}-${card.id}`}
              onClick={(e) => onSelectCard(route, title, e.ctrlKey || e.metaKey)}
              onContextMenu={(e) => openCardContextMenu(e, card)}
              className={cn(
                'group flex cursor-pointer items-start justify-between gap-3 transition-colors hover:border-primary/50 hover:bg-secondary/40',
                cardSize === 'sm' ? 'p-2' : cardSize === 'lg' ? 'p-3.5' : 'p-2.5'
              )}
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <SafeAssetImage
                  src={card.imageUrl}
                  alt={card.nameFr}
                  className={cn(
                    imgClass,
                    'shrink-0 rounded-md border border-border/60 bg-background/70',
                    card.category === 'vendors'
                      ? 'object-cover object-top p-0'
                      : 'object-contain p-1'
                  )}
                  fallback={
                    <div
                      className={cn(
                        imgClass,
                        'flex shrink-0 items-center justify-center rounded-md border border-border/60 bg-background/70'
                      )}
                    >
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  }
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-semibold text-foreground">
                      {card.nameFr}
                    </span>
                    {card.isPrime && <Sparkles className="h-3 w-3 shrink-0 text-amber-400" />}
                  </div>
                  <div className="truncate text-[11px] text-primary/90">{card.subtitle}</div>
                  <CodexCardRequirements card={card} maxItems={cardSize === 'lg' ? 5 : 3} />
                  {card.isTradable && marketSlug && (
                    <ItemPriceRangeBadges slug={marketSlug} compact={cardSize === 'sm'} />
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant="secondary" className="text-[10px]">
                  {card.badgeText}
                </Badge>
                <div className="flex items-center gap-0.5">
                  {overlayEnabled && (
                    <Button
                      variant={
                        pinnedItemKeys.has(buildItemKey(card.category, card.id))
                          ? 'default'
                          : 'ghost'
                      }
                      size="icon"
                      className={cn(
                        'h-6 w-6 transition-opacity',
                        pinnedItemKeys.has(buildItemKey(card.category, card.id))
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      )}
                      title="Épingler / Retirer du Codex Farm Overlay"
                      onClick={(e) => {
                        e.stopPropagation()
                        void pinQuickItem(card.category, card.id)
                      }}
                    >
                      <Crosshair className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                    title="Ouvrir dans un nouvel onglet"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenNewTab(route, title)
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
      <CodexItemContextMenu state={ctxMenu} onClose={() => setCtxMenu(null)} />
    </>
  )
}
