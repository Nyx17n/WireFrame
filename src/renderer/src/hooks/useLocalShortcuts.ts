import * as React from 'react'
import { getTabCurrentRoute } from '@/lib/tab-helpers'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

/**
 * Raccourcis clavier locaux conformes à la section 2.3 du CDC :
 * Ctrl+T, Ctrl+W, Ctrl+Tab / Ctrl+Shift+Tab, Ctrl+K / Ctrl+L, Ctrl+D, Ctrl+R / F5, Ctrl+, et Zoom natif.
 */
export function useLocalShortcuts(): void {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const ctrl = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()

      if (event.key === 'F5' || (ctrl && key === 'r')) {
        event.preventDefault()
        useTabsStore.getState().reloadActive()
        void useAppStore.getState().refreshSystemStatus()
        return
      }

      if (!ctrl) return

      if (key === 't') {
        event.preventDefault()
        useTabsStore.getState().openTab({ kind: 'market-home' })
      } else if (key === 'w') {
        event.preventDefault()
        const tabsState = useTabsStore.getState()
        if (!tabsState.hubActive) {
          tabsState.closeTab(tabsState.activeTabId)
        }
      } else if (event.key === 'Tab') {
        event.preventDefault()
        useTabsStore.getState().cycleTab(event.shiftKey ? -1 : 1)
      } else if (key === 'k' || key === 'l') {
        event.preventDefault()
        useAppStore.getState().setOmniboxOpen(true)
      } else if (key === 'h') {
        event.preventDefault()
        useTabsStore.getState().navigateActive({ kind: 'browser-history' })
      } else if (key === 'd') {
        const tabsState = useTabsStore.getState()
        const active = tabsState.tabs.find((t) => t.id === tabsState.activeTabId)
        const route = !tabsState.hubActive && active ? getTabCurrentRoute(active) : null
        if (route?.kind === 'market-item' && route.slug) {
          event.preventDefault()
          void useMarketStore.getState().toggleFavorite(route.slug)
        }
      } else if (event.key === ',') {
        event.preventDefault()
        useAppStore.getState().openSettingsModal()
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        const z = useAppStore.getState().windowState.zoomPercent
        void useAppStore.getState().setWindowZoom(z + 10)
      } else if (event.key === '-') {
        event.preventDefault()
        const z = useAppStore.getState().windowState.zoomPercent
        void useAppStore.getState().setWindowZoom(z - 10)
      } else if (event.key === '0') {
        event.preventDefault()
        void useAppStore.getState().setWindowZoom(100)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
