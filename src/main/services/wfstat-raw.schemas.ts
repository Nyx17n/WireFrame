import { z } from 'zod'

const RawCycleBase = z.object({
  id: z.string().default(''),
  activation: z.string().default('1970-01-01T00:00:00.000Z'),
  expiry: z.string().default('1970-01-01T00:00:00.000Z'),
  state: z.string().default('unknown')
})

const RawRewardCountedItem = z.object({
  type: z.string().optional(),
  key: z.string().optional(),
  count: z.number().default(1)
})

const RawRewardObject = z.object({
  items: z.array(z.string()).catch([]),
  countedItems: z.array(RawRewardCountedItem).catch([]),
  credits: z.number().catch(0),
  thumbnail: z.string().catch('')
})

export const RawWfStatResponseSchema = z.object({
  timestamp: z.string().optional(),
  cetusCycle: RawCycleBase.extend({ isDay: z.boolean().optional() }).optional(),
  earthCycle: RawCycleBase.extend({ isDay: z.boolean().optional() }).optional(),
  vallisCycle: RawCycleBase.extend({ isWarm: z.boolean().optional() }).optional(),
  cambionCycle: RawCycleBase.optional(),
  zarimanCycle: RawCycleBase.extend({ isCorpus: z.boolean().optional() }).optional(),
  duviriCycle: RawCycleBase.extend({
    choices: z
      .array(
        z.object({
          category: z.string().default(''),
          choices: z.array(z.string()).catch([])
        })
      )
      .catch([])
  }).optional(),

  syndicateMissions: z
    .array(
      z.object({
        id: z.string().default(''),
        syndicate: z.string().default(''),
        expiry: z.string().default('1970-01-01T00:00:00.000Z'),
        jobs: z
          .array(
            z.object({
              id: z.string().default(''),
              type: z.string().default('Mise à prix'),
              enemyLevels: z.array(z.number()).catch([]),
              standingStages: z.array(z.number()).catch([]),
              rewardPoolDrops: z
                .array(
                  z.object({
                    item: z.string().default(''),
                    rarity: z.string().default('Common'),
                    chance: z.number().catch(0),
                    count: z.number().catch(1)
                  })
                )
                .catch([])
            })
          )
          .catch([])
      })
    )
    .catch([]),

  fissures: z
    .array(
      z.object({
        id: z.string().default(''),
        node: z.string().default(''),
        missionType: z.string().default(''),
        missionTypeKey: z.string().optional(),
        enemy: z.string().default(''),
        tier: z.string().default('Lith'),
        tierNum: z.number().catch(1),
        isStorm: z.boolean().catch(false),
        isHard: z.boolean().catch(false),
        expired: z.boolean().catch(false),
        expiry: z.string().default('1970-01-01T00:00:00.000Z')
      })
    )
    .catch([]),

  archonHunt: z
    .object({
      id: z.string().default(''),
      boss: z.string().default('Archonte'),
      faction: z.string().default('Narmer'),
      expiry: z.string().default('1970-01-01T00:00:00.000Z'),
      missions: z
        .array(
          z.object({
            node: z.string().default(''),
            type: z.string().default('')
          })
        )
        .catch([])
    })
    .nullable()
    .catch(null),

  sortie: z
    .object({
      id: z.string().default(''),
      boss: z.string().default('Boss'),
      faction: z.string().default(''),
      expiry: z.string().default('1970-01-01T00:00:00.000Z'),
      variants: z
        .array(
          z.object({
            node: z.string().default(''),
            missionType: z.string().default(''),
            modifier: z.string().default('')
          })
        )
        .catch([])
    })
    .nullable()
    .catch(null),

  invasions: z
    .array(
      z.object({
        id: z.string().default(''),
        node: z.string().default(''),
        desc: z.string().default(''),
        vsInfestation: z.boolean().catch(false),
        completion: z.number().catch(50),
        completed: z.boolean().catch(false),
        rewardTypes: z.array(z.string()).catch([]),
        attacker: z
          .object({
            faction: z.string().default(''),
            reward: RawRewardObject.optional()
          })
          .optional(),
        defender: z
          .object({
            faction: z.string().default(''),
            reward: RawRewardObject.optional()
          })
          .optional()
      })
    )
    .catch([]),

  steelPath: z
    .object({
      currentReward: z
        .object({ name: z.string().default(''), cost: z.number().catch(0) })
        .nullable()
        .catch(null),
      expiry: z.string().default('1970-01-01T00:00:00.000Z'),
      rotation: z
        .array(z.object({ name: z.string().default(''), cost: z.number().catch(0) }))
        .catch([]),
      evergreens: z
        .array(z.object({ name: z.string().default(''), cost: z.number().catch(0) }))
        .catch([])
    })
    .optional(),

  arbitration: z
    .object({
      node: z.string().default('SolNode000'),
      type: z.string().default('Unknown'),
      enemy: z.string().default(''),
      expiry: z.string().default('1970-01-01T00:00:00.000Z'),
      expired: z.boolean().catch(false)
    })
    .nullable()
    .catch(null),

  alerts: z
    .array(
      z.object({
        id: z.string().default(''),
        expiry: z.string().default('1970-01-01T00:00:00.000Z'),
        mission: z
          .object({
            node: z.string().default(''),
            type: z.string().default(''),
            faction: z.string().default(''),
            reward: RawRewardObject.optional()
          })
          .optional()
      })
    )
    .catch([]),

  events: z
    .array(
      z.object({
        id: z.string().default(''),
        description: z.string().default(''),
        tooltip: z.string().default(''),
        node: z.string().default(''),
        health: z.number().nullable().catch(null),
        expiry: z.string().default('1970-01-01T00:00:00.000Z'),
        rewards: z.array(RawRewardObject).catch([])
      })
    )
    .catch([]),

  nightwave: z
    .object({
      activeChallenges: z
        .array(
          z.object({
            id: z.string().default(''),
            title: z.string().default(''),
            desc: z.string().default(''),
            reputation: z.number().catch(1000),
            isDaily: z.boolean().catch(false),
            isElite: z.boolean().catch(false),
            expiry: z.string().default('1970-01-01T00:00:00.000Z')
          })
        )
        .catch([])
    })
    .nullable()
    .catch(null),

  voidTrader: z
    .object({
      character: z.string().default("Baro Ki'Teer"),
      location: z.string().default('Relais'),
      activation: z.string().default('1970-01-01T00:00:00.000Z'),
      expiry: z.string().default('1970-01-01T00:00:00.000Z'),
      active: z.boolean().optional(),
      inventory: z
        .array(
          z.object({
            uniqueName: z.string().default(''),
            item: z.string().default(''),
            ducats: z.number().nullable().catch(0),
            credits: z.number().nullable().catch(0)
          })
        )
        .catch([])
    })
    .optional(),

  news: z
    .array(
      z.object({
        id: z.string().default(''),
        message: z.string().default(''),
        link: z.string().default(''),
        imageLink: z.string().nullable().catch(null),
        date: z.string().default('1970-01-01T00:00:00.000Z'),
        translations: z.record(z.string(), z.string()).catch({}),
        update: z.boolean().catch(false),
        primeAccess: z.boolean().catch(false),
        stream: z.boolean().catch(false)
      })
    )
    .catch([]),

  globalUpgrades: z
    .array(
      z.object({
        desc: z.string().default('Booster global'),
        expiry: z.string().default('1970-01-01T00:00:00.000Z')
      })
    )
    .catch([]),

  dailyDeals: z
    .array(
      z.object({
        id: z.string().default(''),
        item: z.string().default(''),
        originalPrice: z.number().catch(0),
        salePrice: z.number().catch(0),
        discount: z.number().catch(0),
        total: z.number().catch(0),
        sold: z.number().catch(0),
        expiry: z.string().default('1970-01-01T00:00:00.000Z')
      })
    )
    .catch([]),

  vaultTrader: z
    .object({
      location: z.string().default("Bazar de Maroo (Mars)"),
      expiry: z.string().default('1970-01-01T00:00:00.000Z'),
      inventory: z
        .array(
          z.object({
            uniqueName: z.string().default(''),
            item: z.string().default(''),
            ducats: z.number().nullable().catch(0)
          })
        )
        .catch([])
    })
    .optional()
})

export type RawWfStatResponse = z.infer<typeof RawWfStatResponseSchema>

