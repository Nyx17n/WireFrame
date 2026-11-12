import {
  AnimationLevelSchema,
  type AnimationLevel,
  type UserSettings,
  type UserSettingsPatch
} from '@shared/schemas/settings.schema'

const STORAGE_KEY = 'wf.module8Prefs.v1'

interface CachedModule8Prefs {
  animationLevel?: AnimationLevel
  respectOsReducedMotion?: boolean
  actionNotificationsEnabled?: boolean
}

function readCache(): CachedModule8Prefs {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const lvl = AnimationLevelSchema.safeParse(parsed['animationLevel'])
    return {
      ...(lvl.success ? { animationLevel: lvl.data } : {}),
      ...(typeof parsed['respectOsReducedMotion'] === 'boolean'
        ? { respectOsReducedMotion: parsed['respectOsReducedMotion'] }
        : {}),
      ...(typeof parsed['actionNotificationsEnabled'] === 'boolean'
        ? { actionNotificationsEnabled: parsed['actionNotificationsEnabled'] }
        : {})
    }
  } catch {
    return {}
  }
}

export function rememberModule8Patch(patch: UserSettingsPatch): void {
  const next: CachedModule8Prefs = { ...readCache() }
  let touched = false
  if (patch.appearance?.animationLevel !== undefined) {
    next.animationLevel = patch.appearance.animationLevel
    touched = true
  }
  if (patch.appearance?.respectOsReducedMotion !== undefined) {
    next.respectOsReducedMotion = patch.appearance.respectOsReducedMotion
    touched = true
  }
  if (patch.audio?.actionNotificationsEnabled !== undefined) {
    next.actionNotificationsEnabled = patch.audio.actionNotificationsEnabled
    touched = true
  }
  if (!touched) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Ignore storage quota errors
  }
}

export function clearModule8Cache(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore
  }
}

export function mergeModule8Fallback(
  settings: UserSettings,
  patch?: UserSettingsPatch
): UserSettings {
  const cached = readCache()
  return {
    ...settings,
    appearance: {
      ...settings.appearance,
      animationLevel:
        patch?.appearance?.animationLevel ??
        cached.animationLevel ??
        settings.appearance.animationLevel,
      respectOsReducedMotion:
        patch?.appearance?.respectOsReducedMotion ??
        cached.respectOsReducedMotion ??
        settings.appearance.respectOsReducedMotion
    },
    audio: {
      ...settings.audio,
      actionNotificationsEnabled:
        patch?.audio?.actionNotificationsEnabled ??
        cached.actionNotificationsEnabled ??
        settings.audio.actionNotificationsEnabled
    }
  }
}
