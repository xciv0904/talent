export type TalentCategory = 'thinking' | 'people' | 'execution';

export type TalentId =
  | 'analytical_reasoning'
  | 'pattern_recognition'
  | 'quantitative_reasoning'
  | 'verbal_reasoning'
  | 'spatial_mechanical'
  | 'creative_ideation'
  | 'learning_agility'
  | 'structuring_ambiguity'
  | 'emotional_perception'
  | 'communication'
  | 'influence'
  | 'teaching_coaching'
  | 'coordination'
  | 'conflict_navigation'
  | 'initiative'
  | 'planning'
  | 'prioritization'
  | 'precision'
  | 'adaptability'
  | 'persistence';

export interface TalentDefinition {
  id: TalentId;
  nameZh: string;
  nameEn: string;
  description: string;
  category: TalentCategory;
}

export interface CompositeTalent {
  id: string;
  nameZh: string;
  nameEn: string;
  shortDescription: string;
  components: TalentId[];
  weights: Partial<Record<TalentId, number>>;
  minimumEvidence: number;
}

export interface TalentScore {
  talentId: TalentId;
  score: number;
  energyScore: number | null;
  interestScore: number | null;
  status: TalentStatus;
  confidence: ConfidenceResult;
  evidence: Evidence[];
}

export interface CompositeTalentScore {
  compositeTalentId: string;
  score: number;
  energyScore: number | null;
  status: TalentStatus;
  confidence: ConfidenceResult;
}

export interface UserTalentProfile {
  baseTalents: TalentScore[];
  compositeTalents: CompositeTalentScore[];
  generatedAt: string;
}

export type EvidenceSource = 'question' | 'behavior_example' | 'reflection' | 'experiment';

export interface Evidence {
  id: string;
  source: EvidenceSource;
  questionId?: string;
  optionId?: string;
  talentId?: TalentId;
  description: string;
  strength: number;
  occurredAt?: string;
}

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type TalentStatus =
  | 'natural_strength'
  | 'developed_strength'
  | 'emerging_potential'
  | 'interest_only'
  | 'energy_drain'
  | 'insufficient_evidence';

export interface ConfidenceResult {
  level: ConfidenceLevel;
  evidenceCount: number;
  questionCoverage: number;
  crossMethodConsistency: number;
  evidenceQuality: number;
  reasons: string[];
}
