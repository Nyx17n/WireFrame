import { create } from 'zustand'
import type { WorldstateHubPayload } from '@shared/schemas/worldstate.schema'
import { ipcClient } from '@/services/ipc-client'

const POLL_INTERVAL_MS = 60_000
/** Au-delà de 5 min sans rafraîchissement réussi, les données sont considérées périmées (CDC 7.B). */
export const WORLDSTATE_STALE_AFTER_MS = 5 * 60_000

interface WorldstateStoreState {
  data: WorldstateHubPayload | null
  lastSuccessAt: number | null
  lastError: string | null
  refresh: () => Promise<void>
  /** Démarre le rafraîchissement périodique tant qu'au moins un abonné est monté. */
  subscribe: () => () => void
}

let subscribers = 0
let pollTimer: number | null = null

/**
 * Worldstate léger partagé par les widgets hors Hub (bandeau Minuteurs).
 * Réutilise le cache du Main Process : aucune requête API supplémentaire au-delà du TTL.
 */
export const useWorldstateStore = create<WorldstateStoreState>((set, get) => ({
  data: null,
  lastSuccessAt: null,
  lastError: null,

  refresh: async () => {
    try {
      const data = await ipcClient.worldstate.getCurrent(false)
      set({ data, lastSuccessAt: Date.now(), lastError: null })
    } catch (err) {
      set({ lastError: err instanceof Error ? err.message : 'Worldstate indisponible' })
    }
  },

  subscribe: () => {
    subscribers += 1
    if (subscribers === 1) {
      void get().refresh()
      pollTimer = window.setInterval(() => void get().refresh(), POLL_INTERVAL_MS)
    }
    return () => {
      subscribers = Math.max(0, subscribers - 1)
      if (subscribers === 0 && pollTimer !== null) {
        window.clearInterval(pollTimer)
        pollTimer = null
      }
    }
  }
}))

