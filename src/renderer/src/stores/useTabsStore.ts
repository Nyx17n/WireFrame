import { create } from 'zustand'
import {
  formatRouteUri,
  getDefaultRouteTitle,
  type AppRoute,
  type BrowserTab,
  type TabsSession
} from '@shared/schemas/navigation.schema'
import {
  getTabCurrentRoute,
  INITIAL_BROWSER_TAB,
  makeTabId,
  orderPinnedFirst,
  scheduleTabsSessionPersist
} from '@/lib/tab-helpers'

interface OpenTabOptions {
  background?: boolean
  title?: string
}

interface TabsStoreState {
  hubActive: boolean
  activeTabId: string
  tabs: BrowserTab[]
  refreshRevision: number
  hydrateFromSession: (session: TabsSession) => void
  activateHub: () => void
  activateTab: (id: string) => void
  openTab: (route?: AppRoute, options?: OpenTabOptions) => void
  navigateActive: (route: AppRoute, customTitle?: string) => void
  goBack: () => void
  goForward: () => void
  reloadActive: () => void
  closeTab: (id: string, force?: boolean) => void
  togglePinTab: (id: string) => void
  duplicateTab: (id: string) => void
  closeDuplicateTabs: () => void
  closeOtherTabs: (keepId: string) => void
  closeTabsToRight: (id: string) => void
  reorderTabs: (fromId: string, toId: string) => void
  sortTabsAlphabetically: () => void
  cycleTab: (direction: 1 | -1) => void
}

export const useTabsStore = create<TabsStoreState>((set, get) => {
  const commit = (partial: Partial<TabsStoreState>): void => {
    set(partial)
    const { hubActive, activeTabId, tabs } = get()
    scheduleTabsSessionPersist({ hubActive, activeTabId, tabs })
  }

  return {
    hubActive: false,
    activeTabId: INITIAL_BROWSER_TAB.id,
    tabs: [INITIAL_BROWSER_TAB],
    refreshRevision: 0,

    hydrateFromSession: (session) => {
      if (!session.tabs.length) return
      const activeExists = session.tabs.some((t) => t.id === session.activeTabId)
      set({
        hubActive: session.hubActive,
        tabs: orderPinnedFirst(session.tabs),
        activeTabId: activeExists ? session.activeTabId : (session.tabs[0]?.id ?? INITIAL_BROWSER_TAB.id)
      })
    },

    activateHub: () => commit({ hubActive: true }),

    activateTab: (id) => {
      if (get().tabs.some((t) => t.id === id)) commit({ hubActive: false, activeTabId: id })
    },

    openTab: (route = { kind: 'market-home' }, options) => {
      if (route.kind === 'hub') return commit({ hubActive: true })
      const state = get()
      if (state.tabs.length >= 35) return
      const newTab: BrowserTab = {
        id: makeTabId(),
        title: options?.title ?? getDefaultRouteTitle(route),
        pinned: false,
        history: [route],
        historyIndex: 0
      }
      commit({
        tabs: orderPinnedFirst([...state.tabs, newTab]),
        ...(options?.background ? {} : { hubActive: false, activeTabId: newTab.id })
      })
    },

    navigateActive: (route, customTitle) => {
      if (route.kind === 'hub') return commit({ hubActive: true })
      const state = get()
      if (state.hubActive) return state.openTab(route, { title: customTitle })
      commit({
        tabs: state.tabs.map((tab) => {
          if (tab.id !== state.activeTabId) return tab
          const nextHistory = [...tab.history.slice(0, tab.historyIndex + 1), route].slice(-50)
          return {
            ...tab,
            title: customTitle ?? getDefaultRouteTitle(route),
            history: nextHistory,
            historyIndex: nextHistory.length - 1
          }
        })
      })
    },

    goBack: () => {
      const state = get()
      if (state.hubActive) return
      commit({
        tabs: state.tabs.map((tab) => {
          if (tab.id !== state.activeTabId || tab.historyIndex <= 0) return tab
          const nextIdx = tab.historyIndex - 1
          const target = tab.history[nextIdx]
          return { ...tab, historyIndex: nextIdx, title: target ? getDefaultRouteTitle(target) : tab.title }
        })
      })
    },

    goForward: () => {
      const state = get()
      if (state.hubActive) return
      commit({
        tabs: state.tabs.map((tab) => {
          if (tab.id !== state.activeTabId || tab.historyIndex >= tab.history.length - 1) return tab
          const nextIdx = tab.historyIndex + 1
          const target = tab.history[nextIdx]
          return { ...tab, historyIndex: nextIdx, title: target ? getDefaultRouteTitle(target) : tab.title }
        })
      })
    },

    reloadActive: () => set((s) => ({ refreshRevision: s.refreshRevision + 1 })),

    closeTab: (id, force = false) => {
      const state = get()
      const target = state.tabs.find((t) => t.id === id)
      if (!target || (target.pinned && !force)) return
      const remaining = state.tabs.filter((t) => t.id !== id)
      if (remaining.length === 0) {
        const fresh: BrowserTab = { ...INITIAL_BROWSER_TAB, id: makeTabId() }
        return commit({ tabs: [fresh], activeTabId: fresh.id, hubActive: false })
      }
      const closedIdx = state.tabs.findIndex((t) => t.id === id)
      const fallback = remaining[Math.min(closedIdx, remaining.length - 1)] ?? remaining[0]
      commit({
        tabs: remaining,
        activeTabId: state.activeTabId === id && fallback ? fallback.id : state.activeTabId
      })
    },

    togglePinTab: (id) =>
      commit({ tabs: orderPinnedFirst(get().tabs.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t))) }),

    duplicateTab: (id) => {
      const src = get().tabs.find((t) => t.id === id)
      if (!src) return
      const copy: BrowserTab = { ...src, id: makeTabId(), pinned: false, history: [...src.history] }
      commit({ tabs: orderPinnedFirst([...get().tabs, copy]), activeTabId: copy.id, hubActive: false })
    },

    closeDuplicateTabs: () => {
      const seen = new Set<string>()
      const kept = get().tabs.filter((tab) => {
        const uri = formatRouteUri(getTabCurrentRoute(tab))
        if (tab.pinned || !seen.has(uri)) {
          seen.add(uri)
          return true
        }
        return false
      })
      const activeOk = kept.some((t) => t.id === get().activeTabId)
      commit({ tabs: kept, activeTabId: activeOk ? get().activeTabId : (kept[0]?.id ?? INITIAL_BROWSER_TAB.id) })
    },

    closeOtherTabs: (keepId) =>
      commit({ tabs: get().tabs.filter((t) => t.id === keepId || t.pinned), activeTabId: keepId, hubActive: false }),

    closeTabsToRight: (id) => {
      const idx = get().tabs.findIndex((t) => t.id === id)
      if (idx === -1) return
      const kept = get().tabs.filter((t, i) => i <= idx || t.pinned)
      commit({ tabs: kept, activeTabId: kept.some((t) => t.id === get().activeTabId) ? get().activeTabId : id })
    },

    reorderTabs: (fromId, toId) => {
      if (fromId === toId) return
      const list = [...get().tabs]
      const fromIdx = list.findIndex((t) => t.id === fromId)
      const toIdx = list.findIndex((t) => t.id === toId)
      const moved = list[fromIdx]
      const target = list[toIdx]
      if (fromIdx === -1 || toIdx === -1 || !moved || !target || moved.pinned !== target.pinned) return
      list.splice(fromIdx, 1)
      list.splice(toIdx, 0, moved)
      commit({ tabs: list })
    },

    sortTabsAlphabetically: () =>
      commit({
        tabs: [...get().tabs].sort((a, b) => (a.pinned !== b.pinned ? (a.pinned ? -1 : 1) : a.title.localeCompare(b.title, 'fr')))
      }),

    cycleTab: (direction) => {
      const { tabs, activeTabId, hubActive } = get()
      if (!tabs.length) return
      if (hubActive) {
        const edge = direction === 1 ? tabs[0] : tabs[tabs.length - 1]
        if (edge) commit({ hubActive: false, activeTabId: edge.id })
        return
      }
      const idx = tabs.findIndex((t) => t.id === activeTabId)
      const next = tabs[(idx + direction + tabs.length) % tabs.length]
      if (next) commit({ hubActive: false, activeTabId: next.id })
    }
  }
})
