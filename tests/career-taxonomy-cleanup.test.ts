import { describe, expect, it } from 'vitest';
import { buildPrimaryCareerPresentation, interpretPublicCareers, runCareerDiscoveryPipeline } from '../src/engine';
import { CAREER_PROFILES } from '../src/data/careers';
import { CareerDetailPage } from '../src/pages/CareerDetailPage';
import { CareersPage } from '../src/pages/CareersPage';
import { ComparePage } from '../src/pages/ComparePage';
import type { PublicCareerResults } from '../src/types';
import { skillNameLabel } from '../src/utils';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';

const source = String(CareersPage);
const compareSource = String(ComparePage);
const detailSource = String(CareerDetailPage);

const fixture = () => {
  const profile = SYNTHETIC_PROFILES[0];
  const pipeline = runCareerDiscoveryPipeline(profile.responses);
  return interpretPublicCareers({ matches: pipeline.matches, talentProfile: pipeline.talentProfile, responses: profile.responses });
};

describe('career results taxonomy cleanup', () => {
  it('Case A: zero very-suitable results use fallback without an empty primary tab', () => {
    const actual = fixture();
    const data: PublicCareerResults = { ...actual, strong: [], moderate: actual.all.slice(0, 2).map((item) => ({ ...item, classification: 'moderate' })), lower: actual.all.slice(-1).map((item) => ({ ...item, classification: 'lower' })) };
    const presentation = buildPrimaryCareerPresentation(data);
    expect(presentation.strong).toHaveLength(0);
    expect(presentation.fallback.length).toBeGreaterThan(0);
    expect(presentation.lower.length).toBeGreaterThan(0);
    expect(source).not.toContain('非常適合 · 0');
  });

  it('Case B: empty moderate classification produces no forced cards', () => {
    const actual = fixture();
    const data: PublicCareerResults = { ...actual, strong: actual.all.slice(0, 1).map((item) => ({ ...item, classification: 'strong' })), moderate: [], lower: [] };
    const presentation = buildPrimaryCareerPresentation(data);
    expect(presentation.strong).toHaveLength(1);
    expect(presentation.moderate).toHaveLength(0);
    expect(presentation.fallback).toHaveLength(0);
  });

  it('Case C: weak positive evidence is labeled as exploration fallback, not very suitable', () => {
    const actual = fixture();
    const weak = actual.all.slice(0, 2).map((item) => ({ ...item, classification: 'moderate' as const, recommendationStrength: 'exploratory' as const }));
    const presentation = buildPrimaryCareerPresentation({ ...actual, strong: [], moderate: weak, lower: [], all: weak });
    expect(presentation.strong).toHaveLength(0);
    expect(presentation.fallback.every(({ recommendationStrength }) => recommendationStrength === 'exploratory')).toBe(true);
  });

  it('Case D: zero Surprise results hide the conditional section', () => {
    const presentation = buildPrimaryCareerPresentation(fixture(), []);
    expect(presentation.surprise).toHaveLength(0);
  });

  it('Case E: missing background data does not produce a strong easier-transition conclusion', () => {
    expect(compareSource).toContain('職業通常門檻');
    expect(compareSource).toContain('個人進入距離');
    expect(compareSource).toContain('尚未估算');
    expect(detailSource).toContain('不代表你的個人條件不足');
    expect(detailSource).toContain('不會影響 Career Fit');
    expect(compareSource).not.toContain('背景資料不足');
    expect(detailSource).not.toContain('尚待補充目前背景');
  });

  it('localizes every career skill used in Chinese result copy', () => {
    const skills = CAREER_PROFILES.flatMap((career) => career.skills);
    const missingLabels = skills.filter((skill) => skillNameLabel(skill.name) === skill.name);
    expect(missingLabels).toEqual([]);
    expect(skillNameLabel('Instructional content')).toBe('教學內容設計');
  });

  it('removes legacy public tabs while retaining only internal category data', () => {
    expect(source).not.toMatch(/Best Fit|Easier Transition|High Potential|Surprise Me/);
    expect(source).not.toContain('result-tab');
    expect(source).toContain('查看完整 60 種職業排名');
  });
});
