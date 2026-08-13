import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AssessmentStageNotice } from '../components';
import { CAREER_PROFILES } from '../data/careers';
import { useAppState } from '../services/use-app-state';
import { careerEntryBarrierLabel, careerRequirementSummary, formatFitIndex } from '../utils';

export function ComparePage() {
  const { careerResults } = useAppState();
  const candidates = careerResults?.matches.slice(0, 20) ?? [];
  const [leftId, setLeftId] = useState(candidates[0]?.careerId ?? '');
  const [rightId, setRightId] = useState(candidates[1]?.careerId ?? '');
  if (!careerResults) return <Empty />;
  const left = careerResults.matches.find((item) => item.careerId === leftId);
  const right = careerResults.matches.find((item) => item.careerId === rightId);
  const leftCareer = career(left?.careerId);
  const rightCareer = career(right?.careerId);
  return <main className="mx-auto max-w-5xl px-5 py-14"><h1 className="text-5xl font-semibold">比較職涯</h1><p className="mt-4 text-slate-600">吻合程度相近的工作，可能在環境摩擦與準備需求上完全不同。</p><AssessmentStageNotice className="mt-7" /><div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2"><CareerSelect value={leftId} onChange={setLeftId} candidates={candidates} /><CareerSelect value={rightId} onChange={setRightId} candidates={candidates} /></div>{left && right && leftCareer && rightCareer && <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white"><div className="min-w-[42rem]"><CompareRow label="職涯" left={leftCareer.titleZh} right={rightCareer.titleZh} strong /><CompareRow label="職涯吻合指標" left={formatFitIndex(left.matchScore)} right={formatFitIndex(right.matchScore)} /><CompareRow label="分析信心" left={left.confidence} right={right.confidence} /><CompareRow label="職業通常門檻" left={careerEntryBarrierLabel[leftCareer.entryBarrier]} right={careerEntryBarrierLabel[rightCareer.entryBarrier]} /><CompareRow label="常見起點" left={careerRequirementSummary(leftCareer)} right={careerRequirementSummary(rightCareer)} /><CompareRow label="個人進入距離" left="尚未估算" right="尚未估算" /><CompareRow label="能力吻合指標" left={formatFitIndex(left.talentMatch)} right={formatFitIndex(right.talentMatch)} /><CompareRow label="興趣吻合指標" left={formatFitIndex(left.interestMatch)} right={formatFitIndex(right.interestMatch)} /><CompareRow label="環境吻合指標" left={formatFitIndex(left.environmentMatch)} right={formatFitIndex(right.environmentMatch)} /><CompareRow label="主要摩擦" left={left.potentialFrictions[0] ?? '無明顯訊號'} right={right.potentialFrictions[0] ?? '無明顯訊號'} /></div></div>}<p className="mt-4 text-sm leading-6 text-slate-500">「職業通常門檻」來自職業資料庫的一般要求；個人進入距離需另行比對教育、技能、經驗、證照與作品集，不會影響職涯吻合指標。</p></main>;
}
const career = (id?: string) => CAREER_PROFILES.find((item) => item.id === id);
const title = (id: string) => CAREER_PROFILES.find((item) => item.id === id)?.titleZh ?? id;
function CareerSelect({ value, onChange, candidates }: { value: string; onChange: (value: string) => void; candidates: Array<{ careerId: string }> }) { return <select aria-label="選擇比較職涯" value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 rounded-2xl border border-slate-300 bg-white p-4 font-semibold">{candidates.map((item) => <option key={item.careerId} value={item.careerId}>{title(item.careerId)}</option>)}</select>; }
function CompareRow({ label, left, right, strong = false }: { label: string; left: string; right: string; strong?: boolean }) { return <div className="grid grid-cols-[6rem_1fr_1fr] border-b border-slate-100 last:border-0"><div className="p-4 text-xs text-slate-500">{label}</div><div className={`border-x border-slate-100 p-4 ${strong ? 'font-semibold' : ''}`}>{left}</div><div className={`p-4 ${strong ? 'font-semibold' : ''}`}>{right}</div></div>; }
function Empty() { return <main className="mx-auto max-w-2xl px-5 py-24 text-center"><h1 className="text-4xl font-semibold">完成測驗後才能比較</h1><Link to="/assessment" className="mt-7 inline-block rounded-full bg-slate-950 px-6 py-3 text-white">前往測驗</Link></main>; }
