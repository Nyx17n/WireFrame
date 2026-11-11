import * as React from 'react'
import { ArrowDownAZ, ChevronDown, Layers, Pin, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RouteIcon } from '@/components/shell/RouteIcon'
import { getTabCurrentRoute } from '@/lib/tab-helpers'
import { useTabsStore } from '@/stores/useTabsStore'

export function TabOrganizerPopover(): React.JSX.Element {
  const [open, setOpen] = React.useState(false)
  const [filter, setFilter] = React.useState('')

  const tabs = useTabsStore((s) => s.tabs)
  const activeTabId = useTabsStore((s) => s.activeTabId)
  const hubActive = useTabsStore((s) => s.hubActive)
  const activateTab = useTabsStore((s) => s.activateTab)
  const closeTab = useTabsStore((s) => s.closeTab)
  const sortTabsAlphabetically = useTabsStore((s) => s.sortTabsAlphabetically)
  const closeDuplicateTabs = useTabsStore((s) => s.closeDuplicateTabs)

  const filteredTabs = React.useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return tabs
    return tabs.filter((t) => t.title.toLowerCase().includes(q))
  }, [tabs, filter])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Organisateur d'onglets"
          className="inline-flex h-6 items-center gap-0.5 rounded px-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Layers className="h-3 w-3" />
          <span>{tabs.length}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-80 space-y-2.5 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">Onglets ouverts ({tabs.length})</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={sortTabsAlphabetically}
              title="Trier les onglets de A à Z"
            >
              <ArrowDownAZ className="h-3 w-3" />
              <span>A→Z</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={closeDuplicateTabs}
              title="Fermer automatiquement les onglets en double"
            >
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Doublons</span>
            </Button>
          </div>
        </div>

        <Input
          placeholder="Filtrer les onglets ouverts..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-7"
        />

        <div className="max-h-56 space-y-1 overflow-y-auto pr-0.5">
          {filteredTabs.map((tab) => {
            const route = getTabCurrentRoute(tab)
            const isSelected = !hubActive && tab.id === activeTabId
            return (
              <div
                key={tab.id}
                onClick={() => {
                  activateTab(tab.id)
                  setOpen(false)
                }}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-1.5 text-xs ${
                  isSelected
                    ? 'bg-primary/15 font-semibold text-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <RouteIcon kind={route.kind} className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate">{tab.title}</span>
                  {tab.pinned && <Pin className="h-3 w-3 shrink-0 text-primary" />}
                </div>
                {!tab.pinned && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeTab(tab.id)
                    }}
                    className="rounded p-0.5 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

