import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
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
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Smart Ingestion</span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Upload & Extract Existing Resume</h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Upload your existing PDF or Word (.docx) resume. Our dual PyMuPDF and python-docx parser extracts contact info, experience, education, and skills.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-500 transition text-center space-y-4 shadow-2xs">
        <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div>
          <label className="cursor-pointer">
            <span className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition inline-block">
              Choose PDF or DOCX File
            </span>
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-slate-500 mt-2">Maximum file size: 10MB • No document is permanently stored</p>
        </div>

        {file && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-mono">
            <FileText className="w-4 h-4 text-brand-600" />
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow transition disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                <span>Extracting Sections & Content...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>Extract Resume Data</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Extraction Error</div>
            <div className="mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Parse Result Preview */}
      {parseResult && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Resume Extracted Successfully ({parseResult.filename})</span>
            </div>
            <button
              onClick={handleApplyToBuilder}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow transition"
            >
              <span>Load into Resume Builder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Warnings if any */}
          {parseResult.warnings && parseResult.warnings.length > 0 && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Extraction Notices</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-amber-800">
                {parseResult.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Overview of extracted entities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-800">Candidate Information</div>
              <div className="text-slate-600">Name: <span className="font-medium text-slate-900">{parseResult.resume_data?.personalInfo?.fullName || 'Not found'}</span></div>
              <div className="text-slate-600">Email: <span className="font-medium text-slate-900">{parseResult.resume_data?.personalInfo?.email || 'Not found'}</span></div>
              <div className="text-slate-600">Phone: <span className="font-medium text-slate-900">{parseResult.resume_data?.personalInfo?.phone || 'Not found'}</span></div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-800">Sections Detected</div>
              <div className="text-slate-600">Experience entries: <span className="font-medium text-slate-900">{parseResult.resume_data?.experience?.length || 0}</span></div>
              <div className="text-slate-600">Education entries: <span className="font-medium text-slate-900">{parseResult.resume_data?.education?.length || 0}</span></div>
              <div className="text-slate-600">Project entries: <span className="font-medium text-slate-900">{parseResult.resume_data?.projects?.length || 0}</span></div>
              <div className="text-slate-600">Skills categorized: <span className="font-medium text-slate-900">{parseResult.resume_data?.skills?.length || 0}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
