import * as React from 'react'
import { ChevronDown, Flame, RefreshCw, Search } from 'lucide-react'
import { toWfAssetUrl } from '@shared/schemas/market.schema'
import type { RivenAuctionCard, RivenWeaponSummary } from '@shared/schemas/tools.schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ViewModeToggle } from '@/components/ui/view-mode-toggle'
import { RivenAuctionsDisplay } from '@/components/tools/RivenAuctionsDisplay'
import { getCatalogGridClass, useCatalogDisplayPreferences } from '@/lib/catalog-layout'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { normalizeSearchText, useMarketStore } from '@/stores/useMarketStore'

const PAGE_STEP = 24

export function MarketRivensView(): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const { layoutMode, cardSize, setLayoutMode, setCardSize } = useCatalogDisplayPreferences()
  const triggerWhisper = useMarketStore((s) => s.triggerWhisper)

  const [weapons, setWeapons] = React.useState<RivenWeaponSummary[]>([])
  const [weaponQuery, setWeaponQuery] = React.useState('Torid')
  const [selectedSlug, setSelectedSlug] = React.useState('torid')
  const [polarity, setPolarity] = React.useState<'all' | 'madurai' | 'vazarin' | 'naramon'>('all')
  const [auctions, setAuctions] = React.useState<RivenAuctionCard[]>([])
  const [visibleLimit, setVisibleLimit] = React.useState(PAGE_STEP)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    void ipcClient.tools.getRivenWeapons().then(setWeapons).catch(() => undefined)
  }, [])

  const runSearch = React.useCallback(async () => {
    setLoading(true)
    setVisibleLimit(PAGE_STEP)
    try {
      const res = await ipcClient.tools.searchRivens({
        weaponSlug: selectedSlug,
        polarity,
        buyoutPolicy: 'direct',
        sortBy: 'price_asc'
      })
      setAuctions(res)
    } catch {
      setAuctions([])
    } finally {
      setLoading(false)
    }
  }, [selectedSlug, polarity])

  React.useEffect(() => {
    void runSearch()
  }, [runSearch])

  const selectedWeapon = React.useMemo(
    () => weapons.find((w) => w.slug === selectedSlug) ?? null,
    [weapons, selectedSlug]
  )
  const weaponThumbUrl = toWfAssetUrl(selectedWeapon?.thumb)

  const weaponSuggestions = React.useMemo(() => {
    const q = normalizeSearchText(weaponQuery)
    if (!q) return []
    return weapons
      .filter(
        (w) =>
          w.slug !== selectedSlug &&
          (normalizeSearchText(w.nameFr).includes(q) || normalizeSearchText(w.nameEn).includes(q))
      )
      .slice(0, 6)
  }, [weapons, weaponQuery, selectedSlug])

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-bold">Contrats — Enchères de Mods Riven</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => void runSearch()}>
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

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-primary" />
          <Input
            value={weaponQuery}
            onChange={(e) => setWeaponQuery(e.target.value)}
            placeholder="Choisir une arme (ex: Torid, Laetum, Burston, Glaive...)"
            className="pl-8"
          />
          {weaponSuggestions.length > 0 && (
            <div className="mt-1 grid grid-cols-2 gap-1 rounded-md border border-border bg-popover p-1.5 shadow-lg">
              {weaponSuggestions.map((w) => {
                const name = lang === 'fr' ? w.nameFr : w.nameEn
                const thumb = toWfAssetUrl(w.thumb)
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      setSelectedSlug(w.slug)
                      setWeaponQuery(name)
                    }}
                    className="flex items-center gap-2 rounded px-2 py-1 text-left text-xs hover:bg-secondary"
                  >
                    {thumb && <img src={thumb} alt="" className="h-6 w-6 shrink-0 object-contain" />}
                    <span className="truncate font-medium">{name}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {(['all', 'madurai', 'vazarin', 'naramon'] as const).map((pol) => (
            <Button
              key={pol}
              size="sm"
              variant={polarity === pol ? 'default' : 'outline'}
              onClick={() => setPolarity(pol)}
              className="capitalize"
            >
              {pol === 'all' ? 'Toutes polarités' : pol}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={getCatalogGridClass(layoutMode, cardSize)}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-xs text-muted-foreground">
            Aucun contrat Riven en vente directe pour cette sélection.
          </CardContent>
        </Card>
      ) : (
        <>
          <RivenAuctionsDisplay
            auctions={auctions.slice(0, visibleLimit)}
            weaponThumbUrl={weaponThumbUrl}
            lang={lang}
            layoutMode={layoutMode}
            cardSize={cardSize}
            onWhisper={(draft) => void triggerWhisper(draft)}
          />
          {auctions.length > visibleLimit && (
            <div className="flex justify-center pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setVisibleLimit((prev) => prev + PAGE_STEP)}
              >
                <ChevronDown className="h-3.5 w-3.5 text-primary" />
                <span>Afficher plus ({auctions.length - visibleLimit} restants)</span>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
