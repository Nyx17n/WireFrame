import * as React from 'react'
import { Play, Sparkles, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { THEME_PRESETS } from '@/lib/theme-engine'
import { useAppStore } from '@/stores/useAppStore'

export function AppearanceSettingsTab(): React.JSX.Element {
  const appearance = useAppStore((s) => s.settings.appearance)
  const windowState = useAppStore((s) => s.windowState)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const setWindowZoom = useAppStore((s) => s.setWindowZoom)
  const replayStartupAnimation = useAppStore((s) => s.replayStartupAnimation)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Thèmes Prédéfinis Warframe</h3>
        <p className="text-xs text-muted-foreground">
          Choisis une ambiance bicolore ou personnalise librement tes couleurs.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {THEME_PRESETS.map((preset) => {
          const active = appearance.preset === preset.id
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                void updateSettings({
                  appearance: {
                    preset: preset.id,
                    primaryColor: preset.primaryHex,
                    secondaryColor: preset.secondaryHex
                  }
                })
              }
              className={`flex items-center gap-2 rounded-md border p-2.5 text-left text-xs transition-all ${
                active
                  ? 'border-primary bg-primary/15 font-semibold text-foreground'
                  : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <span className="flex shrink-0 -space-x-1">
                <span
                  className="h-4 w-4 rounded-full border border-white/25"
                  style={{ backgroundColor: preset.primaryHex }}
                />
                <span
                  className="h-4 w-4 rounded-full border border-white/25"
                  style={{ backgroundColor: preset.secondaryHex }}
                />
              </span>
              <span className="truncate">{preset.label}</span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-md border border-border bg-background/50 p-3 sm:grid-cols-2">
        <label className="flex items-center justify-between gap-2 text-xs">
          <span>Couleur Principale (Fonds)</span>
          <span className="flex items-center gap-1.5 font-mono">
            <span>{appearance.primaryColor}</span>
            <input
              type="color"
              value={appearance.primaryColor}
              onChange={(e) =>
                void updateSettings({
                  appearance: { preset: 'custom', primaryColor: e.target.value }
                })
              }
              className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
            />
          </span>
        </label>

        <label className="flex items-center justify-between gap-2 text-xs">
          <span>Couleur Secondaire (Accents)</span>
          <span className="flex items-center gap-1.5 font-mono">
            <span>{appearance.secondaryColor}</span>
            <input
              type="color"
              value={appearance.secondaryColor}
              onChange={(e) =>
                void updateSettings({
                  appearance: { preset: 'custom', secondaryColor: e.target.value }
                })
              }
              className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
            />
          </span>
        </label>
      </div>

      <div className="space-y-3 rounded-md border border-border bg-background/50 p-3">
        <label className="flex cursor-pointer items-center justify-between text-xs">
          <span className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Effet de lueur subtile sur les cartes (Glow)</span>
          </span>
          <Switch
            checked={appearance.glowEnabled}
            onCheckedChange={(checked) =>
              void updateSettings({ appearance: { glowEnabled: checked } })
            }
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-2">
            <Play className="h-3.5 w-3.5 text-primary" />
            <span>Animation d’ouverture « Wire » au lancement</span>
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={replayStartupAnimation}>
              <Play className="h-3 w-3 text-primary" />
              <span>Rejouer</span>
            </Button>
            <Switch
              checked={appearance.startupAnimationEnabled}
              onCheckedChange={(checked) =>
                void updateSettings({ appearance: { startupAnimationEnabled: checked } })
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span>Zoom d’interface natif ({windowState.zoomPercent} %)</span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => void setWindowZoom(windowState.zoomPercent - 10)}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => void setWindowZoom(100)}>
              100 %
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => void setWindowZoom(windowState.zoomPercent + 10)}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

