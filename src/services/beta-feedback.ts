import { CURRENT_RESULT_VERSIONS } from '../config/versions';
import { CAREER_PROFILES } from '../data/careers';
import { QUICK_DISCOVERY_QUESTIONS } from '../data/questions';
import { aggregateQuestionSignals, runAssessment } from '../engine';
import {
  ENVIRONMENT_DIMENSIONS,
  type CareerFeedbackChoice,
  type OverallFeedbackChoice,
  type NextStepClarityChoice,
  type QuestionFeedbackReason,
  type SurpriseFeedbackChoice,
  type TalentAgreementChoice,
  type TalentDiscoveryChoice,
} from '../types';
import type { AppStorageState } from './storage';
import { updateAppState } from './storage';

const timestamp = () => new Date().toISOString();
const upsert = <T>(items: readonly T[], predicate: (item: T) => boolean, next: T) => [
  ...items.filter((item) => !predicate(item)),
  next,
];

export function markAssessmentStarted(): void {
  updateAppState((state) => state.betaFeedback.assessmentStartedAt ? state : ({
    ...state,
    betaFeedback: { ...state.betaFeedback, assessmentStartedAt: timestamp(), timestamp: timestamp() },
  }));
}

export function markAssessmentCompleted(): void {
  const value = timestamp();
  updateAppState((state) => ({
    ...state,
    betaFeedback: { ...state.betaFeedback, assessmentStartedAt: state.betaFeedback.assessmentStartedAt ?? value, assessmentCompletedAt: value, timestamp: value },
  }));
}

export function saveOverallFeedback(response: OverallFeedbackChoice): void {
  updateAppState((state) => ({ ...state, betaFeedback: { ...state.betaFeedback, overallFeedback: response, timestamp: timestamp() } }));
}

export function saveNextStepClarity(response: NextStepClarityChoice): void {
  updateAppState((state) => ({ ...state, betaFeedback: { ...state.betaFeedback, nextStepClarity: response, timestamp: timestamp() } }));
}

export function saveTalentFeedback(compositeTalentId: string, update: { agreement?: TalentAgreementChoice; discovery?: TalentDiscoveryChoice }): void {
  updateAppState((state) => {
    const existing = state.betaFeedback.talentFeedback.find((item) => item.compositeTalentId === compositeTalentId);
    const next = { ...existing, compositeTalentId, ...update, timestamp: timestamp() };
    return { ...state, betaFeedback: { ...state.betaFeedback, timestamp: next.timestamp, talentFeedback: upsert(state.betaFeedback.talentFeedback, (item) => item.compositeTalentId === compositeTalentId, next) } };
  });
}

export function saveCareerFeedback(careerId: string, response: CareerFeedbackChoice): void {
  const value = timestamp();
  updateAppState((state) => ({ ...state, betaFeedback: { ...state.betaFeedback, timestamp: value, careerFeedback: upsert(state.betaFeedback.careerFeedback, (item) => item.careerId === careerId, { careerId, response, timestamp: value }) } }));
}

export function saveSurpriseFeedback(careerId: string, response: SurpriseFeedbackChoice): void {
  const value = timestamp();
  updateAppState((state) => ({ ...state, betaFeedback: { ...state.betaFeedback, timestamp: value, surpriseFeedback: upsert(state.betaFeedback.surpriseFeedback, (item) => item.careerId === careerId, { careerId, response, timestamp: value }) } }));
}

export function saveQuestionFeedback(questionId: string, reason: QuestionFeedbackReason): void {
  const value = timestamp();
  updateAppState((state) => ({ ...state, betaFeedback: { ...state.betaFeedback, timestamp: value, questionFeedback: upsert(state.betaFeedback.questionFeedback, (item) => item.questionId === questionId, { questionId, reason, timestamp: value }) } }));
}

export function saveOptionalComment(comment: string): void {
  updateAppState((state) => ({ ...state, betaFeedback: { ...state.betaFeedback, optionalComment: comment.trim().slice(0, 2000) || undefined, timestamp: timestamp() } }));
}

export function buildBetaFeedbackExport(state: AppStorageState) {
  return {
    exportType: 'career-discovery-beta-feedback',
    exportedAt: timestamp(),
    assessmentStatus: {
      answeredQuestionCount: state.answers.length,
      currentQuestionIndex: state.assessmentProgress.currentIndex,
      completed: state.assessmentProgress.completed,
    },
    feedback: state.betaFeedback,
  };
}

export function buildDiagnosticReport(state: AppStorageState) {
  if (!state.talentProfile || !state.careerResults) throw new Error('A completed assessment is required.');
  const assessment = runAssessment(QUICK_DISCOVERY_QUESTIONS, state.answers);
  const aggregatedSignals = aggregateQuestionSignals(QUICK_DISCOVERY_QUESTIONS, state.answers);
  const topCareerMatches = state.careerResults.matches.slice(0, 10).map((match) => {
    const career = CAREER_PROFILES.find(({ id }) => id === match.careerId)!;
    const gaps = ENVIRONMENT_DIMENSIONS.map((dimension) => career.environmentProfile[dimension] - state.careerResults!.profiles.environmentTolerance[dimension]);
    const penaltyByDimension = Object.fromEntries(ENVIRONMENT_DIMENSIONS.map((dimension) => {
      const gap = career.environmentProfile[dimension] - state.careerResults!.profiles.environmentTolerance[dimension];
      return [dimension, {
        demand: career.environmentProfile[dimension],
        tolerance: state.careerResults!.profiles.environmentTolerance[dimension],
        direction: gap > 0 ? 'demand_above_tolerance' : 'within_tolerance',
        weightedPenalty: gap > 0 ? gap * 1.75 : Math.abs(gap) * 0.65,
      }];
    }));
    return {
      careerId: match.careerId,
      matchScore: match.matchScore,
      componentScores: {
        talent: match.talentMatch,
        interest: match.interestMatch,
        workStyle: match.workStyleMatch,
        environment: match.environmentMatch,
        values: match.valuesMatch,
        transferableSkills: match.transferableSkillsMatch,
      },
      environmentPenalty: {
        byDimension: penaltyByDimension,
        asymmetricPenaltySum: Object.values(penaltyByDimension).reduce((sum, item) => sum + item.weightedPenalty, 0),
        dominantMismatchPenalty: Math.max(0, ...gaps) * 0.35,
      },
      entryDistance: match.entryDistance,
      confidence: match.confidence,
      supportingEvidenceIds: match.supportingEvidenceIds,
    };
  });
  return {
    exportType: 'career-discovery-diagnostic',
    exportedAt: timestamp(),
    sessionId: state.sessionId,
    versions: state.careerResults.versions ?? CURRENT_RESULT_VERSIONS,
    questionAnswers: state.answers,
    signalObservations: assessment.observations,
    aggregatedSignals,
    normalizedSignals: {
      baseTalents: state.talentProfile.baseTalents.map(({ talentId, score, energyScore, interestScore, confidence, status }) => ({ talentId, score, energyScore, interestScore, confidence, status })),
      interest: state.careerResults.profiles.interestProfile,
      workStyle: state.careerResults.profiles.workStyle,
      environment: state.careerResults.profiles.environmentTolerance,
      values: state.careerResults.profiles.valuesProfile,
    },
    compositeTalents: state.talentProfile.compositeTalents,
    topCareerMatches,
    resultCategories: Object.fromEntries(Object.entries(state.careerResults.categories).map(([key, matches]) => [key, matches.map(({ careerId }) => careerId)])),
  };
}

export function downloadJson(filename: string, value: unknown): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
