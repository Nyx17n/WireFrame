import { create } from 'zustand'

export type NotificationKind = 'success' | 'info' | 'warning' | 'error' | 'alert'

export type NotificationActionIcon = 'whisper' | 'hub' | 'external' | 'cart' | 'retry'

export interface NotificationAction {
  readonly label: string
  readonly variant?: 'default' | 'outline' | 'secondary'
  readonly icon?: NotificationActionIcon
  readonly onClick: () => void
}

export interface AppNotification {
  readonly id: string
  readonly kind: NotificationKind
  readonly title: string
  readonly message?: string
  readonly createdAt: number
  readonly updatedAt: number
  readonly durationMs: number | null
  readonly repeatCount: number
  readonly read: boolean
  readonly actions?: readonly NotificationAction[]
}

export interface PushNotificationInput {
  readonly kind: NotificationKind
  readonly title: string
  readonly message?: string
  readonly durationMs?: number | null
  readonly actions?: readonly NotificationAction[]
  readonly forceShow?: boolean
}

const MAX_HISTORY = 50
const DEDUPE_WINDOW_MS = 2000
const TITLE_MAX_LEN = 80
const MESSAGE_MAX_LEN = 220

function clampText(text: string, maxLen: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= maxLen) return trimmed
  return `${trimmed.slice(0, maxLen - 1)}…`
}

function defaultDurationForKind(kind: NotificationKind): number | null {
  switch (kind) {
    case 'success':
    case 'info':
      return 4000
    case 'warning':
      return 6000
    case 'error':
      return 8000
    case 'alert':
      return null
  }
}

interface NotificationStoreState {
  activeQueue: AppNotification[]
  history: AppNotification[]
  isHydrated: boolean
  actionNotificationsEnabled: boolean
  setHydrated: (hydrated: boolean) => void
  setActionNotificationsEnabled: (enabled: boolean) => void
  push: (input: PushNotificationInput) => string | null
  dismissToast: (id: string) => void
  dismissAllToasts: () => void
  markAllAsRead: () => void
  clearHistory: () => void
}

let seqCounter = 0

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  activeQueue: [],
  history: [],
  isHydrated: false,
  actionNotificationsEnabled: true,

  setHydrated: (hydrated) => set({ isHydrated: hydrated }),
  setActionNotificationsEnabled: (enabled) => set({ actionNotificationsEnabled: enabled }),

  push: (input) => {
    const isActionKind = input.kind === 'success' || input.kind === 'info'
    if (isActionKind && !input.forceShow && !get().actionNotificationsEnabled) {
      return null
    }

    const now = Date.now()
    const cleanTitle = clampText(input.title, TITLE_MAX_LEN)
    if (!cleanTitle) return null
    const cleanMsg = input.message ? clampText(input.message, MESSAGE_MAX_LEN) : undefined
    const durationMs =
      input.durationMs !== undefined ? input.durationMs : defaultDurationForKind(input.kind)

    const state = get()
    const recentDup = state.history[0]
    if (
      recentDup &&
      recentDup.kind === input.kind &&
      recentDup.title.toLowerCase() === cleanTitle.toLowerCase() &&
      now - recentDup.updatedAt <= DEDUPE_WINDOW_MS
    ) {
      const merged: AppNotification = {
        ...recentDup,
        ...(cleanMsg !== undefined ? { message: cleanMsg } : {}),
        ...(input.actions !== undefined ? { actions: input.actions } : {}),
        updatedAt: now,
        repeatCount: recentDup.repeatCount + 1,
        read: false
      }
      const inQueue = state.activeQueue.some((n) => n.id === merged.id)
      set({
        history: [merged, ...state.history.slice(1)],
        activeQueue: inQueue
          ? state.activeQueue.map((n) => (n.id === merged.id ? merged : n))
          : [...state.activeQueue, merged]
      })
      return merged.id
    }

    seqCounter += 1
    const id = `ntf-${now.toString(36)}-${seqCounter}`
    const entry: AppNotification = {
      id,
      kind: input.kind,
      title: cleanTitle,
      ...(cleanMsg !== undefined ? { message: cleanMsg } : {}),
      ...(input.actions !== undefined ? { actions: input.actions } : {}),
      createdAt: now,
      updatedAt: now,
      durationMs,
      repeatCount: 1,
      read: false
    }

    set({
      activeQueue: [...state.activeQueue, entry],
      history: [entry, ...state.history].slice(0, MAX_HISTORY)
    })
    return id
  },

  dismissToast: (id) =>
    set((s) => ({
      activeQueue: s.activeQueue.filter((n) => n.id !== id)
    })),

  dismissAllToasts: () => set({ activeQueue: [] }),

  markAllAsRead: () =>
    set((s) => ({
      history: s.history.map((n) => (n.read ? n : { ...n, read: true }))
    })),

  clearHistory: () => set({ history: [], activeQueue: [] })
}))

export function notify(input: PushNotificationInput): string | null {
  return useNotificationStore.getState().push(input)
}

