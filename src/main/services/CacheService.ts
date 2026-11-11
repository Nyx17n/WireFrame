import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import type { RateLimitedHttpClient } from '../infrastructure/http/RateLimitedHttpClient'

interface MemoryEntry<T> {
  expiresAt: number
  value: T
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Manages in-memory TTL caching for API DTOs and safe SHA-256 hashed disk caching
 * for Warframe Market static icons served through `wf-asset://`.
 */
export class CacheService {
  private readonly memory = new Map<string, MemoryEntry<unknown>>()
  private readonly assetCacheDir: string
  private readonly httpClient: RateLimitedHttpClient

  constructor(sessionDataPath: string, httpClient: RateLimitedHttpClient) {
    this.assetCacheDir = join(sessionDataPath, 'asset-cache')
    this.httpClient = httpClient
  }

  public getMemorySize(): number {
    return this.memory.size
  }

  public get<T>(key: string): T | undefined {
    const entry = this.memory.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      this.memory.delete(key)
      return undefined
    }
    return entry.value as T
  }

  public set<T>(key: string, value: T, ttlSeconds: number): void {
    this.memory.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    })
  }

  public clearMemory(): void {
    this.memory.clear()
  }

  public async clearAll(): Promise<void> {
    this.memory.clear()
    await fs.rm(this.assetCacheDir, { recursive: true, force: true })
  }

  public async resolveWfmAsset(
    rawAssetPath: string
  ): Promise<{ bytes: Uint8Array; contentType: string }> {
    const cleanPath = (rawAssetPath.split('?')[0] ?? '').replace(/^\/+/, '')
    if (!cleanPath || cleanPath.includes('..') || cleanPath.includes('\\')) {
      throw new Error('Invalid asset path')
    }

    await fs.mkdir(this.assetCacheDir, { recursive: true })
    const hash = createHash('sha256').update(cleanPath).digest('hex')
    const binPath = join(this.assetCacheDir, `${hash}.bin`)
    const metaPath = join(this.assetCacheDir, `${hash}.json`)

    try {
      const stat = await fs.stat(binPath)
      if (Date.now() - stat.mtimeMs < SEVEN_DAYS_MS) {
        const [bytes, metaRaw] = await Promise.all([
          fs.readFile(binPath),
          fs.readFile(metaPath, 'utf-8')
        ])
        const meta = JSON.parse(metaRaw) as { contentType?: string }
        return {
          bytes: new Uint8Array(bytes),
          contentType: meta.contentType ?? 'image/png'
        }
      }
    } catch {
      // Cache miss -> fetch remotely
    }

    const remoteUrl = `https://warframe.market/static/assets/${cleanPath}`
    const fetched = await this.httpClient.getBytes(remoteUrl, { bypassRateLimit: true })

    await Promise.all([
      fs.writeFile(binPath, fetched.bytes),
      fs.writeFile(metaPath, JSON.stringify({ contentType: fetched.contentType }), 'utf-8')
    ])

    return fetched
  }
}

