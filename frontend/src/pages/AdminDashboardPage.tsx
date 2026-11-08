import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  BookOpen,
  GraduationCap,
  ArrowRight,
  CreditCard,
  Award,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { adminService } from '../services/adminService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/common/Button';

export const AdminDashboardPage: React.FC = () => {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => adminService.getDashboardStats(),
  });

  const { data: pendingCourses } = useQuery({
    queryKey: ['adminPendingCourses'],
    queryFn: () => adminService.getPendingCourses(1, 5),
  });

  if (isLoading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" message="Loading platform analytics..." />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
        Failed to load administrative analytics. Please refresh the page or check server connection.
      </div>
    );
  }

  const {
    totalUsers,
    totalStudents,
    totalInstructors,
    totalCourses,
    publishedCourses,
    pendingCourses: pendingCount,
    totalEnrollments,
    totalRevenue,
    monthlyEnrollments,
    topCourses,
    recentUsers,
    recentTransactions,
  } = dashboard;

  const platformNetShare = totalRevenue * 0.20;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Control Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time financial telemetry, system KPIs, and platform management
          </p>
        </div>

        {pendingCount > 0 && (
          <Link to="/admin/courses/pending">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Clock className="w-4 h-4 text-amber-600" />}
              className="border-amber-300 bg-amber-50/60 text-amber-900 hover:bg-amber-100"
            >
              <span>{pendingCount} Pending Course Approvals</span>
            </Button>
          </Link>
        )}
      </div>

      {/* KPI Grid (8 Cards) using StatCard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Sales"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="emerald"
          subtitle="Total volume processed"
        />
        <StatCard
          title="Platform Net"
          value={`$${platformNetShare.toFixed(2)}`}
          icon={TrendingUp}
          color="amber"
          subtitle="20% retained platform fee"
        />
        <StatCard
          title="Total Enrollments"
          value={totalEnrollments}
          icon={Award}
          color="sky"
          subtitle="Course enrollments recorded"
        />
        <StatCard
          title="Total Accounts"
          value={totalUsers}
          icon={Users}
          color="purple"
          subtitle={`${totalStudents} Students • ${totalInstructors} Instructors`}
        />
        <StatCard
          title="Total Courses"
          value={totalCourses}
          icon={BookOpen}
          color="indigo"
          subtitle="All registered curriculums"
        />
        <StatCard
          title="Published"
          value={publishedCourses}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Active in storefront"
        />
        <StatCard
          title="Pending Review"
          value={pendingCount}
          icon={Clock}
          color="amber"
          subtitle="Awaiting admin review"
        />
        <StatCard
          title="Instructors"
          value={totalInstructors}
          icon={GraduationCap}
          color="indigo"
          subtitle="Verified course creators"
        />
      </div>

      {/* Monthly Enrollment Trend Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Monthly Enrollment Trend</h3>
          </div>
          <span className="text-xs text-slate-500">Historical enrollment volume</span>
        </div>

        <div className="h-64 w-full pt-4">
          {monthlyEnrollments && monthlyEnrollments.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyEnrollments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    color: '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#enrollmentGrad)"
                  name="Enrollments"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
              No enrollment trend data recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout: Top Courses & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top-Performing Courses */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Top Performing Courses</h3>
            <Link
              to="/admin/courses"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {topCourses && topCourses.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {topCourses.slice(0, 5).map((course, idx) => (
                <div key={course.courseId} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs truncate">{course.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {course.instructorName} &bull; {course.categoryName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-600">
                      {course.enrolledCount} enrolled
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {course.isFree ? 'Free' : `$${course.price.toFixed(2)}`} &bull; ★{' '}
                      {course.averageRating.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-4">No published courses found.</p>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Recent Transactions</h3>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentTransactions && recentTransactions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentTransactions.slice(0, 5).map((tx) => (
                <div key={tx.paymentId} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{tx.courseTitle}</h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      Buyer: <span className="text-slate-700 font-medium">{tx.studentName}</span> &bull;{' '}
                      {tx.paidAtUtc ? new Date(tx.paidAtUtc).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-600">
                      +${tx.amount.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">
                      {tx.gateway}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-4">No recent transactions recorded.</p>
          )}
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-sm">Recently Registered Users</h3>
          </div>
          <Link
            to="/admin/users"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
          >
            Manage All Users <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentUsers && recentUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Roles</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUsers.slice(0, 5).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.createdAtUtc).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-4">No users found.</p>
        )}
      </div>

      {/* Pending Approval Courses Card */}
      {pendingCourses && pendingCourses.items.length > 0 && (
        <div className="bg-amber-50/30 rounded-2xl border border-amber-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-amber-950 text-sm">Pending Course Approvals Queue</h3>
            </div>
            <Link
              to="/admin/courses/pending"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
            >
              Full Queue ({pendingCount}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-amber-100">
            {pendingCourses.items.map((c) => (
              <div
                key={c.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Instructor: <span className="font-medium text-slate-700">{c.instructorName}</span> &bull; Category: {c.categoryName} &bull;{' '}
                    {c.isFree ? 'Free' : `$${c.price.toFixed(2)}`}
                  </p>
                </div>

                <Link to="/admin/courses/pending">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-300 bg-white hover:bg-amber-50 text-amber-800"
                  >
                    Review &amp; Approve
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
