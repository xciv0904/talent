import { describe, expect, it } from 'vitest';
import { CURRENT_RESULT_VERSIONS, PRODUCT_VERSIONS } from '../src/config/versions';
import { runCareerDiscoveryPipeline } from '../src/engine';
import { buildBetaFeedbackExport, buildDiagnosticReport } from '../src/services/beta-feedback';
import { createInitialAppState, parseStoredState } from '../src/services/storage';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';

const completedState = () => {
  const pipeline = runCareerDiscoveryPipeline(SYNTHETIC_PROFILES[0].responses);
  const state = createInitialAppState();
  state.answers = [...SYNTHETIC_PROFILES[0].responses];
  state.assessmentProgress = { currentIndex: 44, completed: true, updatedAt: '2026-08-09T00:00:00.000Z' };
  state.talentProfile = pipeline.talentProfile;
  state.careerResults = { matches: pipeline.matches, categories: pipeline.categories, profiles: pipeline.profiles, versions: CURRENT_RESULT_VERSIONS };
  return state;
};

describe('Public Beta feedback and diagnostics', () => {
  it('stores required feedback schema and version fields', () => {
    const state = createInitialAppState();
    expect(state.betaFeedback).toMatchObject({
      sessionId: state.sessionId,
      schemaVersion: PRODUCT_VERSIONS.betaFeedbackSchemaVersion,
      assessmentVersion: PRODUCT_VERSIONS.assessmentVersion,
      talentModelVersion: PRODUCT_VERSIONS.talentModelVersion,
      careerDatasetVersion: PRODUCT_VERSIONS.careerDatasetVersion,
      matchingEngineVersion: PRODUCT_VERSIONS.matchingEngineVersion,
      explanationVersion: PRODUCT_VERSIONS.explanationVersion,
      storageSchemaVersion: PRODUCT_VERSIONS.storageSchemaVersion,
    });
  });

  it('keeps valid question and career feedback while removing invalid entries', () => {
    const state = createInitialAppState();
    state.betaFeedback.questionFeedback = [
      { questionId: 'SJT01', reason: 'none_fit', timestamp: '2026-08-09T00:00:00.000Z' },
      { questionId: 'SJT02', reason: 'invalid' as never, timestamp: 'bad' },
    ];
    state.betaFeedback.careerFeedback = [
      { careerId: 'data_analyst', response: 'reason_clear_not_desired', timestamp: '2026-08-09T00:00:00.000Z' },
      { careerId: 'ux_designer', response: 'invalid' as never, timestamp: '2026-08-09T00:00:00.000Z' },
    ];
    const parsed = parseStoredState(JSON.stringify(state));
    expect(parsed.betaFeedback.questionFeedback).toHaveLength(1);
    expect(parsed.betaFeedback.questionFeedback[0]).toMatchObject({ questionId: 'SJT01', reason: 'none_fit' });
    expect(parsed.betaFeedback.careerFeedback).toHaveLength(1);
    expect(parsed.betaFeedback.careerFeedback[0]).toMatchObject({ careerId: 'data_analyst', response: 'reason_clear_not_desired' });
  });

  it('exports only structured versioned feedback', () => {
    const state = createInitialAppState();
    state.betaFeedback.overallFeedback = 'clearer_direction';
    const value = buildBetaFeedbackExport(state);
    expect(value.exportType).toBe('career-discovery-beta-feedback');
    expect(value.feedback.sessionId).toBe(state.sessionId);
    expect(value.feedback.overallFeedback).toBe('clearer_direction');
    expect('device' in value).toBe(false);
    expect('email' in value.feedback).toBe(false);
  });

  it('keeps Next-Step Clarity as a separate Beta metric', () => {
    const state = createInitialAppState();
    state.betaFeedback.nextStepClarity = 'still_uncertain';
    const parsed = parseStoredState(JSON.stringify(state));
    expect(parsed.betaFeedback.nextStepClarity).toBe('still_uncertain');
    expect(parsed.betaFeedback.overallFeedback).toBeUndefined();
  });

  it('builds a complete diagnostic export without device information', () => {
    const report = buildDiagnosticReport(completedState());
    expect(report.versions).toEqual(CURRENT_RESULT_VERSIONS);
    expect(report.questionAnswers).toHaveLength(45);
    expect(report.signalObservations.length).toBeGreaterThan(0);
    expect(report.normalizedSignals.baseTalents).toHaveLength(20);
    expect(report.compositeTalents).toHaveLength(12);
    expect(report.topCareerMatches).toHaveLength(10);
    expect(Object.keys(report.topCareerMatches[0].componentScores)).toHaveLength(6);
    expect(Object.keys(report.topCareerMatches[0].environmentPenalty.byDimension)).toHaveLength(8);
    expect(report.topCareerMatches[0].environmentPenalty.dominantMismatchPenalty).toBeGreaterThanOrEqual(0);
    expect(report.topCareerMatches[0].supportingEvidenceIds).toBeDefined();
    expect('userAgent' in report).toBe(false);
  });

  it('accepts an empty Surprise category as a valid result', () => {
    const state = completedState();
    state.careerResults!.categories.surprise_me = [];
    const report = buildDiagnosticReport(state);
    expect(report.resultCategories.surprise_me).toEqual([]);
  });

  it('does not let feedback change Career Fit calculations', () => {
    const answers = SYNTHETIC_PROFILES[1].responses;
    const before = runCareerDiscoveryPipeline(answers).matches.map(({ careerId, matchScore }) => [careerId, matchScore]);
    const state = createInitialAppState();
    state.betaFeedback.careerFeedback.push({ careerId: 'ux_designer', response: 'unreasonable', timestamp: '2026-08-09T00:00:00.000Z' });
    const after = runCareerDiscoveryPipeline(answers).matches.map(({ careerId, matchScore }) => [careerId, matchScore]);
    expect(after).toEqual(before);
  });

  it('migrates v2 answers but invalidates unversioned results', () => {
    const current = completedState();
    const legacy = { ...current, schemaVersion: 2, sessionId: undefined, betaFeedback: undefined };
    const migrated = parseStoredState(JSON.stringify(legacy));
    expect(migrated.answers).toHaveLength(45);
    expect(migrated.assessmentProgress.completed).toBe(false);
    expect(migrated.talentProfile).toBeNull();
    expect(migrated.careerResults).toBeNull();
    expect(migrated.sessionId).toMatch(/^beta_/);
  });

  it('rejects a current result that is missing a complete version contract', () => {
    const state = completedState();
    state.careerResults!.versions = { assessmentVersion: '1.0.0' } as never;
    expect(parseStoredState(JSON.stringify(state)).careerResults).toBeNull();
  });
});
