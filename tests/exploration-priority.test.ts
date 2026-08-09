import { describe, expect, it } from 'vitest';
import { buildCareerDirections, buildDynamicTieBreaker, buildExplorationPriority, runCareerDiscoveryPipeline, SCORE_PROXIMITY_EPSILON } from '../src/engine';
import type { CareerDirectionId } from '../src/types';
import { GOLDEN_PERSONAS } from './fixtures/golden-personas';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';

const profiles = [...GOLDEN_PERSONAS.map(({ id, responses }) => ({ id, responses })), ...SYNTHETIC_PROFILES.map(({ id, responses }) => ({ id, responses }))];
const runs = profiles.map((profile) => ({ ...profile, pipeline: runCareerDiscoveryPipeline(profile.responses) }));
const closeProfiles = runs.map((run) => ({ ...run, directions: buildCareerDirections({ matches: run.pipeline.matches }) }))
  .filter(({ directions }) => directions.length >= 3 && directions[0].averageFit - directions[1].averageFit <= SCORE_PROXIMITY_EPSILON)
  .slice(0, 10);

describe('Exploration Priority and close-score regression', () => {
  it('provides at least ten deterministic close-score profiles', () => {
    expect(closeProfiles).toHaveLength(10);
    expect(closeProfiles.every(({ directions }) => directions[0].averageFit - directions[1].averageFit <= SCORE_PROXIMITY_EPSILON)).toBe(true);
  });

  it('shows only three directions and activates a tie-breaker for all close profiles', () => {
    for (const { directions, pipeline } of closeProfiles) {
      const result = buildExplorationPriority({ directions, matches: pipeline.matches, talentProfile: pipeline.talentProfile });
      expect(result.directions).toHaveLength(3);
      expect(result.requiresTieBreaker).toBe(true);
      expect(result.decisionClarity).toBe('ambiguous');
      expect(result.directions.filter(({ proximityCluster }) => proximityCluster === 0).length).toBeGreaterThan(1);
      expect(result.interpretation).toContain('沒有出現非常集中的單一方向');
    }
  });

  it('selects questions from the largest discriminating dimensions', () => {
    const dimensions = new Set<string>();
    for (const { directions, pipeline } of closeProfiles) {
      const initial = buildExplorationPriority({ directions, matches: pipeline.matches, talentProfile: pipeline.talentProfile });
      const tied = initial.directions.filter(({ id }) => initial.tiedDirectionIds.includes(id));
      const prompts = buildDynamicTieBreaker(tied);
      expect(prompts).toHaveLength(3);
      expect(prompts.filter(({ kind }) => kind === 'preference')).toHaveLength(2);
      expect(prompts.filter(({ kind }) => kind === 'elimination')).toHaveLength(1);
      prompts.forEach(({ dimension }) => dimensions.add(dimension));
    }
    expect(dimensions.size).toBeGreaterThan(3);
  });

  it('narrows exploration order without producing fake certainty', () => {
    for (const { directions, pipeline } of closeProfiles) {
      const initial = buildExplorationPriority({ directions, matches: pipeline.matches, talentProfile: pipeline.talentProfile });
      const tied = initial.directions.filter(({ id }) => initial.tiedDirectionIds.includes(id));
      const prompts = buildDynamicTieBreaker(tied);
      const answers = Object.fromEntries(prompts.map((prompt) => [prompt.id, prompt.kind === 'elimination' ? prompt.options.at(-1)!.directionId : prompt.options[0].directionId])) as Record<string, CareerDirectionId>;
      const result = buildExplorationPriority({ directions, matches: pipeline.matches, talentProfile: pipeline.talentProfile, tieBreakerAnswers: answers });
      expect(result.decisionClarity).toBe('moderate');
      expect(result.directions.filter(({ explorationPriority }) => explorationPriority === 'priority')).toHaveLength(1);
      expect(result.directions.some(({ explorationPriority }) => explorationPriority === 'equally_worth')).toBe(true);
    }
  });

  it('keeps two directions available when tie-breaker preferences conflict', () => {
    for (const { directions, pipeline } of closeProfiles) {
      const initial = buildExplorationPriority({ directions, matches: pipeline.matches, talentProfile: pipeline.talentProfile });
      const tied = initial.directions.filter(({ id }) => initial.tiedDirectionIds.includes(id));
      const prompts = buildDynamicTieBreaker(tied);
      const answers = {
        [prompts[0].id]: prompts[0].options[0].directionId,
        [prompts[1].id]: prompts[1].options[1].directionId,
        [prompts[2].id]: prompts[2].options[1].directionId,
      } as Record<string, CareerDirectionId>;
      const result = buildExplorationPriority({ directions, matches: pipeline.matches, talentProfile: pipeline.talentProfile, tieBreakerAnswers: answers });
      expect(result.decisionClarity).toBe('ambiguous');
      expect(result.directions.filter(({ explorationPriority }) => explorationPriority === 'priority')).toHaveLength(0);
      expect(result.directions.filter(({ explorationPriority }) => explorationPriority === 'equally_worth').length).toBeGreaterThanOrEqual(2);
    }
  });

  it('can produce a clear direction when separation, confidence, and evidence agree', () => {
    const clear = runs.map(({ pipeline }) => {
      const directions = buildCareerDirections({ matches: pipeline.matches });
      return buildExplorationPriority({ directions, matches: pipeline.matches, talentProfile: pipeline.talentProfile });
    }).find(({ decisionClarity }) => decisionClarity === 'clear');
    expect(clear).toBeDefined();
    expect(clear!.directions.filter(({ explorationPriority }) => explorationPriority === 'priority')).toHaveLength(1);
    expect(clear!.requiresTieBreaker).toBe(false);
  });

  it('does not mutate Career Fit, Base Talent, RIASEC, or Confidence', () => {
    const { directions, pipeline } = closeProfiles[0];
    const before = JSON.stringify({
      talents: pipeline.talentProfile.baseTalents,
      interest: pipeline.profiles.interestProfile,
      matches: pipeline.matches.map(({ careerId, matchScore, confidence }) => ({ careerId, matchScore, confidence })),
    });
    const prompts = buildDynamicTieBreaker(directions);
    const answers = Object.fromEntries(prompts.map((prompt) => [prompt.id, prompt.options[0].directionId])) as Record<string, CareerDirectionId>;
    buildExplorationPriority({ directions, matches: pipeline.matches, talentProfile: pipeline.talentProfile, tieBreakerAnswers: answers });
    expect(JSON.stringify({
      talents: pipeline.talentProfile.baseTalents,
      interest: pipeline.profiles.interestProfile,
      matches: pipeline.matches.map(({ careerId, matchScore, confidence }) => ({ careerId, matchScore, confidence })),
    })).toBe(before);
  });

  it('keeps epsilon aligned with the observed median adjacent Direction gap', () => {
    const gaps = runs.flatMap(({ pipeline }) => {
      const directions = buildCareerDirections({ matches: pipeline.matches });
      return directions.slice(0, -1).map((direction, index) => direction.averageFit - directions[index + 1].averageFit);
    }).sort((a, b) => a - b);
    const middle = gaps.length / 2;
    const median = (gaps[middle - 1] + gaps[middle]) / 2;
    expect(median).toBeGreaterThanOrEqual(0.014);
    expect(median).toBeLessThanOrEqual(0.019);
    expect(SCORE_PROXIMITY_EPSILON).toBe(0.017);
  });
});
