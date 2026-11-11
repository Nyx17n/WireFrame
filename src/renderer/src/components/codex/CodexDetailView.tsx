import * as React from 'react'
import { ArrowLeft, Dna, ExternalLink, Package, Shield, Zap } from 'lucide-react'
import { CodexCategorySchema, type CodexItemDetail } from '@shared/schemas/codex.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { Skeleton } from '@/components/ui/skeleton'
import { CodexDropsAndCraftSection } from '@/components/codex/CodexDropsAndCraftSection'
import { ipcClient } from '@/services/ipc-client'
import { useTabsStore } from '@/stores/useTabsStore'

export function CodexDetailView({
  categoryRaw,
  id
}: {
  categoryRaw?: string
  id: string
}): React.JSX.Element {
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)

  const parsedCat = CodexCategorySchema.safeParse(categoryRaw)
  const category = parsedCat.success ? parsedCat.data : 'warframes'

  const [detail, setDetail] = React.useState<CodexItemDetail | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setErrorMsg(null)
    void ipcClient.codex
      .getItemDetail(category, id)
      .then((res) => {
        if (!cancelled) {
          setDetail(res)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : 'Fiche Codex introuvable')
          setIsLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [category, id])

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 p-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </main>
    )
  }

  if (errorMsg || !detail) {
    return (
      <main className="mx-auto max-w-4xl space-y-3 p-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigateActive({ kind: 'codex-home', category }, 'Codex & Helminth')}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Retour au Codex</span>
        </Button>
        <Card className="border-destructive/50 p-6 text-xs text-destructive">
          {errorMsg ?? 'Entrée introuvable'}
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigateActive({ kind: 'codex-home', category }, 'Codex & Helminth')}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Codex ({category})</span>
        </Button>

        {detail.marketSlug && (
          <Button
            size="sm"
            onClick={(e) => {
              const marketRoute = { kind: 'market-item' as const, slug: detail.marketSlug! }
              if (e.ctrlKey || e.metaKey) openTab(marketRoute, { title: detail.nameFr })
              else navigateActive(marketRoute, detail.nameFr)
            }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Voir Prix Platinum sur le Marché</span>
          </Button>
        )}
      </div>

      <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
        <SafeAssetImage
          src={detail.imageUrl}
          alt={detail.nameFr}
          className="h-24 w-24 shrink-0 rounded-lg border border-border bg-background/80 object-contain p-2"
          fallback={
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-border bg-background/80">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          }
        />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold">{detail.nameFr}</h1>
            {detail.nameEn !== detail.nameFr && (
              <span className="text-xs text-muted-foreground">({detail.nameEn})</span>
            )}
            <Badge variant="secondary">{detail.typeLabel}</Badge>
            {detail.isPrime && <Badge className="bg-amber-500/20 text-amber-300">Prime</Badge>}
            {detail.isVaulted && <Badge variant="destructive">Vaulted</Badge>}
            {detail.isTradable && <Badge variant="outline">Échangeable</Badge>}
          </div>

          {detail.descriptionFr && (
            <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
              {detail.descriptionFr}
            </p>
          )}

          {(detail.planets || detail.utility) && (
            <div className="space-y-1 rounded-md border border-primary/30 bg-primary/5 p-2.5 text-xs">
              {detail.planets && (
                <div>
                  <strong className="text-primary">Planètes clés :</strong> {detail.planets}
                </div>
              )}
              {detail.utility && (
                <div className="text-muted-foreground">
                  <strong className="text-foreground">Utilité Fonderie :</strong> {detail.utility}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {detail.warframeStats && (
        <Card className="space-y-3 p-4">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Attributs & Compétences de la Warframe</span>
          </h2>
          <div className="grid grid-cols-3 gap-2 text-center text-xs sm:grid-cols-6">
            <div className="rounded border border-border/60 bg-background/50 p-2">
              <div className="text-[10px] text-muted-foreground">Santé</div>
              <div className="font-bold text-rose-400">{detail.warframeStats.health}</div>
            </div>
            <div className="rounded border border-border/60 bg-background/50 p-2">
              <div className="text-[10px] text-muted-foreground">Bouclier</div>
              <div className="font-bold text-sky-400">{detail.warframeStats.shield}</div>
            </div>
            <div className="rounded border border-border/60 bg-background/50 p-2">
              <div className="text-[10px] text-muted-foreground">Armure</div>
              <div className="font-bold text-amber-400">{detail.warframeStats.armor}</div>
            </div>
            <div className="rounded border border-border/60 bg-background/50 p-2">
              <div className="text-[10px] text-muted-foreground">Énergie</div>
              <div className="font-bold text-indigo-300">{detail.warframeStats.energy}</div>
            </div>
            <div className="rounded border border-border/60 bg-background/50 p-2">
              <div className="text-[10px] text-muted-foreground">Vitesse</div>
              <div className="font-bold">{detail.warframeStats.sprintSpeed}</div>
            </div>
            <div className="rounded border border-border/60 bg-background/50 p-2">
              <div className="text-[10px] text-muted-foreground">Palier MR</div>
              <div className="font-bold">{detail.warframeStats.masteryRank}</div>
            </div>
          </div>

          {detail.abilities.length > 0 && (
            <div className="grid grid-cols-1 gap-2 pt-1 md:grid-cols-2">
              {detail.abilities.map((ab) => (
                <div
                  key={ab.nameFr}
                  className={`flex items-start gap-2.5 rounded-md border p-2.5 text-xs ${
                    ab.isSubsumed
                      ? 'border-emerald-500/50 bg-emerald-950/20'
                      : 'border-border/60 bg-background/40'
                  }`}
                >
                  <SafeAssetImage
                    src={ab.imageUrl}
                    alt={ab.nameFr}
                    className="h-9 w-9 shrink-0 rounded bg-card object-contain p-0.5"
                  />
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5 font-semibold">
                      <span>{ab.nameFr}</span>
                      {ab.isSubsumed && (
                        <Badge className="bg-emerald-500/20 text-[10px] text-emerald-300">
                          <Dna className="mr-1 h-3 w-3" />
                          Helminth
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{ab.descriptionFr}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {detail.weaponStats && (
        <Card className="space-y-2.5 p-4">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>Statistiques de Combat</span>
          </h2>
          <div className="grid grid-cols-3 gap-2 text-center text-xs sm:grid-cols-6">
            <div className="rounded border border-border/60 bg-background/50 p-2">
              <div className="text-[10px] text-muted-foreground">Chances Crit</div>
              <div className="font-bold text-amber-400">{detail.weaponStats.critChance}%</div>
            </div>
            <div className="rounded border border-border/60 bg-background/50 p-2">
              <div className="text-[10px] text-muted-foreground">Multi Crit</div>
              <div className="font-bold">{detail.weaponStats.critMultiplier}×</div>
            </div>
            <div className="rounded border border-border/60 bg-background/50 p-2">
              <div className="text-[10px] text-muted-foreground">Statut</div>
              <div className="font-bold text-sky-400">{detail.weaponStats.statusChance}%</div>
            </div>
            <div className="rounded border border-border/60 bg-background/50 p-2">
              <div className="text-[10px] text-muted-foreground">Dégâts</div>
              <div className="font-bold">{detail.weaponStats.totalDamage}</div>
            </div>
            <div className="rounded border border-border/60 bg-background/50 p-2">
              <div className="text-[10px] text-muted-foreground">Dispo Riven</div>
              <div className="font-bold text-purple-300">{detail.weaponStats.rivenDisposition}</div>
            </div>
            <div className="rounded border border-border/60 bg-background/50 p-2">
              <div className="text-[10px] text-muted-foreground">Palier MR</div>
              <div className="font-bold">{detail.weaponStats.masteryRank}</div>
            </div>
          </div>
        </Card>
      )}

      {detail.modStats && (
        <Card className="flex flex-wrap items-center gap-3 p-4 text-xs">
          <Badge variant="secondary">Compatibilité : {detail.modStats.compatibility}</Badge>
          <Badge variant="outline">Polarité : {detail.modStats.polarity}</Badge>
          <Badge variant="outline">Rareté : {detail.modStats.rarity}</Badge>
          <Badge variant="outline">Drain de base : {detail.modStats.baseDrain}</Badge>
          <Badge variant="outline">Rang Max : {detail.modStats.maxRank}</Badge>
        </Card>
      )}

      <CodexDropsAndCraftSection detail={detail} />
    </main>
  )
}

