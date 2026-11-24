# ResumeStudio — Security & Privacy Audit

**Document Version:** 2.0.0-PROD  
**Audit Date:** November 2026  
**Auditor:** Principal Security Engineer & Privacy Officer  
**Scope:** Frontend Storage, Backend API, Prompt Injection Defense, Network Boundaries

---

## 1. Executive Security Posture

ResumeStudio enforces a strict **Zero-Data-Retention (ZDR)** and **Database-Free Architecture**. Unlike traditional resume builders that store candidate PII, work histories, and contact info in centralized cloud databases, ResumeStudio stores drafts strictly inside the user's browser via IndexedDB.

---

## 2. Security Dimension Analysis

| Threat Dimension | Implementation Strategy | Verification Result |
|---|---|---|
| **PII Data Storage** | Zero remote database. Resumes reside only in client-side IndexedDB (`Dexie.js`). | **PASSED** — No server-side DB credentials, connections, or tables exist. |
| **Prompt Injection Defense** | Job descriptions & user resumes are treated strictly as passive data, enclosed in quotes with system prompt boundaries. | **PASSED** — System instructions cannot be overridden by malicious text in uploaded resumes or JDs. |
| **API Key Protection** | External AI provider keys (`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`) reside exclusively in backend `.env`. | **PASSED** — Zero keys are bundled in frontend client builds. |
| **File Upload Hardening** | Ingestion caps files to 10MB; validated against magic numbers (PDF/DOCX); temporary files unlinked immediately. | **PASSED** — Path traversal and arbitrary file execution prevented. |
| **CORS Policy** | Whitelisted origins defined in `ALLOWED_ORIGINS` (`http://localhost:5173`, `http://127.0.0.1:5173`, etc.). | **PASSED** — Wildcard `*` disabled when credentials or production headers are present. |
| **Security Headers** | `SecurityHeadersMiddleware` injects `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`. | **PASSED** — Verified on all `/api/v1/*` responses. |
| **Rate Limiting** | `RateLimitMiddleware` enforces standard per-minute sliding window (default: 60 req/min/IP). | **PASSED** — Protects local and hosted instances from DoS or abuse. |
| **Cross-Site Scripting (XSS)** | React JSX escapes text by default; DOM attributes sanitized; URLs normalized via `ensureUrl`. | **PASSED** — `javascript:` and data protocol injections blocked. |

---

## 3. Transparency & Accurate Privacy Disclosures

1. **Browser Storage Disclosure:**
   - Dexie.js stores data in browser IndexedDB.
   - The application does NOT falsely claim that browser storage is "military-grade encrypted." It accurately states that data remains private to the user's local device and browser profile.
2. **Third-Party AI Transparency:**
   - When external AI providers (Gemini, Groq, OpenRouter) are enabled in `.env`, the user is informed that snippets are transmitted securely over TLS for real-time analysis and are subject to the provider's enterprise zero-training API policies.
   - If offline or unconfigured, the **Local Heuristic Provider** handles all features 100% on-device with zero external transmission.
