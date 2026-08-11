import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES } from '../src/data/careers';
import {
  decideRecommendation,
  evaluatePositiveEvidenceGate,
  interpretPublicCareers,
  interpretSpecificCareer,
  matchCareers,
  runCareerDiscoveryPipeline,
} from '../src/engine';
import type { AbilityAlignment, UserTalentProfile } from '../src/types';
import { GOLDEN_PERSONAS } from './fixtures/golden-personas';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';

const alignment = (
  state: AbilityAlignment['alignment'],
  importance: AbilityAlignment['importance'],
  talentId: AbilityAlignment['talentId'],
): AbilityAlignment => ({
  talentId,
  talentName: talentId,
  userEvidence: state === 'unknown' ? [] : [{ id: `e_${talentId}`, source: 'question', talentId, description: '實際作答證據', strength: 0.8 }],
  userSignalLevel: state === 'unknown' ? 'insufficient_evidence' : state === 'significant_gap' ? 'low' : 'high',
  userAbilityScore: 0.8,
  demandCapabilityScore: 0.8,
  relativeTalentPercentile: 0.9,
  careerDemand: 0.8,
  importance,
  relevantCareerTasks: ['完成核心工作任務'],
  alignment: state,
  explanation: '測試說明',
});

const supported = [
  alignment('exceeds_requirement', 'core', 'analytical_reasoning'),
  alignment('meets_requirement', 'supporting', 'pattern_recognition'),
];

describe('positive evidence gate and recommendation consistency', () => {
  it('Case A: rank #1 with zero positive talent evidence is never very suitable', () => {
    const unknown = [
      alignment('unknown', 'core', 'analytical_reasoning'),
      alignment('unknown', 'supporting', 'pattern_recognition'),
    ];
    const gate = evaluatePositiveEvidenceGate(unknown, 'high', 'low', 'low');
    const decision = decideRecommendation({ relativePercentile: 1, fitSeparation: 0.2, evidenceGate: gate, interestAlignment: 0.8, workStyleAlignment: 0.8, environmentFriction: 'low', energyRisk: 'low', explicitMismatch: false });
    expect(gate.positiveAlignmentCount).toBe(0);
    expect(gate.passed).toBe(false);
    expect(decision.classification).not.toBe('strong');
    expect(decision.recommendationStrength).toBe('exploratory');
  });

  it('Case B: rank #3 with multiple supported talents and low friction can be very suitable', () => {
    const gate = evaluatePositiveEvidenceGate(supported, 'high', 'low', 'low');
    const decision = decideRecommendation({ relativePercentile: 0.95, fitSeparation: 0.08, evidenceGate: gate, interestAlignment: 0.55, workStyleAlignment: 0.65, environmentFriction: 'low', energyRisk: 'low', explicitMismatch: false });
    expect(gate.passed).toBe(true);
    expect(decision.classification).toBe('strong');
    expect(decision.recommendationStrength).toBe('strong_recommendation');
  });

  it('Case C: high interest with insufficient ability evidence remains exploratory', () => {
    const gate = evaluatePositiveEvidenceGate([
      alignment('unknown', 'core', 'creative_ideation'),
      alignment('unknown', 'supporting', 'verbal_reasoning'),
    ], 'low', 'low', 'low');
    const decision = decideRecommendation({ relativePercentile: 0.98, fitSeparation: 0.1, evidenceGate: gate, interestAlignment: 0.92, workStyleAlignment: 0.6, environmentFriction: 'low', energyRisk: 'low', explicitMismatch: false });
    expect(decision.classification).toBe('moderate');
    expect(decision.recommendationStrength).toBe('exploratory');
    expect(decision.recommendationSource).toBe('interest_led');
  });

  it('Case D: ability support with high energy drain cannot be very suitable', () => {
    const gate = evaluatePositiveEvidenceGate(supported, 'high', 'low', 'high');
    const decision = decideRecommendation({ relativePercentile: 1, fitSeparation: 0.2, evidenceGate: gate, interestAlignment: 0.8, workStyleAlignment: 0.8, environmentFriction: 'low', energyRisk: 'high', explicitMismatch: true });
    expect(gate.passed).toBe(false);
    expect(gate.reasons.join('')).toContain('能量');
    expect(decision.classification).not.toBe('strong');
  });

  it('Case E: strong talent evidence, moderate interest, and supportive environment can pass', () => {
    const gate = evaluatePositiveEvidenceGate(supported, 'high', 'low', 'low');
    const decision = decideRecommendation({ relativePercentile: 0.9, fitSeparation: 0.05, evidenceGate: gate, interestAlignment: 0.5, workStyleAlignment: 0.62, environmentFriction: 'low', energyRisk: 'low', explicitMismatch: false });
    expect(decision.classification).toBe('strong');
    expect(['ability_led', 'mixed']).toContain(decision.recommendationSource);
  });

  it('audits every very-suitable public result and its linked representative detail', () => {
    let audited = 0;
    for (const profile of SYNTHETIC_PROFILES) {
      const pipeline = runCareerDiscoveryPipeline(profile.responses);
      const publicResults = interpretPublicCareers({ matches: pipeline.matches, talentProfile: pipeline.talentProfile, responses: profile.responses });
      for (const result of publicResults.strong) {
        audited += 1;
        expect(result.positiveEvidenceGate.passed).toBe(true);
        expect(result.positiveEvidenceGate.positiveAlignmentCount).toBeGreaterThanOrEqual(2);
        expect(result.positiveEvidenceGate.corePositiveAlignmentCount).toBeGreaterThanOrEqual(1);
        const detail = interpretSpecificCareer({ careerId: result.representativeCareerId, matches: pipeline.matches, talentProfile: pipeline.talentProfile, responses: profile.responses });
        expect(detail.positiveEvidenceGate.passed).toBe(true);
        expect(detail.recommendationStrength).toBe('strong_recommendation');
      }
    }
    for (const persona of GOLDEN_PERSONAS) {
      const matches = matchCareers(CAREER_PROFILES, persona.input);
      const talentProfile: UserTalentProfile = { baseTalents: persona.input.talentScores, compositeTalents: [], generatedAt: '' };
      const publicResults = interpretPublicCareers({ matches, talentProfile, responses: persona.responses });
      for (const result of publicResults.strong) {
        audited += 1;
        expect(result.positiveEvidenceGate.passed).toBe(true);
        const detail = interpretSpecificCareer({ careerId: result.representativeCareerId, matches, talentProfile, responses: persona.responses });
        expect(detail.positiveEvidenceGate.passed).toBe(true);
        expect(detail.recommendationStrength).toBe('strong_recommendation');
      }
    }
    expect(audited).toBeGreaterThan(0);
  });

  it('Content Strategist explanation uses its actual components and cannot hide zero positive evidence', () => {
    for (const profile of SYNTHETIC_PROFILES) {
      const pipeline = runCareerDiscoveryPipeline(profile.responses);
      const detail = interpretSpecificCareer({ careerId: 'content_strategist', matches: pipeline.matches, talentProfile: pipeline.talentProfile, responses: profile.responses });
      const original = pipeline.matches.find(({ careerId }) => careerId === 'content_strategist')!;
      expect(detail.componentScores.talent).toBe(original.talentMatch);
      expect(detail.componentScores.interest).toBe(original.interestMatch);
      expect(detail.componentScores.environmentPenalty).toBe(1 - original.environmentMatch);
      if (detail.positiveEvidenceGate.positiveAlignmentCount === 0) {
        expect(detail.recommendationStrength).not.toBe('strong_recommendation');
        expect(detail.recommendationSource).not.toBe('ability_led');
      }
    }
  });
});
