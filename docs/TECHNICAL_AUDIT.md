# ResumeStudio — Comprehensive Technical Audit

**Document Version:** 2.0.0-PROD  
**Audit Date:** November 2026  
**Auditor:** Principal Full-Stack & Systems Architect  
**Architecture:** Vite + React 18 SPA (Frontend) & FastAPI + Python 3.11 (Backend)

---

## 1. System Architecture Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CLIENT BROWSER (Local-First SPA)                     │
│                                                                        │
│  React 18 + Vite 6 + TailwindCSS                                      │
│  ├── Dexie.js (IndexedDB local database: resumes, drafts, preferences) │
│  ├── ResumePaginator (A4 page height calibration & multi-sheet splits) │
│  ├── pdfService (html2canvas + jsPDF with dynamic link hotspot overlay)│
│  └── docxService (docx library: native Word XML document generation)   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ REST JSON (Stateless, no DB)
┌────────────────────────────────────▼───────────────────────────────────┐
│                       BACKEND API (FastAPI)                            │
│                                                                        │
│  Python 3.11 + FastAPI + Pydantic v2 + PyMuPDF                        │
│  ├── RateLimitMiddleware (Memory-efficient token window)               │
│  ├── SecurityHeadersMiddleware (HSTS, X-Frame, CSP, No-Sniff)         │
│  ├── CORSMiddleware (Configurable allow-origins from .env)             │
│  ├── Resume Parser (Deterministic PyMuPDF text & structure extractor)  │
│  ├── ATS Engine (27 algorithmic checks + blended scoring model)        │
│  └── AI Provider Gateway:                                              │
│      ├── Local Heuristic Provider (Deterministic zero-API fallback)    │
│      ├── Gemini Provider (asyncio.wait_for timeout protection)         │
│      ├── Groq Provider (Candidate model fallback chain)                │
│      └── OpenRouter Provider (Multi-model routing)                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Source Code Deep Audit

### 2.1 State Management & Storage (`Dexie.js`)
- **Database:** `ResumeStudioDB` in IndexedDB.
- **Tables:** `resumes` (active document), `drafts` (multi-resume management), `preferences` (user settings).
- **Audit Finding:**
  - Auto-save is debounced via local storage hook, preventing database thrashing during rapid keystrokes.
  - No remote sync means zero chance of network-induced state overwrite.
  - JSON backup import/export allows users to transfer drafts across devices without accounts.

### 2.2 Pagination & Canvas Calibration (`resumePaginator.js`)
- **Target Dimension:** Standard ISO A4 (210mm x 297mm).
- **Printable Height Threshold:** Calibrated to **890px** (at 96 DPI CSS scale) per sheet to guarantee that page boundaries never slice text or headings in half.
- **Mode Options:**
  - `auto`: Computes split points dynamically across sections.
  - `1_page`: Enforces tight single-page compression for early-career profiles.
  - `2_pages`: Explicitly creates a two-sheet split with continuation headers.

### 2.3 Export Engine Architecture
- **PDF Export (`pdfService.js`):**
  - Iterates through all discrete `.resume-a4-page` DOM elements.
  - Captures high-res canvas at scale 2 (300 DPI clarity).
  - Queries all `a[href]` tags on each sheet, computes bounding box coordinates relative to the page in millimeters, and calls `pdf.link(x, y, w, h, { url })` to overlay active hyperlink annotations.
- **DOCX Export (`docxService.js`):**
  - Generates authentic Microsoft Word document using `docx` npm library.
  - Formats single-column ATS layout with 0.5" margins, Calibri typography, live `ExternalHyperlink` instances for contact info and project demos, and bullet points.

---

## 3. Backend Source Code Deep Audit

### 3.1 API Endpoints
- `GET /api/v1/health`: Returns API status, version, and server timestamp.
- `POST /api/v1/ai/generate-summary`: Generates 3 professional summary variations.
- `POST /api/v1/ai/improve-bullet`: Enhances bullet point into STAR/XYZ format with metrics.
- `POST /api/v1/jobs/analyze`: Scans JD and extracts required/preferred competencies.
- `POST /api/v1/jobs/match`: Evaluates resume against JD and returns match percentage.
- `POST /api/v1/resume/tailor`: Compiles section-by-section improvement checklist.
- `POST /api/v1/ats/analyze`: Performs 27 algorithmic ATS compliance checks.
- `POST /api/v1/resume/parse`: Parses uploaded PDF/DOCX into normalized JSON resume.

### 3.2 AI Provider Fallback Strategy
- All AI calls run through `AIServiceProxy`.
- If `AI_PROVIDER=gemini` and the call fails (network timeout, invalid key, rate limit, quota exceeded), it catches `Exception`, logs a warning, and immediately returns the result from `LocalHeuristicProvider`.
- Added `asyncio.wait_for(..., timeout=8.0)` to ensure backend never hangs when an external API is unresponsive.

### 3.3 Test Suite Execution
- Running `python tests/run_tests.py` verifies all endpoints:
  - Health check: 200 OK
  - AI Summary generation: 200 OK
  - AI Bullet improvement: 200 OK
  - Job analyzer: 200 OK
  - ATS analyzer: 200 OK
  - Resume tailoring: 200 OK
