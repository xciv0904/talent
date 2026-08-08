import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUICK_DISCOVERY_QUESTIONS } from '../data/questions';
import { CURRENT_RESULT_VERSIONS } from '../config/versions';
import { runCareerDiscoveryPipeline } from '../engine';
import { markAssessmentCompleted, markAssessmentStarted, resetAssessment, saveQuestionFeedback, updateAppState, useAppState } from '../services';
import type { Question, QuestionFeedbackReason, QuestionResponse } from '../types';

const typeNames: Record<Question['type'], string> = {
  situational_choice: '情境判斷', forced_choice: '取捨選擇', ranking: '排序', behavior: '行為頻率', energy: '能量感受', evidence: '實際證據', interest: '興趣', environment: '工作環境', values: '價值選擇',
};
const questionFeedbackOptions: Array<[QuestionFeedbackReason, string]> = [
  ['none_fit', '選項都不像我'], ['multiple_fit', '好幾個都很像'], ['unclear_context', '情境不清楚'],
  ['unclear_difference', '看不懂差別'], ['no_experience', '沒遇過這種情況'],
];

export function AssessmentPage() {
  const state = useAppState();
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const index = Math.min(state.assessmentProgress.currentIndex, QUICK_DISCOVERY_QUESTIONS.length - 1);
  const question = QUICK_DISCOVERY_QUESTIONS[index];
  const answer = state.answers.find((item) => item.questionId === question.id);
  const progress = Math.round(((index + (answer ? 1 : 0)) / QUICK_DISCOVERY_QUESTIONS.length) * 100);
  const complete = Boolean(answer && answer.selectedOptionIds.length > 0 && (!('scale' in question) || answer.scaleValue !== undefined));

  const saveResponse = (next: QuestionResponse) => updateAppState((current) => ({
    ...current,
    answers: [...current.answers.filter((item) => item.questionId !== question.id), next],
    assessmentProgress: { ...current.assessmentProgress, currentIndex: index, updatedAt: next.answeredAt },
  }));

  const select = (optionId: string) => {
    markAssessmentStarted();
    const now = new Date().toISOString();
    if (question.type === 'ranking') {
      const ranking = answer?.ranking ?? [];
      const nextRanking = ranking.includes(optionId) ? ranking.filter((id) => id !== optionId) : [...ranking, optionId].slice(0, question.rankCount);
      saveResponse({ questionId: question.id, selectedOptionIds: nextRanking, ranking: nextRanking, answeredAt: now });
      return;
    }
    const multiple = 'selection' in question && question.selection === 'multiple';
    const selected = answer?.selectedOptionIds ?? [];
    const nextSelected = multiple
      ? selected.includes(optionId) ? selected.filter((id) => id !== optionId) : [...selected, optionId].slice(0, question.maxSelections ?? question.options.length)
      : [optionId];
    saveResponse({ questionId: question.id, selectedOptionIds: nextSelected, scaleValue: 'scale' in question ? answer?.scaleValue ?? question.scale.min : undefined, answeredAt: now });
  };

  const go = (nextIndex: number) => updateAppState((current) => ({ ...current, assessmentProgress: { ...current.assessmentProgress, currentIndex: nextIndex, updatedAt: new Date().toISOString() } }));
  const finish = () => {
    const latest = updateAppState((current) => current);
    const output = runCareerDiscoveryPipeline(latest.answers, { education: 'none' });
    updateAppState((current) => ({ ...current, assessmentProgress: { currentIndex: index, completed: true, updatedAt: new Date().toISOString() }, talentProfile: output.talentProfile, careerResults: { matches: output.matches, categories: output.categories, profiles: output.profiles, versions: CURRENT_RESULT_VERSIONS } }));
    markAssessmentCompleted();
    navigate('/results');
  };
  const cardTone = useMemo(() => ((): Partial<Record<Question['type'], string>> => ({ energy: 'bg-blue-50 border-blue-200', values: 'bg-slate-50 border-slate-200', environment: 'bg-slate-100 border-slate-200', interest: 'bg-blue-50 border-blue-200' }))()[question.type] ?? 'bg-white border-slate-200', [question.type]);

  return <main className="mx-auto min-h-[calc(100svh-5rem)] max-w-4xl px-3 py-6 sm:px-6 sm:py-14">
    <div className="flex items-center justify-between gap-4 text-sm"><span className="font-semibold">{typeNames[question.type]}</span><span className="text-slate-500">{index + 1} / {QUICK_DISCOVERY_QUESTIONS.length}</span></div>
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10" aria-label={`進度 ${progress}%`}><div className="h-full rounded-full bg-coral transition-all" style={{ width: `${progress}%` }} /></div>
    <section className="mt-6 rounded-[1.5rem] border border-ink/10 bg-white/65 p-4 shadow-[0_30px_80px_-65px_rgba(24,35,31,.65)] sm:mt-8 sm:rounded-[2rem] sm:p-10">
      <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">{question.id}</p>
      <h1 className="mt-3 font-serif text-[clamp(1.65rem,4vw,2.5rem)] font-normal leading-[1.15] tracking-[-.025em] text-balance">{question.prompt}</h1>
      {question.description && <p className="mt-3 text-slate-600">{question.description}</p>}
      <div className={`mt-8 grid gap-3 ${question.type === 'forced_choice' ? 'sm:grid-cols-2' : question.type === 'energy' ? 'sm:grid-cols-2' : ''}`}>
        {question.options.map((option, optionIndex) => {
          const selected = answer?.selectedOptionIds.includes(option.id) ?? false;
          const rank = answer?.ranking?.indexOf(option.id);
          return <button key={option.id} type="button" onClick={() => select(option.id)} className={`assessment-option min-h-20 rounded-2xl border p-4 text-left ${cardTone} ${selected ? 'border-ink ring-2 ring-ink ring-offset-2' : 'hover:shadow-md'}`}>
            <span className="flex items-start gap-3"><span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm ${selected ? 'bg-ink text-white' : 'bg-white/80 text-ink/50'}`}>{question.type === 'ranking' && rank !== undefined && rank >= 0 ? rank + 1 : String.fromCharCode(65 + optionIndex)}</span><span><strong className="font-medium leading-6">{option.label}</strong>{option.description && <span className="mt-1 block text-sm leading-5 text-ink/50">{option.description}</span>}</span></span>
          </button>;
        })}
      </div>
      {'scale' in question && answer && <div className="mt-8 rounded-2xl bg-slate-100 p-5"><div className="flex justify-between text-sm text-slate-500"><span>{question.scale.minLabel}</span><strong className="text-slate-950">{answer.scaleValue ?? question.scale.min}</strong><span>{question.scale.maxLabel}</span></div><input aria-label="程度" className="mt-4 w-full accent-slate-950" type="range" min={question.scale.min} max={question.scale.max} value={answer.scaleValue ?? question.scale.min} onChange={(event) => saveResponse({ ...answer, scaleValue: Number(event.target.value), answeredAt: new Date().toISOString() })} /></div>}
    </section>
    <div className="mt-4 rounded-2xl border border-ink/10 bg-white/45 p-4"><button type="button" aria-expanded={feedbackOpen} onClick={() => setFeedbackOpen((open) => !open)} className="text-sm font-semibold underline decoration-slate-300 underline-offset-4">這題不好回答</button>{feedbackOpen && <div className="mt-3 flex flex-wrap gap-2" aria-label="題目回饋">{questionFeedbackOptions.map(([value, label]) => { const selected = state.betaFeedback.questionFeedback.some((item) => item.questionId === question.id && item.reason === value); return <button key={value} type="button" aria-pressed={selected} onClick={() => saveQuestionFeedback(question.id, value)} className={`rounded-full border px-3 py-2 text-xs ${selected ? 'border-ink bg-ink text-white' : 'border-ink/15 bg-white text-ink/65'}`}>{label}</button>; })}</div>}</div>
    <div className="mt-5 flex items-center justify-between gap-3"><button type="button" disabled={index === 0} onClick={() => go(index - 1)} className="min-h-12 rounded-full border border-ink/15 bg-white/70 px-4 font-semibold disabled:opacity-30 sm:px-5">← 上一題</button>{index === QUICK_DISCOVERY_QUESTIONS.length - 1 ? <button type="button" disabled={!complete} onClick={finish} className="min-h-12 rounded-full bg-coral px-5 font-semibold disabled:opacity-30 sm:px-6">產生結果</button> : <button type="button" disabled={!complete} onClick={() => go(index + 1)} className="min-h-12 rounded-full bg-ink px-5 font-semibold text-white disabled:opacity-30 sm:px-6">下一題 →</button>}</div>
    <div className="mt-8 flex items-center justify-between text-xs text-slate-500"><span>每次作答都會自動保存，重新整理後可繼續。</span><button type="button" onClick={() => { if (window.confirm('確定清除目前進度？')) { resetAssessment(); navigate('/assessment'); } }} className="underline">重新開始</button></div>
  </main>;
}
