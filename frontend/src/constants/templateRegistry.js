/**
 * RESUME STUDIO — 100 CANVA-INSPIRED ROLE-WISE TEMPLATE REGISTRY
 *
 * Exactly 100 unique templates partitioned across 10 specialized categories (10 each):
 * 1. ATS-Friendly / Traditional (10)
 * 2. Software Developer / IT (10)
 * 3. Data Science / AI / ML (10)
 * 4. Business / Management (10)
 * 5. Finance / Accounting (10)
 * 6. Marketing / Sales (10)
 * 7. Engineering / Technical (10)
 * 8. Student / Fresher / Internship (10)
 * 9. Healthcare / Education / Research (10)
 * 10. Creative / Designer / Media (10)
 *
 * Total: Exactly 100 Genuinely Distinct Templates.
 */

export const TEMPLATE_CATEGORIES = [
  {
    "id": "all",
    "name": "All Templates",
    "count": 100,
    "icon": "Layers"
  },
  {
    "id": "ats",
    "name": "ATS-Friendly / Traditional",
    "count": 10,
    "icon": "ShieldCheck"
  },
  {
    "id": "software",
    "name": "Software Developer / IT",
    "count": 10,
    "icon": "Code"
  },
  {
    "id": "datascience",
    "name": "Data Science / AI / ML",
    "count": 10,
    "icon": "Cpu"
  },
  {
    "id": "business",
    "name": "Business / Management",
    "count": 10,
    "icon": "Briefcase"
  },
  {
    "id": "finance",
    "name": "Finance / Accounting",
    "count": 10,
    "icon": "TrendingUp"
  },
  {
    "id": "marketing",
    "name": "Marketing / Sales",
    "count": 10,
    "icon": "Target"
  },
  {
    "id": "engineering",
    "name": "Engineering / Technical",
    "count": 10,
    "icon": "Wrench"
  },
  {
    "id": "student",
    "name": "Student / Fresher / Internship",
    "count": 10,
    "icon": "GraduationCap"
  },
  {
    "id": "healthcare",
    "name": "Healthcare / Education / Research",
    "count": 10,
    "icon": "BookOpen"
  },
  {
    "id": "creative",
    "name": "Creative / Designer / Media",
    "count": 10,
    "icon": "Palette"
  }
];

export const EXPERIENCE_LEVELS = [
  {
    "id": "all",
    "label": "All Experience Levels"
  },
  {
    "id": "student",
    "label": "Student / Campus"
  },
  {
    "id": "fresher",
    "label": "Fresher / Entry-Level"
  },
  {
    "id": "junior",
    "label": "Junior (1-3 yrs)"
  },
  {
    "id": "mid",
    "label": "Mid-Level (3-6 yrs)"
  },
  {
    "id": "senior",
    "label": "Senior Professional (6-10 yrs)"
  },
  {
    "id": "lead",
    "label": "Team Lead / Staff"
  },
  {
    "id": "executive",
    "label": "Executive (VP, C-Suite, Director)"
  },
  {
    "id": "academic",
    "label": "Academic / Researcher"
  }
];

export const INDUSTRIES = [
  {
    "id": "all",
    "label": "All Industries"
  },
  {
    "id": "technology",
    "label": "Technology & Software"
  },
  {
    "id": "data_ai",
    "label": "Data Science & AI/ML"
  },
  {
    "id": "finance",
    "label": "Finance, Banking & Accounting"
  },
  {
    "id": "business",
    "label": "Business, Strategy & Management"
  },
  {
    "id": "marketing",
    "label": "Marketing, Sales & Growth"
  },
  {
    "id": "engineering",
    "label": "Engineering & Technical Operations"
  },
  {
    "id": "healthcare",
    "label": "Healthcare, Medicine & Bio"
  },
  {
    "id": "education",
    "label": "Education, Academia & Research"
  },
  {
    "id": "creative",
    "label": "Design, Media & Creative Arts"
  }
];

export const TOTAL_TEMPLATES_COUNT = 100;

export const TEMPLATE_REGISTRY = [
  {
    "id": "ats-classic",
    "name": "Traditional ATS Classic",
    "category": "ATS-Friendly / Traditional",
    "categoryId": "ats",
    "categoryName": "ATS-Friendly / Traditional",
    "roles": [
      "All Roles",
      "Corporate Professional",
      "Generalist"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "100% linear pass-through certified for Workday, Taleo, and Greenhouse ATS engines.",
    "rating": 4.9,
    "industry": "ATS-Friendly / Traditional"
  },
  {
    "id": "ats-executive",
    "name": "Clean ATS Executive",
    "category": "ATS-Friendly / Traditional",
    "categoryId": "ats",
    "categoryName": "ATS-Friendly / Traditional",
    "roles": [
      "VP",
      "Director",
      "Executive"
    ],
    "experienceLevels": [
      "senior",
      "executive"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "navy",
      "name": "Oxford Navy",
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#172554",
      "muted": "#475569",
      "border": "#cbd5e1"
    },
    "colors": {
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "text": "#172554",
      "bg": "#ffffff",
      "border": "#cbd5e1"
    },
    "typography": {
      "heading": "Playfair Display",
      "body": "Inter, sans-serif",
      "headingFont": "Playfair Display, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Playfair Display, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Understated serif headers with linear corporate hierarchy.",
    "rating": 4.9,
    "industry": "ATS-Friendly / Traditional"
  },
  {
    "id": "ats-minimal",
    "name": "Modern Minimal ATS",
    "category": "ATS-Friendly / Traditional",
    "categoryId": "ats",
    "categoryName": "ATS-Friendly / Traditional",
    "roles": [
      "Analyst",
      "Associate",
      "Coordinator"
    ],
    "experienceLevels": [
      "junior",
      "mid"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "minimal",
    "bulletStyle": "dash",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Clean borderless sections with high information density.",
    "rating": 4.9,
    "industry": "ATS-Friendly / Traditional"
  },
  {
    "id": "ats-corporate",
    "name": "Corporate Standard ATS",
    "category": "ATS-Friendly / Traditional",
    "categoryId": "ats",
    "categoryName": "ATS-Friendly / Traditional",
    "roles": [
      "Operations Manager",
      "General Manager"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Roboto",
      "body": "Inter, sans-serif",
      "headingFont": "Roboto, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Roboto, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Classic Fortune 500 format with bold metadata tags.",
    "rating": 4.9,
    "industry": "ATS-Friendly / Traditional"
  },
  {
    "id": "ats-compact",
    "name": "Compact High-Density ATS",
    "category": "ATS-Friendly / Traditional",
    "categoryId": "ats",
    "categoryName": "ATS-Friendly / Traditional",
    "roles": [
      "Specialist",
      "Consultant"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "Lato",
      "body": "Inter, sans-serif",
      "headingFont": "Lato, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Lato, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Ultra space-efficient layout fitting maximum experience cleanly.",
    "rating": 4.9,
    "industry": "ATS-Friendly / Traditional"
  },
  {
    "id": "ats-federal",
    "name": "Government & Federal ATS",
    "category": "ATS-Friendly / Traditional",
    "categoryId": "ats",
    "categoryName": "ATS-Friendly / Traditional",
    "roles": [
      "Civil Service",
      "Federal Officer",
      "Public Sector"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "navy",
      "name": "Oxford Navy",
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#172554",
      "muted": "#475569",
      "border": "#cbd5e1"
    },
    "colors": {
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "text": "#172554",
      "bg": "#ffffff",
      "border": "#cbd5e1"
    },
    "typography": {
      "heading": "Merriweather",
      "body": "Inter, sans-serif",
      "headingFont": "Merriweather, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Merriweather, sans-serif",
    "dividerStyle": "double",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Formal multi-level compliance structure with verified security clearance tags.",
    "rating": 4.9,
    "industry": "ATS-Friendly / Traditional"
  },
  {
    "id": "ats-consulting",
    "name": "Management Consulting ATS",
    "category": "ATS-Friendly / Traditional",
    "categoryId": "ats",
    "categoryName": "ATS-Friendly / Traditional",
    "roles": [
      "Management Consultant",
      "Engagement Manager"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Structured metrics-first bullet styling tailored for MBB recruiters.",
    "rating": 4.9,
    "industry": "ATS-Friendly / Traditional"
  },
  {
    "id": "ats-banking",
    "name": "Wall Street Traditional ATS",
    "category": "ATS-Friendly / Traditional",
    "categoryId": "ats",
    "categoryName": "ATS-Friendly / Traditional",
    "roles": [
      "Financial Analyst",
      "Associate Banker"
    ],
    "experienceLevels": [
      "junior",
      "mid"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "Playfair Display",
      "body": "Inter, sans-serif",
      "headingFont": "Playfair Display, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Playfair Display, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Rigorous Wall Street single-column format with strict chronological priority.",
    "rating": 4.9,
    "industry": "ATS-Friendly / Traditional"
  },
  {
    "id": "ats-legal",
    "name": "Legal & Compliance ATS",
    "category": "ATS-Friendly / Traditional",
    "categoryId": "ats",
    "categoryName": "ATS-Friendly / Traditional",
    "roles": [
      "Legal Counsel",
      "Compliance Officer",
      "Attorney"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "burgundy",
      "name": "Imperial Burgundy",
      "primary": "#500724",
      "secondary": "#be123c",
      "accent": "#be123c",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#380415",
      "muted": "#706e66",
      "border": "#fce7f3"
    },
    "colors": {
      "primary": "#500724",
      "secondary": "#be123c",
      "accent": "#be123c",
      "text": "#380415",
      "bg": "#ffffff",
      "border": "#fce7f3"
    },
    "typography": {
      "heading": "Lora",
      "body": "Inter, sans-serif",
      "headingFont": "Lora, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Lora, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Formal bar-admissions structure with academic distinction.",
    "rating": 4.9,
    "industry": "ATS-Friendly / Traditional"
  },
  {
    "id": "ats-certified",
    "name": "Certified Professional ATS",
    "category": "ATS-Friendly / Traditional",
    "categoryId": "ats",
    "categoryName": "ATS-Friendly / Traditional",
    "roles": [
      "Project Manager",
      "Scrum Master",
      "PMP"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "emerald",
      "name": "Nordic Emerald",
      "primary": "#064e3b",
      "secondary": "#059669",
      "accent": "#059669",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#022c22",
      "muted": "#4b5563",
      "border": "#d1fae5"
    },
    "colors": {
      "primary": "#064e3b",
      "secondary": "#059669",
      "accent": "#059669",
      "text": "#022c22",
      "bg": "#ffffff",
      "border": "#d1fae5"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "check",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Prominent credential bar highlighting PMP, CISSP, and AWS certifications.",
    "rating": 4.9,
    "industry": "ATS-Friendly / Traditional"
  },
  {
    "id": "dev-senior-swe",
    "name": "Google L5/L6 Senior SWE",
    "category": "Software Developer / IT",
    "categoryId": "software",
    "categoryName": "Software Developer / IT",
    "roles": [
      "Senior SWE",
      "Staff Engineer",
      "Backend Developer"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Calibrated to Google, Meta, and Stripe engineering hiring bars.",
    "rating": 4.9,
    "industry": "Software Developer / IT"
  },
  {
    "id": "dev-fullstack",
    "name": "Full Stack Systems Architect",
    "category": "Software Developer / IT",
    "categoryId": "software",
    "categoryName": "Software Developer / IT",
    "roles": [
      "Full Stack Engineer",
      "Solutions Architect"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "right",
    "palette": {
      "id": "indigo",
      "name": "Electric Indigo",
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#1e1b4b",
      "muted": "#64748b",
      "border": "#e0e7ff"
    },
    "colors": {
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "text": "#1e1b4b",
      "bg": "#ffffff",
      "border": "#e0e7ff"
    },
    "typography": {
      "heading": "JetBrains Mono",
      "body": "Inter, sans-serif",
      "headingFont": "JetBrains Mono, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "JetBrains Mono, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Dual separation of client-side frameworks and distributed backend services.",
    "rating": 4.9,
    "industry": "Software Developer / IT"
  },
  {
    "id": "dev-cloud-devops",
    "name": "Cloud Platform & DevOps Engineer",
    "category": "Software Developer / IT",
    "categoryId": "software",
    "categoryName": "Software Developer / IT",
    "roles": [
      "DevOps Engineer",
      "Cloud Architect",
      "SRE"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "sidebar-left",
    "sidebar": "left",
    "palette": {
      "id": "cyan",
      "name": "Cyberpunk Cyan",
      "primary": "#083344",
      "secondary": "#0891b2",
      "accent": "#0891b2",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#082f49",
      "muted": "#64748b",
      "border": "#cffafe"
    },
    "colors": {
      "primary": "#083344",
      "secondary": "#0891b2",
      "accent": "#0891b2",
      "text": "#082f49",
      "bg": "#ffffff",
      "border": "#cffafe"
    },
    "typography": {
      "heading": "Fira Code",
      "body": "Inter, sans-serif",
      "headingFont": "Fira Code, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Fira Code, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Dedicated infrastructure matrix for Kubernetes, Terraform, and AWS.",
    "rating": 4.9,
    "industry": "Software Developer / IT"
  },
  {
    "id": "dev-backend-go",
    "name": "High-Concurrency Backend Engineer",
    "category": "Software Developer / IT",
    "categoryId": "software",
    "categoryName": "Software Developer / IT",
    "roles": [
      "Go Developer",
      "Distributed Systems Engineer"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "JetBrains Mono",
      "body": "Inter, sans-serif",
      "headingFont": "JetBrains Mono, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "JetBrains Mono, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "dash",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Focus on throughput, micro-benchmarks, and low-latency architectures.",
    "rating": 4.9,
    "industry": "Software Developer / IT"
  },
  {
    "id": "dev-frontend-react",
    "name": "Modern Frontend & UI Architect",
    "category": "Software Developer / IT",
    "categoryId": "software",
    "categoryName": "Software Developer / IT",
    "roles": [
      "Frontend Engineer",
      "React Developer",
      "UI Architect"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 97,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "right",
    "palette": {
      "id": "violet",
      "name": "Fintech Violet",
      "primary": "#3b0764",
      "secondary": "#7c3aed",
      "accent": "#7c3aed",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#2e1065",
      "muted": "#6b7280",
      "border": "#ede9fe"
    },
    "colors": {
      "primary": "#3b0764",
      "secondary": "#7c3aed",
      "accent": "#7c3aed",
      "text": "#2e1065",
      "bg": "#ffffff",
      "border": "#ede9fe"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Showcases web performance metrics, Design Systems, and Core Web Vitals.",
    "rating": 4.9,
    "industry": "Software Developer / IT"
  },
  {
    "id": "dev-mobile-ios",
    "name": "iOS & Mobile Systems Engineer",
    "category": "Software Developer / IT",
    "categoryId": "software",
    "categoryName": "Software Developer / IT",
    "roles": [
      "iOS Developer",
      "Android Engineer",
      "Mobile Lead"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "indigo",
      "name": "Electric Indigo",
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#1e1b4b",
      "muted": "#64748b",
      "border": "#e0e7ff"
    },
    "colors": {
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "text": "#1e1b4b",
      "bg": "#ffffff",
      "border": "#e0e7ff"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Highlights App Store metrics, SwiftUI/Kotlin architecture, and device telemetry.",
    "rating": 4.9,
    "industry": "Software Developer / IT"
  },
  {
    "id": "dev-cybersecurity",
    "name": "InfoSec & Cybersecurity Architect",
    "category": "Software Developer / IT",
    "categoryId": "software",
    "categoryName": "Software Developer / IT",
    "roles": [
      "Security Engineer",
      "SOC Analyst",
      "Penetration Tester"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "crimson",
      "name": "Harvard Crimson",
      "primary": "#7f1d1d",
      "secondary": "#dc2626",
      "accent": "#dc2626",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#450a0a",
      "muted": "#57534e",
      "border": "#fee2e2"
    },
    "colors": {
      "primary": "#7f1d1d",
      "secondary": "#dc2626",
      "accent": "#dc2626",
      "text": "#450a0a",
      "bg": "#ffffff",
      "border": "#fee2e2"
    },
    "typography": {
      "heading": "Fira Code",
      "body": "Inter, sans-serif",
      "headingFont": "Fira Code, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Fira Code, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Structured NIST/ISO framework matrices with CVE vulnerability disclosures.",
    "rating": 4.9,
    "industry": "Software Developer / IT"
  },
  {
    "id": "dev-systems-embedded",
    "name": "Embedded Systems & Firmware Engineer",
    "category": "Software Developer / IT",
    "categoryId": "software",
    "categoryName": "Software Developer / IT",
    "roles": [
      "Embedded Developer",
      "Firmware Engineer",
      "IoT Lead"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "teal",
      "name": "Deep Teal",
      "primary": "#134e4a",
      "secondary": "#0d9488",
      "accent": "#0d9488",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#042f2e",
      "muted": "#52525b",
      "border": "#ccfbf1"
    },
    "colors": {
      "primary": "#134e4a",
      "secondary": "#0d9488",
      "accent": "#0d9488",
      "text": "#042f2e",
      "bg": "#ffffff",
      "border": "#ccfbf1"
    },
    "typography": {
      "heading": "Roboto",
      "body": "Inter, sans-serif",
      "headingFont": "Roboto, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Roboto, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "dash",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Dedicated RTOS, hardware interface, and low-level C/C++ domain matrix.",
    "rating": 4.9,
    "industry": "Software Developer / IT"
  },
  {
    "id": "dev-qa-automation",
    "name": "Principal SDET & Test Automation",
    "category": "Software Developer / IT",
    "categoryId": "software",
    "categoryName": "Software Developer / IT",
    "roles": [
      "SDET",
      "QA Lead",
      "Test Automation Engineer"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "left",
    "palette": {
      "id": "emerald",
      "name": "Nordic Emerald",
      "primary": "#064e3b",
      "secondary": "#059669",
      "accent": "#059669",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#022c22",
      "muted": "#4b5563",
      "border": "#d1fae5"
    },
    "colors": {
      "primary": "#064e3b",
      "secondary": "#059669",
      "accent": "#059669",
      "text": "#022c22",
      "bg": "#ffffff",
      "border": "#d1fae5"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "check",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Quality pipelines, Playwright/Selenium frameworks, and CI/CD gates.",
    "rating": 4.9,
    "industry": "Software Developer / IT"
  },
  {
    "id": "dev-tech-lead",
    "name": "Staff Engineer & Tech Lead",
    "category": "Software Developer / IT",
    "categoryId": "software",
    "categoryName": "Software Developer / IT",
    "roles": [
      "Tech Lead",
      "Principal Engineer",
      "Director of Engineering"
    ],
    "experienceLevels": [
      "senior",
      "executive"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "double",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Highlights architectural governance, system scalability, and engineering mentorship.",
    "rating": 4.9,
    "industry": "Software Developer / IT"
  },
  {
    "id": "ds-applied-scientist",
    "name": "Applied AI & LLM Scientist",
    "category": "Data Science / AI / ML",
    "categoryId": "datascience",
    "categoryName": "Data Science / AI / ML",
    "roles": [
      "AI Scientist",
      "LLM Engineer",
      "GenAI Researcher"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "violet",
      "name": "Fintech Violet",
      "primary": "#3b0764",
      "secondary": "#7c3aed",
      "accent": "#7c3aed",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#2e1065",
      "muted": "#6b7280",
      "border": "#ede9fe"
    },
    "colors": {
      "primary": "#3b0764",
      "secondary": "#7c3aed",
      "accent": "#7c3aed",
      "text": "#2e1065",
      "bg": "#ffffff",
      "border": "#ede9fe"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Highlights model training, RAG pipelines, fine-tuning, and arXiv publications.",
    "rating": 4.9,
    "industry": "Data Science / AI / ML"
  },
  {
    "id": "ds-data-engineer",
    "name": "Big Data & Lakehouse Architect",
    "category": "Data Science / AI / ML",
    "categoryId": "datascience",
    "categoryName": "Data Science / AI / ML",
    "roles": [
      "Data Engineer",
      "Lakehouse Architect",
      "ETL Developer"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "left",
    "palette": {
      "id": "cyan",
      "name": "Cyberpunk Cyan",
      "primary": "#083344",
      "secondary": "#0891b2",
      "accent": "#0891b2",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#082f49",
      "muted": "#64748b",
      "border": "#cffafe"
    },
    "colors": {
      "primary": "#083344",
      "secondary": "#0891b2",
      "accent": "#0891b2",
      "text": "#082f49",
      "bg": "#ffffff",
      "border": "#cffafe"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Spark, Databricks, Snowflake, and streaming pipeline throughput.",
    "rating": 4.9,
    "industry": "Data Science / AI / ML"
  },
  {
    "id": "ds-mlops-engineer",
    "name": "Production MLOps Engineer",
    "category": "Data Science / AI / ML",
    "categoryId": "datascience",
    "categoryName": "Data Science / AI / ML",
    "roles": [
      "MLOps Engineer",
      "ML Infrastructure Lead"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "sidebar-left",
    "sidebar": "left",
    "palette": {
      "id": "indigo",
      "name": "Electric Indigo",
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#1e1b4b",
      "muted": "#64748b",
      "border": "#e0e7ff"
    },
    "colors": {
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "text": "#1e1b4b",
      "bg": "#ffffff",
      "border": "#e0e7ff"
    },
    "typography": {
      "heading": "JetBrains Mono",
      "body": "Inter, sans-serif",
      "headingFont": "JetBrains Mono, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "JetBrains Mono, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Model registry, drift monitoring, Kubeflow, and serving latency metrics.",
    "rating": 4.9,
    "industry": "Data Science / AI / ML"
  },
  {
    "id": "ds-bi-analyst",
    "name": "Enterprise BI & Analytics Lead",
    "category": "Data Science / AI / ML",
    "categoryId": "datascience",
    "categoryName": "Data Science / AI / ML",
    "roles": [
      "BI Analyst",
      "Tableau Specialist",
      "PowerBI Developer"
    ],
    "experienceLevels": [
      "junior",
      "mid"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "navy",
      "name": "Oxford Navy",
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#172554",
      "muted": "#475569",
      "border": "#cbd5e1"
    },
    "colors": {
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "text": "#172554",
      "bg": "#ffffff",
      "border": "#cbd5e1"
    },
    "typography": {
      "heading": "Roboto",
      "body": "Inter, sans-serif",
      "headingFont": "Roboto, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Roboto, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Clear visualization dashboards, SQL optimization, and stakeholder KPI delivery.",
    "rating": 4.9,
    "industry": "Data Science / AI / ML"
  },
  {
    "id": "ds-data-architect",
    "name": "Enterprise Data Architect",
    "category": "Data Science / AI / ML",
    "categoryId": "datascience",
    "categoryName": "Data Science / AI / ML",
    "roles": [
      "Data Architect",
      "CDO",
      "Head of Data"
    ],
    "experienceLevels": [
      "senior",
      "executive"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "double",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Data governance, Medallion Lakehouse schemas, and enterprise compliance.",
    "rating": 4.9,
    "industry": "Data Science / AI / ML"
  },
  {
    "id": "ds-nlp-genai",
    "name": "Generative AI & Agentic Systems",
    "category": "Data Science / AI / ML",
    "categoryId": "datascience",
    "categoryName": "Data Science / AI / ML",
    "roles": [
      "Agentic AI Engineer",
      "NLP Scientist"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 97,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "violet",
      "name": "Fintech Violet",
      "primary": "#3b0764",
      "secondary": "#7c3aed",
      "accent": "#7c3aed",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#2e1065",
      "muted": "#6b7280",
      "border": "#ede9fe"
    },
    "colors": {
      "primary": "#3b0764",
      "secondary": "#7c3aed",
      "accent": "#7c3aed",
      "text": "#2e1065",
      "bg": "#ffffff",
      "border": "#ede9fe"
    },
    "typography": {
      "heading": "Fira Code",
      "body": "Inter, sans-serif",
      "headingFont": "Fira Code, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Fira Code, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Autonomous agent workflows, LangGraph, tool-calling LLMs, and prompt evaluations.",
    "rating": 4.9,
    "industry": "Data Science / AI / ML"
  },
  {
    "id": "ds-quant-analyst",
    "name": "Quantitative Research Analyst",
    "category": "Data Science / AI / ML",
    "categoryId": "datascience",
    "categoryName": "Data Science / AI / ML",
    "roles": [
      "Quant Analyst",
      "Financial Engineer"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "Merriweather",
      "body": "Inter, sans-serif",
      "headingFont": "Merriweather, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Merriweather, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "dash",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Stochastic calculus, statistical arbitrage, and algorithmic trading systems.",
    "rating": 4.9,
    "industry": "Data Science / AI / ML"
  },
  {
    "id": "ds-analytics-engineer",
    "name": "Modern Analytics Engineer",
    "category": "Data Science / AI / ML",
    "categoryId": "datascience",
    "categoryName": "Data Science / AI / ML",
    "roles": [
      "Analytics Engineer",
      "dbt Specialist"
    ],
    "experienceLevels": [
      "junior",
      "mid"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "right",
    "palette": {
      "id": "teal",
      "name": "Deep Teal",
      "primary": "#134e4a",
      "secondary": "#0d9488",
      "accent": "#0d9488",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#042f2e",
      "muted": "#52525b",
      "border": "#ccfbf1"
    },
    "colors": {
      "primary": "#134e4a",
      "secondary": "#0d9488",
      "accent": "#0d9488",
      "text": "#042f2e",
      "bg": "#ffffff",
      "border": "#ccfbf1"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Data modeling with dbt, semantic layer definitions, and warehouse schemas.",
    "rating": 4.9,
    "industry": "Data Science / AI / ML"
  },
  {
    "id": "ds-computer-vision",
    "name": "Computer Vision & Robotics Engineer",
    "category": "Data Science / AI / ML",
    "categoryId": "datascience",
    "categoryName": "Data Science / AI / ML",
    "roles": [
      "Computer Vision Engineer",
      "Robotics AI Specialist"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "cyan",
      "name": "Cyberpunk Cyan",
      "primary": "#083344",
      "secondary": "#0891b2",
      "accent": "#0891b2",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#082f49",
      "muted": "#64748b",
      "border": "#cffafe"
    },
    "colors": {
      "primary": "#083344",
      "secondary": "#0891b2",
      "accent": "#0891b2",
      "text": "#082f49",
      "bg": "#ffffff",
      "border": "#cffafe"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Edge inference, tensor optimization, YOLO, and robotic perception.",
    "rating": 4.9,
    "industry": "Data Science / AI / ML"
  },
  {
    "id": "ds-research-lead",
    "name": "Head of Data Science & Research",
    "category": "Data Science / AI / ML",
    "categoryId": "datascience",
    "categoryName": "Data Science / AI / ML",
    "roles": [
      "Head of AI",
      "Director of Data Science"
    ],
    "experienceLevels": [
      "senior",
      "executive"
    ],
    "atsFriendly": true,
    "atsScore": 97,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "indigo",
      "name": "Electric Indigo",
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#1e1b4b",
      "muted": "#64748b",
      "border": "#e0e7ff"
    },
    "colors": {
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "text": "#1e1b4b",
      "bg": "#ffffff",
      "border": "#e0e7ff"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "double",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Strategic AI roadmaps, patents, and team building from scratch.",
    "rating": 4.9,
    "industry": "Data Science / AI / ML"
  },
  {
    "id": "biz-product-manager",
    "name": "Principal Product Manager",
    "category": "Business / Management",
    "categoryId": "business",
    "categoryName": "Business / Management",
    "roles": [
      "Product Manager",
      "Group PM",
      "VP of Product"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Feature adoption, North Star metrics, roadmap ownership, and customer interviews.",
    "rating": 4.9,
    "industry": "Business / Management"
  },
  {
    "id": "biz-strategy-ops",
    "name": "Strategy & Business Operations Lead",
    "category": "Business / Management",
    "categoryId": "business",
    "categoryName": "Business / Management",
    "roles": [
      "BizOps Manager",
      "Strategy Director"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "left",
    "palette": {
      "id": "navy",
      "name": "Oxford Navy",
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#172554",
      "muted": "#475569",
      "border": "#cbd5e1"
    },
    "colors": {
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "text": "#172554",
      "bg": "#ffffff",
      "border": "#cbd5e1"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Market entry models, cross-functional OKRs, and operational efficiency.",
    "rating": 4.9,
    "industry": "Business / Management"
  },
  {
    "id": "biz-program-director",
    "name": "Enterprise Program Director",
    "category": "Business / Management",
    "categoryId": "business",
    "categoryName": "Business / Management",
    "roles": [
      "Program Manager",
      "Director of PMO"
    ],
    "experienceLevels": [
      "senior",
      "executive"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "Roboto",
      "body": "Inter, sans-serif",
      "headingFont": "Roboto, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Roboto, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Multi-million dollar portfolio management and global vendor negotiations.",
    "rating": 4.9,
    "industry": "Business / Management"
  },
  {
    "id": "biz-scrum-agile",
    "name": "Agile Coach & Transformation Lead",
    "category": "Business / Management",
    "categoryId": "business",
    "categoryName": "Business / Management",
    "roles": [
      "Agile Coach",
      "Scrum Master",
      "RTE"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "right",
    "palette": {
      "id": "teal",
      "name": "Deep Teal",
      "primary": "#134e4a",
      "secondary": "#0d9488",
      "accent": "#0d9488",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#042f2e",
      "muted": "#52525b",
      "border": "#ccfbf1"
    },
    "colors": {
      "primary": "#134e4a",
      "secondary": "#0d9488",
      "accent": "#0d9488",
      "text": "#042f2e",
      "bg": "#ffffff",
      "border": "#ccfbf1"
    },
    "typography": {
      "heading": "Lato",
      "body": "Inter, sans-serif",
      "headingFont": "Lato, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Lato, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "check",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Scaled Agile (SAFe), sprint velocity optimization, and team empowerment.",
    "rating": 4.9,
    "industry": "Business / Management"
  },
  {
    "id": "biz-general-manager",
    "name": "General Manager & P&L Owner",
    "category": "Business / Management",
    "categoryId": "business",
    "categoryName": "Business / Management",
    "roles": [
      "General Manager",
      "Managing Director",
      "COO"
    ],
    "experienceLevels": [
      "senior",
      "executive"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "navy",
      "name": "Oxford Navy",
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#172554",
      "muted": "#475569",
      "border": "#cbd5e1"
    },
    "colors": {
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "text": "#172554",
      "bg": "#ffffff",
      "border": "#cbd5e1"
    },
    "typography": {
      "heading": "Playfair Display",
      "body": "Inter, sans-serif",
      "headingFont": "Playfair Display, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Playfair Display, sans-serif",
    "dividerStyle": "double",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Full P&L responsibility, gross margin expansion, and regional expansion.",
    "rating": 4.9,
    "industry": "Business / Management"
  },
  {
    "id": "biz-supply-chain",
    "name": "Global Supply Chain & Logistics Director",
    "category": "Business / Management",
    "categoryId": "business",
    "categoryName": "Business / Management",
    "roles": [
      "Supply Chain Director",
      "Procurement Manager"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Vendor resilience, freight cost reductions, and inventory turnaround times.",
    "rating": 4.9,
    "industry": "Business / Management"
  },
  {
    "id": "biz-management-consultant",
    "name": "MBB Management Consultant",
    "category": "Business / Management",
    "categoryId": "business",
    "categoryName": "Business / Management",
    "roles": [
      "Management Consultant",
      "Engagement Manager"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Pyramid principle communication, board-level impact, and restructuring.",
    "rating": 4.9,
    "industry": "Business / Management"
  },
  {
    "id": "biz-chief-of-staff",
    "name": "Corporate Chief of Staff",
    "category": "Business / Management",
    "categoryId": "business",
    "categoryName": "Business / Management",
    "roles": [
      "Chief of Staff",
      "VP Strategic Initiatives"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "left",
    "palette": {
      "id": "indigo",
      "name": "Electric Indigo",
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#1e1b4b",
      "muted": "#64748b",
      "border": "#e0e7ff"
    },
    "colors": {
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "text": "#1e1b4b",
      "bg": "#ffffff",
      "border": "#e0e7ff"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Executive shadow management, board presentation crafting, and quarterly reviews.",
    "rating": 4.9,
    "industry": "Business / Management"
  },
  {
    "id": "biz-bizdev-partnerships",
    "name": "Strategic Partnerships & BizDev Lead",
    "category": "Business / Management",
    "categoryId": "business",
    "categoryName": "Business / Management",
    "roles": [
      "Head of Partnerships",
      "Business Development Director"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 97,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "sidebar-left",
    "sidebar": "left",
    "palette": {
      "id": "violet",
      "name": "Fintech Violet",
      "primary": "#3b0764",
      "secondary": "#7c3aed",
      "accent": "#7c3aed",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#2e1065",
      "muted": "#6b7280",
      "border": "#ede9fe"
    },
    "colors": {
      "primary": "#3b0764",
      "secondary": "#7c3aed",
      "accent": "#7c3aed",
      "text": "#2e1065",
      "bg": "#ffffff",
      "border": "#ede9fe"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Ecosystem integrations, co-selling agreements, and revenue sharing models.",
    "rating": 4.9,
    "industry": "Business / Management"
  },
  {
    "id": "biz-executive-director",
    "name": "Managing Director & Board Member",
    "category": "Business / Management",
    "categoryId": "business",
    "categoryName": "Business / Management",
    "roles": [
      "Managing Director",
      "Board Advisor",
      "CEO"
    ],
    "experienceLevels": [
      "executive"
    ],
    "atsFriendly": false,
    "atsScore": 95,
    "photoPolicy": "required",
    "photoRequired": true,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "burgundy",
      "name": "Imperial Burgundy",
      "primary": "#500724",
      "secondary": "#be123c",
      "accent": "#be123c",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#380415",
      "muted": "#706e66",
      "border": "#fce7f3"
    },
    "colors": {
      "primary": "#500724",
      "secondary": "#be123c",
      "accent": "#be123c",
      "text": "#380415",
      "bg": "#ffffff",
      "border": "#fce7f3"
    },
    "typography": {
      "heading": "Playfair Display",
      "body": "Inter, sans-serif",
      "headingFont": "Playfair Display, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Playfair Display, sans-serif",
    "dividerStyle": "double",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Senior leadership avatar profile tailored for investor and board presentations.",
    "rating": 4.9,
    "industry": "Business / Management"
  },
  {
    "id": "fin-investment-banker",
    "name": "Investment Banking Analyst",
    "category": "Finance / Accounting",
    "categoryId": "finance",
    "categoryName": "Finance / Accounting",
    "roles": [
      "IB Analyst",
      "Associate Banker",
      "M&A Associate"
    ],
    "experienceLevels": [
      "junior",
      "mid"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "Merriweather",
      "body": "Inter, sans-serif",
      "headingFont": "Merriweather, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Merriweather, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Rigorous DCF, LBO, and pitchbook transaction records.",
    "rating": 4.9,
    "industry": "Finance / Accounting"
  },
  {
    "id": "fin-private-equity",
    "name": "Private Equity & LBO Associate",
    "category": "Finance / Accounting",
    "categoryId": "finance",
    "categoryName": "Finance / Accounting",
    "roles": [
      "PE Associate",
      "Investment Principal"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "navy",
      "name": "Oxford Navy",
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#172554",
      "muted": "#475569",
      "border": "#cbd5e1"
    },
    "colors": {
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "text": "#172554",
      "bg": "#ffffff",
      "border": "#cbd5e1"
    },
    "typography": {
      "heading": "Playfair Display",
      "body": "Inter, sans-serif",
      "headingFont": "Playfair Display, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Playfair Display, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Portfolio company EBITDA expansion and buyout investment committee memos.",
    "rating": 4.9,
    "industry": "Finance / Accounting"
  },
  {
    "id": "fin-cpa-controller",
    "name": "Corporate Controller & CPA",
    "category": "Finance / Accounting",
    "categoryId": "finance",
    "categoryName": "Finance / Accounting",
    "roles": [
      "Controller",
      "Accounting Director",
      "CPA"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Roboto",
      "body": "Inter, sans-serif",
      "headingFont": "Roboto, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Roboto, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "GAAP/IFRS compliance, audit management, and SEC reporting accuracy.",
    "rating": 4.9,
    "industry": "Finance / Accounting"
  },
  {
    "id": "fin-fpna-manager",
    "name": "Senior FP&A Manager",
    "category": "Finance / Accounting",
    "categoryId": "finance",
    "categoryName": "Finance / Accounting",
    "roles": [
      "FP&A Manager",
      "Financial Planning Director"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "left",
    "palette": {
      "id": "teal",
      "name": "Deep Teal",
      "primary": "#134e4a",
      "secondary": "#0d9488",
      "accent": "#0d9488",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#042f2e",
      "muted": "#52525b",
      "border": "#ccfbf1"
    },
    "colors": {
      "primary": "#134e4a",
      "secondary": "#0d9488",
      "accent": "#0d9488",
      "text": "#042f2e",
      "bg": "#ffffff",
      "border": "#ccfbf1"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Annual budgeting, variance analysis, rolling forecasts, and scenario modeling.",
    "rating": 4.9,
    "industry": "Finance / Accounting"
  },
  {
    "id": "fin-equity-research",
    "name": "Equity Research Analyst",
    "category": "Finance / Accounting",
    "categoryId": "finance",
    "categoryName": "Finance / Accounting",
    "roles": [
      "Equity Research Associate",
      "CFA Candidate"
    ],
    "experienceLevels": [
      "junior",
      "mid"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "Lora",
      "body": "Inter, sans-serif",
      "headingFont": "Lora, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Lora, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "dash",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Sector coverage initiation reports, EPS forecasting, and target price modeling.",
    "rating": 4.9,
    "industry": "Finance / Accounting"
  },
  {
    "id": "fin-internal-audit",
    "name": "Risk Management & Internal Audit Lead",
    "category": "Finance / Accounting",
    "categoryId": "finance",
    "categoryName": "Finance / Accounting",
    "roles": [
      "Internal Auditor",
      "SOX Compliance Lead"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "navy",
      "name": "Oxford Navy",
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#172554",
      "muted": "#475569",
      "border": "#cbd5e1"
    },
    "colors": {
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "text": "#172554",
      "bg": "#ffffff",
      "border": "#cbd5e1"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "double",
    "bulletStyle": "check",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "SOX controls, operational risk assessment, and fraud prevention matrices.",
    "rating": 4.9,
    "industry": "Finance / Accounting"
  },
  {
    "id": "fin-treasury-analyst",
    "name": "Corporate Treasury Analyst",
    "category": "Finance / Accounting",
    "categoryId": "finance",
    "categoryName": "Finance / Accounting",
    "roles": [
      "Treasury Analyst",
      "Cash Management Lead"
    ],
    "experienceLevels": [
      "junior",
      "mid"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "right",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Lato",
      "body": "Inter, sans-serif",
      "headingFont": "Lato, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Lato, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Liquidity optimization, FX hedging, and working capital debt facilities.",
    "rating": 4.9,
    "industry": "Finance / Accounting"
  },
  {
    "id": "fin-tax-specialist",
    "name": "Senior Tax Advisor & Planner",
    "category": "Finance / Accounting",
    "categoryId": "finance",
    "categoryName": "Finance / Accounting",
    "roles": [
      "Tax Manager",
      "International Tax Lead"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "burgundy",
      "name": "Imperial Burgundy",
      "primary": "#500724",
      "secondary": "#be123c",
      "accent": "#be123c",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#380415",
      "muted": "#706e66",
      "border": "#fce7f3"
    },
    "colors": {
      "primary": "#500724",
      "secondary": "#be123c",
      "accent": "#be123c",
      "text": "#380415",
      "bg": "#ffffff",
      "border": "#fce7f3"
    },
    "typography": {
      "heading": "Roboto",
      "body": "Inter, sans-serif",
      "headingFont": "Roboto, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Roboto, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Corporate tax provisioning, cross-border transfer pricing, and credits.",
    "rating": 4.9,
    "industry": "Finance / Accounting"
  },
  {
    "id": "fin-actuarial-analyst",
    "name": "Actuarial Science Associate",
    "category": "Finance / Accounting",
    "categoryId": "finance",
    "categoryName": "Finance / Accounting",
    "roles": [
      "Actuary",
      "Risk Modeler",
      "ASA/FSA"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "Merriweather",
      "body": "Inter, sans-serif",
      "headingFont": "Merriweather, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Merriweather, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Mortality modeling, reserve calculations, and insurance risk modeling.",
    "rating": 4.9,
    "industry": "Finance / Accounting"
  },
  {
    "id": "fin-wealth-advisor",
    "name": "Private Wealth Advisor & CFP",
    "category": "Finance / Accounting",
    "categoryId": "finance",
    "categoryName": "Finance / Accounting",
    "roles": [
      "Wealth Manager",
      "CFP",
      "Family Office Lead"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": false,
    "atsScore": 95,
    "photoPolicy": "required",
    "photoRequired": true,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "navy",
      "name": "Oxford Navy",
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#172554",
      "muted": "#475569",
      "border": "#cbd5e1"
    },
    "colors": {
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "text": "#172554",
      "bg": "#ffffff",
      "border": "#cbd5e1"
    },
    "typography": {
      "heading": "Playfair Display",
      "body": "Inter, sans-serif",
      "headingFont": "Playfair Display, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Playfair Display, sans-serif",
    "dividerStyle": "double",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Client-facing wealth stewardship portfolio with professional executive photo.",
    "rating": 4.9,
    "industry": "Finance / Accounting"
  },
  {
    "id": "mkt-growth-lead",
    "name": "Growth Marketing & Demand Gen Director",
    "category": "Marketing / Sales",
    "categoryId": "marketing",
    "categoryName": "Marketing / Sales",
    "roles": [
      "Growth Marketer",
      "Demand Gen Lead",
      "VP Marketing"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": true,
    "atsScore": 97,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "right",
    "palette": {
      "id": "indigo",
      "name": "Electric Indigo",
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#1e1b4b",
      "muted": "#64748b",
      "border": "#e0e7ff"
    },
    "colors": {
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "text": "#1e1b4b",
      "bg": "#ffffff",
      "border": "#e0e7ff"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "CAC/LTV ratios, paid acquisition scale, and viral loop experimentation.",
    "rating": 4.9,
    "industry": "Marketing / Sales"
  },
  {
    "id": "mkt-brand-director",
    "name": "Global Brand Strategy Director",
    "category": "Marketing / Sales",
    "categoryId": "marketing",
    "categoryName": "Marketing / Sales",
    "roles": [
      "Brand Director",
      "Creative Strategist"
    ],
    "experienceLevels": [
      "senior",
      "executive"
    ],
    "atsFriendly": false,
    "atsScore": 94,
    "photoPolicy": "required",
    "photoRequired": true,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "rose",
      "name": "Chic Rose",
      "primary": "#881337",
      "secondary": "#e11d48",
      "accent": "#e11d48",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#4c0519",
      "muted": "#71717a",
      "border": "#ffe4e6"
    },
    "colors": {
      "primary": "#881337",
      "secondary": "#e11d48",
      "accent": "#e11d48",
      "text": "#4c0519",
      "bg": "#ffffff",
      "border": "#ffe4e6"
    },
    "typography": {
      "heading": "Playfair Display",
      "body": "Inter, sans-serif",
      "headingFont": "Playfair Display, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Playfair Display, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "High-profile brand visual identity with required executive photo header.",
    "rating": 4.9,
    "industry": "Marketing / Sales"
  },
  {
    "id": "mkt-content-strategist",
    "name": "Editorial & Content Marketing Strategist",
    "category": "Marketing / Sales",
    "categoryId": "marketing",
    "categoryName": "Marketing / Sales",
    "roles": [
      "Content Strategist",
      "Managing Editor"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "sidebar-left",
    "sidebar": "left",
    "palette": {
      "id": "amber",
      "name": "Editorial Amber",
      "primary": "#451a03",
      "secondary": "#d97706",
      "accent": "#d97706",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#292524",
      "muted": "#78716c",
      "border": "#fef3c7"
    },
    "colors": {
      "primary": "#451a03",
      "secondary": "#d97706",
      "accent": "#d97706",
      "text": "#292524",
      "bg": "#ffffff",
      "border": "#fef3c7"
    },
    "typography": {
      "heading": "Lora",
      "body": "Inter, sans-serif",
      "headingFont": "Lora, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Lora, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Organic traffic expansion, editorial calendars, and thought leadership.",
    "rating": 4.9,
    "industry": "Marketing / Sales"
  },
  {
    "id": "mkt-seo-performance",
    "name": "Technical SEO & Performance Marketing",
    "category": "Marketing / Sales",
    "categoryId": "marketing",
    "categoryName": "Marketing / Sales",
    "roles": [
      "SEO Specialist",
      "SEM Manager"
    ],
    "experienceLevels": [
      "junior",
      "mid"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "teal",
      "name": "Deep Teal",
      "primary": "#134e4a",
      "secondary": "#0d9488",
      "accent": "#0d9488",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#042f2e",
      "muted": "#52525b",
      "border": "#ccfbf1"
    },
    "colors": {
      "primary": "#134e4a",
      "secondary": "#0d9488",
      "accent": "#0d9488",
      "text": "#042f2e",
      "bg": "#ffffff",
      "border": "#ccfbf1"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Core Web Vitals, organic keyword rankings, and multi-channel attribution.",
    "rating": 4.9,
    "industry": "Marketing / Sales"
  },
  {
    "id": "mkt-product-marketing",
    "name": "Senior Product Marketing Manager (PMM)",
    "category": "Marketing / Sales",
    "categoryId": "marketing",
    "categoryName": "Marketing / Sales",
    "roles": [
      "PMM",
      "Go-To-Market Lead"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "left",
    "palette": {
      "id": "violet",
      "name": "Fintech Violet",
      "primary": "#3b0764",
      "secondary": "#7c3aed",
      "accent": "#7c3aed",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#2e1065",
      "muted": "#6b7280",
      "border": "#ede9fe"
    },
    "colors": {
      "primary": "#3b0764",
      "secondary": "#7c3aed",
      "accent": "#7c3aed",
      "text": "#2e1065",
      "bg": "#ffffff",
      "border": "#ede9fe"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "GTM positioning, competitive battlecards, sales enablement, and launch tiers.",
    "rating": 4.9,
    "industry": "Marketing / Sales"
  },
  {
    "id": "mkt-enterprise-ae",
    "name": "Enterprise Account Executive (SaaS)",
    "category": "Marketing / Sales",
    "categoryId": "marketing",
    "categoryName": "Marketing / Sales",
    "roles": [
      "Account Executive",
      "Strategic AE"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "150%+ quota attainment, MEDDPICC methodology, and Fortune 500 contract closes.",
    "rating": 4.9,
    "industry": "Marketing / Sales"
  },
  {
    "id": "mkt-sales-director",
    "name": "VP of Global Sales & Revenue",
    "category": "Marketing / Sales",
    "categoryId": "marketing",
    "categoryName": "Marketing / Sales",
    "roles": [
      "VP Sales",
      "Chief Revenue Officer",
      "Sales Director"
    ],
    "experienceLevels": [
      "senior",
      "executive"
    ],
    "atsFriendly": false,
    "atsScore": 95,
    "photoPolicy": "required",
    "photoRequired": true,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "navy",
      "name": "Oxford Navy",
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#172554",
      "muted": "#475569",
      "border": "#cbd5e1"
    },
    "colors": {
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "text": "#172554",
      "bg": "#ffffff",
      "border": "#cbd5e1"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "double",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Executive commercial profile highlighting enterprise pipeline growth.",
    "rating": 4.9,
    "industry": "Marketing / Sales"
  },
  {
    "id": "mkt-social-influencer",
    "name": "Social Media & Community Director",
    "category": "Marketing / Sales",
    "categoryId": "marketing",
    "categoryName": "Marketing / Sales",
    "roles": [
      "Social Media Manager",
      "Community Lead"
    ],
    "experienceLevels": [
      "junior",
      "mid"
    ],
    "atsFriendly": false,
    "atsScore": 94,
    "photoPolicy": "required",
    "photoRequired": true,
    "layout": "two-column",
    "sidebar": "left",
    "palette": {
      "id": "violet",
      "name": "Fintech Violet",
      "primary": "#3b0764",
      "secondary": "#7c3aed",
      "accent": "#7c3aed",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#2e1065",
      "muted": "#6b7280",
      "border": "#ede9fe"
    },
    "colors": {
      "primary": "#3b0764",
      "secondary": "#7c3aed",
      "accent": "#7c3aed",
      "text": "#2e1065",
      "bg": "#ffffff",
      "border": "#ede9fe"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Channel follower growth, viral campaigns, engagement rates, and creator partnerships.",
    "rating": 4.9,
    "industry": "Marketing / Sales"
  },
  {
    "id": "mkt-pr-communications",
    "name": "Corporate Communications & PR Lead",
    "category": "Marketing / Sales",
    "categoryId": "marketing",
    "categoryName": "Marketing / Sales",
    "roles": [
      "PR Director",
      "Communications Manager"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": false,
    "atsScore": 95,
    "photoPolicy": "required",
    "photoRequired": true,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "burgundy",
      "name": "Imperial Burgundy",
      "primary": "#500724",
      "secondary": "#be123c",
      "accent": "#be123c",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#380415",
      "muted": "#706e66",
      "border": "#fce7f3"
    },
    "colors": {
      "primary": "#500724",
      "secondary": "#be123c",
      "accent": "#be123c",
      "text": "#380415",
      "bg": "#ffffff",
      "border": "#fce7f3"
    },
    "typography": {
      "heading": "Merriweather",
      "body": "Inter, sans-serif",
      "headingFont": "Merriweather, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Merriweather, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Media relations, tier-one press placements, crisis communications, and keynotes.",
    "rating": 4.9,
    "industry": "Marketing / Sales"
  },
  {
    "id": "mkt-ecommerce-manager",
    "name": "DTC & E-commerce Operations Manager",
    "category": "Marketing / Sales",
    "categoryId": "marketing",
    "categoryName": "Marketing / Sales",
    "roles": [
      "E-commerce Manager",
      "Shopify Plus Lead"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "right",
    "palette": {
      "id": "emerald",
      "name": "Nordic Emerald",
      "primary": "#064e3b",
      "secondary": "#059669",
      "accent": "#059669",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#022c22",
      "muted": "#4b5563",
      "border": "#d1fae5"
    },
    "colors": {
      "primary": "#064e3b",
      "secondary": "#059669",
      "accent": "#059669",
      "text": "#022c22",
      "bg": "#ffffff",
      "border": "#d1fae5"
    },
    "typography": {
      "heading": "Roboto",
      "body": "Inter, sans-serif",
      "headingFont": "Roboto, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Roboto, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "check",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "ROAS metrics, conversion rate optimization, inventory churn, and average order value.",
    "rating": 4.9,
    "industry": "Marketing / Sales"
  },
  {
    "id": "eng-mechanical-lead",
    "name": "Senior Mechanical Design Engineer",
    "category": "Engineering / Technical",
    "categoryId": "engineering",
    "categoryName": "Engineering / Technical",
    "roles": [
      "Mechanical Engineer",
      "CAD Designer",
      "FEA Analyst"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Roboto",
      "body": "Inter, sans-serif",
      "headingFont": "Roboto, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Roboto, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "SolidWorks, GD&T, FEA stress simulations, and DFM production ramp.",
    "rating": 4.9,
    "industry": "Engineering / Technical"
  },
  {
    "id": "eng-electrical-hardware",
    "name": "Hardware Architecture & PCB Engineer",
    "category": "Engineering / Technical",
    "categoryId": "engineering",
    "categoryName": "Engineering / Technical",
    "roles": [
      "Electrical Engineer",
      "PCB Designer"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "left",
    "palette": {
      "id": "cyan",
      "name": "Cyberpunk Cyan",
      "primary": "#083344",
      "secondary": "#0891b2",
      "accent": "#0891b2",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#082f49",
      "muted": "#64748b",
      "border": "#cffafe"
    },
    "colors": {
      "primary": "#083344",
      "secondary": "#0891b2",
      "accent": "#0891b2",
      "text": "#082f49",
      "bg": "#ffffff",
      "border": "#cffafe"
    },
    "typography": {
      "heading": "JetBrains Mono",
      "body": "Inter, sans-serif",
      "headingFont": "JetBrains Mono, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "JetBrains Mono, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "High-speed board layout, signal integrity, schematic capture, and EMC testing.",
    "rating": 4.9,
    "industry": "Engineering / Technical"
  },
  {
    "id": "eng-civil-structural",
    "name": "Structural & Civil Project Engineer",
    "category": "Engineering / Technical",
    "categoryId": "engineering",
    "categoryName": "Engineering / Technical",
    "roles": [
      "Civil Engineer",
      "Structural PE"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "AASHTO/IBC compliance, municipal approvals, and concrete load models.",
    "rating": 4.9,
    "industry": "Engineering / Technical"
  },
  {
    "id": "eng-aerospace-propulsion",
    "name": "Aerospace & Propulsion Systems Engineer",
    "category": "Engineering / Technical",
    "categoryId": "engineering",
    "categoryName": "Engineering / Technical",
    "roles": [
      "Aerospace Engineer",
      "Systems Lead"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "navy",
      "name": "Oxford Navy",
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#172554",
      "muted": "#475569",
      "border": "#cbd5e1"
    },
    "colors": {
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "text": "#172554",
      "bg": "#ffffff",
      "border": "#cbd5e1"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "double",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Thermal dynamics, propulsion cycles, DO-178C avionics, and mission safety.",
    "rating": 4.9,
    "industry": "Engineering / Technical"
  },
  {
    "id": "eng-chemical-process",
    "name": "Chemical Process & Materials Engineer",
    "category": "Engineering / Technical",
    "categoryId": "engineering",
    "categoryName": "Engineering / Technical",
    "roles": [
      "Process Engineer",
      "Chemical Engineer"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "teal",
      "name": "Deep Teal",
      "primary": "#134e4a",
      "secondary": "#0d9488",
      "accent": "#0d9488",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#042f2e",
      "muted": "#52525b",
      "border": "#ccfbf1"
    },
    "colors": {
      "primary": "#134e4a",
      "secondary": "#0d9488",
      "accent": "#0d9488",
      "text": "#042f2e",
      "bg": "#ffffff",
      "border": "#ccfbf1"
    },
    "typography": {
      "heading": "Roboto",
      "body": "Inter, sans-serif",
      "headingFont": "Roboto, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Roboto, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "P&ID generation, Aspen Plus modeling, yield optimization, and HAZOP reviews.",
    "rating": 4.9,
    "industry": "Engineering / Technical"
  },
  {
    "id": "eng-robotics-automation",
    "name": "Robotics & Industrial Automation Lead",
    "category": "Engineering / Technical",
    "categoryId": "engineering",
    "categoryName": "Engineering / Technical",
    "roles": [
      "Robotics Engineer",
      "PLC Programmer"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "right",
    "palette": {
      "id": "indigo",
      "name": "Electric Indigo",
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#1e1b4b",
      "muted": "#64748b",
      "border": "#e0e7ff"
    },
    "colors": {
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "text": "#1e1b4b",
      "bg": "#ffffff",
      "border": "#e0e7ff"
    },
    "typography": {
      "heading": "JetBrains Mono",
      "body": "Inter, sans-serif",
      "headingFont": "JetBrains Mono, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "JetBrains Mono, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "ROS2, robotic kinematics, industrial PLC programming, and machine vision.",
    "rating": 4.9,
    "industry": "Engineering / Technical"
  },
  {
    "id": "eng-biomedical-devices",
    "name": "Biomedical Device R&D Engineer",
    "category": "Engineering / Technical",
    "categoryId": "engineering",
    "categoryName": "Engineering / Technical",
    "roles": [
      "Biomedical Engineer",
      "FDA Regulatory Lead"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "emerald",
      "name": "Nordic Emerald",
      "primary": "#064e3b",
      "secondary": "#059669",
      "accent": "#059669",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#022c22",
      "muted": "#4b5563",
      "border": "#d1fae5"
    },
    "colors": {
      "primary": "#064e3b",
      "secondary": "#059669",
      "accent": "#059669",
      "text": "#022c22",
      "bg": "#ffffff",
      "border": "#d1fae5"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "check",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "FDA 510(k), ISO 13485 compliance, biocompatibility, and clinical trial devices.",
    "rating": 4.9,
    "industry": "Engineering / Technical"
  },
  {
    "id": "eng-environmental-sustainability",
    "name": "Environmental & Sustainability Engineer",
    "category": "Engineering / Technical",
    "categoryId": "engineering",
    "categoryName": "Engineering / Technical",
    "roles": [
      "Environmental Engineer",
      "ESG Analyst"
    ],
    "experienceLevels": [
      "junior",
      "mid"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "left",
    "palette": {
      "id": "emerald",
      "name": "Nordic Emerald",
      "primary": "#064e3b",
      "secondary": "#059669",
      "accent": "#059669",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#022c22",
      "muted": "#4b5563",
      "border": "#d1fae5"
    },
    "colors": {
      "primary": "#064e3b",
      "secondary": "#059669",
      "accent": "#059669",
      "text": "#022c22",
      "bg": "#ffffff",
      "border": "#d1fae5"
    },
    "typography": {
      "heading": "Lato",
      "body": "Inter, sans-serif",
      "headingFont": "Lato, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Lato, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Carbon footprint auditing, water reclamation, NEPA reviews, and LEED certification.",
    "rating": 4.9,
    "industry": "Engineering / Technical"
  },
  {
    "id": "eng-manufacturing-quality",
    "name": "Six Sigma Quality & Manufacturing Engineer",
    "category": "Engineering / Technical",
    "categoryId": "engineering",
    "categoryName": "Engineering / Technical",
    "roles": [
      "Quality Engineer",
      "Black Belt"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Roboto",
      "body": "Inter, sans-serif",
      "headingFont": "Roboto, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Roboto, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "PPAP, FMEA, statistical process control (SPC), and scrap reduction programs.",
    "rating": 4.9,
    "industry": "Engineering / Technical"
  },
  {
    "id": "eng-energy-renewable",
    "name": "Renewable Energy & Grid Systems Engineer",
    "category": "Engineering / Technical",
    "categoryId": "engineering",
    "categoryName": "Engineering / Technical",
    "roles": [
      "Renewable Energy Engineer",
      "Solar/Wind Lead"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "amber",
      "name": "Editorial Amber",
      "primary": "#451a03",
      "secondary": "#d97706",
      "accent": "#d97706",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#292524",
      "muted": "#78716c",
      "border": "#fef3c7"
    },
    "colors": {
      "primary": "#451a03",
      "secondary": "#d97706",
      "accent": "#d97706",
      "text": "#292524",
      "bg": "#ffffff",
      "border": "#fef3c7"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Microgrid integration, battery storage systems (BESS), and interconnection studies.",
    "rating": 4.9,
    "industry": "Engineering / Technical"
  },
  {
    "id": "stu-cs-intern",
    "name": "Computer Science Internship Candidate",
    "category": "Student / Fresher / Internship",
    "categoryId": "student",
    "categoryName": "Student / Fresher / Internship",
    "roles": [
      "CS Student",
      "Software Intern",
      "Junior Dev"
    ],
    "experienceLevels": [
      "student",
      "fresher"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "indigo",
      "name": "Electric Indigo",
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#1e1b4b",
      "muted": "#64748b",
      "border": "#e0e7ff"
    },
    "colors": {
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "text": "#1e1b4b",
      "bg": "#ffffff",
      "border": "#e0e7ff"
    },
    "typography": {
      "heading": "JetBrains Mono",
      "body": "Inter, sans-serif",
      "headingFont": "JetBrains Mono, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "JetBrains Mono, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "education",
      "projects",
      "skills",
      "experience",
      "certifications"
    ],
    "description": "Prioritizes coursework, competitive programming, and GitHub project repos.",
    "rating": 4.9,
    "industry": "Student / Fresher / Internship"
  },
  {
    "id": "stu-engineering-graduate",
    "name": "Honors Engineering Graduate",
    "category": "Student / Fresher / Internship",
    "categoryId": "student",
    "categoryName": "Student / Fresher / Internship",
    "roles": [
      "Engineering Graduate",
      "Graduate Trainee"
    ],
    "experienceLevels": [
      "student",
      "fresher"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "navy",
      "name": "Oxford Navy",
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#172554",
      "muted": "#475569",
      "border": "#cbd5e1"
    },
    "colors": {
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "text": "#172554",
      "bg": "#ffffff",
      "border": "#cbd5e1"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "square",
    "sections": [
      "education",
      "projects",
      "skills",
      "experience",
      "certifications"
    ],
    "description": "Highlights senior capstone design, GPA honors, and engineering labs.",
    "rating": 4.9,
    "industry": "Student / Fresher / Internship"
  },
  {
    "id": "stu-business-entry",
    "name": "Business Administration Fresh Graduate",
    "category": "Student / Fresher / Internship",
    "categoryId": "student",
    "categoryName": "Student / Fresher / Internship",
    "roles": [
      "Business Graduate",
      "Junior Analyst"
    ],
    "experienceLevels": [
      "student",
      "fresher"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "right",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "arrow",
    "sections": [
      "education",
      "projects",
      "skills",
      "experience",
      "certifications"
    ],
    "description": "Case competition wins, club leadership roles, and financial analysis coursework.",
    "rating": 4.9,
    "industry": "Student / Fresher / Internship"
  },
  {
    "id": "stu-first-job-minimal",
    "name": "Clean First-Job Starter",
    "category": "Student / Fresher / Internship",
    "categoryId": "student",
    "categoryName": "Student / Fresher / Internship",
    "roles": [
      "Entry Level",
      "First-time Applicant"
    ],
    "experienceLevels": [
      "student",
      "fresher"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "minimal",
    "bulletStyle": "dash",
    "sections": [
      "education",
      "projects",
      "skills",
      "experience",
      "certifications"
    ],
    "description": "Understated format ideal for applicants with 0-1 years of experience.",
    "rating": 4.9,
    "industry": "Student / Fresher / Internship"
  },
  {
    "id": "stu-project-heavy",
    "name": "Project & Hackathon Focused Student",
    "category": "Student / Fresher / Internship",
    "categoryId": "student",
    "categoryName": "Student / Fresher / Internship",
    "roles": [
      "Hackathon Winner",
      "Full Stack Student"
    ],
    "experienceLevels": [
      "student",
      "fresher"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "left",
    "palette": {
      "id": "cyan",
      "name": "Cyberpunk Cyan",
      "primary": "#083344",
      "secondary": "#0891b2",
      "accent": "#0891b2",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#082f49",
      "muted": "#64748b",
      "border": "#cffafe"
    },
    "colors": {
      "primary": "#083344",
      "secondary": "#0891b2",
      "accent": "#0891b2",
      "text": "#082f49",
      "bg": "#ffffff",
      "border": "#cffafe"
    },
    "typography": {
      "heading": "Fira Code",
      "body": "Inter, sans-serif",
      "headingFont": "Fira Code, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Fira Code, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "arrow",
    "sections": [
      "education",
      "projects",
      "skills",
      "experience",
      "certifications"
    ],
    "description": "Elevates 3-4 feature projects to the top with live deployment URLs.",
    "rating": 4.9,
    "industry": "Student / Fresher / Internship"
  },
  {
    "id": "stu-campus-leader",
    "name": "Student Body Leader & Extracurriculars",
    "category": "Student / Fresher / Internship",
    "categoryId": "student",
    "categoryName": "Student / Fresher / Internship",
    "roles": [
      "Student President",
      "Campus Ambassador"
    ],
    "experienceLevels": [
      "student",
      "fresher"
    ],
    "atsFriendly": true,
    "atsScore": 97,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "crimson",
      "name": "Harvard Crimson",
      "primary": "#7f1d1d",
      "secondary": "#dc2626",
      "accent": "#dc2626",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#450a0a",
      "muted": "#57534e",
      "border": "#fee2e2"
    },
    "colors": {
      "primary": "#7f1d1d",
      "secondary": "#dc2626",
      "accent": "#dc2626",
      "text": "#450a0a",
      "bg": "#ffffff",
      "border": "#fee2e2"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "education",
      "projects",
      "skills",
      "experience",
      "certifications"
    ],
    "description": "Highlights campus elections, event organization, and student representation.",
    "rating": 4.9,
    "industry": "Student / Fresher / Internship"
  },
  {
    "id": "stu-finance-trainee",
    "name": "Financial Analyst Management Trainee",
    "category": "Student / Fresher / Internship",
    "categoryId": "student",
    "categoryName": "Student / Fresher / Internship",
    "roles": [
      "Finance Trainee",
      "Junior Auditor"
    ],
    "experienceLevels": [
      "student",
      "fresher"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "Playfair Display",
      "body": "Inter, sans-serif",
      "headingFont": "Playfair Display, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Playfair Display, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "education",
      "projects",
      "skills",
      "experience",
      "certifications"
    ],
    "description": "Wall Street trainee format highlighting GPA, Bloomberg certifications, and internships.",
    "rating": 4.9,
    "industry": "Student / Fresher / Internship"
  },
  {
    "id": "stu-marketing-intern",
    "name": "Creative Marketing & Social Intern",
    "category": "Student / Fresher / Internship",
    "categoryId": "student",
    "categoryName": "Student / Fresher / Internship",
    "roles": [
      "Marketing Intern",
      "Content Creator"
    ],
    "experienceLevels": [
      "student",
      "fresher"
    ],
    "atsFriendly": true,
    "atsScore": 97,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "sidebar-left",
    "sidebar": "left",
    "palette": {
      "id": "violet",
      "name": "Fintech Violet",
      "primary": "#3b0764",
      "secondary": "#7c3aed",
      "accent": "#7c3aed",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#2e1065",
      "muted": "#6b7280",
      "border": "#ede9fe"
    },
    "colors": {
      "primary": "#3b0764",
      "secondary": "#7c3aed",
      "accent": "#7c3aed",
      "text": "#2e1065",
      "bg": "#ffffff",
      "border": "#ede9fe"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "disc",
    "sections": [
      "education",
      "projects",
      "skills",
      "experience",
      "certifications"
    ],
    "description": "Showcases TikTok/IG metrics, graphic design skills, and campus campaigns.",
    "rating": 4.9,
    "industry": "Student / Fresher / Internship"
  },
  {
    "id": "stu-datascience-entry",
    "name": "Junior Data Science & Analytics Fresher",
    "category": "Student / Fresher / Internship",
    "categoryId": "student",
    "categoryName": "Student / Fresher / Internship",
    "roles": [
      "Data Science Intern",
      "Junior Analyst"
    ],
    "experienceLevels": [
      "student",
      "fresher"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "left",
    "palette": {
      "id": "teal",
      "name": "Deep Teal",
      "primary": "#134e4a",
      "secondary": "#0d9488",
      "accent": "#0d9488",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#042f2e",
      "muted": "#52525b",
      "border": "#ccfbf1"
    },
    "colors": {
      "primary": "#134e4a",
      "secondary": "#0d9488",
      "accent": "#0d9488",
      "text": "#042f2e",
      "bg": "#ffffff",
      "border": "#ccfbf1"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "arrow",
    "sections": [
      "education",
      "projects",
      "skills",
      "experience",
      "certifications"
    ],
    "description": "Kaggle competition medals, Jupyter notebook showcases, and Python scripts.",
    "rating": 4.9,
    "industry": "Student / Fresher / Internship"
  },
  {
    "id": "stu-stem-researcher",
    "name": "Undergraduate STEM Research Assistant",
    "category": "Student / Fresher / Internship",
    "categoryId": "student",
    "categoryName": "Student / Fresher / Internship",
    "roles": [
      "Research Assistant",
      "Lab Tech"
    ],
    "experienceLevels": [
      "student",
      "fresher"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Merriweather",
      "body": "Inter, sans-serif",
      "headingFont": "Merriweather, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Merriweather, sans-serif",
    "dividerStyle": "double",
    "bulletStyle": "square",
    "sections": [
      "education",
      "projects",
      "skills",
      "experience",
      "certifications"
    ],
    "description": "Lab techniques, co-authored conference posters, and NSF grant participation.",
    "rating": 4.9,
    "industry": "Student / Fresher / Internship"
  },
  {
    "id": "hc-physician-md",
    "name": "Attending Physician / MD",
    "category": "Healthcare / Education / Research",
    "categoryId": "healthcare",
    "categoryName": "Healthcare / Education / Research",
    "roles": [
      "Physician",
      "Doctor",
      "Resident"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "navy",
      "name": "Oxford Navy",
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#172554",
      "muted": "#475569",
      "border": "#cbd5e1"
    },
    "colors": {
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "text": "#172554",
      "bg": "#ffffff",
      "border": "#cbd5e1"
    },
    "typography": {
      "heading": "Merriweather",
      "body": "Inter, sans-serif",
      "headingFont": "Merriweather, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Merriweather, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "certifications",
      "experience",
      "education",
      "skills",
      "publications"
    ],
    "description": "Board certifications, clinical rotations, hospital affiliations, and medical license IDs.",
    "rating": 4.9,
    "industry": "Healthcare / Education / Research"
  },
  {
    "id": "hc-registered-nurse",
    "name": "Critical Care Registered Nurse (BSN, RN)",
    "category": "Healthcare / Education / Research",
    "categoryId": "healthcare",
    "categoryName": "Healthcare / Education / Research",
    "roles": [
      "Registered Nurse",
      "ICU Nurse",
      "Nurse Practitioner"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "right",
    "palette": {
      "id": "teal",
      "name": "Deep Teal",
      "primary": "#134e4a",
      "secondary": "#0d9488",
      "accent": "#0d9488",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#042f2e",
      "muted": "#52525b",
      "border": "#ccfbf1"
    },
    "colors": {
      "primary": "#134e4a",
      "secondary": "#0d9488",
      "accent": "#0d9488",
      "text": "#042f2e",
      "bg": "#ffffff",
      "border": "#ccfbf1"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "check",
    "sections": [
      "summary",
      "certifications",
      "experience",
      "education",
      "skills",
      "publications"
    ],
    "description": "BLS/ACLS credentials, patient bed-ratio capacity, and clinical competencies.",
    "rating": 4.9,
    "industry": "Healthcare / Education / Research"
  },
  {
    "id": "hc-pharmacist-pharmd",
    "name": "Clinical Specialist Pharmacist (PharmD)",
    "category": "Healthcare / Education / Research",
    "categoryId": "healthcare",
    "categoryName": "Healthcare / Education / Research",
    "roles": [
      "Pharmacist",
      "Clinical Specialist"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Roboto",
      "body": "Inter, sans-serif",
      "headingFont": "Roboto, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Roboto, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "certifications",
      "experience",
      "education",
      "skills",
      "publications"
    ],
    "description": "Medication therapy management (MTM), DEA licensure, and formulary oversight.",
    "rating": 4.9,
    "industry": "Healthcare / Education / Research"
  },
  {
    "id": "hc-medical-director",
    "name": "Clinical Medical Director",
    "category": "Healthcare / Education / Research",
    "categoryId": "healthcare",
    "categoryName": "Healthcare / Education / Research",
    "roles": [
      "Medical Director",
      "Chief Medical Officer"
    ],
    "experienceLevels": [
      "senior",
      "executive"
    ],
    "atsFriendly": false,
    "atsScore": 95,
    "photoPolicy": "required",
    "photoRequired": true,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "navy",
      "name": "Oxford Navy",
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#172554",
      "muted": "#475569",
      "border": "#cbd5e1"
    },
    "colors": {
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "text": "#172554",
      "bg": "#ffffff",
      "border": "#cbd5e1"
    },
    "typography": {
      "heading": "Playfair Display",
      "body": "Inter, sans-serif",
      "headingFont": "Playfair Display, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Playfair Display, sans-serif",
    "dividerStyle": "double",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "certifications",
      "experience",
      "education",
      "skills",
      "publications"
    ],
    "description": "Executive healthcare presentation with required MD portrait header.",
    "rating": 4.9,
    "industry": "Healthcare / Education / Research"
  },
  {
    "id": "hc-university-professor",
    "name": "Tenured University Professor (Academic CV)",
    "category": "Healthcare / Education / Research",
    "categoryId": "healthcare",
    "categoryName": "Healthcare / Education / Research",
    "roles": [
      "Professor",
      "Faculty",
      "Lecturer"
    ],
    "experienceLevels": [
      "senior",
      "academic"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "Lora",
      "body": "Inter, sans-serif",
      "headingFont": "Lora, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Lora, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "certifications",
      "experience",
      "education",
      "skills",
      "publications"
    ],
    "description": "Traditional multi-page academic curriculum vitae for peer-reviewed papers and grants.",
    "rating": 4.9,
    "industry": "Healthcare / Education / Research"
  },
  {
    "id": "hc-postdoc-fellow",
    "name": "Postdoctoral Research Fellow",
    "category": "Healthcare / Education / Research",
    "categoryId": "healthcare",
    "categoryName": "Healthcare / Education / Research",
    "roles": [
      "Postdoc",
      "Research Scientist"
    ],
    "experienceLevels": [
      "mid",
      "academic"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Merriweather",
      "body": "Inter, sans-serif",
      "headingFont": "Merriweather, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Merriweather, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "dash",
    "sections": [
      "summary",
      "certifications",
      "experience",
      "education",
      "skills",
      "publications"
    ],
    "description": "Post-graduate research outcomes, lab instrumentation, and citations.",
    "rating": 4.9,
    "industry": "Healthcare / Education / Research"
  },
  {
    "id": "hc-highschool-educator",
    "name": "STEM Educator & Curriculum Lead",
    "category": "Healthcare / Education / Research",
    "categoryId": "healthcare",
    "categoryName": "Healthcare / Education / Research",
    "roles": [
      "Teacher",
      "Curriculum Specialist"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "left",
    "palette": {
      "id": "emerald",
      "name": "Nordic Emerald",
      "primary": "#064e3b",
      "secondary": "#059669",
      "accent": "#059669",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#022c22",
      "muted": "#4b5563",
      "border": "#d1fae5"
    },
    "colors": {
      "primary": "#064e3b",
      "secondary": "#059669",
      "accent": "#059669",
      "text": "#022c22",
      "bg": "#ffffff",
      "border": "#d1fae5"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "certifications",
      "experience",
      "education",
      "skills",
      "publications"
    ],
    "description": "Classroom standardized test gains, state teaching credentials, and AP syllabi.",
    "rating": 4.9,
    "industry": "Healthcare / Education / Research"
  },
  {
    "id": "hc-school-principal",
    "name": "K-12 School Principal & Administrator",
    "category": "Healthcare / Education / Research",
    "categoryId": "healthcare",
    "categoryName": "Healthcare / Education / Research",
    "roles": [
      "School Principal",
      "District Administrator"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": false,
    "atsScore": 95,
    "photoPolicy": "required",
    "photoRequired": true,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "burgundy",
      "name": "Imperial Burgundy",
      "primary": "#500724",
      "secondary": "#be123c",
      "accent": "#be123c",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#380415",
      "muted": "#706e66",
      "border": "#fce7f3"
    },
    "colors": {
      "primary": "#500724",
      "secondary": "#be123c",
      "accent": "#be123c",
      "text": "#380415",
      "bg": "#ffffff",
      "border": "#fce7f3"
    },
    "typography": {
      "heading": "Playfair Display",
      "body": "Inter, sans-serif",
      "headingFont": "Playfair Display, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Playfair Display, sans-serif",
    "dividerStyle": "double",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "certifications",
      "experience",
      "education",
      "skills",
      "publications"
    ],
    "description": "Educational leadership and community outreach with professional administrator photo.",
    "rating": 4.9,
    "industry": "Healthcare / Education / Research"
  },
  {
    "id": "hc-biotech-scientist",
    "name": "Biotech Senior Research Scientist",
    "category": "Healthcare / Education / Research",
    "categoryId": "healthcare",
    "categoryName": "Healthcare / Education / Research",
    "roles": [
      "Biotech Scientist",
      "Genomics Researcher"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "cyan",
      "name": "Cyberpunk Cyan",
      "primary": "#083344",
      "secondary": "#0891b2",
      "accent": "#0891b2",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#082f49",
      "muted": "#64748b",
      "border": "#cffafe"
    },
    "colors": {
      "primary": "#083344",
      "secondary": "#0891b2",
      "accent": "#0891b2",
      "text": "#082f49",
      "bg": "#ffffff",
      "border": "#cffafe"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "certifications",
      "experience",
      "education",
      "skills",
      "publications"
    ],
    "description": "Assay development, CRISPR protocols, IND filings, and venture-backed research.",
    "rating": 4.9,
    "industry": "Healthcare / Education / Research"
  },
  {
    "id": "hc-clinical-psychologist",
    "name": "Licensed Clinical Psychologist (PsyD)",
    "category": "Healthcare / Education / Research",
    "categoryId": "healthcare",
    "categoryName": "Healthcare / Education / Research",
    "roles": [
      "Psychologist",
      "Therapist"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 99,
    "photoPolicy": "no_photo",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "Lora",
      "body": "Inter, sans-serif",
      "headingFont": "Lora, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Lora, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "certifications",
      "experience",
      "education",
      "skills",
      "publications"
    ],
    "description": "Diagnostic evaluations, DSM-5 treatment modalities, and private practice hours.",
    "rating": 4.9,
    "industry": "Healthcare / Education / Research"
  },
  {
    "id": "crt-product-uiux",
    "name": "Senior UI/UX & Product Designer",
    "category": "Creative / Designer / Media",
    "categoryId": "creative",
    "categoryName": "Creative / Designer / Media",
    "roles": [
      "Product Designer",
      "UI/UX Designer"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 97,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "right",
    "palette": {
      "id": "indigo",
      "name": "Electric Indigo",
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#1e1b4b",
      "muted": "#64748b",
      "border": "#e0e7ff"
    },
    "colors": {
      "primary": "#312e81",
      "secondary": "#4f46e5",
      "accent": "#4f46e5",
      "text": "#1e1b4b",
      "bg": "#ffffff",
      "border": "#e0e7ff"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "UX case studies, Figma design tokens, and user conversion lifts.",
    "rating": 4.9,
    "industry": "Creative / Designer / Media"
  },
  {
    "id": "crt-creative-director",
    "name": "Executive Creative Director",
    "category": "Creative / Designer / Media",
    "categoryId": "creative",
    "categoryName": "Creative / Designer / Media",
    "roles": [
      "Creative Director",
      "VP Design"
    ],
    "experienceLevels": [
      "senior",
      "executive"
    ],
    "atsFriendly": false,
    "atsScore": 94,
    "photoPolicy": "required",
    "photoRequired": true,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "rose",
      "name": "Chic Rose",
      "primary": "#881337",
      "secondary": "#e11d48",
      "accent": "#e11d48",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#4c0519",
      "muted": "#71717a",
      "border": "#ffe4e6"
    },
    "colors": {
      "primary": "#881337",
      "secondary": "#e11d48",
      "accent": "#e11d48",
      "text": "#4c0519",
      "bg": "#ffffff",
      "border": "#ffe4e6"
    },
    "typography": {
      "heading": "Playfair Display",
      "body": "Inter, sans-serif",
      "headingFont": "Playfair Display, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Playfair Display, sans-serif",
    "dividerStyle": "double",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Agency leadership profile with high-impact executive photo.",
    "rating": 4.9,
    "industry": "Creative / Designer / Media"
  },
  {
    "id": "crt-graphic-visual",
    "name": "Visual & Graphic Brand Identity Designer",
    "category": "Creative / Designer / Media",
    "categoryId": "creative",
    "categoryName": "Creative / Designer / Media",
    "roles": [
      "Graphic Designer",
      "Visual Artist"
    ],
    "experienceLevels": [
      "junior",
      "mid"
    ],
    "atsFriendly": true,
    "atsScore": 97,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "sidebar-left",
    "sidebar": "left",
    "palette": {
      "id": "violet",
      "name": "Fintech Violet",
      "primary": "#3b0764",
      "secondary": "#7c3aed",
      "accent": "#7c3aed",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#2e1065",
      "muted": "#6b7280",
      "border": "#ede9fe"
    },
    "colors": {
      "primary": "#3b0764",
      "secondary": "#7c3aed",
      "accent": "#7c3aed",
      "text": "#2e1065",
      "bg": "#ffffff",
      "border": "#ede9fe"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "arrow",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Typography curation, Adobe Creative Cloud mastery, and brand guidelines.",
    "rating": 4.9,
    "industry": "Creative / Designer / Media"
  },
  {
    "id": "crt-motion-animator",
    "name": "3D Motion Designer & VFX Artist",
    "category": "Creative / Designer / Media",
    "categoryId": "creative",
    "categoryName": "Creative / Designer / Media",
    "roles": [
      "Motion Designer",
      "3D Artist"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 97,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "left",
    "palette": {
      "id": "cyan",
      "name": "Cyberpunk Cyan",
      "primary": "#083344",
      "secondary": "#0891b2",
      "accent": "#0891b2",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#082f49",
      "muted": "#64748b",
      "border": "#cffafe"
    },
    "colors": {
      "primary": "#083344",
      "secondary": "#0891b2",
      "accent": "#0891b2",
      "text": "#082f49",
      "bg": "#ffffff",
      "border": "#cffafe"
    },
    "typography": {
      "heading": "JetBrains Mono",
      "body": "Inter, sans-serif",
      "headingFont": "JetBrains Mono, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "JetBrains Mono, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Cinema4D, Blender, After Effects pipelines, and commercial reels.",
    "rating": 4.9,
    "industry": "Creative / Designer / Media"
  },
  {
    "id": "crt-fashion-director",
    "name": "Luxury Fashion & Apparel Director",
    "category": "Creative / Designer / Media",
    "categoryId": "creative",
    "categoryName": "Creative / Designer / Media",
    "roles": [
      "Fashion Director",
      "Apparel Lead"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": false,
    "atsScore": 93,
    "photoPolicy": "required",
    "photoRequired": true,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "burgundy",
      "name": "Imperial Burgundy",
      "primary": "#500724",
      "secondary": "#be123c",
      "accent": "#be123c",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#380415",
      "muted": "#706e66",
      "border": "#fce7f3"
    },
    "colors": {
      "primary": "#500724",
      "secondary": "#be123c",
      "accent": "#be123c",
      "text": "#380415",
      "bg": "#ffffff",
      "border": "#fce7f3"
    },
    "typography": {
      "heading": "Playfair Display",
      "body": "Inter, sans-serif",
      "headingFont": "Playfair Display, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Playfair Display, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Editorial luxury styling requiring verified candidate visual portrait.",
    "rating": 4.9,
    "industry": "Creative / Designer / Media"
  },
  {
    "id": "crt-commercial-photographer",
    "name": "Commercial & Editorial Photographer",
    "category": "Creative / Designer / Media",
    "categoryId": "creative",
    "categoryName": "Creative / Designer / Media",
    "roles": [
      "Photographer",
      "Studio Director"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": false,
    "atsScore": 93,
    "photoPolicy": "required",
    "photoRequired": true,
    "layout": "sidebar-left",
    "sidebar": "left",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Inter, sans-serif",
    "dividerStyle": "minimal",
    "bulletStyle": "dash",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Studio client roster, gear mastery, and photographer profile photo.",
    "rating": 4.9,
    "industry": "Creative / Designer / Media"
  },
  {
    "id": "crt-media-broadcast",
    "name": "TV News Anchor & Broadcast Journalist",
    "category": "Creative / Designer / Media",
    "categoryId": "creative",
    "categoryName": "Creative / Designer / Media",
    "roles": [
      "News Anchor",
      "Broadcast Journalist"
    ],
    "experienceLevels": [
      "senior",
      "lead"
    ],
    "atsFriendly": false,
    "atsScore": 94,
    "photoPolicy": "required",
    "photoRequired": true,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "navy",
      "name": "Oxford Navy",
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#172554",
      "muted": "#475569",
      "border": "#cbd5e1"
    },
    "colors": {
      "primary": "#1e3a8a",
      "secondary": "#2563eb",
      "accent": "#2563eb",
      "text": "#172554",
      "bg": "#ffffff",
      "border": "#cbd5e1"
    },
    "typography": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter, sans-serif",
      "headingFont": "Plus Jakarta Sans, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Plus Jakarta Sans, sans-serif",
    "dividerStyle": "double",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "On-air presence and reporting portfolio with mandatory broadcast photo.",
    "rating": 4.9,
    "industry": "Creative / Designer / Media"
  },
  {
    "id": "crt-copywriter-story",
    "name": "Senior Copywriter & Narrative Lead",
    "category": "Creative / Designer / Media",
    "categoryId": "creative",
    "categoryName": "Creative / Designer / Media",
    "roles": [
      "Copywriter",
      "Creative Narrative Lead"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 98,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "single-column",
    "sidebar": "none",
    "palette": {
      "id": "amber",
      "name": "Editorial Amber",
      "primary": "#451a03",
      "secondary": "#d97706",
      "accent": "#d97706",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#292524",
      "muted": "#78716c",
      "border": "#fef3c7"
    },
    "colors": {
      "primary": "#451a03",
      "secondary": "#d97706",
      "accent": "#d97706",
      "text": "#292524",
      "bg": "#ffffff",
      "border": "#fef3c7"
    },
    "typography": {
      "heading": "Lora",
      "body": "Inter, sans-serif",
      "headingFont": "Lora, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Lora, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "disc",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Award-winning ad campaigns, brand taglines, and storytelling voice.",
    "rating": 4.9,
    "industry": "Creative / Designer / Media"
  },
  {
    "id": "crt-interior-architect",
    "name": "Interior Architect & Spatial Designer",
    "category": "Creative / Designer / Media",
    "categoryId": "creative",
    "categoryName": "Creative / Designer / Media",
    "roles": [
      "Interior Architect",
      "Spatial Designer"
    ],
    "experienceLevels": [
      "mid",
      "senior"
    ],
    "atsFriendly": true,
    "atsScore": 97,
    "photoPolicy": "optional",
    "photoRequired": false,
    "layout": "two-column",
    "sidebar": "right",
    "palette": {
      "id": "slate",
      "name": "Executive Slate",
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#0f172a",
      "muted": "#64748b",
      "border": "#e2e8f0"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0284c7",
      "accent": "#0284c7",
      "text": "#0f172a",
      "bg": "#ffffff",
      "border": "#e2e8f0"
    },
    "typography": {
      "heading": "Lato",
      "body": "Inter, sans-serif",
      "headingFont": "Lato, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Lato, sans-serif",
    "dividerStyle": "bar",
    "bulletStyle": "square",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Revit/AutoCAD architectural drawings, commercial FF&E, and permits.",
    "rating": 4.9,
    "industry": "Creative / Designer / Media"
  },
  {
    "id": "crt-talent-actor",
    "name": "Performing Arts, Actor & Media Talent",
    "category": "Creative / Designer / Media",
    "categoryId": "creative",
    "categoryName": "Creative / Designer / Media",
    "roles": [
      "Actor",
      "Talent",
      "Performer"
    ],
    "experienceLevels": [
      "all"
    ],
    "atsFriendly": false,
    "atsScore": 90,
    "photoPolicy": "required",
    "photoRequired": true,
    "layout": "header-card",
    "sidebar": "none",
    "palette": {
      "id": "monochrome",
      "name": "Pure Monochrome",
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "background": "#ffffff",
      "bg": "#ffffff",
      "text": "#09090b",
      "muted": "#71717a",
      "border": "#e4e4e7"
    },
    "colors": {
      "primary": "#18181b",
      "secondary": "#27272a",
      "accent": "#27272a",
      "text": "#09090b",
      "bg": "#ffffff",
      "border": "#e4e4e7"
    },
    "typography": {
      "heading": "Playfair Display",
      "body": "Inter, sans-serif",
      "headingFont": "Playfair Display, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "baseSize": 13,
      "lineHeight": 1.45
    },
    "fontFamily": "Playfair Display, sans-serif",
    "dividerStyle": "line",
    "bulletStyle": "star",
    "sections": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications"
    ],
    "description": "Industry standard SAG-AFTRA casting headshot format with required photo.",
    "rating": 4.9,
    "industry": "Creative / Designer / Media"
  }
];

export const TEMPLATES = TEMPLATE_REGISTRY;

export const isFullBleedTemplate = (templateId) => {
  if (!templateId) return false;
  return false;
};
