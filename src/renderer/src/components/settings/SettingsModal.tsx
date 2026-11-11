import * as React from 'react'
import { Database, Monitor, Palette, Store, Volume2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { AppearanceSettingsTab } from '@/components/settings/AppearanceSettingsTab'
import { AudioAlertsSettingsTab } from '@/components/settings/AudioAlertsSettingsTab'
import { WindowShortcutsSettingsTab } from '@/components/settings/WindowShortcutsSettingsTab'
import { MarketTradingSettingsTab } from '@/components/settings/MarketTradingSettingsTab'
import { SystemDataSettingsTab } from '@/components/settings/SystemDataSettingsTab'
import { useAppStore, type SettingsTabId } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

const SETTINGS_NAV: readonly {
  id: SettingsTabId
  label: string
  shortLabel: string
  Icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: 'appearance', label: 'Apparence & Thèmes', shortLabel: 'Thèmes', Icon: Palette },
  { id: 'audio', label: 'Audio & Alertes', shortLabel: 'Audio', Icon: Volume2 },
  { id: 'window', label: 'Fenêtre & Raccourcis', shortLabel: 'Fenêtre', Icon: Monitor },
  { id: 'market', label: 'Marché & Échanges', shortLabel: 'Marché', Icon: Store },
  { id: 'system', label: 'Système & Données', shortLabel: 'Système', Icon: Database }
]

export function SettingsModal(): React.JSX.Element {
  const isOpen = useAppStore((s) => s.isSettingsOpen)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  const activeTab = useAppStore((s) => s.activeSettingsTab)
  const setActiveTab = useAppStore((s) => s.setActiveSettingsTab)
  const isCompact = useAppStore((s) => s.windowState.isCompactMode)

  return (
    <Dialog open={isOpen} onOpenChange={setSettingsOpen}>
      <DialogContent
        className={cn(
          'gap-0 overflow-hidden p-0',
          isCompact ? 'h-[94vh] max-w-[95vw]' : 'h-[620px] max-w-4xl'
        )}
      >
        <DialogHeader className="border-b border-border bg-background/70 px-4 py-3">
          <DialogTitle>Paramètres WireFrame v2</DialogTitle>
          <DialogDescription>
            Tous les changements sont validés par Zod et enregistrés automatiquement.
          </DialogDescription>
        </DialogHeader>

        <div className={cn('flex min-h-0 flex-1', isCompact ? 'flex-col' : 'flex-row')}>
          <nav
            className={cn(
              'shrink-0 border-border bg-background/40 p-2',
              isCompact
                ? 'flex gap-1 overflow-x-auto border-b'
                : 'flex w-52 flex-col gap-1 border-r'
            )}
          >
            {SETTINGS_NAV.map(({ id, label, shortLabel, Icon }) => {
              const selected = activeTab === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors',
                    selected
                      ? 'bg-primary/15 font-semibold text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{isCompact ? shortLabel : label}</span>
                </button>
              )
            })}
          </nav>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'appearance' && <AppearanceSettingsTab />}
            {activeTab === 'audio' && <AudioAlertsSettingsTab />}
            {activeTab === 'window' && <WindowShortcutsSettingsTab />}
            {activeTab === 'market' && <MarketTradingSettingsTab />}
            {activeTab === 'system' && <SystemDataSettingsTab />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

