import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QUICK_DISCOVERY_QUESTIONS } from '../data/questions';
import { CURRENT_RESULT_VERSIONS } from '../config/versions';
import { runCareerDiscoveryPipeline } from '../engine';
import { markAssessmentCompleted, markAssessmentStarted, saveQuestionFeedback } from '../services/beta-feedback';
import { resetAssessment, updateAppState } from '../services/storage';
import { useAppState } from '../services/use-app-state';
import type { Question, QuestionFeedbackReason, QuestionResponse } from '../types';
import { isQuestionResponseComplete } from '../utils';

const typeNames: Record<Question['type'], string> = {
  situational_choice: '情境判斷', forced_choice: '取捨選擇', ranking: '排序', behavior: '行為頻率', energy: '能量感受', evidence: '實際證據', interest: '興趣', environment: '工作環境', values: '價值選擇',
};
const questionFeedbackOptions: Array<[QuestionFeedbackReason, string]> = [
  ['scenario_unclear', '情境不清楚'], ['multiple_valid_answers', '好幾個答案都合理'],
  ['no_matching_answer', '沒有符合我的答案'], ['requires_experience', '需要我沒有的經驗'],
  ['term_unclear', '有詞看不懂'], ['depends_too_much_on_context', '太依賴特定情境'],
];

export function AssessmentPage() {
  const state = useAppState();
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(state.answers.length > 0);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const index = Math.min(state.assessmentProgress.currentIndex, QUICK_DISCOVERY_QUESTIONS.length - 1);
  const question = QUICK_DISCOVERY_QUESTIONS[index];
  const answer = state.answers.find((item) => item.questionId === question.id);
  const progress = Math.round(((index + (answer ? 1 : 0)) / QUICK_DISCOVERY_QUESTIONS.length) * 100);
  const complete = isQuestionResponseComplete(question, answer);

  const saveResponse = (next: QuestionResponse) => updateAppState((current) => ({
    ...current,
    answers: [...current.answers.filter((item) => item.questionId !== question.id), next],
    assessmentProgress: { ...current.assessmentProgress, currentIndex: index, updatedAt: next.answeredAt },
  }));

  const select = (optionId: string) => {
    setSubmissionError(null);
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
    const maxSelections = 'maxSelections' in question ? question.maxSelections ?? question.options.length : question.options.length;
    const nextSelected = multiple
      ? selected.includes(optionId)
        ? question.type === 'energy' && selected[0] === optionId ? [] : selected.filter((id) => id !== optionId)
        : selected.length >= maxSelections ? [...selected.slice(0, maxSelections - 1), optionId] : [...selected, optionId]
      : [optionId];
    saveResponse({
      questionId: question.id,
      selectedOptionIds: nextSelected,
      scaleValue: 'scale' in question && answer?.selectedOptionIds.includes(optionId) ? answer.scaleValue : undefined,
      answeredAt: now,
    });
  };

  const go = (nextIndex: number) => updateAppState((current) => ({ ...current, assessmentProgress: { ...current.assessmentProgress, currentIndex: nextIndex, updatedAt: new Date().toISOString() } }));
  const finish = () => {
    const latest = updateAppState((current) => current);
    const currentIds = new Set(QUICK_DISCOVERY_QUESTIONS.map(({ id }) => id));
    const currentAnswers = latest.answers.filter(({ questionId }) => currentIds.has(questionId));
    const incompleteIndex = QUICK_DISCOVERY_QUESTIONS.findIndex((item) => !isQuestionResponseComplete(item, currentAnswers.find(({ questionId }) => questionId === item.id)));
    if (incompleteIndex >= 0) {
      setSubmissionError('題庫或作答方式已更新，請先完成這一題，再產生結果。');
      go(incompleteIndex);
      return;
    }
    try {
      const output = runCareerDiscoveryPipeline(currentAnswers, { education: 'none' });
      updateAppState((current) => ({ ...current, answers: currentAnswers, assessmentProgress: { currentIndex: index, completed: true, updatedAt: new Date().toISOString() }, talentProfile: output.talentProfile, careerResults: { matches: output.matches, categories: output.categories, profiles: output.profiles, versions: CURRENT_RESULT_VERSIONS } }));
      markAssessmentCompleted();
      navigate('/results');
    } catch {
      setSubmissionError('結果暫時無法產生。你的答案仍已保存，請重新整理後再試一次。');
    }
  };
  const cardTone = useMemo(() => ((): Partial<Record<Question['type'], string>> => ({ energy: 'bg-blue-50 border-blue-200', values: 'bg-slate-50 border-slate-200', environment: 'bg-slate-100 border-slate-200', interest: 'bg-blue-50 border-blue-200' }))()[question.type] ?? 'bg-white border-slate-200', [question.type]);

  if (!introDismissed && state.answers.length === 0) return <AssessmentIntro onStart={() => setIntroDismissed(true)} />;

  return <main className="mx-auto min-h-[calc(100svh-5rem)] max-w-4xl px-3 py-6 sm:px-6 sm:py-14">
    <div className="flex items-center justify-between gap-4 text-sm"><span className="font-semibold">{typeNames[question.type]}</span><span className="text-slate-500">{index + 1} / {QUICK_DISCOVERY_QUESTIONS.length}</span></div>
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10" aria-label={`進度 ${progress}%`}><div className="h-full rounded-full bg-coral transition-all" style={{ width: `${progress}%` }} /></div>
    <section className="mt-6 rounded-[1.5rem] border border-ink/10 bg-white/65 p-4 shadow-[0_30px_80px_-65px_rgba(24,35,31,.65)] sm:mt-8 sm:rounded-[2rem] sm:p-10">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold tracking-widest text-slate-400 uppercase"><span>{question.id}</span><span>情境</span></div>
      <h1 className="mt-3 font-serif text-[clamp(1.55rem,4vw,2.35rem)] font-normal leading-[1.2] tracking-[-.025em] text-balance">{question.scenario}</h1>
      <p className="mt-5 border-l-2 border-blue-300 pl-4 text-lg font-semibold leading-7 text-slate-900 sm:text-xl">{question.prompt}</p>
      {question.description && <p className="mt-3 text-slate-600">{question.description}</p>}
      <div className={`mt-8 grid gap-3 ${question.type === 'forced_choice' ? 'sm:grid-cols-2' : question.type === 'energy' ? 'sm:grid-cols-2' : ''}`}>
        {question.options.map((option, optionIndex) => {
          const selected = answer?.selectedOptionIds.includes(option.id) ?? false;
          const rank = answer?.ranking?.indexOf(option.id);
          const energyOrder = question.type === 'energy' && question.selection === 'multiple'
            ? answer?.selectedOptionIds.indexOf(option.id)
            : -1;
          return <button key={option.id} type="button" onClick={() => select(option.id)} className={`assessment-option min-h-20 rounded-2xl border p-4 text-left ${cardTone} ${selected ? 'border-ink ring-2 ring-ink ring-offset-2' : 'hover:shadow-md'}`}>
            <span className="flex items-start gap-3"><span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm ${selected ? 'bg-ink text-white' : 'bg-white/80 text-ink/50'}`}>{energyOrder === 0 ? '＋' : energyOrder === 1 ? '－' : question.type === 'ranking' && rank !== undefined && rank >= 0 ? rank + 1 : String.fromCharCode(65 + optionIndex)}</span><span><strong className="font-medium leading-6">{option.label}</strong>{energyOrder === 0 && <span className="mt-1 block text-xs font-semibold text-blue-700">較有精神</span>}{energyOrder === 1 && <span className="mt-1 block text-xs font-semibold text-slate-600">較消耗</span>}{option.description && <span className="mt-1 block text-sm leading-5 text-ink/50">{option.description}</span>}</span></span>
          </button>;
        })}
      </div>
      {question.type === 'energy' && answer?.selectedOptionIds.length ? <button type="button" onClick={() => saveResponse({ questionId: question.id, selectedOptionIds: [], answeredAt: new Date().toISOString() })} className="mt-4 text-sm font-semibold underline decoration-slate-300 underline-offset-4">重新選擇這題</button> : null}
      {'scale' in question && answer && <fieldset className="mt-8 rounded-2xl bg-slate-100 p-5"><legend className="px-1 font-semibold">再選一個最接近的程度</legend><div className="mt-3 flex justify-between text-xs leading-5 text-slate-500"><span className="max-w-[8rem]">{question.scale.minLabel}</span><span className="max-w-[8rem] text-right">{question.scale.maxLabel}</span></div><div className="mt-4 grid grid-cols-5 gap-2">{Array.from({ length: question.scale.max - question.scale.min + 1 }, (_, offset) => question.scale.min + offset).map((value) => <button key={value} type="button" aria-pressed={answer.scaleValue === value} aria-label={`程度 ${value}：${value === question.scale.min ? question.scale.minLabel : value === question.scale.max ? question.scale.maxLabel : ''}`} onClick={() => saveResponse({ ...answer, scaleValue: value, answeredAt: new Date().toISOString() })} className={`min-h-12 rounded-xl border text-sm font-semibold ${answer.scaleValue === value ? 'border-ink bg-ink text-white' : 'border-slate-300 bg-white'}`}>{value}</button>)}</div>{answer.scaleValue === undefined && <p className="mt-3 text-sm text-slate-600" aria-live="polite">選擇程度後才能進入下一題。</p>}</fieldset>}
    </section>
    <div className="mt-4 rounded-2xl border border-ink/10 bg-white/45 p-4"><button type="button" aria-expanded={feedbackOpen} onClick={() => setFeedbackOpen((open) => !open)} className="text-sm font-semibold underline decoration-slate-300 underline-offset-4">這題不好回答</button>{feedbackOpen && <div className="mt-3 flex flex-wrap gap-2" aria-label="題目回饋">{questionFeedbackOptions.map(([value, label]) => { const selected = state.betaFeedback.questionFeedback.some((item) => item.questionId === question.id && item.reason === value); return <button key={value} type="button" aria-pressed={selected} onClick={() => saveQuestionFeedback(question.id, value)} className={`rounded-full border px-3 py-2 text-xs ${selected ? 'border-ink bg-ink text-white' : 'border-ink/15 bg-white text-ink/65'}`}>{label}</button>; })}</div>}</div>
    {submissionError && <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{submissionError}</p>}
    <div className="mt-5 flex items-center justify-between gap-3"><button type="button" disabled={index === 0} onClick={() => go(index - 1)} className="min-h-12 rounded-full border border-ink/15 bg-white/70 px-4 font-semibold disabled:opacity-30 sm:px-5">← 上一題</button>{index === QUICK_DISCOVERY_QUESTIONS.length - 1 ? <button type="button" disabled={!complete} onClick={finish} className="min-h-12 rounded-full bg-coral px-5 font-semibold disabled:opacity-30 sm:px-6">產生結果</button> : <button type="button" disabled={!complete} onClick={() => go(index + 1)} className="min-h-12 rounded-full bg-ink px-5 font-semibold text-white disabled:opacity-30 sm:px-6">下一題 →</button>}</div>
    <div className="mt-8 flex items-center justify-between text-xs text-slate-500"><span>每次作答都會自動保存，重新整理後可繼續。</span><button type="button" onClick={() => { if (window.confirm('確定清除目前進度？')) { resetAssessment(); navigate('/assessment'); } }} className="underline">重新開始</button></div>
  </main>;
}

function AssessmentIntro({ onStart }: { onStart: () => void }) {
  return <main className="mx-auto min-h-[calc(100svh-5rem)] max-w-4xl px-5 py-14 sm:py-20">
    <p className="text-sm font-bold tracking-widest text-slate-500 uppercase">開始前先知道</p>
    <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">35 個選擇，整理你自然的工作方式。</h1>
    <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">沒有標準答案，也不用想像自己是某種職業。選你第一個自然反應，比選「看起來最好」的答案更有用。</p>
    <div className="mt-10 grid gap-4 sm:grid-cols-3"><IntroCard label="約 8–10 分鐘" body="可以中途離開，進度會自動保存。" /><IntroCard label="多種題型" body="部分題目會再問頻率、證據程度或能量感受。" /><IntroCard label="結果不是定論" body="結果提供可追溯理由與低成本職涯體驗。" /></div>
    <div className="mt-8 rounded-3xl bg-blue-50 p-6"><h2 className="text-lg font-semibold">看到能量題時</h2><p className="mt-2 leading-7 text-slate-600">同一題會選兩項：先選做完仍「較有精神」的，再選做久「較消耗」的。能力與能量會分開分析。</p></div>
    <div className="mt-9 flex flex-wrap gap-3"><button type="button" onClick={onStart} className="rounded-full bg-ink px-6 py-3 font-semibold text-white">開始 35 題探索 →</button><Link to="/methodology" className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold">先看分析方法</Link></div>
  </main>;
}

function IntroCard({ label, body }: { label: string; body: string }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">{label}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></section>;
}
