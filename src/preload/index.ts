import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { IPC_CHANNELS, type WireframeBridgeApi } from '@shared/ipc-channels'
import type { UserSettingsPatch } from '@shared/schemas/settings.schema'
import type { WindowState } from '@shared/schemas/window.schema'

const wireframeApi: WireframeBridgeApi = Object.freeze({
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
    getUserProfile: (userSlug: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.MARKET_GET_USER_PROFILE, { slug: userSlug })
  })
})

contextBridge.exposeInMainWorld('wireframeApi', wireframeApi)
