import { shell, type BrowserWindow, type IpcMainInvokeEvent } from 'electron'

const ALLOWED_EXTERNAL_HOSTS = new Set([
  'warframe.market',
  'www.warframe.com',
  'warframe.com',
  'forums.warframe.com',
  'wiki.warframe.com',
  'discord.gg',
  'discord.com',
  'github.com'
])

/**
 * Validates that an IPC call originates strictly from the trusted top-level frame
 * of our main BrowserWindow (AGENTS.md Section 5.2).
 */
export function assertTrustedSender(
  event: IpcMainInvokeEvent,
  mainWindow: BrowserWindow | null
): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    throw new Error('Rejected IPC call: main window unavailable')
  }

  const senderFrame = event.senderFrame
  if (!senderFrame || senderFrame !== mainWindow.webContents.mainFrame) {
    throw new Error('Security violation: untrusted IPC sender frame')
  }
}

/**
 * Opens an external URL in the OS browser ONLY if it uses strict HTTPS
 * and belongs to an explicitly allowlisted Warframe domain.
 */
export async function openAllowedExternalHttpsUrl(rawUrl: string): Promise<boolean> {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return false
  }
  if (parsed.protocol !== 'https:' || !ALLOWED_EXTERNAL_HOSTS.has(parsed.hostname)) {
    return false
  }
  await shell.openExternal(parsed.toString())
  return true
}

