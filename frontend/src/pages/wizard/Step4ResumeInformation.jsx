import React, { useState } from 'react';
import {
  User, Sparkles, GraduationCap, Briefcase, FolderGit2, Wrench, Award,
  CheckCircle2, ArrowRight, ArrowLeft, Plus, Trash2, Loader2, Eye
} from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { aiService } from '../../services/aiService';

const SUB_STEPS = [
  { id: 1, title: "Personal Details" },
  { id: 2, title: "Professional Summary" },
  { id: 3, title: "Education" },
  { id: 4, title: "Work Experience" },
  { id: 5, title: "Internships" },
  { id: 6, title: "Projects" },
  { id: 7, title: "Skills" },
  { id: 8, title: "Certifications" },
  { id: 9, title: "Additional Info" },
  { id: 10, title: "Review Information" },
];

export function Step4ResumeInformation({ onNext, onPrev }) {
  const {
    resumeData,
    updatePersonalInfo,
    updateSummary,
    updateSection,
    addItemToSection,
    removeItemFromSection,
    updateItemInSection,
    selectedJob
  } = useResume();

  const [currentSubStep, setCurrentSubStep] = useState(1);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [summaryOptions, setSummaryOptions] = useState([]);
  const [activeBulletModal, setActiveBulletModal] = useState(null); // { expId, bulletIdx, options }
  const [activeProjectModal, setActiveProjectModal] = useState(null); // { projId, options }

  // AI Summary Generator (calibrated to target job role!)
  const handleGenerateSummary = async () => {
    setIsAiLoading(true);
    try {
      const skillsFlat = resumeData.skills.flatMap(c => c.items);
      const res = await aiService.generateSummary({
        role: selectedJob?.role || resumeData.personalInfo.professionalTitle || "Professional",
        target_role: selectedJob?.role,
        key_skills: skillsFlat.slice(0, 5),
        existing_summary: resumeData.professionalSummary
      });
      if (res.success && res.data) {
        setSummaryOptions(res.data.summaries);
      }
    } catch (e) {
      console.error('AI summary error:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Bullet Enhancer
  const handleImproveBullet = async (expId, bulletIdx, bulletText) => {
    if (!bulletText.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await aiService.improveBullet({
        bullet: bulletText,
        role: selectedJob?.role || resumeData.personalInfo.professionalTitle,
        target_role: selectedJob?.role
      });
      if (res.success && res.data) {
        setActiveBulletModal({
          expId,
          bulletIdx,
          options: res.data.options
        });
      }
    } catch (e) {
      console.error('AI bullet error:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Project Improver
  const handleImproveProject = async (proj) => {
    if (!proj.description.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await aiService.improveProject({
        name: proj.name,
        description: proj.description,
        technologies: proj.technologies || [],
        target_role: selectedJob?.role
      });
      if (res.success && res.data) {
        setActiveProjectModal({
          projId: proj.id,
          data: res.data
        });
      }
    } catch (e) {
      console.error('AI project error:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600">
          Step 4 of 7 • Guided Information Form
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Enter Your Real Qualifications
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
          {selectedJob?.role ? `Calibrating for ${selectedJob.role}. ` : ''}
          Add your factual background. Our AI will highlight and format your achievements without manufacturing unverified claims.
        </p>
      </div>

      {/* 10-Sub-Step Horizontal Progress Tracker */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-[700px]">
          {SUB_STEPS.map((s) => {
            const isCompleted = currentSubStep > s.id;
            const isCurrent = currentSubStep === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentSubStep(s.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-xs ${
                  isCurrent
                    ? "bg-slate-900 text-white font-bold"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-800 font-semibold hover:bg-emerald-100"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <div className="text-[10px] font-mono">{s.id}. {s.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN FORM CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        {/* SUB-STEP 1: PERSONAL DETAILS */}
        {currentSubStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
              1. Personal Information & Contact Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.fullName || ''}
                  onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Professional Title</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.professionalTitle || selectedJob?.role || ''}
                  onChange={(e) => updatePersonalInfo('professionalTitle', e.target.value)}
                  placeholder="e.g. Senior Machine Learning Engineer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  value={resumeData.personalInfo.email || ''}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.phone || ''}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Location</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.location || ''}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">LinkedIn Profile</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.linkedin || ''}
                  onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/alex"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">GitHub Profile</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.github || ''}
                  onChange={(e) => updatePersonalInfo('github', e.target.value)}
                  placeholder="https://github.com/alex"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Portfolio / Website</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.website || ''}
                  onChange={(e) => updatePersonalInfo('website', e.target.value)}
                  placeholder="https://alex.dev"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUB-STEP 2: PROFESSIONAL SUMMARY */}
        {currentSubStep === 2 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">2. Professional Summary</h3>
              <button
                onClick={handleGenerateSummary}
                disabled={isAiLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-semibold transition cursor-pointer"
              >
                {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-brand-600" />}
                <span>AI Generate Target Summary</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={resumeData.professionalSummary || ''}
              onChange={(e) => updateSummary(e.target.value)}
              placeholder="A concise 3-4 sentence value statement highlighting your practical expertise..."
              className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white leading-relaxed"
            />

            {/* AI Summary Variations Modal/Box */}
            {summaryOptions.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-md text-xs">
                <div className="flex justify-between items-center font-bold text-brand-400">
                  <span>AI Suggestions for {selectedJob?.role || 'Your Role'}</span>
                  <button onClick={() => setSummaryOptions([])} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
                </div>
                <div className="space-y-2">
                  {summaryOptions.map((opt, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-800 border border-slate-700 space-y-2">
                      <p className="text-slate-200 leading-relaxed">{opt}</p>
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            updateSummary(opt);
                            setSummaryOptions([]);
                          }}
                          className="px-3 py-1 rounded bg-brand-600 text-white font-semibold text-[11px] hover:bg-brand-500 cursor-pointer"
                        >
                          Use This Summary
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB-STEP 3: EDUCATION */}
        {currentSubStep === 3 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">3. Education & Academic Background</h3>
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
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Degree
              </button>
            </div>

            {resumeData.education.map((edu, idx) => (
              <div key={edu.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Degree #{idx + 1}</span>
                  <button onClick={() => removeItemFromSection('education', edu.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateItemInSection('education', edu.id, { institution: e.target.value })}
                    placeholder="Institution / University"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                  />
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateItemInSection('education', edu.id, { degree: e.target.value })}
                    placeholder="Degree (e.g. Bachelor of Science)"
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
                    placeholder="GPA / CGPA (e.g. 3.8 / 4.0)"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUB-STEP 4: WORK EXPERIENCE */}
        {currentSubStep === 4 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">4. Work Experience ({resumeData.experience.length})</h3>
              <button
                onClick={() => addItemToSection('experience', {
                  company: 'Company Name',
                  position: 'Job Title',
                  location: 'Location',
                  startDate: '',
                  endDate: '',
                  current: false,
                  responsibilities: ['Engineered scalable solutions...']
                })}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Role
              </button>
            </div>

            {resumeData.experience.map((exp, idx) => (
              <div key={exp.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Role #{idx + 1}</span>
                  <button onClick={() => removeItemFromSection('experience', exp.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
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

                {/* Bullets with AI Enhancer */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="font-semibold text-slate-700 block text-[11px]">Bullet Points (STAR Method):</label>
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
                        title="AI Enhance Bullet"
                        className="p-1.5 rounded bg-brand-50 text-brand-600 hover:bg-brand-100 shrink-0 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const newResp = exp.responsibilities.filter((_, i) => i !== rIdx);
                          updateItemInSection('experience', exp.id, { responsibilities: newResp });
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer"
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
                    className="text-[11px] font-semibold text-brand-600 hover:underline inline-flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add bullet point
                  </button>
                </div>
              </div>
            ))}

            {/* Bullet Enhancer AI Drawer */}
            {activeBulletModal && (
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-lg text-xs">
                <div className="flex justify-between items-center font-bold text-brand-400">
                  <span>AI Enhanced STAR Variations</span>
                  <button onClick={() => setActiveBulletModal(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
                </div>
                <div className="space-y-2">
                  {activeBulletModal.options.map((opt, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 flex flex-col gap-1.5">
                      <p className="text-slate-200 leading-relaxed">{opt.text}</p>
                      <p className="text-[10px] text-brand-300 italic">{opt.rationale}</p>
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            const targetExp = resumeData.experience.find(e => e.id === activeBulletModal.expId);
                            if (targetExp) {
                              const newResp = [...targetExp.responsibilities];
                              newResp[activeBulletModal.bulletIdx] = opt.text;
                              updateItemInSection('experience', targetExp.id, { responsibilities: newResp });
                            }
                            setActiveBulletModal(null);
                          }}
                          className="px-2.5 py-1 rounded bg-brand-600 text-white font-semibold text-[11px] hover:bg-brand-500 cursor-pointer"
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

        {/* SUB-STEP 5: INTERNSHIPS */}
        {currentSubStep === 5 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">5. Internships</h3>
              <button
                onClick={() => addItemToSection('internships', {
                  organization: 'Organization',
                  role: 'Intern',
                  duration: '3 months',
                  responsibilities: ['Assisted in deployment workflows...'],
                  technologies: ['Git', 'Python']
                })}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Internship
              </button>
            </div>

            {resumeData.internships.map((int, idx) => (
              <div key={int.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Internship #{idx + 1}</span>
                  <button onClick={() => removeItemFromSection('internships', int.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={int.organization}
                    onChange={(e) => updateItemInSection('internships', int.id, { organization: e.target.value })}
                    placeholder="Organization"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                  />
                  <input
                    type="text"
                    value={int.role}
                    onChange={(e) => updateItemInSection('internships', int.id, { role: e.target.value })}
                    placeholder="Internship Role"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUB-STEP 6: PROJECTS */}
        {currentSubStep === 6 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">6. Technical & Academic Projects</h3>
              <button
                onClick={() => addItemToSection('projects', {
                  name: 'Project Name',
                  description: 'Architected a scalable system...',
                  technologies: ['React', 'FastAPI'],
                  githubUrl: '',
                  liveUrl: ''
                })}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {resumeData.projects.map((proj, idx) => (
              <div key={proj.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Project #{idx + 1}</span>
                  <button onClick={() => removeItemFromSection('projects', proj.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
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
                    placeholder="Technologies (comma-separated)"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                  />
                </div>
                <textarea
                  rows={2}
                  value={proj.description}
                  onChange={(e) => updateItemInSection('projects', proj.id, { description: e.target.value })}
                  placeholder="Overview of project impact and engineering challenges solved..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                />
              </div>
            ))}
          </div>
        )}

        {/* SUB-STEP 7: SKILLS */}
        {currentSubStep === 7 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
              7. Skills & Competencies (Categorized)
            </h3>
            {resumeData.skills.map((cat, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
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
                    updateSection('skills', newSkills);
                  }}
                  placeholder="e.g. Python, Docker, React, PostgreSQL (comma separated)"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                />
              </div>
            ))}
          </div>
        )}

        {/* SUB-STEP 8: CERTIFICATIONS */}
        {currentSubStep === 8 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">8. Certifications & Credentials</h3>
              <button
                onClick={() => addItemToSection('certifications', {
                  name: 'Certification Name',
                  issuer: 'Issuing Organization',
                  issueDate: ''
                })}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Credential
              </button>
            </div>
            {resumeData.certifications.map((cert, idx) => (
              <div key={cert.id || idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2 text-xs">
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateItemInSection('certifications', cert.id, { name: e.target.value })}
                  placeholder="Certification Name"
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                />
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => updateItemInSection('certifications', cert.id, { issuer: e.target.value })}
                  placeholder="Issuer"
                  className="w-36 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                />
                <button onClick={() => removeItemFromSection('certifications', cert.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* SUB-STEP 9: ADDITIONAL INFO */}
        {currentSubStep === 9 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
              9. Additional Information (Achievements & Languages)
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Key Honors & Awards</label>
                <textarea
                  rows={3}
                  value={resumeData.achievements?.map(a => a.title).join('\n') || ''}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(Boolean);
                    updateSection('achievements', lines.map((title, i) => ({ id: `ach-${i}`, title })));
                  }}
                  placeholder="List notable awards or competition rankings (one per line)..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Languages</label>
                <input
                  type="text"
                  value={resumeData.languages?.map(l => l.name).join(', ') || ''}
                  onChange={(e) => {
                    const langs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    updateSection('languages', langs.map(name => ({ name, proficiency: "Fluent" })));
                  }}
                  placeholder="e.g. English (Fluent), Spanish (Conversational)"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUB-STEP 10: REVIEW INFORMATION */}
        {currentSubStep === 10 && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm pb-2 border-b border-slate-100">
              <CheckCircle2 className="w-5 h-5" />
              <span>10. Information Review & Completeness Summary</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-800">Candidate Summary</div>
                <div>Name: <strong>{resumeData.personalInfo.fullName || 'Not provided'}</strong></div>
                <div>Role: <strong>{resumeData.personalInfo.professionalTitle || selectedJob?.role || 'General'}</strong></div>
                <div>Contact: {resumeData.personalInfo.email || 'No email'} • {resumeData.personalInfo.phone || 'No phone'}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-800">Sections Ready</div>
                <div>Work Experience entries: <strong>{resumeData.experience.length}</strong></div>
                <div>Education entries: <strong>{resumeData.education.length}</strong></div>
                <div>Projects documented: <strong>{resumeData.projects.length}</strong></div>
                <div>Skill categories: <strong>{resumeData.skills.length}</strong></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 space-y-1">
              <div className="font-bold">Next: AI Resume Optimization</div>
              <p className="text-[11px] leading-relaxed">
                The next step will align your entered qualifications with the requirements of <strong>{selectedJob?.role || 'your target role'}</strong> without manufacturing any false information.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => {
            if (currentSubStep > 1) {
              setCurrentSubStep(prev => prev - 1);
            } else if (onPrev) {
              onPrev();
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{currentSubStep === 1 ? "Back to Method" : "Previous Field"}</span>
        </button>

        <button
          onClick={() => {
            if (currentSubStep < 10) {
              setCurrentSubStep(prev => prev + 1);
            } else if (onNext) {
              onNext();
            }
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow transition active:scale-95 cursor-pointer"
        >
          <span>{currentSubStep === 10 ? "Continue to AI Optimization" : "Next Field"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
