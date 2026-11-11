import * as React from 'react'
import { ArrowUpRight, Flame, Sparkles, Swords } from 'lucide-react'
import {
  DUVIRI_INCARNON_ROTATIONS,
  DUVIRI_WARFRAME_ROTATIONS
} from '@shared/data/duviri-rotations'
import {
  toWikiFileAssetUrl,
  toWikiItemAssetUrl,
  type DuviriCircuitSnapshot
} from '@shared/schemas/worldstate.schema'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'
import { formatCountdown } from './hub-countdown'

export function HubDuviriCircuitTab({
  circuit,
  nowMs
}: {
  circuit: DuviriCircuitSnapshot
  nowMs: number
}): React.JSX.Element {
  const openTab = useTabsStore((s) => s.openTab)
  const catalog = useMarketStore((s) => s.catalog)
  const ensureCatalogLoaded = useMarketStore((s) => s.ensureCatalogLoaded)

  React.useEffect(() => {
    void ensureCatalogLoaded()
  }, [ensureCatalogLoaded])

  const openWeaponIncarnon = (weaponName: string): void => {
    const baseSlug = weaponName
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
    const genesisSlug = `${baseSlug}_incarnon_genesis`
    const primeSlug = `${baseSlug}_prime_set`

    if (catalog.some((c) => c.slug === genesisSlug)) {
      openTab({ kind: 'market-item', slug: genesisSlug }, { title: `${weaponName} Incarnon` })
      return
    }
    if (catalog.some((c) => c.slug === primeSlug)) {
      openTab({ kind: 'market-item', slug: primeSlug }, { title: `${weaponName} Prime` })
      return
    }
    openTab({ kind: 'market-catalog', query: weaponName }, { title: `Marché : ${weaponName}` })
  }

  const openWarframePrime = (frameName: string): void => {
    const primeSlug = `${frameName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_prime_set`
    if (catalog.some((c) => c.slug === primeSlug)) {
      openTab({ kind: 'market-item', slug: primeSlug }, { title: `${frameName} Prime` })
      return
    }
    openTab({ kind: 'market-catalog', query: frameName }, { title: `Marché : ${frameName}` })
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary/40 bg-primary/5">
        <CardContent className="space-y-3 p-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <SafeAssetImage
                src={toWikiFileAssetUrl('TheSteelPathDuviri.png')}
                alt="Duviri"
                className="h-11 w-11 shrink-0 object-contain"
              />
              <div>
                <div className="flex items-center gap-1.5 text-sm font-bold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>{circuit.spiralLabelFr}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Changement d’humeur Duviri dans{' '}
                  <span className="font-mono font-semibold text-primary">
                    {formatCountdown(circuit.spiralExpiry, nowMs)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-border/60 pt-3 lg:grid-cols-2">
            {circuit.activeWarframes.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Circuit Normal (Cette semaine)
                </div>
                <div className="flex flex-wrap gap-2">
                  {circuit.activeWarframes.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => openWarframePrime(f)}
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-card/90 px-2.5 py-1.5 text-xs font-semibold transition-colors hover:border-primary"
                    >
                      <SafeAssetImage
                        src={toWikiItemAssetUrl(f)}
                        alt={f}
                        className="h-7 w-7 shrink-0 rounded bg-background/70 object-contain p-0.5"
                      />
                      <span>{f}</span>
                      <ArrowUpRight className="h-3 w-3 text-primary" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {circuit.activeIncarnons.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Incarnon Route de l’Acier (Cette semaine)
                </div>
                <div className="flex flex-wrap gap-2">
                  {circuit.activeIncarnons.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => openWeaponIncarnon(w)}
                      className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-card/90 px-2.5 py-1.5 text-xs font-semibold transition-colors hover:border-primary"
                    >
                      <SafeAssetImage
                        src={toWikiItemAssetUrl(w)}
                        alt={w}
                        className="h-7 w-7 shrink-0 rounded bg-background/70 object-contain p-0.5"
                      />
                      <span>{w}</span>
                      <ArrowUpRight className="h-3 w-3 text-primary" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-xs">
              <Flame className="h-4 w-4 text-primary" />
              <span>Calendrier Incarnon Genesis — Route de l’Acier (8 Semaines)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {DUVIRI_INCARNON_ROTATIONS.map((rot) => {
              const isCurrent = circuit.activeIncarnonWeek === rot.week
              return (
                <div
                  key={rot.week}
                  className={`space-y-2 rounded-md border p-2.5 ${
                    isCurrent
                      ? 'border-primary bg-primary/10'
                      : 'border-border/60 bg-background/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">
                      Semaine {rot.week} ({rot.code})
                    </span>
                    {isCurrent && <Badge variant="default">EN COURS</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rot.weapons.map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => openWeaponIncarnon(w)}
                        className="inline-flex items-center gap-1.5 rounded border border-border bg-card px-2 py-1 text-[11px] transition-colors hover:border-primary hover:text-primary"
                      >
                        <SafeAssetImage
                          src={toWikiItemAssetUrl(w)}
                          alt={w}
                          className="h-5 w-5 shrink-0 object-contain"
                        />
                        <span>{w}</span>
                        <ArrowUpRight className="h-2.5 w-2.5 opacity-70" />
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-xs">
              <Swords className="h-4 w-4 text-primary" />
              <span>Calendrier Warframes — Circuit Normal (11 Semaines)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {DUVIRI_WARFRAME_ROTATIONS.map((rot) => {
              const isCurrent = circuit.activeWarframeWeek === rot.week
              return (
                <div
                  key={rot.week}
                  className={`space-y-1.5 rounded-md border p-2.5 ${
                    isCurrent
                      ? 'border-primary bg-primary/10'
                      : 'border-border/60 bg-background/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Semaine {rot.week}</span>
                    {isCurrent && <Badge variant="default">EN COURS</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rot.frames.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => openWarframePrime(f)}
                        className="inline-flex items-center gap-1.5 rounded border border-border bg-card px-2 py-1 text-[11px] transition-colors hover:border-primary hover:text-primary"
                      >
                        <SafeAssetImage
                          src={toWikiItemAssetUrl(f)}
                          alt={f}
                          className="h-5 w-5 shrink-0 object-contain"
                        />
                        <span>{f}</span>
                        <ArrowUpRight className="h-2.5 w-2.5 opacity-70" />
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
