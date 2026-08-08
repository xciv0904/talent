import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES } from '../src/data/careers';
import { CAREER_MATCH_WEIGHTS, matchCareer, matchCareers } from '../src/engine';
import { ENVIRONMENT_DIMENSIONS, type EnvironmentDimension } from '../src/types';
import { GOLDEN_PERSONAS } from './fixtures/golden-personas';

const cases: Array<{ label: string; dimension: EnvironmentDimension; careerId: string; personaId: string }> = [
  { label: 'A', dimension: 'socialDensity', careerId: 'guest_experience_manager', personaId: 'empathy_communicator' },
  { label: 'B', dimension: 'emotionalLabor', careerId: 'career_coach', personaId: 'teacher' },
  { label: 'C', dimension: 'ambiguity', careerId: 'management_consultant', personaId: 'ambiguity_structurer' },
  { label: 'D', dimension: 'mobility', careerId: 'event_operations_coordinator', personaId: 'adaptable' },
  { label: 'E', dimension: 'pace', careerId: 'growth_marketer', personaId: 'adaptable' },
];

const symmetricEnvironmentScore = (
  tolerance: Record<EnvironmentDimension, number>,
  demand: Record<EnvironmentDimension, number>,
) => 1 - ENVIRONMENT_DIMENSIONS.reduce((sum, dimension) => sum + Math.abs(tolerance[dimension] - demand[dimension]), 0) / ENVIRONMENT_DIMENSIONS.length;

describe('environment penalty stress', () => {
  it('changes scores and rankings without zeroing an otherwise strong fit', () => {
    const results = cases.map((item) => {
      const career = CAREER_PROFILES.find(({ id }) => id === item.careerId)!;
      const base = GOLDEN_PERSONAS.find(({ id }) => id === item.personaId)!.input;
      const isolatedTolerance = { ...career.environmentProfile, [item.dimension]: 0.05 };
      const user = { ...base, environmentTolerance: isolatedTolerance };
      const penaltyOn = matchCareer(career, user);
      const allOn = matchCareers(CAREER_PROFILES, user);
      const allOff = allOn.map((match) => {
        const profile = CAREER_PROFILES.find(({ id }) => id === match.careerId)!;
        const offEnvironment = symmetricEnvironmentScore(user.environmentTolerance, profile.environmentProfile);
        return {
          careerId: match.careerId,
          matchScore: match.matchScore + (offEnvironment - match.environmentMatch) * CAREER_MATCH_WEIGHTS.environment,
        };
      }).sort((a, b) => b.matchScore - a.matchScore);
      const offEnvironment = symmetricEnvironmentScore(user.environmentTolerance, career.environmentProfile);
      const offScore = penaltyOn.matchScore + (offEnvironment - penaltyOn.environmentMatch) * CAREER_MATCH_WEIGHTS.environment;
      const onRank = new Map(allOn.map(({ careerId }, index) => [careerId, index + 1]));
      return {
        case: item.label,
        dimension: item.dimension,
        careerId: item.careerId,
        demand: career.environmentProfile[item.dimension],
        tolerance: isolatedTolerance[item.dimension],
        rankOff: allOff.findIndex(({ careerId }) => careerId === item.careerId) + 1,
        rankOn: allOn.findIndex(({ careerId }) => careerId === item.careerId) + 1,
        careersChangingRank: allOff.filter(({ careerId }, index) => onRank.get(careerId) !== index + 1).length,
        scoreOff: offScore,
        scoreOn: penaltyOn.matchScore,
      };
    });

    if ((globalThis as { process?: { env?: Record<string, string> } }).process?.env?.REPORT_RELEASE === '1') {
      console.info(`ENVIRONMENT:${JSON.stringify(results)}`);
    }
    for (const result of results) {
      expect(result.demand - result.tolerance, result.dimension).toBeGreaterThan(0.55);
      expect(result.scoreOff - result.scoreOn, result.dimension).toBeGreaterThan(0.015);
      expect(result.rankOn, result.dimension).toBeGreaterThanOrEqual(result.rankOff);
      expect(result.careersChangingRank, result.dimension).toBeGreaterThan(0);
      expect(result.scoreOn, result.dimension).toBeGreaterThan(0.4);
    }
    expect(results.some(({ rankOn, rankOff }) => rankOn > rankOff)).toBe(true);
  });
});
