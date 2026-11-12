import * as React from 'react'
import { ChevronDown, History, Plus, Search, Trash2, X } from 'lucide-react'
import { formatRouteUri } from '@shared/schemas/navigation.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RouteIcon } from '@/components/shell/RouteIcon'
import { normalizeSearchText } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

const PAGE_STEP = 50

function formatVisitedTimestamp(isoString: string): string {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  const timePart = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (isToday) {
    return `Aujourd'hui · ${timePart}`
  }
  const datePart = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  return `${datePart} · ${timePart}`
}

export function BrowserHistoryView(): React.JSX.Element {
  const navigationHistory = useTabsStore((s) => s.navigationHistory)
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)
  const removeHistoryEntry = useTabsStore((s) => s.removeHistoryEntry)
  const clearNavigationHistory = useTabsStore((s) => s.clearNavigationHistory)

  const [query, setQuery] = React.useState('')
  const [visibleCount, setVisibleCount] = React.useState(PAGE_STEP)

  React.useEffect(() => {
    setVisibleCount(PAGE_STEP)
  }, [query])

  const filteredEntries = React.useMemo(() => {
    const q = normalizeSearchText(query)
    if (!q) return navigationHistory
    return navigationHistory.filter((entry) => {
      const uri = formatRouteUri(entry.route)
      return normalizeSearchText(entry.title).includes(q) || normalizeSearchText(uri).includes(q)
    })
  }, [navigationHistory, query])

  const visibleEntries = filteredEntries.slice(0, visibleCount)
  const remainingCount = Math.max(0, filteredEntries.length - visibleEntries.length)

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-base font-bold tracking-tight">
            <History className="h-4 w-4 text-primary" />
            <span>Historique de navigation</span>
            <Badge variant="secondary" className="font-mono text-[11px]">
              {navigationHistory.length}
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground">
            Retrouve rapidement toutes les fiches Marché, recherches Codex et outils consultés.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={navigationHistory.length === 0}
          onClick={clearNavigationHistory}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
          <span>Effacer l’historique</span>
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrer l'historique par nom d'item, fiche Codex ou adresse wf://..."
          className="h-8 pl-8 text-xs"
        />
      </div>

      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <History className="h-7 w-7 text-muted-foreground/60" />
            <p className="text-xs font-medium text-muted-foreground">
              {navigationHistory.length === 0
                ? 'Aucune page enregistrée dans l’historique pour le moment.'
                : 'Aucune entrée ne correspond à ce filtre.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {visibleEntries.map((entry) => {
            const uri = formatRouteUri(entry.route)
            return (
              <div
                key={entry.id}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    openTab(entry.route, { title: entry.title })
                  } else {
                    navigateActive(entry.route, entry.title)
                  }
                }}
                onAuxClick={(e) => {
                  if (e.button === 1) {
                    e.preventDefault()
                    openTab(entry.route, { title: entry.title })
                  }
                }}
                className="group flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-xs transition-colors hover:border-primary/50 hover:bg-secondary/50"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <RouteIcon kind={entry.route.kind} className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">{entry.title}</div>
                    <div className="truncate font-mono text-[11px] text-muted-foreground">
                      {uri}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
                    {formatVisitedTimestamp(entry.visitedAt)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Ouvrir dans un nouvel onglet"
                    onClick={(e) => {
                      e.stopPropagation()
                      openTab(entry.route, { title: entry.title })
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Retirer de l'historique"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeHistoryEntry(entry.id)
                    }}
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            )
          })}

          {remainingCount > 0 && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount((prev) => prev + PAGE_STEP)}
              >
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Afficher plus ({remainingCount} restants)</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
