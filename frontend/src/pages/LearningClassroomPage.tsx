import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Download,
  Award,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { studentService } from '../services/studentService';
import { certificateService } from '../services/certificateService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { Button } from '../components/common/Button';

export const LearningClassroomPage: React.FC = () => {
  const { courseId: routeCourseId } = useParams<{ courseId: string }>();
  const courseId = Number(routeCourseId);
  const queryClient = useQueryClient();
  const toast = useToast();

  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'resources'>('overview');
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [claimedCert, setClaimedCert] = useState<any>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSyncTimeRef = useRef<number>(0);

  // 1. Fetch course learning progress & sections
  const { data: progress, isLoading: isProgressLoading } = useQuery({
    queryKey: ['learningProgress', courseId],
    queryFn: () => studentService.getCourseProgress(courseId),
    enabled: !!courseId,
  });

  // Pick initial lesson from continueLearning or first lesson
  useEffect(() => {
    if (!activeLessonId && progress?.sections) {
      studentService
        .getContinueLearning(courseId)
        .then((res) => {
          if (res?.lessonId) {
            setActiveLessonId(res.lessonId);
          } else {
            const firstLesson = progress.sections[0]?.lessons[0];
            if (firstLesson) setActiveLessonId(firstLesson.id);
          }
        })
        .catch(() => {
          const firstLesson = progress.sections[0]?.lessons[0];
          if (firstLesson) setActiveLessonId(firstLesson.id);
        });
    }
  }, [courseId, progress, activeLessonId]);

  // 2. Fetch active lesson details
  const { data: lesson, isLoading: isLessonLoading } = useQuery({
    queryKey: ['learningLesson', courseId, activeLessonId],
    queryFn: () => (activeLessonId ? studentService.getLearningLesson(courseId, activeLessonId) : null),
    enabled: !!courseId && !!activeLessonId,
  });

  // Complete lesson mutation
  const completeMutation = useMutation({
    mutationFn: (lessonId: number) => studentService.completeLesson(lessonId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['learningProgress', courseId] });
      queryClient.invalidateQueries({ queryKey: ['learningLesson', courseId, activeLessonId] });
      queryClient.invalidateQueries({ queryKey: ['myEnrollments'] });
      toast.success('Lesson marked as completed!');

      // Check if all lessons are now complete
      if (data?.allCompleted || data?.courseProgressPercentage >= 100) {
        setIsCompletionModalOpen(true);
      } else if (lesson?.nextLessonId) {
        setActiveLessonId(lesson.nextLessonId);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to complete lesson.');
    },
  });

  // Sync video position periodically (every 10 seconds of playback difference)
  const handleTimeUpdate = () => {
    if (!videoRef.current || !activeLessonId) return;
    const currentTime = Math.floor(videoRef.current.currentTime);
    if (Math.abs(currentTime - lastSyncTimeRef.current) >= 10) {
      lastSyncTimeRef.current = currentTime;
      studentService.updateProgress(activeLessonId, currentTime).catch(() => {});
    }
  };

  const handleVideoEnded = () => {
    if (activeLessonId) {
      completeMutation.mutate(activeLessonId);
    }
  };

  // Restore watched position when video loads
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current && lesson?.watchedDurationSeconds && lesson.watchedDurationSeconds > 0) {
      videoRef.current.currentTime = lesson.watchedDurationSeconds;
    }
  };

  const handleClaimCertificate = async () => {
    setIsClaiming(true);
    try {
      const cert = await certificateService.claimCertificate(courseId);
      setClaimedCert(cert);
      queryClient.invalidateQueries({ queryKey: ['myCertificates'] });
      toast.success('Official Certificate generated successfully!');
    } catch {
      toast.warning('Certificate already claimed or course is not 100% complete.');
    } finally {
      setIsClaiming(false);
    }
  };

  if (isProgressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <LoadingSpinner size="lg" message="Entering EduSphere Classroom..." />
      </div>
    );
  }

  const isCourseComplete = (progress?.progressPercentage || 0) >= 100;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased">
      {/* Top Classroom Bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/student/my-courses"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Back to my courses"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-md">
              {progress?.courseTitle || 'Learning Classroom'}
            </h1>
            {lesson && (
              <p className="text-[11px] text-slate-400 truncate">
                {lesson.sectionTitle} &bull; {lesson.title}
              </p>
            )}
          </div>
        </div>

        {/* Progress & Certificate Button */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Progress:</span>
            <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress?.progressPercentage || 0}%` }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-400">
              {progress?.progressPercentage || 0}%
            </span>
          </div>

          {isCourseComplete && (
            <button
              type="button"
              onClick={() => setIsCompletionModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Certificate</span>
            </button>
          )}
        </div>
      </header>

      {/* Classroom Workspace Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Player & Content Column */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
          {/* Video Player Box */}
          <div className="aspect-video w-full bg-black flex items-center justify-center relative">
            {isLessonLoading ? (
              <LoadingSpinner size="md" message="Loading lesson stream..." />
            ) : lesson ? (
              lesson.type === 'Video' ? (
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleVideoEnded}
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  className="w-full h-full object-contain"
                  src={studentService.getVideoStreamUrl(lesson.id)}
                >
                  Your browser does not support HTML5 video streaming.
                </video>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <FileText className="w-16 h-16 text-indigo-400 mx-auto" />
                  <h3 className="text-lg font-bold text-white">{lesson.title}</h3>
                  <p className="text-xs text-slate-400">Reading &amp; Article Module</p>
                </div>
              )
            ) : (
              <div className="text-slate-400 text-sm">Select a lesson to begin</div>
            )}
          </div>

          {/* Lesson Action Controls */}
          {lesson && (
            <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">{lesson.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{lesson.sectionTitle}</p>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!lesson.previousLessonId}
                  onClick={() => lesson.previousLessonId && setActiveLessonId(lesson.previousLessonId)}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                  className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                >
                  Previous
                </Button>

                <Button
                  variant={lesson.isCompleted ? 'secondary' : 'primary'}
                  size="sm"
                  isLoading={completeMutation.isPending}
                  onClick={() => completeMutation.mutate(lesson.id)}
                  leftIcon={<CheckCircle2 className={`w-4 h-4 ${lesson.isCompleted ? 'text-emerald-500' : 'text-white'}`} />}
                  className={
                    lesson.isCompleted
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }
                >
                  {lesson.isCompleted ? 'Completed' : 'Mark Complete'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!lesson.nextLessonId}
                  onClick={() => lesson.nextLessonId && setActiveLessonId(lesson.nextLessonId)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Lesson Details Tabs */}
          <div className="p-6 space-y-4 max-w-4xl">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview &amp; Notes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('resources')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'resources'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Downloadable Resources ({lesson?.resources?.length || 0})
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-3 text-sm text-slate-300 leading-relaxed font-normal">
                <p>{lesson?.description || 'No additional description provided for this lesson.'}</p>
                {lesson?.contentHtml && (
                  <div
                    className="prose prose-invert max-w-none pt-4 text-xs"
                    dangerouslySetInnerHTML={{ __html: lesson.contentHtml }}
                  />
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-2">
                {lesson?.resources && lesson.resources.length > 0 ? (
                  lesson.resources.map((res) => (
                    <div
                      key={res.id}
                      className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span className="font-semibold text-slate-200">{res.title}</span>
                      </div>
                      {res.externalUrl ? (
                        <a
                          href={res.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-400 hover:underline"
                        >
                          External Link <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <a
                          href={studentService.getResourceDownloadUrl(res.id)}
                          download
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No resources attached to this lesson.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Syllabus Sidebar */}
        <aside className="w-full lg:w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto max-h-[50vh] lg:max-h-none">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Course Content</h3>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {progress?.completedLessons || 0} / {progress?.totalLessons || 0} completed
            </p>
          </div>

          <div className="divide-y divide-slate-800">
            {progress?.sections?.map((sec, sIdx) => (
              <div key={sec.id}>
                <div className="px-4 py-2.5 bg-slate-950/60 font-semibold text-xs text-slate-300">
                  Section {sIdx + 1}: {sec.title}
                </div>

                <div className="divide-y divide-slate-850">
                  {sec.lessons.map((l) => {
                    const isActive = l.id === activeLessonId;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setActiveLessonId(l.id)}
                        className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-indigo-900/40 border-l-2 border-indigo-500'
                            : 'hover:bg-slate-850 text-slate-300'
                        }`}
                      >
                        {l.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0 mt-0.5" />
                        )}

                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                            {l.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                            <span>{l.type}</span>
                            {l.durationSeconds && (
                              <span>&bull; {Math.floor(l.durationSeconds / 60)} min</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Course Completion & Certificate Modal */}
      <Modal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        title="Congratulations! Course Completed!"
        maxWidth="md"
      >
        <div className="text-center space-y-4 py-3">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center animate-bounce">
            <Award className="w-10 h-10" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            You've Mastered {progress?.courseTitle}!
          </h3>

          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            You have successfully completed 100% of the lessons. Your official tamper-evident credential is ready to claim.
          </p>

          {claimedCert ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left space-y-2 text-xs">
              <span className="font-bold text-emerald-800">Certificate Issued:</span>
              <p className="font-mono text-slate-900 font-bold">{claimedCert.certificateNumber}</p>
              <div className="pt-2 flex gap-2">
                <a
                  href={certificateService.getDownloadUrl(claimedCert.certificateNumber)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="primary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                    Download PDF
                  </Button>
                </a>
                <Link to="/student/certificates">
                  <Button variant="secondary" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isClaiming}
              onClick={handleClaimCertificate}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
            >
              {isClaiming ? 'Generating Official Certificate...' : 'Claim Official Certificate Now'}
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
};
