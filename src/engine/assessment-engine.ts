import type {
  AssessmentResult,
  Question,
  QuestionResponse,
  QuestionType,
  SignalChannel,
  SignalObservation,
  TalentId,
  TalentOpportunity,
  ProfileOpportunity,
} from '../types';

export const QUESTION_EVIDENCE_QUALITY: Record<QuestionType, number> = {
  situational_choice: 0.75,
  forced_choice: 0.65,
  ranking: 0.6,
  behavior: 0.85,
  energy: 0.75,
  evidence: 1,
  interest: 0.6,
  environment: 0.6,
  values: 0.6,
};

export function normalizeScale(value: number, min: number, max: number): number {
  if (max <= min) throw new Error('Scale maximum must be greater than minimum.');
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

const addObservation = (
  observations: SignalObservation[],
  questionId: string,
  questionPrompt: string,
  questionType: QuestionType,
  optionId: string,
  optionLabel: string,
  channel: SignalChannel,
  signals: Record<string, number> | undefined,
  multiplier: number,
) => {
  if (!signals) return;

  for (const [key, value] of Object.entries(signals)) {
    observations.push({
      questionId,
      questionPrompt,
      questionType,
      optionId,
      optionLabel,
      channel,
      key,
      value: value * multiplier,
      evidenceQuality: QUESTION_EVIDENCE_QUALITY[questionType],
    });
  }
};

function responseMultiplier(question: Question, response: QuestionResponse): number {
  if (question.type !== 'behavior' && question.type !== 'evidence') return 1;
  if (response.scaleValue === undefined) {
    throw new Error(`Question ${question.id} requires a scaleValue.`);
  }
  return normalizeScale(response.scaleValue, question.scale.min, question.scale.max);
}

function collectOpportunities(question: Question): TalentOpportunity[] {
  const maximumByTalent = new Map<TalentId, number>();

  for (const option of question.options) {
    for (const [talentId, signal] of Object.entries(option.talentSignals ?? {}) as Array<
      [TalentId, number]
    >) {
      maximumByTalent.set(talentId, Math.max(maximumByTalent.get(talentId) ?? 0, signal));
    }
  }

  return [...maximumByTalent.entries()].map(([talentId, maximumSignal]) => ({
    talentId,
    questionId: question.id,
    questionType: question.type,
    maximumSignal,
    evidenceQuality: QUESTION_EVIDENCE_QUALITY[question.type],
  }));
}

function collectProfileOpportunities(question: Question): ProfileOpportunity[] {
  const channels = [
    ['interest', 'interestSignals'],
    ['work_style', 'workStyleSignals'],
    ['environment', 'environmentSignals'],
    ['value', 'valueSignals'],
  ] as const;
  return channels.flatMap(([channel, field]) => {
    const maximumByKey = new Map<string, number>();
    for (const option of question.options) {
      for (const [key, signal] of Object.entries(option[field] ?? {})) {
        maximumByKey.set(key, Math.max(maximumByKey.get(key) ?? 0, signal));
      }
    }
    return [...maximumByKey.entries()].map(([key, maximumSignal]) => ({
      channel,
      key,
      questionId: question.id,
      maximumSignal,
    }));
  });
}

export function runAssessment(
  questions: readonly Question[],
  responses: readonly QuestionResponse[],
): AssessmentResult {
  const responseByQuestionId = new Map<string, QuestionResponse>();
  for (const response of responses) {
    if (responseByQuestionId.has(response.questionId)) {
      throw new Error(`Duplicate response for question ${response.questionId}.`);
    }
    responseByQuestionId.set(response.questionId, response);
  }

  const observations: SignalObservation[] = [];
  const talentOpportunities: TalentOpportunity[] = [];
  const profileOpportunities: ProfileOpportunity[] = [];
  const answeredQuestionIds: string[] = [];

  for (const question of questions) {
    const response = responseByQuestionId.get(question.id);
    if (!response) continue;

    const optionById = new Map(question.options.map((option) => [option.id, option]));
    const selectedIds = question.type === 'ranking' ? (response.ranking ?? []) : response.selectedOptionIds;
    if (selectedIds.length === 0) throw new Error(`Question ${question.id} has no selected option.`);
    if (new Set(selectedIds).size !== selectedIds.length) {
      throw new Error(`Question ${question.id} contains duplicate option selections.`);
    }
    if (question.type !== 'ranking' && question.selection === 'single' && selectedIds.length !== 1) {
      throw new Error(`Question ${question.id} requires exactly one selection.`);
    }

    const scaleMultiplier = responseMultiplier(question, response);
    selectedIds.forEach((optionId, index) => {
      const option = optionById.get(optionId);
      if (!option) throw new Error(`Unknown option ${optionId} for question ${question.id}.`);
      const rankMultiplier =
        question.type === 'ranking' ? (selectedIds.length - index) / selectedIds.length : 1;
      const multiplier = scaleMultiplier * rankMultiplier;

      addObservation(
        observations,
        question.id,
        question.prompt,
        question.type,
        option.id,
        option.label,
        'ability',
        option.talentSignals,
        multiplier,
      );
      addObservation(
        observations,
        question.id,
        question.prompt,
        question.type,
        option.id,
        option.label,
        'energy',
        option.energySignals,
        multiplier,
      );
      addObservation(
        observations,
        question.id,
        question.prompt,
        question.type,
        option.id,
        option.label,
        'interest',
        option.interestSignals,
        multiplier,
      );
      addObservation(
        observations,
        question.id,
        question.prompt,
        question.type,
        option.id,
        option.label,
        'talent_interest',
        option.talentInterestSignals,
        multiplier,
      );
      addObservation(
        observations,
        question.id,
        question.prompt,
        question.type,
        option.id,
        option.label,
        'work_style',
        option.workStyleSignals,
        multiplier,
      );
      addObservation(
        observations,
        question.id,
        question.prompt,
        question.type,
        option.id,
        option.label,
        'environment',
        option.environmentSignals,
        multiplier,
      );
      addObservation(
        observations,
        question.id,
        question.prompt,
        question.type,
        option.id,
        option.label,
        'value',
        option.valueSignals,
        multiplier,
      );
    });

    answeredQuestionIds.push(question.id);
    talentOpportunities.push(...collectOpportunities(question));
    profileOpportunities.push(...collectProfileOpportunities(question));
  }

  return { observations, talentOpportunities, profileOpportunities, answeredQuestionIds };
}
