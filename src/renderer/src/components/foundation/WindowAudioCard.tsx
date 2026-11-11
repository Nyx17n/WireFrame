import * as React from 'react'
import { Copy, Check, MonitorUp, Volume2, ZoomIn, ZoomOut } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { playAlertSoundPreview } from '@/services/audio-preview.service'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'

export function WindowAudioCard(): React.JSX.Element {
  const settings = useAppStore((s) => s.settings)
  const windowState = useAppStore((s) => s.windowState)
  const systemStatus = useAppStore((s) => s.systemStatus)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const toggleAlwaysOnTop = useAppStore((s) => s.toggleAlwaysOnTop)
  const toggleCompactMode = useAppStore((s) => s.toggleCompactMode)
  const setWindowZoom = useAppStore((s) => s.setWindowZoom)

  const [copiedWhisper, setCopiedWhisper] = React.useState(false)

  const handleTestWhisperCopy = async (): Promise<void> => {
    await ipcClient.clipboard.writeText(
      '/w Nyxo_17 Hi! I want to buy: "Glaive Prime Set" for 320 platinum. (warframe.market)'
    )
    setCopiedWhisper(true)
    window.setTimeout(() => setCopiedWhisper(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <MonitorUp className="h-4 w-4 text-primary" />
            <span>Overlay, Zoom Natif & Audio</span>
          </CardTitle>
          <CardDescription>
            Contrôles IPC Electron durcis (sandbox: true, contextIsolation: true)
          </CardDescription>
        </div>
        <Badge variant="success">Actif</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2.5 rounded-md border border-border bg-background/50 p-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center justify-between gap-2 text-xs">
            <span>Always-on-Top (Alt+P)</span>
            <Switch
              checked={windowState.isAlwaysOnTop}
              onCheckedChange={() => void toggleAlwaysOnTop()}
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between gap-2 text-xs">
            <span>Mode Compact 460×660 (Alt+M)</span>
            <Switch
              checked={windowState.isCompactMode}
              onCheckedChange={() => void toggleCompactMode()}
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between gap-2 text-xs">
            <span>Minimiser dans le Tray (✕)</span>
            <Switch
              checked={settings.window.closeToTray}
              onCheckedChange={(checked) =>
                void updateSettings({ window: { closeToTray: checked } })
              }
            />
          </label>

          <div className="flex items-center justify-between gap-1 text-xs">
            <span>Zoom UI ({windowState.zoomPercent}%)</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => void setWindowZoom(windowState.zoomPercent - 10)}
                aria-label="Réduire le zoom"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void setWindowZoom(100)}
              >
                100%
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => void setWindowZoom(windowState.zoomPercent + 10)}
                aria-label="Augmenter le zoom"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void playAlertSoundPreview('classic', settings.audio.volumePercent)}
            >
              <Volume2 className="h-3.5 w-3.5 text-primary" />
              <span>Son Classique</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void playAlertSoundPreview('bell', settings.audio.volumePercent)}
            >
              <Volume2 className="h-3.5 w-3.5 text-primary" />
              <span>Son Cloche</span>
            </Button>
          </div>

          <Button variant="default" size="sm" onClick={() => void handleTestWhisperCopy()}>
            {copiedWhisper ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedWhisper ? 'Whisper /w copié !' : 'Tester Presse-Papier /w'}</span>
          </Button>
        </div>

        {systemStatus && (
          <p className="truncate font-mono text-[10px] text-muted-foreground">
            Config stockée dans : {systemStatus.userDataPath}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

