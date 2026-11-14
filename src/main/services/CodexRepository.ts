import { app } from 'electron'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  HELMINTH_SECRETIONS,
  HELMINTH_SUBSUMED_INDEX_BY_WARFRAME
} from '@shared/data/helminth-subsumed'
import {
  toCodexImageUrl,
  type CodexCategory,
  type CodexComponentEntry,
  type CodexItemDetail,
  type CodexSearchParams,
  type CodexSearchResult,
  type CodexSummaryCard,
  type HelminthOverview
} from '@shared/schemas/codex.schema'
import type { MarketApiService } from './MarketApiService'
import { CodexAcquisitionResolver } from './CodexAcquisitionResolver'
import {
  CodexCraftRecipesDatabaseSchema,
  CodexMobsVendorsDatabaseSchema,
  CodexRawDatabaseSchema,
  type CodexCraftRecipesDatabase,
  type CodexMobsVendorsDatabase,
  type CodexRawDatabase
} from './codex-raw.schemas'

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function resolveResourceFilePath(filename: string): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, filename)
  }
  const fromOutDir = join(__dirname, `../../resources/${filename}`)
  if (existsSync(fromOutDir)) return fromOutDir
  return join(app.getAppPath(), 'resources', filename)
}

function mapResolvedCraftPreview(components: readonly CodexComponentEntry[]) {
  // Prioritize real Foundry crafting resources first so Warframe & Weapon cards show required materials
  const resourcesOnly = components.filter((c) => c.isResource)
  const source = resourcesOnly.length > 0 ? resourcesOnly : components
  const prioritized = [...source].sort((a, b) => {
    const aBp = a.nameFr.toLowerCase().includes('schéma') ? 1 : 0
    const bBp = b.nameFr.toLowerCase().includes('schéma') ? 1 : 0
    return aBp - bBp
  })
  return prioritized.slice(0, 6).map((c) => ({
    nameFr: c.nameFr,
    count: c.count,
    imageUrl: c.imageUrl
  }))
}

function repairRelicRewardName(nameFr: string, nameEn: string): string {
  const trimmed = nameFr.trim()
  if (!trimmed.startsWith('-')) return trimmed
  const primeMatch = /^(.+?\bPrime)\b/i.exec(nameEn.trim())
  return primeMatch?.[1] ? `${primeMatch[1]} ${trimmed}` : nameEn || trimmed
}

export class CodexRepository {
  private db: CodexRawDatabase | null = null
  private craftRecipes: CodexCraftRecipesDatabase | null = null
  private mobsVendors: CodexMobsVendorsDatabase | null = null
  private resolver: CodexAcquisitionResolver | null = null
  private loadingPromise: Promise<CodexRawDatabase> | null = null
  private summariesByCat: Record<CodexCategory, CodexSummaryCard[]> | null = null

  public constructor(private readonly marketApi: MarketApiService) {}

  private async ensureLoaded(): Promise<CodexRawDatabase> {
    if (this.db) return this.db
    if (this.loadingPromise) return this.loadingPromise

    this.loadingPromise = (async () => {
      const rawJson = await readFile(resolveResourceFilePath('codex-db.json'), 'utf-8')
      const parsed = CodexRawDatabaseSchema.parse(JSON.parse(rawJson))

      let craftRecipes: CodexCraftRecipesDatabase = { warframes: {}, weapons: {} }
      const craftPath = resolveResourceFilePath('codex-craft-recipes.json')
      if (existsSync(craftPath)) {
        const rawCraft = await readFile(craftPath, 'utf-8')
        craftRecipes = CodexCraftRecipesDatabaseSchema.parse(JSON.parse(rawCraft))
      }

      let mobsVendors: CodexMobsVendorsDatabase = { mobs: [], vendors: [] }
      const mvPath = resolveResourceFilePath('codex-mobs-vendors.json')
      if (existsSync(mvPath)) {
        const rawMv = await readFile(mvPath, 'utf-8')
        mobsVendors = CodexMobsVendorsDatabaseSchema.parse(JSON.parse(rawMv))
      }

      const resolver = new CodexAcquisitionResolver(parsed, craftRecipes)
      this.db = parsed
      this.craftRecipes = craftRecipes
      this.mobsVendors = mobsVendors
      this.resolver = resolver
      this.summariesByCat = this.buildSummaries(parsed, resolver, mobsVendors)
      return parsed
    })()

    try {
      return await this.loadingPromise
    } finally {
      this.loadingPromise = null
    }
  }

  private buildSummaries(
    db: CodexRawDatabase,
    resolver: CodexAcquisitionResolver,
    mv: CodexMobsVendorsDatabase
  ): Record<CodexCategory, CodexSummaryCard[]> {
    return {
      resources: db.resources.map((r) => {
        const resolved = resolver.resolveResource(r)
        return {
          id: r.id,
          category: 'resources',
          nameFr: r.name,
          nameEn: r.en,
          imageUrl: toCodexImageUrl(r.img),
          badgeText: r.totalUsedFor > 0 ? `${r.totalUsedFor} crafts` : 'Ressource',
          subtitle: (r.planets || r.type).slice(0, 240),
          isPrime: false,
          isVaulted: false,
          isTradable: r.tradable,
          craftComponents: [],
          acquisitionText: resolved.summaryText
        }
      }),
      warframes: db.warframes
        .filter((w) => w.id !== 'helminth')
        .map((w) => {
          const helmMeta = HELMINTH_SUBSUMED_INDEX_BY_WARFRAME[w.id]
          const subAbility =
            helmMeta !== undefined ? w.abilities[helmMeta.abilityIndex]?.name ?? null : null
          const resolved = resolver.resolveWarframe(w)
          return {
            id: w.id,
            category: 'warframes',
            nameFr: w.name,
            nameEn: w.en,
            imageUrl: toCodexImageUrl(w.img),
            badgeText: w.prime ? (w.vaulted ? 'Prime · Vault' : 'Prime') : `MR ${w.mr}`,
            subtitle: subAbility ? `Helminth : ${subAbility}` : `Santé ${w.hp} · Armure ${w.ar}`,
            isPrime: w.prime,
            isVaulted: w.vaulted,
            isTradable: w.prime,
            subsumedAbilityName: subAbility,
            craftComponents: mapResolvedCraftPreview(resolved.components),
            acquisitionText: resolved.summaryText
          }
        }),
      weapons: db.weapons.map((w) => {
        const resolved = resolver.resolveWeapon(w)
        return {
          id: w.id,
          category: 'weapons',
          nameFr: w.name,
          nameEn: w.en,
          imageUrl: toCodexImageUrl(w.img),
          badgeText: w.slotLabel,
          subtitle: `MR ${w.mr} · Crit ${w.cc}% · Statut ${w.sc}%`,
          isPrime: w.prime,
          isVaulted: w.vaulted,
          isTradable: w.tradable || w.prime,
          craftComponents: mapResolvedCraftPreview(resolved.components),
          acquisitionText: resolved.summaryText
        }
      }),
      mods: db.mods.map((m) => {
        const resolved = resolver.resolveMod(m)
        return {
          id: m.id,
          category: 'mods',
          nameFr: m.name,
          nameEn: m.en,
          imageUrl: toCodexImageUrl(m.img),
          badgeText: m.rarity,
          subtitle: `${m.compat || m.type} · Rang max ${m.maxRank}`,
          isPrime: m.en.startsWith('Primed '),
          isVaulted: false,
          isTradable: m.tradable,
          craftComponents: [],
          acquisitionText: resolved.summaryText
        }
      }),
      relics: db.relics.map((r) => {
        const rare = r.rewards.find((rw) => rw.tier.includes('Rare'))
        const resolved = resolver.resolveRelic(r)
        return {
          id: r.id,
          category: 'relics',
          nameFr: r.name,
          nameEn: r.en,
          imageUrl: toCodexImageUrl(r.img),
          badgeText: r.vaulted ? `${r.era} · Vault` : r.era,
          subtitle: rare ? `Or : ${repairRelicRewardName(rare.name, rare.en)}` : `Relique ${r.era}`,
          isPrime: false,
          isVaulted: r.vaulted,
          isTradable: r.tradable,
          craftComponents: [],
          acquisitionText: resolved.summaryText
        }
      }),
      mobs: mv.mobs.map((m) => {
        const tierLabel =
          m.unitTier === 'boss' ? 'Boss' : m.unitTier === 'eximus' ? 'Élite / Lourd' : 'Standard'
        const topSpawn = m.spawns[0]
        return {
          id: m.id,
          category: 'mobs',
          nameFr: m.name,
          nameEn: m.en,
          imageUrl: toCodexImageUrl(m.img),
          badgeText: `${m.factionFr} · ${tierLabel}`,
          subtitle:
            m.planetsFr.length > 0
              ? `📍 ${m.planetsFr.slice(0, 4).join(', ')}`
              : topSpawn?.locationFr ?? m.factionFr,
          isPrime: false,
          isVaulted: false,
          isTradable: false,
          craftComponents: [],
          acquisitionText: topSpawn?.locationFr ?? null,
          mobSpawnChancePct: topSpawn?.spawnChancePct ?? null,
          topDropsPreview: m.drops.slice(0, 2).map((d) => ({
            nameFr: d.nameFr,
            chancePct: d.chancePct
          }))
        }
      }),
      vendors: mv.vendors.map((v) => ({
        id: v.id,
        category: 'vendors',
        nameFr: v.name,
        nameEn: v.en,
        imageUrl: toCodexImageUrl(v.img),
        badgeText: `${v.offerings.length} offres`,
        subtitle: `📍 ${v.planetFr} · ${v.hubFr}`,
        isPrime: false,
        isVaulted: false,
        isTradable: false,
        craftComponents: [],
        acquisitionText: `${v.roleFr}`,
        vendorCurrenciesFr: v.currencies.map((c) => c.nameFr).slice(0, 2),
        matchedOfferingPreview: null
      }))
    }
  }

  public async search(params: CodexSearchParams): Promise<CodexSearchResult> {
    await this.ensureLoaded()
    const summaries = this.summariesByCat!
    const q = normalizeText(params.query)
    const db = this.db!
    const mv = this.mobsVendors!

    const mobById =
      params.category === 'mobs' ? new Map(mv.mobs.map((m) => [m.id, m])) : null
    const vendorById =
      params.category === 'vendors' ? new Map(mv.vendors.map((v) => [v.id, v])) : null

    const filtered: CodexSummaryCard[] = []

    for (const card of summaries[params.category]) {
      if (params.category === 'mobs' && mobById) {
        const mob = mobById.get(card.id)
        if (!mob) continue
        if (params.factionFilter !== 'all' && mob.factionId !== params.factionFilter) continue
        if (params.unitTierFilter !== 'all' && mob.unitTier !== params.unitTierFilter) continue

        if (q) {
          const directHit =
            normalizeText(card.nameFr).includes(q) ||
            normalizeText(card.nameEn).includes(q) ||
            mob.planetsFr.some((p) => normalizeText(p).includes(q)) ||
            mob.planetsEn.some((p) => normalizeText(p).includes(q)) ||
            mob.spawns.some((s) => normalizeText(s.locationFr).includes(q))

          const matchedDrop = mob.drops.find(
            (d) => normalizeText(d.nameFr).includes(q) || normalizeText(d.nameEn).includes(q)
          )

          if (!directHit && !matchedDrop) continue

          if (matchedDrop) {
            const others = mob.drops.filter((d) => d !== matchedDrop).slice(0, 1)
            filtered.push({
              ...card,
              topDropsPreview: [matchedDrop, ...others].map((d) => ({
                nameFr: d.nameFr,
                chancePct: d.chancePct
              }))
            })
            continue
          }
        }
        filtered.push(card)
        continue
      }

      if (params.category === 'vendors' && vendorById) {
        const vendor = vendorById.get(card.id)
        if (!vendor) continue
        if (params.hubFilter !== 'all' && vendor.hubGroup !== params.hubFilter) continue

        if (q) {
          const directHit =
            normalizeText(card.nameFr).includes(q) ||
            normalizeText(card.nameEn).includes(q) ||
            normalizeText(vendor.planetFr).includes(q) ||
            normalizeText(vendor.hubFr).includes(q) ||
            normalizeText(vendor.roleFr).includes(q) ||
            vendor.currencies.some((c) => normalizeText(c.nameFr).includes(q))

          const matchedOff = vendor.offerings.find(
            (o) => normalizeText(o.nameFr).includes(q) || normalizeText(o.nameEn).includes(q)
          )

          if (!directHit && !matchedOff) continue

          if (matchedOff) {
            const costStr = matchedOff.costs
              .map((c) => `${c.amount.toLocaleString('fr-FR')} ${c.currencyFr}`)
              .join(' + ')
            filtered.push({
              ...card,
              matchedOfferingPreview: `Vend : ${matchedOff.nameFr} (${costStr})`.slice(0, 300)
            })
            continue
          }
        }
        filtered.push(card)
        continue
      }

      if (q) {
        const matchText =
          normalizeText(card.nameFr).includes(q) ||
          normalizeText(card.nameEn).includes(q) ||
          normalizeText(card.subtitle).includes(q) ||
          normalizeText(card.acquisitionText ?? '').includes(q)
        if (!matchText) continue
      }
      if (params.variantFilter === 'prime' && !card.isPrime) continue
      if (params.variantFilter === 'standard' && card.isPrime) continue
      if (params.variantFilter === 'tradable' && !card.isTradable) continue
      if (params.variantFilter === 'unvaulted' && card.isVaulted) continue

      if (params.category === 'relics' && params.eraFilter !== 'all') {
        const relic = db.relics.find((r) => r.id === card.id)
        if (!relic || relic.era.toLowerCase() !== params.eraFilter.toLowerCase()) continue
      }
      if (params.category === 'weapons' && params.slotFilter !== 'all') {
        const weapon = db.weapons.find((w) => w.id === card.id)
        if (!weapon || weapon.slot !== params.slotFilter) continue
      }
      filtered.push(card)
    }

    const start = (params.page - 1) * params.pageSize
    return {
      items: filtered.slice(start, start + params.pageSize),
      total: filtered.length,
      page: params.page,
      pageSize: params.pageSize,
      categoryCounts: {
        resources: summaries.resources.length,
        warframes: summaries.warframes.length,
        weapons: summaries.weapons.length,
        mods: summaries.mods.length,
        relics: summaries.relics.length,
        mobs: summaries.mobs.length,
        vendors: summaries.vendors.length
      }
    }
  }

  public async quickSearch(query: string, limit = 8): Promise<CodexSummaryCard[]> {
    const q = normalizeText(query)
    if (!q) return []
    await this.ensureLoaded()
    const summaries = this.summariesByCat!
    const matches: CodexSummaryCard[] = []
    const order: readonly CodexCategory[] = [
      'resources',
      'warframes',
      'weapons',
      'vendors',
      'mobs',
      'relics',
      'mods'
    ]
    for (const cat of order) {
      for (const card of summaries[cat]) {
        if (matches.length >= limit) return matches
        if (normalizeText(card.nameFr).includes(q) || normalizeText(card.nameEn).includes(q)) {
          matches.push(card)
        }
      }
    }
    return matches
  }

  private async resolveMarketSlug(
    category: CodexCategory,
    id: string,
    nameEn: string,
    isPrime: boolean,
    isTradable: boolean
  ): Promise<string | null> {
    if (!isTradable && !isPrime) return null
    const base = id.replace(/-/g, '_')
    const candidates =
      category === 'relics'
        ? [`${base}_relic`, `${base}_intact`]
        : category === 'warframes' || (category === 'weapons' && isPrime)
          ? [`${base}_set`, base]
          : [base, `${base}_set`]

    try {
      const catalog = await this.marketApi.getCatalog(false)
      const slugSet = new Set(catalog.map((c) => c.slug))
      for (const cand of candidates) {
        if (slugSet.has(cand)) return cand
      }
      const normEn = normalizeText(nameEn)
      const byName = catalog.find(
        (c) =>
          normalizeText(c.nameEn) === normEn || normalizeText(c.nameEn) === `${normEn} set`
      )
      return byName?.slug ?? null
    } catch {
      return candidates[0] ?? null
    }
  }

  public async getItemDetail(category: CodexCategory, id: string): Promise<CodexItemDetail> {
    const db = await this.ensureLoaded()
    const resolver = this.resolver!

    if (category === 'resources') {
      const item = db.resources.find((r) => r.id === id)
      if (!item) throw new Error(`Ressource Codex introuvable : ${id}`)
      const marketSlug = await this.resolveMarketSlug(category, item.id, item.en, false, item.tradable)
      const resolved = resolver.resolveResource(item)

      const usedForMap = new Map<
        string,
        { category: 'warframes' | 'weapons'; id: string; nameFr: string; imageUrl: string | null; count: number }
      >()
      for (const u of item.usedFor) {
        usedForMap.set(`${u.cat}:${u.id}`, {
          category: u.cat,
          id: u.id,
          nameFr: u.name,
          imageUrl: toCodexImageUrl(u.img),
          count: u.count
        })
      }
      if (this.craftRecipes) {
        for (const wf of db.warframes) {
          if (wf.id === 'helminth') continue
          const found = this.craftRecipes.warframes[wf.id]?.totalResources.find(
            (tr) => tr.resSlug === item.id
          )
          if (found) {
            usedForMap.set(`warframes:${wf.id}`, {
              category: 'warframes',
              id: wf.id,
              nameFr: wf.name,
              imageUrl: toCodexImageUrl(wf.img),
              count: found.count
            })
          }
        }
        for (const wep of db.weapons) {
          const found = this.craftRecipes.weapons[wep.id]?.totalResources.find(
            (tr) => tr.resSlug === item.id
          )
          if (found) {
            usedForMap.set(`weapons:${wep.id}`, {
              category: 'weapons',
              id: wep.id,
              nameFr: wep.name,
              imageUrl: toCodexImageUrl(wep.img),
              count: found.count
            })
          }
        }
      }
      const mergedUsedFor = Array.from(usedForMap.values())

      return {
        id: item.id,
        category,
        nameFr: item.name,
        nameEn: item.en,
        imageUrl: toCodexImageUrl(item.img),
        descriptionFr: item.desc,
        typeLabel: 'Ressource & Matériau de Fonderie',
        isPrime: false,
        isVaulted: false,
        isTradable: item.tradable,
        marketSlug,
        planets: item.planets || null,
        utility: item.utility || null,
        warframeStats: null,
        abilities: [],
        weaponStats: null,
        modStats: null,
        relicInfo: null,
        mobInfo: null,
        vendorInfo: null,
        drops: resolved.drops,
        acquisitionSources: resolved.acquisitionSources,
        totalBuildCredits: null,
        components: [],
        totalUsedFor: Math.max(item.totalUsedFor, mergedUsedFor.length),
        usedFor: mergedUsedFor.slice(0, 60)
      }
    }

    if (category === 'warframes') {
      const item = db.warframes.find((w) => w.id === id)
      if (!item) throw new Error(`Warframe Codex introuvable : ${id}`)
      const helm = HELMINTH_SUBSUMED_INDEX_BY_WARFRAME[item.id]
      const marketSlug = await this.resolveMarketSlug(category, item.id, item.en, item.prime, item.prime)
      const resolved = resolver.resolveWarframe(item)
      return {
        id: item.id,
        category,
        nameFr: item.name,
        nameEn: item.en,
        imageUrl: toCodexImageUrl(item.img),
        descriptionFr: item.desc,
        typeLabel: item.prime ? 'Warframe Prime' : 'Warframe',
        isPrime: item.prime,
        isVaulted: item.vaulted,
        isTradable: item.prime,
        marketSlug,
        planets: null,
        utility: null,
        warframeStats: {
          masteryRank: item.mr,
          health: item.hp,
          shield: item.sh,
          armor: item.ar,
          energy: item.enMax,
          sprintSpeed: item.spd,
          auraPolarity: item.aura,
          polarities: item.pol,
          passiveFr: item.passive
        },
        abilities: item.abilities.map((ab, idx) => ({
          nameFr: ab.name,
          descriptionFr: ab.desc,
          imageUrl: toCodexImageUrl(ab.img),
          isSubsumed: helm?.abilityIndex === idx
        })),
        weaponStats: null,
        modStats: null,
        relicInfo: null,
        mobInfo: null,
        vendorInfo: null,
        drops: resolved.drops,
        acquisitionSources: resolved.acquisitionSources,
        totalBuildCredits: resolved.totalBuildCredits,
        components: resolved.components,
        totalUsedFor: 0,
        usedFor: []
      }
    }

    if (category === 'weapons') {
      const item = db.weapons.find((w) => w.id === id)
      if (!item) throw new Error(`Arme Codex introuvable : ${id}`)
      const marketSlug = await this.resolveMarketSlug(
        category,
        item.id,
        item.en,
        item.prime,
        item.tradable
      )
      const resolved = resolver.resolveWeapon(item)
      return {
        id: item.id,
        category,
        nameFr: item.name,
        nameEn: item.en,
        imageUrl: toCodexImageUrl(item.img),
        descriptionFr: item.desc,
        typeLabel: `${item.slotLabel} · ${item.type}`,
        isPrime: item.prime,
        isVaulted: item.vaulted,
        isTradable: item.tradable || item.prime,
        marketSlug,
        planets: null,
        utility: null,
        warframeStats: null,
        abilities: [],
        weaponStats: {
          slotLabel: item.slotLabel,
          masteryRank: item.mr,
          critChance: item.cc,
          critMultiplier: item.cd,
          statusChance: item.sc,
          fireRate: item.fr,
          totalDamage: item.dmg,
          rivenDisposition: item.disp
        },
        modStats: null,
        relicInfo: null,
        mobInfo: null,
        vendorInfo: null,
        drops: resolved.drops,
        acquisitionSources: resolved.acquisitionSources,
        totalBuildCredits: resolved.totalBuildCredits,
        components: resolved.components,
        totalUsedFor: 0,
        usedFor: []
      }
    }

    if (category === 'mods') {
      const item = db.mods.find((m) => m.id === id)
      if (!item) throw new Error(`Mod Codex introuvable : ${id}`)
      const marketSlug = await this.resolveMarketSlug(category, item.id, item.en, false, item.tradable)
      const resolved = resolver.resolveMod(item)
      return {
        id: item.id,
        category,
        nameFr: item.name,
        nameEn: item.en,
        imageUrl: toCodexImageUrl(item.img),
        descriptionFr: item.stats.join('\n'),
        typeLabel: item.type,
        isPrime: item.en.startsWith('Primed '),
        isVaulted: false,
        isTradable: item.tradable,
        marketSlug,
        planets: null,
        utility: null,
        warframeStats: null,
        abilities: [],
        weaponStats: null,
        modStats: {
          compatibility: item.compat || item.type,
          polarity: item.pol || 'Aucune',
          rarity: item.rarity,
          baseDrain: item.drain,
          maxRank: item.maxRank,
          effects: item.stats
        },
        relicInfo: null,
        mobInfo: null,
        vendorInfo: null,
        drops: resolved.drops,
        acquisitionSources: resolved.acquisitionSources,
        totalBuildCredits: null,
        components: [],
        totalUsedFor: 0,
        usedFor: []
      }
    }

    if (category === 'mobs') {
      const mv = this.mobsVendors!
      const mob = mv.mobs.find((m) => m.id === id)
      if (!mob) throw new Error(`Mob Codex introuvable : ${id}`)
      const tierLabel =
        mob.unitTier === 'boss' ? 'Boss' : mob.unitTier === 'eximus' ? 'Élite / Lourd' : 'Unité Standard'
      const topDropPreview =
        mob.drops.length > 0
          ? `Drops : ${mob.drops
              .slice(0, 2)
              .map((d) => `${d.nameFr} (${d.chancePct}%)`)
              .join(' · ')}`
          : null

      return {
        id: mob.id,
        category: 'mobs',
        nameFr: mob.name,
        nameEn: mob.en,
        imageUrl: toCodexImageUrl(mob.img),
        descriptionFr:
          mob.desc ||
          `Unité ${mob.factionFr} (${tierLabel}). Consultez ci-dessous ses localisations d’apparition (% de spawn) et sa table complète de butin.`,
        typeLabel: `${mob.factionFr} · ${tierLabel}`,
        isPrime: false,
        isVaulted: false,
        isTradable: false,
        marketSlug: null,
        planets: mob.planetsFr.length > 0 ? mob.planetsFr.join(', ') : null,
        utility: null,
        warframeStats: null,
        abilities: [],
        weaponStats: null,
        modStats: null,
        relicInfo: null,
        mobInfo: {
          factionId: mob.factionId,
          factionFr: mob.factionFr,
          factionEn: mob.factionEn,
          unitTier: mob.unitTier,
          health: mob.health,
          shield: mob.shield,
          armor: mob.armor,
          scansRequired: mob.scansRequired,
          weaknessesFr: mob.weaknessesFr,
          resistancesFr: mob.resistancesFr,
          planetsFr: mob.planetsFr,
          spawns: mob.spawns.map((s) => ({
            locationFr: s.locationFr,
            locationEn: s.locationEn,
            conditionFr: s.conditionFr ?? null,
            spawnChancePct: s.spawnChancePct
          })),
          mobDrops: mob.drops.map((d) => ({
            nameFr: d.nameFr,
            nameEn: d.nameEn,
            chancePct: d.chancePct,
            rarity: d.rarity,
            typeLabelFr: d.typeLabelFr,
            linkedCodexId: d.linkedCodexId ?? null,
            linkedCategory: d.linkedCategory ?? null
          }))
        },
        vendorInfo: null,
        drops: mob.drops.map((d) => ({
          part: d.typeLabelFr,
          location: d.nameFr,
          chance: d.chancePct,
          rarity: d.rarity
        })),
        acquisitionSources: mob.spawns.slice(0, 4).map((s, idx) => ({
          type: 'drop' as const,
          labelFr: s.locationFr,
          labelEn: s.locationEn || s.locationFr,
          sublabelFr: idx === 0 && topDropPreview ? topDropPreview : (s.conditionFr ?? null),
          sublabelEn: s.conditionFr ?? null,
          chancePct: s.spawnChancePct,
          isGuaranteed: s.spawnChancePct >= 99.9,
          costCredits: null,
          partNameFr: null
        })),
        totalBuildCredits: null,
        components: [],
        totalUsedFor: 0,
        usedFor: []
      }
    }

    if (category === 'vendors') {
      const mv = this.mobsVendors!
      const vendor = mv.vendors.find((v) => v.id === id)
      if (!vendor) throw new Error(`Marchand Codex introuvable : ${id}`)

      return {
        id: vendor.id,
        category: 'vendors',
        nameFr: vendor.name,
        nameEn: vendor.en,
        imageUrl: toCodexImageUrl(vendor.img),
        descriptionFr: vendor.roleFr,
        typeLabel: `Marchand · ${vendor.planetFr}`,
        isPrime: false,
        isVaulted: false,
        isTradable: false,
        marketSlug: null,
        planets: `${vendor.planetFr} — ${vendor.hubFr}`,
        utility: null,
        warframeStats: null,
        abilities: [],
        weaponStats: null,
        modStats: null,
        relicInfo: null,
        mobInfo: null,
        vendorInfo: {
          roleFr: vendor.roleFr,
          roleEn: vendor.roleEn,
          hubGroup: vendor.hubGroup,
          planetFr: vendor.planetFr,
          planetEn: vendor.planetEn,
          hubFr: vendor.hubFr,
          hubEn: vendor.hubEn,
          zoneFr: vendor.zoneFr,
          unlockQuestFr: vendor.unlockQuestFr || null,
          currencies: vendor.currencies.map((c) => ({
            nameFr: c.nameFr,
            howToGetFr: c.howToGetFr ?? null
          })),
          offerings: vendor.offerings.map((o) => ({
            id: o.id,
            nameFr: o.nameFr,
            nameEn: o.nameEn,
            category: o.category,
            imageUrl: toCodexImageUrl(o.imageName),
            rankRequiredFr: o.rankRequiredFr ?? null,
            costs: o.costs,
            linkedCodexId: o.linkedCodexId ?? null,
            linkedCategory: o.linkedCategory ?? null,
            isTradable: o.isTradable
          }))
        },
        drops: [],
        acquisitionSources: [
          {
            type: 'syndicate',
            labelFr: `${vendor.planetFr} → ${vendor.hubFr}`,
            labelEn: `${vendor.planetEn} → ${vendor.hubEn}`,
            sublabelFr: vendor.zoneFr.slice(0, 300),
            sublabelEn: null,
            chancePct: 100,
            isGuaranteed: true,
            costCredits: null,
            partNameFr: null
          }
        ],
        totalBuildCredits: null,
        components: [],
        totalUsedFor: 0,
        usedFor: []
      }
    }

    const relic = db.relics.find((r) => r.id === id)
    if (!relic) throw new Error(`Relique Codex introuvable : ${id}`)
    const marketSlug = await this.resolveMarketSlug(category, relic.id, relic.en, false, relic.tradable)
    const resolved = resolver.resolveRelic(relic)
    return {
      id: relic.id,
      category,
      nameFr: relic.name,
      nameEn: relic.en,
      imageUrl: toCodexImageUrl(relic.img),
      descriptionFr: `Relique du Néant d’ère ${relic.era}. Peut être ouverte lors des missions de Fissures du Néant ${relic.era}.`,
      typeLabel: `Relique ${relic.era}`,
      isPrime: false,
      isVaulted: relic.vaulted,
      isTradable: relic.tradable,
      marketSlug,
      planets: null,
      utility: null,
      warframeStats: null,
      abilities: [],
      weaponStats: null,
      modStats: null,
      relicInfo: {
        era: relic.era,
        rewards: relic.rewards.map((rw) => ({
          nameFr: repairRelicRewardName(rw.name, rw.en),
          nameEn: rw.en,
          tier: rw.tier,
          intactChance: rw.chance,
          radiantChance: rw.radChance
        }))
      },
      mobInfo: null,
      vendorInfo: null,
      drops: resolved.drops,
      acquisitionSources: resolved.acquisitionSources,
      totalBuildCredits: null,
      components: [],
      totalUsedFor: 0,
      usedFor: []
    }
  }

  public async getHelminth(): Promise<HelminthOverview> {
    const db = await this.ensureLoaded()
    const helminthEntry = db.warframes.find((w) => w.id === 'helminth')
    const resourceMap = new Map(db.resources.map((r) => [r.id, r]))

    const subsumableWarframes = db.warframes
      .filter((w) => !w.prime && w.id !== 'helminth' && HELMINTH_SUBSUMED_INDEX_BY_WARFRAME[w.id])
      .map((w) => {
        const meta = HELMINTH_SUBSUMED_INDEX_BY_WARFRAME[w.id]!
        const ab = w.abilities[meta.abilityIndex] ?? w.abilities[0]
        return {
          warframeId: w.id,
          warframeNameFr: w.name,
          warframeImageUrl: toCodexImageUrl(w.img),
          abilityNameFr: ab?.name ?? 'Compétence Helminth',
          abilityDescriptionFr: ab?.desc ?? '',
          abilityImageUrl: toCodexImageUrl(ab?.img),
          isMeta: Boolean(meta.isMeta)
        }
      })
      .sort((a, b) => a.warframeNameFr.localeCompare(b.warframeNameFr, 'fr'))

    return {
      descriptionFr:
        helminthEntry?.desc ||
        'Assimilateur biologique de l’Orbiteur permettant de sacrifier une Warframe standard pour infuser l’une de ses compétences sur n’importe quelle autre Warframe.',
      exclusiveAbilities: (helminthEntry?.abilities ?? []).map((ab) => ({
        nameFr: ab.name,
        descriptionFr: ab.desc,
        imageUrl: toCodexImageUrl(ab.img)
      })),
      subsumableWarframes,
      secretions: HELMINTH_SECRETIONS.map((sec) => ({
        id: sec.id,
        nameFr: sec.nameFr,
        descriptionFr: sec.descriptionFr,
        bestResources: sec.bestResources.map((br) => ({
          slug: br.slug,
          labelFr: br.labelFr,
          imageUrl: toCodexImageUrl(resourceMap.get(br.slug)?.img)
        }))
      }))
    }
  }
}

