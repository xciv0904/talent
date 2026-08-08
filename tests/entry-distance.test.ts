import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES } from '../src/data/careers';
import { calculateEntryDistance } from '../src/engine';
import { GOLDEN_PERSONAS } from './fixtures/golden-personas';

describe('entry distance', () => {
  it('keeps professional license and skill gaps independent from career fit', () => {
    const career = CAREER_PROFILES.find(({ id }) => id === 'occupational_therapist')!;
    const base = GOLDEN_PERSONAS[3].input;
    const distant = calculateEntryDistance(career, base);
    const ready = calculateEntryDistance(career, {
      ...base,
      transferableSkills: Object.fromEntries(career.skills.map(({ id }) => [id, 1])),
      professionalLicenses: ['Occupational therapist license'],
      yearsExperience: 3,
    });

    expect(distant.professionalLicenseGap).toBe(1);
    expect(ready.professionalLicenseGap).toBe(0);
    expect(['high', 'very_high']).toContain(distant.level);
    expect(ready.level).toBe('low');
  });
});
