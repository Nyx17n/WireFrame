import * as React from 'react'
import {
  ArrowLeftRight,
  CircleDot,
  Gem,
  Package,
  Search,
  Tag,
  User,
  X
} from 'lucide-react'
import {
  buildSmartMarketChip,
  createMarketChipId,
  doesCatalogItemMatchChips,
  normalizeMarketToken,
  type MarketFilterChip,
  type MarketFilterChipKind
} from '@shared/schemas/market-search.schema'
import type { MarketCatalogItem } from '@shared/schemas/market.schema'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface KnownSellerHint {
  readonly ingameName: string
  readonly slug: string
}

interface MarketTokenFilterBarProps {
  readonly chips: readonly MarketFilterChip[]
  readonly catalog: readonly MarketCatalogItem[]
  readonly knownSellers?: readonly KnownSellerHint[]
  readonly placeholder?: string
  readonly submitLabel?: string
  readonly isCompact?: boolean
  readonly onAddChip: (chip: MarketFilterChip) => void
  readonly onRemoveChip: (chipId: string) => void
  readonly onClearAll?: () => void
}

const CHIP_STYLE: Record<MarketFilterChipKind, string> = {
  item: 'border-primary/50 bg-primary/15 text-foreground',
  seller: 'border-violet-500/50 bg-violet-500/15 text-violet-200',
  category: 'border-cyan-500/50 bg-cyan-500/15 text-cyan-200',
  maxPrice: 'border-amber-500/50 bg-amber-500/15 text-amber-200',
  status: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200',
  orderType: 'border-primary/40 bg-secondary text-foreground'
}

function ChipIcon({ kind }: { kind: MarketFilterChipKind }): React.JSX.Element {
  switch (kind) {
    case 'seller':
      return <User className="h-3 w-3 shrink-0 text-violet-400" />
    case 'category':
      return <Tag className="h-3 w-3 shrink-0 text-cyan-400" />
    case 'maxPrice':
      return <Gem className="h-3 w-3 shrink-0 text-amber-400" />
    case 'status':
      return <CircleDot className="h-3 w-3 shrink-0 text-emerald-400" />
    case 'orderType':
      return <ArrowLeftRight className="h-3 w-3 shrink-0 text-primary" />
    case 'item':
      return <Package className="h-3 w-3 shrink-0 text-primary" />
  }
}

export function MarketTokenFilterBar({
  chips,
  catalog,
  knownSellers = [],
  placeholder = 'Taper un item (ex: volt), puis un vendeur (@pseudo) ou un prix max (<=30p)…',
  submitLabel = 'Rechercher',
  isCompact = false,
  onAddChip,
  onRemoveChip,
  onClearAll
}: MarketTokenFilterBarProps): React.JSX.Element {
  const [draft, setDraft] = React.useState('')
  const [focused, setFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const trimmed = draft.trim()
  const cleanCandidate = trimmed.replace(/^(@|vendeur:|seller:|user:)/i, '').trim()

  const matchingCatalogCount = React.useMemo(() => {
    if (!trimmed) return 0
    const probeChip: MarketFilterChip = { id: 'probe', kind: 'item', value: trimmed, label: trimmed }
    const combined = [...chips.filter((c) => c.kind === 'item' || c.kind === 'category'), probeChip]
    return catalog.filter((item) => doesCatalogItemMatchChips(item, combined)).length
  }, [catalog, chips, trimmed])

  const matchingSellers = React.useMemo(() => {
    if (!cleanCandidate) return []
    const q = normalizeMarketToken(cleanCandidate)
    const seen = new Set<string>()
    const out: KnownSellerHint[] = []
    for (const s of knownSellers) {
      const key = s.slug.toLowerCase()
      if (seen.has(key)) continue
      if (normalizeMarketToken(s.ingameName).includes(q) || key.includes(q)) {
        seen.add(key)
        out.push(s)
        if (out.length >= 3) break
      }
    }
    return out
  }, [knownSellers, cleanCandidate])

  const commitChip = (chip: MarketFilterChip | null): void => {
    if (!chip) return
    onAddChip(chip)
    setDraft('')
    inputRef.current?.focus()
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!trimmed) return
    commitChip(buildSmartMarketChip(trimmed, matchingCatalogCount))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace' && draft.length === 0 && chips.length > 0) {
      const last = chips[chips.length - 1]
      if (last) onRemoveChip(last.id)
    } else if (e.key === 'Escape') {
      setFocused(false)
    }
  }

  const defaultIsSeller =
    /^(@|vendeur:|seller:|user:)/i.test(trimmed) ||
    (matchingCatalogCount === 0 && /^[a-zA-Z0-9_.-]{3,32}$/.test(trimmed))

  const numericOnly = /^\d{1,5}$/.exec(trimmed)

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        onClick={() => inputRef.current?.focus()}
        className="flex flex-wrap items-center gap-1.5 rounded-lg border border-primary/40 bg-background/85 px-2.5 py-1.5 shadow-xs transition-colors focus-within:border-primary"
      >
        <Search className="h-4 w-4 shrink-0 text-primary" />

        {chips.map((chip) => (
          <span
            key={chip.id}
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
              isCompact && 'px-1.5 py-0 text-[11px]',
              CHIP_STYLE[chip.kind]
            )}
          >
            <ChipIcon kind={chip.kind} />
            <span className="max-w-[160px] truncate">
              {chip.kind === 'seller' ? `Vendeur : ${chip.label}` : chip.label}
            </span>
            <button
              type="button"
              onClick={(ev) => {
                ev.stopPropagation()
                onRemoveChip(chip.id)
              }}
              title={`Retirer le filtre ${chip.label}`}
              className="ml-0.5 rounded p-0.5 opacity-75 hover:bg-background/40 hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={draft}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 160)}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            chips.length > 0
              ? 'Ajouter un vendeur (@pseudo), un mot-clé ou <=prix…'
              : placeholder
          }
          className="min-w-[160px] flex-1 bg-transparent py-1 text-xs text-foreground outline-none placeholder:text-muted-foreground"
        />

        <div className="ml-auto flex items-center gap-1">
          {chips.length > 0 && onClearAll && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={(ev) => {
                ev.stopPropagation()
                setDraft('')
                onClearAll()
              }}
              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            >
              Effacer
            </Button>
          )}
          <Button type="submit" size="sm" className="h-7 px-3 text-xs">
            {chips.length > 0 ? '+ Ajouter' : submitLabel}
          </Button>
        </div>
      </form>

      {focused && trimmed.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 space-y-1 rounded-lg border border-border bg-popover p-1.5 text-xs shadow-lg">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              commitChip(
                buildSmartMarketChip(
                  trimmed,
                  matchingCatalogCount,
                  defaultIsSeller ? 'seller' : 'item'
                )
              )
            }
            className="flex w-full items-center justify-between rounded-md bg-primary/15 px-2.5 py-1.5 text-left font-medium text-foreground hover:bg-primary/25"
          >
            <span className="flex items-center gap-2">
              {defaultIsSeller ? (
                <User className="h-3.5 w-3.5 text-violet-400" />
              ) : (
                <Package className="h-3.5 w-3.5 text-primary" />
              )}
              <span>
                {defaultIsSeller
                  ? `Filtrer par Vendeur Warframe Market : « ${cleanCandidate} »`
                  : `Filtrer par Item / Mot-clé : « ${trimmed} »`}
              </span>
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {defaultIsSeller ? 'Entrée ↵' : `${matchingCatalogCount} item(s) · Entrée ↵`}
            </span>
          </button>

          {cleanCandidate.length >= 2 && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                commitChip(
                  buildSmartMarketChip(
                    trimmed,
                    matchingCatalogCount,
                    defaultIsSeller ? 'item' : 'seller'
                  )
                )
              }
              className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                {defaultIsSeller ? (
                  <Package className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <User className="h-3.5 w-3.5 text-violet-400" />
                )}
                <span>
                  {defaultIsSeller
                    ? `Ajouter comme mot-clé d’objet : « ${trimmed} » (${matchingCatalogCount} items)`
                    : `Filtrer par Vendeur Warframe Market : « ${cleanCandidate} »`}
                </span>
              </span>
              <span className="text-[10px]">Cliquer</span>
            </button>
          )}

          {numericOnly && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                commitChip({
                  id: createMarketChipId('maxPrice', trimmed),
                  kind: 'maxPrice',
                  value: trimmed,
                  label: `≤ ${trimmed} Plat`
                })
              }
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-amber-300 hover:bg-secondary"
            >
              <Gem className="h-3.5 w-3.5 text-amber-400" />
              <span>Plafond de prix unitaire : ≤ {trimmed} Platinum</span>
            </button>
          )}

          {matchingSellers.map((s) => (
            <button
              key={s.slug}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                commitChip({
                  id: createMarketChipId('seller', s.slug),
                  kind: 'seller',
                  value: s.slug,
                  label: s.ingameName
                })
              }
              className="flex w-full items-center justify-between rounded-md px-2.5 py-1 text-left text-violet-300 hover:bg-secondary"
            >
              <span className="flex items-center gap-2">
                <User className="h-3 w-3 text-violet-400" />
                <span>Vendeur actif récent : {s.ingameName}</span>
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">@{s.slug}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
