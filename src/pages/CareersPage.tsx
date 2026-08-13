import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AssessmentStageNotice, CareerCard, PublicCareerCard } from '../components';
import { buildPrimaryCareerPresentation, interpretPublicCareers } from '../engine';
import { useAppState } from '../services/use-app-state';
import type { PublicCareerInterpretation } from '../types';

export function CareersPage() {
  const state = useAppState();
  const { careerResults, talentProfile } = state;
  const publicResults = useMemo(() => careerResults && talentProfile ? interpretPublicCareers({
    matches: careerResults.matches,
    talentProfile,
    responses: state.answers,
  }) : undefined, [careerResults, state.answers, talentProfile]);
  const primary = useMemo(() => publicResults ? buildPrimaryCareerPresentation(
    publicResults,
    careerResults?.categories.surprise_me.map(({ careerId }) => careerId) ?? [],
  ) : undefined, [careerResults, publicResults]);

  if (!careerResults || !talentProfile || !publicResults || !primary) return <main className="mx-auto max-w-2xl px-5 py-24 text-center"><h1 className="text-4xl font-semibold">先建立你的職涯方向</h1><p className="mt-4 text-sm leading-6 text-ink/55">目前資料庫收錄 60 個職業；完成測驗後，這裡會先整理成一般人容易理解的方向。</p><Link to="/assessment" className="mt-7 inline-block rounded-full bg-slate-950 px-6 py-3 text-white">完成測驗</Link></main>;

  const { strong, moderate, fallback, lower, surprise } = primary;
  const summary = strong.length ? `${primary.summary} 先從這些方向理解自己最容易在哪些工作活動中發揮。` : '目前沒有能力證據足夠集中的單一方向；以下是相較本站目前收錄的職業，與你的結果重疊較多的方向。';

  return <main className="mx-auto max-w-7xl px-4 py-12 sm:px-5 sm:py-16">
    <header className="max-w-4xl"><p className="text-sm font-bold tracking-[.18em] text-slate-500 uppercase">Career Direction</p><h1 className="mt-3 font-serif text-[clamp(3rem,7vw,5.5rem)] font-normal leading-none tracking-[-.04em]">你的職涯方向</h1><p className="mt-5 text-lg leading-8 text-ink/60">先看哪些方向與你的能力和工作方式重疊最多；如果想深入，再查看完整 60 種職業排名。</p><div className="mt-7 rounded-3xl bg-blue-50 p-6"><p className="text-lg font-semibold leading-8">{summary}</p><p className="mt-2 text-sm leading-6 text-slate-600">相對排名與推薦證據分開判斷。排名第一但沒有正向能力證據，不會被稱為「非常適合」。</p></div></header>
    <AssessmentStageNotice className="mt-8" />

    <div className="mt-14 space-y-16">
      {strong.length > 0
        ? <CareerSection title="非常適合" subtitle="目前證據支持較完整。" results={strong} />
        : fallback.length > 0 && <CareerSection title="目前較值得探索" subtitle="相對排名靠前，但能力證據還沒有集中到足以稱為非常適合。" results={fallback} />}
      {strong.length > 0 && moderate.length > 0 && <CareerSection title="普通" subtitle="部分符合，也有需要考慮或繼續確認的地方。" results={moderate} />}
      {lower.length > 0 && <CareerSection title="較不適合目前的你" subtitle="目前存在較明顯、且有足夠證據支持的能力、偏好或能量落差。" results={lower} />}
      {surprise.length > 0 && <CareerSection title="你可能沒想過的方向" subtitle="符合 Surprise 規則，而且不是只換標題的重複推薦。" results={surprise} />}

      <details className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-9"><summary className="cursor-pointer text-2xl font-semibold">查看完整 60 種職業排名</summary><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">這是進階相對排名，不是 60 份「適合／不適合」結論。每個細職業仍保留原 Career Fit components 與 Entry requirements。</p><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{careerResults.matches.map((match) => <CareerCard key={match.careerId} match={match} rank={careerResults.matches.findIndex(({ careerId }) => careerId === match.careerId) + 1} total={careerResults.matches.length} />)}</div></details>
    </div>
  </main>;
}

function CareerSection({ title, subtitle, results }: { title: string; subtitle: string; results: PublicCareerInterpretation[] }) {
  return <section><h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p><div className="mt-7 grid gap-5">{results.map((result) => <PublicCareerCard key={result.publicCareerId} result={result} />)}</div></section>;
}
