import { WorldAlertRuleSchema } from '@shared/schemas/world-rules.schema'

/**
 * Drops only the invalid custom Worldstate rules from a raw settings payload
 * so that one corrupted/outdated rule never resets the whole config file
 * (favorites, cart, tabs...) to factory defaults.
 */
export function sanitizeWorldRules(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) return raw
  const record = raw as Record<string, unknown>
  const rules = record['worldRules']
  if (rules === undefined) return raw
  if (!Array.isArray(rules)) {
    return { ...record, worldRules: [] }
  }
  const validRules = rules.filter((rule) => WorldAlertRuleSchema.safeParse(rule).success)
  return { ...record, worldRules: validRules }
}

