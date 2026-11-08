import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Trash2, BookOpen, ArrowRight } from 'lucide-react';
import { wishlistService } from '../services/wishlistService';
import { StarRating } from '../components/common/StarRating';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const WishlistPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.getWishlist(),
  });

  const removeMutation = useMutation({
    mutationFn: (courseId: number) => wishlistService.removeFromWishlist(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved in Wishlist</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Courses you've bookmarked to enroll in later
        </p>
      </div>

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Loading your wishlist..." />
        </div>
      ) : wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {item.categoryName || 'General'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMutation.mutate(item.courseId)}
                    disabled={removeMutation.isPending}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  to={`/courses/${item.slug || item.courseId}`}
                  className="font-bold text-slate-900 text-sm line-clamp-2 hover:text-indigo-600 transition-colors"
                >
                  {item.title}
                </Link>

                <p className="text-xs text-slate-500">Instructor: {item.instructorName}</p>

                <div className="pt-2">
                  <StarRating rating={item.averageRating} totalReviews={item.totalReviews} size="sm" />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {item.isFree || item.price === 0 ? (
                    <span className="text-sm font-bold text-emerald-600">Free</span>
                  ) : (
                    <span className="text-sm font-bold text-slate-900">
                      ${item.discountPrice ? item.discountPrice.toFixed(2) : item.price.toFixed(2)}
                    </span>
                  )}
                </div>

                <Link
                  to={`/courses/${item.slug || item.courseId}`}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="folder"
          title="Your wishlist is empty"
          description="Explore our course catalog and save courses to your wishlist for quick access later."
          actionLabel="Explore Courses"
          onAction={() => (window.location.href = '/courses')}
        />
      )}
    </div>
  );
};

