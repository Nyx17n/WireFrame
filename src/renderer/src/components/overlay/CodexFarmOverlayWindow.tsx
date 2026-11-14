import * as React from 'react'
import { AlertTriangle, Crosshair, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CodexFarmOverlayCard } from '@/components/overlay/CodexFarmOverlayCard'
import { CodexFarmOverlayHeader } from '@/components/overlay/CodexFarmOverlayHeader'
import { applyThemeToDocument } from '@/lib/theme-engine'
import { cn } from '@/lib/utils'
import { ipcClient } from '@/services/ipc-client'
import { useFarmOverlayStore } from '@/stores/useFarmOverlayStore'

type KindFilter = 'all' | 'resources' | 'parts'

export function CodexFarmOverlayWindow(): React.JSX.Element {
  const liveState = useFarmOverlayStore((s) => s.liveState)
  const isHydrated = useFarmOverlayStore((s) => s.isHydrated)
  const errorMessage = useFarmOverlayStore((s) => s.errorMessage)
  const hydrate = useFarmOverlayStore((s) => s.hydrate)
  const setWindowOpen = useFarmOverlayStore((s) => s.setWindowOpen)
  const setClickThrough = useFarmOverlayStore((s) => s.setClickThrough)
  const setSize = useFarmOverlayStore((s) => s.setSize)
  const setOpacity = useFarmOverlayStore((s) => s.setOpacity)
  const setShowObtained = useFarmOverlayStore((s) => s.setShowObtained)
  const toggleObtained = useFarmOverlayStore((s) => s.toggleObtained)
  const removeEntry = useFarmOverlayStore((s) => s.removeEntry)

  const [selectedGroup, setSelectedGroup] = React.useState<string>('all')
  const [kindFilter, setKindFilter] = React.useState<KindFilter>('all')

  React.useEffect(() => {
    document.documentElement.style.background = 'transparent'
    document.body.style.background = 'transparent'

    let unsubOverlay: (() => void) | undefined
    void hydrate().then((fn) => {
      unsubOverlay = fn
    })

    const refreshTheme = (): void => {
      void ipcClient.settings.get().then((s) => {
        applyThemeToDocument(s.appearance)
        document.documentElement.style.background = 'transparent'
        document.body.style.background = 'transparent'
      })
    }

    refreshTheme()
    const unsubStateTheme = ipcClient.overlay.onStateChanged(() => {
      refreshTheme()
    })

    return () => {
      unsubOverlay?.()
      unsubStateTheme()
    }
  }, [hydrate])

  const groups = React.useMemo(() => {
    const unique = new Set<string>()
    for (const e of liveState.pinnedEntries) {
      unique.add(e.itemNameFr)
    }
    return Array.from(unique)
  }, [liveState.pinnedEntries])

  React.useEffect(() => {
    if (selectedGroup !== 'all' && !groups.includes(selectedGroup)) {
      setSelectedGroup('all')
    }
  }, [groups, selectedGroup])

  const hasResources = liveState.pinnedEntries.some((e) => e.isResource)
  const hasNonResources = liveState.pinnedEntries.some((e) => !e.isResource)

  const obtainedCount = liveState.pinnedEntries.filter((e) => e.obtained).length
  const visibleEntries = liveState.pinnedEntries.filter((e) => {
    if (!liveState.showObtained && e.obtained) return false
    if (selectedGroup !== 'all' && e.itemNameFr !== selectedGroup) return false
    if (kindFilter === 'resources' && !e.isResource) return false
    if (kindFilter === 'parts' && e.isResource) return false
    return true
  })

  const surfaceOpacity = Math.max(0.4, Math.min(0.98, liveState.opacityPercent / 100))
  const interactive = !liveState.isClickThrough

  return (
    <div className="h-screen w-screen overflow-hidden p-1.5">
      <div
        style={{ backgroundColor: `hsl(var(--background) / ${surfaceOpacity})` }}
        className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-primary/35 text-foreground shadow-2xl backdrop-blur-md"
      >
        <CodexFarmOverlayHeader
          liveState={liveState}
          activeCount={visibleEntries.length}
          onSetSize={(s) => void setSize(s)}
          onSetOpacity={(o) => void setOpacity(o)}
          onSetClickThrough={(enabled) => void setClickThrough(enabled)}
          onCloseWindow={() => void setWindowOpen(false)}
        />

        {interactive && (groups.length > 1 || (hasResources && hasNonResources)) && (
          <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-border/60 bg-background/40 px-2.5 py-1.5">
            {hasResources && hasNonResources && (
              <>
                {(
                  [
                    { id: 'all', label: 'Tout' },
                    { id: 'resources', label: 'Ressources' },
                    { id: 'parts', label: 'Pièces' }
                  ] as const
                ).map((kf) => (
                  <button
                    key={kf.id}
                    type="button"
                    onClick={() => setKindFilter(kf.id)}
                    className={cn(
                      'shrink-0 rounded px-2 py-0.5 text-[10px] font-medium transition-colors',
                      kindFilter === kf.id
                        ? 'bg-amber-500/25 text-amber-200 ring-1 ring-amber-500/50'
                        : 'bg-secondary/70 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {kf.label}
                  </button>
                ))}
              </>
            )}

            {groups.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedGroup('all')}
                  className={cn(
                    'shrink-0 rounded px-2 py-0.5 text-[10px] font-medium transition-colors',
                    selectedGroup === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/70 text-muted-foreground hover:text-foreground'
                  )}
                >
                  Tous sets
                </button>
                {groups.map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setSelectedGroup(grp)}
                    className={cn(
                      'shrink-0 rounded px-2 py-0.5 text-[10px] font-medium transition-colors',
                      selectedGroup === grp
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/70 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {grp}
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5">
          {!isHydrated ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : errorMessage ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-xs">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-destructive">{errorMessage}</p>
              {interactive && (
                <Button size="sm" variant="outline" onClick={() => void hydrate()}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Réessayer</span>
                </Button>
              )}
            </div>
          ) : liveState.pinnedEntries.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-xs text-muted-foreground">
              <Crosshair className="h-7 w-7 text-primary/70" />
              <p className="font-semibold text-foreground">Aucun objectif épinglé</p>
              <p className="text-[11px]">
                Ouvre le Codex dans WireFrame puis clique sur « Ressources craft en Overlay » ou « Tout en Overlay ».
              </p>
            </div>
          ) : visibleEntries.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-xs text-muted-foreground">
              <p className="font-semibold text-emerald-300">Aucun élément visible pour ce filtre</p>
              {interactive && obtainedCount > 0 && !liveState.showObtained && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px]"
                  onClick={() => void setShowObtained(true)}
                >
                  Afficher les obtenus ({obtainedCount})
                </Button>
              )}
            </div>
          ) : (
            visibleEntries.map((entry) => (
              <CodexFarmOverlayCard
                key={entry.entryId}
                entry={entry}
                density={liveState.size}
                interactive={interactive}
                onToggleObtained={(id) => void toggleObtained(id)}
                onRemove={(id) => void removeEntry(id)}
              />
            ))
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-border/65 bg-card/80 px-2.5 py-1.5 text-[10px] text-muted-foreground">
          <span>
            {liveState.isClickThrough
              ? '👻 Souris traversante active — survole 🔓 0.5s pour déverrouiller'
              : '🖱 Mode interactif — coche ✓ ou filtre Pièces / Ressources'}
          </span>
          {interactive && obtainedCount > 0 ? (
            <button
              type="button"
              onClick={() => void setShowObtained(!liveState.showObtained)}
              className="shrink-0 font-medium text-primary hover:underline"
            >
              {liveState.showObtained
                ? 'Masquer obtenus'
                : `Afficher obtenus (${obtainedCount})`}
            </button>
          ) : (
            <span className="shrink-0 font-mono text-primary">{liveState.shortcutToggle}</span>
          )}
        </footer>
      </div>
    </div>
  )
}
