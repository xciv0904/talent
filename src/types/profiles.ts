import type { ConfidenceResult, Evidence, TalentId, TalentScore } from './talents';

export const CAREER_FAMILIES = [
  'technology',
  'product',
  'design',
  'marketing',
  'sales',
  'human_resources',
  'customer_success',
  'hospitality',
  'travel',
  'education',
  'research',
  'healthcare',
  'finance',
  'operations',
  'consulting',
  'media',
  'public_service',
  'engineering',
  'creative',
  'skilled_technical',
] as const;

export type CareerFamily = (typeof CAREER_FAMILIES)[number];

export const INTEREST_DIMENSIONS = [
  'realistic',
  'investigative',
  'artistic',
  'social',
  'enterprising',
  'conventional',
] as const;
export type InterestDimension = (typeof INTEREST_DIMENSIONS)[number];

export const WORK_STYLE_DIMENSIONS = [
  'independent',
  'collaborative',
  'strategic',
  'hands_on',
  'detail_focused',
  'facilitative',
] as const;
export type WorkStyleDimension = (typeof WORK_STYLE_DIMENSIONS)[number];

export const ENVIRONMENT_DIMENSIONS = [
  'socialDensity',
  'pace',
  'ambiguity',
  'mobility',
  'risk',
  'repetition',
  'emotionalLabor',
  'structure',
] as const;
export type EnvironmentDimension = (typeof ENVIRONMENT_DIMENSIONS)[number];

export const VALUE_DIMENSIONS = [
  'stability',
  'income',
  'achievement',
  'impact',
  'autonomy',
  'learning',
  'creativity',
  'helpingOthers',
  'recognition',
  'workLifeBalance',
  'internationalExposure',
  'careerGrowth',
] as const;
export type ValueDimension = (typeof VALUE_DIMENSIONS)[number];

export const CAREER_MATCH_VALUE_DIMENSIONS = [
  'stability',
  'impact',
  'autonomy',
  'learning',
  'creativity',
  'helpingOthers',
] as const;
export type CareerMatchValueDimension = (typeof CAREER_MATCH_VALUE_DIMENSIONS)[number];

export type DimensionVector<TDimension extends string> = Record<TDimension, number>;
export type InterestVector = DimensionVector<InterestDimension>;
export type WorkStyleVector = DimensionVector<WorkStyleDimension>;
export type EnvironmentVector = DimensionVector<EnvironmentDimension>;
export type ValuesVector = DimensionVector<ValueDimension>;
export type CareerValuesVector = DimensionVector<CareerMatchValueDimension>;

export interface AssessmentProfileVectors {
  interestProfile: InterestVector;
  workStyle: WorkStyleVector;
  environmentTolerance: EnvironmentVector;
  valuesProfile: ValuesVector;
  coverage: {
    interest: number;
    workStyle: number;
    environment: number;
    values: number;
  };
}

export interface InterestProfile {
  scores: InterestVector;
  topInterests: InterestDimension[];
  evidence: Evidence[];
}

export interface WorkStyleProfile {
  preferences: WorkStyleVector;
}

export interface WorkEnvironmentProfile {
  preferences: EnvironmentVector;
  mustHaves: string[];
  avoidances: string[];
}

export interface ValueProfile {
  priorities: ValuesVector;
  rankedValues: ValueDimension[];
}

export interface CareerSkillRequirement {
  id: string;
  name: string;
  importance: number;
}

export type EducationLevel = 'none' | 'secondary' | 'certificate' | 'associate' | 'bachelor' | 'master' | 'doctorate';
export type EntryDistanceLevel = 'low' | 'medium' | 'high' | 'very_high';

export interface CareerEntryRequirements {
  education: EducationLevel;
  yearsExperience: number;
  certifications: string[];
  portfolio: boolean;
  languages: string[];
  professionalLicenses: string[];
}

export interface CareerExperiment {
  title: string;
  description: string;
  estimatedHours: number;
  evidenceToCollect: string[];
}

export interface CareerProfile {
  id: string;
  titleZh: string;
  titleEn: string;
  aliases: string[];
  family: CareerFamily;
  description: string;
  coreTasks: string[];
  talentRequirements: Partial<Record<TalentId, number>>;
  interestProfile: InterestVector;
  workStyle: WorkStyleVector;
  environmentProfile: EnvironmentVector;
  valuesProfile: CareerValuesVector;
  skills: CareerSkillRequirement[];
  entryRequirements: CareerEntryRequirements;
  entryBarrier: EntryDistanceLevel;
  relatedCareers: string[];
  careerExperiment: CareerExperiment;
}

export interface CareerMatchInput {
  talentScores: TalentScore[];
  interestProfile: InterestVector;
  workStyle: WorkStyleVector;
  environmentTolerance: EnvironmentVector;
  valuesProfile: ValuesVector;
  transferableSkills: Record<string, number>;
  education: EducationLevel;
  yearsExperience: number;
  certifications: string[];
  hasPortfolio: boolean;
  languages: string[];
  professionalLicenses: string[];
  consideredCareerIds: string[];
  consideredFamilies: CareerFamily[];
  careerFamiliarity?: Record<string, number>;
  profileCoverage?: AssessmentProfileVectors['coverage'];
}

export interface CandidateBackground {
  transferableSkills?: Record<string, number>;
  education?: EducationLevel;
  yearsExperience?: number;
  certifications?: string[];
  hasPortfolio?: boolean;
  languages?: string[];
  professionalLicenses?: string[];
  consideredCareerIds?: string[];
  consideredFamilies?: CareerFamily[];
  careerFamiliarity?: Record<string, number>;
}

export interface EntryDistance {
  level: EntryDistanceLevel;
  educationGap: number;
  skillGap: number;
  experienceGap: number;
  certificationGap: number;
  portfolioGap: number;
  languageGap: number;
  professionalLicenseGap: number;
  reasons: string[];
}

export interface CareerMatchResult {
  careerId: string;
  family: CareerFamily;
  matchScore: number;
  talentMatch: number;
  interestMatch: number;
  workStyleMatch: number;
  environmentMatch: number;
  valuesMatch: number;
  transferableSkillsMatch: number;
  confidence: ConfidenceResult['level'];
  entryDistance: EntryDistance;
  topTalentReasons: string[];
  talentReasonDetails: Array<{
    talentId: TalentId;
    reason: string;
    evidenceIds: string[];
  }>;
  interestReasons: string[];
  environmentReasons: string[];
  potentialFrictions: string[];
  supportingEvidenceIds: string[];
}

export type CareerResultCategory = 'best_fit' | 'easier_transition' | 'high_potential' | 'surprise_me';

export type CategorizedCareerResults = Record<CareerResultCategory, CareerMatchResult[]>;
