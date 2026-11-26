# Spec: tpl-brad-clean-split (`pro-brad-clean-split`)

## Page
- Target size: A4 (`794 x 1123 px`), pure `#ffffff` background, uniform `28px` outer margin.

## Structure
- Full-width left-aligned header above a `60% / 40%` two-column body (gap `22px`, no vertical divider line or subtle gap).
- Header block:
  - `h1` bold UPPERCASE black name (`#0f172a`).
  - Role subtitle in bright blue (`#0284c7`).
  - Single-line horizontal contact row with icons.
  - No photo by default (`photoPolicy: optional`).
- Left column (`60%`): `SUMMARY`, `EXPERIENCE`.
  - Experience entry: Role title bold black, Company name in `#0284c7` below, `date | location` muted row with calendar/pin icons below company, bullet list.
- Right column (`40%`): `KEY ACHIEVEMENTS` (bold title + paragraph), `SKILLS` (underlined tag rows: `border-b border-slate-300 pb-0.5`), `EDUCATION`, `TRAINING / COURSES`, `LANGUAGES` (name + proficiency left, 5 vertical pill bars right).

## Typography
- Heading: `Plus Jakarta Sans` / `Inter` (`font-extrabold` on name); Body: `Inter`.
- Name: `25px` extrabold uppercase.
- Section headings: `11px` bold uppercase, `2px solid #0f172a` bottom border.
- Body: `10px–10.5px`, line-height `1.42`.

## Color
- Primary: `#0f172a`
- Accent: `#0284c7`
- Text: `#1e293b`, Muted: `#475569`, Border: `#cbd5e1`, Background: `#ffffff`.
