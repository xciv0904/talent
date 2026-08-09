import { Link } from 'react-router-dom';
import type { AbilityAlignment, PublicCareerInterpretation } from '../types';

const riskLabel = { low: '低', moderate: '需要留意', high: '明顯' } as const;
const confidenceLabel = { low: '低', medium: '中', high: '高' } as const;
const alignmentLabel = {
  strong_alignment: '明顯吻合',
  moderate_alignment: '部分吻合',
  low_overlap: '目前重疊較少',
  insufficient_evidence: '尚待確認',
} as const;
const recommendationLabel = {
  strong_recommendation: '非常適合',
  moderate_recommendation: '有條件適合',
  exploratory: '需要更多證據',
  not_priority: '目前較不吻合',
} as const;
const sourceLabel = {
  ability_led: '主要由能力證據支持',
  interest_led: '主要由興趣方向支持',
  environment_led: '主要由工作方式與環境支持',
  mixed: '由能力、興趣與工作方式共同支持',
  weak_relative: '目前主要反映相對排名',
} as const;

function EvidenceAlignment({ item, index }: { item: AbilityAlignment; index: number }) {
  return <article className="rounded-2xl bg-slate-50 p-5">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <h4 className="font-semibold">{index + 1}. {item.talentName}</h4>
      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">{alignmentLabel[item.alignment]}</span>
    </div>
    <p className="mt-3 text-sm leading-6 text-slate-700">{item.explanation}</p>
    {item.userEvidence.length > 0 && <details className="mt-4 border-t border-slate-200 pt-3">
      <summary className="cursor-pointer text-xs font-bold text-slate-600">查看實際題目與回答</summary>
      <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
        {item.userEvidence.map((evidence) => <li key={evidence.id}>• {evidence.description}</li>)}
      </ul>
    </details>}
  </article>;
}

export function PublicCareerCard({ result }: { result: PublicCareerInterpretation }) {
  const isStrong = result.classification === 'strong';
  const isModerate = result.classification === 'moderate';
  const aligned = result.abilityAlignment.filter(({ alignment }) => alignment === 'strong_alignment' || alignment === 'moderate_alignment');
  const shownAbilities = isStrong ? aligned.slice(0, 3) : isModerate ? aligned.slice(0, 2) : [];

  return <article className={`rounded-[2rem] border bg-white p-6 sm:p-8 ${isStrong ? 'border-blue-200 shadow-sm' : 'border-slate-200'}`}>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold tracking-[.16em] text-slate-500 uppercase">Public Career · #{result.relativeRank}</p>
        <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">{result.title}</h3>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">{result.description}</p>
      </div>
      <div className="flex flex-col items-end gap-2"><span className="rounded-full bg-blue-100 px-4 py-2 text-xs font-bold text-slate-800">{recommendationLabel[result.recommendationStrength]}</span><span className="text-xs font-bold text-slate-500">分析信心：{confidenceLabel[result.confidence]}</span></div>
    </div>

    <div className="mt-5">
      <p className="text-xs font-bold text-slate-500">常見職稱</p>
      <p className="mt-2 text-sm leading-6">{result.commonTitles.join('、')}</p>
    </div>

    <div className="mt-5 rounded-2xl border border-slate-100 p-4"><p className="text-xs font-bold text-slate-500">為什麼放在這一類</p><p className="mt-2 text-sm leading-6 text-slate-700">{sourceLabel[result.recommendationSource]}</p></div>

    {(isStrong || isModerate) && <div className="mt-7">
      <h4 className="text-lg font-semibold">{isStrong ? '你的能力如何用在這類工作' : '符合你的地方'}</h4>
      {shownAbilities.length > 0
        ? <div className="mt-4 grid gap-3">{shownAbilities.map((item, index) => <EvidenceAlignment key={item.talentId} item={item} index={index} />)}</div>
        : <div className="mt-3"><p className="text-sm leading-6 text-slate-600">目前沒有足夠的直接能力證據把這個方向稱為高度適合；以下是它仍出現在結果中的實際原因。</p>{result.matchingReasons.length > 0 && <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">{result.matchingReasons.slice(0, 3).map((reason) => <li key={reason}>• {reason}</li>)}</ul>}</div>}
    </div>}

    {isStrong && <div className="mt-7">
      <h4 className="text-lg font-semibold">日常大概在做什麼</h4>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700 sm:grid-cols-2">
        {result.dailyTasks.map((task) => <li key={task} className="rounded-2xl bg-blue-50 px-4 py-3">{task}</li>)}
      </ul>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="能力吻合" value={result.talentOverlap >= 0.68 ? '高' : '中'} />
        <Metric label="興趣吻合" value={result.interestAlignment >= 0.68 ? '高' : '中'} />
        <Metric label="環境摩擦" value={riskLabel[result.environmentFriction]} />
        <Metric label="Energy Risk" value={riskLabel[result.energyRisk]} />
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-700">在目前收錄的工作中，這類工作有多項核心能力受到直接作答支持，且沒有大型環境或能量衝突。因此值得放在你的優先探索清單；這不是成功保證，也不是要你立刻做職涯決定。</p>
    </div>}

    {isModerate && <div className="mt-7 rounded-2xl bg-slate-50 p-5">
      <h4 className="font-semibold">為什麼沒有列為「非常適合」</h4>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
        {result.limitingReasons.slice(0, 3).map((reason) => <li key={reason}>• {reason}</li>)}
      </ul>
      <p className="mt-3 text-sm leading-6 text-slate-600">不是不適合，而是目前看起來同時有重疊與需要確認的地方，實際職務內容會影響判斷。</p>
    </div>}

    {!isStrong && !isModerate && <div className="mt-6 rounded-2xl bg-slate-50 p-5">
      <h4 className="font-semibold">目前沒有優先推薦的原因</h4>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
        {result.limitingReasons.slice(0, 2).map((reason) => <li key={reason}>• {reason}</li>)}
      </ul>
      <p className="mt-3 text-sm leading-6 text-slate-600">這不是在說你做不到，而是目前測出的自然反應、偏好或工作能量與這類工作的核心要求有較多落差。</p>
    </div>}

    <div className="mt-7 flex flex-wrap gap-3">
      <Link to={`/career/${result.representativeCareerId}`} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">深入了解代表工作</Link>
      {result.specificCareerIds.length > 1 && <details className="rounded-full border border-slate-300 px-5 py-3 text-sm">
        <summary className="cursor-pointer font-semibold">查看包含的細職業</summary>
        <div className="mt-4 flex max-w-xl flex-wrap gap-2 pb-1">
          {result.specificCareerIds.map((careerId, index) => <Link key={careerId} to={`/career/${careerId}`} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold">{result.commonTitles[index] ?? careerId}</Link>)}
        </div>
      </details>}
    </div>
  </article>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}
