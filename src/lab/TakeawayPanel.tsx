import { Link } from 'react-router-dom';
import type { CareerTakeaway } from './guidance';
export function TakeawayPanel({ takeaway, title = '這次對你有什麼幫助' }: { takeaway: CareerTakeaway; title?: string }) {
  return <section className="lab-takeaway" aria-label={title}><p className="eyebrow">{title}</p><h2 aria-live="polite">{takeaway.headline}</h2><p>{takeaway.benefit}</p><Link className="lab-button" to={takeaway.next.to}>{takeaway.next.label} →</Link><details><summary>為什麼這樣建議？</summary>{takeaway.reasons.map((r) => <p key={r}>{r}</p>)}<small>依據：{takeaway.evidenceIds.join('、') || '目前尚無這份工作的任務產出'}。建議只決定下一步探索，不代替轉職決定。</small></details></section>;
}
