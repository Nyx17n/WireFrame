import * as React from 'react'
import { NotificationCenterPopover } from '@/components/notifications/NotificationCenterPopover'
import { QuickMarketPopover } from '@/components/shell/QuickMarketPopover'

export function NavQuickMenus({ isCompact }: { isCompact: boolean }): React.JSX.Element {
  return (
    <>
      <NotificationCenterPopover isCompact={isCompact} />
      {!isCompact && <QuickMarketPopover />}
    </>
  )
}
