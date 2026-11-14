import * as React from 'react'
import { MonitorCog, Play, Sparkles, Wand2, ZoomIn, ZoomOut } from 'lucide-react'
import type { AnimationLevel } from '@shared/schemas/settings.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { isOsReducedMotionPreferred, subscribeOsReducedMotion } from '@/lib/theme-engine'
import { useAppStore } from '@/stores/useAppStore'

const ANIMATION_LEVELS: readonly { id: AnimationLevel; label: string; hint: string }[] = [
  { id: 'full', label: 'Complètes', hint: 'Transitions fluides, cascades & micro-interactions' },
  { id: 'reduced', label: 'Réduites', hint: 'Fondus légers uniquement, sans déplacement' },
  { id: 'off', label: 'Désactivées', hint: 'Instantané (0 ms), hors spinners de chargement' }
]

export function MotionSettingsSection(): React.JSX.Element {
  const appearance = useAppStore((s) => s.settings.appearance)
  const windowState = useAppStore((s) => s.windowState)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const setWindowZoom = useAppStore((s) => s.setWindowZoom)
  const replayStartupAnimation = useAppStore((s) => s.replayStartupAnimation)

  const [osReduced, setOsReduced] = React.useState(() => isOsReducedMotionPreferred())

  React.useEffect(
    () => subscribeOsReducedMotion(() => setOsReduced(isOsReducedMotionPreferred())),
    []
  )

  const currentLevel: AnimationLevel = appearance.animationLevel ?? 'full'
  const activeHint = ANIMATION_LEVELS.find((l) => l.id === currentLevel)?.hint ?? ''

  return (
    <div className="space-y-3 rounded-md border border-border bg-background/50 p-3">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-2 font-medium text-foreground">
            <Wand2 className="h-3.5 w-3.5 text-primary" />
            <span>Animations de l’interface</span>
          </span>
          <div className="flex flex-wrap gap-1">
            {ANIMATION_LEVELS.map((lvl) => (
              <Button
                key={lvl.id}
                size="sm"
                variant={currentLevel === lvl.id ? 'default' : 'outline'}
                onClick={() => void updateSettings({ appearance: { animationLevel: lvl.id } })}
              >
                {lvl.label}
              </Button>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">{activeHint}</p>
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-border/60 pt-2.5 text-xs">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <MonitorCog className="h-3.5 w-3.5 text-primary" />
            <span>Respecter le réglage Windows « Afficher les animations »</span>
            {osReduced && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                Windows : réduites
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Si Windows réduit les mouvements, TennoFrame plafonne automatiquement sur « Réduites ».
          </p>
        </div>
        <Switch
          checked={appearance.respectOsReducedMotion !== false}
          onCheckedChange={(checked) =>
            void updateSettings({ appearance: { respectOsReducedMotion: checked } })
          }
        />
      </label>

      <label className="flex cursor-pointer items-center justify-between border-t border-border/60 pt-2.5 text-xs">
        <span className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Effet de lueur subtile sur les cartes (Glow)</span>
        </span>
        <Switch
          checked={appearance.glowEnabled}
          onCheckedChange={(checked) =>
            void updateSettings({ appearance: { glowEnabled: checked } })
          }
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-2">
          <Play className="h-3.5 w-3.5 text-primary" />
          <span>Animation d’ouverture « Tenno » au lancement</span>
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={replayStartupAnimation}>
            <Play className="h-3 w-3 text-primary" />
            <span>Rejouer</span>
          </Button>
          <Switch
            checked={appearance.startupAnimationEnabled}
            onCheckedChange={(checked) =>
              void updateSettings({ appearance: { startupAnimationEnabled: checked } })
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
        <span>Zoom d’interface natif ({windowState.zoomPercent} %)</span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => void setWindowZoom(windowState.zoomPercent - 10)}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => void setWindowZoom(100)}>
            100 %
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => void setWindowZoom(windowState.zoomPercent + 10)}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

