import { z } from 'zod'

export const UpdaterStateKindSchema = z.enum([
  'idle',
  'checking',
  'available',
  'up-to-date',
  'downloading',
  'downloaded',
  'dev-mode',
  'error'
])

export type UpdaterStateKind = z.infer<typeof UpdaterStateKindSchema>

export const UpdaterStatusSchema = z.object({
  state: UpdaterStateKindSchema,
  currentVersion: z.string().min(1),
  availableVersion: z.string().nullable(),
  progressPercent: z.number().min(0).max(100).nullable(),
  message: z.string().max(400),
  checkedAt: z.string().nullable(),
  isPackaged: z.boolean()
})

export type UpdaterStatus = z.infer<typeof UpdaterStatusSchema>

