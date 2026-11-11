import * as React from 'react'
import { Dna, Flame, Search, Star } from 'lucide-react'
import type { HelminthOverview } from '@shared/schemas/codex.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { Skeleton } from '@/components/ui/skeleton'
import { ipcClient } from '@/services/ipc-client'
import { useTabsStore } from '@/stores/useTabsStore'

export function HelminthInfirmarySection(): React.JSX.Element {
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const [data, setData] = React.useState<HelminthOverview | null>(null)
  const [query, setQuery] = React.useState('')
  const [metaOnly, setMetaOnly] = React.useState(false)
  const [section, setSection] = React.useState<'subsumed' | 'secretions' | 'native'>('subsumed')

  React.useEffect(() => {
    void ipcClient.codex.getHelminth().then(setData)
  }, [])

  if (!data) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  const q = query.trim().toLowerCase()
  const filteredSubsumed = data.subsumableWarframes.filter((wf) => {
    if (metaOnly && !wf.isMeta) return false
    if (!q) return true
    return (
      wf.warframeNameFr.toLowerCase().includes(q) ||
      wf.abilityNameFr.toLowerCase().includes(q) ||
      wf.abilityDescriptionFr.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      <Card className="flex flex-col justify-between gap-4 border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-card to-card p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <SafeAssetImage
            src="./images/helminth.jpg"
            alt="Helminth"
            className="h-16 w-16 shrink-0 rounded-lg border border-emerald-500/40 object-cover"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">Infirmerie Helminth & Subsomption</h2>
              <Badge variant="secondary" className="border-emerald-500/30 text-emerald-400">
                {data.subsumableWarframes.length} Warframes
              </Badge>
            </div>
            <p className="max-w-2xl text-xs text-muted-foreground">{data.descriptionFr}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant={section === 'subsumed' ? 'default' : 'outline'}
            onClick={() => setSection('subsumed')}
          >
            Pouvoirs Subsumés
          </Button>
          <Button
            size="sm"
            variant={section === 'secretions' ? 'default' : 'outline'}
            onClick={() => setSection('secretions')}
          >
            6 Sécrétions & Bile
          </Button>
          <Button
            size="sm"
            variant={section === 'native' ? 'default' : 'outline'}
            onClick={() => setSection('native')}
          >
            Natifs ({data.exclusiveAbilities.length})
          </Button>
        </div>
      </Card>

      {section === 'subsumed' && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Chercher une Warframe ou un pouvoir (ex: Rugissement, Ravitaillement, Pillage...)"
                className="h-8 pl-8 text-xs"
              />
            </div>
            <Button
              size="sm"
              variant={metaOnly ? 'default' : 'outline'}
              onClick={() => setMetaOnly((v) => !v)}
            >
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span>Méta S-Tier uniquement</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {filteredSubsumed.map((wf) => (
              <Card
                key={wf.warframeId}
                onClick={() =>
                  navigateActive(
                    { kind: 'codex-detail', category: 'warframes', slug: wf.warframeId },
                    `Codex : ${wf.warframeNameFr}`
                  )
                }
                className="flex cursor-pointer items-start gap-3 p-3 transition-colors hover:border-emerald-500/50 hover:bg-secondary/40"
              >
                <SafeAssetImage
                  src={wf.warframeImageUrl}
                  alt={wf.warframeNameFr}
                  className="h-12 w-12 shrink-0 rounded-md border border-border/60 bg-background/70 object-contain p-1"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">{wf.abilityNameFr}</span>
                      {wf.isMeta && (
                        <Badge className="bg-amber-500/20 text-[10px] text-amber-300">
                          ★ S-Tier
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {wf.warframeNameFr} ↗
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-[11px] text-muted-foreground">
                    {wf.abilityDescriptionFr}
                  </p>
                </div>
                <SafeAssetImage
                  src={wf.abilityImageUrl}
                  alt={wf.abilityNameFr}
                  className="h-9 w-9 shrink-0 rounded bg-background/80 object-contain p-0.5"
                />
              </Card>
            ))}
          </div>
        </>
      )}

      {section === 'secretions' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {data.secretions.map((sec) => (
            <Card key={sec.id} className="space-y-2.5 p-3.5">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold">{sec.nameFr}</h3>
              </div>
              <p className="text-[11px] text-muted-foreground">{sec.descriptionFr}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {sec.bestResources.map((res) => (
                  <Button
                    key={res.slug}
                    size="sm"
                    variant="secondary"
                    className="h-7 gap-1.5 px-2 text-[11px]"
                    onClick={() =>
                      navigateActive(
                        { kind: 'codex-detail', category: 'resources', slug: res.slug },
                        `Codex : ${res.labelFr}`
                      )
                    }
                  >
                    <SafeAssetImage
                      src={res.imageUrl}
                      alt={res.labelFr}
                      className="h-4 w-4 object-contain"
                    />
                    <span>{res.labelFr}</span>
                  </Button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {section === 'native' && (
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {data.exclusiveAbilities.map((ab) => (
            <Card key={ab.nameFr} className="flex items-start gap-3 p-3">
              <SafeAssetImage
                src={ab.imageUrl}
                alt={ab.nameFr}
                className="h-10 w-10 shrink-0 rounded bg-background/70 object-contain p-1"
                fallback={<Dna className="h-6 w-6 shrink-0 text-emerald-400" />}
              />
              <div className="space-y-1">
                <div className="text-xs font-bold">{ab.nameFr}</div>
                <p className="text-[11px] text-muted-foreground">{ab.descriptionFr}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

