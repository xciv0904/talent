import type { Question, QuestionResponse } from '../types';

export function isQuestionResponseComplete(question: Question, response?: QuestionResponse): boolean {
  if (!response) return false;
  if (question.type === 'ranking' && response.selectedOptionIds.length !== question.rankCount) return false;
  if (question.type === 'energy' && question.selection === 'multiple' && response.selectedOptionIds.length !== 2) return false;
  if (question.type !== 'ranking' && question.selection === 'single' && response.selectedOptionIds.length !== 1) return false;
  return !('scale' in question) || response.scaleValue !== undefined;
}
