import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES } from '../src/data/careers';
import { categorizeCareerResults, matchCareers } from '../src/engine';
import { GOLDEN_PERSONAS } from './fixtures/golden-personas';

describe('career result categories', () => {
  it('uses distinct selection logic and produces disjoint result sets', () => {
    const persona = GOLDEN_PERSONAS[0];
    const categories = categorizeCareerResults(matchCareers(CAREER_PROFILES, persona.input), persona.input);
    const allIds = Object.values(categories).flat().map(({ careerId }) => careerId);
    expect(new Set(allIds).size).toBe(allIds.length);
    expect(categories.best_fit.length).toBeGreaterThan(0);
    expect(categories.easier_transition.length).toBeGreaterThan(0);
    expect(categories.high_potential.length).toBeGreaterThan(0);
    expect(categories.easier_transition.every(({ entryDistance }) => ['low', 'medium'].includes(entryDistance.level))).toBe(true);
    expect(categories.high_potential.every(({ entryDistance }) => ['high', 'very_high'].includes(entryDistance.level))).toBe(true);
    expect(categories.surprise_me.every(({ family }) => !persona.input.consideredFamilies.includes(family))).toBe(true);
    expect(new Set(categories.surprise_me.map(({ family }) => family)).size).toBe(categories.surprise_me.length);
  });
});
