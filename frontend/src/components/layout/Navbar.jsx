import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, openLoginModal, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#f4f0e8]/95 backdrop-blur-md border-b border-black/10 no-print">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-10 lg:px-14">
        {/* Brand Logo matching Figma Make */}
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="Nitya CloudTech home">
          <span className="logo-mark"><span>N</span></span>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-[20px] font-bold tracking-[-0.04em] text-[#171713]">
              Nitya<span className="text-[#5e48d7]">CloudTech</span>
            </span>
            <span className="text-[9.5px] font-mono font-medium tracking-tight text-[#706e66] -mt-0.5">
              AI Resume Builder • Developed by Nitya CloudTech Team
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
          <Link
            to="/onboarding#1"
            className={`nav-link ${location.pathname === '/onboarding' ? 'text-[#5e48d7]' : ''}`}
          >
            Create New
          </Link>
          <Link
            to="/templates"
            className={`nav-link ${location.pathname === '/templates' ? 'text-[#5e48d7]' : ''}`}
          >
            Templates
          </Link>
          <Link
            to="/ats-checker"
            className={`nav-link ${location.pathname === '/ats-checker' ? 'text-[#5e48d7]' : ''}`}
          >
            ATS Checker
          </Link>
        </nav>

        {/* Right CTA Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#cfff58] text-[#171713] border border-black shadow-[2px_2px_0_#171713]">
                <span className="size-2 rounded-full bg-green-600 animate-pulse" />
                Company Active
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#706e66] hover:text-[#171713] hover:bg-black/5 transition cursor-pointer flex items-center gap-1"
                title="Log out from company session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openLoginModal()}
              className="rounded-full px-4 py-2 text-sm font-semibold text-[#171713] transition hover:bg-black/5 cursor-pointer"
            >
              Log in
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          className="grid size-11 place-items-center rounded-full border border-black/20 text-[#171713] md:hidden hover:bg-black/5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="absolute left-5 right-5 top-20 rounded-2xl border border-black bg-[#fffdf7] p-5 shadow-[5px_5px_0_#171713] md:hidden">
            <nav className="flex flex-col gap-4 font-semibold text-[#171713]">
              <Link to="/onboarding#1" onClick={() => setMenuOpen(false)} className="hover:text-[#5e48d7]">Create New</Link>
              <Link to="/templates" onClick={() => setMenuOpen(false)} className="hover:text-[#5e48d7]">Templates</Link>
              <Link to="/ats-checker" onClick={() => setMenuOpen(false)} className="hover:text-[#5e48d7]">ATS Checker</Link>
              <div className="pt-2 border-t border-black/10 flex flex-col gap-2">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between py-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#cfff58] text-[#171713] border border-black">
                      <span className="size-2 rounded-full bg-green-600 animate-pulse" />
                      Company Active
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="text-xs font-bold text-[#ef5b45] px-2 py-1"
                    >
                      Log out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      openLoginModal();
                    }}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-[#171713] transition hover:bg-black/5 cursor-pointer text-left"
                  >
                    Log in with Code
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
