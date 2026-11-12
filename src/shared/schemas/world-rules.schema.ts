import { z } from 'zod'
import {
  ARCHON_BOSSES,
  BARO_TRIGGERS,
  BOUNTY_SYNDICATES,
  CYCLE_LOCATIONS,
  CYCLE_STATES,
  FISSURE_ERAS,
  FISSURE_MODES,
  INVASION_CATEGORIES,
  NIGHTWAVE_KINDS,
  WORLD_FACTIONS,
  WORLD_MISSION_TYPES,
  WORLD_RULE_TEXT_MAX
} from '../data/world-rule-options'
import { HubSectionIdSchema } from './worldstate.schema'

/**
 * Texte libre utilisateur : comparé par simple inclusion normalisée.
 * Jamais interprété comme une expression régulière (protection anti-ReDoS).
 */
const FreeTextSchema = z
  .string()
  .trim()
  .max(WORLD_RULE_TEXT_MAX, `${WORLD_RULE_TEXT_MAX} caractères maximum`)
  .default('')

const MissionTypesSchema = z.array(z.enum(WORLD_MISSION_TYPES)).max(WORLD_MISSION_TYPES.length).default([])

const RuleBaseShape = {
  id: z.string().min(1).max(64),
  name: z.string().trim().min(1, 'Le nom est obligatoire').max(WORLD_RULE_TEXT_MAX),
  enabled: z.boolean().default(true),
  notifyOs: z.boolean().default(true),
  notifySound: z.boolean().default(true)
}

const FissureRuleSchema = z.object({
  ...RuleBaseShape,
  source: z.literal('fissure'),
  eras: z.array(z.enum(FISSURE_ERAS)).max(FISSURE_ERAS.length).default([]),
  missionTypes: MissionTypesSchema,
  mode: z.enum(FISSURE_MODES).default('any'),
  faction: z.enum(WORLD_FACTIONS).default('any'),
  fastOnly: z.boolean().default(false)
})

const InvasionRuleSchema = z.object({
  ...RuleBaseShape,
  source: z.literal('invasion'),
  categories: z.array(z.enum(INVASION_CATEGORIES)).max(INVASION_CATEGORIES.length).default([]),
  rewardText: FreeTextSchema
})

const ArbitrationRuleSchema = z.object({
  ...RuleBaseShape,
  source: z.literal('arbitration'),
  missionTypes: MissionTypesSchema,
  faction: z.enum(WORLD_FACTIONS).default('any'),
  sTierOnly: z.boolean().default(false)
})

const CycleRuleSchema = z.object({
  ...RuleBaseShape,
  source: z.literal('cycle'),
  location: z.enum(CYCLE_LOCATIONS),
  state: z.string().min(1).max(16),
  preAlertMin: z.number().int().min(0).max(30).default(0)
})

const BaroRuleSchema = z.object({
  ...RuleBaseShape,
  source: z.literal('baro'),
  trigger: z.enum(BARO_TRIGGERS).default('arrival'),
  preAlertHours: z.number().int().min(1).max(48).default(24),
  itemText: FreeTextSchema
})

const SortieRuleSchema = z.object({
  ...RuleBaseShape,
  source: z.literal('sortie'),
  faction: z.enum(WORLD_FACTIONS).default('any'),
  bossText: FreeTextSchema,
  missionTypes: MissionTypesSchema,
  modifierText: FreeTextSchema
})

const ArchonRuleSchema = z.object({
  ...RuleBaseShape,
  source: z.literal('archon'),
  archons: z.array(z.enum(ARCHON_BOSSES)).max(ARCHON_BOSSES.length).default([]),
  missionTypes: MissionTypesSchema
})

const BountyRuleSchema = z.object({
  ...RuleBaseShape,
  source: z.literal('bounty'),
  syndicates: z.array(z.enum(BOUNTY_SYNDICATES)).max(BOUNTY_SYNDICATES.length).default([]),
  rewardText: FreeTextSchema,
  minLevel: z.number().int().min(0).max(200).default(0)
})

const NightwaveRuleSchema = z.object({
  ...RuleBaseShape,
  source: z.literal('nightwave'),
  kinds: z.array(z.enum(NIGHTWAVE_KINDS)).max(NIGHTWAVE_KINDS.length).default([]),
  minReputation: z.number().int().min(0).max(10_000).default(0),
  titleText: FreeTextSchema
})

export const WorldAlertRuleSchema = z
  .discriminatedUnion('source', [
    FissureRuleSchema,
    InvasionRuleSchema,
    ArbitrationRuleSchema,
    CycleRuleSchema,
    BaroRuleSchema,
    SortieRuleSchema,
    ArchonRuleSchema,
    BountyRuleSchema,
    NightwaveRuleSchema
  ])
  .superRefine((rule, ctx) => {
    const fail = (message: string, path: string): void => {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [path] })
    }
    switch (rule.source) {
      case 'fissure':
        if (
          rule.eras.length === 0 &&
          rule.missionTypes.length === 0 &&
          rule.mode === 'any' &&
          rule.faction === 'any' &&
          !rule.fastOnly
        ) {
          fail('Choisis au moins une condition (ère, mission, mode, faction ou missions rapides)', 'eras')
        }
        break
      case 'invasion':
        if (rule.categories.length === 0 && !rule.rewardText) {
          fail('Choisis au moins une catégorie de récompense ou saisis un texte', 'categories')
        }
        break
      case 'cycle':
        if (!CYCLE_STATES[rule.location].some((s) => s.id === rule.state)) {
          fail('Choisis au moins un lieu et un état valides pour une règle de Cycle', 'state')
        }
        break
      case 'baro':
        if (rule.trigger === 'item' && !rule.itemText) {
          fail('Saisis le nom de l’article recherché', 'itemText')
        }
        break
      case 'bounty':
        if (rule.syndicates.length === 0 && !rule.rewardText) {
          fail('Choisis au moins un syndicat ou saisis une récompense', 'syndicates')
        }
        break
      case 'nightwave':
        if (rule.kinds.length === 0 && rule.minReputation === 0 && !rule.titleText) {
          fail('Choisis au moins une condition (type, réputation ou intitulé)', 'kinds')
        }
        break
      default:
        break
    }
  })

export type WorldAlertRule = z.infer<typeof WorldAlertRuleSchema>
export type WorldAlertRuleInput = z.input<typeof WorldAlertRuleSchema>

export const WorldRuleMatchSchema = z.object({
  /** Identifiant d'occurrence Worldstate (clé de déduplication avec l'id de règle). */
  key: z.string().min(1).max(200),
  title: z.string(),
  subtitle: z.string(),
  hubSection: HubSectionIdSchema,
  marketSlug: z.string().nullable()
})
export type WorldRuleMatch = z.infer<typeof WorldRuleMatchSchema>

export const WORLD_RULE_PREVIEW_LIMIT = 5

export const WorldRulePreviewResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('ok'),
    total: z.number().int().nonnegative(),
    matches: z.array(WorldRuleMatchSchema).max(WORLD_RULE_PREVIEW_LIMIT)
  }),
  z.object({
    status: z.literal('unavailable'),
    message: z.string()
  })
])
export type WorldRulePreviewResult = z.infer<typeof WorldRulePreviewResultSchema>

