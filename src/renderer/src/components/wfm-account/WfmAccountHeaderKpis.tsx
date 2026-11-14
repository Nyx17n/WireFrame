import * as React from 'react'
import { ExternalLink, LogOut, PlusCircle, ShieldCheck } from 'lucide-react'
import { toWfAssetUrl } from '@shared/schemas/market.schema'
import type { WfmAccountOverview, WfmPresenceStatus } from '@shared/schemas/wfm-account.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { cn } from '@/lib/utils'
import { ipcClient } from '@/services/ipc-client'
import { useWfmAccountStore } from '@/stores/useWfmAccountStore'

interface WfmAccountHeaderKpisProps {
  overview: WfmAccountOverview
  isCompact: boolean
}

export function WfmAccountHeaderKpis({
  overview,
  isCompact
}: WfmAccountHeaderKpisProps): React.JSX.Element {
  const setStatus = useWfmAccountStore((s) => s.setStatus)
  const signOut = useWfmAccountStore((s) => s.signOut)
  const openCreateOrderModal = useWfmAccountStore((s) => s.openCreateOrderModal)

  const { user, status, kpis } = overview
  const avatarUrl = toWfAssetUrl(user.avatar)
  const publicUrl = `https://warframe.market/fr/profile/${encodeURIComponent(user.slug)}`

  if (isCompact) {
    return (
      <Card className="border-primary/35 bg-card/90">
        <CardContent className="space-y-2.5 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-bold">{user.ingameName}</span>
                <span className="font-mono text-xs text-amber-400">★ +{kpis.reputation}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                {kpis.totalSellCount} ventes ({kpis.totalSellPlatinum.toLocaleString('fr-FR')}p) ·
                Session +{kpis.sessionPlatinumEarned}p
              </div>
            </div>
            <Button size="sm" onClick={() => openCreateOrderModal({ defaultType: 'sell' })}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Vendre</span>
            </Button>
          </div>

          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              {(
                [
                  ['ingame', '🟢 En jeu'],
                  ['online', '🟣 En ligne'],
                  ['invisible', '⚫ Invis.']
                ] as const
              ).map(([st, lbl]) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => void setStatus(st)}
                  className={cn(
                    'rounded border px-2 py-0.5 text-[11px] font-medium',
                    status === st
                      ? 'border-primary bg-primary/15 text-foreground'
                      : 'border-border bg-background/60 text-muted-foreground'
                  )}
                >
                  {lbl}
                </button>
              ))}
            </div>
            <Button size="sm" variant="ghost" onClick={() => void signOut()} title="Se déconnecter">
              <LogOut className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statuses: ReadonlyArray<[WfmPresenceStatus, string]> = [
    ['ingame', '🟢 En jeu (Prioritaire)'],
    ['online', '🟣 En ligne'],
    ['invisible', '⚫ Invisible']
  ]

  return (
    <div className="space-y-3">
      <Card className="border-primary/35">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex min-w-0 items-center gap-3.5">
            {avatarUrl ? (
              <SafeAssetImage
                src={avatarUrl}
                alt={user.ingameName}
                className="h-16 w-16 shrink-0 rounded-full border-2 border-primary/50 bg-background object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-primary/50 bg-primary/15 font-mono text-lg font-bold text-primary">
                {user.ingameName.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold">{user.ingameName}</h1>
                {user.verified && (
                  <Badge variant="default" className="gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Vérifié en jeu</span>
                  </Badge>
                )}
                <Badge variant="secondary">
                  {user.platform.toUpperCase()} {user.crossplay ? '· Crossplay' : ''}
                </Badge>
                {user.masteryRank > 0 && <Badge variant="outline">PM {user.masteryRank}</Badge>}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Statut Warframe Market :</span>
                {statuses.map(([st, lbl]) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => void setStatus(st)}
                    className={cn(
                      'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                      status === st
                        ? 'border-primary bg-primary/15 text-foreground'
                        : 'border-border bg-background/70 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => openCreateOrderModal({ defaultType: 'sell' })}>
              <PlusCircle className="h-4 w-4" />
              <span>Mettre un item en vente</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void ipcClient.window.openExternalUrl(publicUrl)}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Profil WFM</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => void signOut()}>
              <LogOut className="h-3.5 w-3.5 text-destructive" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-amber-500/30 bg-amber-500/5 p-3">
          <div className="text-[11px] text-muted-foreground">⭐ Réputation Warframe Market</div>
          <div className="mt-1 font-mono text-lg font-bold text-amber-400">
            +{kpis.reputation.toLocaleString('fr-FR')}
          </div>
          <div className="text-[11px] text-muted-foreground">Avis positifs vérifiés</div>
        </Card>

        <Card className="border-cyan-500/30 bg-cyan-500/5 p-3">
          <div className="text-[11px] text-muted-foreground">💎 Valeur Totale en Vente</div>
          <div className="mt-1 font-mono text-lg font-bold text-cyan-300">
            {kpis.totalSellPlatinum.toLocaleString('fr-FR')} Plat
          </div>
          <div className="text-[11px] text-muted-foreground">
            {kpis.visibleSellPlatinum.toLocaleString('fr-FR')}p visibles ·{' '}
            {kpis.hiddenSellPlatinum.toLocaleString('fr-FR')}p masqués
          </div>
        </Card>

        <Card className="border-primary/30 bg-primary/5 p-3">
          <div className="text-[11px] text-muted-foreground">📦 Annonces Actives</div>
          <div className="mt-1 font-mono text-lg font-bold text-foreground">
            {kpis.totalSellCount} Ventes · {kpis.totalBuyCount} Achats
          </div>
          <div className="text-[11px] text-muted-foreground">
            {kpis.visibleSellCount} annonces visibles sur le marché
          </div>
        </Card>

        <Card className="border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="text-[11px] text-muted-foreground">🔥 Bilan de la Session</div>
          <div className="mt-1 font-mono text-lg font-bold text-emerald-400">
            {kpis.sessionSalesCount} vendus (+{kpis.sessionPlatinumEarned}p)
          </div>
          <div className="text-[11px] text-muted-foreground">
            Clôturés en 1 clic via « Vendu -1 »
          </div>
        </Card>
      </div>
    </div>
  )
}
