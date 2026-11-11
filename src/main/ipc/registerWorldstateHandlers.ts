import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import type { WindowOverlayService } from '../services/WindowOverlayService'
import type { WorldstateService } from '../services/WorldstateService'
import { assertTrustedSender } from './security'

const ForceRefreshArgSchema = z
  .object({
    forceRefresh: z.boolean().optional()
  })
  .default({})

export function registerWorldstateHandlers(deps: {
  windowService: WindowOverlayService
  worldstateService: WorldstateService
}): void {
  const { windowService, worldstateService } = deps

  ipcMain.handle(IPC_CHANNELS.WORLDSTATE_GET_CURRENT, async (event, rawArgs) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { forceRefresh } = ForceRefreshArgSchema.parse(rawArgs ?? {})
    return worldstateService.getCurrent(Boolean(forceRefresh))
  })

  ipcMain.handle(IPC_CHANNELS.WORLDSTATE_GET_BARO_PRICES, async (event, rawArgs) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { forceRefresh } = ForceRefreshArgSchema.parse(rawArgs ?? {})
    return worldstateService.getBaroWithPrices(Boolean(forceRefresh))
  })

  ipcMain.handle(IPC_CHANNELS.WORLDSTATE_GET_VITUS_PRICES, async (event, rawArgs) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { forceRefresh } = ForceRefreshArgSchema.parse(rawArgs ?? {})
    return worldstateService.getVitusWithPrices(Boolean(forceRefresh))
  })
}

