import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, BookOpen, Award, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { NotificationType } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', unreadOnly],
    queryFn: () => notificationService.getNotifications(unreadOnly || undefined),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'CourseEnrollment':
        return <BookOpen className="w-4 h-4 text-indigo-600" />;
      case 'CertificateIssued':
      case 'CourseCompletion':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'PaymentConfirmed':
      case 'PaymentFailed':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stay updated with course enrollments, certificate issuances, and alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              unreadOnly
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {unreadOnly ? 'Showing Unread' : 'Filter Unread'}
          </button>

          <button
            type="button"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || notifications.every((n) => n.isRead)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Loading notifications..." />
        </div>
      ) : notifications.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start gap-4 transition-colors ${
                !n.isRead ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getNotificationIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(n.createdAtUtc).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                {n.actionUrl && (
                  <a
                    href={n.actionUrl}
                    className="inline-block pt-1 text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    View Details &rarr;
                  </a>
                )}
              </div>

              {!n.isRead && (
                <button
                  type="button"
                  onClick={() => markReadMutation.mutate(n.id)}
                  className="text-[10px] font-bold text-indigo-600 hover:underline shrink-0 cursor-pointer"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="inbox"
          title="All caught up!"
          description="You don't have any notifications right now."
        />
      )}
    </div>
  );
};

