import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { LoginModal } from '../common/LoginModal';

export function AppLayout({ children }) {
  const location = useLocation();
  const isBuilder = location.pathname === '/builder';

  return (
    <div className={`min-h-screen flex flex-col bg-canvas text-ink ${isBuilder ? 'h-screen overflow-hidden' : 'overflow-x-hidden'} w-full`}>
      <Navbar />
      <main
        id="main-content"
        className={`flex-1 flex flex-col focus:outline-none w-full ${isBuilder ? 'min-h-0 overflow-hidden' : 'overflow-x-hidden'}`}
        tabIndex={-1}
      >
        {children}
      </main>
      {!isBuilder && <Footer />}
      <LoginModal />
    </div>
  );
}
