import * as React from 'react'
import { BackgroundGradientSection } from '@/components/settings/BackgroundGradientSection'
import { ColorSwatchPicker } from '@/components/settings/ColorSwatchPicker'
import { MotionSettingsSection } from '@/components/settings/MotionSettingsSection'
import { ACCENT_SWATCH_GROUPS, BACKGROUND_SWATCH_GROUPS } from '@/lib/color-swatches'
import { THEME_PRESETS } from '@/lib/theme-engine'
import { useAppStore } from '@/stores/useAppStore'

export function AppearanceSettingsTab(): React.JSX.Element {
  const appearance = useAppStore((s) => s.settings.appearance)
  const updateSettings = useAppStore((s) => s.updateSettings)

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
            Choisis l’apparence visuelle de TennoFrame parmi les 20 thèmes (Sombre, Clair, OLED,
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

      <div className="wf-stagger-grid grid grid-cols-2 gap-2 sm:grid-cols-4">
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
              className={`wf-card-lift group flex flex-col items-center justify-center gap-0.5 rounded-lg border px-2.5 py-2.5 text-center transition-all ${
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

      <div className="space-y-1">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <span>✦</span>
          <span>Couleurs personnalisées</span>
        </h3>
        <p className="text-xs text-muted-foreground">
          Choisis une couleur prédéfinie (ou libre) pour le fond et pour les accents,
          indépendamment l’une de l’autre.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ColorSwatchPicker
          title="Couleur Principale (Fonds)"
          value={appearance.primaryColor}
          groups={BACKGROUND_SWATCH_GROUPS}
          onChange={(hex) =>
            void updateSettings({ appearance: { preset: 'custom', primaryColor: hex } })
          }
        />
        <ColorSwatchPicker
          title="Couleur Secondaire (Accents)"
          value={appearance.secondaryColor}
          groups={ACCENT_SWATCH_GROUPS}
          onChange={(hex) =>
            void updateSettings({ appearance: { preset: 'custom', secondaryColor: hex } })
          }
        />
      </div>

      <BackgroundGradientSection />

      <MotionSettingsSection />
    </div>
  )
}
