import * as React from 'react'
import { Activity, Database, Keyboard, ShieldCheck } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

export function StatusBar(): React.JSX.Element {
  const systemStatus = useAppStore((s) => s.systemStatus)
  const settings = useAppStore((s) => s.settings)
  const windowState = useAppStore((s) => s.windowState)

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
        {!windowState.isCompactMode && (
          <span className="inline-flex items-center gap-1">
            <Keyboard className="h-3 w-3" />
            <span>
              {settings.window.shortcuts.toggleOverlay} · {settings.window.shortcuts.toggleCompact}{' '}
              · {settings.window.shortcuts.toggleAlwaysOnTop}
            </span>
          </span>
        )}
        <span className="font-mono text-[10px] text-foreground/80">
          v{systemStatus?.appVersion ?? '2.0.0-alpha.1'}
        </span>
      </div>
    </footer>
  )
}

