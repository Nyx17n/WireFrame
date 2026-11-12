import * as React from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuickMarketPopover } from '@/components/shell/QuickMarketPopover'
import { getTabCurrentRoute } from '@/lib/tab-helpers'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function NavQuickMenus({ isCompact }: { isCompact: boolean }): React.JSX.Element {
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const hubActive = useTabsStore((s) => s.hubActive)
  const activeTab = useTabsStore((s) => s.tabs.find((t) => t.id === s.activeTabId))
  const isAlertsOpen =
    !hubActive && activeTab !== undefined && getTabCurrentRoute(activeTab).kind === 'alerts'

  const activeAlertsCount = useAppStore(
    (s) => s.settings.priceAlerts.filter((a) => a.enabled).length
  )

  return (
    <>
      <Button
        variant={isAlertsOpen ? 'secondary' : 'ghost'}
        size={isCompact ? 'icon' : 'sm'}
        title="Alertes & Price Sniper (wf://alerts)"
        onClick={() => navigateActive({ kind: 'alerts' })}
      >
        <Bell className="h-3.5 w-3.5 text-primary" />
        {!isCompact && activeAlertsCount > 0 && (
          <span className="font-mono text-[11px]">{activeAlertsCount}</span>
        )}
      </Button>
      {!isCompact && <QuickMarketPopover />}
    </>
  )
}

