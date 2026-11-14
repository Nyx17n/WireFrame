import * as React from 'react'
import {
  AlertTriangle,
  Globe,
  KeyRound,
  PackageOpen,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { WfmAccountHeaderKpis } from '@/components/wfm-account/WfmAccountHeaderKpis'
import { WfmOwnOrderRow } from '@/components/wfm-account/WfmOwnOrderRow'
import { WfmProfileInsightsTab } from '@/components/wfm-account/WfmProfileInsightsTab'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'
import { useWfmAccountStore } from '@/stores/useWfmAccountStore'

export function WfmAccountView(): React.JSX.Element {
  const isCompact = useAppStore((s) => s.windowState.isCompactMode)
  const refreshRevision = useTabsStore((s) => s.refreshRevision)

  const session = useWfmAccountStore((s) => s.session)
  const isBootstrapped = useWfmAccountStore((s) => s.isSessionBootstrapped)
  const overview = useWfmAccountStore((s) => s.overview)
  const isLoading = useWfmAccountStore((s) => s.isLoadingOverview)
  const errorMsg = useWfmAccountStore((s) => s.overviewError)
  const openSignInModal = useWfmAccountStore((s) => s.openSignInModal)
  const openCreateOrderModal = useWfmAccountStore((s) => s.openCreateOrderModal)
  const loadOverview = useWfmAccountStore((s) => s.loadOverview)

  const [activeTab, setActiveTab] = React.useState<'sell' | 'buy' | 'profile'>('sell')
  const [query, setQuery] = React.useState('')
  const [visFilter, setVisFilter] = React.useState<'all' | 'visible' | 'hidden'>('all')
  const lastRefreshRef = React.useRef(refreshRevision)

  React.useEffect(() => {
    if (session.connected && !overview && !isLoading) {
      void loadOverview(false)
    }
  }, [session.connected, overview, isLoading, loadOverview])

  React.useEffect(() => {
    if (refreshRevision !== lastRefreshRef.current) {
      lastRefreshRef.current = refreshRevision
      if (session.connected) void loadOverview(true)
    }
  }, [refreshRevision, session.connected, loadOverview])

  // State 2A: Optional Disconnected State (zero sell controls exposed!)
  if (isBootstrapped && !session.connected) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <Card className="border-primary/35">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <KeyRound className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-base font-bold">Compte Warframe Market (100 % Optionnel)</h1>
              <p className="text-xs text-muted-foreground">
                Connectez votre compte <span className="font-mono">warframe.market</span> pour
                afficher tout votre profil, changer votre statut en direct (
                <span className="text-emerald-400">En jeu</span> / En ligne / Invisible) et mettre
                vos items en vente. Tant que vous n’êtes pas connecté, la mise en vente est
                désactivée.
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Mot de passe jamais stocké · Session chiffrée via Windows DPAPI</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button onClick={() => openSignInModal('credentials')}>
                <KeyRound className="h-4 w-4" />
                <span>Connexion dans l’app</span>
              </Button>
              <Button variant="outline" onClick={() => openSignInModal('web')}>
                <Globe className="h-4 w-4" />
                <span>Connexion via page Web WFM</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // State 1: Loading Skeleton
  if (!isBootstrapped || (isLoading && !overview)) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // State 4: Error State
  if (errorMsg || !overview) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <h2 className="text-sm font-semibold">Impossible de charger votre profil WFM</h2>
        <p className="text-xs text-muted-foreground">
          {errorMsg ?? 'Session expirée ou service Warframe Market indisponible.'}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void loadOverview(true)}>
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Réessayer</span>
          </Button>
          <Button onClick={() => openSignInModal()}>
            <KeyRound className="h-3.5 w-3.5" />
            <span>Se reconnecter</span>
          </Button>
        </div>
      </div>
    )
  }

  const rawList = activeTab === 'sell' ? overview.sellOrders : overview.buyOrders
  const filteredOrders = rawList.filter((ord) => {
    if (visFilter === 'visible' && !ord.visible) return false
    if (visFilter === 'hidden' && ord.visible) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    return ord.itemNameFr.toLowerCase().includes(q) || ord.itemNameEn.toLowerCase().includes(q)
  })

  // State 3: Nominal (+ State 2B Empty 0 orders inside tab)
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-3 sm:p-4">
      <WfmAccountHeaderKpis overview={overview} isCompact={isCompact} />

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ['sell', `💰 Mes Ventes (${overview.sellOrders.length})`],
              ['buy', `🛒 Mes Achats (${overview.buyOrders.length})`],
              ['profile', '⭐ Profil Complet & Avis']
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
                activeTab === key
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <Button
          size="sm"
          variant="outline"
          disabled={isLoading}
          onClick={() => void loadOverview(true)}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          <span>Actualiser</span>
        </Button>
      </div>

      {activeTab === 'profile' ? (
        <WfmProfileInsightsTab overview={overview} />
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filtrer mes annonces FR/EN…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-1">
              {(
                [
                  ['all', 'Toutes'],
                  ['visible', 'Visibles'],
                  ['hidden', 'Masquées']
                ] as const
              ).map(([vf, lbl]) => (
                <button
                  key={vf}
                  type="button"
                  onClick={() => setVisFilter(vf)}
                  className={cn(
                    'rounded border px-2.5 py-1 text-xs font-medium',
                    visFilter === vf
                      ? 'border-primary bg-primary/15 text-foreground'
                      : 'border-border bg-card text-muted-foreground'
                  )}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                <PackageOpen className="h-8 w-8 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {rawList.length === 0
                    ? activeTab === 'sell'
                      ? 'Aucune annonce en vente sur votre profil Warframe Market.'
                      : 'Aucun ordre d’achat actif sur votre profil.'
                    : 'Aucune annonce ne correspond à ce filtre.'}
                </p>
                <Button
                  size="sm"
                  onClick={() =>
                    openCreateOrderModal({ defaultType: activeTab === 'buy' ? 'buy' : 'sell' })
                  }
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>
                    {activeTab === 'sell'
                      ? 'Mettre mon premier item en vente'
                      : 'Créer un ordre d’achat'}
                  </span>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredOrders.map((ord) => (
                <WfmOwnOrderRow key={ord.id} order={ord} isCompact={isCompact} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

