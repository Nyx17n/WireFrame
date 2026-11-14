import * as React from 'react'
import { NotificationCenterPopover } from '@/components/notifications/NotificationCenterPopover'
import { QuickMarketPopover } from '@/components/shell/QuickMarketPopover'
import { WfmHeaderAccountPill } from '@/components/wfm-account/WfmHeaderAccountPill'

export function NavQuickMenus({ isCompact }: { isCompact: boolean }): React.JSX.Element {
  return (
    <>
      <WfmHeaderAccountPill isCompact={isCompact} />
      <NotificationCenterPopover isCompact={isCompact} />
      {!isCompact && <QuickMarketPopover />}
    </>
  )
}
