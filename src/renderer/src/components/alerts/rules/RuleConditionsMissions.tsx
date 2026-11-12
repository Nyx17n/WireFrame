import * as React from 'react'
import {
  ARCHON_BOSSES,
  ARCHON_BOSS_LABELS,
  FISSURE_ERAS,
  FISSURE_MODES,
  FISSURE_MODE_LABELS,
  WORLD_FACTIONS,
  WORLD_FACTION_LABELS,
  WORLD_MISSION_TYPES,
  WORLD_RULE_TEXT_MAX
} from '@shared/data/world-rule-options'
import type { WorldAlertRule } from '@shared/schemas/world-rules.schema'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ChipSelect, RuleField, toChipOptions } from './ChipSelect'

type RuleOf<S extends WorldAlertRule['source']> = Extract<WorldAlertRule, { source: S }>
export type ErrorFor = (field: string) => string | null

const ERA_OPTIONS = toChipOptions(FISSURE_ERAS)
const MISSION_OPTIONS = toChipOptions(WORLD_MISSION_TYPES)
const MODE_OPTIONS = toChipOptions(FISSURE_MODES, FISSURE_MODE_LABELS)
const FACTION_OPTIONS = toChipOptions(WORLD_FACTIONS, WORLD_FACTION_LABELS)
const ARCHON_OPTIONS = toChipOptions(ARCHON_BOSSES, ARCHON_BOSS_LABELS)

function first<T>(values: readonly T[], fallback: T): T {
  return values[0] ?? fallback
}

export function FissureConditions({ rule, onChange, errorFor }: {
  rule: RuleOf<'fissure'>
  onChange: (r: RuleOf<'fissure'>) => void
  errorFor: ErrorFor
}): React.JSX.Element {
  return (
    <>
      <RuleField label="Ères" error={errorFor('eras')}>
        <ChipSelect ariaLabel="Ères" options={ERA_OPTIONS} selected={rule.eras} onChange={(eras) => onChange({ ...rule, eras })} />
      </RuleField>
      <RuleField label="Types de mission">
        <ChipSelect ariaLabel="Types de mission" options={MISSION_OPTIONS} selected={rule.missionTypes} onChange={(missionTypes) => onChange({ ...rule, missionTypes })} />
      </RuleField>
      <RuleField label="Mode">
        <ChipSelect single ariaLabel="Mode" options={MODE_OPTIONS} selected={[rule.mode]} onChange={(v) => onChange({ ...rule, mode: first(v, 'any') })} />
      </RuleField>
      <RuleField label="Faction">
        <ChipSelect single ariaLabel="Faction" options={FACTION_OPTIONS} selected={[rule.faction]} onChange={(v) => onChange({ ...rule, faction: first(v, 'any') })} />
      </RuleField>
      <label className="flex items-center gap-2 text-xs">
        <Switch checked={rule.fastOnly} onCheckedChange={(fastOnly) => onChange({ ...rule, fastOnly })} />
        <span>⚡ Missions rapides uniquement (Capture, Extermination, Sabotage…)</span>
      </label>
    </>
  )
}

export function ArbitrationConditions({ rule, onChange }: {
  rule: RuleOf<'arbitration'>
  onChange: (r: RuleOf<'arbitration'>) => void
}): React.JSX.Element {
  return (
    <>
      <RuleField label="Types de mission" hint="Vide = tous les types">
        <ChipSelect ariaLabel="Types de mission" options={MISSION_OPTIONS} selected={rule.missionTypes} onChange={(missionTypes) => onChange({ ...rule, missionTypes })} />
      </RuleField>
      <RuleField label="Faction">
        <ChipSelect single ariaLabel="Faction" options={FACTION_OPTIONS} selected={[rule.faction]} onChange={(v) => onChange({ ...rule, faction: first(v, 'any') })} />
      </RuleField>
      <label className="flex items-center gap-2 text-xs">
        <Switch checked={rule.sTierOnly} onCheckedChange={(sTierOnly) => onChange({ ...rule, sTierOnly })} />
        <span>S-Tier uniquement</span>
      </label>
    </>
  )
}

export function SortieConditions({ rule, onChange, errorFor }: {
  rule: RuleOf<'sortie'>
  onChange: (r: RuleOf<'sortie'>) => void
  errorFor: ErrorFor
}): React.JSX.Element {
  return (
    <>
      <RuleField label="Faction">
        <ChipSelect single ariaLabel="Faction" options={FACTION_OPTIONS} selected={[rule.faction]} onChange={(v) => onChange({ ...rule, faction: first(v, 'any') })} />
      </RuleField>
      <RuleField label="Boss contenant…" error={errorFor('bossText')}>
        <Input value={rule.bossText} maxLength={WORLD_RULE_TEXT_MAX} placeholder="ex. Vay Hek" onChange={(e) => onChange({ ...rule, bossText: e.target.value })} />
      </RuleField>
      <RuleField label="Type de mission présent dans une étape">
        <ChipSelect ariaLabel="Types de mission" options={MISSION_OPTIONS} selected={rule.missionTypes} onChange={(missionTypes) => onChange({ ...rule, missionTypes })} />
      </RuleField>
      <RuleField label="Modificateur contenant…" error={errorFor('modifierText')}>
        <Input value={rule.modifierText} maxLength={WORLD_RULE_TEXT_MAX} placeholder="ex. Éclipse" onChange={(e) => onChange({ ...rule, modifierText: e.target.value })} />
      </RuleField>
    </>
  )
}

export function ArchonConditions({ rule, onChange }: {
  rule: RuleOf<'archon'>
  onChange: (r: RuleOf<'archon'>) => void
}): React.JSX.Element {
  return (
    <>
      <RuleField label="Archonte ciblé" hint="Vide = chaque nouvelle chasse hebdomadaire">
        <ChipSelect ariaLabel="Archonte" options={ARCHON_OPTIONS} selected={rule.archons} onChange={(archons) => onChange({ ...rule, archons })} />
      </RuleField>
      <RuleField label="Type de mission présent dans une étape">
        <ChipSelect ariaLabel="Types de mission" options={MISSION_OPTIONS} selected={rule.missionTypes} onChange={(missionTypes) => onChange({ ...rule, missionTypes })} />
      </RuleField>
    </>
  )
}

