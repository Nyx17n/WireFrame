import type {
  CodexAcquisitionSource,
  CodexAcquisitionSourceType,
  CodexComponentEntry,
  CodexItemDetail
} from '@shared/schemas/codex.schema'
import type {
  CodexOverlayPinnedEntry,
  CodexOverlayPinnedSource
} from '@shared/schemas/extensions.schema'

export type EquipmentPinMode = 'all' | 'parts' | 'resources'

export function getChanceVisualStyle(
  chance: number,
  isGuaranteed: boolean
): { barClass: string; badgeClass: string; textClass: string } {
  if (isGuaranteed || chance >= 99.9) {
    return {
      barClass: 'bg-emerald-500',
      badgeClass: 'border-emerald-500/45 bg-emerald-500/15 text-emerald-300',
      textClass: 'text-emerald-300'
    }
  }
  if (chance >= 30) {
    return {
      barClass: 'bg-sky-500',
      badgeClass: 'border-sky-500/45 bg-sky-500/15 text-sky-300',
      textClass: 'text-sky-300'
    }
  }
  if (chance >= 12) {
    return {
      barClass: 'bg-amber-500',
      badgeClass: 'border-amber-500/45 bg-amber-500/15 text-amber-300',
      textClass: 'text-amber-300'
    }
  }
  if (chance >= 4) {
    return {
      barClass: 'bg-violet-500',
      badgeClass: 'border-violet-500/45 bg-violet-500/15 text-violet-300',
      textClass: 'text-violet-300'
    }
  }
  return {
    barClass: 'bg-rose-500',
    badgeClass: 'border-rose-500/45 bg-rose-500/15 text-rose-300',
    textClass: 'text-rose-300'
  }
}

export function getSourceTypePrefix(type: CodexAcquisitionSourceType): {
  tagFr: string
  badgeClass: string
} {
  switch (type) {
    case 'shop':
      return {
        tagFr: 'Boutique',
        badgeClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
      }
    case 'quest':
      return {
        tagFr: 'Quête',
        badgeClass: 'border-purple-500/40 bg-purple-500/10 text-purple-300'
      }
    case 'dojo':
      return {
        tagFr: 'Dojo',
        badgeClass: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
      }
    case 'duviri':
      return {
        tagFr: 'Duviri',
        badgeClass: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300'
      }
    case 'syndicate':
      return {
        tagFr: 'Syndicat',
        badgeClass: 'border-amber-500/40 bg-amber-500/10 text-amber-300'
      }
    case 'nemesis':
      return {
        tagFr: 'Némésis',
        badgeClass: 'border-rose-500/40 bg-rose-500/10 text-rose-300'
      }
    case 'event':
      return {
        tagFr: 'Événement',
        badgeClass: 'border-orange-500/40 bg-orange-500/10 text-orange-300'
      }
    case 'relic':
      return {
        tagFr: 'Relique',
        badgeClass: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300'
      }
    default:
      return {
        tagFr: 'Drop',
        badgeClass: 'border-sky-500/40 bg-sky-500/10 text-sky-300'
      }
  }
}

function toPinnedSources(
  sources: readonly CodexAcquisitionSource[],
  fallbackText: string
): CodexOverlayPinnedSource[] {
  if (sources.length === 0) {
    return [
      {
        type: 'drop',
        labelFr: fallbackText,
        sublabelFr: null,
        chancePct: 100,
        isGuaranteed: false
      }
    ]
  }
  return sources.slice(0, 4).map((s) => ({
    type: s.type,
    labelFr: s.labelFr,
    sublabelFr: s.sublabelFr,
    chancePct: s.chancePct,
    isGuaranteed: s.isGuaranteed
  }))
}

export function buildItemKey(category: CodexItemDetail['category'], id: string): string {
  return `${category}:${id}`
}

export function buildSingleItemOverlayEntry(detail: CodexItemDetail): CodexOverlayPinnedEntry {
  const itemKey = buildItemKey(detail.category, detail.id)
  const fallback =
    detail.category === 'relics' && detail.isVaulted
      ? 'En Soute Prime (Varzia — Aya / Marché Joueurs)'
      : detail.planets || 'Consulter la fiche Codex'

  return {
    entryId: itemKey,
    itemKey,
    category: detail.category,
    itemId: detail.id,
    itemNameFr: detail.nameFr,
    partKey: null,
    labelFr: detail.nameFr,
    groupLabelFr: detail.typeLabel,
    imageUrl: detail.imageUrl,
    isResource: detail.category === 'resources',
    requiredCount: null,
    obtained: false,
    sources: toPinnedSources(detail.acquisitionSources, fallback)
  }
}

export function buildComponentOverlayEntry(
  detail: CodexItemDetail,
  comp: CodexComponentEntry,
  idx = 0
): CodexOverlayPinnedEntry {
  const itemKey = buildItemKey(detail.category, detail.id)
  const cleanSlug =
    comp.nameFr
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `part-${idx}`
  const partKey = comp.isResource
    ? `res-${comp.resourceSlug ?? cleanSlug}`
    : `part-${cleanSlug}`

  const displayLabel = comp.isResource ? comp.nameFr : `${detail.nameFr} — ${comp.nameFr}`

  return {
    entryId: `${itemKey}::${partKey}`,
    itemKey,
    category: detail.category,
    itemId: detail.id,
    itemNameFr: detail.nameFr,
    partKey,
    labelFr: displayLabel,
    groupLabelFr: comp.isResource ? `Ressource craft · ${detail.nameFr}` : detail.nameFr,
    imageUrl: comp.imageUrl ?? detail.imageUrl,
    isResource: comp.isResource,
    requiredCount: comp.isResource || comp.count > 1 ? comp.count : null,
    obtained: false,
    sources: toPinnedSources(
      comp.acquisitionSources.length > 0 ? comp.acquisitionSources : detail.acquisitionSources,
      'Source liée à l’équipement principal'
    )
  }
}

export function getEquipmentEntriesByMode(
  detail: CodexItemDetail,
  mode: EquipmentPinMode
): CodexOverlayPinnedEntry[] {
  const nonResComponents = detail.components
    .map((c, idx) => ({ c, idx }))
    .filter(({ c }) => !c.isResource)
    .map(({ c, idx }) => buildComponentOverlayEntry(detail, c, idx))

  const resComponents = detail.components
    .map((c, idx) => ({ c, idx }))
    .filter(({ c }) => c.isResource)
    .map(({ c, idx }) => buildComponentOverlayEntry(detail, c, idx))

  const baseParts =
    nonResComponents.length > 0 ? nonResComponents : [buildSingleItemOverlayEntry(detail)]

  if (mode === 'resources') {
    return resComponents
  }
  if (mode === 'parts') {
    return baseParts
  }
  return [...baseParts, ...resComponents]
}
