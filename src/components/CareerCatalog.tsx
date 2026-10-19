import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CAREER_PROFILES } from '../data/careers';
import { CAREER_REFERENCE_SOURCES, CAREER_SCOPES, careerMatchesSearch, careerScope } from '../data/careers/coverage';
import { LAB_CAREERS } from '../lab/content';

const playable = new Set(LAB_CAREERS.map((c) => c.careerId));
export function CareerCatalog() {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('all');
  const careers = CAREER_PROFILES.filter((c) => (scope === 'all' || careerScope(c.id) === scope) && careerMatchesSearch(c.id, query));
  return <section id="career-catalog" className="mt-12 scroll-mt-24">
    <p className="text-sm font-bold tracking-widest text-slate-500">不必先測驗，也能找工作方向</p>
    <h2 className="mt-3 text-3xl font-semibold">從 {CAREER_PROFILES.length} 種職業，找你想了解的生活</h2>
    <p className="mt-4 max-w-3xl leading-7 text-slate-600">老師、軍警消、醫師、律師，也有廚師、司機、照服員、農業與技術工作。先看每天做什麼，再了解入行條件；每個領域都有值得累積的專業。</p>
    <div className="my-6 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 font-semibold">搜尋職業或工作內容<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="例如：老師、醫生、司機、農業" className="rounded-xl border border-slate-300 bg-white p-3 font-normal" /></label><label className="grid gap-2 font-semibold">職業範圍<select value={scope} onChange={(e) => setScope(e.target.value)} className="rounded-xl border border-slate-300 bg-white p-3 font-normal"><option value="all">全部範圍</option>{CAREER_SCOPES.map(([id, title]) => <option key={id} value={id}>{title}（{CAREER_PROFILES.filter((c) => careerScope(c.id) === id).length}）</option>)}</select></label></div>
    <p role="status" className="mb-5 text-sm text-slate-600">找到 {careers.length} 種職業 · {LAB_CAREERS.length} 種另有故事與試做任務</p>
    {!careers.length && <div className="rounded-2xl bg-slate-100 p-6"><p>目前沒有符合的職業，試試常見名稱或放寬範圍。</p><button type="button" className="mt-3 underline" onClick={() => { setQuery(''); setScope('all'); }}>清除搜尋與範圍</button></div>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{careers.map((c) => <article key={c.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6"><span className="text-xs font-bold text-slate-500">{CAREER_SCOPES.find(([id]) => id === careerScope(c.id))?.[1]}</span><h3 className="mt-2 text-xl font-semibold"><Link to={`/career/${c.id}`}>{c.titleZh}</Link></h3><p className="mt-3 text-sm leading-6 text-slate-600">{c.description}</p><ul className="mb-5 mt-3 list-inside list-disc text-sm leading-7">{c.coreTasks.slice(0, 2).map((task) => <li key={task}>{task}</li>)}</ul><div className="mt-auto flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold"><Link to={`/career/${c.id}`} className="underline">工作內容與入行條件 →</Link>{playable.has(c.id) && <Link to={`/lab/mission/${c.id}`} className="underline">試做一小段 →</Link>}</div><p className="mt-3 text-xs text-slate-500">{playable.has(c.id) ? '有職涯故事與教學任務' : '目前提供職業介紹與探索實驗'}</p></article>)}</div>
    <details className="mt-8 rounded-2xl bg-slate-100 p-5"><summary className="cursor-pointer font-semibold">資料參考與收錄範圍</summary><p className="mt-3 text-sm leading-6 text-slate-600">2026/10/20 對照以下網站的公開職務分類與職業介紹，整理本站的範圍及工作摘要。這是主要職類的代表性目錄，仍未涵蓋所有細分職業。試做情境為本站編寫的虛構案例；吻合指標是探索模型，並非求職網站評分、職缺數或錄取率。</p><ul className="mt-3 space-y-2">{CAREER_REFERENCE_SOURCES.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer" className="text-sm underline">{source.title} ↗</a></li>)}</ul><p className="mt-3 text-sm leading-6 text-slate-600">證照、國考及任用職業須另查主管機關最新規定。目錄可探索性不代表已具備執業或任用資格。</p></details>
  </section>;
}
