import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, ListOrdered, Send, Trash2 } from 'lucide-react';
import { instructorService } from '../services/instructorService';
import { CourseStatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast } from '../components/common/Toast';
import { Button } from '../components/common/Button';

export const InstructorCoursesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [courseToDelete, setCourseToDelete] = useState<{ id: number; title: string } | null>(null);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['instructorCourses'],
    queryFn: () => instructorService.getMyCourses(),
  });

  const submitApprovalMutation = useMutation({
    mutationFn: (id: number) => instructorService.submitForApproval(id),
    onSuccess: () => {
      toast.success('Course submitted for administrator review successfully!');
      queryClient.invalidateQueries({ queryKey: ['instructorCourses'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit course for approval.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => instructorService.deleteCourse(id),
    onSuccess: () => {
      toast.success('Draft course deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['instructorCourses'] });
      setCourseToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete course.');
      setCourseToDelete(null);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Course Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your courses, curriculum structure, and submission approvals
          </p>
        </div>

        <Link to="/instructor/courses/new">
          <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Course
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Loading your courses..." />
        </div>
      ) : courses.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Lessons</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 max-w-xs truncate">
                        {course.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {course.enrolledCount} students enrolled
                      </div>
                    </td>

                    <td className="px-6 py-4">{course.categoryName}</td>

                    <td className="px-6 py-4 font-bold text-slate-900">
                      {course.isFree ? (
                        <span className="text-emerald-600 font-semibold">Free</span>
                      ) : (
                        `$${course.price.toFixed(2)}`
                      )}
                    </td>

                    <td className="px-6 py-4 font-medium">{course.totalLessons} lessons</td>

                    <td className="px-6 py-4">
                      <CourseStatusBadge status={course.status} />
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <Link to={`/instructor/courses/${course.id}/curriculum`}>
                        <Button variant="secondary" size="sm" leftIcon={<ListOrdered className="w-3.5 h-3.5" />}>
                          Curriculum
                        </Button>
                      </Link>

                      <Link to={`/instructor/courses/${course.id}/edit`}>
                        <Button variant="outline" size="sm" leftIcon={<Edit className="w-3.5 h-3.5" />}>
                          Edit
                        </Button>
                      </Link>

                      {(course.status === 'Draft' || course.status === 'Rejected') && (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={submitApprovalMutation.isPending}
                          onClick={() => submitApprovalMutation.mutate(course.id)}
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Submit
                        </Button>
                      )}

                      {course.status === 'Draft' && (
                        <button
                          type="button"
                          onClick={() => setCourseToDelete({ id: course.id, title: course.title })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer inline-flex items-center"
                          title="Delete draft"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200/80 space-y-3 shadow-xs">
          <p className="text-sm font-semibold text-slate-800">No courses created yet.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Get started by creating your first course, setting its curriculum, and submitting it for review.
          </p>
          <div className="pt-2">
            <Link to="/instructor/courses/new">
              <Button variant="primary" size="sm">
                Create Course
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Styled Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={() => {
          if (courseToDelete) deleteMutation.mutate(courseToDelete.id);
        }}
        title="Delete Draft Course"
        message={`Are you sure you want to delete the draft course "${courseToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Course"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
