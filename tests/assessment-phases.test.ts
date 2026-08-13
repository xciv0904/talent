import { describe, expect, it } from 'vitest';
import {
  CORE_DISCOVERY_QUESTION_IDS,
  CORE_DISCOVERY_QUESTIONS,
  QUICK_DISCOVERY_QUESTIONS,
  SUPPLEMENTAL_DISCOVERY_QUESTION_IDS,
  SUPPLEMENTAL_DISCOVERY_QUESTIONS,
} from '../src/data/questions';
import { runCareerDiscoveryPipeline } from '../src/engine';
import { BASE_TALENTS } from '../src/data/talents';
import { getQuestionCoverage } from '../src/utils';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';

describe('25 + 10 assessment phases', () => {
  it('partitions all 35 questions without duplicates', () => {
    expect(CORE_DISCOVERY_QUESTIONS).toHaveLength(25);
    expect(SUPPLEMENTAL_DISCOVERY_QUESTIONS).toHaveLength(10);
    expect(CORE_DISCOVERY_QUESTION_IDS).toHaveLength(25);
    expect(SUPPLEMENTAL_DISCOVERY_QUESTION_IDS).toHaveLength(10);
    expect(new Set([...CORE_DISCOVERY_QUESTION_IDS, ...SUPPLEMENTAL_DISCOVERY_QUESTION_IDS]).size).toBe(35);
    expect(QUICK_DISCOVERY_QUESTIONS.map(({ id }) => id)).toEqual([
      ...CORE_DISCOVERY_QUESTION_IDS,
      ...SUPPLEMENTAL_DISCOVERY_QUESTION_IDS,
    ]);
  });

  it('keeps every ability signal and three independent methods in the core', () => {
    const coverage = getQuestionCoverage(CORE_DISCOVERY_QUESTIONS);
    expect(coverage).toHaveLength(BASE_TALENTS.length);
    for (const talent of coverage) {
      expect(talent.signalCount).toBe(3);
      expect(talent.questionTypes.sort()).toEqual(['behavior', 'evidence', 'situational_choice'].sort());
    }
  });

  it('balances core formats and reserves profile depth for the supplement', () => {
    const counts = CORE_DISCOVERY_QUESTIONS.reduce<Record<string, number>>((result, question) => ({
      ...result,
      [question.type]: (result[question.type] ?? 0) + 1,
    }), {});
    expect(counts).toEqual({
      situational_choice: 5,
      behavior: 5,
      interest: 2,
      evidence: 5,
      environment: 3,
      values: 3,
      energy: 2,
    });
    expect(SUPPLEMENTAL_DISCOVERY_QUESTIONS.every(({ type }) =>
      ['energy', 'interest', 'environment', 'values'].includes(type),
    )).toBe(true);
  });

  it('produces deterministic preliminary results without changing ability scores', () => {
    const completeResponses = SYNTHETIC_PROFILES[0].responses;
    const coreIds = new Set(CORE_DISCOVERY_QUESTION_IDS);
    const coreResponses = completeResponses.filter(({ questionId }) => coreIds.has(questionId as typeof CORE_DISCOVERY_QUESTION_IDS[number]));
    const first = runCareerDiscoveryPipeline(coreResponses);
    const repeated = runCareerDiscoveryPipeline(coreResponses);
    const complete = runCareerDiscoveryPipeline(completeResponses);

    expect(first.matches).toEqual(repeated.matches);
    expect(first.talentProfile).toEqual(repeated.talentProfile);
    expect(first.profiles.coverage).toEqual({ interest: 0.4, workStyle: 1, environment: 0.5, values: 0.6 });
    expect(complete.profiles.coverage).toEqual({ interest: 1, workStyle: 1, environment: 1, values: 1 });
    expect(first.talentProfile.baseTalents.map(({ talentId, score }) => [talentId, score])).toEqual(
      complete.talentProfile.baseTalents.map(({ talentId, score }) => [talentId, score]),
    );
  });
});
