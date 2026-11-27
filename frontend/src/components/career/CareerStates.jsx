import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Compass, FileUp, Loader2, RefreshCw } from 'lucide-react';

export function CareerLoadingState() {
  return (
    <div className="rounded-3xl border-2 border-ink bg-white p-10 shadow-brutal text-center space-y-3">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-ink" />
      <h3 className="text-lg font-extrabold text-ink">Analyzing Your Resume Profile...</h3>
      <p className="text-xs text-ink-muted max-w-md mx-auto">
        Generating personalized career paths, estimated role matches, and targeted job-search links without storing your resume on any server.
      </p>
    </div>
  );
}

export function CareerErrorState({ message, onRetry }) {
  return (
    <div className="rounded-3xl border-2 border-rose-400 bg-rose-50 p-8 text-center space-y-4">
      <AlertTriangle className="w-8 h-8 mx-auto text-rose-600" />
      <div className="space-y-1">
        <h3 className="text-lg font-extrabold text-rose-900">Unable to Generate Recommendations</h3>
        <p className="text-xs text-rose-800 max-w-lg mx-auto">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-volt py-2 px-5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}

export function CareerEmptyState({ hasResume, onFileUpload, uploading = false }) {
  return (
    <div className="rounded-3xl border-2 border-ink bg-white p-10 shadow-brutal text-center space-y-4">
      <Compass className="w-10 h-10 mx-auto text-brand-700" />
      <div className="space-y-1">
        <h3 className="text-xl font-extrabold text-ink">
          {hasResume ? 'No Matching Roles Found for Current Filters' : 'Upload Your Resume to Get AI Job Recommendations'}
        </h3>
        <p className="text-xs text-ink-muted max-w-md mx-auto">
          {hasResume
            ? 'Try lowering the minimum match slider or resetting your category, experience, or skill filters.'
            : 'Upload your PDF, DOCX, TXT, or RTF resume below. We extract your skills, projects, education, and experience locally and generate personalized job matches and search links.'}
        </p>
      </div>
      {!hasResume && (
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {onFileUpload ? (
            <label className="btn-volt py-2.5 px-6 text-xs font-bold inline-flex items-center gap-2 cursor-pointer">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
              <span>{uploading ? 'Extracting & Analyzing Resume...' : 'Upload Resume (PDF / DOCX / TXT)'}</span>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.rtf,.png,.jpg,.jpeg"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileUpload(file);
                  e.target.value = '';
                }}
              />
            </label>
          ) : (
            <Link to="/upload" className="btn-volt py-2.5 px-5 text-xs font-bold inline-flex items-center gap-2">
              <FileUp className="w-4 h-4" />
              <span>Upload Resume</span>
            </Link>
          )}
          <Link to="/builder" className="btn-secondary py-2.5 px-5 text-xs font-bold">
            Open Resume Builder
          </Link>
        </div>
      )}
    </div>
  );
}
