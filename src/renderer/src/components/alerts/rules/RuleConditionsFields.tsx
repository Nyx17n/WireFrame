import * as React from 'react'
import type { WorldAlertRule } from '@shared/schemas/world-rules.schema'
import {
  ArbitrationConditions,
  ArchonConditions,
  FissureConditions,
  SortieConditions,
  type ErrorFor
} from './RuleConditionsMissions'
import {
  BaroConditions,
  BountyConditions,
  CycleConditions,
  InvasionConditions,
  NightwaveConditions
} from './RuleConditionsTimed'

/** Affiche les champs de conditions propres à la source de la règle. */
export function RuleConditionsFields({
  rule,
  onChange,
  errorFor
}: {
  rule: WorldAlertRule
  onChange: (rule: WorldAlertRule) => void
  errorFor: ErrorFor
}): React.JSX.Element {
  switch (rule.source) {
    case 'fissure':
      return <FissureConditions rule={rule} onChange={onChange} errorFor={errorFor} />
    case 'invasion':
      return <InvasionConditions rule={rule} onChange={onChange} errorFor={errorFor} />
    case 'arbitration':
      return <ArbitrationConditions rule={rule} onChange={onChange} />
    case 'cycle':
      return <CycleConditions rule={rule} onChange={onChange} errorFor={errorFor} />
    case 'baro':
      return <BaroConditions rule={rule} onChange={onChange} errorFor={errorFor} />
    case 'sortie':
      return <SortieConditions rule={rule} onChange={onChange} errorFor={errorFor} />
    case 'archon':
      return <ArchonConditions rule={rule} onChange={onChange} />
    case 'bounty':
      return <BountyConditions rule={rule} onChange={onChange} errorFor={errorFor} />
    case 'nightwave':
      return <NightwaveConditions rule={rule} onChange={onChange} errorFor={errorFor} />
  }
}

