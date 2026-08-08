import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  ['/discover', '探索'], ['/assessment', '測驗'], ['/results', '結果'], ['/talents', '天賦'],
  ['/careers', '職涯'], ['/compare', '比較'], ['/experiments', '實驗'], ['/methodology', '方法'],
] as const;

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="app-surface min-h-screen">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-6 px-4 py-4 sm:px-6">
          <NavLink to="/discover" className="group flex items-center gap-3 text-lg font-semibold tracking-tight"><span className="grid size-8 place-items-center rounded-full bg-ink text-xs text-white transition-transform group-hover:rotate-12">CD</span><span>Career Discovery</span><span className="rounded-full border border-ink/15 bg-white/65 px-2 py-1 text-[10px] font-bold tracking-widest uppercase">Beta</span></NavLink>
          <nav aria-label="主要導覽" className="hidden gap-1 lg:flex">
            {navItems.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `rounded-full px-3 py-2 text-sm transition ${isActive ? 'bg-ink text-white' : 'text-ink/55 hover:bg-white/70 hover:text-ink'}`}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="relative flex items-center gap-2"><NavLink to="/assessment" className="hidden rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 sm:block">開始探索</NavLink><button type="button" aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" onClick={() => setMobileMenuOpen((open) => !open)} className="grid size-10 place-items-center rounded-full border border-ink/15 bg-white/45 text-lg lg:hidden" aria-label={mobileMenuOpen ? '關閉導覽' : '開啟導覽'}>⌁</button>{mobileMenuOpen && <nav id="mobile-navigation" aria-label="行動版導覽" className="absolute right-0 top-12 grid w-52 gap-1 rounded-2xl border border-ink/10 bg-cream p-2 shadow-2xl lg:hidden">{navItems.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `rounded-xl px-4 py-3 text-sm ${isActive ? 'bg-ink text-white' : 'hover:bg-white'}`}>{label}</NavLink>)}</nav>}</div>
        </div>
      </header>
      <Outlet />
      <footer className="border-t border-ink/10 px-6 py-10"><div className="mx-auto flex max-w-[88rem] flex-col justify-between gap-4 text-sm text-ink/45 sm:flex-row"><span>Career Discovery © 2026 · Public Beta</span><span>目前仍在擴充職業資料庫與驗證分析方式。</span></div></footer>
    </div>
  );
}
