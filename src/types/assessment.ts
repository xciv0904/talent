import type { QuestionType } from './questions';
import type { TalentId } from './talents';

export type SignalChannel = 'ability' | 'energy' | 'talent_interest' | 'interest' | 'work_style' | 'environment' | 'value';

export interface SignalObservation {
  questionId: string;
  questionPrompt: string;
  questionType: QuestionType;
  optionId: string;
  optionLabel: string;
  channel: SignalChannel;
  key: string;
  value: number;
  evidenceQuality: number;
}

export interface TalentOpportunity {
  talentId: TalentId;
  questionId: string;
  questionType: QuestionType;
  maximumSignal: number;
  evidenceQuality: number;
}

export interface ProfileOpportunity {
  channel: Exclude<SignalChannel, 'ability' | 'energy' | 'talent_interest'>;
  key: string;
  questionId: string;
  maximumSignal: number;
}

export interface AssessmentResult {
  observations: SignalObservation[];
  talentOpportunities: TalentOpportunity[];
  profileOpportunities: ProfileOpportunity[];
  answeredQuestionIds: string[];
}
