import { describe, expect, it } from 'vitest';
import { QUICK_DISCOVERY_QUESTIONS } from '../src/data/questions';
import { runAssessment, scoreBaseTalents, scoreCompositeTalents } from '../src/engine';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';

describe('composite talent scoring', () => {
  it('uses explicit component weights and remains deterministic', () => {
    const profile = SYNTHETIC_PROFILES.find(({ id }) => id === 'operations_builder')!;
    const base = scoreBaseTalents(runAssessment(QUICK_DISCOVERY_QUESTIONS, profile.responses));
    const first = scoreCompositeTalents(base);
    const second = scoreCompositeTalents(base);
    const orchestrator = first.find(({ compositeTalentId }) => compositeTalentId === 'operational_orchestrator')!;
    const coordination = base.find(({ talentId }) => talentId === 'coordination')!.score;
    const planning = base.find(({ talentId }) => talentId === 'planning')!.score;
    const prioritization = base.find(({ talentId }) => talentId === 'prioritization')!.score;

    expect(second).toEqual(first);
    expect(orchestrator.score).toBeCloseTo(coordination * 0.4 + planning * 0.35 + prioritization * 0.25);
    expect(orchestrator.score).toBeGreaterThan(0.7);
  });
});
