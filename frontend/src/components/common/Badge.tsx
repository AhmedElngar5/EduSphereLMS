import React from 'react';
import { CourseLevel, CourseStatus, EnrollmentStatus, OrderStatus, PaymentStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className = '',
}) => {
  const variantClasses = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  }[variant];

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 font-medium',
    md: 'text-sm px-3 py-1 font-semibold',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border ${variantClasses} ${sizeClasses} ${className}`}>
      {children}
    </span>
  );
};

export const CourseLevelBadge: React.FC<{ level: CourseLevel | number | string }> = ({ level }) => {
  const levelStr = typeof level === 'number'
    ? { 1: 'AllLevels', 2: 'Beginner', 3: 'Intermediate', 4: 'Advanced' }[level] || 'AllLevels'
    : level;

  switch (levelStr) {
    case 'Beginner':
      return <Badge variant="emerald">Beginner</Badge>;
    case 'Intermediate':
      return <Badge variant="sky">Intermediate</Badge>;
    case 'Advanced':
      return <Badge variant="purple">Advanced</Badge>;
    default:
      return <Badge variant="slate">All Levels</Badge>;
  }
};

export const CourseStatusBadge: React.FC<{ status: CourseStatus | number | string }> = ({ status }) => {
  const statusStr = typeof status === 'number'
    ? { 1: 'Draft', 2: 'PendingApproval', 3: 'Approved', 4: 'Published', 5: 'Rejected', 6: 'Archived' }[status] || 'Draft'
    : status;

  switch (statusStr) {
    case 'Published':
      return <Badge variant="emerald">Published</Badge>;
    case 'Approved':
      return <Badge variant="sky">Approved</Badge>;
    case 'PendingApproval':
      return <Badge variant="amber">Pending Approval</Badge>;
    case 'Rejected':
      return <Badge variant="rose">Rejected</Badge>;
    case 'Archived':
      return <Badge variant="slate">Archived</Badge>;
    default:
      return <Badge variant="slate">Draft</Badge>;
  }
};

export const EnrollmentStatusBadge: React.FC<{ status: EnrollmentStatus | number | string }> = ({ status }) => {
  const statusStr = typeof status === 'number'
    ? { 1: 'Active', 2: 'Completed', 3: 'Dropped', 4: 'Expired' }[status] || 'Active'
    : status;

  switch (statusStr) {
    case 'Completed':
      return <Badge variant="emerald">Completed</Badge>;
    case 'Active':
      return <Badge variant="indigo">In Progress</Badge>;
    case 'Dropped':
      return <Badge variant="rose">Dropped</Badge>;
    case 'Expired':
      return <Badge variant="slate">Expired</Badge>;
    default:
      return <Badge variant="slate">{String(status)}</Badge>;
  }
};

export const PaymentStatusBadge: React.FC<{ status: PaymentStatus | OrderStatus | number | string }> = ({ status }) => {
  const statusStr = typeof status === 'number'
    ? { 1: 'Pending', 2: 'Succeeded', 3: 'Failed', 4: 'Refunded' }[status] || 'Pending'
    : status;

  switch (statusStr) {
    case 'Succeeded':
    case 'Completed':
      return <Badge variant="emerald">Succeeded</Badge>;
    case 'Pending':
      return <Badge variant="amber">Pending</Badge>;
    case 'Failed':
    case 'Cancelled':
      return <Badge variant="rose">Failed</Badge>;
    case 'Refunded':
      return <Badge variant="purple">Refunded</Badge>;
    default:
      return <Badge variant="slate">{String(status)}</Badge>;
  }
};
