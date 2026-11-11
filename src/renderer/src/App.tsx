import * as React from 'react'
import { TitleTabsBar } from '@/components/shell/TitleTabsBar'
import { CommandNavBar } from '@/components/shell/CommandNavBar'
import { StatusBar } from '@/components/shell/StatusBar'
import { FoundationOverviewPage } from '@/pages/FoundationOverviewPage'
import { useAppStore } from '@/stores/useAppStore'

export function App(): React.JSX.Element {
  const initialize = useAppStore((s) => s.initialize)

  React.useEffect(() => {
    let cleanup: (() => void) | undefined
    void initialize().then((unsubscribe) => {
      cleanup = unsubscribe
    })
    return () => {
      cleanup?.()
    }
  }, [initialize])

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <TitleTabsBar />
      <CommandNavBar />
      <div className="flex-1 overflow-y-auto">
        <FoundationOverviewPage />
      </div>
      <StatusBar />
    </div>
  )
}

