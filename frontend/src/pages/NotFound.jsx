import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-5 bg-canvas min-h-[70vh]">
      <div className="text-8xl font-black text-ink/20 font-mono">404</div>
      <h1 className="text-3xl font-extrabold text-ink tracking-tight">
        Page Not Found.{' '}
        <span className="editorial-italic text-[1.12em]">Lost in transit.</span>
      </h1>
      <p className="text-xs sm:text-sm text-ink-secondary max-w-sm leading-relaxed">
        The page you are looking for does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="btn-primary py-3 px-6 text-xs sm:text-sm shadow-brutal group"
      >
        <Home className="w-4 h-4" />
        <span>Return Home</span>
      </Link>
    </div>
  );
}
