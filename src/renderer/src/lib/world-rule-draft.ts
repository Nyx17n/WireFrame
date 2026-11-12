import {
  ARCHON_BOSS_LABELS,
  BARO_TRIGGER_LABELS,
  BOUNTY_SYNDICATE_LABELS,
  CYCLE_LOCATION_LABELS,
  CYCLE_STATES,
  FISSURE_MODE_LABELS,
  INVASION_CATEGORY_LABELS,
  NIGHTWAVE_KIND_LABELS,
  WORLD_FACTION_LABELS,
  WORLD_RULE_TEXT_MAX,
  type WorldRuleSource
} from '@shared/data/world-rule-options'
import { WorldAlertRuleSchema, type WorldAlertRule } from '@shared/schemas/world-rules.schema'

function newRuleId(): string {
  return `wr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** Brouillon par défaut pour une source (toutes les valeurs par défaut du schéma). */
export function createDefaultRule(source: WorldRuleSource): WorldAlertRule {
  const base = { id: newRuleId(), name: 'Nouvelle règle', enabled: true, notifyOs: true, notifySound: true }
  switch (source) {
    case 'fissure':
      return { ...base, source, eras: [], missionTypes: [], mode: 'any', faction: 'any', fastOnly: false }
    case 'invasion':
      return { ...base, source, categories: [], rewardText: '' }
    case 'arbitration':
      return { ...base, source, missionTypes: [], faction: 'any', sTierOnly: false }
    case 'cycle':
      return { ...base, source, location: 'cetus', state: 'night', preAlertMin: 0 }
    case 'baro':
      return { ...base, source, trigger: 'arrival', preAlertHours: 24, itemText: '' }
    case 'sortie':
      return { ...base, source, faction: 'any', bossText: '', missionTypes: [], modifierText: '' }
    case 'archon':
      return { ...base, source, archons: [], missionTypes: [] }
    case 'bounty':
      return { ...base, source, syndicates: [], rewardText: '', minLevel: 0 }
    case 'nightwave':
      return { ...base, source, kinds: [], minReputation: 0, titleText: '' }
  }
}

function joinParts(parts: Array<string | false | null | undefined>): string {
  return parts.filter((p): p is string => Boolean(p)).join(' · ')
}

/** Résumé lisible des conditions (ex. « Ères : Axi · Mission : Survie · Route de l'Acier »). */
export function describeRuleConditions(rule: WorldAlertRule): string {
  const faction = 'faction' in rule && rule.faction !== 'any' ? WORLD_FACTION_LABELS[rule.faction] : null
  const missions = 'missionTypes' in rule && rule.missionTypes.length > 0 ? rule.missionTypes.join(', ') : null
  switch (rule.source) {
    case 'fissure':
      return joinParts([
        rule.eras.length > 0 && rule.eras.join(', '),
        missions,
        rule.mode !== 'any' && FISSURE_MODE_LABELS[rule.mode],
        faction,
        rule.fastOnly && 'Rapides uniquement'
      ])
    case 'invasion':
      return joinParts([
        rule.categories.map((c) => INVASION_CATEGORY_LABELS[c]).join(', '),
        rule.rewardText && `« ${rule.rewardText} »`
      ])
    case 'arbitration':
      return joinParts([missions, faction, rule.sTierOnly && 'S-Tier uniquement']) || 'Tous les arbitrages'
    case 'cycle': {
      const state = CYCLE_STATES[rule.location].find((s) => s.id === rule.state)?.label ?? rule.state
      return joinParts([
        `${CYCLE_LOCATION_LABELS[rule.location]} : ${state}`,
        rule.preAlertMin > 0 && `${rule.preAlertMin} min avant`
      ])
    }
    case 'baro':
      return joinParts([
        BARO_TRIGGER_LABELS[rule.trigger],
        rule.trigger === 'pre-arrival' && `${rule.preAlertHours} h avant`,
        rule.trigger === 'item' && `« ${rule.itemText} »`
      ])
    case 'sortie':
      return joinParts([faction, rule.bossText && `Boss « ${rule.bossText} »`, missions, rule.modifierText && `« ${rule.modifierText} »`]) || 'Chaque nouvelle sortie'
    case 'archon':
      return joinParts([rule.archons.map((a) => ARCHON_BOSS_LABELS[a]).join(', '), missions]) || 'Chaque nouvelle chasse'
    case 'bounty':
      return joinParts([
        rule.syndicates.map((s) => BOUNTY_SYNDICATE_LABELS[s]).join(', '),
        rule.rewardText && `« ${rule.rewardText} »`,
        rule.minLevel > 0 && `Niv. ≥ ${rule.minLevel}`
      ])
    case 'nightwave':
      return joinParts([
        rule.kinds.map((k) => NIGHTWAVE_KIND_LABELS[k]).join(', '),
        rule.minReputation > 0 && `≥ ${rule.minReputation} réputation`,
        rule.titleText && `« ${rule.titleText} »`
      ])
  }
}

const SHORT_SOURCE: Readonly<Record<WorldRuleSource, string>> = {
  fissure: 'Fissure',
  invasion: 'Invasion',
  arbitration: 'Arbitrage',
  cycle: 'Cycle',
  baro: 'Baro',
  sortie: 'Sortie',
  archon: 'Archonte',
  bounty: 'Mise à prix',
  nightwave: 'Nightwave'
}

/** Nom généré automatiquement depuis les conditions (modifiable par l'utilisateur). */
export function buildAutoName(rule: WorldAlertRule): string {
  const summary = describeRuleConditions(rule)
  const name = summary ? `${SHORT_SOURCE[rule.source]} · ${summary}` : SHORT_SOURCE[rule.source]
  return name.length > WORLD_RULE_TEXT_MAX ? `${name.slice(0, WORLD_RULE_TEXT_MAX - 1)}…` : name
}

export type RuleValidation =
  | { ok: true; rule: WorldAlertRule }
  | { ok: false; message: string; field: string | null }

/** Même schéma zod que le Main Process : le formulaire affiche l'erreur avant tout envoi IPC. */
export function validateRuleDraft(draft: WorldAlertRule): RuleValidation {
  const parsed = WorldAlertRuleSchema.safeParse(draft)
  if (parsed.success) return { ok: true, rule: parsed.data }
  const issue = parsed.error.issues[0]
  const field = issue?.path[0]
  return {
    ok: false,
    message: issue?.message ?? 'Règle invalide',
    field: typeof field === 'string' ? field : null
  }
}

