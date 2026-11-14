import { net } from 'electron'
import type { z } from 'zod'

export interface HttpRequestOptions {
  headers?: Record<string, string>
  timeoutMs?: number
  bypassRateLimit?: boolean
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

    try {
      const response = await net.fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'TennoFrame/2.0 (Electron; Windows; Warframe Companion)',
          ...options.headers
        },
        signal: controller.signal
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} on ${parsedUrl.hostname}${parsedUrl.pathname}`)
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

