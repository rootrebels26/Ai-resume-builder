import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Top-level error boundary so a single render failure never white-screens
 * the whole application. Local resume data lives in IndexedDB and is unaffected.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Replace with a real error reporter (Sentry, etc.) in production.
    console.error('Unhandled UI error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.assign('/');
  };

  handleResetState = () => {
    try {
      localStorage.removeItem('active_wizard_state');
    } catch (e) {}
    window.location.assign('/builder');
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-bold text-slate-900">Something went wrong</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              An unexpected error occurred while rendering this page. Your resume data is stored
              locally on your device and has not been lost.
            </p>
          </div>

          {this.state.error && (
            <div className="text-left bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-rose-600 max-h-32 overflow-y-auto">
              <p className="font-bold">{this.state.error.name}: {this.state.error.message}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try again</span>
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Go home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
