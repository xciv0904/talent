import { CURRENT_RESULT_VERSIONS, PRODUCT_VERSIONS, type ResultVersionInfo } from '../config/versions';
import { runCareerDiscoveryPipeline } from '../engine/integration-engine';
import {
  CAREER_FEEDBACK_OPTIONS,
  NEXT_STEP_CLARITY_OPTIONS,
  OVERALL_FEEDBACK_OPTIONS,
  QUESTION_FEEDBACK_REASONS,
  SURPRISE_FEEDBACK_OPTIONS,
  TALENT_AGREEMENT_OPTIONS,
  TALENT_DISCOVERY_OPTIONS,
  type AssessmentProfileVectors,
  type BetaFeedback,
  type CareerMatchResult,
  type CareerDirectionId,
  type CategorizedCareerResults,
  type ExperienceReflectionResult,
  type NavigatorNeed,
  type QuestionResponse,
  type UserTalentProfile,
} from '../types';

export const STORAGE_KEY = 'career-discovery-state';
export const SCHEMA_VERSION = PRODUCT_VERSIONS.storageSchemaVersion;

export interface AssessmentProgress {
  currentIndex: number;
  completed: boolean;
  updatedAt: string;
}

export interface StoredCareerResults {
  matches: CareerMatchResult[];
  categories: CategorizedCareerResults;
  profiles: AssessmentProfileVectors;
  versions: ResultVersionInfo;
}

export interface ExperimentRecord {
  careerId: string;
  status: 'saved' | 'in_progress' | 'completed';
  reflection?: string;
  currentStep?: number;
  updatedAt: string;
}

export interface NavigatorState {
  need?: NavigatorNeed;
  guidedAnswers: Record<string, CareerDirectionId>;
  lastVisitedStep?: 'directions' | 'choice' | 'next_step' | 'experience';
  updatedAt?: string;
}

export interface AppStorageState {
  schemaVersion: number;
  sessionId: string;
  assessmentProgress: AssessmentProgress;
  answers: QuestionResponse[];
  talentProfile: UserTalentProfile | null;
  careerResults: StoredCareerResults | null;
  experiments: ExperimentRecord[];
  selectedDirection: CareerDirectionId | null;
  exploredCareers: string[];
  completedExperiences: string[];
  reflectionResults: ExperienceReflectionResult[];
  navigatorState: NavigatorState;
  betaFeedback: BetaFeedback;
}

const now = () => new Date().toISOString();

export function createAnonymousSessionId(): string {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid) return `beta_${randomUuid}`;
  const bytes = new Uint8Array(16);
  globalThis.crypto?.getRandomValues?.(bytes);
  const randomPart = [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('') || Math.random().toString(36).slice(2);
  return `beta_${randomPart}`;
}

export function createBetaFeedback(sessionId: string, timestamp = now()): BetaFeedback {
  return {
    sessionId,
    schemaVersion: PRODUCT_VERSIONS.betaFeedbackSchemaVersion,
    ...CURRENT_RESULT_VERSIONS,
    timestamp,
    talentFeedback: [],
    careerFeedback: [],
    surpriseFeedback: [],
    questionFeedback: [],
  };
}

export const createInitialAppState = (): AppStorageState => {
  const sessionId = createAnonymousSessionId();
  return {
    schemaVersion: SCHEMA_VERSION,
    sessionId,
    assessmentProgress: { currentIndex: 0, completed: false, updatedAt: '' },
    answers: [],
    talentProfile: null,
    careerResults: null,
    experiments: [],
    selectedDirection: null,
    exploredCareers: [],
    completedExperiences: [],
    reflectionResults: [],
    navigatorState: { guidedAnswers: {} },
    betaFeedback: createBetaFeedback(sessionId),
  };
};

const listeners = new Set<() => void>();
let cachedState: AppStorageState | undefined;

const storageAvailable = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const isString = (value: unknown): value is string => typeof value === 'string';
const isChoice = <T extends string>(value: unknown, choices: readonly T[]): value is T => isString(value) && choices.includes(value as T);
const isTimestamp = (value: unknown): value is string => isString(value) && !Number.isNaN(Date.parse(value));
const isResultVersionInfo = (value: unknown): value is ResultVersionInfo => Boolean(
  value && typeof value === 'object' &&
  isString((value as ResultVersionInfo).assessmentVersion) &&
  isString((value as ResultVersionInfo).talentModelVersion) &&
  isString((value as ResultVersionInfo).careerDatasetVersion) &&
  isString((value as ResultVersionInfo).matchingEngineVersion) &&
  isString((value as ResultVersionInfo).explanationVersion) &&
  typeof (value as ResultVersionInfo).storageSchemaVersion === 'number' &&
  Number.isFinite((value as ResultVersionInfo).storageSchemaVersion),
);

function sanitizeBetaFeedback(value: unknown, sessionId: string): BetaFeedback {
  const fallback = createBetaFeedback(sessionId);
  if (!value || typeof value !== 'object') return fallback;
  const feedback = value as Partial<BetaFeedback>;
  if (feedback.schemaVersion !== PRODUCT_VERSIONS.betaFeedbackSchemaVersion && feedback.schemaVersion !== 1) return fallback;
  const timestamp = isTimestamp(feedback.timestamp) ? feedback.timestamp : fallback.timestamp;
  return {
    sessionId,
    schemaVersion: PRODUCT_VERSIONS.betaFeedbackSchemaVersion,
    assessmentVersion: isString(feedback.assessmentVersion) ? feedback.assessmentVersion : PRODUCT_VERSIONS.assessmentVersion,
    talentModelVersion: isString(feedback.talentModelVersion) ? feedback.talentModelVersion : PRODUCT_VERSIONS.talentModelVersion,
    careerDatasetVersion: isString(feedback.careerDatasetVersion) ? feedback.careerDatasetVersion : PRODUCT_VERSIONS.careerDatasetVersion,
    matchingEngineVersion: isString(feedback.matchingEngineVersion) ? feedback.matchingEngineVersion : PRODUCT_VERSIONS.matchingEngineVersion,
    explanationVersion: isString(feedback.explanationVersion) ? feedback.explanationVersion : PRODUCT_VERSIONS.explanationVersion,
    storageSchemaVersion: SCHEMA_VERSION,
    timestamp,
    assessmentStartedAt: isTimestamp(feedback.assessmentStartedAt) ? feedback.assessmentStartedAt : undefined,
    assessmentCompletedAt: isTimestamp(feedback.assessmentCompletedAt) ? feedback.assessmentCompletedAt : undefined,
    overallFeedback: isChoice(feedback.overallFeedback, OVERALL_FEEDBACK_OPTIONS) ? feedback.overallFeedback : undefined,
    nextStepClarity: isChoice(feedback.nextStepClarity, NEXT_STEP_CLARITY_OPTIONS) ? feedback.nextStepClarity : undefined,
    talentFeedback: Array.isArray(feedback.talentFeedback) ? feedback.talentFeedback.filter((item) => Boolean(
      item && isString(item.compositeTalentId) && isTimestamp(item.timestamp) &&
      (item.agreement === undefined || isChoice(item.agreement, TALENT_AGREEMENT_OPTIONS)) &&
      (item.discovery === undefined || isChoice(item.discovery, TALENT_DISCOVERY_OPTIONS)),
    )) : [],
    careerFeedback: Array.isArray(feedback.careerFeedback) ? feedback.careerFeedback.filter((item) => Boolean(
      item && isString(item.careerId) && isTimestamp(item.timestamp) && isChoice(item.response, CAREER_FEEDBACK_OPTIONS),
    )) : [],
    surpriseFeedback: Array.isArray(feedback.surpriseFeedback) ? feedback.surpriseFeedback.filter((item) => Boolean(
      item && isString(item.careerId) && isTimestamp(item.timestamp) && isChoice(item.response, SURPRISE_FEEDBACK_OPTIONS),
    )) : [],
    questionFeedback: Array.isArray(feedback.questionFeedback) ? feedback.questionFeedback.filter((item) => Boolean(
      item && isString(item.questionId) && isTimestamp(item.timestamp) && isChoice(item.reason, QUESTION_FEEDBACK_REASONS),
    )) : [],
    optionalComment: isString(feedback.optionalComment) && feedback.optionalComment.trim()
      ? feedback.optionalComment.trim().slice(0, 2000)
      : undefined,
  };
}

function readAppState(): AppStorageState {
  if (!storageAvailable()) return createInitialAppState();
  try {
    return parseStoredState(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return createInitialAppState();
  }
}

export function parseStoredState(raw: string | null): AppStorageState {
  if (!raw) return createInitialAppState();
  try {
    const parsed = JSON.parse(raw) as Partial<AppStorageState>;
    const isLegacyV2 = parsed.schemaVersion === 2;
    const isPreviousV3 = parsed.schemaVersion === 3;
    const isPreviousV4 = parsed.schemaVersion === 4;
    if (parsed.schemaVersion !== SCHEMA_VERSION && !isLegacyV2 && !isPreviousV3 && !isPreviousV4) return createInitialAppState();
    const sessionId = isString(parsed.sessionId) && parsed.sessionId.startsWith('beta_') ? parsed.sessionId : createAnonymousSessionId();
    const progress = parsed.assessmentProgress;
    const assessmentProgress: AssessmentProgress = {
      currentIndex: typeof progress?.currentIndex === 'number' && Number.isFinite(progress.currentIndex) && progress.currentIndex >= 0
        ? Math.floor(progress.currentIndex)
        : 0,
      completed: !isLegacyV2 && typeof progress?.completed === 'boolean' ? progress.completed : false,
      updatedAt: isString(progress?.updatedAt) ? progress.updatedAt : '',
    };
    const answers = Array.isArray(parsed.answers)
      ? parsed.answers.filter((answer): answer is QuestionResponse => Boolean(
          answer && isString(answer.questionId) && Array.isArray(answer.selectedOptionIds) &&
          answer.selectedOptionIds.every(isString) && isString(answer.answeredAt) &&
          (answer.scaleValue === undefined || (typeof answer.scaleValue === 'number' && Number.isFinite(answer.scaleValue))) &&
          (answer.ranking === undefined || (Array.isArray(answer.ranking) && answer.ranking.every(isString))),
        ))
      : [];
    const experiments = Array.isArray(parsed.experiments)
      ? parsed.experiments.filter((record): record is ExperimentRecord => Boolean(
          record && isString(record.careerId) && ['saved', 'in_progress', 'completed'].includes(record.status) &&
          isString(record.updatedAt) && (record.reflection === undefined || isString(record.reflection)) &&
          (record.currentStep === undefined || (typeof record.currentStep === 'number' && Number.isFinite(record.currentStep) && record.currentStep >= 0 && record.currentStep <= 4)),
        ))
      : [];
    let talentProfile = !isLegacyV2 && parsed.talentProfile && Array.isArray(parsed.talentProfile.baseTalents) &&
      Array.isArray(parsed.talentProfile.compositeTalents) ? parsed.talentProfile : null;
    let careerResults = !isLegacyV2 && parsed.careerResults && Array.isArray(parsed.careerResults.matches) &&
      parsed.careerResults.categories && Object.values(parsed.careerResults.categories).every(Array.isArray) &&
      parsed.careerResults.profiles && isResultVersionInfo(parsed.careerResults.versions) ? parsed.careerResults : null;
    const measurementIsCurrent = talentProfile?.baseTalents.every((talent) => Boolean(talent.measurement));
    const engineIsCurrent = careerResults?.versions.talentModelVersion === CURRENT_RESULT_VERSIONS.talentModelVersion
      && careerResults.versions.matchingEngineVersion === CURRENT_RESULT_VERSIONS.matchingEngineVersion;
    if (assessmentProgress.completed && answers.length > 0 && careerResults !== null && (!measurementIsCurrent || !engineIsCurrent)) {
      const recalculated = runCareerDiscoveryPipeline(answers, { education: 'none' });
      talentProfile = recalculated.talentProfile;
      careerResults = {
        matches: recalculated.matches,
        categories: recalculated.categories,
        profiles: recalculated.profiles,
        versions: CURRENT_RESULT_VERSIONS,
      };
    }
    return {
      schemaVersion: SCHEMA_VERSION,
      sessionId,
      assessmentProgress,
      answers,
      talentProfile,
      careerResults,
      experiments,
      selectedDirection: isString(parsed.selectedDirection) ? parsed.selectedDirection as CareerDirectionId : null,
      exploredCareers: Array.isArray(parsed.exploredCareers) ? parsed.exploredCareers.filter(isString) : [],
      completedExperiences: Array.isArray(parsed.completedExperiences) ? parsed.completedExperiences.filter(isString) : [],
      reflectionResults: Array.isArray(parsed.reflectionResults) ? parsed.reflectionResults.filter((item): item is ExperienceReflectionResult => Boolean(
        item && isString(item.careerId) && ['engaged', 'interesting', 'neutral', 'draining', 'disliked'].includes(item.feeling) &&
        ['find_problems', 'understand_people', 'organize_observations', 'improve_ideas', 'none'].includes(item.preference) &&
        ['continue', 'try_another', 'deprioritize'].includes(item.guidance) && isTimestamp(item.completedAt),
      )) : [],
      navigatorState: parsed.navigatorState && typeof parsed.navigatorState === 'object' ? {
        need: isString(parsed.navigatorState.need) ? parsed.navigatorState.need as NavigatorNeed : undefined,
        guidedAnswers: parsed.navigatorState.guidedAnswers && typeof parsed.navigatorState.guidedAnswers === 'object' ? parsed.navigatorState.guidedAnswers : {},
        lastVisitedStep: isString(parsed.navigatorState.lastVisitedStep) ? parsed.navigatorState.lastVisitedStep as NavigatorState['lastVisitedStep'] : undefined,
        updatedAt: isString(parsed.navigatorState.updatedAt) ? parsed.navigatorState.updatedAt : undefined,
      } : { guidedAnswers: {} },
      betaFeedback: isLegacyV2 ? createBetaFeedback(sessionId) : sanitizeBetaFeedback(parsed.betaFeedback, sessionId),
    };
  } catch {
    return createInitialAppState();
  }
}

export function loadAppState(): AppStorageState {
  cachedState ??= readAppState();
  return cachedState;
}

export function saveAppState(state: AppStorageState): void {
  if (!storageAvailable()) return;
  cachedState = { ...state, schemaVersion: SCHEMA_VERSION };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedState));
  listeners.forEach((listener) => listener());
}

export function updateAppState(updater: (state: AppStorageState) => AppStorageState): AppStorageState {
  const next = updater(loadAppState());
  saveAppState(next);
  return next;
}

export function subscribeToAppState(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cachedState = readAppState();
      listener();
    }
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}

export function resetAssessment(): void {
  updateAppState((state) => {
    const fresh = createInitialAppState();
    return {
      ...state,
      sessionId: fresh.sessionId,
      assessmentProgress: fresh.assessmentProgress,
      answers: [],
      talentProfile: null,
      careerResults: null,
      experiments: [],
      selectedDirection: null,
      exploredCareers: [],
      completedExperiences: [],
      reflectionResults: [],
      navigatorState: { guidedAnswers: {} },
      betaFeedback: fresh.betaFeedback,
    };
  });
}

export function saveExperiment(record: ExperimentRecord): void {
  updateAppState((state) => ({
    ...state,
    experiments: [...state.experiments.filter((item) => item.careerId !== record.careerId), record],
  }));
}

export function selectCareerDirection(directionId: CareerDirectionId | null): void {
  updateAppState((state) => ({
    ...state,
    selectedDirection: directionId,
    navigatorState: { ...state.navigatorState, lastVisitedStep: directionId ? 'next_step' : 'choice', updatedAt: now() },
  }));
}

export function saveGuidedAnswer(promptId: string, directionId: CareerDirectionId): void {
  updateAppState((state) => ({
    ...state,
    navigatorState: {
      ...state.navigatorState,
      lastVisitedStep: 'choice',
      updatedAt: now(),
      guidedAnswers: { ...state.navigatorState.guidedAnswers, [promptId]: directionId },
    },
  }));
}

export function saveNavigatorNeed(need: NavigatorNeed): void {
  updateAppState((state) => ({ ...state, navigatorState: { ...state.navigatorState, need, updatedAt: now() } }));
}

export function markCareerExplored(careerId: string): void {
  updateAppState((state) => state.exploredCareers.includes(careerId) ? state : ({ ...state, exploredCareers: [...state.exploredCareers, careerId] }));
}

export function saveExperienceReflection(result: ExperienceReflectionResult): void {
  updateAppState((state) => ({
    ...state,
    completedExperiences: [...new Set([...state.completedExperiences, result.careerId])],
    reflectionResults: [...state.reflectionResults.filter(({ careerId }) => careerId !== result.careerId), result],
    experiments: state.experiments.map((record) => record.careerId === result.careerId ? { ...record, status: 'completed', currentStep: 4, updatedAt: result.completedAt } : record),
    navigatorState: { ...state.navigatorState, lastVisitedStep: 'experience', updatedAt: result.completedAt },
  }));
}
