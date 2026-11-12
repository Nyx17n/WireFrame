import * as React from 'react'
import { Copy, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { WORLD_RULE_SOURCE_LABELS } from '@shared/data/world-rule-options'
import type { WorldAlertRule } from '@shared/schemas/world-rules.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { describeRuleConditions } from '@/lib/world-rule-draft'

interface WorldRuleRowProps {
  rule: WorldAlertRule
  compact: boolean
  canDuplicate: boolean
  onToggle: (enabled: boolean) => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export function WorldRuleRow({
  rule,
  compact,
  canDuplicate,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete
}: WorldRuleRowProps): React.JSX.Element {
  const [confirmingDelete, setConfirmingDelete] = React.useState(false)
  const channels = [rule.notifyOs && 'Windows', rule.notifySound && 'Son'].filter(Boolean).join(' + ')

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-background/60 px-3 py-2 text-xs">
      <Switch checked={rule.enabled} onCheckedChange={onToggle} aria-label={`Activer ${rule.name}`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`truncate font-semibold ${rule.enabled ? '' : 'text-muted-foreground'}`}>{rule.name}</span>
          <Badge variant="secondary" className="text-[10px] uppercase">
            {WORLD_RULE_SOURCE_LABELS[rule.source]}
          </Badge>
        </div>
        {!compact && (
          <div className="truncate text-[11px] text-muted-foreground">
            {describeRuleConditions(rule)} · Toast{channels ? ` + ${channels}` : ' uniquement'}
          </div>
        )}
      </div>

      {confirmingDelete ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-destructive">Supprimer la règle ?</span>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            Supprimer
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)}>
            Annuler
          </Button>
        </div>
      ) : compact ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" aria-label="Actions de la règle">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={!canDuplicate} onSelect={onDuplicate}>Dupliquer</DropdownMenuItem>
            <DropdownMenuItem onSelect={onEdit}>Modifier</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setConfirmingDelete(true)}>Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-0.5">
          <Button size="icon" variant="ghost" title="Dupliquer" disabled={!canDuplicate} onClick={onDuplicate}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" title="Modifier" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" title="Supprimer" onClick={() => setConfirmingDelete(true)}>
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      )}
    </div>
  )
}

