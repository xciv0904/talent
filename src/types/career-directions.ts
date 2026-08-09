import type { CareerMatchResult, EntryDistanceLevel } from './profiles';
import type { TalentId } from './talents';

export type CareerDirectionId =
  | 'insight_research'
  | 'people_problem_solving'
  | 'planning_delivery'
  | 'creative_content'
  | 'data_analysis'
  | 'technical_making'
  | 'teaching_growth'
  | 'service_experience';

export interface CareerDirection {
  id: CareerDirectionId;
  title: string;
  description: string;
  careerIds: string[];
  sharedTalents: TalentId[];
  sharedWorkPatterns: string[];
  averageFit: number;
  confidence: CareerMatchResult['confidence'];
  entryDistanceRange: { min: EntryDistanceLevel; max: EntryDistanceLevel };
  potentialFrictions: string[];
  supportingEvidence: string[];
  priorityReasons: string[];
}

export type ExplorationPriorityLabel = 'priority' | 'equally_worth' | 'compare' | 'not_priority';
export type DecisionClarity = 'clear' | 'moderate' | 'ambiguous';

export interface PrioritizedCareerDirection extends CareerDirection {
  explorationPriority: ExplorationPriorityLabel;
  proximityCluster: number;
  energyDrainRisk: number;
  tieBreakerNet: number;
}

export interface ExplorationPriorityResult {
  directions: PrioritizedCareerDirection[];
  decisionClarity: DecisionClarity;
  proximityEpsilon: number;
  requiresTieBreaker: boolean;
  tiedDirectionIds: CareerDirectionId[];
  interpretation: string;
}

export interface GuidedChoicePrompt {
  id: string;
  question: string;
  kind: 'preference' | 'elimination';
  dimension: string;
  options: Array<{ directionId: CareerDirectionId; label: string }>;
}

export type NavigatorNeed = 'guided_direction' | 'career_explorer' | 'career_compare' | 'entry_path' | 'talent_deep_dive';
export type ExperienceFeeling = 'engaged' | 'interesting' | 'neutral' | 'draining' | 'disliked';
export type ExperiencePreference = 'find_problems' | 'understand_people' | 'organize_observations' | 'improve_ideas' | 'none';
export type ExperienceGuidance = 'continue' | 'try_another' | 'deprioritize';

export interface ExperienceReflectionResult {
  careerId: string;
  feeling: ExperienceFeeling;
  preference: ExperiencePreference;
  guidance: ExperienceGuidance;
  completedAt: string;
}

export interface CareerDirectionInput {
  matches: CareerMatchResult[];
  limit?: number;
}

export interface ExplorationPriorityInput {
  directions: CareerDirection[];
  matches: CareerMatchResult[];
  talentProfile?: import('./talents').UserTalentProfile;
  tieBreakerAnswers?: Record<string, CareerDirectionId>;
}
