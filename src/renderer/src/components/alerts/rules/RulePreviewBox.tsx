import * as React from 'react'
import { AlertTriangle, CheckCircle2, CircleDashed, Loader2, Play } from 'lucide-react'
import type { WorldAlertRule, WorldRulePreviewResult } from '@shared/schemas/world-rules.schema'
import { Button } from '@/components/ui/button'
import { validateRuleDraft } from '@/lib/world-rule-draft'
import { ipcClient } from '@/services/ipc-client'

type PreviewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; result: WorldRulePreviewResult }
  | { status: 'invalid'; message: string }

/** Bouton « Tester avec le Worldstate actuel » + ses 4 états (chargement, vide, nominal, erreur). */
export function RulePreviewBox({ rule }: { rule: WorldAlertRule }): React.JSX.Element {
  const [state, setState] = React.useState<PreviewState>({ status: 'idle' })
  const ruleFingerprint = JSON.stringify({ ...rule, name: '', enabled: true })

  React.useEffect(() => {
    setState({ status: 'idle' })
  }, [ruleFingerprint])

  const runPreview = async (): Promise<void> => {
    const validation = validateRuleDraft({ ...rule, name: rule.name || 'Aperçu' })
    if (!validation.ok) {
      setState({ status: 'invalid', message: validation.message })
      return
    }
    setState({ status: 'loading' })
    try {
      const result = await ipcClient.alerts.previewWorldRule(validation.rule)
      setState({ status: 'done', result })
    } catch (err) {
      setState({
        status: 'done',
        result: { status: 'unavailable', message: err instanceof Error ? err.message : 'Aperçu indisponible' }
      })
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" size="sm" disabled={state.status === 'loading'} onClick={() => void runPreview()}>
        <Play className="h-3.5 w-3.5 text-primary" />
        <span>Tester avec le Worldstate actuel</span>
      </Button>

      {state.status === 'loading' && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/40 p-2.5 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Analyse du Worldstate en cache…</span>
        </div>
      )}

      {state.status === 'invalid' && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-2.5 text-xs">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
          <span>{state.message}</span>
        </div>
      )}

      {state.status === 'done' && state.result.status === 'unavailable' && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-2.5 text-xs">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
          <span>⚠ {state.result.message} La règle peut quand même être enregistrée.</span>
        </div>
      )}

      {state.status === 'done' && state.result.status === 'ok' && state.result.total === 0 && (
        <div className="flex items-start gap-2 rounded-md border border-border bg-secondary/40 p-2.5 text-xs text-muted-foreground">
          <CircleDashed className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>Aucune occurrence en ce moment. La règle sera surveillée en continu.</span>
        </div>
      )}

      {state.status === 'done' && state.result.status === 'ok' && state.result.total > 0 && (
        <div className="space-y-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-xs">
          <div className="flex items-center gap-2 font-semibold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>
              {state.result.total} occurrence{state.result.total > 1 ? 's correspondent' : ' correspond'} en ce moment
            </span>
          </div>
          <ul className="space-y-0.5 pl-5">
            {state.result.matches.map((m) => (
              <li key={m.key} className="list-disc">
                <span className="font-medium">{m.title}</span>
                <span className="text-muted-foreground"> — {m.subtitle}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

