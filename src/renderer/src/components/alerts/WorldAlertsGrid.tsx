import * as React from 'react'
import { Globe } from 'lucide-react'
import type { WorldAlertToggles } from '@shared/schemas/alerts.schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/stores/useAppStore'

const WORLD_ALERT_ITEMS: readonly { key: keyof WorldAlertToggles; label: string; category: string }[] = [
  { key: 'cetusNight', label: 'Nuit sur Cetus (Chasse Eidolon)', category: 'Cycles' },
  { key: 'cetusPreNight5m', label: 'Pré-alerte 5 min avant la Nuit Cetus', category: 'Cycles' },
  { key: 'vallisWarm', label: 'Vallée Orbis — Cycle Chaud', category: 'Cycles' },
  { key: 'cambionVome', label: 'Puy de Cambion (Deimos) — Cycle Vome', category: 'Cycles' },
  { key: 'baroArrival', label: 'Arrivée du Marchand Baro Ki’Teer', category: 'Événements' },
  { key: 'fastFissure', label: 'Fissure Rapide (Capture / Extermination)', category: 'Missions' },
  { key: 'steelPathOmniaFissure', label: 'Fissure Omnia — Route de l’Acier', category: 'Missions' },
  { key: 'rareInvasionCatalystForma', label: 'Invasion Rare (Catalyseur / Réacteur / Forma)', category: 'Invasions' },
  { key: 'weaponInvasionWraithVandal', label: 'Invasion Pièce d’Arme Wraith / Vandal', category: 'Invasions' },
  { key: 'teshinUmbraForma', label: 'Semaine Schéma Forma Umbra chez Teshin', category: 'Rotation' },
  { key: 'arbitrationSTier', label: 'Arbitrage S-Tier actif', category: 'Missions' }
]

export function WorldAlertsGrid(): React.JSX.Element {
  const worldAlerts = useAppStore((s) => s.settings.worldAlerts)
  const updateSettings = useAppStore((s) => s.updateSettings)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Globe className="h-4 w-4 text-primary" />
          <span>Alertes rapides (11 déclencheurs prédéfinis)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {WORLD_ALERT_ITEMS.map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-background/50 px-3 py-2 text-xs"
          >
            <div>
              <div className="font-medium">{item.label}</div>
              <div className="text-[10px] text-muted-foreground">{item.category}</div>
            </div>
            <Switch
              checked={worldAlerts[item.key]}
              onCheckedChange={(checked) =>
                void updateSettings({
                  worldAlerts: { ...worldAlerts, [item.key]: checked }
                })
              }
            />
          </label>
        ))}
      </CardContent>
    </Card>
  )
}

