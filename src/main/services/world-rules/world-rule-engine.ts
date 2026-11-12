import type { TriggeredAlertEvent } from '@shared/schemas/alerts.schema'
import type { WorldAlertRule, WorldRuleMatch } from '@shared/schemas/world-rules.schema'
import type { WorldstateHubPayload } from '@shared/schemas/worldstate.schema'
import {
  matchArbitration,
  matchArchon,
  matchFissures,
  matchInvasions,
  matchSortie
} from './world-rule-matchers-missions'
import { matchBaro, matchBounties, matchCycle, matchNightwave } from './world-rule-matchers-timed'
import { rememberOnce } from './world-rule-text'

/** Returns every current Worldstate occurrence that satisfies the rule. Pure function. */
export function matchWorldRule(
  rule: WorldAlertRule,
  ws: WorldstateHubPayload,
  nowMs: number
): WorldRuleMatch[] {
  switch (rule.source) {
    case 'fissure':
      return matchFissures(rule, ws)
    case 'invasion':
      return matchInvasions(rule, ws)
    case 'arbitration':
      return matchArbitration(rule, ws)
    case 'sortie':
      return matchSortie(rule, ws)
    case 'archon':
      return matchArchon(rule, ws)
    case 'cycle':
      return matchCycle(rule, ws, nowMs)
    case 'baro':
      return matchBaro(rule, ws, nowMs)
    case 'bounty':
      return matchBounties(rule, ws)
    case 'nightwave':
      return matchNightwave(rule, ws)
  }
}

export interface CustomRuleAlert {
  event: TriggeredAlertEvent
  notifyOs: boolean
}

/**
 * Evaluates the enabled custom rules and returns only the NEW occurrences
 * (one notification per `ruleId + occurrence key`).
 */
export function evaluateCustomWorldRules(
  ws: WorldstateHubPayload,
  rules: readonly WorldAlertRule[],
  notifiedKeys: Set<string>,
  nowMs: number
): CustomRuleAlert[] {
  const alerts: CustomRuleAlert[] = []
  const nowIso = new Date(nowMs).toISOString()

  for (const rule of rules) {
    if (!rule.enabled) continue
    for (const match of matchWorldRule(rule, ws, nowMs)) {
      if (!rememberOnce(notifiedKeys, `rule:${rule.id}|${match.key}`)) continue
      alerts.push({
        notifyOs: rule.notifyOs,
        event: {
          id: `wr-${nowMs}-${Math.random().toString(36).slice(2, 8)}`,
          kind: 'worldstate',
          title: rule.name,
          subtitle: `${match.title} — ${match.subtitle}`,
          ...(match.marketSlug ? { slug: match.marketSlug } : {}),
          ruleId: rule.id,
          hubSection: match.hubSection,
          silent: !rule.notifySound,
          triggeredAt: nowIso
        }
      })
    }
  }
  return alerts
}

