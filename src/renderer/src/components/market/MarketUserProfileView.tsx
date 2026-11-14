import * as React from 'react'
import { AlertTriangle, PackageOpen, RefreshCw, Search, ShoppingCart } from 'lucide-react'
import { createMarketChipId } from '@shared/schemas/market-search.schema'
import { toWfAssetUrl, type MarketOrder, type MarketUserProfile } from '@shared/schemas/market.schema'
import { formatWfmSubtypeLabel } from '@shared/schemas/wfm-account.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { Skeleton } from '@/components/ui/skeleton'
import { MarketUserHeaderKpis } from '@/components/market/MarketUserHeaderKpis'
import { MarketUserInsightsTab } from '@/components/market/MarketUserInsightsTab'
import { cn } from '@/lib/utils'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { normalizeSearchText, useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

type OrderSortMode = 'price-asc' | 'price-desc' | 'stock-val'

export function MarketUserProfileView({ userSlug }: { userSlug: string }): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const isCompact = useAppStore((s) => s.windowState.isCompactMode)
  const triggerWhisper = useMarketStore((s) => s.triggerWhisper)
  const addToCart = useMarketStore((s) => s.addToCart)
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)
  const refreshRevision = useTabsStore((s) => s.refreshRevision)

  const [profile, setProfile] = React.useState<MarketUserProfile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<'sell' | 'buy' | 'profile'>('sell')
  const [query, setQuery] = React.useState('')
  const [sortMode, setSortMode] = React.useState<OrderSortMode>('price-asc')

  const loadProfile = React.useCallback(
    async (force = false) => {
      setLoading(true)
      setError(null)
      try {
        const data = await ipcClient.market.getUserProfile(userSlug, force)
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Profil joueur introuvable')
      } finally {
        setLoading(false)
      }
    },
    [userSlug]
  )

  React.useEffect(() => {
    void loadProfile(refreshRevision > 0)
  }, [loadProfile, refreshRevision])

  if (loading && !profile) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <h2 className="text-sm font-semibold">Impossible de charger ce profil WFM</h2>
        <p className="text-xs text-muted-foreground">{error ?? 'Profil introuvable'}</p>
        <Button variant="outline" onClick={() => void loadProfile(true)}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Réessayer</span>
        </Button>
      </div>
    )
  }

  const rawList: readonly MarketOrder[] =
    activeTab === 'sell' ? profile.sellOrders : profile.buyOrders
  const q = normalizeSearchText(query)
  const filteredOrders = rawList
    .filter((ord) => {
      if (!q) return true
      return (
        normalizeSearchText(ord.itemNameFr ?? '').includes(q) ||
        normalizeSearchText(ord.itemNameEn ?? '').includes(q) ||
        (ord.itemSlug ?? '').toLowerCase().includes(q)
      )
    })
    .slice()
    .sort((a, b) => {
      if (sortMode === 'price-asc') return a.platinum - b.platinum
      if (sortMode === 'price-desc') return b.platinum - a.platinum
      return b.platinum * b.quantity - a.platinum * a.quantity
    })

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <MarketUserHeaderKpis
        profile={profile}
        isCompact={isCompact}
        onOpenChipSearch={() =>
          navigateActive({
            kind: 'market-catalog',
            chips: [
              {
                id: createMarketChipId('seller', profile.slug),
                kind: 'seller',
                value: profile.slug,
                label: profile.ingameName
              }
            ]
          })
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant={activeTab === 'sell' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sell')}
          >
            💰 Ses Ventes ({profile.sellOrders.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'buy' ? 'default' : 'outline'}
            onClick={() => setActiveTab('buy')}
          >
            🛒 Ses Achats ({profile.buyOrders.length})
          </Button>
          {!isCompact && (
            <Button
              size="sm"
              variant={activeTab === 'profile' ? 'default' : 'outline'}
              onClick={() => setActiveTab('profile')}
            >
              ⭐ Profil Complet & Avis
            </Button>
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => void loadProfile(true)}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          <span>Actualiser</span>
        </Button>
      </div>

      {activeTab === 'profile' ? (
        <MarketUserInsightsTab profile={profile} />
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Filtrer les annonces FR/EN de ${profile.ingameName}…`}
                className="pl-8"
              />
            </div>

            <div className="flex items-center gap-1">
              {(
                [
                  ['price-asc', 'Prix ↑'],
                  ['price-desc', 'Prix ↓'],
                  ['stock-val', 'Valeur stock']
                ] as const
              ).map(([m, lbl]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSortMode(m)}
                  className={cn(
                    'rounded border px-2.5 py-1.5 text-xs font-medium transition-colors',
                    sortMode === m
                      ? 'border-primary bg-primary/15 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  )}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-10 text-center">
              <PackageOpen className="h-8 w-8 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">
                {rawList.length === 0
                  ? `${profile.ingameName} n’a aucun ${activeTab === 'sell' ? 'objet en vente' : 'ordre d’achat'} actif.`
                  : 'Aucune annonce ne correspond à ce filtre.'}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredOrders.map((ord) => {
                const titleFr = ord.itemNameFr ?? ord.itemSlug ?? 'Item'
                const titleEn = ord.itemNameEn ?? titleFr
                const primaryLabel = lang === 'fr' ? titleFr : titleEn
                const thumbUrl = toWfAssetUrl(ord.itemThumb)

                return (
                  <div
                    key={ord.id}
                    className="flex flex-wrap items-center justify-between gap-2.5 rounded-md border border-border bg-card/85 p-2.5 transition-colors hover:border-primary/40"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <SafeAssetImage
                        src={thumbUrl}
                        alt={primaryLabel}
                        className="h-10 w-10 shrink-0 rounded border border-border bg-background/80 object-contain p-1"
                      />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            if (!ord.itemSlug) return
                            const r = { kind: 'market-item' as const, slug: ord.itemSlug }
                            if (e.ctrlKey || e.metaKey) openTab(r, { title: primaryLabel })
                            else navigateActive(r, primaryLabel)
                          }}
                          className="block max-w-full truncate text-left text-xs font-semibold text-foreground hover:text-primary hover:underline"
                        >
                          {titleFr}
                        </button>
                        {!isCompact && titleEn !== titleFr && (
                          <div className="truncate text-[11px] text-muted-foreground">{titleEn}</div>
                        )}
                        <div className="mt-0.5 flex flex-wrap items-center gap-1">
                          {ord.rank !== undefined && (
                            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                              Rang {ord.rank}
                              {ord.itemMaxRank ? `/${ord.itemMaxRank}` : ''}
                            </Badge>
                          )}
                          {ord.subtype && (
                            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                              {formatWfmSubtypeLabel(ord.subtype)}
                            </Badge>
                          )}
                          {(ord.amberStars !== undefined || ord.cyanStars !== undefined) && (
                            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                              {ord.amberStars ?? 0}★A · {ord.cyanStars ?? 0}★C
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex h-7 items-center rounded-md border border-input bg-background/80 px-3 font-mono text-xs font-bold text-primary">
                        {ord.platinum} Plat
                      </div>
                      <div className="inline-flex h-7 items-center rounded-md border border-input bg-background/80 px-2.5 font-mono text-[11px] font-semibold">
                        ×{ord.quantity}
                      </div>

                      {ord.itemSlug && activeTab === 'sell' && !isCompact && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void addToCart({
                              slug: ord.itemSlug!,
                              quantity: 1,
                              ...(ord.rank !== undefined ? { desiredRank: ord.rank } : {})
                            })
                          }
                          className="h-7 gap-1 px-2 text-xs"
                          title="Ajouter au Panier Bundler"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      {activeTab === 'sell' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            void triggerWhisper({
                              ingameName: profile.ingameName,
                              itemNameEn: titleEn,
                              itemNameFr: titleFr,
                              platinum: ord.platinum,
                              rank: ord.rank
                            })
                          }
                          className="h-7 gap-1 border border-emerald-500/40 bg-emerald-500/15 px-2.5 text-[11px] text-emerald-300 hover:bg-emerald-500/25"
                        >
                          <span>{isCompact ? '/w' : 'Copier /w'}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
