import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import { MarketFacetedSearchInputSchema } from '@shared/schemas/market-search.schema'
import type { MarketApiService } from '../services/MarketApiService'
import type { MarketFacetedSearchService } from '../services/MarketFacetedSearchService'
import type { SetCalculatorService } from '../services/SetCalculatorService'
import type { WindowOverlayService } from '../services/WindowOverlayService'
import { assertTrustedSender } from './security'

const SlugPayloadSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-zA-Z0-9_.-]+$/)
})

const SlugRefreshPayloadSchema = SlugPayloadSchema.extend({
  forceRefresh: z.boolean().optional()
})

const RefreshOnlyPayloadSchema = z
  .object({
    forceRefresh: z.boolean().optional()
  })
  .optional()

export function registerMarketHandlers(deps: {
  marketApi: MarketApiService
  marketFacetedSearch: MarketFacetedSearchService
  setCalculator: SetCalculatorService
  windowService: WindowOverlayService
}): void {
  const { marketApi, marketFacetedSearch, setCalculator, windowService } = deps

  ipcMain.handle(IPC_CHANNELS.MARKET_GET_CATALOG, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const parsed = RefreshOnlyPayloadSchema.parse(rawPayload)
    return marketApi.getCatalog(Boolean(parsed?.forceRefresh))
  })

  ipcMain.handle(IPC_CHANNELS.MARKET_GET_ITEM_DETAIL, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { slug } = SlugPayloadSchema.parse(rawPayload)
    return marketApi.getItemDetail(slug)
  })

  ipcMain.handle(IPC_CHANNELS.MARKET_GET_ITEM_ORDERS, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { slug, forceRefresh } = SlugRefreshPayloadSchema.parse(rawPayload)
    return marketApi.getItemOrders(slug, Boolean(forceRefresh))
  })

  ipcMain.handle(IPC_CHANNELS.MARKET_ANALYZE_SET, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { slug, forceRefresh } = SlugRefreshPayloadSchema.parse(rawPayload)
    return setCalculator.analyzeSetVsParts(slug, Boolean(forceRefresh))
  })

  ipcMain.handle(IPC_CHANNELS.MARKET_GET_ITEM_STATS, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { slug } = SlugPayloadSchema.parse(rawPayload)
    return marketApi.getItemStats(slug)
  })

  ipcMain.handle(IPC_CHANNELS.MARKET_GET_RECENT_ORDERS, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const parsed = RefreshOnlyPayloadSchema.parse(rawPayload)
    return marketApi.getRecentOrders(Boolean(parsed?.forceRefresh))
  })

  ipcMain.handle(IPC_CHANNELS.MARKET_GET_USER_PROFILE, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { slug, forceRefresh } = SlugRefreshPayloadSchema.parse(rawPayload)
    return marketApi.getUserProfile(slug, Boolean(forceRefresh))
  })

  ipcMain.handle(
    IPC_CHANNELS.MARKET_SEARCH_FACETED_ORDERS,
    async (event, rawPayload: unknown) => {
      assertTrustedSender(event, windowService.getMainWindow())
      const input = MarketFacetedSearchInputSchema.parse(rawPayload)
      return marketFacetedSearch.searchFacetedOrders(input)
    }
  )
}

