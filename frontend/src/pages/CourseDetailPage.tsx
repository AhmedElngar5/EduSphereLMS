import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  Play,
  Heart,
  Share2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  Star,
  Lock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { studentService } from '../services/studentService';
import { wishlistService } from '../services/wishlistService';
import { reviewService } from '../services/reviewService';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import { StarRating } from '../components/common/StarRating';
import { CourseLevelBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState<'review' | 'processing' | 'success' | 'failed'>('review');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Review submission state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Query course by slug or ID
  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['courseDetail', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Course slug required');
      const isNumeric = /^\d+$/.test(slug);
      if (isNumeric) {
        return await courseService.getCourseById(Number(slug));
      }
      return await courseService.getCourseBySlug(slug);
    },
  });

  // Query enrollment status
  const { data: enrollmentStatus } = useQuery({
    queryKey: ['enrollmentStatus', course?.id],
    queryFn: () => (course ? studentService.getEnrollmentStatus(course.id) : null),
    enabled: !!course && isAuthenticated,
  });

  // Query wishlist status
  const { data: wishlistStatus } = useQuery({
    queryKey: ['wishlistStatus', course?.id],
    queryFn: () => (course ? wishlistService.checkWishlist(course.id) : null),
    enabled: !!course && isAuthenticated,
  });

  // Query course reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['courseReviews', course?.id],
    queryFn: () => (course ? reviewService.getCourseReviews(course.id) : []),
    enabled: !!course,
  });

  // Free enrollment mutation
  const enrollFreeMutation = useMutation({
    mutationFn: (courseId: number) => studentService.enrollInCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollmentStatus', course?.id] });
      queryClient.invalidateQueries({ queryKey: ['myEnrollments'] });
      navigate(`/student/learn/${course?.id}`);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to enroll in free course.');
    },
  });

  // Initiate paid checkout mutation
  const handleInitiateCheckout = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!course) return;

    try {
      setCheckoutStep('review');
      setIsCheckoutModalOpen(true);
      const res = await paymentService.checkout(course.id);
      setCheckoutData(res);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to initialize checkout.');
    }
  };

  const handleSimulatePayment = async (success: boolean) => {
    if (!checkoutData?.paymentId) return;
    setCheckoutStep('processing');
    try {
      if (success) {
        await paymentService.simulateSuccess(checkoutData.paymentId);
        setCheckoutStep('success');
        queryClient.invalidateQueries({ queryKey: ['enrollmentStatus', course?.id] });
        queryClient.invalidateQueries({ queryKey: ['myEnrollments'] });
      } else {
        await paymentService.simulateFailure(checkoutData.paymentId, 'Card declined by issuing bank (Simulated)');
        setCheckoutStep('failed');
      }
    } catch (err: any) {
      setCheckoutStep('failed');
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!course) return;

    try {
      if (wishlistStatus?.inWishlist) {
        await wishlistService.removeFromWishlist(course.id);
      } else {
        await wishlistService.addToWishlist(course.id);
      }
      queryClient.invalidateQueries({ queryKey: ['wishlistStatus', course.id] });
    } catch {
      // ignore
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    setIsSubmittingReview(true);
    try {
      await reviewService.addReview(course.id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setIsReviewModalOpen(false);
      setReviewComment('');
      queryClient.invalidateQueries({ queryKey: ['courseReviews', course.id] });
      queryClient.invalidateQueries({ queryKey: ['courseDetail', slug] });
      toast.success('Your review has been submitted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === undefined ? false : !prev[sectionId],
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading course curriculum & details..." />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <EmptyState
          icon="alert"
          title="Course not found"
          description="The requested course does not exist or has not yet been published."
          actionLabel="Back to Catalog"
          onAction={() => navigate('/courses')}
        />
      </div>
    );
  }

  const isEnrolled = enrollmentStatus?.isEnrolled;
  const isFree = course.isFree || course.price === 0;

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return 'Self-paced';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs} hr ${mins > 0 ? `${mins} min` : ''}`;
    return `${mins} min`;
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Course Banner Header */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {course.categoryName}
              </span>
              <CourseLevelBadge level={course.level} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-300 text-base leading-relaxed">
              {course.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-1.5">
                <StarRating rating={course.averageRating} totalReviews={course.totalReviews} size="sm" />
              </div>
              <span>&bull;</span>
              <span>{course.enrolledCount} students enrolled</span>
              <span>&bull;</span>
              <div className="flex items-center gap-1">
                <span>Created by</span>
                <Link
                  to={`/instructors/${course.instructorId}`}
                  className="font-semibold text-indigo-400 hover:underline"
                >
                  {course.instructorName}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar Checkout Card Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-10">
            {/* What you'll learn */}
            {course.whatYouWillLearn && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" /> What You Will Learn
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                  {course.whatYouWillLearn.split('\n').filter(Boolean).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item.replace(/^[•\-\*]\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Course Description</h3>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {course.description}
              </div>
            </div>

            {/* Curriculum Accordion */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Course Curriculum</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {course.sections?.length || 0} sections &bull; {course.totalLessons} lessons &bull;{' '}
                    {formatDuration(course.totalDurationSeconds)}
                  </p>
                </div>
              </div>

              {course.sections && course.sections.length > 0 ? (
                <div className="space-y-3">
                  {course.sections.map((section, sIdx) => {
                    const isExpanded = expandedSections[section.id] !== false; // expanded by default
                    return (
                      <div
                        key={section.id}
                        className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => toggleSection(section.id)}
                          className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                            <span className="font-bold text-sm text-slate-800">
                              Section {sIdx + 1}: {section.title}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            {section.lessons?.length || 0} lessons
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="divide-y divide-slate-100 bg-white">
                            {section.lessons?.map((lesson, lIdx) => (
                              <div
                                key={lesson.id}
                                className="px-4 py-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <Play className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="text-slate-700 font-medium">
                                    {sIdx + 1}.{lIdx + 1} {lesson.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  {lesson.isPreviewFree ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPreviewVideoUrl(
                                          lesson.videoUrl || 'preview-simulated'
                                        );
                                      }}
                                      className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                                    >
                                      Free Preview
                                    </button>
                                  ) : !isEnrolled ? (
                                    <Lock className="w-3.5 h-3.5 text-slate-300" />
                                  ) : null}

                                  <span className="text-slate-400">
                                    {formatDuration(lesson.durationSeconds)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Curriculum is being prepared.</p>
              )}
            </div>

            {/* Instructor Bio */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Your Instructor</h3>
              <div className="flex items-start gap-4">
                {course.instructorPictureUrl ? (
                  <img
                    src={course.instructorPictureUrl}
                    alt={course.instructorName}
                    className="w-16 h-16 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold text-xl flex items-center justify-center shrink-0">
                    {course.instructorName[0]}
                  </div>
                )}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-base">{course.instructorName}</h4>
                  <p className="text-xs text-indigo-600 font-semibold">{course.instructorTitle || 'Course Instructor'}</p>
                  <p className="text-xs text-slate-500 pt-2 leading-relaxed">
                    Senior engineering practitioner dedicated to high-quality code architecture and student success.
                  </p>
                </div>
              </div>
            </div>

            {/* Student Reviews & Ratings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Student Reviews</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={course.averageRating} totalReviews={course.totalReviews} size="md" />
                  </div>
                </div>

                {isEnrolled && (
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Write a Review
                  </button>
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4 divide-y divide-slate-100">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                            {rev.studentName?.[0] || 'S'}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800">{rev.studentName}</span>
                            <p className="text-[10px] text-slate-400">
                              {new Date(rev.createdAtUtc).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <StarRating rating={rev.rating} size="sm" showText={false} />
                      </div>
                      {rev.comment && (
                        <p className="text-xs text-slate-600 leading-relaxed pl-9">
                          {rev.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No reviews yet. Be the first enrolled student to review this course!</p>
              )}
            </div>
          </div>

          {/* Floating Sticky Sidebar / Card */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl p-6 space-y-6">
              {/* Thumbnail / Preview Player Trigger */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 group">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl.startsWith('/') ? course.thumbnailUrl : `/uploads/${course.thumbnailUrl}`}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-700 to-purple-800 flex items-center justify-center text-white/90">
                    <span className="font-black text-2xl tracking-tight opacity-75">EduSphere</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewVideoUrl('preview-default')}
                  className="absolute inset-0 bg-slate-950/40 flex items-center justify-center text-white group-hover:bg-slate-950/50 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-0.5" />
                  </div>
                </button>
              </div>

              {/* Price */}
              <div>
                {isFree ? (
                  <div className="text-3xl font-black text-emerald-600">Free</div>
                ) : (
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      ${course.discountPrice ? course.discountPrice.toFixed(2) : course.price.toFixed(2)}
                    </span>
                    {course.discountPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        ${course.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Call to Actions */}
              <div className="space-y-3">
                {isEnrolled ? (
                  <Link
                    to={`/student/learn/${course.id}`}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Continue Learning</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : isFree ? (
                  <button
                    type="button"
                    onClick={() => enrollFreeMutation.mutate(course.id)}
                    disabled={enrollFreeMutation.isPending}
                    className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center text-sm shadow-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {enrollFreeMutation.isPending ? 'Enrolling...' : 'Enroll in Course (Free)'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleInitiateCheckout}
                    className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center text-sm shadow-md transition-colors cursor-pointer"
                  >
                    Buy Course Now
                  </button>
                )}

                {/* Wishlist toggle */}
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    wishlistStatus?.inWishlist
                      ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlistStatus?.inWishlist ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span>{wishlistStatus?.inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>
              </div>

              {/* Guarantee Perks */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>30-Day Money-Back Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Verifiable Certificate of Completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Full Lifetime On-Demand Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Free Video Preview Modal */}
      <Modal
        isOpen={!!previewVideoUrl}
        onClose={() => setPreviewVideoUrl(null)}
        title={`Preview: ${course.title}`}
        maxWidth="2xl"
      >
        <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center text-white">
          <div className="text-center p-6 space-y-3">
            <Play className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
            <p className="text-sm font-semibold">EduSphere Secure Video Player</p>
            <p className="text-xs text-slate-400">
              Sample preview stream powered by ASP.NET Core Partial Content (Range: bytes=0-...)
            </p>
          </div>
        </div>
      </Modal>

      {/* Write Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Rate & Review Course"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Your Rating</label>
            <StarRating
              rating={reviewRating}
              interactive={true}
              onRatingChange={(r) => setReviewRating(r)}
              size="lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Written Review</label>
            <textarea
              rows={4}
              required
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="What did you like or learn from this course? Be specific..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Mock Payment Checkout Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Course Checkout & Payment"
        maxWidth="md"
      >
        <div className="space-y-5 text-sm">
          {checkoutStep === 'review' && (
            <>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs text-slate-500">Course item</p>
                <h4 className="font-bold text-slate-900">{course.title}</h4>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-xs font-semibold text-slate-600">Total Price</span>
                  <span className="text-lg font-bold text-indigo-600">
                    ${checkoutData ? checkoutData.totalAmount.toFixed(2) : course.price.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <span className="font-bold">Development Mock Gateway:</span> No real credit card is charged. You can simulate a successful or failed payment to test complete order fulfillment.
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSimulatePayment(true)}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Simulate Success
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatePayment(false)}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Simulate Decline
                </button>
              </div>
            </>
          )}

          {checkoutStep === 'processing' && (
            <div className="py-8 text-center space-y-3">
              <LoadingSpinner size="md" message="Processing simulated transaction..." />
            </div>
          )}

          {checkoutStep === 'success' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Payment Successful!</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your order has been confirmed and course access has been activated in your student dashboard.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsCheckoutModalOpen(false);
                  navigate(`/student/learn/${course.id}`);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                Start Learning Now
              </button>
            </div>
          )}

          {checkoutStep === 'failed' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Payment Declined</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                The simulated transaction was rejected. You can retry the checkout anytime.
              </p>
              <button
                type="button"
                onClick={() => setCheckoutStep('review')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
