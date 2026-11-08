import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  Users,
  BookOpen,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Star,
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
import { instructorService } from '../services/instructorService';
import { CourseStatusBadge, EnrollmentStatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/common/Button';

export const InstructorDashboardPage: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['instructorDashboardStats'],
    queryFn: () => instructorService.getDashboardStats(),
  });

  if (isLoading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" message="Loading instructor dashboard..." />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
        Failed to load instructor analytics. Please refresh or try again later.
      </div>
    );
  }

  const {
    totalCourses,
    publishedCourses,
    totalStudents,
    totalRevenue,
    instructorEarnings,
    totalSalesCount,
    averageRating,
    courseBreakdown,
    monthlyEnrollments,
    recentEnrollments,
  } = stats;

  return (
    <div className="space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Instructor Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor course performance, revenue share, and learner progress
          </p>
        </div>

        <Link to="/instructor/courses/new">
          <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Course
          </Button>
        </Link>
      </div>

      {/* Metric Cards Row using StatCard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Earnings"
          value={`$${instructorEarnings.toFixed(2)}`}
          icon={DollarSign}
          color="emerald"
          subtitle="80% creator payout share"
        />
        <StatCard
          title="Gross Sales"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={TrendingUp}
          color="indigo"
          subtitle={`${totalSalesCount} paid checkouts`}
        />
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          color="sky"
          subtitle="Enrolled learners"
        />
        <StatCard
          title="Avg Rating"
          value={averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
          icon={Star}
          color="amber"
          subtitle={`${publishedCourses} of ${totalCourses} courses live`}
        />
      </div>

      {/* Monthly Enrollment Trends Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Course Enrollment Trends</h3>
          </div>
          <span className="text-xs text-slate-500">Learners enrolled over time</span>
        </div>

        <div className="h-64 w-full pt-4">
          {monthlyEnrollments && monthlyEnrollments.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyEnrollments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="instEnrollmentGrad" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#instEnrollmentGrad)"
                  name="Enrolled Students"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
              No enrollment trends recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Best-Performing Courses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Your Courses &amp; Performance</h3>
            <p className="text-xs text-slate-500">Live approval status, ratings, and revenue breakdown</p>
          </div>
          <Link
            to="/instructor/courses"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
          >
            Manage All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {courseBreakdown && courseBreakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Course Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Enrolled</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Earnings</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courseBreakdown.slice(0, 6).map((course) => (
                  <tr key={course.courseId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {course.title}
                    </td>
                    <td className="px-4 py-3.5">{course.categoryName}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      {course.isFree ? 'Free' : `$${course.price.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {course.enrolledCount} learners
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {course.averageRating > 0 ? course.averageRating.toFixed(1) : '–'} ({course.totalReviews})
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600">
                      ${course.instructorEarnings.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5">
                      <CourseStatusBadge status={course.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <Link to={`/instructor/courses/${course.courseId}/curriculum`}>
                        <Button variant="secondary" size="sm">
                          Curriculum
                        </Button>
                      </Link>
                      <Link to={`/instructor/courses/${course.courseId}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-4">
            You haven't created any courses yet. Click "Create New Course" above to get started!
          </p>
        )}
      </div>

      {/* Recent Enrollments */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Student Enrollments</h3>
            <p className="text-xs text-slate-500">Learners who recently joined your classes</p>
          </div>
          <Link
            to="/instructor/students"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
          >
            All Students <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentEnrollments && recentEnrollments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentEnrollments.slice(0, 5).map((e) => (
              <div key={e.enrollmentId} className="py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{e.studentName}</h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    Enrolled in: <span className="font-semibold text-slate-700">{e.courseTitle}</span> &bull;{' '}
                    {new Date(e.enrolledAtUtc).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-indigo-600">
                      {e.progressPercentage}%
                    </span>
                    <p className="text-[10px] text-slate-400">Completed</p>
                  </div>
                  <EnrollmentStatusBadge status={e.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-4">No student enrollments recorded yet.</p>
        )}
      </div>
    </div>
  );
};
