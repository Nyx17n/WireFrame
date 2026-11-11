import * as React from 'react'
import {
  AlertTriangle,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles
} from 'lucide-react'
import {
  formatRouteUri,
  getDefaultRouteTitle,
  type AppRoute
} from '@shared/schemas/navigation.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { RouteIcon } from '@/components/shell/RouteIcon'
import { ThemePlaygroundCard } from '@/components/foundation/ThemePlaygroundCard'
import { WindowAudioCard } from '@/components/foundation/WindowAudioCard'
import { getTabCurrentRoute } from '@/lib/tab-helpers'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'

const DEMO_ROUTES: readonly { label: string; badge: string; route: AppRoute }[] = [
  { label: 'Glaive Prime Set', badge: 'Jalon 3 · Set vs Pièces', route: { kind: 'market-item', slug: 'glaive_prime_set' } },
  { label: 'Arcane Energize', badge: 'Jalon 3 · Ordres & Stats', route: { kind: 'market-item', slug: 'arcane_energize' } },
  { label: 'Panier & Trade Bundler', badge: 'Jalon 4 · Multi-Achats', route: { kind: 'market-cart' } },
  { label: 'Ducanator', badge: 'Jalon 4 · Ducats/Plat', route: { kind: 'market-ducats' } },
  { label: 'Contrats Rivens', badge: 'Jalon 4 · Enchères', route: { kind: 'market-rivens' } },
  { label: 'Codex & Helminth', badge: 'Jalon 6 · Farm %', route: { kind: 'codex-home' } }
]

export function WorkspaceRouteViewport(): React.JSX.Element {
  const isLoading = useAppStore((s) => s.isLoading)
  const errorMessage = useAppStore((s) => s.errorMessage)
  const windowState = useAppStore((s) => s.windowState)
  const initialize = useAppStore((s) => s.initialize)
  const setOmniboxOpen = useAppStore((s) => s.setOmniboxOpen)
  const openSettingsModal = useAppStore((s) => s.openSettingsModal)

  const hubActive = useTabsStore((s) => s.hubActive)
  const tabs = useTabsStore((s) => s.tabs)
  const activeTabId = useTabsStore((s) => s.activeTabId)
  const refreshRevision = useTabsStore((s) => s.refreshRevision)
  const openTab = useTabsStore((s) => s.openTab)
  const navigateActive = useTabsStore((s) => s.navigateActive)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-3 p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <h2 className="text-sm font-semibold">Erreur de communication IPC</h2>
        <p className="text-xs text-muted-foreground">{errorMessage}</p>
        <Button onClick={() => void initialize()}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Réessayer</span>
        </Button>
      </div>
    )
  }

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]
  const activeRoute: AppRoute = hubActive
    ? { kind: 'hub' }
    : activeTab
      ? getTabCurrentRoute(activeTab)
      : { kind: 'market-home' }

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4">
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 pb-2">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="font-mono">
                {formatRouteUri(activeRoute)}
              </Badge>
              <Badge variant="success">Jalon 2 · Shell Multi-Onglets Actif</Badge>
              {refreshRevision > 0 && (
                <Badge variant="secondary">Actualisé #{refreshRevision}</Badge>
              )}
            </div>
            <CardTitle className="flex items-center gap-2 text-base">
              <RouteIcon kind={activeRoute.kind} className="h-4 w-4 text-primary" />
              <span>{getDefaultRouteTitle(activeRoute)}</span>
            </CardTitle>
            <CardDescription>
              {activeRoute.query
                ? `Filtre actif : « ${activeRoute.query} » — Les données API temps réel arrivent dès le Jalon 3.`
                : 'Navigation multi-onglets avec historique ←/→, Omnibox (Ctrl+K), épinglage 📌 et Paramètres 5 onglets.'}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button size="sm" variant="secondary" onClick={() => setOmniboxOpen(true)}>
              <Search className="h-3.5 w-3.5 text-primary" />
              <span>Omnibox (Ctrl+K)</span>
            </Button>
            <Button size="sm" onClick={() => openSettingsModal()}>
              <Settings className="h-3.5 w-3.5" />
              <span>Paramètres (5 onglets)</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Teste l’ouverture multi-onglets ou la navigation dans l’onglet courant :</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_ROUTES.map((demo) => (
              <div
                key={demo.label}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-background/60 px-2.5 py-2 text-xs"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold">{demo.label}</div>
                  <div className="truncate text-[10px] text-muted-foreground">{demo.badge}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Naviguer dans cet onglet"
                    onClick={() => navigateActive(demo.route, demo.label)}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    title="Ouvrir dans un nouvel onglet"
                    onClick={() => openTab(demo.route, { title: demo.label })}
                  >
                    <Plus className="h-3.5 w-3.5 text-primary" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {activeRoute.kind === 'market-home' && (
        <div
          className={
            windowState.isCompactMode
              ? 'grid grid-cols-1 gap-3'
              : 'grid grid-cols-1 gap-4 lg:grid-cols-2'
          }
        >
          <ThemePlaygroundCard />
          <WindowAudioCard />
        </div>
      )}
    </main>
  )
}
