import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, BookOpen, GraduationCap } from 'lucide-react';
import { instructorService } from '../services/instructorService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const EnrolledStudentsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['instructorCourses'],
    queryFn: () => instructorService.getMyCourses(),
  });

  // Calculate enrolled metrics
  const totalEnrolled = courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enrolled Students</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of student participation across your course catalog ({totalEnrolled} total enrollments)
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Loading student participation..." />
        </div>
      ) : courses.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {c.categoryName}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-2 line-clamp-2">
                    {c.title}
                  </h3>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Active Students:</span>
                  <span className="text-base font-black text-slate-900">
                    {c.enrolledCount} {c.enrolledCount === 1 ? 'student' : 'students'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Enrollment Summary Roster</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Total Enrolled</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{course.title}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {course.isFree ? 'Free' : `$${course.price.toFixed(2)}`}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-indigo-600">
                        {course.enrolledCount}
                      </td>
                      <td className="px-4 py-3.5">{course.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon="inbox"
          title="No courses or enrollments yet"
          description="Once your courses are approved and published, enrolled student numbers will appear here."
        />
      )}
    </div>
  );
};

