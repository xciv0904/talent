import { CAREER_PROFILES } from '../data/careers';
import type {
  CareerDirection,
  CareerDirectionId,
  CareerDirectionInput,
  CareerFamily,
  CareerMatchResult,
  EntryDistanceLevel,
  TalentId,
} from '../types';

interface DirectionRule {
  id: CareerDirectionId;
  title: string;
  description: string;
  families: CareerFamily[];
  workPatterns: [string, string, string, string];
  tradeoffActivity: string;
  tradeoffOutcome: string;
  tradeoffQuestion: string;
}

export const CAREER_DIRECTION_RULES: readonly DirectionRule[] = [
  { id: 'insight_research', title: '洞察與研究', description: '理解問題、觀察人與資料，再從線索中找出可採取行動的結論。', families: ['research', 'product'], workPatterns: ['釐清問題', '蒐集觀察', '找出模式', '整理洞察'], tradeoffActivity: '訪談或蒐集資料，找出問題為什麼發生', tradeoffOutcome: '先把問題看清楚，再提出判斷', tradeoffQuestion: '花時間理解問題背後的原因' },
  { id: 'people_problem_solving', title: '人際溝通與問題解決', description: '理解不同人的需求，透過溝通、協調與建議解決實際問題。', families: ['human_resources', 'customer_success', 'sales', 'consulting'], workPatterns: ['理解需求', '說明選項', '協調立場', '推進解決'], tradeoffActivity: '和人對話、理解需求並協調可行做法', tradeoffOutcome: '讓對方更清楚，也讓事情能往前走', tradeoffQuestion: '處理人與人之間的需求和落差' },
  { id: 'planning_delivery', title: '規劃與推進', description: '把目標拆成步驟，安排資源與優先順序，讓多人工作如期落地。', families: ['operations', 'public_service'], workPatterns: ['拆解任務', '安排順序', '協調資源', '處理變動'], tradeoffActivity: '整理事情、安排下一步並追蹤進度', tradeoffOutcome: '把混亂變成可執行的計畫', tradeoffQuestion: '把事情組織好並確實完成' },
  { id: 'creative_content', title: '創意與內容', description: '把概念轉成文字、視覺或體驗，讓內容更清楚、更有吸引力。', families: ['design', 'marketing', 'media', 'creative'], workPatterns: ['發展概念', '理解受眾', '製作內容', '反覆修改'], tradeoffActivity: '想概念、製作內容並根據回饋調整', tradeoffOutcome: '把想法變成別人看得見的作品', tradeoffQuestion: '創造新的表達方式或體驗' },
  { id: 'data_analysis', title: '數據與分析', description: '整理數字與證據，辨認規律、檢查差異，支持更可靠的決策。', families: ['finance', 'technology'], workPatterns: ['整理資料', '檢查假設', '辨認規律', '支持決策'], tradeoffActivity: '分析資料、找出規律並驗證推論', tradeoffOutcome: '用證據降低判斷的不確定性', tradeoffQuestion: '從資料與邏輯中找出答案' },
  { id: 'technical_making', title: '技術與實作', description: '理解系統如何運作，動手建造、測試或修正具體成果。', families: ['engineering', 'skilled_technical'], workPatterns: ['理解系統', '動手製作', '測試問題', '改善成果'], tradeoffActivity: '實際建造、測試或修理一個具體成果', tradeoffOutcome: '讓系統或物件真正可以運作', tradeoffQuestion: '直接動手把問題處理掉' },
  { id: 'teaching_growth', title: '教學與成長', description: '理解學習需要，設計步驟與回饋，幫助別人真正學會或進步。', families: ['education'], workPatterns: ['理解學習需要', '拆解知識', '引導練習', '提供回饋'], tradeoffActivity: '把複雜內容拆開，陪別人練習與進步', tradeoffOutcome: '讓別人從不會到能夠自己完成', tradeoffQuestion: '幫助別人理解與成長' },
  { id: 'service_experience', title: '服務與體驗', description: '留意現場需求與感受，在互動中提供照顧並改善整體體驗。', families: ['hospitality', 'travel', 'healthcare'], workPatterns: ['察覺需求', '即時回應', '照顧體驗', '處理突發狀況'], tradeoffActivity: '在現場回應需求，讓一段服務體驗更順利', tradeoffOutcome: '讓人感到被理解並得到實際協助', tradeoffQuestion: '直接改善一個人的當下體驗' },
] as const;

const ruleByFamily = new Map(CAREER_DIRECTION_RULES.flatMap((rule) => rule.families.map((family) => [family, rule] as const)));
const distanceRank: Record<EntryDistanceLevel, number> = { low: 0, medium: 1, high: 2, very_high: 3 };
const rankDistance = (rank: number) => (Object.entries(distanceRank).find(([, value]) => value === rank)?.[0] ?? 'medium') as EntryDistanceLevel;
const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const confidenceValue = (level: CareerMatchResult['confidence']) => ({ low: 0.35, medium: 0.68, high: 1 })[level];
const confidenceLevel = (value: number): CareerMatchResult['confidence'] => value >= 0.8 ? 'high' : value >= 0.55 ? 'medium' : 'low';

export const careerDirectionForFamily = (family: CareerFamily) => ruleByFamily.get(family);

function commonTalents(matches: CareerMatchResult[]): TalentId[] {
  const totals = new Map<TalentId, { weight: number; count: number }>();
  matches.forEach((match) => {
    const career = CAREER_PROFILES.find(({ id }) => id === match.careerId);
    Object.entries(career?.talentRequirements ?? {}).forEach(([id, value]) => {
      if ((value ?? 0) < 0.5) return;
      const current = totals.get(id as TalentId) ?? { weight: 0, count: 0 };
      totals.set(id as TalentId, { weight: current.weight + (value ?? 0), count: current.count + 1 });
    });
  });
  return [...totals.entries()]
    .sort(([, a], [, b]) => (b.count - a.count) || (b.weight - a.weight))
    .slice(0, 4)
    .map(([id]) => id);
}

export function buildCareerDirections({ matches, limit = 3 }: CareerDirectionInput): CareerDirection[] {
  const grouped = new Map<CareerDirectionId, { rule: DirectionRule; matches: CareerMatchResult[] }>();
  matches.slice(0, 24).forEach((match) => {
    const rule = ruleByFamily.get(match.family);
    if (!rule) return;
    const group = grouped.get(rule.id) ?? { rule, matches: [] };
    group.matches.push(match);
    grouped.set(rule.id, group);
  });

  return [...grouped.values()].map(({ rule, matches: groupMatches }) => {
    const representatives = groupMatches.slice(0, 4);
    const averageFit = mean(representatives.map(({ matchScore }) => matchScore));
    const averageTalent = mean(representatives.map(({ talentMatch }) => talentMatch));
    const averageEnvironment = mean(representatives.map(({ environmentMatch }) => environmentMatch));
    const averageConfidence = mean(representatives.map(({ confidence }) => confidenceValue(confidence)));
    const entryRanks = representatives.map(({ entryDistance }) => distanceRank[entryDistance.level]);
    const evidence = [...new Set(representatives.flatMap(({ supportingEvidenceIds }) => supportingEvidenceIds))];
    const potentialFrictions = [...new Set(representatives.flatMap(({ potentialFrictions }) => potentialFrictions))].slice(0, 3);
    return {
      id: rule.id,
      title: rule.title,
      description: rule.description,
      careerIds: representatives.map(({ careerId }) => careerId),
      sharedTalents: commonTalents(representatives),
      sharedWorkPatterns: [...rule.workPatterns],
      averageFit,
      confidence: confidenceLevel(averageConfidence),
      entryDistanceRange: { min: rankDistance(Math.min(...entryRanks)), max: rankDistance(Math.max(...entryRanks)) },
      potentialFrictions,
      supportingEvidence: evidence,
      priorityReasons: [
        `這組工作的平均 Career Fit Index 為 ${Math.round(averageFit * 100)}`,
        `共同能力重疊約 ${Math.round(averageTalent * 100)}，不是只靠職稱分類`,
        averageEnvironment >= 0.6 ? '工作環境與你的容忍訊號有明顯重疊' : '環境仍有需要實際確認的差異',
        `進入距離介於 ${rankDistance(Math.min(...entryRanks))} 到 ${rankDistance(Math.max(...entryRanks))}`,
        evidence.length ? `方向依據可追溯到 ${evidence.length} 個作答證據` : '目前缺少可追溯的職涯推薦證據，應先用 Guided Choice 與 20 分鐘體驗驗證',
      ],
    };
  }).sort((a, b) => b.averageFit - a.averageFit).slice(0, Math.max(2, Math.min(4, limit)));
}
