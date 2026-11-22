import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main id="main-content" className="flex-1 flex flex-col focus:outline-none" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
