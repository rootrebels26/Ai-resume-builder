# Resume Template Market-Relevance Audit Report

**Date:** 2026-11-26  
**Target Market Assumption:** Global / English-language market, **ATS-first** (Workday, Greenhouse, Lever) with human recruiter 6-second scan polish.

---

## 1. Live Research Sources Consulted
1. **ATS Resume Formatting Best Practices (Workday, Greenhouse, Lever)** — *JobWizard / Careerflow / ResumeAdapter / Enhancv* (2025–2026): Single-column text-layer PDFs or DOCX parse most reliably; tables, text boxes, skill bars, and contact info in document headers/footers cause parsing failures.
2. **Recruiter Resume Layout Preferences (Photos, Skill Bars, Fonts)** — *Monster / Resume.io / Enhancv / Microsoft* (2025–2026): North American & global corporate recruiters strongly reject profile photos (anti-bias + ATS) and subjective skill bars/star ratings. Standard readable sans/serif fonts (10–11pt body, 18–24pt name) with clear F-pattern hierarchy win.
3. **Greenhouse, Lever & Workday Parsing Guidelines** — *JobResumeAI / ProfileOps / ATSVerification* (2025–2026): Standard headings (*Experience, Education, Skills, Projects, Summary*), consistent date formats, real hyperlinks, and selectable text-layer PDFs are mandatory.

---

## 2. Inventory & Scoring Summary (`100` Templates in `templateRegistry.js`)

All 100 templates route through `DynamicResumeCanvas.jsx` with selectable text, semantic `<h1>`/`<h2>` headings, zero skill bars, zero star ratings, and zero layout `<table>` elements:

| Group | Count | Layout(s) | Avg Score (/20) | Decision | Notes |
|---|---|---|---|---|---|
| `ATS-Friendly / Traditional` (`ats-*`) | 10 | `single-column` | **19 / 20** | **KEEP (Polish)** | Pure linear ATS reading order; remove section heading SVG icons for strict ATS purity. |
| `Software Developer / IT` (`tech-*`) | 10 | `single-column`, `two-column`, `header-card` | **17 / 20** | **KEEP (Polish)** | Strong Projects + Skills hierarchy; add `break-inside: avoid` & sidebar label wrap fix. |
| `Data Science / AI / ML` (`data-*`) | 10 | `single-column`, `two-column`, `sidebar-left` | **17 / 20** | **KEEP (Polish)** | Clean metrics & publications support; fix sidebar skill category width. |
| `Business / Management` (`biz-*`) | 10 | `single-column`, `header-card`, `two-column` | **16 / 20** | **UPGRADE** | Upgrade `photoPolicy: 'required'` → `'optional'` so ATS-first candidates are never blocked. |
| `Finance / Accounting` (`fin-*`) | 10 | `single-column`, `header-card` | **17 / 20** | **KEEP (Polish)** | Restrained serif/sans pairings; add `break-after: avoid` on headings. |
| `Marketing / Sales` (`mkt-*`) | 10 | `two-column`, `header-card`, `sidebar-left` | **15 / 20** | **UPGRADE** | Upgrade `photoPolicy: 'required'` → `'optional'`; ensure high text contrast. |
| `Engineering / Technical` (`eng-*`) | 10 | `single-column`, `two-column` | **17 / 20** | **KEEP (Polish)** | Clear project/cert structure; add print page-break guards. |
| `Student / Fresher` (`stu-*`) | 10 | `single-column`, `header-card` | **17 / 20** | **KEEP (Polish)** | Education-first & projects emphasis; handles empty experience cleanly. |
| `Healthcare / Education` (`med-*`) | 10 | `single-column`, `header-card` | **16 / 20** | **UPGRADE** | Upgrade `photoPolicy: 'required'` → `'optional'`. |
| `Creative / Designer / Media` (`cre-*`) | 10 | `sidebar-left`, `two-column`, `header-card` | **15 / 20** | **UPGRADE** | Upgrade `photoPolicy: 'required'` → `'optional'`; ensure linearized reading order. |

**Removed:** `0` (all 100 templates share the ATS-safe `DynamicResumeCanvas` engine; `photoPolicy: 'required'` on 13 templates is upgraded to `'optional'`).

---

## 3. Legacy ID Fallback Map
Legacy IDs (`ats-01..10`, `modern-01..10`, `minimalist-01..10`, `maang-01..25`, `developer-01..10`, `data-01..10`, `aiml-01..10`, `executive-01..05`, `creative-01..05`, `student-01..05`, `business-01..05`, `infra-01..15`, `lead-01..10`) are mapped in `ResumeTemplate.jsx` to matching `TEMPLATE_REGISTRY` IDs so saved resumes never break.

---

## 4. Preview Parity Root Causes Identified (Phase 3)
1. **`Home.jsx` & `Onboarding.jsx` rendered `TemplateDraftPaper` (separate hardcoded mock) + `templatesList.js`**, while `Templates.jsx` & `Builder.jsx` used `DynamicResumeCanvas` + `TEMPLATE_REGISTRY`.
2. **`TemplateQuickPreviewModal.jsx` & `Preview.jsx` applied `18mm` padding** (and `Preview.jsx` clipped at `height: 297mm`), whereas `A4PageSheet.jsx` and `TemplateDraftCard.jsx` use `12mm 14mm` padding.
3. **`ResumeTemplate.jsx` lacked mappings for `modern-*`, `minimalist-*`, `creative-*`, `executive-*`, `student-*`, `developer-*`, `aiml-*`, `business-*`**, causing them to fall back to `ats-classic` instead of matching layouts.
