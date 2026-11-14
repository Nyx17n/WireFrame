import * as React from 'react'
import { AlertTriangle, Check, Coins, RefreshCw } from 'lucide-react'
import { toWfAssetUrl, type MarketCatalogItem } from '@shared/schemas/market.schema'
import { formatWfmSubtypeLabel } from '@shared/schemas/wfm-account.schema'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { Switch } from '@/components/ui/switch'
import { WfmItemAutocompletePicker } from '@/components/wfm-account/WfmItemAutocompletePicker'
import { WfmPriceHelperPanel } from '@/components/wfm-account/WfmPriceHelperPanel'
import { cn } from '@/lib/utils'
import { ipcClient } from '@/services/ipc-client'
import { useWfmAccountStore } from '@/stores/useWfmAccountStore'

export function CreateWfmOrderModal(): React.JSX.Element | null {
  const session = useWfmAccountStore((s) => s.session)
  const modalState = useWfmAccountStore((s) => s.createOrderModal)
  const overview = useWfmAccountStore((s) => s.overview)
  const closeCreateOrderModal = useWfmAccountStore((s) => s.closeCreateOrderModal)
  const createOrder = useWfmAccountStore((s) => s.createOrder)
  const updateOrder = useWfmAccountStore((s) => s.updateOrder)

  const [catalog, setCatalog] = React.useState<MarketCatalogItem[]>([])
  const [selectedItem, setSelectedItem] = React.useState<MarketCatalogItem | null>(null)
  const [orderType, setOrderType] = React.useState<'sell' | 'buy'>('sell')
  const [platinum, setPlatinum] = React.useState<string>('20')
  const [quantity, setQuantity] = React.useState<string>('1')
  const [rank, setRank] = React.useState<number>(0)
  const [subtype, setSubtype] = React.useState<string>('')
  const [amberStars, setAmberStars] = React.useState<number>(0)
  const [cyanStars, setCyanStars] = React.useState<number>(0)
  const [visible, setVisible] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const applyItemDefaults = React.useCallback((item: MarketCatalogItem) => {
    setRank(item.maxRank ?? 0)
    setSubtype(item.subtypes?.[item.subtypes.length - 1] ?? '')
    setAmberStars(item.maxAmberStars ?? 0)
    setCyanStars(item.maxCyanStars ?? 0)
  }, [])

  React.useEffect(() => {
    if (!modalState.open || !session.connected) return
    setOrderType(modalState.defaultType)
    setErrorMsg(null)
    void ipcClient.market.getCatalog(false).then((items) => {
      setCatalog(items)
      const hit = modalState.prefillSlug
        ? (items.find((i) => i.slug === modalState.prefillSlug) ?? null)
        : null
      setSelectedItem(hit)
      if (hit) applyItemDefaults(hit)
    })
  }, [modalState.open, modalState.prefillSlug, modalState.defaultType, session.connected, applyItemDefaults])

  // Hard security rule: never render or allow selling if disconnected
  if (!session.connected || !session.user) return null

  const duplicateOrder = selectedItem && overview
    ? (orderType === 'sell' ? overview.sellOrders : overview.buyOrders).find(
        (o) =>
          o.itemId === selectedItem.id &&
          (selectedItem.maxRank === undefined || o.rank === rank) &&
          (!selectedItem.subtypes?.length || o.subtype === subtype)
      ) ?? null
    : null

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!selectedItem || !session.connected) return
    const platNum = Math.max(1, Math.round(Number(platinum) || 0))
    const qtyNum = Math.max(1, Math.round(Number(quantity) || 1))
    setErrorMsg(null)
    setSubmitting(true)
    try {
      if (duplicateOrder) {
        await updateOrder({
          orderId: duplicateOrder.id,
          platinum: platNum,
          quantity: duplicateOrder.quantity + qtyNum,
          visible
        })
      } else {
        await createOrder({
          itemId: selectedItem.id,
          itemSlug: selectedItem.slug,
          type: orderType,
          platinum: platNum,
          quantity: qtyNum,
          visible,
          ...(selectedItem.maxRank !== undefined ? { rank } : {}),
          ...(selectedItem.subtypes?.length && subtype ? { subtype } : {}),
          ...(selectedItem.maxAmberStars !== undefined ? { amberStars } : {}),
          ...(selectedItem.maxCyanStars !== undefined ? { cyanStars } : {})
        })
      }
      closeCreateOrderModal()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de la publication sur WFM.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={modalState.open} onOpenChange={(next) => !next && closeCreateOrderModal()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Coins className="h-4 w-4 text-primary" />
            <span>
              {orderType === 'sell'
                ? 'Mettre un item en vente sur Warframe Market'
                : 'Publier un ordre d’achat sur Warframe Market'}
            </span>
          </DialogTitle>
          <DialogDescription>
            Connecté en tant que <strong className="text-foreground">{session.user.ingameName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          {!selectedItem ? (
            <WfmItemAutocompletePicker
              catalog={catalog}
              onSelect={(item) => {
                setSelectedItem(item)
                applyItemDefaults(item)
              }}
            />
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <SafeAssetImage
                    src={toWfAssetUrl(selectedItem.thumb)}
                    alt={selectedItem.nameFr}
                    className="h-9 w-9 shrink-0 rounded border border-border bg-background object-contain p-1"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold">{selectedItem.nameFr}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{selectedItem.nameEn}</div>
                  </div>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={() => setSelectedItem(null)}>
                  Changer
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Type</label>
                  <div className="grid grid-cols-2 gap-1 rounded-md border border-border bg-background p-0.5">
                    {(['sell', 'buy'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setOrderType(t)}
                        className={cn(
                          'rounded py-1 text-[11px] font-semibold',
                          orderType === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {t === 'sell' ? 'Vendre' : 'Acheter'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Prix (Plat)</label>
                  <Input type="number" min={1} max={999999} required value={platinum} onChange={(e) => setPlatinum(e.target.value)} className="font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Quantité</label>
                  <Input type="number" min={1} max={999} required value={quantity} onChange={(e) => setQuantity(e.target.value)} className="font-mono" />
                </div>
                {selectedItem.maxRank !== undefined && selectedItem.maxRank > 0 && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Rang (0..{selectedItem.maxRank})</label>
                    <Input type="number" min={0} max={selectedItem.maxRank} value={rank} onChange={(e) => setRank(Math.min(selectedItem.maxRank ?? 0, Math.max(0, Number(e.target.value) || 0)))} className="font-mono" />
                  </div>
                )}
              </div>

              {selectedItem.subtypes && selectedItem.subtypes.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Raffinement / Variante :</span>
                  {selectedItem.subtypes.map((st) => (
                    <button key={st} type="button" onClick={() => setSubtype(st)} className={cn('rounded border px-2 py-1 text-xs font-medium', subtype === st ? 'border-primary bg-primary/15 text-foreground' : 'border-border bg-card text-muted-foreground')}>
                      {formatWfmSubtypeLabel(st)}
                    </button>
                  ))}
                </div>
              )}

              <WfmPriceHelperPanel
                slug={selectedItem.slug}
                orderType={orderType}
                {...(selectedItem.maxRank !== undefined ? { rank } : {})}
                {...(selectedItem.subtypes?.length && subtype ? { subtype } : {})}
                onSelectPrice={(p) => setPlatinum(String(p))}
              />

              {duplicateOrder && (
                <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                  Annonce déjà active (×{duplicateOrder.quantity} à {duplicateOrder.platinum}p) : valider ajoutera +{quantity} au stock et appliquera {platinum}p.
                </div>
              )}

              <div className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2">
                <span className="text-xs">Visible immédiatement sur warframe.market</span>
                <Switch checked={visible} onCheckedChange={setVisible} />
              </div>
            </>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={closeCreateOrderModal} disabled={submitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={!selectedItem || submitting || !session.connected}>
              {submitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span>{duplicateOrder ? 'Mettre à jour' : orderType === 'sell' ? `Mettre en vente (${platinum || '0'}p)` : `Publier l’achat (${platinum || '0'}p)`}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
