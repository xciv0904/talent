import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES } from '../src/data/careers';
import { BASE_TALENTS } from '../src/data/talents';
import { CAREER_FAMILIES, CAREER_MATCH_VALUE_DIMENSIONS, ENVIRONMENT_DIMENSIONS, INTEREST_DIMENSIONS, WORK_STYLE_DIMENSIONS } from '../src/types';
import { auditCareerVectors } from '../src/utils';

describe('career knowledge base', () => {
  it('contains 60 unique, complete careers across all 20 families', () => {
    expect(CAREER_PROFILES).toHaveLength(60);
    expect(new Set(CAREER_PROFILES.map(({ id }) => id)).size).toBe(60);
    expect(new Set(CAREER_PROFILES.map(({ family }) => family))).toEqual(new Set(CAREER_FAMILIES));

    const ids = new Set(CAREER_PROFILES.map(({ id }) => id));
    const talentIds = new Set(BASE_TALENTS.map(({ id }) => id));
    for (const career of CAREER_PROFILES) {
      expect(career.aliases.length).toBeGreaterThan(0);
      expect(career.coreTasks.length).toBeGreaterThanOrEqual(2);
      expect(career.skills.length).toBeGreaterThanOrEqual(3);
      expect(career.relatedCareers.every((id) => ids.has(id))).toBe(true);
      expect(Object.keys(career.talentRequirements).every((id) => talentIds.has(id as never))).toBe(true);
      expect(career.careerExperiment.evidenceToCollect.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('includes every vector dimension and avoids undifferentiated high vectors', () => {
    const audit = auditCareerVectors(CAREER_PROFILES, 0.98);
    const reportVector = (globalThis as { process?: { env?: Record<string, string> } }).process?.env?.REPORT_VECTOR;
    if (reportVector === '1') console.info(JSON.stringify(audit, null, 2));
    expect(audit.missingDimensions).toEqual([]);
    expect(audit.overElevatedCareers).toEqual([]);
    expect(audit.lowDiscriminationCareers).toEqual([]);
    for (const career of CAREER_PROFILES) {
      expect(Object.keys(career.interestProfile).sort()).toEqual([...INTEREST_DIMENSIONS].sort());
      expect(Object.keys(career.workStyle).sort()).toEqual([...WORK_STYLE_DIMENSIONS].sort());
      expect(Object.keys(career.environmentProfile).sort()).toEqual([...ENVIRONMENT_DIMENSIONS].sort());
      expect(Object.keys(career.valuesProfile).sort()).toEqual([...CAREER_MATCH_VALUE_DIMENSIONS].sort());
    }
  });
});
