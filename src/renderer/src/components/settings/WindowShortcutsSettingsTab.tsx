import * as React from 'react'
import { Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/stores/useAppStore'

type ShortcutKey = 'toggleOverlay' | 'toggleCompact' | 'toggleAlwaysOnTop'

function formatAccelerator(e: React.KeyboardEvent<HTMLButtonElement>): string | null {
  const ignored = new Set(['Control', 'Shift', 'Alt', 'Meta'])
  if (ignored.has(e.key)) return null

  const parts: string[] = []
  if (e.ctrlKey) parts.push('CommandOrControl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')
  if (parts.length === 0) return null

  const keyName = e.key.length === 1 ? e.key.toUpperCase() : e.key
  parts.push(keyName)
  return parts.join('+')
}

export function WindowShortcutsSettingsTab(): React.JSX.Element {
  const winSettings = useAppStore((s) => s.settings.window)
  const windowState = useAppStore((s) => s.windowState)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const toggleAlwaysOnTop = useAppStore((s) => s.toggleAlwaysOnTop)

  const [recording, setRecording] = React.useState<ShortcutKey | null>(null)

  const shortcutRows: readonly { key: ShortcutKey; label: string }[] = [
    { key: 'toggleOverlay', label: 'Afficher / Masquer WireFrame en jeu' },
    { key: 'toggleCompact', label: 'Basculer Mode Compact (460×660)' },
    { key: 'toggleAlwaysOnTop', label: 'Basculer Épingle Premier Plan' }
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Fenêtre, System Tray & Raccourcis Globaux</h3>
        <p className="text-xs text-muted-foreground">
          Pilote WireFrame directement par-dessus Warframe sans Alt+Tab.
        </p>
      </div>

      <div className="space-y-3 rounded-md border border-border bg-background/50 p-3">
        <label className="flex cursor-pointer items-center justify-between text-xs">
          <span>Réduire dans le System Tray à la fermeture (✕)</span>
          <Switch
            checked={winSettings.closeToTray}
            onCheckedChange={(checked) =>
              void updateSettings({ window: { closeToTray: checked } })
            }
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between text-xs">
          <span>Toujours au premier plan (Always-on-Top)</span>
          <Switch
            checked={windowState.isAlwaysOnTop}
            onCheckedChange={() => void toggleAlwaysOnTop()}
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between text-xs">
          <span>Activer les raccourcis clavier globaux système</span>
          <Switch
            checked={winSettings.globalShortcutsEnabled}
            onCheckedChange={(checked) =>
              void updateSettings({ window: { globalShortcutsEnabled: checked } })
            }
          />
        </label>
      </div>

      <div className="space-y-2 rounded-md border border-border bg-background/50 p-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <Keyboard className="h-3.5 w-3.5 text-primary" />
          <span>Combinaisons globales (clique puis appuie sur Alt/Ctrl + Touche)</span>
        </div>

        {shortcutRows.map(({ key, label }) => {
          const isRec = recording === key
          return (
            <div key={key} className="flex items-center justify-between gap-2 pt-1 text-xs">
              <span className="text-muted-foreground">{label}</span>
              <Button
                size="sm"
                variant={isRec ? 'default' : 'outline'}
                onClick={() => setRecording(isRec ? null : key)}
                onKeyDown={(e) => {
                  if (!isRec) return
                  e.preventDefault()
                  if (e.key === 'Escape') {
                    setRecording(null)
                    return
                  }
                  const accel = formatAccelerator(e)
                  if (accel) {
                    void updateSettings({
                      window: { shortcuts: { ...winSettings.shortcuts, [key]: accel } }
                    })
                    setRecording(null)
                  }
                }}
                className="font-mono"
              >
                {isRec ? 'Appuie sur les touches...' : winSettings.shortcuts[key]}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
