import React from 'react';
import { User, Mail, Phone, MapPin, Globe, Linkedin, Github, Award, CheckCircle2, Star, Sparkles, TrendingUp, Cpu, Database, BarChart3, Briefcase } from 'lucide-react';

/**
 * TemplateDraftPaper
 * Renders an authentic, realistic miniature resume document sheet for each template card.
 * Reflects genuine layout differences (ATS single-column, Modern two-column with sidebar,
 * Minimalist Swiss asymmetric, Developer monospace tags, Data Analyst metrics callouts,
 * AI/ML model architecture tags, Executive double-bordered corporate, etc.)
 */
export function TemplateDraftPaper({ template }) {
  const { id, category, accentColor = "#1e293b", name } = template;

  // 1. ATS CATEGORY — Single column, clean horizontal rules, high parsing hierarchy
  if (category === 'ats') {
    const isAcademic = id === 'ats-04' || id === 'ats-09';
    const isBordered = id === 'ats-02' || id === 'ats-07';

    return (
      <div className={`w-full h-full bg-white text-slate-800 p-3 sm:p-3.5 flex flex-col justify-between text-[7.5px] leading-tight select-none font-sans overflow-hidden ${
        isBordered ? 'border border-slate-300' : ''
      }`}>
        {/* Header */}
        <div className={`space-y-0.5 pb-1 border-b ${isAcademic ? 'text-center' : 'text-left'}`} style={{ borderColor: accentColor }}>
          <div className="font-extrabold text-[10px] tracking-wide text-slate-900 uppercase">
            Alex Rivera
          </div>
          <div className="text-[7px] font-semibold text-slate-600">
            Senior Full Stack & Cloud Systems Engineer
          </div>
          <div className="text-[6px] text-slate-500 flex items-center justify-between flex-wrap gap-x-1 pt-0.5">
            <span>alex.rivera@dev</span>
            <span>+1 (555) 234-5678</span>
            <span>San Francisco, CA</span>
            <span>linkedin.com/in/alex</span>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-0.5 pt-1">
          <div className="text-[6.5px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
            Professional Summary
          </div>
          <p className="text-[6px] text-slate-600 line-clamp-2 leading-snug">
            Results-driven engineer with 6+ years building distributed cloud platforms. Reduced system latency by 35% and scaled services to 250k+ daily users.
          </p>
        </div>

        {/* Experience */}
        <div className="space-y-1 pt-0.5">
          <div className="text-[6.5px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
            Work Experience
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between font-bold text-[6.5px] text-slate-900">
              <span>Apex Cloud Solutions — Lead Engineer</span>
              <span className="text-slate-500 font-normal">2021 – Present</span>
            </div>
            <div className="text-[5.5px] text-slate-600 space-y-0.5 pl-1.5 border-l" style={{ borderColor: accentColor }}>
              <div>• Architected multi-tenant telemetry platform serving 250k+ daily users.</div>
              <div>• Refactored REST microservices to GraphQL, reducing p95 latency by 35%.</div>
            </div>
          </div>
        </div>

        {/* Education & Skills */}
        <div className="grid grid-cols-2 gap-2 pt-0.5 border-t border-slate-100">
          <div>
            <div className="text-[6.5px] font-bold uppercase text-slate-900">Education</div>
            <div className="text-[5.5px] text-slate-700 font-semibold">UC Berkeley — B.S. CS</div>
            <div className="text-[5px] text-slate-500">GPA: 3.85 / 4.0 • Honors</div>
          </div>
          <div>
            <div className="text-[6.5px] font-bold uppercase text-slate-900">Key Skills</div>
            <div className="text-[5px] text-slate-600 flex flex-wrap gap-0.5">
              <span className="bg-slate-100 px-1 py-0.2 rounded text-[5px]">React</span>
              <span className="bg-slate-100 px-1 py-0.2 rounded text-[5px]">Node.js</span>
              <span className="bg-slate-100 px-1 py-0.2 rounded text-[5px]">AWS</span>
              <span className="bg-slate-100 px-1 py-0.2 rounded text-[5px]">Postgres</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. MODERN PROFESSIONAL CATEGORY — Split two-column with accent sidebar
  if (category === 'modern') {
    return (
      <div className="w-full h-full bg-white flex text-[7px] leading-tight select-none font-sans overflow-hidden">
        {/* Left Accent Sidebar */}
        <div className="w-[34%] p-2 text-white flex flex-col justify-between shrink-0" style={{ backgroundColor: accentColor }}>
          <div className="space-y-2">
            {/* Avatar circle */}
            <div className="w-7 h-7 mx-auto rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold text-[8px] tracking-wider text-white">
              AR
            </div>

            {/* Contact */}
            <div className="space-y-1 text-[5.5px] text-white/90">
              <div className="font-bold text-[6px] uppercase tracking-wider text-white/70 border-b border-white/20 pb-0.5">Contact</div>
              <div className="truncate">alex.rivera@dev</div>
              <div>+1 555-234-5678</div>
              <div>San Francisco, CA</div>
            </div>

            {/* Skills Bars */}
            <div className="space-y-1 text-[5.5px]">
              <div className="font-bold text-[6px] uppercase tracking-wider text-white/70 border-b border-white/20 pb-0.5">Skills</div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[5px]"><span>React / TS</span><span>95%</span></div>
                <div className="w-full h-0.5 bg-white/30 rounded"><div className="w-[95%] h-full bg-white rounded" /></div>
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[5px]"><span>Node / Python</span><span>90%</span></div>
                <div className="w-full h-0.5 bg-white/30 rounded"><div className="w-[90%] h-full bg-white rounded" /></div>
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[5px]"><span>Cloud & DevOps</span><span>85%</span></div>
                <div className="w-full h-0.5 bg-white/30 rounded"><div className="w-[85%] h-full bg-white rounded" /></div>
              </div>
            </div>
          </div>

          {/* Education in sidebar */}
          <div className="text-[5px] text-white/80 border-t border-white/20 pt-1">
            <div className="font-bold text-white text-[5.5px]">UC Berkeley</div>
            <div>B.S. Computer Science</div>
          </div>
        </div>

        {/* Right Main Column */}
        <div className="w-[66%] p-2.5 flex flex-col justify-between bg-white text-slate-800">
          <div>
            <div className="font-extrabold text-[10px] text-slate-900 tracking-tight">Alex Rivera</div>
            <div className="text-[6.5px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
              Senior Full Stack Engineer
            </div>
            <p className="text-[5.5px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              Specialized in scaling enterprise cloud architectures and modern React user interfaces with zero-downtime deployments.
            </p>
          </div>

          {/* Experience Timeline */}
          <div className="space-y-1.5 my-1">
            <div className="text-[6.5px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-0.5">
              Experience
            </div>
            <div className="relative pl-2 border-l-2" style={{ borderColor: accentColor }}>
              <div className="font-bold text-[6px] text-slate-900">Apex Cloud — Lead Engineer</div>
              <div className="text-[5px] text-slate-400">2021 – Present • San Francisco</div>
              <div className="text-[5.5px] text-slate-600 mt-0.5 line-clamp-2">
                • Scaled microservices to 250k daily active users.<br/>
                • Improved p95 query latency by 35% with Redis.
              </div>
            </div>
            <div className="relative pl-2 border-l-2 border-slate-200">
              <div className="font-bold text-[6px] text-slate-900">NovaTech — Software Engineer</div>
              <div className="text-[5px] text-slate-400">2018 – 2021</div>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-slate-50 p-1.5 rounded border border-slate-100 flex items-center justify-between text-[5.5px]">
            <span className="font-semibold text-slate-700">Engineering Impact:</span>
            <span className="font-bold text-emerald-600">+40% System Throughput</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. MINIMALIST CATEGORY — Swiss typography, generous whitespace, razor-thin lines
  if (category === 'minimalist') {
    return (
      <div className="w-full h-full bg-white text-slate-900 p-3.5 flex flex-col justify-between text-[7px] leading-tight select-none font-serif overflow-hidden">
        <div>
          <div className="text-center pb-2 border-b border-slate-200">
            <div className="font-light text-[12px] tracking-widest uppercase text-slate-900 font-sans">
              Alex Rivera
            </div>
            <div className="text-[6px] tracking-widest uppercase text-slate-500 mt-0.5 font-sans">
              Senior Software Architect
            </div>
            <div className="text-[5px] text-slate-400 tracking-wider mt-1 font-sans">
              SAN FRANCISCO • ALEX.RIVERA@DEV • +1 555-234-5678
            </div>
          </div>

          {/* Asymmetric Swiss Layout */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            <div className="col-span-1 text-[5.5px] text-slate-400 font-sans uppercase tracking-wider space-y-3">
              <div>Profile</div>
              <div>Experience</div>
              <div className="pt-2">Education</div>
            </div>

            <div className="col-span-3 space-y-2 text-[6px] text-slate-700">
              <p className="line-clamp-2 text-slate-600 font-sans">
                Focused on architectural simplicity, distributed resilience, and human-centric software design.
              </p>
              
              <div className="space-y-0.5">
                <div className="flex justify-between font-sans font-bold text-slate-900 text-[6.5px]">
                  <span>Apex Cloud Systems</span>
                  <span className="font-normal text-slate-400">2021 — PRESENT</span>
                </div>
                <div className="text-[5.5px] text-slate-500 italic">Senior Staff Architect</div>
                <p className="text-[5.5px] text-slate-600 line-clamp-2 font-sans">
                  Led core platform re-architecture for 250k+ active tenants. Reduced distributed operational overhead by 40%.
                </p>
              </div>

              <div className="space-y-0.5 pt-1">
                <div className="flex justify-between font-sans font-bold text-slate-900 text-[6.5px]">
                  <span>University of California, Berkeley</span>
                  <span className="font-normal text-slate-400">2014 — 2018</span>
                </div>
                <div className="text-[5.5px] text-slate-500 italic">B.S. Computer Science — Honors</div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Footer Line */}
        <div className="pt-1 border-t border-slate-100 flex justify-between text-[5px] text-slate-400 font-sans">
          <span>PORTFOLIO: alexrivera.dev</span>
          <span>ATS COMPATIBLE: 100%</span>
        </div>
      </div>
    );
  }

  // 4. STUDENT & FRESHER CATEGORY — Education & GPA first, Projects, Extracurriculars
  if (category === 'student') {
    return (
      <div className="w-full h-full bg-white text-slate-800 p-3 flex flex-col justify-between text-[7px] leading-tight select-none font-sans overflow-hidden">
        {/* Header */}
        <div className="text-center pb-1.5 border-b-2" style={{ borderColor: accentColor }}>
          <div className="font-extrabold text-[10px] text-slate-900 tracking-tight">Alex Rivera</div>
          <div className="text-[6.5px] font-semibold text-slate-600">Computer Science Graduate • Software Developer</div>
          <div className="text-[5.5px] text-slate-400 mt-0.5">alex.rivera@edu • San Francisco, CA • github.com/alexrivera</div>
        </div>

        {/* Education Highlight First */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded p-1.5 space-y-0.5">
          <div className="flex justify-between items-center">
            <span className="font-bold text-[6.5px] text-amber-900 uppercase">Education & Honors</span>
            <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded font-bold text-[5.5px]">GPA 3.85 / 4.0</span>
          </div>
          <div className="font-bold text-[6.5px] text-slate-900">University of California, Berkeley</div>
          <div className="text-[5.5px] text-slate-600">B.S. in Computer Science • Dean's Honors List</div>
          <div className="text-[5px] text-slate-500">Coursework: Distributed Systems, Algorithms, Machine Learning</div>
        </div>

        {/* Projects */}
        <div className="space-y-1">
          <div className="font-bold text-[6.5px] uppercase tracking-wider text-slate-900 flex items-center justify-between">
            <span>Academic & Open Source Projects</span>
            <span className="text-[5px] text-brand-600 font-mono">1.2k Stars</span>
          </div>
          <div className="bg-slate-50 p-1 rounded border border-slate-100 space-y-0.5">
            <div className="font-bold text-[6px] text-slate-800">AI Query Engine (Hackathon 1st Place)</div>
            <div className="text-[5px] text-slate-600 line-clamp-2">
              Engineered real-time vector search in React and Python. Scaled to 10k monthly active student queries.
            </div>
          </div>
        </div>

        {/* Internships & Skills */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          <div>
            <div className="font-bold text-[6px] uppercase text-slate-900">Internship</div>
            <div className="text-[5.5px] font-semibold text-slate-800">Apex Cloud — Intern</div>
            <div className="text-[5px] text-slate-500">Summer 2021</div>
          </div>
          <div>
            <div className="font-bold text-[6px] uppercase text-slate-900">Core Skills</div>
            <div className="text-[5px] text-slate-600 flex flex-wrap gap-0.5">
              <span className="bg-slate-100 px-1 rounded">React</span>
              <span className="bg-slate-100 px-1 rounded">Python</span>
              <span className="bg-slate-100 px-1 rounded">Git</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. SOFTWARE DEVELOPER CATEGORY — Code/Terminal accents, Tech Stack tags, Git metrics
  if (category === 'developer') {
    return (
      <div className="w-full h-full bg-slate-900 text-slate-100 p-3 flex flex-col justify-between text-[7px] leading-tight select-none font-mono overflow-hidden">
        {/* Terminal Header */}
        <div className="space-y-1 pb-1.5 border-b border-slate-800">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[5px] text-slate-500 pl-1 font-sans">alex@archlinux: ~/resume.sh</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="font-bold text-[9.5px] text-white">Alex Rivera</div>
              <div className="text-[6.5px] text-cyan-400 font-sans">Lead Full Stack & Infrastructure Engineer</div>
            </div>
            <div className="text-[5px] text-slate-400 text-right">
              github.com/alexrivera<br/>alex.rivera@dev
            </div>
          </div>
        </div>

        {/* Tech Stack Pills */}
        <div className="space-y-0.5">
          <div className="text-[5.5px] text-slate-400 uppercase tracking-wider font-sans">Core Stack:</div>
          <div className="flex flex-wrap gap-1">
            {['React', 'Node.js', 'FastAPI', 'Docker', 'AWS', 'Kubernetes'].map(tech => (
              <span key={tech} className="px-1 py-0.2 bg-slate-800 text-cyan-300 rounded text-[5px] border border-slate-700">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Production Experience */}
        <div className="space-y-1 font-sans">
          <div className="text-[6.5px] font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-0.5">
            Production Scale
          </div>
          <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/80 space-y-0.5">
            <div className="flex justify-between text-[6px] text-cyan-300 font-mono">
              <span>Apex Cloud [Staff Engineer]</span>
              <span className="text-slate-400">2021 – Present</span>
            </div>
            <div className="text-[5.5px] text-slate-300">
              • Scaled real-time streaming pipeline to 15,000 req/sec.<br/>
              • Reduced cluster AWS compute bill by $140,000 annually.
            </div>
          </div>
        </div>

        {/* Open Source Footer */}
        <div className="flex justify-between items-center text-[5px] text-slate-400 pt-1 border-t border-slate-800">
          <span>OS Contributor: Linux, Vite, FastAPI</span>
          <span className="text-emerald-400">● 100% Tests Passing</span>
        </div>
      </div>
    );
  }

  // 6. DATA ANALYST & DATA SCIENTIST CATEGORY — Metrics callout bar, Data Stack, Analytical models
  if (category === 'data') {
    return (
      <div className="w-full h-full bg-white text-slate-800 p-3 flex flex-col justify-between text-[7px] leading-tight select-none font-sans overflow-hidden">
        {/* Header */}
        <div className="pb-1 border-b" style={{ borderColor: accentColor }}>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-extrabold text-[10px] text-slate-900">Alex Rivera</div>
              <div className="text-[6.5px] font-bold" style={{ color: accentColor }}>
                Senior Data Scientist & Analytics Lead
              </div>
            </div>
            <div className="text-[5px] text-slate-500 text-right">
              alex@data-insights.ai<br/>San Francisco, CA
            </div>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-3 gap-1 my-1">
          <div className="bg-blue-50 border border-blue-200 rounded p-1 text-center">
            <div className="font-extrabold text-[7px] text-blue-700">+42%</div>
            <div className="text-[4.5px] text-blue-900 font-semibold uppercase">Pipeline Speed</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded p-1 text-center">
            <div className="font-extrabold text-[7px] text-emerald-700">10M+</div>
            <div className="text-[4.5px] text-emerald-900 font-semibold uppercase">Daily Rows</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded p-1 text-center">
            <div className="font-extrabold text-[7px] text-indigo-700">$1.4M</div>
            <div className="text-[4.5px] text-indigo-900 font-semibold uppercase">Cost Saved</div>
          </div>
        </div>

        {/* Data Stack */}
        <div className="space-y-0.5">
          <div className="text-[6px] font-bold text-slate-700 uppercase">Data & ML Stack:</div>
          <div className="flex flex-wrap gap-1">
            {['SQL', 'Python', 'Snowflake', 'Tableau', 'dbt', 'Pandas'].map(tool => (
              <span key={tool} className="px-1 py-0.2 bg-slate-100 text-slate-700 rounded text-[5px] border border-slate-200">
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-0.5">
          <div className="text-[6.5px] font-bold uppercase text-slate-900">Analytics Impact</div>
          <div className="text-[5.5px] text-slate-600 line-clamp-2">
            • Built automated churn prediction model with 89% precision across $45M recurring ARR.<br/>
            • Automated executive dashboards consumed weekly by C-suite.
          </div>
        </div>

        {/* Education */}
        <div className="pt-1 border-t border-slate-100 text-[5px] text-slate-500 flex justify-between">
          <span>UC Berkeley — B.S. Data Science & Stats</span>
          <span>Tableau Certified Pro</span>
        </div>
      </div>
    );
  }

  // 7. AI & ML ENGINEER CATEGORY — Architecture tags, arXiv citations, LoRA/RAG metrics
  if (category === 'aiml') {
    return (
      <div className="w-full h-full bg-slate-950 text-slate-100 p-3 flex flex-col justify-between text-[7px] leading-tight select-none font-sans overflow-hidden">
        {/* Header */}
        <div className="pb-1 border-b border-indigo-900/60 flex justify-between items-start">
          <div>
            <div className="font-extrabold text-[10px] text-white flex items-center gap-1">
              Alex Rivera
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            </div>
            <div className="text-[6.5px] font-bold text-indigo-400">
              AI / GenAI & Deep Learning Engineer
            </div>
          </div>
          <div className="text-[5px] text-indigo-300 font-mono text-right">
            huggingface.co/alex<br/>arXiv:2401.xxxxx
          </div>
        </div>

        {/* Model Architecture Badges */}
        <div className="space-y-0.5 my-0.5">
          <div className="text-[5.5px] text-slate-400 uppercase font-mono">Specializations:</div>
          <div className="flex flex-wrap gap-1">
            {['PyTorch', 'LLMs', 'LoRA', 'vLLM', 'CUDA', 'RAG'].map(badge => (
              <span key={badge} className="px-1 py-0.2 bg-indigo-950 text-indigo-300 rounded text-[5px] border border-indigo-800">
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* ML Achievements */}
        <div className="space-y-1 bg-slate-900/90 p-1.5 rounded border border-indigo-950">
          <div className="font-bold text-[6px] text-indigo-300 uppercase font-mono">Deployment Impact</div>
          <div className="text-[5.5px] text-slate-300 space-y-0.5">
            <div>• Fine-tuned 70B parameter open-weights models for sub-100ms reasoning.</div>
            <div>• Engineered RAG vector architecture cutting hallucination by 58%.</div>
          </div>
        </div>

        {/* Research / arXiv */}
        <div className="text-[5px] text-slate-400 font-mono pt-1 border-t border-indigo-950 flex justify-between">
          <span>Paper: "Low-Latency Distributed LLM Inference"</span>
          <span className="text-indigo-400">UC Berkeley CS</span>
        </div>
      </div>
    );
  }

  // 8. EXECUTIVE & LEADERSHIP CATEGORY — Formal double borders, P&L, Board & Competencies Matrix
  if (category === 'executive') {
    return (
      <div className="w-full h-full bg-white text-slate-900 p-3 flex flex-col justify-between text-[7px] leading-tight select-none font-serif overflow-hidden border-2" style={{ borderColor: accentColor }}>
        {/* Header with double rule */}
        <div className="text-center pb-1.5 border-b-2" style={{ borderColor: accentColor }}>
          <div className="font-bold text-[11px] tracking-wider uppercase text-slate-900 font-sans">
            Alex Rivera, MBA
          </div>
          <div className="text-[6.5px] font-bold uppercase tracking-widest text-slate-600 font-sans mt-0.5">
            Vice President of Global Engineering
          </div>
          <div className="text-[5px] text-slate-500 font-sans mt-0.5">
            San Francisco, CA • Executive Office • alex.rivera@enterprise.com
          </div>
        </div>

        {/* Executive Summary */}
        <div className="text-[6px] text-slate-700 italic text-center line-clamp-2 px-2">
          "Strategic technology executive driving global digital transformation, P&L management, and enterprise cloud migrations."
        </div>

        {/* Core Competencies Matrix (3 columns) */}
        <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded border border-slate-200 text-center text-[5px] font-sans">
          <div><strong>$18M Budget P&L</strong><div className="text-slate-500">Resource Control</div></div>
          <div><strong>60+ Headcount</strong><div className="text-slate-500">Global Org Scale</div></div>
          <div><strong>M&A Integration</strong><div className="text-slate-500">Enterprise Due Diligence</div></div>
        </div>

        {/* Leadership History */}
        <div className="space-y-0.5 font-sans">
          <div className="flex justify-between font-bold text-[6px] text-slate-900">
            <span>Apex Enterprise Technologies — VP Engineering</span>
            <span className="text-slate-500">2019 – Present</span>
          </div>
          <div className="text-[5.5px] text-slate-600 line-clamp-2">
            • Steered 4 global engineering hubs delivering $85M ARR product lines with 99.999% SLA.
          </div>
        </div>

        {/* Board & Credentials */}
        <div className="text-[5px] text-slate-500 font-sans pt-1 border-t border-slate-200 flex justify-between">
          <span>MBA, UC Berkeley Haas</span>
          <span>Advisory Board Member</span>
        </div>
      </div>
    );
  }

  // 9. CREATIVE & DESIGNER CATEGORY — Colorful header banner, portfolio showcase
  if (category === 'creative') {
    return (
      <div className="w-full h-full bg-white text-slate-800 flex flex-col justify-between text-[7px] leading-tight select-none font-sans overflow-hidden">
        {/* Bold Colored Top Banner */}
        <div className="p-2.5 text-white flex justify-between items-center" style={{ backgroundColor: accentColor }}>
          <div>
            <div className="font-black text-[11px] tracking-tight">ALEX RIVERA</div>
            <div className="text-[6.5px] font-semibold text-white/90">Lead Product Designer & Creative Director</div>
          </div>
          <div className="text-[5px] text-white/80 text-right">
            dribbble.com/alex<br/>portfolio.design
          </div>
        </div>

        {/* Case Studies / Showcase */}
        <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="text-[6.5px] font-bold uppercase tracking-wider text-slate-900 flex justify-between">
              <span>Featured Design Systems</span>
              <span className="text-[5px] font-bold" style={{ color: accentColor }}>Figma Verified</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded border border-slate-100 space-y-0.5">
              <div className="font-bold text-[6px] text-slate-900">Apex Multi-Brand Design System</div>
              <div className="text-[5.5px] text-slate-600 line-clamp-2">
                Unified 120+ components across Web & Mobile apps, accelerating sprint velocity by 65%.
              </div>
            </div>
          </div>

          {/* Visual Skill Tags */}
          <div className="space-y-0.5">
            <div className="text-[5.5px] font-bold text-slate-400 uppercase">Disciplines:</div>
            <div className="flex flex-wrap gap-1">
              {['Design Systems', 'UX Research', 'Micro-interactions', 'Prototyping'].map(s => (
                <span key={s} className="px-1 py-0.2 rounded text-[5px] text-white" style={{ backgroundColor: accentColor }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-1 border-t border-slate-100 flex justify-between text-[5px] text-slate-400">
            <span>B.S. Interaction Design — Berkeley</span>
            <span>Awwwards Site of the Day</span>
          </div>
        </div>
      </div>
    );
  }

  // 10. BUSINESS PROFESSIONAL CATEGORY — Corporate navy/slate, revenue impact badges
  return (
    <div className="w-full h-full bg-white text-slate-800 p-3 flex flex-col justify-between text-[7px] leading-tight select-none font-sans overflow-hidden">
      {/* Header */}
      <div className="pb-1 border-b-2" style={{ borderColor: accentColor }}>
        <div className="flex justify-between items-end">
          <div>
            <div className="font-extrabold text-[10px] text-slate-900">Alex Rivera</div>
            <div className="text-[6.5px] font-bold text-slate-600">Senior Business Strategy & Operations Manager</div>
          </div>
          <div className="text-[5px] text-slate-500 text-right">
            San Francisco, CA<br/>alex.rivera@biz.com
          </div>
        </div>
      </div>

      {/* Revenue Impact Highlights */}
      <div className="bg-slate-50 p-1.5 rounded border border-slate-200 flex justify-between items-center text-[5.5px]">
        <div>
          <div className="font-bold text-[7px] text-emerald-600">+$3.2M ARR</div>
          <div className="text-[4.5px] text-slate-500 uppercase">Growth Delivered</div>
        </div>
        <div className="border-l pl-2 border-slate-200">
          <div className="font-bold text-[7px] text-slate-900">42 Enterprise</div>
          <div className="text-[4.5px] text-slate-500 uppercase">Accounts Scaled</div>
        </div>
        <div className="border-l pl-2 border-slate-200">
          <div className="font-bold text-[7px] text-indigo-600">35% Margin</div>
          <div className="text-[4.5px] text-slate-500 uppercase">Cost Optimization</div>
        </div>
      </div>

      {/* Experience */}
      <div className="space-y-0.5">
        <div className="text-[6.5px] font-bold uppercase text-slate-900">Corporate Strategy History</div>
        <div className="text-[5.5px] text-slate-600 line-clamp-2">
          • Directed go-to-market operational roadmaps expanding regional market share by 28%.<br/>
          • Partnered with C-suite stakeholders to execute cross-functional organizational pivots.
        </div>
      </div>

      {/* Education */}
      <div className="pt-1 border-t border-slate-100 flex justify-between text-[5px] text-slate-500">
        <span>UC Berkeley — B.S. Business Administration</span>
        <span>PMP & Six Sigma Certified</span>
      </div>
    </div>
  );
}
