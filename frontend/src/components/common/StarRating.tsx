import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  totalReviews?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showText?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalReviews,
  size = 'md',
  interactive = false,
  onRatingChange,
  showText = true,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  }[size];

  const current = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = current >= star;
          const isHalf = !isFilled && current >= star - 0.5;

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange?.(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-0.5 focus:outline-none`}
            >
              <Star
                className={`${starSizes} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : isHalf
                    ? 'text-amber-400 fill-amber-200'
                    : 'text-slate-200 fill-slate-100'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showText && (
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
          <span>{rating > 0 ? rating.toFixed(1) : 'New'}</span>
          {typeof totalReviews === 'number' && (
            <span className="text-slate-400 font-normal">({totalReviews})</span>
          )}
        </span>
      )}
    </div>
  );
};

