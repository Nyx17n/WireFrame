import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { formatRouteUri } from '@shared/schemas/navigation.schema'
import { getTabCurrentRoute } from '@/lib/tab-helpers'
import { useTabsStore } from '@/stores/useTabsStore'

export function PageTransitionLoader(): React.JSX.Element | null {
  const isPageTransitioning = useTabsStore((s) => s.isPageTransitioning)
  const transitionRevision = useTabsStore((s) => s.transitionRevision)
  const hubActive = useTabsStore((s) => s.hubActive)
  const activeTab = useTabsStore((s) => s.tabs.find((t) => t.id === s.activeTabId) ?? s.tabs[0])

  if (!isPageTransitioning) {
    return null
  }

  const currentUri = hubActive
    ? 'wf://hub'
    : activeTab
      ? formatRouteUri(getTabCurrentRoute(activeTab))
      : 'wf://market'

  return (
    <div
      key={transitionRevision}
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
      aria-hidden="true"
    >
      <div className="wf-page-progress-bar h-[2px] w-full origin-left bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />

      <div className="wf-page-loader-pill absolute inset-0 flex items-center justify-center bg-background/35 backdrop-blur-[1.5px]">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-card/95 px-3.5 py-1.5 text-xs font-medium text-foreground shadow-md">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span className="font-mono text-[11px] text-foreground/90">{currentUri}</span>
        </div>
      </div>
    </div>
  )
}
