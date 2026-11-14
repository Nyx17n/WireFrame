import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { IPC_CHANNELS, type TennoFrameBridgeApi } from '@shared/ipc-channels'
import type { TriggeredAlertEvent } from '@shared/schemas/alerts.schema'
import type { CodexCategory, CodexSearchParams } from '@shared/schemas/codex.schema'
import type {
  CodexFarmOverlayPatch,
  FarmOverlayLiveState
} from '@shared/schemas/extensions.schema'
import type { MarketFacetedSearchInput } from '@shared/schemas/market-search.schema'
import type { UserSettingsPatch } from '@shared/schemas/settings.schema'
import type { RivenSearchParams } from '@shared/schemas/tools.schema'
import type { UpdaterStatus } from '@shared/schemas/updater.schema'
import type {
  CloseWfmOrderUnitInput,
  CreateWfmOrderInput,
  UpdateWfmOrderInput,
  WfmPresenceStatus,
  WfmSessionState,
  WfmSignInCredentialsInput,
  WfmSignInTokenInput,
  WfmSignInWebInput
} from '@shared/schemas/wfm-account.schema'
import type { WindowState } from '@shared/schemas/window.schema'
import type { WorldAlertRuleInput } from '@shared/schemas/world-rules.schema'

const tennoframeApi: TennoFrameBridgeApi = Object.freeze({
  system: Object.freeze({
    getStatus: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_STATUS),
    clearCache: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_CLEAR_CACHE)
  }),
  settings: Object.freeze({
    get: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
    update: (patch: UserSettingsPatch) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPDATE, patch),
    reset: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_RESET),
    exportJson: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_EXPORT_JSON),
    importJson: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_IMPORT_JSON)
  }),
  window: Object.freeze({
    getState: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_GET_STATE),
    minimize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
    toggleMaximize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_TOGGLE_MAXIMIZE),
    close: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
    setAlwaysOnTop: (enabled: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.WINDOW_SET_ALWAYS_ON_TOP, { enabled }),
    setCompactMode: (enabled: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.WINDOW_SET_COMPACT_MODE, { enabled }),
    setClickThrough: (enabled: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.WINDOW_SET_CLICK_THROUGH, { enabled }),
    setZoom: (zoomPercent: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.WINDOW_SET_ZOOM, { zoomPercent }),
    openExternalUrl: (url: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.WINDOW_OPEN_EXTERNAL, { url }),
    onStateChanged: (listener: (state: WindowState) => void) => {
      const wrapped = (_event: IpcRendererEvent, state: WindowState): void => {
        listener(state)
      }
      ipcRenderer.on(IPC_CHANNELS.WINDOW_ON_STATE_CHANGED, wrapped)
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.WINDOW_ON_STATE_CHANGED, wrapped)
      }
    }
  }),
  clipboard: Object.freeze({
    writeText: (text: string) => ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_WRITE_TEXT, { text })
  }),
  market: Object.freeze({
    getCatalog: (forceRefresh?: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.MARKET_GET_CATALOG, { forceRefresh }),
    getItemDetail: (slug: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.MARKET_GET_ITEM_DETAIL, { slug }),
    getItemOrders: (slug: string, forceRefresh?: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.MARKET_GET_ITEM_ORDERS, { slug, forceRefresh }),
    analyzeSetVsParts: (slug: string, forceRefresh?: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.MARKET_ANALYZE_SET, { slug, forceRefresh }),
    getItemStats: (slug: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.MARKET_GET_ITEM_STATS, { slug }),
    getRecentOrders: (forceRefresh?: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.MARKET_GET_RECENT_ORDERS, { forceRefresh }),
    getUserProfile: (userSlug: string, forceRefresh?: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.MARKET_GET_USER_PROFILE, { slug: userSlug, forceRefresh }),
    searchFacetedOrders: (input: MarketFacetedSearchInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.MARKET_SEARCH_FACETED_ORDERS, input)
  }),
  wfmAccount: Object.freeze({
    getSession: () => ipcRenderer.invoke(IPC_CHANNELS.WFM_ACCOUNT_GET_SESSION),
    signInCredentials: (input: WfmSignInCredentialsInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.WFM_ACCOUNT_SIGN_IN_CREDENTIALS, input),
    signInWeb: (input: WfmSignInWebInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.WFM_ACCOUNT_SIGN_IN_WEB, input),
    signInToken: (input: WfmSignInTokenInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.WFM_ACCOUNT_SIGN_IN_TOKEN, input),
    signOut: () => ipcRenderer.invoke(IPC_CHANNELS.WFM_ACCOUNT_SIGN_OUT),
    setStatus: (status: WfmPresenceStatus) =>
      ipcRenderer.invoke(IPC_CHANNELS.WFM_ACCOUNT_SET_STATUS, { status }),
    getOverview: (forceRefresh?: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.WFM_ACCOUNT_GET_OVERVIEW, { forceRefresh }),
    createOrder: (input: CreateWfmOrderInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.WFM_ACCOUNT_CREATE_ORDER, input),
    updateOrder: (input: UpdateWfmOrderInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.WFM_ACCOUNT_UPDATE_ORDER, input),
    closeOrderUnit: (input: CloseWfmOrderUnitInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.WFM_ACCOUNT_CLOSE_ORDER_UNIT, input),
    deleteOrder: (orderId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.WFM_ACCOUNT_DELETE_ORDER, { orderId }),
    onSessionChanged: (listener: (session: WfmSessionState) => void) => {
      const wrapped = (_event: IpcRendererEvent, sessionState: WfmSessionState): void => {
        listener(sessionState)
      }
      ipcRenderer.on(IPC_CHANNELS.WFM_ACCOUNT_ON_SESSION_CHANGED, wrapped)
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.WFM_ACCOUNT_ON_SESSION_CHANGED, wrapped)
      }
    }
  }),
  tools: Object.freeze({
    analyzeCartBundles: (forceRefresh?: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.TOOLS_ANALYZE_CART, { forceRefresh }),
    getDucats: (forceRefresh?: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.TOOLS_GET_DUCATS, { forceRefresh }),
    getRivenWeapons: () => ipcRenderer.invoke(IPC_CHANNELS.TOOLS_GET_RIVEN_WEAPONS),
    searchRivens: (params: RivenSearchParams) =>
      ipcRenderer.invoke(IPC_CHANNELS.TOOLS_SEARCH_RIVENS, params)
  }),
  alerts: Object.freeze({
    scanNow: () => ipcRenderer.invoke(IPC_CHANNELS.ALERTS_SCAN_NOW),
    previewWorldRule: (rule: WorldAlertRuleInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.ALERTS_PREVIEW_WORLD_RULE, rule),
    getHistory: () => ipcRenderer.invoke(IPC_CHANNELS.ALERTS_GET_HISTORY),
    clearHistory: () => ipcRenderer.invoke(IPC_CHANNELS.ALERTS_CLEAR_HISTORY),
    onTriggered: (listener: (alert: TriggeredAlertEvent) => void) => {
      const wrapped = (_event: IpcRendererEvent, alert: TriggeredAlertEvent): void => {
        listener(alert)
      }
      ipcRenderer.on(IPC_CHANNELS.ALERTS_ON_TRIGGERED, wrapped)
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.ALERTS_ON_TRIGGERED, wrapped)
      }
    }
  }),
  worldstate: Object.freeze({
    getCurrent: (forceRefresh?: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.WORLDSTATE_GET_CURRENT, { forceRefresh }),
    getBaroWithPrices: (forceRefresh?: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.WORLDSTATE_GET_BARO_PRICES, { forceRefresh }),
    getVitusWithPrices: (forceRefresh?: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.WORLDSTATE_GET_VITUS_PRICES, { forceRefresh })
  }),
  codex: Object.freeze({
    search: (params: Partial<CodexSearchParams> & { category: CodexCategory }) =>
      ipcRenderer.invoke(IPC_CHANNELS.CODEX_SEARCH, params),
    quickSearch: (query: string, limit?: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.CODEX_QUICK_SEARCH, { query, limit }),
    getItemDetail: (category: CodexCategory, id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.CODEX_GET_ITEM_DETAIL, { category, id }),
    getHelminth: () => ipcRenderer.invoke(IPC_CHANNELS.CODEX_GET_HELMINTH)
  }),
  overlay: Object.freeze({
    getState: () => ipcRenderer.invoke(IPC_CHANNELS.OVERLAY_GET_STATE),
    setWindowOpen: (open: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.OVERLAY_SET_WINDOW_OPEN, { open }),
    updateState: (patch: CodexFarmOverlayPatch) =>
      ipcRenderer.invoke(IPC_CHANNELS.OVERLAY_UPDATE_STATE, patch),
    setClickThrough: (enabled: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.OVERLAY_SET_CLICK_THROUGH, { enabled }),
    onStateChanged: (listener: (state: FarmOverlayLiveState) => void) => {
      const wrapped = (_event: IpcRendererEvent, state: FarmOverlayLiveState): void => {
        listener(state)
      }
      ipcRenderer.on(IPC_CHANNELS.OVERLAY_ON_STATE_CHANGED, wrapped)
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.OVERLAY_ON_STATE_CHANGED, wrapped)
      }
    }
  }),
  updater: Object.freeze({
    getStatus: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATER_GET_STATUS),
    check: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATER_CHECK),
    downloadAndInstall: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATER_INSTALL),
    onStatus: (listener: (status: UpdaterStatus) => void) => {
      const wrapped = (_event: IpcRendererEvent, status: UpdaterStatus): void => {
        listener(status)
      }
      ipcRenderer.on(IPC_CHANNELS.UPDATER_ON_STATUS, wrapped)
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.UPDATER_ON_STATUS, wrapped)
      }
    }
  })
})

contextBridge.exposeInMainWorld('tennoframeApi', tennoframeApi)
