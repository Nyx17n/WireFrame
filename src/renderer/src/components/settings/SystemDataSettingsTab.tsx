import * as React from 'react'
import { Download, RotateCcw, ShieldCheck, Trash2, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/useAppStore'

export function SystemDataSettingsTab(): React.JSX.Element {
  const systemStatus = useAppStore((s) => s.systemStatus)
  const clearSystemCache = useAppStore((s) => s.clearSystemCache)
  const exportSettingsJson = useAppStore((s) => s.exportSettingsJson)
  const importSettingsJson = useAppStore((s) => s.importSettingsJson)
  const resetSettings = useAppStore((s) => s.resetSettings)

  const [feedback, setFeedback] = React.useState<string | null>(null)

  const notify = (msg: string): void => {
    setFeedback(msg)
    window.setTimeout(() => setFeedback(null), 3000)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Système, Mises à Jour SHA-512 & Données</h3>
        <p className="text-xs text-muted-foreground">
          Gère le cache local, tes sauvegardes JSON et l’intégrité de l’application.
        </p>
      </div>

      <div className="space-y-2 rounded-md border border-border bg-background/50 p-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-medium">Version installée</span>
          <Badge variant="default">v{systemStatus?.appVersion ?? '2.0.0-alpha.1'}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Canal electron-updater (SHA-512)</span>
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Prêt (activé en Release packagée Jalon 6)</span>
          </span>
        </div>
        {systemStatus && (
          <div className="pt-1 font-mono text-[10px] text-muted-foreground">
            Dossier config : {systemStatus.userDataPath}
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-md border border-border bg-background/50 p-3 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="font-medium">Cache Mémoire & Icônes Disque (wf-asset://)</div>
            <div className="text-[11px] text-muted-foreground">
              Entrées actives en RAM : {systemStatus?.memoryCacheEntries ?? 0}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              void clearSystemCache()
                .then(() => notify('Cache mémoire et icônes purgés.'))
                .catch((e: unknown) => notify(e instanceof Error ? e.message : 'Erreur purge cache'))
            }
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Purger le cache</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                void exportSettingsJson()
                  .then((ok) => ok && notify('Configuration exportée avec succès.'))
                  .catch((e: unknown) => notify(e instanceof Error ? e.message : 'Erreur export'))
              }
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              <span>Exporter JSON</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                void importSettingsJson()
                  .then((ok) => ok && notify('Configuration importée et validée par Zod.'))
                  .catch((e: unknown) => notify(e instanceof Error ? e.message : 'JSON invalide'))
              }
            >
              <Upload className="h-3.5 w-3.5 text-primary" />
              <span>Importer JSON</span>
            </Button>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() =>
              void resetSettings().then(() => notify('Réglages réinitialisés par défaut.'))
            }
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Réinitialiser tout</span>
          </Button>
        </div>

        {feedback && <p className="text-[11px] font-medium text-primary">{feedback}</p>}
      </div>
    </div>
  )
}
