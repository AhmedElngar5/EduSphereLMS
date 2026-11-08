import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle } from 'lucide-react';
import { adminService } from '../services/adminService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { Button } from '../components/common/Button';
import { Textarea } from '../components/common/Textarea';

export const PendingApprovalsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectCourseId, setRejectCourseId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const { data: pendingResult, isLoading } = useQuery({
    queryKey: ['adminPendingCourses'],
    queryFn: () => adminService.getPendingCourses(1, 50),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminService.approveCourse(id),
    onSuccess: () => {
      toast.success('Course approved and published to the catalog!');
      queryClient.invalidateQueries({ queryKey: ['adminPendingCourses'] });
      queryClient.invalidateQueries({ queryKey: ['adminAllCourses'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to approve course.');
    },
  });

  const handleOpenReject = (courseId: number) => {
    setRejectCourseId(courseId);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectCourseId || !rejectReason.trim()) return;

    setIsSubmittingReject(true);
    try {
      await adminService.rejectCourse(rejectCourseId, rejectReason.trim());
      setRejectModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['adminPendingCourses'] });
      queryClient.invalidateQueries({ queryKey: ['adminAllCourses'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      toast.success('Course submission rejected and instructor notified.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject course.');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const courses = pendingResult?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pending Course Approvals</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review curriculum quality, syllabus completeness, and authorize publishing
        </p>
      </div>

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Scanning pending submissions..." />
        </div>
      ) : courses.length > 0 ? (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Pending Review
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{course.categoryName}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{course.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">{course.shortDescription}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Instructor: <strong className="text-slate-700">{course.instructorName}</strong></span>
                  <span>&bull;</span>
                  <span>Price: <strong className="text-slate-700">{course.isFree ? 'Free' : `$${course.price.toFixed(2)}`}</strong></span>
                  <span>&bull;</span>
                  <span>Lessons: <strong className="text-slate-700">{course.totalLessons}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                <Button
                  variant="primary"
                  size="md"
                  isLoading={approveMutation.isPending}
                  onClick={() => approveMutation.mutate(course.id)}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Approve &amp; Publish
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleOpenReject(course.id)}
                  leftIcon={<XCircle className="w-4 h-4 text-rose-600" />}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50"
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="inbox"
          title="Queue is completely clear"
          description="There are currently no courses waiting for administrative review."
        />
      )}

      {/* Reject Course Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Course Submission"
        maxWidth="md"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Provide a clear, actionable reason explaining why this course is being rejected. This feedback will be displayed directly to the instructor.
          </p>

          <Textarea
            label="Rejection Feedback / Reason"
            rows={4}
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Please add detailed video lectures for Section 2, and ensure prerequisites are specified."
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isSubmittingReject}
            >
              Reject Course
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
