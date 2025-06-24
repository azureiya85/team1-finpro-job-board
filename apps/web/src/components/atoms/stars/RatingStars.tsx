 
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  totalStars?: number;
  className?: string;
  starClassName?: string;
}

export default function RatingStars({
  rating,
  totalStars = 5,
  className = 'flex',
  starClassName = 'w-4 h-4',
}: RatingStarsProps) {
  return (
    <div className={className} aria-label={`Rating: ${rating} out of ${totalStars} stars`}>
      {Array.from({ length: totalStars }, (_, i) => {
        const isFilled = i < Math.floor(rating);
        return (
          <Star
            key={i}
            className={`${starClassName} ${
              isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        );
      })}
    </div>
  );
}