import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { courseService } from '../services/courseService';
import { instructorService } from '../services/instructorService';

export const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [level, setLevel] = useState<string>('Beginner');
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [isFree, setIsFree] = useState<boolean>(true);
  const [whatYouWillLearn, setWhatYouWillLearn] = useState('');
  const [requirements, setRequirements] = useState('');
  const [whoIsThisFor, setWhoIsThisFor] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => courseService.getCategories(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const newCourse = await instructorService.createCourse({
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

      // Upload thumbnail if provided
      if (thumbnailFile && newCourse.id) {
        try {
          await instructorService.uploadThumbnail(newCourse.id, thumbnailFile);
        } catch {
          // ignore thumbnail upload warning
        }
      }

      // Redirect directly to Curriculum Editor
      navigate(`/instructor/courses/${newCourse.id}/curriculum`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create course. Please verify fields.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          to="/instructor/courses"
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create a New Course</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Step 1: Set up course metadata, pricing, and learning objectives
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
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
            placeholder="e.g. Advanced Microservices in .NET 10"
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
          <label className="block text-xs font-bold text-slate-700 mb-1">Short Description (Subtitle)</label>
          <input
            type="text"
            required
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="High-performance scalable architecture for distributed enterprise systems."
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
            placeholder="Detailed course overview, tools, and background..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Pricing Options */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isFreeCheck"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
            />
            <label htmlFor="isFreeCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
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

        {/* Learning Objectives */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            What You Will Learn (one objective per line)
          </label>
          <textarea
            rows={3}
            value={whatYouWillLearn}
            onChange={(e) => setWhatYouWillLearn(e.target.value)}
            placeholder="• Clean Architecture design patterns&#10;• EF Core 10 Fluent API&#10;• Enterprise Security and JWT"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Course Thumbnail Image</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            {thumbnailFile && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Selected
              </span>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <Link
            to="/instructor/courses"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Course...' : 'Create & Proceed to Curriculum →'}
          </button>
        </div>
      </form>
    </div>
  );
};

