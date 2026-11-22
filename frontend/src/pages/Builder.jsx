import React, { useState, useRef } from 'react';
import {
  User, Briefcase, GraduationCap, FolderGit2, Wrench, Award, Palette,
  Sparkles, Download, Printer, FileJson, Upload, RefreshCw, ZoomIn, ZoomOut,
  Plus, Trash2, ChevronRight, Check, Eye, Loader2, ArrowRight
} from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { ResumeTemplate } from '../components/templates/ResumeTemplate';
import { TEMPLATES } from '../constants/templatesList';
import { pdfService } from '../services/pdfService';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';

export function Builder() {
  const {
    resumeData,
    setResumeData,
    updatePersonalInfo,
    updateSummary,
    setTemplateId,
    updatePreferences,
    addItemToSection,
    removeItemFromSection,
    updateItemInSection,
    loadSampleData,
    saveStatus
  } = useResume();

  const [activeTab, setActiveTab] = useState('personal');
  const [zoomScale, setZoomScale] = useState(1);
  const [mobileView, setMobileView] = useState('editor'); // 'editor' | 'preview'
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null); // { type: 'summary'|'bullet', options: [...] }
  const previewRef = useRef(null);
  const jsonInputRef = useRef(null);

  // Tabs list
  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'extras', label: 'Certifications', icon: Award },
    { id: 'design', label: 'Design & Templates', icon: Palette },
  ];

  // AI Summary Handler
  const handleGenerateSummary = async () => {
    setIsAiLoading(true);
    try {
      const skillsFlat = resumeData.skills.flatMap(c => c.items);
      const res = await aiService.generateSummary({
        role: resumeData.personalInfo.professionalTitle || "Software Professional",
        key_skills: skillsFlat.slice(0, 5),
        existing_summary: resumeData.professionalSummary
      });
      if (res.success && res.data) {
        setAiSuggestions({
          type: 'summary',
          options: res.data.summaries,
          headline: res.data.suggested_headline
        });
      }
    } catch (e) {
      console.error('AI summary generation error:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Bullet Improver Handler
  const handleImproveBullet = async (expId, bulletIndex, currentText) => {
    if (!currentText.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await aiService.improveBullet({
        bullet: currentText,
        role: resumeData.personalInfo.professionalTitle
      });
      if (res.success && res.data) {
        setAiSuggestions({
          type: 'bullet',
          expId,
          bulletIndex,
          options: res.data.options
        });
      }
    } catch (e) {
      console.error('AI bullet improvement error:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // PDF Export
  const handleDownloadPDF = async () => {
    if (previewRef.current) {
      const filename = `${(resumeData.personalInfo.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`;
      await pdfService.exportToPDF(previewRef.current, filename);
    }
  };

  // JSON Import/Export
  const handleExportJSON = () => {
    const filename = `${(resumeData.personalInfo.fullName || 'resume').toLowerCase().replace(/\s+/g, '_')}.json`;
    storageService.exportJSON(resumeData, filename);
  };

  const handleImportJSONClick = () => {
    if (jsonInputRef.current) jsonInputRef.current.click();
  };

  const handleJSONFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const parsed = await storageService.importJSON(file);
        setResumeData(parsed);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100">
      {/* Top Action Subheader */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-4 no-print sticky top-16 z-30 shadow-2xs">
        <div className="flex items-center gap-2">
          {/* Mobile switcher */}
          <div className="md:hidden flex rounded-lg bg-slate-100 p-0.5">
            <button
              onClick={() => setMobileView('editor')}
              className={`px-3 py-1 text-xs font-semibold rounded-md ${
                mobileView === 'editor' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setMobileView('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded-md ${
                mobileView === 'preview' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600'
              }`}
            >
              Live Preview
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Template:</span>
            <select
              value={resumeData.templateId || "ats-01"}
              onChange={(e) => setTemplateId(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right side download and storage toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadSampleData}
            title="Load standard sample data"
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <input
            type="file"
            ref={jsonInputRef}
            onChange={handleJSONFileSelected}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={handleImportJSONClick}
            title="Import Resume JSON"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>

          <button
            onClick={handleExportJSON}
            title="Export Resume JSON"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => pdfService.print()}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Editor Panels */}
        <div className={`w-full md:w-1/2 lg:w-5/12 bg-white border-r border-slate-200 flex flex-col ${
          mobileView === 'editor' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Tab navigation pills */}
          <div className="flex items-center gap-1 overflow-x-auto p-2 border-b border-slate-100 bg-slate-50 text-xs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-white text-brand-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Form Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* 1. PERSONAL INFO TAB */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900">Personal & Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.fullName || ''}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Professional Title</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.professionalTitle || ''}
                      onChange={(e) => updatePersonalInfo('professionalTitle', e.target.value)}
                      placeholder="e.g. Senior Full Stack Engineer"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      value={resumeData.personalInfo.email || ''}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Phone</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.phone || ''}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Location</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.location || ''}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                      placeholder="San Francisco, CA"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.linkedin || ''}
                      onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/alex"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">GitHub Profile</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.github || ''}
                      onChange={(e) => updatePersonalInfo('github', e.target.value)}
                      placeholder="https://github.com/alex"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Portfolio / Website</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.website || ''}
                      onChange={(e) => updatePersonalInfo('website', e.target.value)}
                      placeholder="https://alex.dev"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROFESSIONAL SUMMARY TAB */}
            {activeTab === 'summary' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-900">Professional Summary</h3>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isAiLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-semibold transition"
                  >
                    {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-brand-600" />}
                    <span>Enhance with AI</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={resumeData.professionalSummary || ''}
                  onChange={(e) => updateSummary(e.target.value)}
                  placeholder="Summarize your key qualifications, career achievements, and domain expertise..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 leading-relaxed font-sans"
                />

                {/* AI Suggestions Modal/Drawer if open */}
                {aiSuggestions?.type === 'summary' && (
                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-lg">
                    <div className="flex justify-between items-center text-xs font-semibold text-brand-400">
                      <span>AI Suggested Summaries</span>
                      <button onClick={() => setAiSuggestions(null)} className="text-slate-400 hover:text-white">✕</button>
                    </div>
                    <div className="space-y-2 text-xs">
                      {aiSuggestions.options.map((opt, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 flex flex-col gap-2">
                          <p className="text-slate-200 leading-relaxed">{opt}</p>
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                updateSummary(opt);
                                setAiSuggestions(null);
                              }}
                              className="px-2.5 py-1 rounded bg-brand-600 text-white font-semibold text-[11px] hover:bg-brand-500"
                            >
                              Apply Suggestion
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. WORK EXPERIENCE TAB */}
            {activeTab === 'experience' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-900">Work Experience ({resumeData.experience.length})</h3>
                  <button
                    onClick={() => addItemToSection('experience', {
                      company: 'Company Name',
                      position: 'Role Title',
                      employmentType: 'Full-time',
                      location: 'City, Country',
                      startDate: '',
                      endDate: '',
                      current: false,
                      responsibilities: ['Engineered scalable features...']
                    })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Role</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {resumeData.experience.map((exp, idx) => (
                    <div key={exp.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">Position #{idx + 1}</span>
                        <button
                          onClick={() => removeItemFromSection('experience', exp.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateItemInSection('experience', exp.id, { company: e.target.value })}
                          placeholder="Company"
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                        />
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateItemInSection('experience', exp.id, { position: e.target.value })}
                          placeholder="Job Title"
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                        />
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => updateItemInSection('experience', exp.id, { startDate: e.target.value })}
                          placeholder="Start (YYYY-MM)"
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                        />
                        <input
                          type="text"
                          value={exp.current ? 'Present' : exp.endDate}
                          disabled={exp.current}
                          onChange={(e) => updateItemInSection('experience', exp.id, { endDate: e.target.value })}
                          placeholder="End (YYYY-MM)"
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md disabled:bg-slate-100"
                        />
                      </div>

                      {/* Bullets */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <label className="font-semibold text-slate-700 block text-[11px]">Key Responsibilities & Impact:</label>
                        {(exp.responsibilities || []).map((resp, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-1.5">
                            <input
                              type="text"
                              value={resp}
                              onChange={(e) => {
                                const newResp = [...exp.responsibilities];
                                newResp[rIdx] = e.target.value;
                                updateItemInSection('experience', exp.id, { responsibilities: newResp });
                              }}
                              className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs"
                            />
                            <button
                              onClick={() => handleImproveBullet(exp.id, rIdx, resp)}
                              title="Improve bullet with AI"
                              className="p-1.5 rounded bg-brand-50 text-brand-600 hover:bg-brand-100 shrink-0"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const newResp = exp.responsibilities.filter((_, i) => i !== rIdx);
                                updateItemInSection('experience', exp.id, { responsibilities: newResp });
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            const newResp = [...(exp.responsibilities || []), "Spearheaded key initiatives..."];
                            updateItemInSection('experience', exp.id, { responsibilities: newResp });
                          }}
                          className="text-[11px] font-semibold text-brand-600 hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          <Plus className="w-3 h-3" /> Add bullet point
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Bullet Improvement Modal */}
                {aiSuggestions?.type === 'bullet' && (
                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-lg">
                    <div className="flex justify-between items-center text-xs font-semibold text-brand-400">
                      <span>AI Enhanced STAR Variations</span>
                      <button onClick={() => setAiSuggestions(null)} className="text-slate-400 hover:text-white">✕</button>
                    </div>
                    <div className="space-y-2 text-xs">
                      {aiSuggestions.options.map((opt, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 flex flex-col gap-1.5">
                          <p className="text-slate-200 leading-relaxed">{opt.text}</p>
                          <p className="text-[10px] text-brand-300 italic">{opt.rationale}</p>
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                const targetExp = resumeData.experience.find(e => e.id === aiSuggestions.expId);
                                if (targetExp) {
                                  const newResp = [...targetExp.responsibilities];
                                  newResp[aiSuggestions.bulletIndex] = opt.text;
                                  updateItemInSection('experience', targetExp.id, { responsibilities: newResp });
                                }
                                setAiSuggestions(null);
                              }}
                              className="px-2.5 py-1 rounded bg-brand-600 text-white font-semibold text-[11px] hover:bg-brand-500"
                            >
                              Apply Bullet
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. EDUCATION TAB */}
            {activeTab === 'education' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-900">Education & Academics</h3>
                  <button
                    onClick={() => addItemToSection('education', {
                      institution: 'University / College',
                      degree: 'Bachelor of Science',
                      fieldOfStudy: 'Computer Science',
                      startDate: '',
                      endDate: '',
                      cgpa: '',
                      description: ''
                    })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Education</span>
                  </button>
                </div>

                {resumeData.education.map((edu, idx) => (
                  <div key={edu.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Degree #{idx + 1}</span>
                      <button onClick={() => removeItemFromSection('education', edu.id)} className="text-slate-400 hover:text-rose-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateItemInSection('education', edu.id, { institution: e.target.value })}
                        placeholder="Institution"
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateItemInSection('education', edu.id, { degree: e.target.value })}
                        placeholder="Degree"
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                      />
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => updateItemInSection('education', edu.id, { fieldOfStudy: e.target.value })}
                        placeholder="Field of Study"
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                      />
                      <input
                        type="text"
                        value={edu.cgpa}
                        onChange={(e) => updateItemInSection('education', edu.id, { cgpa: e.target.value })}
                        placeholder="GPA (e.g. 3.8 / 4.0)"
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. PROJECTS TAB */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-900">Key Projects</h3>
                  <button
                    onClick={() => addItemToSection('projects', {
                      name: 'New Project',
                      description: 'Overview of architecture and impact...',
                      technologies: ['React', 'Python'],
                      liveUrl: '',
                      githubUrl: ''
                    })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                {resumeData.projects.map((proj, idx) => (
                  <div key={proj.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Project #{idx + 1}</span>
                      <button onClick={() => removeItemFromSection('projects', proj.id)} className="text-slate-400 hover:text-rose-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => updateItemInSection('projects', proj.id, { name: e.target.value })}
                        placeholder="Project Name"
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                      />
                      <input
                        type="text"
                        value={proj.technologies?.join(', ') || ''}
                        onChange={(e) => updateItemInSection('projects', proj.id, { technologies: e.target.value.split(',').map(s => s.trim()) })}
                        placeholder="Technologies (comma separated)"
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => updateItemInSection('projects', proj.id, { description: e.target.value })}
                      placeholder="Project Description"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 6. SKILLS TAB */}
            {activeTab === 'skills' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900">Categorized Skills</h3>
                {resumeData.skills.map((cat, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <span className="font-bold text-slate-800">{cat.category}</span>
                    <input
                      type="text"
                      value={cat.items?.join(', ') || ''}
                      onChange={(e) => {
                        const newSkills = [...resumeData.skills];
                        newSkills[idx] = {
                          ...cat,
                          items: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        };
                        setResumeData(prev => ({ ...prev, skills: newSkills }));
                      }}
                      placeholder="e.g. Python, React, Docker (comma separated)"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 7. CERTIFICATIONS & EXTRAS */}
            {activeTab === 'extras' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-900">Certifications</h3>
                  <button
                    onClick={() => addItemToSection('certifications', {
                      name: 'Certification Name',
                      issuer: 'Certifying Authority',
                      issueDate: ''
                    })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                {resumeData.certifications.map((cert, idx) => (
                  <div key={cert.id || idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2 text-xs">
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateItemInSection('certifications', cert.id, { name: e.target.value })}
                      placeholder="Certificate Name"
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                    />
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => updateItemInSection('certifications', cert.id, { issuer: e.target.value })}
                      placeholder="Issuer"
                      className="w-36 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                    />
                    <button onClick={() => removeItemFromSection('certifications', cert.id)} className="text-slate-400 hover:text-rose-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 8. DESIGN & TEMPLATES */}
            {activeTab === 'design' && (
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-sm text-slate-900">Design Customizations</h3>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Theme Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={resumeData.preferences.themeColor || '#0284c7'}
                      onChange={(e) => updatePreferences('themeColor', e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer border border-slate-300"
                    />
                    <span className="font-mono text-slate-600 uppercase">{resumeData.preferences.themeColor}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <label className="block text-slate-700 font-semibold mb-2">Switch Active Template (All 50+)</label>
                  <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTemplateId(t.id)}
                        className={`p-2.5 rounded-lg border text-left transition ${
                          resumeData.templateId === t.id
                            ? 'border-brand-600 bg-brand-50/50 text-brand-900 font-semibold'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-[11px] font-bold truncate">{t.name}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{t.category}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live A4 Resume Preview */}
        <div className={`w-full md:w-1/2 lg:w-7/12 flex-1 bg-slate-200/70 p-4 sm:p-8 overflow-auto flex justify-center items-start ${
          mobileView === 'preview' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* A4 Container Page */}
          <div
            ref={previewRef}
            id="printable-resume"
            className="resume-a4-page bg-white shadow-xl transition-transform origin-top text-slate-900"
            style={{
              width: '210mm',
              minHeight: '297mm',
              padding: '18mm',
              boxSizing: 'border-box',
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center'
            }}
          >
            <ResumeTemplate
              templateId={resumeData.templateId || "ats-01"}
              resumeData={resumeData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
