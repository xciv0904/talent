import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES } from '../src/data/careers';
import { matchCareer, runCareerDiscoveryPipeline } from '../src/engine';
import {
  CAREER_MATCH_VALUE_DIMENSIONS,
  ENVIRONMENT_DIMENSIONS,
  INTEREST_DIMENSIONS,
  VALUE_DIMENSIONS,
  WORK_STYLE_DIMENSIONS,
} from '../src/types';
import { GOLDEN_PERSONAS } from './fixtures/golden-personas';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';

describe('profile vector contract', () => {
  it('produces and stores every Assessment-side dimension from raw answers', () => {
    const result = runCareerDiscoveryPipeline(SYNTHETIC_PROFILES[0].responses);
    expect(new Set(Object.keys(result.profiles.interestProfile))).toEqual(new Set(INTEREST_DIMENSIONS));
    expect(new Set(Object.keys(result.profiles.workStyle))).toEqual(new Set(WORK_STYLE_DIMENSIONS));
    expect(new Set(Object.keys(result.profiles.environmentTolerance))).toEqual(new Set(ENVIRONMENT_DIMENSIONS));
    expect(new Set(Object.keys(result.profiles.valuesProfile))).toEqual(new Set(VALUE_DIMENSIONS));
    expect(WORK_STYLE_DIMENSIONS.filter((id) => (ENVIRONMENT_DIMENSIONS as readonly string[]).includes(id))).toEqual([]);
  });

  it('reads every matched dimension and leaves explanation-only Values out of fit', () => {
    const base = GOLDEN_PERSONAS[0].input;
    for (const dimension of INTEREST_DIMENSIONS) {
      const career = [...CAREER_PROFILES].sort((a, b) => b.interestProfile[dimension] - a.interestProfile[dimension])[0];
      const low = matchCareer(career, { ...base, interestProfile: { ...base.interestProfile, [dimension]: 0 } });
      const high = matchCareer(career, { ...base, interestProfile: { ...base.interestProfile, [dimension]: 1 } });
      expect(high.interestMatch).not.toBe(low.interestMatch);
    }
    for (const dimension of WORK_STYLE_DIMENSIONS) {
      const career = [...CAREER_PROFILES].sort((a, b) => b.workStyle[dimension] - a.workStyle[dimension])[0];
      const low = matchCareer(career, { ...base, workStyle: { ...base.workStyle, [dimension]: 0 } });
      const high = matchCareer(career, { ...base, workStyle: { ...base.workStyle, [dimension]: 1 } });
      expect(high.workStyleMatch).not.toBe(low.workStyleMatch);
    }
    for (const dimension of ENVIRONMENT_DIMENSIONS) {
      const career = [...CAREER_PROFILES].sort((a, b) => b.environmentProfile[dimension] - a.environmentProfile[dimension])[0];
      const low = matchCareer(career, { ...base, environmentTolerance: { ...base.environmentTolerance, [dimension]: 0 } });
      const high = matchCareer(career, { ...base, environmentTolerance: { ...base.environmentTolerance, [dimension]: 1 } });
      expect(high.environmentMatch).not.toBe(low.environmentMatch);
    }
    for (const dimension of CAREER_MATCH_VALUE_DIMENSIONS) {
      const career = [...CAREER_PROFILES].sort((a, b) => b.valuesProfile[dimension] - a.valuesProfile[dimension])[0];
      const low = matchCareer(career, { ...base, valuesProfile: { ...base.valuesProfile, [dimension]: 0 } });
      const high = matchCareer(career, { ...base, valuesProfile: { ...base.valuesProfile, [dimension]: 1 } });
      expect(high.valuesMatch).not.toBe(low.valuesMatch);
    }

    const career = CAREER_PROFILES[0];
    const lowIncome = matchCareer(career, { ...base, valuesProfile: { ...base.valuesProfile, income: 0 } });
    const highIncome = matchCareer(career, { ...base, valuesProfile: { ...base.valuesProfile, income: 1 } });
    expect(highIncome.matchScore).toBe(lowIncome.matchScore);
  });
});
