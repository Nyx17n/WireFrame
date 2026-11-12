import {
  DEFAULT_BACKGROUND_GRADIENT,
  type BackgroundGradientSettings,
  type BackgroundGradientStyle
} from '@shared/schemas/settings.schema'

export interface GradientStyleDefinition {
  readonly id: BackgroundGradientStyle
  readonly label: string
  readonly subtitle: string
  readonly supportsAngle: boolean
}

export const GRADIENT_STYLE_DEFINITIONS: readonly GradientStyleDefinition[] = [
  {
    id: 'none',
    label: 'Uni (Aucun)',
    subtitle: 'Fond plat classique',
    supportsAngle: false
  },
  {
    id: 'aurora-top',
    label: 'Halo Boréal',
    subtitle: 'Lueur radiale haute',
    supportsAngle: false
  },
  {
    id: 'diagonal',
    label: 'Diagonale',
    subtitle: 'Linéaire orientable',
    supportsAngle: true
  },
  {
    id: 'dual-corners',
    label: 'Double Énergie',
    subtitle: 'Halos coins opposés',
    supportsAngle: false
  },
  {
    id: 'radial-center',
    label: 'Noyau du Néant',
    subtitle: 'Halo radial centré',
    supportsAngle: false
  },
  {
    id: 'horizon-bottom',
    label: 'Horizon Bas',
    subtitle: 'Lueur montante',
    supportsAngle: false
  },
  {
    id: 'mesh-nebula',
    label: 'Nébuleuse Mesh',
    subtitle: '3 sources organiques',
    supportsAngle: false
  },
  {
    id: 'vertical-split',
    label: 'Zénith Linéaire',
    subtitle: 'Axe doux orientable',
    supportsAngle: true
  }
] as const

interface RgbTriplet {
  r: number
  g: number
  b: number
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

function hexToRgb(hex: string): RgbTriplet {
  const clean = /^#?[0-9a-fA-F]{6}$/.test(hex) ? hex.replace('#', '') : '26b9d1'
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16)
  }
}

function shiftRgbHueCompanion(rgb: RgbTriplet): RgbTriplet {
  // Subtle harmonic companion rotation in RGB space for dual-stop auto-accent gradients
  return {
    r: clamp(Math.round(rgb.r * 0.55 + rgb.b * 0.45), 0, 255),
    g: clamp(Math.round(rgb.g * 0.65 + rgb.r * 0.35), 0, 255),
    b: clamp(Math.round(rgb.b * 0.65 + rgb.g * 0.35), 0, 255)
  }
}

function rgba(c: RgbTriplet, alpha: number): string {
  const a = Number(clamp(alpha, 0, 1).toFixed(3))
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`
}

export function normalizeGradientSettings(
  raw: Partial<BackgroundGradientSettings> | undefined
): BackgroundGradientSettings {
  return {
    style: raw?.style ?? DEFAULT_BACKGROUND_GRADIENT.style,
    colorMode: raw?.colorMode ?? DEFAULT_BACKGROUND_GRADIENT.colorMode,
    customColorHex: raw?.customColorHex ?? DEFAULT_BACKGROUND_GRADIENT.customColorHex,
    customSecondaryHex: raw?.customSecondaryHex ?? DEFAULT_BACKGROUND_GRADIENT.customSecondaryHex,
    intensityPercent: clamp(
      Math.round(raw?.intensityPercent ?? DEFAULT_BACKGROUND_GRADIENT.intensityPercent),
      5,
      65
    ),
    angleDeg: clamp(Math.round(raw?.angleDeg ?? DEFAULT_BACKGROUND_GRADIENT.angleDeg), 0, 360)
  }
}

export function buildGradientCssImage(params: {
  style: BackgroundGradientStyle
  colorMode: 'theme-accent' | 'custom'
  themeAccentHex: string
  customColorHex: string
  customSecondaryHex: string
  intensityPercent: number
  angleDeg: number
  isLightTheme: boolean
}): string {
  if (params.style === 'none') {
    return 'none'
  }

  const primaryRgb =
    params.colorMode === 'custom'
      ? hexToRgb(params.customColorHex)
      : hexToRgb(params.themeAccentHex)
  const secondaryRgb =
    params.colorMode === 'custom'
      ? hexToRgb(params.customSecondaryHex)
      : shiftRgbHueCompanion(primaryRgb)

  // Slightly soften alpha on light surfaces so dark typography stays razor sharp
  const lightFactor = params.isLightTheme ? 0.78 : 1
  const peak = (clamp(params.intensityPercent, 5, 65) / 100) * lightFactor
  const mid = peak * 0.58
  const soft = peak * 0.28
  const deg = clamp(Math.round(params.angleDeg), 0, 360)

  switch (params.style) {
    case 'aurora-top':
      return [
        `radial-gradient(ellipse 88% 54% at 50% -6%, ${rgba(primaryRgb, peak)}, ${rgba(secondaryRgb, soft)} 52%, transparent 80%)`,
        `radial-gradient(ellipse 55% 38% at 82% 8%, ${rgba(secondaryRgb, mid)}, transparent 72%)`
      ].join(', ')

    case 'diagonal':
      return `linear-gradient(${deg}deg, ${rgba(primaryRgb, peak)} 0%, ${rgba(secondaryRgb, mid)} 48%, transparent 92%)`

    case 'dual-corners':
      return [
        `radial-gradient(circle at 6% 8%, ${rgba(primaryRgb, peak)} 0%, transparent 56%)`,
        `radial-gradient(circle at 94% 92%, ${rgba(secondaryRgb, peak * 0.92)} 0%, transparent 56%)`
      ].join(', ')

    case 'radial-center':
      return `radial-gradient(ellipse 72% 64% at 50% 48%, ${rgba(primaryRgb, peak)} 0%, ${rgba(secondaryRgb, soft)} 48%, transparent 82%)`

    case 'horizon-bottom':
      return [
        `radial-gradient(ellipse 92% 52% at 50% 106%, ${rgba(primaryRgb, peak)}, ${rgba(secondaryRgb, soft)} 54%, transparent 82%)`,
        `linear-gradient(0deg, ${rgba(secondaryRgb, mid * 0.7)} 0%, transparent 45%)`
      ].join(', ')

    case 'mesh-nebula':
      return [
        `radial-gradient(ellipse 58% 48% at 18% 22%, ${rgba(primaryRgb, peak)} 0%, transparent 66%)`,
        `radial-gradient(ellipse 56% 50% at 84% 28%, ${rgba(secondaryRgb, peak * 0.88)} 0%, transparent 68%)`,
        `radial-gradient(ellipse 64% 46% at 52% 88%, ${rgba(primaryRgb, mid)} 0%, transparent 70%)`
      ].join(', ')

    case 'vertical-split':
      return `linear-gradient(${deg}deg, ${rgba(primaryRgb, peak)} 0%, transparent 52%, ${rgba(secondaryRgb, mid)} 100%)`
  }
}
