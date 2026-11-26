import React from 'react';
import { TEMPLATE_REGISTRY } from '../../constants/templateRegistry';
import {
  Mail, Phone, MapPin, Globe, Linkedin, Github, ExternalLink,
  Award, Briefcase, GraduationCap, Wrench, FolderGit2, BookOpen, Star, Languages as LangIcon
} from 'lucide-react';

/**
 * Normalizes any URL to have http/https protocol
 */
function normalizeUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Bullet point decorator based on style
 */
function getBulletSymbol(style = 'disc') {
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
 * DynamicResumeCanvas
 *
 * Canva-grade, role-specific dynamic resume renderer supporting:
 * - 100 role-specific templates across 9 categories
 * - 100% photo-free (clean typography & layout)
 * - Single-column, two-column, sidebar-left, sidebar-right, header-card layouts
 * - Dynamic font families, font sizes, heading scales, line heights
 * - Dynamic color palettes (primary, accent, background, text, borders)
 * - Dynamic section reordering and section visibility
 * - High-fidelity clickable links for PDF export
 */
export function DynamicResumeCanvas({
  resumeData,
  templateId = 'ats-01',
  designOverrides = {},
  pageNumber = 1,
  totalPages = 1,
  isOnePage = false,
}) {
  if (!resumeData) return null;

  // Find template definition in registry (or fallback to ats-01)
  const templateDef = TEMPLATE_REGISTRY.find(t => t.id === templateId) || TEMPLATE_REGISTRY[0];

  // Merge preferences and overrides with template defaults
  const prefs = resumeData?.preferences || {};
  const activeLayout = designOverrides.layout || prefs.layout || templateDef.layout || 'single-column';
  const tplFont = (typeof templateDef.fontFamily === 'string' ? templateDef.fontFamily : null) || templateDef.typography?.bodyFont || 'Inter, sans-serif';
  const fontFamily = designOverrides.fontFamily || prefs.fontFamily || tplFont;
  const headingFont = designOverrides.headingFont || prefs.headingFont || templateDef.typography?.headingFont || fontFamily;
  
  // Font scale (compact: 0.9, normal: 1, large: 1.1)
  const fontScale = designOverrides.fontScale || prefs.fontScale || 1;
  const baseFontSize = (templateDef.typography?.baseSize || 13) * fontScale * (isOnePage ? 0.95 : 1);
  const defaultLineHeight = isOnePage ? 1.28 : (templateDef.typography?.lineHeight || 1.45);
  const lineHeight = designOverrides.lineHeight || prefs.lineHeight || defaultLineHeight;

  // Colors
  const tplPalette = templateDef.palette || templateDef.defaultPalette || {};
  const primaryColor = designOverrides.primaryColor || prefs.themeColor || prefs.primaryColor || tplPalette.primary || '#0f172a';
  const accentColor = designOverrides.accentColor || prefs.accentColor || tplPalette.accent || tplPalette.secondary || '#3b82f6';
  const bgColor = designOverrides.backgroundColor || prefs.backgroundColor || tplPalette.bg || tplPalette.background || '#ffffff';
  const textColor = designOverrides.textColor || prefs.textColor || tplPalette.text || '#1e293b';
  const borderColor = tplPalette.border || '#e2e8f0';

  // Divider and Bullet styles
  const dividerStyle = designOverrides.dividerStyle || prefs.dividerStyle || templateDef.dividerStyle || 'line';
  const bulletStyle = designOverrides.bulletStyle || prefs.bulletStyle || templateDef.bulletStyle || 'disc';
  const bulletSymbol = getBulletSymbol(bulletStyle);

  // Margins & Spacing
  const marginSize = designOverrides.marginSize || prefs.marginSize || 'normal'; // 'compact', 'normal', 'spacious'
  const paddingMap = {
    compact: '14mm 16mm',
    normal: '18mm 20mm',
    spacious: '22mm 24mm',
  };
  const pagePadding = paddingMap[marginSize] || paddingMap.normal;

  // Section Ordering and Visibility
  const defaultOrder = ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'publications', 'awards', 'languages'];
  const sectionOrder = prefs.sectionOrder && prefs.sectionOrder.length > 0 ? prefs.sectionOrder : defaultOrder;
  const sectionVisibility = prefs.sectionVisibility || {};

  const isVisible = (secKey) => {
    return sectionVisibility[secKey] !== false; // Visible by default unless explicitly false
  };

  const {
    personalInfo = {},
    professionalSummary = '',
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    publications = [],
    awards = [],
    languages = [],
    customSections = [],
  } = resumeData;

  // Section Heading Component with matching divider style
  const SectionHeading = ({ title, icon: Icon }) => {
    let dividerClass = 'border-b-[1.5px] pb-1 mb-2';
    let dividerInlineStyle = { borderColor: primaryColor, boxSizing: 'border-box' };

    if (dividerStyle === 'bar') {
      dividerClass = 'pl-2.5 border-l-4 mb-2';
      dividerInlineStyle = { borderColor: primaryColor, boxSizing: 'border-box' };
    } else if (dividerStyle === 'dashed') {
      dividerClass = 'border-b border-dashed pb-1 mb-2';
      dividerInlineStyle = { borderColor: primaryColor, boxSizing: 'border-box' };
    } else if (dividerStyle === 'double') {
      dividerClass = 'border-b-2 border-double pb-1 mb-2';
      dividerInlineStyle = { borderColor: primaryColor, boxSizing: 'border-box' };
    } else if (dividerStyle === 'minimal') {
      dividerClass = 'mb-1.5';
      dividerInlineStyle = { boxSizing: 'border-box' };
    } else if (dividerStyle === 'none') {
      dividerClass = 'mb-1.5';
      dividerInlineStyle = { boxSizing: 'border-box' };
    }

    return (
      <div className={`${isOnePage ? 'mt-1.5' : 'mt-2.5'} first:mt-0 ${dividerClass}`} style={dividerInlineStyle}>
        <h2
          className="font-bold tracking-tight uppercase flex items-center gap-1.5 leading-normal"
          style={{
            fontFamily: headingFont,
            fontSize: `${(baseFontSize * 1.15).toFixed(1)}px`,
            color: primaryColor,
            letterSpacing: '0.04em',
            margin: 0,
            padding: 0,
            display: 'flex',
          }}
        >
          {Icon && (
            <span className="inline-flex items-center justify-center shrink-0" style={{ width: '14px', height: '14px' }}>
              <Icon className="w-3.5 h-3.5 opacity-85 shrink-0" style={{ color: accentColor, strokeWidth: 2, display: 'block' }} />
            </span>
          )}
          <span>{title}</span>
        </h2>
      </div>
    );
  };

  const effectivePageNumber = pageNumber || resumeData?.pageNumber || 1;
  const isContinuation = Boolean(resumeData?.isContinuation || effectivePageNumber > 1);

  // 1. Candidate Header Component (With optional photo support)
  const HeaderComponent = () => {
    // On continuation pages (Page 2+), DO NOT render candidate name, title, or contact details.
    // Continuation pages start directly with the remaining resume sections (experience, projects, etc.).
    if (effectivePageNumber > 1 || isContinuation) {
      return null;
    }

    const isHeaderCard = activeLayout === 'header-card';
    const isCenteredHeader = activeLayout === 'single-column';

    return (
      <header
        className={`${isOnePage ? 'pb-2 mb-2' : 'pb-3 mb-3'} ${isHeaderCard ? 'p-4 rounded-xl mb-3' : 'border-b'}`}
        style={{
          borderColor: isHeaderCard ? 'transparent' : `${primaryColor}35`,
          backgroundColor: isHeaderCard ? primaryColor : 'transparent',
          color: isHeaderCard ? '#ffffff' : textColor,
        }}
      >
        <div className={`flex ${isCenteredHeader ? 'flex-col items-center text-center gap-2' : 'flex-row items-center gap-4'}`}>
          {personalInfo.photo && (
            <div className="shrink-0">
              <img
                src={personalInfo.photo}
                alt={personalInfo.fullName || 'Candidate Photo'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 shadow-sm"
                style={{ borderColor: isHeaderCard ? '#ffffff' : primaryColor }}
              />
            </div>
          )}
          <div className={`flex-1 flex flex-col gap-1 min-w-0 w-full ${isCenteredHeader ? 'items-center' : ''}`}>
            <div className={`flex flex-col ${isCenteredHeader ? 'items-center text-center' : 'items-start'} gap-0.5 w-full min-w-0`}>
              <h1
                className="font-extrabold tracking-tight uppercase break-words max-w-full"
                style={{
                  fontFamily: headingFont,
                  fontSize: `${(baseFontSize * 2.1).toFixed(1)}px`,
                  color: isHeaderCard ? '#ffffff' : primaryColor,
                  lineHeight: 1.15,
                }}
              >
                {personalInfo.fullName || 'YOUR NAME'}
              </h1>
              {personalInfo.professionalTitle && (
                <span
                  className="font-bold text-xs sm:text-sm tracking-wide uppercase break-words max-w-full"
                  style={{
                    color: isHeaderCard ? 'rgba(255,255,255,0.9)' : accentColor,
                    fontFamily: headingFont,
                  }}
                >
                  {personalInfo.professionalTitle}
                </span>
              )}
            </div>

          {/* Contact Bar */}
          <div
            className={`flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs ${isCenteredHeader ? 'justify-center' : 'justify-start'}`}
            style={{ color: isHeaderCard ? 'rgba(255,255,255,0.92)' : textColor, opacity: isHeaderCard ? 1 : 0.9 }}
          >
            {personalInfo.phone && (
              <a
                href={`tel:${personalInfo.phone}`}
                className="inline-flex items-center gap-1.5 hover:underline text-current leading-none"
              >
                <span className="inline-flex items-center justify-center shrink-0" style={{ width: '13px', height: '13px' }}>
                  <Phone className="w-3 h-3 shrink-0" style={{ color: accentColor, strokeWidth: 2, display: 'block' }} />
                </span>
                <span className="leading-tight">{personalInfo.phone}</span>
              </a>
            )}
            {personalInfo.email && (
              <a
                href={`mailto:${personalInfo.email}`}
                className="inline-flex items-center gap-1.5 hover:underline text-current leading-none"
              >
                <span className="inline-flex items-center justify-center shrink-0" style={{ width: '13px', height: '13px' }}>
                  <Mail className="w-3 h-3 shrink-0" style={{ color: accentColor, strokeWidth: 2, display: 'block' }} />
                </span>
                <span className="leading-tight">{personalInfo.email}</span>
              </a>
            )}
            {personalInfo.location && (
              <span className="inline-flex items-center gap-1.5 leading-none">
                <span className="inline-flex items-center justify-center shrink-0" style={{ width: '13px', height: '13px' }}>
                  <MapPin className="w-3 h-3 shrink-0" style={{ color: accentColor, strokeWidth: 2, display: 'block' }} />
                </span>
                <span className="leading-tight">{personalInfo.location}</span>
              </span>
            )}
            {personalInfo.linkedin && (
              <a
                href={normalizeUrl(personalInfo.linkedin)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:underline text-current font-medium leading-none"
              >
                <span className="inline-flex items-center justify-center shrink-0" style={{ width: '13px', height: '13px' }}>
                  <Linkedin className="w-3 h-3 shrink-0" style={{ color: accentColor, strokeWidth: 2, display: 'block' }} />
                </span>
                <span className="leading-tight">{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/i, 'linkedin.com/in/')}</span>
              </a>
            )}
            {personalInfo.github && (
              <a
                href={normalizeUrl(personalInfo.github)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:underline text-current font-medium leading-none"
              >
                <span className="inline-flex items-center justify-center shrink-0" style={{ width: '13px', height: '13px' }}>
                  <Github className="w-3 h-3 shrink-0" style={{ color: accentColor, strokeWidth: 2, display: 'block' }} />
                </span>
                <span className="leading-tight">{personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\/?/i, 'github.com/')}</span>
              </a>
            )}
            {personalInfo.website && (
              <a
                href={normalizeUrl(personalInfo.website)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:underline text-current font-medium leading-none"
              >
                <span className="inline-flex items-center justify-center shrink-0" style={{ width: '13px', height: '13px' }}>
                  <Globe className="w-3 h-3 shrink-0" style={{ color: accentColor, strokeWidth: 2, display: 'block' }} />
                </span>
                <span className="leading-tight">{personalInfo.website.replace(/^https?:\/\//i, '').replace(/\/$/, '')}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

  // Section Renderers
  const renderSummary = () => {
    // Professional summary MUST ONLY ever appear on Page 1
    if (effectivePageNumber > 1 || isContinuation) return null;
    if (!isVisible('summary') || !professionalSummary) return null;
    return (
      <section className={isOnePage ? "mb-2" : "mb-3"}>
        <SectionHeading title="Professional Summary" icon={Briefcase} />
        <p
          className="leading-relaxed text-justify"
          style={{ fontSize: `${baseFontSize}px`, color: textColor }}
        >
          {professionalSummary}
        </p>
      </section>
    );
  };

  const renderSkills = () => {
    if (!isVisible('skills') || !skills || skills.length === 0) return null;

    // Categorized or flat skills
    const isCategorized = skills.some(s => typeof s === 'object' && s.category);

    return (
      <section className={isOnePage ? "mb-2" : "mb-3"}>
        <SectionHeading title="Technical & Core Skills" icon={Wrench} />
        {isCategorized ? (
          <div className={isOnePage ? "space-y-1" : "space-y-1.5"} style={{ fontSize: `${baseFontSize}px` }}>
            {skills.map((catGroup, idx) => (
              <div key={idx} className="flex flex-row items-baseline gap-1">
                <span className="font-semibold shrink-0" style={{ color: primaryColor, minWidth: '135px' }}>
                  {catGroup.category || catGroup.name}:
                </span>
                <span className="leading-snug flex-1" style={{ color: textColor }}>
                  {Array.isArray(catGroup.items)
                    ? catGroup.items.join(' • ')
                    : catGroup.items || catGroup.skills || ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5" style={{ fontSize: `${baseFontSize * 0.95}px` }}>
            {skills.map((skill, idx) => {
              const skillName = typeof skill === 'string' ? skill : skill.name;
              return (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: `${primaryColor}12`,
                    color: primaryColor,
                    border: `1px solid ${primaryColor}25`,
                  }}
                >
                  {skillName}
                </span>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  const renderExperience = () => {
    if (!isVisible('experience') || !experience || experience.length === 0) return null;

    return (
      <section className={isOnePage ? "mb-2" : "mb-3"}>
        <SectionHeading title="Professional Experience" icon={Briefcase} />
        <div className={isOnePage ? "space-y-1.5" : "space-y-2.5"}>
          {experience.map((job, idx) => {
            const responsibilities = Array.isArray(job.responsibilities)
              ? job.responsibilities
              : (job.description ? job.description.split('\n').filter(Boolean) : []);

            return (
              <div key={idx} className="space-y-0.5">
                <div className="flex flex-row items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 leading-snug">
                    <span
                      className="font-bold tracking-tight"
                      style={{ fontSize: `${(baseFontSize * 1.05).toFixed(1)}px`, color: primaryColor }}
                    >
                      {job.position || job.title || 'Role'}
                    </span>
                    {job.company && (
                      <span className="text-sm font-semibold opacity-85" style={{ color: textColor }}>
                        {' '}— {job.company}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium shrink-0 text-right whitespace-nowrap pt-0.5" style={{ color: accentColor }}>
                    <span>{job.startDate || job.period || ''}</span>
                    {(job.endDate || job.isCurrent) && <span> — {job.isCurrent ? 'Present' : job.endDate}</span>}
                    {job.location && <span className="opacity-75"> | {job.location}</span>}
                  </div>
                </div>

                {responsibilities.length > 0 && (
                  <ul className="space-y-0.5 pl-3.5 mt-0.5" style={{ fontSize: `${baseFontSize}px`, color: textColor }}>
                    {responsibilities.map((bullet, bIdx) => (
                      <li key={bIdx} className="relative leading-relaxed pl-1.5">
                        <span className="absolute -left-3.5 top-0 font-bold opacity-75" style={{ color: accentColor }}>
                          {bulletSymbol}
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderProjects = () => {
    if (!isVisible('projects') || !projects || projects.length === 0) return null;

    return (
      <section className={isOnePage ? "mb-2" : "mb-3"}>
        <SectionHeading title="Key Projects & Systems" icon={FolderGit2} />
        <div className={isOnePage ? "space-y-1.5" : "space-y-2"}>
          {projects.map((proj, idx) => {
            const descLines = proj.description
              ? String(proj.description).split('\n').map((s) => s.trim()).filter(Boolean)
              : [];
            const hlLines = Array.isArray(proj.highlights)
              ? proj.highlights.map((s) => String(s).trim()).filter(Boolean)
              : [];
            const projectLines = descLines.length > 0 ? descLines : hlLines;

            const liveHref = proj.liveUrl || (proj.link && !String(proj.link).toLowerCase().includes('github.com') ? proj.link : '');
            const githubHref = proj.githubUrl || (proj.link && String(proj.link).toLowerCase().includes('github.com') ? proj.link : '');

            return (
              <div key={idx} className="space-y-0.5">
                <div className="flex flex-row items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span
                      className="font-bold tracking-tight"
                      style={{ fontSize: `${(baseFontSize * 1.02).toFixed(1)}px`, color: primaryColor }}
                    >
                      {proj.name || proj.title}
                    </span>
                    {liveHref && (
                      <a
                        href={normalizeUrl(liveHref)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 text-xs font-medium hover:underline shrink-0"
                        style={{ color: accentColor }}
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                    {githubHref && (
                      <a
                        href={normalizeUrl(githubHref)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 text-xs font-medium hover:underline shrink-0"
                        style={{ color: accentColor }}
                      >
                        <Github className="w-2.5 h-2.5" />
                        <span>GitHub</span>
                      </a>
                    )}
                  </div>
                  {(proj.date || proj.period || proj.startDate || proj.endDate) && (
                    <span className="text-xs font-medium shrink-0 whitespace-nowrap" style={{ color: accentColor }}>
                      {proj.date || proj.period || [proj.startDate, proj.endDate].filter(Boolean).join(' — ')}
                    </span>
                  )}
                </div>

                {proj.technologies && (Array.isArray(proj.technologies) ? proj.technologies.length > 0 : String(proj.technologies).trim().length > 0) && (
                  <div className="text-xs font-mono font-medium opacity-85" style={{ color: accentColor }}>
                    Tech Stack: {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                  </div>
                )}

                {projectLines.length > 0 && (
                  <ul className="space-y-0.5 pl-3.5 mt-0.5" style={{ fontSize: `${baseFontSize}px`, color: textColor }}>
                    {projectLines.map((h, hIdx) => (
                      <li key={hIdx} className="relative leading-relaxed pl-1.5">
                        <span className="absolute -left-3.5 top-0 font-bold opacity-75" style={{ color: accentColor }}>
                          {bulletSymbol}
                        </span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderEducation = () => {
    if (!isVisible('education') || !education || education.length === 0) return null;

    return (
      <section className={isOnePage ? "mb-2" : "mb-3"}>
        <SectionHeading title="Education" icon={GraduationCap} />
        <div className={isOnePage ? "space-y-1" : "space-y-1.5"}>
          {education.map((edu, idx) => (
            <div key={idx} className="flex flex-row items-baseline justify-between gap-1">
              <div>
                <div
                  className="font-bold"
                  style={{ fontSize: `${(baseFontSize * 1.02).toFixed(1)}px`, color: primaryColor }}
                >
                  {edu.degree || edu.degreeTitle}
                  {edu.fieldOfStudy && <span> in {edu.fieldOfStudy}</span>}
                </div>
                <div className="text-xs font-semibold opacity-90" style={{ color: textColor }}>
                  {edu.institution || edu.school}
                  {edu.location && <span className="opacity-75"> — {edu.location}</span>}
                  {edu.gpa && <span className="ml-2 font-mono text-[11px] font-bold text-emerald-700">GPA: {edu.gpa}</span>}
                </div>
              </div>
              <div className="text-xs font-medium shrink-0" style={{ color: accentColor }}>
                {edu.graduationDate || edu.endDate || edu.year || edu.period || ''}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCertifications = () => {
    if (!isVisible('certifications') || !certifications || certifications.length === 0) return null;

    return (
      <section className={isOnePage ? "mb-2" : "mb-3"}>
        <SectionHeading title="Certifications & Credentials" icon={Award} />
        <div className="grid grid-cols-2 gap-1.5" style={{ fontSize: `${baseFontSize}px` }}>
          {certifications.map((cert, idx) => {
            const certName = typeof cert === 'string' ? cert : (cert.name || cert.title);
            const issuer = typeof cert === 'object' ? cert.issuer : null;
            const date = typeof cert === 'object' ? (cert.date || cert.issueDate) : null;

            return (
              <div key={idx} className="flex items-baseline justify-between gap-1">
                <div className="truncate">
                  <span className="font-semibold" style={{ color: primaryColor }}>• {certName}</span>
                  {issuer && <span className="text-xs opacity-75 ml-1">({issuer})</span>}
                </div>
                {date && <span className="text-xs font-medium opacity-75 shrink-0" style={{ color: accentColor }}>{date}</span>}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderPublications = () => {
    if (!isVisible('publications') || !publications || publications.length === 0) return null;

    return (
      <section className="mb-3">
        <SectionHeading title="Publications & Research" icon={BookOpen} />
        <div className="space-y-1.5" style={{ fontSize: `${baseFontSize}px`, color: textColor }}>
          {publications.map((pub, idx) => (
            <div key={idx} className="leading-snug">
              <span className="font-bold" style={{ color: primaryColor }}>"{pub.title}"</span>
              {pub.publisher && <span className="italic ml-1">— {pub.publisher}</span>}
              {pub.date && <span className="text-xs ml-1 opacity-75">({pub.date})</span>}
              {pub.link && (
                <a
                  href={normalizeUrl(pub.link)}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-1 text-xs underline font-medium"
                  style={{ color: accentColor }}
                >
                  [View]
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderAwards = () => {
    if (!isVisible('awards') || !awards || awards.length === 0) return null;

    return (
      <section className="mb-3">
        <SectionHeading title="Honors & Awards" icon={Star} />
        <div className="space-y-1" style={{ fontSize: `${baseFontSize}px`, color: textColor }}>
          {awards.map((award, idx) => (
            <div key={idx} className="flex justify-between items-baseline gap-1">
              <div>
                <span className="font-semibold" style={{ color: primaryColor }}>• {award.title || award.name}</span>
                {award.issuer && <span className="text-xs opacity-75 ml-1">— {award.issuer}</span>}
              </div>
              {award.date && <span className="text-xs opacity-75 shrink-0">{award.date}</span>}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderLanguages = () => {
    if (!isVisible('languages') || !languages || languages.length === 0) return null;

    return (
      <section className="mb-3">
        <SectionHeading title="Languages" icon={LangIcon} />
        <div className="flex flex-wrap gap-3" style={{ fontSize: `${baseFontSize}px`, color: textColor }}>
          {languages.map((lang, idx) => {
            const name = typeof lang === 'string' ? lang : lang.language;
            const level = typeof lang === 'object' ? lang.proficiency : null;
            return (
              <span key={idx} className="font-medium">
                {name}{level && <span className="text-xs opacity-75 font-normal"> ({level})</span>}
              </span>
            );
          })}
        </div>
      </section>
    );
  };

  const renderCustomSections = () => {
    if (!customSections || customSections.length === 0) return null;

    return (
      <>
        {customSections.map((sec, idx) => {
          if (!sec.title || !sec.content) return null;
          return (
            <section key={idx} className="mb-3">
              <SectionHeading title={sec.title} icon={Briefcase} />
              <div
                className="leading-relaxed whitespace-pre-line"
                style={{ fontSize: `${baseFontSize}px`, color: textColor }}
              >
                {sec.content}
              </div>
            </section>
          );
        })}
      </>
    );
  };

  // Section dispatch map
  const sectionMap = {
    summary: renderSummary,
    skills: renderSkills,
    experience: renderExperience,
    projects: renderProjects,
    education: renderEducation,
    certifications: renderCertifications,
    publications: renderPublications,
    awards: renderAwards,
    languages: renderLanguages,
  };

  // Layout Dispatcher
  const renderLayoutContent = () => {
    // 1. Single Column Layout (Clean ATS Standard)
    if (activeLayout === 'single-column' || activeLayout === 'header-card') {
      return (
        <div className="space-y-1">
          {sectionOrder.map(secKey => {
            const renderer = sectionMap[secKey];
            return renderer ? <React.Fragment key={secKey}>{renderer()}</React.Fragment> : null;
          })}
          {renderCustomSections()}
        </div>
      );
    }

    // 2. Two Column / Sidebar Layout
    // Primary main column sections: summary, experience, projects
    // Secondary sidebar column sections: skills, education, certifications, awards, languages
    const isSidebarLeft = activeLayout === 'sidebar-left';
    const mainSections = ['summary', 'experience', 'projects'];
    const sideSections = ['skills', 'education', 'certifications', 'publications', 'awards', 'languages'];

    // Check if there is actual content in the sidebar for this page
    const hasSideItems = sideSections.some(secKey => {
      if (secKey === 'skills') return skills && skills.length > 0 && isVisible('skills');
      if (secKey === 'education') return education && education.length > 0 && isVisible('education');
      if (secKey === 'certifications') return certifications && certifications.length > 0 && isVisible('certifications');
      if (secKey === 'publications') return publications && publications.length > 0 && isVisible('publications');
      if (secKey === 'awards') return awards && awards.length > 0 && isVisible('awards');
      if (secKey === 'languages') return languages && languages.length > 0 && isVisible('languages');
      return false;
    });

    if (!hasSideItems) {
      // If no sidebar items exist on this page, let main content occupy the full width seamlessly!
      return (
        <div className="w-full space-y-1">
          {sectionOrder.map(secKey => {
            const renderer = sectionMap[secKey];
            return renderer ? <React.Fragment key={secKey}>{renderer()}</React.Fragment> : null;
          })}
          {renderCustomSections()}
        </div>
      );
    }

    const mainContent = (
      <div className="flex-1 space-y-1 min-w-0">
        {sectionOrder.filter(k => mainSections.includes(k)).map(secKey => {
          const renderer = sectionMap[secKey];
          return renderer ? <React.Fragment key={secKey}>{renderer()}</React.Fragment> : null;
        })}
        {renderCustomSections()}
      </div>
    );

    const isSidebar = activeLayout === 'sidebar-left' || activeLayout === 'sidebar-right';
    const sideContent = (
      <div
        className="w-[34%] shrink-0 space-y-1"
        style={{
          backgroundColor: isSidebar ? `${primaryColor}0c` : 'transparent',
          borderRadius: isSidebar ? '8px' : '0',
          padding: isSidebar ? '12px' : (isSidebarLeft ? '0 14px 0 0' : '0 0 0 14px'),
          borderLeft: !isSidebar && !isSidebarLeft ? `1px solid ${borderColor}` : 'none',
          borderRight: !isSidebar && isSidebarLeft ? `1px solid ${borderColor}` : 'none',
        }}
      >
        {sectionOrder.filter(k => sideSections.includes(k)).map(secKey => {
          const renderer = sectionMap[secKey];
          return renderer ? <React.Fragment key={secKey}>{renderer()}</React.Fragment> : null;
        })}
      </div>
    );

    return (
      <div className="flex flex-row gap-4 items-start w-full">
        {isSidebarLeft ? (
          <>
            {sideContent}
            {mainContent}
          </>
        ) : (
          <>
            {mainContent}
            {sideContent}
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className="resume-dynamic-canvas font-normal w-full"
      style={{
        fontFamily,
        lineHeight,
        color: textColor,
        backgroundColor: bgColor,
        padding: 0,
        boxSizing: 'border-box',
        minHeight: '100%',
      }}
    >
      <HeaderComponent />
      {renderLayoutContent()}
    </div>
  );
}
