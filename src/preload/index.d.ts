import type { TennoFrameBridgeApi } from '@shared/ipc-channels'

declare global {
  interface Window {
    readonly tennoframeApi: TennoFrameBridgeApi
  }
}

