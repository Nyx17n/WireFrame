import {
  WORLD_FACTION_ALIASES,
  type WorldFaction,
  type WorldMissionType
} from '@shared/data/world-rule-options'

/** Lowercase + strip accents so that « Défense » matches « defense ». */
export function normalizeForMatch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

/**
 * Plain substring test on normalized strings.
 * User input is NEVER compiled into a RegExp (anti-ReDoS by design).
 * An empty needle means "no constraint".
 */
export function containsText(haystack: string, needle: string): boolean {
  const n = normalizeForMatch(needle)
  if (!n) return true
  return normalizeForMatch(haystack).includes(n)
}

export function matchesFaction(rawFaction: string, faction: WorldFaction): boolean {
  if (faction === 'any') return true
  const normalized = normalizeForMatch(rawFaction)
  return WORLD_FACTION_ALIASES[faction].some((alias) => normalized.includes(alias))
}

export function matchesMissionType(rawType: string, wanted: readonly WorldMissionType[]): boolean {
  if (wanted.length === 0) return true
  const normalized = normalizeForMatch(rawType)
  return wanted.some((type) => normalizeForMatch(type) === normalized)
}

/** Remembers a dedupe key; trims the oldest keys so the Set never grows unbounded. */
export function rememberOnce(keys: Set<string>, key: string, maxKeys = 1500): boolean {
  if (keys.has(key)) return false
  keys.add(key)
  if (keys.size > maxKeys) {
    const overflow = keys.size - maxKeys
    let removed = 0
    for (const oldKey of keys) {
      if (removed >= overflow) break
      keys.delete(oldKey)
      removed += 1
    }
  }
  return true
}

export function formatMinutesLeft(msLeft: number): string {
  const minutes = Math.max(1, Math.ceil(msLeft / 60_000))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest > 0 ? `${hours} h ${rest} min` : `${hours} h`
}

