import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from './PageLoader';
import { Lock, ArrowRight } from 'lucide-react';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isCheckingAuth, openLoginModal } = useAuth();

  if (isCheckingAuth) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 min-h-[75vh] flex items-center justify-center p-6 bg-[#f4f0e8]">
        <div className="max-w-md w-full bg-[#fffdf8] border-2 border-[#171713] rounded-3xl p-8 shadow-[8px_8px_0_#171713] text-center space-y-4">
          <div className="mx-auto size-12 rounded-full bg-[#ffd2c9] border border-[#ef5b45]/30 flex items-center justify-center text-[#ef5b45]">
            <Lock className="w-6 h-6" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#ffd2c9] text-[#ef5b45] border border-[#ef5b45]/30 font-mono">
            Company Access Required
          </span>
          <h2 className="font-display text-2xl font-bold text-[#171713]">
            Restricted Workspace
          </h2>
          <p className="text-sm text-[#646158] leading-relaxed">
            The Nitya CloudTech Resume Builder and AI tools are restricted to authorized team members. Please enter your unique company access code to continue.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openLoginModal({ message: 'Enter your company access code to unlock the editor.' })}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#171713] bg-[#171713] px-6 py-3.5 text-sm font-bold text-white shadow-[4px_4px_0_#5e48d7] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Enter Access Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
