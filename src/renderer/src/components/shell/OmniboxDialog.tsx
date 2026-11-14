import * as React from 'react'
import { CornerDownLeft, ExternalLink, Plus, Search } from 'lucide-react'
import type { CodexSummaryCard } from '@shared/schemas/codex.schema'
import { toWfAssetUrl } from '@shared/schemas/market.schema'
import {
  formatRouteUri,
  parseInputToRoute,
  type AppRoute
} from '@shared/schemas/navigation.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { RouteIcon } from '@/components/shell/RouteIcon'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { normalizeSearchText, useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

interface QuickEntry {
  label: string
  subtitle: string
  keywords: string
  imageUrl?: string | null
  badgeLabel?: string
  route: AppRoute
}

const BUILTIN_VIEWS: readonly QuickEntry[] = [
  { label: 'Hub Temps Réel Warframe', subtitle: 'Cycles Cetus/Vallis, Fissures, Baro, Duviri', keywords: 'hub cetus baro fissures invasions', route: { kind: 'hub' } },
  { label: 'Codex, Farm & Helminth', subtitle: '3 296 fiches FR/EN : Drops %, Fonderie & Helminth', keywords: 'codex farm helminth reliques ressources', route: { kind: 'codex-home' } },
  { label: 'Infirmerie Helminth', subtitle: 'Pouvoirs subsumés, S-Tier & 6 Sécrétions', keywords: 'helminth subsomption bile rugissement', route: { kind: 'codex-home', category: 'helminth' } },
  { label: 'Accueil Marché', subtitle: 'Tendances, recherche rapide & ordres récents', keywords: 'market marche accueil home', route: { kind: 'market-home' } },
  { label: 'Catalogue Complet', subtitle: 'Parcourir les 3 900+ items échangeables', keywords: 'catalogue items sets mods arcanes', route: { kind: 'market-catalog' } },
  { label: 'Panier & Trade Bundler', subtitle: 'Calculateur multi-achats & vendeurs groupés', keywords: 'panier cart bundler achats', route: { kind: 'market-cart' } },
  { label: 'Ducanator', subtitle: 'Meilleurs ratios Ducats / Platinum avant Baro', keywords: 'ducats ducanator baro prime junk', route: { kind: 'market-ducats' } },
  { label: 'Contrats Mod Riven', subtitle: 'Enchères et achats directs de Rivens', keywords: 'rivens contrats encheres', route: { kind: 'market-rivens' } },
  { label: 'Mon Profil Warframe Market', subtitle: 'Compte optionnel : mes annonces en vente, réputation & statut En jeu', keywords: 'profil compte wfm vendre mes ventes annonces login', route: { kind: 'wfm-account' } },
  { label: 'Alertes & Price Sniper', subtitle: 'Surveillance de prix en arrière-plan + sons', keywords: 'alertes sniper notifications sons', route: { kind: 'alerts' } },
  { label: 'Historique de navigation', subtitle: 'Pages, fiches Marché et recherches Codex consultées', keywords: 'historique history recent pages', route: { kind: 'browser-history' } }
]

export function OmniboxDialog(): React.JSX.Element {
  const isOpen = useAppStore((s) => s.isOmniboxOpen)
  const setOmniboxOpen = useAppStore((s) => s.setOmniboxOpen)
  const lang = useAppStore((s) => s.settings.market.language)
  const catalog = useMarketStore((s) => s.catalog)
  const ensureCatalogLoaded = useMarketStore((s) => s.ensureCatalogLoaded)
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)

  const [query, setQuery] = React.useState('')
  const [codexHits, setCodexHits] = React.useState<CodexSummaryCard[]>([])

  React.useEffect(() => {
    if (isOpen) {
      setQuery('')
      setCodexHits([])
      void ensureCatalogLoaded()
    }
  }, [isOpen, ensureCatalogLoaded])

  React.useEffect(() => {
    const trimmed = query.trim()
    if (!isOpen || trimmed.length < 2) {
      setCodexHits([])
      return
    }
    let cancelled = false
    void ipcClient.codex
      .quickSearch(trimmed, 6)
      .then((res) => {
        if (!cancelled) setCodexHits(res)
      })
      .catch(() => {
        if (!cancelled) setCodexHits([])
      })
    return () => {
      cancelled = true
    }
  }, [isOpen, query])

  const parsedDirectRoute = React.useMemo(() => parseInputToRoute(query), [query])
  const isWfmUrl = /^https?:\/\/(?:www\.)?warframe\.market\//i.test(query.trim())

  const matches = React.useMemo((): readonly QuickEntry[] => {
    const q = normalizeSearchText(query)
    if (!q) return BUILTIN_VIEWS.slice(0, 7)

    const viewMatches = BUILTIN_VIEWS.filter(
      (v) =>
        normalizeSearchText(v.label).includes(q) ||
        normalizeSearchText(v.subtitle).includes(q) ||
        v.keywords.includes(q)
    ).slice(0, 3)

    const itemMatches: QuickEntry[] = []
    for (const item of catalog) {
      if (itemMatches.length >= 8) break
      if (
        normalizeSearchText(item.nameFr).includes(q) ||
        normalizeSearchText(item.nameEn).includes(q) ||
        item.slug.includes(q)
      ) {
        const primaryName = lang === 'fr' ? item.nameFr : item.nameEn
        const altName = lang === 'fr' ? item.nameEn : item.nameFr
        itemMatches.push({
          label: primaryName,
          subtitle:
            altName !== primaryName
              ? `${altName} · ${item.tags.slice(0, 3).join(', ')}`
              : item.tags.slice(0, 3).join(', '),
          keywords: `wfm-${item.slug}`,
          imageUrl: toWfAssetUrl(item.thumb),
          badgeLabel: 'Marché',
          route: { kind: 'market-item', slug: item.slug }
        })
      }
    }

    const codexEntries: QuickEntry[] = codexHits.map((c) => ({
      label: c.nameFr,
      subtitle: `Codex (${c.category}) · ${c.subtitle}`,
      keywords: `codex-${c.category}-${c.id}`,
      imageUrl: c.imageUrl,
      badgeLabel: 'Codex',
      route: { kind: 'codex-detail', category: c.category, slug: c.id }
    }))

    return [...viewMatches, ...itemMatches, ...codexEntries]
  }, [query, catalog, lang, codexHits])

  const go = (route: AppRoute, inNewTab: boolean, title?: string): void => {
    if (inNewTab) openTab(route, { title })
    else navigateActive(route, title)
    setOmniboxOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOmniboxOpen}>
      <DialogContent className="max-w-xl gap-3 p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Search className="h-3.5 w-3.5 text-primary" />
            <span>Omnibox — Marché, Codex & Helminth FR/EN</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Rechercher un item Marché, une fiche Codex ou coller une URL warframe.market
          </DialogDescription>
        </DialogHeader>

        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              const first = matches[0]
              go(
                isWfmUrl || !first ? parsedDirectRoute : first.route,
                e.ctrlKey || e.metaKey,
                first?.label
              )
            }
          }}
          placeholder="Ex: Glaive Prime, Cellule Orokin, Helminth, ou colle https://warframe.market/items/..."
          className="h-9 text-xs"
        />

        {isWfmUrl && (
          <div className="flex items-center justify-between gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs">
            <span className="flex min-w-0 items-center gap-2 truncate font-medium">
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="font-mono text-primary">{formatRouteUri(parsedDirectRoute)}</span>
            </span>
            <div className="flex shrink-0 gap-1">
              <Button size="sm" variant="secondary" onClick={() => go(parsedDirectRoute, false)}>
                <CornerDownLeft className="h-3 w-3" />
                <span>Ouvrir</span>
              </Button>
              <Button size="sm" onClick={() => go(parsedDirectRoute, true)}>
                <Plus className="h-3 w-3" />
                <span>Onglet</span>
              </Button>
            </div>
          </div>
        )}

        <div className="wf-stagger-grid max-h-72 space-y-1 overflow-y-auto pr-1">
          {matches.map((entry) => (
            <div
              key={`${entry.route.kind}-${entry.keywords}-${entry.label}`}
              onClick={() => go(entry.route, false, entry.label)}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-transparent px-2.5 py-1.5 text-xs transition-colors hover:border-border hover:bg-secondary/70"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                {entry.imageUrl ? (
                  <SafeAssetImage
                    src={entry.imageUrl}
                    alt=""
                    className="h-7 w-7 shrink-0 rounded bg-background/60 object-contain p-0.5"
                    fallback={<RouteIcon kind={entry.route.kind} className="h-4 w-4 text-primary" />}
                  />
                ) : (
                  <RouteIcon kind={entry.route.kind} className="h-4 w-4 text-primary" />
                )}
                <div className="min-w-0">
                  <div className="truncate font-medium text-foreground">{entry.label}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{entry.subtitle}</div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Badge variant="secondary" className="hidden font-mono text-[10px] sm:inline-flex">
                  {entry.badgeLabel ?? formatRouteUri(entry.route)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Ouvrir dans un nouvel onglet (Ctrl+Entrée)"
                  onClick={(e) => {
                    e.stopPropagation()
                    go(entry.route, true, entry.label)
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
