import * as React from 'react'
import { AlertTriangle, Award, RefreshCw, User } from 'lucide-react'
import { toWfAssetUrl, type MarketOrder, type MarketUserProfile } from '@shared/schemas/market.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusDot } from '@/components/market/StatusDot'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function MarketUserProfileView({ userSlug }: { userSlug: string }): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const isCompact = useAppStore((s) => s.windowState.isCompactMode)
  const triggerWhisper = useMarketStore((s) => s.triggerWhisper)
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const refreshRevision = useTabsStore((s) => s.refreshRevision)

  const [profile, setProfile] = React.useState<MarketUserProfile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadProfile = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ipcClient.market.getUserProfile(userSlug)
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profil joueur introuvable')
    } finally {
      setLoading(false)
    }
  }, [userSlug])

  React.useEffect(() => {
    void loadProfile()
  }, [loadProfile, refreshRevision])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-xs text-muted-foreground">{error ?? 'Profil introuvable'}</p>
        <Button onClick={() => void loadProfile()}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Réessayer</span>
        </Button>
      </div>
    )
  }

  const avatarUrl = toWfAssetUrl(profile.avatar)

  const renderOrdersCard = (title: string, list: MarketOrder[], isSell: boolean): React.JSX.Element => (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="flex items-center justify-between text-xs">
          <span>{title}</span>
          <Badge variant="secondary">{list.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[420px] space-y-1.5 overflow-y-auto pt-0">
        {list.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">Aucune offre active.</p>
        ) : (
          list.map((o) => {
            const label = lang === 'fr' ? (o.itemNameFr ?? o.itemSlug ?? 'Item') : (o.itemNameEn ?? o.itemSlug ?? 'Item')
            const thumb = toWfAssetUrl(o.itemThumb)
            return (
              <div
                key={o.id}
                className="flex items-center justify-between gap-2 rounded border border-border bg-background/60 px-2.5 py-1.5 text-xs"
              >
                <div
                  onClick={() => o.itemSlug && navigateActive({ kind: 'market-item', slug: o.itemSlug }, label)}
                  className="flex min-w-0 cursor-pointer items-center gap-2 hover:text-primary"
                >
                  {thumb && <img src={thumb} alt="" className="h-7 w-7 shrink-0 object-contain" />}
                  <div className="min-w-0">
                    <div className="truncate font-medium">{label}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Qté: {o.quantity} {o.rank !== undefined ? `· Rang ${o.rank}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="font-mono font-bold text-primary">{o.platinum} p</span>
                  {isSell && (
                    <Button
                      size="sm"
                      onClick={() =>
                        void triggerWhisper({
                          ingameName: profile.ingameName,
                          itemNameEn: o.itemNameEn ?? label,
                          itemNameFr: o.itemNameFr ?? label,
                          platinum: o.platinum,
                          rank: o.rank
                        })
                      }
                    >
                      /w
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-12 w-12 rounded-full border border-border object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <User className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold">{profile.ingameName}</h1>
                <StatusDot status={profile.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  Réputation : {profile.reputation}
                </span>
                {profile.masteryRank > 0 && <span>Palier {profile.masteryRank}</span>}
                <span className="uppercase">{profile.platform}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className={isCompact ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 gap-4 lg:grid-cols-2'}>
        {renderOrdersCard('Il vend (Tu achètes)', profile.sellOrders, true)}
        {renderOrdersCard('Il achète (Tu vends)', profile.buyOrders, false)}
      </div>
    </div>
  )
}

