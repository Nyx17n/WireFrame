import * as React from 'react'
import { CornerDownLeft, ExternalLink, Plus, Search } from 'lucide-react'
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
import { RouteIcon } from '@/components/shell/RouteIcon'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'

interface QuickEntry {
  label: string
  subtitle: string
  keywords: string
  route: AppRoute
}

const QUICK_ENTRIES: readonly QuickEntry[] = [
  { label: 'Hub Temps Réel Warframe', subtitle: 'Cycles Cetus/Vallis, Fissures, Baro, Duviri', keywords: 'hub cetus baro fissures invasions', route: { kind: 'hub' } },
  { label: 'Accueil Marché', subtitle: 'Tendances, recherche rapide & actualités', keywords: 'market marche accueil home', route: { kind: 'market-home' } },
  { label: 'Catalogue Complet', subtitle: 'Parcourir les 3 900+ items échangeables', keywords: 'catalogue items sets mods arcanes', route: { kind: 'market-catalog' } },
  { label: 'Panier & Trade Bundler', subtitle: 'Calculateur multi-achats & vendeurs groupés', keywords: 'panier cart bundler achats', route: { kind: 'market-cart' } },
  { label: 'Ducanator', subtitle: 'Meilleurs ratios Ducats / Platinum avant Baro', keywords: 'ducats ducanator baro prime junk', route: { kind: 'market-ducats' } },
  { label: 'Contrats Mods Riven', subtitle: 'Enchères et achats directs de Rivens', keywords: 'rivens contrats enchères', route: { kind: 'market-rivens' } },
  { label: 'Favoris Marché', subtitle: 'Suivi rapide de tes items favoris', keywords: 'favoris stars', route: { kind: 'market-favorites' } },
  { label: 'Alertes & Price Sniper', subtitle: 'Surveillance de prix en arrière-plan + sons', keywords: 'alertes sniper notifications sons', route: { kind: 'alerts' } },
  { label: 'Codex, Farm & Helminth', subtitle: 'Tables de drop %, recettes Fonderie & Helminth', keywords: 'codex farm helminth reliques ressources', route: { kind: 'codex-home' } },
  { label: 'Glaive Prime Set', subtitle: 'Exemple fiche Item & Comparateur Set vs Pièces', keywords: 'glaive prime set', route: { kind: 'market-item', slug: 'glaive_prime_set' } },
  { label: 'Arcane Energize', subtitle: 'Exemple fiche Arcane (Rangs 0 à 5)', keywords: 'arcane energize energetique', route: { kind: 'market-item', slug: 'arcane_energize' } },
  { label: 'Wisp Prime Set', subtitle: 'Exemple fiche Warframe Prime', keywords: 'wisp prime set', route: { kind: 'market-item', slug: 'wisp_prime_set' } }
]

export function OmniboxDialog(): React.JSX.Element {
  const isOpen = useAppStore((s) => s.isOmniboxOpen)
  const setOmniboxOpen = useAppStore((s) => s.setOmniboxOpen)
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)

  const [query, setQuery] = React.useState('')

  React.useEffect(() => {
    if (isOpen) setQuery('')
  }, [isOpen])

  const parsedDirectRoute = React.useMemo(() => parseInputToRoute(query), [query])
  const isWfmUrl = /^https?:\/\/(?:www\.)?warframe\.market\//i.test(query.trim())

  const matches = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return QUICK_ENTRIES.slice(0, 8)
    return QUICK_ENTRIES.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.keywords.includes(q)
    )
  }, [query])

  const go = (route: AppRoute, inNewTab: boolean, title?: string): void => {
    if (inNewTab) {
      openTab(route, { title })
    } else {
      navigateActive(route, title)
    }
    setOmniboxOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOmniboxOpen}>
      <DialogContent className="max-w-xl gap-3 p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Search className="h-3.5 w-3.5 text-primary" />
            <span>Omnibox Unifiée — Marché, Codex & Navigation (Ctrl+K)</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Rechercher un item, une vue ou coller une URL warframe.market
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
              const target = isWfmUrl || !first ? parsedDirectRoute : first.route
              go(target, e.ctrlKey || e.metaKey)
            }
          }}
          placeholder="Tape un item, 'ducats', 'codex' ou colle https://warframe.market/items/..."
          className="h-9 text-xs"
        />

        {query.trim().length > 0 && (
          <div className="flex items-center justify-between gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs">
            <div className="flex min-w-0 items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate font-medium">
                {isWfmUrl ? 'URL Warframe Market reconnue :' : 'Aller vers :'}{' '}
                <span className="font-mono text-primary">{formatRouteUri(parsedDirectRoute)}</span>
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
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

        <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
          {matches.map((entry) => (
            <div
              key={`${entry.route.kind}-${entry.label}`}
              onClick={() => go(entry.route, false, entry.label)}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-transparent px-2.5 py-2 text-xs transition-colors hover:border-border hover:bg-secondary/70"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <RouteIcon kind={entry.route.kind} className="h-4 w-4 text-primary" />
                <div className="min-w-0">
                  <div className="truncate font-medium text-foreground">{entry.label}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{entry.subtitle}</div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {formatRouteUri(entry.route)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Ouvrir dans un nouvel onglet"
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
