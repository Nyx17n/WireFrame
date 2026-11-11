import type { ThemePresetId, UserSettings } from '@shared/schemas/settings.schema'

export interface ThemePresetDefinition {
  id: Exclude<ThemePresetId, 'custom'>
  label: string
  primaryHex: string
  secondaryHex: string
}

export const THEME_PRESETS: readonly ThemePresetDefinition[] = [
  { id: 'orokin-dark', label: 'Orokin Dark', primaryHex: '#0f161d', secondaryHex: '#0ea5e9' },
  { id: 'tenno-light', label: 'Tenno Light', primaryHex: '#f8fafc', secondaryHex: '#0284c7' },
  { id: 'prime-gold', label: 'Prime Gold', primaryHex: '#181512', secondaryHex: '#eab308' },
  { id: 'lotus-amethyst', label: 'Lotus Amethyst', primaryHex: '#171426', secondaryHex: '#a855f7' },
  { id: 'kuva-crimson', label: 'Kuva Crimson', primaryHex: '#1c1113', secondaryHex: '#ef4444' },
  { id: 'corpus-matrix', label: 'Corpus Matrix', primaryHex: '#0d1c18', secondaryHex: '#10b981' }
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

/**
 * Applies the user's dual-color theme (Primary surface + Secondary accent) onto
 * shadcn/ui root CSS variables while guaranteeing accessible text contrast.
 */
export function applyThemeToDocument(appearance: UserSettings['appearance']): void {
  const presetMatch = THEME_PRESETS.find((p) => p.id === appearance.preset)
  const surfaceHex = presetMatch ? presetMatch.primaryHex : appearance.primaryColor
  const accentHex = presetMatch ? presetMatch.secondaryHex : appearance.secondaryColor

  const bg = hexToHsl(surfaceHex)
  const ac = hexToHsl(accentHex)
  const isLightTheme = bg.l > 55

  const root = document.documentElement
  root.classList.toggle('dark', !isLightTheme)
  document.body.classList.toggle('glow-enabled', appearance.glowEnabled)

  const fg = isLightTheme ? '222 47% 11%' : '210 40% 96%'
  const cardL = isLightTheme ? clamp(bg.l - 3, 88, 100) : clamp(bg.l + 4, 6, 30)
  const mutedL = isLightTheme ? clamp(bg.l - 6, 82, 96) : clamp(bg.l + 8, 10, 35)
  const borderL = isLightTheme ? clamp(bg.l - 13, 70, 90) : clamp(bg.l + 12, 14, 42)
  const mutedFg = isLightTheme ? `${bg.h} 16% 40%` : `${bg.h} 18% 66%`
  const accentFg = ac.l > 62 ? '222 47% 11%' : '210 40% 98%'

  root.style.setProperty('--background', `${bg.h} ${bg.s}% ${bg.l}%`)
  root.style.setProperty('--foreground', fg)
  root.style.setProperty('--card', `${bg.h} ${bg.s}% ${cardL}%`)
  root.style.setProperty('--card-foreground', fg)
  root.style.setProperty('--popover', `${bg.h} ${bg.s}% ${cardL}%`)
  root.style.setProperty('--popover-foreground', fg)
  root.style.setProperty('--secondary', `${bg.h} ${clamp(bg.s, 8, 35)}% ${mutedL}%`)
  root.style.setProperty('--secondary-foreground', fg)
  root.style.setProperty('--muted', `${bg.h} ${clamp(bg.s, 8, 30)}% ${mutedL}%`)
  root.style.setProperty('--muted-foreground', mutedFg)
  root.style.setProperty('--border', `${bg.h} ${clamp(bg.s, 10, 35)}% ${borderL}%`)
  root.style.setProperty('--input', `${bg.h} ${clamp(bg.s, 10, 35)}% ${borderL}%`)

  root.style.setProperty('--primary', `${ac.h} ${ac.s}% ${ac.l}%`)
  root.style.setProperty('--primary-foreground', accentFg)
  root.style.setProperty('--accent', `${ac.h} ${ac.s}% ${ac.l}%`)
  root.style.setProperty('--accent-foreground', accentFg)
  root.style.setProperty('--ring', `${ac.h} ${ac.s}% ${ac.l}%`)
}

