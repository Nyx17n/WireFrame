import * as React from 'react'
import { BookOpen, Ghost, Keyboard, Trash2 } from 'lucide-react'
import {
  CODEX_OVERLAY_MAX_ENTRIES,
  type OverlayDensity
} from '@shared/schemas/extensions.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/stores/useAppStore'
import { useFarmOverlayStore } from '@/stores/useFarmOverlayStore'
import { useTabsStore } from '@/stores/useTabsStore'

function formatShortcutAccelerator(e: React.KeyboardEvent<HTMLButtonElement>): string | null {
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

const DENSITY_OPTIONS: readonly { id: OverlayDensity; label: string }[] = [
  { id: 'sm', label: 'S' },
  { id: 'md', label: 'M' },
  { id: 'lg', label: 'L' }
]

export function CodexOverlayExtensionDrawer(): React.JSX.Element {
  const liveState = useFarmOverlayStore((s) => s.liveState)
  const setClickThrough = useFarmOverlayStore((s) => s.setClickThrough)
  const setSize = useFarmOverlayStore((s) => s.setSize)
  const setOpacity = useFarmOverlayStore((s) => s.setOpacity)
  const setShowObtained = useFarmOverlayStore((s) => s.setShowObtained)
  const setShortcut = useFarmOverlayStore((s) => s.setShortcut)
  const clearAllEntries = useFarmOverlayStore((s) => s.clearAllEntries)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  const navigateActive = useTabsStore((s) => s.navigateActive)

  const [isRecording, setIsRecording] = React.useState(false)

  const pinnedCount = liveState.pinnedEntries.length
  const previewNames = liveState.pinnedEntries
    .slice(0, 3)
    .map((e) => e.labelFr)
    .join(' · ')

  return (
    <div className="mt-2.5 space-y-3 rounded-md border border-primary/25 bg-background/70 p-3 text-xs">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded border border-border/60 bg-card/50 px-2.5 py-2">
          <div className="flex items-center gap-1.5">
            <Ghost className="h-3.5 w-3.5 text-primary" />
            <span>Souris traversante auto en jeu</span>
          </div>
          <Switch
            checked={liveState.isClickThrough}
            onCheckedChange={(checked) => void setClickThrough(checked)}
          />
        </label>

        <div className="flex items-center justify-between gap-2 rounded border border-border/60 bg-card/50 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Keyboard className="h-3.5 w-3.5 text-primary" />
            <span>Raccourci global</span>
          </div>
          <Button
            size="sm"
            variant={isRecording ? 'default' : 'outline'}
            className="h-7 px-2 font-mono text-[11px]"
            onClick={() => setIsRecording((v) => !v)}
            onKeyDown={(e) => {
              if (!isRecording) return
              e.preventDefault()
              if (e.key === 'Escape') {
                setIsRecording(false)
                return
              }
              const accel = formatShortcutAccelerator(e)
              if (accel) {
                void setShortcut(accel)
                setIsRecording(false)
              }
            }}
          >
            {isRecording ? 'Touches...' : liveState.shortcutToggle}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-2 rounded border border-border/60 bg-card/50 px-2.5 py-1.5">
          <span className="text-muted-foreground">Densité des cartes</span>
          <div className="flex items-center gap-1">
            {DENSITY_OPTIONS.map((opt) => (
              <Button
                key={opt.id}
                size="sm"
                variant={liveState.size === opt.id ? 'default' : 'outline'}
                className="h-6 w-7 px-0 text-[11px]"
                onClick={() => void setSize(opt.id)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 rounded border border-border/60 bg-card/50 px-2.5 py-1.5">
          <span className="text-muted-foreground">Opacité ({liveState.opacityPercent}%)</span>
          <input
            type="range"
            min={40}
            max={98}
            step={2}
            value={liveState.opacityPercent}
            onChange={(e) => void setOpacity(Number(e.target.value))}
            className="h-1.5 w-28 accent-primary"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-2 rounded border border-border/60 bg-card/50 px-2.5 py-2">
        <span className="text-muted-foreground">
          Afficher aussi les entrées cochées comme obtenues (✓) dans l’Overlay
        </span>
        <Switch
          checked={liveState.showObtained}
          onCheckedChange={(checked) => void setShowObtained(checked)}
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-border/60 bg-card/40 px-2.5 py-2">
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 font-medium">
            <span>Objectifs épinglés</span>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {pinnedCount} / {CODEX_OVERLAY_MAX_ENTRIES}
            </Badge>
          </div>
          <p className="truncate text-[11px] text-muted-foreground">
            {pinnedCount > 0
              ? previewNames
              : 'Aucun objectif épinglé — ouvre le Codex pour choisir un set ou un objet précis.'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px]"
            onClick={() => {
              setSettingsOpen(false)
              navigateActive({ kind: 'codex-home', category: 'warframes' }, 'Codex & Helminth')
            }}
          >
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span>Aller au Codex</span>
          </Button>
          {pinnedCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[11px] text-destructive hover:text-destructive"
              onClick={() => void clearAllEntries()}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Vider</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
