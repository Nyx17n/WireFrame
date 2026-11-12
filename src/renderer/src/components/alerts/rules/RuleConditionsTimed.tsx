import * as React from 'react'
import {
  BARO_TRIGGERS,
  BARO_TRIGGER_LABELS,
  BOUNTY_SYNDICATES,
  BOUNTY_SYNDICATE_LABELS,
  CYCLE_LOCATIONS,
  CYCLE_LOCATION_LABELS,
  CYCLE_STATES,
  INVASION_CATEGORIES,
  INVASION_CATEGORY_LABELS,
  NIGHTWAVE_KINDS,
  NIGHTWAVE_KIND_LABELS,
  WORLD_RULE_TEXT_MAX
} from '@shared/data/world-rule-options'
import type { WorldAlertRule } from '@shared/schemas/world-rules.schema'
import { Input } from '@/components/ui/input'
import { ChipSelect, RuleField, toChipOptions } from './ChipSelect'
import type { ErrorFor } from './RuleConditionsMissions'

type RuleOf<S extends WorldAlertRule['source']> = Extract<WorldAlertRule, { source: S }>

function NumberField({ value, min, max, onChange, suffix }: {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  suffix: string
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        className="w-24"
        onChange={(e) => {
          const parsed = Number.parseInt(e.target.value, 10)
          onChange(Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : min)
        }}
      />
      <span className="text-xs text-muted-foreground">{suffix}</span>
    </div>
  )
}

export function InvasionConditions({ rule, onChange, errorFor }: {
  rule: RuleOf<'invasion'>
  onChange: (r: RuleOf<'invasion'>) => void
  errorFor: ErrorFor
}): React.JSX.Element {
  return (
    <>
      <RuleField label="Catégorie de récompense" error={errorFor('categories')}>
        <ChipSelect ariaLabel="Catégorie de récompense" options={toChipOptions(INVASION_CATEGORIES, INVASION_CATEGORY_LABELS)} selected={rule.categories} onChange={(categories) => onChange({ ...rule, categories })} />
      </RuleField>
      <RuleField label="… ou la récompense contient (FR/EN)" error={errorFor('rewardText')}>
        <Input value={rule.rewardText} maxLength={WORLD_RULE_TEXT_MAX} placeholder="ex. Mutagène, Fieldron, Potatoe" onChange={(e) => onChange({ ...rule, rewardText: e.target.value })} />
      </RuleField>
    </>
  )
}

export function CycleConditions({ rule, onChange, errorFor }: {
  rule: RuleOf<'cycle'>
  onChange: (r: RuleOf<'cycle'>) => void
  errorFor: ErrorFor
}): React.JSX.Element {
  const stateOptions = CYCLE_STATES[rule.location].map((s) => ({ value: s.id, label: s.label }))
  return (
    <>
      <RuleField label="Lieu">
        <ChipSelect
          single
          ariaLabel="Lieu"
          options={toChipOptions(CYCLE_LOCATIONS, CYCLE_LOCATION_LABELS)}
          selected={[rule.location]}
          onChange={(v) => {
            const location = v[0] ?? rule.location
            onChange({ ...rule, location, state: CYCLE_STATES[location][0]?.id ?? rule.state })
          }}
        />
      </RuleField>
      <RuleField label="État ciblé" error={errorFor('state')}>
        <ChipSelect single ariaLabel="État ciblé" options={stateOptions} selected={[rule.state]} onChange={(v) => onChange({ ...rule, state: v[0] ?? rule.state })} />
      </RuleField>
      <RuleField label="Pré-alerte" hint="0 = au début de l’état, sinon X minutes avant (30 max)">
        <NumberField value={rule.preAlertMin} min={0} max={30} suffix="min avant" onChange={(preAlertMin) => onChange({ ...rule, preAlertMin })} />
      </RuleField>
    </>
  )
}

export function BaroConditions({ rule, onChange, errorFor }: {
  rule: RuleOf<'baro'>
  onChange: (r: RuleOf<'baro'>) => void
  errorFor: ErrorFor
}): React.JSX.Element {
  return (
    <>
      <RuleField label="Déclencheur">
        <ChipSelect single ariaLabel="Déclencheur" options={toChipOptions(BARO_TRIGGERS, BARO_TRIGGER_LABELS)} selected={[rule.trigger]} onChange={(v) => onChange({ ...rule, trigger: v[0] ?? 'arrival' })} />
      </RuleField>
      {rule.trigger === 'pre-arrival' && (
        <RuleField label="Prévenir avant l’arrivée">
          <NumberField value={rule.preAlertHours} min={1} max={48} suffix="heures avant" onChange={(preAlertHours) => onChange({ ...rule, preAlertHours })} />
        </RuleField>
      )}
      {rule.trigger === 'item' && (
        <RuleField label="Nom de l’article (FR/EN)" error={errorFor('itemText')}>
          <Input value={rule.itemText} maxLength={WORLD_RULE_TEXT_MAX} placeholder="ex. Primed Chamber" onChange={(e) => onChange({ ...rule, itemText: e.target.value })} />
        </RuleField>
      )}
    </>
  )
}

export function BountyConditions({ rule, onChange, errorFor }: {
  rule: RuleOf<'bounty'>
  onChange: (r: RuleOf<'bounty'>) => void
  errorFor: ErrorFor
}): React.JSX.Element {
  return (
    <>
      <RuleField label="Syndicat" error={errorFor('syndicates')}>
        <ChipSelect ariaLabel="Syndicat" options={toChipOptions(BOUNTY_SYNDICATES, BOUNTY_SYNDICATE_LABELS)} selected={rule.syndicates} onChange={(syndicates) => onChange({ ...rule, syndicates })} />
      </RuleField>
      <RuleField label="Récompense possible contenant…" error={errorFor('rewardText')}>
        <Input value={rule.rewardText} maxLength={WORLD_RULE_TEXT_MAX} placeholder="ex. Arcane, Gyromag" onChange={(e) => onChange({ ...rule, rewardText: e.target.value })} />
      </RuleField>
      <RuleField label="Niveau minimum de la mise à prix">
        <NumberField value={rule.minLevel} min={0} max={200} suffix="niveau min." onChange={(minLevel) => onChange({ ...rule, minLevel })} />
      </RuleField>
    </>
  )
}

export function NightwaveConditions({ rule, onChange, errorFor }: {
  rule: RuleOf<'nightwave'>
  onChange: (r: RuleOf<'nightwave'>) => void
  errorFor: ErrorFor
}): React.JSX.Element {
  return (
    <>
      <RuleField label="Type de défi" error={errorFor('kinds')}>
        <ChipSelect ariaLabel="Type de défi" options={toChipOptions(NIGHTWAVE_KINDS, NIGHTWAVE_KIND_LABELS)} selected={rule.kinds} onChange={(kinds) => onChange({ ...rule, kinds })} />
      </RuleField>
      <RuleField label="Réputation minimum">
        <NumberField value={rule.minReputation} min={0} max={10_000} suffix="réputation" onChange={(minReputation) => onChange({ ...rule, minReputation })} />
      </RuleField>
      <RuleField label="Intitulé contenant…" error={errorFor('titleText')}>
        <Input value={rule.titleText} maxLength={WORLD_RULE_TEXT_MAX} placeholder="ex. Eidolon" onChange={(e) => onChange({ ...rule, titleText: e.target.value })} />
      </RuleField>
    </>
  )
}

