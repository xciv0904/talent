import { CAREER_PROFILES, PUBLIC_CAREER_GROUPS } from '../data/careers';
import { QUICK_DISCOVERY_QUESTIONS } from '../data/questions';
import { BASE_TALENTS } from '../data/talents';
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
  Question,
  QuestionResponse,
  TalentId,
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
  const adequateOpportunity = talent.confidence.level !== 'low'
    && talent.confidence.questionCoverage >= 0.75
    && talent.confidence.evidenceCount >= 4;
  if (!adequateOpportunity) return 'insufficient_evidence';
  if (talent.score >= 0.65) return 'high';
  if (talent.score >= 0.4) return 'moderate';
  return 'low';
}

function alignmentLevel(level: UserSignalLevel, score: number, demand: number): AbilityAlignment['alignment'] {
  if (level === 'insufficient_evidence') return 'insufficient_evidence';
  if (level === 'high' && score >= demand * 0.72) return 'strong';
  if ((level === 'high' || level === 'moderate') && score >= demand * 0.5) return 'moderate';
  return 'weak';
}

function relevantTasks(group: PublicCareerGroup, talentId: TalentId) {
  const plainTasks = [...group.dailyTasks];
  const words = TALENT_TASK_WORDS[talentId];
  const ranked = plainTasks
    .map((task, index) => ({ task, index, hits: words.filter((word) => task.includes(word)).length }))
    .sort((a, b) => b.hits - a.hits || a.index - b.index);
  const matched = ranked.filter(({ hits }) => hits > 0).map(({ task }) => task);
  return [...new Set(matched.length ? matched : plainTasks)].slice(0, 2);
}

function buildAbilityAlignments(
  group: PublicCareerGroup,
  talentScores: readonly TalentScore[],
  profiles: readonly CareerProfile[],
  responses: readonly QuestionResponse[],
  questions: readonly Question[],
): AbilityAlignment[] {
  const requirements = new Map<TalentId, { maximum: number; total: number; occurrences: number }>();
  for (const profile of profiles) {
    for (const [talentId, demand] of Object.entries(profile.talentRequirements) as Array<[TalentId, number]>) {
      const current = requirements.get(talentId) ?? { maximum: 0, total: 0, occurrences: 0 };
      current.maximum = Math.max(current.maximum, demand);
      current.total += demand;
      current.occurrences += 1;
      requirements.set(talentId, current);
    }
  }

  return [...requirements.entries()]
    .flatMap(([talentId, requirement]): AbilityAlignment[] => {
      const talent = talentScores.find((item) => item.talentId === talentId);
      const definition = BASE_TALENTS.find((item) => item.id === talentId);
      if (!talent || !definition) return [];
      const frequency = requirement.occurrences / profiles.length;
      const careerDemand = requirement.maximum * (0.75 + frequency * 0.25);
      const level = signalLevel(talent);
      const alignment = alignmentLevel(level, talent.score, careerDemand);
      const positiveEvidence = talent.evidence.filter(({ source, description }) => source === 'question' && description.length > 0);
      const userEvidence = (positiveEvidence.length
        ? positiveEvidence
        : responseEvidenceForTalent(talentId, responses, questions)).slice(0, 3);
      const tasks = relevantTasks(group, talentId);
      const evidenceText = userEvidence[0]?.description ?? '目前沒有足夠的跨題作答證據。';
      const explanation = alignment === 'insufficient_evidence'
        ? `目前測驗還沒有足夠、跨方法一致的證據判斷「${definition.nameZh}」，因此不能把未知當成能力不足。這類工作會在「${tasks[0]}」使用它。`
        : alignment === 'weak'
          ? `在已提供足夠作答機會的題目中，「${definition.nameZh}」沒有反覆成為你的主要反應；而這類工作會在「${tasks[0]}」經常使用它。這表示目前的自然反應重疊較少，不代表你做不到。`
          : `${evidenceText} 這些作答形成「${definition.nameZh}」的${alignment === 'strong' ? '明確' : '部分'}訊號；這類工作會在「${tasks.join('」與「')}」使用這項能力，因此${alignment === 'strong' ? '你較可能在這些日常任務中自然發揮' : '有實際重疊，但仍值得用真實任務確認'}。`;
      return [{
        talentId,
        talentName: definition.nameZh,
        userEvidence,
        userSignalLevel: level,
        careerDemand,
        relevantCareerTasks: tasks,
        alignment,
        explanation,
      }];
    })
    .sort((a, b) => b.careerDemand - a.careerDemand)
    .slice(0, 5);
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
  const count = aggregates.length;
  const all = aggregates.map((aggregate, index): PublicCareerInterpretation => {
    const { group, groupMatches, groupProfiles, groupScore } = aggregate;
    const abilityAlignment = buildAbilityAlignments(group, talentProfile.baseTalents, groupProfiles, responses, questions);
    const strongAbilities = abilityAlignment.filter(({ alignment }) => alignment === 'strong');
    const weakAbilities = abilityAlignment.filter(({ alignment }) => alignment === 'weak');
    const environmentFriction = riskFromEnvironment(groupMatches);
    const energyRisk = riskFromEnergy(groupProfiles, talentProfile.baseTalents);
    const confidence = aggregateConfidence(groupMatches);
    const relativePercentile = count <= 1 ? 1 : 1 - index / (count - 1);
    const talentOverlap = average(groupMatches.map((match) => match.talentMatch));
    const interestAlignment = average(groupMatches.map((match) => match.interestMatch));
    const workStyleAlignment = average(groupMatches.map((match) => match.workStyleMatch));
    const fitSeparation = groupScore - median;
    const strongEligible = relativePercentile >= 0.75
      && fitSeparation >= 0.015
      && strongAbilities.length >= 2
      && confidence !== 'low'
      && interestAlignment >= 0.45
      && workStyleAlignment >= 0.45
      && environmentFriction !== 'high'
      && energyRisk !== 'high';
    const preferenceMismatch = interestAlignment < 0.38 && workStyleAlignment < 0.5;
    const explicitMismatch = environmentFriction === 'high' || energyRisk === 'high' || weakAbilities.length >= 2 || preferenceMismatch;
    const lowerEligible = relativePercentile <= 0.3 && fitSeparation <= -0.015 && explicitMismatch;
    const classification = strongEligible ? 'strong' : lowerEligible ? 'lower' : 'moderate';

    const matchingReasons = strongAbilities.slice(0, 3).map(({ talentName, relevantCareerTasks }) =>
      `「${talentName}」有直接作答支持，會用在「${relevantCareerTasks[0]}」。`,
    );
    if (talentOverlap >= 0.55 && !strongAbilities.length) matchingReasons.push('整體能力訊號與這類工作的部分核心要求有重疊，但個別能力仍需更多直接證據。');
    if (interestAlignment >= 0.55) matchingReasons.push('你目前的興趣方向與這類工作的主要活動有重疊。');
    if (workStyleAlignment >= 0.55) matchingReasons.push('這類工作的做事方式大致落在你目前偏好的範圍。');
    if (environmentFriction === 'low') matchingReasons.push('這類工作的主要環境要求大致落在你目前可接受的範圍。');

    const limitingReasons: string[] = [];
    if (environmentFriction === 'high') limitingReasons.push('工作環境有一項以上的要求明顯高於你目前的耐受範圍。');
    else if (environmentFriction === 'moderate') limitingReasons.push('部分工作環境要求與你的偏好有落差，需要查看實際職位。');
    if (energyRisk === 'high') limitingReasons.push('這類工作高頻使用到目前顯示明顯能量消耗的能力；你可能做得到，但長期使用可能較累。');
    else if (energyRisk === 'moderate') limitingReasons.push('其中一項常用能力可能帶來能量消耗，需要留意使用頻率。');
    for (const item of weakAbilities.slice(0, 2)) limitingReasons.push(`「${item.talentName}」有足夠作答機會但目前重疊較少，而它是這類工作的常用能力。`);
    if (interestAlignment < 0.45) limitingReasons.push('你目前表達的興趣與這類工作的主要活動重疊較少；這是興趣訊號，不是能力判斷。');
    if (workStyleAlignment < 0.45) limitingReasons.push('這類工作的日常做事方式與你目前偏好的方式有較多差異。');
    const unknown = abilityAlignment.filter(({ alignment }) => alignment === 'insufficient_evidence');
    if (unknown.length && classification !== 'lower') limitingReasons.push(`「${unknown.slice(0, 2).map(({ talentName }) => talentName).join('、')}」目前證據不足，不能當成能力較弱。`);
    if (classification === 'moderate' && !limitingReasons.length) {
      limitingReasons.push('目前相對排序或直接支持的核心能力數量尚未同時達到「非常適合」的證據門檻。');
    }

    return {
      publicCareerId: group.id,
      title: group.title,
      description: group.description,
      classification,
      specificCareerIds: [...group.specificCareerIds],
      commonTitles: [...group.commonTitles],
      dailyTasks: [...group.dailyTasks],
      representativeCareerId: groupMatches[0].careerId,
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
