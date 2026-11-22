# IMPLEMENTATION PLAN: AI RESUME BUILDER (TEMPLATE-FIRST & JOB-TARGETED)

## Core Philosophy
**TEMPLATE FIRST → JOB DESCRIPTION SECOND → USER INFORMATION THIRD → AI OPTIMIZATION FOURTH → ATS AUDIT FIFTH → RESUME GENERATION SIXTH → PDF DOWNLOAD**

---

## Master Implementation Checklist

### Phase 1: Foundation & Audit
- [x] Comprehensive codebase inspection and audit (`docs/PROJECT_AUDIT.md`).
- [x] Verify existing FastAPI backend routes, PyMuPDF parser, Groq AI adapter, and Vite frontend.

### Phase 2: Wizard State & Data Architecture
- [ ] Define unified `WizardState` schema in `ResumeContext` and `Dexie.js`:
  - `selectedTemplateId`: string
  - `selectedJob`: { role: string, company: string, location: string, description: string, isSkipped: boolean }
  - `jobAnalysis`: { technicalSkills: [], preferredSkills: [], softSkills: [], responsibilities: [], keywords: [] }
  - `creationMethod`: 'scratch' | 'upload'
  - `resumeData`: full normalized ResumeData
  - `optimizationResults`: { tailoredSummary: string, bulletSuggestions: [], skillRecommendations: [] }
  - `currentStep`: number (1 through 7)
- [ ] Implement automatic IndexedDB auto-save and restoration of unfinished wizard progress across browser refreshes.

### Phase 3: Template Catalog & Engine Enhancements
- [ ] Expand templates list to 50+ templates across all 10 requested categories:
  - 1. ATS-Friendly (10)
  - 2. Modern Professional (10)
  - 3. Minimalist (10)
  - 4. Student & Fresher (5)
  - 5. Software Developer (5)
  - 6. Data Analyst & Data Scientist (5)
  - 7. AI/ML Engineer (5)
  - 8. Executive (5)
  - 9. Creative & Designer (5)
  - 10. Business Professional (5)
- [ ] Implement Data Analyst/Scientist and AI/ML template layouts in `SpecializedTemplates.jsx`.

### Phase 4: Page 1 — Landing Page Optimization
- [ ] Update Hero headline to: *"Build Your Career-Ready Resume with AI"*
- [ ] Update Description: *"Choose a professional template, select your dream job, and let AI help you create a tailored resume that highlights your real skills and experience."*
- [ ] Primary CTA: *"Create My Resume"* (immediately opens Wizard Step 1: Template Selection)
- [ ] Secondary CTA: *"Explore Templates"*
- [ ] Keep how it works, features, privacy guarantees, and FAQ.

### Phase 5: Page 2 — Template Selection (Wizard Step 1)
- [ ] Template selection as the first mandatory step before user or job info.
- [ ] Grid of 50+ visual cards with actual miniature layout preview, category badges, and layout tags.
- [ ] Category tabs, search input, and popular/featured filters.
- [ ] Clicking "Select Template" confirms selection and navigates immediately to Step 2 (Target Job).

### Phase 6: Page 3 & 4 — Target Job Selection & Analysis (Wizard Step 2 & 2b)
- [ ] Option A: Curated selectable role chips (16 roles: Software Engineer, Frontend, Backend, Full Stack, Python, Data Analyst, Data Scientist, ML Engineer, AI Engineer, GenAI, Business Analyst, Cloud, DevOps, UI/UX, Product Manager, Other).
- [ ] Option B: Paste Job Description text area with optional company, title, location, URL.
- [ ] "Skip job targeting" option for general resumes.
- [ ] If JD provided: Step 2b triggers `/api/v1/jobs/analyze` and displays extracted technical skills, preferred skills, soft skills, and responsibilities with editing ability.

### Phase 7: Page 5 — Creation Method (Wizard Step 3)
- [ ] Option A: "Create Resume From Scratch" (initializes guided blank or sample form).
- [ ] Option B: "Upload Existing Resume" (drag & drop PDF/DOCX via PyMuPDF backend extractor, pre-populates form, shows extraction notices).

### Phase 8: Guided Resume Information Form (Wizard Step 4)
- [ ] 10-step progressive guided form with progress bar and back/continue navigation:
  - Step 1: Personal Information
  - Step 2: Professional Summary (AI summary generator calibrated to target job)
  - Step 3: Education (multiple entries, degrees, GPA)
  - Step 4: Work Experience (multiple entries, AI bullet improver per bullet)
  - Step 5: Internships
  - Step 6: Projects (technologies, links, AI project improver)
  - Step 7: Skills (Categorized, highlights target job skill matches)
  - Step 8: Certifications
  - Step 9: Additional Information (Achievements, Languages, Publications, Volunteer, Custom)
  - Step 10: Review & Summary of all entered data
- [ ] Auto-save on every keystroke in IndexedDB.

### Phase 9: Page 6 — AI Resume Optimization (Wizard Step 5)
- [ ] Backend `/api/v1/resume/tailor` & `/api/v1/ai/optimize-resume`.
- [ ] Aligns user's real qualifications with target job keywords.
- [ ] Side-by-side Before/After diffs for summary and experience bullets.
- [ ] Individual Accept, Reject, Edit, and Restore controls.
- [ ] Zero fabrication rule: explains missing skill gaps instead of inventing fake qualifications.

### Phase 10: Page 7 — ATS-Oriented Analysis (Wizard Step 6)
- [ ] Evaluates tailored resume against target job description.
- [ ] Compatibility score gauge, readability score, keyword match rate, section-by-section audit.
- [ ] Actionable improvement checklist.

### Phase 11: Page 8 & 9 — Final Resume Generation & Live Preview (Wizard Step 7)
- [ ] Renders the resume inside the template selected in Step 1.
- [ ] Target job badge and connection preserved.
- [ ] Live A4 view with zoom, template switching without data loss, print CSS.
- [ ] High-resolution PDF export, print, JSON export, and local draft manager.

### Phase 12: End-to-End Verification & Production Readiness
- [ ] Run backend tests and verify all API endpoints.
- [ ] Run frontend production build (`npm run build`).
- [ ] Test the full user journey: Landing → Template → Job → Info → AI Optimize → ATS Audit → Live Preview → PDF.
