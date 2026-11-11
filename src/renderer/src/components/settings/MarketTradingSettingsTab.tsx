import * as React from 'react'
import { MessageSquare } from 'lucide-react'
import type { MarketPlatform } from '@shared/schemas/settings.schema'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/stores/useAppStore'

const PLATFORMS: readonly MarketPlatform[] = ['pc', 'ps4', 'xbox', 'switch', 'mobile']

export function MarketTradingSettingsTab(): React.JSX.Element {
  const market = useAppStore((s) => s.settings.market)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const sampleWhisper =
    market.whisperLanguage === 'en'
      ? '/w TennoTrader Hi! I want to buy: "Glaive Prime Set" for 320 platinum. (warframe.market)'
      : '/w TennoTrader Bonjour ! Je voudrais acheter : "Set Glaive Prime" pour 320 platinum. (warframe.market)'

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Marché, Plateforme & Commandes d’Échange (/w)</h3>
        <p className="text-xs text-muted-foreground">
          Adapte les prix Warframe Market et le format de tes messages privés en jeu.
        </p>
      </div>

      <div className="space-y-3 rounded-md border border-border bg-background/50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span>Plateforme de jeu</span>
          <div className="flex flex-wrap gap-1">
            {PLATFORMS.map((plat) => (
              <Button
                key={plat}
                size="sm"
                variant={market.platform === plat ? 'default' : 'outline'}
                onClick={() => void updateSettings({ market: { platform: plat } })}
                className="uppercase"
              >
                {plat}
              </Button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between text-xs">
          <span>Inclure les offres Crossplay</span>
          <Switch
            checked={market.crossplay}
            onCheckedChange={(checked) => void updateSettings({ market: { crossplay: checked } })}
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span>Filtre vendeurs par défaut</span>
          <div className="flex gap-1">
            {(
              [
                { id: 'ingame', label: 'En jeu uniquement' },
                { id: 'online', label: 'En jeu + En ligne' },
                { id: 'all', label: 'Tous' }
              ] as const
            ).map((opt) => (
              <Button
                key={opt.id}
                size="sm"
                variant={market.defaultSellerStatus === opt.id ? 'default' : 'outline'}
                onClick={() => void updateSettings({ market: { defaultSellerStatus: opt.id } })}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-md border border-border bg-background/50 p-3">
        <div className="flex items-center justify-between text-xs">
          <span>Langue d’affichage du Catalogue & Codex</span>
          <div className="flex gap-1">
            {(['fr', 'en'] as const).map((lang) => (
              <Button
                key={lang}
                size="sm"
                variant={market.language === lang ? 'default' : 'outline'}
                onClick={() => void updateSettings({ market: { language: lang } })}
                className="uppercase"
              >
                {lang}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span>Langue générée pour la commande `/w`</span>
          <div className="flex gap-1">
            {(['en', 'fr'] as const).map((lang) => (
              <Button
                key={lang}
                size="sm"
                variant={market.whisperLanguage === lang ? 'default' : 'outline'}
                onClick={() => void updateSettings({ market: { whisperLanguage: lang } })}
              >
                {lang === 'en' ? 'EN (Standard WFM)' : 'FR'}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded border border-border bg-card p-2.5 text-[11px]">
          <div className="mb-1 flex items-center gap-1.5 font-semibold text-primary">
            <MessageSquare className="h-3 w-3" />
            <span>Aperçu du message copié :</span>
          </div>
          <code className="block break-all text-muted-foreground">{sampleWhisper}</code>
        </div>
      </div>
    </div>
  )
}

