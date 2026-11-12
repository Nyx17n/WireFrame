import * as React from 'react'
import { Check } from 'lucide-react'
import type { ColorSwatchGroup } from '@/lib/color-swatches'
import { cn } from '@/lib/utils'

interface ColorSwatchPickerProps {
  title: string
  value: string
  groups: readonly ColorSwatchGroup[]
  onChange: (hex: string) => void
}

/** Pastilles de couleurs prédéfinies + sélecteur libre natif pour une couleur précise. */
export function ColorSwatchPicker({ title, value, groups, onChange }: ColorSwatchPickerProps): React.JSX.Element {
  const current = value.toLowerCase()

  return (
    <div className="space-y-2 rounded-md border border-border bg-background/50 p-3">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold">{title}</span>
        <label className="flex items-center gap-1.5 font-mono text-muted-foreground">
          <span>{value}</span>
          <input
            type="color"
            value={value}
            aria-label={`${title} — couleur libre`}
            onChange={(e) => onChange(e.target.value)}
            className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
          />
        </label>
      </div>

      {groups.map((group) => (
        <div key={group.label} className="space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{group.label}</div>
          <div role="radiogroup" aria-label={`${title} — ${group.label}`} className="flex flex-wrap gap-1.5">
            {group.swatches.map((swatch) => {
              const active = swatch.hex === current
              return (
                <button
                  key={`${group.label}-${swatch.hex}`}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={swatch.name}
                  title={`${swatch.name} (${swatch.hex})`}
                  onClick={() => onChange(swatch.hex)}
                  style={{ backgroundColor: swatch.hex }}
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active ? 'border-primary ring-2 ring-primary ring-offset-1 ring-offset-background' : 'border-border'
                  )}
                >
                  {active && <Check className="h-3 w-3 text-white mix-blend-difference" />}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
