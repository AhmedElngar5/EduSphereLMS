import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  title?: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, title, type, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastItem = { id, message, title, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string, title?: string) => showToast({ message, title, type: 'success' }),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string) => showToast({ message, title, type: 'error' }),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string) => showToast({ message, title, type: 'info' }),
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => showToast({ message, title, type: 'warning' }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, info, warning, dismiss }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
              border: 'border-emerald-200',
              bg: 'bg-white',
              titleColor: 'text-emerald-900',
            },
            error: {
              icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
              border: 'border-rose-200',
              bg: 'bg-white',
              titleColor: 'text-rose-900',
            },
            warning: {
              icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
              border: 'border-amber-200',
              bg: 'bg-white',
              titleColor: 'text-amber-900',
            },
            info: {
              icon: <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />,
              border: 'border-indigo-200',
              bg: 'bg-white',
              titleColor: 'text-indigo-900',
            },
          }[toast.type];

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border ${typeConfig.border} ${typeConfig.bg} text-slate-800 transition-all duration-200 transform translate-y-0`}
            >
              {typeConfig.icon}
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className={`text-sm font-bold ${typeConfig.titleColor} mb-0.5`}>
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs text-slate-600 leading-relaxed break-words">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

