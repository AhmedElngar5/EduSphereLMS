import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, AlertCircle, Save, Send } from 'lucide-react';
import { courseService } from '../services/courseService';
import { instructorService } from '../services/instructorService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CourseStatusBadge } from '../components/common/Badge';
import { useToast } from '../components/common/Toast';

export const EditCoursePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [level, setLevel] = useState<string>('Beginner');
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [isFree, setIsFree] = useState<boolean>(false);
  const [whatYouWillLearn, setWhatYouWillLearn] = useState('');
  const [requirements, setRequirements] = useState('');
  const [whoIsThisFor, setWhoIsThisFor] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ['instructorCourse', courseId],
    queryFn: () => instructorService.getCourse(courseId),
    enabled: !!courseId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => courseService.getCategories(),
  });

  useEffect(() => {
    if (course) {
      setTitle(course.title || '');
      setShortDescription(course.shortDescription || '');
      setDescription(course.description || '');
      setCategoryId(course.categoryId || 1);
      setLevel(course.level || 'Beginner');
      setPrice(course.price || 0);
      setDiscountPrice(course.discountPrice || undefined);
      setIsFree(course.isFree || course.price === 0);
      setWhatYouWillLearn(course.whatYouWillLearn || '');
      setRequirements(course.requirements || '');
      setWhoIsThisFor(course.whoIsThisFor || '');
    }
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      await instructorService.updateCourse(courseId, {
        title,
        shortDescription,
        description,
        categoryId: Number(categoryId),
        level,
        price: isFree ? 0 : Number(price),
        discountPrice: isFree || !discountPrice ? undefined : Number(discountPrice),
        isFree,
        whatYouWillLearn,
        requirements,
        whoIsThisFor,
      });

      if (thumbnailFile) {
        await instructorService.uploadThumbnail(courseId, thumbnailFile);
      }

      setSuccessMsg('Course details updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['instructorCourse', courseId] });
      queryClient.invalidateQueries({ queryKey: ['instructorCourses'] });
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      await instructorService.submitForApproval(courseId);
      toast.success('Course submitted for administrator review!');
      queryClient.invalidateQueries({ queryKey: ['instructorCourse', courseId] });
      queryClient.invalidateQueries({ queryKey: ['instructorCourses'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit course for approval.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" message="Loading course configuration..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/instructor/courses"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Course</h1>
              {course && <CourseStatusBadge status={course.status} />}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Modify course parameters, curriculum, or pricing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/instructor/courses/${courseId}/curriculum`}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
          >
            Curriculum Editor
          </Link>

          {(course?.status === 'Draft' || course?.status === 'Rejected') && (
            <button
              type="button"
              onClick={handleSubmitForApproval}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Submit for Approval
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Course Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="AllLevels">All Levels</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Short Description</label>
          <input
            type="text"
            required
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Full Description</label>
          <textarea
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Pricing Options */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isFreeEditCheck"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
            />
            <label htmlFor="isFreeEditCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
              This is a Free Course (Open Enrollment)
            </label>
          </div>

          {!isFree && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Price (USD $)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required={!isFree}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Discount Price (USD $)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountPrice || ''}
                  onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">What You Will Learn</label>
          <textarea
            rows={3}
            value={whatYouWillLearn}
            onChange={(e) => setWhatYouWillLearn(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 focus:outline-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Update Course Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

