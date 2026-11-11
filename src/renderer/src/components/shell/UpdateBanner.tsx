import * as React from 'react'
import { Download, FileText, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/useAppStore'

export function UpdateBanner(): React.JSX.Element | null {
  const updaterStatus = useAppStore((s) => s.updaterStatus)
  const installUpdate = useAppStore((s) => s.installUpdate)
  const setChangelogOpen = useAppStore((s) => s.setChangelogOpen)
  const [dismissedVersion, setDismissedVersion] = React.useState<string | null>(null)

  if (!updaterStatus) return null
  const { state, availableVersion, progressPercent, message } = updaterStatus
  if (state !== 'available' && state !== 'downloading' && state !== 'downloaded') {
    return null
  }
  if (availableVersion && dismissedVersion === availableVersion) {
    return null
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-emerald-500/40 bg-emerald-950/35 px-3 py-1.5 text-xs">
      <div className="flex min-w-0 items-center gap-2">
        {state === 'downloaded' ? (
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
        ) : (
          <Download className="h-3.5 w-3.5 shrink-0 animate-bounce text-primary" />
        )}
        <span className="truncate font-medium text-foreground">{message}</span>
        {state === 'downloading' && progressPercent !== null && (
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{ width: `${Math.max(4, Math.min(100, progressPercent))}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-[11px]"
          onClick={() => setChangelogOpen(true)}
        >
          <FileText className="h-3 w-3" />
          <span>Notes</span>
        </Button>
        {state === 'downloaded' && (
          <Button
            size="sm"
            className="h-6 bg-emerald-600 px-2.5 text-[11px] text-white hover:bg-emerald-500"
            onClick={() => void installUpdate()}
          >
            <Sparkles className="h-3 w-3" />
            <span>Installer & Redémarrer</span>
          </Button>
        )}
        <button
          type="button"
          onClick={() => setDismissedVersion(availableVersion ?? 'dismissed')}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="Masquer le bandeau de mise à jour"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

