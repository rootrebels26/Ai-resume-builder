import React, { useState } from 'react';
import { FileText, UploadCloud, Sparkles, ArrowRight, ArrowLeft, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { resumeService } from '../../services/resumeService';

export function Step3CreationMethod({ onNext, onPrev }) {
  const { setCreationMethod, setResumeData, resumeData } = useResume();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleSelectScratch = () => {
    setCreationMethod('scratch');
    if (onNext) onNext();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError(null);
      setParseResult(null);
    }
  };

  const handleUploadAndParse = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await resumeService.parseResumeFile(file);
      if (res.success && res.data) {
        setParseResult(res.data);
        if (res.data.resume_data) {
          // Pre-populate resumeData while preserving selected templateId
          setResumeData(prev => ({
            ...res.data.resume_data,
            templateId: prev.templateId || 'ats-01'
          }));
        }
      } else {
        setUploadError(res.message || 'Failed to extract resume data.');
      }
    } catch (err) {
      console.error('File parsing error:', err);
      setUploadError(err.message || 'An error occurred while uploading and parsing your resume.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleContinueWithExtracted = () => {
    setCreationMethod('upload');
    if (onNext) onNext();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600">
          Step 3 of 7 • Creation Method
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          How Would You Like To Build Your Resume?
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
          Start from scratch using our guided multi-step form, or upload an existing PDF or DOCX file to automatically pre-fill your sections.
        </p>
      </div>

      {/* Dual Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OPTION A: FROM SCRATCH */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-brand-500 transition flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Option A: Create From Scratch</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Step-by-step guided form with live validation, built-in AI bullet enhancement, and role-calibrated summary generation.
              </p>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>10 structured progressive sub-steps</li>
              <li>AI STAR methodology bullet generator</li>
              <li>Auto-saved in browser IndexedDB</li>
            </ul>
          </div>

          <button
            onClick={handleSelectScratch}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow transition active:scale-95 cursor-pointer"
          >
            <span>Start From Scratch</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* OPTION B: UPLOAD EXISTING */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-brand-500 transition flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Option B: Upload Existing Resume</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Dual-engine PyMuPDF and python-docx text extractor parses contact, education, experience, and skills into your selected template.
              </p>
            </div>

            {/* Upload Dropzone */}
            <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center space-y-2">
              <label className="cursor-pointer block">
                <span className="px-3.5 py-1.5 rounded-lg bg-brand-50 text-brand-700 font-semibold text-xs hover:bg-brand-100 transition inline-block">
                  Select PDF / DOCX
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {file && (
                <div className="text-[11px] font-mono text-slate-700 truncate">
                  {file.name} ({(file.size / 1024).toFixed(0)} KB)
                </div>
              )}
            </div>

            {file && !parseResult && (
              <button
                onClick={handleUploadAndParse}
                disabled={isUploading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Structured Sections...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract & Parse Document</span>
                  </>
                )}
              </button>
            )}

            {uploadError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                {uploadError}
              </div>
            )}

            {parseResult && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Resume Extracted Successfully</span>
                </div>
                <div className="text-[11px] text-emerald-700">
                  {parseResult.resume_data?.personalInfo?.fullName || 'Candidate'} • {parseResult.resume_data?.experience?.length || 0} jobs • {parseResult.resume_data?.skills?.length || 0} skill categories
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleContinueWithExtracted}
            disabled={!parseResult}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <span>Continue with Extracted Data</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex justify-start pt-2">
        <button
          onClick={onPrev}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Target Job</span>
        </button>
      </div>
    </div>
  );
}
