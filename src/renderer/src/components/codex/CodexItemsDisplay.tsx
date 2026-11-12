import * as React from 'react'
import { Package, Plus, Sparkles } from 'lucide-react'
import type { CodexCategory, CodexSummaryCard } from '@shared/schemas/codex.schema'
import type { CatalogLayoutMode } from '@shared/schemas/settings.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { Skeleton } from '@/components/ui/skeleton'

interface CodexDetailRoute {
  readonly kind: 'codex-detail'
  readonly category: CodexCategory
  readonly slug: string
}

export function CodexItemsDisplay({
  items,
  isLoading,
  layoutMode,
  onSelectCard,
  onOpenNewTab
}: {
  items: readonly CodexSummaryCard[]
  isLoading: boolean
  layoutMode: CatalogLayoutMode
  onSelectCard: (route: CodexDetailRoute, title: string, inNewTab: boolean) => void
  onOpenNewTab: (route: CodexDetailRoute, title: string) => void
}): React.JSX.Element {
  if (isLoading) {
    if (layoutMode === 'square') {
      return (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <Skeleton key={idx} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      )
    }
    if (layoutMode === 'list') {
      return (
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 10 }).map((_, idx) => (
            <Skeleton key={idx} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )
    }
    return (
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, idx) => (
          <Skeleton key={idx} className="h-20 w-full rounded-lg" />
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
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((card) => {
          const route: CodexDetailRoute = {
            kind: 'codex-detail',
            category: card.category,
            slug: card.id
          }
          const title = `Codex : ${card.nameFr}`
          return (
            <Card
              key={`${card.category}-${card.id}`}
              onClick={(e) => onSelectCard(route, title, e.ctrlKey || e.metaKey)}
              className="group relative flex aspect-square cursor-pointer flex-col items-center justify-between overflow-hidden p-3 text-center transition-colors hover:border-primary/55 hover:bg-secondary/40"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1.5 top-1.5 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                title="Ouvrir dans un nouvel onglet"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenNewTab(route, title)
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>

              <Badge variant="secondary" className="max-w-full truncate px-1.5 py-0 text-[10px]">
                {card.badgeText}
              </Badge>

              <SafeAssetImage
                src={card.imageUrl}
                alt={card.nameFr}
                className="h-14 w-14 shrink-0 rounded-md border border-border/60 bg-background/70 object-contain p-1.5 transition-transform group-hover:scale-105"
                fallback={
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background/70">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                }
              />

              <div className="w-full min-w-0 space-y-0.5">
                <div className="flex items-center justify-center gap-1">
                  <span className="truncate text-xs font-semibold text-foreground">
                    {card.nameFr}
                  </span>
                  {card.isPrime && <Sparkles className="h-3 w-3 shrink-0 text-amber-400" />}
                </div>
                <div className="line-clamp-1 text-[10px] text-primary/90">{card.subtitle}</div>
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
        {items.map((card) => {
          const route: CodexDetailRoute = {
            kind: 'codex-detail',
            category: card.category,
            slug: card.id
          }
          const title = `Codex : ${card.nameFr}`
          return (
            <Card
              key={`${card.category}-${card.id}`}
              onClick={(e) => onSelectCard(route, title, e.ctrlKey || e.metaKey)}
              className="group flex cursor-pointer items-center justify-between gap-4 px-3 py-2 transition-colors hover:border-primary/50 hover:bg-secondary/40"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <SafeAssetImage
                  src={card.imageUrl}
                  alt={card.nameFr}
                  className="h-10 w-10 shrink-0 rounded-md border border-border/60 bg-background/70 object-contain p-1"
                  fallback={
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background/70">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  }
                />

                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-4">
                  <div className="min-w-0 shrink-0 sm:w-64">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-semibold text-foreground">
                        {card.nameFr}
                      </span>
                      {card.isPrime && <Sparkles className="h-3 w-3 shrink-0 text-amber-400" />}
                    </div>
                    {card.nameEn !== card.nameFr && (
                      <div className="truncate text-[10px] text-muted-foreground">
                        {card.nameEn}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 truncate text-xs text-primary/90">
                    {card.subtitle}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {card.badgeText}
                </Badge>
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
    )
  }

  // Default: 'rect' (Grille rectangulaire 3 colonnes)
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((card) => {
        const route: CodexDetailRoute = {
          kind: 'codex-detail',
          category: card.category,
          slug: card.id
        }
        const title = `Codex : ${card.nameFr}`
        return (
          <Card
            key={`${card.category}-${card.id}`}
            onClick={(e) => onSelectCard(route, title, e.ctrlKey || e.metaKey)}
            className="group flex cursor-pointer items-center justify-between gap-3 p-2.5 transition-colors hover:border-primary/50 hover:bg-secondary/40"
          >
            <div className="flex min-w-0 items-center gap-3">
              <SafeAssetImage
                src={card.imageUrl}
                alt={card.nameFr}
                className="h-12 w-12 shrink-0 rounded-md border border-border/60 bg-background/70 object-contain p-1"
                fallback={
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background/70">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                }
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-semibold text-foreground">
                    {card.nameFr}
                  </span>
                  {card.isPrime && <Sparkles className="h-3 w-3 shrink-0 text-amber-400" />}
                </div>
                {card.nameEn !== card.nameFr && (
                  <div className="truncate text-[10px] text-muted-foreground">{card.nameEn}</div>
                )}
                <div className="mt-0.5 truncate text-[11px] text-primary/90">{card.subtitle}</div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant="secondary" className="text-[10px]">
                {card.badgeText}
              </Badge>
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
          </Card>
        )
      })}
    </div>
  )
}
