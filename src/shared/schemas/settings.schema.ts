import { z } from 'zod'
import { PriceSniperRuleSchema, WorldAlertTogglesSchema } from './alerts.schema'
import { TabsSessionSchema } from './navigation.schema'
import { CartItemEntrySchema } from './tools.schema'
import { WindowBoundsSchema } from './window.schema'

export const HexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid 6-digit hex color')

export const ThemePresetIdSchema = z.enum([
  'orokin-dark',
  'tenno-light',
  'prime-gold',
  'lotus-amethyst',
  'kuva-crimson',
  'corpus-matrix',
  'custom'
])

export type ThemePresetId = z.infer<typeof ThemePresetIdSchema>

export const PlatformSchema = z.enum(['pc', 'ps4', 'xbox', 'switch', 'mobile'])
export type MarketPlatform = z.infer<typeof PlatformSchema>

export const AppLanguageSchema = z.enum(['fr', 'en'])
export type AppLanguage = z.infer<typeof AppLanguageSchema>

export const SoundChoiceSchema = z.enum(['classic', 'bell'])
export type SoundChoice = z.infer<typeof SoundChoiceSchema>

export const SellerStatusFilterSchema = z.enum(['ingame', 'online', 'all'])

export const GlobalShortcutsMapSchema = z.object({
  toggleOverlay: z.string().min(1).max(64).default('Alt+Shift+W'),
  toggleCompact: z.string().min(1).max(64).default('Alt+M'),
  toggleAlwaysOnTop: z.string().min(1).max(64).default('Alt+P')
})

export const UserSettingsSchema = z.object({
  appearance: z.object({
    preset: ThemePresetIdSchema.default('orokin-dark'),
    primaryColor: HexColorSchema.default('#0f161d'),
    secondaryColor: HexColorSchema.default('#0ea5e9'),
    glowEnabled: z.boolean().default(true),
    startupAnimationEnabled: z.boolean().default(true),
    zoomPercent: z.number().int().min(50).max(200).default(100)
  }),
  audio: z.object({
    soundEnabled: z.boolean().default(true),
    soundChoice: SoundChoiceSchema.default('classic'),
    volumePercent: z.number().int().min(0).max(100).default(80),
    repeatAlerts: z.boolean().default(true),
    scanIntervalSec: z.number().int().min(15).max(3600).default(30),
    nativeOsNotifications: z.boolean().default(true)
  }),
  window: z.object({
    closeToTray: z.boolean().default(true),
    alwaysOnTop: z.boolean().default(false),
    globalShortcutsEnabled: z.boolean().default(true),
    shortcuts: GlobalShortcutsMapSchema.default({
      toggleOverlay: 'Alt+Shift+W',
      toggleCompact: 'Alt+M',
      toggleAlwaysOnTop: 'Alt+P'
    }),
    desktopBounds: WindowBoundsSchema.default({ width: 1440, height: 900 }),
    compactBounds: WindowBoundsSchema.default({ width: 460, height: 660 })
  }),
  market: z.object({
    platform: PlatformSchema.default('pc'),
    crossplay: z.boolean().default(true),
    language: AppLanguageSchema.default('fr'),
    whisperLanguage: AppLanguageSchema.default('en'),
    defaultSellerStatus: SellerStatusFilterSchema.default('ingame')
  }),
  favorites: z.array(z.string().min(1).max(160)).max(300).default([]),
  cart: z.array(CartItemEntrySchema).max(50).default([]),
  priceAlerts: z.array(PriceSniperRuleSchema).max(40).default([]),
  worldAlerts: WorldAlertTogglesSchema.default({}),
  session: TabsSessionSchema.default({})
})

export type UserSettings = z.infer<typeof UserSettingsSchema>

export const UserSettingsPatchSchema = UserSettingsSchema.deepPartial()
export type UserSettingsPatch = z.infer<typeof UserSettingsPatchSchema>

export const DEFAULT_USER_SETTINGS: UserSettings = UserSettingsSchema.parse({
  appearance: {},
  audio: {},
  window: {},
  market: {},
  favorites: [],
  cart: [],
  priceAlerts: [],
  worldAlerts: {},
  session: {}
})

