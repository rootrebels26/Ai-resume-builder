import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PageLoader } from './components/common/PageLoader';
import { Toaster } from './components/common/Toaster';

// Route-level code splitting keeps the heavy template engine out of the
// initial bundle so the landing page loads fast.
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const Onboarding = lazy(() => import('./pages/Onboarding').then((m) => ({ default: m.Onboarding })));
const ResumeWizard = lazy(() => import('./pages/ResumeWizard').then((m) => ({ default: m.ResumeWizard })));
const Templates = lazy(() => import('./pages/Templates').then((m) => ({ default: m.Templates })));
const UploadResume = lazy(() => import('./pages/UploadResume').then((m) => ({ default: m.UploadResume })));
const JobAnalyzer = lazy(() => import('./pages/JobAnalyzer').then((m) => ({ default: m.JobAnalyzer })));
const ATSChecker = lazy(() => import('./pages/ATSChecker').then((m) => ({ default: m.ATSChecker })));
const Preview = lazy(() => import('./pages/Preview').then((m) => ({ default: m.Preview })));
const Privacy = lazy(() => import('./pages/Privacy').then((m) => ({ default: m.Privacy })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

export default function App() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/wizard" element={<ResumeWizard />} />
            <Route path="/templates" element={<Templates />} />
            {/* Legacy alias — single canonical wizard route. */}
            <Route path="/builder" element={<Navigate to="/wizard" replace />} />
            <Route path="/upload" element={<UploadResume />} />
            <Route path="/job-analyzer" element={<JobAnalyzer />} />
            <Route path="/ats-checker" element={<ATSChecker />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <Toaster />
    </AppLayout>
  );
}
