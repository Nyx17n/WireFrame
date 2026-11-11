import { z } from 'zod'

const RawI18nSimpleSchema = z
  .object({
    name: z.string().optional(),
    icon: z.string().nullable().optional(),
    thumb: z.string().nullable().optional()
  })
  .passthrough()

const RawDucatEntrySchema = z
  .object({
    item: z.string(),
    ducats: z.number().int().positive(),
    volume: z.number().int().nonnegative().default(0),
    median: z.number().nonnegative().default(0),
    wa_price: z.number().nonnegative().default(0),
    ducats_per_platinum_wa: z.number().nonnegative().default(0)
  })
  .passthrough()

export const RawWfmDucatsResponseSchema = z.object({
  payload: z.object({
    previous_day: z.array(RawDucatEntrySchema).default([]),
    previous_hour: z.array(RawDucatEntrySchema).default([])
  })
})

export const RawWfmRivenWeaponsResponseSchema = z.object({
  data: z.array(
    z
      .object({
        id: z.string(),
        slug: z.string(),
        rivenType: z.string().default('rifle'),
        disposition: z.number().nonnegative().default(1),
        i18n: z.record(z.string(), RawI18nSimpleSchema).optional()
      })
      .passthrough()
  )
})

export const RawWfmRivenAttributesResponseSchema = z.object({
  data: z.array(
    z
      .object({
        id: z.string(),
        slug: z.string(),
        i18n: z.record(z.string(), RawI18nSimpleSchema).optional()
      })
      .passthrough()
  )
})

export const RawWfmRivenAuctionsResponseSchema = z.object({
  payload: z.object({
    auctions: z
      .array(
        z
          .object({
            id: z.string(),
            visible: z.boolean().default(true),
            closed: z.boolean().default(false),
            private: z.boolean().default(false),
            buyout_price: z.number().nullable().default(null),
            starting_price: z.number().nonnegative().default(0),
            top_bid: z.number().nullable().default(null),
            is_direct_sell: z.boolean().default(true),
            owner: z
              .object({
                ingame_name: z.string(),
                slug: z.string(),
                reputation: z.number().default(0),
                platform: z.string().default('pc'),
                status: z.enum(['ingame', 'online', 'offline']).catch('offline')
              })
              .passthrough(),
            item: z
              .object({
                weapon_url_name: z.string(),
                name: z.string().default('Riven'),
                mastery_level: z.number().int().nonnegative().default(8),
                mod_rank: z.number().int().nonnegative().default(0),
                re_rolls: z.number().int().nonnegative().default(0),
                polarity: z.string().default('madurai'),
                attributes: z
                  .array(
                    z.object({
                      url_name: z.string(),
                      value: z.number(),
                      positive: z.boolean()
                    })
                  )
                  .default([])
              })
              .passthrough()
          })
          .passthrough()
      )
      .default([])
  })
})

