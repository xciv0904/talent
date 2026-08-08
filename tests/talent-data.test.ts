import { describe, expect, it } from 'vitest';
import { BASE_TALENTS, COMPOSITE_TALENTS } from '../src/data/talents';

describe('talent data', () => {
  it('defines exactly 20 unique base talents in the expected categories', () => {
    expect(BASE_TALENTS).toHaveLength(20);
    expect(new Set(BASE_TALENTS.map(({ id }) => id)).size).toBe(20);

    const categoryCounts = BASE_TALENTS.reduce<Record<string, number>>((counts, talent) => {
      counts[talent.category] = (counts[talent.category] ?? 0) + 1;
      return counts;
    }, {});

    expect(categoryCounts).toEqual({ thinking: 8, people: 6, execution: 6 });
  });

  it('defines 12 valid composite talents with normalized weights', () => {
    const baseTalentIds = new Set<string>(BASE_TALENTS.map(({ id }) => id));

    expect(COMPOSITE_TALENTS).toHaveLength(12);
    expect(new Set(COMPOSITE_TALENTS.map(({ id }) => id)).size).toBe(12);

    for (const composite of COMPOSITE_TALENTS) {
      expect(composite.minimumEvidence).toBeGreaterThan(0);
      expect(Object.keys(composite.weights)).toEqual(expect.arrayContaining([...composite.components]));
      expect(composite.components.every((id) => baseTalentIds.has(id))).toBe(true);

      const totalWeight = Object.values(composite.weights).reduce<number>((sum, weight) => sum + weight, 0);
      expect(totalWeight).toBeCloseTo(1, 8);
    }
  });
});
