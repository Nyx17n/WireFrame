import { existsSync } from 'node:fs'
import { copyFile, mkdir, rename } from 'node:fs/promises'
import { join } from 'node:path'

const MIGRATED_FILES = ['config.json', 'worldstate-last-good.json'] as const
const LEGACY_DIR_NAMES = ['WireFrame', 'wireframe'] as const

/**
 * Safely migrates user settings, favorites, cart, sniper alerts, worldstate rules,
 * and farm overlay state from `%APPDATA%/WireFrame` (v2.0.0 – v2.8.0) to `%APPDATA%/TennoFrame`
 * on the first launch after rebranding.
 *
 * Idempotent & atomic: never overwrites an existing `TennoFrame/config.json`.
 */
export async function migrateLegacyWireFrameUserData(
  appDataPath: string,
  targetUserDataPath: string
): Promise<void> {
  const targetConfigPath = join(targetUserDataPath, 'config.json')
  if (existsSync(targetConfigPath)) {
    return
  }

  for (const legacyDirName of LEGACY_DIR_NAMES) {
    const legacyDir = join(appDataPath, legacyDirName)
    if (legacyDir.toLowerCase() === targetUserDataPath.toLowerCase()) {
      continue
    }

    const legacyConfigPath = join(legacyDir, 'config.json')
    if (!existsSync(legacyConfigPath)) {
      continue
    }

    try {
      await mkdir(targetUserDataPath, { recursive: true })
      for (const fileName of MIGRATED_FILES) {
        const src = join(legacyDir, fileName)
        const dst = join(targetUserDataPath, fileName)
        if (existsSync(src) && !existsSync(dst)) {
          const tmpDst = `${dst}.mig-tmp`
          await copyFile(src, tmpDst)
          await rename(tmpDst, dst)
        }
      }
      return
    } catch {
      // Non-fatal: if legacy directory is locked or unreadable, StorageService falls back to defaults
    }
  }
}
