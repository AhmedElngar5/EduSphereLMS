import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, HelpCircle, X, Loader2 } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: <Trash2 className="w-6 h-6 text-rose-600" />,
      iconBg: 'bg-rose-50',
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500/20',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      iconBg: 'bg-amber-50',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500/20',
    },
    primary: {
      icon: <HelpCircle className="w-6 h-6 text-indigo-600" />,
      iconBg: 'bg-indigo-50',
      confirmBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500/20',
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          role="dialog"
          aria-modal="true"
          className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-md p-6 border border-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${variantStyles.iconBg}`}>
              {variantStyles.icon}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{message}</p>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs focus:ring-2 cursor-pointer disabled:opacity-50 ${variantStyles.confirmBtn}`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

