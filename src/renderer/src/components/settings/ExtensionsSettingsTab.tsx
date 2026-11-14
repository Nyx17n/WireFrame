import * as React from 'react'
import { Blocks, ChevronDown, ChevronUp, Crosshair, Search, SlidersHorizontal } from 'lucide-react'
import {
  BUILTIN_EXTENSIONS_CATALOG,
  type ExtensionCategoryFilter,
  type ExtensionId
} from '@shared/schemas/extensions.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { CodexOverlayExtensionDrawer } from '@/components/settings/CodexOverlayExtensionDrawer'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { useFarmOverlayStore } from '@/stores/useFarmOverlayStore'

const FILTER_PILLS: readonly { id: ExtensionCategoryFilter; label: string }[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'active', label: 'Activées' },
  { id: 'overlay', label: 'En jeu / Overlay' },
  { id: 'codex', label: 'Codex & Farm' }
]

export function ExtensionsSettingsTab(): React.JSX.Element {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const overlayLive = useFarmOverlayStore((s) => s.liveState)
  const setOverlayWindowOpen = useFarmOverlayStore((s) => s.setWindowOpen)

  const [searchQuery, setSearchQuery] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<ExtensionCategoryFilter>('all')
  const [expandedId, setExpandedId] = React.useState<ExtensionId | null>('codex-farm-overlay')

  const isExtensionEnabled = (id: ExtensionId): boolean => {
    if (id === 'codex-farm-overlay') return settings.extensions.codexFarmOverlay
    if (id === 'compact-timers') return settings.appearance.compactTimers.enabled
    return settings.extensions.whisperBarPersistent
  }

  const handleToggleExtension = (id: ExtensionId, enabled: boolean): void => {
    if (id === 'codex-farm-overlay') {
      void updateSettings({ extensions: { codexFarmOverlay: enabled } })
      if (!enabled && expandedId === 'codex-farm-overlay') {
        setExpandedId(null)
      }
      return
    }
    if (id === 'compact-timers') {
      void updateSettings({
        appearance: { compactTimers: { ...settings.appearance.compactTimers, enabled } }
      })
      return
    }
    void updateSettings({ extensions: { whisperBarPersistent: enabled } })
  }

  const activeCount = BUILTIN_EXTENSIONS_CATALOG.filter((ext) =>
    isExtensionEnabled(ext.id)
  ).length

  const filteredExtensions = BUILTIN_EXTENSIONS_CATALOG.filter((ext) => {
    const enabled = isExtensionEnabled(ext.id)
    if (categoryFilter === 'active' && !enabled) return false
    if (categoryFilter === 'overlay' && ext.categoryTag !== 'overlay' && ext.id !== 'codex-farm-overlay')
      return false
    if (categoryFilter === 'codex' && ext.categoryTag !== 'codex') return false

    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    return (
      ext.nameFr.toLowerCase().includes(q) ||
      ext.summaryFr.toLowerCase().includes(q) ||
      ext.badgeFr.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Blocks className="h-4 w-4 text-primary" />
            <span>Extensions Modulaires & Overlays</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Active ou coupe chaque module à la carte. Une extension désactivée libère sa fenêtre et ses raccourcis (0 Mo RAM).
          </p>
        </div>
        <Badge variant="secondary" className="font-mono text-[11px]">
          {activeCount} / {BUILTIN_EXTENSIONS_CATALOG.length} actives
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background/50 p-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer la liste des extensions..."
            className="h-7 pl-8 text-xs"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {FILTER_PILLS.map((pill) => (
            <Button
              key={pill.id}
              size="sm"
              variant={categoryFilter === pill.id ? 'default' : 'ghost'}
              className="h-7 px-2 text-[11px]"
              onClick={() => setCategoryFilter(pill.id)}
            >
              {pill.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {filteredExtensions.length === 0 ? (
          <div className="rounded-md border border-border bg-background/40 p-6 text-center text-xs text-muted-foreground">
            Aucune extension ne correspond à ce filtre.
          </div>
        ) : (
          filteredExtensions.map((ext) => {
            const enabled = isExtensionEnabled(ext.id)
            const isExpanded = expandedId === ext.id && enabled

            return (
              <div
                key={ext.id}
                className={cn(
                  'rounded-lg border p-3 transition-colors',
                  enabled
                    ? 'border-primary/35 bg-card/70'
                    : 'border-border/60 bg-background/35 opacity-75'
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground">{ext.nameFr}</span>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        v{ext.version}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {ext.badgeFr}
                      </Badge>
                      {ext.isOfficial && (
                        <Badge className="bg-primary/15 text-[10px] text-primary">Officielle</Badge>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      {ext.summaryFr}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {ext.id === 'codex-farm-overlay' && enabled && (
                      <Button
                        size="sm"
                        variant={overlayLive.windowOpen ? 'default' : 'outline'}
                        className="h-7 px-2.5 text-[11px]"
                        onClick={() => void setOverlayWindowOpen(!overlayLive.windowOpen)}
                      >
                        <Crosshair className="h-3.5 w-3.5" />
                        <span>{overlayLive.windowOpen ? 'Masquer Overlay' : 'Ouvrir Overlay'}</span>
                      </Button>
                    )}

                    {(ext.id === 'codex-farm-overlay' || ext.id === 'compact-timers') && enabled && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[11px]"
                        onClick={() => setExpandedId(isExpanded ? null : ext.id)}
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                        <span>Réglages</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                    )}

                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => handleToggleExtension(ext.id, checked)}
                    />
                  </div>
                </div>

                {ext.id === 'codex-farm-overlay' && isExpanded && <CodexOverlayExtensionDrawer />}

                {ext.id === 'compact-timers' && isExpanded && (
                  <div className="mt-2.5 rounded-md border border-border/60 bg-background/60 p-2.5 text-xs">
                    <label className="flex cursor-pointer items-center justify-between gap-2">
                      <span className="text-muted-foreground">
                        Afficher aussi le bandeau de minuteurs en mode Desktop normal
                      </span>
                      <Switch
                        checked={settings.appearance.compactTimers.showOnDesktop}
                        onCheckedChange={(checked) =>
                          void updateSettings({
                            appearance: {
                              compactTimers: {
                                ...settings.appearance.compactTimers,
                                showOnDesktop: checked
                              }
                            }
                          })
                        }
                      />
                    </label>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
