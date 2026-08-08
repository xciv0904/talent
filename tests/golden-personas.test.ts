import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES } from '../src/data/careers';
import { matchCareers } from '../src/engine';
import { GOLDEN_PERSONAS } from './fixtures/golden-personas';

describe('golden personas', () => {
  it('runs 12 full matches with plausible, differentiated top careers', () => {
    const signatures = GOLDEN_PERSONAS.map((persona) => {
      const topFive = matchCareers(CAREER_PROFILES, persona.input).slice(0, 5).map(({ careerId }) => careerId);
      const expectedHits = topFive.filter((careerId) => persona.expectedTopCareers.includes(careerId));
      const expectedFamilies = [...new Set(persona.expectedTopCareers.map((careerId) => CAREER_PROFILES.find(({ id }) => id === careerId)?.family).filter(Boolean))];
      const unexpectedResults = topFive.filter((careerId) => !persona.expectedTopCareers.includes(careerId));
      const reportGolden = (globalThis as { process?: { env?: Record<string, string> } }).process?.env?.REPORT_GOLDEN;
      if (reportGolden === '1') {
        console.info(JSON.stringify({ persona: persona.id, topFive, expectedFamilies, unexpectedResults, pass: expectedHits.length >= 2 }));
      }
      expect(expectedHits.length, `${persona.id}: ${topFive.join(', ')}`).toBeGreaterThanOrEqual(2);
      return topFive.slice(0, 3).join('|');
    });

    expect(new Set(signatures).size).toBeGreaterThanOrEqual(10);
  });
});
