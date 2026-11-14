import * as React from 'react'
import { ArrowUpRight, Coins, Crosshair, ExternalLink, MapPin, Package, Search, Store } from 'lucide-react'
import type { CodexItemDetail, VendorOfferingCategory } from '@shared/schemas/codex.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { buildVendorOfferingOverlayEntry } from '@/lib/codex-overlay-entries'
import { useAppStore } from '@/stores/useAppStore'
import { useFarmOverlayStore } from '@/stores/useFarmOverlayStore'
import { normalizeSearchText, useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

type ShopCatFilter = 'all' | VendorOfferingCategory

const SHOP_CATS: ReadonlyArray<{ id: ShopCatFilter; label: string }> = [
  { id: 'all', label: 'Tout' },
  { id: 'equipment', label: 'Warframes & Armes' },
  { id: 'mod_arcane', label: 'Mods & Arcanes' },
  { id: 'resource_relic', label: 'Ressources & Reliques' },
  { id: 'cosmetic_misc', label: 'Cosmétiques & Divers' }
]

export function CodexVendorDetailSection({
  detail
}: {
  detail: CodexItemDetail
}): React.JSX.Element | null {
  const vendor = detail.vendorInfo
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)
  const catalog = useMarketStore((s) => s.catalog)
  const ensureCatalogLoaded = useMarketStore((s) => s.ensureCatalogLoaded)
  const overlayEnabled = useAppStore((s) => s.settings.extensions.codexFarmOverlay)
  const pinnedEntries = useFarmOverlayStore((s) => s.liveState.pinnedEntries)
  const toggleEntry = useFarmOverlayStore((s) => s.toggleEntry)

  const [shopQuery, setShopQuery] = React.useState('')
  const [catFilter, setCatFilter] = React.useState<ShopCatFilter>('all')
  const [visibleLimit, setVisibleLimit] = React.useState(48)

  React.useEffect(() => {
    if (vendor?.offerings.some((o) => o.isTradable)) {
      void ensureCatalogLoaded()
    }
  }, [vendor, ensureCatalogLoaded])

  const pinnedIds = React.useMemo(
    () => new Set(pinnedEntries.map((e) => e.entryId)),
    [pinnedEntries]
  )

  const wfmSlugByEn = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const c of catalog) {
      map.set(normalizeSearchText(c.nameEn), c.slug)
    }
    return map
  }, [catalog])

  if (!vendor) return null

  const q = normalizeSearchText(shopQuery)
  const filtered = vendor.offerings.filter((o) => {
    if (catFilter !== 'all' && o.category !== catFilter) return false
    if (q) {
      return (
        normalizeSearchText(o.nameFr).includes(q) || normalizeSearchText(o.nameEn).includes(q)
      )
    }
    return true
  })

  const shown = filtered.slice(0, visibleLimit)
  const remaining = Math.max(0, filtered.length - shown.length)

  return (
    <div className="space-y-4">
      <Card className="space-y-3 border-emerald-500/35 bg-emerald-950/10 p-4">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
          <MapPin className="h-3.5 w-3.5" />
          <span>Où trouver ce Marchand & Ses Devises</span>
        </h2>

        <div className="grid grid-cols-1 gap-2.5 text-xs md:grid-cols-2">
          <div className="space-y-1 rounded-lg border border-border/60 bg-background/60 p-3">
            <div>
              <strong className="text-primary">Planète / Région :</strong> {vendor.planetFr}
            </div>
            <div>
              <strong className="text-primary">Hub / Relais :</strong> {vendor.hubFr}
            </div>
            <div className="text-muted-foreground">
              <strong className="text-foreground">Emplacement exact :</strong> {vendor.zoneFr}
            </div>
            {vendor.unlockQuestFr && (
              <div className="text-muted-foreground">
                <strong className="text-foreground">Prérequis :</strong> {vendor.unlockQuestFr}
              </div>
            )}
          </div>

          <div className="space-y-1.5 rounded-lg border border-border/60 bg-background/60 p-3">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <Coins className="h-3.5 w-3.5" />
              <span>Monnaies & Réputations acceptées</span>
            </div>
            {vendor.currencies.map((curr) => (
              <div key={curr.nameFr} className="text-[11px]">
                <span className="font-semibold text-foreground">{curr.nameFr}</span>
                {curr.howToGetFr && (
                  <span className="text-muted-foreground"> — {curr.howToGetFr}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-300">
            <Store className="h-3.5 w-3.5" />
            <span>Ce qu’il vend — Boutique complète ({vendor.offerings.length} articles)</span>
          </h2>

          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={shopQuery}
              onChange={(e) => {
                setShopQuery(e.target.value)
                setVisibleLimit(48)
              }}
              placeholder="Chercher un objet dans cette boutique…"
              className="h-7 pl-8 text-xs"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {SHOP_CATS.map((sc) => (
            <Button
              key={sc.id}
              size="sm"
              variant={catFilter === sc.id ? 'default' : 'outline'}
              className="h-7 px-2.5 text-[11px]"
              onClick={() => {
                setCatFilter(sc.id)
                setVisibleLimit(48)
              }}
            >
              {sc.label}
            </Button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Aucun article vendu ne correspond à votre filtre.
          </p>
        ) : (
          <div className="space-y-2">
            {shown.map((off) => {
              const entry = buildVendorOfferingOverlayEntry(detail, off)
              const isPinned = pinnedIds.has(entry.entryId)
              const cleanEn = normalizeSearchText(off.nameEn.replace(/ blueprint$/i, ''))
              const marketSlug = off.isTradable
                ? wfmSlugByEn.get(cleanEn) ?? wfmSlugByEn.get(`${cleanEn} set`) ?? null
                : null

              return (
                <div
                  key={off.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/65 bg-background/50 px-3 py-2 text-xs"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <SafeAssetImage
                      src={off.imageUrl}
                      alt={off.nameFr}
                      className="h-9 w-9 shrink-0 rounded border border-border/60 bg-card object-contain p-1"
                      fallback={
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border/60 bg-card">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      }
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-foreground">{off.nameFr}</span>
                        {off.rankRequiredFr && (
                          <Badge variant="outline" className="text-[10px]">
                            {off.rankRequiredFr}
                          </Badge>
                        )}
                      </div>
                      {off.nameEn !== off.nameFr && (
                        <div className="truncate text-[10px] text-muted-foreground">
                          {off.nameEn}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {off.costs.map((c, idx) => (
                      <Badge
                        key={`${c.currencyFr}-${idx}`}
                        variant="outline"
                        className="border-amber-500/40 bg-amber-500/10 font-mono text-[10px] text-amber-200"
                      >
                        {c.amount > 0 ? `${c.amount.toLocaleString('fr-FR')} ` : ''}
                        {c.currencyFr}
                      </Badge>
                    ))}

                    {off.linkedCodexId && off.linkedCategory && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-[11px]"
                        onClick={(e) => {
                          const route = {
                            kind: 'codex-detail' as const,
                            category: off.linkedCategory!,
                            slug: off.linkedCodexId!
                          }
                          if (e.ctrlKey || e.metaKey) openTab(route, { title: off.nameFr })
                          else navigateActive(route, `Codex : ${off.nameFr}`)
                        }}
                      >
                        <ArrowUpRight className="h-3 w-3" />
                        <span>Codex</span>
                      </Button>
                    )}

                    {marketSlug && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 px-2 text-[11px]"
                        onClick={(e) => {
                          const route = { kind: 'market-item' as const, slug: marketSlug }
                          if (e.ctrlKey || e.metaKey) openTab(route, { title: off.nameFr })
                          else navigateActive(route, off.nameFr)
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Prix Plat</span>
                      </Button>
                    )}

                    {overlayEnabled && (
                      <Button
                        size="icon"
                        variant={isPinned ? 'default' : 'outline'}
                        className="h-7 w-7"
                        title="Épingler cet achat à l'Overlay Farm"
                        onClick={() => void toggleEntry(entry, true)}
                      >
                        <Crosshair className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}

            {remaining > 0 && (
              <div className="flex justify-center pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setVisibleLimit((prev) => prev + 48)}
                >
                  Afficher plus ({remaining} restant{remaining > 1 ? 's' : ''})
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

