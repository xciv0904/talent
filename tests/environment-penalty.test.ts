import { describe, expect, it } from 'vitest';
import { ENVIRONMENT_DIMENSIONS, type EnvironmentVector } from '../src/types';
import { calculateEnvironmentMatch } from '../src/engine';

const environment = (value: number): EnvironmentVector =>
  Object.fromEntries(ENVIRONMENT_DIMENSIONS.map((dimension) => [dimension, value])) as EnvironmentVector;

describe('asymmetric environment mismatch', () => {
  it('penalizes job demand above tolerance more heavily than the reverse gap', () => {
    const userLow = environment(0.35);
    const jobHigh = environment(0.75);
    const userHigh = environment(0.75);
    const jobLow = environment(0.35);

    const overTolerance = calculateEnvironmentMatch(userLow, jobHigh);
    const underTolerance = calculateEnvironmentMatch(userHigh, jobLow);
    expect(overTolerance.score).toBeLessThan(underTolerance.score);
    expect(overTolerance.frictions).toEqual([...ENVIRONMENT_DIMENSIONS]);
    expect(underTolerance.frictions).toEqual([]);
  });
});
