import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, ArrowUpRight } from 'lucide-react';
import { adminService } from '../services/adminService';
import { CourseStatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast } from '../components/common/Toast';
import { Button } from '../components/common/Button';

export const ManageCoursesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [courseToDelete, setCourseToDelete] = useState<{ id: number; title: string } | null>(null);

  const { data: coursesResult, isLoading } = useQuery({
    queryKey: ['adminAllCourses', statusFilter, page],
    queryFn: () => adminService.getAllCourses(undefined, page, 15),
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => adminService.publishCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllCourses'] });
      toast.success('Course published to catalog!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to publish course.');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: number) => adminService.unpublishCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllCourses'] });
      toast.success('Course unpublished from catalog.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to unpublish course.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllCourses'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      toast.success('Course deleted permanently.');
      setCourseToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete course.');
      setCourseToDelete(null);
    },
  });

  const courses = coursesResult?.items || [];
  const totalCount = coursesResult?.totalCount || 0;
  const totalPages = coursesResult?.totalPages || 1;

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage All Courses</h1>
          <p className="text-xs text-slate-500 mt-1">
            Admin oversight: publish, unpublish, and audit all platform curriculums
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 shadow-xs cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Approved">Approved</option>
            <option value="PendingApproval">Pending Approval</option>
            <option value="Draft">Draft</option>
            <option value="Rejected">Rejected</option>
          </select>

          <div className="relative w-48 sm:w-64">
            <input
              type="text"
              placeholder="Search title or instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Loading course directory..." />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Instructor</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Enrolled</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 max-w-xs truncate">{course.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{course.categoryName}</div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {course.instructorName}
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900">
                        {course.isFree ? <span className="text-emerald-600">Free</span> : `$${course.price.toFixed(2)}`}
                      </td>

                      <td className="px-6 py-4 font-medium">{course.enrolledCount} learners</td>

                      <td className="px-6 py-4">
                        <CourseStatusBadge status={course.status} />
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        {course.status === 'Published' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            isLoading={unpublishMutation.isPending}
                            onClick={() => unpublishMutation.mutate(course.id)}
                            className="text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
                          >
                            Unpublish
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={publishMutation.isPending}
                            onClick={() => publishMutation.mutate(course.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Publish
                          </Button>
                        )}

                        <Link
                          to={`/courses/${course.slug || course.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                            View
                          </Button>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setCourseToDelete({ id: course.id, title: course.title })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer inline-flex items-center"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={15}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      ) : (
        <EmptyState
          icon="book"
          title="No courses found"
          description="No courses match the selected filters."
        />
      )}

      {/* Styled Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={() => {
          if (courseToDelete) deleteMutation.mutate(courseToDelete.id);
        }}
        title="Delete Course"
        message={`Are you sure you want to delete course "${courseToDelete?.title}"? All enrolled students, progress, and certificates associated with this course may be affected.`}
        confirmText="Delete Course"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
