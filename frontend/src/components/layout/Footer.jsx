import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';

export function Footer() {
  const navigate = useNavigate();
  const { createNewResume } = useResume();

  const handleStartBuilding = async () => {
    try {
      await createNewResume('ats-01', 'My Resume');
      navigate('/builder');
    } catch (e) {
      navigate('/builder');
    }
  };

  return (
    <footer className="bg-[#f4f0e8] pb-12 pt-6 px-4 sm:px-6 lg:px-8 no-print mt-auto">
      <div className="mx-auto max-w-[1440px]">
        {/* Figma Dark Rounded Footer Card */}
        <div className="rounded-[32px] bg-[#171713] p-8 text-[#a09e96] shadow-[8px_8px_0_#171713] sm:p-14 border border-black relative overflow-hidden">
          {/* Top Row */}
          <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 pb-10 md:flex-row md:items-center">
            <div>
              <Link to="/" className="inline-block font-display text-2xl font-bold tracking-[-0.04em] text-white">
                Resume<span className="text-[#cfff58]">Studio</span>
              </Link>
              <p className="mt-1 text-xs font-mono font-medium text-[#cfff58]">
                Developed by Sagnik Sen &amp; Atanu Das
              </p>
              <p className="mt-2 text-sm text-[#88867e] max-w-md">
                Privacy-first, recruiter-approved resume builder. Helping 1028+ job seekers win.
              </p>
            </div>

            <button
              onClick={handleStartBuilding}
              className="inline-flex items-center gap-2 rounded-full bg-[#cfff58] px-6 py-3 font-display text-sm font-bold text-black transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0_white]"
            >
              <span>Start building</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 gap-10 py-12 text-sm sm:grid-cols-3">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white">
                Product
              </p>
              <ul className="mt-4 space-y-2.5 font-medium">
                <li><Link to="/builder" className="transition hover:text-white">Resume Builder</Link></li>
                <li><Link to="/templates" className="transition hover:text-white">50+ Templates</Link></li>
                <li><Link to="/ats-checker" className="transition hover:text-white">ATS Checker</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white">
                Philosophy
              </p>
              <ul className="mt-4 space-y-2.5 font-medium">
                <li><span className="text-white">No account required</span></li>
                <li><span>Zero server storage</span></li>
                <li><span>Client-side IndexedDB</span></li>
                <li><Link to="/privacy" className="transition hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white">
                Built for High-Stakes Hires
              </p>
              <p className="mt-4 text-xs leading-relaxed text-[#88867e]">
                Every template passes text extraction and section parsing on Workday, Greenhouse, and Lever ATS platforms without messy layout shifts.
              </p>
            </div>
          </div>

          {/* Giant Figma Background Hollow Wordmark */}
          <div className="relative pt-6 border-t border-white/5 flex flex-col items-center">
            <div className="footer-wordmark font-display text-[55px] font-bold tracking-[-0.04em] sm:text-[105px] lg:text-[150px] leading-none select-none pointer-events-none text-center">
              ResumeStudio
            </div>
            <div className="mt-6 flex w-full flex-col items-center justify-between gap-3 text-xs text-[#706e66] sm:flex-row">
              <p>© {new Date().getFullYear()} ResumeStudio • Developed by Sagnik Sen &amp; Atanu Das</p>
              <p>Crafted with low-anxiety design.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
