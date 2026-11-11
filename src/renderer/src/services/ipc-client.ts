import { z } from 'zod'
import {
  MarketCatalogItemSchema,
  MarketItemDetailSchema,
  MarketItemStatsSchema,
  MarketOrderSchema,
  MarketUserProfileSchema,
  SetVsPartsAnalysisSchema,
  type MarketCatalogItem,
  type MarketItemDetail,
  type MarketItemStats,
  type MarketOrder,
  type MarketUserProfile,
  type SetVsPartsAnalysis
} from '@shared/schemas/market.schema'
import {
  UserSettingsSchema,
  type UserSettings,
  type UserSettingsPatch
} from '@shared/schemas/settings.schema'
import { SystemStatusSchema, type SystemStatus } from '@shared/schemas/system.schema'
import { WindowStateSchema, type WindowState } from '@shared/schemas/window.schema'
import type { WireframeBridgeApi } from '@shared/ipc-channels'

function getBridge(): WireframeBridgeApi {
  if (typeof window === 'undefined' || !window.wireframeApi) {
    throw new Error('Pont IPC preload indisponible (window.wireframeApi manquant).')
  }
  return window.wireframeApi
}

function assertMarketBridge(): WireframeBridgeApi['market'] {
  const bridge = getBridge()
  if (!bridge.market) {
    throw new Error('Relance npm.cmd run dev une fois pour activer les canaux IPC Warframe Market.')
  }
  return bridge.market
}

export const ipcClient = {
  system: {
    async getStatus(): Promise<SystemStatus> {
      return SystemStatusSchema.parse(await getBridge().system.getStatus())
    },
    async clearCache(): Promise<SystemStatus> {
      return SystemStatusSchema.parse(await getBridge().system.clearCache())
    }
  },
  settings: {
    async get(): Promise<UserSettings> {
      return UserSettingsSchema.parse(await getBridge().settings.get())
    },
    async update(patch: UserSettingsPatch): Promise<UserSettings> {
      return UserSettingsSchema.parse(await getBridge().settings.update(patch))
    },
    async reset(): Promise<UserSettings> {
      return UserSettingsSchema.parse(await getBridge().settings.reset())
    },
    exportJson(): Promise<boolean> {
      return getBridge().settings.exportJson()
    },
    async importJson(): Promise<UserSettings | null> {
      const raw = await getBridge().settings.importJson()
      return raw ? UserSettingsSchema.parse(raw) : null
    }
  },
  window: {
    async getState(): Promise<WindowState> {
      return WindowStateSchema.parse(await getBridge().window.getState())
    },
    minimize(): Promise<void> {
      return getBridge().window.minimize()
    },
    async toggleMaximize(): Promise<WindowState> {
      return WindowStateSchema.parse(await getBridge().window.toggleMaximize())
    },
    close(): Promise<void> {
      return getBridge().window.close()
    },
    async setAlwaysOnTop(enabled: boolean): Promise<WindowState> {
      return WindowStateSchema.parse(await getBridge().window.setAlwaysOnTop(enabled))
    },
    async setCompactMode(enabled: boolean): Promise<WindowState> {
      return WindowStateSchema.parse(await getBridge().window.setCompactMode(enabled))
    },
    async setZoom(zoomPercent: number): Promise<WindowState> {
      return WindowStateSchema.parse(await getBridge().window.setZoom(zoomPercent))
    },
    openExternalUrl(url: string): Promise<boolean> {
      return getBridge().window.openExternalUrl(url)
    },
    onStateChanged(listener: (state: WindowState) => void): () => void {
      return getBridge().window.onStateChanged((rawState) => {
        const parsed = WindowStateSchema.safeParse(rawState)
        if (parsed.success) listener(parsed.data)
      })
    }
  },
  clipboard: {
    writeText(text: string): Promise<void> {
      return getBridge().clipboard.writeText(text)
    }
  },
  market: {
    async getCatalog(forceRefresh?: boolean): Promise<MarketCatalogItem[]> {
      const raw = await assertMarketBridge().getCatalog(forceRefresh)
      return z.array(MarketCatalogItemSchema).parse(raw)
    },
    async getItemDetail(slug: string): Promise<MarketItemDetail> {
      const raw = await assertMarketBridge().getItemDetail(slug)
      return MarketItemDetailSchema.parse(raw)
    },
    async getItemOrders(slug: string, forceRefresh?: boolean): Promise<MarketOrder[]> {
      const raw = await assertMarketBridge().getItemOrders(slug, forceRefresh)
      return z.array(MarketOrderSchema).parse(raw)
    },
    async analyzeSetVsParts(slug: string, forceRefresh?: boolean): Promise<SetVsPartsAnalysis> {
      const raw = await assertMarketBridge().analyzeSetVsParts(slug, forceRefresh)
      return SetVsPartsAnalysisSchema.parse(raw)
    },
    async getItemStats(slug: string): Promise<MarketItemStats> {
      const raw = await assertMarketBridge().getItemStats(slug)
      return MarketItemStatsSchema.parse(raw)
    },
    async getRecentOrders(forceRefresh?: boolean): Promise<MarketOrder[]> {
      const raw = await assertMarketBridge().getRecentOrders(forceRefresh)
      return z.array(MarketOrderSchema).parse(raw)
    },
    async getUserProfile(userSlug: string): Promise<MarketUserProfile> {
      const raw = await assertMarketBridge().getUserProfile(userSlug)
      return MarketUserProfileSchema.parse(raw)
    }
  }
} as const
