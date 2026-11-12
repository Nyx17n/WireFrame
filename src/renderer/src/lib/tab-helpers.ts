import { z } from 'zod'
import {
  formatRouteUri,
  getDefaultRouteTitle,
  NavigationHistoryEntrySchema,
  type AppRoute,
  type BrowserTab,
  type NavigationHistoryEntry,
  type TabsSession
} from '@shared/schemas/navigation.schema'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'

const LOCAL_HISTORY_FALLBACK_KEY = 'wf.navigationHistory.v2'

export const INITIAL_BROWSER_TAB: BrowserTab = {
  id: 'tab-welcome',
  title: 'Accueil Marché',
  pinned: false,
  history: [{ kind: 'market-home' }],
  historyIndex: 0
}

let persistTimer: number | undefined

function saveLocalHistoryFallback(entries: readonly NavigationHistoryEntry[]): void {
  try {
    window.localStorage.setItem(LOCAL_HISTORY_FALLBACK_KEY, JSON.stringify(entries))
  } catch {
    // Ignore storage access errors
  }
}

export function loadLocalHistoryFallback(): NavigationHistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_HISTORY_FALLBACK_KEY)
    if (!raw) return []
    const parsed = z.array(NavigationHistoryEntrySchema).max(200).safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : []
  } catch {
    return []
  }
}

export function scheduleTabsSessionPersist(session: TabsSession): void {
  saveLocalHistoryFallback(session.navigationHistory)
  if (persistTimer !== undefined) {
    window.clearTimeout(persistTimer)
  }
  persistTimer = window.setTimeout(() => {
    void ipcClient.settings
      .update({ session })
      .then((updated) => {
        useAppStore.setState({ settings: updated })
      })
      .catch(() => {
        // Fallback gracieux pendant le HMR dev si le Main Process n'a pas encore redémarré
        const legacySafeTabs = session.tabs
          .map((t) => {
            const safeHistory = t.history.filter((r) => r.kind !== 'browser-history')
            if (safeHistory.length === 0) return null
            return {
              ...t,
              history: safeHistory,
              historyIndex: Math.min(t.historyIndex, safeHistory.length - 1)
            }
          })
          .filter((t): t is BrowserTab => t !== null)

        if (legacySafeTabs.length > 0) {
          void ipcClient.settings
            .update({
              session: {
                hubActive: session.hubActive,
                activeTabId: session.activeTabId,
                tabs: legacySafeTabs,
                navigationHistory: []
              }
            })
            .catch(() => undefined)
        }
      })
  }, 350)
}

export function makeTabId(): string {
  return `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function appendNavigationHistoryEntry(
  current: readonly NavigationHistoryEntry[],
  route: AppRoute,
  customTitle?: string
): NavigationHistoryEntry[] {
  if (route.kind === 'browser-history') {
    return [...current]
  }
  const uri = formatRouteUri(route)
  const title = (customTitle ?? getDefaultRouteTitle(route)).trim().slice(0, 160) || uri
  const visitedAt = new Date().toISOString()

  const latest = current[0]
  if (latest && formatRouteUri(latest.route) === uri) {
    return [{ ...latest, title, visitedAt }, ...current.slice(1)]
  }

  const nextEntry: NavigationHistoryEntry = {
    id: `hist-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    route,
    title,
    visitedAt
  }
  return [nextEntry, ...current].slice(0, 200)
}

export function getTabCurrentRoute(tab: BrowserTab): AppRoute {
  return tab.history[tab.historyIndex] ?? tab.history[0] ?? { kind: 'market-home' }
}

export function orderPinnedFirst(tabs: BrowserTab[]): BrowserTab[] {
  const pinned = tabs.filter((t) => t.pinned)
  const regular = tabs.filter((t) => !t.pinned)
  return [...pinned, ...regular]
}

