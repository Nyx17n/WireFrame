import type { WireframeBridgeApi } from '@shared/ipc-channels'

declare global {
  interface Window {
    readonly wireframeApi: WireframeBridgeApi
  }
}

