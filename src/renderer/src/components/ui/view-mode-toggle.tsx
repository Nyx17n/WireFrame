import * as React from 'react'
import { Grid3x3, LayoutGrid, List } from 'lucide-react'
import type { CatalogCardSize, CatalogLayoutMode } from '@shared/schemas/settings.schema'
import { useCatalogDisplayPreferences } from '@/lib/catalog-layout'
import { cn } from '@/lib/utils'

const LAYOUT_OPTIONS: ReadonlyArray<{
  id: CatalogLayoutMode
  label: string
  title: string
  Icon: React.ComponentType<{ className?: string }>
}> = [
  {
    id: 'square',
    label: 'Carrée',
    title: 'Grille carrée',
    Icon: Grid3x3
  },
  {
    id: 'rect',
    label: 'Rectangulaire',
    title: 'Grille rectangulaire',
    Icon: LayoutGrid
  },
  {
    id: 'list',
    label: 'Liste',
    title: 'Liste pleine largeur',
    Icon: List
  }
]

const SIZE_OPTIONS: ReadonlyArray<{
  id: CatalogCardSize
  label: string
  title: string
}> = [
  { id: 'sm', label: 'S', title: 'Petite taille de cases & images' },
  { id: 'md', label: 'M', title: 'Taille normale de cases & images' },
  { id: 'lg', label: 'L', title: 'Grande taille de cases & images' }
]

export function ViewModeToggle({
  value,
  onChange,
  size,
  onSizeChange
}: {
  value?: CatalogLayoutMode
  onChange?: (mode: CatalogLayoutMode) => void
  size?: CatalogCardSize
  onSizeChange?: (size: CatalogCardSize) => void
}): React.JSX.Element {
  const prefs = useCatalogDisplayPreferences()
  const activeMode = value ?? prefs.layoutMode
  const activeSize = size ?? prefs.cardSize
  const handleModeChange = onChange ?? prefs.setLayoutMode
  const handleSizeChange = onSizeChange ?? prefs.setCardSize

  return (
    <div className="inline-flex flex-wrap items-center gap-1.5">
      <div
        role="group"
        aria-label="Forme des cases"
        className="inline-flex items-center rounded-md border border-border bg-background/70 p-0.5"
      >
        {LAYOUT_OPTIONS.map(({ id, label, title, Icon }) => {
          const active = activeMode === id
          return (
            <button
              key={id}
              type="button"
              title={title}
              onClick={() => handleModeChange(id)}
              className={cn(
                'inline-flex h-7 items-center gap-1.5 rounded px-2 text-[11px] font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden md:inline">{label}</span>
            </button>
          )
        })}
      </div>

      <div
        role="group"
        aria-label="Taille des cases"
        className="inline-flex items-center rounded-md border border-border bg-background/70 p-0.5"
      >
        {SIZE_OPTIONS.map((opt) => {
          const active = activeSize === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              title={opt.title}
              onClick={() => handleSizeChange(opt.id)}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded font-mono text-[11px] font-semibold transition-colors',
                active
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
