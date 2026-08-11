import { describe, expect, it } from 'vitest';
import { QUICK_DISCOVERY_QUESTIONS } from '../src/data/questions';
import { BASE_TALENTS } from '../src/data/talents';
import { ENVIRONMENT_DIMENSIONS, INTEREST_DIMENSIONS, VALUE_DIMENSIONS, WORK_STYLE_DIMENSIONS } from '../src/types';
import { getQuestionCoverage } from '../src/utils';

describe('Quick Discovery coverage', () => {
  it('contains 35 unique questions with the intended mixed formats', () => {
    expect(QUICK_DISCOVERY_QUESTIONS).toHaveLength(35);
    expect(new Set(QUICK_DISCOVERY_QUESTIONS.map(({ id }) => id)).size).toBe(35);

    const typeCounts = QUICK_DISCOVERY_QUESTIONS.reduce<Record<string, number>>((counts, question) => {
      counts[question.type] = (counts[question.type] ?? 0) + 1;
      return counts;
    }, {});
    expect(typeCounts).toEqual({
      situational_choice: 5,
      behavior: 5,
      evidence: 5,
      energy: 5,
      interest: 5,
      environment: 5,
      values: 5,
    });
  });

  it('gives every Base Talent three balanced, cross-method ability signals', () => {
    const coverage = getQuestionCoverage(QUICK_DISCOVERY_QUESTIONS);
    expect(coverage).toHaveLength(BASE_TALENTS.length);

    const signalCounts = coverage.map(({ signalCount }) => signalCount);
    expect(Math.min(...signalCounts)).toBe(3);
    expect(Math.max(...signalCounts)).toBe(3);
    for (const talent of coverage) {
      expect(talent.questionTypes.sort()).toEqual(
        ['behavior', 'evidence', 'situational_choice'].sort(),
      );
    }
  });

  it('keeps energy separate and exposes every contracted profile dimension', () => {
    for (const { id: talentId } of BASE_TALENTS) {
      const energyValues = QUICK_DISCOVERY_QUESTIONS.flatMap((question) =>
        question.options.map((option) => option.energySignals?.[talentId]).filter((value) => value !== undefined),
      );
      expect(energyValues).toEqual([1]);
    }
    for (const question of QUICK_DISCOVERY_QUESTIONS.filter(({ type }) => type === 'energy')) {
      expect('selection' in question && question.selection).toBe('multiple');
      expect('maxSelections' in question ? question.maxSelections : undefined).toBe(2);
    }
    const keysFor = (field: 'interestSignals' | 'workStyleSignals' | 'environmentSignals' | 'valueSignals') =>
      new Set(QUICK_DISCOVERY_QUESTIONS.flatMap((question) => question.options.flatMap((option) => Object.keys(option[field] ?? {}))));
    expect(keysFor('interestSignals')).toEqual(new Set(INTEREST_DIMENSIONS));
    expect(keysFor('workStyleSignals')).toEqual(new Set(WORK_STYLE_DIMENSIONS));
    expect(keysFor('environmentSignals')).toEqual(new Set(ENVIRONMENT_DIMENSIONS));
    expect(keysFor('valueSignals')).toEqual(new Set(VALUE_DIMENSIONS));
  });
});
