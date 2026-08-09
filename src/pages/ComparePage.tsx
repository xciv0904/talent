import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CAREER_PROFILES } from '../data/careers';
import { useAppState } from '../services';
import { formatFitIndex } from '../utils';

export function ComparePage() {
  const { careerResults } = useAppState();
  const candidates = careerResults?.matches.slice(0, 20) ?? [];
  const [leftId, setLeftId] = useState(candidates[0]?.careerId ?? '');
  const [rightId, setRightId] = useState(candidates[1]?.careerId ?? '');
  if (!careerResults) return <Empty />;
  const left = careerResults.matches.find((item) => item.careerId === leftId);
  const right = careerResults.matches.find((item) => item.careerId === rightId);
  return <main className="mx-auto max-w-5xl px-5 py-14"><h1 className="text-5xl font-semibold">比較職涯</h1><p className="mt-4 text-slate-600">Fit 相近的工作，可能在環境摩擦與準備需求上完全不同。</p><div className="mt-9 grid grid-cols-2 gap-3"><CareerSelect value={leftId} onChange={setLeftId} candidates={candidates} /><CareerSelect value={rightId} onChange={setRightId} candidates={candidates} /></div>{left && right && <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white"><CompareRow label="職涯" left={title(left.careerId)} right={title(right.careerId)} strong /><CompareRow label="Career Fit index" left={formatFitIndex(left.matchScore)} right={formatFitIndex(right.matchScore)} /><CompareRow label="Confidence" left={left.confidence} right={right.confidence} /><CompareRow label="進入門檻" left="背景資料不足" right="背景資料不足" /><CompareRow label="Talent Match index" left={formatFitIndex(left.talentMatch)} right={formatFitIndex(right.talentMatch)} /><CompareRow label="Interest Match index" left={formatFitIndex(left.interestMatch)} right={formatFitIndex(right.interestMatch)} /><CompareRow label="Environment Match index" left={formatFitIndex(left.environmentMatch)} right={formatFitIndex(right.environmentMatch)} /><CompareRow label="主要摩擦" left={left.potentialFrictions[0] ?? '無明顯訊號'} right={right.potentialFrictions[0] ?? '無明顯訊號'} /></div>}<p className="mt-4 text-sm leading-6 text-slate-500">補充教育、技能、經驗、證照與作品集背景後，才能估算哪個方向較容易開始。</p></main>;
}
const title = (id: string) => CAREER_PROFILES.find((item) => item.id === id)?.titleZh ?? id;
function CareerSelect({ value, onChange, candidates }: { value: string; onChange: (value: string) => void; candidates: Array<{ careerId: string }> }) { return <select aria-label="選擇比較職涯" value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 rounded-2xl border border-slate-300 bg-white p-4 font-semibold">{candidates.map((item) => <option key={item.careerId} value={item.careerId}>{title(item.careerId)}</option>)}</select>; }
function CompareRow({ label, left, right, strong = false }: { label: string; left: string; right: string; strong?: boolean }) { return <div className="grid grid-cols-[6rem_1fr_1fr] border-b border-slate-100 last:border-0"><div className="p-4 text-xs text-slate-500">{label}</div><div className={`border-x border-slate-100 p-4 ${strong ? 'font-semibold' : ''}`}>{left}</div><div className={`p-4 ${strong ? 'font-semibold' : ''}`}>{right}</div></div>; }
function Empty() { return <main className="mx-auto max-w-2xl px-5 py-24 text-center"><h1 className="text-4xl font-semibold">完成測驗後才能比較</h1><Link to="/assessment" className="mt-7 inline-block rounded-full bg-slate-950 px-6 py-3 text-white">前往測驗</Link></main>; }
