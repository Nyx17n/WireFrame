import {
  DOJO_WEAPON_LAB_BY_ID,
  DUVIRI_NORMAL_CIRCUIT_WARFRAMES,
  HEX_1999_WEAPON_IDS,
  INVASION_WEAPON_IDS,
  TENET_HOLOKEY_MELEE_IDS,
  WARFRAME_MARKET_BP_CREDITS,
  WARFRAME_QUEST_NAMES_FR,
  WARFRAME_SPECIAL_ACQUISITIONS,
  WEAPON_QUEST_AND_SPECIAL_SOURCES
} from '@shared/data/codex-acquisition-catalog'
import {
  toCodexImageUrl,
  type CodexAcquisitionSource,
  type CodexComponentEntry,
  type CodexDropEntry,
  type CodexSubResourceEntry
} from '@shared/schemas/codex.schema'
import type {
  CodexCraftRecipesDatabase,
  CodexRawDatabase,
  RawComponent,
  RawCraftItemRecipe,
  RawDrop,
  RawMod,
  RawRelic,
  RawResource,
  RawWarframe,
  RawWeapon
} from './codex-raw.schemas'

const DIRECT_CREDITS_WEAPONS = new Set([
  'mk1-bo',
  'mk1-braton',
  'mk1-furax',
  'mk1-furis',
  'mk1-kunai',
  'mk1-paris',
  'mk1-strun',
  'braton',
  'lato',
  'aklato',
  'lex',
  'sicarus',
  'strun'
])

const SYNDICATE_WEAPON_PREFIXES: ReadonlyArray<readonly [string, string, string]> = [
  ['vaykor-', 'Syndicat Méridien d’Acier (Rang 5 — 125 000 Réputation)', 'Steel Meridian (Rank 5)'],
  ['telos-', 'Syndicat Arbitres de Hexis (Rang 5 — 125 000 Réputation)', 'Arbiters of Hexis (Rank 5)'],
  ['synoid-', 'Syndicat Céphalon Suda (Rang 5 — 125 000 Réputation)', 'Cephalon Suda (Rank 5)'],
  ['secura-', 'Syndicat La Séquence Perrin (Rang 5 — 125 000 Réputation)', 'The Perrin Sequence (Rank 5)'],
  ['rakta-', 'Syndicat Voile Rouge (Rang 5 — 125 000 Réputation)', 'Red Veil (Rank 5)'],
  ['sancti-', 'Syndicat Nouveau Loka (Rang 5 — 125 000 Réputation)', 'New Loka (Rank 5)']
]

function norm(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function isMainBlueprintComponent(comp: RawComponent): boolean {
  const label = `${comp.name} ${comp.en}`.toLowerCase()
  const isBp = label.includes('schéma') || label.includes('schema') || label.includes('blueprint')
  const isSubPart =
    label.includes('neuropt') ||
    label.includes('châssis') ||
    label.includes('chassis') ||
    label.includes('systèm') ||
    label.includes('system') ||
    label.includes('harnais') ||
    label.includes('harness') ||
    label.includes('capsule') ||
    label.includes('moteur') ||
    label.includes('engine') ||
    label.includes('canon') ||
    label.includes('barrel') ||
    label.includes('culasse') ||
    label.includes('receiver') ||
    label.includes('crosse') ||
    label.includes('stock')
  return isBp && !isSubPart
}

function parseSimarisQuestLocation(loc: string): { questFr: string; questEn: string } | null {
  const match = /^Cephalon Simaris,\s*(?:Complete|Unlock through)\s+(.+)$/i.exec(loc.trim())
  if (!match?.[1]) return null
  const questEn = match[1].trim()
  const questFr = WARFRAME_QUEST_NAMES_FR[questEn] ?? questEn
  return { questFr, questEn }
}

function dropToSource(drop: CodexDropEntry): CodexAcquisitionSource {
  const parsedQuest = parseSimarisQuestLocation(drop.location)
  if (parsedQuest || drop.location.startsWith('Quête «')) {
    const labelFr = parsedQuest
      ? `Quête « ${parsedQuest.questFr} » (+ Rachat Céphalon Simaris)`
      : drop.location
    return {
      type: 'quest',
      labelFr,
      labelEn: parsedQuest ? `Quest: "${parsedQuest.questEn}"` : drop.location,
      sublabelFr: [drop.part, '100 % en quête · Rachat Céphalon Simaris'].filter(Boolean).join(' · '),
      sublabelEn: '100% from quest · Re-purchasable from Cephalon Simaris',
      chancePct: 100,
      isGuaranteed: true,
      costCredits: null,
      partNameFr: drop.part
    }
  }

  const isRelicDrop = /\brelic\b|\brelique\b/i.test(drop.location)
  return {
    type: isRelicDrop ? 'relic' : 'drop',
    labelFr: drop.location,
    labelEn: drop.location,
    sublabelFr: [drop.part, drop.rarity].filter(Boolean).join(' · ') || null,
    sublabelEn: [drop.part, drop.rarity].filter(Boolean).join(' · ') || null,
    chancePct: drop.chance,
    isGuaranteed: drop.chance >= 100,
    costCredits: null,
    partNameFr: drop.part
  }
}

function filterPvEDrops(
  drops: readonly RawDrop[],
  excludedPartNames?: ReadonlySet<string>
): CodexDropEntry[] {
  return drops
    .filter((d) => {
      if (/\(conclave\)/i.test(d.loc)) return false
      if (d.part && excludedPartNames?.has(norm(d.part))) return false
      return true
    })
    .sort((a, b) => b.chance - a.chance)
    .map((d) => {
      const quest = parseSimarisQuestLocation(d.loc)
      return {
        part: d.part ?? null,
        location: quest
          ? `Quête « ${quest.questFr} » (+ Rachat Céphalon Simaris)`
          : d.loc,
        chance: quest ? 100 : d.chance,
        rarity: quest ? 'Garanti (Quête)' : d.rarity
      }
    })
}

function dedupeSources(sources: readonly CodexAcquisitionSource[], max = 8): CodexAcquisitionSource[] {
  const seen = new Set<string>()
  const out: CodexAcquisitionSource[] = []
  for (const s of sources) {
    const key = `${s.type}:${norm(s.labelFr)}:${norm(s.partNameFr ?? '')}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(s)
    if (out.length >= max) break
  }
  return out
}

function classifyComponentPartKind(comp: RawComponent): string | null {
  const s = `${norm(comp.name)} ${norm(comp.en)}`
  if (s.includes('diurne') || s.includes('day aspect')) return 'day-aspect'
  if (s.includes('nocturne') || s.includes('night aspect')) return 'night-aspect'
  if (s.includes('neuropt') || s.includes('helmet') || s.includes('casque')) return 'neuroptics'
  if (s.includes('chassis')) return 'chassis'
  if (s.includes('system')) return 'systems'
  if (s.includes('ailes') || s.includes('wings')) return 'wings'
  if (s.includes('harnais') || s.includes('harness')) return 'harness'
  if (s.includes('capsule')) return 'capsule'
  if (s.includes('moteur') || s.includes('engine')) return 'engine'
  if (s.includes('nacelle') || s.includes('pod')) return 'weapon-pod'
  if (s.includes('canon') || s.includes('barrel')) return 'barrel'
  if (s.includes('culasse') || s.includes('receiver')) return 'receiver'
  if (s.includes('crosse') || s.includes('stock')) return 'stock'
  return null
}

export class CodexAcquisitionResolver {
  private readonly resourceById: ReadonlyMap<string, RawResource>
  private readonly craftRecipes: CodexCraftRecipesDatabase

  public constructor(db: CodexRawDatabase, craftRecipes?: CodexCraftRecipesDatabase) {
    this.resourceById = new Map(db.resources.map((r) => [r.id, r]))
    this.craftRecipes = craftRecipes ?? { warframes: {}, weapons: {} }
  }

  private buildResourcePartNames(components: readonly RawComponent[]): ReadonlySet<string> {
    const names = new Set<string>()
    for (const c of components) {
      if (!c.resSlug) continue
      names.add(norm(c.name))
      names.add(norm(c.en))
      const res = this.resourceById.get(c.resSlug)
      if (res) {
        names.add(norm(res.name))
        names.add(norm(res.en))
      }
    }
    // Common raw materials that occasionally appear without resSlug in parent drops
    names.add(norm("Cristal d'Argon"))
    names.add(norm('Argon Crystal'))
    names.add(norm("Plaque d'Alliage"))
    names.add(norm('Alloy Plate'))
    names.add(norm("Éclat d'Eidolon"))
    names.add(norm('Eidolon Shard'))
    return names
  }

  private mapSingleComponent(
    comp: RawComponent,
    primaryInjectedSources: readonly CodexAcquisitionSource[],
    secondaryInjectedSources: readonly CodexAcquisitionSource[] = [],
    partSubRecipe?: { buildCredits: number; subResources: CodexSubResourceEntry[] }
  ): CodexComponentEntry {
    const linkedResource = comp.resSlug ? this.resourceById.get(comp.resSlug) : undefined
    const isResource = Boolean(comp.resSlug && linkedResource)

    const rawDrops =
      isResource && linkedResource && linkedResource.drops.length > 0
        ? linkedResource.drops
        : comp.drops
    const cleanDrops = filterPvEDrops(rawDrops)

    const dropSources = cleanDrops.slice(0, 4).map(dropToSource)
    const resourcePlanetFallback: CodexAcquisitionSource[] =
      isResource && cleanDrops.length === 0 && linkedResource?.planets
        ? [
            {
              type: 'drop',
              labelFr: linkedResource.planets,
              labelEn: linkedResource.planets,
              sublabelFr: linkedResource.utility || 'Ressource planétaire',
              sublabelEn: 'Planetary resource',
              chancePct: 100,
              isGuaranteed: false,
              costCredits: null,
              partNameFr: comp.name
            }
          ]
        : []

    return {
      nameFr: comp.name,
      nameEn: comp.en,
      resourceSlug: comp.resSlug || null,
      isResource,
      count: comp.count,
      buildCredits: partSubRecipe?.buildCredits ?? null,
      subResources: partSubRecipe?.subResources ?? [],
      imageUrl: toCodexImageUrl(comp.img || linkedResource?.img),
      drops: cleanDrops,
      acquisitionSources: dedupeSources([
        ...primaryInjectedSources,
        ...dropSources,
        ...secondaryInjectedSources,
        ...resourcePlanetFallback
      ])
    }
  }

  private mergeCraftRecipeComponents(
    baseNonResComponents: readonly CodexComponentEntry[],
    fallbackResComponents: readonly CodexComponentEntry[],
    craftRecipe: RawCraftItemRecipe | undefined
  ): CodexComponentEntry[] {
    if (!craftRecipe || craftRecipe.totalResources.length === 0) {
      return [...baseNonResComponents, ...fallbackResComponents]
    }

    const totalResourceEntries: CodexComponentEntry[] = craftRecipe.totalResources.map((ref) =>
      this.mapSingleComponent(
        {
          name: ref.nameFr,
          en: ref.nameEn,
          resSlug: ref.resSlug ?? '',
          count: ref.count,
          img: ref.img,
          drops: []
        },
        []
      )
    )

    // Keep any extra resource from codex-db not already in totalResources
    const seenSlugs = new Set(
      totalResourceEntries.map((r) => r.resourceSlug).filter((s): s is string => Boolean(s))
    )
    const extras = fallbackResComponents.filter(
      (r) => !r.resourceSlug || !seenSlugs.has(r.resourceSlug)
    )

    return [...baseNonResComponents, ...totalResourceEntries, ...extras]
  }

  private resolvePartSubRecipe(
    comp: RawComponent,
    craftRecipe: RawCraftItemRecipe | undefined
  ): { buildCredits: number; subResources: CodexSubResourceEntry[] } | undefined {
    if (!craftRecipe) return undefined
    const kind = classifyComponentPartKind(comp)
    if (!kind) return undefined
    const part = craftRecipe.partRecipes[kind]
    if (!part || part.resources.length === 0) return undefined
    return {
      buildCredits: part.buildCredits,
      subResources: part.resources.map((r) => ({
        resourceSlug: r.resSlug,
        nameFr: r.nameFr,
        nameEn: r.nameEn,
        imageUrl: toCodexImageUrl(r.img || (r.resSlug ? this.resourceById.get(r.resSlug)?.img : '')),
        count: r.count
      }))
    }
  }

  public resolveResource(item: RawResource): {
    drops: CodexDropEntry[]
    acquisitionSources: CodexAcquisitionSource[]
    summaryText: string | null
  } {
    const drops = filterPvEDrops(item.drops)
    const sources: CodexAcquisitionSource[] = drops.slice(0, 5).map(dropToSource)
    if (sources.length === 0 && item.planets) {
      sources.push({
        type: 'drop',
        labelFr: item.planets,
        labelEn: item.planets,
        sublabelFr: item.utility || 'Récolte sur planètes / conteneurs',
        sublabelEn: 'Planetary harvest / containers',
        chancePct: 100,
        isGuaranteed: false,
        costCredits: null,
        partNameFr: null
      })
    }
    const top = sources[0]
    const summaryText = top
      ? top.type === 'drop' && drops[0]
        ? `${drops[0].location} (${drops[0].chance}%)`
        : top.labelFr
      : item.planets || null

    return { drops, acquisitionSources: dedupeSources(sources), summaryText }
  }

  public resolveWarframe(item: RawWarframe): {
    drops: CodexDropEntry[]
    components: CodexComponentEntry[]
    acquisitionSources: CodexAcquisitionSource[]
    totalBuildCredits: number | null
    summaryText: string | null
  } {
    const resPartNames = this.buildResourcePartNames(item.components)
    const drops = filterPvEDrops(item.drops, resPartNames)
    const craftRecipe = this.craftRecipes.warframes[item.id]

    const special = WARFRAME_SPECIAL_ACQUISITIONS[item.id]
    const marketBpCredits = !item.prime ? WARFRAME_MARKET_BP_CREDITS[item.id] : undefined
    const inDuviriCircuit = !item.prime && DUVIRI_NORMAL_CIRCUIT_WARFRAMES.has(item.id)

    const marketBpSource: CodexAcquisitionSource | null =
      marketBpCredits !== undefined
        ? {
            type: 'shop',
            labelFr: `Boutique en jeu Warframe — ${marketBpCredits.toLocaleString('fr-FR')} Crédits`,
            labelEn: `In-Game Market — ${marketBpCredits.toLocaleString('en-US')} Credits`,
            sublabelFr: 'Schéma Principal achetable directement dans la Console du Marché',
            sublabelEn: 'Main Blueprint purchased directly from Orbiter Market Console',
            chancePct: 100,
            isGuaranteed: true,
            costCredits: marketBpCredits,
            partNameFr: 'Schéma Principal'
          }
        : null

    const duviriSource: CodexAcquisitionSource | null = inDuviriCircuit
      ? {
          type: 'duviri',
          labelFr: 'Circuit Normal de Duviri (Rotation hebdomadaire)',
          labelEn: 'Normal Duviri Circuit (Weekly rotation)',
          sublabelFr: 'Parcours complet garanti (Paliers 2, 5, 7 & 10) quand éligible',
          sublabelEn: 'Guaranteed full blueprint set (Tiers 2, 5, 7 & 10)',
          chancePct: 100,
          isGuaranteed: true,
          costCredits: null,
          partNameFr: null
        }
      : null

    const vaultedPrimeSource: CodexAcquisitionSource | null =
      item.prime && item.vaulted
        ? {
            type: 'relic',
            labelFr: 'En Soute Prime (Vaulted) — Résurgence Prime (Varzia / Aya) ou Marché Joueurs',
            labelEn: 'Prime Vaulted — Prime Resurgence (Varzia / Aya) or Player Trading',
            sublabelFr: 'Reliques échangeables entre joueurs ou lors d’une rotation Varzia',
            sublabelEn: 'Relics available via Varzia rotation or Warframe Market',
            chancePct: 100,
            isGuaranteed: false,
            costCredits: null,
            partNameFr: null
          }
        : null

    const rawMappedComponents = item.components.map((comp) => {
      const primaryInjected: CodexAcquisitionSource[] = []
      const secondaryInjected: CodexAcquisitionSource[] = []
      const isMainBp = isMainBlueprintComponent(comp)
      const isNonResPart = !comp.resSlug

      if (isMainBp) {
        if (marketBpSource) primaryInjected.push(marketBpSource)
        if (special?.mainBlueprint) primaryInjected.push({ ...special.mainBlueprint, partNameFr: comp.name })
        if (special?.allParts && !marketBpSource && !special.mainBlueprint) {
          primaryInjected.push({ ...special.allParts, partNameFr: comp.name })
        }
      } else if (isNonResPart && special?.allParts) {
        primaryInjected.push({ ...special.allParts, partNameFr: comp.name })
      }

      if (isNonResPart && duviriSource) {
        secondaryInjected.push({ ...duviriSource, partNameFr: comp.name })
      }
      if (isNonResPart && vaultedPrimeSource && comp.drops.length === 0) {
        secondaryInjected.push({ ...vaultedPrimeSource, partNameFr: comp.name })
      }

      const subRec = isNonResPart ? this.resolvePartSubRecipe(comp, craftRecipe) : undefined
      return this.mapSingleComponent(comp, primaryInjected, secondaryInjected, subRec)
    })

    const components = this.mergeCraftRecipeComponents(
      rawMappedComponents.filter((c) => !c.isResource),
      rawMappedComponents.filter((c) => c.isResource),
      craftRecipe
    )

    const topLevelSources: CodexAcquisitionSource[] = []
    if (special?.fullItem) topLevelSources.push(special.fullItem)
    if (marketBpSource) topLevelSources.push(marketBpSource)
    if (special?.mainBlueprint) topLevelSources.push(special.mainBlueprint)
    if (special?.allParts) topLevelSources.push(special.allParts)
    for (const d of drops.slice(0, 4)) {
      topLevelSources.push(dropToSource(d))
    }
    if (duviriSource) topLevelSources.push(duviriSource)
    if (vaultedPrimeSource) topLevelSources.push(vaultedPrimeSource)

    const acquisitionSources = dedupeSources(topLevelSources)
    const first = acquisitionSources[0]
    const summaryText = first
      ? first.isGuaranteed
        ? first.labelFr
        : `${first.labelFr} (${first.chancePct}%)`
      : null

    return {
      drops,
      components,
      acquisitionSources,
      totalBuildCredits: craftRecipe?.buildCredits ?? null,
      summaryText
    }
  }

  private resolveWeaponSpecialSource(item: RawWeapon, hasDirectDrops: boolean): CodexAcquisitionSource | null {
    const curated = WEAPON_QUEST_AND_SPECIAL_SOURCES[item.id]
    if (curated) return curated

    if (DIRECT_CREDITS_WEAPONS.has(item.id)) {
      return {
        type: 'shop',
        labelFr: 'Boutique en jeu Warframe — Arme achetable prête à l’emploi en Crédits',
        labelEn: 'In-Game Market — Purchased pre-built for Credits',
        sublabelFr: 'Disponible immédiatement dans l’Arsenal / Console du Marché',
        sublabelEn: 'Available directly for Credits in the Market',
        chancePct: 100,
        isGuaranteed: true,
        costCredits: null,
        partNameFr: null
      }
    }

    const dojoLab = DOJO_WEAPON_LAB_BY_ID[item.id]
    if (dojoLab) {
      const isSynd = dojoLab.startsWith('Syndicat')
      return {
        type: isSynd ? 'syndicate' : 'dojo',
        labelFr: isSynd ? dojoLab : `Dojo de Clan — ${dojoLab}`,
        labelEn: isSynd ? dojoLab : `Clan Dojo — ${dojoLab}`,
        sublabelFr: 'Schéma Principal reproductible en Crédits / Réputation',
        sublabelEn: 'Blueprint replicated for Credits / Standing',
        chancePct: 100,
        isGuaranteed: true,
        costCredits: null,
        partNameFr: 'Schéma Principal'
      }
    }

    if (item.id.startsWith('kuva-')) {
      return {
        type: 'nemesis',
        labelFr: 'Liches Kuva (Némésis Grineer — Confrontation Saturne Proxima)',
        labelEn: 'Kuva Liches (Grineer Nemesis — Saturn Proxima)',
        sublabelFr: 'Arme livrée prête dans la Fonderie après avoir vaincu votre Liche Kuva',
        sublabelEn: 'Claimed in Foundry after defeating your Kuva Lich',
        chancePct: 100,
        isGuaranteed: true,
        costCredits: null,
        partNameFr: null
      }
    }

    if (TENET_HOLOKEY_MELEE_IDS.has(item.id)) {
      return {
        type: 'syndicate',
        labelFr: 'Ergo Glast dans les Relais — 40 Holoclefs Corrompues',
        labelEn: 'Ergo Glast in Relays — 40 Corrupted Holokeys',
        sublabelFr: 'Rotation de bonus élémentaire tous les 4 jours (Tempêtes du Néant Railjack)',
        sublabelEn: '4-day elemental rotation (Void Storms)',
        chancePct: 100,
        isGuaranteed: true,
        costCredits: null,
        partNameFr: null
      }
    }

    if (item.id.startsWith('tenet-')) {
      return {
        type: 'nemesis',
        labelFr: 'Sœurs de Parvos (Némésis Corpus — Confrontation Neptune Proxima)',
        labelEn: 'Sisters of Parvos (Corpus Nemesis — Neptune Proxima)',
        sublabelFr: 'Arme livrée dans la Fonderie après avoir vaincu votre Sœur de Parvos',
        sublabelEn: 'Claimed in Foundry after defeating your Sister of Parvos',
        chancePct: 100,
        isGuaranteed: true,
        costCredits: null,
        partNameFr: null
      }
    }

    if (item.id.startsWith('coda-') || item.id.startsWith('dual-coda-')) {
      return {
        type: 'nemesis',
        labelFr: 'Technocyte Coda (1999) — Eleanor à Höllvania (10 Cœurs Vivants)',
        labelEn: 'Technocyte Coda (1999) — Eleanor in Höllvania (10 Live Heartcells)',
        sublabelFr: 'Rotation boutique d’Eleanor après confrontation Technocyte Coda',
        sublabelEn: "Eleanor's rotation store",
        chancePct: 100,
        isGuaranteed: true,
        costCredits: null,
        partNameFr: null
      }
    }

    if (HEX_1999_WEAPON_IDS.has(item.id)) {
      return {
        type: 'syndicate',
        labelFr: 'Höllvania 1999 — Syndicat L’Hexagone (Réputation)',
        labelEn: 'Höllvania 1999 — The Hex Syndicate',
        sublabelFr: 'Schéma Principal et composants achetables auprès de l’Hexagone',
        sublabelEn: 'Blueprints purchased for Hex standing',
        chancePct: 100,
        isGuaranteed: true,
        costCredits: null,
        partNameFr: null
      }
    }

    for (const [prefix, labelFr, labelEn] of SYNDICATE_WEAPON_PREFIXES) {
      if (item.id.startsWith(prefix)) {
        return {
          type: 'syndicate',
          labelFr,
          labelEn,
          sublabelFr: 'Arme offerte prête à l’emploi (échangeable si Rang 0 non moddée)',
          sublabelEn: 'Syndicate offering (tradable unranked)',
          chancePct: 100,
          isGuaranteed: true,
          costCredits: null,
          partNameFr: null
        }
      }
    }

    if (item.id.startsWith('dex-')) {
      return {
        type: 'event',
        labelFr: 'Alertes Anniversaire Warframe (Mars / Avril chaque année)',
        labelEn: 'Warframe Anniversary Alerts',
        sublabelFr: 'Arme offerte forgée avec emplacement et Catalyseur Orokin',
        sublabelEn: 'Free built weapon with slot and Catalyst',
        chancePct: 100,
        isGuaranteed: true,
        costCredits: null,
        partNameFr: null
      }
    }

    if (INVASION_WEAPON_IDS.has(item.id)) {
      return {
        type: 'event',
        labelFr: 'Invasions de Faction (Soutenir 3× Grineer ou Corpus)',
        labelEn: 'Faction Invasions (Complete 3 missions)',
        sublabelFr: 'Schéma et pièces reçus en récompense de fin de conflit d’Invasion',
        sublabelEn: 'Blueprint and parts rewarded via Invasion battle pay',
        chancePct: 100,
        isGuaranteed: true,
        costCredits: null,
        partNameFr: null
      }
    }

    if (
      item.id.startsWith('prisma-') ||
      item.id.startsWith('mara-') ||
      (!hasDirectDrops && (item.id.endsWith('-vandal') || item.id.endsWith('-wraith'))) ||
      item.id === 'vastilok' ||
      item.id === 'vericres' ||
      item.id === 'zylok'
    ) {
      return {
        type: 'syndicate',
        labelFr: 'Baro Ki’Teer — Marchand du Néant (Ducats + Crédits)',
        labelEn: "Baro Ki'Teer — Void Trader (Ducats + Credits)",
        sublabelFr: 'En rotation toutes les 2 semaines dans un Relais Tenno (ou échangeable)',
        sublabelEn: 'Bi-weekly Relay rotation or player trading',
        chancePct: 100,
        isGuaranteed: true,
        costCredits: null,
        partNameFr: null
      }
    }

    if (!item.prime && !hasDirectDrops) {
      const hasMainBp = item.components.some((c) => isMainBlueprintComponent(c) && c.drops.length === 0)
      if (hasMainBp) {
        return {
          type: 'shop',
          labelFr: 'Boutique en jeu Warframe — Schéma Principal en Crédits (ou Labo de Clan)',
          labelEn: 'In-Game Market — Main Blueprint for Credits (or Clan Lab)',
          sublabelFr: 'Schéma achetable dans la Console du Marché de l’Orbiteur ou Dojo',
          sublabelEn: 'Blueprint available for Credits in Market Console or Clan Dojo',
          chancePct: 100,
          isGuaranteed: true,
          costCredits: null,
          partNameFr: 'Schéma Principal'
        }
      }
    }

    return null
  }

  public resolveWeapon(item: RawWeapon): {
    drops: CodexDropEntry[]
    components: CodexComponentEntry[]
    acquisitionSources: CodexAcquisitionSource[]
    totalBuildCredits: number | null
    summaryText: string | null
  } {
    const resPartNames = this.buildResourcePartNames(item.components)
    const drops = filterPvEDrops(item.drops, resPartNames)
    const specialSource = this.resolveWeaponSpecialSource(item, drops.length > 0)
    const craftRecipe = this.craftRecipes.weapons[item.id]

    const vaultedPrimeSource: CodexAcquisitionSource | null =
      item.prime && item.vaulted
        ? {
            type: 'relic',
            labelFr: 'En Soute Prime (Vaulted) — Résurgence Prime (Varzia / Aya) ou Marché Joueurs',
            labelEn: 'Prime Vaulted — Prime Resurgence (Varzia / Aya) or Player Trading',
            sublabelFr: 'Reliques échangeables entre joueurs ou lors d’une rotation Varzia',
            sublabelEn: 'Relics available via Varzia rotation or Warframe Market',
            chancePct: 100,
            isGuaranteed: false,
            costCredits: null,
            partNameFr: null
          }
        : null

    const rawMappedComponents = item.components.map((comp) => {
      const injected: CodexAcquisitionSource[] = []
      const isMainBp = isMainBlueprintComponent(comp)
      const isNonResPart = !comp.resSlug

      if (isMainBp && specialSource && comp.drops.length === 0) {
        injected.push({ ...specialSource, partNameFr: comp.name })
      } else if (isNonResPart && specialSource && comp.drops.length === 0 && drops.length === 0) {
        injected.push({ ...specialSource, partNameFr: comp.name })
      }
      if (isNonResPart && vaultedPrimeSource && comp.drops.length === 0) {
        injected.push({ ...vaultedPrimeSource, partNameFr: comp.name })
      }

      const subRec = isNonResPart ? this.resolvePartSubRecipe(comp, craftRecipe) : undefined
      return this.mapSingleComponent(comp, injected, [], subRec)
    })

    const components = this.mergeCraftRecipeComponents(
      rawMappedComponents.filter((c) => !c.isResource),
      rawMappedComponents.filter((c) => c.isResource),
      craftRecipe
    )

    const topLevel: CodexAcquisitionSource[] = []
    if (specialSource) topLevel.push(specialSource)
    for (const d of drops.slice(0, 5)) {
      topLevel.push(dropToSource(d))
    }
    if (vaultedPrimeSource) topLevel.push(vaultedPrimeSource)

    const acquisitionSources = dedupeSources(topLevel)
    const first = acquisitionSources[0]
    const summaryText = first
      ? first.isGuaranteed
        ? first.labelFr
        : `${first.labelFr} (${first.chancePct}%)`
      : null

    return {
      drops,
      components,
      acquisitionSources,
      totalBuildCredits: craftRecipe?.buildCredits ?? null,
      summaryText
    }
  }

  public resolveMod(item: RawMod): {
    drops: CodexDropEntry[]
    acquisitionSources: CodexAcquisitionSource[]
    summaryText: string | null
  } {
    const drops = filterPvEDrops(item.drops)
    const sources: CodexAcquisitionSource[] = drops.slice(0, 5).map(dropToSource)

    if (sources.length === 0) {
      if (item.en.startsWith('Primed ')) {
        sources.push({
          type: 'syndicate',
          labelFr: 'Baro Ki’Teer — Marchand du Néant (Ducats + Crédits)',
          labelEn: "Baro Ki'Teer — Void Trader (Ducats + Credits)",
          sublabelFr: 'Mod Accru en rotation bi-mensuelle au Relais ou échangeable entre joueurs',
          sublabelEn: 'Primed Mod from Baro Ki’Teer or player trading',
          chancePct: 100,
          isGuaranteed: true,
          costCredits: null,
          partNameFr: null
        })
      } else if (item.en.startsWith('Galvanized ')) {
        sources.push({
          type: 'syndicate',
          labelFr: 'Boutique de l’Arbitrage (Arbitres de Hexis — 20 Essences Vitus)',
          labelEn: 'Arbitration Honors (20 Vitus Essence)',
          sublabelFr: 'Échange garanti dans le Relais auprès des Arbitres de Hexis',
          sublabelEn: 'Guaranteed exchange in Relay',
          chancePct: 100,
          isGuaranteed: true,
          costCredits: null,
          partNameFr: null
        })
      } else if (item.en.startsWith('Archon ')) {
        sources.push({
          type: 'syndicate',
          labelFr: 'Garnison de Kahl — Chipper au Camp du Voyageur (Provisions)',
          labelEn: "Kahl's Garrison — Chipper (Stock)",
          sublabelFr: 'Disponible après la quête « Brise-Voile »',
          sublabelEn: 'Available after completing Veilbreaker',
          chancePct: 100,
          isGuaranteed: true,
          costCredits: null,
          partNameFr: null
        })
      }
    }

    const acquisitionSources = dedupeSources(sources)
    const first = acquisitionSources[0]
    const summaryText = first
      ? first.isGuaranteed
        ? first.labelFr
        : `${first.labelFr} (${first.chancePct}%)`
      : null

    return { drops, acquisitionSources, summaryText }
  }

  public resolveRelic(relic: RawRelic): {
    drops: CodexDropEntry[]
    acquisitionSources: CodexAcquisitionSource[]
    summaryText: string | null
  } {
    const drops = filterPvEDrops(relic.drops)
    const sources: CodexAcquisitionSource[] = []

    if (relic.vaulted) {
      sources.push({
        type: 'relic',
        labelFr: 'En Soute Prime (Vaulted) — Résurgence Prime (Varzia contre Aya)',
        labelEn: 'Prime Vaulted — Prime Resurgence (Varzia for Aya)',
        sublabelFr: 'Disponible chez Varzia (Bazar de Maroo) lors de sa rotation ou via échange',
        sublabelEn: 'Available from Varzia during rotation or player trading',
        chancePct: 100,
        isGuaranteed: false,
        costCredits: null,
        partNameFr: null
      })
    }

    for (const d of drops.slice(0, 5)) {
      sources.push(dropToSource(d))
    }

    if (sources.length === 0 && !relic.vaulted) {
      sources.push({
        type: 'syndicate',
        labelFr: 'Packs de Reliques (Syndicats de Faction / Teshin — Honneurs Route de l’Acier)',
        labelEn: 'Relic Packs (Syndicates / Teshin Steel Path Honors)',
        sublabelFr: '20 000 Réputation ou 15 Essences d’Acier pour 3 Reliques',
        sublabelEn: '20,000 Standing or 15 Steel Essence',
        chancePct: 100,
        isGuaranteed: false,
        costCredits: null,
        partNameFr: null
      })
    }

    const acquisitionSources = dedupeSources(sources)
    const first = acquisitionSources[0]
    const summaryText = relic.vaulted
      ? 'Aya (Varzia — Résurgence Prime)'
      : first
        ? first.isGuaranteed
          ? first.labelFr
          : `${first.labelFr} (${first.chancePct}%)`
        : 'Packs de Reliques / Missions'

    return { drops, acquisitionSources, summaryText }
  }
}
