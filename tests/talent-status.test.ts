import { describe, expect, it } from 'vitest';
import { determineTalentStatus } from '../src/engine';
import type { ConfidenceResult } from '../src/types';

const confidence = (level: ConfidenceResult['level']): ConfidenceResult => ({
  level,
  evidenceCount: level === 'low' ? 1 : 4,
  questionCoverage: level === 'low' ? 0.25 : 1,
  crossMethodConsistency: level === 'low' ? 0 : 1,
  evidenceQuality: level === 'low' ? 0.4 : 0.8,
  reasons: [],
});

describe('talent status', () => {
  it('keeps all six statuses in deterministic engine logic', () => {
    expect(determineTalentStatus(0.8, 0.7, 0.5, confidence('high'))).toBe('natural_strength');
    expect(determineTalentStatus(0.8, -0.7, 0.5, confidence('high'))).toBe('developed_strength');
    expect(determineTalentStatus(0.45, 0, 0.4, confidence('medium'))).toBe('emerging_potential');
    expect(determineTalentStatus(0.2, 0, 0.8, confidence('medium'))).toBe('interest_only');
    expect(determineTalentStatus(0.2, -0.8, 0.1, confidence('medium'))).toBe('energy_drain');
    expect(determineTalentStatus(0.8, 0.8, 0.8, confidence('low'))).toBe('insufficient_evidence');
  });
});
