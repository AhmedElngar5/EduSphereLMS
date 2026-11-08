import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  BookOpen,
  Award,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Briefcase,
  PlayCircle,
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { CourseCard } from '../components/common/CourseCard';
import { CourseCardSkeleton } from '../components/common/Skeleton';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: coursesData, isLoading: isCoursesLoading } = useQuery({
    queryKey: ['featuredCourses'],
    queryFn: () => courseService.getCourses({ pageSize: 6 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => courseService.getCategories(),
  });

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const courses = coursesData?.items || [];
  const categories = categoriesData || [];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Modern .NET 10 &amp; React Enterprise LMS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Learn Without Limits, Built with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">Clean Architecture</span>.
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Gain mastery in high-demand software engineering, cloud systems, and architectural patterns. Certified credentials, hands-on curriculum, and industry mentorship.
          </p>

          {/* Hero Search Box */}
          <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto relative flex items-center">
            <input
              type="text"
              placeholder="What do you want to learn today? (e.g. Microservices, .NET 10, Python...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-32 py-4 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-medium shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all"
            />
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <button
              type="submit"
              className="absolute right-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-md cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Quick Metrics */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-slate-800/80">
            <div>
              <p className="text-3xl font-black text-white">{coursesData?.totalCount || '7'}+</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Published Courses</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">100%</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Verified Certificates</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">4.9</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Average Student Rating</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">24/7</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Instant On-Demand Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Top Categories
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Explore specialized career tracks and in-demand skills
              </p>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Browse All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/courses?categoryId=${cat.id}`}
                className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all duration-200 text-center flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {cat.courseCount} {cat.courseCount === 1 ? 'Course' : 'Courses'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Handpicked Curriculum
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured &amp; Popular Courses
            </h2>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isCoursesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
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
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No courses published yet</h3>
            <p className="text-sm text-slate-500 mt-1">Check back shortly or explore our upcoming programs.</p>
          </div>
        )}
      </section>

      {/* Value Propositions / Why EduSphere */}
      <section className="bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Why Learn with EduSphere LMS?
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Designed from first principles to provide deep architectural clarity, real enterprise skills, and authenticated credentialing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <PlayCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Resumable Video Learning</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Stream secure partial videos with auto-synced playback positions. Pause on your desktop and resume seamlessly on your tablet.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Cryptographically Verified Certificates</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Receive verifiable PDF diplomas with unique identification numbers. Employers can instantly verify your credentials via our public registry.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Architectural Rigor</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Experience an LMS built on .NET 10 Clean Architecture and EF Core 10, engineered with strict data integrity and decoupled domains.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 sm:p-14 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full">
              Join Our Expert Faculty
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Share Your Knowledge. Empower the Next Generation of Engineers.
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              Publish structured courses, manage video lectures, engage with students globally, and earn revenue with our instructor revenue-sharing model.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition-colors shadow-md"
              >
                Become an Instructor
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-sm border border-indigo-400/40 transition-colors"
              >
                Instructor Studio Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
