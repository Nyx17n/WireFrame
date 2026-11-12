import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ChipOption<T extends string> {
  value: T
  label: string
}

interface ChipSelectProps<T extends string> {
  options: readonly ChipOption<T>[]
  selected: readonly T[]
  onChange: (next: T[]) => void
  /** true = un seul choix possible (boutons radio visuels). */
  single?: boolean
  ariaLabel: string
}

export function ChipSelect<T extends string>({
  options,
  selected,
  onChange,
  single = false,
  ariaLabel
}: ChipSelectProps<T>): React.JSX.Element {
  const toggle = (value: T): void => {
    if (single) {
      onChange([value])
      return
    }
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  return (
    <div role={single ? 'radiogroup' : 'group'} aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = selected.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            role={single ? 'radio' : 'checkbox'}
            aria-checked={active}
            onClick={() => toggle(opt.value)}
            className={cn(
              'rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors',
              active
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border bg-background/60 text-muted-foreground hover:border-primary/50 hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function RuleField({
  label,
  hint,
  error,
  children
}: {
  label: string
  hint?: string
  error?: string | null
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="space-y-1.5">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      {children}
      {hint && !error && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
    </div>
  )
}

export function toChipOptions<T extends string>(
  values: readonly T[],
  labels?: Readonly<Record<T, string>>
): ChipOption<T>[] {
  return values.map((value) => ({ value, label: labels ? labels[value] : value }))
}

