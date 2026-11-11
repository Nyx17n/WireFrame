import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

const require = createRequire(import.meta.url)

function stopStaleWorkspaceElectron() {
  if (process.platform !== 'win32') return
  const localExe = resolve('node_modules/electron/dist/electron.exe').toLowerCase()
  try {
    const psScript = `
      Get-Process electron -ErrorAction SilentlyContinue |
        Where-Object { $_.Path -and $_.Path.ToLower() -eq '${localExe.replace(/'/g, "''")}' } |
        Stop-Process -Force -ErrorAction SilentlyContinue
    `
    execFileSync('powershell.exe', ['-NoProfile', '-Command', psScript], { stdio: 'ignore' })
  } catch {
    // Aucun processus local à nettoyer
  }
}

async function ensureElectronBinary() {
  const electronDir = resolve('node_modules/electron')
  const distDir = resolve(electronDir, 'dist')
  const pathTxt = resolve(electronDir, 'path.txt')
  const exeName = process.platform === 'win32' ? 'electron.exe' : 'electron'
  const exePath = resolve(distDir, exeName)

  if (existsSync(exePath) && existsSync(pathTxt)) {
    return
  }

  console.log('[WireFrame] Extraction du binaire Electron local...')
  const { downloadArtifact } = require('@electron/get')
  const pkg = JSON.parse(readFileSync(resolve(electronDir, 'package.json'), 'utf8'))
  const checksums = JSON.parse(readFileSync(resolve(electronDir, 'checksums.json'), 'utf8'))

  const zipPath = await downloadArtifact({
    version: pkg.version,
    artifactName: 'electron',
    checksums
  })

  mkdirSync(distDir, { recursive: true })
  execFileSync('tar', ['-xf', zipPath, '-C', distDir], { stdio: 'inherit' })
  writeFileSync(pathTxt, exeName, 'utf8')
}

async function main() {
  await ensureElectronBinary()
  // Ferme proprement toute ancienne instance dev restée réduite dans la zone de notification Windows
  stopStaleWorkspaceElectron()

  const mode = process.argv[2] ?? 'dev'
  const cliPath = resolve('node_modules/electron-vite/bin/electron-vite.js')

  const env = { ...process.env }
  // Les terminaux intégrés d'IDE basés sur Electron injectent parfois ELECTRON_RUN_AS_NODE=1,
  // ce qui empêche Electron d'ouvrir sa fenêtre graphique si on ne le retire pas.
  delete env.ELECTRON_RUN_AS_NODE

  const child = spawn(process.execPath, [cliPath, mode], {
    stdio: 'inherit',
    env
  })

  child.on('exit', (code) => {
    process.exit(code ?? 0)
  })
}

main().catch((err) => {
  console.error('[WireFrame] Échec du lancement Electron :', err)
  process.exit(1)
})
