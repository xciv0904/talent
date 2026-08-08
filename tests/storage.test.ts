import { describe, expect, it } from 'vitest';
import { createInitialAppState, parseStoredState, SCHEMA_VERSION } from '../src/services/storage';

describe('unified storage contract', () => {
  it('contains every persisted Public Beta field', () => {
    const state = createInitialAppState();
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(state.sessionId).toMatch(/^beta_/);
    expect(state.assessmentProgress).toEqual({ currentIndex: 0, completed: false, updatedAt: '' });
    expect(state.answers).toEqual([]);
    expect(state.talentProfile).toBeNull();
    expect(state.careerResults).toBeNull();
    expect(state.experiments).toEqual([]);
    expect(state.betaFeedback.sessionId).toBe(state.sessionId);
  });

  it('restores compatible state and rejects stale or broken payloads', () => {
    const state = createInitialAppState();
    state.assessmentProgress.currentIndex = 12;
    expect(parseStoredState(JSON.stringify(state)).assessmentProgress.currentIndex).toBe(12);
    expect(parseStoredState(JSON.stringify({ ...state, schemaVersion: 0 })).answers).toEqual([]);
    expect(parseStoredState('{broken').answers).toEqual([]);
  });

  it('sanitizes corrupt fields inside a current-version payload', () => {
    const state = createInitialAppState();
    const parsed = parseStoredState(JSON.stringify({
      ...state,
      assessmentProgress: { currentIndex: 'NaN', completed: 'yes' },
      answers: [{ questionId: 12, selectedOptionIds: 'bad' }],
      talentProfile: { baseTalents: 'bad' },
      careerResults: { matches: 'bad' },
      experiments: [{ careerId: 'data_analyst', status: 'deleted', updatedAt: 4 }],
    }));
    expect(parsed.assessmentProgress).toEqual({ currentIndex: 0, completed: false, updatedAt: '' });
    expect(parsed.answers).toEqual([]);
    expect(parsed.talentProfile).toBeNull();
    expect(parsed.careerResults).toBeNull();
    expect(parsed.experiments).toEqual([]);
  });
});
