import * as React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import {
  formatRouteUri,
  getDefaultRouteTitle,
  type AppRoute
} from '@shared/schemas/navigation.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertsCenterView } from '@/components/alerts/AlertsCenterView'
import { MarketCatalogView } from '@/components/market/MarketCatalogView'
import { MarketFavoritesView } from '@/components/market/MarketFavoritesView'
import { MarketHomeView } from '@/components/market/MarketHomeView'
import { MarketItemDetailView } from '@/components/market/MarketItemDetailView'
import { MarketRecentOrdersView } from '@/components/market/MarketRecentOrdersView'
import { MarketUserProfileView } from '@/components/market/MarketUserProfileView'
import { RouteIcon } from '@/components/shell/RouteIcon'
import { MarketCartView } from '@/components/tools/MarketCartView'
import { MarketDucatsView } from '@/components/tools/MarketDucatsView'
import { MarketRivensView } from '@/components/tools/MarketRivensView'
import { getTabCurrentRoute } from '@/lib/tab-helpers'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function WorkspaceRouteViewport(): React.JSX.Element {
  const isLoading = useAppStore((s) => s.isLoading)
  const errorMessage = useAppStore((s) => s.errorMessage)
  const initialize = useAppStore((s) => s.initialize)

  const hubActive = useTabsStore((s) => s.hubActive)
  const tabs = useTabsStore((s) => s.tabs)
  const activeTabId = useTabsStore((s) => s.activeTabId)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
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
  const route: AppRoute = hubActive
    ? { kind: 'hub' }
    : activeTab
      ? getTabCurrentRoute(activeTab)
      : { kind: 'market-home' }

  switch (route.kind) {
    case 'market-home':
      return <MarketHomeView />
    case 'market-catalog':
      return <MarketCatalogView initialQuery={route.query ?? ''} />
    case 'market-item':
      return <MarketItemDetailView slug={route.slug ?? 'glaive_prime_set'} />
    case 'market-cart':
      return <MarketCartView />
    case 'market-favorites':
      return <MarketFavoritesView />
    case 'market-ducats':
      return <MarketDucatsView />
    case 'market-rivens':
      return <MarketRivensView />
    case 'market-recent':
      return <MarketRecentOrdersView />
    case 'market-user':
      return <MarketUserProfileView userSlug={route.slug ?? 'nyxo_17'} />
    case 'alerts':
      return <AlertsCenterView />
    default:
      return (
        <main className="mx-auto max-w-4xl p-4">
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="font-mono">
                  {formatRouteUri(route)}
                </Badge>
                <Badge variant="secondary">Prévu aux Jalons 5 & 6</Badge>
              </div>
              <CardTitle className="flex items-center gap-2 pt-1 text-base">
                <RouteIcon kind={route.kind} className="h-4 w-4 text-primary" />
                <span>{getDefaultRouteTitle(route)}</span>
              </CardTitle>
              <CardDescription>
                Cette vue sera connectée lors des prochains jalons (Jalon 5 : Hub Worldstate Temps Réel · Jalon 6 : Codex, Farm % & Helminth).
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      )
  }
}
