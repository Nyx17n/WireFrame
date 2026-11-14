import * as React from 'react'
import { Blocks, Check, Plus, Search, Trash2, X } from 'lucide-react'
import type { CodexItemDetail, CodexSummaryCard } from '@shared/schemas/codex.schema'
import { CODEX_OVERLAY_MAX_ENTRIES } from '@shared/schemas/extensions.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import {
  buildComponentOverlayEntry,
  buildItemKey,
  buildSingleItemOverlayEntry
} from '@/lib/codex-overlay-entries'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useFarmOverlayStore } from '@/stores/useFarmOverlayStore'

export function CodexOverlayPickerPanel({
  detail,
  onClose
}: {
  detail?: CodexItemDetail
  onClose: () => void
}): React.JSX.Element {
  const pinnedEntries = useFarmOverlayStore((s) => s.liveState.pinnedEntries)
  const toggleEntry = useFarmOverlayStore((s) => s.toggleEntry)
  const pinEquipmentSelection = useFarmOverlayStore((s) => s.pinEquipmentSelection)
  const unpinItemGroup = useFarmOverlayStore((s) => s.unpinItemGroup)
  const pinQuickItem = useFarmOverlayStore((s) => s.pinQuickItem)
  const toggleObtained = useFarmOverlayStore((s) => s.toggleObtained)
  const removeEntry = useFarmOverlayStore((s) => s.removeEntry)
  const clearAllEntries = useFarmOverlayStore((s) => s.clearAllEntries)
  const openSettingsModal = useAppStore((s) => s.openSettingsModal)

  const [includeResources, setIncludeResources] = React.useState(false)
  const [quickQuery, setQuickQuery] = React.useState('')
  const [quickResults, setQuickResults] = React.useState<CodexSummaryCard[]>([])

  React.useEffect(() => {
    const q = quickQuery.trim()
    if (q.length < 2) {
      setQuickResults([])
      return
    }
    let cancelled = false
    const timer = window.setTimeout(() => {
      void ipcClient.codex.quickSearch(q, 8).then((res) => {
        if (!cancelled) setQuickResults(res)
      })
    }, 160)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [quickQuery])

  const pinnedIdSet = React.useMemo(
    () => new Set(pinnedEntries.map((e) => e.entryId)),
    [pinnedEntries]
  )
  const pinnedItemKeys = React.useMemo(
    () => new Set(pinnedEntries.map((e) => e.itemKey)),
    [pinnedEntries]
  )

  return (
    <Card className="space-y-3 border-primary/40 bg-card/95 p-3.5 text-xs shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div className="flex items-center gap-2 font-semibold">
          <span>Sélecteur Granulaire — Codex Farm Overlay</span>
          <Badge variant="secondary" className="font-mono text-[10px]">
            {pinnedEntries.length} / {CODEX_OVERLAY_MAX_ENTRIES}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[11px]"
            onClick={() => openSettingsModal('extensions')}
          >
            <Blocks className="h-3 w-3 text-primary" />
            <span>Paramètres → Extensions</span>
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {detail && (
        <div className="space-y-2 rounded-md border border-border/60 bg-background/50 p-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-primary">
              Fiche active : {detail.nameFr} ({detail.typeLabel})
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {detail.components.some((c) => c.isResource) && (
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={includeResources}
                    onChange={(e) => setIncludeResources(e.target.checked)}
                    className="accent-primary"
                  />
                  <span>Inclure matériaux Fonderie</span>
                </label>
              )}
              <Button
                size="sm"
                variant="default"
                className="h-7 px-2.5 text-[11px]"
                onClick={() => void pinEquipmentSelection(detail, includeResources, true)}
              >
                <Check className="h-3 w-3" />
                <span>Tout afficher : {detail.nameFr}</span>
              </Button>
              {pinnedItemKeys.has(buildItemKey(detail.category, detail.id)) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => void unpinItemGroup(detail.category, detail.id)}
                >
                  Retirer le groupe
                </Button>
              )}
            </div>
          </div>

          {detail.components.length > 0 ? (
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {detail.components.map((comp, idx) => {
                const entry = buildComponentOverlayEntry(detail, comp, idx)
                const checked = pinnedIdSet.has(entry.entryId)
                const topSrc = entry.sources[0]
                return (
                  <button
                    key={entry.entryId}
                    type="button"
                    onClick={() => void toggleEntry(entry)}
                    className={`flex items-center justify-between gap-2 rounded border px-2 py-1.5 text-left transition-colors ${
                      checked
                        ? 'border-primary/60 bg-primary/15'
                        : 'border-border/60 bg-card/50 hover:border-primary/40'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {checked ? '☑ ' : '☐ '}
                        {comp.nameFr} {comp.count > 1 ? `×${comp.count}` : ''}
                      </div>
                      {topSrc && (
                        <div className="truncate text-[10px] text-muted-foreground">
                          {topSrc.labelFr} ({topSrc.chancePct}%)
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[11px]"
              onClick={() => void toggleEntry(buildSingleItemOverlayEntry(detail))}
            >
              {pinnedIdSet.has(buildItemKey(detail.category, detail.id))
                ? `☑ ${detail.nameFr} (Épinglé)`
                : `+ Afficher ${detail.nameFr} seul`}
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-2 rounded-md border border-border/60 bg-background/50 p-2.5">
          <div className="font-semibold">Ajouter un objet en particulier (5 catégories)</div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Ex: Ember, Cellule Orokin, Nataruk, Continuité, Axi..."
              className="h-7 pl-8 text-xs"
            />
          </div>
          {quickResults.length > 0 && (
            <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
              {quickResults.map((item) => {
                const isPinned = pinnedItemKeys.has(buildItemKey(item.category, item.id))
                return (
                  <div
                    key={`${item.category}-${item.id}`}
                    className="flex items-center justify-between gap-2 rounded border border-border/50 bg-card/60 px-2 py-1"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <SafeAssetImage
                        src={item.imageUrl}
                        alt={item.nameFr}
                        className="h-6 w-6 shrink-0 rounded object-contain"
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{item.nameFr}</div>
                        <div className="truncate text-[10px] text-muted-foreground">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isPinned ? 'secondary' : 'outline'}
                      className="h-6 shrink-0 px-2 text-[10px]"
                      onClick={() => void pinQuickItem(item.category, item.id)}
                    >
                      {isPinned ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      <span>{isPinned ? 'Épinglé' : 'Ajouter'}</span>
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-md border border-border/60 bg-background/50 p-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Ma liste Overlay active ({pinnedEntries.length})</span>
            {pinnedEntries.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-1.5 text-[10px] text-destructive"
                onClick={() => void clearAllEntries()}
              >
                <Trash2 className="h-3 w-3" />
                <span>Vider</span>
              </Button>
            )}
          </div>
          {pinnedEntries.length === 0 ? (
            <p className="py-3 text-[11px] text-muted-foreground">
              Aucun objectif sélectionné. Choisis un équipement complet ou recherche un matériau, mod, arme ou relique.
            </p>
          ) : (
            <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
              {pinnedEntries.map((entry) => (
                <div
                  key={entry.entryId}
                  className="flex items-center justify-between gap-2 rounded border border-border/50 bg-card/60 px-2 py-1"
                >
                  <button
                    type="button"
                    onClick={() => void toggleObtained(entry.entryId)}
                    className={`min-w-0 flex-1 truncate text-left ${
                      entry.obtained ? 'line-through opacity-60' : 'font-medium'
                    }`}
                  >
                    {entry.obtained ? '✓ ' : '☐ '}
                    {entry.labelFr}
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeEntry(entry.entryId)}
                    className="text-muted-foreground hover:text-destructive"
                    title="Retirer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
