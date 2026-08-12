import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';

const AssessmentPage = lazy(() => import('./pages/AssessmentPage').then(({ AssessmentPage }) => ({ default: AssessmentPage })));
const CareerDetailPage = lazy(() => import('./pages/CareerDetailPage').then(({ CareerDetailPage }) => ({ default: CareerDetailPage })));
const CareersPage = lazy(() => import('./pages/CareersPage').then(({ CareersPage }) => ({ default: CareersPage })));
const ComparePage = lazy(() => import('./pages/ComparePage').then(({ ComparePage }) => ({ default: ComparePage })));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage').then(({ DiscoverPage }) => ({ default: DiscoverPage })));
const ExperimentsPage = lazy(() => import('./pages/ExperimentsPage').then(({ ExperimentsPage }) => ({ default: ExperimentsPage })));
const MethodologyPage = lazy(() => import('./pages/MethodologyPage').then(({ MethodologyPage }) => ({ default: MethodologyPage })));
const ResultsPage = lazy(() => import('./pages/ResultsPage').then(({ ResultsPage }) => ({ default: ResultsPage })));
const TalentsPage = lazy(() => import('./pages/TalentsPage').then(({ TalentsPage }) => ({ default: TalentsPage })));

export function App() {
  return <BrowserRouter><Suspense fallback={<PageLoading />}><Routes><Route element={<AppLayout />}><Route index element={<Navigate to="/discover" replace />} /><Route path="discover" element={<DiscoverPage />} /><Route path="assessment" element={<AssessmentPage />} /><Route path="results" element={<ResultsPage />} /><Route path="talents" element={<TalentsPage />} /><Route path="careers" element={<CareersPage />} /><Route path="career/:careerId" element={<CareerDetailPage />} /><Route path="career" element={<Navigate to="/careers" replace />} /><Route path="compare" element={<ComparePage />} /><Route path="experiments" element={<ExperimentsPage />} /><Route path="methodology" element={<MethodologyPage />} /><Route path="*" element={<Navigate to="/discover" replace />} /></Route></Routes></Suspense></BrowserRouter>;
}

function PageLoading() {
  return <main className="grid min-h-[60svh] place-items-center px-5" aria-live="polite"><div className="text-center"><div className="mx-auto size-8 animate-pulse rounded-full bg-blue-200" aria-hidden="true" /><p className="mt-4 text-sm font-semibold text-slate-600">正在載入內容…</p></div></main>;
}
