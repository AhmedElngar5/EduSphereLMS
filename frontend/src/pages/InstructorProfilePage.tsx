import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, BookOpen, Star, Award, ShieldCheck, Mail } from 'lucide-react';
import { courseService } from '../services/courseService';
import { CourseCard } from '../components/common/CourseCard';
import { CourseCardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';

export const InstructorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['instructorCourses', id],
    queryFn: () => (id ? courseService.getInstructorCourses(id) : []),
    enabled: !!id,
  });

  const instructorName = courses[0]?.instructorName || 'Expert Faculty';
  const instructorTitle = courses[0]?.instructorTitle || 'EduSphere Certified Instructor';
  const instructorPictureUrl = courses[0]?.instructorPictureUrl;

  const totalStudents = courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
  const totalReviews = courses.reduce((acc, c) => acc + (c.totalReviews || 0), 0);
  const avgRating =
    courses.length > 0
      ? (courses.reduce((acc, c) => acc + (c.averageRating || 0), 0) / courses.length).toFixed(1)
      : '5.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Instructor Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center gap-8">
        {instructorPictureUrl ? (
          <img
            src={instructorPictureUrl}
            alt={instructorName}
            className="w-28 h-28 rounded-full object-cover shadow-md"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-black text-3xl flex items-center justify-center shadow-md">
            {instructorName[0]}
          </div>
        )}

        <div className="space-y-3 flex-1">
          <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Certified Instructor
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{instructorName}</h1>
          <p className="text-sm font-semibold text-slate-600">{instructorTitle}</p>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Passionate software engineer and educator dedicated to Clean Architecture, enterprise distributed systems, and real-world developer mentorship.
          </p>

          <div className="pt-2 flex flex-wrap gap-6 text-xs text-slate-700">
            <div>
              <span className="font-bold text-slate-900 text-sm block">{courses.length}</span>
              <span className="text-slate-500">Courses Published</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm block">{totalStudents}</span>
              <span className="text-slate-500">Total Students</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm block">{avgRating} ★</span>
              <span className="text-slate-500">{totalReviews} Reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructor's Courses Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Courses by {instructorName}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="book"
            title="No published courses"
            description="This instructor has not published any courses yet."
          />
        )}
      </div>
    </div>
  );
};

