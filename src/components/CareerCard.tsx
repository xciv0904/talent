import { Link } from 'react-router-dom';
import { CAREER_PROFILES } from '../data/careers';
import type { CareerFeedbackChoice, CareerMatchResult, SurpriseFeedbackChoice } from '../types';
import { careerMatchReasons, entryDistanceLabel, formatFitIndex } from '../utils';

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
}

export function CareerCard({ match, compact = false, feedbackMode, feedbackValue, onFeedback }: CareerCardProps) {
  const career = CAREER_PROFILES.find(({ id }) => id === match.careerId);
  if (!career) return null;
  return (
    <article className="career-card-polished flex h-full min-w-0 flex-col rounded-[1.75rem] border border-ink/10 bg-white/75 p-5 shadow-[0_16px_50px_-40px_rgba(24,35,31,.5)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-slate-600 uppercase">{career.family.replaceAll('_', ' ')}</p>
          <h3 className="mt-2 text-xl font-semibold">{career.titleZh}</h3>
          <p className="text-sm text-slate-500">{career.titleEn}</p>
        </div>
        <div className="grid min-h-16 w-20 shrink-0 place-items-center rounded-full border border-ink/15 bg-mint/55 px-2 text-center font-serif text-base leading-tight"><span>{formatFitIndex(match.matchScore)}<small className="mt-1 block font-sans text-[10px] text-ink/55">Fit Index</small></span></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-ink/5 px-3 py-1">Confidence · {match.confidence}</span>
        <span className="rounded-full bg-lilac/35 px-3 py-1">{entryDistanceLabel[match.entryDistance.level]}</span>
      </div>
      {!compact && (
        <>
          <ul className="mt-5 space-y-2 text-sm text-slate-700">
            {careerMatchReasons(match).map((reason) => <li key={reason} className="flex gap-2 leading-6"><span className="text-coral">↳</span>{reason}</li>)}
          </ul>
          <p className="mt-4 text-sm text-slate-700"><strong>Potential friction：</strong>{match.potentialFrictions[0] ?? '目前沒有明顯摩擦訊號。'}</p>
          {feedbackMode && onFeedback && <div className="mt-5 border-t border-ink/10 pt-4"><p className="text-sm font-semibold">{feedbackMode === 'surprise' ? '這個意外方向對你來說是？' : '你怎麼看這個推薦？'}</p><div className="mt-3 flex flex-wrap gap-2">{(feedbackMode === 'surprise' ? surpriseFeedbackOptions : careerFeedbackOptions).map(([value, label]) => <button key={value} type="button" aria-pressed={feedbackValue === value} onClick={() => onFeedback(value)} className={`rounded-full border px-3 py-2 text-left text-xs leading-4 ${feedbackValue === value ? 'border-ink bg-ink text-white' : 'border-ink/15 bg-white text-ink/65'}`}>{label}</button>)}</div></div>}
        </>
      )}
      <Link to={`/career/${career.id}`} className="mt-auto pt-6 text-sm font-semibold text-ink underline decoration-coral decoration-2 underline-offset-4">深入了解這份工作 →</Link>
    </article>
  );
}
