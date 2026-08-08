import { describe, expect, it } from 'vitest';
import { aggregateQuestionSignals } from '../src/engine';
import type { Question, QuestionResponse } from '../src/types';

describe('aggregateQuestionSignals', () => {
  it('aggregates option outputs outside React components', () => {
    const questions: Question[] = [
      {
        id: 'q1',
        type: 'situational_choice',
        prompt: '遇到不熟悉的問題時，你通常先做什麼？',
        required: true,
        selection: 'single',
        options: [
          {
            id: 'map',
            label: '先整理已知與未知',
            talentSignals: { structuring_ambiguity: 2 },
            energySignals: { structuring_ambiguity: 1 },
            interestSignals: { analytical_reasoning: 0.5 },
            environmentSignals: { autonomy: 0.25 },
            valueSignals: { clarity: 0.75 },
          },
        ],
      },
    ];
    const responses: QuestionResponse[] = [
      {
        questionId: 'q1',
        selectedOptionIds: ['map'],
        answeredAt: '2026-08-09T00:00:00.000Z',
      },
    ];

    expect(aggregateQuestionSignals(questions, responses)).toEqual({
      talentSignals: { structuring_ambiguity: 2 },
      energySignals: { structuring_ambiguity: 1 },
      interestSignals: { analytical_reasoning: 0.5 },
      workStyleSignals: {},
      environmentSignals: { autonomy: 0.25 },
      valueSignals: { clarity: 0.75 },
    });
  });
});
