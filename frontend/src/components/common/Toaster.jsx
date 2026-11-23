import React, { useEffect, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { subscribeToast } from '../../services/toastBus';

const ICONS = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

const STYLES = {
  error: 'border-ink bg-rose-50 text-rose-900',
  success: 'border-ink bg-volt text-ink',
  info: 'border-ink bg-white text-ink',
};

export function Toaster() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToast((toast) => {
      setToasts((prev) => [...prev.slice(-3), toast]);
      if (toast.duration > 0) {
        setTimeout(() => dismiss(toast.id), toast.duration);
      }
    });
    return unsubscribe;
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 w-[calc(100vw-2rem)] max-w-sm no-print"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || Info;
        return (
          <div
            key={toast.id}
            role="alert"
            className={`flex items-start gap-3 rounded-2xl border-[1.5px] px-4 py-3 shadow-brutal ${STYLES[toast.type] || STYLES.info}`}
          >
            <Icon className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-md p-0.5 opacity-60 hover:opacity-100 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
