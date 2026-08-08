import { BASE_TALENTS } from '../data/talents';
import {
  ENVIRONMENT_DIMENSIONS,
  INTEREST_DIMENSIONS,
  CAREER_MATCH_VALUE_DIMENSIONS,
  WORK_STYLE_DIMENSIONS,
  type CareerMatchInput,
  type CareerMatchResult,
  type CareerProfile,
  type DimensionVector,
  type EnvironmentDimension,
  type TalentId,
} from '../types';
import { calculateEntryDistance } from './entry-distance-engine';
import { clamp } from './talent-engine';

export const CAREER_MATCH_WEIGHTS = {
  talent: 0.35,
  interest: 0.18,
  workStyle: 0.15,
  environment: 0.15,
  values: 0.1,
  transferableSkills: 0.07,
} as const;

const DIMENSION_LABELS: Record<string, string> = {
  realistic: '實作、工具與實體問題', investigative: '研究、分析與探索', artistic: '創意與表達',
  social: '助人、教學與互動', enterprising: '影響、推動與商業', conventional: '秩序、資料與程序', socialDensity: '社交密度',
  pace: '工作節奏', ambiguity: '模糊程度', mobility: '移動需求', risk: '風險責任', repetition: '重複程度',
  emotionalLabor: '情緒勞動', structure: '制度結構',
};

const dimensionMatch = <TDimension extends string>(
  dimensions: readonly TDimension[],
  user: DimensionVector<TDimension>,
  career: DimensionVector<TDimension>,
) => {
  const weightedDifference = dimensions.reduce(
    (sum, dimension) => sum + Math.abs(user[dimension] - career[dimension]) * Math.max(0.25, career[dimension]),
    0,
  );
  const weight = dimensions.reduce((sum, dimension) => sum + Math.max(0.25, career[dimension]), 0);
  return clamp(1 - weightedDifference / weight);
};

export interface EnvironmentMatchDetails {
  score: number;
  supportive: EnvironmentDimension[];
  frictions: EnvironmentDimension[];
}

export function calculateEnvironmentMatch(
  tolerance: DimensionVector<EnvironmentDimension>,
  demand: DimensionVector<EnvironmentDimension>,
): EnvironmentMatchDetails {
  let penalty = 0;
  let maximumOverrun = 0;
  const supportive: EnvironmentDimension[] = [];
  const frictions: EnvironmentDimension[] = [];

  for (const dimension of ENVIRONMENT_DIMENSIONS) {
    const gap = demand[dimension] - tolerance[dimension];
    if (gap > 0) {
      penalty += gap * 1.75;
      maximumOverrun = Math.max(maximumOverrun, gap);
      if (gap >= 0.2) frictions.push(dimension);
    } else {
      penalty += Math.abs(gap) * 0.65;
      if (Math.abs(gap) <= 0.2) supportive.push(dimension);
    }
  }

  const dominantMismatchPenalty = maximumOverrun * 0.35;
  return {
    score: clamp(1 - penalty / ENVIRONMENT_DIMENSIONS.length - dominantMismatchPenalty),
    supportive,
    frictions,
  };
}

const talentMatch = (career: CareerProfile, user: CareerMatchInput) => {
  const scoreByTalent = new Map(user.talentScores.map((item) => [item.talentId, item.score]));
  const requirements = Object.entries(career.talentRequirements) as Array<[TalentId, number]>;
  const weight = requirements.reduce((sum, [, required]) => sum + required, 0);
  if (weight === 0) return 0;
  return requirements.reduce(
    (sum, [talentId, required]) => {
      const talent = user.talentScores.find((item) => item.talentId === talentId);
      const confidenceFactor = talent?.confidence.level === 'high' ? 1 : talent?.confidence.level === 'medium' ? 0.7 : 0.35;
      const energyFactor = talent?.energyScore === null || talent?.energyScore === undefined
        ? 0.85
        : clamp(0.75 + talent.energyScore * 0.25, 0.5, 1);
      return sum + Math.min(1, ((scoreByTalent.get(talentId) ?? 0) * confidenceFactor * energyFactor) / required) * required;
    },
    0,
  ) / weight;
};

const skillMatch = (career: CareerProfile, user: CareerMatchInput) => {
  const weight = career.skills.reduce((sum, skill) => sum + skill.importance, 0);
  if (weight === 0) return 0;
  return career.skills.reduce(
    (sum, skill) => sum + clamp(user.transferableSkills[skill.id] ?? 0) * skill.importance,
    0,
  ) / weight;
};

const confidenceFor = (career: CareerProfile, user: CareerMatchInput): CareerMatchResult['confidence'] => {
  const requiredIds = new Set(Object.keys(career.talentRequirements));
  const relevant = user.talentScores.filter((item) => requiredIds.has(item.talentId));
  if (relevant.length === 0) return 'low';
  const rank = { low: 0, medium: 1, high: 2 } as const;
  const average = relevant.reduce((sum, item) => sum + rank[item.confidence.level], 0) / relevant.length;
  return average >= 1.6 ? 'high' : average >= 0.8 ? 'medium' : 'low';
};

export function matchCareer(career: CareerProfile, user: CareerMatchInput): CareerMatchResult {
  const talent = talentMatch(career, user);
  const interest = dimensionMatch(INTEREST_DIMENSIONS, user.interestProfile, career.interestProfile) * (user.profileCoverage?.interest ?? 1);
  const workStyle = dimensionMatch(WORK_STYLE_DIMENSIONS, user.workStyle, career.workStyle) * (user.profileCoverage?.workStyle ?? 1);
  const environmentDetails = calculateEnvironmentMatch(user.environmentTolerance, career.environmentProfile);
  const environment = environmentDetails.score * (user.profileCoverage?.environment ?? 1);
  const values = dimensionMatch(CAREER_MATCH_VALUE_DIMENSIONS, user.valuesProfile, career.valuesProfile) * (user.profileCoverage?.values ?? 1);
  const skills = skillMatch(career, user);
  const matchScore =
    talent * CAREER_MATCH_WEIGHTS.talent +
    interest * CAREER_MATCH_WEIGHTS.interest +
    workStyle * CAREER_MATCH_WEIGHTS.workStyle +
    environment * CAREER_MATCH_WEIGHTS.environment +
    values * CAREER_MATCH_WEIGHTS.values +
    skills * CAREER_MATCH_WEIGHTS.transferableSkills;

  const talentDefinitionById = new Map(BASE_TALENTS.map((item) => [item.id, item]));
  const talentReasonDetails = (Object.entries(career.talentRequirements) as Array<[TalentId, number]>)
    .map(([talentId, required]) => ({
      talentId,
      required,
      user: user.talentScores.find((item) => item.talentId === talentId),
    }))
    .filter((item) => item.user && item.user.score >= 0.55 && item.user.confidence.level !== 'low')
    .sort((a, b) => b.required * b.user!.score - a.required * a.user!.score)
    .slice(0, 3)
    .map((item, index) => {
      const talentName = talentDefinitionById.get(item.talentId)?.nameZh ?? item.talentId;
      const task = career.coreTasks[index % career.coreTasks.length];
      const answerEvidence = item.user!.evidence
        .filter(({ source, description }) => source === 'question' && description.length > 0)
        .slice(0, 2)
        .map(({ description }) => description)
        .join('；');
      const reason = answerEvidence
        ? `${answerEvidence} 這些回答形成「${talentName}」訊號，而這份工作會在「${task}」用到它。`
        : `現有行為證據形成「${talentName}」訊號，而這份工作會在「${task}」用到它。`;
      return { talentId: item.talentId, reason, evidenceIds: item.user!.evidence.map((evidence) => evidence.id) };
    });
  const topTalentReasons = talentReasonDetails.map(({ reason }) => reason);
  const interestReasons = INTEREST_DIMENSIONS
    .filter((dimension) => career.interestProfile[dimension] >= 0.6 && user.interestProfile[dimension] >= 0.6)
    .sort((a, b) => career.interestProfile[b] - career.interestProfile[a])
    .slice(0, 3)
    .map((dimension) => `你對${DIMENSION_LABELS[dimension]}的興趣與此職業相符。`);
  const environmentReasons = environmentDetails.supportive
    .slice(0, 3)
    .map((dimension) => `這份工作的「${DIMENSION_LABELS[dimension]}」落在你的可接受範圍。`);
  const potentialFrictions = environmentDetails.frictions.map(
    (dimension) => `這份工作對「${DIMENSION_LABELS[dimension]}」的要求高於你目前的耐受度。`,
  );
  const missingSkills = career.skills
    .filter((skill) => (user.transferableSkills[skill.id] ?? 0) < 0.4)
    .slice(0, 2)
    .map((skill) => `需要補強 ${skill.name}。`);
  potentialFrictions.push(...missingSkills);
  potentialFrictions.push(
    ...user.talentScores
      .filter(
        (talent) =>
          talent.talentId in career.talentRequirements &&
          talent.energyScore !== null &&
          talent.energyScore <= -0.5,
      )
      .slice(0, 2)
      .map(
        (talent) =>
          `${talentDefinitionById.get(talent.talentId)?.nameZh ?? talent.talentId}雖可能做得到，但目前顯示明顯能量消耗。`,
      ),
  );
  const supportingEvidenceIds = talentReasonDetails.flatMap((reason) => reason.evidenceIds);

  return {
    careerId: career.id,
    family: career.family,
    matchScore,
    talentMatch: talent,
    interestMatch: interest,
    workStyleMatch: workStyle,
    environmentMatch: environment,
    valuesMatch: values,
    transferableSkillsMatch: skills,
    confidence: confidenceFor(career, user),
    entryDistance: calculateEntryDistance(career, user),
    topTalentReasons,
    talentReasonDetails,
    interestReasons,
    environmentReasons,
    potentialFrictions,
    supportingEvidenceIds: [...new Set(supportingEvidenceIds)],
  };
}

export function matchCareers(careers: readonly CareerProfile[], user: CareerMatchInput): CareerMatchResult[] {
  return careers.map((career) => matchCareer(career, user)).sort((a, b) => b.matchScore - a.matchScore);
}
