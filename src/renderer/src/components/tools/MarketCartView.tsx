import * as React from 'react'
import { Minus, Plus, RefreshCw, Search, ShoppingCart, Trash2 } from 'lucide-react'
import { toWfAssetUrl } from '@shared/schemas/market.schema'
import type { CartBundleAnalysis } from '@shared/schemas/tools.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { BundledSellersSection } from '@/components/tools/BundledSellersSection'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { normalizeSearchText, useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function MarketCartView(): React.JSX.Element {
  const cart = useAppStore((s) => s.settings.cart)
  const lang = useAppStore((s) => s.settings.market.language)
  const catalog = useMarketStore((s) => s.catalog)
  const ensureCatalogLoaded = useMarketStore((s) => s.ensureCatalogLoaded)
  const addToCart = useMarketStore((s) => s.addToCart)
  const updateCartItem = useMarketStore((s) => s.updateCartItem)
  const removeFromCart = useMarketStore((s) => s.removeFromCart)
  const clearCart = useMarketStore((s) => s.clearCart)
  const triggerWhisper = useMarketStore((s) => s.triggerWhisper)
  const navigateActive = useTabsStore((s) => s.navigateActive)

  const [quickQuery, setQuickQuery] = React.useState('')
  const [analysis, setAnalysis] = React.useState<CartBundleAnalysis | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    void ensureCatalogLoaded()
  }, [ensureCatalogLoaded])

  const runAnalysis = React.useCallback(async (force = false) => {
    setLoading(true)
    try {
      const res = await ipcClient.tools.analyzeCartBundles(force)
      setAnalysis(res)
    } catch {
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void runAnalysis(false)
  }, [cart, runAnalysis])

  const quickSuggestions = React.useMemo(() => {
    const q = normalizeSearchText(quickQuery)
    if (q.length < 2) return []
    return catalog
      .filter(
        (c) =>
          normalizeSearchText(c.nameFr).includes(q) ||
          normalizeSearchText(c.nameEn).includes(q) ||
          c.slug.includes(q)
      )
      .slice(0, 6)
  }, [catalog, quickQuery])

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-bold">Panier Multi-Achats & Trade Bundler ({cart.length})</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" disabled={loading || cart.length === 0} onClick={() => void runAnalysis(true)}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculer en direct</span>
          </Button>
          {cart.length > 0 && (
            <Button size="sm" variant="destructive" onClick={() => void clearCart()}>
              <Trash2 className="h-3.5 w-3.5" />
              <span>Vider</span>
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-primary" />
        <Input
          value={quickQuery}
          onChange={(e) => setQuickQuery(e.target.value)}
          placeholder="Ajouter rapidement un item au panier (ex: Glaive Prime Blade, Arcane Energize...)"
          className="pl-8"
        />
        {quickSuggestions.length > 0 && (
          <div className="mt-1 grid grid-cols-1 gap-1 rounded-md border border-border bg-popover p-1.5 shadow-lg sm:grid-cols-2">
            {quickSuggestions.map((item) => {
              const label = lang === 'fr' ? item.nameFr : item.nameEn
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    void addToCart({ slug: item.slug, quantity: 1 })
                    setQuickQuery('')
                  }}
                  className="flex items-center justify-between rounded px-2.5 py-1.5 text-left text-xs hover:bg-secondary"
                >
                  <span className="truncate font-medium">{label}</span>
                  <Plus className="h-3.5 w-3.5 shrink-0 text-primary" />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {analysis && cart.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="p-3 text-xs">
              <div className="text-muted-foreground">Budget Estimé (Meilleurs En jeu)</div>
              <div className="text-lg font-bold text-primary">{analysis.estimatedTotalPlat} Platinum</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-xs">
              <div className="text-muted-foreground">Taxe d’Échange à prévoir</div>
              <div className="text-lg font-bold">{analysis.totalCreditsTax.toLocaleString('fr-FR')} Crédits</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-xs">
              <div className="text-muted-foreground">Vendeurs Groupés trouvés</div>
              <div className="text-lg font-bold text-emerald-400">{analysis.bundledSellers.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading && !analysis ? (
        <Skeleton className="h-44 w-full" />
      ) : cart.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-xs text-muted-foreground">
            Ton panier est vide. Cherche un item ci-dessus ou clique sur « + Panier » depuis une fiche item !
          </CardContent>
        </Card>
      ) : (
        analysis && (
          <>
            <BundledSellersSection bundles={analysis.bundledSellers} />

            <div className="space-y-2">
              {analysis.lines.map((line) => {
                const label = lang === 'fr' ? line.nameFr : line.nameEn
                const thumb = toWfAssetUrl(line.thumb)
                return (
                  <Card key={line.slug}>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3 text-xs">
                      <div
                        onClick={() => navigateActive({ kind: 'market-item', slug: line.slug }, label)}
                        className="flex min-w-0 cursor-pointer items-center gap-2.5"
                      >
                        {thumb && <img src={thumb} alt="" className="h-9 w-9 shrink-0 object-contain" />}
                        <div className="min-w-0">
                          <div className="truncate font-semibold hover:text-primary">{label}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {line.bestSellerName
                              ? `Meilleur : ${line.bestUnitPrice}p par ${line.bestSellerName}`
                              : 'Aucun vendeur actif avec ce stock'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded border border-border px-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => void updateCartItem(line.slug, { quantity: line.quantity - 1 })}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center font-mono">{line.quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => void updateCartItem(line.slug, { quantity: line.quantity + 1 })}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Badge variant="default">
                          {line.lineTotalPlat !== null ? `${line.lineTotalPlat} p` : '—'}
                        </Badge>

                        {line.bestSellerName && line.bestUnitPrice !== null && (
                          <Button
                            size="sm"
                            onClick={() =>
                              void triggerWhisper({
                                ingameName: line.bestSellerName ?? '',
                                itemNameEn: line.nameEn,
                                itemNameFr: line.nameFr,
                                platinum: line.bestUnitPrice ?? 0,
                                rank: line.desiredRank
                              })
                            }
                          >
                            /w
                          </Button>
                        )}

                        <Button size="icon" variant="ghost" onClick={() => void removeFromCart(line.slug)}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )
      )}
    </div>
  )
}

