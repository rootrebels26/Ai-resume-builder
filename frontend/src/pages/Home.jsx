import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { useAuth } from '../context/AuthContext';
import { TEMPLATES } from '../constants/templatesList';
import { TemplateDraftPaper } from '../components/templates/TemplateDraftPaper';

function Icon({ name, size = 20 }) {
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
    spark: <><path d="m12 3 1.3 4.1L17 9l-3.7 1.9L12 15l-1.3-4.1L7 9l3.7-1.9L12 3Z" /><path d="m5 15 .7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7L5 15Z" /></>,
    file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h4M9 13h6M9 17h5" /></>,
    wand: <><path d="m4 20 10.5-10.5M12 6l6 6M18 2v3M22 6h-3M20.5 3.5l-2 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    menu: <><path d="M4 8h16M4 16h16" /></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const roles = ['Product designer', 'Marketing lead', 'Software engineer'];

// 6 Featured Real Layouts matching Templates folder
const actualTemplates = [
  TEMPLATES.find(t => t.id === 'modern-01') || TEMPLATES[10], // Apex Modern Blue
  TEMPLATES.find(t => t.id === 'ats-01') || TEMPLATES[0],     // Classic ATS Standard
  TEMPLATES.find(t => t.id === 'modern-08') || TEMPLATES[17], // Cobalt Impact
  TEMPLATES.find(t => t.id === 'modern-07') || TEMPLATES[16], // Charcoal Horizon
  TEMPLATES.find(t => t.id === 'modern-02') || TEMPLATES[11], // Emerald Horizon
  TEMPLATES.find(t => t.id === 'developer-01') || TEMPLATES[25], // Dev Terminal Monospace
];

export function Home() {
  const navigate = useNavigate();
  const { createNewResume } = useResume();
  const { requireAuth } = useAuth();
  const [activeRole, setActiveRole] = useState(0);
  const [activeTemplate, setActiveTemplate] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveTemplate(current => (current + 1) % actualTemplates.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, []);

  const handleCreateResume = async (templateId = 'ats-01') => {
    requireAuth(async () => {
      try {
        navigate('/onboarding#1');
      } catch (e) {
        navigate('/onboarding#1');
      }
    }, 'Enter your unique company access code to build and customize your resume.');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f4f0e8] text-[#171713] overflow-x-hidden w-full max-w-full">
      {/* ======================================================== */}
      {/* 1. HERO SECTION                                         */}
      {/* ======================================================== */}
      <section id="editor" className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-5 pb-20 pt-10 md:px-10 lg:min-h-[750px] lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:px-14 lg:pb-24 lg:pt-14 overflow-hidden lg:overflow-visible">
        <div className="relative z-10 max-w-[650px]">
          {/* Figma Display Headline */}
          <h1 className="font-display mt-7 text-[clamp(3.7rem,7.2vw,7.4rem)] font-bold leading-[0.87] tracking-[-0.075em]">
            Only 2% of
            <span className="relative block w-fit">
              résumés win.
              <svg className="absolute -bottom-3 left-1 w-[96%]" viewBox="0 0 370 20" fill="none" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 15C90 4 251 4 367 10" stroke="#ef5b45" strokeWidth="7" strokeLinecap="round" />
              </svg>
            </span>
            <span className="mt-4 block text-[0.5em] font-medium tracking-[-0.055em] text-[#57564e]">Yours belongs in the <em className="font-serif text-[#5e48d7]"> top 2%.</em></span>
          </h1>

          <p className="mt-9 max-w-[500px] text-lg leading-relaxed text-[#5e5c53] md:text-xl">
            Build a job-winning résumé in minutes with recruiter-approved STAR bullets — specific, human, and ready for what’s next.
          </p>

          {/* Interactive Slide-to-Build Drag Button */}
          <div className="mt-9 flex flex-col gap-4 sm:flex-row items-stretch sm:items-center">
            <button
              data-url="/builder"
              aria-label="Slide right to build your résumé"
              className="hero-button group relative h-14 min-w-[270px] touch-none select-none overflow-hidden !p-0"
              style={{ background: 'linear-gradient(90deg, #5e48d7 var(--slide-progress, 0%), #171713 var(--slide-progress, 0%))' }}
              onPointerDown={(event) => {
                const button = event.currentTarget;
                button.setPointerCapture(event.pointerId);
                button.dataset.startX = String(event.clientX);
                button.dataset.dragging = 'true';
                button.style.setProperty('--slide-transition', 'none');
              }}
              onPointerMove={(event) => {
                const button = event.currentTarget;
                if (button.dataset.dragging !== 'true') return;
                const startX = Number(button.dataset.startX);
                const maxTravel = button.clientWidth - 56;
                const distance = Math.max(0, Math.min(event.clientX - startX, maxTravel));
                const progress = (distance / maxTravel) * 100;
                button.style.setProperty('--slide-x', `${distance}px`);
                button.style.setProperty('--slide-progress', `${progress}%`);
              }}
              onPointerUp={(event) => {
                const button = event.currentTarget;
                const distance = Number(button.style.getPropertyValue('--slide-x').replace('px', '')) || 0;
                const maxTravel = button.clientWidth - 56;
                button.dataset.dragging = 'false';
                button.style.setProperty('--slide-transition', 'transform 300ms cubic-bezier(.16, 1, .3, 1)');
                if (distance >= maxTravel * 0.70) {
                  button.style.setProperty('--slide-x', `${maxTravel}px`);
                  button.style.setProperty('--slide-progress', '100%');
                  window.setTimeout(() => {
                    handleCreateResume();
                  }, 180);
                } else {
                  button.style.setProperty('--slide-x', '0px');
                  button.style.setProperty('--slide-progress', '0%');
                }
              }}
              onPointerCancel={(event) => {
                const button = event.currentTarget;
                button.dataset.dragging = 'false';
                button.style.setProperty('--slide-transition', 'transform 300ms cubic-bezier(.16, 1, .3, 1)');
                button.style.setProperty('--slide-x', '0px');
                button.style.setProperty('--slide-progress', '0%');
              }}
              onClick={() => handleCreateResume()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleCreateResume();
                }
              }}
            >
              <span className="pointer-events-none w-full pl-14 pr-5 text-center text-sm font-bold">Slide to build my résumé</span>
              <span
                className="pointer-events-none absolute left-2 grid size-10 place-items-center rounded-full bg-[#cfff58] text-black shadow-sm"
                style={{ transform: 'translateX(var(--slide-x, 0px))', transition: 'var(--slide-transition, transform 300ms cubic-bezier(.16, 1, .3, 1))' }}
              >
                <Icon name="arrow" />
              </span>
            </button>

            <Link
              to="/onboarding#1"
              className="flex items-center justify-center gap-2 rounded-full px-5 py-3 font-bold underline decoration-1 underline-offset-4 transition hover:text-[#5e48d7]"
            >
              Have a resume? Import &amp; Auto-Fill →
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-10 flex items-center gap-4 text-sm text-[#6a675d]">
            <div className="flex -space-x-2">
              {['#ff906d', '#92baff', '#d3f66a'].map((color, i) => (
                <span key={color} className="grid size-9 place-items-center rounded-full border-2 border-[#f4f0e8] text-xs font-black text-black" style={{ backgroundColor: color }}>
                  {['AR', 'MJ', 'SK'][i]}
                </span>
              ))}
            </div>
            <p><strong className="text-[#171713]">1028+ hires.</strong> Recruiter-calibrated designs.</p>
          </div>
        </div>

        {/* Right Column: Figma Interactive Workspace Window */}
        <div className="relative mx-auto w-full max-w-[720px] lg:translate-x-2">
          {/* Tilted Sticker 1: 98% ATS Pass */}
          <div className="absolute -left-2 top-[10%] z-20 rotate-[-8deg] rounded-full border border-black bg-[#cfff58] px-3.5 py-1.5 font-display text-xs sm:text-sm font-bold shadow-[3px_3px_0_#171713] md:-left-6 select-none flex items-center gap-1.5">
            <span>98% ATS pass score</span>
            <span className="text-black">★</span>
          </div>

          {/* Tilted Sticker 2: Coral Sparkle */}
          <div className="absolute -right-2 bottom-[12%] z-20 rotate-[7deg] rounded-xl bg-[#ef5b45] p-2.5 sm:p-3 text-white shadow-[4px_4px_0_#171713] md:-right-3 select-none">
            <Icon name="spark" size={24} />
          </div>

          <div className="workspace">
            {/* Top Chrome */}
            <div className="flex items-center justify-between border-b border-black/15 px-4 py-3 md:px-6">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-[#ef5b45]"></span>
                <span className="size-2.5 rounded-full bg-[#ffc952]"></span>
                <span className="size-2.5 rounded-full bg-[#8fcf72]"></span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#76736a]">
                <span className="size-1.5 rounded-full bg-green-500"></span> Live draft
              </div>
            </div>

            <div className="grid md:grid-cols-[190px_1fr]">
              {/* Left Interactive Role Selectors */}
              <aside className="hidden border-r border-black/15 p-4 md:flex flex-col justify-between bg-[#fffdf8]">
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a877e]">Target role</p>
                  <div className="space-y-2">
                    {roles.map((role, idx) => (
                      <button
                        key={role}
                        onClick={() => setActiveRole(idx)}
                        className={`w-full text-left flex items-center justify-between rounded-full px-3 py-2 text-xs font-bold transition-all ${activeRole === idx
                          ? 'bg-[#cfff58] text-[#171713] border border-black shadow-[2px_2px_0_#171713]'
                          : 'bg-white hover:bg-black/5 text-[#77746b] border border-black/15'
                          }`}
                      >
                        <span className="truncate">{role}</span>
                        {activeRole === idx && <Icon name="check" size={13} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-[#5e48d7] p-3.5 text-white shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Icon name="wand" size={16} />
                    <span>AI Assistant</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-white/90">
                    {activeRole === 0 && 'Rewrote bullets for product impact & design systems.'}
                    {activeRole === 1 && 'Calibrated metrics for CAC, pipeline, and GTM strategy.'}
                    {activeRole === 2 && 'Optimized distributed systems bullets for ATS keywords.'}
                  </p>
                </div>
              </aside>

              {/* Right Realistic A4 Resume Document */}
              <div className="relative bg-[#e6e2d9] p-4 sm:p-6 md:p-8">
                <div className="resume-paper">
                  <div className="flex items-start justify-between border-b-2 border-black pb-4">
                    <div>
                      <h2 className="font-display text-2xl font-bold tracking-[-0.04em] sm:text-3xl text-black">Maya Anderson</h2>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5e48d7]">{roles[activeRole]}</p>
                    </div>
                    <span className="grid size-9 place-items-center rounded-full bg-[#ffd2c9] font-display text-xs font-black border border-black/20 text-[#ef5b45]">
                      98
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-[1fr_2fr] gap-5">
                    <div>
                      <ResumeLabel>Contact</ResumeLabel>
                      <p className="mt-2 text-[7px] leading-[1.7] text-black/60 font-sans">
                        maya@email.com<br />London, UK<br />maya.design
                      </p>
                      <ResumeLabel className="mt-5">Superpowers</ResumeLabel>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(activeRole === 0
                          ? ['Research', 'Strategy', 'Figma', 'Systems']
                          : activeRole === 1
                            ? ['GTM Strategy', 'Analytics', 'Content', 'Growth']
                            : ['React', 'TypeScript', 'Node.js', 'PostgreSQL']
                        ).map(skill => (
                          <span key={skill} className="rounded-sm bg-[#eeece6] px-1.5 py-1 text-[6px] font-bold text-black border border-black/10">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <ResumeLabel>Profile</ResumeLabel>
                      <p className="mt-2 text-[7px] leading-[1.7] text-black/65 font-sans">
                        {activeRole === 0 && 'I turn tangled problems into digital products that feel obvious. Seven years shaping tools people actually enjoy using.'}
                        {activeRole === 1 && 'Data-driven marketing leader with track record scaling revenue 3.2x across early-stage and high-growth B2B SaaS companies.'}
                        {activeRole === 2 && 'Full-stack software architect specializing in scalable microservices, low-latency UI frameworks, and distributed cloud applications.'}
                      </p>
                      <ResumeLabel className="mt-5">Selected work</ResumeLabel>
                      <div className="mt-2 border-l-2 border-[#5e48d7] pl-2.5">
                        <div className="flex justify-between gap-2">
                          <strong className="text-[8px] text-black">
                            {activeRole === 0 ? 'Lead Product Designer' : activeRole === 1 ? 'Head of Growth' : 'Staff Software Engineer'}
                          </strong>
                          <span className="text-[6px] text-black/45 font-mono">2022—NOW</span>
                        </div>
                        <p className="mt-1 text-[7px] leading-[1.55] text-black/60 font-sans">
                          {activeRole === 0 && <>Rebuilt onboarding around real customer needs, lifting activation by <mark>34%</mark>.</>}
                          {activeRole === 1 && <>Engineered multi-channel acquisition funnels, driving <mark>140% YoY ARR</mark> growth.</>}
                          {activeRole === 2 && <>Architected high-throughput message ingestion handling <mark>12M req/day</mark> at p99 &lt;45ms.</>}
                        </p>
                      </div>
                      <div className="mt-3 border-l-2 border-black/15 pl-2.5">
                        <strong className="text-[8px] text-black">
                          {activeRole === 0 ? 'Product Designer · North' : activeRole === 1 ? 'Growth Marketing · Scale' : 'Senior Backend Engineer · Core'}
                        </strong>
                        <p className="mt-1 text-[7px] leading-[1.55] text-black/60 font-sans">
                          Led cross-functional initiatives across three core product squads.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating suggestion pill */}
                <div className="suggestion-pill">
                  <Icon name="spark" size={14} /> Strong impact statement
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Role Switcher Dots below window */}
          <div className="mt-5 flex justify-center gap-2">
            {roles.map((role, i) => (
              <button
                key={role}
                aria-label={`Preview ${role}`}
                onClick={() => setActiveRole(i)}
                className={`h-2 rounded-full transition-all ${activeRole === i ? 'w-8 bg-black' : 'w-2 bg-black/25 hover:bg-black/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. TILTED MARQUEE STRIP (Full Width)                    */}
      {/* ======================================================== */}
      <div className="w-full overflow-hidden max-w-full py-2">
        <section className="marquee-strip" aria-label="Key features">
          <div className="marquee-track">
            {[0, 1, 2, 3].map(copy => (
              <div className="flex shrink-0 items-center gap-8 pr-8" key={copy}>
                {['50+ proven layouts', '27-point ATS audit', 'Private by design', 'Recruiter calibrated'].map(item => (
                  <span className="flex items-center gap-8 font-display text-sm font-black uppercase tracking-[0.12em] text-[#171713]" key={item}>
                    <Icon name="spark" size={18} />
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ======================================================== */}
      {/* 3. SECTION: ONE STORY. SIX GOOD FITS.                    */}
      {/* ======================================================== */}
      <section id="templates" className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 lg:px-14 lg:py-28 overflow-hidden">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Recruiter-approved layouts</p>
            <h2 className="font-display mt-6 text-4xl font-bold tracking-[-0.05em] md:text-6xl text-[#171713]">
              One story. <span className="font-serif font-normal italic text-[#5e48d7]">Six good fits.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[#646158]">
              Calibrated margins, professional typography, and text-layer ATS passes — without looking like everyone else.
            </p>
          </div>
          <Link
            to="/templates"
            className="flex shrink-0 items-center gap-2 font-bold underline decoration-[#ef5b45] decoration-2 underline-offset-4 hover:text-[#5e48d7] transition"
          >
            Explore all 50+ templates <Icon name="arrow" size={17} />
          </Link>
        </div>

        {/* 3D Interactive Template Carousel */}
        <div className="template-carousel" aria-label="Resume template carousel">
          {actualTemplates.map((template, i) => {
            const rawOffset = (i - activeTemplate + actualTemplates.length) % actualTemplates.length;
            const offset = rawOffset > actualTemplates.length / 2 ? rawOffset - actualTemplates.length : rawOffset;
            const distance = Math.abs(offset);
            return (
              <article
                className={`template-card template-slide ${distance === 0 ? 'is-center' : distance === 1 ? 'is-near' : distance === 2 ? 'is-far' : 'is-hidden'
                  } cursor-pointer`}
                style={{ '--slide-offset': `${offset * 108}%` }}
                key={template.id}
                aria-hidden={distance > 2}
                onClick={() => handleCreateResume(template.id)}
              >
                {/* Genuine A4 Document Paper Sheet Preview from Templates Library */}
                <div className="w-full aspect-[210/297] rounded-lg bg-white border border-black/15 overflow-hidden shadow-paper select-none">
                  <TemplateDraftPaper template={template} />
                </div>

                <div className="mt-3.5 flex items-center justify-between gap-2">
                  <h3 className="font-display text-sm font-bold text-black truncate">{template.name}</h3>
                  <span className="shrink-0 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-black/15 bg-[#cfff58] text-[#171713]">
                    {template.badge || 'FEATURED'}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#646158]">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-black/50 truncate max-w-[140px]">
                    {template.layout || template.category}
                  </span>
                  <span className="font-bold text-[#5e48d7] hover:underline flex items-center gap-1 shrink-0">
                    Use template <Icon name="arrow" size={12} />
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="mt-8 flex justify-center gap-2" aria-label="Choose a template">
          {actualTemplates.map((template, i) => (
            <button
              key={template.id}
              onClick={() => setActiveTemplate(i)}
              aria-label={`Show ${template.name}`}
              className={`h-2 rounded-full transition-all duration-300 ${activeTemplate === i ? 'w-8 bg-[#5e48d7]' : 'w-2 bg-black/20 hover:bg-black/40'
                }`}
            />
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. SECTION: FOUR STEPS. NO GUESSWORK.                    */}
      {/* ======================================================== */}
      <section id="how" className="border-y border-black/15 bg-[#ebe7df] px-5 py-24 md:px-10 lg:px-14 lg:py-28 overflow-hidden">
        <div className="mx-auto max-w-[1440px]">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="eyebrow mx-auto">Real results, minimum fuss</p>
            <h2 className="font-display mt-6 text-4xl font-bold tracking-[-0.05em] md:text-6xl text-[#171713]">
              Four steps. <span className="font-serif font-normal italic text-[#5e48d7]">No guesswork.</span>
            </h2>
            <p className="mt-4 text-[#646158]">
              From blank page to interview-ready PDF in 10 minutes, without ever bouncing off ATS.
            </p>
          </div>
          <div className="step-grid">
            {[
              ['01', 'Select a design', 'Choose from 6 ATS-proven presets (50+ coming) calibrated for your career stage.'],
              ['02', 'Target the role', 'Paste the job description. Our AI aligns keywords and competencies.'],
              ['03', 'Add wins with AI', 'Turn rough notes into high-impact STAR achievement bullets.'],
              ['04', 'Audit & download', 'Run a 27-point check for gaps and export a pixel-perfect PDF.'],
            ].map(([number, title, text]) => (
              <article className="step-card" key={number}>
                <span className="step-number">{number}</span>
                <h3 className="font-display mt-10 text-xl font-bold tracking-[-0.03em] text-[#171713]">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-black/55">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SECTION: MADE FOR PEOPLE. BUILT FOR GATES.            */}
      {/* ======================================================== */}
      <section id="ats" className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 lg:px-14 lg:py-32 overflow-hidden">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] items-start">
          <div>
            <p className="eyebrow">Engineered for low anxiety</p>
            <h2 className="font-display mt-6 max-w-md text-5xl font-bold leading-[0.95] tracking-[-0.055em] md:text-6xl text-[#171713]">
              Made for people.<br />
              <span className="font-serif font-normal italic text-[#5e48d7]">Built for gates.</span>
            </h2>
            <p className="mt-6 max-w-sm leading-relaxed text-[#646158]">
              Everything you need to crush high-volume applications without the robotic repetition or data hoarding.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard number="01" title="Contextual AI writing" text="Transforms dry bullets into target-tailored STAR achievements with zero 'hallucinated' summaries." color="#ffd7ce" icon="wand" />
            <FeatureCard number="02" title="27-check ATS audit" text="Get instant feedback on font sizing, format validity, keyword density, and section ordering." color="#d7f78d" icon="check" />
            <FeatureCard number="03" title="Zero-database privacy" text="Your resume data lives exclusively in your browser's IndexedDB. No tracking cookies, no server storage, you own it." color="#c9c0ff" icon="file" wide />
          </div>
        </div>
      </section>
    </div>
  );
}

function ResumeLabel({ children, className = '' }) {
  return <p className={`text-[7px] font-black uppercase tracking-[0.16em] ${className}`}>{children}</p>;
}

function FeatureCard({ number, title, text, color, icon, wide = false }) {
  return (
    <article className={`feature-card ${wide ? 'sm:col-span-2 sm:grid sm:grid-cols-[1fr_1.25fr]' : ''}`} style={{ backgroundColor: color }}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold tracking-[0.12em] font-mono text-black">{number}</span>
        <span className="grid size-11 place-items-center rounded-full border border-black/20 bg-white/40 text-black shadow-sm">
          <Icon name={icon} />
        </span>
      </div>
      <div className={wide ? 'sm:self-end' : 'mt-16'}>
        <h3 className="font-display text-2xl font-bold tracking-[-0.04em] text-[#171713]">{title}</h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-black/60">{text}</p>
      </div>
    </article>
  );
}
