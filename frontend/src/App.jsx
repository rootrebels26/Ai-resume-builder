import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Home } from './pages/Home';
import { ResumeWizard } from './pages/ResumeWizard';
import { Onboarding } from './pages/Onboarding';
import { Templates } from './pages/Templates';
import { Builder } from './pages/Builder';
import { UploadResume } from './pages/UploadResume';
import { JobAnalyzer } from './pages/JobAnalyzer';
import { ATSChecker } from './pages/ATSChecker';
import { Preview } from './pages/Preview';
import { Privacy } from './pages/Privacy';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/wizard" element={<ResumeWizard />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/builder" element={<ResumeWizard />} />
        <Route path="/upload" element={<UploadResume />} />
        <Route path="/job-analyzer" element={<JobAnalyzer />} />
        <Route path="/ats-checker" element={<ATSChecker />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}
