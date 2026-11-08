import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Award,
  Play,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Star,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/studentService';
import { certificateService } from '../services/certificateService';
import { courseService } from '../services/courseService';
import { CourseCardSkeleton } from '../components/common/Skeleton';
import { EnrollmentStatusBadge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/common/Button';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: enrollments = [], isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ['myEnrollments'],
    queryFn: () => studentService.getMyEnrollments(),
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['myCertificates'],
    queryFn: () => certificateService.getMyCertificates(),
  });

  const { data: recommendedCoursesResult } = useQuery({
    queryKey: ['recommendedCourses'],
    queryFn: () => courseService.getCourses({ pageSize: 6 }),
  });

  const activeCourses = enrollments.filter((e) => e.progressPercentage < 100);
  const completedCourses = enrollments.filter((e) => e.progressPercentage >= 100);

  // Pick the most recently accessed course or first in-progress course
  const continueCourse = activeCourses[0] || enrollments[0];

  // Exclude courses the student is already enrolled in
  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
  const recommendedCourses = (recommendedCoursesResult?.items || [])
    .filter((c) => !enrolledCourseIds.has(c.id))
    .slice(0, 3);

  // Total completed lessons across all enrolled courses
  const totalLessonsDone = enrollments.reduce((acc, e) => acc + (e.completedLessons || 0), 0);
  const totalLessonsAll = enrollments.reduce((acc, e) => acc + (e.totalLessons || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-100 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" /> Student Learning Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-normal">
            Pick up right where you left off. Complete your modules to earn verifiable engineering certifications.
          </p>
        </div>
      </div>

      {/* Metrics Row using Standard StatCard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled"
          value={enrollments.length}
          icon={BookOpen}
          color="indigo"
          subtitle="Courses enrolled"
        />
        <StatCard
          title="In Progress"
          value={activeCourses.length}
          icon={TrendingUp}
          color="sky"
          subtitle="Active curriculums"
        />
        <StatCard
          title="Completed"
          value={completedCourses.length}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Finished courses"
        />
        <StatCard
          title="Certificates"
          value={certificates.length}
          icon={Award}
          color="amber"
          subtitle="Credentials earned"
        />
      </div>

      {/* Continue Learning Spotlight */}
      {continueCourse && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Continue Learning
            </span>
            <span className="text-xs font-bold text-indigo-600">
              {continueCourse.progressPercentage}% Completed
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">{continueCourse.courseTitle}</h3>
              <p className="text-xs text-slate-500">
                Instructor: <span className="font-semibold text-slate-700">{continueCourse.instructorName}</span>
                {continueCourse.nextLessonTitle && (
                  <> &bull; Next: <span className="font-medium text-slate-800">{continueCourse.nextLessonTitle}</span></>
                )}
              </p>
            </div>

            <Link to={`/student/learn/${continueCourse.courseId}`}>
              <Button variant="primary" size="md" leftIcon={<Play className="w-4 h-4 fill-white" />}>
                Resume Lesson
              </Button>
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${continueCourse.progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Learning Activity Summary */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Overall Course Progress</h4>
            <p className="text-xs text-slate-500">
              {totalLessonsDone} of {totalLessonsAll} total lessons completed across all your enrollments
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-36 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{
                width: `${totalLessonsAll > 0 ? (totalLessonsDone / totalLessonsAll) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700 shrink-0">
            {totalLessonsAll > 0 ? Math.round((totalLessonsDone / totalLessonsAll) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Enrolled Courses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Enrolled Courses</h2>
          <Link
            to="/student/my-courses"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
          >
            View All ({enrollments.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isEnrollmentsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : enrollments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {item.categoryName || 'General'}
                    </span>
                    <EnrollmentStatusBadge status={item.status} />
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                    {item.courseTitle}
                  </h3>

                  <p className="text-xs text-slate-500">By {item.instructorName}</p>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Progress</span>
                      <span>{item.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${item.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {item.completedLessons} / {item.totalLessons} lessons
                  </span>
                  <Link to={`/student/learn/${item.courseId}`}>
                    <Button variant="primary" size="sm">
                      Go to Class
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">You haven't enrolled in any courses yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Browse our course catalog to find free starter programs or comprehensive enterprise masterclasses.
            </p>
            <div className="pt-2">
              <Link to="/courses">
                <Button variant="primary" size="sm">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Courses Section */}
      {recommendedCourses.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Recommended for You</h2>
              <p className="text-xs text-slate-500">Curated courses to expand your skill set</p>
            </div>
            <Link
              to="/courses"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              Explore All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {c.categoryName}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {c.isFree ? 'Free' : `$${c.price.toFixed(2)}`}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{c.shortDescription}</p>

                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {c.averageRating > 0 ? c.averageRating.toFixed(1) : 'New'}
                    </span>
                    <span>&bull;</span>
                    <span>{c.enrolledCount} students</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">By {c.instructorName}</span>
                  <Link to={`/courses/${c.slug}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
