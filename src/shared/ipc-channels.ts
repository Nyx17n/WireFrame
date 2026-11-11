import type { UserSettings, UserSettingsPatch } from './schemas/settings.schema'
import type { SystemStatus } from './schemas/system.schema'
import type { WindowState } from './schemas/window.schema'

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
  CLIPBOARD_WRITE_TEXT: 'clipboard:writeText'
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
}

