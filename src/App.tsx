import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components';
import { AssessmentPage } from './pages/AssessmentPage';
import { CareerDetailPage } from './pages/CareerDetailPage';
import { CareersPage } from './pages/CareersPage';
import { ComparePage } from './pages/ComparePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { ResultsPage } from './pages/ResultsPage';
import { TalentsPage } from './pages/TalentsPage';

export function App() {
  return <BrowserRouter><Routes><Route element={<AppLayout />}><Route index element={<Navigate to="/discover" replace />} /><Route path="discover" element={<DiscoverPage />} /><Route path="assessment" element={<AssessmentPage />} /><Route path="results" element={<ResultsPage />} /><Route path="talents" element={<TalentsPage />} /><Route path="careers" element={<CareersPage />} /><Route path="career/:careerId" element={<CareerDetailPage />} /><Route path="career" element={<Navigate to="/careers" replace />} /><Route path="compare" element={<ComparePage />} /><Route path="experiments" element={<ExperimentsPage />} /><Route path="methodology" element={<MethodologyPage />} /><Route path="*" element={<Navigate to="/discover" replace />} /></Route></Routes></BrowserRouter>;
}
