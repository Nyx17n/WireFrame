import * as React from 'react'
import { Calculator, ExternalLink } from 'lucide-react'
import { toWfAssetUrl, type SetVsPartsAnalysis } from '@shared/schemas/market.schema'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  MarketItemContextMenu,
  type MarketContextMenuState
} from '@/components/market/MarketItemContextMenu'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function SetVsPartsBanner({ analysis }: { analysis: SetVsPartsAnalysis }): React.JSX.Element | null {
  const [ctxMenu, setCtxMenu] = React.useState<MarketContextMenuState | null>(null)
  const lang = useAppStore((s) => s.settings.market.language)
  const openTab = useTabsStore((s) => s.openTab)

  if (!analysis.hasSetComparison) return null

  const delta = analysis.deltaPlatinum
  const setLabel = lang === 'fr' ? analysis.setNameFr : analysis.setNameEn

  let verdictText = 'Certaines pièces n’ont aucun vendeur en ligne actuellement.'
  let verdictVariant: 'default' | 'success' | 'secondary' = 'secondary'

  if (delta !== null) {
    if (delta > 0) {
      verdictText = `Économise ${delta} p en achetant les pièces séparément (ou +${delta} p de marge à la revente du Set)`
      verdictVariant = 'success'
    } else if (delta < 0) {
      verdictText = `Le Set complet est ${Math.abs(delta)} p moins cher que l’achat des pièces à l’unité`
      verdictVariant = 'default'
    } else {
      verdictText = 'Prix identique entre le Set complet et la somme des pièces'
    }
  }

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
        <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
          <Calculator className="h-4 w-4 text-primary" />
          <span>Comparateur Set Complet vs Pièces Détachées — {setLabel}</span>
        </CardTitle>
        <Badge variant={verdictVariant}>{verdictText}</Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="rounded-md border border-border bg-card px-3 py-1.5">
            <span className="text-muted-foreground">Set Complet : </span>
            <span className="font-bold text-foreground">
              {analysis.bestSetPrice !== null ? `${analysis.bestSetPrice} p` : 'Indisponible'}
            </span>
          </div>
          <div className="rounded-md border border-border bg-card px-3 py-1.5">
            <span className="text-muted-foreground">Somme des Pièces : </span>
            <span className="font-bold text-primary">
              {analysis.totalPartsCost !== null ? `${analysis.totalPartsCost} p` : 'Incomplet'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {analysis.parts.map((part) => {
            const pName = lang === 'fr' ? part.nameFr : part.nameEn
            const thumb = toWfAssetUrl(part.thumb)
            return (
              <div
                key={part.id}
                onClick={() => openTab({ kind: 'market-item', slug: part.slug }, { title: pName })}
                onContextMenu={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCtxMenu({
                    position: { x: e.clientX, y: e.clientY },
                    item: {
                      slug: part.slug,
                      nameFr: part.nameFr,
                      nameEn: part.nameEn,
                      thumb: part.thumb
                    }
                  })
                }}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-card/90 p-2 text-xs transition-colors hover:border-primary/60"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {thumb && <img src={thumb} alt="" className="h-7 w-7 shrink-0 object-contain" />}
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {part.quantityInSet > 1 ? `${part.quantityInSet}× ` : ''}
                      {pName}
                    </div>
                    <div className="truncate text-[10px] text-muted-foreground">
                      {part.bestSellerName ? `par ${part.bestSellerName}` : 'Aucun vendeur'}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 font-semibold text-primary">
                  <span>{part.subtotalPrice !== null ? `${part.subtotalPrice}p` : '—'}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
      <MarketItemContextMenu state={ctxMenu} onClose={() => setCtxMenu(null)} />
    </Card>
  )
}

