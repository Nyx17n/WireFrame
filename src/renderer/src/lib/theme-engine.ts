import type { AnimationLevel, ThemePresetId, UserSettings } from '@shared/schemas/settings.schema'
import { buildGradientCssImage, normalizeGradientSettings } from '@/lib/gradient-engine'

export interface ThemePresetDefinition {
  id: Exclude<ThemePresetId, 'custom'>
  glyph: string
  label: string
  subtitle: string
  primaryHex: string
  secondaryHex: string
}

export const THEME_PRESETS: readonly ThemePresetDefinition[] = [
  // Classiques & OLED
  {
    id: 'dark',
    glyph: '◐',
    label: 'Sombre',
    subtitle: 'Sci-Fi Bleu Nuit (Défaut)',
    primaryHex: '#0f161d',
    secondaryHex: '#26b9d1'
  },
  {
    id: 'light',
    glyph: '☀',
    label: 'Clair',
    subtitle: 'Clair & Doux',
    primaryHex: '#f1f5f9',
    secondaryHex: '#0284c7'
  },
  {
    id: 'full-black',
    glyph: '◆',
    label: 'Full Black',
    subtitle: 'Noir Pur OLED (#000)',
    primaryHex: '#000000',
    secondaryHex: '#26b9d1'
  },
  {
    id: 'full-white',
    glyph: '◇',
    label: 'Full White',
    subtitle: 'Blanc Pur (#FFF)',
    primaryHex: '#ffffff',
    secondaryHex: '#0f172a'
  },

  // Bleu & Cyan
  {
    id: 'blue-dark',
    glyph: '⬡',
    label: 'Bleu Sombre',
    subtitle: 'Corpus & Prisma',
    primaryHex: '#0b132b',
    secondaryHex: '#3b82f6'
  },
  {
    id: 'blue-light',
    glyph: '✦',
    label: 'Bleu Clair',
    subtitle: 'Glace de Fortuna & Azur',
    primaryHex: '#eff6ff',
    secondaryHex: '#2563eb'
  },
  {
    id: 'cyan-dark',
    glyph: '⬡',
    label: 'Cyan Sombre',
    subtitle: 'Céphalon & Cryotique',
    primaryHex: '#081c24',
    secondaryHex: '#06b6d4'
  },
  {
    id: 'cyan-light',
    glyph: '✦',
    label: 'Cyan Clair',
    subtitle: 'Lagon & Cristal Clair',
    primaryHex: '#ecfeff',
    secondaryHex: '#0891b2'
  },

  // Vert & Jaune
  {
    id: 'green-dark',
    glyph: '◆',
    label: 'Vert Sombre',
    subtitle: 'Émeraude & Forêts',
    primaryHex: '#091e16',
    secondaryHex: '#10b981'
  },
  {
    id: 'green-light',
    glyph: '✦',
    label: 'Vert Clair',
    subtitle: 'Jade & Menthe Claire',
    primaryHex: '#ecfdf5',
    secondaryHex: '#059669'
  },
  {
    id: 'yellow-dark',
    glyph: '◆',
    label: 'Jaune Sombre',
    subtitle: 'Or Orokin & Prime',
    primaryHex: '#1c190a',
    secondaryHex: '#eab308'
  },
  {
    id: 'yellow-light',
    glyph: '☀',
    label: 'Jaune Clair',
    subtitle: 'Solaire & Ivoire Doré',
    primaryHex: '#fefce8',
    secondaryHex: '#ca8a04'
  },

  // Rouge & Orange
  {
    id: 'red-dark',
    glyph: '◈',
    label: 'Rouge Sombre',
    subtitle: 'Kuva & Voile Rouge',
    primaryHex: '#1f0b0e',
    secondaryHex: '#ef4444'
  },
  {
    id: 'red-light',
    glyph: '✦',
    label: 'Rouge Clair',
    subtitle: 'Carmin Clair & Rose',
    primaryHex: '#fef2f2',
    secondaryHex: '#dc2626'
  },
  {
    id: 'orange-dark',
    glyph: '☀',
    label: 'Orange Sombre',
    subtitle: 'Ember & Fusion Solaire',
    primaryHex: '#1f1209',
    secondaryHex: '#f97316'
  },
  {
    id: 'orange-light',
    glyph: '◐',
    label: 'Orange Clair',
    subtitle: 'Ambre Clair & Cuivre',
    primaryHex: '#fff7ed',
    secondaryHex: '#ea580c'
  },

  // Violet & Rose
  {
    id: 'purple-dark',
    glyph: '◇',
    label: 'Violet Sombre',
    subtitle: 'Lotus & Énergie du Néant',
    primaryHex: '#160d29',
    secondaryHex: '#a855f7'
  },
  {
    id: 'purple-light',
    glyph: '◆',
    label: 'Violet Clair',
    subtitle: 'Améthyste & Lavande',
    primaryHex: '#faf5ff',
    secondaryHex: '#9333ea'
  },
  {
    id: 'pink-dark',
    glyph: '◆',
    label: 'Rose Sombre',
    subtitle: 'Octavia & Néon Magenta',
    primaryHex: '#210b18',
    secondaryHex: '#ec4899'
  },
  {
    id: 'pink-light',
    glyph: '✦',
    label: 'Rose Clair',
    subtitle: 'Cerisier & Quartz Rose',
    primaryHex: '#fdf2f8',
    secondaryHex: '#db2777'
  }
] as const

interface HslTriplet {
  h: number
  s: number
  l: number
}

function hexToHsl(hex: string): HslTriplet {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) {
      h = (g - b) / d + (g < b ? 6 : 0)
    } else if (max === g) {
      h = (b - r) / d + 2
    } else {
      h = (r - g) / d + 4
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

export function isOsReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function resolveEffectiveMotion(
  appearance: Pick<UserSettings['appearance'], 'animationLevel' | 'respectOsReducedMotion'>
): AnimationLevel {
  const level: AnimationLevel = appearance.animationLevel ?? 'full'
  if (level === 'off') return 'off'
  if (level === 'reduced') return 'reduced'
  if (appearance.respectOsReducedMotion !== false && isOsReducedMotionPreferred()) {
    return 'reduced'
  }
  return 'full'
}

export function subscribeOsReducedMotion(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined
  }
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/**
 * Applies the user's dual-color theme (Primary surface + Secondary accent) onto
 * shadcn/ui root CSS variables while guaranteeing accessible text contrast,
 * including pure OLED #000000 and pure #FFFFFF themes.
 */
export function applyThemeToDocument(appearance: UserSettings['appearance']): void {
  const presetMatch = THEME_PRESETS.find((p) => p.id === appearance.preset)
  const surfaceHex = presetMatch ? presetMatch.primaryHex : appearance.primaryColor
  const accentHex = presetMatch ? presetMatch.secondaryHex : appearance.secondaryColor

  const bg = hexToHsl(surfaceHex)
  const ac = hexToHsl(accentHex)
  const isLightTheme = bg.l > 55
  const isAchromatic = bg.s === 0

  const root = document.documentElement
  root.classList.toggle('dark', !isLightTheme)
  root.dataset.motion = resolveEffectiveMotion(appearance)
  document.body.classList.toggle('glow-enabled', appearance.glowEnabled)

  const fg = isLightTheme ? '222 47% 11%' : '210 40% 96%'
  const cardL =
    bg.l === 0
      ? 3
      : bg.l === 100
        ? 100
        : isLightTheme
          ? clamp(bg.l - 2, 90, 100)
          : clamp(bg.l + 4, 6, 30)
  const mutedL = isLightTheme ? clamp(bg.l - 5, 84, 96) : clamp(bg.l + 8, 8, 35)
  const borderL = isLightTheme ? clamp(bg.l - 12, 72, 90) : clamp(bg.l + 12, 13, 42)
  const surfaceSat = isAchromatic ? 0 : clamp(bg.s, 8, 35)
  const mutedSat = isAchromatic ? 0 : clamp(bg.s, 8, 30)
  const borderSat = isAchromatic ? 0 : clamp(bg.s, 10, 35)
  const mutedFg = isAchromatic
    ? isLightTheme
      ? '215 16% 42%'
      : '215 15% 65%'
    : isLightTheme
      ? `${bg.h} 16% 40%`
      : `${bg.h} 18% 66%`
  const accentFg = ac.l > 62 ? '222 47% 11%' : '210 40% 98%'

  root.style.setProperty('--background', `${bg.h} ${bg.s}% ${bg.l}%`)
  root.style.setProperty('--foreground', fg)
  root.style.setProperty('--card', `${bg.h} ${bg.s}% ${cardL}%`)
  root.style.setProperty('--card-foreground', fg)
  root.style.setProperty('--popover', `${bg.h} ${bg.s}% ${cardL}%`)
  root.style.setProperty('--popover-foreground', fg)
  root.style.setProperty('--secondary', `${bg.h} ${surfaceSat}% ${mutedL}%`)
  root.style.setProperty('--secondary-foreground', fg)
  root.style.setProperty('--muted', `${bg.h} ${mutedSat}% ${mutedL}%`)
  root.style.setProperty('--muted-foreground', mutedFg)
  root.style.setProperty('--border', `${bg.h} ${borderSat}% ${borderL}%`)
  root.style.setProperty('--input', `${bg.h} ${borderSat}% ${borderL}%`)

  root.style.setProperty('--primary', `${ac.h} ${ac.s}% ${ac.l}%`)
  root.style.setProperty('--primary-foreground', accentFg)
  root.style.setProperty('--accent', `${ac.h} ${ac.s}% ${ac.l}%`)
  root.style.setProperty('--accent-foreground', accentFg)
  root.style.setProperty('--ring', `${ac.h} ${ac.s}% ${ac.l}%`)

  const grad = normalizeGradientSettings(appearance.backgroundGradient)
  const gradientCss = buildGradientCssImage({
    style: grad.style,
    colorMode: grad.colorMode,
    themeAccentHex: accentHex,
    customColorHex: grad.customColorHex,
    customSecondaryHex: grad.customSecondaryHex,
    intensityPercent: grad.intensityPercent,
    angleDeg: grad.angleDeg,
    isLightTheme
  })
  root.style.setProperty('--wf-app-gradient', gradientCss)
  root.dataset.hasGradient = grad.style !== 'none' ? 'true' : 'false'
}
