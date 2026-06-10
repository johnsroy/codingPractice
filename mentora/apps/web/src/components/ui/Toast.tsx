'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import clsx from 'clsx';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle2 size={20} className="text-green-500" />,
  error: <AlertCircle size={20} className="text-red-500" />,
  info: <Info size={20} className="text-brand-500" />,
};

const bg: Record<ToastKind, string> = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  info: 'border-brand-200 bg-brand-50',
};

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={clsx(
        'flex items-start gap-3 p-4 rounded-xl border shadow-card',
        'animate-slide-up w-full sm:min-w-[280px] sm:max-w-sm',
        bg[item.kind],
      )}
    >
      <span aria-hidden="true">{icons[item.kind]}</span>
      <p className="text-sm font-medium text-stone-800 flex-1">{item.message}</p>
      <button
        onClick={onDismiss}
        className="text-stone-400 hover:text-stone-700 p-2 -m-1 rounded min-w-[36px] min-h-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, kind }]);
  }, []);

  const success = useCallback((msg: string) => toast(msg, 'success'), [toast]);
  const error = useCallback((msg: string) => toast(msg, 'error'), [toast]);
  const info = useCallback((msg: string) => toast(msg, 'info'), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      {/* Toast stack — fixed top-center on mobile, top-right on desktop.
          Uses safe-area insets so notched devices stay clear of the status bar.
          z-[200] sits above modals (z-50), drawers (z-40), and the navbar. */}
      <div
        className={[
          'fixed z-[200] flex flex-col gap-3 pointer-events-none',
          /* mobile: full-width centered strip near top */
          'top-[max(1rem,env(safe-area-inset-top))]',
          'left-4 right-4',
          /* sm+: pin to top-right corner */
          'sm:left-auto sm:right-6 sm:w-auto',
        ].join(' ')}
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          /* re-enable pointer events on the individual items */
          <div key={t.id} className="pointer-events-auto">
            <ToastItem item={t} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
