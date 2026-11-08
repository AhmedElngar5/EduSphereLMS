import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple';
  subtitle?: string;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'indigo',
  subtitle,
  trend,
  className = '',
  onClick,
}) => {
  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'hover:border-indigo-200',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-200',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'hover:border-amber-200',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'hover:border-rose-200',
    },
    sky: {
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      border: 'hover:border-sky-200',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'hover:border-purple-200',
    },
  }[color];

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-sm transition-all space-y-3 ${
        colorStyles.border
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${colorStyles.bg} ${colorStyles.text}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>

        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {trend.value}
            </span>
          )}

          {subtitle && (
            <span className="text-slate-500 font-normal truncate">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
};

