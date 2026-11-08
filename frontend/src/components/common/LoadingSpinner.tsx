import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center p-6 space-y-3 ${className}`}>
      <div
        className={`${sizeClasses} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {message && <p className="text-sm font-medium text-slate-500 animate-pulse">{message}</p>}
    </div>
  );
};

