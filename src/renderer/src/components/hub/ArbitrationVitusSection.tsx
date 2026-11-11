import * as React from 'react'
import { ArrowUpRight, Coins, RefreshCw, Shield, Swords } from 'lucide-react'
import { toWfAssetUrl } from '@shared/schemas/market.schema'
import type {
  ArbitrationSnapshot,
  SteelPathSnapshot,
  VitusModPriceEntry
} from '@shared/schemas/worldstate.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { ARBITRATION_VITUS_ITEMS } from '@shared/data/duviri-rotations'
import { ipcClient } from '@/services/ipc-client'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'
import { formatCountdown } from './hub-countdown'

export function ArbitrationVitusSection({
  arbitration,
  steelPath,
  nowMs
}: {
  arbitration: ArbitrationSnapshot
  steelPath: SteelPathSnapshot
  nowMs: number
}): React.JSX.Element {
  const openTab = useTabsStore((s) => s.openTab)
  const catalog = useMarketStore((s) => s.catalog)
  const ensureCatalogLoaded = useMarketStore((s) => s.ensureCatalogLoaded)
  const [vitusPrices, setVitusPrices] = React.useState<VitusModPriceEntry[] | null>(null)
  const [loadingVitus, setLoadingVitus] = React.useState(false)
  const [showEvergreens, setShowEvergreens] = React.useState(false)

  React.useEffect(() => {
    void ensureCatalogLoaded()
  }, [ensureCatalogLoaded])

  const loadVitusPrices = async (force = false): Promise<void> => {
    setLoadingVitus(true)
    try {
      const data = await ipcClient.worldstate.getVitusWithPrices(force)
      setVitusPrices(data)
    } finally {
      setLoadingVitus(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <Swords className="h-4 w-4 text-primary" />
              <span>Honneurs de la Route de l’Acier (Teshin)</span>
            </span>
            <span className="font-mono text-[11px] text-primary">
              {formatCountdown(steelPath.expiry, nowMs)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {steelPath.currentReward && (
            <div className="flex items-center justify-between rounded-md border border-primary/50 bg-primary/10 px-3 py-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-primary">
                  Offre de la semaine
                </div>
                <div className="font-bold">{steelPath.currentReward.name}</div>
              </div>
              <Badge variant="default">{steelPath.currentReward.cost} Essences d’Acier</Badge>
            </div>
          )}

          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant={!showEvergreens ? 'secondary' : 'ghost'}
              onClick={() => setShowEvergreens(false)}
            >
              Rotation 8 Semaines
            </Button>
            <Button
              size="sm"
              variant={showEvergreens ? 'secondary' : 'ghost'}
              onClick={() => setShowEvergreens(true)}
            >
              Boutique Permanente ({steelPath.evergreens.length})
            </Button>
          </div>

          <div className="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto pr-1">
            {(showEvergreens ? steelPath.evergreens : steelPath.rotation).map((item, idx) => {
              const isCurrent =
                !showEvergreens && steelPath.currentReward?.name === item.name
              return (
                <div
                  key={`${item.name}-${idx}`}
                  className={`flex items-center justify-between rounded border px-2.5 py-1.5 text-[11px] ${
                    isCurrent
                      ? 'border-primary/60 bg-primary/10 font-semibold'
                      : 'border-border/50 bg-background/50'
                  }`}
                >
                  <span>
                    {!showEvergreens && `${idx + 1}. `}
                    {item.name}
                  </span>
                  <span className="font-mono text-muted-foreground">{item.cost} SE</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary" />
              <span>Arbitrage & Rentabilité Essence Vitus</span>
            </span>
            <span className="font-mono text-[11px] text-primary">
              {formatCountdown(arbitration.expiry, nowMs)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 bg-background/60 px-3 py-2">
            <div>
              <div className="flex items-center gap-1.5 font-bold">
                <span>
                  {arbitration.type} — {arbitration.node}
                </span>
                {arbitration.isSTier && <Badge variant="success">S-Tier</Badge>}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {arbitration.enemy} · {arbitration.bonus}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={loadingVitus}
              onClick={() => void loadVitusPrices(true)}
            >
              {loadingVitus ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Coins className="h-3.5 w-3.5 text-primary" />
              )}
              <span>{vitusPrices ? 'Actualiser Plat' : 'Scanner Prix Plat'}</span>
            </Button>
          </div>

          <div className="grid max-h-56 grid-cols-1 gap-1.5 overflow-y-auto pr-1">
            {(vitusPrices ??
              ARBITRATION_VITUS_ITEMS.map((d) => ({
                slug: d.slug,
                labelFr: d.labelFr,
                labelEn: d.labelEn,
                category: d.category,
                vitusCost: d.vitusCost,
                thumb: catalog.find((c) => c.slug === d.slug)?.thumb ?? null,
                minPlatinum: null,
                sellerName: null,
                platPerVitus: null
              }))
            ).map((mod) => {
              const thumb = toWfAssetUrl(
                mod.thumb ?? catalog.find((c) => c.slug === mod.slug)?.thumb ?? null
              )
              return (
                <div
                  key={mod.slug}
                  onClick={() => openTab({ kind: 'market-item', slug: mod.slug }, { title: mod.labelFr })}
                  className="flex cursor-pointer items-center justify-between rounded border border-border/60 bg-background/50 px-2.5 py-1.5 transition-colors hover:border-primary/60"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <SafeAssetImage
                      src={thumb}
                      alt={mod.labelFr}
                      className="h-7 w-7 shrink-0 rounded bg-background/70 object-contain p-0.5"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-[11px] font-semibold">{mod.labelFr}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {mod.vitusCost} Vitus · {mod.category}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {mod.minPlatinum !== null ? (
                      <>
                        <Badge variant="default">{mod.minPlatinum} p</Badge>
                        {mod.platPerVitus !== null && (
                          <span className="font-mono text-[10px] text-emerald-400">
                            {mod.platPerVitus} p/V
                          </span>
                        )}
                      </>
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

