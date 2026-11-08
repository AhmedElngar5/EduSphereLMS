import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search, Play, Award, CheckCircle2 } from 'lucide-react';
import { studentService } from '../services/studentService';
import { certificateService } from '../services/certificateService';
import { EnrollmentStatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const MyCoursesPage: React.FC = () => {
  const [tab, setTab] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [search, setSearch] = useState('');

  const { data: enrollments = [], isLoading, refetch } = useQuery({
    queryKey: ['myEnrollments', tab],
    queryFn: () =>
      studentService.getMyEnrollments(tab === 'completed' ? true : undefined),
  });

  const filtered = enrollments.filter((item) => {
    if (tab === 'in_progress' && item.progressPercentage >= 100) return false;
    if (tab === 'completed' && item.progressPercentage < 100) return false;
    if (search.trim()) {
      return item.courseTitle.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Courses</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your enrolled courses and view curriculum progress
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search enrolled..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            tab === 'all'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All ({enrollments.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('in_progress')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            tab === 'in_progress'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          In Progress ({enrollments.filter((e) => e.progressPercentage < 100).length})
        </button>
        <button
          type="button"
          onClick={() => setTab('completed')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            tab === 'completed'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Completed ({enrollments.filter((e) => e.progressPercentage >= 100).length})
        </button>
      </div>

      {/* Courses List */}
      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Loading your enrolled courses..." />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {item.categoryName || 'General'}
                  </span>
                  <EnrollmentStatusBadge status={item.status} />
                </div>

                <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                  {item.courseTitle}
                </h3>

                <p className="text-xs text-slate-500">Instructor: {item.instructorName}</p>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>
                      {item.completedLessons} of {item.totalLessons} lessons completed
                    </span>
                    <span className="text-indigo-600 font-bold">{item.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${item.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                {item.progressPercentage >= 100 ? (
                  <Link
                    to="/student/certificates"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Certificate</span>
                  </Link>
                ) : (
                  <span className="text-xs text-slate-400">Keep going!</span>
                )}

                <Link
                  to={`/student/learn/${item.courseId}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Resume</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="book"
          title="No courses found"
          description={
            search
              ? 'No enrolled courses match your search query.'
              : 'You do not have any courses under this filter.'
          }
          actionLabel="Explore Catalog"
          onAction={() => (window.location.href = '/courses')}
        />
      )}
    </div>
  );
};

