import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Résout récursivement les recettes officielles de Fonderie Digital Extremes (ExportRecipes)
 * y compris les sous-schémas (Neuroptiques, Châssis, Systèmes, Aspects Equinox, pièces d'armes/Necramechs)
 * et génère `resources/codex-craft-recipes.json` indexé par `<category>:<id>` du Codex TennoFrame.
 */
const BASE_EXPORT_URL =
  'https://raw.githubusercontent.com/calamity-inc/warframe-public-export-plus/senpai'

function norm(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, "'")
    .trim()
}

function classifyPartKind(uniqueName, enName) {
  const s = `${uniqueName} ${enName}`.toLowerCase()
  if (s.includes('dayaspect')) return 'day-aspect'
  if (s.includes('nightaspect')) return 'night-aspect'
  if (s.includes('helmet') || s.includes('neuropt')) return 'neuroptics'
  if (s.includes('chassis')) return 'chassis'
  if (s.includes('systems') || s.includes('system')) return 'systems'
  if (s.includes('wings') || s.includes('ailes')) return 'wings'
  if (s.includes('harness') || s.includes('harnais')) return 'harness'
  if (s.includes('capsule')) return 'capsule'
  if (s.includes('engine') || s.includes('moteur')) return 'engine'
  if (s.includes('pod') || s.includes('nacelle')) return 'weapon-pod'
  if (s.includes('barrel') || s.includes('canon')) return 'barrel'
  if (s.includes('receiver') || s.includes('culasse')) return 'receiver'
  if (s.includes('stock') || s.includes('crosse')) return 'stock'
  return null
}

async function fetchJson(file) {
  const res = await fetch(`${BASE_EXPORT_URL}/${file}`)
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${file}`)
  return res.json()
}

async function main() {
  const codexDb = JSON.parse(readFileSync(resolve('resources/codex-db.json'), 'utf8'))

  const [recipes, exportWarframes, exportWeapons, exportResources, dictEn, dictFr] =
    await Promise.all([
      fetchJson('ExportRecipes.json'),
      fetchJson('ExportWarframes.json'),
      fetchJson('ExportWeapons.json'),
      fetchJson('ExportResources.json'),
      fetchJson('dict.en.json'),
      fetchJson('dict.fr.json')
    ])

  // Map Codex resources by normalized English & French names
  const codexResByEn = new Map()
  const codexResByFr = new Map()
  for (const r of codexDb.resources) {
    codexResByEn.set(norm(r.en), r)
    codexResByFr.set(norm(r.name), r)
  }

  // Index ExportRecipes by resultType (prefer standard playable recipe, ignore Conversion/Statless/Tutorial)
  const recipeByResult = new Map()
  for (const [recipeKey, rec] of Object.entries(recipes)) {
    if (!rec?.resultType || !Array.isArray(rec.ingredients)) continue
    if (/Conversion|Statless|Tutorial|PvPVariant/i.test(recipeKey)) continue
    const existing = recipeByResult.get(rec.resultType)
    if (!existing) {
      recipeByResult.set(rec.resultType, rec)
    }
  }

  function resolveItemMeta(itemType) {
    const resEntry = exportResources[itemType]
    if (resEntry) {
      const en = dictEn[resEntry.name] || itemType.split('/').pop() || ''
      const fr = dictFr[resEntry.name] || en
      const matchedCodex = codexResByEn.get(norm(en)) || codexResByFr.get(norm(fr))
      return {
        en,
        fr: matchedCodex ? matchedCodex.name : fr,
        resSlug: matchedCodex ? matchedCodex.id : null,
        img: matchedCodex ? matchedCodex.img : ''
      }
    }
    const wepEntry = exportWeapons[itemType]
    if (wepEntry) {
      const en = dictEn[wepEntry.name] || itemType.split('/').pop() || ''
      const fr = dictFr[wepEntry.name] || en
      return { en, fr, resSlug: null, img: '' }
    }
    const wfEntry = exportWarframes[itemType]
    if (wfEntry) {
      const en = dictEn[wfEntry.name] || itemType.split('/').pop() || ''
      const fr = dictFr[wfEntry.name] || en
      return { en, fr, resSlug: null, img: '' }
    }
    const rawTail = itemType.split('/').pop() || itemType
    return { en: rawTail, fr: rawTail, resSlug: null, img: '' }
  }

  function collectLeafResources(itemType, multiplier, totalsMap, visited = new Set()) {
    if (visited.has(itemType)) return 0
    visited.add(itemType)

    const meta = resolveItemMeta(itemType)
    const isPrerequisiteFullWeapon = Boolean(exportWeapons[itemType])

    // Dès qu'un ingrédient est une ressource du Codex (ex: Cellule Orokin, Morphics, Capteurs Neuronaux),
    // on NE déplie JAMAIS les schémas de transmutation de ressources rares !
    const subRec = !meta.resSlug && !isPrerequisiteFullWeapon ? recipeByResult.get(itemType) : null
    if (subRec) {
      let credits = (subRec.buildPrice || 0) * multiplier
      for (const ing of subRec.ingredients) {
        credits += collectLeafResources(
          ing.ItemType,
          ing.ItemCount * multiplier,
          totalsMap,
          new Set(visited)
        )
      }
      return credits
    }

    if (!meta.resSlug && !exportResources[itemType] && !isPrerequisiteFullWeapon) {
      return 0
    }

    const key = meta.resSlug || `raw:${norm(meta.en)}`
    const prev = totalsMap.get(key)
    if (prev) {
      prev.count += multiplier
    } else {
      totalsMap.set(key, {
        resSlug: meta.resSlug,
        nameFr: meta.fr,
        nameEn: meta.en,
        img: meta.img,
        count: multiplier,
        isPrerequisiteWeapon: isPrerequisiteFullWeapon
      })
    }
    return 0
  }

  function buildRecipeEntry(resultUniqueName) {
    const mainRec = recipeByResult.get(resultUniqueName)
    if (!mainRec) return null

    const totalMap = new Map()
    let totalBuildCredits = mainRec.buildPrice || 0
    const partRecipes = {}

    for (const ing of mainRec.ingredients) {
      const ingMeta = resolveItemMeta(ing.ItemType)
      const isPrereqWep = Boolean(exportWeapons[ing.ItemType])
      const subRec = !ingMeta.resSlug && !isPrereqWep ? recipeByResult.get(ing.ItemType) : null

      if (subRec) {
        const partMap = new Map()
        const subCredits = collectLeafResources(ing.ItemType, ing.ItemCount, partMap)
        totalBuildCredits += subCredits

        const partKind = classifyPartKind(ing.ItemType, ingMeta.en)
        if (partKind) {
          partRecipes[partKind] = {
            buildCredits: subCredits,
            resources: Array.from(partMap.values())
              .filter((r) => Boolean(r.resSlug))
              .map((r) => ({
                resSlug: r.resSlug,
                nameFr: r.nameFr,
                nameEn: r.nameEn,
                img: r.img,
                count: r.count
              }))
          }
        }

        for (const [k, v] of partMap.entries()) {
          const existing = totalMap.get(k)
          if (existing) existing.count += v.count
          else totalMap.set(k, { ...v })
        }
      } else {
        collectLeafResources(ing.ItemType, ing.ItemCount, totalMap)
      }
    }

    const totalResources = Array.from(totalMap.values())
      .filter((r) => Boolean(r.resSlug))
      .sort((a, b) => a.count - b.count || a.nameFr.localeCompare(b.nameFr, 'fr'))

    if (totalResources.length === 0 && Object.keys(partRecipes).length === 0) {
      return null
    }

    return {
      buildCredits: totalBuildCredits,
      totalResources: totalResources.map((r) => ({
        resSlug: r.resSlug,
        nameFr: r.nameFr,
        nameEn: r.nameEn,
        img: r.img,
        count: r.count
      })),
      partRecipes
    }
  }

  // Index ExportWarframes & ExportWeapons by normalized English name
  const wfUniqueByEn = new Map()
  for (const [uName, wf] of Object.entries(exportWarframes)) {
    const en = dictEn[wf.name]
    if (en && !wfUniqueByEn.has(norm(en))) {
      wfUniqueByEn.set(norm(en), uName)
    }
  }

  const wepUniqueByEn = new Map()
  for (const [uName, wep] of Object.entries(exportWeapons)) {
    const en = dictEn[wep.name]
    if (en && !wepUniqueByEn.has(norm(en))) {
      wepUniqueByEn.set(norm(en), uName)
    }
  }

  const output = { warframes: {}, weapons: {} }
  let wfMatched = 0
  let wepMatched = 0

  for (const wf of codexDb.warframes) {
    const uName =
      wfUniqueByEn.get(norm(wf.en)) || wfUniqueByEn.get(norm(`<ARCHWING> ${wf.en}`))
    if (!uName) continue
    const entry = buildRecipeEntry(uName)
    if (entry) {
      output.warframes[wf.id] = entry
      wfMatched++
    }
  }

  for (const wep of codexDb.weapons) {
    const uName =
      wepUniqueByEn.get(norm(wep.en)) || wepUniqueByEn.get(norm(`<ARCHWING> ${wep.en}`))
    if (!uName) continue
    const entry = buildRecipeEntry(uName)
    if (entry) {
      output.weapons[wep.id] = entry
      wepMatched++
    }
  }

  const outPath = resolve('resources/codex-craft-recipes.json')
  writeFileSync(outPath, JSON.stringify(output), 'utf8')
  console.log(
    `[extract-craft-recipes] Écrit ${outPath} : ${wfMatched}/${codexDb.warframes.length} Warframes, ${wepMatched}/${codexDb.weapons.length} Armes.`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
