import * as React from 'react'
import { Award, Layers, User } from 'lucide-react'
import type { MarketUserProfile } from '@shared/schemas/market.schema'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function MarketUserInsightsTab({
  profile
}: {
  readonly profile: MarketUserProfile
}): React.JSX.Element {
  const breakdown = profile.portfolioBreakdown ?? []
  const recentReviews = profile.recentReviews ?? []

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Layers className="h-4 w-4 text-primary" />
              <span>Répartition de son Stock en Vente</span>
            </div>

            {breakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucune donnée de stock disponible.</p>
            ) : (
              <div className="space-y-3">
                {breakdown.map((bucket) => (
                  <div key={bucket.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">
                        {bucket.labelFr}{' '}
                        <span className="text-muted-foreground">({bucket.ordersCount})</span>
                      </span>
                      <span className="font-mono font-semibold text-primary">
                        {bucket.totalPlatinum.toLocaleString('fr-FR')}p ({bucket.sharePercent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${Math.max(bucket.ordersCount > 0 ? 4 : 0, bucket.sharePercent)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2.5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <User className="h-4 w-4 text-primary" />
              <span>Informations Complètes du Joueur</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded border border-border/60 bg-background/60 p-2">
                <div className="text-[10px] text-muted-foreground">Pseudo en jeu</div>
                <div className="font-semibold">{profile.ingameName}</div>
              </div>
              <div className="rounded border border-border/60 bg-background/60 p-2">
                <div className="text-[10px] text-muted-foreground">Slug warframe.market</div>
                <div className="font-mono">{profile.slug}</div>
              </div>
              <div className="rounded border border-border/60 bg-background/60 p-2">
                <div className="text-[10px] text-muted-foreground">Plateforme & Crossplay</div>
                <div className="font-semibold">
                  {profile.platform.toUpperCase()} · {profile.crossplay ? 'Activé' : 'Désactivé'}
                </div>
              </div>
              <div className="rounded border border-border/60 bg-background/60 p-2">
                <div className="text-[10px] text-muted-foreground">Palier de Maîtrise & Langue</div>
                <div className="font-semibold">
                  PM {profile.masteryRank}
                  {profile.locale ? ` · ${profile.locale.toUpperCase()}` : ''}
                </div>
              </div>
            </div>

            {profile.about && (
              <div className="rounded border border-border/60 bg-background/50 p-2.5 text-xs text-muted-foreground">
                <div className="mb-1 text-[10px] font-semibold uppercase text-foreground/80">
                  Présentation du profil
                </div>
                <p className="whitespace-pre-line line-clamp-6">{profile.about}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Award className="h-4 w-4 text-amber-400" />
              <span>Derniers Avis de Réputation Reçus</span>
            </div>
            <Badge variant="secondary">+{profile.reputation} ★</Badge>
          </div>

          {recentReviews.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              Aucun avis textuel récent affiché sur ce profil public (réputation totale : +
              {profile.reputation}).
            </div>
          ) : (
            <div className="space-y-2">
              {recentReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-md border border-border/70 bg-background/60 p-2.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-emerald-400">
                      {rev.positive ? '+1 ★' : '-1'} {rev.authorName}
                    </span>
                    {rev.dateIso && (
                      <span className="text-[10px] text-muted-foreground">
                        {rev.dateIso.slice(0, 10)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-muted-foreground">{rev.text}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
