import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import {
  CloseWfmOrderUnitInputSchema,
  CreateWfmOrderInputSchema,
  UpdateWfmOrderInputSchema,
  WfmPresenceStatusSchema,
  WfmSignInCredentialsInputSchema,
  WfmSignInTokenInputSchema,
  WfmSignInWebInputSchema
} from '@shared/schemas/wfm-account.schema'
import type { WfmAccountService } from '../services/WfmAccountService'
import type { WfmAuthService } from '../services/WfmAuthService'
import type { WfmWebLoginService } from '../services/WfmWebLoginService'
import type { WindowOverlayService } from '../services/WindowOverlayService'
import { assertTrustedSender } from './security'

const RefreshOnlyPayloadSchema = z
  .object({
    forceRefresh: z.boolean().optional()
  })
  .optional()

const StatusPayloadSchema = z.object({
  status: WfmPresenceStatusSchema
})

const DeleteOrderPayloadSchema = z.object({
  orderId: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-zA-Z0-9_-]+$/)
})

export function registerWfmAccountHandlers(deps: {
  wfmAuth: WfmAuthService
  wfmAccount: WfmAccountService
  wfmWebLogin: WfmWebLoginService
  windowService: WindowOverlayService
}): void {
  const { wfmAuth, wfmAccount, wfmWebLogin, windowService } = deps

  wfmAuth.onSessionChanged((sessionState) => {
    const win = windowService.getMainWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.WFM_ACCOUNT_ON_SESSION_CHANGED, sessionState)
    }
  })

  ipcMain.handle(IPC_CHANNELS.WFM_ACCOUNT_GET_SESSION, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return wfmAuth.getSessionState()
  })

  ipcMain.handle(
    IPC_CHANNELS.WFM_ACCOUNT_SIGN_IN_CREDENTIALS,
    async (event, rawPayload: unknown) => {
      assertTrustedSender(event, windowService.getMainWindow())
      const input = WfmSignInCredentialsInputSchema.parse(rawPayload)
      return wfmAuth.signInWithCredentials(input)
    }
  )

  ipcMain.handle(IPC_CHANNELS.WFM_ACCOUNT_SIGN_IN_WEB, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const input = WfmSignInWebInputSchema.parse(rawPayload ?? {})
    return wfmWebLogin.signInViaWebWindow(input)
  })

  ipcMain.handle(IPC_CHANNELS.WFM_ACCOUNT_SIGN_IN_TOKEN, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const input = WfmSignInTokenInputSchema.parse(rawPayload)
    return wfmAuth.signInWithToken(input)
  })

  ipcMain.handle(IPC_CHANNELS.WFM_ACCOUNT_SIGN_OUT, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return wfmAuth.signOut()
  })

  ipcMain.handle(IPC_CHANNELS.WFM_ACCOUNT_SET_STATUS, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { status } = StatusPayloadSchema.parse(rawPayload)
    return wfmAuth.setPresenceStatus(status)
  })

  ipcMain.handle(IPC_CHANNELS.WFM_ACCOUNT_GET_OVERVIEW, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const parsed = RefreshOnlyPayloadSchema.parse(rawPayload)
    return wfmAccount.getOverview(Boolean(parsed?.forceRefresh))
  })

  ipcMain.handle(IPC_CHANNELS.WFM_ACCOUNT_CREATE_ORDER, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const input = CreateWfmOrderInputSchema.parse(rawPayload)
    return wfmAccount.createOrder(input)
  })

  ipcMain.handle(IPC_CHANNELS.WFM_ACCOUNT_UPDATE_ORDER, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const input = UpdateWfmOrderInputSchema.parse(rawPayload)
    return wfmAccount.updateOrder(input)
  })

  ipcMain.handle(IPC_CHANNELS.WFM_ACCOUNT_CLOSE_ORDER_UNIT, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const input = CloseWfmOrderUnitInputSchema.parse(rawPayload)
    return wfmAccount.closeOrderUnit(input)
  })

  ipcMain.handle(IPC_CHANNELS.WFM_ACCOUNT_DELETE_ORDER, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { orderId } = DeleteOrderPayloadSchema.parse(rawPayload)
    return wfmAccount.deleteOrder(orderId)
  })
}

