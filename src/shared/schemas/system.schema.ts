import { z } from 'zod'

export const SystemStatusSchema = z.object({
  appVersion: z.string(),
  apiConnected: z.boolean(),
  rateLimiterInWindow: z.number().int().nonnegative(),
  rateLimiterMaxPerSec: z.number().int().positive(),
  memoryCacheEntries: z.number().int().nonnegative(),
  userDataPath: z.string()
})

export type SystemStatus = z.infer<typeof SystemStatusSchema>

