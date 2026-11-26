# Spec: tpl-jackson-classic-center (`pro-jackson-classic-center`)

## Page
- Target size: A4 (`794 x 1123 px`), pure `#ffffff` background, `28px` uniform padding.

## Structure
- Single-column centered executive layout.
- Header block (centered):
  - Circular photo (`72px x 72px`) centered at top (hidden cleanly if no photo).
  - `h1` serif/classic bold name (`Playfair Display` / `Merriweather` or `Georgia` style, centered, title case).
  - Role subtitle in `#0284c7` centered below name.
  - Dot-separated centered contact bar (`phone • email • linkedin • location`).
- Body sections (centered headings with full-width thin horizontal rule `#94a3b8` below each heading):
  1. `Summary`: centered/clean paragraph.
  2. `Key Achievements`: **3-column horizontal grid** (`grid-cols-3 gap-4`) with bold title + concise description per achievement.
  3. `Experience`: Company name in `#0284c7` bold left + location right; Role bold-medium below left + dates right; clean bullet list.
  4. `Core Competencies` (Skills): clean comma/dot-separated inline list.
  5. `Education`: Institution in `#0284c7` left + location right; degree below left + dates right.
  6. `Training & Courses`: Title in `#0284c7` + em-dash + description inline.

## Typography
- Heading: `Playfair Display` / `Merriweather`; Body: `Inter` / `Open Sans`.
- Name: `22px` bold; Section headings: `12.5px` semibold centered.

## Color
- Primary: `#0f172a`
- Accent: `#0284c7`
- Text: `#1e293b`, Muted: `#475569`, Border: `#94a3b8`, Background: `#ffffff`.
