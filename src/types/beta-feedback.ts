export const OVERALL_FEEDBACK_OPTIONS = [
  'clearer_direction',
  'discovered_abilities',
  'useful_but_unclear',
  'very_different_from_self',
  'hard_to_understand',
] as const;
export type OverallFeedbackChoice = (typeof OVERALL_FEEDBACK_OPTIONS)[number];

export const TALENT_AGREEMENT_OPTIONS = ['strongly_agree', 'mostly_agree', 'unsure', 'mostly_disagree'] as const;
export type TalentAgreementChoice = (typeof TALENT_AGREEMENT_OPTIONS)[number];

export const TALENT_DISCOVERY_OPTIONS = ['already_knew', 'felt_it_not_named', 'new_discovery', 'disagree'] as const;
export type TalentDiscoveryChoice = (typeof TALENT_DISCOVERY_OPTIONS)[number];

export const CAREER_FEEDBACK_OPTIONS = ['strong_fit', 'already_considered', 'unexpected_interested', 'reason_clear_not_desired', 'unreasonable'] as const;
export type CareerFeedbackChoice = (typeof CAREER_FEEDBACK_OPTIONS)[number];

export const SURPRISE_FEEDBACK_OPTIONS = ['unexpected_attractive', 'unexpected_reasonable', 'known_not_considered', 'not_interested', 'reason_invalid'] as const;
export type SurpriseFeedbackChoice = (typeof SURPRISE_FEEDBACK_OPTIONS)[number];

export const QUESTION_FEEDBACK_REASONS = ['none_fit', 'multiple_fit', 'unclear_context', 'unclear_difference', 'no_experience'] as const;
export type QuestionFeedbackReason = (typeof QUESTION_FEEDBACK_REASONS)[number];

export const NEXT_STEP_CLARITY_OPTIONS = ['very_clear', 'mostly_clear', 'still_uncertain', 'completely_unclear'] as const;
export type NextStepClarityChoice = (typeof NEXT_STEP_CLARITY_OPTIONS)[number];

export interface TalentBetaFeedback {
  compositeTalentId: string;
  agreement?: TalentAgreementChoice;
  discovery?: TalentDiscoveryChoice;
  timestamp: string;
}

export interface CareerBetaFeedback {
  careerId: string;
  response: CareerFeedbackChoice;
  timestamp: string;
}

export interface SurpriseBetaFeedback {
  careerId: string;
  response: SurpriseFeedbackChoice;
  timestamp: string;
}

export interface QuestionBetaFeedback {
  questionId: string;
  reason: QuestionFeedbackReason;
  timestamp: string;
}

export interface BetaFeedback {
  sessionId: string;
  schemaVersion: number;
  assessmentVersion: string;
  talentModelVersion: string;
  careerDatasetVersion: string;
  matchingEngineVersion: string;
  explanationVersion: string;
  storageSchemaVersion: number;
  timestamp: string;
  assessmentStartedAt?: string;
  assessmentCompletedAt?: string;
  overallFeedback?: OverallFeedbackChoice;
  nextStepClarity?: NextStepClarityChoice;
  talentFeedback: TalentBetaFeedback[];
  careerFeedback: CareerBetaFeedback[];
  surpriseFeedback: SurpriseBetaFeedback[];
  questionFeedback: QuestionBetaFeedback[];
  optionalComment?: string;
}
