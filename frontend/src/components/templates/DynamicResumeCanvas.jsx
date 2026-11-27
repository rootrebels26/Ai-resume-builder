import React from 'react';
import { TEMPLATE_REGISTRY } from '../../constants/templateRegistry';
import { getTemplateHeaderStyle, getTemplateVisualArchetype } from '../../utils/templateStyleResolver';
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
  const mutedColor = tplPalette.muted || '#475569';
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
    achievements = [],
    languages = [],
    customSections = [],
  } = resumeData;

  const mergedAchievements = (achievements && achievements.length > 0) ? achievements : awards;

  const effectivePageNumber = pageNumber || resumeData?.pageNumber || 1;
  const isContinuation = Boolean(resumeData?.isContinuation || effectivePageNumber > 1);
  const visualArchetype = getTemplateVisualArchetype(templateDef, activeLayout);
  const isProPaulNavy = visualArchetype === 'pro-navy-right-sidebar';
  const isProBradSplit = visualArchetype === 'pro-clean-split';
  const isProHarperBanner = visualArchetype === 'pro-navy-banner-split';
  const isProJoannaMint = visualArchetype === 'pro-mint-left-sidebar';
  const isProJacksonCenter = visualArchetype === 'pro-classic-center';
  const isProTemplate = isProPaulNavy || isProBradSplit || isProHarperBanner || isProJoannaMint || isProJacksonCenter;
  const isDarkSidebar = visualArchetype === 'sidebar-dark-left' || visualArchetype === 'sidebar-dark-right' || isProPaulNavy;
  const isSidebarLayout = activeLayout === 'sidebar-left' || activeLayout === 'sidebar-right';
  const isNarrowSideColumn = isSidebarLayout || activeLayout === 'two-column';

  // Section Heading Component with matching divider style & print orphan protection
  const isStrictAtsTemplate = String(templateId || '').startsWith('ats-');
  const SectionHeading = ({ title, icon: Icon }) => {
    let dividerClass = 'border-b-[1.5px] pb-1 mb-2';
    let dividerInlineStyle = { borderColor: primaryColor, boxSizing: 'border-box', breakAfter: 'avoid', pageBreakAfter: 'avoid' };

    if (isProJacksonCenter) {
      dividerClass = 'border-b pb-1 mb-2';
      dividerInlineStyle = { borderColor: borderColor || '#94a3b8', boxSizing: 'border-box', breakAfter: 'avoid', pageBreakAfter: 'avoid' };
    } else if (isProBradSplit || isProHarperBanner) {
      dividerClass = 'border-b-2 pb-0.5 mb-2';
      dividerInlineStyle = { borderColor: primaryColor, boxSizing: 'border-box', breakAfter: 'avoid', pageBreakAfter: 'avoid' };
    } else if (isProJoannaMint) {
      dividerClass = 'border-b pb-1 mb-2';
      dividerInlineStyle = { borderColor: borderColor || '#d1d5db', boxSizing: 'border-box', breakAfter: 'avoid', pageBreakAfter: 'avoid' };
    } else if (dividerStyle === 'bar') {
      dividerClass = 'pl-2.5 border-l-4 mb-2';
      dividerInlineStyle = { borderColor: primaryColor, boxSizing: 'border-box', breakAfter: 'avoid', pageBreakAfter: 'avoid' };
    } else if (dividerStyle === 'dashed') {
      dividerClass = 'border-b border-dashed pb-1 mb-2';
      dividerInlineStyle = { borderColor: primaryColor, boxSizing: 'border-box', breakAfter: 'avoid', pageBreakAfter: 'avoid' };
    } else if (dividerStyle === 'double') {
      dividerClass = 'border-b-2 border-double pb-1 mb-2';
      dividerInlineStyle = { borderColor: primaryColor, boxSizing: 'border-box', breakAfter: 'avoid', pageBreakAfter: 'avoid' };
    } else if (dividerStyle === 'minimal' || dividerStyle === 'none') {
      dividerClass = 'mb-1.5';
      dividerInlineStyle = { boxSizing: 'border-box', breakAfter: 'avoid', pageBreakAfter: 'avoid' };
    }

    const hideProIcon = isProPaulNavy || isProBradSplit || isProHarperBanner || isProJacksonCenter;

    return (
      <div className={`${isOnePage ? 'mt-1.5' : 'mt-2.5'} first:mt-0 ${dividerClass}`} style={dividerInlineStyle}>
        <h2
          className={`font-bold tracking-tight flex items-center gap-1.5 leading-normal ${isProJacksonCenter ? 'justify-center text-center' : 'uppercase'}`}
          style={{
            fontFamily: headingFont,
            fontSize: `${(baseFontSize * (isProJacksonCenter ? 1.12 : 1.08)).toFixed(1)}px`,
            color: primaryColor,
            letterSpacing: isProJacksonCenter ? '0.01em' : '0.05em',
            margin: 0,
            padding: 0,
            display: 'flex',
          }}
        >
          {Icon && !isStrictAtsTemplate && !hideProIcon && (
            <span
              aria-hidden="true"
              className={`inline-flex items-center justify-center shrink-0 ${isProJoannaMint ? 'rounded p-0.5' : ''}`}
              style={{
                width: isProJoannaMint ? '18px' : '14px',
                height: isProJoannaMint ? '18px' : '14px',
                backgroundColor: isProJoannaMint ? `${accentColor}55` : 'transparent',
              }}
            >
              <Icon className="w-3.5 h-3.5 opacity-85 shrink-0" style={{ color: isProJoannaMint ? primaryColor : accentColor, strokeWidth: 2, display: 'block' }} />
            </span>
          )}
          <span>{title}</span>
        </h2>
      </div>
    );
  };

  // Helper for contact items across Pro and standard headers
  const renderProContactRow = (compactGrid = false, useDots = false, lightText = false) => {
    const iconCol = lightText ? 'rgba(255,255,255,0.85)' : accentColor;
    const items = [];
    if (personalInfo.phone) {
      items.push(
        <a key="phone" href={`tel:${personalInfo.phone}`} className="inline-flex items-center gap-1.5 hover:underline text-current leading-none">
          {!useDots && <Phone className="w-3 h-3 shrink-0" style={{ color: iconCol, strokeWidth: 2 }} />}
          <span>{personalInfo.phone}</span>
        </a>
      );
    }
    if (personalInfo.email) {
      items.push(
        <a key="email" href={`mailto:${personalInfo.email}`} className="inline-flex items-center gap-1.5 hover:underline text-current leading-none">
          {!useDots && <Mail className="w-3 h-3 shrink-0" style={{ color: iconCol, strokeWidth: 2 }} />}
          <span>{personalInfo.email}</span>
        </a>
      );
    }
    if (personalInfo.linkedin) {
      items.push(
        <a key="linkedin" href={normalizeUrl(personalInfo.linkedin)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:underline text-current leading-none">
          {!useDots && <Linkedin className="w-3 h-3 shrink-0" style={{ color: iconCol, strokeWidth: 2 }} />}
          <span>{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/i, 'linkedin.com/in/')}</span>
        </a>
      );
    }
    if (personalInfo.location) {
      items.push(
        <span key="loc" className="inline-flex items-center gap-1.5 leading-none">
          {!useDots && <MapPin className="w-3 h-3 shrink-0" style={{ color: iconCol, strokeWidth: 2 }} />}
          <span>{personalInfo.location}</span>
        </span>
      );
    }
    if (personalInfo.website) {
      items.push(
        <a key="web" href={normalizeUrl(personalInfo.website)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:underline text-current leading-none">
          {!useDots && <Globe className="w-3 h-3 shrink-0" style={{ color: iconCol, strokeWidth: 2 }} />}
          <span>{personalInfo.website.replace(/^https?:\/\//i, '').replace(/\/$/, '')}</span>
        </a>
      );
    }

    if (compactGrid) {
      return <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] mt-1">{items}</div>;
    }

    if (useDots) {
      return (
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px]" style={{ color: textColor }}>
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              {item}
              {idx < items.length - 1 && <span aria-hidden="true" className="opacity-50">•</span>}
            </React.Fragment>
          ))}
        </div>
      );
    }

    return <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px]">{items}</div>;
  };

  // In-column header for Paul Cross (main left col) & Joanna Nelson (main right col)
  const renderProMainHeader = () => {
    if (effectivePageNumber > 1 || isContinuation) return null;

    if (isProJoannaMint) {
      return (
        <header className="mb-3">
          <h1
            className="font-light tracking-wider uppercase break-words mb-1.5"
            style={{
              fontFamily: headingFont,
              fontSize: `${(baseFontSize * 2.15).toFixed(1)}px`,
              color: textColor,
              lineHeight: 1.1,
            }}
          >
            {personalInfo.fullName || 'YOUR NAME'}
          </h1>
          {personalInfo.professionalTitle && (
            <div
              className="rounded-xl px-3.5 py-2 font-medium tracking-wider uppercase text-xs"
              style={{
                backgroundColor: accentColor,
                color: '#14532d',
                fontFamily: headingFont,
              }}
            >
              {personalInfo.professionalTitle}
            </div>
          )}
        </header>
      );
    }

    if (isProPaulNavy) {
      return (
        <header className="mb-3.5">
          <h1
            className="font-extrabold tracking-tight uppercase break-words"
            style={{
              fontFamily: headingFont,
              fontSize: `${(baseFontSize * 2.1).toFixed(1)}px`,
              color: textColor,
              lineHeight: 1.1,
            }}
          >
            {personalInfo.fullName || 'YOUR NAME'}
          </h1>
          {personalInfo.professionalTitle && (
            <div
              className="font-semibold text-xs mt-0.5 mb-2 break-words"
              style={{ color: accentColor, fontFamily: headingFont }}
            >
              {personalInfo.professionalTitle}
            </div>
          )}
          <div style={{ color: mutedColor || textColor }}>
            {renderProContactRow(false, false, false)}
          </div>
        </header>
      );
    }

    return null;
  };

  // 1. Candidate Header Component (With optional photo support)
  const HeaderComponent = () => {
    // On continuation pages (Page 2+), DO NOT render candidate name, title, or contact details.
    if (effectivePageNumber > 1 || isContinuation) {
      return null;
    }

    // Paul Cross & Joanna Nelson render their headers inside their main columns
    if (isProPaulNavy || isProJoannaMint) {
      return null;
    }

    // Harper Garcia: Full-bleed dark navy top header banner with circular photo on top-right
    if (isProHarperBanner) {
      return (
        <header
          className="flex flex-row items-center justify-between gap-4"
          style={{
            backgroundColor: primaryColor,
            color: '#ffffff',
            padding: isOnePage ? '8mm 14mm' : '10mm 14mm',
          }}
        >
          <div className="flex-1 min-w-0">
            <h1
              className="font-extrabold tracking-tight uppercase break-words"
              style={{
                fontFamily: headingFont,
                fontSize: `${(baseFontSize * 2.1).toFixed(1)}px`,
                color: '#ffffff',
                lineHeight: 1.12,
              }}
            >
              {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            {personalInfo.professionalTitle && (
              <div
                className="font-medium text-xs mt-0.5 mb-2 break-words"
                style={{ color: 'rgba(255,255,255,0.92)', fontFamily: headingFont }}
              >
                {personalInfo.professionalTitle}
              </div>
            )}
            <div style={{ color: 'rgba(255,255,255,0.9)' }}>
              {renderProContactRow(true, false, true)}
            </div>
          </div>
          {personalInfo.photo && (
            <div className="shrink-0">
              <img
                src={personalInfo.photo}
                alt={personalInfo.fullName || 'Candidate Photo'}
                className="w-20 h-20 rounded-full object-cover border-2 border-white/30 shadow-sm"
              />
            </div>
          )}
        </header>
      );
    }

    // Brad Jensen: Clean white left-aligned header with bold black uppercase name & blue subtitle
    if (isProBradSplit) {
      return (
        <header className="mb-3.5 pb-1">
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1
                className="font-extrabold tracking-tight uppercase break-words"
                style={{
                  fontFamily: headingFont,
                  fontSize: `${(baseFontSize * 2.15).toFixed(1)}px`,
                  color: primaryColor,
                  lineHeight: 1.1,
                }}
              >
                {personalInfo.fullName || 'YOUR NAME'}
              </h1>
              {personalInfo.professionalTitle && (
                <div
                  className="font-semibold text-xs mt-0.5 mb-1.5 break-words"
                  style={{ color: accentColor, fontFamily: headingFont }}
                >
                  {personalInfo.professionalTitle}
                </div>
              )}
              <div style={{ color: textColor }}>
                {renderProContactRow(false, false, false)}
              </div>
            </div>
            {personalInfo.photo && (
              <div className="shrink-0">
                <img
                  src={personalInfo.photo}
                  alt={personalInfo.fullName || 'Candidate Photo'}
                  className="w-16 h-16 rounded-full object-cover border"
                  style={{ borderColor: borderColor }}
                />
              </div>
            )}
          </div>
        </header>
      );
    }

    // Jackson Miller: Classic centered single-column header with optional centered photo
    if (isProJacksonCenter) {
      return (
        <header className="flex flex-col items-center text-center mb-3 pb-1">
          {personalInfo.photo && (
            <div className="mb-2">
              <img
                src={personalInfo.photo}
                alt={personalInfo.fullName || 'Candidate Photo'}
                className="w-16 h-16 rounded-full object-cover border shadow-sm"
                style={{ borderColor: borderColor }}
              />
            </div>
          )}
          <h1
            className="font-bold tracking-tight break-words"
            style={{
              fontFamily: headingFont,
              fontSize: `${(baseFontSize * 1.95).toFixed(1)}px`,
              color: primaryColor,
              lineHeight: 1.15,
            }}
          >
            {personalInfo.fullName || 'Your Name'}
          </h1>
          {personalInfo.professionalTitle && (
            <div
              className="font-medium text-xs mt-0.5 mb-1.5 break-words"
              style={{ color: accentColor, fontFamily: headingFont }}
            >
              {personalInfo.professionalTitle}
            </div>
          )}
          {renderProContactRow(false, true, false)}
        </header>
      );
    }

    const headerVariant = getTemplateHeaderStyle(templateDef, activeLayout);
    const isBannerSolid = visualArchetype === 'banner-solid';
    const isBannerTinted = visualArchetype === 'banner-tinted';
    const isHeaderCard = isBannerSolid || isBannerTinted;
    const isCenteredHeader = headerVariant === 'centered' || headerVariant === 'centered-boxed';
    const isCenteredBoxed = headerVariant === 'centered-boxed';
    const isAccentBarHeader = headerVariant === 'accent-bar';

    const headerBg = isBannerSolid ? primaryColor : (isBannerTinted ? `${primaryColor}14` : 'transparent');
    const headerTitleColor = isBannerSolid ? '#ffffff' : primaryColor;
    const headerSubColor = isBannerSolid ? 'rgba(255,255,255,0.9)' : accentColor;
    const headerTextColor = isBannerSolid ? 'rgba(255,255,255,0.92)' : textColor;

    return (
      <header
        className={`${isOnePage ? 'pb-2 mb-2' : 'pb-3 mb-3'} ${
          isHeaderCard
            ? 'p-4 rounded-xl mb-3'
            : isCenteredBoxed
              ? 'p-3.5 border rounded-lg mb-3'
              : isAccentBarHeader
                ? 'pl-3.5 border-l-4 pb-2 mb-3'
                : 'border-b'
        }`}
        style={{
          borderColor: isBannerSolid
            ? 'transparent'
            : isBannerTinted
              ? primaryColor
              : isAccentBarHeader
                ? primaryColor
                : `${primaryColor}35`,
          borderLeftWidth: isBannerTinted ? '5px' : undefined,
          backgroundColor: headerBg,
          color: headerTextColor,
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
                  color: headerTitleColor,
                  lineHeight: 1.15,
                }}
              >
                {personalInfo.fullName || 'YOUR NAME'}
              </h1>
              {personalInfo.professionalTitle && (
                <span
                  className="font-bold text-xs sm:text-sm tracking-wide uppercase break-words max-w-full"
                  style={{
                    color: headerSubColor,
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
            style={{ color: headerTextColor, opacity: isBannerSolid ? 1 : 0.9 }}
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
        <SectionHeading title={isProTemplate ? "Summary" : "Professional Summary"} icon={Briefcase} />
        <p
          className={`leading-relaxed ${isProTemplate ? 'text-left' : 'text-justify'}`}
          style={{ fontSize: `${baseFontSize}px`, color: textColor }}
        >
          {professionalSummary}
        </p>
      </section>
    );
  };

  const renderSkills = () => {
    if (!isVisible('skills') || !skills || skills.length === 0) return null;

    // Flatten skill items when rendering Pro template styles
    const flatSkillItems = skills.flatMap((s) => {
      if (typeof s === 'string') return [s];
      if (s && s.items) {
        return Array.isArray(s.items)
          ? s.items
          : String(s.items).split(/[,•]+/).map((x) => x.trim()).filter(Boolean);
      }
      return s && (s.name || s.skill) ? [s.name || s.skill] : [];
    }).filter(Boolean);

    if (isProBradSplit || isProHarperBanner) {
      return (
        <section className={isOnePage ? "mb-2" : "mb-3"}>
          <SectionHeading title="Skills" icon={Wrench} />
          <div className="flex flex-wrap gap-x-3 gap-y-1.5" style={{ fontSize: `${(baseFontSize * 0.94).toFixed(1)}px`, color: textColor }}>
            {flatSkillItems.map((sk, idx) => (
              <span
                key={idx}
                className="font-semibold border-b pb-0.5 leading-snug"
                style={{ borderColor: borderColor || '#cbd5e1', color: textColor }}
              >
                {sk}
              </span>
            ))}
          </div>
        </section>
      );
    }

    if (isProPaulNavy || isProJoannaMint || isProJacksonCenter) {
      return (
        <section className={isOnePage ? "mb-2" : "mb-3"}>
          <SectionHeading title={isProJacksonCenter ? "Core Competencies" : "Skills"} icon={Wrench} />
          <div className="leading-relaxed" style={{ fontSize: `${baseFontSize}px`, color: textColor }}>
            {flatSkillItems.join(isProJacksonCenter ? ', ' : ' • ')}
          </div>
        </section>
      );
    }

    // Categorized or flat skills
    const isCategorized = skills.some(s => typeof s === 'object' && s.category);

    return (
      <section className={isOnePage ? "mb-2" : "mb-3"}>
        <SectionHeading title="Technical & Core Skills" icon={Wrench} />
        {isCategorized ? (
          <div className={isOnePage ? "space-y-1.5" : "space-y-2"} style={{ fontSize: `${baseFontSize}px` }}>
            {skills.map((catGroup, idx) => {
              const itemsArr = Array.isArray(catGroup.items)
                ? catGroup.items
                : String(catGroup.items || catGroup.skills || '').split(/[,•]+/).map(s => s.trim()).filter(Boolean);
              return (
                <div key={idx} className={`flex ${isNarrowSideColumn ? 'flex-col gap-0.5' : 'flex-row items-baseline gap-2'}`}>
                  <span
                    className="font-semibold shrink-0"
                    style={{ color: isDarkSidebar ? '#ffffff' : primaryColor, minWidth: isNarrowSideColumn ? 'auto' : '145px' }}
                  >
                    {catGroup.category || catGroup.name}{isNarrowSideColumn ? '' : ':'}
                  </span>
                  {isNarrowSideColumn ? (
                    <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 leading-snug" style={{ color: isDarkSidebar ? 'rgba(255,255,255,0.92)' : textColor }}>
                      {itemsArr.map((sk, sIdx) => (
                        <span key={sIdx} className="inline-block whitespace-nowrap">
                          {sk}{sIdx < itemsArr.length - 1 ? <span className="opacity-45 ml-1">•</span> : null}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="leading-snug flex-1" style={{ color: isDarkSidebar ? 'rgba(255,255,255,0.92)' : textColor }}>
                      {itemsArr.join(' • ')}
                    </span>
                  )}
                </div>
              );
            })}
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
        <SectionHeading title={isProTemplate ? "Experience" : "Professional Experience"} icon={Briefcase} />
        <div className={isOnePage ? "space-y-1.5" : "space-y-2.5"}>
          {experience.map((job, idx) => {
            const responsibilities = Array.isArray(job.responsibilities)
              ? job.responsibilities
              : (job.description ? job.description.split('\n').filter(Boolean) : []);
            const dateRange = `${job.startDate || job.period || ''}${(job.endDate || job.isCurrent || job.current) ? ` - ${job.isCurrent || job.current ? 'Present' : job.endDate}` : ''}`;

            return (
              <div key={idx} className="space-y-0.5" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                {isProPaulNavy ? (
                  <>
                    <div className="flex flex-row items-baseline justify-between gap-2">
                      <span className="font-bold leading-snug" style={{ fontSize: `${(baseFontSize * 1.05).toFixed(1)}px`, color: textColor }}>
                        {job.position || job.title || 'Role'}
                      </span>
                      <span className="text-[11px] font-medium shrink-0 whitespace-nowrap" style={{ color: mutedColor || textColor }}>
                        {dateRange}
                      </span>
                    </div>
                    {(job.company || job.location) && (
                      <div className="flex flex-row items-baseline justify-between gap-2">
                        <span className="text-xs font-semibold" style={{ color: accentColor }}>
                          {job.company}
                        </span>
                        {job.location && (
                          <span className="text-[11px] shrink-0" style={{ color: mutedColor || textColor }}>
                            {job.location}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                ) : (isProBradSplit || isProHarperBanner) ? (
                  <>
                    <div className="font-bold leading-snug" style={{ fontSize: `${(baseFontSize * 1.05).toFixed(1)}px`, color: textColor }}>
                      {job.position || job.title || 'Role'}
                    </div>
                    {job.company && (
                      <div className="text-xs font-semibold" style={{ color: isProHarperBanner ? primaryColor : accentColor }}>
                        {job.company}
                      </div>
                    )}
                    {(dateRange || job.location) && (
                      <div className="flex flex-wrap items-center gap-3 text-[11px]" style={{ color: mutedColor || textColor }}>
                        {dateRange && <span>{dateRange}</span>}
                        {job.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span>{job.location}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </>
                ) : (isProJoannaMint || isProJacksonCenter) ? (
                  <>
                    <div className="flex flex-row items-baseline justify-between gap-2">
                      <span
                        className="font-bold leading-snug"
                        style={{
                          fontSize: `${(baseFontSize * 1.04).toFixed(1)}px`,
                          color: isProJacksonCenter ? accentColor : textColor,
                        }}
                      >
                        {job.company || job.position || 'Company'}
                      </span>
                      {job.location && (
                        <span className="text-[11px] shrink-0" style={{ color: mutedColor || textColor }}>
                          {job.location}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-row items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold" style={{ color: textColor }}>
                        {job.position || job.title || 'Role'}
                      </span>
                      <span className="text-[11px] shrink-0 whitespace-nowrap" style={{ color: mutedColor || textColor }}>
                        {dateRange}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-row items-baseline justify-between gap-3">
                      <span
                        className="font-bold tracking-tight leading-snug"
                        style={{ fontSize: `${(baseFontSize * 1.05).toFixed(1)}px`, color: primaryColor }}
                      >
                        {job.position || job.title || 'Role'}
                      </span>
                      {dateRange && (
                        <span className="text-xs font-medium shrink-0 text-right whitespace-nowrap" style={{ color: accentColor }}>
                          {dateRange}
                        </span>
                      )}
                    </div>
                    {(job.company || job.location) && (
                      <div className="flex flex-row items-baseline justify-between gap-3">
                        <span className="text-xs font-semibold opacity-90" style={{ color: textColor }}>
                          {job.company}
                        </span>
                        {job.location && (
                          <span className="text-[11px] shrink-0 whitespace-nowrap" style={{ color: mutedColor }}>
                            {job.location}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}

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
            // Merge description lines and bullet highlights without duplicates
            const projectLines = [...descLines];
            hlLines.forEach((h) => {
              if (!projectLines.some((d) => d.toLowerCase() === h.toLowerCase())) {
                projectLines.push(h);
              }
            });

            const liveHref = proj.liveUrl || (proj.link && !String(proj.link).toLowerCase().includes('github.com') ? proj.link : '');
            const githubHref = proj.githubUrl || (proj.link && String(proj.link).toLowerCase().includes('github.com') ? proj.link : '');

            return (
              <div key={idx} className="space-y-1" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div className="flex flex-row items-start justify-between gap-2 leading-snug">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 min-w-0 leading-snug">
                    <span
                      className="font-bold tracking-tight"
                      style={{ fontSize: `${(baseFontSize * 1.02).toFixed(1)}px`, color: primaryColor, lineHeight: 1.35 }}
                    >
                      {proj.name || proj.title}
                    </span>
                    {liveHref && (
                      <a
                        href={normalizeUrl(liveHref)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium hover:underline shrink-0 whitespace-nowrap"
                        style={{ color: accentColor, lineHeight: 1.35 }}
                      >
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        <span>Live Demo</span>
                      </a>
                    )}
                    {githubHref && (
                      <a
                        href={normalizeUrl(githubHref)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium hover:underline shrink-0 whitespace-nowrap"
                        style={{ color: accentColor, lineHeight: 1.35 }}
                      >
                        <Github className="w-2.5 h-2.5 shrink-0" />
                        <span>GitHub</span>
                      </a>
                    )}
                  </div>
                  {(proj.date || proj.period || proj.startDate || proj.endDate) && (
                    <span className="text-xs font-medium shrink-0 whitespace-nowrap" style={{ color: accentColor, lineHeight: 1.35 }}>
                      {proj.date || proj.period || [proj.startDate, proj.endDate].filter(Boolean).join(' — ')}
                    </span>
                  )}
                </div>

                {proj.technologies && (Array.isArray(proj.technologies) ? proj.technologies.length > 0 : String(proj.technologies).trim().length > 0) && (
                  <div className="text-xs font-mono font-medium opacity-85 mt-0.5 leading-snug" style={{ color: accentColor }}>
                    Tech Stack: {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                  </div>
                )}

                {projectLines.length > 0 && (
                  <ul className="space-y-0.5 pl-3.5 mt-0.5 min-w-0" style={{ fontSize: `${baseFontSize}px`, color: textColor, overflowWrap: 'break-word' }}>
                    {projectLines.map((h, hIdx) => (
                      <li key={hIdx} className="relative leading-relaxed pl-1.5 break-words" style={{ overflowWrap: 'break-word' }}>
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
          {education.map((edu, idx) => {
            const dateStr = edu.graduationDate || edu.endDate || edu.year || edu.period || '';
            const fullDateStr = edu.startDate && dateStr ? `${edu.startDate} - ${dateStr}` : dateStr;

            if (isProJoannaMint || isProJacksonCenter) {
              return (
                <div key={idx} className="space-y-0.5" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                  <div className="flex flex-row items-baseline justify-between gap-2">
                    <span
                      className="font-bold leading-snug"
                      style={{ fontSize: `${(baseFontSize * 1.02).toFixed(1)}px`, color: isProJacksonCenter ? accentColor : textColor }}
                    >
                      {edu.institution || edu.school}
                    </span>
                    {edu.location && (
                      <span className="text-[11px] shrink-0" style={{ color: mutedColor || textColor }}>
                        {edu.location}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-row items-baseline justify-between gap-2 text-xs">
                    <span style={{ color: textColor }}>
                      {edu.degree || edu.degreeTitle}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                    </span>
                    {fullDateStr && (
                      <span className="text-[11px] shrink-0 whitespace-nowrap" style={{ color: mutedColor || textColor }}>
                        {fullDateStr}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`flex ${isNarrowSideColumn ? 'flex-col gap-0.5' : 'flex-row items-baseline justify-between gap-2'}`}
                style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
              >
                <div className="min-w-0">
                  <div
                    className="font-bold leading-snug"
                    style={{ fontSize: `${(baseFontSize * 1.02).toFixed(1)}px`, color: isDarkSidebar ? '#ffffff' : primaryColor }}
                  >
                    {edu.degree || edu.degreeTitle}
                    {edu.fieldOfStudy && <span> in {edu.fieldOfStudy}</span>}
                  </div>
                  <div className="text-xs font-semibold opacity-90" style={{ color: isDarkSidebar ? 'rgba(255,255,255,0.9)' : textColor }}>
                    {edu.institution || edu.school}
                    {edu.location && !isProPaulNavy && <span className="opacity-75"> — {edu.location}</span>}
                    {(edu.gpa || edu.cgpa) && <span className="ml-2 font-mono text-[11px] font-bold text-emerald-700">GPA: {edu.gpa || edu.cgpa}</span>}
                  </div>
                </div>
                {(fullDateStr || (isProPaulNavy && edu.location)) && (
                  <div className="flex items-center justify-between gap-2 text-xs font-medium shrink-0 whitespace-nowrap" style={{ color: isDarkSidebar ? 'rgba(255,255,255,0.85)' : accentColor }}>
                    <span>{fullDateStr}</span>
                    {isProPaulNavy && edu.location && <span className="opacity-85">{edu.location}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderCertifications = () => {
    if (!isVisible('certifications') || !certifications || certifications.length === 0) return null;

    return (
      <section className={isOnePage ? "mb-2" : "mb-3"}>
        <SectionHeading title={isProJacksonCenter ? "Training & Courses" : isProTemplate ? "Training / Courses" : "Certifications & Credentials"} icon={Award} />
        {isProTemplate ? (
          <div className="space-y-1.5" style={{ fontSize: `${baseFontSize}px` }}>
            {certifications.map((cert, idx) => {
              const certName = typeof cert === 'string' ? cert : (cert.name || cert.title);
              const issuer = typeof cert === 'object' ? cert.issuer : null;
              const date = typeof cert === 'object' ? (cert.date || cert.issueDate) : null;

              if (isProJacksonCenter) {
                return (
                  <div key={idx} className="leading-snug">
                    <span className="font-semibold" style={{ color: accentColor }}>{certName}</span>
                    {issuer && <span className="ml-1" style={{ color: textColor }}>— {issuer}{date ? ` (${date})` : ''}</span>}
                  </div>
                );
              }

              return (
                <div key={idx} className="leading-snug">
                  <div className="font-bold" style={{ color: isDarkSidebar ? '#ffffff' : primaryColor }}>{certName}</div>
                  {(issuer || date) && (
                    <div className="text-[11px] opacity-85" style={{ color: isDarkSidebar ? 'rgba(255,255,255,0.85)' : (mutedColor || textColor) }}>
                      {issuer}{issuer && date ? ' • ' : ''}{date}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`grid ${isNarrowSideColumn ? 'grid-cols-1 gap-1.5' : 'grid-cols-2 gap-1.5'}`} style={{ fontSize: `${baseFontSize}px` }}>
            {certifications.map((cert, idx) => {
              const certName = typeof cert === 'string' ? cert : (cert.name || cert.title);
              const issuer = typeof cert === 'object' ? cert.issuer : null;
              const date = typeof cert === 'object' ? (cert.date || cert.issueDate) : null;

              if (isNarrowSideColumn) {
                return (
                  <div key={idx} className="leading-snug">
                    <div className="font-semibold" style={{ color: isDarkSidebar ? '#ffffff' : primaryColor }}>• {certName}</div>
                    {(issuer || date) && (
                      <div className="text-[11px] opacity-80 pl-2.5" style={{ color: isDarkSidebar ? 'rgba(255,255,255,0.85)' : mutedColor }}>
                        {issuer}{issuer && date ? ' • ' : ''}{date}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={idx} className="flex items-baseline justify-between gap-1">
                  <div className="min-w-0">
                    <span className="font-semibold" style={{ color: primaryColor }}>• {certName}</span>
                    {issuer && <span className="text-xs opacity-75 ml-1">({issuer})</span>}
                  </div>
                  {date && <span className="text-xs font-medium opacity-75 shrink-0" style={{ color: accentColor }}>{date}</span>}
                </div>
              );
            })}
          </div>
        )}
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
    if (!isVisible('awards') || !mergedAchievements || mergedAchievements.length === 0) return null;

    if (isProJacksonCenter) {
      return (
        <section className="mb-3">
          <SectionHeading title="Key Achievements" icon={Star} />
          <div className="grid grid-cols-3 gap-3" style={{ fontSize: `${(baseFontSize * 0.94).toFixed(1)}px`, color: textColor }}>
            {mergedAchievements.map((award, idx) => (
              <div key={idx} className="leading-snug">
                <div className="font-bold mb-0.5" style={{ color: primaryColor }}>{award.title || award.name}</div>
                {(award.description || award.issuer) && (
                  <div className="text-[11px] opacity-85">{award.description || award.issuer}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (isProTemplate) {
      return (
        <section className="mb-3">
          <SectionHeading title="Key Achievements" icon={Star} />
          <div className="space-y-2" style={{ fontSize: `${(baseFontSize * 0.95).toFixed(1)}px`, color: textColor }}>
            {mergedAchievements.map((award, idx) => (
              <div
                key={idx}
                className={`leading-snug ${isProHarperBanner ? 'pb-1.5 border-b border-dashed last:border-b-0' : ''}`}
                style={{ borderColor: borderColor || '#cbd5e1' }}
              >
                <div className="flex items-start gap-1.5">
                  {(isProPaulNavy || isProHarperBanner) && (
                    <Star className="w-3 h-3 mt-0.5 shrink-0" style={{ color: isDarkSidebar ? '#ffffff' : primaryColor }} aria-hidden="true" />
                  )}
                  {isProJoannaMint && <span className="font-bold mr-0.5" style={{ color: primaryColor }}>•</span>}
                  <div className="min-w-0">
                    <div className="font-bold" style={{ color: isDarkSidebar ? '#ffffff' : primaryColor }}>
                      {award.title || award.name}
                    </div>
                    {(award.description || award.issuer) && (
                      <div className="text-[11px] opacity-85 mt-0.5" style={{ color: isDarkSidebar ? 'rgba(255,255,255,0.85)' : textColor }}>
                        {award.description || award.issuer}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    return (
      <section className="mb-3">
        <SectionHeading title="Honors & Awards" icon={Star} />
        <div className="space-y-1.5" style={{ fontSize: `${baseFontSize}px`, color: textColor }}>
          {mergedAchievements.map((award, idx) => (
            <div key={idx} className="leading-snug">
              <div className="flex justify-between items-baseline gap-1">
                <div>
                  <span className="font-semibold" style={{ color: isDarkSidebar ? '#ffffff' : primaryColor }}>• {award.title || award.name}</span>
                  {award.issuer && <span className="text-xs opacity-75 ml-1">— {award.issuer}</span>}
                </div>
                {award.date && <span className="text-xs opacity-75 shrink-0">{award.date}</span>}
              </div>
              {award.description && (
                <div className="text-[11px] opacity-85 pl-2.5 mt-0.5" style={{ color: isDarkSidebar ? 'rgba(255,255,255,0.85)' : mutedColor }}>
                  {award.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderLanguages = () => {
    if (!isVisible('languages') || !languages || languages.length === 0) return null;

    const getProficiencyDots = (levelStr = '') => {
      const l = String(levelStr).toLowerCase();
      if (l.includes('native') || l.includes('bilingual') || l.includes('fluent') || l.includes('c2')) return 5;
      if (l.includes('proficient') || l.includes('advanced') || l.includes('c1')) return 4;
      if (l.includes('intermediate') || l.includes('working') || l.includes('b2')) return 3;
      if (l.includes('basic') || l.includes('elementary') || l.includes('a')) return 2;
      return 4;
    };

    if (isProPaulNavy || isProBradSplit || isProHarperBanner) {
      return (
        <section className="mb-3">
          <SectionHeading title="Languages" icon={LangIcon} />
          <div className="space-y-1.5" style={{ fontSize: `${baseFontSize}px`, color: isDarkSidebar ? '#ffffff' : textColor }}>
            {languages.map((lang, idx) => {
              const name = typeof lang === 'string' ? lang : (lang.language || lang.name || '');
              const level = typeof lang === 'object' ? lang.proficiency : null;
              const filled = getProficiencyDots(level);
              return (
                <div key={idx} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold leading-tight">{name}</div>
                    {level && <div className="text-[10.5px] opacity-80">{level}</div>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <span
                        key={dot}
                        className={isProHarperBanner ? 'w-2.5 h-2.5 rounded-full' : isProBradSplit ? 'w-1.5 h-3.5 rounded-sm' : 'w-2 h-2.5 rounded-sm'}
                        style={{
                          backgroundColor: dot <= filled
                            ? (isDarkSidebar ? (accentColor === '#27272a' ? '#ffffff' : accentColor) : primaryColor)
                            : (isDarkSidebar ? 'rgba(255,255,255,0.25)' : '#e2e8f0'),
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    return (
      <section className="mb-3">
        <SectionHeading title="Languages" icon={LangIcon} />
        <div className="flex flex-wrap gap-3" style={{ fontSize: `${baseFontSize}px`, color: textColor }}>
          {languages.map((lang, idx) => {
            const name = typeof lang === 'string' ? lang : (lang.language || lang.name || '');
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
    // 1. Single Column Layout (Clean ATS Standard + Classic Centered Jackson)
    if (activeLayout === 'single-column' || activeLayout === 'header-card') {
      const singleOrder = isProJacksonCenter
        ? ['summary', 'awards', 'experience', 'projects', 'skills', 'education', 'certifications', 'publications', 'languages']
        : sectionOrder;
      return (
        <div className="space-y-1">
          {singleOrder.map(secKey => {
            const renderer = sectionMap[secKey];
            return renderer ? <React.Fragment key={secKey}>{renderer()}</React.Fragment> : null;
          })}
          {renderCustomSections()}
        </div>
      );
    }

    // 2. Two Column / Sidebar Layout
    const isSidebarLeft = activeLayout === 'sidebar-left';
    const mainSections = isProPaulNavy
      ? ['summary', 'experience', 'projects', 'skills']
      : isProJoannaMint
        ? ['summary', 'experience', 'projects', 'education']
        : ['summary', 'experience', 'projects'];
    const sideSections = isProPaulNavy
      ? ['awards', 'languages', 'education', 'certifications', 'publications']
      : isProJoannaMint
        ? ['skills', 'awards', 'certifications', 'languages', 'publications']
        : (isProBradSplit || isProHarperBanner)
          ? ['awards', 'skills', 'education', 'certifications', 'languages', 'publications']
          : ['skills', 'education', 'certifications', 'publications', 'awards', 'languages'];

    // Check if there is actual content in the sidebar for this page
    const hasSideItems = isProJoannaMint || isProPaulNavy || sideSections.some(secKey => {
      if (secKey === 'skills') return skills && skills.length > 0 && isVisible('skills');
      if (secKey === 'education') return education && education.length > 0 && isVisible('education');
      if (secKey === 'certifications') return certifications && certifications.length > 0 && isVisible('certifications');
      if (secKey === 'publications') return publications && publications.length > 0 && isVisible('publications');
      if (secKey === 'awards') return mergedAchievements && mergedAchievements.length > 0 && isVisible('awards');
      if (secKey === 'languages') return languages && languages.length > 0 && isVisible('languages');
      return false;
    });

    if (!hasSideItems) {
      // If no sidebar items exist on this page, let main content occupy the full width seamlessly!
      return (
        <div className="w-full space-y-1" style={isProHarperBanner ? { padding: '8mm 14mm 12mm 14mm' } : undefined}>
          {sectionOrder.map(secKey => {
            const renderer = sectionMap[secKey];
            return renderer ? <React.Fragment key={secKey}>{renderer()}</React.Fragment> : null;
          })}
          {renderCustomSections()}
        </div>
      );
    }

    const activeMainOrder = isProPaulNavy
      ? mainSections
      : isProJoannaMint
        ? mainSections
        : sectionOrder.filter(k => mainSections.includes(k));

    const activeSideOrder = isProPaulNavy || isProJoannaMint || isProBradSplit || isProHarperBanner
      ? sideSections
      : sectionOrder.filter(k => sideSections.includes(k));

    const mainContent = (
      <div
        className="flex-1 space-y-1 min-w-0"
        style={isProPaulNavy ? { padding: '12mm 8mm 12mm 14mm' } : undefined}
      >
        {(isProPaulNavy || isProJoannaMint) && renderProMainHeader()}
        {activeMainOrder.map(secKey => {
          const renderer = sectionMap[secKey];
          return renderer ? <React.Fragment key={secKey}>{renderer()}</React.Fragment> : null;
        })}
        {renderCustomSections()}
      </div>
    );

    const isSidebar = isSidebarLayout;
    const isTimelineTwoCol = visualArchetype === 'two-col-timeline';
    const sideWidthClass = isProJoannaMint ? 'w-[32%]' : (isProBradSplit || isProHarperBanner) ? 'w-[39%]' : isProPaulNavy ? 'w-[35%]' : 'w-[34%]';
    const sideBg = isDarkSidebar
      ? primaryColor
      : isProJoannaMint
        ? 'transparent'
        : isSidebar
          ? `${primaryColor}10`
          : 'transparent';

    const sideContent = (
      <div
        className={`${sideWidthClass} shrink-0 space-y-1 ${isDarkSidebar ? 'resume-dark-sidebar' : ''}`}
        style={{
          backgroundColor: sideBg,
          color: isDarkSidebar ? '#ffffff' : textColor,
          borderRadius: (isSidebar && !isProPaulNavy && !isProJoannaMint) ? '10px' : '0',
          padding: isProPaulNavy
            ? '12mm 10mm'
            : isProJoannaMint
              ? '0 8px 0 0'
              : (isProBradSplit || isProHarperBanner)
                ? '0'
                : isSidebar
                  ? '14px'
                  : (isSidebarLeft ? '0 14px 0 0' : '0 0 0 14px'),
          minHeight: isProPaulNavy ? '297mm' : undefined,
          borderLeft: (!isSidebar && !isSidebarLeft && !isProBradSplit && !isProHarperBanner) ? `${isTimelineTwoCol ? '2px' : '1px'} solid ${isTimelineTwoCol ? primaryColor : borderColor}` : 'none',
          borderRight: (!isSidebar && isSidebarLeft && !isProJoannaMint) ? `${isTimelineTwoCol ? '2px' : '1px'} solid ${isTimelineTwoCol ? primaryColor : borderColor}` : 'none',
        }}
      >
        {/* Paul Cross circular photo at top of dark right sidebar */}
        {isProPaulNavy && !isContinuation && effectivePageNumber === 1 && personalInfo.photo && (
          <div className="flex justify-center mb-4">
            <img
              src={personalInfo.photo}
              alt={personalInfo.fullName || 'Candidate Photo'}
              className="w-24 h-24 rounded-full object-cover border-2 border-white/25 shadow-sm"
            />
          </div>
        )}

        {/* Joanna Nelson organic mint photo + Contacts block at top of left sidebar */}
        {isProJoannaMint && !isContinuation && effectivePageNumber === 1 && (
          <>
            {personalInfo.photo && (
              <div className="flex justify-center mb-4">
                <div
                  className="p-2"
                  style={{
                    backgroundColor: `${accentColor}66`,
                    borderRadius: '46% 54% 42% 58% / 52% 44% 56% 48%',
                  }}
                >
                  <img
                    src={personalInfo.photo}
                    alt={personalInfo.fullName || 'Candidate Photo'}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>
              </div>
            )}
            <section className="mb-3">
              <SectionHeading title="Contacts" icon={Mail} />
              <div className="space-y-1.5 text-[11px]" style={{ color: textColor }}>
                {personalInfo.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 shrink-0" style={{ color: primaryColor }} />
                    <span className="truncate">{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 shrink-0" style={{ color: primaryColor }} />
                    <span className="break-all">{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-center gap-1.5">
                    <Linkedin className="w-3 h-3 shrink-0" style={{ color: primaryColor }} />
                    <span className="truncate">{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/i, 'linkedin.com/in/')}</span>
                  </div>
                )}
                {personalInfo.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 shrink-0" style={{ color: primaryColor }} />
                    <span>{personalInfo.location}</span>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {activeSideOrder.map(secKey => {
          const renderer = sectionMap[secKey];
          return renderer ? <React.Fragment key={secKey}>{renderer()}</React.Fragment> : null;
        })}
      </div>
    );

    return (
      <div
        className={`flex flex-row ${isProPaulNavy ? 'gap-0 items-stretch' : (isProBradSplit || isProHarperBanner || isProJoannaMint) ? 'gap-6 items-start' : 'gap-4 items-start'} w-full`}
        style={isProHarperBanner ? { padding: '8mm 14mm 12mm 14mm' } : undefined}
      >
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
      className="resume-dynamic-canvas font-normal w-full break-words"
      style={{
        fontFamily,
        lineHeight,
        color: textColor,
        backgroundColor: bgColor,
        padding: 0,
        boxSizing: 'border-box',
        minHeight: '100%',
        overflowWrap: 'break-word',
        wordBreak: 'normal',
      }}
    >
      <HeaderComponent />
      {renderLayoutContent()}
    </div>
  );
}
