import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES } from '../src/data/careers';
import { QUICK_DISCOVERY_QUESTIONS } from '../src/data/questions';
import { matchCareer, runAssessment, runCareerDiscoveryPipeline, scoreBaseTalents } from '../src/engine';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';

describe('measurement model separation', () => {
  it('calibrates 36 complete raw-answer profiles without false insufficient evidence', () => {
    expect(SYNTHETIC_PROFILES).toHaveLength(36);
    const confidences = { low: 0, medium: 0, high: 0 };
    let insufficient = 0;
    let legacyInsufficient = 0;

    for (const profile of SYNTHETIC_PROFILES) {
      const talents = runCareerDiscoveryPipeline(profile.responses).talentProfile.baseTalents;
      for (const talent of talents) {
        confidences[talent.confidence.level] += 1;
        if (talent.status === 'insufficient_evidence') insufficient += 1;
        const legacyConsistencyHigh = talent.measurement.positiveSignals === 0 || talent.measurement.positiveSignals === 3;
        const legacyLowConfidence = !legacyConsistencyHigh;
        const legacyStatusWasInsufficient = legacyLowConfidence || (
          talent.score < 0.35
          && (talent.interestScore ?? 0) < 0.35
          && (talent.energyScore ?? 0) > -0.5
        );
        if (legacyStatusWasInsufficient) legacyInsufficient += 1;
        expect(talent.measurement.opportunities).toBe(3);
        expect(talent.measurement.answeredOpportunities).toBe(3);
        expect(talent.measurement.validResponses).toBe(3);
        expect(talent.measurement.positiveSignals + talent.measurement.negativeOrCompetingSignals).toBe(3);
      }
    }

    expect(confidences.low).toBe(0);
    expect(confidences.medium + confidences.high).toBe(720);
    expect(insufficient).toBe(0);
    const reportMeasurement = (globalThis as { process?: { env?: Record<string, string> } }).process?.env?.REPORT_MEASUREMENT;
    if (reportMeasurement === '1') console.info(JSON.stringify({ profiles: 36, talents: 720, confidences, insufficientBefore: legacyInsufficient, insufficientAfter: insufficient }));
  });

  it('does not turn 95%+ completion into Low confidence', () => {
    for (const profile of SYNTHETIC_PROFILES) {
      const answers = profile.responses.slice(0, -1);
      expect(answers.length / QUICK_DISCOVERY_QUESTIONS.length).toBeGreaterThanOrEqual(0.95);
      const talents = runCareerDiscoveryPipeline(answers).talentProfile.baseTalents;
      expect(talents.every(({ confidence }) => confidence.level !== 'low')).toBe(true);
    }
  });

  it('treats three answered competing choices as measured low strength, not missing evidence', () => {
    const target = 'communication' as const;
    const relevant = QUICK_DISCOVERY_QUESTIONS.filter((question) =>
      question.options.some((option) => target in (option.talentSignals ?? {})),
    );
    const responses = relevant.map((question) => ({
      questionId: question.id,
      selectedOptionIds: [question.options.find((option) => option.id !== target)!.id],
      scaleValue: question.type === 'behavior' || question.type === 'evidence' ? 5 : undefined,
      answeredAt: '2026-08-12T00:00:00.000Z',
    }));
    const talent = scoreBaseTalents(runAssessment(QUICK_DISCOVERY_QUESTIONS, responses))
      .find(({ talentId }) => talentId === target)!;

    expect(talent.score).toBe(0);
    expect(talent.measurement.positiveSignals).toBe(0);
    expect(talent.measurement.negativeOrCompetingSignals).toBe(3);
    expect(talent.confidence.level).toBe('high');
    expect(talent.status).toBe('observed_not_prominent');
  });

  it('keeps ability demand fit unchanged when only energy or confidence changes', () => {
    const pipeline = runCareerDiscoveryPipeline(SYNTHETIC_PROFILES[0].responses);
    const career = CAREER_PROFILES[0];
    const baseline = matchCareer(career, pipeline.matchInput);
    const changed = matchCareer(career, {
      ...pipeline.matchInput,
      talentScores: pipeline.matchInput.talentScores.map((talent) => ({
        ...talent,
        energyScore: -1,
        confidence: { ...talent.confidence, level: 'low' },
      })),
    });

    expect(changed.talentMatch).toBe(baseline.talentMatch);
    expect(changed.confidence).not.toBe('high');
  });
});
