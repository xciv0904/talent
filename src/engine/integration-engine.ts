import { CAREER_PROFILES } from '../data/careers';
import { QUICK_DISCOVERY_QUESTIONS } from '../data/questions';
import type {
  CandidateBackground,
  CareerMatchInput,
  CareerProfile,
  CategorizedCareerResults,
  Question,
  QuestionResponse,
  UserTalentProfile,
} from '../types';
import { runAssessment } from './assessment-engine';
import { matchCareers } from './career-match-engine';
import { categorizeCareerResults } from './career-result-engine';
import { scoreCompositeTalents } from './composite-talent-engine';
import { buildAssessmentProfiles } from './profile-engine';
import { scoreBaseTalents } from './talent-engine';

export interface CareerDiscoveryPipelineResult {
  assessment: ReturnType<typeof runAssessment>;
  talentProfile: UserTalentProfile;
  profiles: ReturnType<typeof buildAssessmentProfiles>;
  matchInput: CareerMatchInput;
  matches: ReturnType<typeof matchCareers>;
  categories: CategorizedCareerResults;
  rawAnswers: readonly QuestionResponse[];
}

export function runCareerDiscoveryPipeline(
  rawAnswers: readonly QuestionResponse[],
  background: CandidateBackground = {},
  questions: readonly Question[] = QUICK_DISCOVERY_QUESTIONS,
  careers: readonly CareerProfile[] = CAREER_PROFILES,
): CareerDiscoveryPipelineResult {
  const assessment = runAssessment(questions, rawAnswers);
  const baseTalents = scoreBaseTalents(assessment);
  const profiles = buildAssessmentProfiles(assessment);
  const talentProfile: UserTalentProfile = {
    baseTalents,
    compositeTalents: scoreCompositeTalents(baseTalents),
    generatedAt: rawAnswers.at(-1)?.answeredAt ?? '',
  };
  const matchInput: CareerMatchInput = {
    talentScores: baseTalents,
    interestProfile: profiles.interestProfile,
    workStyle: profiles.workStyle,
    environmentTolerance: profiles.environmentTolerance,
    valuesProfile: profiles.valuesProfile,
    transferableSkills: background.transferableSkills ?? {},
    education: background.education ?? 'none',
    yearsExperience: background.yearsExperience ?? 0,
    certifications: background.certifications ?? [],
    hasPortfolio: background.hasPortfolio ?? false,
    languages: background.languages ?? [],
    professionalLicenses: background.professionalLicenses ?? [],
    consideredCareerIds: background.consideredCareerIds ?? [],
    consideredFamilies: background.consideredFamilies ?? [],
    careerFamiliarity: background.careerFamiliarity ?? {},
    profileCoverage: profiles.coverage,
  };
  const matches = matchCareers(careers, matchInput);
  return {
    assessment,
    talentProfile,
    profiles,
    matchInput,
    matches,
    categories: categorizeCareerResults(matches, matchInput),
    rawAnswers,
  };
}
