import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useItemPriceRangeStore } from '@/stores/useItemPriceRangeStore'

export function ItemPriceRangeBadges({
  slug,
  compact = false,
  className
}: {
  slug: string | null | undefined
  compact?: boolean
  className?: string
}): React.JSX.Element | null {
  const cleanSlug = slug?.trim().toLowerCase() ?? ''
  const summary = useItemPriceRangeStore((s) => (cleanSlug ? s.summaries[cleanSlug] : undefined))
  const isLoading = useItemPriceRangeStore((s) =>
    cleanSlug ? Boolean(s.loadingSlugs[cleanSlug]) : false
  )
  const requestPriceSummary = useItemPriceRangeStore((s) => s.requestPriceSummary)

  const hostRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!cleanSlug || summary) return
    const el = hostRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      requestPriceSummary(cleanSlug)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          requestPriceSummary(cleanSlug)
          observer.disconnect()
        }
      },
      { rootMargin: '160px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [cleanSlug, summary, requestPriceSummary])

  if (!cleanSlug) return null

  const fmt = (val: number | null | undefined): string =>
    val !== null && val !== undefined ? `${val}p` : '—'

  return (
    <div
      ref={hostRef}
      className={cn(
        'inline-flex flex-wrap items-center gap-1 font-mono',
        compact ? 'text-[9px]' : 'text-[10px]',
        className
      )}
      title="Prix des offres de vente actives sur Warframe Market (Min · Moyen · Max)"
    >
      <span className="rounded border border-emerald-500/35 bg-emerald-500/10 px-1.5 py-0 font-semibold text-emerald-400">
        Min {summary ? fmt(summary.minPlat) : '…'}
      </span>
      <span className="rounded border border-primary/35 bg-primary/10 px-1.5 py-0 font-semibold text-primary">
        Moy {summary ? fmt(summary.avgPlat) : '…'}
      </span>
      <span className="rounded border border-amber-500/35 bg-amber-500/10 px-1.5 py-0 font-semibold text-amber-400">
        Max {summary ? fmt(summary.maxPlat) : '…'}
      </span>
      {isLoading && <Loader2 className="h-2.5 w-2.5 animate-spin text-muted-foreground" />}
    </div>
  )
}

