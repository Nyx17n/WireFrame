import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

/**
 * Extrait en lecture seule le dataset encyclopédique Warframe depuis l'archive `old-main:js/codex-data.js`
 * vers un fichier de données JSON pur (`resources/codex-db.json`), chargé à la demande par `CodexRepository`
 * dans le Main Process (zéro script .js synchrone bloquant côté Renderer).
 */
const outPath = resolve('resources/codex-db.json')
const rawJs = execSync('git show old-main:js/codex-data.js', {
  encoding: 'utf8',
  maxBuffer: 40 * 1024 * 1024
})

const startIdx = rawJs.indexOf('{')
if (startIdx === -1) {
  throw new Error('Impossible de localiser la racine JSON dans old-main:js/codex-data.js')
}

const cleanJsonText = rawJs.slice(startIdx).trim().replace(/;$/, '')
const parsed = JSON.parse(cleanJsonText)

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, JSON.stringify(parsed), 'utf8')

console.log(
  `[extract-codex-json] Écrit ${outPath} : ` +
    `${parsed.resources?.length ?? 0} ressources, ` +
    `${parsed.warframes?.length ?? 0} warframes, ` +
    `${parsed.weapons?.length ?? 0} armes, ` +
    `${parsed.mods?.length ?? 0} mods, ` +
    `${parsed.relics?.length ?? 0} reliques.`
)

