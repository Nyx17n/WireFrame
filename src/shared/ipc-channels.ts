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
  CodexFarmOverlayPatch,
  FarmOverlayLiveState
} from './schemas/extensions.schema'
import type {
  MarketCatalogItem,
  MarketItemDetail,
  MarketItemStats,
  MarketOrder,
  MarketUserProfile,
  SetVsPartsAnalysis
} from './schemas/market.schema'
import type {
  MarketFacetedSearchInput,
  MarketFacetedSearchResult
} from './schemas/market-search.schema'
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
import type {
  CloseWfmOrderUnitInput,
  CreateWfmOrderInput,
  UpdateWfmOrderInput,
  WfmAccountOverview,
  WfmOwnOrder,
  WfmPresenceStatus,
  WfmSessionState,
  WfmSignInCredentialsInput,
  WfmSignInTokenInput,
  WfmSignInWebInput
} from './schemas/wfm-account.schema'

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
  WINDOW_SET_CLICK_THROUGH: 'window:setClickThrough',
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
  MARKET_SEARCH_FACETED_ORDERS: 'market:searchFacetedOrders',
  WFM_ACCOUNT_GET_SESSION: 'wfmAccount:getSession',
  WFM_ACCOUNT_SIGN_IN_CREDENTIALS: 'wfmAccount:signInCredentials',
  WFM_ACCOUNT_SIGN_IN_WEB: 'wfmAccount:signInWeb',
  WFM_ACCOUNT_SIGN_IN_TOKEN: 'wfmAccount:signInToken',
  WFM_ACCOUNT_SIGN_OUT: 'wfmAccount:signOut',
  WFM_ACCOUNT_SET_STATUS: 'wfmAccount:setStatus',
  WFM_ACCOUNT_GET_OVERVIEW: 'wfmAccount:getOverview',
  WFM_ACCOUNT_CREATE_ORDER: 'wfmAccount:createOrder',
  WFM_ACCOUNT_UPDATE_ORDER: 'wfmAccount:updateOrder',
  WFM_ACCOUNT_CLOSE_ORDER_UNIT: 'wfmAccount:closeOrderUnit',
  WFM_ACCOUNT_DELETE_ORDER: 'wfmAccount:deleteOrder',
  WFM_ACCOUNT_ON_SESSION_CHANGED: 'wfmAccount:onSessionChanged',
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
  OVERLAY_GET_STATE: 'overlay:getState',
  OVERLAY_SET_WINDOW_OPEN: 'overlay:setWindowOpen',
  OVERLAY_UPDATE_STATE: 'overlay:updateState',
  OVERLAY_SET_CLICK_THROUGH: 'overlay:setClickThrough',
  OVERLAY_ON_STATE_CHANGED: 'overlay:onStateChanged',
  UPDATER_GET_STATUS: 'updater:getStatus',
  UPDATER_CHECK: 'updater:check',
  UPDATER_INSTALL: 'updater:downloadAndInstall',
  UPDATER_ON_STATUS: 'updater:onStatus'
} as const

export interface TennoFrameBridgeApi {
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
    setClickThrough: (enabled: boolean) => Promise<WindowState>
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
    searchFacetedOrders: (input: MarketFacetedSearchInput) => Promise<MarketFacetedSearchResult>
  }
  readonly wfmAccount: {
    getSession: () => Promise<WfmSessionState>
    signInCredentials: (input: WfmSignInCredentialsInput) => Promise<WfmSessionState>
    signInWeb: (input: WfmSignInWebInput) => Promise<WfmSessionState>
    signInToken: (input: WfmSignInTokenInput) => Promise<WfmSessionState>
    signOut: () => Promise<WfmSessionState>
    setStatus: (status: WfmPresenceStatus) => Promise<WfmSessionState>
    getOverview: (forceRefresh?: boolean) => Promise<WfmAccountOverview>
    createOrder: (input: CreateWfmOrderInput) => Promise<WfmOwnOrder>
    updateOrder: (input: UpdateWfmOrderInput) => Promise<WfmOwnOrder>
    closeOrderUnit: (input: CloseWfmOrderUnitInput) => Promise<{ closed: boolean; remainingQuantity: number }>
    deleteOrder: (orderId: string) => Promise<boolean>
    onSessionChanged: (listener: (session: WfmSessionState) => void) => () => void
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
  readonly overlay: {
    getState: () => Promise<FarmOverlayLiveState>
    setWindowOpen: (open: boolean) => Promise<FarmOverlayLiveState>
    updateState: (patch: CodexFarmOverlayPatch) => Promise<FarmOverlayLiveState>
    setClickThrough: (enabled: boolean) => Promise<FarmOverlayLiveState>
    onStateChanged: (listener: (state: FarmOverlayLiveState) => void) => () => void
  }
  readonly updater: {
    getStatus: () => Promise<UpdaterStatus>
    check: () => Promise<UpdaterStatus>
    downloadAndInstall: () => Promise<UpdaterStatus>
    onStatus: (listener: (status: UpdaterStatus) => void) => () => void
  }
}
