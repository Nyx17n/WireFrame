import { z } from 'zod'
import {
  TriggeredAlertEventSchema,
  type TriggeredAlertEvent
} from '@shared/schemas/alerts.schema'
import {
  CodexItemDetailSchema,
  CodexSearchResultSchema,
  CodexSummaryCardSchema,
  HelminthOverviewSchema,
  type CodexCategory,
  type CodexItemDetail,
  type CodexSearchParams,
  type CodexSearchResult,
  type CodexSummaryCard,
  type HelminthOverview
} from '@shared/schemas/codex.schema'
import {
  FarmOverlayLiveStateSchema,
  type CodexFarmOverlayPatch,
  type FarmOverlayLiveState
} from '@shared/schemas/extensions.schema'
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
  MarketFacetedSearchResultSchema,
  type MarketFacetedSearchInput,
  type MarketFacetedSearchResult
} from '@shared/schemas/market-search.schema'
import {
  UserSettingsSchema,
  type UserSettings,
  type UserSettingsPatch
} from '@shared/schemas/settings.schema'
import { SystemStatusSchema, type SystemStatus } from '@shared/schemas/system.schema'
import {
  CartBundleAnalysisSchema,
  DucatItemEntrySchema,
  RivenAuctionCardSchema,
  RivenWeaponSummarySchema,
  type CartBundleAnalysis,
  type DucatItemEntry,
  type RivenAuctionCard,
  type RivenSearchParams,
  type RivenWeaponSummary
} from '@shared/schemas/tools.schema'
import { WindowStateSchema, type WindowState } from '@shared/schemas/window.schema'
import {
  WorldRulePreviewResultSchema,
  type WorldAlertRuleInput,
  type WorldRulePreviewResult
} from '@shared/schemas/world-rules.schema'
import {
  UpdaterStatusSchema,
  type UpdaterStatus
} from '@shared/schemas/updater.schema'
import {
  WfmAccountOverviewSchema,
  WfmOwnOrderSchema,
  WfmSessionStateSchema,
  type CloseWfmOrderUnitInput,
  type CreateWfmOrderInput,
  type UpdateWfmOrderInput,
  type WfmAccountOverview,
  type WfmOwnOrder,
  type WfmPresenceStatus,
  type WfmSessionState,
  type WfmSignInCredentialsInput,
  type WfmSignInTokenInput,
  type WfmSignInWebInput
} from '@shared/schemas/wfm-account.schema'
import {
  VitusModPriceEntrySchema,
  VoidTraderSnapshotSchema,
  WorldstateHubPayloadSchema,
  type VitusModPriceEntry,
  type VoidTraderSnapshot,
  type WorldstateHubPayload
} from '@shared/schemas/worldstate.schema'
import type { TennoFrameBridgeApi } from '@shared/ipc-channels'

function getBridge(): TennoFrameBridgeApi {
  if (typeof window === 'undefined' || !window.tennoframeApi) {
    throw new Error('Pont IPC preload indisponible (window.tennoframeApi manquant).')
  }
  return window.tennoframeApi
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
    async setClickThrough(enabled: boolean): Promise<WindowState> {
      return WindowStateSchema.parse(await getBridge().window.setClickThrough(enabled))
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
      return z.array(MarketCatalogItemSchema).parse(await getBridge().market.getCatalog(forceRefresh))
    },
    async getItemDetail(slug: string): Promise<MarketItemDetail> {
      return MarketItemDetailSchema.parse(await getBridge().market.getItemDetail(slug))
    },
    async getItemOrders(slug: string, forceRefresh?: boolean): Promise<MarketOrder[]> {
      return z.array(MarketOrderSchema).parse(await getBridge().market.getItemOrders(slug, forceRefresh))
    },
    async analyzeSetVsParts(slug: string, forceRefresh?: boolean): Promise<SetVsPartsAnalysis> {
      return SetVsPartsAnalysisSchema.parse(await getBridge().market.analyzeSetVsParts(slug, forceRefresh))
    },
    async getItemStats(slug: string): Promise<MarketItemStats> {
      return MarketItemStatsSchema.parse(await getBridge().market.getItemStats(slug))
    },
    async getRecentOrders(forceRefresh?: boolean): Promise<MarketOrder[]> {
      return z.array(MarketOrderSchema).parse(await getBridge().market.getRecentOrders(forceRefresh))
    },
    async getUserProfile(userSlug: string): Promise<MarketUserProfile> {
      return MarketUserProfileSchema.parse(await getBridge().market.getUserProfile(userSlug))
    },
    async searchFacetedOrders(input: MarketFacetedSearchInput): Promise<MarketFacetedSearchResult> {
      const bridge = getBridge()
      if (typeof bridge.market?.searchFacetedOrders !== 'function') {
        throw new Error(
          'Pont Electron mis à jour : ferme TennoFrame (Ctrl+C) et relance "npm run dev" pour activer la recherche à pastilles.'
        )
      }
      return MarketFacetedSearchResultSchema.parse(await bridge.market.searchFacetedOrders(input))
    }
  },
  wfmAccount: {
    async getSession(): Promise<WfmSessionState> {
      const bridge = getBridge()
      if (!bridge.wfmAccount) {
        throw new Error('Relance npm.cmd run dev pour activer le compte Warframe Market.')
      }
      return WfmSessionStateSchema.parse(await bridge.wfmAccount.getSession())
    },
    async signInCredentials(input: WfmSignInCredentialsInput): Promise<WfmSessionState> {
      const bridge = getBridge()
      if (!bridge.wfmAccount) {
        throw new Error('Relance npm.cmd run dev pour activer le compte Warframe Market.')
      }
      return WfmSessionStateSchema.parse(await bridge.wfmAccount.signInCredentials(input))
    },
    async signInWeb(input: WfmSignInWebInput): Promise<WfmSessionState> {
      const bridge = getBridge()
      if (typeof bridge.wfmAccount?.signInWeb !== 'function') {
        throw new Error(
          'Pont Electron mis à jour : ferme TennoFrame (Ctrl+C dans le terminal) et relance "npm run dev" pour activer la connexion Web.'
        )
      }
      return WfmSessionStateSchema.parse(await bridge.wfmAccount.signInWeb(input))
    },
    async signInToken(input: WfmSignInTokenInput): Promise<WfmSessionState> {
      const bridge = getBridge()
      if (!bridge.wfmAccount) {
        throw new Error('Relance npm.cmd run dev pour activer le compte Warframe Market.')
      }
      return WfmSessionStateSchema.parse(await bridge.wfmAccount.signInToken(input))
    },
    async signOut(): Promise<WfmSessionState> {
      const bridge = getBridge()
      if (!bridge.wfmAccount) {
        throw new Error('Relance npm.cmd run dev pour activer le compte Warframe Market.')
      }
      return WfmSessionStateSchema.parse(await bridge.wfmAccount.signOut())
    },
    async setStatus(status: WfmPresenceStatus): Promise<WfmSessionState> {
      const bridge = getBridge()
      if (!bridge.wfmAccount) {
        throw new Error('Relance npm.cmd run dev pour activer le compte Warframe Market.')
      }
      return WfmSessionStateSchema.parse(await bridge.wfmAccount.setStatus(status))
    },
    async getOverview(forceRefresh?: boolean): Promise<WfmAccountOverview> {
      const bridge = getBridge()
      if (!bridge.wfmAccount) {
        throw new Error('Relance npm.cmd run dev pour activer le compte Warframe Market.')
      }
      return WfmAccountOverviewSchema.parse(await bridge.wfmAccount.getOverview(forceRefresh))
    },
    async createOrder(input: CreateWfmOrderInput): Promise<WfmOwnOrder> {
      const bridge = getBridge()
      if (!bridge.wfmAccount) {
        throw new Error('Relance npm.cmd run dev pour activer le compte Warframe Market.')
      }
      return WfmOwnOrderSchema.parse(await bridge.wfmAccount.createOrder(input))
    },
    async updateOrder(input: UpdateWfmOrderInput): Promise<WfmOwnOrder> {
      const bridge = getBridge()
      if (!bridge.wfmAccount) {
        throw new Error('Relance npm.cmd run dev pour activer le compte Warframe Market.')
      }
      return WfmOwnOrderSchema.parse(await bridge.wfmAccount.updateOrder(input))
    },
    async closeOrderUnit(
      input: CloseWfmOrderUnitInput
    ): Promise<{ closed: boolean; remainingQuantity: number }> {
      const bridge = getBridge()
      if (!bridge.wfmAccount) {
        throw new Error('Relance npm.cmd run dev pour activer le compte Warframe Market.')
      }
      return z
        .object({ closed: z.boolean(), remainingQuantity: z.number().int().nonnegative() })
        .parse(await bridge.wfmAccount.closeOrderUnit(input))
    },
    async deleteOrder(orderId: string): Promise<boolean> {
      const bridge = getBridge()
      if (!bridge.wfmAccount) {
        throw new Error('Relance npm.cmd run dev pour activer le compte Warframe Market.')
      }
      return z.boolean().parse(await bridge.wfmAccount.deleteOrder(orderId))
    },
    onSessionChanged(listener: (session: WfmSessionState) => void): () => void {
      const bridge = getBridge()
      if (!bridge.wfmAccount?.onSessionChanged) return () => undefined
      return bridge.wfmAccount.onSessionChanged((raw) => {
        const parsed = WfmSessionStateSchema.safeParse(raw)
        if (parsed.success) listener(parsed.data)
      })
    }
  },
  tools: {
    async analyzeCartBundles(forceRefresh?: boolean): Promise<CartBundleAnalysis> {
      const bridge = getBridge()
      if (!bridge.tools) throw new Error('Relance npm.cmd run dev pour activer le Trade Bundler.')
      return CartBundleAnalysisSchema.parse(await bridge.tools.analyzeCartBundles(forceRefresh))
    },
    async getDucats(forceRefresh?: boolean): Promise<DucatItemEntry[]> {
      const bridge = getBridge()
      if (!bridge.tools) throw new Error('Relance npm.cmd run dev pour activer le Ducanator.')
      return z.array(DucatItemEntrySchema).parse(await bridge.tools.getDucats(forceRefresh))
    },
    async getRivenWeapons(): Promise<RivenWeaponSummary[]> {
      const bridge = getBridge()
      if (!bridge.tools) throw new Error('Relance npm.cmd run dev pour activer les Rivens.')
      return z.array(RivenWeaponSummarySchema).parse(await bridge.tools.getRivenWeapons())
    },
    async searchRivens(params: RivenSearchParams): Promise<RivenAuctionCard[]> {
      const bridge = getBridge()
      if (!bridge.tools) throw new Error('Relance npm.cmd run dev pour activer les Rivens.')
      return z.array(RivenAuctionCardSchema).parse(await bridge.tools.searchRivens(params))
    }
  },
  alerts: {
    async scanNow(): Promise<TriggeredAlertEvent[]> {
      const bridge = getBridge()
      if (!bridge.alerts) throw new Error('Relance npm.cmd run dev pour activer le Price Sniper.')
      return z.array(TriggeredAlertEventSchema).parse(await bridge.alerts.scanNow())
    },
    onTriggered(listener: (alert: TriggeredAlertEvent) => void): () => void {
      const bridge = getBridge()
      if (!bridge.alerts?.onTriggered) return () => undefined
      return bridge.alerts.onTriggered((rawAlert) => {
        const parsed = TriggeredAlertEventSchema.safeParse(rawAlert)
        if (parsed.success) listener(parsed.data)
      })
    },
    async previewWorldRule(rule: WorldAlertRuleInput): Promise<WorldRulePreviewResult> {
      const bridge = getBridge()
      if (!bridge.alerts?.previewWorldRule) {
        throw new Error('Relance npm.cmd run dev pour activer les règles Worldstate.')
      }
      return WorldRulePreviewResultSchema.parse(await bridge.alerts.previewWorldRule(rule))
    },
    async getHistory(): Promise<TriggeredAlertEvent[]> {
      const bridge = getBridge()
      if (!bridge.alerts?.getHistory) return []
      return z.array(TriggeredAlertEventSchema).parse(await bridge.alerts.getHistory())
    },
    async clearHistory(): Promise<void> {
      const bridge = getBridge()
      if (!bridge.alerts?.clearHistory) return
      await bridge.alerts.clearHistory()
    }
  },
  worldstate: {
    async getCurrent(forceRefresh?: boolean): Promise<WorldstateHubPayload> {
      const bridge = getBridge()
      if (!bridge.worldstate) {
        throw new Error('Relance npm.cmd run dev pour activer le Hub Worldstate.')
      }
      return WorldstateHubPayloadSchema.parse(await bridge.worldstate.getCurrent(forceRefresh))
    },
    async getBaroWithPrices(forceRefresh?: boolean): Promise<VoidTraderSnapshot> {
      const bridge = getBridge()
      if (!bridge.worldstate) {
        throw new Error('Relance npm.cmd run dev pour activer le Hub Worldstate.')
      }
      return VoidTraderSnapshotSchema.parse(
        await bridge.worldstate.getBaroWithPrices(forceRefresh)
      )
    },
    async getVitusWithPrices(forceRefresh?: boolean): Promise<VitusModPriceEntry[]> {
      const bridge = getBridge()
      if (!bridge.worldstate) {
        throw new Error('Relance npm.cmd run dev pour activer le Hub Worldstate.')
      }
      return z
        .array(VitusModPriceEntrySchema)
        .parse(await bridge.worldstate.getVitusWithPrices(forceRefresh))
    }
  },
  codex: {
    async search(
      params: Partial<CodexSearchParams> & { category: CodexCategory }
    ): Promise<CodexSearchResult> {
      const bridge = getBridge()
      if (!bridge.codex) {
        throw new Error('Relance npm.cmd run dev pour activer le Codex & Helminth.')
      }
      return CodexSearchResultSchema.parse(await bridge.codex.search(params))
    },
    async quickSearch(query: string, limit?: number): Promise<CodexSummaryCard[]> {
      const bridge = getBridge()
      if (!bridge.codex) return []
      return z.array(CodexSummaryCardSchema).parse(await bridge.codex.quickSearch(query, limit))
    },
    async getItemDetail(category: CodexCategory, id: string): Promise<CodexItemDetail> {
      const bridge = getBridge()
      if (!bridge.codex) {
        throw new Error('Relance npm.cmd run dev pour activer le Codex & Helminth.')
      }
      return CodexItemDetailSchema.parse(await bridge.codex.getItemDetail(category, id))
    },
    async getHelminth(): Promise<HelminthOverview> {
      const bridge = getBridge()
      if (!bridge.codex) {
        throw new Error('Relance npm.cmd run dev pour activer l’Infirmerie Helminth.')
      }
      return HelminthOverviewSchema.parse(await bridge.codex.getHelminth())
    }
  },
  overlay: {
    async getState(): Promise<FarmOverlayLiveState> {
      const bridge = getBridge()
      return FarmOverlayLiveStateSchema.parse(await bridge.overlay.getState())
    },
    async setWindowOpen(open: boolean): Promise<FarmOverlayLiveState> {
      const bridge = getBridge()
      return FarmOverlayLiveStateSchema.parse(await bridge.overlay.setWindowOpen(open))
    },
    async updateState(patch: CodexFarmOverlayPatch): Promise<FarmOverlayLiveState> {
      const bridge = getBridge()
      return FarmOverlayLiveStateSchema.parse(await bridge.overlay.updateState(patch))
    },
    async setClickThrough(enabled: boolean): Promise<FarmOverlayLiveState> {
      const bridge = getBridge()
      return FarmOverlayLiveStateSchema.parse(await bridge.overlay.setClickThrough(enabled))
    },
    onStateChanged(listener: (state: FarmOverlayLiveState) => void): () => void {
      const bridge = getBridge()
      if (!bridge.overlay?.onStateChanged) return () => undefined
      return bridge.overlay.onStateChanged((raw) => {
        const parsed = FarmOverlayLiveStateSchema.safeParse(raw)
        if (parsed.success) listener(parsed.data)
      })
    }
  },
  updater: {
    async getStatus(): Promise<UpdaterStatus> {
      const bridge = getBridge()
      if (!bridge.updater) {
        throw new Error('Relance npm.cmd run dev pour activer l’Auto-Updater.')
      }
      return UpdaterStatusSchema.parse(await bridge.updater.getStatus())
    },
    async check(): Promise<UpdaterStatus> {
      const bridge = getBridge()
      if (!bridge.updater) {
        throw new Error('Relance npm.cmd run dev pour activer l’Auto-Updater.')
      }
      return UpdaterStatusSchema.parse(await bridge.updater.check())
    },
    async downloadAndInstall(): Promise<UpdaterStatus> {
      const bridge = getBridge()
      if (!bridge.updater) {
        throw new Error('Relance npm.cmd run dev pour activer l’Auto-Updater.')
      }
      return UpdaterStatusSchema.parse(await bridge.updater.downloadAndInstall())
    },
    onStatus(listener: (status: UpdaterStatus) => void): () => void {
      const bridge = getBridge()
      if (!bridge.updater?.onStatus) return () => undefined
      return bridge.updater.onStatus((raw) => {
        const parsed = UpdaterStatusSchema.safeParse(raw)
        if (parsed.success) listener(parsed.data)
      })
    }
  }
} as const
