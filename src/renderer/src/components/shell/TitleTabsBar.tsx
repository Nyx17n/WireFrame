import * as React from 'react'
import { Globe, Layers, Minus, Plus, Square, Copy, X } from 'lucide-react'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

export function TitleTabsBar(): React.JSX.Element {
  const windowState = useAppStore((s) => s.windowState)

  return (
    <header
      className="app-drag-region flex h-9 shrink-0 select-none items-center justify-between border-b border-border bg-background/95 pl-2"
      aria-label="Barre d'onglets et contrôles fenêtre"
    >
      <div className="app-no-drag flex min-w-0 items-center gap-1.5 overflow-hidden">
        <div className="flex items-center gap-1.5 pr-1">
          <img
            src="./images/logo.png"
            alt="Logo WireFrame"
            className="h-5 w-5 rounded-sm object-contain"
          />
          {!windowState.isCompactMode && (
            <span className="text-xs font-bold tracking-wide text-foreground">WireFrame</span>
          )}
        </div>

        <button
          type="button"
          title="Hub Worldstate (Jalon 5)"
          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-secondary/70 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span>Hub</span>
        </button>

        <div
          className={cn(
            'flex h-7 items-center gap-1.5 rounded-md border border-primary/40 bg-primary/15 px-2.5 text-xs font-semibold text-foreground',
            windowState.isCompactMode ? 'max-w-[180px]' : 'max-w-[260px]'
          )}
        >
          <Layers className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">
            {windowState.isCompactMode ? 'Jalon 1 · Socle' : 'Jalon 1 — Socle & Architecture'}
          </span>
        </div>

        <button
          type="button"
          title="Nouvel onglet (activé au Jalon 2)"
          disabled
          className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="app-no-drag flex h-full shrink-0 items-stretch">
        <button
          type="button"
          onClick={() => void ipcClient.window.minimize()}
          aria-label="Réduire la fenêtre"
          className="inline-flex w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => void ipcClient.window.toggleMaximize()}
          aria-label={windowState.isMaximized ? 'Restaurer la fenêtre' : 'Agrandir la fenêtre'}
          className="inline-flex w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {windowState.isMaximized ? (
            <Copy className="h-3 w-3" />
          ) : (
            <Square className="h-3 w-3" />
          )}
        </button>
        <button
          type="button"
          onClick={() => void ipcClient.window.close()}
          aria-label="Fermer la fenêtre"
          className="inline-flex w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}

