import { BASE_TALENTS } from '../data/talents';
import type {
  AssessmentResult,
  ConfidenceResult,
  Evidence,
  QuestionType,
  TalentId,
  TalentScore,
  TalentStatus,
} from '../types';

export const REQUIRED_QUESTION_COVERAGE = 3;

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function normalizeTalentScore(support: number, opportunity: number): number {
  if (opportunity <= 0) return 0;
  return clamp(support / opportunity);
}

interface ConfidenceInput {
  questionCoverage: number;
  crossMethodConsistency: number;
  evidenceQuality: number;
  evidenceCount: number;
  methodCount: number;
}

export function calculateConfidence(input: ConfidenceInput): ConfidenceResult {
  const reasons: string[] = [];
  const hasCrossMethodEvidence = input.methodCount >= 2;
  let level: ConfidenceResult['level'] = 'low';

  if (
    input.questionCoverage >= 0.75 &&
    hasCrossMethodEvidence &&
    input.crossMethodConsistency >= 0.75 &&
    input.evidenceQuality >= 0.65
  ) {
    level = 'high';
    reasons.push('題目覆蓋完整，跨方法結果一致，且證據品質足夠。');
  } else if (
    input.questionCoverage >= 0.5 &&
    hasCrossMethodEvidence &&
    input.crossMethodConsistency >= 0.45 &&
    input.evidenceQuality >= 0.5
  ) {
    level = 'medium';
    reasons.push('已有多種方法支持，但仍需要更多或更一致的證據。');
  } else {
    if (input.questionCoverage < 0.5) reasons.push('題目覆蓋不足。');
    if (!hasCrossMethodEvidence) reasons.push('尚缺少跨題型驗證。');
    if (input.crossMethodConsistency < 0.45) reasons.push('不同測量方法的結果不一致。');
    if (input.evidenceQuality < 0.55) reasons.push('現有證據品質偏低。');
  }

  return {
    level,
    evidenceCount: input.evidenceCount,
    questionCoverage: clamp(input.questionCoverage),
    crossMethodConsistency: clamp(input.crossMethodConsistency),
    evidenceQuality: clamp(input.evidenceQuality),
    reasons,
  };
}

export function determineTalentStatus(
  abilityScore: number,
  energyScore: number | null,
  interestScore: number | null,
  confidence: ConfidenceResult,
): TalentStatus {
  if (confidence.level === 'low') return 'insufficient_evidence';
  if (abilityScore >= 0.65 && energyScore !== null && energyScore > 0.15) return 'natural_strength';
  if (abilityScore >= 0.65) return 'developed_strength';
  if (interestScore !== null && interestScore >= 0.6 && abilityScore < 0.4) return 'interest_only';
  if (energyScore !== null && energyScore <= -0.5 && abilityScore < 0.65) return 'energy_drain';
  if (abilityScore >= 0.35 || (interestScore !== null && interestScore >= 0.35)) {
    return 'emerging_potential';
  }
  return 'observed_not_prominent';
}

const average = (values: number[]): number | null =>
  values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length;

const responseConsistency = (
  opportunities: AssessmentResult['talentOpportunities'],
  supportByQuestion: Map<string, number>,
): { consistency: number; methodCount: number } => {
  const methods = new Map<QuestionType, number[]>();
  for (const opportunity of opportunities) {
    const direction = (supportByQuestion.get(opportunity.questionId) ?? 0) > 0 ? 1 : 0;
    methods.set(opportunity.questionType, [...(methods.get(opportunity.questionType) ?? []), direction]);
  }
  const methodScores = [...methods.values()].map((values) => average(values) ?? 0);
  if (methodScores.length < 2) return { consistency: 0, methodCount: methodScores.length };
  const positiveRate = average(methodScores) ?? 0;
  return {
    // Agreement is directional, not a reward for a high score. Consistently not
    // selecting a talent is still a clear measurement result.
    consistency: Math.max(positiveRate, 1 - positiveRate),
    methodCount: methodScores.length,
  };
};

export function scoreBaseTalents(
  assessment: AssessmentResult,
  externalEvidence: readonly Evidence[] = [],
): TalentScore[] {
  return BASE_TALENTS.map(({ id: talentId }) => {
    const opportunities = assessment.talentOpportunities.filter(
      (opportunity) => opportunity.talentId === talentId,
    );
    const designedOpportunities = assessment.talentMeasurementOpportunities.filter(
      (opportunity) => opportunity.talentId === talentId,
    );
    const abilityObservations = assessment.observations.filter(
      (observation) => observation.channel === 'ability' && observation.key === talentId,
    );
    const supportByQuestion = new Map<string, number>();
    for (const observation of abilityObservations) {
      supportByQuestion.set(
        observation.questionId,
        (supportByQuestion.get(observation.questionId) ?? 0) + observation.value,
      );
    }

    const support = [...supportByQuestion.values()].reduce((sum, value) => sum + value, 0);
    const maximumSupport = opportunities.reduce((sum, item) => sum + item.maximumSignal, 0);
    const score = normalizeTalentScore(support, maximumSupport);
    const assessmentEvidence: Evidence[] = abilityObservations
      .filter((observation) => observation.value > 0)
      .map((observation) => ({
        id: `evidence_${observation.questionId}_${observation.optionId}_${talentId}`,
        source: 'question',
        questionId: observation.questionId,
        optionId: observation.optionId,
        talentId,
        description: `題目「${observation.questionPrompt}」回答「${observation.optionLabel}」。`,
        strength: clamp(observation.value),
      }));
    const relevantEvidence = [
      ...assessmentEvidence,
      ...externalEvidence.filter((item) => item.talentId === talentId),
    ];
    const evidenceQualityValues = opportunities.map((item) => item.evidenceQuality);
    const { consistency, methodCount } = responseConsistency(opportunities, supportByQuestion);
    const positiveSignals = opportunities.filter(
      ({ questionId }) => (supportByQuestion.get(questionId) ?? 0) > 0,
    ).length;
    const answeredOpportunities = opportunities.length;
    const measurementCoverage = designedOpportunities.length > 0
      ? answeredOpportunities / designedOpportunities.length
      : 0;
    const confidence = calculateConfidence({
      questionCoverage: measurementCoverage,
      crossMethodConsistency: consistency,
      evidenceQuality: average(evidenceQualityValues) ?? 0,
      evidenceCount: answeredOpportunities,
      methodCount,
    });

    const energyValues = assessment.observations
      .filter((observation) => observation.channel === 'energy' && observation.key === talentId)
      .map((observation) => observation.value);
    const interestValues = assessment.observations
      .filter((observation) => observation.channel === 'talent_interest' && observation.key === talentId)
      .map((observation) => observation.value);
    const energyScore = average(energyValues);
    const interestScore = average(interestValues);

    return {
      talentId,
      score,
      energyScore,
      interestScore,
      status: determineTalentStatus(score, energyScore, interestScore, confidence),
      confidence,
      measurement: {
        talentId,
        opportunities: designedOpportunities.length,
        answeredOpportunities,
        validResponses: answeredOpportunities,
        positiveSignals,
        negativeOrCompetingSignals: Math.max(0, answeredOpportunities - positiveSignals),
        crossContextConsistency: consistency,
        normalizedScore: score,
        confidence: confidence.level,
      },
      evidence: [...relevantEvidence],
    };
  });
}

export const talentScoreById = (scores: readonly TalentScore[], talentId: TalentId) =>
  scores.find((score) => score.talentId === talentId);

export function careerDemandCapabilityScore(
  scores: readonly TalentScore[],
  talentId: TalentId,
): { capability: number; relativePercentile: number } {
  const target = talentScoreById(scores, talentId);
  if (!target || scores.length < 2) return { capability: target?.score ?? 0, relativePercentile: 0 };
  const below = scores.filter((item) => item.score < target.score).length;
  const relativePercentile = below / (scores.length - 1);
  // Four-way forced choices make 0.25 an ordinary observed signal, while career
  // demand vectors describe relative importance. Preserve the absolute score,
  // but restore within-person rank for demand comparison only.
  return {
    capability: clamp(target.score * 0.4 + relativePercentile * 0.6),
    relativePercentile,
  };
}
