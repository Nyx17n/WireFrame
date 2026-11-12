import type { TriggeredAlertEvent, WorldAlertToggles } from '@shared/schemas/alerts.schema'
import type { HubSectionId, WorldstateHubPayload } from '@shared/schemas/worldstate.schema'
import { rememberOnce } from './world-rules/world-rule-text'

export function evaluateWorldstateAlerts(
  ws: WorldstateHubPayload,
  toggles: WorldAlertToggles,
  notifiedWorldKeys: Set<string>
): TriggeredAlertEvent[] {
  const events: TriggeredAlertEvent[] = []
  const now = Date.now()
  const nowIso = new Date(now).toISOString()

  const emitOnce = (
    dedupeKey: string,
    title: string,
    subtitle: string,
    hubSection: HubSectionId,
    slug?: string
  ): void => {
    if (!rememberOnce(notifiedWorldKeys, dedupeKey)) return
    events.push({
      id: `ws-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      kind: 'worldstate',
      title,
      subtitle,
      ...(slug ? { slug } : {}),
      hubSection,
      triggeredAt: nowIso
    })
  }

  const cetus = ws.cycles.find((c) => c.key === 'cetus')
  if (cetus) {
    if (toggles.cetusNight && cetus.state === 'night') {
      emitOnce(
        `cetusNight:${cetus.expiry}`,
        'Nuit sur Cetus (Chasse Eidolon)',
        'La nuit vient de tomber sur les Plaines d’Eidolon !', 'planets'
      )
    }
    const msLeft = Date.parse(cetus.expiry) - now
    if (toggles.cetusPreNight5m && cetus.state === 'day' && msLeft > 0 && msLeft <= 5 * 60_000) {
      emitOnce(
        `cetusPreNight5m:${cetus.expiry}`,
        'Pré-alerte : Nuit Cetus dans < 5 min',
        'Prépare ton escouade Eidolon avant le coucher du soleil.', 'planets'
      )
    }
  }

  const vallis = ws.cycles.find((c) => c.key === 'vallis')
  if (toggles.vallisWarm && vallis && vallis.state === 'warm') {
    emitOnce(
      `vallisWarm:${vallis.expiry}`,
      'Vallée Orbis : Cycle Chaud actif',
      'Fenêtre de pêche rare active sur Fortuna (Vénus).', 'planets'
    )
  }

  const cambion = ws.cycles.find((c) => c.key === 'cambion')
  if (toggles.cambionVome && cambion && cambion.state === 'vome') {
    emitOnce(
      `cambionVome:${cambion.expiry}`,
      'Puy de Cambion : Cycle Vome actif',
      'Vome domine actuellement Deimos.', 'planets'
    )
  }

  if (toggles.baroArrival && ws.voidTrader.active) {
    emitOnce(
      `baro:${ws.voidTrader.expiry}`,
      `Baro Ki'Teer est présent !`,
      `Disponible à ${ws.voidTrader.location} (${ws.voidTrader.inventory.length} articles).`, 'baro'
    )
  }

  if (toggles.fastFissure) {
    const fast = ws.fissures.find((f) => f.isFastMission && !f.isStorm)
    if (fast) {
      emitOnce(
        `fastFissure:${fast.id}`,
        `Fissure Rapide ${fast.tier} (${fast.missionType})`,
        `${fast.node} — ${fast.enemy}${fast.isHard ? ' · Route de l’Acier' : ''}`, 'fissures'
      )
    }
  }

  if (toggles.steelPathOmniaFissure) {
    const omniaSp = ws.fissures.find((f) => f.isOmnia && f.isHard)
    if (omniaSp) {
      emitOnce(
        `omniaSp:${omniaSp.id}`,
        `Fissure Omnia Route de l’Acier`,
        `${omniaSp.missionType} sur ${omniaSp.node} (${omniaSp.enemy})`, 'fissures'
      )
    }
  }

  if (toggles.rareInvasionCatalystForma) {
    const rareInv = ws.invasions.find((i) => i.isRare)
    if (rareInv) {
      const rewards = [rareInv.attacker.rewardLabel, rareInv.defender.rewardLabel]
        .filter(Boolean)
        .join(' vs ')
      emitOnce(`rareInv:${rareInv.id}`, `Invasion Rare sur ${rareInv.node}`, rewards, 'invasions')
    }
  }

  if (toggles.weaponInvasionWraithVandal) {
    const weapInv = ws.invasions.find((i) => i.isWeaponPart)
    if (weapInv) {
      const rewards = [weapInv.attacker.rewardLabel, weapInv.defender.rewardLabel]
        .filter(Boolean)
        .join(' / ')
      const slug = weapInv.attacker.marketSlug ?? weapInv.defender.marketSlug ?? undefined
      emitOnce(`weapInv:${weapInv.id}`, `Invasion Wraith / Vandal (${weapInv.node})`, rewards, 'invasions', slug)
    }
  }

  if (toggles.teshinUmbraForma && ws.steelPath.isUmbraFormaWeek) {
    emitOnce(
      `teshinUmbra:${ws.steelPath.expiry}`,
      'Teshin : Semaine du Schéma Forma Umbra !',
      'Disponible dans les Honneurs de la Route de l’Acier (150 Essences d’Acier).', 'invasions'
    )
  }

  if (toggles.arbitrationSTier && ws.arbitration.isSTier) {
    emitOnce(
      `arbi:${ws.arbitration.expiry.slice(0, 13)}`,
      `Arbitrage S-Tier : ${ws.arbitration.type}`,
      `${ws.arbitration.node} (${ws.arbitration.enemy}) · ${ws.arbitration.bonus}`, 'invasions'
    )
  }

  return events
}

