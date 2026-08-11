import { CAREER_PROFILES, PUBLIC_CAREER_GROUPS } from '../data/careers';
import { QUICK_DISCOVERY_QUESTIONS } from '../data/questions';
import { BASE_TALENTS } from '../data/talents';
import { careerDemandCapabilityScore } from './talent-engine';
import type {
  AbilityAlignment,
  CareerMatchResult,
  CareerProfile,
  ConfidenceLevel,
  Evidence,
  InterpretationRiskLevel,
  PublicCareerGroup,
  PublicCareerInterpretation,
  PublicCareerResults,
  PositiveEvidenceGateResult,
  Question,
  QuestionResponse,
  RecommendationSource,
  RecommendationStrength,
  SpecificCareerInterpretation,
  TalentId,
  TalentRequirementImportance,
  TalentScore,
  UserSignalLevel,
  UserTalentProfile,
} from '../types';

const confidenceRank: Record<ConfidenceLevel, number> = { low: 0, medium: 1, high: 2 };

const TALENT_TASK_WORDS: Record<TalentId, readonly string[]> = {
  analytical_reasoning: ['分析', '原因', '問題', '風險', '評估', '判讀'],
  pattern_recognition: ['規律', '趨勢', '比較', '異常', '反覆', '找出'],
  quantitative_reasoning: ['資料', '數字', '預測', '成本', '量', '成效'],
  verbal_reasoning: ['文字', '說明', '內容', '敘事', '建議', '表達'],
  spatial_mechanical: ['空間', '設備', '工具', '圖面', '原型', '動線'],
  creative_ideation: ['設計', '想法', '方案', '內容', '故事', '原型'],
  learning_agility: ['了解', '學習', '新', '調整', '解決'],
  structuring_ambiguity: ['整理', '釐清', '流程', '需求', '規劃', '轉成'],
  emotional_perception: ['需求', '觀察', '感到', '顧慮', '陪伴', '使用者'],
  communication: ['說明', '協調', '訪談', '溝通', '相關的人', '確認'],
  influence: ['推進', '協商', '訊息', '提案', '決定', '影響'],
  teaching_coaching: ['教學', '學習', '練習', '引導', '陪伴', '協助'],
  coordination: ['協調', '安排', '確認', '交接', '人力', '合作'],
  conflict_navigation: ['顧慮', '不同', '客訴', '問題', '協商', '相關的人'],
  initiative: ['推進', '執行', '開始', '做出', '處理', '行動'],
  planning: ['規劃', '安排', '步驟', '時間', '流程', '行程'],
  prioritization: ['優先', '決定', '風險', '重新安排', '取捨'],
  precision: ['檢查', '核對', '品質', '規範', '測試', '確認'],
  adaptability: ['變化', '突發', '調整', '修正', '重新安排'],
  persistence: ['追蹤', '完成', '反覆', '改善', '修補', '維修'],
};

const average = (values: readonly number[]) => values.length
  ? values.reduce((sum, value) => sum + value, 0) / values.length
  : 0;

function responseEvidenceForTalent(
  talentId: TalentId,
  responses: readonly QuestionResponse[],
  questions: readonly Question[],
): Evidence[] {
  const responseByQuestion = new Map(responses.map((response) => [response.questionId, response]));
  return questions.flatMap((question) => {
    const testsTalent = question.options.some((option) => talentId in (option.talentSignals ?? {}));
    const response = responseByQuestion.get(question.id);
    if (!testsTalent || !response) return [];
    const optionIds = response.ranking?.length ? response.ranking : response.selectedOptionIds;
    const labels = optionIds.map((id) => question.options.find((option) => option.id === id)?.label).filter(Boolean);
    if (!labels.length) return [];
    return [{
      id: `answer_${question.id}_${talentId}`,
      source: 'question' as const,
      questionId: question.id,
      optionId: optionIds[0],
      talentId,
      description: `題目「${question.prompt}」回答「${labels.join('；')}」。`,
      strength: 0,
    }];
  });
}

function signalLevel(talent: TalentScore): UserSignalLevel {
  const adequateOpportunity = (talent.measurement?.answeredOpportunities ?? talent.confidence.evidenceCount) >= 2
    && talent.confidence.questionCoverage >= 0.5;
  if (!adequateOpportunity) return 'insufficient_evidence';
  if (talent.score >= 0.65) return 'high';
  if (talent.score >= 0.4) return 'moderate';
  return 'low';
}

function alignmentLevel(
  level: UserSignalLevel,
  score: number,
  demand: number,
): AbilityAlignment['alignment'] {
  if (level === 'insufficient_evidence') return 'unknown';
  if (score >= Math.min(1, demand + 0.12)) return 'exceeds_requirement';
  if (score >= demand * 0.8 || score >= demand - 0.12) return 'meets_requirement';
  if (score >= demand * 0.45) return 'partial_gap';
  return 'significant_gap';
}

function importanceBands(requirements: ReadonlyMap<TalentId, number>) {
  const sorted = [...requirements.entries()].sort(([, a], [, b]) => b - a);
  const maximum = sorted[0]?.[1] ?? 0;
  return new Map(sorted.map(([talentId, demand], index): [TalentId, TalentRequirementImportance] => [
    talentId,
    index < 2 || demand >= maximum * 0.82 ? 'core' : index < 4 || demand >= maximum * 0.58 ? 'supporting' : 'minor',
  ]));
}

function buildAbilityAlignmentsFromRequirements(
  requirements: ReadonlyMap<TalentId, number>,
  tasks: readonly string[],
  talentScores: readonly TalentScore[],
  responses: readonly QuestionResponse[],
  questions: readonly Question[],
): AbilityAlignment[] {
  const importanceByTalent = importanceBands(requirements);

  return [...requirements.entries()]
    .flatMap(([talentId, careerDemand]): AbilityAlignment[] => {
      const talent = talentScores.find((item) => item.talentId === talentId);
      const definition = BASE_TALENTS.find((item) => item.id === talentId);
      if (!talent || !definition) return [];
      const level = signalLevel(talent);
      const demandCapability = careerDemandCapabilityScore(talentScores, talentId);
      const positiveEvidence = talent.evidence.filter(({ description, strength }) => description.length > 0 && strength > 0);
      const alignment = alignmentLevel(level, demandCapability.capability, careerDemand);
      const userEvidence = (positiveEvidence.length
        ? positiveEvidence
        : responseEvidenceForTalent(talentId, responses, questions)).slice(0, 3);
      const taskWords = TALENT_TASK_WORDS[talentId];
      const rankedTasks = tasks
        .map((task, index) => ({ task, index, hits: taskWords.filter((word) => task.includes(word)).length }))
        .sort((a, b) => b.hits - a.hits || a.index - b.index);
      const matchedTasks = rankedTasks.filter(({ hits }) => hits > 0).map(({ task }) => task);
      const relevantCareerTasks = [...new Set(matchedTasks.length ? matchedTasks : tasks)].slice(0, 2);
      const evidenceText = positiveEvidence[0]?.description ?? '目前的作答還沒有在足夠多種情境中形成一致訊號。';
      const explanation = alignment === 'unknown'
        ? `這份工作會在「${relevantCareerTasks[0]}」使用「${definition.nameZh}」；目前測驗還沒有足夠不同情境的回答，判斷它是不是你的穩定優勢。`
        : alignment === 'significant_gap'
          ? `目前在不同情境裡，「${definition.nameZh}」較少成為你的自然反應；而這份工作會在「${relevantCareerTasks[0]}」經常使用它。這代表需要額外適應，不等於你做不到。`
          : alignment === 'partial_gap'
            ? `你目前在「${definition.nameZh}」已出現可用訊號，但還沒有完全達到這類工作在「${relevantCareerTasks[0]}」的常用程度；可用短任務確認實際差距。`
            : `${evidenceText} 這些回答顯示你的「${definition.nameZh}」${alignment === 'exceeds_requirement' ? '高於' : '達到'}這類工作的主要需求，會用在「${relevantCareerTasks.join('」與「')}」。`;
      return [{
        talentId,
        talentName: definition.nameZh,
        userEvidence,
        userSignalLevel: level,
        userAbilityScore: talent.score,
        demandCapabilityScore: demandCapability.capability,
        relativeTalentPercentile: demandCapability.relativePercentile,
        careerDemand,
        importance: importanceByTalent.get(talentId) ?? 'minor',
        relevantCareerTasks,
        alignment,
        explanation,
      }];
    })
    .sort((a, b) => b.careerDemand - a.careerDemand)
    .slice(0, 5);
}

function publicRequirements(profiles: readonly CareerProfile[]) {
  const values = new Map<TalentId, { maximum: number; occurrences: number }>();
  for (const profile of profiles) {
    for (const [talentId, demand] of Object.entries(profile.talentRequirements) as Array<[TalentId, number]>) {
      const current = values.get(talentId) ?? { maximum: 0, occurrences: 0 };
      values.set(talentId, { maximum: Math.max(current.maximum, demand), occurrences: current.occurrences + 1 });
    }
  }
  return new Map([...values.entries()].map(([talentId, value]) => [
    talentId,
    value.maximum * (0.75 + value.occurrences / profiles.length * 0.25),
  ]));
}

function careerRequirements(profile: CareerProfile) {
  return new Map(Object.entries(profile.talentRequirements) as Array<[TalentId, number]>);
}

function riskFromEnvironment(matches: readonly CareerMatchResult[]): InterpretationRiskLevel {
  const score = average(matches.map((match) => match.environmentMatch));
  const severeCount = matches.filter((match) => match.environmentMatch < 0.45).length;
  if (score < 0.48 || severeCount > matches.length / 2) return 'high';
  if (score < 0.68) return 'moderate';
  return 'low';
}

function riskFromEnergy(profiles: readonly CareerProfile[], talentScores: readonly TalentScore[]): InterpretationRiskLevel {
  const drains = talentScores.filter((talent) => {
    const demand = Math.max(...profiles.map((profile) => profile.talentRequirements[talent.talentId] ?? 0));
    return demand >= 0.5 && talent.energyScore !== null && talent.energyScore <= -0.5;
  });
  if (drains.some((talent) => Math.max(...profiles.map((profile) => profile.talentRequirements[talent.talentId] ?? 0)) >= 0.8) || drains.length >= 2) return 'high';
  return drains.length ? 'moderate' : 'low';
}

function aggregateConfidence(matches: readonly CareerMatchResult[]): ConfidenceLevel {
  const score = average(matches.map((match) => confidenceRank[match.confidence]));
  return score >= 1.5 ? 'high' : score >= 0.75 ? 'medium' : 'low';
}

export function evaluatePositiveEvidenceGate(
  alignments: readonly AbilityAlignment[],
  confidence: ConfidenceLevel,
  environmentFriction: InterpretationRiskLevel,
  energyRisk: InterpretationRiskLevel,
  specificCareerSupportBreadth = 1,
): PositiveEvidenceGateResult {
  const positive = alignments.filter(({ alignment }) => alignment === 'exceeds_requirement' || alignment === 'meets_requirement');
  const corePositive = positive.filter(({ importance }) => importance === 'core');
  const strongAlignmentCount = alignments.filter(({ alignment }) => alignment === 'exceeds_requirement').length;
  const moderateAlignmentCount = alignments.filter(({ alignment }) => alignment === 'meets_requirement').length;
  const lowOverlapCount = alignments.filter(({ alignment }) => alignment === 'significant_gap').length;
  const insufficientEvidenceCount = alignments.filter(({ alignment }) => alignment === 'unknown').length;
  const reasons: string[] = [];
  if (positive.length < 2) reasons.push('重要能力中少於兩項達到這類工作的需求。');
  if (corePositive.length < 1) reasons.push('核心能力目前沒有一項達到工作需求。');
  if (lowOverlapCount >= 2) reasons.push('有兩項以上重要能力仍有明顯需求差距。');
  if (confidence === 'low') reasons.push('目前分析信心不足以支持強烈推薦。');
  if (environmentFriction === 'high') reasons.push('存在重大的工作環境摩擦。');
  if (energyRisk === 'high') reasons.push('存在重大的能量消耗風險。');
  if (specificCareerSupportBreadth < 0.5) reasons.push('分組內具有正向能力支持的細職業不足一半。');
  const passed = reasons.length === 0;
  const absoluteEvidenceQuality = passed && strongAlignmentCount >= 1
    ? 'strong'
    : positive.length >= 2 && corePositive.length >= 1
      ? 'moderate'
      : insufficientEvidenceCount >= Math.ceil(alignments.length / 2)
        ? 'insufficient'
        : 'weak';
  return {
    passed,
    absoluteEvidenceQuality,
    positiveAlignmentCount: positive.length,
    corePositiveAlignmentCount: corePositive.length,
    strongAlignmentCount,
    moderateAlignmentCount,
    lowOverlapCount,
    insufficientEvidenceCount,
    specificCareerSupportBreadth,
    reasons,
  };
}

interface RecommendationDecisionInput {
  relativePercentile: number;
  fitSeparation: number;
  evidenceGate: PositiveEvidenceGateResult;
  interestAlignment: number;
  workStyleAlignment: number;
  environmentFriction: InterpretationRiskLevel;
  energyRisk: InterpretationRiskLevel;
  explicitMismatch: boolean;
}

export function decideRecommendation(input: RecommendationDecisionInput): {
  classification: PublicCareerInterpretation['classification'];
  recommendationStrength: RecommendationStrength;
  recommendationSource: RecommendationSource;
} {
  const abilitySupport = input.evidenceGate.positiveAlignmentCount >= 2;
  const interestSupport = input.interestAlignment >= 0.55;
  const environmentSupport = input.workStyleAlignment >= 0.55 && input.environmentFriction === 'low';
  const recommendationSource: RecommendationSource = abilitySupport && (interestSupport || environmentSupport)
    ? 'mixed'
    : abilitySupport
      ? 'ability_led'
      : interestSupport
        ? 'interest_led'
        : environmentSupport
          ? 'environment_led'
          : 'weak_relative';
  const strong = input.relativePercentile >= 0.75
    && input.fitSeparation >= 0.015
    && input.evidenceGate.passed
    && input.interestAlignment >= 0.4
    && input.workStyleAlignment >= 0.4;
  const lower = input.relativePercentile <= 0.3
    && input.fitSeparation <= -0.015
    && input.explicitMismatch;
  if (strong) return { classification: 'strong', recommendationStrength: 'strong_recommendation', recommendationSource };
  if (lower) return { classification: 'lower', recommendationStrength: 'not_priority', recommendationSource };
  const recommendationStrength: RecommendationStrength = input.evidenceGate.positiveAlignmentCount > 0
    ? 'moderate_recommendation'
    : 'exploratory';
  return { classification: 'moderate', recommendationStrength, recommendationSource };
}

function buildRecommendationReasons(
  alignments: readonly AbilityAlignment[],
  interestAlignment: number,
  workStyleAlignment: number,
  environmentFriction: InterpretationRiskLevel,
) {
  const reasons = alignments
    .filter(({ alignment }) => alignment === 'exceeds_requirement' || alignment === 'meets_requirement')
    .sort((a, b) => (a.importance === 'core' ? -1 : 0) - (b.importance === 'core' ? -1 : 0) || b.careerDemand - a.careerDemand)
    .slice(0, 2)
    .map(({ talentName, relevantCareerTasks, alignment }) => `你的「${talentName}」${alignment === 'exceeds_requirement' ? '高於' : '達到'}這類工作的需求，會用在「${relevantCareerTasks[0]}」。`);
  if (interestAlignment >= 0.55) reasons.push('你偏好的活動方向與這類工作的主要內容有明顯重疊。');
  if (workStyleAlignment >= 0.55) reasons.push('這類工作的日常做事方式接近你目前偏好的方式。');
  if (environmentFriction === 'low') reasons.push('主要工作環境要求大致落在你目前可接受的範圍。');
  return reasons.slice(0, 3);
}

function buildLimitingReasons(
  alignments: readonly AbilityAlignment[],
  classification: PublicCareerInterpretation['classification'],
  interestAlignment: number,
  workStyleAlignment: number,
  environmentFriction: InterpretationRiskLevel,
  energyRisk: InterpretationRiskLevel,
  evidenceGate: PositiveEvidenceGateResult,
) {
  const reasons: string[] = [];
  if (environmentFriction === 'high') reasons.push('工作環境有一項以上的要求明顯高於你目前的耐受範圍。');
  else if (environmentFriction === 'moderate') reasons.push('部分工作環境要求與你的偏好有落差，需要查看實際職位。');
  if (energyRisk === 'high') reasons.push('這類工作會高頻使用目前顯示明顯能量消耗的能力；你可能做得到，但長期使用可能較累。');
  else if (energyRisk === 'moderate') reasons.push('其中一項常用能力可能帶來能量消耗，需要留意使用頻率。');
  for (const item of alignments.filter(({ alignment, importance }) => alignment === 'significant_gap' && importance !== 'minor').slice(0, 2)) {
    reasons.push(`「${item.talentName}」有足夠作答機會但目前重疊較少，而它是這類工作的${item.importance === 'core' ? '核心' : '常用'}能力。`);
  }
  if (interestAlignment < 0.45) reasons.push('你目前表達的興趣與這類工作的主要活動重疊較少；這是興趣訊號，不是能力判斷。');
  if (workStyleAlignment < 0.45) reasons.push('這類工作的日常做事方式與你目前偏好的方式有較多差異。');
  const unknown = alignments.filter(({ alignment }) => alignment === 'unknown');
  if (unknown.length && classification !== 'lower') reasons.push(`「${unknown.slice(0, 2).map(({ talentName }) => talentName).join('、')}」尚待更多不同情境的回答確認。`);
  if (classification === 'moderate' && !reasons.length) reasons.push(...evidenceGate.reasons.slice(0, 2));
  return reasons;
}

interface InterpretPublicCareersInput {
  matches: readonly CareerMatchResult[];
  talentProfile: UserTalentProfile;
  responses?: readonly QuestionResponse[];
  questions?: readonly Question[];
  careers?: readonly CareerProfile[];
  groups?: readonly PublicCareerGroup[];
}

export function interpretPublicCareers({
  matches,
  talentProfile,
  responses = [],
  questions = QUICK_DISCOVERY_QUESTIONS,
  careers = CAREER_PROFILES,
  groups = PUBLIC_CAREER_GROUPS,
}: InterpretPublicCareersInput): PublicCareerResults {
  const matchById = new Map(matches.map((match) => [match.careerId, match]));
  const careerById = new Map(careers.map((career) => [career.id, career]));
  const aggregates = groups.map((group) => {
    const groupMatches = group.specificCareerIds.map((id) => matchById.get(id)).filter((match): match is CareerMatchResult => Boolean(match));
    const groupProfiles = group.specificCareerIds.map((id) => careerById.get(id)).filter((career): career is CareerProfile => Boolean(career));
    if (!groupMatches.length || !groupProfiles.length) throw new Error(`Public career group ${group.id} has no matching career data.`);
    const sortedMatches = [...groupMatches].sort((a, b) => b.matchScore - a.matchScore);
    const groupScore = sortedMatches[0].matchScore * 0.7 + average(sortedMatches.map((match) => match.matchScore)) * 0.3;
    return { group, groupMatches: sortedMatches, groupProfiles, groupScore };
  }).sort((a, b) => b.groupScore - a.groupScore);

  const median = aggregates[Math.floor(aggregates.length / 2)]?.groupScore ?? 0;
  const sortedSpecificMatches = [...matches].sort((a, b) => b.matchScore - a.matchScore);
  const specificMedian = sortedSpecificMatches[Math.floor(sortedSpecificMatches.length / 2)]?.matchScore ?? 0;
  const count = aggregates.length;
  const all = aggregates.map((aggregate, index): PublicCareerInterpretation => {
    const { group, groupMatches, groupProfiles, groupScore } = aggregate;
    const abilityAlignment = buildAbilityAlignmentsFromRequirements(
      publicRequirements(groupProfiles),
      group.dailyTasks,
      talentProfile.baseTalents,
      responses,
      questions,
    );
    const environmentFriction = riskFromEnvironment(groupMatches);
    const energyRisk = riskFromEnergy(groupProfiles, talentProfile.baseTalents);
    const confidence = aggregateConfidence(groupMatches);
    const relativePercentile = count <= 1 ? 1 : 1 - index / (count - 1);
    const talentOverlap = average(groupMatches.map((match) => match.talentMatch));
    const interestAlignment = average(groupMatches.map((match) => match.interestMatch));
    const workStyleAlignment = average(groupMatches.map((match) => match.workStyleMatch));
    const fitSeparation = groupScore - median;
    const specificEvidence = groupProfiles.map((profile) => {
      const specificMatch = groupMatches.find(({ careerId }) => careerId === profile.id)!;
      const specificAlignments = buildAbilityAlignmentsFromRequirements(
        careerRequirements(profile),
        profile.coreTasks,
        talentProfile.baseTalents,
        responses,
        questions,
      );
      const positives = specificAlignments.filter(({ alignment }) => alignment === 'exceeds_requirement' || alignment === 'meets_requirement');
      const specificGate = evaluatePositiveEvidenceGate(
        specificAlignments,
        specificMatch.confidence,
        riskFromEnvironment([specificMatch]),
        riskFromEnergy([profile], talentProfile.baseTalents),
      );
      const specificIndex = sortedSpecificMatches.findIndex(({ careerId }) => careerId === profile.id);
      const specificEnvironmentFriction = riskFromEnvironment([specificMatch]);
      const specificEnergyRisk = riskFromEnergy([profile], talentProfile.baseTalents);
      const specificCoreLowOverlap = specificAlignments.some(({ alignment, importance }) => alignment === 'significant_gap' && importance === 'core');
      const specificDecision = decideRecommendation({
        relativePercentile: sortedSpecificMatches.length <= 1 ? 1 : 1 - specificIndex / (sortedSpecificMatches.length - 1),
        fitSeparation: specificMatch.matchScore - specificMedian,
        evidenceGate: specificGate,
        interestAlignment: specificMatch.interestMatch,
        workStyleAlignment: specificMatch.workStyleMatch,
        environmentFriction: specificEnvironmentFriction,
        energyRisk: specificEnergyRisk,
        explicitMismatch: specificEnvironmentFriction === 'high' || specificEnergyRisk === 'high' || specificCoreLowOverlap || (specificMatch.interestMatch < 0.38 && specificMatch.workStyleMatch < 0.5),
      });
      return {
        careerId: profile.id,
        positiveCount: positives.length,
        corePositiveCount: positives.filter(({ importance }) => importance === 'core').length,
        gatePassed: specificGate.passed,
        strongRecommendation: specificDecision.recommendationStrength === 'strong_recommendation',
        alignments: specificAlignments,
      };
    });
    const supportedSpecificCareers = specificEvidence.filter(({ strongRecommendation }) => strongRecommendation);
    const specificCareerSupportBreadth = supportedSpecificCareers.length / groupProfiles.length;
    const positiveEvidenceGate = evaluatePositiveEvidenceGate(
      abilityAlignment,
      confidence,
      environmentFriction,
      energyRisk,
      specificCareerSupportBreadth,
    );
    const preferenceMismatch = interestAlignment < 0.38 && workStyleAlignment < 0.5;
    const coreLowOverlap = abilityAlignment.filter(({ alignment, importance }) => alignment === 'significant_gap' && importance === 'core').length;
    const explicitMismatch = environmentFriction === 'high' || energyRisk === 'high' || coreLowOverlap >= 1 || preferenceMismatch;
    const decision = decideRecommendation({
      relativePercentile,
      fitSeparation,
      evidenceGate: positiveEvidenceGate,
      interestAlignment,
      workStyleAlignment,
      environmentFriction,
      energyRisk,
      explicitMismatch,
    });
    const matchingReasons = buildRecommendationReasons(abilityAlignment, interestAlignment, workStyleAlignment, environmentFriction);
    if (!matchingReasons.length && relativePercentile >= 0.7) matchingReasons.push('它在目前收錄的方向中相對靠前，但正向能力證據仍未集中。');
    const limitingReasons = buildLimitingReasons(
      abilityAlignment,
      decision.classification,
      interestAlignment,
      workStyleAlignment,
      environmentFriction,
      energyRisk,
      positiveEvidenceGate,
    );
    const representativeCareerId = [...specificEvidence]
      .sort((a, b) => {
        const aMatch = groupMatches.find(({ careerId }) => careerId === a.careerId)?.matchScore ?? 0;
        const bMatch = groupMatches.find(({ careerId }) => careerId === b.careerId)?.matchScore ?? 0;
        return Number(b.strongRecommendation) - Number(a.strongRecommendation) || Number(b.gatePassed) - Number(a.gatePassed) || b.corePositiveCount - a.corePositiveCount || b.positiveCount - a.positiveCount || bMatch - aMatch;
      })[0]?.careerId ?? groupMatches[0].careerId;

    return {
      publicCareerId: group.id,
      title: group.title,
      description: group.description,
      classification: decision.classification,
      recommendationStrength: decision.recommendationStrength,
      recommendationSource: decision.recommendationSource,
      positiveEvidenceGate,
      specificCareerIds: [...group.specificCareerIds],
      commonTitles: [...group.commonTitles],
      dailyTasks: [...group.dailyTasks],
      representativeCareerId,
      relativeRank: index + 1,
      relativePercentile,
      fitSeparation,
      confidence,
      talentOverlap,
      interestAlignment,
      workStyleAlignment,
      environmentFriction,
      energyRisk,
      abilityAlignment,
      matchingReasons,
      limitingReasons,
      supportingEvidenceIds: [...new Set(abilityAlignment.flatMap((item) => item.userEvidence.map(({ id }) => id)))],
      underlyingMatches: groupMatches,
    };
  });

  return {
    strong: all.filter(({ classification }) => classification === 'strong'),
    moderate: all.filter(({ classification }) => classification === 'moderate'),
    lower: all.filter(({ classification }) => classification === 'lower'),
    all,
  };
}

interface InterpretSpecificCareerInput extends InterpretPublicCareersInput {
  careerId: string;
}

export function interpretSpecificCareer({
  careerId,
  matches,
  talentProfile,
  responses = [],
  questions = QUICK_DISCOVERY_QUESTIONS,
  careers = CAREER_PROFILES,
  groups = PUBLIC_CAREER_GROUPS,
}: InterpretSpecificCareerInput): SpecificCareerInterpretation {
  const career = careers.find(({ id }) => id === careerId);
  const match = matches.find((item) => item.careerId === careerId);
  const group = groups.find(({ specificCareerIds }) => (specificCareerIds as readonly string[]).includes(careerId));
  if (!career || !match || !group) throw new Error(`Cannot interpret unknown career ${careerId}.`);
  const sortedMatches = [...matches].sort((a, b) => b.matchScore - a.matchScore);
  const index = sortedMatches.findIndex((item) => item.careerId === careerId);
  const relativeRank = index + 1;
  const relativePercentile = sortedMatches.length <= 1 ? 1 : 1 - index / (sortedMatches.length - 1);
  const median = sortedMatches[Math.floor(sortedMatches.length / 2)]?.matchScore ?? 0;
  const fitSeparation = match.matchScore - median;
  const abilityAlignment = buildAbilityAlignmentsFromRequirements(
    careerRequirements(career),
    career.coreTasks,
    talentProfile.baseTalents,
    responses,
    questions,
  );
  const environmentFriction = riskFromEnvironment([match]);
  const energyRisk = riskFromEnergy([career], talentProfile.baseTalents);
  const positiveEvidenceGate = evaluatePositiveEvidenceGate(
    abilityAlignment,
    match.confidence,
    environmentFriction,
    energyRisk,
  );
  const preferenceMismatch = match.interestMatch < 0.38 && match.workStyleMatch < 0.5;
  const coreLowOverlap = abilityAlignment.some(({ alignment, importance }) => alignment === 'significant_gap' && importance === 'core');
  const decision = decideRecommendation({
    relativePercentile,
    fitSeparation,
    evidenceGate: positiveEvidenceGate,
    interestAlignment: match.interestMatch,
    workStyleAlignment: match.workStyleMatch,
    environmentFriction,
    energyRisk,
    explicitMismatch: environmentFriction === 'high' || energyRisk === 'high' || coreLowOverlap || preferenceMismatch,
  });
  const matchingReasons = buildRecommendationReasons(
    abilityAlignment,
    match.interestMatch,
    match.workStyleMatch,
    environmentFriction,
  );
  if (!matchingReasons.length && relativePercentile >= 0.7) {
    matchingReasons.push('這份工作在目前 60 種職業中相對靠前，但能力證據還沒有集中到足以形成強推薦。');
  }
  return {
    careerId,
    publicCareerId: group.id,
    publicCareerTitle: group.title,
    classification: decision.classification,
    recommendationStrength: decision.recommendationStrength,
    recommendationSource: decision.recommendationSource,
    positiveEvidenceGate,
    relativeRank,
    confidence: match.confidence,
    environmentFriction,
    energyRisk,
    abilityAlignment,
    matchingReasons,
    limitingReasons: buildLimitingReasons(
      abilityAlignment,
      decision.classification,
      match.interestMatch,
      match.workStyleMatch,
      environmentFriction,
      energyRisk,
      positiveEvidenceGate,
    ),
    componentScores: {
      talent: match.talentMatch,
      interest: match.interestMatch,
      workStyle: match.workStyleMatch,
      environment: match.environmentMatch,
      environmentPenalty: Math.max(0, 1 - match.environmentMatch),
      values: match.valuesMatch,
      transferableSkills: match.transferableSkillsMatch,
    },
  };
}

export function buildPrimaryCareerPresentation(
  results: PublicCareerResults,
  surpriseCareerIds: readonly string[] = [],
  limits = { strong: 4, moderate: 4, lower: 3, surprise: 3 },
) {
  const strong = results.strong.slice(0, limits.strong);
  const moderate = results.moderate.filter(({ matchingReasons, positiveEvidenceGate }) =>
    matchingReasons.length > 0 || positiveEvidenceGate.positiveAlignmentCount > 0,
  ).slice(0, limits.moderate);
  const fallback = strong.length === 0 ? results.moderate.slice(0, limits.moderate) : [];
  const lower = results.lower.slice(0, limits.lower);
  const surpriseIds = new Set(surpriseCareerIds);
  const surprise = surpriseIds.size
    ? results.all.filter(({ specificCareerIds }) => specificCareerIds.some((careerId) => surpriseIds.has(careerId))).slice(0, limits.surprise)
    : [];
  const summary = strong.length
    ? `目前有 ${strong.length} 類工作同時具有較完整的能力證據。`
    : '目前沒有能力證據足夠集中的單一方向；相對排名靠前的結果會以探索方向呈現。';
  return { strong, moderate, fallback, lower, surprise, summary };
}
