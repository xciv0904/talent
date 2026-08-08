import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES } from '../src/data/careers';
import { CAREER_MATCH_WEIGHTS, matchCareer } from '../src/engine';
import { GOLDEN_PERSONAS } from './fixtures/golden-personas';

describe('career match formula', () => {
  it('uses the documented six weights and excludes popularity, salary, and openings', () => {
    expect(Object.values(CAREER_MATCH_WEIGHTS).reduce((sum, value) => sum + value, 0)).toBe(1);
    expect(CAREER_MATCH_WEIGHTS).toEqual({
      talent: 0.35,
      interest: 0.18,
      workStyle: 0.15,
      environment: 0.15,
      values: 0.1,
      transferableSkills: 0.07,
    });

    const result = matchCareer(CAREER_PROFILES[0], GOLDEN_PERSONAS[0].input);
    const expected =
      result.talentMatch * 0.35 +
      result.interestMatch * 0.18 +
      result.workStyleMatch * 0.15 +
      result.environmentMatch * 0.15 +
      result.valuesMatch * 0.1 +
      result.transferableSkillsMatch * 0.07;
    expect(result.matchScore).toBeCloseTo(expected, 12);
    expect('salary' in result).toBe(false);
    expect('popularity' in result).toBe(false);
    expect('jobOpenings' in result).toBe(false);
  });

  it('returns explanation data and supporting evidence IDs', () => {
    const career = CAREER_PROFILES.find(({ id }) => id === 'ux_researcher')!;
    const result = matchCareer(career, GOLDEN_PERSONAS[0].input);
    expect(result.topTalentReasons.length).toBeGreaterThan(0);
    expect(result.interestReasons.length).toBeGreaterThan(0);
    expect(result.environmentReasons.length + result.potentialFrictions.length).toBeGreaterThan(0);
    expect(result.supportingEvidenceIds.length).toBeGreaterThan(0);
  });

  it('does not apply family quotas or family-based fit adjustments', () => {
    const career = CAREER_PROFILES.find(({ id }) => id === 'product_manager')!;
    const user = GOLDEN_PERSONAS[4].input;
    const original = matchCareer(career, user);
    const changedFamily = matchCareer({ ...career, family: 'media' }, user);
    expect(changedFamily.matchScore).toBe(original.matchScore);
    expect(changedFamily.talentMatch).toBe(original.talentMatch);
  });
});
