import * as React from 'react'
import { AlertToastBanner } from '@/components/alerts/AlertToastBanner'
import { WhisperBar } from '@/components/market/WhisperBar'
import { ChangelogModal } from '@/components/modals/ChangelogModal'
import { TitleTabsBar } from '@/components/shell/TitleTabsBar'
import { CommandNavBar } from '@/components/shell/CommandNavBar'
import { BookmarksBar } from '@/components/shell/BookmarksBar'
import { DiscordCornerButton } from '@/components/shell/DiscordCornerButton'
import { PageTransitionLoader } from '@/components/shell/PageTransitionLoader'
import { OmniboxDialog } from '@/components/shell/OmniboxDialog'
import { StartupSplashOverlay } from '@/components/shell/StartupSplashOverlay'
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
  const isCompactMode = useAppStore((s) => s.windowState.isCompactMode)
  const hydrateFromSession = useTabsStore((s) => s.hydrateFromSession)
  const transitionRevision = useTabsStore((s) => s.transitionRevision)
  const setLatestAlertToast = useMarketStore((s) => s.setLatestAlertToast)

  const viewportScrollRef = React.useRef<HTMLDivElement | null>(null)

  useLocalShortcuts()

  React.useEffect(() => {
    if (transitionRevision > 0) {
      viewportScrollRef.current?.scrollTo({ top: 0 })
    }
  }, [transitionRevision])

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
      <BookmarksBar />
      <UpdateBanner />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <PageTransitionLoader />
        <div
          ref={viewportScrollRef}
          className={`wf-scroll-stable flex-1 overflow-y-auto ${isCompactMode ? '' : 'pb-10'}`}
        >
          <WorkspaceRouteViewport />
        </div>
        <DiscordCornerButton />
      </div>
      <WhisperBar />
      <StatusBar />
      <AlertToastBanner />
      <OmniboxDialog />
      <SettingsModal />
      <ChangelogModal />
      <StartupSplashOverlay />
    </div>
  )
}
