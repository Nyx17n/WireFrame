import * as React from 'react'
import { AlertTriangle, ChevronDown, Compass, RefreshCw, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ViewModeToggle } from '@/components/ui/view-mode-toggle'
import { MarketCatalogItemsDisplay } from '@/components/market/MarketCatalogItemsDisplay'
import { useCatalogDisplayPreferences } from '@/lib/catalog-layout'
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

export function MarketCatalogView({
  initialQuery = ''
}: {
  initialQuery?: string
}): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const favorites = useAppStore((s) => s.settings.favorites)
  const { layoutMode, cardSize, setLayoutMode, setCardSize } = useCatalogDisplayPreferences()

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

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
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

          <ViewModeToggle
            value={layoutMode}
            onChange={setLayoutMode}
            size={cardSize}
            onSizeChange={setCardSize}
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

      <MarketCatalogItemsDisplay
        items={filtered.slice(0, visibleLimit)}
        isLoading={isLoading && catalog.length === 0}
        lang={lang}
        favorites={favorites}
        layoutMode={layoutMode}
        cardSize={cardSize}
        query={query}
        onSelectItem={(slug, title) => navigateActive({ kind: 'market-item', slug }, title)}
        onOpenNewTab={(slug, title, background) =>
          openTab({ kind: 'market-item', slug }, { title, background })
        }
        onToggleFavorite={(slug) => void toggleFavorite(slug)}
      />

      {filtered.length > 0 && (
        <div className="flex flex-col items-center gap-2 pt-3 text-xs text-muted-foreground">
          <span>
            {Math.min(visibleLimit, filtered.length)} sur {filtered.length} items affichés
          </span>
          {filtered.length > visibleLimit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setVisibleLimit((prev) => prev + 60)}
            >
              <ChevronDown className="h-3.5 w-3.5 text-primary" />
              <span>Afficher plus ({filtered.length - visibleLimit} restants)</span>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
