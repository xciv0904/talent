import { describe, expect, it } from 'vitest';
import { QUICK_DISCOVERY_QUESTIONS } from '../src/data/questions';
import { runAssessment, scoreBaseTalents } from '../src/engine';
import type { QuestionResponse, TalentId } from '../src/types';

const responsesFor = (talentId: TalentId, limit = 4): QuestionResponse[] =>
  QUICK_DISCOVERY_QUESTIONS.filter((question) =>
    question.options.some((option) => talentId in (option.talentSignals ?? {})),
  )
    .slice(0, limit)
    .map((question) => ({
      questionId: question.id,
      selectedOptionIds: [talentId],
      scaleValue: question.type === 'behavior' || question.type === 'evidence' ? 5 : undefined,
      answeredAt: '2026-08-09T00:00:00.000Z',
    }));

describe('confidence', () => {
  it('reports only Low, Medium, or High from coverage, consistency, and quality', () => {
    const levelFor = (count: number) => {
      const assessment = runAssessment(QUICK_DISCOVERY_QUESTIONS, responsesFor('communication', count));
      return scoreBaseTalents(assessment).find(({ talentId }) => talentId === 'communication')!.confidence;
    };

    expect(levelFor(1).level).toBe('low');
    expect(levelFor(2).level).toBe('medium');
    const full = levelFor(4);
    expect(full.level).toBe('high');
    expect(full.questionCoverage).toBe(1);
    expect(full.crossMethodConsistency).toBe(1);
    expect(full.evidenceQuality).toBeGreaterThan(0.7);
  });
});
