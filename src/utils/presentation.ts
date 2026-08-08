import type { ConfidenceLevel, EntryDistanceLevel } from '../types';

import type { CareerMatchResult } from '../types';

export const formatScore = (score: number) => `${Math.round(score * 100)}%`;
export const formatFitIndex = (score: number) => `${Math.round(score * 100)} / 100`;

export function careerMatchReasons(match: CareerMatchResult): string[] {
  const evidenceReasons = [...match.topTalentReasons, ...match.interestReasons, ...match.environmentReasons];
  const transparentFallbacks = [
    `天賦需求吻合指數 ${formatFitIndex(match.talentMatch)}`,
    `興趣吻合指數 ${formatFitIndex(match.interestMatch)}`,
    `工作方式吻合指數 ${formatFitIndex(match.workStyleMatch)}`,
  ];
  return [...new Set([...evidenceReasons, ...transparentFallbacks])].slice(0, 3);
}

export const confidenceLabel: Record<ConfidenceLevel, string> = {
  low: 'Low', medium: 'Medium', high: 'High',
};

export const entryDistanceLabel: Record<EntryDistanceLevel, string> = {
  low: '容易起步', medium: '需要準備', high: '轉換幅度較大', very_high: '需長期投入',
};

export const dimensionLabels: Record<string, string> = {
  realistic: '實作與工具', investigative: '研究與分析', artistic: '創意與表達', social: '助人與教學',
  enterprising: '影響與推動', conventional: '秩序與程序', independent: '獨立產出', collaborative: '共同協作',
  strategic: '方向與取捨', hands_on: '直接實作', detail_focused: '細節與品質', facilitative: '引導團隊',
  socialDensity: '社交密度', pace: '工作節奏', ambiguity: '模糊程度', mobility: '移動需求', risk: '風險責任',
  repetition: '重複程度', emotionalLabor: '情緒勞動', structure: '制度結構', stability: '穩定', income: '收入',
  achievement: '成就', impact: '影響力', autonomy: '自主', learning: '學習', creativity: '創造', helpingOthers: '幫助他人',
  recognition: '被肯定', workLifeBalance: '生活平衡', internationalExposure: '國際接觸', careerGrowth: '職涯成長',
};
