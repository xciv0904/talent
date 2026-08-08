import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES } from '../src/data/careers';
import { calculateEntryDistance } from '../src/engine';
import type { CareerMatchInput, CareerProfile, EducationLevel } from '../src/types';
import { GOLDEN_PERSONAS } from './fixtures/golden-personas';

const career = (id: string) => CAREER_PROFILES.find((item) => item.id === id)!;
const skillsFor = (profile: CareerProfile, score = 1) => Object.fromEntries(profile.skills.map(({ id }) => [id, score]));
const user = (overrides: Partial<CareerMatchInput>): CareerMatchInput => ({
  ...GOLDEN_PERSONAS[0].input,
  transferableSkills: {}, education: 'secondary', yearsExperience: 0, certifications: [],
  hasPortfolio: false, languages: [], professionalLicenses: [],
  ...overrides,
});
const readyFor = (profile: CareerProfile, overrides: Partial<CareerMatchInput> = {}) => user({
  transferableSkills: skillsFor(profile),
  education: profile.entryRequirements.education,
  yearsExperience: profile.entryRequirements.yearsExperience,
  certifications: profile.entryRequirements.certifications,
  hasPortfolio: profile.entryRequirements.portfolio,
  languages: profile.entryRequirements.languages,
  professionalLicenses: profile.entryRequirements.professionalLicenses,
  ...overrides,
});

describe('entry distance sanity', () => {
  it('distinguishes license, portfolio, experience, technical, education, and accessible paths', () => {
    const matrix = [
      ['Professional license heavy · unlicensed', 'occupational_therapist', user({ education: 'secondary' })],
      ['Professional license heavy · ready', 'occupational_therapist', readyFor(career('occupational_therapist'))],
      ['Portfolio heavy · beginner', 'ux_designer', user({ education: 'secondary' })],
      ['Portfolio heavy · portfolio ready', 'ux_designer', readyFor(career('ux_designer'))],
      ['Experience heavy · beginner', 'product_manager', user({ education: 'bachelor' })],
      ['Experience heavy · adjacent experience', 'product_manager', readyFor(career('product_manager'))],
      ['Technical skill heavy · beginner', 'cybersecurity_analyst', user({ education: 'secondary' })],
      ['Technical skill heavy · trained', 'cybersecurity_analyst', readyFor(career('cybersecurity_analyst'))],
      ['Education heavy · beginner', 'policy_researcher', user({ education: 'secondary' })],
      ['Education heavy · qualified', 'policy_researcher', readyFor(career('policy_researcher'))],
      ['Relatively accessible · some readiness', 'guest_experience_manager', user({ education: 'associate', yearsExperience: 1, languages: ['English'], transferableSkills: skillsFor(career('guest_experience_manager'), 0.4) })],
      ['Relatively accessible · ready', 'guest_experience_manager', readyFor(career('guest_experience_manager'))],
    ] as const;
    const results = matrix.map(([scenario, careerId, input]) => {
      const result = calculateEntryDistance(career(careerId), input);
      return { scenario, careerId, level: result.level, distanceParts: {
        education: result.educationGap, skills: result.skillGap, experience: result.experienceGap,
        certification: result.certificationGap, portfolio: result.portfolioGap,
        language: result.languageGap, license: result.professionalLicenseGap,
      } };
    });
    if ((globalThis as { process?: { env?: Record<string, string> } }).process?.env?.REPORT_RELEASE === '1') {
      console.info(`ENTRY:${JSON.stringify(results)}`);
    }

    const byScenario = new Map(results.map((result) => [result.scenario, result.level]));
    expect(byScenario.get('Professional license heavy · unlicensed')).toBe('very_high');
    expect(byScenario.get('Portfolio heavy · beginner')).toBe('medium');
    expect(byScenario.get('Experience heavy · beginner')).toBe('medium');
    expect(byScenario.get('Technical skill heavy · beginner')).toBe('high');
    expect(byScenario.get('Education heavy · beginner')).toBe('high');
    expect(byScenario.get('Relatively accessible · some readiness')).toBe('medium');
    expect(results.filter(({ scenario }) => scenario.endsWith('ready') || scenario.endsWith('trained') || scenario.endsWith('qualified')).every(({ level }) => level === 'low')).toBe(true);
    expect(new Set(results.map(({ level }) => level)).size).toBe(4);
  });

  it('does not collapse every novice career into medium', () => {
    const novice = user({ education: 'secondary' as EducationLevel });
    const levels = CAREER_PROFILES.map((profile) => calculateEntryDistance(profile, novice).level);
    expect(new Set(levels).size).toBeGreaterThanOrEqual(3);
  });
});
