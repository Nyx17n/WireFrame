import * as React from 'react'
import { RefreshCw, Star, Trash2 } from 'lucide-react'
import { toWfAssetUrl, type MarketOrder } from '@shared/schemas/market.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function MarketFavoritesView(): React.JSX.Element {
  const favorites = useAppStore((s) => s.settings.favorites)
  const lang = useAppStore((s) => s.settings.market.language)
  const catalog = useMarketStore((s) => s.catalog)
  const ensureCatalogLoaded = useMarketStore((s) => s.ensureCatalogLoaded)
  const toggleFavorite = useMarketStore((s) => s.toggleFavorite)
  const triggerWhisper = useMarketStore((s) => s.triggerWhisper)
  const navigateActive = useTabsStore((s) => s.navigateActive)

  const [bestOrders, setBestOrders] = React.useState<Record<string, MarketOrder | null>>({})
  const [refreshing, setRefreshing] = React.useState(false)

  React.useEffect(() => {
    void ensureCatalogLoaded()
  }, [ensureCatalogLoaded])

  const refreshPrices = React.useCallback(async () => {
    if (favorites.length === 0) return
    setRefreshing(true)
    const next: Record<string, MarketOrder | null> = {}
    for (const slug of favorites.slice(0, 25)) {
      try {
        const orders = await ipcClient.market.getItemOrders(slug, true)
        const best =
          orders
            .filter((o) => o.type === 'sell' && o.user?.status === 'ingame')
            .sort((a, b) => a.platinum - b.platinum)[0] ?? null
        next[slug] = best
      } catch {
        next[slug] = null
      }
    }
    setBestOrders(next)
    setRefreshing(false)
  }, [favorites])

  React.useEffect(() => {
    void refreshPrices()
  }, [refreshPrices])

  const catalogBySlug = React.useMemo(
    () => new Map(catalog.map((i) => [i.slug, i])),
    [catalog]
  )

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <h1 className="text-sm font-bold">Mes Favoris Marché ({favorites.length})</h1>
        </div>
        {favorites.length > 0 && (
          <Button size="sm" variant="outline" disabled={refreshing} onClick={() => void refreshPrices()}>
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser les prix En jeu</span>
          </Button>
        )}
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-xs text-muted-foreground">
            Aucun favori enregistré. Clique sur l’étoile d’un item dans le Catalogue ou utilise Ctrl+D sur une fiche item !
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {favorites.map((slug) => {
            const cat = catalogBySlug.get(slug)
            const nameFr = cat?.nameFr ?? slug
            const nameEn = cat?.nameEn ?? slug
            const label = lang === 'fr' ? nameFr : nameEn
            const thumbUrl = toWfAssetUrl(cat?.thumb)
            const best = bestOrders[slug]

            return (
              <Card key={slug} className="transition-colors hover:border-primary/50">
                <CardContent className="flex items-center justify-between gap-2 p-3 text-xs">
                  <div
                    onClick={() => navigateActive({ kind: 'market-item', slug }, label)}
                    className="flex min-w-0 cursor-pointer items-center gap-2.5"
                  >
                    {thumbUrl && <img src={thumbUrl} alt="" className="h-9 w-9 shrink-0 object-contain" />}
                    <div className="min-w-0">
                      <div className="truncate font-semibold hover:text-primary">{label}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {best
                          ? `Meilleur En jeu : ${best.user?.ingameName ?? 'Vendeur'}`
                          : refreshing
                            ? 'Scan en cours...'
                            : 'Aucune offre En jeu'}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {best && (
                      <>
                        <Badge variant="default">{best.platinum} p</Badge>
                        <Button
                          size="sm"
                          onClick={() =>
                            void triggerWhisper({
                              ingameName: best.user?.ingameName ?? '',
                              itemNameEn: nameEn,
                              itemNameFr: nameFr,
                              platinum: best.platinum,
                              rank: best.rank
                            })
                          }
                        >
                          /w
                        </Button>
                      </>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Retirer des favoris"
                      onClick={() => void toggleFavorite(slug)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
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

