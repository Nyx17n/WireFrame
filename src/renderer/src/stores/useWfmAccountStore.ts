import { create } from 'zustand'
import type {
  CloseWfmOrderUnitInput,
  CreateWfmOrderInput,
  UpdateWfmOrderInput,
  WfmAccountOverview,
  WfmOwnOrder,
  WfmPresenceStatus,
  WfmSessionState,
  WfmSignInCredentialsInput,
  WfmSignInTokenInput,
  WfmSignInWebInput
} from '@shared/schemas/wfm-account.schema'
import { ipcClient } from '@/services/ipc-client'
import { notify } from '@/stores/useNotificationStore'

export interface CreateOrderModalState {
  readonly open: boolean
  readonly prefillSlug?: string
  readonly defaultType: 'sell' | 'buy'
}

const DEFAULT_SESSION: WfmSessionState = {
  connected: false,
  encryptionAvailable: true,
  persistedOnDisk: false,
  status: 'invisible',
  wsConnected: false,
  user: null,
  sessionSalesCount: 0,
  sessionPlatinumEarned: 0
}

interface WfmAccountStoreState {
  session: WfmSessionState
  isSessionBootstrapped: boolean
  overview: WfmAccountOverview | null
  isLoadingOverview: boolean
  overviewError: string | null
  signInModalOpen: boolean
  signInModalDefaultTab: 'credentials' | 'web'
  createOrderModal: CreateOrderModalState

  initialize: () => Promise<() => void>
  openSignInModal: (defaultTab?: 'credentials' | 'web') => void
  closeSignInModal: () => void
  openCreateOrderModal: (opts?: { prefillSlug?: string; defaultType?: 'sell' | 'buy' }) => void
  closeCreateOrderModal: () => void

  signInCredentials: (input: WfmSignInCredentialsInput) => Promise<void>
  signInWeb: (input: WfmSignInWebInput) => Promise<void>
  signInToken: (input: WfmSignInTokenInput) => Promise<void>
  signOut: () => Promise<void>
  setStatus: (status: WfmPresenceStatus) => Promise<void>
  loadOverview: (forceRefresh?: boolean) => Promise<void>

  createOrder: (input: CreateWfmOrderInput) => Promise<WfmOwnOrder>
  updateOrder: (input: UpdateWfmOrderInput) => Promise<WfmOwnOrder>
  closeOrderUnit: (input: CloseWfmOrderUnitInput, itemLabel: string, unitPlatinum: number) => Promise<void>
  deleteOrder: (orderId: string, itemLabel: string) => Promise<void>
}

export const useWfmAccountStore = create<WfmAccountStoreState>((set, get) => ({
  session: DEFAULT_SESSION,
  isSessionBootstrapped: false,
  overview: null,
  isLoadingOverview: false,
  overviewError: null,
  signInModalOpen: false,
  signInModalDefaultTab: 'credentials',
  createOrderModal: { open: false, defaultType: 'sell' },

  initialize: async () => {
    try {
      const session = await ipcClient.wfmAccount.getSession()
      set({ session, isSessionBootstrapped: true })
      if (session.connected) {
        void get().loadOverview(false)
      }
    } catch {
      set({ isSessionBootstrapped: true })
    }

    return ipcClient.wfmAccount.onSessionChanged((nextSession) => {
      set((prev) => ({
        session: nextSession,
        // Hard safety rule: immediately close sell modal & clear personal data if disconnected
        ...(nextSession.connected
          ? {}
          : {
              overview: null,
              createOrderModal: { open: false, defaultType: 'sell' }
            }),
        ...(prev.overview && nextSession.connected
          ? {
              overview: {
                ...prev.overview,
                status: nextSession.status,
                wsConnected: nextSession.wsConnected,
                kpis: {
                  ...prev.overview.kpis,
                  sessionSalesCount: nextSession.sessionSalesCount,
                  sessionPlatinumEarned: nextSession.sessionPlatinumEarned
                }
              }
            }
          : {})
      }))
      if (nextSession.connected && !get().overview && !get().isLoadingOverview) {
        void get().loadOverview(false)
      }
    })
  },

  openSignInModal: (defaultTab = 'credentials') =>
    set({ signInModalOpen: true, signInModalDefaultTab: defaultTab }),
  closeSignInModal: () => set({ signInModalOpen: false }),

  openCreateOrderModal: (opts) => {
    const { session } = get()
    // Strict guard: impossible to open the sell/order modal unless authenticated
    if (!session.connected || !session.user) {
      set({ createOrderModal: { open: false, defaultType: 'sell' } })
      notify({
        kind: 'warning',
        title: 'Connexion Warframe Market requise',
        message: 'Vous devez être connecté à votre compte Warframe Market pour mettre un item en vente.',
        forceShow: true
      })
      return
    }
    set({
      createOrderModal: {
        open: true,
        ...(opts?.prefillSlug ? { prefillSlug: opts.prefillSlug } : {}),
        defaultType: opts?.defaultType ?? 'sell'
      }
    })
  },

  closeCreateOrderModal: () => set({ createOrderModal: { open: false, defaultType: 'sell' } }),

  signInCredentials: async (input) => {
    const session = await ipcClient.wfmAccount.signInCredentials(input)
    set({ session, signInModalOpen: false, overviewError: null })
    notify({
      kind: 'success',
      title: `Connecté : ${session.user?.ingameName ?? 'Warframe Market'}`,
      message: 'Session chiffrée via Windows DPAPI. Votre profil et la mise en vente sont actifs.',
      forceShow: true
    })
    await get().loadOverview(true)
  },

  signInWeb: async (input) => {
    const session = await ipcClient.wfmAccount.signInWeb(input)
    set({ session, signInModalOpen: false, overviewError: null })
    notify({
      kind: 'success',
      title: `Connecté via le Web : ${session.user?.ingameName ?? 'Warframe Market'}`,
      message: 'Compte détecté automatiquement et jeton chiffré via Windows DPAPI.',
      forceShow: true
    })
    await get().loadOverview(true)
  },

  signInToken: async (input) => {
    const session = await ipcClient.wfmAccount.signInToken(input)
    set({ session, signInModalOpen: false, overviewError: null })
    notify({
      kind: 'success',
      title: `Connecté : ${session.user?.ingameName ?? 'Warframe Market'}`,
      message: 'Jeton vérifié et chiffré via Windows DPAPI.',
      forceShow: true
    })
    await get().loadOverview(true)
  },

  signOut: async () => {
    const session = await ipcClient.wfmAccount.signOut()
    set({
      session,
      overview: null,
      overviewError: null,
      createOrderModal: { open: false, defaultType: 'sell' }
    })
    notify({
      kind: 'info',
      title: 'Déconnecté de Warframe Market',
      message: 'Le jeton local a été supprimé. TennoFrame continue en mode anonyme.',
      forceShow: true
    })
  },

  setStatus: async (status) => {
    if (!get().session.connected) return
    const session = await ipcClient.wfmAccount.setStatus(status)
    set({ session })
    const label =
      status === 'ingame' ? 'En jeu' : status === 'online' ? 'En ligne' : 'Invisible'
    notify({
      kind: 'info',
      title: `Statut Warframe Market : ${label}`,
      message:
        status === 'invisible'
          ? 'Vos annonces sont temporairement masquées des acheteurs.'
          : 'Présence synchronisée en temps réel avec warframe.market.'
    })
  },

  loadOverview: async (forceRefresh = false) => {
    if (!get().session.connected) {
      set({ overview: null, isLoadingOverview: false, overviewError: null })
      return
    }
    set({ isLoadingOverview: true, overviewError: null })
    try {
      const overview = await ipcClient.wfmAccount.getOverview(forceRefresh)
      set({ overview, isLoadingOverview: false, overviewError: null })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Impossible de charger le profil WFM.'
      set({ isLoadingOverview: false, overviewError: msg })
    }
  },

  createOrder: async (input) => {
    const { session } = get()
    if (!session.connected || !session.user) {
      throw new Error(
        'Action bloquée : vous devez être connecté à votre compte Warframe Market pour mettre un item en vente.'
      )
    }
    const created = await ipcClient.wfmAccount.createOrder(input)
    await get().loadOverview(true)
    notify({
      kind: 'success',
      title: input.type === 'sell' ? 'Item mis en vente sur WFM' : 'Ordre d’achat publié sur WFM',
      message: `${created.itemNameFr} — ${created.platinum} Plat ×${created.quantity}`,
      forceShow: true
    })
    return created
  },

  updateOrder: async (input) => {
    if (!get().session.connected) {
      throw new Error('Connexion Warframe Market requise pour modifier une annonce.')
    }
    const updated = await ipcClient.wfmAccount.updateOrder(input)
    await get().loadOverview(true)
    return updated
  },

  closeOrderUnit: async (input, itemLabel, unitPlatinum) => {
    if (!get().session.connected) {
      throw new Error('Connexion Warframe Market requise.')
    }
    const res = await ipcClient.wfmAccount.closeOrderUnit(input)
    await get().loadOverview(true)
    notify({
      kind: 'success',
      title: `Transaction enregistrée : ${itemLabel}`,
      message:
        res.remainingQuantity > 0
          ? `+${unitPlatinum * input.quantity} Plat · Stock restant : ×${res.remainingQuantity}`
          : `+${unitPlatinum * input.quantity} Plat · Annonce clôturée (stock épuisé)`,
      forceShow: true
    })
  },

  deleteOrder: async (orderId, itemLabel) => {
    if (!get().session.connected) {
      throw new Error('Connexion Warframe Market requise.')
    }
    await ipcClient.wfmAccount.deleteOrder(orderId)
    await get().loadOverview(true)
    notify({
      kind: 'info',
      title: 'Annonce supprimée',
      message: `${itemLabel} a été retiré de votre profil Warframe Market.`
    })
  }
}))

