import { Link } from 'react-router-dom';
import { SUPPLEMENTAL_DISCOVERY_QUESTIONS } from '../data/questions';
import { beginSupplementalAssessment } from '../services/storage';
import { useAppState } from '../services/use-app-state';
import { isQuestionResponseComplete } from '../utils';

export function AssessmentStageNotice({ className = '' }: { className?: string }) {
  const state = useAppState();
  const isPreliminary = Boolean(state.talentProfile && state.careerResults && !state.assessmentProgress.completed);
  if (!isPreliminary) return null;

  const remaining = SUPPLEMENTAL_DISCOVERY_QUESTIONS.filter((question) =>
    !isQuestionResponseComplete(question, state.answers.find(({ questionId }) => questionId === question.id)),
  ).length;

  return <aside className={`rounded-3xl border border-blue-200 bg-blue-50 p-5 sm:p-6 ${className}`} aria-label="初步結果說明">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-3xl">
        <p className="text-sm font-bold tracking-widest text-slate-600 uppercase">初步結果 · 核心 25 題已完成</p>
        <p className="mt-2 leading-7 text-slate-700">能力交叉驗證已完成；能量、興趣、環境與價值觀仍有 {remaining} 題可以補充，因此職涯排序可能調整。</p>
      </div>
      <Link to="/assessment" onClick={beginSupplementalAssessment} className="shrink-0 rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white">{remaining > 0 ? `完成剩餘 ${remaining} 題` : '更新完整結果'} →</Link>
    </div>
  </aside>;
}
