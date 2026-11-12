import * as React from 'react'
import { RotateCcw, Sparkles } from 'lucide-react'
import {
  DEFAULT_BACKGROUND_GRADIENT,
  type BackgroundGradientSettings
} from '@shared/schemas/settings.schema'
import { ColorSwatchPicker } from '@/components/settings/ColorSwatchPicker'
import { Button } from '@/components/ui/button'
import { ACCENT_SWATCH_GROUPS } from '@/lib/color-swatches'
import {
  buildGradientCssImage,
  GRADIENT_STYLE_DEFINITIONS,
  normalizeGradientSettings
} from '@/lib/gradient-engine'
import { THEME_PRESETS } from '@/lib/theme-engine'
import { useAppStore } from '@/stores/useAppStore'

const QUICK_ANGLES = [45, 90, 135, 180, 225, 315] as const

export function BackgroundGradientSection(): React.JSX.Element {
  const appearance = useAppStore((s) => s.settings.appearance)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const grad = normalizeGradientSettings(appearance.backgroundGradient)
  const presetMatch = THEME_PRESETS.find((p) => p.id === appearance.preset)
  const surfaceHex = presetMatch ? presetMatch.primaryHex : appearance.primaryColor
  const accentHex = presetMatch ? presetMatch.secondaryHex : appearance.secondaryColor
  const activeStyleDef = GRADIENT_STYLE_DEFINITIONS.find((d) => d.id === grad.style)
  const isEnabled = grad.style !== 'none'

  const patchGradient = (patch: Partial<BackgroundGradientSettings>): void => {
    void updateSettings({
      appearance: {
        backgroundGradient: {
          ...grad,
          ...patch
        }
      }
    })
  }

  const liveBannerCss = buildGradientCssImage({
    style: grad.style,
    colorMode: grad.colorMode,
    themeAccentHex: accentHex,
    customColorHex: grad.customColorHex,
    customSecondaryHex: grad.customSecondaryHex,
    intensityPercent: Math.max(grad.intensityPercent, 32),
    angleDeg: grad.angleDeg,
    isLightTheme: false
  })

  return (
    <div className="space-y-3 rounded-lg border border-border/80 bg-card/50 p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Dégradé de Fond d’Écran</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Ajoute une lueur d’ambiance Sci-Fi sous toute l’application tout en préservant la
            lisibilité des textes et des cartes.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={
            grad.style === DEFAULT_BACKGROUND_GRADIENT.style &&
            grad.colorMode === DEFAULT_BACKGROUND_GRADIENT.colorMode &&
            grad.intensityPercent === DEFAULT_BACKGROUND_GRADIENT.intensityPercent
          }
          onClick={() => patchGradient(DEFAULT_BACKGROUND_GRADIENT)}
          className="h-7 gap-1.5 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Réinitialiser</span>
        </Button>
      </div>

      {/* 8 Gradient Style Cards with Live Miniature Previews */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {GRADIENT_STYLE_DEFINITIONS.map((def) => {
          const active = grad.style === def.id
          const thumbGradient = buildGradientCssImage({
            style: def.id,
            colorMode: grad.colorMode,
            themeAccentHex: accentHex,
            customColorHex: grad.customColorHex,
            customSecondaryHex: grad.customSecondaryHex,
            intensityPercent: 48,
            angleDeg: grad.angleDeg,
            isLightTheme: false
          })

          return (
            <button
              key={def.id}
              type="button"
              onClick={() => patchGradient({ style: def.id })}
              className={`wf-card-lift flex flex-col gap-1.5 rounded-lg border p-2 text-left transition-all ${
                active
                  ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                  : 'border-border/80 bg-card/60 hover:border-primary/45 hover:bg-secondary/40'
              }`}
            >
              <div
                aria-hidden="true"
                className="h-8 w-full rounded border border-border/60"
                style={{
                  backgroundColor: surfaceHex,
                  backgroundImage: thumbGradient
                }}
              />
              <div className="min-w-0">
                <div
                  className={`truncate text-xs font-semibold ${
                    active ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {def.label}
                </div>
                <div className="truncate text-[10px] text-muted-foreground">{def.subtitle}</div>
              </div>
            </button>
          )
        })}
      </div>

      {isEnabled && (
        <div className="space-y-3 pt-1">
          {/* Color Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 bg-background/40 p-2.5">
            <span className="text-xs font-semibold text-foreground">Teinte du dégradé :</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => patchGradient({ colorMode: 'theme-accent' })}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                  grad.colorMode === 'theme-accent'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card/70 text-muted-foreground hover:text-foreground'
                }`}
              >
                Auto (Accent du thème)
              </button>
              <button
                type="button"
                onClick={() => patchGradient({ colorMode: 'custom' })}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                  grad.colorMode === 'custom'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card/70 text-muted-foreground hover:text-foreground'
                }`}
              >
                Couleurs personnalisées
              </button>
            </div>
          </div>

          {grad.colorMode === 'custom' && (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <ColorSwatchPicker
                title="Teinte Dégradé 1 (Principale)"
                value={grad.customColorHex}
                groups={ACCENT_SWATCH_GROUPS}
                onChange={(hex) => patchGradient({ customColorHex: hex })}
              />
              <ColorSwatchPicker
                title="Teinte Dégradé 2 (Secondaire)"
                value={grad.customSecondaryHex}
                groups={ACCENT_SWATCH_GROUPS}
                onChange={(hex) => patchGradient({ customSecondaryHex: hex })}
              />
            </div>
          )}

          {/* Intensity & Angle Controls */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 rounded-md border border-border/70 bg-background/40 p-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">Intensité lumineuse</span>
                <span className="font-mono text-primary">{grad.intensityPercent} %</span>
              </div>
              <input
                type="range"
                min={5}
                max={65}
                step={1}
                value={grad.intensityPercent}
                aria-label="Intensité du dégradé"
                onChange={(e) => patchGradient({ intensityPercent: Number(e.target.value) })}
                className="h-2 w-full cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Subtil (5 %)</span>
                <span>Éclatant (65 %)</span>
              </div>
            </div>

            <div
              className={`space-y-1.5 rounded-md border border-border/70 bg-background/40 p-2.5 ${
                activeStyleDef?.supportsAngle ? '' : 'opacity-55'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">Angle d’orientation</span>
                <span className="font-mono text-primary">
                  {activeStyleDef?.supportsAngle ? `${grad.angleDeg}°` : 'Auto (Radial)'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={5}
                disabled={!activeStyleDef?.supportsAngle}
                value={grad.angleDeg}
                aria-label="Angle d’orientation du dégradé"
                onChange={(e) => patchGradient({ angleDeg: Number(e.target.value) })}
                className="h-2 w-full cursor-pointer accent-primary disabled:cursor-not-allowed"
              />
              <div className="flex flex-wrap gap-1 pt-0.5">
                {QUICK_ANGLES.map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    disabled={!activeStyleDef?.supportsAngle}
                    onClick={() => patchGradient({ angleDeg: deg })}
                    className={`rounded border px-1.5 py-0.5 font-mono text-[10px] transition-colors disabled:cursor-not-allowed ${
                      grad.angleDeg === deg && activeStyleDef?.supportsAngle
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border/70 bg-card/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Strip */}
          <div
            className="flex items-center justify-between rounded-md border border-border/80 px-3 py-2.5 text-xs"
            style={{
              backgroundColor: surfaceHex,
              backgroundImage: liveBannerCss
            }}
          >
            <span className="rounded bg-card/85 px-2 py-0.5 font-medium text-foreground shadow-sm">
              Aperçu : {activeStyleDef?.label} · {grad.intensityPercent} %
            </span>
            <span className="rounded bg-primary px-2 py-0.5 font-semibold text-primary-foreground shadow-sm">
              Contraste lisible ✓
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
