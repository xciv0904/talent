import { describe, expect, it } from 'vitest';
import { normalizeScale } from '../src/engine/assessment-engine';
import { normalizeTalentScore } from '../src/engine/talent-engine';

describe('normalization', () => {
  it('normalizes bounded scales without fake precision', () => {
    expect(normalizeScale(1, 1, 5)).toBe(0);
    expect(normalizeScale(3, 1, 5)).toBe(0.5);
    expect(normalizeScale(5, 1, 5)).toBe(1);
    expect(normalizeScale(8, 1, 5)).toBe(1);
  });

  it('normalizes talent support by available opportunities', () => {
    expect(normalizeTalentScore(0, 4)).toBe(0);
    expect(normalizeTalentScore(2, 4)).toBe(0.5);
    expect(normalizeTalentScore(5, 4)).toBe(1);
    expect(normalizeTalentScore(1, 0)).toBe(0);
  });
});
