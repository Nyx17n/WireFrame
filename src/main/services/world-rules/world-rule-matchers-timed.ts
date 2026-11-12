import { CYCLE_LOCATION_LABELS, CYCLE_STATES } from '@shared/data/world-rule-options'
import type { WorldAlertRule, WorldRuleMatch } from '@shared/schemas/world-rules.schema'
import type { WorldstateHubPayload } from '@shared/schemas/worldstate.schema'
import { containsText, formatMinutesLeft, normalizeForMatch } from './world-rule-text'

type RuleOf<S extends WorldAlertRule['source']> = Extract<WorldAlertRule, { source: S }>

export function matchCycle(rule: RuleOf<'cycle'>, ws: WorldstateHubPayload, nowMs: number): WorldRuleMatch[] {
  const cycle = ws.cycles.find((c) => c.key === rule.location)
  if (!cycle) return []
  const zone = CYCLE_LOCATION_LABELS[rule.location]
  const stateLabel = CYCLE_STATES[rule.location].find((s) => s.id === rule.state)?.label ?? rule.state
  const msLeft = Date.parse(cycle.expiry) - nowMs

  if (rule.preAlertMin === 0) {
    if (cycle.state !== rule.state) return []
    return [
      {
        key: `cycle:${rule.location}:${rule.state}:${cycle.expiry}`,
        title: `${zone} : ${stateLabel} actif`,
        subtitle: Number.isFinite(msLeft) && msLeft > 0 ? `Encore ${formatMinutesLeft(msLeft)}` : 'En cours',
        hubSection: 'planets',
        marketSlug: null
      }
    ]
  }

  // Les cycles alternent entre 2 états : l'état ciblé commence à l'expiration de l'état courant.
  if (cycle.state === rule.state || !Number.isFinite(msLeft)) return []
  if (msLeft <= 0 || msLeft > rule.preAlertMin * 60_000) return []
  return [
    {
      key: `cycle-pre:${rule.location}:${rule.state}:${cycle.expiry}`,
      title: `${zone} : ${stateLabel} dans ${formatMinutesLeft(msLeft)}`,
      subtitle: `Pré-alerte ${rule.preAlertMin} min`,
      hubSection: 'planets',
      marketSlug: null
    }
  ]
}

export function matchBaro(rule: RuleOf<'baro'>, ws: WorldstateHubPayload, nowMs: number): WorldRuleMatch[] {
  const vt = ws.voidTrader
  if (rule.trigger === 'arrival') {
    if (!vt.active) return []
    return [
      {
        key: `baro:${vt.expiry}`,
        title: `Baro Ki'Teer est arrivé`,
        subtitle: `${vt.location} · ${vt.inventory.length} articles`,
        hubSection: 'baro',
        marketSlug: null
      }
    ]
  }

  if (rule.trigger === 'pre-arrival') {
    const msLeft = Date.parse(vt.activation) - nowMs
    if (vt.active || !Number.isFinite(msLeft) || msLeft <= 0) return []
    if (msLeft > rule.preAlertHours * 3_600_000) return []
    return [
      {
        key: `baro-pre:${vt.activation}`,
        title: `Baro Ki'Teer arrive dans ${formatMinutesLeft(msLeft)}`,
        subtitle: vt.location,
        hubSection: 'baro',
        marketSlug: null
      }
    ]
  }

  if (!vt.active || vt.isPreviewStock) return []
  const found = vt.inventory.filter(
    (item) => containsText(item.nameFr, rule.itemText) || containsText(item.name, rule.itemText)
  )
  const first = found[0]
  if (!first) return []
  return [
    {
      key: `baro-item:${vt.expiry}:${normalizeForMatch(rule.itemText)}`,
      title: `Baro vend : ${found.map((i) => i.nameFr).slice(0, 3).join(', ')}`,
      subtitle: `${first.ducats} Ducats · ${first.credits.toLocaleString('fr-FR')} Crédits · ${vt.location}`,
      hubSection: 'baro',
      marketSlug: first.marketSlug
    }
  ]
}

export function matchBounties(rule: RuleOf<'bounty'>, ws: WorldstateHubPayload): WorldRuleMatch[] {
  const matches: WorldRuleMatch[] = []
  for (const group of ws.bounties) {
    if (rule.syndicates.length > 0 && !rule.syndicates.includes(group.syndicateKey)) continue
    for (const job of group.jobs) {
      if (job.minLevel < rule.minLevel) continue
      const drop = rule.rewardText
        ? job.drops.find((d) => containsText(d.item, rule.rewardText))
        : undefined
      if (rule.rewardText && !drop) continue
      matches.push({
        key: `bounty:${group.id}:${group.expiry}:${job.id}`,
        title: `${group.labelFr} · Niv. ${job.minLevel}-${job.maxLevel}`,
        subtitle: drop ? `Récompense possible : ${drop.item} (${drop.chance}%)` : job.type,
        hubSection: 'planets',
        marketSlug: null
      })
    }
  }
  return matches
}

export function matchNightwave(rule: RuleOf<'nightwave'>, ws: WorldstateHubPayload): WorldRuleMatch[] {
  return ws.nightwave
    .filter((c) => {
      const kind = c.isElite ? 'elite' : c.isDaily ? 'daily' : 'weekly'
      if (rule.kinds.length > 0 && !rule.kinds.includes(kind)) return false
      if (c.reputation < rule.minReputation) return false
      if (rule.titleText && !containsText(`${c.title} ${c.desc}`, rule.titleText)) return false
      return true
    })
    .map((c) => ({
      key: `nightwave:${c.id}`,
      title: `Nightwave · ${c.title}`,
      subtitle: `${c.desc} · ${c.reputation.toLocaleString('fr-FR')} réputation`,
      hubSection: 'invasions' as const,
      marketSlug: null
    }))
}

