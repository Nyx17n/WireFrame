import * as React from 'react'
import { BellRing, Volume2 } from 'lucide-react'
import type { SoundChoice } from '@shared/schemas/settings.schema'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { openHubSection } from '@/lib/hub-navigation'
import { playAlertSoundPreview } from '@/services/audio-preview.service'
import { useAppStore } from '@/stores/useAppStore'
import { notify, type PushNotificationInput } from '@/stores/useNotificationStore'

const SCAN_INTERVALS = [15, 30, 60, 120, 300] as const

const DEMO_SAMPLES: readonly Omit<PushNotificationInput, 'forceShow'>[] = [
  {
    kind: 'info',
    title: 'Notification de démonstration',
    message: 'Survole cette carte pour mettre son minuteur en pause.'
  },
  {
    kind: 'success',
    title: 'Ajouté au panier',
    message: 'Glaive Prime Set · Prêt pour le Trade Bundler.'
  },
  {
    kind: 'warning',
    title: 'Rotation imminente sur Cetus',
    message: 'La nuit commence dans moins de 5 minutes.'
  },
  {
    kind: 'alert',
    title: 'Fissure Axi · Survie · Route de l’Acier',
    message: 'Mot (Néant) — Corrompus · Cliquez sur ✕ pour fermer.',
    actions: [
      {
        label: 'Voir dans le Hub',
        icon: 'hub',
        onClick: () => {
          useAppStore.getState().setSettingsOpen(false)
          openHubSection('fissures')
        }
      }
    ]
  }
]

export function AudioAlertsSettingsTab(): React.JSX.Element {
  const audio = useAppStore((s) => s.settings.audio)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const demoIdxRef = React.useRef(0)

  const setSoundChoice = (soundChoice: SoundChoice): void => {
    void updateSettings({ audio: { soundChoice } })
  }

  const handleTestNotification = (): void => {
    const sample = DEMO_SAMPLES[demoIdxRef.current % DEMO_SAMPLES.length]
    demoIdxRef.current += 1
    if (sample) {
      notify({ ...sample, forceShow: true })
    }
    if (audio.soundEnabled) {
      void playAlertSoundPreview(audio.soundChoice, audio.volumePercent)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Audio, Notifications & Price Sniper</h3>
        <p className="text-xs text-muted-foreground">
          Configure les notifications in-app, les sonneries et la surveillance en arrière-plan.
        </p>
      </div>

      <div className="space-y-3 rounded-md border border-border bg-background/50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="space-y-0.5">
            <div className="font-medium text-foreground">Notifications visuelles dans l’app</div>
            <p className="text-[11px] text-muted-foreground">
              Empilées en bas à droite et archivées sous l’icône 🔔 de la barre supérieure.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={handleTestNotification}>
            <BellRing className="h-3.5 w-3.5 text-primary" />
            <span>Tester une notification</span>
          </Button>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-border/60 pt-2.5 text-xs">
          <div className="space-y-0.5">
            <span>Notifications d’actions (Succès & Info)</span>
            <p className="text-[11px] text-muted-foreground">
              Les Erreurs et les Alertes (Price Sniper / Worldstate) restent toujours affichées.
            </p>
          </div>
          <Switch
            checked={audio.actionNotificationsEnabled !== false}
            onCheckedChange={(checked) =>
              void updateSettings({ audio: { actionNotificationsEnabled: checked } })
            }
          />
        </label>
      </div>

      <div className="space-y-3 rounded-md border border-border bg-background/50 p-3">
        <label className="flex cursor-pointer items-center justify-between text-xs">
          <span>Activer les alertes sonores</span>
          <Switch
            checked={audio.soundEnabled}
            onCheckedChange={(checked) => void updateSettings({ audio: { soundEnabled: checked } })}
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span>Sonnerie d’alerte</span>
          <div className="flex items-center gap-1.5">
            {(['classic', 'bell'] as const).map((choice) => (
              <Button
                key={choice}
                size="sm"
                variant={audio.soundChoice === choice ? 'default' : 'outline'}
                onClick={() => setSoundChoice(choice)}
              >
                {choice === 'classic' ? 'Classique' : 'Cloche (Bell)'}
              </Button>
            ))}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void playAlertSoundPreview(audio.soundChoice, audio.volumePercent)}
            >
              <Volume2 className="h-3.5 w-3.5 text-primary" />
              <span>Tester le son</span>
            </Button>
          </div>
        </div>

        <label className="flex items-center justify-between gap-4 text-xs">
          <span>Volume ({audio.volumePercent} %)</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={audio.volumePercent}
            onChange={(e) =>
              void updateSettings({ audio: { volumePercent: Number(e.target.value) } })
            }
            className="w-44 accent-primary"
          />
        </label>
      </div>

      <div className="space-y-3 rounded-md border border-border bg-background/50 p-3">
        <label className="flex cursor-pointer items-center justify-between text-xs">
          <span>Notifications Windows natives (en arrière-plan / Tray)</span>
          <Switch
            checked={audio.nativeOsNotifications}
            onCheckedChange={(checked) =>
              void updateSettings({ audio: { nativeOsNotifications: checked } })
            }
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between text-xs">
          <span>Répéter l’alerte tant que l’offre reste disponible</span>
          <Switch
            checked={audio.repeatAlerts}
            onCheckedChange={(checked) => void updateSettings({ audio: { repeatAlerts: checked } })}
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span>Fréquence de scan Price Sniper</span>
          <div className="flex flex-wrap gap-1">
            {SCAN_INTERVALS.map((sec) => (
              <Button
                key={sec}
                size="sm"
                variant={audio.scanIntervalSec === sec ? 'default' : 'outline'}
                onClick={() => void updateSettings({ audio: { scanIntervalSec: sec } })}
              >
                {sec < 60 ? `${sec}s` : `${sec / 60} min`}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
