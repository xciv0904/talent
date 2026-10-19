import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES } from '../src/data/careers';
import { COMMON_CAREERS } from '../src/data/careers/common-careers';
import { CAREER_SCOPES, careerMatchesSearch, careerScope } from '../src/data/careers/coverage';
import { LAB_CAREERS, eventsFor } from '../src/lab/content';
import { LAB_BROWSE_CAREERS, matchesLabCareer } from '../src/lab/CareerFilters';
import { createInitialAppState, parseStoredState } from '../src/services/storage';
import { runCareerDiscoveryPipeline } from '../src/engine';
import { CURRENT_RESULT_VERSIONS } from '../src/config/versions';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';
import { buildCareerExperiencePlan, auditCareerVectors } from '../src/utils';

describe('Job-board category coverage and common occupations', () => {
  it('represents all 22 browsing scopes without empty categories or unknown assignments', () => {
    expect(CAREER_SCOPES).toHaveLength(22);
    for (const [scope] of CAREER_SCOPES) expect(CAREER_PROFILES.filter((c) => careerScope(c.id) === scope).length, scope).toBeGreaterThan(0);
    expect(new Set(CAREER_PROFILES.map((c) => careerScope(c.id))).size).toBe(22);
    expect(COMMON_CAREERS).toHaveLength(40);
    expect(LAB_BROWSE_CAREERS.map((c) => c.careerId).sort()).toEqual(LAB_CAREERS.map((c) => c.careerId).sort());
    expect(new Set(LAB_BROWSE_CAREERS.slice(0, 6).map((c) => c.sector)).size).toBeGreaterThanOrEqual(5);
    expect(auditCareerVectors(CAREER_PROFILES, .96).similarPairs).toEqual([]);
  });
  it.each([
    ['老師', 'school_teacher'], ['幼教', 'preschool_teacher'], ['軍人', 'military_service_member'], ['警察', 'police_officer'], ['消防', 'firefighter'],
    ['醫生', 'physician'], ['護士', 'registered_nurse'], ['律師', 'lawyer'], ['廚師', 'chef'], ['農夫', 'farmer'],
    ['保母', 'childcare_worker'], ['清潔工', 'cleaner'], ['司機', 'delivery_driver'], ['土木', 'civil_engineer'], ['養魚', 'aquaculture_worker'],
  ])('finds common search %s under its real career ID', (query, id) => {
    expect(careerMatchesSearch(id, query)).toBe(true);
    expect(careerMatchesSearch(id, '不存在的名稱')).toBe(false);
  });
  it('filters Lab by actual workplaces and supports aliases, combined filters and no results', () => {
    expect(matchesLabCareer('school_teacher', '教育與陪伴', '老師')).toBe(true);
    expect(matchesLabCareer('physician', '醫療與照護', '醫生')).toBe(true);
    expect(matchesLabCareer('physician', '教育與陪伴', '')).toBe(false);
    expect(matchesLabCareer('school_teacher', '全部工作場域', '不存在')).toBe(false);
    expect(matchesLabCareer('childcare_worker', '全部工作場域', '')).toBe(false);
    for (const c of LAB_CAREERS) expect((c.sector ?? '').length).toBeLessThan(12);
  });
  it('gives new occupations a concrete, bounded follow-up rather than asking novices to perform licensed work', () => {
    for (const c of COMMON_CAREERS) {
      const plan = buildCareerExperiencePlan(c);
      expect(plan.steps[0]).toContain(c.careerExperiment.description);
      expect(plan.steps[1]).toContain('需要資格');
      expect(plan.duration).toContain('另行安排');
    }
    expect(buildCareerExperiencePlan(COMMON_CAREERS.find((c) => c.id === 'physician')!).steps[0]).toContain('不做診斷');
  });
  it('has distinct work evidence and development paths for all 20 new playable occupations', () => {
    const common = LAB_CAREERS.filter((c) => COMMON_CAREERS.some((p) => p.id === c.careerId));
    expect(common).toHaveLength(20);
    expect(new Set(common.map((c) => c.mission.title)).size).toBe(20);
    expect(new Set(common.map((c) => c.mission.decisions[0].options.indexOf(c.mission.decisions[0].correct))).size).toBe(3);
    for (const c of common) {
      expect(c.development).toHaveLength(3);
      expect(eventsFor(c.careerId).find((e) => e.id === 'review')!.choices.map((c) => c.label)).toEqual(c.development);
      expect(eventsFor(c.careerId).find((e) => e.id === 'autonomy')!.title).not.toContain('遠端');
    }
  });
});

describe('Dataset-only migration', () => {
  it.each([true, false])('refreshes derived matches while preserving completed=%s progress, answers and exact talent results', (completed) => {
    const answers = SYNTHETIC_PROFILES[0].responses;
    const p = runCareerDiscoveryPipeline(answers);
    const state = { ...createInitialAppState(), answers, talentProfile: p.talentProfile,
      assessmentProgress: { currentIndex: 34, completed, updatedAt: '2026-10-19T00:00:00Z' },
      careerResults: { matches: p.matches.filter((c) => !COMMON_CAREERS.some((n) => n.id === c.careerId)), categories: p.categories, profiles: p.profiles, versions: { ...CURRENT_RESULT_VERSIONS, careerDatasetVersion: '1.0.0' } },
      exploredCareers: ['data_analyst'], selectedDirectionId: 'data_analysis' };
    const restored = parseStoredState(JSON.stringify(state));
    expect(restored.careerResults!.matches).toHaveLength(100);
    expect(restored.careerResults!.versions.careerDatasetVersion).toBe('1.1.0');
    expect(restored.talentProfile).toEqual(p.talentProfile);
    expect(restored.answers).toEqual(answers);
    expect(restored.assessmentProgress).toEqual(state.assessmentProgress);
    expect(restored.exploredCareers).toEqual(state.exploredCareers);
  });
});
