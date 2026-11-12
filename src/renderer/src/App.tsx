import * as React from 'react'
import { WhisperBar } from '@/components/market/WhisperBar'
import { ChangelogModal } from '@/components/modals/ChangelogModal'
import { NotificationViewport } from '@/components/notifications/NotificationViewport'
import { SettingsModal } from '@/components/settings/SettingsModal'
import { BookmarksBar } from '@/components/shell/BookmarksBar'
import { ClickThroughBanner } from '@/components/shell/ClickThroughBanner'
import { CommandNavBar } from '@/components/shell/CommandNavBar'
import { DiscordCornerButton } from '@/components/shell/DiscordCornerButton'
import { OmniboxDialog } from '@/components/shell/OmniboxDialog'
import { PageTransitionLoader } from '@/components/shell/PageTransitionLoader'
import { StartupSplashOverlay } from '@/components/shell/StartupSplashOverlay'
import { StatusBar } from '@/components/shell/StatusBar'
import { TitleTabsBar } from '@/components/shell/TitleTabsBar'
import { UpdateBanner } from '@/components/shell/UpdateBanner'
import { CompactTimersBar } from '@/components/shell/timers/CompactTimersBar'
import { useLocalShortcuts } from '@/hooks/useLocalShortcuts'
import { openHubSection } from '@/lib/hub-navigation'
import { applyThemeToDocument, subscribeOsReducedMotion } from '@/lib/theme-engine'
import { WorkspaceRouteViewport } from '@/pages/WorkspaceRouteViewport'
import { playAlertSoundPreview } from '@/services/audio-preview.service'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { notify, type NotificationAction } from '@/stores/useNotificationStore'
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

  React.useEffect(
    () =>
      subscribeOsReducedMotion(() => {
        applyThemeToDocument(useAppStore.getState().settings.appearance)
      }),
    []
  )

  React.useEffect(() => {
    let cleanupWindow: (() => void) | undefined
    void initialize().then((unsubscribe) => {
      cleanupWindow = unsubscribe
      hydrateFromSession(useAppStore.getState().settings.session)
    })

    const cleanupAlerts = ipcClient.alerts.onTriggered((alertEvent) => {
      setLatestAlertToast(alertEvent)

      const actions: NotificationAction[] = []
      if (
        alertEvent.kind === 'price-sniper' &&
        alertEvent.sellerName &&
        alertEvent.platinum !== undefined
      ) {
        const sellerName = alertEvent.sellerName
        const platinum = alertEvent.platinum
        actions.push({
          label: `Copier /w (${platinum}p)`,
          icon: 'whisper',
          onClick: () =>
            void useMarketStore.getState().triggerWhisper({
              ingameName: sellerName,
              itemNameEn: alertEvent.itemNameEn ?? alertEvent.title,
              itemNameFr: alertEvent.itemNameFr ?? alertEvent.title,
              platinum,
              rank: alertEvent.rank
            })
        })
      }
      if (alertEvent.kind === 'worldstate' && alertEvent.hubSection) {
        const targetSection = alertEvent.hubSection
        actions.push({
          label: 'Voir dans le Hub',
          icon: 'hub',
          onClick: () => openHubSection(targetSection)
        })
      }
      if (alertEvent.kind === 'worldstate' && alertEvent.slug) {
        const slug = alertEvent.slug
        actions.push({
          label: 'Prix Plat',
          icon: 'external',
          variant: 'outline',
          onClick: () => useTabsStore.getState().openTab({ kind: 'market-item', slug })
        })
      }

      notify({
        kind: 'alert',
        title: alertEvent.title,
        message: alertEvent.subtitle,
        actions
      })

      const { audio } = useAppStore.getState().settings
      if (audio.soundEnabled && !alertEvent.silent) {
        void playAlertSoundPreview(audio.soundChoice, audio.volumePercent)
      }
    })

    return () => {
      cleanupWindow?.()
      cleanupAlerts()
    }
  }, [initialize, hydrateFromSession, setLatestAlertToast])

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="wf-app-gradient-layer pointer-events-none fixed inset-0 z-0"
      />
      <div className="relative z-10 flex h-full w-full flex-col overflow-hidden">
        <TitleTabsBar />
        <ClickThroughBanner />
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
        <CompactTimersBar />
        <StatusBar />
      </div>
      <NotificationViewport />
      <OmniboxDialog />
      <SettingsModal />
      <ChangelogModal />
      <StartupSplashOverlay />
    </div>
  )
}
