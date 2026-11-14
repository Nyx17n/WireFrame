import * as React from 'react'
import { Search } from 'lucide-react'
import { toWfAssetUrl, type MarketCatalogItem } from '@shared/schemas/market.schema'
import { Input } from '@/components/ui/input'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'

interface WfmItemAutocompletePickerProps {
  catalog: MarketCatalogItem[]
  onSelect: (item: MarketCatalogItem) => void
}

export function WfmItemAutocompletePicker({
  catalog,
  onSelect
}: WfmItemAutocompletePickerProps): React.JSX.Element {
  const [query, setQuery] = React.useState('')

  const filteredItems = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return catalog.slice(0, 10)
    return catalog
      .filter((i) => i.nameFr.toLowerCase().includes(q) || i.nameEn.toLowerCase().includes(q))
      .slice(0, 12)
  }, [catalog, query])

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          placeholder="Rechercher un item échangeable en FR ou EN (ex: Glaive Prime, Continuité…)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="max-h-52 divide-y divide-border overflow-y-auto rounded-md border border-border bg-background/70">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            Aucun item échangeable ne correspond à « {query} ».
          </div>
        ) : (
          filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors hover:bg-secondary/70"
            >
              <SafeAssetImage
                src={toWfAssetUrl(item.thumb)}
                alt={item.nameFr}
                className="h-7 w-7 shrink-0 rounded border border-border object-contain p-0.5"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-foreground">{item.nameFr}</div>
                <div className="truncate text-[10px] text-muted-foreground">{item.nameEn}</div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
