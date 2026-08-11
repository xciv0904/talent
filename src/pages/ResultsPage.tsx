import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CareerCard, PublicCareerCard } from '../components';
import { CAREER_PROFILES } from '../data/careers';
import { BASE_TALENTS, COMPOSITE_TALENTS } from '../data/talents';
import { buildCareerDirections, buildDynamicTieBreaker, buildExplorationPriority, buildPrimaryCareerPresentation, interpretPublicCareers } from '../engine';
import {
  buildBetaFeedbackExport,
  buildDiagnosticReport,
  downloadJson,
  saveGuidedAnswer,
  saveCareerFeedback,
  saveNavigatorNeed,
  saveNextStepClarity,
  saveOptionalComment,
  saveOverallFeedback,
  saveSurpriseFeedback,
  selectCareerDirection,
  useAppState,
} from '../services';
import type { CareerFeedbackChoice, NavigatorNeed, NextStepClarityChoice, OverallFeedbackChoice, PrioritizedCareerDirection, SurpriseFeedbackChoice } from '../types';
import { buildWorkPatternSummary, formatFitIndex, workMeaningForTalent } from '../utils';

const sectionTitle = (number: string, title: string) => <div className="mb-6 flex items-baseline gap-4"><span className="text-sm font-bold text-slate-600">{number}</span><h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2></div>;
const overallOptions: Array<[OverallFeedbackChoice, string]> = [
  ['clearer_direction', '比原本更知道自己可以往哪裡走'], ['discovered_abilities', '有發現一些以前沒注意過的能力'],
  ['useful_but_unclear', '有一些有用，但方向還是不太清楚'], ['very_different_from_self', '結果和我認識的自己差很多'],
  ['hard_to_understand', '我看不太懂這份結果'],
];
const clarityOptions: Array<[NextStepClarityChoice, string]> = [
  ['very_clear', '非常清楚'], ['mostly_clear', '大概知道'], ['still_uncertain', '還是不太確定'], ['completely_unclear', '完全不知道'],
];
const priorityLabels = { priority: '優先探索', equally_worth: '同樣值得探索', compare: '可以保留比較', not_priority: '目前不是優先' } as const;
const decisionClarityLabels = { clear: '方向較明確', moderate: '有初步優先順序', ambiguous: '方向仍接近' } as const;
const navigatorOptions: Array<[NavigatorNeed, string, string]> = [
  ['guided_direction', '我完全不知道從哪開始', '用兩個方向的實際工作差異陪你選第一步'],
  ['career_explorer', '我想知道這些工作實際在做什麼', '查看工作內容、任務與推薦原因'],
  ['career_compare', '我已經有幾個工作在考慮', '並排比較環境、摩擦與進入距離'],
  ['entry_path', '我想知道怎麼進入其中一個工作', '先看已具備、待補足與第一個低成本行動'],
  ['talent_deep_dive', '我想更了解自己的能力', '查看完整能力、能量與組合分析'],
];

export function ResultsPage() {
  const state = useAppState();
  const { talentProfile, careerResults } = state;
  const [comment, setComment] = useState(state.betaFeedback.optionalComment ?? '');
  const [showGuided, setShowGuided] = useState(state.navigatorState.need === 'guided_direction' && !state.selectedDirection);
  const baseDirections = useMemo(() => careerResults ? buildCareerDirections({ matches: careerResults.matches }) : [], [careerResults]);
  const priority = useMemo(() => careerResults ? buildExplorationPriority({ directions: baseDirections, matches: careerResults.matches, talentProfile: talentProfile ?? undefined, tieBreakerAnswers: state.navigatorState.guidedAnswers }) : undefined, [baseDirections, careerResults, state.navigatorState.guidedAnswers, talentProfile]);
  const directions = priority?.directions ?? [];
  const tieDirections = directions.filter(({ id }) => priority?.tiedDirectionIds.includes(id));
  const guidedPrompts = useMemo(() => buildDynamicTieBreaker(tieDirections), [tieDirections]);
  const publicCareers = useMemo(() => talentProfile && careerResults ? interpretPublicCareers({
    matches: careerResults.matches,
    talentProfile,
    responses: state.answers,
  }) : undefined, [careerResults, state.answers, talentProfile]);
  const primaryCareers = useMemo(() => publicCareers ? buildPrimaryCareerPresentation(
    publicCareers,
    careerResults?.categories.surprise_me.map(({ careerId }) => careerId) ?? [],
    { strong: 4, moderate: 3, lower: 2, surprise: 3 },
  ) : undefined, [careerResults, publicCareers]);
  if (!talentProfile || !careerResults) return <main className="mx-auto max-w-3xl px-5 py-24 text-center"><h1 className="text-4xl font-semibold">還沒有可顯示的結果</h1><p className="mt-4 text-slate-600">完成探索題目後，這裡會整理值得先探索的方向與下一步。</p><Link to="/assessment" className="mt-8 inline-block rounded-full bg-slate-950 px-6 py-3 font-semibold text-white">前往測驗</Link></main>;

  const sortedTalents = [...talentProfile.baseTalents].sort((a, b) => b.score - a.score);
  const qualified = sortedTalents.filter(({ status }) => ['natural_strength', 'developed_strength', 'emerging_potential'].includes(status));
  const strengths = (qualified.length >= 3 ? qualified : sortedTalents).slice(0, 3);
  const selected = directions.find(({ id }) => id === state.selectedDirection);
  const selectedCareers = selected?.careerIds.map((id) => CAREER_PROFILES.find((career) => career.id === id)).filter(Boolean) ?? [];
  const topCareer = selected?.careerIds[0];
  const entryCareer = topCareer ?? directions[0]?.careerIds[0];
  const workSummary = buildWorkPatternSummary(strengths.map(({ talentId }) => talentId));
  const guidedWinner = priority?.decisionClarity === 'moderate' ? directions[0] : undefined;
  const tieBreakerAnswered = guidedPrompts.every(({ id }) => state.navigatorState.guidedAnswers[id]);
  const hasJourney = Boolean(state.selectedDirection || state.exploredCareers.length || state.completedExperiences.length);
  const evidenceBacked = directions.some(({ supportingEvidence }) => supportingEvidence.length > 0);
  const primaryStrong = primaryCareers?.strong ?? [];
  const primaryModerate = primaryCareers?.moderate ?? [];
  const exploratoryFallback = primaryCareers?.fallback ?? [];
  const primaryLower = primaryCareers?.lower ?? [];
  const careerSummary = primaryStrong.length
    ? `你目前有 ${primaryStrong.length} 類工作方向同時符合主要能力需求，也沒有明顯的環境或能量衝突。`
    : `你的結果目前比較接近以下 3 類工作方向。每個方向都包含可用的能力重疊，也各有需要實際確認的地方。`;
  const topDirectionNames = directions.slice(0, 3).map(({ title }) => title);

  const handleNavigator = (need: NavigatorNeed) => {
    saveNavigatorNeed(need);
    if (need === 'guided_direction') {
      selectCareerDirection(null);
      setShowGuided(true);
      document.getElementById('direction-choice')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return <main className="mx-auto max-w-7xl px-5 py-12 sm:py-20">
    <header className="max-w-4xl"><p className="text-sm font-bold tracking-[.2em] text-slate-600 uppercase">Your Career Navigator · Beta</p><h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">你的結果目前比較接近這 3 個方向。</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{topDirectionNames.join('、')}。先看它們的工作活動差異，再選一個方向做低成本確認。</p></header>

    <section className="mt-10 rounded-3xl bg-blue-50 p-6"><p className="text-sm font-bold text-slate-600">你的下一步摘要</p><p className="mt-2 text-lg font-semibold">先比較「{topDirectionNames.slice(0, 2).join('」與「')}」實際每天在做什麼。</p><p className="mt-2 text-sm leading-6 text-slate-600">你的前幾項能力集中在「{strengths.map(({ talentId }) => BASE_TALENTS.find(({ id }) => id === talentId)?.nameZh).join('、')}」。優先確認哪一種工作活動讓你願意持續投入，而不是只看職稱。</p></section>

    {hasJourney && <section className="mt-10 rounded-3xl border border-blue-200 bg-blue-50 p-6"><p className="text-sm font-bold text-slate-600">你上次探索到這裡</p><p className="mt-2 text-lg font-semibold">{selected ? `已選擇先了解「${selected.title}」` : state.completedExperiences.length ? `已完成 ${state.completedExperiences.length} 次 20 分鐘職涯體驗` : `已查看 ${state.exploredCareers.length} 份工作`}</p>{selected && <a href="#your-next-step" className="mt-3 inline-block text-sm font-semibold underline">繼續下一步 →</a>}</section>}

    <div className="mt-16 space-y-20">
      <section>{sectionTitle('01', '你比較容易怎麼發揮')}<div className="rounded-[2rem] bg-slate-950 p-7 text-white sm:p-10"><p className="max-w-4xl text-2xl leading-relaxed sm:text-4xl">{workSummary}</p><p className="mt-6 text-sm leading-6 text-slate-400">這段話來自你目前分數較高、且有足夠證據的能力組合；不是人格標籤。</p></div></section>

      <section>{sectionTitle('02', '你最值得注意的 3 個優勢')}<div className="grid gap-5 lg:grid-cols-3">{strengths.map((item) => {
        const definition = BASE_TALENTS.find(({ id }) => id === item.talentId)!;
        const evidence = item.evidence.find(({ strength }) => strength > 0)?.description ?? item.evidence[0]?.description ?? '目前由多題交叉訊號支持。';
        return <article key={item.talentId} className="rounded-3xl border border-slate-200 bg-white p-6"><p className="text-xs font-bold tracking-widest text-slate-500 uppercase">{definition.category}</p><h3 className="mt-3 text-2xl font-semibold">{definition.nameZh}</h3><p className="mt-3 leading-7 text-slate-600">{definition.description}</p><div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">你的作答證據</p><p className="mt-2 text-sm leading-6">{evidence}</p></div><p className="mt-5 text-sm leading-6"><strong>這在工作上代表：</strong>{workMeaningForTalent(item.talentId)}</p></article>;
      })}</div><Link to="/talents" className="mt-5 inline-block font-semibold underline decoration-blue-300 decoration-2 underline-offset-4">查看完整能力分析 →</Link></section>

      <section>{sectionTitle('03', '你目前最適合發揮的工作方向')}<div className="mb-9 max-w-4xl rounded-3xl bg-blue-50 p-6"><p className="text-lg font-semibold leading-8">{careerSummary}</p></div><div className="space-y-14">
        {primaryStrong.length > 0
          ? <PublicCareerTier title="非常適合" subtitle="目前證據支持較完整，而且沒有明顯的大型環境或能量衝突。" results={primaryStrong} />
          : exploratoryFallback.length > 0 && <PublicCareerTier title="目前較值得探索的方向" subtitle="以下方向在相對排名與部分工作需求上較接近你；卡片會直接列出已達需求的能力與仍需確認的摩擦。" results={exploratoryFallback} />}
        {primaryStrong.length > 0 && primaryModerate.length > 0 && <PublicCareerTier title="有條件適合" subtitle="部分主要需求已吻合，但仍有能力、環境或能量條件需要確認。" results={primaryModerate} />}
        {primaryLower.length > 0 && <PublicCareerTier title="較不適合目前的你" subtitle="目前存在較明顯、且有足夠證據支持的能力、偏好或能量落差；不是在說你做不到。" results={primaryLower} />}
      </div><Link to="/careers" className="mt-9 inline-block rounded-full border border-slate-400 px-5 py-3 text-sm font-semibold">查看完整 60 個職業分析 →</Link></section>

      <section>{sectionTitle('04', 'Top 3 方向差在哪裡')}<div className="mb-7 max-w-3xl rounded-3xl bg-slate-100 p-5"><p className="text-sm font-bold text-slate-600">方向清晰度 · {priority ? decisionClarityLabels[priority.decisionClarity] : '計算中'}</p><p className="mt-2 leading-7">{priority?.interpretation}</p></div><p className="mb-7 max-w-3xl leading-7 text-slate-600">{evidenceBacked ? '比較共同工作模式、能力用法與可能摩擦，選出最值得先了解的一類日常工作。' : '先比較三種工作活動，再用 20 分鐘體驗取得更具體的判斷依據。'}</p><div className="grid gap-5 lg:grid-cols-3">{directions.map((direction) => <DirectionCard key={direction.id} direction={direction} selected={selected?.id === direction.id} onSelect={() => { selectCareerDirection(direction.id); setShowGuided(false); }} />)}</div></section>

      <section id="direction-choice" className="scroll-mt-24 rounded-[2rem] bg-blue-50 p-6 sm:p-10">{sectionTitle('05', '哪個方向讓你最想多了解一點？')}<p className="max-w-3xl text-slate-600">先選一個願意花 20 分鐘了解的方向即可。你之後隨時可以換。</p><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{directions.map((direction) => <button key={direction.id} type="button" aria-pressed={selected?.id === direction.id} onClick={() => { selectCareerDirection(direction.id); setShowGuided(false); }} className={`rounded-2xl border p-4 text-left font-semibold ${selected?.id === direction.id ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 bg-white'}`}>{direction.title}</button>)}<button type="button" onClick={() => { saveNavigatorNeed('guided_direction'); selectCareerDirection(null); setShowGuided(true); }} className="rounded-2xl border border-dashed border-slate-400 bg-white p-4 text-left font-semibold">我還是不知道</button></div>
        {(showGuided || priority?.requiresTieBreaker) && <div className="mt-9 border-t border-slate-200 pt-8"><h3 className="text-2xl font-semibold">用工作偏好打破平手</h3><p className="mt-2 text-sm leading-6 text-slate-600">題目依這幾個方向差異最大的工作維度動態產生，最多 3 題。它只調整探索順序，不會修改 Talent、RIASEC、Career Fit 或 Confidence。</p><div className="mt-6 space-y-7">{guidedPrompts.map((prompt) => <fieldset key={prompt.id}><legend className="font-semibold">{prompt.question}</legend>{prompt.kind === 'elimination' && <p className="mt-1 text-xs text-slate-500">這題選的是你想排除的方向，不代表能力較弱。</p>}<div className="mt-3 grid gap-3 md:grid-cols-2">{prompt.options.map((option) => <button key={option.directionId} type="button" aria-pressed={state.navigatorState.guidedAnswers[prompt.id] === option.directionId} onClick={() => saveGuidedAnswer(prompt.id, option.directionId)} className={`rounded-2xl border p-4 text-left text-sm leading-6 ${state.navigatorState.guidedAnswers[prompt.id] === option.directionId ? 'border-slate-950 bg-white ring-2 ring-slate-950' : 'border-slate-300 bg-white'}`}><strong>{directions.find(({ id }) => id === option.directionId)?.title}</strong><span className="mt-1 block text-slate-600">{option.label}</span></button>)}</div></fieldset>)}</div>{guidedWinner && <div className="mt-7 rounded-2xl bg-white p-5"><p className="text-sm text-slate-600">原本位於最高 proximity cluster，加上你在比較題中的投入偏好：</p><p className="mt-1 text-xl font-semibold">建議先探索「{guidedWinner.title}」</p><p className="mt-2 text-sm text-slate-600">這只形成初步順序；其他方向仍然吻合，不是被判定不適合。</p><button type="button" onClick={() => { selectCareerDirection(guidedWinner.id); setShowGuided(false); }} className="mt-4 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">先探索這個方向</button></div>}{tieBreakerAnswered && !guidedWinner && <div className="mt-7 rounded-2xl bg-white p-5"><p className="text-xl font-semibold">目前仍不足以合理選出唯一方向。</p><p className="mt-2 text-sm leading-6 text-slate-600">可以並行探索「{tieDirections.slice(0, 2).map(({ title }) => title).join('」與「')}」，各做一次低成本了解，再用真實感受決定。</p><div className="mt-4 flex flex-wrap gap-2">{tieDirections.slice(0, 2).map((direction) => <button key={direction.id} type="button" onClick={() => selectCareerDirection(direction.id)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">先看 {direction.title}</button>)}</div></div>}</div>}
      </section>

      {selected && <section id="your-next-step" className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-10">{sectionTitle('06', `先探索「${selected.title}」`)}<div className="grid gap-8 lg:grid-cols-2"><div><h3 className="text-lg font-semibold">為什麼先看它</h3><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">{directionReasons(selected).map((reason) => <li key={reason}>• {reason}</li>)}</ul><h3 className="mt-7 text-lg font-semibold">這個方向包含</h3><div className="mt-3 flex flex-wrap gap-2">{selectedCareers.slice(0, 3).map((career) => <Link key={career!.id} to={`/career/${career!.id}`} className="rounded-full bg-slate-100 px-4 py-2 text-sm">{career!.titleZh}</Link>)}</div></div><div className="rounded-3xl bg-blue-100 p-6"><h3 className="text-lg font-semibold">你現在不用做的事</h3><ul className="mt-3 space-y-2 text-sm text-slate-700"><li>不用辭職。</li><li>不用先報課程。</li><li>不用立刻決定職業。</li></ul><h3 className="mt-7 text-lg font-semibold">你現在只需要做</h3><p className="mt-2 text-2xl font-semibold">花 20 分鐘，確認自己對這類工作活動有沒有興趣。</p><div className="mt-6 flex flex-wrap gap-3">{topCareer && <Link to={`/experiments?career=${topCareer}`} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">開始 20 分鐘探索</Link>}<Link to={`/career/${topCareer}`} className="rounded-full border border-slate-400 px-5 py-3 text-sm font-semibold">先看看這類工作</Link></div></div></div></section>}

      <section>{sectionTitle('07', '你現在最想解決哪件事？')}<div className="grid gap-3 md:grid-cols-2">{navigatorOptions.map(([need, title, body]) => {
        const destination = need === 'career_explorer' ? '/careers' : need === 'career_compare' ? '/compare' : need === 'talent_deep_dive' ? '/talents' : need === 'entry_path' && entryCareer ? `/career/${entryCareer}#entry-path` : undefined;
        const content = <><strong className="block">{title}</strong><span className="mt-1 block text-sm leading-6 text-slate-600">{body}</span></>;
        return destination ? <Link key={need} to={destination} onClick={() => handleNavigator(need)} className="rounded-2xl border border-slate-200 bg-white p-5">{content}</Link> : <button key={need} type="button" onClick={() => handleNavigator(need)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left">{content}</button>;
      })}</div></section>

      <details className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-9"><summary className="cursor-pointer text-2xl font-semibold">查看完整分析</summary><p className="mt-3 text-sm text-slate-600">完整 20 項能力、組合天賦、興趣、能量、環境、所有 Career Matches 與方法說明都保留在這裡及各專頁。</p><div className="mt-8 space-y-12"><DeepDive talentProfile={talentProfile} careerResults={careerResults} /></div></details>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-9">{sectionTitle('08', '這次結果有沒有讓下一步更清楚？')}<h3 className="text-lg font-semibold">看完結果後，你知道下一步可以做什麼嗎？</h3><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{clarityOptions.map(([value, label]) => <button key={value} type="button" aria-pressed={state.betaFeedback.nextStepClarity === value} onClick={() => saveNextStepClarity(value)} className={`rounded-2xl border p-3 text-left text-sm ${state.betaFeedback.nextStepClarity === value ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white'}`}>{label}</button>)}</div><h3 className="mt-8 text-lg font-semibold">整體來說，你比較接近哪種感覺？</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{overallOptions.map(([value, label]) => <button key={value} type="button" aria-pressed={state.betaFeedback.overallFeedback === value} onClick={() => saveOverallFeedback(value)} className={`rounded-2xl border p-3 text-left text-sm ${state.betaFeedback.overallFeedback === value ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white'}`}>{label}</button>)}</div><label className="mt-7 block text-sm font-semibold" htmlFor="beta-comment">還有什麼想讓我們知道？（選填）</label><textarea id="beta-comment" value={comment} maxLength={2000} onChange={(event) => setComment(event.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-white p-4" placeholder="請避免填寫姓名、Email 或其他個人資料。" /><div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={() => saveOptionalComment(comment)} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">保存留言</button><button type="button" onClick={() => downloadJson(`career-discovery-feedback-${state.sessionId}.json`, buildBetaFeedbackExport(state))} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold">匯出 Beta Feedback</button><button type="button" onClick={() => downloadJson(`career-discovery-diagnostic-${state.sessionId}.json`, buildDiagnosticReport(state))} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold">Export Diagnostic Report</button></div></section>
    </div>
  </main>;
}

function PublicCareerTier({ title, subtitle, results }: { title: string; subtitle: string; results: ReturnType<typeof interpretPublicCareers>['all'] }) {
  return <section aria-labelledby={`career-tier-${title}`}>
    <h3 id={`career-tier-${title}`} className="text-2xl font-semibold sm:text-3xl">{title}</h3>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p>
    <div className="mt-6 grid gap-5">{results.map((result) => <PublicCareerCard key={result.publicCareerId} result={result} />)}</div>
  </section>;
}

function DirectionCard({ direction, selected, onSelect }: { direction: PrioritizedCareerDirection; selected: boolean; onSelect: () => void }) {
  const careers = direction.careerIds.map((id) => CAREER_PROFILES.find((career) => career.id === id)).filter(Boolean);
  return <article className={`flex h-full flex-col rounded-3xl border bg-white p-6 ${selected ? 'border-slate-950 ring-2 ring-slate-950' : 'border-slate-200'}`}><p className="mb-3 w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-bold">{priorityLabels[direction.explorationPriority]}</p><h3 className="text-2xl font-semibold">{direction.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{direction.description}</p><div className="mt-5"><p className="text-xs font-bold text-slate-500">代表工作</p><p className="mt-2 text-sm leading-6">{careers.slice(0, 3).map((career) => career!.titleZh).join('、')}</p></div><div className="mt-5"><p className="text-xs font-bold text-slate-500">共同工作模式</p><div className="mt-2 flex flex-wrap gap-2">{direction.sharedWorkPatterns.map((pattern) => <span key={pattern} className="rounded-full bg-slate-100 px-3 py-1 text-xs">{pattern}</span>)}</div></div><div className="mt-5"><p className="text-xs font-bold text-slate-500">共同能力</p><p className="mt-2 text-sm leading-6">{direction.sharedTalents.slice(0, 3).map((id) => BASE_TALENTS.find((talent) => talent.id === id)?.nameZh).join('、')}</p></div><p className="mt-5 text-sm text-slate-700"><strong>可能摩擦：</strong>{direction.potentialFrictions[0] ?? '目前沒有明顯摩擦訊號。'}</p><details className="mt-5 rounded-2xl bg-slate-50 p-4"><summary className="cursor-pointer text-sm font-semibold">查看分析依據</summary><div className="mt-3 space-y-2 text-xs leading-5 text-slate-600"><p>Career Fit Index（代表工作平均）· {formatFitIndex(direction.averageFit)}</p><p>Confidence · {direction.confidence}</p><p>Entry Distance · 背景資料不足</p><p>Score Proximity Cluster · {direction.proximityCluster + 1}</p><p>Supporting evidence · {direction.supportingEvidence.length}</p><p>Career Fit 是相對吻合指標，不是適合度百分比。</p></div></details><button type="button" onClick={onSelect} className="mt-auto pt-6 text-left text-sm font-semibold underline decoration-blue-300 decoration-2 underline-offset-4">選這個方向 →</button></article>;
}

function directionReasons(direction: PrioritizedCareerDirection) {
  return [
    `探索優先層級是「${priorityLabels[direction.explorationPriority]}」；這不是適合度評分。`,
    direction.tieBreakerNet > 0 ? '你在比較題中更願意投入這類工作活動。' : `目前分析信心為 ${direction.confidence}，仍應用真實任務驗證。`,
    direction.potentialFrictions.length ? `先留意：${direction.potentialFrictions[0]}` : '目前沒有明顯的工作環境摩擦訊號。',
  ];
}

function DeepDive({ talentProfile, careerResults }: { talentProfile: NonNullable<ReturnType<typeof useAppState>['talentProfile']>; careerResults: NonNullable<ReturnType<typeof useAppState>['careerResults']> }) {
  const state = useAppState();
  const composites = [...talentProfile.compositeTalents].sort((a, b) => b.score - a.score);
  const drains = talentProfile.baseTalents.filter((item) => item.energyScore !== null && item.energyScore < 0);
  const card = (match: (typeof careerResults.matches)[number], mode: 'career' | 'surprise') => <CareerCard key={match.careerId} match={match} rank={careerResults.matches.findIndex(({ careerId }) => careerId === match.careerId) + 1} total={careerResults.matches.length} feedbackMode={mode} feedbackValue={mode === 'career' ? state.betaFeedback.careerFeedback.find(({ careerId }) => careerId === match.careerId)?.response : state.betaFeedback.surpriseFeedback.find(({ careerId }) => careerId === match.careerId)?.response} onFeedback={(value) => mode === 'career' ? saveCareerFeedback(match.careerId, value as CareerFeedbackChoice) : saveSurpriseFeedback(match.careerId, value as SurpriseFeedbackChoice)} />;
  return <><section><h3 className="text-2xl font-semibold">Composite Talents</h3><div className="mt-4 grid gap-4 md:grid-cols-2">{composites.map((item) => { const definition = COMPOSITE_TALENTS.find(({ id }) => id === item.compositeTalentId)!; return <article key={item.compositeTalentId} className="rounded-2xl bg-slate-50 p-5"><h4 className="font-semibold">{definition.nameZh}</h4><p className="mt-2 text-sm text-slate-600">{definition.shortDescription}</p></article>; })}</div></section><section><h3 className="text-2xl font-semibold">完整 Career Matches</h3><p className="mt-2 text-sm text-slate-600">原始 Career Fit 與相對排名保留在分析依據中，不作為主要決策畫面。</p><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{careerResults.matches.slice(0, 8).map((match) => card(match, 'career'))}</div><Link to="/careers" className="mt-4 inline-block font-semibold underline">查看所有職業結果 →</Link></section>{careerResults.categories.surprise_me.length > 0 && <section><h3 className="text-2xl font-semibold">你可能沒想過的方向</h3><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{careerResults.categories.surprise_me.map((match) => card(match, 'surprise'))}</div></section>}<section><h3 className="text-2xl font-semibold">可能消耗你的模式</h3><div className="mt-4 grid gap-3 md:grid-cols-2">{drains.map((item) => <div key={item.talentId} className="rounded-2xl bg-slate-100 p-5"><strong>{BASE_TALENTS.find(({ id }) => id === item.talentId)?.nameZh}</strong><p className="mt-2 text-sm text-slate-600">做得到，但高密度使用時可能消耗能量。</p></div>)}</div>{!drains.length && <p className="mt-3 text-slate-600">目前沒有足夠強的能量消耗訊號。</p>}</section><div className="flex flex-wrap gap-4"><Link to="/talents" className="font-semibold underline">完整 Talent Landscape</Link><Link to="/methodology" className="font-semibold underline">評分與方法說明</Link></div></>;
}
