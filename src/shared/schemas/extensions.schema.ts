import { z } from 'zod'
import { CodexAcquisitionSourceTypeSchema, CodexCategorySchema } from './codex.schema'

export const ExtensionIdSchema = z.enum(['codex-farm-overlay', 'compact-timers', 'whisper-bar'])
export type ExtensionId = z.infer<typeof ExtensionIdSchema>

export const ExtensionCategoryFilterSchema = z.enum(['all', 'active', 'overlay', 'codex'])
export type ExtensionCategoryFilter = z.infer<typeof ExtensionCategoryFilterSchema>

export interface BuiltinExtensionMeta {
  readonly id: ExtensionId
  readonly nameFr: string
  readonly version: string
  readonly badgeFr: string
  readonly categoryTag: 'overlay' | 'codex'
  readonly summaryFr: string
  readonly isOfficial: boolean
}

export const BUILTIN_EXTENSIONS_CATALOG: readonly BuiltinExtensionMeta[] = [
  {
    id: 'codex-farm-overlay',
    nameFr: 'Codex Farm Overlay (Quêtes, Boutique & % de Drop en Jeu)',
    version: '1.0.0',
    badgeFr: 'Codex & En jeu',
    categoryTag: 'codex',
    summaryFr:
      'Ajoute une fenêtre flottante en jeu et un sélecteur dans le Codex pour afficher les Quêtes FR, la Boutique Warframe, le Dojo et le % de drop (avec barre colorée sous le %), pour tout un set (ex: Ember) ou un objet précis (Matériaux, Warframes, Armes, Mods, Reliques).',
    isOfficial: true
  },
  {
    id: 'compact-timers',
    nameFr: 'Bandeau Minuteurs Cycles & Rotations (Cetus, Orbis, Cambion, Baro)',
    version: '2.5.0',
    badgeFr: 'Monde & Overlay',
    categoryTag: 'overlay',
    summaryFr:
      'Épingle jusqu’à 6 comptes à rebours temps réel des mondes ouverts et rotations au bas de la fenêtre Compact ou Desktop.',
    isOfficial: true
  },
  {
    id: 'whisper-bar',
    nameFr: 'Bandeau Presse-Papiers Rapide (/w Whisper Persistant)',
    version: '2.5.0',
    badgeFr: 'Marché & Overlay',
    categoryTag: 'overlay',
    summaryFr:
      'Conserve la dernière commande /w Warframe Market affichée en bas de fenêtre pour la recopier ou changer sa langue (EN/FR) en un clic.',
    isOfficial: true
  }
] as const

export const OverlayDensitySchema = z.enum(['sm', 'md', 'lg'])
export type OverlayDensity = z.infer<typeof OverlayDensitySchema>

export const FarmOverlayBoundsSchema = z.object({
  x: z.number().int().optional(),
  y: z.number().int().optional(),
  width: z.number().int().min(280).max(1600).default(410),
  height: z.number().int().min(200).max(1600).default(460)
})

export type FarmOverlayBounds = z.infer<typeof FarmOverlayBoundsSchema>

export const CodexOverlayPinnedSourceSchema = z.object({
  type: CodexAcquisitionSourceTypeSchema,
  labelFr: z.string().min(1).max(320),
  sublabelFr: z.string().max(320).nullable().default(null),
  chancePct: z.number().min(0).max(100),
  isGuaranteed: z.boolean().default(false)
})

export type CodexOverlayPinnedSource = z.infer<typeof CodexOverlayPinnedSourceSchema>

export const CODEX_OVERLAY_MAX_ENTRIES = 24

export const CodexOverlayPinnedEntrySchema = z.object({
  entryId: z.string().min(1).max(240),
  itemKey: z.string().min(1).max(200),
  category: CodexCategorySchema,
  itemId: z.string().min(1).max(180),
  itemNameFr: z.string().min(1).max(200),
  partKey: z.string().max(180).nullable().default(null),
  labelFr: z.string().min(1).max(240),
  groupLabelFr: z.string().min(1).max(180),
  imageUrl: z.string().max(512).nullable().default(null),
  obtained: z.boolean().default(false),
  sources: z.array(CodexOverlayPinnedSourceSchema).min(1).max(8)
})

export type CodexOverlayPinnedEntry = z.infer<typeof CodexOverlayPinnedEntrySchema>

export const CodexFarmOverlaySettingsSchema = z.object({
  windowOpen: z.boolean().default(false),
  clickThrough: z.boolean().default(true),
  size: OverlayDensitySchema.default('md'),
  opacityPercent: z.number().int().min(40).max(98).default(88),
  shortcutToggle: z.string().min(1).max(64).default('Alt+O'),
  showObtained: z.boolean().default(false),
  bounds: FarmOverlayBoundsSchema.default({ width: 410, height: 460 }),
  pinnedEntries: z.array(CodexOverlayPinnedEntrySchema).max(CODEX_OVERLAY_MAX_ENTRIES).default([])
})

export type CodexFarmOverlaySettings = z.infer<typeof CodexFarmOverlaySettingsSchema>

export const ExtensionsSettingsSchema = z.object({
  codexFarmOverlay: z.boolean().default(true),
  whisperBarPersistent: z.boolean().default(true)
})

export type ExtensionsSettings = z.infer<typeof ExtensionsSettingsSchema>

export const CodexFarmOverlayPatchSchema = CodexFarmOverlaySettingsSchema.partial()
export type CodexFarmOverlayPatch = z.infer<typeof CodexFarmOverlayPatchSchema>

export const FarmOverlayLiveStateSchema = z.object({
  extensionEnabled: z.boolean(),
  windowOpen: z.boolean(),
  isClickThrough: z.boolean(),
  size: OverlayDensitySchema,
  opacityPercent: z.number().int().min(40).max(98),
  shortcutToggle: z.string().min(1).max(64),
  showObtained: z.boolean(),
  pinnedEntries: z.array(CodexOverlayPinnedEntrySchema)
})

export type FarmOverlayLiveState = z.infer<typeof FarmOverlayLiveStateSchema>

