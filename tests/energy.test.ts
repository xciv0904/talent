import { describe, expect, it } from 'vitest';
import { QUICK_DISCOVERY_QUESTIONS } from '../src/data/questions';
import { CAREER_PROFILES } from '../src/data/careers';
import { matchCareer, runAssessment, scoreBaseTalents } from '../src/engine';
import type { QuestionResponse } from '../src/types';
import { GOLDEN_PERSONAS } from './fixtures/golden-personas';

const communicationAbilityResponses: QuestionResponse[] = QUICK_DISCOVERY_QUESTIONS.filter((question) =>
  question.options.some((option) => 'communication' in (option.talentSignals ?? {})),
).map((question) => ({
  questionId: question.id,
  selectedOptionIds: ['communication'],
  scaleValue: question.type === 'behavior' || question.type === 'evidence' ? 5 : undefined,
  answeredAt: '2026-08-09T00:00:00.000Z',
}));

const energyResponse = (communicationOrder: 'energizing' | 'draining'): QuestionResponse => ({
  questionId: 'ENG01',
  selectedOptionIds: communicationOrder === 'energizing'
    ? ['communication', 'analytical_reasoning']
    : ['analytical_reasoning', 'communication'],
  answeredAt: '2026-08-09T00:00:00.000Z',
});

describe('energy separation', () => {
  it('requires both an energizing and a draining selection', () => {
    expect(() => runAssessment(QUICK_DISCOVERY_QUESTIONS, [{
      questionId: 'ENG01',
      selectedOptionIds: ['communication'],
      answeredAt: '2026-08-09T00:00:00.000Z',
    }])).toThrow('requires one energizing and one draining selection');
  });

  it('keeps ability identical when communication energy changes', () => {
    const energizing = scoreBaseTalents(
      runAssessment(QUICK_DISCOVERY_QUESTIONS, [...communicationAbilityResponses, energyResponse('energizing')]),
    ).find(({ talentId }) => talentId === 'communication')!;
    const draining = scoreBaseTalents(
      runAssessment(QUICK_DISCOVERY_QUESTIONS, [...communicationAbilityResponses, energyResponse('draining')]),
    ).find(({ talentId }) => talentId === 'communication')!;

    expect(energizing.score).toBe(1);
    expect(draining.score).toBe(1);
    expect(energizing.energyScore).toBe(1);
    expect(draining.energyScore).toBe(-1);
    expect(energizing.status).toBe('natural_strength');
    expect(draining.status).toBe('developed_strength');

    const career = CAREER_PROFILES.find(({ id }) => id === 'customer_success_manager')!;
    const base = GOLDEN_PERSONAS[0].input;
    const withEnergy = matchCareer(career, {
      ...base,
      talentScores: base.talentScores.map((talent) => talent.talentId === 'communication' ? energizing : talent),
    });
    const withDrain = matchCareer(career, {
      ...base,
      talentScores: base.talentScores.map((talent) => talent.talentId === 'communication' ? draining : talent),
    });
    expect(withDrain.talentMatch).toBe(withEnergy.talentMatch);
  });
});
