import type { AssessmentProfileVectors, CareerMatchResult, TalentId, UserTalentProfile } from '../types';
import type { ExperimentRecord, AppStorageState } from '../services/storage';

export const YEARS = [0, 1, 3, 5, 7, 10] as const;
export const STATE_LABELS = { skill: '專業技能', energy: '投入與能量', stress: '職場壓力', satisfaction: '職涯滿足', money: '經濟資源', time: '時間資源', autonomy: '工作自主', opportunity: '職涯機會', balance: '生活平衡' } as const;
export type Stats = Record<keyof typeof STATE_LABELS, number>;
export type Direction = 'specialist' | 'leader' | 'flexible';
export const GOALS = { income: '收入成長', stability: '工作穩定', autonomy: '自由度', achievement: '成就感', balance: '生活平衡' } as const;
export type Goal = keyof typeof GOALS;
export interface Personalization {
  capturedAt: string;
  talent: UserTalentProfile | null;
  profiles: AssessmentProfileVectors | null;
  match: CareerMatchResult | null;
  experiments: ExperimentRecord[];
  reflections: AppStorageState['reflectionResults'];
}
export interface Condition { stat?: keyof Stats; min?: number; max?: number; flag?: string; goal?: Goal; missionScore?: number; talent?: TalentId; priorEngagement?: boolean; }
export interface Choice { id: Direction; label: string; result: string; effects: Partial<Stats>; flag: string; }
export interface EventCard { id: string; year: number; title: string; background: string; problem: string; conditions?: Condition[]; choices: Choice[]; mission?: boolean; }
export interface HistoryNode { eventId: string; year: number; title: string; choice: Choice; before: Stats; after: Stats; at: string; feedback: string; }
export interface Life {
  id: string; careerId: string; name: string; seed: number; mode: 'quick' | 'full'; goal: Goal;
  createdAt: string; updatedAt: string; parentId?: string; forkAt?: number;
  personal: Personalization; initial: Stats; stats: Stats; history: HistoryNode[];
  flags: string[]; status: 'active' | 'paused' | 'completed'; ending?: Direction;
}
export interface Reflection { interest: number; achievement: number; energy: number; willingness: number; hardest: string; }
export interface MissionInput { decisions: string[]; allocation: number[]; order: string[]; text: string; checks: string[]; }
export interface MissionResult {
  id: string; careerId: string; lifeId?: string; inheritedFrom?: string; at: string; input: MissionInput;
  score: number; criteria: { label: string; passed: boolean; advice: string }[];
  reflection?: Reflection;
}
export interface Evidence {
  id: string; kind: 'assessment' | 'simulation' | 'mission' | 'reflection' | 'experiment';
  at: string; careerId?: string; lifeId?: string; sourceId: string; scope: string;
  weight: number; summary: string; score?: number; interest?: number; energy?: number; willingness?: number;
}
export interface AnalysisSnapshot { id: string; at: string; reason: string; evidenceIds: string[]; findings: string[]; }
export interface LabState { version: 1; lives: Life[]; missions: MissionResult[]; evidence: Evidence[]; snapshots: AnalysisSnapshot[]; drafts: Record<string, MissionInput>; }
export interface Scenario { title: string; background: string; problem: string; routes: [string, string, string]; }
export interface MissionDefinition {
  title: string; minutes: string; objective: string; brief: string; info: string[];
  decisions: { prompt: string; options: string[]; correct: string; rationale: string }[];
  allocation: { labels: [string, string, string]; minimum: [number, number, number]; rationale: string };
  priorities: { id: string; label: string }[]; first: string; priorityAdvice: string;
  output: string; checks: string[]; example: string;
}
export interface LabCareer { sector?: string; onsite?: boolean; development?: [string, string, string]; careerId: string; accent: string; hook: string; skills: string[]; scenarios: [Scenario, Scenario, Scenario]; mission: MissionDefinition; }
