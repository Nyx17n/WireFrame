import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import {
  DEFAULT_USER_SETTINGS,
  UserSettingsSchema,
  type UserSettings,
  type UserSettingsPatch
} from '@shared/schemas/settings.schema'

/**
 * Atomic, Zod-validated JSON storage in `%APPDATA%/WireFrame/config.json`.
 * Never writes partial files on crash (writes to `.tmp` then renames atomically).
 */
export class StorageService {
  private readonly configPath: string
  private cachedSettings: UserSettings = DEFAULT_USER_SETTINGS
  private loaded = false

  constructor(userDataPath: string) {
    this.configPath = join(userDataPath, 'config.json')
  }

  public async load(): Promise<UserSettings> {
    if (this.loaded) {
      return this.cachedSettings
    }

    try {
      const raw = await fs.readFile(this.configPath, 'utf-8')
      const parsedJson: unknown = JSON.parse(raw)
      const validated = UserSettingsSchema.safeParse(parsedJson)
      if (validated.success) {
        this.cachedSettings = validated.data
      } else {
        this.cachedSettings = DEFAULT_USER_SETTINGS
        await this.persistAtomic(this.cachedSettings)
      }
    } catch {
      this.cachedSettings = DEFAULT_USER_SETTINGS
      await this.persistAtomic(this.cachedSettings)
    }

    this.loaded = true
    return this.cachedSettings
  }

  public async getSettings(): Promise<UserSettings> {
    return this.load()
  }

  public getSettingsSync(): UserSettings {
    return this.cachedSettings
  }

  public async updateSettings(patch: UserSettingsPatch): Promise<UserSettings> {
    const current = await this.load()
    const merged = {
      appearance: { ...current.appearance, ...patch.appearance },
      audio: { ...current.audio, ...patch.audio },
      window: {
        ...current.window,
        ...patch.window,
        shortcuts: { ...current.window.shortcuts, ...patch.window?.shortcuts },
        desktopBounds: { ...current.window.desktopBounds, ...patch.window?.desktopBounds },
        compactBounds: { ...current.window.compactBounds, ...patch.window?.compactBounds }
      },
      market: { ...current.market, ...patch.market },
      session: {
        ...current.session,
        ...patch.session,
        tabs: patch.session?.tabs ?? current.session.tabs
      }
    }

    const validated = UserSettingsSchema.parse(merged)
    this.cachedSettings = validated
    await this.persistAtomic(validated)
    return validated
  }

  public async exportToPath(targetPath: string): Promise<void> {
    const current = await this.load()
    await fs.writeFile(targetPath, JSON.stringify(current, null, 2), 'utf-8')
  }

  public async importFromPath(sourcePath: string): Promise<UserSettings> {
    const raw = await fs.readFile(sourcePath, 'utf-8')
    const parsedJson: unknown = JSON.parse(raw)
    const validated = UserSettingsSchema.parse(parsedJson)
    this.cachedSettings = validated
    await this.persistAtomic(validated)
    return validated
  }

  public async resetSettings(): Promise<UserSettings> {
    this.cachedSettings = DEFAULT_USER_SETTINGS
    await this.persistAtomic(DEFAULT_USER_SETTINGS)
    return this.cachedSettings
  }

  private async persistAtomic(data: UserSettings): Promise<void> {
    const dir = dirname(this.configPath)
    await fs.mkdir(dir, { recursive: true })
    const tmpPath = `${this.configPath}.tmp`
    await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
    await fs.rename(tmpPath, this.configPath)
  }
}
