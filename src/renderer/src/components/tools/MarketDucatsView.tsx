import * as React from 'react'
import { AlertTriangle, ChevronDown, Coins, RefreshCw, Search } from 'lucide-react'
import type { DucatItemEntry } from '@shared/schemas/tools.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ViewModeToggle } from '@/components/ui/view-mode-toggle'
import { DucatsItemsDisplay } from '@/components/tools/DucatsItemsDisplay'
import { getCatalogGridClass, useCatalogDisplayPreferences } from '@/lib/catalog-layout'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { normalizeSearchText } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function MarketDucatsView(): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const { layoutMode, cardSize, setLayoutMode, setCardSize } = useCatalogDisplayPreferences()
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)
  const refreshRevision = useTabsStore((s) => s.refreshRevision)

  const [entries, setEntries] = React.useState<DucatItemEntry[]>([])
  const [mode, setMode] = React.useState<'buy-ducats' | 'sell-plat'>('buy-ducats')
  const [minVolume, setMinVolume] = React.useState<number>(10)
  const [query, setQuery] = React.useState('')
  const [visibleLimit, setVisibleLimit] = React.useState(60)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setVisibleLimit(60)
  }, [mode, minVolume, query])

  const loadDucats = React.useCallback(async (force = false) => {
    setLoading(true)
    setError(null)
    try {
      const data = await ipcClient.tools.getDucats(force)
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lecture Ducanator')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadDucats(refreshRevision > 0)
  }, [loadDucats, refreshRevision])

  const sorted = React.useMemo(() => {
    const q = normalizeSearchText(query)
    return entries
      .filter((e) => {
        if (e.volume < minVolume) return false
        if (!q) return true
        return normalizeSearchText(e.nameFr).includes(q) || normalizeSearchText(e.nameEn).includes(q)
      })
      .sort((a, b) =>
        mode === 'buy-ducats'
          ? b.ducatsPerPlat - a.ducatsPerPlat
          : b.platPer100Ducats - a.platPer100Ducats
      )
  }, [entries, mode, minVolume, query])

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-bold">Ducanator — Rentabilité Ducats & Baro Ki’Teer</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => void loadDucats(true)}>
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Actualiser</span>
          </Button>
          <ViewModeToggle
            value={layoutMode}
            onChange={setLayoutMode}
            size={cardSize}
            onSizeChange={setCardSize}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={mode === 'buy-ducats' ? 'default' : 'outline'}
            onClick={() => setMode('buy-ducats')}
          >
            Acheter Prime Junk (Max Ducats / Plat)
          </Button>
          <Button
            size="sm"
            variant={mode === 'sell-plat' ? 'default' : 'outline'}
            onClick={() => setMode('sell-plat')}
          >
            Vendre contre Plat (Max Plat / 100 Ducats)
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground">Vol. min :</span>
            {[0, 10, 25, 50].map((v) => (
              <Button
                key={v}
                size="sm"
                variant={minVolume === v ? 'secondary' : 'ghost'}
                onClick={() => setMinVolume(v)}
              >
                {v}+
              </Button>
            ))}
          </div>
          <div className="relative w-52">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrer une pièce Prime..."
              className="h-8 pl-8"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-2 p-8 text-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      ) : loading ? (
        <div className={getCatalogGridClass(layoutMode, cardSize)}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <>
          <DucatsItemsDisplay
            items={sorted.slice(0, visibleLimit)}
            mode={mode}
            lang={lang}
            layoutMode={layoutMode}
            cardSize={cardSize}
            onSelectItem={(slug, title) => navigateActive({ kind: 'market-item', slug }, title)}
            onOpenNewTab={(slug, title) => openTab({ kind: 'market-item', slug }, { title })}
          />
          {sorted.length > 0 && (
            <div className="flex flex-col items-center gap-2 pt-2 text-xs text-muted-foreground">
              <span>
                {Math.min(visibleLimit, sorted.length)} sur {sorted.length} pièces affichées
              </span>
              {sorted.length > visibleLimit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setVisibleLimit((prev) => prev + 60)}
                >
                  <ChevronDown className="h-3.5 w-3.5 text-primary" />
                  <span>Afficher plus ({sorted.length - visibleLimit} restantes)</span>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
