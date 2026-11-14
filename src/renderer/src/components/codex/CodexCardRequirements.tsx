import * as React from 'react'
import { Coins, MapPin, Sparkles, Wrench } from 'lucide-react'
import type { CodexSummaryCard } from '@shared/schemas/codex.schema'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { ChanceBadgeWithUnderBar } from '@/components/codex/ChanceBadgeWithUnderBar'
import { formatResourceCount } from '@/lib/catalog-layout'
import { cn } from '@/lib/utils'
import { useCodexCardMetaStore } from '@/stores/useCodexCardMetaStore'

export function CodexCardRequirements({
  card,
  maxItems = 4,
  centered = false,
  className
}: {
  card: CodexSummaryCard
  maxItems?: number
  centered?: boolean
  className?: string
}): React.JSX.Element | null {
  if (card.category === 'mobs') {
    const drops = card.topDropsPreview ?? []
    return (
      <div className={cn('space-y-1.5 pt-0.5', centered && 'flex flex-col items-center', className)}>
        {card.mobSpawnChancePct !== null && card.mobSpawnChancePct !== undefined && (
          <div
            className={cn(
              'flex flex-wrap items-center gap-1.5 text-[10px]',
              centered && 'justify-center'
            )}
          >
            <span className="text-muted-foreground">Spawn :</span>
            <ChanceBadgeWithUnderBar
              chancePct={card.mobSpawnChancePct}
              isGuaranteed={card.mobSpawnChancePct >= 99.9}
              compact
            />
          </div>
        )}
        {drops.length > 0 && (
          <div className={cn('flex flex-col gap-1', centered && 'items-center')}>
            {drops.slice(0, centered ? 1 : 2).map((d) => (
              <div
                key={d.nameFr}
                className="flex items-center justify-between gap-2 rounded border border-border/60 bg-background/70 px-1.5 py-0.5 text-[10px]"
              >
                <span className="truncate text-foreground/90">{d.nameFr}</span>
                <ChanceBadgeWithUnderBar chancePct={d.chancePct} compact />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (card.category === 'vendors') {
    const currencies = card.vendorCurrenciesFr ?? []
    return (
      <div className={cn('space-y-1 pt-0.5', centered && 'flex flex-col items-center', className)}>
        {card.matchedOfferingPreview ? (
          <div className="flex items-center gap-1 rounded border border-violet-500/45 bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-200">
            <Sparkles className="h-3 w-3 shrink-0 text-violet-300" />
            <span className="truncate">{card.matchedOfferingPreview}</span>
          </div>
        ) : (
          card.acquisitionText && (
            <div className="truncate text-[10px] text-muted-foreground">{card.acquisitionText}</div>
          )
        )}
        {currencies.length > 0 && (
          <div className={cn('flex flex-wrap items-center gap-1', centered && 'justify-center')}>
            {currencies.map((curr) => (
              <span
                key={curr}
                className="inline-flex max-w-[170px] items-center gap-1 rounded border border-amber-500/35 bg-amber-500/10 px-1.5 py-0.5 text-[9px] text-amber-200"
              >
                <Coins className="h-2.5 w-2.5 shrink-0 text-amber-400" />
                <span className="truncate">{curr}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  const key = `${card.category}:${card.id}`
  const hydrated = useCodexCardMetaStore((s) => s.byKey[key])
  const requestMeta = useCodexCardMetaStore((s) => s.requestMeta)

  const needsHydration =
    card.craftComponents === undefined && card.acquisitionText === undefined && !hydrated

  const hostRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!needsHydration) return
    const el = hostRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      requestMeta(card.category, card.id)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          requestMeta(card.category, card.id)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [needsHydration, card.category, card.id, requestMeta])

  const components = card.craftComponents ?? hydrated?.craftComponents ?? []
  const acquisitionText = card.acquisitionText ?? hydrated?.acquisitionText ?? null

  if (components.length > 0) {
    const shown = components.slice(0, maxItems)
    const extraCount = components.length - shown.length

    return (
      <div
        ref={hostRef}
        className={cn(
          'flex flex-wrap items-center gap-1',
          centered && 'justify-center',
          className
        )}
      >
        {shown.map((comp) => (
          <span
            key={`${comp.nameFr}-${comp.count}`}
            title={`Requis pour craft : ${comp.count.toLocaleString('fr-FR')} × ${comp.nameFr}`}
            className="inline-flex max-w-[140px] items-center gap-1 rounded border border-border/70 bg-background/80 px-1.5 py-0.5 text-[10px] text-foreground/90"
          >
            <SafeAssetImage
              src={comp.imageUrl}
              alt=""
              className="h-3.5 w-3.5 shrink-0 object-contain"
              fallback={<Wrench className="h-2.5 w-2.5 shrink-0 text-primary" />}
            />
            <span className="font-mono font-semibold text-primary">
              {formatResourceCount(comp.count)}×
            </span>
            <span className="truncate">{comp.nameFr}</span>
          </span>
        ))}
        {extraCount > 0 && (
          <span className="rounded border border-border/60 bg-secondary/60 px-1 py-0.5 font-mono text-[9px] text-muted-foreground">
            +{extraCount}
          </span>
        )}
      </div>
    )
  }

  if (acquisitionText || needsHydration) {
    return (
      <div
        ref={hostRef}
        className={cn(
          'flex items-center gap-1 text-[10px] text-muted-foreground',
          centered && 'justify-center',
          className
        )}
        title={acquisitionText ? `Obtention : ${acquisitionText}` : undefined}
      >
        <MapPin className="h-2.5 w-2.5 shrink-0 text-primary/80" />
        <span className="truncate">{acquisitionText ?? 'Lecture recettes…'}</span>
      </div>
    )
  }

  return null
}

