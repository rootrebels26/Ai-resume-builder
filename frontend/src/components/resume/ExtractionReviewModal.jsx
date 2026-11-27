import React, { useState } from 'react';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, Briefcase, GraduationCap,
  Wrench, User, ChevronRight, Check, X, ArrowRight, Sparkles, Edit3
} from 'lucide-react';

export function ExtractionReviewModal({
  isOpen,
  onClose,
  onConfirm,
  parseResult
}) {
  if (!isOpen || !parseResult) return null;

  const {
    filename = 'Uploaded Resume',
    raw_text = '',
    resume_data: initialResumeData = {},
    validation = {},
    unmapped: topUnmapped = [],
    structured_warnings: topStructuredWarnings = [],
    confidence_score = 85,
    warnings = []
  } = parseResult;

  const [resumeData, setResumeData] = useState(initialResumeData);
  const [unmappedItems, setUnmappedItems] = useState(validation.unmapped || topUnmapped || []);
  const structuredWarnings = validation.structuredWarnings || topStructuredWarnings || [];
  const [activeTab, setActiveTab] = useState('overview');

  const handlePlaceUnmapped = (idx, targetSection) => {
    const item = unmappedItems[idx];
    if (!item || !item.raw_text) return;
    setResumeData(prev => {
      const next = { ...prev };
      if (targetSection === 'summary') {
        next.professionalSummary = prev.professionalSummary
          ? `${prev.professionalSummary}\n${item.raw_text}`
          : item.raw_text;
      } else if (targetSection === 'skills') {
        const existingSkills = [...(prev.skills || [])];
        existingSkills.push({ category: 'Imported', items: [item.raw_text] });
        next.skills = existingSkills;
      } else if (targetSection === 'custom') {
        const custom = [...(prev.customSections || [])];
        custom.push({
          id: `placed_${Date.now()}`,
          sectionTitle: 'Additional Details',
          items: [{ title: item.raw_text, subtitle: '', date: '', description: '' }]
        });
        next.customSections = custom;
      }
      return next;
    });
    setUnmappedItems(prev => prev.filter((_, i) => i !== idx));
  };

  const overallConfidence = validation.overallConfidence || confidence_score;
  const confidenceLevel = validation.confidenceLevel || (overallConfidence >= 80 ? 'High' : overallConfidence >= 55 ? 'Medium' : 'Low');

  const getConfidenceBadgeColor = () => {
    if (confidenceLevel === 'High') return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (confidenceLevel === 'Medium') return 'bg-amber-50 text-amber-700 border-amber-300';
    return 'bg-rose-50 text-rose-700 border-rose-300';
  };

  const handlePersonalInfoChange = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...(prev.personalInfo || {}),
        [field]: value
      }
    }));
  };

  const totalSkillsCount = (resumeData.skills || []).reduce(
    (acc, cat) => acc + (cat.items?.length || 0), 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-canvas border-2 border-ink rounded-3xl shadow-brutal w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-ink">
        
        {/* Header */}
        <div className="p-6 border-b border-ink/15 bg-white flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${getConfidenceBadgeColor()}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{overallConfidence}% Extraction Confidence ({confidenceLevel})</span>
              </span>
              <span className="text-xs text-ink-muted font-mono truncate max-w-[200px]">
                {filename}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              Your Resume Information Has Been Extracted
            </h2>
            <p className="text-xs text-ink-muted">
              Review your information before creating your resume.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-ink/20 hover:border-ink hover:bg-canvas flex items-center justify-center transition-colors text-ink-muted hover:text-ink"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notices & Warnings Banner */}
        {warnings && warnings.length > 0 && (
          <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Extraction notice:</span>
              <div className="text-[11px] text-amber-800">
                {warnings[0]}
                {warnings.length > 1 && ` (+${warnings.length - 1} more review points)`}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-ink/10 bg-canvas flex gap-2 overflow-x-auto text-xs font-bold font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-3 rounded-t-xl border-t border-x transition-colors ${
              activeTab === 'overview'
                ? 'bg-white border-ink/20 text-ink shadow-brutal-sm'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-2 px-3 rounded-t-xl border-t border-x transition-colors ${
              activeTab === 'personal'
                ? 'bg-white border-ink/20 text-ink shadow-brutal-sm'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Contact Info
          </button>
          <button
            onClick={() => setActiveTab('experience')}
            className={`py-2 px-3 rounded-t-xl border-t border-x transition-colors ${
              activeTab === 'experience'
                ? 'bg-white border-ink/20 text-ink shadow-brutal-sm'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Experience ({(resumeData.experience || []).length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-2 px-3 rounded-t-xl border-t border-x transition-colors ${
              activeTab === 'projects'
                ? 'bg-white border-ink/20 text-ink shadow-brutal-sm'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Projects ({(resumeData.projects || []).length})
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`py-2 px-3 rounded-t-xl border-t border-x transition-colors ${
              activeTab === 'education'
                ? 'bg-white border-ink/20 text-ink shadow-brutal-sm'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Education ({(resumeData.education || []).length})
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-2 px-3 rounded-t-xl border-t border-x transition-colors ${
              activeTab === 'skills'
                ? 'bg-white border-ink/20 text-ink shadow-brutal-sm'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Skills ({totalSkillsCount})
          </button>
          <button
            onClick={() => setActiveTab('certifications')}
            className={`py-2 px-3 rounded-t-xl border-t border-x transition-colors ${
              activeTab === 'certifications'
                ? 'bg-white border-ink/20 text-ink shadow-brutal-sm'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Certifications ({(resumeData.certifications || []).length})
          </button>
          <button
            onClick={() => setActiveTab('internships')}
            className={`py-2 px-3 rounded-t-xl border-t border-x transition-colors ${
              activeTab === 'internships'
                ? 'bg-white border-ink/20 text-ink shadow-brutal-sm'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Internships ({(resumeData.internships || []).length})
          </button>
          <button
            onClick={() => setActiveTab('customSections')}
            className={`py-2 px-3 rounded-t-xl border-t border-x transition-colors ${
              activeTab === 'customSections'
                ? 'bg-white border-ink/20 text-ink shadow-brutal-sm'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Custom Sections ({(resumeData.customSections || []).length})
          </button>
          {(unmappedItems.length > 0 || structuredWarnings.length > 0) && (
            <button
              onClick={() => setActiveTab('unmapped')}
              className={`py-2 px-3 rounded-t-xl border-t border-x transition-colors ${
                activeTab === 'unmapped'
                  ? 'bg-white border-ink/20 text-ink shadow-brutal-sm'
                  : 'border-transparent text-amber-700 hover:text-ink'
              }`}
            >
              Review Notices ({unmappedItems.length + structuredWarnings.length})
            </button>
          )}
          {raw_text && (
            <button
              onClick={() => setActiveTab('raw_text')}
              className={`py-2 px-3 rounded-t-xl border-t border-x transition-colors ${
                activeTab === 'raw_text'
                  ? 'bg-white border-ink/20 text-ink shadow-brutal-sm'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              Extracted Text
            </button>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-white">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-ink-muted uppercase">
                    <User className="w-3.5 h-3.5" />
                    <span>Candidate Profile</span>
                  </div>
                  <div className="text-base font-extrabold text-ink">
                    {resumeData.personalInfo?.fullName || 'Candidate Name'}
                  </div>
                  <div className="text-xs text-ink-secondary">
                    {resumeData.personalInfo?.professionalTitle || 'Software Professional'}
                  </div>
                  <div className="text-xs text-ink-muted pt-1 flex flex-wrap gap-2">
                    {resumeData.personalInfo?.email && (
                      <span className="px-2 py-0.5 rounded-md bg-white border border-ink/10">
                        {resumeData.personalInfo.email}
                      </span>
                    )}
                    {resumeData.personalInfo?.location && (
                      <span className="px-2 py-0.5 rounded-md bg-white border border-ink/10">
                        {resumeData.personalInfo.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-ink-muted uppercase">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Experience & Career</span>
                  </div>
                  <div className="text-base font-extrabold text-ink">
                    {(resumeData.experience || []).length} Position(s) Detected
                  </div>
                  <div className="text-xs text-ink-secondary truncate">
                    {resumeData.experience?.[0]
                      ? `${resumeData.experience[0].position} at ${resumeData.experience[0].company}`
                      : 'No previous employment records'}
                  </div>
                  <div className="text-xs text-ink-muted pt-1">
                    {(resumeData.education || []).length} Degree(s) • {totalSkillsCount} Skill(s) Categorized
                  </div>
                </div>
              </div>

              {/* Extraction Summary Counters */}
              <div className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-ink-muted uppercase">
                    Extraction Summary
                  </span>
                  <span className="text-[11px] font-mono text-ink-muted">
                    {resumeData.sourceDocument?.layoutType || 'standard'} • {resumeData.sourceDocument?.language || 'en'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                  {[
                    ['Pages', resumeData.sourceDocument?.pageCount || 1],
                    ['Sections', resumeData.extractionReport?.sectionCount || 0],
                    ['Employment', (resumeData.experience || []).length],
                    ['Internships', (resumeData.internships || []).length],
                    ['Education', (resumeData.education || []).length],
                    ['Projects', (resumeData.projects || []).length],
                    ['Certifications', (resumeData.certifications || []).length],
                    ['Skills', totalSkillsCount],
                    ['Custom', (resumeData.customSections || []).length],
                    ['Needs Review', resumeData.extractionReport?.fieldsRequiringReview || 0],
                  ].map(([label, val]) => (
                    <div key={label} className="p-2 rounded-xl bg-white border border-ink/10">
                      <div className="text-sm font-extrabold text-ink">{val}</div>
                      <div className="text-[10px] font-mono text-ink-muted uppercase">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {resumeData.professionalSummary && (
                <div className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-1.5">
                  <div className="text-xs font-mono font-bold text-ink-muted uppercase">
                    Professional Summary
                  </div>
                  <p className="text-xs leading-relaxed text-ink-secondary line-clamp-3">
                    {resumeData.professionalSummary}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
                <div className="text-xs font-mono font-bold text-ink-muted uppercase">
                  Top Detected Skills
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(resumeData.skills || []).flatMap(c => c.items || []).slice(0, 16).map((skill, sIdx) => (
                    <span key={sIdx} className="px-2 py-1 rounded-lg bg-white border border-ink/20 text-xs font-medium text-ink">
                      {skill}
                    </span>
                  ))}
                  {totalSkillsCount > 16 && (
                    <span className="px-2 py-1 rounded-lg bg-canvas text-xs font-bold text-ink-muted">
                      +{totalSkillsCount - 16} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONTACT INFO */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-ink mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo?.fullName || ''}
                    onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ink/30 focus:border-ink focus:outline-none"
                    placeholder="Candidate Name"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Email Address</label>
                  <input
                    type="email"
                    value={resumeData.personalInfo?.email || ''}
                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ink/30 focus:border-ink focus:outline-none"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo?.phone || ''}
                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ink/30 focus:border-ink focus:outline-none"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Location</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo?.location || ''}
                    onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ink/30 focus:border-ink focus:outline-none"
                    placeholder="City, State / Country"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-ink mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo?.professionalTitle || ''}
                    onChange={(e) => handlePersonalInfoChange('professionalTitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ink/30 focus:border-ink focus:outline-none"
                    placeholder="e.g. Senior Full Stack Engineer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: WORK EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              {(resumeData.experience || []).length === 0 ? (
                <div className="text-center py-8 text-xs text-ink-muted">
                  No work experience records identified.
                </div>
              ) : (
                (resumeData.experience || []).map((exp, idx) => (
                  <div key={exp.id || idx} className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-extrabold text-sm text-ink">{exp.position || 'Role'}</div>
                        <div className="text-xs text-ink-secondary">{exp.company || 'Company'} • {exp.location || 'Location'}</div>
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-ink/10 text-ink-muted">
                        {exp.startDate || 'Start'} – {exp.endDate || (exp.current ? 'Present' : 'End')}
                      </span>
                    </div>
                    {exp.responsibilities && exp.responsibilities.length > 0 && (
                      <ul className="text-xs text-ink-secondary list-disc pl-5 space-y-1">
                        {exp.responsibilities.slice(0, 3).map((r, rIdx) => (
                          <li key={rIdx} className="line-clamp-2">{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: EDUCATION */}
          {activeTab === 'education' && (
            <div className="space-y-4">
              {(resumeData.education || []).length === 0 ? (
                <div className="text-center py-8 text-xs text-ink-muted">
                  No education records identified.
                </div>
              ) : (
                (resumeData.education || []).map((edu, idx) => (
                  <div key={edu.id || idx} className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-1.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-extrabold text-sm text-ink">{edu.institution || 'Institution'}</div>
                        <div className="text-xs text-ink-secondary">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-ink/10 text-ink-muted">
                        {edu.startDate ? `${edu.startDate} – ` : ''}{edu.endDate || 'Graduation'}
                      </span>
                    </div>
                    {edu.cgpa && (
                      <div className="text-xs text-ink-muted">GPA / Grade: {edu.cgpa}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {(resumeData.projects || []).length === 0 ? (
                <div className="text-center py-8 text-xs text-ink-muted">
                  No projects identified in the document.
                </div>
              ) : (
                (resumeData.projects || []).map((proj, idx) => (
                  <div key={proj.id || idx} className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-extrabold text-sm text-ink">{proj.name || 'Project'}</div>
                        {(proj.githubUrl || proj.liveUrl) && (
                          <div className="text-[11px] text-editorial-violet font-mono flex items-center gap-2 mt-0.5">
                            {proj.githubUrl && <span>GitHub: {proj.githubUrl}</span>}
                            {proj.liveUrl && <span>Live: {proj.liveUrl}</span>}
                          </div>
                        )}
                      </div>
                      {(proj.startDate || proj.endDate) && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-ink/10 text-ink-muted">
                          {proj.startDate ? `${proj.startDate} – ` : ''}{proj.endDate || 'Present'}
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-xs text-ink-secondary leading-relaxed">{proj.description}</p>
                    )}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.technologies.map((t, tIdx) => (
                          <span key={tIdx} className="px-2 py-0.5 rounded-md bg-white border border-ink/20 text-[11px] font-mono text-ink">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {proj.highlights && proj.highlights.length > 0 && (
                      <ul className="text-xs text-ink-secondary list-disc pl-5 space-y-1 pt-1">
                        {proj.highlights.map((h, hIdx) => (
                          <li key={hIdx}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              {(resumeData.skills || []).map((cat, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
                  <div className="text-xs font-mono font-bold text-ink uppercase">
                    {cat.category || 'Skills'} ({cat.items?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(cat.items || []).map((item, iIdx) => (
                      <span key={iIdx} className="px-2 py-0.5 rounded-md bg-white border border-ink/20 text-xs text-ink">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: CERTIFICATIONS */}
          {activeTab === 'certifications' && (
            <div className="space-y-3">
              {(resumeData.certifications || []).length === 0 ? (
                <div className="text-xs text-ink-muted italic py-4 text-center">
                  No certifications detected in the document. You can add them anytime in the editor.
                </div>
              ) : (
                (resumeData.certifications || []).map((cert, idx) => {
                  const certName = typeof cert === 'string' ? cert : (cert.name || cert.title);
                  const issuer = typeof cert === 'object' ? cert.issuer : null;
                  const date = typeof cert === 'object' ? cert.date : null;
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-canvas border border-ink/15 flex items-baseline justify-between gap-2">
                      <div>
                        <span className="font-bold text-xs text-ink">{certName}</span>
                        {issuer && <span className="text-xs text-ink-muted ml-2">({issuer})</span>}
                      </div>
                      {date && <span className="text-[11px] font-mono text-ink-muted">{date}</span>}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB: INTERNSHIPS */}
          {activeTab === 'internships' && (
            <div className="space-y-4">
              {(resumeData.internships || []).length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-canvas border border-ink/15 text-xs text-ink-muted">
                  No separate internships detected. Any internship roles under Experience are shown in the Experience tab.
                </div>
              ) : (
                (resumeData.internships || []).map((intern, idx) => (
                  <div key={intern.id || idx} className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={intern.position || ''}
                        onChange={(e) => {
                          const next = [...(resumeData.internships || [])];
                          next[idx] = { ...next[idx], position: e.target.value };
                          setResumeData(prev => ({ ...prev, internships: next }));
                        }}
                        placeholder="Internship Role"
                        className="input-base text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={intern.company || ''}
                        onChange={(e) => {
                          const next = [...(resumeData.internships || [])];
                          next[idx] = { ...next[idx], company: e.target.value };
                          setResumeData(prev => ({ ...prev, internships: next }));
                        }}
                        placeholder="Organization"
                        className="input-base text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={intern.startDate || ''}
                        onChange={(e) => {
                          const next = [...(resumeData.internships || [])];
                          next[idx] = { ...next[idx], startDate: e.target.value };
                          setResumeData(prev => ({ ...prev, internships: next }));
                        }}
                        placeholder="Start Date"
                        className="input-base text-xs"
                      />
                      <input
                        type="text"
                        value={intern.endDate || ''}
                        onChange={(e) => {
                          const next = [...(resumeData.internships || [])];
                          next[idx] = { ...next[idx], endDate: e.target.value };
                          setResumeData(prev => ({ ...prev, internships: next }));
                        }}
                        placeholder="End Date"
                        className="input-base text-xs"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: CUSTOM SECTIONS */}
          {activeTab === 'customSections' && (
            <div className="space-y-4">
              {(resumeData.customSections || []).length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-canvas border border-ink/15 text-xs text-ink-muted">
                  No additional custom sections detected.
                </div>
              ) : (
                (resumeData.customSections || []).map((sec, sIdx) => (
                  <div key={sec.id || sIdx} className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={sec.sectionTitle || ''}
                        onChange={(e) => {
                          const next = [...(resumeData.customSections || [])];
                          next[sIdx] = { ...next[sIdx], sectionTitle: e.target.value };
                          setResumeData(prev => ({ ...prev, customSections: next }));
                        }}
                        className="input-base text-xs font-bold flex-1"
                      />
                      {sec.sourcePage && (
                        <span className="px-2 py-0.5 rounded bg-white border border-ink/10 text-[10px] font-mono text-ink-muted">
                          Page {sec.sourcePage}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {(sec.items || []).map((it, iIdx) => (
                        <div key={iIdx} className="p-2.5 rounded-xl bg-white border border-ink/10 space-y-1.5">
                          <input
                            type="text"
                            value={it.title || ''}
                            onChange={(e) => {
                              const next = [...(resumeData.customSections || [])];
                              const items = [...(next[sIdx].items || [])];
                              items[iIdx] = { ...items[iIdx], title: e.target.value };
                              next[sIdx] = { ...next[sIdx], items };
                              setResumeData(prev => ({ ...prev, customSections: next }));
                            }}
                            placeholder="Title"
                            className="input-base text-xs w-full font-semibold"
                          />
                          {it.description && (
                            <textarea
                              rows={2}
                              value={it.description || ''}
                              onChange={(e) => {
                                const next = [...(resumeData.customSections || [])];
                                const items = [...(next[sIdx].items || [])];
                                items[iIdx] = { ...items[iIdx], description: e.target.value };
                                next[sIdx] = { ...next[sIdx], items };
                                setResumeData(prev => ({ ...prev, customSections: next }));
                              }}
                              className="input-base text-xs w-full"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: UNMAPPED ITEMS & STRUCTURED WARNINGS (STAGE 5) */}
          {activeTab === 'unmapped' && (
            <div className="space-y-4">
              {structuredWarnings.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-ink uppercase">Validation Warnings</div>
                  {structuredWarnings.map((w, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-start gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-mono font-bold text-[10px] shrink-0">
                        {w.code || 'NOTICE'}
                      </span>
                      <span className="text-amber-900">{w.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {unmappedItems.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-ink uppercase">
                    Unmapped Lines — Place Into Resume
                  </div>
                  {unmappedItems.map((um, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-canvas border border-ink/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-ink">{um.raw_text}</div>
                        <div className="text-[11px] text-ink-muted font-mono">
                          Reason: {um.reason} {um.page ? `• Page ${um.page}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handlePlaceUnmapped(idx, 'summary')}
                          className="px-2.5 py-1 rounded-lg bg-white border border-ink/25 hover:border-ink font-bold"
                        >
                          + Summary
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePlaceUnmapped(idx, 'skills')}
                          className="px-2.5 py-1 rounded-lg bg-white border border-ink/25 hover:border-ink font-bold"
                        >
                          + Skills
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePlaceUnmapped(idx, 'custom')}
                          className="px-2.5 py-1 rounded-lg bg-volt border border-ink font-bold"
                        >
                          + Custom
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: FULL EXTRACTED TEXT (STAGE 1) */}
          {activeTab === 'raw_text' && raw_text && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-ink-muted">
                  Full text extracted from <strong className="text-ink">{filename}</strong> before AI structuring ({raw_text.length.toLocaleString()} characters):
                </p>
              </div>
              <pre className="p-4 rounded-2xl bg-canvas border border-ink/15 text-[11px] font-mono text-ink whitespace-pre-wrap leading-relaxed max-h-[420px] overflow-y-auto">
                {raw_text}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-ink/15 bg-canvas flex items-center justify-between">
          <button
            onClick={onClose}
            className="btn-secondary py-2.5 px-5 text-xs shadow-brutal-sm"
          >
            Upload Different Document
          </button>

          <button
            onClick={() => onConfirm(resumeData)}
            className="btn-volt py-2.5 px-6 text-xs sm:text-sm shadow-brutal flex items-center gap-2 group"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply to Resume & Launch Editor</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}
