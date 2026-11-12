import * as React from 'react'
import { Grid3x3, LayoutGrid, List } from 'lucide-react'
import type { CatalogLayoutMode } from '@shared/schemas/settings.schema'
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
    title: 'Grille carrée compacte',
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

export function ViewModeToggle({
  value,
  onChange
}: {
  value: CatalogLayoutMode
  onChange: (mode: CatalogLayoutMode) => void
}): React.JSX.Element {
  return (
    <div
      role="group"
      aria-label="Mode d’affichage de la liste"
      className="inline-flex items-center rounded-md border border-border bg-background/70 p-0.5"
    >
      {LAYOUT_OPTIONS.map(({ id, label, title, Icon }) => {
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            title={title}
            onClick={() => onChange(id)}
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
  )
}
