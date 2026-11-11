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

// Normalise les cas particuliers Warframe (ex: Jade qui possède 2 Auras sous forme de tableau)
if (Array.isArray(parsed.warframes)) {
  for (const wf of parsed.warframes) {
    if (Array.isArray(wf.aura)) {
      wf.aura = wf.aura.join(' + ')
    }
  }
}

if (Array.isArray(parsed.resources)) {
  for (const res of parsed.resources) {
    if (typeof res.planets === 'string' && res.planets.length > 175) {
      res.planets = `${res.planets.slice(0, 172).trimEnd()}…`
    }
  }
}

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
