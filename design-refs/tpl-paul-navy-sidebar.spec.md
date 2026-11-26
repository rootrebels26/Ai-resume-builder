# Spec: tpl-paul-navy-sidebar (`pro-paul-navy-sidebar`)

## Page
- Target size: A4 (`794 x 1123 px` at 96 dpi), source ratio `723x1024` (~1:1.416, matches A4).
- Margins: Main left column `28px` left/top/bottom padding; right sidebar full-bleed to top/right/bottom edge.
- Background: `#ffffff` main column, `#24415f` dark navy right sidebar (`35%` width).

## Structure
- Two-column asymmetric layout: `65%` left main column + `35%` right dark navy sidebar (`flex-row`, full height).
- Header block (top of left main column):
  - `h1` UPPERCASE bold name (`#1e293b` / `#111827`).
  - Role subtitle in `#2563eb` / `#1d9bf0` below name.
  - Contact bar (phone, email, link/linkedin, location) with small muted icons.
- Photo: Circular (`88px x 88px`) centered at top of the right navy sidebar.
- Left column sections (in order): `SUMMARY`, `EXPERIENCE`, `SKILLS` (dot-separated inline list).
  - Experience entry: Role title bold left + `startDate - endDate` right-aligned; Company name in blue (`#1d9bf0`) left + location right-aligned; clean bullet list below.
- Right sidebar sections (in order): `KEY ACHIEVEMENTS` (with small icon + title + concise description), `LANGUAGES` (name + proficiency label + 5-segment progress bar), `EDUCATION` (degree, institution, dates + location), `TRAINING / COURSES` (course title + short description).

## Typography
- Heading & Body: `Inter` / `Open Sans` (clean humanist sans-serif; fallback `sans-serif`).
- Name: `24px` bold uppercase, tracking `0.03em`.
- Role subtitle: `11.5px` medium-semibold.
- Section headings: `11.5px` bold uppercase, tracking `0.06em`, full-width bottom rule (`1px solid`).
- Body: `10px–10.5px`, line-height `1.42`.

## Color
- Primary / Sidebar bg: `#24415f`
- Accent / Company & Role highlight: `#1d9bf0` / `#0284c7`
- Main text: `#1e293b`
- Muted text: `#475569`
- Sidebar text: `#ffffff` / `rgba(255,255,255,0.88)`
- Border: `#cbd5e1` (main), `rgba(255,255,255,0.28)` (sidebar)

## Decoration & Spacing
- Pure CSS/SVG Lucide icons for contact and key achievements; CSS segmented bar for languages with visually-hidden ATS text `(Native)`.
- Vertical rhythm: `14px` between sections, `10px` between entries, `3px` between bullets.
