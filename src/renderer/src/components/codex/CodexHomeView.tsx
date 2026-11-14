import * as React from 'react'
import { BookOpen, ChevronDown, Dna, Loader2, Search } from 'lucide-react'
import type {
  CodexCategory,
  CodexSearchResult,
  CodexVariantFilter,
  MobUnitTierFilter
} from '@shared/schemas/codex.schema'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ViewModeToggle } from '@/components/ui/view-mode-toggle'
import { CodexItemsDisplay } from '@/components/codex/CodexItemsDisplay'
import { CodexOverlayToolbar } from '@/components/codex/CodexOverlayToolbar'
import { HelminthInfirmarySection } from '@/components/codex/HelminthInfirmarySection'
import { useCatalogDisplayPreferences } from '@/lib/catalog-layout'
import { ipcClient } from '@/services/ipc-client'
import { useTabsStore } from '@/stores/useTabsStore'

type CodexTabMode = CodexCategory | 'helminth'

const PAGE_SIZE = 36

const CATEGORY_TABS: ReadonlyArray<{ id: CodexCategory; label: string }> = [
  { id: 'resources', label: 'Ressources' },
  { id: 'warframes', label: 'Warframes' },
  { id: 'weapons', label: 'Armes' },
  { id: 'mods', label: 'Mods' },
  { id: 'relics', label: 'Reliques' },
  { id: 'mobs', label: '👾 Mobs' },
  { id: 'vendors', label: '🏪 Marchands' }
]

const RELIC_ERAS = ['all', 'Lith', 'Meso', 'Neo', 'Axi', 'Requiem', 'Vanguard'] as const
const WEAPON_SLOTS = [
  { id: 'all', label: 'Toutes' },
  { id: 'primary', label: 'Principale' },
  { id: 'secondary', label: 'Secondaire' },
  { id: 'melee', label: 'Mêlée' }
] as const

const MOB_FACTIONS = [
  { id: 'all', label: 'Toutes factions' },
  { id: 'grineer', label: 'Grineer' },
  { id: 'corpus', label: 'Corpus' },
  { id: 'infested', label: 'Infestés' },
  { id: 'orokin', label: 'Orokin / Corrompus' },
  { id: 'sentient', label: 'Sentients' },
  { id: 'narmer', label: 'Narmer' },
  { id: 'murmur', label: 'Murmure' },
  { id: 'duviri', label: 'Duviri' },
  { id: 'scaldra', label: 'Scaldra (1999)' },
  { id: 'techrot', label: 'Techrot (1999)' },
  { id: 'stalker', label: 'Stalker & Acolytes' }
] as const

const MOB_TIERS: ReadonlyArray<{ id: MobUnitTierFilter; label: string }> = [
  { id: 'all', label: 'Tous rangs' },
  { id: 'standard', label: 'Standard' },
  { id: 'eximus', label: 'Élite & Lourds' },
  { id: 'boss', label: 'Boss & Chasseurs' }
]

const VENDOR_HUBS = [
  { id: 'all', label: 'Tous les Hubs' },
  { id: 'relays', label: 'Relais & Maroo' },
  { id: 'syndicates', label: '6 Syndicats' },
  { id: 'cetus', label: 'Cetus (Terre)' },
  { id: 'fortuna', label: 'Fortuna (Vénus)' },
  { id: 'deimos', label: 'Deimos & Sanctum' },
  { id: 'zariman_duviri', label: 'Zariman & Duviri' },
  { id: 'hollvania_camp', label: '1999, Camp & Nora' }
] as const

export function CodexHomeView({
  initialCategory,
  initialQuery
}: {
  initialCategory?: string
  initialQuery?: string
}): React.JSX.Element {
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)
  const { layoutMode, cardSize, setLayoutMode, setCardSize } = useCatalogDisplayPreferences()

  const [activeTab, setActiveTab] = React.useState<CodexTabMode>(() =>
    initialCategory === 'helminth'
      ? 'helminth'
      : CATEGORY_TABS.some((t) => t.id === initialCategory)
        ? (initialCategory as CodexCategory)
        : 'resources'
  )
  const [query, setQuery] = React.useState(initialQuery ?? '')
  const [variantFilter, setVariantFilter] = React.useState<CodexVariantFilter>('all')
  const [eraFilter, setEraFilter] = React.useState<string>('all')
  const [slotFilter, setSlotFilter] = React.useState<string>('all')
  const [factionFilter, setFactionFilter] = React.useState<string>('all')
  const [unitTierFilter, setUnitTierFilter] = React.useState<MobUnitTierFilter>('all')
  const [hubFilter, setHubFilter] = React.useState<string>('all')
  const [loadedPage, setLoadedPage] = React.useState(1)
  const [result, setResult] = React.useState<CodexSearchResult | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const requestSeqRef = React.useRef(0)

  React.useEffect(() => {
    if (activeTab === 'helminth') return
    const seq = ++requestSeqRef.current
    setIsLoading(true)
    setIsLoadingMore(false)
    setErrorMsg(null)
    setLoadedPage(1)

    void ipcClient.codex
      .search({
        category: activeTab,
        query,
        variantFilter,
        eraFilter,
        slotFilter,
        factionFilter,
        unitTierFilter,
        hubFilter,
        page: 1,
        pageSize: PAGE_SIZE
      })
      .then((res) => {
        if (seq === requestSeqRef.current) {
          setResult(res)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (seq === requestSeqRef.current) {
          setErrorMsg(err instanceof Error ? err.message : 'Erreur chargement Codex')
          setIsLoading(false)
        }
      })
  }, [
    activeTab,
    query,
    variantFilter,
    eraFilter,
    slotFilter,
    factionFilter,
    unitTierFilter,
    hubFilter
  ])

  const handleLoadMore = (): void => {
    if (activeTab === 'helminth' || isLoadingMore || !result) return
    if (result.items.length >= result.total) return

    const seq = requestSeqRef.current
    const nextPage = loadedPage + 1
    setIsLoadingMore(true)

    void ipcClient.codex
      .search({
        category: activeTab,
        query,
        variantFilter,
        eraFilter,
        slotFilter,
        factionFilter,
        unitTierFilter,
        hubFilter,
        page: nextPage,
        pageSize: PAGE_SIZE
      })
      .then((res) => {
        if (seq !== requestSeqRef.current) return
        setLoadedPage(nextPage)
        setResult((prev) => {
          if (!prev) return res
          const existingIds = new Set(prev.items.map((it) => it.id))
          const appended = res.items.filter((it) => !existingIds.has(it.id))
          return { ...res, items: [...prev.items, ...appended] }
        })
        setIsLoadingMore(false)
      })
      .catch((err: unknown) => {
        if (seq !== requestSeqRef.current) return
        setErrorMsg(err instanceof Error ? err.message : 'Erreur chargement de la suite du Codex')
        setIsLoadingMore(false)
      })
  }

  const selectCategory = (next: CodexTabMode): void => {
    setActiveTab(next)
    setVariantFilter('all')
    setEraFilter('all')
    setSlotFilter('all')
    setFactionFilter('all')
    setUnitTierFilter('all')
    setHubFilter('all')
  }

  const remainingCount = result ? Math.max(0, result.total - result.items.length) : 0

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>Codex, Tables de Farm % & Infirmerie Helminth</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Encyclopédie complète FR/EN hors-ligne : drops triés par probabilité, recettes Fonderie et subsomptions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORY_TABS.map((tab) => {
            const count = result?.categoryCounts[tab.id]
            return (
              <Button
                key={tab.id}
                size="sm"
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => selectCategory(tab.id)}
              >
                <span>{tab.label}</span>
                {count !== undefined && (
                  <span className="ml-1 font-mono text-[10px] opacity-80">{count}</span>
                )}
              </Button>
            )
          })}
          <Button
            size="sm"
            variant={activeTab === 'helminth' ? 'default' : 'secondary'}
            onClick={() => selectCategory('helminth')}
          >
            <Dna className="h-3.5 w-3.5 text-emerald-400" />
            <span>Helminth</span>
          </Button>
        </div>
      </div>

      {activeTab === 'helminth' ? (
        <HelminthInfirmarySection />
      ) : (
        <>
          <CodexOverlayToolbar />

          <div className="space-y-2 rounded-lg border border-border bg-card/60 p-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    activeTab === 'mobs'
                      ? 'Chercher un mob, une planète ou un objet droppé (ex: Sargas Ruk, Néant, Continuité…)'
                      : activeTab === 'vendors'
                        ? 'Chercher un marchand, une planète OU un objet vendu (ex: Citrine, Nitain, Holoclef…)'
                        : 'Filtrer FR / EN (ex: Cellule Orokin, Wisp, Acceltra, Lith A13...)'
                  }
                  className="h-8 pl-8 text-xs"
                />
              </div>

              {activeTab !== 'mobs' && activeTab !== 'vendors' && (
                <div className="flex flex-wrap items-center gap-1">
                  {(['all', 'prime', 'standard', 'tradable', 'unvaulted'] as const).map((vf) => (
                    <Button
                      key={vf}
                      size="sm"
                      variant={variantFilter === vf ? 'secondary' : 'ghost'}
                      className="h-7 px-2 text-[11px]"
                      onClick={() => setVariantFilter(vf)}
                    >
                      {vf === 'all'
                        ? 'Tous'
                        : vf === 'prime'
                          ? 'Prime'
                          : vf === 'standard'
                            ? 'Standard'
                            : vf === 'tradable'
                              ? 'Échangeable'
                              : 'Hors Vault'}
                    </Button>
                  ))}
                </div>
              )}

              {activeTab === 'mobs' && (
                <div className="flex flex-wrap items-center gap-1">
                  {MOB_TIERS.map((tier) => (
                    <Button
                      key={tier.id}
                      size="sm"
                      variant={unitTierFilter === tier.id ? 'secondary' : 'ghost'}
                      className="h-7 px-2 text-[11px]"
                      onClick={() => setUnitTierFilter(tier.id)}
                    >
                      {tier.label}
                    </Button>
                  ))}
                </div>
              )}

              {activeTab === 'weapons' && (
                <div className="flex flex-wrap items-center gap-1 border-l border-border pl-2">
                  {WEAPON_SLOTS.map((slot) => (
                    <Button
                      key={slot.id}
                      size="sm"
                      variant={slotFilter === slot.id ? 'default' : 'ghost'}
                      className="h-7 px-2 text-[11px]"
                      onClick={() => setSlotFilter(slot.id)}
                    >
                      {slot.label}
                    </Button>
                  ))}
                </div>
              )}

              {activeTab === 'relics' && (
                <div className="flex flex-wrap items-center gap-1 border-l border-border pl-2">
                  {RELIC_ERAS.map((era) => (
                    <Button
                      key={era}
                      size="sm"
                      variant={eraFilter === era ? 'default' : 'ghost'}
                      className="h-7 px-2 text-[11px]"
                      onClick={() => setEraFilter(era)}
                    >
                      {era === 'all' ? 'Toutes ères' : era}
                    </Button>
                  ))}
                </div>
              )}

              <div className="ml-auto">
                <ViewModeToggle
                  value={layoutMode}
                  onChange={setLayoutMode}
                  size={cardSize}
                  onSizeChange={setCardSize}
                />
              </div>
            </div>

            {activeTab === 'mobs' && (
              <div className="flex flex-wrap items-center gap-1 border-t border-border/60 pt-2">
                {MOB_FACTIONS.map((fac) => (
                  <Button
                    key={fac.id}
                    size="sm"
                    variant={factionFilter === fac.id ? 'default' : 'ghost'}
                    className="h-6 px-2 text-[10px]"
                    onClick={() => setFactionFilter(fac.id)}
                  >
                    {fac.label}
                  </Button>
                ))}
              </div>
            )}

            {activeTab === 'vendors' && (
              <div className="flex flex-wrap items-center gap-1 border-t border-border/60 pt-2">
                {VENDOR_HUBS.map((hub) => (
                  <Button
                    key={hub.id}
                    size="sm"
                    variant={hubFilter === hub.id ? 'default' : 'ghost'}
                    className="h-6 px-2 text-[10px]"
                    onClick={() => setHubFilter(hub.id)}
                  >
                    {hub.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {errorMsg && (
            <Card className="border-destructive/50 p-4 text-xs text-destructive">{errorMsg}</Card>
          )}

          <CodexItemsDisplay
            items={result?.items ?? []}
            isLoading={isLoading && result === null}
            layoutMode={layoutMode}
            cardSize={cardSize}
            onSelectCard={(route, title, inNewTab) =>
              inNewTab ? openTab(route, { title }) : navigateActive(route, title)
            }
            onOpenNewTab={(route, title) => openTab(route, { title })}
          />

          {result && result.items.length > 0 && (
            <div className="flex flex-col items-center gap-2 pt-3 text-xs text-muted-foreground">
              <span>
                {result.items.length} sur {result.total} entrées affichées
              </span>
              {remainingCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLoadingMore}
                  onClick={handleLoadMore}
                >
                  {isLoadingMore ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span>
                    Afficher plus ({remainingCount} restant{remainingCount > 1 ? 's' : ''})
                  </span>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </main>
  )
}
