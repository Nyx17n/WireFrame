import * as React from 'react'
import { ArrowUpRight, Coins, Compass, RefreshCw, Search } from 'lucide-react'
import { toWfAssetUrl } from '@shared/schemas/market.schema'
import {
  toWikiFileAssetUrl,
  type VoidTraderSnapshot
} from '@shared/schemas/worldstate.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { ipcClient } from '@/services/ipc-client'
import { normalizeSearchText } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'
import { formatCountdown } from './hub-countdown'

export function HubBaroTraderTab({
  voidTrader,
  nowMs
}: {
  voidTrader: VoidTraderSnapshot
  nowMs: number
}): React.JSX.Element {
  const openTab = useTabsStore((s) => s.openTab)
  const [enriched, setEnriched] = React.useState<VoidTraderSnapshot>(voidTrader)
  const [loadingPrices, setLoadingPrices] = React.useState(false)
  const [onlyTradeable, setOnlyTradeable] = React.useState(false)
  const [sortBy, setSortBy] = React.useState<'ratio' | 'plat' | 'ducats'>('ratio')
  const [query, setQuery] = React.useState('')

  React.useEffect(() => {
    setEnriched(voidTrader)
    if (voidTrader.inventory.length === 0) return
    let cancelled = false
    setLoadingPrices(true)
    void ipcClient.worldstate
      .getBaroWithPrices(false)
      .then((res) => {
        if (!cancelled) setEnriched(res)
      })
      .finally(() => {
        if (!cancelled) setLoadingPrices(false)
      })
    return () => {
      cancelled = true
    }
  }, [voidTrader])

  const handleRefreshPrices = async (): Promise<void> => {
    setLoadingPrices(true)
    try {
      const res = await ipcClient.worldstate.getBaroWithPrices(true)
      setEnriched(res)
    } finally {
      setLoadingPrices(false)
    }
  }

  const filteredItems = React.useMemo(() => {
    const q = normalizeSearchText(query)
    return [...enriched.inventory]
      .filter((it) => {
        if (onlyTradeable && !it.marketSlug) return false
        if (!q) return true
        return (
          normalizeSearchText(it.nameFr).includes(q) || normalizeSearchText(it.name).includes(q)
        )
      })
      .sort((a, b) => {
        if (sortBy === 'ratio') return (b.platPer100Ducats ?? -1) - (a.platPer100Ducats ?? -1)
        if (sortBy === 'plat') return (b.minPlatinum ?? -1) - (a.minPlatinum ?? -1)
        return b.ducats - a.ducats
      })
  }, [enriched.inventory, onlyTradeable, sortBy, query])

  return (
    <div className="space-y-4">
      <Card
        className={
          enriched.active
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-primary/40 bg-primary/5'
        }
      >
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3.5">
            <SafeAssetImage
              src={toWikiFileAssetUrl('BaroKiTeer.jpg')}
              alt="Baro Ki'Teer"
              className="h-14 w-14 shrink-0 rounded-md border border-border object-cover"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={enriched.active ? 'success' : 'secondary'}>
                  {enriched.active ? 'PRÉSENT AU RELAIS' : 'EN APPROCHE DANS LE NÉANT'}
                </Badge>
                <span className="text-sm font-bold">{enriched.character}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Compass className="h-3.5 w-3.5 text-primary" />
                <span>Destination : {enriched.location}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] text-muted-foreground">
                {enriched.active ? 'Départ dans' : 'Arrivée dans'}
              </div>
              <div className="font-mono text-base font-bold text-primary">
                {formatCountdown(enriched.active ? enriched.expiry : enriched.activation, nowMs)}
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => openTab({ kind: 'market-ducats' }, { title: 'Ducanator' })}
            >
              <Coins className="h-3.5 w-3.5 text-primary" />
              <span>Ouvrir Ducanator</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {enriched.isPreviewStock && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 bg-card/60 px-3 py-2 text-xs text-muted-foreground">
          <span>
            Baro Ki’Teer est en transit vers <strong>{enriched.location}</strong> — voici la cote en
            direct de ses <strong>20 articles classiques</strong> les plus recherchés :
          </span>
          {loadingPrices && (
            <span className="flex items-center gap-1.5 text-primary">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Calcul des prix Platinum...</span>
            </span>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant={onlyTradeable ? 'default' : 'outline'}
              onClick={() => setOnlyTradeable((v) => !v)}
            >
              Échangeables uniquement
            </Button>
            {(
              [
                ['ratio', 'Max Plat / 100 Ducats'],
                ['plat', 'Prix Plat décroissant'],
                ['ducats', 'Coût Ducats']
              ] as const
            ).map(([k, label]) => (
              <Button
                key={k}
                size="sm"
                variant={sortBy === k ? 'secondary' : 'ghost'}
                onClick={() => setSortBy(k)}
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48">
              <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrer inventaire..."
                className="h-8 pl-8"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={loadingPrices}
              onClick={() => void handleRefreshPrices()}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingPrices ? 'animate-spin' : ''}`} />
              <span>Prix Plat</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {filteredItems.map((it) => {
            const thumb = toWfAssetUrl(it.thumb)
            return (
              <Card
                key={it.uniqueName || it.name}
                onClick={() => {
                  if (it.marketSlug) {
                    openTab({ kind: 'market-item', slug: it.marketSlug }, { title: it.nameFr })
                  }
                }}
                className={
                  it.marketSlug
                    ? 'cursor-pointer transition-colors hover:border-primary/60'
                    : 'opacity-85'
                }
              >
                <CardContent className="flex items-center justify-between gap-2.5 p-2.5 text-xs">
                  <div className="flex min-w-0 items-center gap-3">
                    <SafeAssetImage
                      src={thumb}
                      alt={it.nameFr}
                      className="h-10 w-10 shrink-0 rounded-md border border-border/70 bg-background/70 object-contain p-1"
                    />
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{it.nameFr}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {it.ducats} Ducats · {it.credits.toLocaleString('fr-FR')} Crédits
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {it.minPlatinum !== null && <Badge variant="default">{it.minPlatinum} p</Badge>}
                    {it.platPer100Ducats !== null && (
                      <Badge variant="success">{it.platPer100Ducats} p/100D</Badge>
                    )}
                    {it.marketSlug && <ArrowUpRight className="h-3.5 w-3.5 text-primary" />}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
