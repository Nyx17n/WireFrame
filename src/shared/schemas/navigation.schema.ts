import { z } from 'zod'

export const RouteKindSchema = z.enum([
  'hub',
  'market-home',
  'market-catalog',
  'market-item',
  'market-cart',
  'market-favorites',
  'market-ducats',
  'market-rivens',
  'market-recent',
  'market-user',
  'wfm-account',
  'alerts',
  'codex-home',
  'codex-detail',
  'browser-history'
])

export type RouteKind = z.infer<typeof RouteKindSchema>

export const AppRouteSchema = z.object({
  kind: RouteKindSchema,
  slug: z.string().min(1).max(160).optional(),
  category: z.string().min(1).max(64).optional(),
  query: z.string().max(160).optional()
})

export type AppRoute = z.infer<typeof AppRouteSchema>

export const BrowserTabSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().min(1).max(120),
  pinned: z.boolean().default(false),
  history: z.array(AppRouteSchema).min(1).max(50),
  historyIndex: z.number().int().nonnegative()
})

export type BrowserTab = z.infer<typeof BrowserTabSchema>

export const NavigationHistoryEntrySchema = z.object({
  id: z.string().min(1).max(64),
  route: AppRouteSchema,
  title: z.string().min(1).max(160),
  visitedAt: z.string().min(1).max(64)
})

export type NavigationHistoryEntry = z.infer<typeof NavigationHistoryEntrySchema>

export const TabsSessionSchema = z.object({
  hubActive: z.boolean().default(false),
  activeTabId: z.string().min(1).max(64).default('tab-welcome'),
  tabs: z
    .array(BrowserTabSchema)
    .min(1)
    .max(40)
    .default([
      {
        id: 'tab-welcome',
        title: 'Accueil Marché',
        pinned: false,
        history: [{ kind: 'market-home' }],
        historyIndex: 0
      }
    ]),
  navigationHistory: z.array(NavigationHistoryEntrySchema).max(200).default([])
})

export type TabsSession = z.infer<typeof TabsSessionSchema>

export function formatSlugTitle(slug: string): string {
  return slug
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function getDefaultRouteTitle(route: AppRoute): string {
  switch (route.kind) {
    case 'hub':
      return 'Hub Temps Réel'
    case 'market-home':
      return 'Accueil Marché'
    case 'market-catalog':
      return route.query ? `Catalogue : ${route.query}` : 'Catalogue Marché'
    case 'market-item':
      return route.slug ? formatSlugTitle(route.slug) : 'Fiche Item'
    case 'market-cart':
      return 'Panier & Bundler'
    case 'market-favorites':
      return 'Favoris Marché'
    case 'market-ducats':
      return 'Ducanator'
    case 'market-rivens':
      return 'Contrats Mod Riven'
    case 'market-recent':
      return 'Ordres Récents'
    case 'market-user':
      return route.slug ? `Profil : ${route.slug}` : 'Profil Joueur'
    case 'wfm-account':
      return 'Mon Profil WFM'
    case 'alerts':
      return 'Alertes & Price Sniper'
    case 'codex-home':
      return 'Codex & Helminth'
    case 'codex-detail':
      return route.slug ? `Codex : ${formatSlugTitle(route.slug)}` : 'Fiche Codex'
    case 'browser-history':
      return 'Historique'
  }
}

export function formatRouteUri(route: AppRoute): string {
  switch (route.kind) {
    case 'hub':
      return 'wf://hub'
    case 'market-home':
      return 'wf://market'
    case 'market-catalog':
      return route.query
        ? `wf://market/catalog?q=${encodeURIComponent(route.query)}`
        : 'wf://market/catalog'
    case 'market-item':
      return `wf://market/item/${route.slug ?? 'ash_prime_set'}`
    case 'market-cart':
      return 'wf://market/cart'
    case 'market-favorites':
      return 'wf://market/favorites'
    case 'market-ducats':
      return 'wf://market/ducats'
    case 'market-rivens':
      return 'wf://market/rivens'
    case 'market-recent':
      return 'wf://market/recent'
    case 'market-user':
      return `wf://market/user/${route.slug ?? 'Nyxo17'}`
    case 'wfm-account':
      return 'wf://wfm-account'
    case 'alerts':
      return 'wf://alerts'
    case 'codex-home':
      return 'wf://codex'
    case 'codex-detail':
      return `wf://codex/${route.category ?? 'warframes'}/${route.slug ?? 'wisp'}`
    case 'browser-history':
      return 'wf://history'
  }
}

/**
 * Parses pasted Warframe Market URLs, internal wf:// URIs, or search terms into an AppRoute.
 */
export function parseInputToRoute(rawInput: string): AppRoute {
  const trimmed = rawInput.trim()
  if (!trimmed) return { kind: 'market-home' }

  const wfmItemMatch = /^https?:\/\/(?:www\.)?warframe\.market\/(?:fr\/)?items\/([a-z0-9_-]+)/i.exec(
    trimmed
  )
  if (wfmItemMatch?.[1]) {
    return { kind: 'market-item', slug: wfmItemMatch[1].toLowerCase() }
  }

  const wfmUserMatch = /^https?:\/\/(?:www\.)?warframe\.market\/(?:fr\/)?profile\/([a-zA-Z0-9_.-]+)/i.exec(
    trimmed
  )
  if (wfmUserMatch?.[1]) {
    return { kind: 'market-user', slug: wfmUserMatch[1] }
  }

  const lower = trimmed.toLowerCase()
  if (lower === 'wf://hub' || lower === 'hub') return { kind: 'hub' }
  if (
    lower === 'wf://wfm-account' ||
    lower === 'wfm-account' ||
    lower === 'mon profil wfm' ||
    lower === 'mon compte wfm' ||
    lower === 'mon profil'
  ) {
    return { kind: 'wfm-account' }
  }
  if (lower === 'wf://market' || lower === 'market' || lower === 'marché') {
    return { kind: 'market-home' }
  }
  if (lower === 'wf://market/catalog' || lower === 'catalogue') return { kind: 'market-catalog' }
  if (lower === 'wf://market/cart' || lower === 'panier') return { kind: 'market-cart' }
  if (lower === 'wf://market/favorites' || lower === 'favoris') return { kind: 'market-favorites' }
  if (lower === 'wf://market/ducats' || lower === 'ducats' || lower === 'ducanator') {
    return { kind: 'market-ducats' }
  }
  if (lower === 'wf://market/rivens' || lower === 'rivens') return { kind: 'market-rivens' }
  if (lower === 'wf://market/recent' || lower === 'recents') return { kind: 'market-recent' }
  if (lower === 'wf://alerts' || lower === 'alertes') return { kind: 'alerts' }
  if (lower === 'wf://codex' || lower === 'codex' || lower === 'helminth') {
    return { kind: 'codex-home' }
  }
  if (lower === 'wf://history' || lower === 'historique' || lower === 'history') {
    return { kind: 'browser-history' }
  }
  if (lower.startsWith('wf://market/item/')) {
    const slug = lower.slice('wf://market/item/'.length).replace(/[^a-z0-9_-]/g, '')
    if (slug) return { kind: 'market-item', slug }
  }

  return { kind: 'market-catalog', query: trimmed.slice(0, 120) }
}

