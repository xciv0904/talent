import { BASE_TALENTS } from '../data/talents';
import type { CareerMatchResult, CareerProfile, ExperienceFeeling, ExperienceGuidance, TalentId, TalentScore } from '../types';

const talentWorkMeaning: Record<TalentId, string> = {
  analytical_reasoning: '遇到複雜問題時，你能先拆開原因，而不是急著猜答案。',
  pattern_recognition: '資訊零散時，你常能看出重複線索與可能的規律。',
  quantitative_reasoning: '需要比較選項時，你能用數字與差異支持判斷。',
  verbal_reasoning: '你能把文字與論點整理清楚，減少理解落差。',
  spatial_mechanical: '面對實體系統時，你能理解部件與空間如何一起運作。',
  creative_ideation: '卡在單一路徑時，你能提出幾個不同做法供人比較。',
  learning_agility: '進入陌生題目時，你能從回饋快速補齊理解。',
  structuring_ambiguity: '資訊很亂時，你通常能先抓出範圍、重點與下一步。',
  emotional_perception: '互動中，你會注意對方沒有直接說出口的需求與顧慮。',
  communication: '理解不同時，你能換一種說法並確認彼此是否真的對齊。',
  influence: '需要推動決定時，你會先理解對方在意什麼，再提出理由。',
  teaching_coaching: '別人卡住時，你能拆小步驟並用提問或回饋幫助他前進。',
  coordination: '多人合作時，你會留意角色、資訊與交付之間的銜接。',
  conflict_navigation: '意見不一致時，你能把分歧說清楚並尋找可前進的做法。',
  initiative: '事情還沒完整定義時，你願意先啟動一個有用的小步驟。',
  planning: '面對目標時，你能排出階段、資源與實際行動。',
  prioritization: '時間有限時，你能判斷哪件事應該先做。',
  precision: '交付前，你會注意規格、細節與容易出錯的地方。',
  adaptability: '情況改變時，你能調整方法而不失去原本目標。',
  persistence: '遇到阻礙時，你能持續試不同方法直到出現進展。',
};

export const workMeaningForTalent = (talentId: TalentId) => talentWorkMeaning[talentId];

export function buildWorkPatternSummary(topTalentIds: TalentId[]): string {
  const has = (ids: TalentId[]) => ids.some((id) => topTalentIds.includes(id));
  const parts: string[] = [];
  if (has(['analytical_reasoning', 'pattern_recognition', 'structuring_ambiguity', 'quantitative_reasoning'])) parts.push('先理解問題、整理資訊並抓出重點');
  if (has(['emotional_perception', 'communication', 'coordination', 'teaching_coaching'])) parts.push('理解別人的需要並把不同想法說清楚');
  if (has(['planning', 'prioritization', 'initiative', 'adaptability', 'persistence'])) parts.push('把下一步排出來，讓事情真的往前走');
  if (has(['creative_ideation', 'spatial_mechanical', 'learning_agility', 'verbal_reasoning'])) parts.push('用新的做法或快速學習，把概念變成可用成果');
  const selected = parts.slice(0, 3);
  return selected.length
    ? `你比較容易在需要${selected.join('，再')}的工作裡發揮。`
    : '你比較容易在任務清楚、能逐步累積證據並確認成果的工作裡發揮。';
}

export interface CareerExperiencePlan {
  purpose: string;
  duration: string;
  requirements: string[];
  outcome: string;
  steps: string[];
}

export function buildCareerExperiencePlan(career: CareerProfile): CareerExperiencePlan {
  const primaryTask = career.coreTasks[0] ?? career.description;
  const secondTask = career.coreTasks[1] ?? primaryTask;
  return {
    purpose: `不是測你會不會成為${career.titleZh}，而是確認你對「${primaryTask}」這類工作活動有沒有興趣，以及做完後是投入還是消耗。`,
    duration: '20 分鐘',
    requirements: ['手機或電腦', '紙筆或備忘錄', '一個你熟悉的小題目'],
    outcome: '你會知道自己對這類工作活動是有興趣、普通，還是很消耗。',
    steps: [
      `選一個小題目，範圍只需要能讓你嘗試「${primaryTask}」。`,
      `花 5 分鐘寫下：這個題目現在有什麼問題？理想結果應該是什麼？`,
      `花 10 分鐘做一份很小的產出，模擬「${secondTask}」。不求完整，只求可以檢視。`,
      '停下來記錄：哪一步最吸引你？哪一步開始消耗？你會不會想再做一次？',
    ],
  };
}

export function guidanceFromFeeling(feeling: ExperienceFeeling): ExperienceGuidance {
  if (feeling === 'engaged' || feeling === 'interesting') return 'continue';
  if (feeling === 'neutral') return 'try_another';
  return 'deprioritize';
}

export function buildEntryPath(career: CareerProfile, match?: CareerMatchResult, userTalents: TalentScore[] = []) {
  const matchedStrengths = match?.talentReasonDetails.slice(0, 3).map(({ reason }) => reason) ?? [];
  const fallbackStrengths = [...userTalents]
    .filter(({ talentId, evidence }) => (career.talentRequirements[talentId] ?? 0) > 0 && evidence.length > 0)
    .sort((a, b) => ((career.talentRequirements[b.talentId] ?? 0) * b.score) - ((career.talentRequirements[a.talentId] ?? 0) * a.score))
    .slice(0, 3)
    .map(({ talentId }) => `你在「${BASE_TALENTS.find(({ id }) => id === talentId)?.nameZh ?? talentId}」已有作答證據，可帶進這類工作。`);
  const strengths = matchedStrengths.length ? matchedStrengths : fallbackStrengths;
  const gaps = match?.entryDistance.reasons.length
    ? match.entryDistance.reasons.slice(0, 4)
    : career.skills.slice(0, 3).map(({ name }) => `先了解工作中如何使用「${name}」`);
  let firstAction = `找 3 份 ${career.titleZh} 的入門職缺，記下重複出現的任務與技能。`;
  if (career.entryRequirements.professionalLicenses.length) firstAction = `確認「${career.entryRequirements.professionalLicenses[0]}」的正式資格與申請條件。`;
  else if (career.entryRequirements.portfolio) firstAction = `用 30 分鐘找 3 份入門作品集，記下最常見的作品類型。`;
  else if (career.entryRequirements.certifications.length) firstAction = `先查清楚「${career.entryRequirements.certifications[0]}」是否為入門職缺的必要條件。`;
  return { strengths, gaps, firstAction };
}
