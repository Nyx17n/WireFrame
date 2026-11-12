import { INVASION_CATEGORY_ALIASES } from '@shared/data/world-rule-options'
import type { WorldAlertRule, WorldRuleMatch } from '@shared/schemas/world-rules.schema'
import type { WorldstateHubPayload } from '@shared/schemas/worldstate.schema'
import { containsText, matchesFaction, matchesMissionType, normalizeForMatch } from './world-rule-text'

type RuleOf<S extends WorldAlertRule['source']> = Extract<WorldAlertRule, { source: S }>

export function matchFissures(rule: RuleOf<'fissure'>, ws: WorldstateHubPayload): WorldRuleMatch[] {
  return ws.fissures
    .filter((f) => {
      const era = f.isOmnia ? 'omnia' : normalizeForMatch(f.tier)
      if (rule.eras.length > 0 && !rule.eras.some((e) => normalizeForMatch(e) === era)) return false
      if (!matchesMissionType(f.missionType, rule.missionTypes)) return false
      if (rule.mode === 'normal' && (f.isHard || f.isStorm)) return false
      if (rule.mode === 'steel' && !f.isHard) return false
      if (rule.mode === 'storm' && !f.isStorm) return false
      if (rule.fastOnly && !f.isFastMission) return false
      return matchesFaction(f.enemy, rule.faction)
    })
    .map((f) => ({
      key: `fissure:${f.id}`,
      title: `Fissure ${f.tier} · ${f.missionType}${f.isHard ? ' · Route de l’Acier' : ''}${f.isStorm ? ' · Tempête' : ''}`,
      subtitle: `${f.node} — ${f.enemy}`,
      hubSection: 'fissures' as const,
      marketSlug: null
    }))
}

export function matchInvasions(rule: RuleOf<'invasion'>, ws: WorldstateHubPayload): WorldRuleMatch[] {
  const matches: WorldRuleMatch[] = []
  for (const inv of ws.invasions) {
    const sides = [inv.attacker, inv.defender].filter((side) => side.rewardLabel.trim().length > 0)
    const matchedSide = sides.find((side) => {
      const label = normalizeForMatch(side.rewardLabel)
      const byCategory = rule.categories.some((cat) =>
        INVASION_CATEGORY_ALIASES[cat].some((alias) => label.includes(alias))
      )
      const byText = rule.rewardText.length > 0 && containsText(side.rewardLabel, rule.rewardText)
      return byCategory || byText
    })
    if (!matchedSide) continue
    matches.push({
      key: `invasion:${inv.id}`,
      title: `Invasion · ${matchedSide.rewardLabel}`,
      subtitle: `${inv.node} — ${inv.desc}`,
      hubSection: 'invasions',
      marketSlug: matchedSide.marketSlug
    })
  }
  return matches
}

export function matchArbitration(rule: RuleOf<'arbitration'>, ws: WorldstateHubPayload): WorldRuleMatch[] {
  const arbi = ws.arbitration
  // Les données de repli locales ne reflètent pas le jeu réel : jamais d'alerte dessus.
  if (arbi.isFallback) return []
  if (!matchesMissionType(arbi.type, rule.missionTypes)) return []
  if (!matchesFaction(arbi.enemy, rule.faction)) return []
  if (rule.sTierOnly && !arbi.isSTier) return []
  return [
    {
      key: `arbitration:${arbi.expiry}`,
      title: `Arbitrage${arbi.isSTier ? ' S-Tier' : ''} · ${arbi.type}`,
      subtitle: `${arbi.node} (${arbi.enemy}) · ${arbi.bonus}`,
      hubSection: 'invasions',
      marketSlug: null
    }
  ]
}

export function matchSortie(rule: RuleOf<'sortie'>, ws: WorldstateHubPayload): WorldRuleMatch[] {
  const sortie = ws.sortie
  if (!sortie) return []
  if (!matchesFaction(sortie.faction, rule.faction)) return []
  if (!containsText(sortie.boss, rule.bossText)) return []
  if (rule.missionTypes.length > 0 && !sortie.steps.some((s) => matchesMissionType(s.missionType, rule.missionTypes))) {
    return []
  }
  if (rule.modifierText && !sortie.steps.some((s) => containsText(s.modifier ?? '', rule.modifierText))) {
    return []
  }
  return [
    {
      key: `sortie:${sortie.id}`,
      title: `Sortie · ${sortie.boss}`,
      subtitle: `${sortie.faction} — ${sortie.steps.map((s) => s.missionType).join(' · ')}`,
      hubSection: 'fissures',
      marketSlug: null
    }
  ]
}

export function matchArchon(rule: RuleOf<'archon'>, ws: WorldstateHubPayload): WorldRuleMatch[] {
  const hunt = ws.archonHunt
  if (!hunt) return []
  const boss = normalizeForMatch(hunt.boss)
  if (rule.archons.length > 0 && !rule.archons.some((a) => boss.includes(a))) return []
  if (rule.missionTypes.length > 0 && !hunt.steps.some((s) => matchesMissionType(s.missionType, rule.missionTypes))) {
    return []
  }
  return [
    {
      key: `archon:${hunt.id}`,
      title: `Chasse à l'Archonte · ${hunt.boss}`,
      subtitle: `${hunt.faction} — ${hunt.steps.map((s) => s.missionType).join(' · ')}`,
      hubSection: 'fissures',
      marketSlug: null
    }
  ]
}

