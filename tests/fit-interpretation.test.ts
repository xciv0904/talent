import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES } from '../src/data/careers';
import { interpretPublicCareers, matchCareers, runCareerDiscoveryPipeline } from '../src/engine';
import type { UserTalentProfile } from '../src/types';
import { GOLDEN_PERSONAS } from './fixtures/golden-personas';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';

describe('relative public career fit interpretation', () => {
  it('keeps original career matches and Career Fit values unchanged', () => {
    const persona = GOLDEN_PERSONAS[0];
    const matches = matchCareers(CAREER_PROFILES, persona.input);
    const snapshot = JSON.stringify(matches);
    const talentProfile: UserTalentProfile = { baseTalents: persona.input.talentScores, compositeTalents: [], generatedAt: '' };
    const result = interpretPublicCareers({ matches, talentProfile, responses: persona.responses });

    expect(JSON.stringify(matches)).toBe(snapshot);
    expect(result.all.flatMap(({ underlyingMatches }) => underlyingMatches)).toHaveLength(60);
    for (const match of matches) {
      const nested = result.all.flatMap(({ underlyingMatches }) => underlyingMatches).find(({ careerId }) => careerId === match.careerId);
      expect(nested?.matchScore).toBe(match.matchScore);
    }
  });

  it('requires relative rank, supported abilities, confidence, and acceptable risks for strong', () => {
    for (const profile of SYNTHETIC_PROFILES) {
      const pipeline = runCareerDiscoveryPipeline(profile.responses);
      const result = interpretPublicCareers({ matches: pipeline.matches, talentProfile: pipeline.talentProfile, responses: profile.responses });
      for (const career of result.strong) {
        expect(career.relativePercentile).toBeGreaterThanOrEqual(0.75);
        expect(career.fitSeparation).toBeGreaterThanOrEqual(0.015);
        expect(career.confidence).not.toBe('low');
        expect(career.environmentFriction).not.toBe('high');
        expect(career.energyRisk).not.toBe('high');
        expect(career.positiveEvidenceGate.passed).toBe(true);
        expect(career.abilityAlignment.filter(({ alignment }) => alignment === 'exceeds_requirement' || alignment === 'meets_requirement').length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('only assigns lower when a bottom-relative result has an explicit evidenced mismatch', () => {
    for (const profile of SYNTHETIC_PROFILES) {
      const pipeline = runCareerDiscoveryPipeline(profile.responses);
      const result = interpretPublicCareers({ matches: pipeline.matches, talentProfile: pipeline.talentProfile, responses: profile.responses });
      for (const career of result.lower) {
        const weakCount = career.abilityAlignment.filter(({ alignment }) => alignment === 'significant_gap').length;
        expect(career.relativePercentile).toBeLessThanOrEqual(0.3);
        expect(career.environmentFriction === 'high' || career.energyRisk === 'high' || weakCount >= 2 || (career.interestAlignment < 0.38 && career.workStyleAlignment < 0.5)).toBe(true);
        expect(career.limitingReasons.length).toBeGreaterThan(0);
      }
    }
  });

  it('does not convert insufficient evidence into weak ability or mismatch', () => {
    const persona = GOLDEN_PERSONAS[0];
    const unknownProfile: UserTalentProfile = {
      baseTalents: persona.input.talentScores.map((talent) => ({
        ...talent,
        score: 0.1,
        status: 'insufficient_evidence',
        confidence: { ...talent.confidence, level: 'low', evidenceCount: 1, questionCoverage: 0.2 },
        evidence: [],
      })),
      compositeTalents: [],
      generatedAt: '',
    };
    const matches = matchCareers(CAREER_PROFILES, { ...persona.input, talentScores: unknownProfile.baseTalents });
    const result = interpretPublicCareers({ matches, talentProfile: unknownProfile, responses: [] });
    expect(result.all.flatMap(({ abilityAlignment }) => abilityAlignment).every(({ alignment }) => alignment === 'unknown')).toBe(true);
    expect(result.lower).toHaveLength(0);
  });

  it('treats energy drain as a risk without changing ability alignment', () => {
    const persona = GOLDEN_PERSONAS.find(({ id }) => id === 'empathy_communicator')!;
    const talentProfile: UserTalentProfile = { baseTalents: persona.input.talentScores, compositeTalents: [], generatedAt: '' };
    const matches = matchCareers(CAREER_PROFILES, persona.input);
    const baseline = interpretPublicCareers({ matches, talentProfile, responses: persona.responses });
    const candidate = baseline.strong[0] ?? baseline.all[0];
    const demanded = candidate.abilityAlignment.slice(0, 2).map(({ talentId }) => talentId);
    const drainedTalents = talentProfile.baseTalents.map((talent) => demanded.includes(talent.talentId) ? { ...talent, energyScore: -0.9 } : talent);
    const drainedProfile: UserTalentProfile = { ...talentProfile, baseTalents: drainedTalents };
    const drainedMatches = matchCareers(CAREER_PROFILES, { ...persona.input, talentScores: drainedTalents });
    const drained = interpretPublicCareers({ matches: drainedMatches, talentProfile: drainedProfile, responses: persona.responses });
    const updated = drained.all.find(({ publicCareerId }) => publicCareerId === candidate.publicCareerId)!;

    expect(updated.energyRisk).toBe('high');
    expect(updated.classification).not.toBe('strong');
    expect(updated.abilityAlignment.filter(({ talentId }) => demanded.includes(talentId)).some(({ alignment }) => alignment === 'exceeds_requirement' || alignment === 'meets_requirement')).toBe(true);
    expect(updated.limitingReasons.some((reason) => reason.includes('做得到') && reason.includes('能量'))).toBe(true);
  });

  it('runs all existing Golden Personas through the public layer without altering their original ranking', () => {
    for (const persona of GOLDEN_PERSONAS) {
      const before = matchCareers(CAREER_PROFILES, persona.input);
      const topFive = before.slice(0, 5).map(({ careerId }) => careerId);
      const talentProfile: UserTalentProfile = { baseTalents: persona.input.talentScores, compositeTalents: [], generatedAt: '' };
      const publicResult = interpretPublicCareers({ matches: before, talentProfile, responses: persona.responses });
      expect(publicResult.all).toHaveLength(33);
      expect(matchCareers(CAREER_PROFILES, persona.input).slice(0, 5).map(({ careerId }) => careerId)).toEqual(topFive);
    }
  });
});
