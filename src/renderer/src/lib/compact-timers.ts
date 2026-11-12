import type { CompactTimerKey } from '@shared/schemas/settings.schema'
import type { HubSectionId, WorldstateHubPayload } from '@shared/schemas/worldstate.schema'

export const COMPACT_TIMER_LABELS: Readonly<Record<CompactTimerKey, string>> = {
  cetus: 'Cetus (Jour / Nuit)',
  vallis: 'Vallée Orbis (Chaud / Froid)',
  cambion: 'Puy de Cambion (Fass / Vome)',
  zariman: 'Zariman (Corpus / Grineer)',
  duviri: 'Humeur de Duviri',
  baro: "Baro Ki'Teer (arrivée / départ)",
  arbitration: 'Arbitrage (fin de l’heure)',
  sortie: 'Sortie & Archonte (réinitialisation)',
  'daily-reset': 'Réinitialisation quotidienne (00:00 UTC)'
}

export const COMPACT_TIMER_KEYS = Object.keys(COMPACT_TIMER_LABELS) as CompactTimerKey[]

export type TimerTone = 'sun' | 'moon' | 'warm' | 'cold' | 'neutral' | 'accent'

export interface TimerView {
  key: CompactTimerKey
  name: string
  state: string
  targetIso: string
  tone: TimerTone
  hubSection: HubSectionId
}

const SHORT_STATE: Readonly<Record<string, string>> = {
  day: 'Jour',
  night: 'Nuit',
  warm: 'Chaud',
  cold: 'Froid',
  fass: 'Fass',
  vome: 'Vome',
  corpus: 'Corpus',
  grineer: 'Grineer'
}

const CYCLE_TONE: Readonly<Record<string, TimerTone>> = {
  day: 'sun',
  night: 'moon',
  warm: 'warm',
  cold: 'cold',
  fass: 'warm',
  vome: 'moon',
  corpus: 'cold',
  grineer: 'warm'
}

function nextUtcMidnightIso(nowMs: number): string {
  const d = new Date(nowMs)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1)).toISOString()
}

function cycleView(key: CompactTimerKey, name: string, ws: WorldstateHubPayload): TimerView | null {
  const cycle = ws.cycles.find((c) => c.key === key)
  if (!cycle) return null
  return {
    key,
    name,
    state: SHORT_STATE[cycle.state] ?? cycle.stateLabelFr,
    targetIso: cycle.expiry,
    tone: CYCLE_TONE[cycle.state] ?? 'neutral',
    hubSection: 'planets'
  }
}

/** Construit l'affichage d'un minuteur à partir du Worldstate (null si donnée absente). */
export function buildTimerView(
  key: CompactTimerKey,
  ws: WorldstateHubPayload | null,
  nowMs: number
): TimerView | null {
  if (key === 'daily-reset') {
    return { key, name: 'Reset', state: 'quotidien', targetIso: nextUtcMidnightIso(nowMs), tone: 'neutral', hubSection: 'news' }
  }
  if (!ws) return null
  switch (key) {
    case 'cetus':
      return cycleView(key, 'Cetus', ws)
    case 'vallis':
      return cycleView(key, 'Orbis', ws)
    case 'cambion':
      return cycleView(key, 'Cambion', ws)
    case 'zariman':
      return cycleView(key, 'Zariman', ws)
    case 'duviri':
      return {
        key,
        name: 'Duviri',
        state: ws.duviriCircuit.spiralLabelFr.replace(/^Spirale (de la |de l’|du )?/i, ''),
        targetIso: ws.duviriCircuit.spiralExpiry,
        tone: 'accent',
        hubSection: 'duviri'
      }
    case 'baro':
      return {
        key,
        name: 'Baro',
        state: ws.voidTrader.active ? 'part' : 'arrive',
        targetIso: ws.voidTrader.active ? ws.voidTrader.expiry : ws.voidTrader.activation,
        tone: ws.voidTrader.active ? 'accent' : 'neutral',
        hubSection: 'baro'
      }
    case 'arbitration':
      return {
        key,
        name: 'Arbitrage',
        state: ws.arbitration.type,
        targetIso: ws.arbitration.expiry,
        tone: ws.arbitration.isSTier ? 'accent' : 'neutral',
        hubSection: 'invasions'
      }
    case 'sortie':
      return ws.sortie
        ? { key, name: 'Sortie', state: 'reset', targetIso: ws.sortie.expiry, tone: 'neutral', hubSection: 'fissures' }
        : null
  }
}

