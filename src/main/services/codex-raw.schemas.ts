import { z } from 'zod'

export const RawDropSchema = z.object({
  part: z.string().optional(),
  loc: z.string(),
  chance: z.number(),
  rarity: z.string().default('')
})

export const RawComponentSchema = z.object({
  name: z.string(),
  en: z.string().default(''),
  resSlug: z.string().default(''),
  count: z.number().int().positive().default(1),
  img: z.string().default(''),
  drops: z.array(RawDropSchema).default([])
})

export const RawResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  en: z.string(),
  img: z.string().default(''),
  desc: z.string().default(''),
  type: z.string().default('Resource'),
  tradable: z.boolean().default(false),
  planets: z.string().default(''),
  utility: z.string().default(''),
  drops: z.array(RawDropSchema).default([]),
  totalUsedFor: z.number().int().nonnegative().default(0),
  usedFor: z
    .array(
      z.object({
        cat: z.enum(['warframes', 'weapons']),
        id: z.string(),
        name: z.string(),
        img: z.string().default(''),
        count: z.number().int().positive().default(1)
      })
    )
    .default([])
})

export const RawWarframeSchema = z.object({
  id: z.string(),
  name: z.string(),
  en: z.string(),
  img: z.string().default(''),
  desc: z.string().default(''),
  prime: z.boolean().default(false),
  vaulted: z.boolean().default(false),
  mr: z.number().int().nonnegative().default(0),
  hp: z.number().nonnegative().default(0),
  sh: z.number().nonnegative().default(0),
  ar: z.number().nonnegative().default(0),
  enMax: z.number().nonnegative().default(0),
  spd: z.number().nonnegative().default(1),
  aura: z
    .union([z.string(), z.array(z.string()).transform((arr) => arr.join(' + '))])
    .default(''),
  pol: z.array(z.string()).default([]),
  passive: z.string().default(''),
  abilities: z
    .array(
      z.object({
        name: z.string(),
        desc: z.string().default(''),
        img: z.string().default('')
      })
    )
    .default([]),
  components: z.array(RawComponentSchema).default([]),
  drops: z.array(RawDropSchema).default([])
})

export const RawWeaponSchema = z.object({
  id: z.string(),
  name: z.string(),
  en: z.string(),
  img: z.string().default(''),
  desc: z.string().default(''),
  slot: z.string().default('primary'),
  slotLabel: z.string().default('Arme'),
  type: z.string().default('Weapon'),
  prime: z.boolean().default(false),
  vaulted: z.boolean().default(false),
  tradable: z.boolean().default(false),
  mr: z.number().int().nonnegative().default(0),
  cc: z.number().nonnegative().default(0),
  cd: z.number().nonnegative().default(1),
  sc: z.number().nonnegative().default(0),
  fr: z.number().nonnegative().default(0),
  dmg: z.number().nonnegative().default(0),
  disp: z.number().nonnegative().default(1),
  components: z.array(RawComponentSchema).default([]),
  drops: z.array(RawDropSchema).default([])
})

export const RawModSchema = z.object({
  id: z.string(),
  name: z.string(),
  en: z.string(),
  img: z.string().default(''),
  type: z.string().default('Mod'),
  compat: z.string().default(''),
  pol: z.string().default(''),
  rarity: z.string().default('Common'),
  drain: z.number().int().default(0),
  maxRank: z.number().int().nonnegative().default(5),
  tradable: z.boolean().default(false),
  stats: z.array(z.string()).default([]),
  drops: z.array(RawDropSchema).default([])
})

export const RawRelicSchema = z.object({
  id: z.string(),
  name: z.string(),
  en: z.string(),
  era: z.string().default('Lith'),
  img: z.string().default(''),
  vaulted: z.boolean().default(false),
  tradable: z.boolean().default(true),
  rewards: z
    .array(
      z.object({
        name: z.string(),
        en: z.string().default(''),
        tier: z.string().default(''),
        chance: z.number().min(0).max(100),
        radChance: z.number().min(0).max(100)
      })
    )
    .default([]),
  drops: z.array(RawDropSchema).default([])
})

export const CodexRawDatabaseSchema = z.object({
  resources: z.array(RawResourceSchema),
  warframes: z.array(RawWarframeSchema),
  weapons: z.array(RawWeaponSchema),
  mods: z.array(RawModSchema),
  relics: z.array(RawRelicSchema)
})

export type CodexRawDatabase = z.infer<typeof CodexRawDatabaseSchema>
export type RawDrop = z.infer<typeof RawDropSchema>
export type RawComponent = z.infer<typeof RawComponentSchema>
export type RawResource = z.infer<typeof RawResourceSchema>
export type RawWarframe = z.infer<typeof RawWarframeSchema>
export type RawWeapon = z.infer<typeof RawWeaponSchema>
export type RawMod = z.infer<typeof RawModSchema>
export type RawRelic = z.infer<typeof RawRelicSchema>

