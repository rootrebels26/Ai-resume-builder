import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud, FileText, CheckCircle2, AlertTriangle, ArrowRight,
  Loader2, Sparkles, Check, ShieldCheck
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { useResume } from '../context/ResumeContext';

export function UploadResume() {
  const navigate = useNavigate();
  const { setResumeData } = useResume();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setParseResult(null);
    }
  };

  const handleUploadAndParse = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const response = await resumeService.parseResumeFile(file);
      if (response.success && response.data) {
        setParseResult(response.data);
      } else {
        setError(response.message || 'Failed to parse resume document.');
      }
    } catch (err) {
      console.error('Upload parse error:', err);
      setError(err.message || 'An error occurred while uploading and parsing your resume.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyToBuilder = () => {
    if (parseResult?.resume_data) {
      setResumeData(parseResult.resume_data);
      navigate('/builder');
    }
  };

  return (
    <div className="flex-1 bg-canvas min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="eyebrow-tag justify-center">
            <span className="w-2 h-2 rounded-full bg-volt border border-ink" />
            <span>DOCUMENT INGESTION • CLIENT-SIDE PRIVACY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
            Upload & Extract Resume.{' '}
            <span className="editorial-italic text-[1.12em]">Instant parsing.</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            Upload your existing PDF or Word (.docx) resume. Our dual PyMuPDF and python-docx parser extracts contact info, experience, education, and skills.
          </p>
        </div>

        {/* Upload Dropzone */}
        <div className="card-surface p-8 sm:p-12 border-2 border-dashed border-ink hover:bg-white transition-all text-center space-y-5 bg-white">
          <div className="w-16 h-16 rounded-full bg-volt border border-ink flex items-center justify-center mx-auto shadow-brutal-sm">
            <UploadCloud className="w-8 h-8 text-ink" />
          </div>

          <div className="space-y-2">
            <label className="cursor-pointer inline-block">
              <span className="btn-primary py-3 px-8 text-xs sm:text-sm shadow-brutal group">
                <span>Choose PDF or DOCX File</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-ink-muted">
              Maximum file size: 10MB • Your document is processed in-memory and never stored on disk
            </p>
          </div>

          {file && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-canvas text-ink text-xs font-mono font-bold border border-ink shadow-brutal-sm">
              <FileText className="w-4 h-4 text-editorial-violet" />
              <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>

        {/* Upload Action */}
        {file && !parseResult && (
          <div className="flex justify-center">
            <button
              onClick={handleUploadAndParse}
              disabled={isUploading}
              className="btn-volt py-3 px-8 text-xs sm:text-sm shadow-brutal"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Sections & Content...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extract Resume Data</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border-[1.5px] border-rose-400 text-rose-800 text-xs flex items-start gap-2.5 shadow-brutal-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Extraction Error</div>
              <div className="mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* Parsed Output Review */}
        {parseResult && (
          <div className="card-surface p-6 sm:p-8 space-y-6 bg-white">
            <div className="flex items-center justify-between pb-4 border-b border-ink/10">
              <div className="space-y-1">
                <span className="badge-volt">
                  Parsing Completed
                </span>
                <h3 className="text-lg font-extrabold text-ink mt-1">
                  Extracted {parseResult.resume_data?.personalInfo?.fullName || 'Candidate'} Qualifications
                </h3>
              </div>
              <button
                onClick={handleApplyToBuilder}
                className="btn-volt py-2.5 px-5 text-xs shadow-brutal-sm"
              >
                <span>Open in Resume Editor</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-canvas border border-ink/20 space-y-1">
                <div className="text-ink-muted font-mono font-bold uppercase text-[10px]">Contact Info</div>
                <div className="font-extrabold text-ink">
                  {parseResult.resume_data?.personalInfo?.fullName || 'Extracted'}
                </div>
                <div className="text-ink-muted truncate">{parseResult.resume_data?.personalInfo?.email}</div>
              </div>
              <div className="p-4 rounded-2xl bg-canvas border border-ink/20 space-y-1">
                <div className="text-ink-muted font-mono font-bold uppercase text-[10px]">Work Experience</div>
                <div className="font-extrabold text-ink">
                  {(parseResult.resume_data?.experience || []).length} Roles Identified
                </div>
                <div className="text-ink-muted truncate">
                  {parseResult.resume_data?.experience?.[0]?.company || 'History extracted'}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-canvas border border-ink/20 space-y-1">
                <div className="text-ink-muted font-mono font-bold uppercase text-[10px]">Skills & Tech</div>
                <div className="font-extrabold text-ink">
                  {(parseResult.resume_data?.skills || []).reduce((acc, c) => acc + (c.items?.length || 0), 0)} Keywords
                </div>
                <div className="text-ink-muted truncate">Parsed & Categorized</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
