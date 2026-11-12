import * as React from 'react'
import { ListChecks, Plus } from 'lucide-react'
import { WORLD_RULES_MAX, WORLD_RULE_TEXT_MAX } from '@shared/data/world-rule-options'
import type { WorldAlertRule } from '@shared/schemas/world-rules.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/stores/useAppStore'
import { notify } from '@/stores/useNotificationStore'
import { WorldRuleEditorDialog } from './WorldRuleEditorDialog'
import { WorldRuleRow } from './WorldRuleRow'

interface EditorState {
  key: number
  rule: WorldAlertRule | null
}

export function WorldRulesPanel(): React.JSX.Element {
  const rules = useAppStore((s) => s.settings.worldRules)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const isCompact = useAppStore((s) => s.windowState.isCompactMode)
  const [editor, setEditor] = React.useState<EditorState | null>(null)
  const isFull = rules.length >= WORLD_RULES_MAX

  const persist = (next: WorldAlertRule[]): Promise<void> => updateSettings({ worldRules: next })

  const handleSave = async (rule: WorldAlertRule): Promise<void> => {
    const exists = rules.some((r) => r.id === rule.id)
    await persist(exists ? rules.map((r) => (r.id === rule.id ? rule : r)) : [...rules, rule])
    notify({
      kind: 'success',
      title: exists ? 'Règle Worldstate modifiée' : 'Règle Worldstate créée',
      message: rule.name
    })
    setEditor(null)
  }

  const handleDuplicate = (rule: WorldAlertRule): void => {
    if (isFull) {
      notify({
        kind: 'warning',
        title: `Limite de ${WORLD_RULES_MAX} règles atteinte`,
        message: 'Supprime une règle avant d’en dupliquer une autre.'
      })
      return
    }
    const suffix = ' (copie)'
    const copy: WorldAlertRule = {
      ...rule,
      id: `wr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      name: `${rule.name.slice(0, WORLD_RULE_TEXT_MAX - suffix.length)}${suffix}`
    }
    void persist([...rules, copy])
    notify({ kind: 'success', title: 'Règle dupliquée', message: copy.name })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ListChecks className="h-4 w-4 text-primary" />
          <span>Mes règles personnalisées</span>
          <Badge variant="outline" className="font-mono text-[10px]">
            {rules.length} / {WORLD_RULES_MAX}
          </Badge>
        </CardTitle>
        <Button
          size="sm"
          disabled={isFull}
          title={isFull ? `Limite de ${WORLD_RULES_MAX} règles atteinte` : undefined}
          onClick={() => setEditor({ key: Date.now(), rule: null })}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Nouvelle règle</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {rules.length === 0 ? (
          <p className="py-3 text-xs text-muted-foreground">
            Aucune règle pour l’instant. Exemple : « préviens-moi quand une fissure Axi Survie apparaît en Route de l’Acier » —
            WireFrame te notifie une seule fois par occurrence, même réduit dans le System Tray.
          </p>
        ) : (
          rules.map((rule) => (
            <WorldRuleRow
              key={rule.id}
              rule={rule}
              compact={isCompact}
              canDuplicate={!isFull}
              onToggle={(enabled) => void persist(rules.map((r) => (r.id === rule.id ? { ...r, enabled } : r)))}
              onEdit={() => setEditor({ key: Date.now(), rule })}
              onDuplicate={() => handleDuplicate(rule)}
              onDelete={() => {
                void persist(rules.filter((r) => r.id !== rule.id))
                notify({ kind: 'info', title: 'Règle Worldstate supprimée', message: rule.name })
              }}
            />
          ))
        )}
      </CardContent>

      {editor && (
        <WorldRuleEditorDialog
          key={editor.key}
          open
          initialRule={editor.rule}
          onClose={() => setEditor(null)}
          onSave={handleSave}
        />
      )}
    </Card>
  )
}

