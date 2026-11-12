import { create } from 'zustand'
import type { CodexCategory, CodexCraftPreview } from '@shared/schemas/codex.schema'
import { ipcClient } from '@/services/ipc-client'

export interface HydratedCodexCardMeta {
  readonly craftComponents: readonly CodexCraftPreview[]
  readonly acquisitionText: string | null
}

interface CodexCardMetaStoreState {
  byKey: Record<string, HydratedCodexCardMeta>
  requestMeta: (category: CodexCategory, id: string) => void
}

const inflight = new Set<string>()

export const useCodexCardMetaStore = create<CodexCardMetaStoreState>((set, get) => ({
  byKey: {},
  requestMeta: (category, id) => {
    const key = `${category}:${id}`
    if (get().byKey[key] || inflight.has(key)) return
    inflight.add(key)

    void ipcClient.codex
      .getItemDetail(category, id)
      .then((detail) => {
        const prioritized = [...detail.components].sort((a, b) => {
          const aBp = a.nameFr.toLowerCase().includes('schéma') ? 1 : 0
          const bBp = b.nameFr.toLowerCase().includes('schéma') ? 1 : 0
          return aBp - bBp
        })
        const craftComponents: CodexCraftPreview[] = prioritized.slice(0, 6).map((c) => ({
          nameFr: c.nameFr,
          count: c.count,
          imageUrl: c.imageUrl
        }))
        const topDrop = detail.drops[0]
        const acquisitionText =
          category === 'relics' && detail.isVaulted
            ? 'Aya (Varzia — Résurgence Prime)'
            : topDrop
              ? `${topDrop.location} (${topDrop.chance}%)`
              : detail.planets
        set((s) => ({
          byKey: {
            ...s.byKey,
            [key]: { craftComponents, acquisitionText }
          }
        }))
      })
      .catch(() => {
        set((s) => ({
          byKey: {
            ...s.byKey,
            [key]: { craftComponents: [], acquisitionText: null }
          }
        }))
      })
      .finally(() => {
        inflight.delete(key)
      })
  }
}))
