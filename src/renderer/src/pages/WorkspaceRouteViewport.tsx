import * as React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import type { AppRoute } from '@shared/schemas/navigation.schema'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertsCenterView } from '@/components/alerts/AlertsCenterView'
import { CodexDetailView } from '@/components/codex/CodexDetailView'
import { CodexHomeView } from '@/components/codex/CodexHomeView'
import { HubRootView } from '@/components/hub/HubRootView'
import { MarketCatalogView } from '@/components/market/MarketCatalogView'
import { MarketFavoritesView } from '@/components/market/MarketFavoritesView'
import { MarketHomeView } from '@/components/market/MarketHomeView'
import { MarketItemDetailView } from '@/components/market/MarketItemDetailView'
import { MarketRecentOrdersView } from '@/components/market/MarketRecentOrdersView'
import { MarketUserProfileView } from '@/components/market/MarketUserProfileView'
import { MarketCartView } from '@/components/tools/MarketCartView'
import { MarketDucatsView } from '@/components/tools/MarketDucatsView'
import { MarketRivensView } from '@/components/tools/MarketRivensView'
import { BrowserHistoryView } from '@/components/shell/BrowserHistoryView'
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
    case 'hub':
      return <HubRootView />
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
    case 'codex-home':
      return <CodexHomeView initialCategory={route.category} initialQuery={route.query} />
    case 'codex-detail':
      return <CodexDetailView categoryRaw={route.category} id={route.slug ?? 'wisp'} />
    case 'browser-history':
      return <BrowserHistoryView />
  }
}
