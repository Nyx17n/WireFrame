import * as React from 'react'
import {
  AlertTriangle,
  Compass,
  Flame,
  Globe,
  Newspaper,
  RefreshCw,
  Sparkles,
  Swords
} from 'lucide-react'
import type { HubSectionId, WorldstateHubPayload } from '@shared/schemas/worldstate.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ipcClient } from '@/services/ipc-client'
import { useHubNavStore } from '@/stores/useHubNavStore'
import { useTabsStore } from '@/stores/useTabsStore'
import { HubBaroTraderTab } from './HubBaroTraderTab'
import { HubDuviriCircuitTab } from './HubDuviriCircuitTab'
import { HubFissuresMissionsTab } from './HubFissuresMissionsTab'
import { HubInvasionsSteelTab } from './HubInvasionsSteelTab'
import { HubNewsDarvoTab } from './HubNewsDarvoTab'
import { HubPlanetsBountiesTab } from './HubPlanetsBountiesTab'
import { useNowTick } from './hub-countdown'

export function HubRootView(): React.JSX.Element {
  const nowMs = useNowTick(1000)
  const refreshRevision = useTabsStore((s) => s.refreshRevision)
  const lastRefreshRef = React.useRef(refreshRevision)

  const section = useHubNavStore((s) => s.section)
  const setSection = useHubNavStore((s) => s.setSection)
  const [data, setData] = React.useState<WorldstateHubPayload | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchWorldstate = React.useCallback(async (force = false, silent = false) => {
    if (!silent) setLoading(true)
    setRefreshing(true)
    setError(null)
    try {
      const payload = await ipcClient.worldstate.getCurrent(force)
      setData(payload)
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : 'Erreur de lecture du Worldstate Warframe')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  React.useEffect(() => {
    void fetchWorldstate(false, false)
    const timer = window.setInterval(() => {
      void fetchWorldstate(false, true)
    }, 45_000)
    return () => window.clearInterval(timer)
  }, [fetchWorldstate])

  React.useEffect(() => {
    if (refreshRevision !== lastRefreshRef.current) {
      lastRefreshRef.current = refreshRevision
      void fetchWorldstate(true, true)
    }
  }, [fetchWorldstate, refreshRevision])

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <h2 className="text-sm font-bold">Hub Worldstate indisponible</h2>
        <p className="text-xs text-muted-foreground">{error}</p>
        <Button onClick={() => void fetchWorldstate(true, false)}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Réessayer</span>
        </Button>
      </div>
    )
  }

  if (!data) return <div />

  const navItems: Array<{
    id: HubSectionId
    label: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string
  }> = [
    { id: 'planets', label: 'Planètes & Mises à prix', icon: Globe },
    {
      id: 'fissures',
      label: 'Fissures & Archonte',
      icon: Flame,
      badge: String(data.fissures.length)
    },
    {
      id: 'invasions',
      label: 'Invasions, Acier & Arbitrage',
      icon: Swords,
      badge: String(data.invasions.length)
    },
    { id: 'duviri', label: 'Circuit Duviri', icon: Sparkles },
    {
      id: 'baro',
      label: "Baro Ki'Teer",
      icon: Compass,
      ...(data.voidTrader.active ? { badge: 'ACTIF' } : {})
    },
    { id: 'news', label: 'News & Darvo', icon: Newspaper }
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = section === item.id
            return (
              <Button
                key={item.id}
                size="sm"
                variant={active ? 'default' : 'outline'}
                onClick={() => setSection(item.id)}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? '' : 'text-primary'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge
                    variant={active ? 'secondary' : 'outline'}
                    className="ml-0.5 px-1.5 py-0 font-mono text-[10px]"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>

        <Button
          size="sm"
          variant="ghost"
          disabled={refreshing}
          onClick={() => void fetchWorldstate(true, true)}
          title="Resynchroniser le Worldstate"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </Button>
      </div>

      <div key={section} className="wf-view-enter">
        {section === 'planets' && (
          <HubPlanetsBountiesTab cycles={data.cycles} bounties={data.bounties} nowMs={nowMs} />
        )}
        {section === 'fissures' && (
          <HubFissuresMissionsTab
            fissures={data.fissures}
            archonHunt={data.archonHunt}
            sortie={data.sortie}
            nowMs={nowMs}
          />
        )}
        {section === 'invasions' && (
          <HubInvasionsSteelTab
            invasions={data.invasions}
            steelPath={data.steelPath}
            arbitration={data.arbitration}
            alerts={data.alerts}
            events={data.events}
            nightwave={data.nightwave}
            nowMs={nowMs}
          />
        )}
        {section === 'duviri' && <HubDuviriCircuitTab circuit={data.duviriCircuit} nowMs={nowMs} />}
        {section === 'baro' && <HubBaroTraderTab voidTrader={data.voidTrader} nowMs={nowMs} />}
        {section === 'news' && (
          <HubNewsDarvoTab
            news={data.news}
            globalBoosters={data.globalBoosters}
            darvoDeals={data.darvoDeals}
            primeResurgence={data.primeResurgence}
            nowMs={nowMs}
          />
        )}
      </div>
    </div>
  )
}

