import { describe, expect, it } from 'vitest';
import { QUICK_DISCOVERY_QUESTIONS } from '../src/data/questions';
import { runAssessment, scoreBaseTalents } from '../src/engine';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';

describe('talent scoring', () => {
  it('is deterministic for identical answers', () => {
    const profile = SYNTHETIC_PROFILES[0];
    const first = scoreBaseTalents(runAssessment(QUICK_DISCOVERY_QUESTIONS, profile.responses));
    const second = scoreBaseTalents(runAssessment(QUICK_DISCOVERY_QUESTIONS, profile.responses));
    expect(second).toEqual(first);
  });

  it('produces clearly different top talents across the synthetic cohort', () => {
    const signatures = SYNTHETIC_PROFILES.map((profile) => {
      const scores = scoreBaseTalents(runAssessment(QUICK_DISCOVERY_QUESTIONS, profile.responses));
      const topFour = [...scores]
        .sort((a, b) => b.score - a.score || a.talentId.localeCompare(b.talentId))
        .slice(0, 4)
        .map(({ talentId }) => talentId);
      expect(topFour.filter((talentId) => profile.targetTalents.includes(talentId)).length).toBeGreaterThanOrEqual(2);
      return topFour.slice(0, 3).join('|');
    });

    expect(new Set(signatures).size).toBeGreaterThanOrEqual(20);
    expect(signatures.every((signature) => signature === 'communication|planning|adaptability')).toBe(false);
  });
});
