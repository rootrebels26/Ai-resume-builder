---
name: resume-template-audit
description: Audits every resume template on the website for real job-market relevance (ATS-safe, modern, recruiter-friendly), removes outdated ones safely, upgrades the rest into professional real-resume layouts, and fixes the Preview feature so the preview looks exactly like the actual template. Use this skill whenever the user mentions resume templates, CV templates, template preview mismatch, preview looking different from the real template, outdated or ugly templates, ATS compatibility, template cleanup, or redesigning/upgrading templates, even if they do not say "audit".
---

# Resume Template Audit, Upgrade and Preview Fix

You do three jobs in strict order. Do not skip ahead, and do not edit code before Phase 1 is complete.

1. **Audit**: decide which templates are still useful in today's job market.
2. **Fix Preview parity**: the Preview must look identical to the real template.
3. **Upgrade**: rebuild surviving templates to look like real, modern resumes.

"Works perfectly" means every claim below is verified with screenshots or command output, not assumed.

## Ground rules

- Never assume the tech stack. Discover it in Phase 0.
- Work on a git branch (`git switch -c template-audit`). Commit after each phase so any step can be reverted.
- Never delete a template before checking who uses it (Phase 2, step 4).
- Keep the **data contract** of every template unchanged (same props/fields/JSON schema). Users' saved resumes must keep rendering.
- One source of truth for rendering. Never maintain a second copy of a template for preview purposes.
- Ask the user at most one question, and only if the target job market cannot be determined from the site (see Phase 2). Otherwise proceed with stated assumptions.
- Produce a written Audit Report (Phase 2) and stop for the user's go-ahead only if more than half of the templates are marked REMOVE. Otherwise proceed.

## Phase 0: Discover the codebase

Find and write down (briefly) each of these. Search the repo; do not guess.

1. **Template registry**: where templates are listed (array, config, DB seed, CMS, folder of files). Note each template's id, name, and category.
2. **Template renderer**: the component/file that turns resume data into the actual template. Note framework (React/Vue/Next/plain HTML/PHP/etc.), CSS approach (CSS modules, Tailwind, global CSS, inline), and PDF export method (browser print, html2pdf, Puppeteer, server-side).
3. **Preview feature**: what the Preview button opens (modal, route, image, iframe, separate component) and where its content comes from (static thumbnail image, hand-made mock, same renderer with sample data, etc.).
4. **Sample data**: what data the preview uses versus what the real editor uses.
5. **How to run the site locally** (dev command, port). Start it. You need it for screenshots.

Output a 10-line "Architecture notes" summary before continuing.

## Phase 1: Inventory

Build a table with one row per template:

| id | name | file(s) | columns | fonts | uses images/icons/skill-bars/photo | page size | has preview thumbnail | notes |

Take a screenshot of each template rendered in the real editor/output with the same realistic sample resume, and save to `audit/before/<id>.png`. These are your "before" evidence.

## Phase 2: Market-relevance audit

### 2.1 Verify current standards with live research

Use web search to confirm what recruiters and ATS software expect now. Use at least 3 reputable, recent sources (current year preferred), for example recruiter or career-site guidance, ATS vendor documentation, and hiring-manager surveys. Record URL and date for each. Do not rely only on memory; guidance changes.

Also determine the **target market** from the site (language, currency, domain, copy, existing templates). Conventions differ: photos, date of birth, marital status, and objective statements are normal in some regions and discouraged in others. If you truly cannot tell, ask the user once. Default assumption if no answer: global/English-language market, ATS-first.

### 2.2 Scoring rubric (0 to 2 per criterion, 20 max)

| # | Criterion | 0 | 1 | 2 |
|---|-----------|---|---|---|
| 1 | ATS parse-safety (real text, no key content in images, tables, text boxes, or headers/footers) | fails | partly | passes |
| 2 | Layout (single column, or simple 2-column with clear reading order) | confusing | acceptable | clean |
| 3 | Standard section headings (Experience, Education, Skills, Projects, Summary) | custom or cute | mixed | standard |
| 4 | Typography (readable fonts, 10 to 11pt body, clear hierarchy, adequate line height) | poor | ok | strong |
| 5 | Visual restraint (limited color, no skill-level bars/ratings/charts/progress circles, no heavy graphics) | heavy | some | restrained |
| 6 | Content density and page fit (fits 1 page for junior, 2 for senior without awkward breaks) | breaks | mostly | clean |
| 7 | Print/PDF fidelity (A4/Letter margins, selectable text, fonts embedded) | broken | minor issues | exact |
| 8 | Accessibility (contrast ratio at least 4.5:1, semantic HTML, sensible heading order) | fails | partial | passes |
| 9 | Distinct purpose (is it meaningfully different from the other templates, or a duplicate?) | duplicate | overlaps | distinct |
| 10 | Modern look (would a hiring manager today think it looks current and professional?) | dated | neutral | current |

### 2.3 Decision rules

- **KEEP**: 16 to 20.
- **UPGRADE**: 9 to 15, or any template that is distinct and popular but scores low on look only.
- **REMOVE**: 8 or below, or fails criterion 1 with no cheap fix, or is a near-duplicate of a better template (merge into the better one).

Aim for a final set covering these needs (a template may fill more than one): a classic ATS-safe single column; a modern two-column (sidebar) that stays ATS-readable; a compact one-pager for freshers/students; a senior/executive two-page layout; a technical/engineering layout with a Projects and Skills emphasis; and, if the site's audience warrants, one tasteful creative-but-still-parseable option. Do not keep a template just to fill a slot, and do not pad the set.

### 2.4 Safe removal procedure

Before removing any template:

1. Search the whole repo for its id/name/file (routes, registry, DB seeds, tests, analytics, sitemap, docs, images).
2. If the app stores user resumes with a `templateId`, ensure those users are not broken: add a **fallback map** (`removedId -> replacement id`) so saved resumes render in the closest surviving template. If there is a database, write a migration or note exactly what the owner must run. Do not run destructive DB commands yourself.
3. Remove the registry entry, component/files, thumbnails, and styles. Remove now-unused dependencies only if nothing else imports them.
4. Run build, lint, and tests. Confirm no 404s or dead links to the removed template.

### 2.5 Audit Report

Save `audit/AUDIT_REPORT.md` containing: sources consulted (URL + date), the scoring table per template with one-line reasoning, the decision (KEEP/UPGRADE/REMOVE), the fallback map, and the target-market assumption.

Commit: `audit: report and removals`.

## Phase 3: Fix Preview so it matches the real template

### 3.1 Diagnose by evidence, not guesswork

For one template, capture (a) the Preview view and (b) the real rendered template, at the same viewport, with the same data. Then identify the cause. Typical causes, check all:

- Preview shows a **static thumbnail/screenshot** that is outdated or a different design.
- Preview uses a **separate mock component** or copied HTML instead of the real renderer.
- Preview feeds **different sample data** than the real template (different lengths hide overflow, wrapping, and spacing differences).
- **CSS scope leaks**: global styles or a parent container changes fonts, spacing, or colors in one place only.
- **Fonts** not loaded inside the preview (iframe, shadow DOM, modal) so fallback fonts change layout.
- **Scaling** done with `zoom`, width squeezing, or media queries instead of a uniform `transform: scale()` of a fixed-size page, causing reflow.
- Preview uses **screen CSS** while the real output uses **print CSS** (or the reverse).
- Preview is routed to the **wrong template id** (off-by-one, stale cache, key collision, default fallback).
- Caching (service worker, CDN, image cache) serving old thumbnails.

Write the root cause in 3 lines before changing anything.

### 3.2 The fix: one renderer, scaled

Required design:

- The Preview renders the **exact same template component/function** the editor and PDF export use, passed through the **same props/data pipeline**.
- The template is rendered at its **true page size** (for example A4 794 x 1123 px at 96 dpi, or Letter 816 x 1056 px) inside a fixed-size wrapper, then scaled down uniformly with `transform: scale(s); transform-origin: top left;`, with the outer box sized to the scaled dimensions. Never let the browser reflow the page to fit.
- Fonts, template CSS, and design tokens load in the preview context exactly as in the real one (if an iframe or shadow DOM is used, inject the same stylesheets and font faces and wait for `document.fonts.ready` before showing).
- Sample data lives in **one shared file** used by both preview and the real template demo. Include realistic content: a multi-line summary, 3 jobs with 3 to 4 bullets each, education, 10+ skills, 2 projects.
- If thumbnails are needed for the gallery grid, **generate them from the real renderer** with a script (headless browser screenshot) and add an npm/make script such as `generate:thumbnails`. Never hand-made images. Add a note in the README on when to re-run it.
- Delete any old mock/duplicate preview code once replaced.

### 3.3 Verify parity automatically

Add a parity check script (for example Playwright + an image diff) that, for each surviving template:

1. Renders the preview and the real template at the same size with the shared sample data.
2. Normalizes scale (render the real template at the preview's scale, or compare the preview's inner page at 1:1).
3. Compares screenshots and reports the mismatch percentage; target under 0.5 percent difference (allow for anti-aliasing).
4. Saves `audit/parity/<id>-preview.png`, `<id>-real.png`, and `<id>-diff.png`.

Run it. If any template fails, fix and rerun until all pass. Add the script to `package.json` (or equivalent) as `test:preview-parity` so it can be rerun after future changes.

Commit: `fix: preview renders real template (parity verified)`.

## Phase 4: Upgrade surviving templates

Rebuild each UPGRADE template (and polish KEEP ones only if needed) to look like a resume a recruiter would actually receive.

### Design requirements

- **Semantic, text-based HTML**: real headings (`h1` name, `h2` sections), `ul/li` for bullets, `time` or plain text for dates. No key content as images. No tables for layout. Contact details in the body, not in a header/footer region.
- **Standard section names and logical reading order**, including in two-column layouts (main content must read correctly when linearized).
- **Typography**: one or two font families max; a professional sans (Inter, Source Sans, Lato, Roboto) or a refined serif (Georgia, Merriweather, Source Serif) with web-safe fallbacks. Body 10 to 11pt, name 20 to 28pt, section headings 11 to 13pt with consistent spacing, line height about 1.35 to 1.5.
- **Layout**: margins 0.6 to 0.9 inch; consistent vertical rhythm using a spacing scale; right-aligned dates in a consistent column; no orphaned headings at page bottom (`break-inside: avoid` on entries, `break-after: avoid` on headings).
- **Color**: black/near-black text; at most one restrained accent color, exposed as a design token so users can change it; contrast at least 4.5:1; must still look good in grayscale print.
- **No** skill bars, star ratings, percentage rings, stock icons for every line, or decorative clip-art. Small, consistent icons for contact items are acceptable only if they are real text-adjacent SVGs and do not replace the text.
- **Photo**: optional and off by default, shown only if the target market expects it.
- **Responsive resilience**: handle very long names, missing sections (hide empty headings), 1-bullet and 8-bullet jobs, long URLs, non-English characters, and content that overflows one page (clean page break, never clipped).
- **Design tokens**: colors, fonts, spacing in variables so templates are consistent and easy to extend.
- **Customization hooks** that already exist on the site (accent color, font size, spacing) must keep working.

### Process per template

1. Keep the existing data contract and registry id (unless removed).
2. Implement the redesign in the existing renderer. No new rendering path.
3. Test with three datasets: the standard sample, a minimal one (fresher, 1 job), and a stress one (long text, 6 jobs, 20 skills).
4. Export to PDF and verify text is selectable and extractable (for example `pdftotext` returns the content in sensible order with all section headings).
5. Take after-screenshots to `audit/after/<id>.png`.
6. Re-run the parity check.

Commit per template: `upgrade(<id>): modern ATS-safe layout`.

## Phase 5: Final verification checklist

Do not report success until every item is checked with evidence:

- [ ] Build, lint, and tests pass.
- [ ] No references to removed templates remain (repo-wide search returns nothing); fallback map works for old saved ids.
- [ ] Every surviving template renders correctly with standard, minimal, and stress data.
- [ ] Preview parity script passes for all templates (diff under 0.5 percent).
- [ ] The gallery thumbnails are generated from the real renderer and are current.
- [ ] PDF export for each template has selectable text and correct reading order.
- [ ] Contrast and heading-order checks pass (for example axe or Lighthouse accessibility).
- [ ] Before/after screenshots exist for every template.
- [ ] The site was opened in the browser and the user flow was tested end to end: gallery -> Preview -> choose template -> edit -> export.

## Final report to the user

Keep it short and visual:

1. Table: template, decision (kept/upgraded/removed), score before and after, one-line reason.
2. The root cause of the preview mismatch and what changed, in 3 to 5 lines.
3. Before/after screenshot links.
4. Anything the owner must do manually (DB migration, cache purge, re-running thumbnail generation).
5. Any assumption made (target market, fonts) so the user can overrule it.