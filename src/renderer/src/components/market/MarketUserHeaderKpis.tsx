import * as React from 'react'
import { ExternalLink, Search, ShieldCheck } from 'lucide-react'
import { toWfAssetUrl, type MarketUserProfile, type SellerOnlineStatus } from '@shared/schemas/market.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { cn } from '@/lib/utils'
import { ipcClient } from '@/services/ipc-client'

interface MarketUserHeaderKpisProps {
  readonly profile: MarketUserProfile
  readonly isCompact: boolean
  readonly onOpenChipSearch: () => void
}

const STATUS_PILLS: ReadonlyArray<[SellerOnlineStatus, string, string]> = [
  ['ingame', '🟢 En jeu', 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'],
  ['online', '🟣 En ligne', 'border-violet-500/50 bg-violet-500/15 text-violet-200'],
  ['offline', '⚫ Hors-ligne', 'border-border bg-secondary/60 text-muted-foreground']
]

export function MarketUserHeaderKpis({
  profile,
  isCompact,
  onOpenChipSearch
}: MarketUserHeaderKpisProps): React.JSX.Element {
  const avatarUrl = toWfAssetUrl(profile.avatar)
  const publicUrl = `https://warframe.market/fr/profile/${encodeURIComponent(profile.slug)}`

  const totalSellPlat = profile.sellOrders.reduce((acc, o) => acc + o.platinum * o.quantity, 0)
  const totalSellUnits = profile.sellOrders.reduce((acc, o) => acc + o.quantity, 0)
  const totalBuyPlat = profile.buyOrders.reduce((acc, o) => acc + o.platinum * o.quantity, 0)

  if (isCompact) {
    return (
      <Card className="border-primary/35 bg-card/90">
        <CardContent className="space-y-2.5 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-bold">{profile.ingameName}</span>
                <span className="font-mono text-xs text-amber-400">★ +{profile.reputation}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                {profile.sellOrders.length} ventes ({totalSellPlat.toLocaleString('fr-FR')}p) ·{' '}
                {profile.buyOrders.length} achats
              </div>
            </div>
            <Button size="sm" onClick={onOpenChipSearch}>
              <Search className="h-3.5 w-3.5" />
              <span>Croiser</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <Card className="border-primary/35">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex min-w-0 items-center gap-3.5">
            {avatarUrl ? (
              <SafeAssetImage
                src={avatarUrl}
                alt={profile.ingameName}
                className="h-16 w-16 shrink-0 rounded-full border-2 border-primary/50 bg-background object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-primary/50 bg-primary/15 font-mono text-lg font-bold text-primary">
                {profile.ingameName.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold">{profile.ingameName}</h1>
                {profile.verified && (
                  <Badge variant="default" className="gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Vérifié en jeu</span>
                  </Badge>
                )}
                <Badge variant="secondary">
                  {profile.platform.toUpperCase()} {profile.crossplay ? '· Crossplay' : ''}
                </Badge>
                {profile.masteryRank > 0 && (
                  <Badge variant="outline">PM {profile.masteryRank}</Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Statut Warframe Market :</span>
                {STATUS_PILLS.map(([st, lbl, activeCls]) => {
                  const isActive = profile.status === st
                  return (
                    <span
                      key={st}
                      className={cn(
                        'rounded-md border px-2.5 py-1 text-xs font-medium',
                        isActive
                          ? activeCls
                          : 'border-border/50 bg-background/40 text-muted-foreground/50'
                      )}
                    >
                      {lbl}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={onOpenChipSearch}>
              <Search className="h-4 w-4" />
              <span>Filtrer sa boutique par pastilles</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void ipcClient.window.openExternalUrl(publicUrl)}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Profil WFM</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-amber-500/30 bg-amber-500/5 p-3">
          <div className="text-[11px] text-muted-foreground">⭐ Réputation Warframe Market</div>
          <div className="mt-1 font-mono text-lg font-bold text-amber-400">
            +{profile.reputation.toLocaleString('fr-FR')}
          </div>
          <div className="text-[11px] text-muted-foreground">Avis positifs vérifiés</div>
        </Card>

        <Card className="border-cyan-500/30 bg-cyan-500/5 p-3">
          <div className="text-[11px] text-muted-foreground">💎 Valeur Totale en Vente</div>
          <div className="mt-1 font-mono text-lg font-bold text-cyan-300">
            {totalSellPlat.toLocaleString('fr-FR')} Plat
          </div>
          <div className="text-[11px] text-muted-foreground">
            {totalSellUnits.toLocaleString('fr-FR')} unité(s) disponibles à l’achat
          </div>
        </Card>

        <Card className="border-primary/30 bg-primary/5 p-3">
          <div className="text-[11px] text-muted-foreground">📦 Annonces Actives</div>
          <div className="mt-1 font-mono text-lg font-bold text-foreground">
            {profile.sellOrders.length} Ventes · {profile.buyOrders.length} Achats
          </div>
          <div className="text-[11px] text-muted-foreground">
            Annonces visibles publiquement sur le marché
          </div>
        </Card>

        <Card className="border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="text-[11px] text-muted-foreground">🤝 Budget Ordres d’Achat (WTB)</div>
          <div className="mt-1 font-mono text-lg font-bold text-emerald-400">
            {totalBuyPlat.toLocaleString('fr-FR')} Plat
          </div>
          <div className="text-[11px] text-muted-foreground">
            Items que {profile.ingameName} cherche à acheter
          </div>
        </Card>
      </div>
    </div>
  )
}
