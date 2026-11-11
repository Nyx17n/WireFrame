import * as React from 'react'
import { ArrowUpRight, Crown, ExternalLink, Newspaper, Percent, Zap } from 'lucide-react'
import type {
  DarvoDeal,
  GlobalBooster,
  NewsEntry,
  PrimeResurgencePack
} from '@shared/schemas/worldstate.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { ipcClient } from '@/services/ipc-client'
import { useTabsStore } from '@/stores/useTabsStore'
import { formatCountdown } from './hub-countdown'

export function HubNewsDarvoTab({
  news,
  globalBoosters,
  darvoDeals,
  primeResurgence,
  nowMs
}: {
  news: NewsEntry[]
  globalBoosters: GlobalBooster[]
  darvoDeals: DarvoDeal[]
  primeResurgence: {
    location: string
    expiry: string
    packs: PrimeResurgencePack[]
  }
  nowMs: number
}): React.JSX.Element {
  const openTab = useTabsStore((s) => s.openTab)
  const [catFilter, setCatFilter] = React.useState<
    'all' | 'update' | 'prime' | 'stream' | 'community'
  >('all')

  const filteredNews = React.useMemo(() => {
    if (catFilter === 'all') return news
    return news.filter((n) => n.category === catFilter)
  }, [news, catFilter])

  return (
    <div className="space-y-5">
      {globalBoosters.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {globalBoosters.map((gb, idx) => (
            <Card key={`${gb.desc}-${idx}`} className="border-emerald-500/40 bg-emerald-500/5">
              <CardContent className="flex items-center justify-between gap-2 p-3 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  <span>Booster Serveur : {gb.desc}</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-400">
                  {formatCountdown(gb.expiry, nowMs)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-xs">
              <Percent className="h-4 w-4 text-primary" />
              <span>Offre Quotidienne de Darvo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {darvoDeals.length === 0 ? (
              <p className="text-muted-foreground">Aucune offre Darvo active en ce moment.</p>
            ) : (
              darvoDeals.map((deal) => {
                const remaining = Math.max(0, deal.total - deal.sold)
                const stockPct = deal.total > 0 ? Math.round((remaining / deal.total) * 100) : 0
                return (
                  <div key={deal.id} className="space-y-2 rounded-md border border-border/60 bg-background/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <SafeAssetImage
                          src={deal.imageUrl}
                          alt={deal.item}
                          className="h-9 w-9 shrink-0 rounded border border-border/60 bg-card object-contain p-0.5"
                        />
                        <span className="text-sm font-bold">{deal.item}</span>
                      </div>
                      <Badge variant="default">-{deal.discount}%</Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <div>
                        <span className="mr-2 line-through text-muted-foreground">
                          {deal.originalPrice} p
                        </span>
                        <span className="font-bold text-primary">{deal.salePrice} Platinum</span>
                      </div>
                      <span className="font-mono text-muted-foreground">
                        Fin dans {formatCountdown(deal.expiry, nowMs)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-primary" style={{ width: `${stockPct}%` }} />
                      </div>
                      <div className="text-right text-[10px] text-muted-foreground">
                        Stock restant : {remaining} / {deal.total}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-primary" />
                <span>Résurgence Prime — Varzia ({primeResurgence.location})</span>
              </span>
              <span className="font-mono text-[11px] text-primary">
                {formatCountdown(primeResurgence.expiry, nowMs)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {primeResurgence.packs.length === 0 ? (
              <p className="text-muted-foreground">Rotation Résurgence Prime en cours de mise à jour.</p>
            ) : (
              primeResurgence.packs.slice(0, 6).map((pack) => (
                <div
                  key={pack.uniqueName || pack.label}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-border/60 bg-background/50 px-2.5 py-2"
                >
                  <div>
                    <div className="font-semibold">{pack.label}</div>
                    {pack.regalAya > 0 && (
                      <div className="text-[10px] text-muted-foreground">
                        {pack.regalAya} Aya Raffiné
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {pack.matchedSetSlugs.map((ms) => (
                      <Button
                        key={ms.slug}
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1.5 px-2 text-[11px]"
                        onClick={() =>
                          openTab({ kind: 'market-item', slug: ms.slug }, { title: ms.nameFr })
                        }
                      >
                        <SafeAssetImage
                          src={ms.thumb}
                          alt={ms.nameFr}
                          className="h-4 w-4 shrink-0 object-contain"
                        />
                        <span>{ms.nameFr}</span>
                        <ArrowUpRight className="h-3 w-3 text-primary" />
                      </Button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">Actualités Officielles Warframe</h2>
          </div>

          <div className="flex flex-wrap gap-1">
            {(
              [
                ['all', 'Toutes'],
                ['update', 'Mises à jour'],
                ['prime', 'Prime'],
                ['stream', 'Streams'],
                ['community', 'Communauté']
              ] as const
            ).map(([k, label]) => (
              <Button
                key={k}
                size="sm"
                variant={catFilter === k ? 'secondary' : 'ghost'}
                onClick={() => setCatFilter(k)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map((n) => (
            <Card key={n.id} className="overflow-hidden border-border/75">
              <SafeAssetImage
                src={n.imageUrl}
                alt=""
                className="h-28 w-full border-b border-border/60 bg-background/50 object-cover"
              />
              <CardContent className="space-y-2 p-3 text-xs">
                <div className="line-clamp-2 font-semibold">{n.title}</div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {n.category}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => void ipcClient.window.openExternalUrl(n.link)}
                  >
                    <span>Lire</span>
                    <ExternalLink className="h-3 w-3 text-primary" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

