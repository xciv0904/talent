import { describe, expect, it } from 'vitest';
import { CURRENT_RESULT_VERSIONS } from '../src/config/versions';
import { runCareerDiscoveryPipeline } from '../src/engine';
import { createInitialAppState, parseStoredState, SCHEMA_VERSION } from '../src/services/storage';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';

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
    expect(state.selectedDirection).toBeNull();
    expect(state.exploredCareers).toEqual([]);
    expect(state.completedExperiences).toEqual([]);
    expect(state.reflectionResults).toEqual([]);
    expect(state.navigatorState).toEqual({ guidedAnswers: {} });
    expect(state.betaFeedback.sessionId).toBe(state.sessionId);
  });

  it('persists and sanitizes the post-assessment journey', () => {
    const state = createInitialAppState();
    state.selectedDirection = 'insight_research';
    state.exploredCareers = ['ux_researcher'];
    state.completedExperiences = ['ux_researcher'];
    state.reflectionResults = [{ careerId: 'ux_researcher', feeling: 'interesting', preference: 'understand_people', guidance: 'continue', completedAt: '2026-08-09T00:00:00.000Z' }];
    state.navigatorState = { need: 'guided_direction', guidedAnswers: { activity: 'insight_research' }, lastVisitedStep: 'experience', updatedAt: '2026-08-09T00:00:00.000Z' };
    const parsed = parseStoredState(JSON.stringify(state));
    expect(parsed.selectedDirection).toBe('insight_research');
    expect(parsed.exploredCareers).toEqual(['ux_researcher']);
    expect(parsed.completedExperiences).toEqual(['ux_researcher']);
    expect(parsed.reflectionResults[0].guidance).toBe('continue');
    expect(parsed.navigatorState.guidedAnswers.activity).toBe('insight_research');
  });

  it('migrates the previous v3 results and starts a blank Navigator journey', () => {
    const state = createInitialAppState();
    const migrated = parseStoredState(JSON.stringify({ ...state, schemaVersion: 3, selectedDirection: undefined, navigatorState: undefined }));
    expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
    expect(migrated.selectedDirection).toBeNull();
    expect(migrated.navigatorState).toEqual({ guidedAnswers: {} });
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

  it('invalidates old Assessment results and resumes at the first incompatible Energy answer', () => {
    const state = createInitialAppState();
    const currentAnswers = SYNTHETIC_PROFILES[0].responses;
    const oldAnswers = currentAnswers.map((answer) => answer.questionId.startsWith('ENG')
      ? { ...answer, selectedOptionIds: answer.selectedOptionIds.slice(0, 1) }
      : answer);
    const pipeline = runCareerDiscoveryPipeline(currentAnswers);
    state.answers = oldAnswers;
    state.assessmentProgress = { currentIndex: 34, completed: true, updatedAt: '2026-08-12T00:00:00.000Z' };
    state.talentProfile = pipeline.talentProfile;
    state.careerResults = {
      matches: pipeline.matches,
      categories: pipeline.categories,
      profiles: pipeline.profiles,
      versions: { ...CURRENT_RESULT_VERSIONS, assessmentVersion: '1.0.1' },
    };

    const migrated = parseStoredState(JSON.stringify(state));
    expect(migrated.assessmentProgress).toMatchObject({ currentIndex: 10, completed: false });
    expect(migrated.answers).toHaveLength(35);
    expect(migrated.talentProfile).toBeNull();
    expect(migrated.careerResults).toBeNull();
  });

  it('migrates an incomplete v5 session to the first unanswered question in the 25 + 10 order', () => {
    const state = createInitialAppState();
    const oldFirstFifteen = new Set([
      'SJT01', 'SJT02', 'SJT03', 'SJT04', 'SJT05',
      'BEH01', 'BEH02', 'BEH03', 'BEH04', 'BEH05',
      'EVD01', 'EVD02', 'EVD03', 'EVD04', 'EVD05',
    ]);
    state.answers = SYNTHETIC_PROFILES[0].responses.filter(({ questionId }) => oldFirstFifteen.has(questionId));
    state.assessmentProgress = { currentIndex: 15, completed: false, updatedAt: '2026-08-12T00:00:00.000Z' };

    const migrated = parseStoredState(JSON.stringify({ ...state, schemaVersion: 5 }));
    expect(migrated.assessmentProgress).toMatchObject({ currentIndex: 2, completed: false });
    expect(migrated.answers).toHaveLength(15);
  });

  it('preserves a current preliminary result without marking the full assessment complete', () => {
    const state = createInitialAppState();
    const coreIds = new Set([
      'SJT01', 'BEH01', 'INT01', 'SJT02', 'EVD01', 'ENV01', 'BEH02', 'SJT03', 'VAL01', 'EVD02',
      'ENG02', 'BEH03', 'SJT04', 'ENV02', 'EVD03', 'INT03', 'BEH04', 'SJT05', 'VAL03', 'EVD04',
      'ENG04', 'BEH05', 'ENV05', 'EVD05', 'VAL04',
    ]);
    const coreAnswers = SYNTHETIC_PROFILES[0].responses.filter(({ questionId }) => coreIds.has(questionId));
    const pipeline = runCareerDiscoveryPipeline(coreAnswers);
    state.answers = coreAnswers;
    state.assessmentProgress = { currentIndex: 24, completed: false, updatedAt: '2026-08-14T00:00:00.000Z' };
    state.talentProfile = pipeline.talentProfile;
    state.careerResults = { matches: pipeline.matches, categories: pipeline.categories, profiles: pipeline.profiles, versions: CURRENT_RESULT_VERSIONS };

    const restored = parseStoredState(JSON.stringify(state));
    expect(restored.assessmentProgress).toMatchObject({ currentIndex: 24, completed: false });
    expect(restored.talentProfile).not.toBeNull();
    expect(restored.careerResults).not.toBeNull();
  });
});
