import * as React from 'react'
import { AlertTriangle, Compass, Plus, RefreshCw, Search, Star } from 'lucide-react'
import { toWfAssetUrl } from '@shared/schemas/market.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/stores/useAppStore'
import { normalizeSearchText, useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

const CATEGORY_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'set', label: 'Sets Prime' },
  { id: 'warframe', label: 'Warframes' },
  { id: 'weapon', label: 'Armes' },
  { id: 'mod', label: 'Mods' },
  { id: 'arcane_enhancement', label: 'Arcanes' },
  { id: 'relic', label: 'Reliques' }
] as const

export function MarketCatalogView({ initialQuery = '' }: { initialQuery?: string }): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const favorites = useAppStore((s) => s.settings.favorites)
  const catalog = useMarketStore((s) => s.catalog)
  const isLoading = useMarketStore((s) => s.isCatalogLoading)
  const error = useMarketStore((s) => s.catalogError)
  const ensureCatalogLoaded = useMarketStore((s) => s.ensureCatalogLoaded)
  const toggleFavorite = useMarketStore((s) => s.toggleFavorite)

  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)

  const [query, setQuery] = React.useState(initialQuery)
  const [tagFilter, setTagFilter] = React.useState<string>('all')
  const [visibleLimit, setVisibleLimit] = React.useState(60)

  React.useEffect(() => {
    setQuery(initialQuery)
    setVisibleLimit(60)
  }, [initialQuery])

  React.useEffect(() => {
    void ensureCatalogLoaded()
  }, [ensureCatalogLoaded])

  const filtered = React.useMemo(() => {
    const q = normalizeSearchText(query)
    return catalog.filter((item) => {
      if (tagFilter !== 'all' && !item.tags.includes(tagFilter)) return false
      if (!q) return true
      return (
        normalizeSearchText(item.nameFr).includes(q) ||
        normalizeSearchText(item.nameEn).includes(q) ||
        item.slug.includes(q)
      )
    })
  }, [catalog, query, tagFilter])

  if (error) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-xs text-muted-foreground">{error}</p>
        <Button onClick={() => void ensureCatalogLoaded(true)}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Réessayer</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-bold">Catalogue Warframe Market</h1>
          <Badge variant="secondary">{filtered.length} résultats</Badge>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setVisibleLimit(60)
            }}
            placeholder="Filtrer par nom FR, EN ou slug..."
            className="h-8 pl-8"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_FILTERS.map((cat) => (
          <Button
            key={cat.id}
            size="sm"
            variant={tagFilter === cat.id ? 'default' : 'outline'}
            onClick={() => {
              setTagFilter(cat.id)
              setVisibleLimit(60)
            }}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {isLoading && catalog.length === 0 ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-xs text-muted-foreground">
            Aucun item ne correspond à « {query} » dans cette catégorie.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(0, visibleLimit).map((item) => {
              const primaryName = lang === 'fr' ? item.nameFr : item.nameEn
              const subName = lang === 'fr' ? item.nameEn : item.nameFr
              const thumbUrl = toWfAssetUrl(item.thumb)
              const isFav = favorites.includes(item.slug)

              return (
                <Card
                  key={item.id}
                  onClick={() => navigateActive({ kind: 'market-item', slug: item.slug }, primaryName)}
                  onAuxClick={(e) => {
                    if (e.button === 1) {
                      e.preventDefault()
                      openTab({ kind: 'market-item', slug: item.slug }, { title: primaryName, background: true })
                    }
                  }}
                  className="cursor-pointer transition-colors hover:border-primary/60"
                >
                  <CardContent className="flex items-center justify-between gap-2 p-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      {thumbUrl && (
                        <img src={thumbUrl} alt="" className="h-10 w-10 shrink-0 rounded bg-background/60 object-contain p-1" />
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
                          void toggleFavorite(item.slug)
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
                          openTab({ kind: 'market-item', slug: item.slug }, { title: primaryName })
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

          {filtered.length > visibleLimit && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => setVisibleLimit((prev) => prev + 60)}>
                Afficher 60 items supplémentaires ({filtered.length - visibleLimit} restants)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

