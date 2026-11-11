import * as React from 'react'
import { Palette, RotateCcw, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { THEME_PRESETS } from '@/lib/theme-engine'
import { useAppStore } from '@/stores/useAppStore'

export function ThemePlaygroundCard(): React.JSX.Element {
  const appearance = useAppStore((s) => s.settings.appearance)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const resetSettings = useAppStore((s) => s.resetSettings)

  const handlePresetClick = (
    presetId: (typeof THEME_PRESETS)[number]['id'],
    primaryHex: string,
    secondaryHex: string
  ): void => {
    void updateSettings({
      appearance: {
        preset: presetId,
        primaryColor: primaryHex,
        secondaryColor: secondaryHex
      }
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <span>Moteur de Thème Dual-Color</span>
          </CardTitle>
          <CardDescription>
            6 presets Warframe + couleurs Primary/Secondary persistées dans config.json
          </CardDescription>
        </div>
        <Badge variant="default">{appearance.preset}</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {THEME_PRESETS.map((preset) => {
            const isSelected = appearance.preset === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  handlePresetClick(preset.id, preset.primaryHex, preset.secondaryHex)
                }
                className={`flex items-center gap-2 rounded-md border p-2 text-left text-xs transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/15 font-semibold text-foreground'
                    : 'border-border bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <span className="flex shrink-0 items-center -space-x-1">
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.primaryHex }}
                  />
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-white/20"
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
            <span className="text-muted-foreground">Surface (Primary)</span>
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
            <span className="text-muted-foreground">Accent (Secondary)</span>
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

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-xs">
            <Switch
              checked={appearance.glowEnabled}
              onCheckedChange={(checked) =>
                void updateSettings({ appearance: { glowEnabled: checked } })
              }
            />
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Effet néon / lueur subtile (Glow)</span>
          </label>

          <Button variant="outline" size="sm" onClick={() => void resetSettings()}>
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Réinitialiser</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

