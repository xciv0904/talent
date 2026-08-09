import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CareerCard } from '../components';
import { useAppState } from '../services';
import type { CareerResultCategory } from '../types';

type CareerTab = CareerResultCategory | 'all';
const categories: Array<[CareerTab, string]> = [['all', '完整相對排名'], ['best_fit', 'Best Fit'], ['easier_transition', 'Easier Transition'], ['high_potential', 'High Potential'], ['surprise_me', 'Surprise Me']];

export function CareersPage() {
  const { careerResults } = useAppState();
  const [active, setActive] = useState<CareerTab>('all');
  const matches = useMemo(() => active === 'all' ? careerResults?.matches.slice(0, 20) ?? [] : careerResults?.categories[active] ?? [], [active, careerResults]);
  if (!careerResults) return <main className="mx-auto max-w-2xl px-5 py-24 text-center"><h1 className="text-4xl font-semibold">先建立你的 Career Matches</h1><p className="mt-4 text-sm leading-6 text-ink/55">目前 Career Library 收錄 60 個職業；完成後的結果只會在這個範圍內比較，未出現的職業不代表不適合。</p><Link to="/assessment" className="mt-7 inline-block rounded-full bg-slate-950 px-6 py-3 text-white">完成測驗</Link></main>;
  return <main className="mx-auto max-w-7xl px-4 py-12 sm:px-5 sm:py-16"><header className="max-w-3xl"><h1 className="font-serif text-[clamp(3rem,7vw,5.5rem)] font-normal leading-none tracking-[-.04em]">Career Matches</h1><p className="mt-5 text-lg leading-8 text-ink/60">這裡保留完整相對排名；主要 Results 只先呈現三個 Career Directions。Career Fit 不是百分比，也不代表 60 以下就不適合。</p><p className="mt-3 text-sm leading-6 text-ink/50">四個分類使用不同邏輯。沒有出現在推薦中，不代表你不適合；真實職涯選項比目前 60 種資料庫更廣。</p></header><div className="mt-9 flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none]">{categories.map(([key, label]) => <button key={key} type="button" onClick={() => setActive(key)} className={`result-tab min-h-11 shrink-0 rounded-full px-5 text-sm font-semibold ${active === key ? 'bg-ink text-white' : 'border border-ink/10 bg-white/70'}`}>{label} · {key === 'all' ? careerResults.matches.length : careerResults.categories[key].length}</button>)}</div><div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{matches.map((match) => <CareerCard key={match.careerId} match={match} rank={careerResults.matches.findIndex(({ careerId }) => careerId === match.careerId) + 1} total={careerResults.matches.length} />)}</div>{matches.length === 0 && <p className="mt-7 rounded-3xl border border-dashed border-ink/20 p-7 text-ink/60">沒有符合這個分類門檻的結果；系統不會為了填滿卡片降低條件。</p>}</main>;
}
