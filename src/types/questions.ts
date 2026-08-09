import type { TalentId } from './talents';

export const QUESTION_TYPES = [
  'situational_choice',
  'forced_choice',
  'ranking',
  'behavior',
  'energy',
  'evidence',
  'interest',
  'environment',
  'values',
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];
export type SignalMap = Record<string, number>;
export type TalentSignalMap = Partial<Record<TalentId, number>>;

export const SCENARIO_DOMAINS = [
  'individual_problem',
  'learning',
  'information',
  'social_interaction',
  'group_activity',
  'helping_someone',
  'planning',
  'unexpected_change',
  'limited_time',
  'unfamiliar_task',
  'quality_check',
  'creative_task',
  'practical_task',
  'choice_decision',
] as const;
export type ScenarioDomain = (typeof SCENARIO_DOMAINS)[number];
export type ContextRequirement = 'universal' | 'common_activity';

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  talentSignals?: TalentSignalMap;
  energySignals?: TalentSignalMap;
  interestSignals?: SignalMap;
  talentInterestSignals?: TalentSignalMap;
  workStyleSignals?: SignalMap;
  environmentSignals?: SignalMap;
  valueSignals?: SignalMap;
}

interface QuestionBase {
  id: string;
  type: QuestionType;
  scenarioDomain: ScenarioDomain;
  contextRequirements: ContextRequirement;
  scenario: string;
  decisionPoint: string;
  prompt: string;
  description?: string;
  required: boolean;
  options: QuestionOption[];
  tags?: string[];
}

export interface ChoiceQuestion extends QuestionBase {
  type: 'situational_choice' | 'forced_choice' | 'energy' | 'interest' | 'environment' | 'values';
  selection: 'single' | 'multiple';
  maxSelections?: number;
}

export interface RankingQuestion extends QuestionBase {
  type: 'ranking';
  rankCount: number;
}

export interface ScaleQuestion extends QuestionBase {
  type: 'behavior' | 'evidence';
  selection: 'single';
  scale: {
    min: number;
    max: number;
    minLabel: string;
    maxLabel: string;
  };
}

export type Question = ChoiceQuestion | RankingQuestion | ScaleQuestion;

export interface QuestionResponse {
  questionId: string;
  selectedOptionIds: string[];
  ranking?: string[];
  scaleValue?: number;
  answeredAt: string;
}
