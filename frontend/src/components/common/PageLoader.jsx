import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Suspense fallback used while a lazily-loaded route chunk is fetched.
 */
export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center py-32 bg-canvas" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-ink">
        <div className="w-8 h-8 rounded-full border-4 border-ink/20 border-t-volt animate-spin" />
        <span className="text-xs font-mono font-bold">Loading Studio…</span>
      </div>
    </div>
  );
}
