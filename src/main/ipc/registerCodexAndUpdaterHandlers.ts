import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import {
  CodexCategorySchema,
  CodexSearchParamsSchema
} from '@shared/schemas/codex.schema'
import type { CodexRepository } from '../services/CodexRepository'
import type { UpdaterService } from '../services/UpdaterService'
import type { WindowOverlayService } from '../services/WindowOverlayService'
import { assertTrustedSender } from './security'

const QuickSearchArgSchema = z.object({
  query: z.string().max(120).default(''),
  limit: z.number().int().min(1).max(24).default(8)
})

const ItemDetailArgSchema = z.object({
  category: CodexCategorySchema,
  id: z.string().min(1).max(160)
})

export function registerCodexAndUpdaterHandlers(deps: {
  windowService: WindowOverlayService
  codexRepository: CodexRepository
  updaterService: UpdaterService
}): void {
  const { windowService, codexRepository, updaterService } = deps

  ipcMain.handle(IPC_CHANNELS.CODEX_SEARCH, async (event, rawArgs) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const params = CodexSearchParamsSchema.parse(rawArgs ?? {})
    return codexRepository.search(params)
  })

  ipcMain.handle(IPC_CHANNELS.CODEX_QUICK_SEARCH, async (event, rawArgs) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { query, limit } = QuickSearchArgSchema.parse(rawArgs ?? {})
    return codexRepository.quickSearch(query, limit)
  })

  ipcMain.handle(IPC_CHANNELS.CODEX_GET_ITEM_DETAIL, async (event, rawArgs) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { category, id } = ItemDetailArgSchema.parse(rawArgs ?? {})
    return codexRepository.getItemDetail(category, id)
  })

  ipcMain.handle(IPC_CHANNELS.CODEX_GET_HELMINTH, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return codexRepository.getHelminth()
  })

  ipcMain.handle(IPC_CHANNELS.UPDATER_GET_STATUS, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return updaterService.getStatus()
  })

  ipcMain.handle(IPC_CHANNELS.UPDATER_CHECK, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return updaterService.checkForUpdates()
  })

  ipcMain.handle(IPC_CHANNELS.UPDATER_INSTALL, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return updaterService.downloadAndInstall()
  })
}

