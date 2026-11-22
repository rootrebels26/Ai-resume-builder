export const TEMPLATE_CATEGORIES = [
  { id: "all", name: "All Templates" },
  { id: "ats", name: "ATS-Friendly (10)" },
  { id: "modern", name: "Modern Professional (10)" },
  { id: "minimalist", name: "Minimalist (10)" },
  { id: "student", name: "Student & Fresher (5)" },
  { id: "developer", name: "Software Developer (5)" },
  { id: "executive", name: "Executive & Leadership (5)" },
  { id: "creative", name: "Creative & Designer (5)" },
];

export const TEMPLATES = [
  // 1. ATS-Friendly (10)
  {
    id: "ats-01",
    name: "Classic ATS Standard",
    category: "ats",
    description: "Single column, clean typographic hierarchy, optimized for machine parsers and enterprise ATS gates.",
    accentColor: "#1e293b",
    badge: "Most Popular",
    rating: 4.9
  },
  {
    id: "ats-02",
    name: "ATS Executive Corporate",
    category: "ats",
    description: "Refined linear structure with formal borders and clear section dividers.",
    accentColor: "#0f172a",
    badge: "ATS Gold",
    rating: 4.8
  },
  {
    id: "ats-03",
    name: "ATS Clean Compact",
    category: "ats",
    description: "Dense information density designed for experienced professionals with long project histories.",
    accentColor: "#334155",
    badge: "High Density",
    rating: 4.7
  },
  {
    id: "ats-04",
    name: "ATS Harvard Standard",
    category: "ats",
    description: "Academic and traditional layout inspired by Ivy League career services guidelines.",
    accentColor: "#475569",
    badge: "Academic",
    rating: 4.9
  },
  {
    id: "ats-05",
    name: "ATS Simple Elegant",
    category: "ats",
    description: "Uncluttered layout with bold headers and streamlined bullet points.",
    accentColor: "#0284c7",
    badge: "Clean",
    rating: 4.7
  },
  {
    id: "ats-06",
    name: "ATS Monochrome Precision",
    category: "ats",
    description: "Strict black & white formatting guaranteed 100% parse-rate across legacy HR systems.",
    accentColor: "#000000",
    badge: "100% Parsing",
    rating: 4.8
  },
  {
    id: "ats-07",
    name: "ATS Skyline Corporate",
    category: "ats",
    description: "Sleek horizontal divider bands with strong date alignment.",
    accentColor: "#1d4ed8",
    badge: "Corporate",
    rating: 4.7
  },
  {
    id: "ats-08",
    name: "ATS Oxford Classic",
    category: "ats",
    description: "Serif-accented traditional format ideal for finance, legal, and consulting sectors.",
    accentColor: "#1e3a8a",
    badge: "Finance/Legal",
    rating: 4.8
  },
  {
    id: "ats-09",
    name: "ATS Prime Hybrid",
    category: "ats",
    description: "Subtle modern touches while strictly adhering to flat DOM hierarchy for screen readers.",
    accentColor: "#0369a1",
    badge: "Verified",
    rating: 4.9
  },
  {
    id: "ats-10",
    name: "ATS Metro Linear",
    category: "ats",
    description: "Clean left-aligned metadata with bulleted achievements and distinct skill pills.",
    accentColor: "#0f766e",
    badge: "Streamlined",
    rating: 4.6
  },

  // 2. Modern Professional (10)
  {
    id: "modern-01",
    name: "Apex Modern Blue",
    category: "modern",
    description: "Dynamic two-column header with polished contact chips and dual-tone skill badges.",
    accentColor: "#0284c7",
    badge: "Featured",
    rating: 5.0
  },
  {
    id: "modern-02",
    name: "Emerald Horizon",
    category: "modern",
    description: "Rich emerald styling paired with contemporary grid structure and clean timelines.",
    accentColor: "#059669",
    badge: "Modern",
    rating: 4.8
  },
  {
    id: "modern-03",
    name: "Slate Prestige",
    category: "modern",
    description: "Balanced two-column layout featuring a left sidebar for skills, education, and credentials.",
    accentColor: "#334155",
    badge: "Sidebar Grid",
    rating: 4.9
  },
  {
    id: "modern-04",
    name: "Violet Vanguard",
    category: "modern",
    description: "Contemporary violet accents with crisp typography and subtle badge borders.",
    accentColor: "#7c3aed",
    badge: "Tech Pro",
    rating: 4.7
  },
  {
    id: "modern-05",
    name: "Indigo Executive",
    category: "modern",
    description: "Sophisticated deep indigo theme with structured sections and highlighted milestones.",
    accentColor: "#4338ca",
    badge: "Popular",
    rating: 4.9
  },
  {
    id: "modern-06",
    name: "Teal Matrix",
    category: "modern",
    description: "Refreshing teal accenting with compact section chips and clean line breaks.",
    accentColor: "#0d9488",
    badge: "Fresh",
    rating: 4.6
  },
  {
    id: "modern-07",
    name: "Charcoal Horizon",
    category: "modern",
    description: "Bold dark title band with light body background for maximum contrast.",
    accentColor: "#18181b",
    badge: "Bold Header",
    rating: 4.8
  },
  {
    id: "modern-08",
    name: "Cobalt Impact",
    category: "modern",
    description: "Energetic cobalt blue markers and structured two-tone experience cards.",
    accentColor: "#2563eb",
    badge: "Impact",
    rating: 4.7
  },
  {
    id: "modern-09",
    name: "Nordic Minimal",
    category: "modern",
    description: "Scandinavian-inspired layout with generous whitespace and understated elegance.",
    accentColor: "#4b5563",
    badge: "Nordic",
    rating: 4.8
  },
  {
    id: "modern-10",
    name: "Sapphire Edge",
    category: "modern",
    description: "Sharp vertical accent line tying together chronological milestones seamlessly.",
    accentColor: "#1d4ed8",
    badge: "Timeline",
    rating: 4.9
  },

  // 3. Minimalist (10)
  {
    id: "minimalist-01",
    name: "Pure White Clean",
    category: "minimalist",
    description: "Maximum readability, disciplined margins, and understated typography.",
    accentColor: "#18181b",
    badge: "Minimalist",
    rating: 4.9
  },
  {
    id: "minimalist-02",
    name: "Monotype Swiss",
    category: "minimalist",
    description: "Inspired by the International Typographic Style with strict grid alignment.",
    accentColor: "#27272a",
    badge: "Swiss Style",
    rating: 4.8
  },
  {
    id: "minimalist-03",
    name: "Soft Graphite",
    category: "minimalist",
    description: "Warm neutral graphite palette that is effortless to read on both screen and paper.",
    accentColor: "#3f3f46",
    badge: "Warm Grey",
    rating: 4.7
  },
  {
    id: "minimalist-04",
    name: "Airy Horizon",
    category: "minimalist",
    description: "Generous line heights and subtle divider rules for effortless scanning.",
    accentColor: "#52525b",
    badge: "Airy",
    rating: 4.7
  },
  {
    id: "minimalist-05",
    name: "Zenith Mono",
    category: "minimalist",
    description: "Focused header with compact metadata, ideal for technical and analytical fields.",
    accentColor: "#18181b",
    badge: "Compact",
    rating: 4.8
  },
  {
    id: "minimalist-06",
    name: "Linear Ghost",
    category: "minimalist",
    description: "Faint horizontal hairline guides separating distinct career stages.",
    accentColor: "#71717a",
    badge: "Subtle",
    rating: 4.6
  },
  {
    id: "minimalist-07",
    name: "Paper Craft",
    category: "minimalist",
    description: "Tactile editorial styling featuring classic serifs for names and modern sans for body text.",
    accentColor: "#262626",
    badge: "Editorial",
    rating: 4.8
  },
  {
    id: "minimalist-08",
    name: "Essential Light",
    category: "minimalist",
    description: "No distractions, strictly content-focused layout that recruiters love for quick audits.",
    accentColor: "#171717",
    badge: "Essential",
    rating: 4.9
  },
  {
    id: "minimalist-09",
    name: "Quiet Echo",
    category: "minimalist",
    description: "Calm grey tones with indented bullet blocks for clear visual hierarchy.",
    accentColor: "#525252",
    badge: "Clean",
    rating: 4.7
  },
  {
    id: "minimalist-10",
    name: "Crisp Monochrome",
    category: "minimalist",
    description: "High contrast pure black and white without any decorative fluff.",
    accentColor: "#000000",
    badge: "High Contrast",
    rating: 4.9
  },

  // 4. Student / Fresher (5)
  {
    id: "student-01",
    name: "Campus Starter",
    category: "student",
    description: "Prioritizes Education, Projects, and Internships above work experience.",
    accentColor: "#2563eb",
    badge: "Entry Level",
    rating: 4.8
  },
  {
    id: "student-02",
    name: "Scholar Academy",
    category: "student",
    description: "Academic layout highlighting GPA, coursework, honors, and club leadership.",
    accentColor: "#0891b2",
    badge: "Academics",
    rating: 4.7
  },
  {
    id: "student-03",
    name: "Graduate Launchpad",
    category: "student",
    description: "Dynamic skills-forward format designed to showcase technical self-learning and bootcamps.",
    accentColor: "#4f46e5",
    badge: "Bootcamp",
    rating: 4.9
  },
  {
    id: "student-04",
    name: "Internship Pro",
    category: "student",
    description: "Balanced split showing coursework alongside summer internships and project deliverables.",
    accentColor: "#059669",
    badge: "Internship",
    rating: 4.7
  },
  {
    id: "student-05",
    name: "Fellowship Scholar",
    category: "student",
    description: "Polished design for fellowships, research grants, and university degree programs.",
    accentColor: "#0284c7",
    badge: "Scholar",
    rating: 4.8
  },

  // 5. Software Developer (5)
  {
    id: "developer-01",
    name: "Full Stack Terminal",
    category: "developer",
    description: "Code-inspired typography with explicit GitHub/Live links and categorized tech stacks.",
    accentColor: "#0284c7",
    badge: "Full Stack",
    rating: 5.0
  },
  {
    id: "developer-02",
    name: "DevOps Engineer",
    category: "developer",
    description: "Structured architecture layout with dedicated sections for cloud tools, CI/CD, and metrics.",
    accentColor: "#0d9488",
    badge: "Cloud/DevOps",
    rating: 4.8
  },
  {
    id: "developer-03",
    name: "Frontend Specialist",
    category: "developer",
    description: "Modern component-oriented layout highlighting UI frameworks and interactive live demos.",
    accentColor: "#7c3aed",
    badge: "Frontend",
    rating: 4.9
  },
  {
    id: "developer-04",
    name: "Backend Architect",
    category: "developer",
    description: "System design oriented structure highlighting throughput, database scaling, and APIs.",
    accentColor: "#1e293b",
    badge: "Backend",
    rating: 4.8
  },
  {
    id: "developer-05",
    name: "AI & ML Specialist",
    category: "developer",
    description: "Highlights data pipelines, PyTorch/TensorFlow models, publications, and benchmarks.",
    accentColor: "#4338ca",
    badge: "AI/ML",
    rating: 4.9
  },

  // 6. Executive & Leadership (5)
  {
    id: "executive-01",
    name: "Chief Executive",
    category: "executive",
    description: "Authoritative header, executive summary prominence, and corporate governance focus.",
    accentColor: "#0f172a",
    badge: "C-Level",
    rating: 4.9
  },
  {
    id: "executive-02",
    name: "Director of Product",
    category: "executive",
    description: "Highlights roadmap execution, cross-functional squad leadership, and ARR growth.",
    accentColor: "#1e3a8a",
    badge: "Product Lead",
    rating: 4.8
  },
  {
    id: "executive-03",
    name: "VP of Engineering",
    category: "executive",
    description: "Strategic engineering management, organizational scaling, and budget management.",
    accentColor: "#1e293b",
    badge: "VP Level",
    rating: 4.9
  },
  {
    id: "executive-04",
    name: "Strategic Consultant",
    category: "executive",
    description: "Consulting pedigree format with case engagement highlights and client impact metrics.",
    accentColor: "#334155",
    badge: "Consulting",
    rating: 4.7
  },
  {
    id: "executive-05",
    name: "Operations Leader",
    category: "executive",
    description: "Operational velocity, global team management, and fiscal efficiency tracking.",
    accentColor: "#064e3b",
    badge: "Operations",
    rating: 4.8
  },

  // 7. Creative & Designer (5)
  {
    id: "creative-01",
    name: "Product Designer UI/UX",
    category: "creative",
    description: "Sleek typography, portfolio links, and design system proficiencies front and center.",
    accentColor: "#ec4899",
    badge: "Design Pro",
    rating: 4.9
  },
  {
    id: "creative-02",
    name: "Creative Director",
    category: "creative",
    description: "Striking visual hierarchy with bold header typography and awards showcase.",
    accentColor: "#8b5cf6",
    badge: "Creative",
    rating: 4.8
  },
  {
    id: "creative-03",
    name: "Brand Strategist",
    category: "creative",
    description: "Warm modern aesthetics crafted for marketers, copywriters, and branding specialists.",
    accentColor: "#f59e0b",
    badge: "Branding",
    rating: 4.7
  },
  {
    id: "creative-04",
    name: "Multimedia Producer",
    category: "creative",
    description: "Displays production tools, studio campaigns, and client collaborations cleanly.",
    accentColor: "#06b6d4",
    badge: "Multimedia",
    rating: 4.8
  },
  {
    id: "creative-05",
    name: "Architectural Studio",
    category: "creative",
    description: "Geometric precision, balanced proportioning, and spatial harmony in typography.",
    accentColor: "#0f766e",
    badge: "Studio",
    rating: 4.9
  }
];

export const TOTAL_TEMPLATES_COUNT = TEMPLATES.length; // Exactly 50+ templates!
