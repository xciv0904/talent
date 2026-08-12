import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CAREER_PROFILES } from '../data/careers';
import { interpretSpecificCareer } from '../engine';
import { markCareerExplored, saveExperiment } from '../services/storage';
import { useAppState } from '../services/use-app-state';
import type { AbilityAlignment, RecommendationSource, RecommendationStrength } from '../types';
import { buildCareerExperiencePlan, careerEntryBarrierLabel, careerRequirementItems, dimensionLabels, formatFitIndex, formatScore, skillNameLabel } from '../utils';

const recommendationLabel: Record<RecommendationStrength, string> = {
  strong_recommendation: '非常適合',
  moderate_recommendation: '有條件適合',
  exploratory: '值得先探索',
  not_priority: '目前較不吻合',
};

const sourceSummary: Record<RecommendationSource, string> = {
  ability_led: '這份工作出現在結果中，主要是因為你的能力證據與它的核心任務重疊。',
  interest_led: '這份工作出現在結果中，主要是因為你偏好的活動方向與它接近；能力是否穩定吻合仍要確認。',
  environment_led: '這份工作出現在結果中，主要是因為做事方式與環境接近你的偏好；目前不是由能力證據主導。',
  mixed: '這份工作同時受到能力證據、興趣與工作方式支持。',
  weak_relative: '這份工作目前主要是相對其他職業排名靠前，正向證據還沒有集中到足以形成強推薦。',
};

const alignmentLabel = {
  exceeds_requirement: '高於需求',
  meets_requirement: '達到需求',
  partial_gap: '部分差距',
  significant_gap: '明顯差距',
  unknown: '尚待確認',
} as const;

export function CareerDetailPage() {
  const { careerId } = useParams();
  const state = useAppState();
  const career = CAREER_PROFILES.find((item) => item.id === careerId);
  const record = state.experiments.find((item) => item.careerId === careerId);
  const interpretation = useMemo(() => state.talentProfile && state.careerResults && careerId
    ? interpretSpecificCareer({
      careerId,
      matches: state.careerResults.matches,
      talentProfile: state.talentProfile,
      responses: state.answers,
    })
    : undefined, [careerId, state.answers, state.careerResults, state.talentProfile]);

  useEffect(() => { if (career) markCareerExplored(career.id); }, [career]);
  if (!career) return <main className="mx-auto max-w-2xl px-5 py-24"><h1 className="text-4xl font-semibold">找不到這份工作</h1><Link to="/careers" className="mt-5 inline-block underline">回到職涯列表</Link></main>;

  const experience = buildCareerExperiencePlan(career);
  const positiveAbilities = interpretation?.abilityAlignment.filter(({ alignment }) => alignment === 'exceeds_requirement' || alignment === 'meets_requirement') ?? [];
  const needsConfirmation = interpretation?.abilityAlignment.filter(({ alignment }) => alignment === 'unknown') ?? [];
  const lowOverlap = interpretation?.abilityAlignment.filter(({ alignment }) => alignment === 'significant_gap') ?? [];
  const saveExperience = () => saveExperiment({ careerId: career.id, status: record?.status ?? 'saved', currentStep: record?.currentStep ?? 0, updatedAt: new Date().toISOString() });

  return <main>
    <header className="bg-slate-950 text-white"><div className="mx-auto max-w-7xl px-5 py-14 sm:py-20">
      <Link to="/careers" className="text-sm text-slate-400">← 你的職涯方向</Link>
      <div className="mt-8"><p className="text-sm font-bold tracking-widest text-blue-200 uppercase">{interpretation?.publicCareerTitle ?? career.family.replaceAll('_', ' ')}</p><h1 className="mt-3 text-5xl font-semibold sm:text-7xl">{career.titleZh}</h1><p className="mt-2 text-xl text-slate-400">{career.titleEn}</p><p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{career.description}</p>{interpretation && <div className="mt-6 flex flex-wrap items-center gap-3"><span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-slate-950">{recommendationLabel[interpretation.recommendationStrength]}</span></div>}</div>
    </div></header>

    <div className="mx-auto max-w-7xl space-y-16 px-5 py-14">
      {interpretation ? <section className="rounded-[2rem] border border-blue-200 bg-blue-50 p-7 sm:p-10">
        <p className="text-sm font-bold tracking-widest text-slate-600 uppercase">Recommendation Summary</p>
        <h2 className="mt-3 text-3xl font-semibold">為什麼會出現在你的結果？</h2>
        <p className="mt-4 max-w-4xl text-lg leading-8">{sourceSummary[interpretation.recommendationSource]}</p>
        {interpretation.matchingReasons.length > 0 && <ul className="mt-6 grid gap-3 md:grid-cols-3">{interpretation.matchingReasons.slice(0, 3).map((reason) => <li key={reason} className="rounded-2xl bg-white p-4 text-sm leading-6">✓ {reason}</li>)}</ul>}
        {needsConfirmation.length > 0 && <div className="mt-6 border-t border-blue-200 pt-5"><h3 className="font-semibold">需要再確認</h3><p className="mt-2 text-sm leading-6 text-slate-700">△ {needsConfirmation.slice(0, 2).map(({ talentName }) => talentName).join('、')}會在這份工作中使用，但目前還沒有足夠不同情境的回答判斷是否為你的穩定優勢。</p></div>}
        <details className="mt-6 text-sm text-slate-600"><summary className="cursor-pointer font-semibold">查看完整 component breakdown</summary><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Metric label="Talent Match" value={formatFitIndex(interpretation.componentScores.talent)} /><Metric label="Interest Match" value={formatFitIndex(interpretation.componentScores.interest)} /><Metric label="Work Style Match" value={formatFitIndex(interpretation.componentScores.workStyle)} /><Metric label="Environment Match" value={formatFitIndex(interpretation.componentScores.environment)} /><Metric label="Environment Penalty Index" value={formatFitIndex(interpretation.componentScores.environmentPenalty)} /><Metric label="Values Match" value={formatFitIndex(interpretation.componentScores.values)} /><Metric label="Skill Match" value={formatFitIndex(interpretation.componentScores.transferableSkills)} /></div><p className="mt-3">相對排名：60 種職業中的第 {interpretation.relativeRank} 名。排名不等於證據強度；推薦狀態由 Positive Evidence Gate 另行判斷。</p></details>
      </section> : <p className="rounded-3xl bg-blue-50 p-6">完成 assessment 後，這裡會顯示個人化推薦原因。</p>}

      {positiveAbilities.length > 0 && <section><h2 className="text-3xl font-semibold">你的優勢會怎麼用在這份工作</h2><div className="mt-6 grid gap-4 md:grid-cols-2">{positiveAbilities.map((item) => <AbilityCard key={item.talentId} item={item} />)}</div></section>}

      <section className="grid gap-6 md:grid-cols-2"><Info title="這份工作平常在做什麼"><p>{career.description}</p></Info><Info title="常見任務"><ul className="space-y-2">{career.coreTasks.map((task) => <li key={task}>• {task}</li>)}</ul></Info></section>

      {needsConfirmation.length > 0 && <section><h2 className="text-3xl font-semibold">這份工作還會使用的能力</h2><p className="mt-3 max-w-3xl text-slate-600">這些是工作要求，不代表你的能力較弱；目前只是尚待更多不同情境的回答確認。</p><div className="mt-6 grid gap-4 md:grid-cols-2">{needsConfirmation.map((item) => <AbilityCard key={item.talentId} item={item} />)}</div></section>}

      {(lowOverlap.length > 0 || interpretation?.limitingReasons.length) && <section className="rounded-[2rem] bg-slate-100 p-7 sm:p-10"><h2 className="text-3xl font-semibold">可能需要適應的地方</h2><div className="mt-6 grid gap-4 md:grid-cols-2">{lowOverlap.map((item) => <AbilityCard key={item.talentId} item={item} />)}</div>{interpretation && <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-700">{interpretation.limitingReasons.slice(0, 4).map((reason) => <li key={reason}>• {reason}</li>)}</ul>}</section>}

      <section className="grid gap-6 lg:grid-cols-3"><Info title="工作環境">{Object.entries(career.environmentProfile).map(([key, value]) => <div key={key} className="mb-3"><div className="flex justify-between text-sm"><span>{dimensionLabels[key] ?? key}</span><span>{formatScore(value)}</span></div><div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-800" style={{ width: `${value * 100}%` }} /></div></div>)}</Info><Info title="可能喜歡"><ul className="space-y-2">{interpretation?.matchingReasons.length ? interpretation.matchingReasons.map((item) => <li key={item}>+ {item}</li>) : <li>目前沒有足夠個人化支持理由。</li>}</ul></Info><Info title="可能消耗"><ul className="space-y-2 text-slate-700">{interpretation?.limitingReasons.length ? interpretation.limitingReasons.map((item) => <li key={item}>– {item}</li>) : <li>目前沒有明顯摩擦訊號。</li>}</ul></Info></section>

      <section className="grid gap-6 md:grid-cols-2"><Info title="常見職稱／相關方向"><p>{[career.titleZh, ...career.aliases].join('、')}</p>{interpretation && <Link to="/careers" className="mt-4 inline-block font-semibold underline">回到「{interpretation.publicCareerTitle}」方向</Link>}</Info><Info title="需要哪些技能"><ul className="space-y-3">{[...career.skills].sort((a, b) => b.importance - a.importance).map((skill) => <li key={skill.id} className="flex justify-between gap-4"><span>{skillNameLabel(skill.name)}</span><span className="text-slate-400">{formatScore(skill.importance)}</span></li>)}</ul></Info></section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-7 sm:p-10"><h2 className="text-3xl font-semibold">進入門檻</h2><p className="mt-4 text-xl font-semibold">{careerEntryBarrierLabel[career.entryBarrier]}</p><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">這是職業資料庫整理的一般準備程度，不代表你的個人條件不足。由於目前測驗不蒐集完整履歷，個人 Entry Distance 會標示為「尚未估算」，也不會影響 Career Fit。</p><h3 className="mt-7 font-semibold">這類工作通常需要的準備</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">{careerRequirementItems(career).map((item) => <li key={item}>• {item}</li>)}</ul></section>

      <section className="rounded-[2rem] bg-blue-100 p-7 sm:p-10"><p className="text-sm font-bold tracking-widest text-slate-700 uppercase">20 分鐘職涯體驗</p><h2 className="mt-3 text-3xl font-semibold">試試「{career.titleZh}」的一小段工作</h2><p className="mt-5 max-w-3xl leading-7">{experience.purpose}</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><Metric label="需要多久" value={experience.duration} /><Metric label="需要什麼" value={experience.requirements.join('、')} /><Metric label="最後會得到什麼" value={experience.outcome} /></div><Link to={`/experiments?career=${career.id}`} onClick={() => { saveExperience(); }} className="mt-7 inline-block rounded-full bg-slate-950 px-6 py-3 font-semibold text-white">{record ? '繼續這個體驗' : '開始 20 分鐘體驗'}</Link></section>
    </div>
  </main>;
}

function AbilityCard({ item }: { item: AbilityAlignment }) {
  return <article className="rounded-3xl bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-bold text-slate-500">{item.importance === 'core' ? '核心能力' : item.importance === 'supporting' ? '支援能力' : '次要能力'}</p><h3 className="mt-1 text-lg font-semibold">{item.talentName}</h3></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{alignmentLabel[item.alignment]}</span></div><p className="mt-3 text-sm leading-6 text-slate-600">{item.explanation}</p>{item.userEvidence.length > 0 && <details className="mt-4 border-t border-slate-100 pt-3"><summary className="cursor-pointer text-xs font-bold text-slate-600">查看實際題目與回答</summary><ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">{item.userEvidence.map((evidence) => <li key={evidence.id}>• {evidence.description}</li>)}</ul></details>}</article>;
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-3xl bg-white p-6"><h2 className="mb-5 text-2xl font-semibold">{title}</h2><div className="leading-7 text-slate-600">{children}</div></section>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white/70 p-4"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-2 text-sm font-semibold leading-6">{value}</p></div>;
}
