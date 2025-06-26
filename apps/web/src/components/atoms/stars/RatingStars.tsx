import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  totalStars?: number;
  size?: number; // <-- ADDED: a prop to control the star size in pixels
  className?: string;
  starClassName?: string;
}

export default function RatingStars({
  rating,
  totalStars = 5,
  size, // <-- ADDED: destructure the new prop
  className = 'flex',
  starClassName = 'w-4 h-4',
}: RatingStarsProps) {
  // <-- ADDED: create a style object if size is provided
  const starStyle = size ? { width: `${size}px`, height: `${size}px` } : {};

  return (
    <div className={className} aria-label={`Rating: ${rating} out of ${totalStars} stars`}>
      {Array.from({ length: totalStars }, (_, i) => {
        const isFilled = i < Math.round(rating); // Using Math.round for half-star potential
        return (
          <Star
            key={i}
            style={starStyle} // <-- ADDED: apply the inline style
            className={`${starClassName} ${
              isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        );
      })}
    </div>
  );
}