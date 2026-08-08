import { describe, expect, it } from 'vitest';
import { QUICK_DISCOVERY_QUESTIONS } from '../src/data/questions';
import { runCareerDiscoveryPipeline } from '../src/engine';
import { ENVIRONMENT_DIMENSIONS, INTEREST_DIMENSIONS, VALUE_DIMENSIONS, WORK_STYLE_DIMENSIONS } from '../src/types';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';

const completeProfiles = SYNTHETIC_PROFILES.slice(0, 5).map((profile, index) =>
  runCareerDiscoveryPipeline(profile.responses, {
    education: index % 2 === 0 ? 'bachelor' : 'certificate',
    yearsExperience: index,
    hasPortfolio: index % 2 === 0,
    languages: ['English'],
    consideredFamilies: [],
  }),
);

describe('Assessment → Talent → Career Match integration', () => {
  it('runs five complete raw answer sets through every layer', () => {
    expect(completeProfiles).toHaveLength(5);
    for (const result of completeProfiles) {
      expect(result.rawAnswers).toHaveLength(QUICK_DISCOVERY_QUESTIONS.length);
      expect(result.assessment.observations.length).toBeGreaterThan(0);
      expect(result.talentProfile.baseTalents).toHaveLength(20);
      expect(result.talentProfile.compositeTalents).toHaveLength(12);
      expect(Object.keys(result.profiles.interestProfile).sort()).toEqual([...INTEREST_DIMENSIONS].sort());
      expect(Object.keys(result.profiles.workStyle).sort()).toEqual([...WORK_STYLE_DIMENSIONS].sort());
      expect(Object.keys(result.profiles.environmentTolerance).sort()).toEqual([...ENVIRONMENT_DIMENSIONS].sort());
      expect(Object.keys(result.profiles.valuesProfile).sort()).toEqual([...VALUE_DIMENSIONS].sort());
      expect(Object.values(result.profiles.coverage)).toEqual([1, 1, 1, 1]);
      expect(result.matches).toHaveLength(60);
      expect(result.matches.every((match) => Number.isFinite(match.matchScore))).toBe(true);
      expect(Object.keys(result.categories).sort()).toEqual(
        ['best_fit', 'easier_transition', 'high_potential', 'surprise_me'].sort(),
      );
    }
  });

  it('traces at least ten recommendation reasons to exact raw answers', () => {
    const cases = completeProfiles.flatMap((pipeline) =>
      pipeline.matches.slice(0, 10).flatMap((match) =>
        match.talentReasonDetails.flatMap((reason) =>
          reason.evidenceIds.map((evidenceId) => ({ pipeline, match, reason, evidenceId })),
        ),
      ),
    );
    expect(cases.length).toBeGreaterThanOrEqual(10);

    for (const { pipeline, match, reason, evidenceId } of cases.slice(0, 10)) {
      const talent = pipeline.talentProfile.baseTalents.find((item) => item.talentId === reason.talentId)!;
      const evidence = talent.evidence.find((item) => item.id === evidenceId)!;
      const question = QUICK_DISCOVERY_QUESTIONS.find((item) => item.id === evidence.questionId)!;
      const answer = pipeline.rawAnswers.find((item) => item.questionId === evidence.questionId)!;

      expect(match.supportingEvidenceIds).toContain(evidenceId);
      expect(evidence.talentId).toBe(reason.talentId);
      expect(question).toBeDefined();
      expect(answer.selectedOptionIds).toContain(evidence.optionId);
      expect(evidence.id).not.toBe(reason.talentId);
    }
  });

  it('handles missing answers and profiles without NaN or inflated confidence', () => {
    const partialAnswers = SYNTHETIC_PROFILES[0].responses.filter(({ questionId }) => questionId.startsWith('SJT')).slice(0, 3);
    const partial = runCareerDiscoveryPipeline(partialAnswers);
    const complete = completeProfiles[0];

    expect(partial.profiles.coverage).toEqual({ interest: 0, workStyle: 0, environment: 0, values: 0 });
    expect(partial.talentProfile.baseTalents.every(({ energyScore }) => energyScore === null)).toBe(true);
    expect(partial.talentProfile.baseTalents.every(({ confidence }) => confidence.level === 'low')).toBe(true);
    expect(partial.matches.every(({ matchScore }) => Number.isFinite(matchScore))).toBe(true);
    expect(Math.max(...partial.matches.map(({ matchScore }) => matchScore))).toBeLessThan(
      Math.max(...complete.matches.map(({ matchScore }) => matchScore)),
    );
    expect(partial.matches.every(({ confidence }) => confidence === 'low')).toBe(true);
  });
});
