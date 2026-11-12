import * as React from 'react'
import { BellRing, ExternalLink, Radar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { openHubSection } from '@/lib/hub-navigation'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function AlertToastBanner(): React.JSX.Element | null {
  const alert = useMarketStore((s) => s.latestAlertToast)
  const setLatestAlertToast = useMarketStore((s) => s.setLatestAlertToast)
  const triggerWhisper = useMarketStore((s) => s.triggerWhisper)
  const openTab = useTabsStore((s) => s.openTab)

  if (!alert) return null

  const dismiss = (): void => setLatestAlertToast(null)
  const hasWhisper = alert.kind === 'price-sniper' && alert.sellerName && alert.platinum !== undefined
  const hubSection = alert.kind === 'worldstate' ? alert.hubSection : undefined
  const worldSlug = alert.kind === 'worldstate' ? alert.slug : undefined

  return (
    <div className="fixed bottom-12 right-4 z-50 flex w-96 max-w-[92vw] items-start justify-between gap-3 rounded-lg border border-primary bg-card p-3.5 shadow-2xl">
      <div className="flex min-w-0 items-start gap-2.5 text-xs">
        <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 space-y-1">
          <div className="font-bold text-foreground">{alert.title}</div>
          <div className="text-[11px] text-muted-foreground">{alert.subtitle}</div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {hasWhisper && (
              <Button
                size="sm"
                onClick={() => {
                  void triggerWhisper({
                    ingameName: alert.sellerName ?? '',
                    itemNameEn: alert.itemNameEn ?? alert.title,
                    itemNameFr: alert.itemNameFr ?? alert.title,
                    platinum: alert.platinum ?? 0,
                    rank: alert.rank
                  })
                  dismiss()
                }}
              >
                Copier /w ({alert.platinum}p)
              </Button>
            )}
            {hubSection && (
              <Button
                size="sm"
                onClick={() => {
                  openHubSection(hubSection)
                  dismiss()
                }}
              >
                <Radar className="h-3.5 w-3.5" />
                <span>Voir dans le Hub</span>
              </Button>
            )}
            {worldSlug && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  openTab({ kind: 'market-item', slug: worldSlug })
                  dismiss()
                }}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Prix Plat</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Fermer l’alerte"
        className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
