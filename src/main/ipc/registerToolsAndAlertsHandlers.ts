import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import { RivenSearchParamsSchema } from '@shared/schemas/tools.schema'
import type { AlertSchedulerService } from '../services/AlertSchedulerService'
import type { CartBundlerService } from '../services/CartBundlerService'
import type { TradingToolsService } from '../services/TradingToolsService'
import type { WindowOverlayService } from '../services/WindowOverlayService'
import { assertTrustedSender } from './security'

const RefreshOptionalSchema = z
  .object({
    forceRefresh: z.boolean().optional()
  })
  .optional()

export function registerToolsAndAlertsHandlers(deps: {
  cartBundler: CartBundlerService
  tradingTools: TradingToolsService
  alertScheduler: AlertSchedulerService
  windowService: WindowOverlayService
}): void {
  const { cartBundler, tradingTools, alertScheduler, windowService } = deps

  ipcMain.handle(IPC_CHANNELS.TOOLS_ANALYZE_CART, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const parsed = RefreshOptionalSchema.parse(rawPayload)
    return cartBundler.analyzeCartBundles(Boolean(parsed?.forceRefresh))
  })

  ipcMain.handle(IPC_CHANNELS.TOOLS_GET_DUCATS, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const parsed = RefreshOptionalSchema.parse(rawPayload)
    return tradingTools.getDucats(Boolean(parsed?.forceRefresh))
  })

  ipcMain.handle(IPC_CHANNELS.TOOLS_GET_RIVEN_WEAPONS, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return tradingTools.getRivenWeapons()
  })

  ipcMain.handle(IPC_CHANNELS.TOOLS_SEARCH_RIVENS, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const params = RivenSearchParamsSchema.parse(rawPayload)
    return tradingTools.searchRivens(params)
  })

  ipcMain.handle(IPC_CHANNELS.ALERTS_SCAN_NOW, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return alertScheduler.scanNow()
  })
}

