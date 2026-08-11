import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES } from '../../src/data/careers';
import { QUICK_DISCOVERY_QUESTIONS } from '../../src/data/questions';
import { categorizeCareerResults, matchCareers, runCareerDiscoveryPipeline } from '../../src/engine';
import type { CareerDiscoveryPipelineResult } from '../../src/engine';
import type { CandidateBackground } from '../../src/types';
import { GOLDEN_PERSONAS } from '../fixtures/golden-personas';
import { SYNTHETIC_PROFILES, makeResponses } from '../fixtures/synthetic-profiles';

const report = (label: string, value: unknown) => {
  const enabled = (globalThis as { process?: { env?: Record<string, string> } }).process?.env?.REPORT_RELEASE;
  if (enabled === '1') console.info(`${label}:${JSON.stringify(value)}`);
};

const backgroundForGolden = (index: number): CandidateBackground => {
  const input = GOLDEN_PERSONAS[index].input;
  return {
    transferableSkills: input.transferableSkills,
    education: input.education,
    yearsExperience: input.yearsExperience,
    certifications: input.certifications,
    hasPortfolio: input.hasPortfolio,
    languages: input.languages,
    professionalLicenses: input.professionalLicenses,
    consideredCareerIds: input.consideredCareerIds,
    consideredFamilies: input.consideredFamilies,
  };
};

const goldenPipelines = GOLDEN_PERSONAS.map((persona, index) =>
  runCareerDiscoveryPipeline(persona.responses, backgroundForGolden(index)),
);
const syntheticPipelines = SYNTHETIC_PROFILES.map((profile, index) =>
  runCareerDiscoveryPipeline(profile.responses, {
    education: index % 4 === 0 ? 'bachelor' : index % 4 === 1 ? 'certificate' : index % 4 === 2 ? 'secondary' : 'none',
    yearsExperience: index % 5,
    hasPortfolio: index % 3 === 0,
    languages: index % 2 === 0 ? ['English'] : [],
  }),
);

const quantile = (sorted: readonly number[], probability: number) => {
  const index = (sorted.length - 1) * probability;
  const lower = Math.floor(index);
  const fraction = index - lower;
  return sorted[lower] + ((sorted[lower + 1] ?? sorted[lower]) - sorted[lower]) * fraction;
};

const summary = (values: readonly number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    min: sorted[0], p10: quantile(sorted, 0.1), p25: quantile(sorted, 0.25), median: quantile(sorted, 0.5),
    mean: sorted.reduce((sum, value) => sum + value, 0) / sorted.length,
    p75: quantile(sorted, 0.75), p90: quantile(sorted, 0.9), max: sorted.at(-1)!,
  };
};

const rankingSummary = (pipeline: CareerDiscoveryPipelineResult, id: string) => {
  const scores = pipeline.matches.map(({ matchScore }) => matchScore);
  const average = (items: readonly number[]) => items.reduce((sum, value) => sum + value, 0) / items.length;
  return {
    id,
    top1: scores[0], top5Average: average(scores.slice(0, 5)), top10Average: average(scores.slice(0, 10)),
    median: quantile([...scores].sort((a, b) => a - b), 0.5), bottom10Average: average(scores.slice(-10)),
  };
};

describe('release raw-answer end-to-end regression', () => {
  it('keeps at least twenty deterministic full raw-answer profiles through every layer', () => {
    expect(SYNTHETIC_PROFILES.length).toBeGreaterThanOrEqual(20);
    for (const [index, pipeline] of syntheticPipelines.entries()) {
      expect(pipeline.rawAnswers, SYNTHETIC_PROFILES[index].id).toHaveLength(QUICK_DISCOVERY_QUESTIONS.length);
      expect(pipeline.assessment.answeredQuestionIds).toHaveLength(35);
      expect(pipeline.assessment.observations.length).toBeGreaterThan(0);
      expect(pipeline.talentProfile.baseTalents).toHaveLength(20);
      expect(pipeline.talentProfile.compositeTalents).toHaveLength(12);
      expect(Object.values(pipeline.profiles.coverage)).toEqual([1, 1, 1, 1]);
      expect(pipeline.matches).toHaveLength(60);
      expect(pipeline.matches.every(({ matchScore }) => Number.isFinite(matchScore))).toBe(true);
      expect(pipeline.matches.some(({ talentReasonDetails }) => talentReasonDetails.length > 0)).toBe(true);
      expect(Object.values(pipeline.categories).flat().every(({ careerId }) => CAREER_PROFILES.some(({ id }) => id === careerId))).toBe(true);
    }
  });

  it('uses raw answers for all twelve Golden Personas in release distribution', () => {
    expect(goldenPipelines).toHaveLength(12);
    expect(goldenPipelines.every(({ rawAnswers }) => rawAnswers.length === 35)).toBe(true);
    expect(goldenPipelines.every(({ matches }) => matches.length === 60)).toBe(true);
  });

  it('reports final surprise-threshold comparison over 22 raw profiles', () => {
    const profiles = [
      ...goldenPipelines.map((pipeline, index) => ({ id: GOLDEN_PERSONAS[index].id, pipeline })),
      ...syntheticPipelines.slice(0, 10).map((pipeline, index) => ({ id: SYNTHETIC_PROFILES[index].id, pipeline })),
    ];
    const results = [0.6, 0.65, 0.7, 0.75].map((threshold) => {
      let profilesWithResults = 0;
      const surprises: ReturnType<typeof matchCareers> = [];
      const conceptualOverlaps: number[] = [];
      const examples: Array<{ profile: string; best: string[]; surprise: string[] }> = [];
      for (const { id, pipeline } of profiles) {
        const categories = categorizeCareerResults(pipeline.matches, pipeline.matchInput, 4, threshold);
        if (categories.surprise_me.length > 0) profilesWithResults += 1;
        if (categories.surprise_me.length > 0) examples.push({
          profile: id,
          best: categories.best_fit.map(({ careerId }) => careerId),
          surprise: categories.surprise_me.map(({ careerId }) => careerId),
        });
        surprises.push(...categories.surprise_me);
        const bestTalentIds = new Set(categories.best_fit.flatMap(({ careerId }) => Object.keys(CAREER_PROFILES.find(({ id }) => id === careerId)!.talentRequirements)));
        for (const surprise of categories.surprise_me) {
          const ids = Object.keys(CAREER_PROFILES.find(({ id }) => id === surprise.careerId)!.talentRequirements);
          conceptualOverlaps.push(ids.filter((id) => bestTalentIds.has(id)).length / Math.max(1, new Set([...bestTalentIds, ...ids]).size));
        }
      }
      return {
        threshold,
        profileRatio: profilesWithResults / profiles.length,
        count: surprises.length,
        averageMatch: surprises.length ? surprises.reduce((sum, item) => sum + item.matchScore, 0) / surprises.length : 0,
        minimumMatch: surprises.length ? Math.min(...surprises.map(({ matchScore }) => matchScore)) : null,
        familyDiversity: new Set(surprises.map(({ family }) => family)).size,
        conceptualOverlap: conceptualOverlaps.length ? conceptualOverlaps.reduce((sum, value) => sum + value, 0) / conceptualOverlaps.length : 0,
        examples,
      };
    });
    report('SURPRISE', results);
    expect(results[0].count).toBeGreaterThanOrEqual(results[1].count);
    expect(results[1].count).toBeGreaterThanOrEqual(results[2].count);
    expect(results[2].count).toBeGreaterThanOrEqual(results[3].count);
    expect(results.find(({ threshold }) => threshold === 0.6)!.count).toBeGreaterThan(0);
    for (const result of results) {
      if (result.minimumMatch !== null) expect(result.minimumMatch).toBeGreaterThanOrEqual(result.threshold);
    }
  });

  it('reports score distribution and rank separation over 32 raw profiles and 1,920 matches', () => {
    const pipelines = [...goldenPipelines, ...syntheticPipelines.slice(0, 20)];
    const allScores = pipelines.flatMap(({ matches }) => matches.map(({ matchScore }) => matchScore));
    const distribution = summary(allScores);
    const rankings = pipelines.map((pipeline, index) => rankingSummary(pipeline, index < 12 ? GOLDEN_PERSONAS[index].id : SYNTHETIC_PROFILES[index - 12].id));
    const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
    const separation = {
      top1VsTop5: average(rankings.map((item) => item.top1 - item.top5Average)),
      top5VsMedian: average(rankings.map((item) => item.top5Average - item.median)),
      top10VsBottom10: average(rankings.map((item) => item.top10Average - item.bottom10Average)),
    };
    report('DISTRIBUTION', { count: allScores.length, ...distribution });
    report('RANKINGS', rankings);
    report('SEPARATION', separation);
    expect(allScores).toHaveLength(1920);
    expect(distribution.max).toBeLessThan(0.9);
    expect(distribution.p90 - distribution.p10).toBeGreaterThan(0.18);
    expect(separation.top5VsMedian).toBeGreaterThan(0.04);
    expect(separation.top10VsBottom10).toBeGreaterThan(0.15);
  });

  it('calibrates confidence from partial, contradictory, and consistent evidence', () => {
    const talentId = 'communication' as const;
    const consistent = makeResponses([talentId], 300);
    const relevant = QUICK_DISCOVERY_QUESTIONS.filter((question) => question.options.some((option) => talentId in (option.talentSignals ?? {})));
    const partial = consistent.filter(({ questionId }) => questionId === relevant[0].id);
    const contradictory = consistent.map((answer) => {
      const question = relevant.find(({ id }) => id === answer.questionId);
      if (!question || (question.type !== 'situational_choice' && question.type !== 'evidence')) return answer;
      const alternative = question.options.find((option) => !(talentId in (option.talentSignals ?? {})))!;
      return { ...answer, selectedOptionIds: [alternative.id], scaleValue: question.type === 'evidence' ? 5 : undefined };
    });
    const confidenceFor = (answers: typeof consistent) => runCareerDiscoveryPipeline(answers).talentProfile.baseTalents.find(({ talentId: id }) => id === talentId)!.confidence.level;
    const levels = { partial: confidenceFor(partial), contradictory: confidenceFor(contradictory), consistent: confidenceFor(consistent) };
    report('CONFIDENCE', levels);
    expect(levels.partial).toBe('low');
    expect(['low', 'medium']).toContain(levels.contradictory);
    expect(levels.consistent).toBe('high');
  });

  it('defines independent ability signals as separate questions and decision contexts', () => {
    for (const talent of runCareerDiscoveryPipeline(SYNTHETIC_PROFILES[0].responses).talentProfile.baseTalents) {
      const questions = QUICK_DISCOVERY_QUESTIONS.filter((question) => question.options.some((option) => talent.talentId in (option.talentSignals ?? {})));
      expect(questions).toHaveLength(3);
      expect(new Set(questions.map(({ id }) => id)).size).toBe(3);
      expect(new Set(questions.map(({ type }) => type)).size).toBe(3);
      expect(new Set(questions.map(({ prompt }) => prompt)).size).toBe(3);
    }
  });
});
