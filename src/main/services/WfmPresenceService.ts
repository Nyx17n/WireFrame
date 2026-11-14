import type { WfmPresenceStatus } from '@shared/schemas/wfm-account.schema'

const WFM_WS_URL = 'wss://ws.warframe.market/socket'

/**
 * Maintains the optional Warframe Market realtime WebSocket connection (`wfm` subprotocol)
 * strictly inside the Main Process so the user's JWT never leaves Node.js.
 * Connects only when authenticated AND desired status is `ingame` or `online`.
 */
export class WfmPresenceService {
  private socket: WebSocket | null = null
  private desiredStatus: WfmPresenceStatus = 'invisible'
  private jwtToken: string | null = null
  private wsAuthenticated = false
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private disposed = false
  private readonly onConnectionChanged?: () => void

  constructor(onConnectionChanged?: () => void) {
    this.onConnectionChanged = onConnectionChanged
  }

  public getStatus(): WfmPresenceStatus {
    return this.desiredStatus
  }

  public isSocketConnected(): boolean {
    return this.wsAuthenticated && this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }

  public syncPresence(jwtToken: string | null, status: WfmPresenceStatus): void {
    this.jwtToken = jwtToken
    this.desiredStatus = status

    if (!jwtToken || status === 'invisible' || this.disposed) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN && jwtToken) {
        this.sendWsCommand('@wfm|cmd/status/set', { status: 'invisible' })
      }
      this.closeSocket()
      return
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      if (this.wsAuthenticated) {
        this.sendWsCommand('@wfm|cmd/status/set', { status: this.desiredStatus })
      }
      return
    }

    if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
      return
    }

    this.openSocket()
  }

  public dispose(): void {
    this.disposed = true
    this.jwtToken = null
    this.closeSocket()
  }

  private openSocket(): void {
    this.clearReconnectTimer()
    if (typeof WebSocket === 'undefined' || !this.jwtToken || this.disposed) {
      return
    }

    try {
      const ws = new WebSocket(WFM_WS_URL, 'wfm')
      this.socket = ws
      this.wsAuthenticated = false

      ws.addEventListener('open', () => {
        if (this.socket !== ws || !this.jwtToken) return
        this.reconnectAttempts = 0
        this.sendWsCommand('@wfm|cmd/auth/signIn', { token: this.jwtToken })
      })

      ws.addEventListener('message', (event) => {
        if (this.socket !== ws) return
        try {
          const parsed = JSON.parse(String(event.data)) as { route?: string }
          const route = parsed.route ?? ''
          if (route.startsWith('@wfm|cmd/auth/signIn:ok')) {
            this.wsAuthenticated = true
            this.sendWsCommand('@wfm|cmd/status/set', { status: this.desiredStatus })
            this.onConnectionChanged?.()
          } else if (route.startsWith('@wfm|cmd/auth/signIn:error')) {
            this.wsAuthenticated = false
            this.closeSocket()
          }
        } catch {
          // Ignore malformed WS frames
        }
      })

      ws.addEventListener('close', () => {
        if (this.socket === ws) {
          this.socket = null
          this.wsAuthenticated = false
          this.onConnectionChanged?.()
          this.scheduleReconnectIfNeeded()
        }
      })

      ws.addEventListener('error', () => {
        // Handled by 'close' listener
      })
    } catch {
      this.socket = null
      this.wsAuthenticated = false
      this.scheduleReconnectIfNeeded()
    }
  }

  private sendWsCommand(route: string, payload: unknown): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return
    try {
      this.socket.send(
        JSON.stringify({
          route,
          payload
        })
      )
    } catch {
      // Ignore transient send error
    }
  }

  private scheduleReconnectIfNeeded(): void {
    this.clearReconnectTimer()
    if (this.disposed || !this.jwtToken || this.desiredStatus === 'invisible') {
      return
    }
    const delayMs = Math.min(30_000, 2_500 * Math.pow(2, Math.min(4, this.reconnectAttempts)))
    this.reconnectAttempts += 1
    this.reconnectTimer = setTimeout(() => {
      this.openSocket()
    }, delayMs)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private closeSocket(): void {
    this.clearReconnectTimer()
    this.wsAuthenticated = false
    if (this.socket) {
      const current = this.socket
      this.socket = null
      try {
        current.close()
      } catch {
        // Ignore close error
      }
      this.onConnectionChanged?.()
    }
  }
}

