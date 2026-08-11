import { Link } from 'react-router-dom';
import { CAREER_PROFILES } from '../data/careers';
import { careerDirectionForFamily } from '../engine';
import type { CareerFeedbackChoice, CareerMatchResult, SurpriseFeedbackChoice } from '../types';
import { careerEntryBarrierLabel, formatFitIndex } from '../utils';

const careerFeedbackOptions: Array<[CareerFeedbackChoice, string]> = [
  ['strong_fit', '很符合我'], ['already_considered', '我有考慮過'], ['unexpected_interested', '沒想過，但想了解'],
  ['reason_clear_not_desired', '看得懂原因，但不想做'], ['unreasonable', '我覺得不合理'],
];
const surpriseFeedbackOptions: Array<[SurpriseFeedbackChoice, string]> = [
  ['unexpected_attractive', '完全沒想過，而且有點吸引我'], ['unexpected_reasonable', '沒想過，但推薦理由合理'],
  ['known_not_considered', '知道這工作，但沒考慮過'], ['not_interested', '我不感興趣'], ['reason_invalid', '推薦理由不成立'],
];

interface CareerCardProps {
  match: CareerMatchResult;
  compact?: boolean;
  feedbackMode?: 'career' | 'surprise';
  feedbackValue?: CareerFeedbackChoice | SurpriseFeedbackChoice;
  onFeedback?: (value: CareerFeedbackChoice | SurpriseFeedbackChoice) => void;
  rank?: number;
  total?: number;
}

export function CareerCard({ match, compact = false, feedbackMode, feedbackValue, onFeedback, rank, total = 60 }: CareerCardProps) {
  const career = CAREER_PROFILES.find(({ id }) => id === match.careerId);
  if (!career) return null;
  const direction = careerDirectionForFamily(career.family);
  const relativeLabel = rank ? rank <= 5 ? '相對排名靠前' : rank <= 15 ? '可進一步比較' : rank <= 30 ? '中段結果' : '目前不是優先' : '細職業資料';
  return (
    <article className="career-card-polished flex h-full min-w-0 flex-col rounded-[1.75rem] border border-ink/10 bg-white/75 p-5 shadow-[0_16px_50px_-40px_rgba(24,35,31,.5)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-slate-600 uppercase">{direction?.title ?? career.family.replaceAll('_', ' ')}</p>
          <h3 className="mt-2 text-xl font-semibold">{career.titleZh}</h3>
          <p className="text-sm text-slate-500">{career.titleEn}</p>
        </div>
      </div>
      <p className="mt-4 w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-bold">{relativeLabel}</p>
      <p className="mt-4 text-sm leading-6 text-slate-600">{career.description}</p>
      {!compact && (
        <>
          <p className="mt-5 text-sm font-semibold">主要比對指標</p><ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="leading-6">Talent Match · {formatFitIndex(match.talentMatch)}</li>
            <li className="leading-6">Interest Match · {formatFitIndex(match.interestMatch)}</li>
            <li className="leading-6">Work Style Match · {formatFitIndex(match.workStyleMatch)}</li>
          </ul>
          <p className="mt-4 text-sm text-slate-700"><strong>主要工作：</strong>{career.coreTasks[0]}</p>
          <p className="mt-4 text-sm text-slate-700"><strong>Potential friction：</strong>{match.potentialFrictions[0] ?? '目前沒有明顯摩擦訊號。'}</p>
          {feedbackMode && onFeedback && <div className="mt-5 border-t border-ink/10 pt-4"><p className="text-sm font-semibold">{feedbackMode === 'surprise' ? '這個意外方向對你來說是？' : '你怎麼看這個推薦？'}</p><div className="mt-3 flex flex-wrap gap-2">{(feedbackMode === 'surprise' ? surpriseFeedbackOptions : careerFeedbackOptions).map(([value, label]) => <button key={value} type="button" aria-pressed={feedbackValue === value} onClick={() => onFeedback(value)} className={`rounded-full border px-3 py-2 text-left text-xs leading-4 ${feedbackValue === value ? 'border-ink bg-ink text-white' : 'border-ink/15 bg-white text-ink/65'}`}>{label}</button>)}</div></div>}
        </>
      )}
      <details className="mt-5 rounded-2xl bg-slate-50 p-4"><summary className="cursor-pointer text-xs font-semibold">查看分析依據</summary><div className="mt-3 space-y-2 text-xs leading-5 text-slate-600">{rank && <p>在目前收錄的 {total} 種工作中，位於你的前 {rank} 名。</p>}<p>Career Fit Index · {formatFitIndex(match.matchScore)}</p><p>Confidence · {match.confidence}</p><p>職業通常門檻 · {careerEntryBarrierLabel[career.entryBarrier]}</p><p>個人 Entry Distance · 尚未估算</p><p>Talent / Interest / Work Style · {formatFitIndex(match.talentMatch)} / {formatFitIndex(match.interestMatch)} / {formatFitIndex(match.workStyleMatch)}</p><p>Environment / Values · {formatFitIndex(match.environmentMatch)} / {formatFitIndex(match.valuesMatch)}</p><p>Career Fit 是相對吻合指標，不是成功、錄取或適合度百分比。</p></div></details>
      <Link to={`/career/${career.id}`} className="mt-auto pt-6 text-sm font-semibold text-ink underline decoration-coral decoration-2 underline-offset-4">深入了解這份工作 →</Link>
    </article>
  );
}
