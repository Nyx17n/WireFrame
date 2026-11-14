import * as React from 'react'
import { Check, Minus, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { toWfAssetUrl } from '@shared/schemas/market.schema'
import { formatWfmSubtypeLabel, type WfmOwnOrder } from '@shared/schemas/wfm-account.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { notify } from '@/stores/useNotificationStore'
import { useTabsStore } from '@/stores/useTabsStore'
import { useWfmAccountStore } from '@/stores/useWfmAccountStore'

interface WfmOwnOrderRowProps {
  order: WfmOwnOrder
  isCompact: boolean
}

export function WfmOwnOrderRow({ order, isCompact }: WfmOwnOrderRowProps): React.JSX.Element {
  const updateOrder = useWfmAccountStore((s) => s.updateOrder)
  const closeOrderUnit = useWfmAccountStore((s) => s.closeOrderUnit)
  const deleteOrder = useWfmAccountStore((s) => s.deleteOrder)
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)

  const [platDraft, setPlatDraft] = React.useState(String(order.platinum))
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    setPlatDraft(String(order.platinum))
  }, [order.platinum])

  const runMutation = async (fn: () => Promise<unknown>): Promise<void> => {
    setBusy(true)
    try {
      await fn()
    } catch (err) {
      notify({
        kind: 'error',
        title: 'Erreur Warframe Market',
        message: err instanceof Error ? err.message : 'Impossible de mettre à jour l’annonce.',
        forceShow: true
      })
    } finally {
      setBusy(false)
    }
  }

  const commitPrice = (nextPlat: number): void => {
    const safePlat = Math.max(1, Math.round(nextPlat))
    setPlatDraft(String(safePlat))
    if (safePlat === order.platinum) return
    void runMutation(() => updateOrder({ orderId: order.id, platinum: safePlat }))
  }

  const adjustQuantity = (delta: number): void => {
    const nextQty = Math.max(1, order.quantity + delta)
    if (nextQty === order.quantity) return
    void runMutation(() => updateOrder({ orderId: order.id, quantity: nextQty }))
  }

  const thumbUrl = toWfAssetUrl(order.itemThumb)

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2.5 rounded-md border p-2.5 transition-colors',
        order.visible
          ? 'border-border bg-card/85 hover:border-primary/40'
          : 'border-dashed border-border/70 bg-background/40 opacity-80'
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <SafeAssetImage
          src={thumbUrl}
          alt={order.itemNameFr}
          className="h-10 w-10 shrink-0 rounded border border-border bg-background/80 object-contain p-1"
        />
        <div className="min-w-0">
          <button
            type="button"
            onClick={(e) => {
              const r = { kind: 'market-item' as const, slug: order.itemSlug }
              if (e.ctrlKey || e.metaKey) openTab(r, { title: order.itemNameFr })
              else navigateActive(r, order.itemNameFr)
            }}
            className="block max-w-full truncate text-left text-xs font-semibold text-foreground hover:text-primary hover:underline"
          >
            {order.itemNameFr}
          </button>
          {!isCompact && order.itemNameEn !== order.itemNameFr && (
            <div className="truncate text-[11px] text-muted-foreground">{order.itemNameEn}</div>
          )}
          <div className="mt-0.5 flex flex-wrap items-center gap-1">
            {order.rank !== undefined && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                Rang {order.rank}
                {order.itemMaxRank ? `/${order.itemMaxRank}` : ''}
              </Badge>
            )}
            {order.subtype && (
              <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                {formatWfmSubtypeLabel(order.subtype)}
              </Badge>
            )}
            {(order.amberStars !== undefined || order.cyanStars !== undefined) && (
              <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                {order.amberStars ?? 0}★A · {order.cyanStars ?? 0}★C
              </Badge>
            )}
            {!order.visible && (
              <Badge variant="outline" className="px-1.5 py-0 text-[10px] text-muted-foreground">
                Masquée
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Platinum inline stepper */}
        <div className="inline-flex h-7 items-center rounded-md border border-input bg-background/80">
          <button
            type="button"
            disabled={busy || order.platinum <= 1}
            onClick={() => commitPrice(order.platinum - 1)}
            className="flex h-full w-6 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40"
            title="-1 Platinum"
          >
            <Minus className="h-3 w-3" />
          </button>
          <input
            type="number"
            min={1}
            disabled={busy}
            value={platDraft}
            onChange={(e) => setPlatDraft(e.target.value)}
            onBlur={() => commitPrice(Number(platDraft) || order.platinum)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitPrice(Number(platDraft) || order.platinum)
            }}
            aria-label="Prix en Platinum"
            className="h-full w-14 border-x border-border/60 bg-transparent text-center font-mono text-xs font-bold text-primary focus:outline-none"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => commitPrice(order.platinum + 1)}
            className="flex h-full w-6 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40"
            title="+1 Platinum"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Quantity inline stepper */}
        <div className="inline-flex h-7 items-center rounded-md border border-input bg-background/80 text-xs">
          <button
            type="button"
            disabled={busy || order.quantity <= 1}
            onClick={() => adjustQuantity(-1)}
            className="flex h-full w-6 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40"
            title="-1 Quantité"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-[32px] px-1 text-center font-mono text-[11px] font-semibold">
            ×{order.quantity}
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={() => adjustQuantity(1)}
            className="flex h-full w-6 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40"
            title="+1 Quantité"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center gap-1.5" title={order.visible ? 'Visible sur WFM' : 'Annonce masquée'}>
          <Switch
            checked={order.visible}
            disabled={busy}
            onCheckedChange={(checked) =>
              void runMutation(() => updateOrder({ orderId: order.id, visible: checked }))
            }
          />
        </div>

        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={() =>
            void runMutation(() =>
              closeOrderUnit({ orderId: order.id, quantity: 1 }, order.itemNameFr, order.platinum)
            )
          }
          className="h-7 gap-1 border border-emerald-500/40 bg-emerald-500/15 px-2.5 text-[11px] text-emerald-300 hover:bg-emerald-500/25"
          title="Clôturer 1 unité vendue/achetée au Dojo"
        >
          {busy ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          <span>{order.type === 'sell' ? 'Vendu -1' : 'Acheté -1'}</span>
        </Button>

        <Button
          size="icon"
          variant="ghost"
          disabled={busy}
          onClick={() => void runMutation(() => deleteOrder(order.id, order.itemNameFr))}
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          title="Supprimer définitivement cette annonce"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

