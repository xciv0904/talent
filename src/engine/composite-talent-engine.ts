import { COMPOSITE_TALENTS } from '../data/talents';
import type {
  CompositeTalent,
  CompositeTalentScore,
  ConfidenceResult,
  TalentScore,
} from '../types';
import { clamp, determineTalentStatus } from './talent-engine';

const levelRank: Record<ConfidenceResult['level'], number> = { low: 0, medium: 1, high: 2 };

export function scoreCompositeTalent(
  definition: CompositeTalent,
  baseScores: readonly TalentScore[],
): CompositeTalentScore {
  const components = definition.components
    .map((talentId) => baseScores.find((score) => score.talentId === talentId))
    .filter((score): score is TalentScore => score !== undefined);
  const totalWeight = definition.components.reduce(
    (sum, talentId) => sum + (definition.weights[talentId] ?? 0),
    0,
  );
  const weighted = (selector: (score: TalentScore) => number | null): number | null => {
    let value = 0;
    let availableWeight = 0;
    for (const component of components) {
      const selected = selector(component);
      if (selected === null) continue;
      const weight = definition.weights[component.talentId] ?? 0;
      value += selected * weight;
      availableWeight += weight;
    }
    return availableWeight > 0 ? value / availableWeight : null;
  };

  const score = totalWeight > 0 ? (weighted((component) => component.score) ?? 0) : 0;
  const energyScore = weighted((component) => component.energyScore);
  const interestScore = weighted((component) => component.interestScore);
  const evidenceCount = components.reduce(
    (sum, component) => sum + component.confidence.evidenceCount,
    0,
  );
  const averageMetric = (selector: (confidence: ConfidenceResult) => number) =>
    components.length === 0
      ? 0
      : components.reduce((sum, item) => sum + selector(item.confidence), 0) / components.length;
  const minimumLevel = components.reduce(
    (lowest, component) => Math.min(lowest, levelRank[component.confidence.level]),
    2,
  );
  const level: ConfidenceResult['level'] =
    evidenceCount < definition.minimumEvidence || minimumLevel === 0
      ? 'low'
      : minimumLevel === 1
        ? 'medium'
        : 'high';
  const confidence: ConfidenceResult = {
    level,
    evidenceCount,
    questionCoverage: clamp(averageMetric((item) => item.questionCoverage)),
    crossMethodConsistency: clamp(averageMetric((item) => item.crossMethodConsistency)),
    evidenceQuality: clamp(averageMetric((item) => item.evidenceQuality)),
    reasons: [
      level === 'high'
        ? '所有組成 Talent 都有高信心且符合最低證據要求。'
        : '至少一個組成 Talent 仍需要更多或更一致的證據。',
    ],
  };

  return {
    compositeTalentId: definition.id,
    score,
    energyScore,
    status: determineTalentStatus(score, energyScore, interestScore, confidence),
    confidence,
  };
}

export function scoreCompositeTalents(baseScores: readonly TalentScore[]): CompositeTalentScore[] {
  return COMPOSITE_TALENTS.map((definition) => scoreCompositeTalent(definition, baseScores));
}
