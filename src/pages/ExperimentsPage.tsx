import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CAREER_PROFILES } from '../data/careers';
import { saveExperienceReflection, saveExperiment } from '../services/storage';
import { useAppState } from '../services/use-app-state';
import type { ExperienceFeeling, ExperiencePreference } from '../types';
import { buildCareerExperiencePlan, guidanceFromFeeling } from '../utils';

const feelings: Array<[ExperienceFeeling, string]> = [['engaged', '很投入'], ['interesting', '有點有趣'], ['neutral', '普通'], ['draining', '有點消耗'], ['disliked', '很不喜歡']];
const preferences: Array<[ExperiencePreference, string]> = [['find_problems', '我喜歡找問題'], ['understand_people', '我喜歡理解別人'], ['organize_observations', '我喜歡整理觀察'], ['improve_ideas', '我喜歡想改善方法'], ['none', '我其實都不太喜歡']];

export function ExperimentsPage() {
  const state = useAppState();
  const [params] = useSearchParams();
  const requestedId = params.get('career');
  const fallbackId = state.experiments.find(({ status }) => status === 'in_progress')?.careerId ?? state.experiments[0]?.careerId;
  const activeId = requestedId ?? fallbackId;
  const career = CAREER_PROFILES.find(({ id }) => id === activeId);
  const record = state.experiments.find(({ careerId }) => careerId === activeId);
  const reflection = state.reflectionResults.find(({ careerId }) => careerId === activeId);
  const [feeling, setFeeling] = useState<ExperienceFeeling | undefined>(reflection?.feeling);
  const [preference, setPreference] = useState<ExperiencePreference | undefined>(reflection?.preference);
  useEffect(() => { setFeeling(reflection?.feeling); setPreference(reflection?.preference); }, [activeId, reflection?.feeling, reflection?.preference]);
  const suggestions = state.careerResults?.matches.slice(0, 6) ?? [];

  return <main className="mx-auto max-w-6xl px-5 py-14"><header className="max-w-3xl"><p className="text-sm font-bold tracking-widest text-slate-500 uppercase">Try the work, not the title</p><h1 className="mt-3 text-5xl font-semibold">20 分鐘職涯體驗</h1><p className="mt-4 text-lg leading-8 text-slate-600">不是測你夠不夠格，而是用一小段真實工作活動，確認自己有興趣、普通，還是很消耗。</p></header>
    {career ? <ExperienceRunner career={career} record={record} feeling={feeling} preference={preference} reflection={reflection} onFeeling={setFeeling} onPreference={setPreference} /> : <section className="mt-12 rounded-3xl border border-dashed border-slate-300 p-7"><h2 className="text-2xl font-semibold">先選一個想試的方向</h2><p className="mt-3 text-slate-600">從結果頁選定職涯方向後，這裡會帶你逐步完成一個 20 分鐘體驗。</p><Link to="/results" className="mt-5 inline-block rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">回到職涯導航</Link></section>}

    <section className="mt-16"><h2 className="text-2xl font-semibold">其他可以試的工作</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{suggestions.map((match) => { const item = CAREER_PROFILES.find(({ id }) => id === match.careerId)!; return <Link key={match.careerId} to={`/experiments?career=${match.careerId}`} className="rounded-3xl bg-blue-50 p-6"><p className="text-sm text-slate-600">20 分鐘</p><h3 className="mt-2 text-xl font-semibold">試試 {item.titleZh}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{item.coreTasks[0]}</p></Link>; })}</div>{!suggestions.length && <Link to="/assessment" className="mt-5 inline-block underline">先完成測驗取得建議</Link>}</section>
  </main>;
}

function ExperienceRunner({ career, record, feeling, preference, reflection, onFeeling, onPreference }: {
  career: (typeof CAREER_PROFILES)[number];
  record: ReturnType<typeof useAppState>['experiments'][number] | undefined;
  feeling?: ExperienceFeeling;
  preference?: ExperiencePreference;
  reflection: ReturnType<typeof useAppState>['reflectionResults'][number] | undefined;
  onFeeling: (value: ExperienceFeeling) => void;
  onPreference: (value: ExperiencePreference) => void;
}) {
  const plan = buildCareerExperiencePlan(career);
  const step = record?.currentStep ?? 0;
  const started = record?.status === 'in_progress' || record?.status === 'completed';
  const showReflection = step >= plan.steps.length || record?.status === 'completed';
  const updateStep = (next: number) => saveExperiment({ careerId: career.id, status: 'in_progress', currentStep: next, updatedAt: new Date().toISOString() });
  const submitReflection = () => {
    if (!feeling || !preference) return;
    const completedAt = new Date().toISOString();
    saveExperienceReflection({ careerId: career.id, feeling, preference, guidance: guidanceFromFeeling(feeling), completedAt });
  };

  return <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-10"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-bold text-slate-500">{career.titleZh}</p><h2 className="mt-2 text-3xl font-semibold">{record?.status === 'completed' ? '你已完成這次體驗' : '先試一小段真實工作'}</h2></div><Link to={`/career/${career.id}`} className="text-sm font-semibold underline">查看這份工作</Link></div>
    {!started && <div className="mt-8"><h3 className="text-xl font-semibold">這個體驗要幫你確認什麼？</h3><p className="mt-3 max-w-3xl leading-7 text-slate-600">{plan.purpose}</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><Info label="需要多久" value={plan.duration} /><Info label="需要什麼" value={plan.requirements.join('、')} /><Info label="最後會得到什麼" value={plan.outcome} /></div><button type="button" onClick={() => updateStep(0)} className="mt-7 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white">開始 Step 1</button></div>}
    {started && !showReflection && <div className="mt-9 max-w-3xl"><p className="text-sm font-bold tracking-widest text-slate-500 uppercase">Step {step + 1} / {plan.steps.length}</p><div className="mt-4 rounded-3xl bg-blue-50 p-7"><p className="text-xl leading-8">{plan.steps[step]}</p></div><div className="mt-6 flex justify-between gap-3">{step > 0 ? <button type="button" onClick={() => updateStep(step - 1)} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold">上一步</button> : <span />}<button type="button" onClick={() => updateStep(step + 1)} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">{step === plan.steps.length - 1 ? '完成並記錄感受' : '下一步'}</button></div></div>}
    {showReflection && <div className="mt-9 border-t border-slate-200 pt-8"><h3 className="text-2xl font-semibold">做這件事時，你的感覺？</h3><div className="mt-4 flex flex-wrap gap-2">{feelings.map(([value, label]) => <button key={value} type="button" aria-pressed={feeling === value} onClick={() => onFeeling(value)} className={`rounded-full border px-4 py-2 text-sm ${feeling === value ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300'}`}>{label}</button>)}</div><h3 className="mt-8 text-xl font-semibold">哪一部分最符合你的感覺？</h3><div className="mt-4 grid gap-2 sm:grid-cols-2">{preferences.map(([value, label]) => <button key={value} type="button" aria-pressed={preference === value} onClick={() => onPreference(value)} className={`rounded-2xl border p-3 text-left text-sm ${preference === value ? 'border-slate-950 bg-blue-50 ring-2 ring-slate-950' : 'border-slate-300'}`}>{label}</button>)}</div>{!reflection && <button type="button" disabled={!feeling || !preference} onClick={submitReflection} className="mt-7 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">看看這次體驗代表什麼</button>}{reflection && <Guidance guidance={reflection.guidance} careerId={career.id} />}</div>}
  </section>;
}

function Guidance({ guidance, careerId }: { guidance: 'continue' | 'try_another' | 'deprioritize'; careerId: string }) {
  const copy = guidance === 'continue'
    ? { title: '值得繼續探索', body: '你對這段核心工作活動有投入或興趣訊號。下一步可以再看一份相近工作，確認吸引你的是方向本身，還是這個特定任務。' }
    : guidance === 'try_another'
      ? { title: '可以再試一次不同類型的任務', body: '這次感受偏中性，還不足以支持或排除整個方向。換一個核心任務再試，比立刻下結論更可靠。' }
      : { title: '這個方向可能不用優先', body: '這次工作活動帶來明顯消耗或排斥。這不代表你做不到，但目前可以先把探索時間放到另一個方向。' };
  return <div className="mt-8 rounded-3xl bg-blue-100 p-6" aria-live="polite"><p className="text-sm font-bold text-slate-600">這次體驗的建議</p><h4 className="mt-2 text-2xl font-semibold">{copy.title}</h4><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">{copy.body}</p><div className="mt-5 flex flex-wrap gap-3">{guidance === 'continue' ? <Link to={`/career/${careerId}`} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">繼續探索這個方向</Link> : <Link to="/results#direction-choice" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">換一條路看看</Link>}<Link to="/results" className="rounded-full border border-slate-400 px-5 py-3 text-sm font-semibold">回到職涯導航</Link></div></div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-slate-50 p-4"><strong>{label}</strong><p className="mt-2 text-sm leading-6 text-slate-600">{value}</p></div>; }
