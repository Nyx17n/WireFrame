import * as React from 'react'
import { AlertTriangle, ChevronDown, Clock, RefreshCw, Search } from 'lucide-react'
import type { MarketOrder } from '@shared/schemas/market.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ViewModeToggle } from '@/components/ui/view-mode-toggle'
import { RecentOrdersDisplay } from '@/components/market/RecentOrdersDisplay'
import { useCatalogDisplayPreferences } from '@/lib/catalog-layout'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { normalizeSearchText, useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

const PAGE_STEP = 48

export function MarketRecentOrdersView(): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const { layoutMode, cardSize, setLayoutMode, setCardSize } = useCatalogDisplayPreferences()
  const triggerWhisper = useMarketStore((s) => s.triggerWhisper)
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)
  const refreshRevision = useTabsStore((s) => s.refreshRevision)

  const [orders, setOrders] = React.useState<MarketOrder[]>([])
  const [typeFilter, setTypeFilter] = React.useState<'all' | 'sell' | 'buy'>('sell')
  const [query, setQuery] = React.useState('')
  const [visibleLimit, setVisibleLimit] = React.useState(PAGE_STEP)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadRecent = React.useCallback(async (force = false) => {
    setLoading(true)
    setError(null)
    try {
      const data = await ipcClient.market.getRecentOrders(force)
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec lecture des ordres récents')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadRecent(refreshRevision > 0)
  }, [loadRecent, refreshRevision])

  const filtered = React.useMemo(() => {
    const q = normalizeSearchText(query)
    return orders.filter((o) => {
      if (!o.itemSlug) return false
      if (typeFilter !== 'all' && o.type !== typeFilter) return false
      if (!q) return true
      return (
        normalizeSearchText(o.itemNameFr ?? '').includes(q) ||
        normalizeSearchText(o.itemNameEn ?? '').includes(q) ||
        normalizeSearchText(o.user?.ingameName ?? '').includes(q)
      )
    })
  }, [orders, typeFilter, query])

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-bold">Ordres Récents en Direct</h1>
          <Badge variant="secondary" className="font-mono text-[11px]">
            {filtered.length}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(['sell', 'buy', 'all'] as const).map((mode) => (
            <Button
              key={mode}
              size="sm"
              variant={typeFilter === mode ? 'default' : 'outline'}
              onClick={() => {
                setTypeFilter(mode)
                setVisibleLimit(PAGE_STEP)
              }}
            >
              {mode === 'sell' ? 'Offres de Vente' : mode === 'buy' ? 'Offres d’Achat' : 'Toutes'}
            </Button>
          ))}
          <Button size="sm" variant="outline" disabled={loading} onClick={() => void loadRecent(true)}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <ViewModeToggle
            value={layoutMode}
            onChange={setLayoutMode}
            size={cardSize}
            onSizeChange={setCardSize}
          />
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setVisibleLimit(PAGE_STEP)
          }}
          placeholder="Filtrer par nom d'item FR/EN ou pseudo du joueur..."
          className="h-8 pl-8 text-xs"
        />
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-2 p-8 text-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      ) : (
        <>
          <RecentOrdersDisplay
            orders={filtered.slice(0, visibleLimit)}
            isLoading={loading && orders.length === 0}
            lang={lang}
            layoutMode={layoutMode}
            cardSize={cardSize}
            onSelectItem={(slug, title) => navigateActive({ kind: 'market-item', slug }, title)}
            onOpenItemNewTab={(slug, title) => openTab({ kind: 'market-item', slug }, { title })}
            onOpenUser={(userSlug, ingameName) =>
              openTab({ kind: 'market-user', slug: userSlug }, { title: `Profil : ${ingameName}` })
            }
            onWhisper={(draft) => void triggerWhisper(draft)}
          />

          {filtered.length > 0 && (
            <div className="flex flex-col items-center gap-2 pt-2 text-xs text-muted-foreground">
              <span>
                {Math.min(visibleLimit, filtered.length)} sur {filtered.length} ordres affichés
              </span>
              {filtered.length > visibleLimit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setVisibleLimit((prev) => prev + PAGE_STEP)}
                >
                  <ChevronDown className="h-3.5 w-3.5 text-primary" />
                  <span>Afficher plus ({filtered.length - visibleLimit} restants)</span>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
