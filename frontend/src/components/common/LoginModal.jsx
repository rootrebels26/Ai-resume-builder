import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, Lock, ArrowRight, X, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, loginWithCode, modalConfig } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isLoginModalOpen) {
      setCode('');
      setError('');
      setLoading(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Please enter your unique company access code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await loginWithCode(trimmed);
      if (!result.success) {
        setError(result.message || 'Invalid company access code. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={closeLoginModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div
        className="relative w-full max-w-md rounded-3xl border-2 border-[#171713] bg-[#fffdf8] p-6 sm:p-8 shadow-[8px_8px_0_#171713] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeLoginModal}
          className="absolute right-5 top-5 grid size-9 place-items-center rounded-full border border-black/20 text-[#171713] hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#ffd2c9] text-[#ef5b45] border border-[#ef5b45]/30">
            <Lock className="w-3 h-3" />
            Restricted Company Access
          </span>
        </div>

        <h2 id="login-modal-title" className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#171713]">
          Enter Access Code
        </h2>

        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#646158]">
          {modalConfig?.message ||
            'This workspace is licensed for designated team members. Enter your company access code to unlock the full builder and templates.'}
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[#ef5b45] bg-[#fff2f0] p-3 text-xs text-[#ef5b45]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Access Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="company-code-input"
              className="block text-[11px] font-bold uppercase tracking-wider text-[#171713] mb-1.5 font-mono"
            >
              Unique Company Code
            </label>
            <div className="relative">
              <input
                id="company-code-input"
                ref={inputRef}
                type="text"
                autoComplete="off"
                spellCheck="false"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter company access code..."
                disabled={loading}
                className="w-full rounded-2xl border-2 border-[#171713] bg-white px-4 py-3 pl-11 text-sm font-mono font-bold tracking-wider text-[#171713] placeholder:font-sans placeholder:normal-case placeholder:font-normal placeholder:text-[#99968d] focus:outline-none focus:ring-2 focus:ring-[#5e48d7] disabled:opacity-50"
              />
              <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8a877e]" />
            </div>
            <p className="mt-1.5 text-[10.5px] text-[#77746b]">
              Your code is verified securely directly with the backend server.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-[#171713] bg-[#171713] px-6 py-3.5 text-sm font-bold text-white shadow-[4px_4px_0_#5e48d7] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#5e48d7] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Verifying Code...
              </span>
            ) : (
              <>
                <span>Unlock Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-black/10 flex items-center justify-center gap-2 text-[11px] text-[#8a877e]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#5e48d7]" />
          <span>Client-side private · Server-side authenticated</span>
        </div>
      </div>
    </div>
  );
}
