import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="text-6xl font-black text-slate-300">404</div>
      <h1 className="text-xl font-bold text-slate-800">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm">
        The page you are looking for does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
      >
        <Home className="w-4 h-4" />
        <span>Return Home</span>
      </Link>
    </div>
  );
}
