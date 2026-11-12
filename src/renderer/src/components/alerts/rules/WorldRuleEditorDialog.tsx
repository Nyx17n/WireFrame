import * as React from 'react'
import { WORLD_RULE_SOURCES, WORLD_RULE_SOURCE_LABELS, WORLD_RULE_TEXT_MAX, type WorldRuleSource } from '@shared/data/world-rule-options'
import type { WorldAlertRule } from '@shared/schemas/world-rules.schema'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { buildAutoName, createDefaultRule, validateRuleDraft } from '@/lib/world-rule-draft'
import { useAppStore } from '@/stores/useAppStore'
import { RuleField } from './ChipSelect'
import { RuleConditionsFields } from './RuleConditionsFields'
import { RulePreviewBox } from './RulePreviewBox'

type Step = 1 | 2 | 3
const STEP_LABELS: Readonly<Record<Step, string>> = { 1: '1 · Source', 2: '2 · Conditions', 3: '3 · Notification' }

interface EditorProps {
  open: boolean
  initialRule: WorldAlertRule | null
  onClose: () => void
  onSave: (rule: WorldAlertRule) => Promise<void>
}

export function WorldRuleEditorDialog({ open, initialRule, onClose, onSave }: EditorProps): React.JSX.Element {
  const isCompact = useAppStore((s) => s.windowState.isCompactMode)
  const isEditing = initialRule !== null
  const [step, setStep] = React.useState<Step>(isEditing ? 2 : 1)
  const [draft, setDraft] = React.useState<WorldAlertRule>(initialRule ?? createDefaultRule('fissure'))
  const [nameTouched, setNameTouched] = React.useState(isEditing)
  const [error, setError] = React.useState<{ field: string | null; message: string } | null>(null)
  const [saving, setSaving] = React.useState(false)

  const effectiveRule: WorldAlertRule = { ...draft, name: nameTouched ? draft.name : buildAutoName(draft) }
  const errorFor = (field: string): string | null => (error?.field === field ? error.message : null)

  const updateDraft = (next: WorldAlertRule): void => {
    setDraft(next)
    setError(null)
  }

  const chooseSource = (source: WorldRuleSource): void => {
    const fresh = createDefaultRule(source)
    updateDraft({ ...fresh, id: draft.id, notifyOs: draft.notifyOs, notifySound: draft.notifySound })
    setStep(2)
  }

  const goNext = (): void => {
    const validation = validateRuleDraft(effectiveRule)
    if (!validation.ok && validation.field !== 'name') {
      setError({ field: validation.field, message: validation.message })
      return
    }
    setStep(3)
  }

  const handleSave = async (): Promise<void> => {
    const validation = validateRuleDraft(effectiveRule)
    if (!validation.ok) {
      setError({ field: validation.field, message: validation.message })
      if (validation.field !== 'name') setStep(2)
      return
    }
    setSaving(true)
    try {
      await onSave(validation.rule)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        layout={isCompact ? 'center' : 'drawer-right'}
        className={cn(
          'gap-3 overflow-hidden p-0',
          isCompact
            ? 'h-[92vh] max-w-[95vw]'
            : 'h-full max-w-[560px] rounded-none border-y-0 border-r-0'
        )}
      >
        <DialogHeader className="border-b border-border px-5 pb-3 pt-5">
          <DialogTitle>{isEditing ? 'Modifier la règle Worldstate' : 'Nouvelle règle Worldstate'}</DialogTitle>
          <DialogDescription>Préviens-moi quand… — étape {step} / 3</DialogDescription>
          <div className="flex gap-1.5 pt-2">
            {([1, 2, 3] as const).map((s) => (
              <span
                key={s}
                className={cn(
                  'flex-1 rounded-md border px-2 py-1 text-center text-[11px] font-medium',
                  s === step ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'
                )}
              >
                {STEP_LABELS[s]}
              </span>
            ))}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {WORLD_RULE_SOURCES.map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => chooseSource(source)}
                  className={cn(
                    'rounded-md border px-3 py-3 text-left text-xs font-semibold transition-colors hover:border-primary hover:bg-primary/10',
                    draft.source === source ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                  )}
                >
                  {WORLD_RULE_SOURCE_LABELS[source]}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Source : <strong className="text-foreground">{WORLD_RULE_SOURCE_LABELS[draft.source]}</strong>
                </span>
                {!isEditing && (
                  <button type="button" className="text-primary hover:underline" onClick={() => setStep(1)}>
                    modifier
                  </button>
                )}
              </div>
              <RuleConditionsFields rule={draft} onChange={updateDraft} errorFor={errorFor} />
              {error && error.field === null && <p className="text-[11px] text-destructive">{error.message}</p>}
              <RulePreviewBox rule={effectiveRule} />
            </>
          )}

          {step === 3 && (
            <>
              <RuleField label="Canaux de notification" hint="Le toast dans l’application est toujours affiché.">
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2">
                    <Switch checked={draft.notifyOs} onCheckedChange={(notifyOs) => updateDraft({ ...draft, notifyOs })} />
                    <span>Notification Windows native</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Switch checked={draft.notifySound} onCheckedChange={(notifySound) => updateDraft({ ...draft, notifySound })} />
                    <span>Son (réglages audio globaux)</span>
                  </label>
                </div>
              </RuleField>
              <RuleField label="Nom de la règle" hint={`${WORLD_RULE_TEXT_MAX} caractères maximum`} error={errorFor('name')}>
                <div className="flex gap-2">
                  <Input
                    value={effectiveRule.name}
                    maxLength={WORLD_RULE_TEXT_MAX}
                    onChange={(e) => {
                      setNameTouched(true)
                      updateDraft({ ...draft, name: e.target.value })
                    }}
                  />
                  {nameTouched && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setNameTouched(false)}>
                      Nom auto
                    </Button>
                  )}
                </div>
              </RuleField>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-3">
          <Button type="button" variant="ghost" onClick={step > 1 && !(isEditing && step === 2) ? () => setStep((step - 1) as Step) : onClose}>
            {step > 1 && !(isEditing && step === 2) ? 'Retour' : 'Annuler'}
          </Button>
          {step === 2 && <Button type="button" onClick={goNext}>Suivant →</Button>}
          {step === 3 && (
            <Button type="button" disabled={saving} onClick={() => void handleSave()}>
              Enregistrer
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

