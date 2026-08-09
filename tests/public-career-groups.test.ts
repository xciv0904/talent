import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES, PUBLIC_CAREER_GROUPS } from '../src/data/careers';

describe('public career naming layer', () => {
  it('maps all 60 specific careers exactly once', () => {
    const mappedIds = PUBLIC_CAREER_GROUPS.flatMap(({ specificCareerIds }) => specificCareerIds);
    expect(CAREER_PROFILES).toHaveLength(60);
    expect(PUBLIC_CAREER_GROUPS).toHaveLength(33);
    expect(mappedIds).toHaveLength(60);
    expect(new Set(mappedIds).size).toBe(60);
    expect([...mappedIds].sort()).toEqual(CAREER_PROFILES.map(({ id }) => id).sort());
  });

  it('uses understandable names and useful public descriptions', () => {
    for (const group of PUBLIC_CAREER_GROUPS) {
      expect(group.title.length).toBeGreaterThan(2);
      expect(group.description.length).toBeGreaterThan(12);
      expect(group.commonTitles.length).toBeGreaterThan(0);
      expect(group.dailyTasks.length).toBeGreaterThanOrEqual(3);
      expect(group.dailyTasks.length).toBeLessThanOrEqual(5);
    }
  });

  it('does not collapse materially different technology work into one bucket', () => {
    const publicIdFor = (careerId: string) => PUBLIC_CAREER_GROUPS.find(({ specificCareerIds }) => (specificCareerIds as readonly string[]).includes(careerId))?.id;
    expect(new Set([
      publicIdFor('software_engineer'),
      publicIdFor('data_analyst'),
      publicIdFor('cybersecurity_analyst'),
    ]).size).toBe(3);
  });
});
