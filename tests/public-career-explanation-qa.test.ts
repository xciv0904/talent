import { describe, expect, it } from 'vitest';
import { interpretPublicCareers, runCareerDiscoveryPipeline } from '../src/engine';
import type { PublicCareerFitLevel, PublicCareerInterpretation } from '../src/types';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';

const sampleByLevel = () => {
  const samples: Record<PublicCareerFitLevel, PublicCareerInterpretation[]> = { strong: [], moderate: [], lower: [] };
  for (const profile of SYNTHETIC_PROFILES) {
    const pipeline = runCareerDiscoveryPipeline(profile.responses);
    const result = interpretPublicCareers({ matches: pipeline.matches, talentProfile: pipeline.talentProfile, responses: profile.responses });
    for (const level of ['strong', 'moderate', 'lower'] as const) {
      for (const career of result[level]) {
        samples[level].push(career);
      }
    }
  }
  return samples;
};

describe('user-facing explanation QA', () => {
  it('provides ten traceable strong explanations', () => {
    const sample = sampleByLevel().strong.slice(0, 10);
    expect(sample).toHaveLength(10);
    for (const career of sample) {
      const alignments = career.abilityAlignment.filter(({ alignment }) => alignment === 'strong_alignment' || alignment === 'moderate_alignment');
      expect(alignments.length).toBeGreaterThanOrEqual(2);
      expect(alignments.every(({ userEvidence, relevantCareerTasks, explanation }) => userEvidence.length > 0 && relevantCareerTasks.length > 0 && explanation.includes('回答'))).toBe(true);
      expect(career.matchingReasons.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('provides ten moderate explanations with both fit and a reason it is not strong', () => {
    const sample = sampleByLevel().moderate.slice(0, 10);
    expect(sample).toHaveLength(10);
    for (const career of sample) {
      const supportedAbilities = career.abilityAlignment.filter(({ alignment }) => alignment === 'strong_alignment' || alignment === 'moderate_alignment');
      expect(career.matchingReasons.length + supportedAbilities.length).toBeGreaterThan(0);
      if (!supportedAbilities.length) expect(career.matchingReasons.length).toBeGreaterThan(0);
      expect(career.limitingReasons.length).toBeGreaterThan(0);
    }
  });

  it('provides ten lower explanations with a concrete mismatch and no deterministic inability claim', () => {
    const sample = sampleByLevel().lower.slice(0, 10);
    expect(sample).toHaveLength(10);
    for (const career of sample) {
      expect(career.limitingReasons.length).toBeGreaterThan(0);
      expect(career.limitingReasons.join('')).not.toMatch(/你不具備|你不能|做不到/);
      expect(career.abilityAlignment.filter(({ alignment }) => alignment === 'insufficient_evidence').every(({ explanation }) => explanation.includes('還沒有足夠不同情境'))).toBe(true);
    }
  });
});
