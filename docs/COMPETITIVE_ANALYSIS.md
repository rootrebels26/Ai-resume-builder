# COMPETITIVE ANALYSIS & PRODUCT RESEARCH
## Benchmark: Enhancv (https://app.enhancv.com/) vs. Our Original Platform
*Autonomous Senior Product Engineering Team Analysis*

---

## 1. Executive Summary

This research analyzes publicly accessible workflows, information architecture, visual patterns, and feature flows of **Enhancv** (`https://app.enhancv.com/`, `https://enhancv.com/features/`, `https://enhancv.com/resume-templates/`, `https://enhancv.com/resources/resume-checker/`) to benchmark our independent, privacy-first, template-first AI Resume Builder.

Our mission is **not to clone** Enhancv, but to adopt its strongest usability strengths (instant live feedback, side-by-side split canvas, role targeting, and action-oriented AI writing) while addressing its core user friction points (mandatory account wall, hidden paywalls, cookie tracking, and opaque ATS scoring).

---

## 2. Competitive Comparison Matrix

| Feature Dimension | Enhancv Public Experience | Our Original Platform |
| :--- | :--- | :--- |
| **User Entry Point** | Account registration required (Google / LinkedIn / Email) before full export | **Zero-Registration & Database-Free**: Instant start via `/wizard` or `/onboarding#1` |
| **Workflow Order** | Onboarding questions → Form → Template | **Strict Template-First**: Template (1) → Target Job (2) → Method (3) → Info (4) → AI (5) → ATS (6) → Export (7) |
| **Data Storage & Privacy**| Central cloud database (PostgreSQL/Mongo) with server user accounts | **Local-First (Dexie.js / IndexedDB)**: Resumes never stored on our servers |
| **Live Editor UI** | Split-screen (Left Editor, Right Canvas) | **Enhancv-Style Split Canvas (`LiveResumeCanvas.jsx`)** with `[Split]`, `[Editor]`, `[A4]` view toggles |
| **Template Variety** | ~20–30 curated templates | **65+ Diverse Templates across 10 categories** (including dedicated Data Science & AI/ML) |
| **Template Previews** | Static card thumbnails | **Authentic A4 Document Drafts** with interactive zoomable quick preview modal |
| **ATS Scoring** | Proprietary algorithm (black box score) | **Transparent 27-Check ATS Engine** across 7 categorized dimensions with explicit rationale |
| **AI Integration** | Proprietary subscription AI credit model | **Pluggable Architecture**: Groq (`openai/gpt-oss-120b`), Gemini, OpenRouter, and Local Heuristic Fallback |
| **PDF Export** | Server-side render with watermark on free tier | **High-Fidelity Client-Side Print & Canvas Export**: Clean A4 PDF with 0 watermarks |

---

## 3. Publicly Observable Enhancv Capabilities

1. **Onboarding UX (`/onboarding#1`)**:
   - Step 1: Goal identification (Create from scratch, improve existing, or target specific job).
   - Step 2: Role title and seniority selection (Student, Entry, Mid, Senior, Executive).
   - Step 3: Curated template suggestions tailored to that specific seniority.
2. **Live Split-Screen Canvas**:
   - Real-time updates: As user types in left inputs, the right canvas transforms immediately.
   - Design controls bar: Top bar allows instant color palette swapping, template dropdown, and zoom presets.
3. **AI Writing Assistant**:
   - Context-aware bullet points starting with power verbs.
   - Targeted summary generation incorporating user-selected skills and job title.
4. **ATS Pre-Flight Checker**:
   - Evaluates bullet density, action verbs, contact information completeness, and keyword presence.

---

## 4. Key Opportunities for Our Original Product

1. **Frictionless Anonymity & Privacy**:
   - Enhancv forces users through sign-up modals and email verifications. Our application runs completely client-side in IndexedDB, giving users full privacy and immediate productivity.
2. **True Template-First Experience**:
   - Job seekers are visually driven. By letting users choose their design **first**, they immediately see the aesthetic container their career story will inhabit.
3. **Dedicated Data & AI/ML Templates**:
   - Mainstream builders ignore specialized technical domains. We created bespoke templates for **Data Analysts/Scientists** (with metrics strips for SQL/Python/Tableau) and **AI/GenAI Engineers** (with PyTorch/LLM tags, arXiv links, and latency metrics).
4. **Deterministic Heuristic Fallback**:
   - If an external AI provider runs out of rate limits or has downtime, our Local Heuristic Engine automatically takes over, guaranteeing users are never blocked.
5. **Transparent 27-Check ATS Engine**:
   - Instead of a mysterious single number, we provide explicit feedback across 7 transparent categories with actionable remediation advice.

---

## 5. Architectural & Design Decisions

1. **JavaScript + JSX Only**:
   - Clean, lightweight React 18+ component architecture without TypeScript overhead.
2. **Dexie.js v2 IndexedDB Workspace**:
   - `WizardState` auto-saves with a debounced 500ms pipeline to both `localStorage` and `IndexedDB`.
3. **Scaled Bounds Canvas (`LiveResumeCanvas.jsx`)**:
   - Resolves the classic CSS transform scroll clipping bug by bounding the A4 document (`210mm × 297mm`) inside calculated dimensional wrappers (`width: 210 * zoom mm`).
4. **FastAPI Modular Microservice**:
   - Standalone `/api/v1` routes with strict Pydantic schemas, PyMuPDF extraction, and stateless execution.
