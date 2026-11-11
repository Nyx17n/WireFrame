import * as React from 'react'
import { WhisperBar } from '@/components/market/WhisperBar'
import { TitleTabsBar } from '@/components/shell/TitleTabsBar'
import { CommandNavBar } from '@/components/shell/CommandNavBar'
import { OmniboxDialog } from '@/components/shell/OmniboxDialog'
import { StatusBar } from '@/components/shell/StatusBar'
import { SettingsModal } from '@/components/settings/SettingsModal'
import { useLocalShortcuts } from '@/hooks/useLocalShortcuts'
import { WorkspaceRouteViewport } from '@/pages/WorkspaceRouteViewport'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function App(): React.JSX.Element {
  const initialize = useAppStore((s) => s.initialize)
  const hydrateFromSession = useTabsStore((s) => s.hydrateFromSession)

  useLocalShortcuts()

  React.useEffect(() => {
    let cleanup: (() => void) | undefined
    void initialize().then((unsubscribe) => {
      cleanup = unsubscribe
      hydrateFromSession(useAppStore.getState().settings.session)
    })
    return () => {
      cleanup?.()
    }
  }, [initialize, hydrateFromSession])

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <TitleTabsBar />
      <CommandNavBar />
      <div className="flex-1 overflow-y-auto">
        <WorkspaceRouteViewport />
      </div>
      <WhisperBar />
      <StatusBar />
      <OmniboxDialog />
      <SettingsModal />
    </div>
  )
}
