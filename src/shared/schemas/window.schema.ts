import { z } from 'zod'

export const WindowBoundsSchema = z.object({
  x: z.number().int().optional(),
  y: z.number().int().optional(),
  width: z.number().int().min(360).max(7680),
  height: z.number().int().min(480).max(4320)
})

export type WindowBounds = z.infer<typeof WindowBoundsSchema>

export const WindowStateSchema = z.object({
  isMaximized: z.boolean(),
  isAlwaysOnTop: z.boolean(),
  isCompactMode: z.boolean(),
  zoomPercent: z.number().int().min(50).max(200)
})

export type WindowState = z.infer<typeof WindowStateSchema>

export const ExternalUrlPayloadSchema = z.object({
  url: z.string().url().max(2048)
})

export const BooleanTogglePayloadSchema = z.object({
  enabled: z.boolean()
})

export const ZoomPayloadSchema = z.object({
  zoomPercent: z.number().int().min(50).max(200)
})

