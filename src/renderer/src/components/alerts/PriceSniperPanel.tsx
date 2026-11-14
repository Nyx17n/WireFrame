import * as React from 'react'
import { Crosshair, Plus, Search, Trash2 } from 'lucide-react'
import { toWfAssetUrl, type MarketCatalogItem } from '@shared/schemas/market.schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/stores/useAppStore'
import { normalizeSearchText, useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function PriceSniperPanel(): React.JSX.Element {
  const rules = useAppStore((s) => s.settings.priceAlerts)
  const lang = useAppStore((s) => s.settings.market.language)

  const catalog = useMarketStore((s) => s.catalog)
  const ensureCatalogLoaded = useMarketStore((s) => s.ensureCatalogLoaded)
  const addPriceAlert = useMarketStore((s) => s.addPriceAlert)
  const togglePriceAlert = useMarketStore((s) => s.togglePriceAlert)
  const removePriceAlert = useMarketStore((s) => s.removePriceAlert)
  const navigateActive = useTabsStore((s) => s.navigateActive)

  const [itemQuery, setItemQuery] = React.useState('')
  const [selectedItem, setSelectedItem] = React.useState<MarketCatalogItem | null>(null)
  const [maxPlat, setMaxPlat] = React.useState('100')

  React.useEffect(() => {
    void ensureCatalogLoaded()
  }, [ensureCatalogLoaded])

  const suggestions = React.useMemo(() => {
    const q = normalizeSearchText(itemQuery)
    if (q.length < 2 || selectedItem) return []
    return catalog
      .filter(
        (c) =>
          normalizeSearchText(c.nameFr).includes(q) ||
          normalizeSearchText(c.nameEn).includes(q) ||
          c.slug.includes(q)
      )
      .slice(0, 6)
  }, [catalog, itemQuery, selectedItem])

  const handleCreateRule = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const plat = Number(maxPlat)
    if (!selectedItem || !Number.isFinite(plat) || plat < 1) return
    await addPriceAlert({
      slug: selectedItem.slug,
      nameFr: selectedItem.nameFr,
      nameEn: selectedItem.nameEn,
      thumb: selectedItem.thumb,
      maxPlatinum: Math.round(plat)
    })
    setSelectedItem(null)
    setItemQuery('')
  }

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Crosshair className="h-4 w-4 text-primary" />
          <span>Nouvelle Règle Price Sniper (Arrière-Plan & System Tray)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleCreateRule(e)} className="flex flex-wrap items-start gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={itemQuery}
              onChange={(e) => {
                setSelectedItem(null)
                setItemQuery(e.target.value)
              }}
              placeholder="Choisis un item à surveiller (ex: Glaive Prime Set)..."
              className="pl-8"
            />
            {suggestions.length > 0 && (
              <div className="mt-1 grid grid-cols-1 gap-1 rounded-md border border-border bg-popover p-1.5 shadow-lg sm:grid-cols-2">
                {suggestions.map((c) => {
                  const label = lang === 'fr' ? c.nameFr : c.nameEn
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedItem(c)
                        setItemQuery(label)
                      }}
                      className="rounded px-2 py-1 text-left text-xs hover:bg-secondary"
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={1}
              max={100000}
              value={maxPlat}
              onChange={(e) => setMaxPlat(e.target.value)}
              className="w-28"
              placeholder="Max Plat"
            />
            <Button type="submit" disabled={!selectedItem}>
              <Plus className="h-3.5 w-3.5" />
              <span>Surveiller</span>
            </Button>
          </div>
        </form>

        <div className="mt-3 space-y-2">
          {rules.length === 0 ? (
            <p className="py-2 text-xs text-muted-foreground">
              Aucune surveillance active. Dès qu’une offre En jeu passe sous ton seuil, TennoFrame déclenche le son + une notification Windows + bouton `/w` !
            </p>
          ) : (
            rules.map((r) => {
              const label = lang === 'fr' ? r.nameFr : r.nameEn
              const thumb = toWfAssetUrl(r.thumb)
              return (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background/60 px-3 py-2 text-xs"
                >
                  <div
                    onClick={() => navigateActive({ kind: 'market-item', slug: r.slug }, label)}
                    className="flex min-w-0 cursor-pointer items-center gap-2.5"
                  >
                    {thumb && <img src={thumb} alt="" className="h-8 w-8 shrink-0 object-contain" />}
                    <div className="min-w-0">
                      <div className="truncate font-semibold hover:text-primary">{label}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Seuil : <span className="font-bold text-primary">&le; {r.maxPlatinum} p</span>
                        {r.lastTriggeredPrice !== undefined && r.lastTriggeredSeller && (
                          <span className="ml-2 text-emerald-400">
                            · Vu à {r.lastTriggeredPrice}p ({r.lastTriggeredSeller})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={r.enabled} onCheckedChange={() => void togglePriceAlert(r.id)} />
                    <Button size="icon" variant="ghost" onClick={() => void removePriceAlert(r.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

