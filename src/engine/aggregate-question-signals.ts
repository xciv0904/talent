import type { Question, QuestionResponse, SignalMap, TalentId } from '../types';
import { runAssessment } from './assessment-engine';

export interface AggregatedSignals {
  talentSignals: Partial<Record<TalentId, number>>;
  energySignals: Partial<Record<TalentId, number>>;
  interestSignals: SignalMap;
  workStyleSignals: SignalMap;
  environmentSignals: SignalMap;
  valueSignals: SignalMap;
}

const addSignals = <TKey extends string>(
  target: Partial<Record<TKey, number>>,
  signals: Partial<Record<TKey, number>> | undefined,
  multiplier: number,
) => {
  if (!signals) return;

  for (const [key, value] of Object.entries(signals) as Array<[TKey, number]>) {
    target[key] = (target[key] ?? 0) + value * multiplier;
  }
};

export function aggregateQuestionSignals(
  questions: readonly Question[],
  responses: readonly QuestionResponse[],
): AggregatedSignals {
  const totals: AggregatedSignals = {
    talentSignals: {},
    energySignals: {},
    interestSignals: {},
    workStyleSignals: {},
    environmentSignals: {},
    valueSignals: {},
  };

  const assessment = runAssessment(questions, responses);
  for (const observation of assessment.observations) {
    if (observation.channel === 'ability') addSignals(totals.talentSignals, { [observation.key]: observation.value }, 1);
    if (observation.channel === 'energy') addSignals(totals.energySignals, { [observation.key]: observation.value }, 1);
    if (observation.channel === 'interest') addSignals(totals.interestSignals, { [observation.key]: observation.value }, 1);
    if (observation.channel === 'work_style') addSignals(totals.workStyleSignals, { [observation.key]: observation.value }, 1);
    if (observation.channel === 'environment') addSignals(totals.environmentSignals, { [observation.key]: observation.value }, 1);
    if (observation.channel === 'value') addSignals(totals.valueSignals, { [observation.key]: observation.value }, 1);
  }

  return totals;
}
