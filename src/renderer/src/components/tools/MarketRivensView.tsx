import * as React from 'react'
import { Flame, RefreshCw, Search } from 'lucide-react'
import { toWfAssetUrl } from '@shared/schemas/market.schema'
import type { RivenAuctionCard, RivenWeaponSummary } from '@shared/schemas/tools.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusDot } from '@/components/market/StatusDot'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { normalizeSearchText, useMarketStore } from '@/stores/useMarketStore'

export function MarketRivensView(): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const triggerWhisper = useMarketStore((s) => s.triggerWhisper)

  const [weapons, setWeapons] = React.useState<RivenWeaponSummary[]>([])
  const [weaponQuery, setWeaponQuery] = React.useState('Torid')
  const [selectedSlug, setSelectedSlug] = React.useState('torid')
  const [polarity, setPolarity] = React.useState<'all' | 'madurai' | 'vazarin' | 'naramon'>('all')
  const [auctions, setAuctions] = React.useState<RivenAuctionCard[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    void ipcClient.tools.getRivenWeapons().then(setWeapons).catch(() => undefined)
  }, [])

  const runSearch = React.useCallback(async () => {
    setLoading(true)
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
        <Button size="sm" variant="outline" onClick={() => void runSearch()}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Actualiser</span>
        </Button>
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {auctions.map((auc) => {
            const wName = lang === 'fr' ? auc.weaponNameFr : auc.weaponNameEn
            const fullRivenTitle = `${wName} ${auc.rivenName}`
            const price = auc.buyoutPrice ?? auc.startingPrice
            return (
              <Card key={auc.id}>
                <CardContent className="space-y-2.5 p-3.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold capitalize text-foreground">{fullRivenTitle}</div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span>MR {auc.masteryLevel}</span>
                        <span>· Rang {auc.modRank}</span>
                        <span>· {auc.reRolls} relances</span>
                        <span className="capitalize">· {auc.polarity}</span>
                      </div>
                    </div>
                    <Badge variant="default" className="font-mono text-xs">
                      {price} p
                    </Badge>
                  </div>

                  <div className="space-y-1 rounded border border-border bg-background/60 p-2">
                    {auc.attributes.map((attr) => (
                      <div
                        key={attr.slug}
                        className={`flex items-center justify-between font-medium ${
                          attr.positive ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        <span>{lang === 'fr' ? attr.labelFr : attr.labelEn}</span>
                        <span className="font-mono">
                          {attr.value > 0 ? `+${attr.value}` : attr.value}%
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{auc.owner.ingameName}</span>
                      <StatusDot status={auc.owner.status} />
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        void triggerWhisper({
                          ingameName: auc.owner.ingameName,
                          itemNameEn: `${auc.weaponNameEn} ${auc.rivenName} (Riven)`,
                          itemNameFr: `${auc.weaponNameFr} ${auc.rivenName} (Riven)`,
                          platinum: price,
                          rank: auc.modRank
                        })
                      }
                    >
                      /w ({price}p)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

