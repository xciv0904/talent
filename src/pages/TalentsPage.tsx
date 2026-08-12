import { Link } from 'react-router-dom';
import { BASE_TALENTS, COMPOSITE_TALENTS } from '../data/talents';
import { useAppState } from '../services/use-app-state';
import type { CompositeTalentScore, TalentCategory, TalentId, TalentScore } from '../types';
import { formatScore } from '../utils';

const clusters: Array<{
  category: TalentCategory;
  nameZh: string;
  nameEn: string;
  description: string;
  tone: string;
}> = [
  { category: 'thinking', nameZh: '思考', nameEn: 'Thinking', description: '你理解資訊、找出規律與形成想法的方式。', tone: 'bg-blue-100' },
  { category: 'people', nameZh: '人際', nameEn: 'People', description: '你理解別人、傳遞資訊與促成合作的方式。', tone: 'bg-slate-200' },
  { category: 'execution', nameZh: '執行', nameEn: 'Execution', description: '你決定下一步、安排事情與持續推進的方式。', tone: 'bg-blue-100' },
];

const observedLabel = (score: number, confidence: 'low' | 'medium' | 'high') =>
  confidence === 'low'
    ? '尚待更多證據'
    : score >= 0.65
      ? '較明顯優勢'
      : score >= 0.35
        ? '穩定可用能力'
        : '目前訊號較少';

const talentDefinition = (id: TalentId) => BASE_TALENTS.find((item) => item.id === id)!;
const sortTalents = (items: TalentScore[]) => [...items].sort((left, right) =>
  right.score - left.score || talentDefinition(left.talentId).nameZh.localeCompare(talentDefinition(right.talentId).nameZh));

export function TalentsPage() {
  const { talentProfile } = useAppState();
  if (!talentProfile) return <Empty />;

  const sortedTalents = sortTalents(talentProfile.baseTalents);
  const primaryTalents = sortedTalents.slice(0, 3);
  const sortedComposites = [...talentProfile.compositeTalents].sort((left, right) => right.score - left.score);
  const primaryComposites = sortedComposites.slice(0, 3);
  const remainingComposites = sortedComposites.slice(3);

  return <main className="mx-auto max-w-7xl min-w-0 overflow-x-clip px-5 py-14">
    <header className="min-w-0 max-w-3xl">
      <p className="text-sm font-bold tracking-widest text-slate-600">你的天賦摘要</p>
      <h1 className="mt-4 break-words text-4xl leading-tight font-semibold sm:text-5xl">先看最值得注意的 3 個能力。</h1>
      <p className="mt-4 text-lg leading-8 text-slate-600">不用一次讀完 20 項能力。先理解最明顯的訊號，再視需要展開完整分布。</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">分數代表這次作答中的相對訊號強度，不是能力百分比，也不是對你的永久定義。</p>
    </header>

    <section className="mt-10" aria-labelledby="primary-talents-title">
      <h2 id="primary-talents-title" className="sr-only">最值得注意的三個能力</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {primaryTalents.map((item, index) => <PrimaryTalentCard key={item.talentId} item={item} rank={index + 1} />)}
      </div>
    </section>

    <section className="mt-20" aria-labelledby="primary-composites-title">
      <div className="max-w-3xl">
        <p className="text-sm font-bold tracking-widest text-slate-500">能力如何一起出現</p>
        <h2 id="primary-composites-title" className="mt-3 text-3xl font-semibold sm:text-4xl">目前最接近你的 3 個天賦組合</h2>
        <p className="mt-3 leading-7 text-slate-600">複合天賦不是額外加分，而是幾項基礎能力一起發揮時，可能形成的工作模式。</p>
      </div>
      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        {primaryComposites.map((score) => <CompositeCard key={score.compositeTalentId} score={score} />)}
      </div>
      {remainingComposites.length > 0 && <details className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <summary className="cursor-pointer font-semibold">查看另外 {remainingComposites.length} 個天賦組合</summary>
        <p className="mt-2 text-sm leading-6 text-slate-500">這些組合同樣保留，但目前不是最需要先閱讀的部分。</p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {remainingComposites.map((score) => <CompactCompositeRow key={score.compositeTalentId} score={score} />)}
        </div>
      </details>}
    </section>

    <section className="mt-20" aria-labelledby="clusters-title">
      <div className="max-w-3xl">
        <p className="text-sm font-bold tracking-widest text-slate-500">完整能力分布</p>
        <h2 id="clusters-title" className="mt-3 text-3xl font-semibold sm:text-4xl">分成三群，比較容易看懂。</h2>
        <p className="mt-3 leading-7 text-slate-600">每一群先顯示分數較高的兩項；其餘能力需要時再展開。</p>
      </div>
      <div className="mt-7 grid min-w-0 gap-5 lg:grid-cols-3">
        {clusters.map((cluster) => <TalentCluster key={cluster.category} {...cluster} talents={sortedTalents.filter((item) => talentDefinition(item.talentId).category === cluster.category)} />)}
      </div>
    </section>
  </main>;
}

function PrimaryTalentCard({ item, rank }: { item: TalentScore; rank: number }) {
  const definition = talentDefinition(item.talentId);
  return <article className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6">
    <div className="flex items-start justify-between gap-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white">{rank}</span>
      <strong className="text-lg">{formatScore(item.score)}</strong>
    </div>
    <h3 className="mt-8 text-2xl font-semibold">{definition.nameZh}</h3>
    <p className="mt-2 text-sm font-semibold text-blue-700">{observedLabel(item.score, item.confidence.level)}</p>
    <p className="mt-4 text-sm leading-6 text-slate-600">{definition.description}</p>
  </article>;
}

function TalentCluster({ category, nameZh, nameEn, description, tone, talents }: {
  category: TalentCategory;
  nameZh: string;
  nameEn: string;
  description: string;
  tone: string;
  talents: TalentScore[];
}) {
  const featured = talents.slice(0, 2);
  const remaining = talents.slice(2);
  return <article className={`min-w-0 rounded-[2rem] p-6 ${tone}`}>
    <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">{nameEn}</p>
    <h3 className="mt-2 text-3xl font-semibold">{nameZh}</h3>
    <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{description}</p>
    <div className="mt-6 space-y-3">
      {featured.map((item) => <TalentRow key={item.talentId} item={item} />)}
    </div>
    {remaining.length > 0 && <details className="mt-5 border-t border-slate-900/10 pt-4">
      <summary className="cursor-pointer text-sm font-semibold">查看此群另外 {remaining.length} 項</summary>
      <div className="mt-4 space-y-3">{remaining.map((item) => <TalentRow key={item.talentId} item={item} compact />)}</div>
    </details>}
    <span className="sr-only">群集代碼：{category}</span>
  </article>;
}

function TalentRow({ item, compact = false }: { item: TalentScore; compact?: boolean }) {
  const definition = talentDefinition(item.talentId);
  return <div className={`rounded-2xl bg-white/80 ${compact ? 'p-3' : 'p-4'}`}>
    <div className="flex items-center justify-between gap-3 text-sm">
      <strong>{definition.nameZh}</strong>
      <span className="shrink-0 font-semibold text-slate-600">{formatScore(item.score)}</span>
    </div>
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
      <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.round(item.score * 100)}%` }} />
    </div>
    {!compact && <p className="mt-2 text-xs text-slate-500">{observedLabel(item.score, item.confidence.level)}</p>}
  </div>;
}

function CompositeCard({ score }: { score: CompositeTalentScore }) {
  const composite = COMPOSITE_TALENTS.find(({ id }) => id === score.compositeTalentId)!;
  const weights = composite.weights as Partial<Record<TalentId, number>>;
  return <article className="min-w-0 rounded-3xl bg-white p-6">
    <div className="flex min-w-0 items-start justify-between gap-3">
      <div className="min-w-0"><h3 className="break-words text-xl font-semibold">{composite.nameZh}</h3><p className="break-words text-sm text-slate-500">{composite.nameEn}</p></div>
      <strong className="shrink-0">{formatScore(score.score)}</strong>
    </div>
    <p className="mt-4 text-sm leading-6 text-slate-600">{composite.shortDescription}</p>
    <p className="mt-5 text-xs font-bold text-slate-500">由這些能力組成</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {composite.components.map((id) => <span key={id} className="rounded-full bg-slate-100 px-3 py-2 text-xs">{talentDefinition(id).nameZh} · {Math.round((weights[id] ?? 0) * 100)}%</span>)}
    </div>
  </article>;
}

function CompactCompositeRow({ score }: { score: CompositeTalentScore }) {
  const composite = COMPOSITE_TALENTS.find(({ id }) => id === score.compositeTalentId)!;
  return <article className="rounded-2xl bg-slate-50 p-4">
    <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{composite.nameZh}</h3><p className="text-xs text-slate-500">{composite.nameEn}</p></div><strong className="shrink-0 text-sm">{formatScore(score.score)}</strong></div>
    <p className="mt-3 text-xs leading-5 text-slate-600">由 {composite.components.map((id) => talentDefinition(id).nameZh).join('、')} 組成</p>
  </article>;
}

function Empty() {
  return <main className="mx-auto max-w-2xl px-5 py-24 text-center"><h1 className="text-4xl font-semibold">先完成測驗，才能建立天賦摘要</h1><p className="mt-4 text-slate-600">完成後會先顯示最值得注意的三項能力，不會一次丟出整張能力清單。</p><Link to="/assessment" className="mt-7 inline-block rounded-full bg-slate-950 px-6 py-3 text-white">前往測驗</Link></main>;
}
