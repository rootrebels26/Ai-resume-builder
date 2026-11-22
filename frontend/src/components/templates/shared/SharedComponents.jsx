import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, ExternalLink } from 'lucide-react';

export function ContactList({ personalInfo = {}, className = "", iconClass = "w-3.5 h-3.5 text-slate-500", showIcons = true, separator = "•" }) {
  const { email, phone, location, website, linkedin, github, portfolio } = personalInfo;

  const items = [
    phone && { icon: Phone, text: phone, href: `tel:${phone}` },
    email && { icon: Mail, text: email, href: `mailto:${email}` },
    location && { icon: MapPin, text: location },
    website && { icon: Globe, text: website.replace(/^https?:\/\//, ''), href: website },
    linkedin && { icon: Linkedin, text: 'LinkedIn', href: linkedin },
    github && { icon: Github, text: 'GitHub', href: github },
    portfolio && { icon: ExternalLink, text: 'Portfolio', href: portfolio },
  ].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 ${className}`}>
      {items.map((item, idx) => {
        const Icon = item.icon;
        const content = (
          <span className="inline-flex items-center gap-1">
            {showIcons && Icon && <Icon className={iconClass} />}
            <span>{item.text}</span>
          </span>
        );

        return (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-slate-300 select-none">{separator}</span>}
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="hover:underline hover:text-slate-900 transition-colors"
              >
                {content}
              </a>
            ) : (
              content
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function SectionHeading({ title, variant = "underline", color = "#0284c7", className = "" }) {
  if (!title) return null;

  if (variant === "bar") {
    return (
      <div className={`flex items-center gap-2 mb-2 pb-1 border-b border-slate-200 ${className}`}>
        <span className="w-1.5 h-4 rounded-full" style={{ backgroundColor: color }}></span>
        <h2 className="text-sm font-bold tracking-wider uppercase text-slate-900">{title}</h2>
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <div className={`mb-2.5 ${className}`}>
        <span
          className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded text-white"
          style={{ backgroundColor: color }}
        >
          {title}
        </span>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={`mb-1.5 pt-1 border-t border-slate-200 ${className}`}>
        <h2 className="text-xs font-bold tracking-widest uppercase text-slate-700">{title}</h2>
      </div>
    );
  }

  if (variant === "serif") {
    return (
      <div className={`mb-2 pb-1 border-b-2 ${className}`} style={{ borderColor: color }}>
        <h2 className="font-serif text-sm font-bold tracking-wide uppercase text-slate-900">{title}</h2>
      </div>
    );
  }

  // Default: underline with custom accent color
  return (
    <div className={`mb-2 pb-1 border-b ${className}`} style={{ borderColor: color }}>
      <h2
        className="text-xs font-bold tracking-wider uppercase"
        style={{ color: color }}
      >
        {title}
      </h2>
    </div>
  );
}

export function ExperienceSection({ items = [], bulletStyle = "disc", accentColor }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((exp, idx) => (
        <div key={exp.id || idx} className="break-inside-avoid">
          <div className="flex justify-between items-baseline flex-wrap gap-1">
            <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">
              {exp.position} <span className="font-normal text-slate-600">— {exp.company}</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {exp.startDate} – {exp.current ? "Present" : exp.endDate || "Present"}
              {exp.location ? ` | ${exp.location}` : ""}
            </span>
          </div>

          {exp.responsibilities && exp.responsibilities.length > 0 && (
            <ul className={`mt-1.5 space-y-1 text-xs text-slate-700 list-${bulletStyle} list-inside`}>
              {exp.responsibilities.map((resp, rIdx) => (
                <li key={rIdx} className="leading-relaxed">
                  <span className="-ml-1">{resp}</span>
                </li>
              ))}
            </ul>
          )}

          {exp.achievements && exp.achievements.length > 0 && (
            <div className="mt-1 pl-2 text-xs italic text-slate-600 border-l-2 border-slate-200">
              {exp.achievements.join(' • ')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function EducationSection({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2">
      {items.map((edu, idx) => (
        <div key={edu.id || idx} className="flex justify-between items-baseline flex-wrap gap-1 break-inside-avoid">
          <div>
            <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">
              {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
            </h3>
            <p className="text-xs text-slate-600">{edu.institution}</p>
            {edu.description && <p className="text-xs text-slate-500 mt-0.5">{edu.description}</p>}
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <div>{edu.startDate ? `${edu.startDate} – ${edu.endDate}` : edu.endDate}</div>
            {edu.cgpa && <div className="font-medium text-slate-700">GPA: {edu.cgpa}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProjectsSection({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {items.map((proj, idx) => (
        <div key={proj.id || idx} className="break-inside-avoid">
          <div className="flex justify-between items-baseline flex-wrap gap-1">
            <h3 className="font-semibold text-slate-900 text-xs">
              {proj.name}
              {proj.liveUrl && (
                <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="ml-1.5 text-blue-600 hover:underline font-normal text-[11px]">
                  [Demo]
                </a>
              )}
              {proj.githubUrl && (
                <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="ml-1 text-slate-500 hover:underline font-normal text-[11px]">
                  [GitHub]
                </a>
              )}
            </h3>
            {proj.startDate && (
              <span className="text-xs text-slate-500 font-mono">
                {proj.startDate} – {proj.endDate || "Present"}
              </span>
            )}
          </div>

          {proj.description && (
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{proj.description}</p>
          )}

          {proj.technologies && proj.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {proj.technologies.map((tech, tIdx) => (
                <span key={tIdx} className="px-1.5 py-0.2 text-[10px] bg-slate-100 text-slate-700 rounded font-mono">
                  {tech}
                </span>
              ))}
            </div>
          )}

          {proj.highlights && proj.highlights.length > 0 && (
            <ul className="mt-1 list-disc list-inside text-xs text-slate-600">
              {proj.highlights.map((h, hIdx) => (
                <li key={hIdx}>{h}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export function SkillsSection({ categories = [], pillVariant = false, accentColor = "#0284c7" }) {
  if (!categories || categories.length === 0) return null;

  if (pillVariant) {
    return (
      <div className="space-y-1.5">
        {categories.map((cat, idx) => (
          <div key={idx} className="text-xs">
            <span className="font-semibold text-slate-800 mr-2">{cat.category}:</span>
            <div className="inline-flex flex-wrap gap-1 mt-0.5">
              {cat.items.map((item, iIdx) => (
                <span
                  key={iIdx}
                  className="px-2 py-0.5 text-[11px] font-medium rounded bg-slate-100 text-slate-800 border border-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1 text-xs">
      {categories.map((cat, idx) => (
        <div key={idx} className="leading-relaxed">
          <span className="font-semibold text-slate-800">{cat.category}: </span>
          <span className="text-slate-700">{cat.items.join(', ')}</span>
        </div>
      ))}
    </div>
  );
}
