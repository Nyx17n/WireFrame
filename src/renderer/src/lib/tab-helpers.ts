import type { AppRoute, BrowserTab, TabsSession } from '@shared/schemas/navigation.schema'
import { useAppStore } from '@/stores/useAppStore'

export const INITIAL_BROWSER_TAB: BrowserTab = {
  id: 'tab-welcome',
  title: 'Accueil Marché',
  pinned: false,
  history: [{ kind: 'market-home' }],
  historyIndex: 0
}

let persistTimer: number | undefined

export function scheduleTabsSessionPersist(session: TabsSession): void {
  if (persistTimer !== undefined) {
    window.clearTimeout(persistTimer)
  }
  persistTimer = window.setTimeout(() => {
    void useAppStore.getState().updateSettings({ session })
  }, 350)
}

export function makeTabId(): string {
  return `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function getTabCurrentRoute(tab: BrowserTab): AppRoute {
  return tab.history[tab.historyIndex] ?? tab.history[0] ?? { kind: 'market-home' }
}

export function orderPinnedFirst(tabs: BrowserTab[]): BrowserTab[] {
  const pinned = tabs.filter((t) => t.pinned)
  const regular = tabs.filter((t) => !t.pinned)
  return [...pinned, ...regular]
}

