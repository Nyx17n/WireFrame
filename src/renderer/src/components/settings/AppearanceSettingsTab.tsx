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

  const activePreset = THEME_PRESETS.find((p) => p.id === appearance.preset)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <span>◆</span>
            <span>Thème de l’Interface</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Choisis l’apparence visuelle de WireFrame parmi les 20 thèmes (Sombre, Clair, OLED,
            Bleu, Cyan, Vert, Jaune, Rouge, Orange, Violet, Rose) :
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>
            {activePreset ? `${activePreset.glyph} ${activePreset.label}` : '✦ Personnalisé'}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
              style={
                active
                  ? {
                      boxShadow: `0 0 18px -4px ${preset.secondaryHex}66, inset 0 0 12px -6px ${preset.secondaryHex}55`
                    }
                  : undefined
              }
              className={`group flex flex-col items-center justify-center gap-0.5 rounded-lg border px-2.5 py-2.5 text-center transition-all ${
                active
                  ? 'border-primary bg-primary/10'
                  : 'border-border/80 bg-card/60 hover:border-primary/45 hover:bg-secondary/40'
              }`}
            >
              <span
                className={`flex items-center gap-1.5 text-xs font-bold ${
                  active ? 'text-primary' : 'text-foreground group-hover:text-primary'
                }`}
              >
                <span style={{ color: preset.secondaryHex }}>{preset.glyph}</span>
                <span className="truncate">{preset.label}</span>
              </span>
              <span
                className={`line-clamp-1 text-[10px] ${
                  active ? 'font-medium text-foreground/85' : 'text-muted-foreground'
                }`}
              >
                {preset.subtitle}
              </span>
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
