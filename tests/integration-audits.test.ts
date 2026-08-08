import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES } from '../src/data/careers';
import { categorizeCareerResults, matchCareers, runCareerDiscoveryPipeline } from '../src/engine';
import { nearestCareerPairs, summarizeDistribution } from '../src/utils';
import { GOLDEN_PERSONAS } from './fixtures/golden-personas';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';

const rawPipelines = SYNTHETIC_PROFILES.slice(0, 5).map((profile) => runCareerDiscoveryPipeline(profile.responses));
const auditInputs = [
  ...GOLDEN_PERSONAS.map((persona) => ({ id: persona.id, input: persona.input })),
  ...rawPipelines.map((pipeline, index) => ({ id: `raw_${index + 1}`, input: pipeline.matchInput })),
];
const report = (label: string, value: unknown) => {
  const enabled = (globalThis as { process?: { env?: Record<string, string> } }).process?.env?.REPORT_INTEGRATION;
  if (enabled === '1') console.info(`${label}: ${JSON.stringify(value)}`);
};

describe('integration audits', () => {
  it('compares Surprise Match thresholds across 17 profiles', () => {
    const results = [0.6, 0.65, 0.7, 0.75].map((threshold) => {
      const surprises = auditInputs.flatMap(({ input }) =>
        categorizeCareerResults(matchCareers(CAREER_PROFILES, input), input, 4, threshold).surprise_me,
      );
      return {
        threshold,
        count: surprises.length,
        averageFit: surprises.length === 0 ? 0 : surprises.reduce((sum, item) => sum + item.matchScore, 0) / surprises.length,
        familyDiversity: new Set(surprises.map(({ family }) => family)).size,
      };
    });
    report('surprise', results);
    expect(results[0].count).toBeGreaterThanOrEqual(results[1].count);
    expect(results[1].count).toBeGreaterThanOrEqual(results[2].count);
    expect(results[2].count).toBeGreaterThanOrEqual(results[3].count);
  });

  it('reports score distribution and separation for all 1,020 matches', () => {
    const summaries = auditInputs.map(({ id, input }) => {
      const scores = matchCareers(CAREER_PROFILES, input).map(({ matchScore }) => matchScore);
      return {
        id,
        top1: scores[0],
        top5Average: scores.slice(0, 5).reduce((sum, value) => sum + value, 0) / 5,
        top10Average: scores.slice(0, 10).reduce((sum, value) => sum + value, 0) / 10,
        bottom10Average: scores.slice(-10).reduce((sum, value) => sum + value, 0) / 10,
      };
    });
    const allScores = auditInputs.flatMap(({ input }) =>
      matchCareers(CAREER_PROFILES, input).map(({ matchScore }) => matchScore),
    );
    const distribution = summarizeDistribution(allScores);
    report('distribution', distribution);
    report('separation', summaries);
    expect(allScores).toHaveLength(1020);
    expect(distribution.max - distribution.min).toBeGreaterThan(0.25);
    expect(summaries.every((item) => item.top5Average > item.bottom10Average)).toBe(true);
  });

  it('lists the twenty nearest career pairs with component similarities', () => {
    const pairs = nearestCareerPairs(CAREER_PROFILES, 20);
    report('neighbors', pairs);
    expect(pairs).toHaveLength(20);
    expect(pairs[0].overallSimilarity).toBeGreaterThanOrEqual(pairs[19].overallSimilarity);
    expect(pairs.every((pair) => pair.first !== pair.second)).toBe(true);
    const families = new Set(CAREER_PROFILES.map(({ family }) => family));
    for (const family of families) {
      const familyCareers = CAREER_PROFILES.filter((career) => career.family === family);
      const familyPairs = nearestCareerPairs(familyCareers, 3);
      expect(familyCareers).toHaveLength(3);
      expect(familyPairs).toHaveLength(3);
      expect(familyPairs[0].overallSimilarity).toBeLessThan(0.98);
    }
  });
});
