import React from 'react';
import { BookOpen, AlertCircle, Search, Inbox, Folder } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'book' | 'search' | 'alert' | 'inbox' | 'folder';
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  const IconComponent = {
    book: BookOpen,
    search: Search,
    alert: AlertCircle,
    inbox: Inbox,
    folder: Folder,
  }[icon];

  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white border border-dashed border-slate-200 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
        <IconComponent className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

