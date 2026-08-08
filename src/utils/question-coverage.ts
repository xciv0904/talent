import type { Question, QuestionType, TalentId } from '../types';

export interface TalentCoverage {
  talentId: TalentId;
  questionIds: string[];
  signalCount: number;
  questionTypes: QuestionType[];
}

export function getQuestionCoverage(questions: readonly Question[]): TalentCoverage[] {
  const coverage = new Map<TalentId, { questionIds: Set<string>; questionTypes: Set<QuestionType> }>();

  for (const question of questions) {
    const talentsInQuestion = new Set<TalentId>();
    for (const option of question.options) {
      for (const talentId of Object.keys(option.talentSignals ?? {}) as TalentId[]) {
        talentsInQuestion.add(talentId);
      }
    }
    for (const talentId of talentsInQuestion) {
      const item = coverage.get(talentId) ?? { questionIds: new Set(), questionTypes: new Set() };
      item.questionIds.add(question.id);
      item.questionTypes.add(question.type);
      coverage.set(talentId, item);
    }
  }

  return [...coverage.entries()]
    .map(([talentId, item]) => ({
      talentId,
      questionIds: [...item.questionIds],
      signalCount: item.questionIds.size,
      questionTypes: [...item.questionTypes],
    }))
    .sort((a, b) => a.talentId.localeCompare(b.talentId));
}
