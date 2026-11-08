import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Star, Users, BookOpen, Award, ArrowRight } from 'lucide-react';
import { instructorService } from '../services/instructorService';
import { StarRating } from '../components/common/StarRating';
import { CourseStatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const CoursePerformancePage: React.FC = () => {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['instructorCourses'],
    queryFn: () => instructorService.getMyCourses(),
  });

  const totalReviews = courses.reduce((acc, c) => acc + (c.totalReviews || 0), 0);
  const totalEnrolled = courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
  const avgRating =
    courses.length > 0
      ? (courses.reduce((acc, c) => acc + (c.averageRating || 0), 0) / courses.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Performance &amp; Engagement
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Student retention metrics, review sentiments, and curriculum feedback
        </p>
      </div>

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Loading performance metrics..." />
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Avg Rating</span>
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">{avgRating} ★</p>
              <span className="text-[11px] text-slate-500 font-medium">Across all courses</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Reviews</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{totalReviews}</p>
              <span className="text-[11px] text-slate-500 font-medium">Verified student ratings</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Students</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{totalEnrolled}</p>
              <span className="text-[11px] text-slate-500 font-medium">Active enrolled learners</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Catalog Size</span>
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{courses.length}</p>
              <span className="text-[11px] text-slate-500 font-medium">Curriculum offerings</span>
            </div>
          </div>

          {/* Individual Course Performance Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Course Analytics Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Students</th>
                    <th className="px-4 py-3">Lessons</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5 font-bold text-slate-900 max-w-xs truncate">
                        {course.title}
                      </td>
                      <td className="px-4 py-3.5">
                        <StarRating rating={course.averageRating} totalReviews={course.totalReviews} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {course.enrolledCount} learners
                      </td>
                      <td className="px-4 py-3.5">{course.totalLessons} lessons</td>
                      <td className="px-4 py-3.5">
                        <CourseStatusBadge status={course.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          to={`/courses/${course.slug || course.id}`}
                          className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                        >
                          View Public Page <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

