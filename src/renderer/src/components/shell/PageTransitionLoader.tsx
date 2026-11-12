import * as React from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function PageTransitionLoader(): React.JSX.Element | null {
  const isPageTransitioning = useTabsStore((s) => s.isPageTransitioning)
  const transitionRevision = useTabsStore((s) => s.transitionRevision)
  const animationLevel = useAppStore((s) => s.settings.appearance.animationLevel)

  if (!isPageTransitioning || animationLevel === 'off') {
    return null
  }

  return (
    <div
      key={transitionRevision}
      className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[2px] overflow-hidden"
      aria-hidden="true"
    >
      <div className="wf-page-progress-bar h-full w-full origin-left bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
    </div>
  )
}

