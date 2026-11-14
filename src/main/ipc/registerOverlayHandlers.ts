import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import { CodexFarmOverlayPatchSchema } from '@shared/schemas/extensions.schema'
import { BooleanTogglePayloadSchema } from '@shared/schemas/window.schema'
import type { FarmOverlayWindowService } from '../services/FarmOverlayWindowService'
import type { WindowOverlayService } from '../services/WindowOverlayService'
import { assertTrustedAnyWindowSender } from './security'

const WindowOpenPayloadSchema = z.object({
  open: z.boolean()
})

export interface OverlayHandlersDeps {
  windowService: WindowOverlayService
  farmOverlayService: FarmOverlayWindowService
  onOverlayShortcutChanged: () => Promise<void>
}

export function registerOverlayHandlers({
  windowService,
  farmOverlayService,
  onOverlayShortcutChanged
}: OverlayHandlersDeps): void {
  const getTrustedWindows = () => [
    windowService.getMainWindow(),
    farmOverlayService.getOverlayWindow()
  ]

  ipcMain.handle(IPC_CHANNELS.OVERLAY_GET_STATE, async (event) => {
    assertTrustedAnyWindowSender(event, getTrustedWindows())
    return farmOverlayService.getLiveState()
  })

  ipcMain.handle(IPC_CHANNELS.OVERLAY_SET_WINDOW_OPEN, async (event, rawPayload: unknown) => {
    assertTrustedAnyWindowSender(event, getTrustedWindows())
    const { open } = WindowOpenPayloadSchema.parse(rawPayload)
    return farmOverlayService.setWindowOpen(open)
  })

  ipcMain.handle(IPC_CHANNELS.OVERLAY_SET_CLICK_THROUGH, async (event, rawPayload: unknown) => {
    assertTrustedAnyWindowSender(event, getTrustedWindows())
    const { enabled } = BooleanTogglePayloadSchema.parse(rawPayload)
    return farmOverlayService.setClickThrough(enabled)
  })

  ipcMain.handle(IPC_CHANNELS.OVERLAY_UPDATE_STATE, async (event, rawPayload: unknown) => {
    assertTrustedAnyWindowSender(event, getTrustedWindows())
    const patch = CodexFarmOverlayPatchSchema.parse(rawPayload)
    const state = await farmOverlayService.updateOverlayState(patch)
    if (patch.shortcutToggle !== undefined) {
      await onOverlayShortcutChanged()
    }
    return state
  })
}

