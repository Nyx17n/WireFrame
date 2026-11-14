import { net } from 'electron'
import type { z } from 'zod'

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export interface HttpRequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  bodyJson?: unknown
  timeoutMs?: number
  bypassRateLimit?: boolean
}

export class HttpStatusError extends Error {
  public readonly status: number
  public readonly detailMessage: string

  constructor(status: number, pathname: string, detailMessage = '') {
    super(
      detailMessage
        ? `HTTP ${status} (${detailMessage})`
        : `HTTP ${status} sur ${pathname}`
    )
    this.name = 'HttpStatusError'
    this.status = status
    this.detailMessage = detailMessage
  }
}

/**
 * HTTP client backed by Chromium's native `net.fetch` (strict OS TLS 1.2/1.3).
 * Enforces a sliding-window rate limit (default: max 3 req/s for api.warframe.market)
 * and coalesces identical concurrent GET requests in flight.
 */
export class RateLimitedHttpClient {
  private readonly maxPerSecond: number
  private readonly requestTimestamps: number[] = []
  private readonly inFlight = new Map<string, Promise<unknown>>()
  private queueChain: Promise<void> = Promise.resolve()
  private lastSuccessAt = 0

  constructor(maxPerSecond = 3) {
    this.maxPerSecond = maxPerSecond
  }

  public getActiveCountInWindow(): number {
    this.pruneOldTimestamps(Date.now())
    return this.requestTimestamps.length
  }

  public getMaxPerSecond(): number {
    return this.maxPerSecond
  }

  public isHealthy(): boolean {
    return this.lastSuccessAt === 0 || Date.now() - this.lastSuccessAt < 5 * 60_000
  }

  public async getJson<T>(
    url: string,
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    options: HttpRequestOptions = {}
  ): Promise<T> {
    const dedupeKey = `${url}|${JSON.stringify(options.headers ?? {})}`
    const existing = this.inFlight.get(dedupeKey)
    if (existing) {
      return existing as Promise<T>
    }

    const task = this.executeJsonRequest(url, schema, options).finally(() => {
      this.inFlight.delete(dedupeKey)
    })

    this.inFlight.set(dedupeKey, task)
    return task
  }

  public async sendJson<T>(
    method: HttpMethod,
    url: string,
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    options: Omit<HttpRequestOptions, 'method'> = {}
  ): Promise<T> {
    return this.executeJsonRequest(url, schema, { ...options, method })
  }

  public async sendVoid(
    method: HttpMethod,
    url: string,
    options: Omit<HttpRequestOptions, 'method'> = {}
  ): Promise<void> {
    if (!options.bypassRateLimit) {
      await this.acquireRateLimitSlot()
    }
    await this.performFetch(url, {
      ...options,
      method,
      headers: {
        Accept: 'application/json',
        ...options.headers
      }
    })
    this.lastSuccessAt = Date.now()
  }

  public async sendRawResponse(
    method: HttpMethod,
    url: string,
    options: Omit<HttpRequestOptions, 'method'> = {}
  ): Promise<Response> {
    if (!options.bypassRateLimit) {
      await this.acquireRateLimitSlot()
    }
    const response = await this.performFetch(url, {
      ...options,
      method,
      headers: {
        Accept: 'application/json',
        ...options.headers
      }
    })
    this.lastSuccessAt = Date.now()
    return response
  }

  public async getBytes(
    url: string,
    options: HttpRequestOptions = {}
  ): Promise<{ bytes: Uint8Array; contentType: string }> {
    if (!options.bypassRateLimit) {
      await this.acquireRateLimitSlot()
    }
    const response = await this.performFetch(url, options)
    const buffer = await response.arrayBuffer()
    this.lastSuccessAt = Date.now()
    return {
      bytes: new Uint8Array(buffer),
      contentType: response.headers.get('content-type') ?? 'application/octet-stream'
    }
  }

  private async executeJsonRequest<T>(
    url: string,
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    options: HttpRequestOptions
  ): Promise<T> {
    if (!options.bypassRateLimit) {
      await this.acquireRateLimitSlot()
    }
    const response = await this.performFetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...options.headers
      }
    })
    const rawJson: unknown = await response.json()
    const parsed = schema.parse(rawJson)
    this.lastSuccessAt = Date.now()
    return parsed
  }

  private async performFetch(url: string, options: HttpRequestOptions): Promise<Response> {
    const parsedUrl = new URL(url)
    if (parsedUrl.protocol !== 'https:') {
      throw new Error(`Security policy violation: non-HTTPS request blocked (${parsedUrl.protocol})`)
    }

    const controller = new AbortController()
    const timeoutMs = options.timeoutMs ?? 15_000
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const method = options.method ?? 'GET'
    const hasBody = options.bodyJson !== undefined

    try {
      const response = await net.fetch(url, {
        method,
        headers: {
          'User-Agent': 'TennoFrame/2.0 (Electron; Windows; Warframe Companion)',
          ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
          ...options.headers
        },
        ...(hasBody ? { body: JSON.stringify(options.bodyJson) } : {}),
        signal: controller.signal
      })
      if (!response.ok) {
        let detail = ''
        try {
          const errJson: unknown = await response.json()
          if (errJson && typeof errJson === 'object') {
            const errRec = errJson as Record<string, unknown>
            if (typeof errRec['error'] === 'string') {
              detail = errRec['error']
            } else if (errRec['error'] && typeof errRec['error'] === 'object') {
              detail = Object.entries(errRec['error'] as Record<string, unknown>)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
                .join(' · ')
            }
          }
        } catch {
          // Non-JSON error body (e.g. 503 / Cloudflare challenge HTML)
        }
        throw new HttpStatusError(
          response.status,
          `${parsedUrl.hostname}${parsedUrl.pathname}`,
          detail
        )
      }
      return response
    } finally {
      clearTimeout(timer)
    }
  }

  private acquireRateLimitSlot(): Promise<void> {
    const next = this.queueChain.then(async () => {
      while (true) {
        const now = Date.now()
        this.pruneOldTimestamps(now)
        if (this.requestTimestamps.length < this.maxPerSecond) {
          this.requestTimestamps.push(now)
          return
        }
        const oldest = this.requestTimestamps[0] ?? now
        const waitMs = Math.max(25, 1005 - (now - oldest))
        await new Promise((resolve) => setTimeout(resolve, waitMs))
      }
    })
    this.queueChain = next.catch(() => undefined)
    return next
  }

  private pruneOldTimestamps(now: number): void {
    while (
      this.requestTimestamps.length > 0 &&
      now - (this.requestTimestamps[0] ?? now) >= 1000
    ) {
      this.requestTimestamps.shift()
    }
  }
}

