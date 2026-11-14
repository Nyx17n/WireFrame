import * as React from 'react'
import { Check, Package, X } from 'lucide-react'
import type {
  CodexOverlayPinnedEntry,
  OverlayDensity
} from '@shared/schemas/extensions.schema'
import { Badge } from '@/components/ui/badge'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { ChanceBadgeWithUnderBar } from '@/components/codex/ChanceBadgeWithUnderBar'
import { getSourceTypePrefix } from '@/lib/codex-overlay-entries'
import { cn } from '@/lib/utils'

export function CodexFarmOverlayCard({
  entry,
  density,
  interactive,
  onToggleObtained,
  onRemove
}: {
  entry: CodexOverlayPinnedEntry
  density: OverlayDensity
  interactive: boolean
  onToggleObtained: (entryId: string) => void
  onRemove: (entryId: string) => void
}): React.JSX.Element {
  const primarySource = entry.sources[0]
  const visibleSources = density === 'sm' ? entry.sources.slice(0, 1) : entry.sources.slice(0, 2)

  return (
    <div
      className={cn(
        'rounded-lg border border-border/75 bg-card/85 transition-colors',
        density === 'sm' ? 'px-2.5 py-1.5' : density === 'lg' ? 'p-3' : 'px-3 py-2',
        entry.obtained && 'opacity-55'
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <button
            type="button"
            disabled={!interactive}
            onClick={() => onToggleObtained(entry.entryId)}
            title={entry.obtained ? 'Marquer comme non obtenu' : 'Marquer comme obtenu'}
            className={cn(
              'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
              entry.obtained
                ? 'border-emerald-500 bg-emerald-500/25 text-emerald-300'
                : 'border-border bg-background/70 hover:border-primary',
              !interactive && 'pointer-events-none'
            )}
          >
            {entry.obtained && <Check className="h-3 w-3" />}
          </button>

          {density !== 'sm' && (
            <SafeAssetImage
              src={entry.imageUrl}
              alt={entry.labelFr}
              className={cn(
                'shrink-0 rounded border border-border/60 bg-background/70 object-contain p-0.5',
                density === 'lg' ? 'h-9 w-9' : 'h-7 w-7'
              )}
              fallback={
                <div
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded border border-border/60 bg-background/70',
                    density === 'lg' ? 'h-9 w-9' : 'h-7 w-7'
                  )}
                >
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              }
            />
          )}

          <div className="min-w-0 flex-1">
            <div
              className={cn(
                'truncate font-semibold leading-tight text-foreground',
                density === 'sm' ? 'text-[11px]' : 'text-xs',
                entry.obtained && 'line-through'
              )}
            >
              {entry.labelFr}
            </div>
            {density !== 'sm' && (
              <div className="truncate text-[10px] text-muted-foreground">
                {entry.groupLabelFr}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-1.5">
          {primarySource && (
            <ChanceBadgeWithUnderBar
              chancePct={primarySource.chancePct}
              isGuaranteed={primarySource.isGuaranteed}
              compact={density === 'sm'}
            />
          )}
          {interactive && (
            <button
              type="button"
              onClick={() => onRemove(entry.entryId)}
              title="Retirer de l’Overlay"
              className="mt-0.5 rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className={cn('space-y-1', density === 'sm' ? 'mt-1 pl-6' : 'mt-1.5 pl-6')}>
        {visibleSources.map((src, idx) => {
          const prefix = getSourceTypePrefix(src.type)
          return (
            <div key={`${src.type}-${idx}`} className="space-y-0.5">
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <div className="flex min-w-0 items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn('shrink-0 px-1 py-0 text-[9px]', prefix.badgeClass)}
                  >
                    {prefix.tagFr}
                  </Badge>
                  <span className="truncate text-foreground/95">{src.labelFr}</span>
                </div>
                {idx > 0 && (
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {src.isGuaranteed ? '100 %' : `${src.chancePct.toFixed(src.chancePct % 1 === 0 ? 0 : 2)} %`}
                  </span>
                )}
              </div>
              {density === 'lg' && src.sublabelFr && (
                <p className="truncate text-[10px] text-muted-foreground">{src.sublabelFr}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
