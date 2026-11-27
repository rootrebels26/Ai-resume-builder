import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PageLoader } from './components/common/PageLoader';
import { Toaster } from './components/common/Toaster';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Retry dynamic chunk imports once by reloading the page when Vercel deploys a new build
// and an open browser tab still holds stale chunk hashes.
function lazyWithRetry(importer, exportName) {
  return lazy(async () => {
    const reloadKey = 'resume_studio_chunk_reload';
    try {
      const mod = await importer();
      try {
        sessionStorage.removeItem(reloadKey);
      } catch {
        // ignore storage errors
      }
      return { default: mod[exportName] };
    } catch (err) {
      const msg = String(err?.message || err || '');
      const isChunkError =
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Importing a module script failed') ||
        err?.name === 'ChunkLoadError';

      let alreadyReloaded = false;
      try {
        alreadyReloaded = sessionStorage.getItem(reloadKey) === '1';
      } catch {
        // ignore
      }

      if (isChunkError && !alreadyReloaded) {
        try {
          sessionStorage.setItem(reloadKey, '1');
        } catch {
          // ignore
        }
        window.location.reload();
        return new Promise(() => {});
      }
      throw err;
    }
  });
}

// Route-level code splitting keeps the heavy template engine out of the
// initial bundle so the landing page loads fast.
const Home = lazyWithRetry(() => import('./pages/Home'), 'Home');
const Builder = lazyWithRetry(() => import('./pages/Builder'), 'Builder');
const Onboarding = lazyWithRetry(() => import('./pages/Onboarding'), 'Onboarding');
const ResumeWizard = lazyWithRetry(() => import('./pages/ResumeWizard'), 'ResumeWizard');
const Templates = lazyWithRetry(() => import('./pages/Templates'), 'Templates');
const UploadResume = lazyWithRetry(() => import('./pages/UploadResume'), 'UploadResume');
const ATSChecker = lazyWithRetry(() => import('./pages/ATSChecker'), 'ATSChecker');
const Preview = lazyWithRetry(() => import('./pages/Preview'), 'Preview');
const CareerDashboard = lazyWithRetry(() => import('./pages/CareerDashboard'), 'CareerDashboard');
const Privacy = lazyWithRetry(() => import('./pages/Privacy'), 'Privacy');
const NotFound = lazyWithRetry(() => import('./pages/NotFound'), 'NotFound');

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
            <Route path="/jobs" element={<CareerDashboard />} />
            <Route path="/career" element={<CareerDashboard />} />
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
