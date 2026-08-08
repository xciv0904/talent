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

export const REQUIRED_QUESTION_COVERAGE = 4;

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
    input.questionCoverage >= 1 &&
    hasCrossMethodEvidence &&
    input.crossMethodConsistency >= 0.7 &&
    input.evidenceQuality >= 0.7
  ) {
    level = 'high';
    reasons.push('題目覆蓋完整，跨方法結果一致，且證據品質足夠。');
  } else if (
    input.questionCoverage >= 0.5 &&
    hasCrossMethodEvidence &&
    input.crossMethodConsistency >= 0.45 &&
    input.evidenceQuality >= 0.55
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
  return 'insufficient_evidence';
}

const average = (values: number[]): number | null =>
  values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length;

const methodConsistency = (
  opportunities: AssessmentResult['talentOpportunities'],
  supportByQuestion: Map<string, number>,
): { consistency: number; methodCount: number } => {
  const methods = new Map<QuestionType, { support: number; opportunity: number }>();
  for (const opportunity of opportunities) {
    const current = methods.get(opportunity.questionType) ?? { support: 0, opportunity: 0 };
    current.support += supportByQuestion.get(opportunity.questionId) ?? 0;
    current.opportunity += opportunity.maximumSignal;
    methods.set(opportunity.questionType, current);
  }
  const methodScores = [...methods.values()].map(({ support, opportunity }) =>
    normalizeTalentScore(support, opportunity),
  );
  if (methodScores.length < 2) return { consistency: 0, methodCount: methodScores.length };
  return {
    consistency: 1 - (Math.max(...methodScores) - Math.min(...methodScores)),
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
    const evidenceQualityValues = [
      ...opportunities.map((item) => item.evidenceQuality),
      ...relevantEvidence.map((item) => clamp(item.strength)),
    ];
    const { consistency, methodCount } = methodConsistency(opportunities, supportByQuestion);
    const confidence = calculateConfidence({
      questionCoverage: opportunities.length / REQUIRED_QUESTION_COVERAGE,
      crossMethodConsistency: consistency,
      evidenceQuality: average(evidenceQualityValues) ?? 0,
      evidenceCount: opportunities.length + relevantEvidence.length,
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
      evidence: [...relevantEvidence],
    };
  });
}

export const talentScoreById = (scores: readonly TalentScore[], talentId: TalentId) =>
  scores.find((score) => score.talentId === talentId);
