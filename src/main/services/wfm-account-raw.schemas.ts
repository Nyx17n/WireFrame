import { z } from 'zod'
import { RawWfmOrderSchema } from './wfm-raw.schemas'

export const RawWfmMeDataSchema = z
  .object({
    id: z.string(),
    ingameName: z.string().default(''),
    slug: z.string().default(''),
    avatar: z.string().nullable().optional(),
    reputation: z.number().default(0),
    masteryRank: z.number().int().nonnegative().optional(),
    platform: z.string().default('pc'),
    crossplay: z.boolean().default(true),
    locale: z.string().default('fr'),
    verified: z.boolean().default(false),
    banned: z.boolean().default(false),
    about: z.string().nullable().optional(),
    aboutRaw: z.string().nullable().optional()
  })
  .passthrough()

export const RawWfmMeResponseSchema = z.object({
  data: RawWfmMeDataSchema
})

export const RawWfmSingleOrderResponseSchema = z.object({
  data: RawWfmOrderSchema
})

export const RawWfmMyOrdersResponseSchema = z.object({
  data: z.array(RawWfmOrderSchema)
})

export const RawWfmExtendedUserResponseSchema = z.object({
  data: z
    .object({
      id: z.string(),
      ingameName: z.string(),
      slug: z.string(),
      avatar: z.string().nullable().optional(),
      reputation: z.number().default(0),
      masteryRank: z.number().int().nonnegative().optional(),
      platform: z.string().default('pc'),
      crossplay: z.boolean().default(true),
      about: z.string().nullable().optional(),
      aboutRaw: z.string().nullable().optional()
    })
    .passthrough()
})

const RawV1ReviewEntrySchema = z
  .object({
    id: z.string().optional(),
    _id: z.string().optional(),
    text: z.string().default(''),
    review_type: z.number().optional(),
    date: z.string().optional(),
    user_from: z
      .object({
        ingame_name: z.string().default('Tenno')
      })
      .passthrough()
      .optional()
  })
  .passthrough()

export const RawWfmV1ReviewsResponseSchema = z.object({
  payload: z
    .object({
      reviews: z.array(RawV1ReviewEntrySchema).default([])
    })
    .passthrough()
})

