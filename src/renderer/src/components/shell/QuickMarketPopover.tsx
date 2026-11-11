import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import type { AppLanguage, MarketPlatform } from '@shared/schemas/settings.schema'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/stores/useAppStore'

const PLATFORMS: readonly MarketPlatform[] = ['pc', 'ps4', 'xbox', 'switch', 'mobile']
const LANGUAGES: readonly AppLanguage[] = ['fr', 'en']

export function QuickMarketPopover(): React.JSX.Element {
  const market = useAppStore((s) => s.settings.market)
  const zoomPercent = useAppStore((s) => s.windowState.zoomPercent)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const setWindowZoom = useAppStore((s) => s.setWindowZoom)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" title="Plateforme, Crossplay & Langue">
          <Badge variant="secondary" className="cursor-pointer uppercase hover:border-primary/50">
            <span>{market.platform}</span>
            {market.crossplay && <span>· Cross</span>}
            <span>· {market.language}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Badge>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-64 space-y-3 p-3">
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground">
            Plateforme Warframe Market
          </span>
          <div className="grid grid-cols-3 gap-1">
            {PLATFORMS.map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() => void updateSettings({ market: { platform: plat } })}
                className={`rounded border px-2 py-1 text-[11px] font-semibold uppercase ${
                  market.platform === plat
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between text-xs">
          <span>Crossplay actif</span>
          <Switch
            checked={market.crossplay}
            onCheckedChange={(checked) => void updateSettings({ market: { crossplay: checked } })}
          />
        </label>

        <div className="flex items-center justify-between text-xs">
          <span>Langue Catalogue</span>
          <div className="flex gap-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => void updateSettings({ market: { language: lang } })}
                className={`rounded border px-2 py-0.5 text-[11px] font-semibold uppercase ${
                  market.language === lang
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs">
          <span>Zoom affichage</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => void setWindowZoom(zoomPercent - 10)}
              className="rounded border border-border px-2 py-0.5 font-mono text-[11px] hover:border-primary"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => void setWindowZoom(100)}
              className="min-w-[42px] rounded border border-border px-1.5 py-0.5 font-mono text-[11px] font-semibold hover:border-primary"
            >
              {zoomPercent}%
            </button>
            <button
              type="button"
              onClick={() => void setWindowZoom(zoomPercent + 10)}
              className="rounded border border-border px-2 py-0.5 font-mono text-[11px] hover:border-primary"
            >
              +
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

