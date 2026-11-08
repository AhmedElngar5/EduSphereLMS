import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  PlusCircle,
  FileText,
  Trash2,
  Video,
  FileCode,
} from 'lucide-react';
import { instructorService } from '../services/instructorService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast } from '../components/common/Toast';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';

export const CurriculumEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const queryClient = useQueryClient();
  const toast = useToast();

  // Section Modal State
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);

  // Lesson Modal State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState('Video');
  const [isPreviewFree, setIsPreviewFree] = useState(false);
  const [lessonDuration, setLessonDuration] = useState<number>(300);
  const [isAddingLesson, setIsAddingLesson] = useState(false);

  // Video Upload Modal State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [targetLessonId, setTargetLessonId] = useState<number | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(600);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // Resource Upload Modal State
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceType, setResourceType] = useState<number>(1); // 1 = Document
  const [resourceExternalUrl, setResourceExternalUrl] = useState('');
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [isAddingResource, setIsAddingResource] = useState(false);

  // Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'section' | 'lesson';
    id: number;
    title?: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    type: 'section',
    id: 0,
    title: '',
    isDeleting: false,
  });

  const { data: course, isLoading } = useQuery({
    queryKey: ['instructorCourse', courseId],
    queryFn: () => instructorService.getCourse(courseId),
    enabled: !!courseId,
  });

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) return;
    setIsAddingSection(true);
    try {
      const order = (course?.sections?.length || 0) + 1;
      await instructorService.createSection(courseId, {
        title: sectionTitle.trim(),
        displayOrder: order,
      });
      setIsSectionModalOpen(false);
      setSectionTitle('');
      queryClient.invalidateQueries({ queryKey: ['instructorCourse', courseId] });
      toast.success('Curriculum section added successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add section.');
    } finally {
      setIsAddingSection(false);
    }
  };

  const confirmDeleteAction = async () => {
    setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));
    try {
      if (deleteConfirm.type === 'section') {
        await instructorService.deleteSection(deleteConfirm.id);
        toast.success('Section deleted successfully.');
      } else {
        await instructorService.deleteLesson(deleteConfirm.id);
        toast.success('Lesson deleted successfully.');
      }
      queryClient.invalidateQueries({ queryKey: ['instructorCourse', courseId] });
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to delete ${deleteConfirm.type}.`);
    } finally {
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSectionId || !lessonTitle.trim()) return;
    setIsAddingLesson(true);
    try {
      await instructorService.createLesson(targetSectionId, {
        title: lessonTitle.trim(),
        type: lessonType,
        isPreviewFree,
        durationSeconds: Number(lessonDuration),
        displayOrder: 1,
      });
      setIsLessonModalOpen(false);
      setLessonTitle('');
      queryClient.invalidateQueries({ queryKey: ['instructorCourse', courseId] });
      toast.success('Lesson created successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add lesson.');
    } finally {
      setIsAddingLesson(false);
    }
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLessonId || !videoFile) return;
    setIsUploadingVideo(true);
    try {
      await instructorService.uploadLessonVideo(targetLessonId, videoFile, Number(videoDuration));
      setIsVideoModalOpen(false);
      setVideoFile(null);
      queryClient.invalidateQueries({ queryKey: ['instructorCourse', courseId] });
      toast.success('Lesson video uploaded and encoded!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload video.');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLessonId || !resourceTitle.trim()) return;
    setIsAddingResource(true);
    try {
      await instructorService.uploadLessonResource(
        targetLessonId,
        courseId,
        resourceTitle.trim(),
        resourceType,
        resourceExternalUrl || undefined,
        resourceFile || undefined
      );
      setIsResourceModalOpen(false);
      setResourceTitle('');
      setResourceExternalUrl('');
      setResourceFile(null);
      queryClient.invalidateQueries({ queryKey: ['instructorCourse', courseId] });
      toast.success('Downloadable resource attached successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to attach resource.');
    } finally {
      setIsAddingResource(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" message="Loading curriculum layout..." />
      </div>
    );
  }

  const sections = course?.sections || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/instructor/courses"
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Curriculum Editor</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Course: <span className="font-semibold text-slate-800">{course?.title}</span>
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setIsSectionModalOpen(true)}
        >
          Add Section
        </Button>
      </div>

      {/* Sections & Lessons Structure */}
      {sections.length > 0 ? (
        <div className="space-y-6">
          {sections.map((section, sIdx) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs space-y-4 p-6"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100">
                    {sIdx + 1}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{section.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setTargetSectionId(section.id);
                      setIsLessonModalOpen(true);
                    }}
                  >
                    Add Lesson
                  </Button>

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteConfirm({
                        isOpen: true,
                        type: 'section',
                        id: section.id,
                        title: section.title,
                        isDeleting: false,
                      })
                    }
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lessons inside section */}
              {section.lessons && section.lessons.length > 0 ? (
                <div className="space-y-2.5">
                  {section.lessons.map((lesson, lIdx) => (
                    <div
                      key={lesson.id}
                      className="p-3.5 bg-slate-50/75 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-500 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {lIdx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{lesson.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="font-semibold text-indigo-600">{lesson.type}</span>
                            <span>&bull;</span>
                            <span>
                              {lesson.durationSeconds
                                ? `${Math.floor(lesson.durationSeconds / 60)} min`
                                : 'Duration not set'}
                            </span>
                            {lesson.isPreviewFree && (
                              <>
                                <span>&bull;</span>
                                <span className="text-emerald-600 font-bold">Free Preview</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Lesson Tools */}
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        {/* Video upload badge/button */}
                        {lesson.type === 'Video' && (
                          <button
                            type="button"
                            onClick={() => {
                              setTargetLessonId(lesson.id);
                              setIsVideoModalOpen(true);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                              lesson.videoUrl
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            }`}
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>{lesson.videoUrl ? 'Video Ready' : 'Upload Video'}</span>
                          </button>
                        )}

                        {/* Attach resource button */}
                        <button
                          type="button"
                          onClick={() => {
                            setTargetLessonId(lesson.id);
                            setIsResourceModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                          <span>Resource</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm({
                              isOpen: true,
                              type: 'lesson',
                              id: lesson.id,
                              title: lesson.title,
                              isDeleting: false,
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete lesson"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                  No lessons added to this section yet. Click "Add Lesson" above.
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4 shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Your curriculum is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Organize your course by adding curriculum sections (e.g. "Module 1: Getting Started") and then adding video lectures.
          </p>
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setIsSectionModalOpen(true)}
          >
            Create First Section
          </Button>
        </div>
      )}

      {/* Add Section Modal */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title="Add Curriculum Section"
        maxWidth="md"
      >
        <form onSubmit={handleAddSection} className="space-y-4">
          <Input
            label="Section Title"
            required
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            placeholder="e.g. Architecture Overview & Core Principles"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSectionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isAddingSection}
            >
              Add Section
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        title="Add New Lesson"
        maxWidth="md"
      >
        <form onSubmit={handleAddLesson} className="space-y-4">
          <Input
            label="Lesson Title"
            required
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="e.g. Setting Up the Domain Aggregate Root"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Lesson Type"
              value={lessonType}
              onChange={(e) => setLessonType(e.target.value)}
            >
              <option value="Video">Video Lecture</option>
              <option value="Article">Reading / Article</option>
            </Select>

            <Input
              label="Duration (seconds)"
              type="number"
              min="0"
              value={lessonDuration}
              onChange={(e) => setLessonDuration(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="freePrevCheck"
              checked={isPreviewFree}
              onChange={(e) => setIsPreviewFree(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
            />
            <label htmlFor="freePrevCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Allow Free Preview (Students can watch without enrolling)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLessonModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isAddingLesson}
            >
              Create Lesson
            </Button>
          </div>
        </form>
      </Modal>

      {/* Upload Video Modal */}
      <Modal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        title="Upload Lesson Video"
        maxWidth="md"
      >
        <form onSubmit={handleUploadVideo} className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Video File (MP4, WebM)</label>
            <input
              type="file"
              required
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          <Input
            label="Estimated Duration (Seconds)"
            type="number"
            min="10"
            value={videoDuration}
            onChange={(e) => setVideoDuration(Number(e.target.value))}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVideoModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!videoFile}
              isLoading={isUploadingVideo}
            >
              Upload Video
            </Button>
          </div>
        </form>
      </Modal>

      {/* Attach Resource Modal */}
      <Modal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        title="Attach Downloadable Resource"
        maxWidth="md"
      >
        <form onSubmit={handleAddResource} className="space-y-4">
          <Input
            label="Resource Title"
            required
            value={resourceTitle}
            onChange={(e) => setResourceTitle(e.target.value)}
            placeholder="e.g. Solution Source Code (ZIP) or Architecture PDF"
          />

          <Select
            label="Resource Type"
            value={resourceType}
            onChange={(e) => setResourceType(Number(e.target.value))}
          >
            <option value={1}>Document / PDF</option>
            <option value={2}>Source Code Repository</option>
            <option value={3}>Hands-on Exercise</option>
            <option value={4}>External Documentation Link</option>
          </Select>

          {resourceType === 4 ? (
            <Input
              label="External URL"
              type="url"
              required
              value={resourceExternalUrl}
              onChange={(e) => setResourceExternalUrl(e.target.value)}
              placeholder="https://github.com/..."
            />
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">File Attachment</label>
              <input
                type="file"
                onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResourceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isAddingResource}
            >
              Attach Resource
            </Button>
          </div>
        </form>
      </Modal>

      {/* Styled Confirmation Modal (Replaces native window.confirm) */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDeleteAction}
        title={`Delete ${deleteConfirm.type === 'section' ? 'Curriculum Section' : 'Lesson'}`}
        message={
          deleteConfirm.type === 'section'
            ? `Are you sure you want to delete "${deleteConfirm.title || 'this section'}" and all of its enclosed lessons? This action cannot be undone.`
            : `Are you sure you want to delete the lesson "${deleteConfirm.title || 'this lesson'}"?`
        }
        confirmText={`Delete ${deleteConfirm.type === 'section' ? 'Section' : 'Lesson'}`}
        variant="danger"
        isLoading={deleteConfirm.isDeleting}
      />
    </div>
  );
};
