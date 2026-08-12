import { describe, expect, it } from 'vitest';
import { QUICK_DISCOVERY_QUESTIONS } from '../src/data/questions';
import { isQuestionResponseComplete } from '../src/utils';

const answeredAt = '2026-08-12T00:00:00.000Z';

describe('assessment response validation', () => {
  it('requires an explicit frequency or evidence rating', () => {
    const question = QUICK_DISCOVERY_QUESTIONS.find(({ id }) => id === 'BEH01')!;
    const selectedOptionIds = [question.options[0].id];
    expect(isQuestionResponseComplete(question, { questionId: question.id, selectedOptionIds, answeredAt })).toBe(false);
    expect(isQuestionResponseComplete(question, { questionId: question.id, selectedOptionIds, scaleValue: 3, answeredAt })).toBe(true);
  });

  it('requires two distinct ordered Energy selections', () => {
    const question = QUICK_DISCOVERY_QUESTIONS.find(({ id }) => id === 'ENG01')!;
    expect(isQuestionResponseComplete(question, { questionId: question.id, selectedOptionIds: [question.options[0].id], answeredAt })).toBe(false);
    expect(isQuestionResponseComplete(question, { questionId: question.id, selectedOptionIds: [question.options[0].id, question.options[1].id], answeredAt })).toBe(true);
  });
});
