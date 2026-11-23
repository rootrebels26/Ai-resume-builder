import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PageLoader } from './components/common/PageLoader';
import { Toaster } from './components/common/Toaster';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Route-level code splitting keeps the heavy template engine out of the
// initial bundle so the landing page loads fast.
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const Builder = lazy(() => import('./pages/Builder').then((m) => ({ default: m.Builder })));
const Onboarding = lazy(() => import('./pages/Onboarding').then((m) => ({ default: m.Onboarding })));
const ResumeWizard = lazy(() => import('./pages/ResumeWizard').then((m) => ({ default: m.ResumeWizard })));
const Templates = lazy(() => import('./pages/Templates').then((m) => ({ default: m.Templates })));
const UploadResume = lazy(() => import('./pages/UploadResume').then((m) => ({ default: m.UploadResume })));
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
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/builder" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/wizard" element={<ProtectedRoute><ResumeWizard /></ProtectedRoute>} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/upload" element={<ProtectedRoute><UploadResume /></ProtectedRoute>} />
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
