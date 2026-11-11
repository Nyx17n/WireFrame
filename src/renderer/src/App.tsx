import * as React from 'react'
import { AlertToastBanner } from '@/components/alerts/AlertToastBanner'
import { WhisperBar } from '@/components/market/WhisperBar'
import { ChangelogModal } from '@/components/modals/ChangelogModal'
import { TitleTabsBar } from '@/components/shell/TitleTabsBar'
import { CommandNavBar } from '@/components/shell/CommandNavBar'
import { OmniboxDialog } from '@/components/shell/OmniboxDialog'
import { StatusBar } from '@/components/shell/StatusBar'
import { UpdateBanner } from '@/components/shell/UpdateBanner'
import { SettingsModal } from '@/components/settings/SettingsModal'
import { useLocalShortcuts } from '@/hooks/useLocalShortcuts'
import { WorkspaceRouteViewport } from '@/pages/WorkspaceRouteViewport'
import { playAlertSoundPreview } from '@/services/audio-preview.service'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function App(): React.JSX.Element {
  const initialize = useAppStore((s) => s.initialize)
  const hydrateFromSession = useTabsStore((s) => s.hydrateFromSession)
  const setLatestAlertToast = useMarketStore((s) => s.setLatestAlertToast)

  useLocalShortcuts()

  React.useEffect(() => {
    let cleanupWindow: (() => void) | undefined
    void initialize().then((unsubscribe) => {
      cleanupWindow = unsubscribe
      hydrateFromSession(useAppStore.getState().settings.session)
    })

    const cleanupAlerts = ipcClient.alerts.onTriggered((alertEvent) => {
      setLatestAlertToast(alertEvent)
      const { audio } = useAppStore.getState().settings
      if (audio.soundEnabled) {
        void playAlertSoundPreview(audio.soundChoice, audio.volumePercent)
      }
    })

    return () => {
      cleanupWindow?.()
      cleanupAlerts()
    }
  }, [initialize, hydrateFromSession, setLatestAlertToast])

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <TitleTabsBar />
      <CommandNavBar />
      <UpdateBanner />
      <div className="flex-1 overflow-y-auto">
        <WorkspaceRouteViewport />
      </div>
      <WhisperBar />
      <StatusBar />
      <AlertToastBanner />
      <OmniboxDialog />
      <SettingsModal />
      <ChangelogModal />
    </div>
  )
}
