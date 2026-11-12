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
  type CodexDropEntry,
  type CodexItemDetail,
  type CodexSearchParams,
  type CodexSearchResult,
  type CodexSummaryCard,
  type HelminthOverview
} from '@shared/schemas/codex.schema'
import type { MarketApiService } from './MarketApiService'
import {
  CodexRawDatabaseSchema,
  type CodexRawDatabase,
  type RawComponent,
  type RawDrop
} from './codex-raw.schemas'

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function resolveCodexDbPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'codex-db.json')
  }
  const fromOutDir = join(__dirname, '../../resources/codex-db.json')
  if (existsSync(fromOutDir)) return fromOutDir
  return join(app.getAppPath(), 'resources', 'codex-db.json')
}

function mapDropsSorted(drops: readonly RawDrop[]): CodexDropEntry[] {
  return [...drops]
    .sort((a, b) => b.chance - a.chance)
    .map((d) => ({
      part: d.part ?? null,
      location: d.loc,
      chance: d.chance,
      rarity: d.rarity
    }))
}

function mapComponents(components: readonly RawComponent[]): CodexComponentEntry[] {
  return components.map((c) => ({
    nameFr: c.name,
    nameEn: c.en,
    resourceSlug: c.resSlug || null,
    count: c.count,
    imageUrl: toCodexImageUrl(c.img),
    drops: mapDropsSorted(c.drops)
  }))
}

function mapCraftPreview(components: readonly RawComponent[]) {
  const prioritized = [...components].sort((a, b) => {
    const aBp = a.name.toLowerCase().includes('schéma') ? 1 : 0
    const bBp = b.name.toLowerCase().includes('schéma') ? 1 : 0
    return aBp - bBp
  })
  return prioritized.slice(0, 6).map((c) => ({
    nameFr: c.name,
    count: c.count,
    imageUrl: toCodexImageUrl(c.img)
  }))
}

function pickTopDropText(drops: readonly RawDrop[]): string | null {
  if (drops.length === 0) return null
  const best = [...drops].sort((a, b) => b.chance - a.chance)[0]
  if (!best) return null
  return `${best.loc} (${best.chance}%)`
}

function repairRelicRewardName(nameFr: string, nameEn: string): string {
  const trimmed = nameFr.trim()
  if (!trimmed.startsWith('-')) return trimmed
  const primeMatch = /^(.+?\bPrime)\b/i.exec(nameEn.trim())
  return primeMatch?.[1] ? `${primeMatch[1]} ${trimmed}` : nameEn || trimmed
}

export class CodexRepository {
  private db: CodexRawDatabase | null = null
  private loadingPromise: Promise<CodexRawDatabase> | null = null
  private summariesByCat: Record<CodexCategory, CodexSummaryCard[]> | null = null

  public constructor(private readonly marketApi: MarketApiService) {}

  private async ensureLoaded(): Promise<CodexRawDatabase> {
    if (this.db) return this.db
    if (this.loadingPromise) return this.loadingPromise

    this.loadingPromise = (async () => {
      const rawJson = await readFile(resolveCodexDbPath(), 'utf-8')
      const parsed = CodexRawDatabaseSchema.parse(JSON.parse(rawJson))
      this.db = parsed
      this.summariesByCat = this.buildSummaries(parsed)
      return parsed
    })()

    try {
      return await this.loadingPromise
    } finally {
      this.loadingPromise = null
    }
  }

  private buildSummaries(db: CodexRawDatabase): Record<CodexCategory, CodexSummaryCard[]> {
    return {
      resources: db.resources.map((r) => ({
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
        acquisitionText: pickTopDropText(r.drops) ?? (r.planets || null)
      })),
      warframes: db.warframes
        .filter((w) => w.id !== 'helminth')
        .map((w) => {
          const helmMeta = HELMINTH_SUBSUMED_INDEX_BY_WARFRAME[w.id]
          const subAbility =
            helmMeta !== undefined ? w.abilities[helmMeta.abilityIndex]?.name ?? null : null
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
            craftComponents: mapCraftPreview(w.components),
            acquisitionText: pickTopDropText(w.drops)
          }
        }),
      weapons: db.weapons.map((w) => ({
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
        craftComponents: mapCraftPreview(w.components),
        acquisitionText: pickTopDropText(w.drops)
      })),
      mods: db.mods.map((m) => ({
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
        acquisitionText: pickTopDropText(m.drops)
      })),
      relics: db.relics.map((r) => {
        const rare = r.rewards.find((rw) => rw.tier.includes('Rare'))
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
          acquisitionText: r.vaulted
            ? 'Aya (Varzia — Résurgence Prime)'
            : (pickTopDropText(r.drops) ?? 'Packs de Reliques / Missions')
        }
      })
    }
  }

  public async search(params: CodexSearchParams): Promise<CodexSearchResult> {
    await this.ensureLoaded()
    const summaries = this.summariesByCat!
    const q = normalizeText(params.query)
    const db = this.db!

    const filtered = summaries[params.category].filter((card) => {
      if (q) {
        const matchText =
          normalizeText(card.nameFr).includes(q) ||
          normalizeText(card.nameEn).includes(q) ||
          normalizeText(card.subtitle).includes(q)
        if (!matchText) return false
      }
      if (params.variantFilter === 'prime' && !card.isPrime) return false
      if (params.variantFilter === 'standard' && card.isPrime) return false
      if (params.variantFilter === 'tradable' && !card.isTradable) return false
      if (params.variantFilter === 'unvaulted' && card.isVaulted) return false

      if (params.category === 'relics' && params.eraFilter !== 'all') {
        const relic = db.relics.find((r) => r.id === card.id)
        if (!relic || relic.era.toLowerCase() !== params.eraFilter.toLowerCase()) return false
      }
      if (params.category === 'weapons' && params.slotFilter !== 'all') {
        const weapon = db.weapons.find((w) => w.id === card.id)
        if (!weapon || weapon.slot !== params.slotFilter) return false
      }
      return true
    })

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
        relics: summaries.relics.length
      }
    }
  }

  public async quickSearch(query: string, limit = 8): Promise<CodexSummaryCard[]> {
    const q = normalizeText(query)
    if (!q) return []
    await this.ensureLoaded()
    const summaries = this.summariesByCat!
    const matches: CodexSummaryCard[] = []
    const order: readonly CodexCategory[] = ['resources', 'warframes', 'weapons', 'relics', 'mods']
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

    if (category === 'resources') {
      const item = db.resources.find((r) => r.id === id)
      if (!item) throw new Error(`Ressource Codex introuvable : ${id}`)
      const marketSlug = await this.resolveMarketSlug(category, item.id, item.en, false, item.tradable)
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
        drops: mapDropsSorted(item.drops),
        components: [],
        totalUsedFor: item.totalUsedFor,
        usedFor: item.usedFor.map((u) => ({
          category: u.cat,
          id: u.id,
          nameFr: u.name,
          imageUrl: toCodexImageUrl(u.img),
          count: u.count
        }))
      }
    }

    if (category === 'warframes') {
      const item = db.warframes.find((w) => w.id === id)
      if (!item) throw new Error(`Warframe Codex introuvable : ${id}`)
      const helm = HELMINTH_SUBSUMED_INDEX_BY_WARFRAME[item.id]
      const marketSlug = await this.resolveMarketSlug(category, item.id, item.en, item.prime, item.prime)
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
        drops: mapDropsSorted(item.drops),
        components: mapComponents(item.components),
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
        drops: mapDropsSorted(item.drops),
        components: mapComponents(item.components),
        totalUsedFor: 0,
        usedFor: []
      }
    }

    if (category === 'mods') {
      const item = db.mods.find((m) => m.id === id)
      if (!item) throw new Error(`Mod Codex introuvable : ${id}`)
      const marketSlug = await this.resolveMarketSlug(category, item.id, item.en, false, item.tradable)
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
        drops: mapDropsSorted(item.drops),
        components: [],
        totalUsedFor: 0,
        usedFor: []
      }
    }

    const relic = db.relics.find((r) => r.id === id)
    if (!relic) throw new Error(`Relique Codex introuvable : ${id}`)
    const marketSlug = await this.resolveMarketSlug(category, relic.id, relic.en, false, relic.tradable)
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
      drops: mapDropsSorted(relic.drops),
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

