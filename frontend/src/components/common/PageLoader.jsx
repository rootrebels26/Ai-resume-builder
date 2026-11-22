import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Suspense fallback used while a lazily-loaded route chunk is fetched.
 */
export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center py-32" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        <span className="text-xs font-medium">Loading…</span>
      </div>
    </div>
  );
}
