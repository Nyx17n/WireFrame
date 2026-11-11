import * as React from 'react'
import { Activity, Database, Keyboard, ShieldCheck, Sparkles } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

export function StatusBar(): React.JSX.Element {
  const systemStatus = useAppStore((s) => s.systemStatus)
  const updaterStatus = useAppStore((s) => s.updaterStatus)
  const settings = useAppStore((s) => s.settings)
  const windowState = useAppStore((s) => s.windowState)
  const setChangelogOpen = useAppStore((s) => s.setChangelogOpen)
  const openSettingsModal = useAppStore((s) => s.openSettingsModal)

  return (
    <footer className="flex h-6 shrink-0 select-none items-center justify-between border-t border-border bg-card/90 px-3 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="inline-flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="h-3 w-3 shrink-0" />
          <span className="truncate">IPC Sandbox · TLS Strict</span>
        </span>

        {systemStatus && (
          <>
            <span className="inline-flex items-center gap-1">
              <Activity className="h-3 w-3 text-primary" />
              <span>
                {systemStatus.rateLimiterInWindow}/{systemStatus.rateLimiterMaxPerSec} req/s
              </span>
            </span>
            {!windowState.isCompactMode && (
              <span className="inline-flex items-center gap-1">
                <Database className="h-3 w-3 text-primary" />
                <span>Cache: {systemStatus.memoryCacheEntries}</span>
              </span>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {updaterStatus?.state === 'downloaded' && (
          <button
            type="button"
            onClick={() => openSettingsModal('system')}
            className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/30"
          >
            <Sparkles className="h-2.5 w-2.5" />
            <span>MAJ v{updaterStatus.availableVersion} prête</span>
          </button>
        )}

        {!windowState.isCompactMode && (
          <span className="inline-flex items-center gap-1">
            <Keyboard className="h-3 w-3" />
            <span>
              {settings.window.shortcuts.toggleOverlay} · {settings.window.shortcuts.toggleCompact}{' '}
              · {settings.window.shortcuts.toggleAlwaysOnTop}
            </span>
          </span>
        )}
        <button
          type="button"
          title="Voir les Notes de Patch WireFrame"
          onClick={() => setChangelogOpen(true)}
          className="font-mono text-[10px] text-foreground/80 transition-colors hover:text-primary"
        >
          v{systemStatus?.appVersion ?? '2.0.0'}
        </button>
      </div>
    </footer>
  )
}
