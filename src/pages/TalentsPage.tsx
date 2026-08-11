import { Link } from 'react-router-dom';
import { BASE_TALENTS, COMPOSITE_TALENTS } from '../data/talents';
import { useAppState } from '../services';
import type { TalentCategory, TalentId } from '../types';
import { formatScore } from '../utils';

const clusters: Array<[TalentCategory, string, string]> = [['thinking', 'Thinking', 'bg-blue-100'], ['people', 'People', 'bg-slate-200'], ['execution', 'Execution', 'bg-blue-100']];
const observedLabel = (score: number, confidence: 'low' | 'medium' | 'high') =>
  confidence === 'low' ? '尚待確認' : score >= 0.65 ? '較明顯優勢' : score >= 0.35 ? '穩定可用能力' : '目前不是最突出';

export function TalentsPage() {
  const { talentProfile } = useAppState();
  if (!talentProfile) return <Empty />;
  const scores = new Map(talentProfile.baseTalents.map((item) => [item.talentId, item]));
  return <main className="mx-auto max-w-7xl px-5 py-14"><header className="max-w-3xl"><p className="text-sm font-bold tracking-widest text-slate-600 uppercase">Talent Landscape</p><h1 className="mt-4 text-5xl font-semibold">三個天賦群集，不是一張扁平排行榜。</h1><p className="mt-4 text-lg text-slate-600">圓點大小反映目前分數；狀態與能量仍保留在每個節點中。</p></header>
    <div className="mt-12 grid gap-6 lg:grid-cols-3">{clusters.map(([category, title, tone]) => <section key={category} className={`rounded-[2rem] p-6 ${tone}`}><h2 className="text-3xl font-semibold">{title}</h2><div className="mt-7 flex min-h-80 flex-wrap content-center items-center justify-center gap-3">{BASE_TALENTS.filter((item) => item.category === category).map((definition) => { const item = scores.get(definition.id)!; const size = 90 + Math.round(item.score * 45); return <div key={definition.id} title={definition.description} className="grid place-items-center rounded-full border border-white/80 bg-white/75 p-3 text-center shadow-sm" style={{ width: size, height: size }}><span><strong className="block text-sm">{definition.nameZh}</strong><small className="text-slate-500">{formatScore(item.score)} · {observedLabel(item.score, item.confidence.level)}</small></span></div>; })}</div></section>)}</div>
    <section className="mt-20"><h2 className="text-3xl font-semibold">Composite Talents 如何組成</h2><p className="mt-3 text-slate-600">複合天賦不是額外評分標籤，而是既有 Base Talents 的加權組合。</p><div className="mt-7 grid gap-4 md:grid-cols-2">{[...talentProfile.compositeTalents].sort((a, b) => b.score - a.score).map((score) => { const composite = COMPOSITE_TALENTS.find(({ id }) => id === score.compositeTalentId)!; const weights = composite.weights as Partial<Record<TalentId, number>>; return <article key={score.compositeTalentId} className="rounded-3xl bg-white p-6"><div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-semibold">{composite.nameZh}</h3><p className="text-sm text-slate-500">{composite.nameEn}</p></div><strong>{formatScore(score.score)}</strong></div><p className="mt-3 text-sm leading-6 text-slate-600">{composite.shortDescription}</p><div className="mt-5 space-y-2">{composite.components.map((id) => <div key={id} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-2 text-xs"><span>{BASE_TALENTS.find((item) => item.id === id)?.nameZh}</span><div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-800" style={{ width: `${(weights[id] ?? 0) * 100}%` }} /></div><span>{Math.round((weights[id] ?? 0) * 100)}%</span></div>)}</div></article>; })}</div></section>
  </main>;
}

function Empty() { return <main className="mx-auto max-w-2xl px-5 py-24 text-center"><h1 className="text-4xl font-semibold">先完成測驗，才能建立 Talent Landscape</h1><Link to="/assessment" className="mt-7 inline-block rounded-full bg-slate-950 px-6 py-3 text-white">前往測驗</Link></main>; }
