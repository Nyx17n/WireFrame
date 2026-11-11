import * as React from 'react'
import { Award, Layers, Sparkles } from 'lucide-react'
import type { BundledSellerMatch } from '@shared/schemas/tools.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusDot } from '@/components/market/StatusDot'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function BundledSellersSection({
  bundles
}: {
  bundles: BundledSellerMatch[]
}): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const triggerRawWhisperText = useMarketStore((s) => s.triggerRawWhisperText)
  const openTab = useTabsStore((s) => s.openTab)

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Layers className="h-4 w-4 text-primary" />
          <span>Trade Bundler — Vendeurs Multi-Items Détectés ({bundles.length})</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {bundles.length === 0 ? (
          <p className="py-3 text-xs text-muted-foreground">
            Ajoute au moins 2 articles au panier : l’algorithme repérera automatiquement les vendeurs possédant plusieurs pièces en même temps pour économiser tes échanges quotidiens et allers-retours Dojo.
          </p>
        ) : (
          bundles.map((b) => (
            <div
              key={b.sellerSlug}
              className="space-y-2 rounded-md border border-border bg-card p-3 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openTab(
                        { kind: 'market-user', slug: b.sellerSlug },
                        { title: `Profil : ${b.sellerName}` }
                      )
                    }
                    className="font-bold hover:text-primary hover:underline"
                  >
                    {b.sellerName}
                  </button>
                  <StatusDot status={b.status} />
                  <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
                    <Award className="h-3 w-3" />
                    {b.reputation}
                  </span>
                  <Badge variant="success">
                    <Sparkles className="h-3 w-3" />
                    <span>-{b.dojoTripsSaved} aller-retour Dojo</span>
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-primary">
                      {b.bundleTotalPlat} p
                    </span>
                    <span className="ml-1.5 text-[11px] text-muted-foreground">
                      ({b.extraPlatDelta === 0 ? 'au prix optimal !' : `+${b.extraPlatDelta}p vs séparé`})
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      void triggerRawWhisperText(
                        b.sellerName,
                        b.groupedWhisperEn,
                        b.groupedWhisperFr
                      )
                    }
                  >
                    /w Groupé ({b.matchedItems.length})
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {b.matchedItems.map((m) => (
                  <Badge key={m.slug} variant="secondary">
                    {m.quantity > 1 ? `${m.quantity}× ` : ''}
                    {lang === 'fr' ? m.nameFr : m.nameEn} · {m.unitPrice}p
                  </Badge>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

