---
name: resume-template-from-image
description: Designs NEW resume templates from reference images (screenshots, PNG/JPG/PDF previews) and adds them to the website's template section as additional templates, with a pixel-accurate design, a working gallery card, and a Preview identical to the real template. Use this skill whenever the user gives template images and wants those designs built and added as new templates on the website, even if they just say "add these templates", "design these", or "make templates like these".
---

# Resume Template From Image

The user's existing templates stay exactly as they are. Each reference image becomes **one brand-new template** added to the template section. Design and build it so it looks like the image, to the pixel where possible, while working with the site's existing data, exporting to a clean ATS-readable PDF, and showing an identical Preview.

Design quality is the main goal. A template that merely resembles the image is a failure: spacing, alignment, type hierarchy, and color must match.

The result is judged by a **visual diff against the source image**, not by feeling. Do not stop until the diff passes.

## Ground rules

- Work on a git branch (`git switch -c add-templates-from-images`). Commit once per template.
- Never overwrite or rename an existing template. New templates get new unique ids.
- Reuse the site's existing renderer, data contract, design tokens, and Preview mechanism. Do not invent a parallel rendering path. If the Preview currently differs from real templates, follow the `resume-template-audit` skill (Phase 3) first or in parallel; the new templates must use the single-renderer-scaled preview.
- Recreate the **layout and style**, not someone else's brand. Do not copy logos, watermarks, proprietary artwork, or the image's real personal data. Replace all text with the site's sample data. If an image shows a paid/branded template with unique artwork, reproduce the structure and use original or neutral shapes, and tell the user.
- All visible resume content must be **real text** in the DOM (never an embedded image of text), so PDFs stay selectable and ATS-readable.
- Ask the user only if something is truly blocking (for example an image is unreadable). Otherwise decide, state assumptions in the final report, and continue.

## Phase 0: Understand the site (once)

Find and note briefly:

1. Template registry (where templates are listed) and the fields each entry needs (id, name, category, thumbnail, component).
2. Renderer and the data contract (fields like name, title, contact, summary, experience[], education[], skills[], projects[], certifications[], languages[], etc.).
3. Styling approach (CSS modules, Tailwind, global CSS), design tokens, font loading, customization options (accent color, font size, spacing) that must keep working.
4. PDF export method and page size (A4 794 x 1123 px or Letter 816 x 1056 px at 96 dpi).
5. How to run the site locally, and how the Preview and gallery thumbnails are produced.

Look at one existing template as the model for file structure and naming. Match it.

## Phase 1: Inventory the images

1. List all provided images. Give each a slug (`tpl-<short-descriptive-name>`) and keep originals in `design-refs/<slug>.<ext>`.
2. If an image is a multi-page PDF or contains several templates, split it so each template has its own reference image and note page 1 and page 2 separately.
3. If an image is low resolution or cropped, say so and work from what is visible; mark guessed regions in your notes.
4. Skip nothing silently. If an image is not a resume template, tell the user in the final report.

## Phase 2: Analyze each image into a written spec

Do this before writing code. Look closely at the image and, where possible, measure with a script (Python Pillow or similar) instead of eyeballing.

Create `design-refs/<slug>.spec.md` with:

**Page**
- Aspect ratio and target size (A4/Letter). Margins as px at 794 px width.
- Background color, and whether any area (sidebar, header band) has a filled background.

**Structure**
- Number of columns and their widths (as percent or px), gaps, and which sections live where.
- Header block: name, title, contact items, photo position and shape (if any).
- Section order and exact heading wording style (UPPERCASE, small caps, letter-spacing, underline, rule, icon).
- Section content patterns: experience entry layout (title/company/date placement, bullet style), education layout, skills presentation (plain list, comma list, tags, two-column), and any extra sections.

**Typography**
- Identify the closest available fonts (prefer Google Fonts with web-safe fallbacks). State the match and confidence. Never claim an exact match unless certain.
- Sizes for name, title, section headings, entry titles, body, dates (in px at 794 px page width), weights, line heights, letter-spacing.

**Color**
- Sample actual colors from pixels (hex): text, muted text, accent, rules/borders, sidebar/background fills. Reduce to a small palette and map to design tokens.

**Decoration**
- Icons, dividers, shapes, skill indicators, photo frame. Decide for each: keep (as pure CSS/SVG, with text still present), simplify, or drop.
- Skill bars, rating dots, and percentage rings: reproduce visually only if the image has them, keep the skill name as real text, and provide a plain-text equivalent in the markup (for example visually hidden text). Tell the user these can hurt ATS parsing and offer a toggle if the site supports options.

**Spacing**
- Vertical rhythm: gaps between sections, between entries, between bullets. Express as a spacing scale.

Show the spec to yourself as a checklist; every item must be reflected in code.

## Phase 3: Map image content to data fields

1. Create a **field map**: each text region in the image -> a data-contract field. For example "Software Engineer at Acme, 2020 to Present" -> `experience[i].title`, `.company`, `.start`, `.end`.
2. If the image contains a section the data contract does not have (for example "Awards", "Languages", "Interests", "References"), check whether the contract already supports it. If not, add an **optional** field in a backward-compatible way (never required, never breaking saved resumes), update the editor form only if it is small and clearly in scope, and note this in the report. Otherwise omit the section and report it.
3. Hide empty sections and their headings automatically.

## Phase 4: Build the template

1. Create the template component/file following the existing structure and naming.
2. Implement with semantic HTML: `h1` for the name, `h2` for section headings, `ul/li` for bullets, `time` or plain text for dates, `address`/links for contact. Use CSS grid or flexbox for layout, not tables. Keep DOM reading order correct even for sidebar layouts (main content must linearize sensibly).
3. Put colors, fonts, and spacing into the template's tokens/CSS variables. Wire the existing customization options (accent color, font size, density) to those tokens.
4. Add print rules: `@page` size and margins, `break-inside: avoid` on entries, `break-after: avoid` on headings, `print-color-adjust: exact` for colored backgrounds, and make sure sidebar backgrounds extend the full page height on every page.
5. Load fonts exactly like the other templates do. Wait for fonts before measuring or screenshotting.
6. Register the template (id, name, category, tags, thumbnail path, component) in the registry.

## Phase 5: Visual diff loop (mandatory)

Repeat until it passes:

1. Render the new template at true page size (794 x 1123 px for A4) in a headless browser, using sample data that mirrors the image's content volume (similar number of jobs, bullets, and skills) so line wrapping is comparable. For this loop only, you may temporarily use the image's own text as sample data to compare layout precisely; do not ship it.
2. Resize the source image to the same dimensions. Produce three files in `design-refs/diff/`: `<slug>-source.png`, `<slug>-render.png`, `<slug>-overlay.png` (50 percent blend) and `<slug>-diff.png`.
3. Compare. Check specifically:
   - Column widths and positions within 2 px.
   - Margins and section positions within 4 px vertically.
   - Font sizes and weights visually equivalent; line breaks happen at the same words where feasible.
   - Colors within a small tolerance (sample the same points).
   - Rules, borders, shapes, and photo frame alignment.
4. Fix the largest differences first. Re-render.

Pass criteria: the overlay shows no visible structural misalignment, key blocks align within the tolerances above, and a structural similarity score (SSIM) of at least 0.90 on the layout with text blurred out (or equivalent metric). Font substitution may cause small text differences; that is acceptable, but note which fonts were substituted.

Do not claim a match without looking at the overlay image.

## Phase 6: Robustness tests

Render and screenshot each new template with three datasets:

1. **Standard**: the site's shared sample data.
2. **Minimal**: a fresher with one job, few skills, no projects.
3. **Stress**: very long name, 6 jobs with 5 bullets, 25 skills, long URLs, a long summary, non-English characters.

Verify: no clipped or overlapping text, clean page breaks (no orphaned headings), no horizontal overflow, empty sections hidden, and the sidebar or background correct on page 2. Also test a long unbroken string (such as a URL) wraps instead of breaking the layout.

## Phase 7: Preview and gallery

1. The Preview must render the **same component** as the real template, at true page size, scaled with a uniform `transform: scale()`. Do not create a separate preview version, and do not use a hand-made image.
2. Generate the gallery thumbnail from the real renderer with the site's thumbnail script (create one if none exists and add it to package scripts).
3. Run the parity check from the `resume-template-audit` skill if it exists (preview vs real, under 0.5 percent difference). If it does not exist, do a manual screenshot comparison of Preview and real template and save both.

## Phase 8: Export and ATS check

1. Export a PDF from the site's real export path.
2. Confirm text is selectable and extracts in logical order (for example `pdftotext -layout file.pdf -` shows name, contact, then sections in order, with all headings present).
3. Confirm fonts are embedded or fall back gracefully, and the PDF is one or two pages as intended for the sample.
4. Check contrast (text against background at least 4.5:1) and fix by darkening muted text if needed, noting the small deviation from the source image.

## Phase 9: Final verification checklist

Report success only if each item is checked with evidence:

- [ ] Every provided image was processed (or explicitly reported as skipped, with the reason).
- [ ] Each template has a spec file, source/render/overlay/diff images, and passes the visual diff.
- [ ] Each template works with standard, minimal, and stress data.
- [ ] Customization options (accent color, font size) still work on the new templates.
- [ ] Registered in the gallery, with a thumbnail generated from the real renderer, and Preview matches the real template.
- [ ] PDF export is selectable, ordered, and correct.
- [ ] Build, lint, and tests pass; no console errors; existing templates untouched.
- [ ] The user flow was tested in the browser: gallery -> Preview -> choose -> edit -> export.

## Final report to the user

Keep it short:

1. Table: image -> template id, similarity result, fonts used (and substitutions), any sections added or dropped.
2. Side-by-side (source vs result) screenshot links.
3. Things you changed from the source on purpose (ATS-safety, contrast, replaced artwork) and why.
4. Anything the owner must do (new fonts to license or self-host, thumbnail script to re-run, optional field added to the data contract).
5. Any assumption you made, so the user can overrule it.