import type { HubSectionId } from '@shared/schemas/worldstate.schema'
import { useHubNavStore } from '@/stores/useHubNavStore'
import { useTabsStore } from '@/stores/useTabsStore'

/** Ouvre le Hub Temps Réel directement sur la sous-vue demandée. */
export function openHubSection(section: HubSectionId): void {
  useHubNavStore.getState().setSection(section)
  useTabsStore.getState().activateHub()
}

