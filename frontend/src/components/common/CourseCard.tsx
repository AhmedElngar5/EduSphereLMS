import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Clock, BookOpen, User } from 'lucide-react';
import { CourseSummary } from '../../types';
import { StarRating } from './StarRating';
import { CourseLevelBadge } from './Badge';
import { wishlistService } from '../../services/wishlistService';
import { useAuth } from '../../context/AuthContext';

interface CourseCardProps {
  course: CourseSummary;
  initiallyWishlisted?: boolean;
  onWishlistChange?: (courseId: number, isWishlisted: boolean) => void;
  className?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  initiallyWishlisted = false,
  onWishlistChange,
  className = '',
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState<boolean>(initiallyWishlisted);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState<boolean>(false);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (isTogglingWishlist) return;

    try {
      setIsTogglingWishlist(true);
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(course.id);
        setIsWishlisted(false);
        onWishlistChange?.(course.id, false);
      } else {
        await wishlistService.addToWishlist(course.id);
        setIsWishlisted(true);
        onWishlistChange?.(course.id, true);
      }
    } catch {
      // rollback or ignore
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const courseLink = `/courses/${course.slug || course.id}`;

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return 'Self-paced';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`;
    return `${mins}m`;
  };

  return (
    <div
      className={`group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      <div className="relative">
        <Link to={courseLink} className="block overflow-hidden aspect-video bg-slate-100">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl.startsWith('/') ? course.thumbnailUrl : `/uploads/${course.thumbnailUrl}`}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback to placeholder gradient
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center text-white/90 p-4">
              <span className="font-extrabold text-2xl tracking-tight opacity-75">EduSphere</span>
            </div>
          )}
        </Link>

        {/* Wishlist button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={isTogglingWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              : 'bg-white/90 text-slate-600 hover:text-rose-600 hover:bg-white'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>

        {/* Category Badge overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span className="text-[11px] font-semibold tracking-wide bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full">
            {course.categoryName || 'General'}
          </span>
        </div>
      </div>

      {/* Course Info */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-2">
          <CourseLevelBadge level={course.level} />
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDuration(course.totalDurationSeconds)}</span>
          </div>
        </div>

        <Link to={courseLink} className="group-hover:text-indigo-600 transition-colors">
          <h3 className="font-bold text-slate-900 line-clamp-2 leading-snug tracking-tight text-base mb-1.5">
            {course.title}
          </h3>
        </Link>

        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
          {course.shortDescription}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2 mt-auto pt-2 text-xs text-slate-600">
          {course.instructorPictureUrl ? (
            <img
              src={course.instructorPictureUrl}
              alt={course.instructorName}
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <User className="w-3 h-3" />
            </div>
          )}
          <span className="truncate font-medium">{course.instructorName || 'Instructor'}</span>
        </div>

        {/* Rating & Lessons */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <StarRating rating={course.averageRating} totalReviews={course.totalReviews} size="sm" />
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>{course.totalLessons} {course.totalLessons === 1 ? 'lesson' : 'lessons'}</span>
          </div>
        </div>
      </div>

      {/* Footer / Price & Enrollment CTA */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        <div>
          {course.isFree || course.price === 0 ? (
            <span className="text-base font-bold text-emerald-600 tracking-tight">Free</span>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                ${course.discountPrice ? course.discountPrice.toFixed(2) : course.price.toFixed(2)}
              </span>
              {course.discountPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ${course.price.toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>

        <Link
          to={courseLink}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
        >
          View Course
        </Link>
      </div>
    </div>
  );
};

