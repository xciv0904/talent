import { CAREER_PROFILES } from '../data/careers';
import {
  ENVIRONMENT_DIMENSIONS,
  INTEREST_DIMENSIONS,
  WORK_STYLE_DIMENSIONS,
  type CareerDirection,
  type CareerDirectionId,
  type DecisionClarity,
  type EntryDistanceLevel,
  type ExplorationPriorityInput,
  type ExplorationPriorityResult,
  type GuidedChoicePrompt,
  type PrioritizedCareerDirection,
} from '../types';

export const SCORE_PROXIMITY_EPSILON = 0.017;

const distanceRank: Record<EntryDistanceLevel, number> = { low: 0, medium: 1, high: 2, very_high: 3 };
const confidenceRank = { low: 0, medium: 1, high: 2 } as const;
const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

const dimensionQuestion: Record<string, string> = {
  investigative: '遇到陌生題目時，你比較願意把時間放在哪一種工作活動？',
  social: '如果每天都要和人互動，你比較願意用哪一種方式投入？',
  artistic: '哪一種創作或表達成果比較容易讓你想繼續修改？',
  realistic: '你比較願意透過哪一種具體操作確認事情有進展？',
  enterprising: '需要推動一個結果時，你比較願意承擔哪一類工作？',
  conventional: '面對大量細節時，哪一種整理方式比較能維持你的投入？',
  socialDensity: '哪一種日常互動密度比較接近你願意長期承受的工作？',
  emotionalLabor: '哪一種需要承接他人情緒的方式比較不容易消耗你？',
  structure: '你比較願意在什麼程度的制度與明確流程中工作？',
  ambiguity: '資訊還不完整時，你比較願意先處理哪一類不確定性？',
  pace: '哪一種工作節奏比較能讓你維持品質與投入？',
  mobility: '你比較願意把時間投入在哪一種工作場域？',
  repetition: '面對重複任務時，哪一類內容比較能讓你持續？',
  risk: '需要承擔決策後果時，你比較願意負責哪一類結果？',
  independent: '你比較願意獨立完成哪一類工作活動？',
  collaborative: '需要合作時，你比較願意和別人一起完成什麼？',
  strategic: '你比較願意把時間放在判斷方向，還是立即處理眼前任務？',
  hands_on: '哪一種動手產出比較容易讓你感到有進展？',
  detail_focused: '哪一類細節值得你長時間檢查與修正？',
  facilitative: '你比較願意用哪一種方式幫助一群人向前推進？',
};

const dimensionLabel = (direction: CareerDirection, value: number) => {
  const pattern = direction.sharedWorkPatterns.slice(0, 2).join('、');
  const intensity = value >= 0.65 ? '會經常需要' : value >= 0.4 ? '會固定包含' : '只占一部分';
  return `${direction.title}：${intensity}${pattern}`;
};

function directionVector(direction: CareerDirection) {
  const careers = direction.careerIds.map((id) => CAREER_PROFILES.find((career) => career.id === id)).filter(Boolean);
  const values: Record<string, number> = {};
  for (const dimension of INTEREST_DIMENSIONS) values[dimension] = mean(careers.map((career) => career!.interestProfile[dimension]));
  for (const dimension of ENVIRONMENT_DIMENSIONS) values[dimension] = mean(careers.map((career) => career!.environmentProfile[dimension]));
  for (const dimension of WORK_STYLE_DIMENSIONS) values[dimension] = mean(careers.map((career) => career!.workStyle[dimension]));
  return values;
}

export function buildDynamicTieBreaker(directions: CareerDirection[]): GuidedChoicePrompt[] {
  const candidates = directions.slice(0, 3);
  if (candidates.length < 2) return [];
  const vectors = new Map(candidates.map((direction) => [direction.id, directionVector(direction)]));
  const dimensions = [...INTEREST_DIMENSIONS, ...ENVIRONMENT_DIMENSIONS, ...WORK_STYLE_DIMENSIONS]
    .map((dimension) => {
      const values = candidates.map(({ id }) => vectors.get(id)![dimension]);
      return { dimension, range: Math.max(...values) - Math.min(...values) };
    })
    .sort((a, b) => b.range - a.range)
    .slice(0, 2);
  const preference = dimensions.map(({ dimension }) => ({
    id: `preference_${dimension}`,
    kind: 'preference' as const,
    dimension,
    question: dimensionQuestion[dimension] ?? '哪一種工作活動比較值得你先花時間了解？',
    options: candidates.map((direction) => ({ directionId: direction.id, label: dimensionLabel(direction, vectors.get(direction.id)![dimension]) })),
  }));
  return [...preference, {
    id: 'elimination_energy',
    kind: 'elimination',
    dimension: 'energy_drain',
    question: '哪一種工作內容最容易讓你覺得消耗？',
    options: candidates.map((direction) => ({ directionId: direction.id, label: `${direction.title}：${direction.potentialFrictions[0] ?? direction.sharedWorkPatterns.join('、')}` })),
  }];
}

export const buildGuidedChoice = buildDynamicTieBreaker;

function proximityClusters(directions: CareerDirection[]) {
  const clusters: CareerDirection[][] = [];
  for (const direction of [...directions].sort((a, b) => b.averageFit - a.averageFit)) {
    const current = clusters.at(-1);
    if (!current || current[0].averageFit - direction.averageFit > SCORE_PROXIMITY_EPSILON) clusters.push([direction]);
    else current.push(direction);
  }
  return clusters;
}

export function buildExplorationPriority(input: ExplorationPriorityInput): ExplorationPriorityResult {
  const clusters = proximityClusters(input.directions);
  const tieDirections = clusters[0]?.length > 1 ? clusters[0] : input.directions.slice(0, 2);
  const prompts = buildDynamicTieBreaker(tieDirections);
  const promptById = new Map(prompts.map((prompt) => [prompt.id, prompt]));
  const tieNet = new Map<CareerDirectionId, number>();
  Object.entries(input.tieBreakerAnswers ?? {}).forEach(([promptId, directionId]) => {
    const prompt = promptById.get(promptId);
    if (!prompt || !prompt.options.some((option) => option.directionId === directionId)) return;
    tieNet.set(directionId, (tieNet.get(directionId) ?? 0) + (prompt.kind === 'elimination' ? -1 : 1));
  });
  const energyRisk = (direction: CareerDirection) => {
    const scores = direction.sharedTalents.map((id) => input.talentProfile?.baseTalents.find(({ talentId }) => talentId === id)?.energyScore).filter((value): value is number => value !== null && value !== undefined);
    return scores.length ? scores.filter((value) => value < 0).length / scores.length : 0;
  };
  const averageEntry = (direction: CareerDirection) => mean(direction.careerIds.map((id) => distanceRank[input.matches.find(({ careerId }) => careerId === id)?.entryDistance.level ?? 'very_high']));
  const orderedClusters = clusters.map((cluster) => [...cluster].sort((a, b) =>
    (tieNet.get(b.id) ?? 0) - (tieNet.get(a.id) ?? 0) ||
    confidenceRank[b.confidence] - confidenceRank[a.confidence] ||
    energyRisk(a) - energyRisk(b) ||
    averageEntry(a) - averageEntry(b) ||
    a.potentialFrictions.length - b.potentialFrictions.length ||
    b.averageFit - a.averageFit,
  ));
  const topCluster = orderedClusters[0] ?? [];
  const nets = topCluster.map(({ id }) => tieNet.get(id) ?? 0).sort((a, b) => b - a);
  const answeredPreferences = Object.keys(input.tieBreakerAnswers ?? {}).filter((id) => promptById.get(id)?.kind === 'preference').length;
  let decisionClarity: DecisionClarity = 'ambiguous';
  if (topCluster.length === 1) decisionClarity = topCluster[0].confidence === 'low' || topCluster[0].supportingEvidence.length === 0 ? 'ambiguous' : 'clear';
  else if (answeredPreferences >= 2 && (nets[0] ?? 0) - (nets[1] ?? 0) >= 2) decisionClarity = 'moderate';
  const directions: PrioritizedCareerDirection[] = orderedClusters.flatMap((cluster, clusterIndex) => cluster.map((direction, index) => ({
    ...direction,
    proximityCluster: clusterIndex,
    energyDrainRisk: energyRisk(direction),
    tieBreakerNet: tieNet.get(direction.id) ?? 0,
    explorationPriority: clusterIndex === 0
      ? decisionClarity === 'ambiguous' ? 'equally_worth' : index === 0 ? 'priority' : 'equally_worth'
      : clusterIndex === 1 ? 'compare' : 'not_priority',
  })));
  const requiresTieBreaker = topCluster.length > 1 || decisionClarity === 'ambiguous';
  return {
    directions,
    decisionClarity,
    proximityEpsilon: SCORE_PROXIMITY_EPSILON,
    requiresTieBreaker,
    tiedDirectionIds: (requiresTieBreaker ? tieDirections : topCluster).map(({ id }) => id),
    interpretation: decisionClarity === 'clear'
      ? '目前有一個方向的相對位置與證據較明確，可以直接優先探索。'
      : decisionClarity === 'moderate'
        ? '比較題提供了探索偏好，但其他方向仍值得保留，不代表唯一答案。'
        : topCluster.length > 1
          ? `目前收錄的職業中，沒有出現非常集中的單一方向；其中有 ${topCluster.length} 個方向差距不大，還不足以合理排出唯一第一名。`
          : '目前收錄的職業中，沒有出現非常集中的單一方向；先比較兩個方向會比硬排第一名更可靠。',
  };
}

export function careerRelativePosition(matches: ExplorationPriorityInput['matches'], careerId: string) {
  const rank = matches.findIndex((match) => match.careerId === careerId) + 1;
  return { rank, total: matches.length, label: rank > 0 ? `在目前收錄的 ${matches.length} 種工作中，位於你的前 ${rank} 名` : '目前沒有可用排名' };
}
