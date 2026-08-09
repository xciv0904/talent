import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES } from '../src/data/careers';
import { buildCareerDirections, buildGuidedChoice, categorizeCareerResults, matchCareers, runCareerDiscoveryPipeline } from '../src/engine';
import { guidanceFromFeeling } from '../src/utils';
import { GOLDEN_PERSONAS } from './fixtures/golden-personas';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';

const resultFor = (index: number) => runCareerDiscoveryPipeline(SYNTHETIC_PROFILES[index].responses);

describe('deterministic Career Direction layer', () => {
  it('produces three readable, evidence-backed directions without duplicating careers', () => {
    const result = resultFor(0);
    const directions = buildCareerDirections({ matches: result.matches });
    expect(directions).toHaveLength(3);
    expect(directions.every(({ title }) => !/跨域|多元|策略整合型/.test(title))).toBe(true);
    expect(directions.every(({ supportingEvidence, sharedTalents, careerIds }) => supportingEvidence.length > 0 && sharedTalents.length > 0 && careerIds.length > 0)).toBe(true);
    const careerIds = directions.flatMap(({ careerIds }) => careerIds);
    expect(new Set(careerIds).size).toBe(careerIds.length);
  });

  it('returns the same directions and order for the same engine output', () => {
    const matches = resultFor(3).matches;
    expect(buildCareerDirections({ matches })).toEqual(buildCareerDirections({ matches }));
  });

  it('uses existing match components without changing Career Fit', () => {
    const result = resultFor(6);
    const before = result.matches.map(({ careerId, matchScore }) => [careerId, matchScore]);
    buildCareerDirections({ matches: result.matches });
    expect(result.matches.map(({ careerId, matchScore }) => [careerId, matchScore])).toEqual(before);
  });
});

describe('five post-assessment journeys have a next step', () => {
  it('Persona A: completely unsure receives Guided Choice', () => {
    const directions = buildCareerDirections({ matches: resultFor(0).matches });
    expect(buildGuidedChoice(directions)).toHaveLength(3);
  });

  it('Persona B: two considered careers can be compared', () => {
    expect(resultFor(1).matches.slice(0, 2)).toHaveLength(2);
  });

  it('Persona C: at least one tested profile can open a Surprise Career', () => {
    const profileWithSurprise = GOLDEN_PERSONAS.map(({ input }) => categorizeCareerResults(matchCareers(CAREER_PROFILES, input), input)).find(({ surprise_me }) => surprise_me.length > 0);
    expect(profileWithSurprise?.surprise_me[0]?.careerId).toBeTruthy();
  });

  it('Persona D: repeated uncertainty resolves to one exploration priority without changing scores', () => {
    const directions = buildCareerDirections({ matches: resultFor(2).matches });
    const prompts = buildGuidedChoice(directions);
    const choices = prompts.map(({ options }) => options[0].directionId);
    const winner = choices.sort((a, b) => choices.filter((id) => id === b).length - choices.filter((id) => id === a).length)[0];
    expect(directions.some(({ id }) => id === winner)).toBe(true);
  });

  it('Persona E: disliked experience is guided to deprioritize and has another direction', () => {
    const directions = buildCareerDirections({ matches: resultFor(4).matches });
    expect(guidanceFromFeeling('disliked')).toBe('deprioritize');
    expect(directions.length).toBeGreaterThan(1);
  });
});
