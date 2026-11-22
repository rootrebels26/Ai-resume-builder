# SYSTEM ARCHITECTURE: AI RESUME BUILDER

## 1. Architectural Philosophy

AI Resume Builder is architected around three non-negotiable tenets:
1. **Privacy-First & Database-Free**: No centralized cloud database (PostgreSQL, MySQL, MongoDB, Firebase, Supabase) is operated. User resume data never persists on our backend servers.
2. **Deterministic Graceful Degradation**: The platform is 100% operational out-of-the-box using the built-in Local Heuristic Provider without requiring users or operators to configure external AI API credentials.
3. **Strict Decoupled Domain Separation**: The React frontend and FastAPI backend operate as completely autonomous applications communicating solely via versioned REST APIs (`/api/v1`).

---

## 2. High-Level System Architecture Diagram

```mermaid
graph TD
    User([User Browser])

    subgraph Client Application [React SPA + Vite]
        UI[Tailwind UI & Form Editor]
        State[ResumeContext State Manager]
        IDB[(IndexedDB via Dexie.js)]
        Engine[50+ Template Engine & CSS Print A4]
    end

    subgraph Backend Application [FastAPI Python 3.11]
        Router[API Gateway /api/v1]
        Parser[PyMuPDF & python-docx Parser]
        ATSEngine[ATS Compliance & Scorer Engine]
        JDEngine[Job Description & Gap Analyzer]
        AIService[AI Provider Abstraction Layer]
    end

    subgraph Configured AI Providers [Optional External LLMs]
        Local[Local Heuristic Engine - Default]
        Gemini[Google Gemini API]
        Groq[Groq Llama 3.3 API]
        OpenRouter[OpenRouter API]
    end

    User -->|Interacts| UI
    UI <--> State
    State <-->|Auto-save / Restore| IDB
    State -->|Renders| Engine
    Engine -->|High-Res PDF Export| User

    UI -->|Multipart Upload / REST| Router
    Router --> Parser
    Router --> ATSEngine
    Router --> JDEngine
    Router --> AIService

    AIService --> Local
    AIService -.->|Configured Key| Gemini
    AIService -.->|Configured Key| Groq
    AIService -.->|Configured Key| OpenRouter
```

---

## 3. Frontend Architecture

- **Framework**: React 18 with Vite build tool.
- **Language**: Pure ECMAScript JavaScript (JSX), avoiding TypeScript compilation overhead.
- **Styling**: Tailwind CSS with custom typography and color tokens.
- **Local Persistence**: Dexie.js IndexedDB wrapper with debounced auto-saving, draft versioning, and JSON import/export.
- **Template System**: Normalized `ResumeData` consuming 50+ templates across 7 categories (ATS-Friendly, Modern, Minimalist, Student, Developer, Executive, Creative).
- **PDF Generation**: Standardized CSS A4 `@media print` rules paired with client-side canvas/PDF vector rendering.

---

## 4. Backend Architecture

- **Framework**: FastAPI (Python 3.11+) with Uvicorn ASGI server.
- **Data Validation**: Pydantic v2 schemas for all requests, responses, and entities.
- **Document Processing**:
  - `PyMuPDF` (`pymupdf`) for high-fidelity multi-page PDF text extraction.
  - `python-docx` for structured Word document extraction.
- **Security & Hygiene**:
  - Secure temporary upload context manager with guaranteed cleanup.
  - 10MB upload payload limit.
  - Filename sanitization against path-traversal attacks.
  - Configurable CORS origins.
