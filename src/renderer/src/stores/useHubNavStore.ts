import { create } from 'zustand'
import type { HubSectionId } from '@shared/schemas/worldstate.schema'

interface HubNavState {
  section: HubSectionId
  setSection: (section: HubSectionId) => void
}

/**
 * Sous-vue active du Hub Temps Réel, partagée pour que les toasts d'alerte
 * et le bandeau Minuteurs puissent ouvrir directement la bonne section.
 */
export const useHubNavStore = create<HubNavState>((set) => ({
  section: 'planets',
  setSection: (section) => set({ section })
}))

