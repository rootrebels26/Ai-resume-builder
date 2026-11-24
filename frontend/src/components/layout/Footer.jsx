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
                Nitya<span className="text-[#cfff58]">CloudTech</span>
              </Link>
              <p className="mt-1 text-xs font-mono font-medium text-[#cfff58]">
                Developed by Nitya CloudTech Team
              </p>
              <p className="mt-2 text-sm text-[#88867e] max-w-md">
                Enterprise AI Resume Engineering &amp; ATS Optimization. Official product of Nitya CloudTech.
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
                Organization
              </p>
              <ul className="mt-4 space-y-2.5 font-medium">
                <li><a href="https://www.nityacloudtech.com/" target="_blank" rel="noreferrer" className="transition hover:text-white">Nitya CloudTech Portal ↗</a></li>
                <li><span className="text-white">Zero Cloud Database</span></li>
                <li><span>Client-Side IndexedDB</span></li>
                <li><Link to="/privacy" className="transition hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white">
                Built for High-Stakes Hires
              </p>
              <p className="mt-4 text-xs leading-relaxed text-[#88867e]">
                Every template passes text extraction and section parsing on Workday, Greenhouse, and Lever ATS platforms without layout shifts.
              </p>
              <p className="mt-3 text-[11px] text-[#706e66] font-mono">
                Sector-46, Gurgaon, Haryana, India • info@nityacloudtech.com
              </p>
            </div>
          </div>

          {/* Giant Figma Background Hollow Wordmark */}
          <div className="relative pt-6 border-t border-white/5 flex flex-col items-center">
            <div className="footer-wordmark font-display text-[45px] font-bold tracking-[-0.04em] sm:text-[90px] lg:text-[135px] leading-none select-none pointer-events-none text-center">
              Nitya CloudTech
            </div>
            <div className="mt-6 flex w-full flex-col items-center justify-between gap-3 text-xs text-[#706e66] sm:flex-row">
              <p>© {new Date().getFullYear()} Nitya CloudTech • Developed by Nitya CloudTech Team</p>
              <a href="https://www.nityacloudtech.com/" target="_blank" rel="noreferrer" className="hover:text-white transition">www.nityacloudtech.com</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
