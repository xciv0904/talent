import type { CareerMatchResult } from './profiles';
import type { ConfidenceLevel, Evidence, TalentId } from './talents';

export type PublicCareerFitLevel = 'strong' | 'moderate' | 'lower';
export type AbilityAlignmentLevel = 'strong_alignment' | 'moderate_alignment' | 'low_overlap' | 'insufficient_evidence';
export type UserSignalLevel = 'high' | 'moderate' | 'low' | 'insufficient_evidence';
export type InterpretationRiskLevel = 'low' | 'moderate' | 'high';
export type TalentRequirementImportance = 'core' | 'supporting' | 'minor';
export type RecommendationStrength = 'strong_recommendation' | 'moderate_recommendation' | 'exploratory' | 'not_priority';
export type RecommendationSource = 'ability_led' | 'interest_led' | 'environment_led' | 'mixed' | 'weak_relative';
export type AbsoluteEvidenceQuality = 'strong' | 'moderate' | 'weak' | 'insufficient';

export interface PublicCareerGroup {
  id: string;
  title: string;
  description: string;
  specificCareerIds: readonly string[];
  commonTitles: readonly string[];
  dailyTasks: readonly string[];
}

export interface AbilityAlignment {
  talentId: TalentId;
  talentName: string;
  userEvidence: Evidence[];
  userSignalLevel: UserSignalLevel;
  careerDemand: number;
  importance: TalentRequirementImportance;
  relevantCareerTasks: string[];
  alignment: AbilityAlignmentLevel;
  explanation: string;
}

export interface PositiveEvidenceGateResult {
  passed: boolean;
  absoluteEvidenceQuality: AbsoluteEvidenceQuality;
  positiveAlignmentCount: number;
  corePositiveAlignmentCount: number;
  strongAlignmentCount: number;
  moderateAlignmentCount: number;
  lowOverlapCount: number;
  insufficientEvidenceCount: number;
  specificCareerSupportBreadth: number;
  reasons: string[];
}

export interface PublicCareerInterpretation {
  publicCareerId: string;
  title: string;
  description: string;
  classification: PublicCareerFitLevel;
  recommendationStrength: RecommendationStrength;
  recommendationSource: RecommendationSource;
  positiveEvidenceGate: PositiveEvidenceGateResult;
  specificCareerIds: string[];
  commonTitles: string[];
  dailyTasks: string[];
  representativeCareerId: string;
  relativeRank: number;
  relativePercentile: number;
  fitSeparation: number;
  confidence: ConfidenceLevel;
  talentOverlap: number;
  interestAlignment: number;
  workStyleAlignment: number;
  environmentFriction: InterpretationRiskLevel;
  energyRisk: InterpretationRiskLevel;
  abilityAlignment: AbilityAlignment[];
  matchingReasons: string[];
  limitingReasons: string[];
  supportingEvidenceIds: string[];
  underlyingMatches: CareerMatchResult[];
}

export interface SpecificCareerInterpretation {
  careerId: string;
  publicCareerId: string;
  publicCareerTitle: string;
  classification: PublicCareerFitLevel;
  recommendationStrength: RecommendationStrength;
  recommendationSource: RecommendationSource;
  positiveEvidenceGate: PositiveEvidenceGateResult;
  relativeRank: number;
  confidence: ConfidenceLevel;
  environmentFriction: InterpretationRiskLevel;
  energyRisk: InterpretationRiskLevel;
  abilityAlignment: AbilityAlignment[];
  matchingReasons: string[];
  limitingReasons: string[];
  componentScores: {
    talent: number;
    interest: number;
    workStyle: number;
    environment: number;
    environmentPenalty: number;
    values: number;
    transferableSkills: number;
  };
}

export interface PublicCareerResults {
  strong: PublicCareerInterpretation[];
  moderate: PublicCareerInterpretation[];
  lower: PublicCareerInterpretation[];
  all: PublicCareerInterpretation[];
}
