import React from 'react';
import {
  Mail, Phone, MapPin, Globe, Linkedin, Github, ExternalLink,
  Award, Briefcase, GraduationCap, Wrench, FolderGit2, BookOpen, Star, Check
} from 'lucide-react';

/**
 * Bullet point symbol resolver
 */
function getBulletChar(style) {
  switch (style) {
    case 'circle': return '○';
    case 'dash': return '—';
    case 'arrow': return '▸';
    case 'check': return '✓';
    case 'square': return '▪';
    case 'disc':
    default:
      return '•';
  }
}

/**
 * Font Family resolver for miniature paper
 */
function getFontFamily(font) {
  if (!font) return 'sans-serif';
  const f = font.toLowerCase();
  if (f.includes('mono') || f.includes('fira') || f.includes('jetbrains')) return 'ui-monospace, monospace';
  if (f.includes('serif') || f.includes('merriweather') || f.includes('garamond') || f.includes('georgia') || f.includes('playfair')) return 'ui-serif, Georgia, serif';
  return 'ui-sans-serif, system-ui, sans-serif';
}

/**
 * Role-calibrated content generator for miniature draft previews
 */
function getRoleSampleContent(template) {
  const cat = (template.category || '').toLowerCase();
  const title = template.roles?.[0] || template.name || 'Senior Professional';

  if (cat.includes('tech') || cat.includes('dev') || cat.includes('aiml') || cat.includes('data')) {
    return {
      roleTitle: title,
      summary: 'Systems engineer with 6+ years architecting fault-tolerant microservices, distributed pipelines, and cloud systems with sub-50ms p99 latency.',
      skills: ['Python', 'TypeScript', 'Go', 'React', 'Kubernetes', 'AWS', 'PostgreSQL', 'Docker', 'Redis', 'Kafka'],
      expCompany: 'Apex Distributed Cloud Systems',
      expRole: title,
      expPeriod: '2022 — Present',
      bullets: [
        'Architected high-throughput message streaming platform processing 4.2M events/sec.',
        'Cut infrastructure costs by 32% by optimizing Kubernetes autoscaling clusters.',
        'Mentored 8 mid-level engineers in distributed state machine design and CI/CD best practices.'
      ],
      projectTitle: 'Distributed Stream Orchestrator',
      projectStack: 'Go • Kafka • Redis • gRPC',
      education: 'UC Berkeley — B.S. in Computer Science (GPA 3.88)',
    };
  }

  if (cat.includes('exec') || cat.includes('lead')) {
    return {
      roleTitle: title,
      summary: 'Executive leader delivering global transformation, scaling engineering organizations from 25 to 200+, and driving $45M+ ARR growth.',
      skills: ['Strategic Leadership', 'P&L Management', 'Enterprise Architecture', 'Org Scaling', 'M&A Due Diligence', 'Executive Stakeholder Relations'],
      expCompany: 'Vanguard Global Enterprise',
      expRole: title,
      expPeriod: '2020 — Present',
      bullets: [
        'Directed cross-functional strategy across 6 global business units, growing ARR by 42%.',
        'Negotiated enterprise strategic alliances resulting in $18M recurring revenue pipeline.',
        'Implemented Six Sigma governance reducing operational expenditure by 24% year-over-year.'
      ],
      projectTitle: 'Global Infrastructure Modernization',
      projectStack: 'Strategic P&L • Enterprise Governance',
      education: 'Harvard Business School — Executive Leadership | MIT B.S.',
    };
  }

  if (cat.includes('finance') || cat.includes('business')) {
    return {
      roleTitle: title,
      summary: 'Financial analyst with expertise in DCF modeling, M&A due diligence, capital structure optimization, and institutional investment analysis.',
      skills: ['DCF & LBO Modeling', 'Financial Reporting', 'GAAP / IFRS', 'Capital Budgeting', 'Bloomberg Terminal', 'Valuation & Risk'],
      expCompany: 'Sterling Capital Partners',
      expRole: title,
      expPeriod: '2021 — Present',
      bullets: [
        'Conducted valuation analysis on 14 M&A transactions valued at over $850M.',
        'Built automated financial forecasting models improving quarterly variance accuracy by 18%.',
        'Authored investment committee memoranda adopted for 4 flagship fund allocations.'
      ],
      projectTitle: 'M&A Leveraged Buyout Framework',
      projectStack: 'Financial Modeling • Valuation Analysis',
      education: 'Wharton School — B.S. in Economics & Finance (Magna Cum Laude)',
    };
  }

  if (cat.includes('student') || cat.includes('fresh')) {
    return {
      roleTitle: title,
      summary: 'High-achieving computer science student with hands-on capstone project experience in full-stack systems, machine learning, and algorithms.',
      skills: ['Python', 'Java', 'C++', 'JavaScript', 'React', 'SQL', 'Git', 'Data Structures', 'Linux'],
      expCompany: 'Silicon Valley Innovation Lab',
      expRole: 'Software Engineering Intern',
      expPeriod: 'Summer 2024',
      bullets: [
        'Developed REST API endpoints in Python & FastAPI serving 15,000+ internal requests daily.',
        'Implemented automated unit test suites improving code coverage from 64% to 89%.',
        'Awarded 1st place in University Hackathon for real-time collaborative code editor.'
      ],
      projectTitle: 'Campus Cloud Platform',
      projectStack: 'React • Node.js • PostgreSQL',
      education: 'Stanford University — B.S. Computer Science (Expected 2025 | GPA 3.92)',
    };
  }

  if (cat.includes('academic') || cat.includes('research')) {
    return {
      roleTitle: title,
      summary: 'Postdoctoral researcher focusing on applied machine learning, distributed state consensus, and algorithmic optimization with 8 peer-reviewed papers.',
      skills: ['Algorithmic Proofs', 'PyTorch', 'Distributed Consensus', 'Statistical Inference', 'LaTeX', 'Experimental Design'],
      expCompany: 'Institute for Advanced Computational Research',
      expRole: 'Research Scientist & Postdoctoral Fellow',
      expPeriod: '2022 — Present',
      bullets: [
        'Co-authored 4 first-author papers accepted at NeurIPS, ICML, and ACM SIGMETRICS.',
        'Secured $450K NSF research grant for fault-tolerant state machine research.',
        'Mentored 6 graduate students across empirical evaluations and statistical modeling.'
      ],
      projectTitle: 'High-Throughput Consensus Architecture',
      projectStack: 'Peer-Reviewed Journal Publication (ACM)',
      education: 'Princeton University — Ph.D. in Computer Science & Applied Math',
    };
  }

  if (cat.includes('creative')) {
    return {
      roleTitle: title,
      summary: 'Product designer specializing in cohesive design systems, human-centered interaction architecture, and high-conversion mobile UI workflows.',
      skills: ['Design Systems', 'Figma', 'UI/UX Architecture', 'Prototyping', 'User Research', 'Typography', 'Framer', 'Interaction Design'],
      expCompany: 'Aura Interactive Design Studio',
      expRole: title,
      expPeriod: '2021 — Present',
      bullets: [
        'Designed multi-platform enterprise design system adopted by 40+ engineering squads.',
        'Conducted usability testing across 120+ participants, increasing onboarding completion by 29%.',
        'Recognized with Awwwards Site of the Day for design craftsmanship.'
      ],
      projectTitle: 'Design System & Component Library',
      projectStack: 'Figma • Design Tokens • Prototyping',
      education: 'Rhode Island School of Design (RISD) — B.F.A. Graphic Design',
    };
  }

  // General / ATS Standard fallback
  return {
    roleTitle: title,
    summary: 'Accomplished professional with a proven track record of delivering measurable outcomes, leading high-velocity initiatives, and driving technical excellence.',
    skills: ['Strategic Planning', 'Process Optimization', 'Cross-Functional Collaboration', 'Project Delivery', 'Data Analysis', 'Performance Metrics'],
    expCompany: 'Apex Global Enterprises',
    expRole: title,
    expPeriod: '2021 — Present',
    bullets: [
      'Spearheaded enterprise initiatives resulting in 35% efficiency gains across core operations.',
      'Collaborated with key stakeholders to align delivery timelines and exceed SLAs.',
      'Authored standard operating procedures recognized as company-wide best practices.'
    ],
    projectTitle: 'Enterprise Systems Modernization',
    projectStack: 'Process Engineering • SLA Delivery',
    education: 'University of California, Berkeley — Bachelor of Science (Honors)',
  };
}

/**
 * TemplateDraftPaper
 *
 * Renders an authentic, realistic miniature resume document sheet for every template.
 * Dynamically respects:
 * - Template layout: single-column, two-column, sidebar-left, sidebar-right, header-card
 * - Template palette: primary, accent, secondary, text, bg, border
 * - Template typography: serif, sans-serif, monospace
 * - Template divider style: bar, line, dashed, double, minimal
 * - Template bullet style: disc, arrow, check, dash, square
 * - Role-specific content & titles
 */
export function TemplateDraftPaper({ template }) {
  if (!template) return null;

  const palette = template.palette || template.defaultPalette || {};
  const primaryColor = palette.primary || template.accentColor || '#0f172a';
  const accentColor = palette.accent || palette.secondary || '#3b82f6';
  const bgColor = palette.bg || palette.background || '#ffffff';
  const textColor = palette.text || '#1e293b';
  const borderColor = palette.border || '#e2e8f0';

  const layout = template.layout || 'single-column';
  const fontFamily = getFontFamily(template.fontFamily);
  const bulletSymbol = getBulletChar(template.bulletStyle);
  const dividerStyle = template.dividerStyle || 'line';

  const content = getRoleSampleContent(template);

  // Section Heading Divider styling
  const renderHeading = (title) => {
    let style = {
      color: primaryColor,
      fontFamily,
    };
    let borderStyle = {};

    if (dividerStyle === 'bar') {
      borderStyle = { borderLeft: `2.5px solid ${primaryColor}`, paddingLeft: '4px' };
    } else if (dividerStyle === 'dashed') {
      borderStyle = { borderBottom: `1px dashed ${primaryColor}`, paddingBottom: '1px' };
    } else if (dividerStyle === 'double') {
      borderStyle = { borderBottom: `2px double ${primaryColor}`, paddingBottom: '1px' };
    } else if (dividerStyle === 'line') {
      borderStyle = { borderBottom: `1px solid ${primaryColor}`, paddingBottom: '1px' };
    }

    return (
      <div className="mb-1" style={borderStyle}>
        <div
          className="font-extrabold uppercase tracking-wider text-[6.5px]"
          style={style}
        >
          {title}
        </div>
      </div>
    );
  };

  // 1. HEADER CARD LAYOUT
  if (layout === 'header-card') {
    return (
      <div
        className="w-full h-full p-2.5 sm:p-3 flex flex-col justify-between text-[6.5px] leading-tight select-none overflow-hidden"
        style={{ backgroundColor: bgColor, color: textColor, fontFamily }}
      >
        {/* Header Card Banner */}
        <div
          className="p-2 rounded border mb-2"
          style={{
            backgroundColor: `${primaryColor}10`,
            borderColor: `${primaryColor}30`,
            borderLeft: `4px solid ${primaryColor}`,
          }}
        >
          <div className="flex justify-between items-baseline">
            <div className="font-extrabold text-[9.5px] tracking-tight" style={{ color: primaryColor }}>
              ALEX RIVERA
            </div>
            <span
              className="text-[5px] font-mono px-1 py-0.2 rounded font-bold uppercase"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              ATS {template.atsScore || 98}%
            </span>
          </div>
          <div className="text-[6.5px] font-bold mt-0.5 truncate" style={{ color: accentColor }}>
            {content.roleTitle}
          </div>
          <div className="text-[5px] opacity-75 flex gap-2 pt-0.5">
            <span>alex.rivera@pro.io</span>
            <span>•</span>
            <span>San Francisco, CA</span>
            <span>•</span>
            <span>linkedin.com/in/alex</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-1.5 flex-1">
          <div>
            {renderHeading('Professional Profile')}
            <p className="text-[5.5px] leading-snug opacity-90 line-clamp-2">
              {content.summary}
            </p>
          </div>

          <div>
            {renderHeading('Core Competencies & Stack')}
            <div className="flex flex-wrap gap-0.5">
              {content.skills.slice(0, 7).map((s, idx) => (
                <span
                  key={idx}
                  className="px-1 py-0.2 rounded text-[5px] font-medium"
                  style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            {renderHeading('Key Experience')}
            <div className="space-y-0.5">
              <div className="flex justify-between font-bold text-[6px]">
                <span style={{ color: primaryColor }}>{content.expRole}</span>
                <span style={{ color: accentColor }}>{content.expPeriod}</span>
              </div>
              <div className="text-[5px] font-semibold opacity-80">{content.expCompany}</div>
              <div className="text-[5.5px] opacity-85 leading-snug line-clamp-2">
                {bulletSymbol} {content.bullets[0]}<br/>
                {bulletSymbol} {content.bullets[1]}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Education */}
        <div className="pt-1 border-t flex justify-between text-[5px] opacity-80" style={{ borderColor }}>
          <span>{content.education}</span>
          <span className="font-bold" style={{ color: accentColor }}>Verified ATS</span>
        </div>
      </div>
    );
  }

  // 2. SIDEBAR-LEFT LAYOUT
  if (layout === 'sidebar-left') {
    return (
      <div
        className="w-full h-full p-2 flex gap-2 text-[6.5px] leading-tight select-none overflow-hidden"
        style={{ backgroundColor: bgColor, color: textColor, fontFamily }}
      >
        {/* Left Sidebar */}
        <div
          className="w-[36%] p-1.5 rounded flex flex-col justify-between shrink-0"
          style={{
            backgroundColor: `${primaryColor}08`,
            borderRight: `1.5px solid ${primaryColor}20`,
          }}
        >
          <div className="space-y-2">
            <div>
              <div className="font-extrabold text-[9px] tracking-tight leading-tight" style={{ color: primaryColor }}>
                ALEX<br/>RIVERA
              </div>
              <div className="text-[5.5px] font-bold mt-1 leading-tight" style={{ color: accentColor }}>
                {content.roleTitle}
              </div>
            </div>

            <div className="space-y-1 text-[5px] opacity-80 pt-1 border-t" style={{ borderColor: `${primaryColor}15` }}>
              <div>alex@pro.io</div>
              <div>+1 555-234-5678</div>
              <div>San Francisco, CA</div>
            </div>

            <div>
              <div className="font-bold text-[6px] uppercase tracking-wider mb-1" style={{ color: primaryColor }}>
                SKILLS
              </div>
              <div className="flex flex-wrap gap-0.5">
                {content.skills.slice(0, 6).map((s, idx) => (
                  <span
                    key={idx}
                    className="px-1 py-0.2 rounded text-[4.5px] font-bold"
                    style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[5px] opacity-75 pt-1 border-t" style={{ borderColor: `${primaryColor}15` }}>
            <span className="font-bold">Education</span><br/>
            {content.education.split('—')[0]}
          </div>
        </div>

        {/* Right Main Column */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="space-y-1.5">
            <div>
              {renderHeading('Professional Summary')}
              <p className="text-[5.5px] opacity-85 leading-snug line-clamp-2">
                {content.summary}
              </p>
            </div>

            <div>
              {renderHeading('Work Experience')}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[6px]">
                  <span style={{ color: primaryColor }}>{content.expRole}</span>
                  <span style={{ color: accentColor }}>{content.expPeriod}</span>
                </div>
                <div className="text-[5px] opacity-80">{content.expCompany}</div>
                <div className="text-[5.5px] opacity-85 leading-snug space-y-0.5">
                  <div>{bulletSymbol} {content.bullets[0]}</div>
                  <div>{bulletSymbol} {content.bullets[1]}</div>
                </div>
              </div>
            </div>

            <div>
              {renderHeading('Key Project')}
              <div className="text-[6px] font-bold" style={{ color: primaryColor }}>
                {content.projectTitle}
              </div>
              <div className="text-[5px] font-mono opacity-75" style={{ color: accentColor }}>
                {content.projectStack}
              </div>
            </div>
          </div>

          <div className="pt-1 border-t flex justify-between text-[5px] opacity-75" style={{ borderColor }}>
            <span>Calibrated Hierarchy</span>
            <span className="font-mono">ATS 99%</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. TWO-COLUMN LAYOUT
  if (layout === 'two-column') {
    return (
      <div
        className="w-full h-full p-2.5 sm:p-3 flex flex-col justify-between text-[6.5px] leading-tight select-none overflow-hidden"
        style={{ backgroundColor: bgColor, color: textColor, fontFamily }}
      >
        {/* Top Header */}
        <div className="pb-1.5 border-b" style={{ borderColor: `${primaryColor}30` }}>
          <div className="flex justify-between items-baseline">
            <div className="font-extrabold text-[10px] tracking-tight" style={{ color: primaryColor }}>
              ALEX RIVERA
            </div>
            <div className="text-[6px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
              {content.roleTitle}
            </div>
          </div>
          <div className="flex justify-between text-[5px] opacity-75 pt-0.5">
            <span>alex.rivera@dev • +1 (555) 234-5678</span>
            <span>San Francisco, CA • linkedin.com/in/alex</span>
          </div>
        </div>

        {/* 2 Columns Body */}
        <div className="flex gap-2 flex-1 pt-1.5 overflow-hidden">
          {/* Main Left Column (60%) */}
          <div className="w-[62%] space-y-1.5">
            <div>
              {renderHeading('Experience')}
              <div className="space-y-0.5">
                <div className="flex justify-between font-bold text-[6px]">
                  <span style={{ color: primaryColor }}>{content.expRole}</span>
                </div>
                <div className="text-[5px] opacity-80">{content.expCompany} ({content.expPeriod})</div>
                <div className="text-[5.5px] opacity-85 leading-snug space-y-0.5 mt-0.5">
                  <div>{bulletSymbol} {content.bullets[0]}</div>
                  <div>{bulletSymbol} {content.bullets[1]}</div>
                </div>
              </div>
            </div>

            <div>
              {renderHeading('Projects & Architecture')}
              <div className="text-[6px] font-bold" style={{ color: primaryColor }}>{content.projectTitle}</div>
              <div className="text-[5px] font-mono opacity-80" style={{ color: accentColor }}>{content.projectStack}</div>
            </div>
          </div>

          {/* Right Column (38%) */}
          <div className="w-[38%] space-y-1.5 pl-1.5 border-l" style={{ borderColor: `${borderColor}` }}>
            <div>
              {renderHeading('Skills')}
              <div className="flex flex-wrap gap-0.5">
                {content.skills.slice(0, 8).map((s, idx) => (
                  <span
                    key={idx}
                    className="px-1 py-0.2 rounded text-[4.5px] font-medium"
                    style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              {renderHeading('Education')}
              <div className="text-[5.5px] font-bold" style={{ color: primaryColor }}>B.S. Computer Science</div>
              <div className="text-[5px] opacity-80">UC Berkeley</div>
            </div>

            <div>
              {renderHeading('Certifications')}
              <div className="text-[5px] opacity-85">• AWS Certified Architect</div>
              <div className="text-[5px] opacity-85">• Certified Kubernetes Admin</div>
            </div>
          </div>
        </div>

        <div className="pt-1 border-t flex justify-between text-[5px] opacity-75" style={{ borderColor }}>
          <span>High-Fidelity 2-Column</span>
          <span className="font-mono font-bold" style={{ color: accentColor }}>ATS {template.atsScore || 98}%</span>
        </div>
      </div>
    );
  }

  // 4. SINGLE-COLUMN ATS STANDARD (Default & ATS Professional Tier)
  return (
    <div
      className="w-full h-full p-2.5 sm:p-3 flex flex-col justify-between text-[6.5px] leading-tight select-none overflow-hidden"
      style={{ backgroundColor: bgColor, color: textColor, fontFamily }}
    >
      {/* Header */}
      <div className="pb-1 text-center space-y-0.5 border-b" style={{ borderColor: `${primaryColor}30` }}>
        <div className="font-extrabold text-[10.5px] tracking-tight uppercase" style={{ color: primaryColor }}>
          Alex Rivera
        </div>
        <div className="text-[6.5px] font-bold tracking-wide uppercase" style={{ color: accentColor }}>
          {content.roleTitle}
        </div>
        <div className="text-[5px] opacity-80 flex justify-center gap-1.5 flex-wrap">
          <span>alex.rivera@pro.io</span>
          <span>•</span>
          <span>+1 (555) 234-5678</span>
          <span>•</span>
          <span>San Francisco, CA</span>
          <span>•</span>
          <span>linkedin.com/in/alex</span>
        </div>
      </div>

      {/* Linear Single Column Sections */}
      <div className="space-y-1.5 flex-1 pt-1 overflow-hidden">
        <div>
          {renderHeading('Professional Summary')}
          <p className="text-[5.5px] leading-snug opacity-90 line-clamp-2">
            {content.summary}
          </p>
        </div>

        <div>
          {renderHeading('Core Technical Competencies')}
          <div className="text-[5.5px] opacity-90 leading-tight">
            <span className="font-bold" style={{ color: primaryColor }}>Stack & Tools: </span>
            <span>{content.skills.join(' • ')}</span>
          </div>
        </div>

        <div>
          {renderHeading('Professional Experience')}
          <div className="space-y-0.5">
            <div className="flex justify-between font-bold text-[6px]">
              <span style={{ color: primaryColor }}>{content.expRole} — {content.expCompany}</span>
              <span style={{ color: accentColor }}>{content.expPeriod}</span>
            </div>
            <div className="text-[5.5px] opacity-90 leading-snug space-y-0.5">
              <div>{bulletSymbol} {content.bullets[0]}</div>
              <div>{bulletSymbol} {content.bullets[1]}</div>
              <div className="line-clamp-1">{bulletSymbol} {content.bullets[2]}</div>
            </div>
          </div>
        </div>

        <div>
          {renderHeading('Key Projects & Systems')}
          <div className="flex justify-between items-baseline text-[5.5px]">
            <span className="font-bold" style={{ color: primaryColor }}>{content.projectTitle}</span>
            <span className="font-mono text-[5px]" style={{ color: accentColor }}>{content.projectStack}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-1 border-t flex justify-between text-[5px] opacity-80" style={{ borderColor }}>
        <span>{content.education}</span>
        <span className="font-mono font-bold" style={{ color: accentColor }}>ATS {template.atsScore || 99}%</span>
      </div>
    </div>
  );
}
