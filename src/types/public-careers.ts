import type { CareerMatchResult } from './profiles';
import type { ConfidenceLevel, Evidence, TalentId } from './talents';

export type PublicCareerFitLevel = 'strong' | 'moderate' | 'lower';
export type AbilityAlignmentLevel = 'strong' | 'moderate' | 'weak' | 'insufficient_evidence';
export type UserSignalLevel = 'high' | 'moderate' | 'low' | 'insufficient_evidence';
export type InterpretationRiskLevel = 'low' | 'moderate' | 'high';

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
  relevantCareerTasks: string[];
  alignment: AbilityAlignmentLevel;
  explanation: string;
}

export interface PublicCareerInterpretation {
  publicCareerId: string;
  title: string;
  description: string;
  classification: PublicCareerFitLevel;
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

export interface PublicCareerResults {
  strong: PublicCareerInterpretation[];
  moderate: PublicCareerInterpretation[];
  lower: PublicCareerInterpretation[];
  all: PublicCareerInterpretation[];
}
