# NITYA CLOUDTECH — AI RESUME BUILDER

Official enterprise AI-powered Resume Builder by **Nitya CloudTech** ([nityacloudtech.com](https://www.nityacloudtech.com/)). Developed by the Nitya CloudTech team.

A modern, privacy-first, database-free, AI-powered Resume Builder web platform with 50+ templates across 7 categories, real-time ATS compatibility scoring, job description gap analysis, dual-engine PDF/DOCX ingestion, and high-fidelity A4 export.

---

## Key Features

- **50+ Professional Templates**: ATS-Friendly (10), Modern Professional (10), Minimalist (10), Student/Fresher (5), Software Developer (5), Executive/Leadership (5), Creative/Designer (5).
- **Privacy-First & Database-Free**: No cloud database (no PostgreSQL, MongoDB, MySQL, Firebase, or Supabase). All drafts are persisted locally in the browser via Dexie.js (IndexedDB).
- **Zero Registration**: Use the entire platform as a guest without creating an account or providing an email.
- **Smart PDF & DOCX Parser**: Ingest and extract sections from existing resumes via PyMuPDF and python-docx.
- **AI Career Suite**:
  - Summary Generator tailored to career level.
  - STAR-Method Experience Bullet Improver.
  - Project Description Enhancer.
  - Resume Reviewer & Word Count/Read-Time Estimator.
  - Pluggable provider abstraction (Gemini, Groq, OpenRouter, and a built-in Local Heuristic Engine that requires zero external API keys).
- **Job Description & ATS Engine**:
  - Technical & soft skill gap analysis.
  - Estimated ATS compatibility score with section-by-section breakdown.
  - Job-specific resume tailoring.
- **High-Fidelity PDF Export**: Pixel-perfect A4 printing stylesheet with zero text cut-off.

---

## Tech Stack

### Frontend
- React 18 + Vite
- JavaScript (ES6+ / JSX) — strictly no TypeScript
- Tailwind CSS
- React Router DOM v7
- Dexie.js (IndexedDB)
- Lucide React icons
- html2pdf.js & CSS `@media print` engine
- Axios

### Backend
- Python 3.11+
- FastAPI & Uvicorn
- Pydantic v2 & Pydantic Settings
- PyMuPDF (`pymupdf`)
- python-docx
- HTTPX & Pytest

---

## Quickstart Guide

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API Docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/v1/health`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 3. Docker (one-command run)

```bash
docker compose up --build
```

- Frontend: `http://localhost:8080`
- API: `http://localhost:8000` (Swagger UI at `/docs`)

Before deploying behind your own domains, set `ALLOWED_ORIGINS` (backend) to your
frontend origin and `VITE_API_BASE_URL` (frontend build arg) to your API URL.

---

## Configuration

Backend settings are read from `backend/.env` (see [`backend/.env.example`](backend/.env.example)):

| Variable | Purpose | Default |
| :--- | :--- | :--- |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins (never `*` in production) | localhost origins |
| `RATE_LIMIT_PER_MINUTE` | Per-IP request cap (`0` disables) | `60` |
| `LOG_LEVEL` | Application log level | `INFO` |
| `AI_PROVIDER` | `local` \| `gemini` \| `groq` \| `openrouter` | `local` |

The API exposes `GET /api/v1/health`, `/api/v1/health/live`, and `/api/v1/health/ready`
for observability, gzip compression, security headers, and request-id tracing on all responses.

---

## Project Structure

```
ai-resume-builder/
├── frontend/
│   ├── public/
│   │   └── _redirects
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       (Navbar, Footer, AppLayout)
│   │   │   └── templates/    (50+ template layouts: ATS, Modern, Minimalist, Specialized)
│   │   ├── constants/        (Templates list, initial sample data)
│   │   ├── context/          (ResumeContext state manager)
│   │   ├── pages/            (Home, Templates, Builder, UploadResume, JobAnalyzer, ATSChecker, Preview, Privacy)
│   │   ├── services/         (api, storageService, resumeService, aiService, pdfService)
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
├── backend/
│   ├── app/
│   │   ├── api/routes/       (health, resume, ai, jobs, ats)
│   │   ├── core/             (config, exceptions, security)
│   │   ├── providers/        (base, local_heuristic, gemini, groq, openrouter)
│   │   ├── schemas/          (resume_schema, ai_schema, job_schema)
│   │   ├── services/         (resume_parser, ai_service, jd_analyzer, ats_service, resume_optimizer)
│   │   ├── utils/            (file_utils, text_utils)
│   │   └── main.py
│   ├── tests/
│   │   ├── run_tests.py
│   │   └── test_*.py
│   ├── requirements.txt
│   └── pytest.ini
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT.md
│   ├── IMPLEMENTATION_PLAN.md
│   └── PRIVACY.md
├── render.yaml
└── README.md
```

---

## Running Automated Tests

```bash
cd backend
pytest -q            # full suite (used by CI)
python tests/run_tests.py   # end-to-end smoke test against the live app
```

All integration tests verify the health endpoint, AI summary and bullet generation,
job analyzer, ATS compatibility scorer, and resume tailoring. Continuous integration
(`.github/workflows/ci.yml`) runs the backend suite and the frontend production build on every push and PR.
