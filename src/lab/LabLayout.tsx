import { CAREER_PROFILES } from '../data/careers';
import { useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { labStorageError, useLab } from './storage';
import { LabActionContext } from './actions';
export const careerTitle = (id: string) => CAREER_PROFILES.find((c) => c.id === id)?.titleZh ?? id;
export const dateLabel = (at: string) => new Date(at).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', dateStyle: 'medium', timeStyle: 'short' });
export function LabLayout() {
  useLab();
  const { pathname } = useLocation();
  const [error, setError] = useState('');
  function act(fn: () => void) { try { fn(); setError(''); return true; } catch (e) { setError(e instanceof Error ? e.message : '操作失敗，請再試一次。'); return false; } }
  return <LabActionContext.Provider value={act}><main className="lab-shell"><div className="lab-topline"><Link to="/lab" className="eyebrow">CAREER LAB / 職涯實驗室</Link><span>在這裡練習，在現實驗證。</span></div><nav className="lab-nav" aria-label="職涯實驗室導覽">{[['/lab', '實驗室'], ['/lab/life', '職涯故事'], ['/lab/missions', '試做工作'], ['/lab/parallel', '平行職涯'], ['/lab/growth', '我的下一步'], ['/lab/report', '探索報告']].map(([to, label]) => <NavLink key={to} to={to} end={to === '/lab'} className={({ isActive }) => isActive || (to === '/lab/missions' && pathname.startsWith('/lab/mission/')) || (to === '/lab/parallel' && pathname === '/lab/compare') ? 'active' : ''}>{label}</NavLink>)}</nav>{(error || labStorageError()) && <div role="alert" className="lab-error">{error || labStorageError()} <Link to="/lab/growth">前往資料管理</Link></div>}<Outlet /><p className="lab-footnote">本機探索紀錄僅儲存在此瀏覽器。模擬數值是教學模型，不代表薪資、錄取機率或現實人生預測。無需 AI API。</p></main></LabActionContext.Provider>;
}
export function Panel({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) { return <section className={`lab-panel ${className}`}>{title && <h2>{title}</h2>}{children}</section>; }
export function Empty({ children }: { children: ReactNode }) { return <Panel><p>{children}</p><Link className="lab-button" to="/lab/life">選擇一份職業 →</Link></Panel>; }
