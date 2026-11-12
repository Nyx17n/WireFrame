import type { TriggeredAlertEvent } from './schemas/alerts.schema'
import type {
  CodexCategory,
  CodexItemDetail,
  CodexSearchParams,
  CodexSearchResult,
  CodexSummaryCard,
  HelminthOverview
} from './schemas/codex.schema'
import type {
  MarketCatalogItem,
  MarketItemDetail,
  MarketItemStats,
  MarketOrder,
  MarketUserProfile,
  SetVsPartsAnalysis
} from './schemas/market.schema'
import type { UserSettings, UserSettingsPatch } from './schemas/settings.schema'
import type { SystemStatus } from './schemas/system.schema'
import type {
  CartBundleAnalysis,
  DucatItemEntry,
  RivenAuctionCard,
  RivenSearchParams,
  RivenWeaponSummary
} from './schemas/tools.schema'
import type { UpdaterStatus } from './schemas/updater.schema'
import type { WindowState } from './schemas/window.schema'
import type { WorldAlertRuleInput, WorldRulePreviewResult } from './schemas/world-rules.schema'
import type {
  VoidTraderSnapshot,
  VitusModPriceEntry,
  WorldstateHubPayload
} from './schemas/worldstate.schema'

export const IPC_CHANNELS = {
  SYSTEM_GET_STATUS: 'system:getStatus',
  SYSTEM_CLEAR_CACHE: 'system:clearCache',
  SETTINGS_GET: 'settings:get',
  SETTINGS_UPDATE: 'settings:update',
  SETTINGS_RESET: 'settings:reset',
  SETTINGS_EXPORT_JSON: 'settings:exportJson',
  SETTINGS_IMPORT_JSON: 'settings:importJson',
  WINDOW_GET_STATE: 'window:getState',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_TOGGLE_MAXIMIZE: 'window:toggleMaximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_SET_ALWAYS_ON_TOP: 'window:setAlwaysOnTop',
  WINDOW_SET_COMPACT_MODE: 'window:setCompactMode',
  WINDOW_SET_ZOOM: 'window:setZoom',
  WINDOW_OPEN_EXTERNAL: 'window:openExternalUrl',
  WINDOW_ON_STATE_CHANGED: 'window:onStateChanged',
  CLIPBOARD_WRITE_TEXT: 'clipboard:writeText',
  MARKET_GET_CATALOG: 'market:getCatalog',
  MARKET_GET_ITEM_DETAIL: 'market:getItemDetail',
  MARKET_GET_ITEM_ORDERS: 'market:getItemOrders',
  MARKET_ANALYZE_SET: 'market:analyzeSetVsParts',
  MARKET_GET_ITEM_STATS: 'market:getItemStats',
  MARKET_GET_RECENT_ORDERS: 'market:getRecentOrders',
  MARKET_GET_USER_PROFILE: 'market:getUserProfile',
  TOOLS_ANALYZE_CART: 'tools:analyzeCartBundles',
  TOOLS_GET_DUCATS: 'tools:getDucats',
  TOOLS_GET_RIVEN_WEAPONS: 'tools:getRivenWeapons',
  TOOLS_SEARCH_RIVENS: 'tools:searchRivens',
  ALERTS_SCAN_NOW: 'alerts:scanNow',
  ALERTS_ON_TRIGGERED: 'alerts:onTriggered',
  ALERTS_PREVIEW_WORLD_RULE: 'alerts:previewWorldRule',
  ALERTS_GET_HISTORY: 'alerts:getHistory',
  ALERTS_CLEAR_HISTORY: 'alerts:clearHistory',
  WORLDSTATE_GET_CURRENT: 'worldstate:getCurrent',
  WORLDSTATE_GET_BARO_PRICES: 'worldstate:getBaroWithPrices',
  WORLDSTATE_GET_VITUS_PRICES: 'worldstate:getVitusWithPrices',
  CODEX_SEARCH: 'codex:search',
  CODEX_QUICK_SEARCH: 'codex:quickSearch',
  CODEX_GET_ITEM_DETAIL: 'codex:getItemDetail',
  CODEX_GET_HELMINTH: 'codex:getHelminth',
  UPDATER_GET_STATUS: 'updater:getStatus',
  UPDATER_CHECK: 'updater:check',
  UPDATER_INSTALL: 'updater:downloadAndInstall',
  UPDATER_ON_STATUS: 'updater:onStatus'
} as const

export interface WireframeBridgeApi {
  readonly system: {
    getStatus: () => Promise<SystemStatus>
    clearCache: () => Promise<SystemStatus>
  }
  readonly settings: {
    get: () => Promise<UserSettings>
    update: (patch: UserSettingsPatch) => Promise<UserSettings>
    reset: () => Promise<UserSettings>
    exportJson: () => Promise<boolean>
    importJson: () => Promise<UserSettings | null>
  }
  readonly window: {
    getState: () => Promise<WindowState>
    minimize: () => Promise<void>
    toggleMaximize: () => Promise<WindowState>
    close: () => Promise<void>
    setAlwaysOnTop: (enabled: boolean) => Promise<WindowState>
    setCompactMode: (enabled: boolean) => Promise<WindowState>
    setZoom: (zoomPercent: number) => Promise<WindowState>
    openExternalUrl: (url: string) => Promise<boolean>
    onStateChanged: (listener: (state: WindowState) => void) => () => void
  }
  readonly clipboard: {
    writeText: (text: string) => Promise<void>
  }
  readonly market: {
    getCatalog: (forceRefresh?: boolean) => Promise<MarketCatalogItem[]>
    getItemDetail: (slug: string) => Promise<MarketItemDetail>
    getItemOrders: (slug: string, forceRefresh?: boolean) => Promise<MarketOrder[]>
    analyzeSetVsParts: (slug: string, forceRefresh?: boolean) => Promise<SetVsPartsAnalysis>
    getItemStats: (slug: string) => Promise<MarketItemStats>
    getRecentOrders: (forceRefresh?: boolean) => Promise<MarketOrder[]>
    getUserProfile: (userSlug: string) => Promise<MarketUserProfile>
  }
  readonly tools: {
    analyzeCartBundles: (forceRefresh?: boolean) => Promise<CartBundleAnalysis>
    getDucats: (forceRefresh?: boolean) => Promise<DucatItemEntry[]>
    getRivenWeapons: () => Promise<RivenWeaponSummary[]>
    searchRivens: (params: RivenSearchParams) => Promise<RivenAuctionCard[]>
  }
  readonly alerts: {
    scanNow: () => Promise<TriggeredAlertEvent[]>
    onTriggered: (listener: (alert: TriggeredAlertEvent) => void) => () => void
    previewWorldRule: (rule: WorldAlertRuleInput) => Promise<WorldRulePreviewResult>
    getHistory: () => Promise<TriggeredAlertEvent[]>
    clearHistory: () => Promise<void>
  }
  readonly worldstate: {
    getCurrent: (forceRefresh?: boolean) => Promise<WorldstateHubPayload>
    getBaroWithPrices: (forceRefresh?: boolean) => Promise<VoidTraderSnapshot>
    getVitusWithPrices: (forceRefresh?: boolean) => Promise<VitusModPriceEntry[]>
  }
  readonly codex: {
    search: (params: Partial<CodexSearchParams> & { category: CodexCategory }) => Promise<CodexSearchResult>
    quickSearch: (query: string, limit?: number) => Promise<CodexSummaryCard[]>
    getItemDetail: (category: CodexCategory, id: string) => Promise<CodexItemDetail>
    getHelminth: () => Promise<HelminthOverview>
  }
  readonly updater: {
    getStatus: () => Promise<UpdaterStatus>
    check: () => Promise<UpdaterStatus>
    downloadAndInstall: () => Promise<UpdaterStatus>
    onStatus: (listener: (status: UpdaterStatus) => void) => () => void
  }
}
