import { Link } from 'react-router-dom';
import { BASE_TALENTS, COMPOSITE_TALENTS } from '../data/talents';
import { useAppState } from '../services/use-app-state';
import type { TalentCategory, TalentId, TalentScore } from '../types';
import { formatScore } from '../utils';

const clusters: Array<[TalentCategory, string, string]> = [
  ['thinking', 'Thinking', 'bg-blue-100'],
  ['people', 'People', 'bg-slate-200'],
  ['execution', 'Execution', 'bg-blue-100'],
];

const observedLabel = (score: number, confidence: 'low' | 'medium' | 'high') =>
  confidence === 'low'
    ? '尚待確認'
    : score >= 0.65
      ? '較明顯優勢'
      : score >= 0.35
        ? '穩定可用能力'
        : '目前較不突出';

function TalentNode({ item }: { item: TalentScore }) {
  const definition = BASE_TALENTS.find(({ id }) => id === item.talentId)!;
  const size = 120 + Math.round(item.score * 24);
  const status = observedLabel(item.score, item.confidence.level);

  return <div
    title={definition.description}
    aria-label={`${definition.nameZh}，${formatScore(item.score)}，${status}`}
    className="grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/80 bg-white/80 px-3 py-4 text-center shadow-sm"
    style={{ width: size, height: size }}
  >
    <span className="block min-w-0 max-w-[7rem]">
      <strong className="block text-[13px] leading-5 text-slate-900">{definition.nameZh}</strong>
      <small className="mt-1 block text-[11px] leading-4 text-slate-500">
        <span className="block whitespace-nowrap">{formatScore(item.score)}</span>
        <span className="block">{status}</span>
      </small>
    </span>
  </div>;
}

export function TalentsPage() {
  const { talentProfile } = useAppState();
  if (!talentProfile) return <Empty />;
  const scores = new Map(talentProfile.baseTalents.map((item) => [item.talentId, item]));

  return <main className="mx-auto max-w-7xl min-w-0 overflow-x-clip px-5 py-14">
    <header className="min-w-0 max-w-3xl">
      <p className="text-sm font-bold tracking-widest text-slate-600">天賦分布</p>
      <h1 className="mt-4 break-words text-4xl leading-tight font-semibold sm:text-5xl">三個天賦群集，不是一張扁平排行榜。</h1>
      <p className="mt-4 text-lg text-slate-600">圓點大小反映目前分數；狀態與能量仍保留在每個節點中。</p>
    </header>

    <div className="mt-12 grid min-w-0 gap-6 lg:grid-cols-3">
      {clusters.map(([category, title, tone]) => <section key={category} className={`min-w-0 overflow-hidden rounded-[2rem] p-5 sm:p-6 ${tone}`}>
        <h2 className="text-3xl font-semibold">{title}</h2>
        <div className="mt-7 grid min-w-0 grid-cols-2 place-items-center gap-4 sm:grid-cols-3 lg:grid-cols-2">
          {BASE_TALENTS
            .filter((definition) => definition.category === category)
            .map((definition) => <TalentNode key={definition.id} item={scores.get(definition.id)!} />)}
        </div>
      </section>)}
    </div>

    <section className="mt-20 min-w-0">
      <h2 className="break-words text-3xl font-semibold">複合天賦如何組成</h2>
      <p className="mt-3 text-slate-600">複合天賦不是額外評分標籤，而是既有基礎天賦的加權組合。</p>
      <div className="mt-7 grid min-w-0 gap-4 md:grid-cols-2">
        {[...talentProfile.compositeTalents].sort((a, b) => b.score - a.score).map((score) => {
          const composite = COMPOSITE_TALENTS.find(({ id }) => id === score.compositeTalentId)!;
          const weights = composite.weights as Partial<Record<TalentId, number>>;
          return <article key={score.compositeTalentId} className="min-w-0 rounded-3xl bg-white p-6">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0"><h3 className="break-words text-xl font-semibold">{composite.nameZh}</h3><p className="break-words text-sm text-slate-500">{composite.nameEn}</p></div>
              <strong className="shrink-0">{formatScore(score.score)}</strong>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{composite.shortDescription}</p>
            <div className="mt-5 space-y-2">
              {composite.components.map((id) => <div key={id} className="grid min-w-0 grid-cols-[minmax(0,7rem)_minmax(0,1fr)_3rem] items-center gap-2 text-xs">
                <span className="break-words">{BASE_TALENTS.find((item) => item.id === id)?.nameZh}</span>
                <div className="h-2 min-w-0 rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-800" style={{ width: `${(weights[id] ?? 0) * 100}%` }} /></div>
                <span>{Math.round((weights[id] ?? 0) * 100)}%</span>
              </div>)}
            </div>
          </article>;
        })}
      </div>
    </section>
  </main>;
}

function Empty() {
  return <main className="mx-auto max-w-2xl px-5 py-24 text-center"><h1 className="text-4xl font-semibold">先完成測驗，才能建立天賦分布</h1><Link to="/assessment" className="mt-7 inline-block rounded-full bg-slate-950 px-6 py-3 text-white">前往測驗</Link></main>;
}
