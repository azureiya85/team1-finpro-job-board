'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingInputProps {
  count?: number;
  value: number;
  onChange: (value: number) => void;
  size?: number;
  className?: string;
}

export default function StarRatingInput({
  count = 5,
  value,
  onChange,
  size = 24,
  className,
}: StarRatingInputProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: count }, (_, i) => {
        const ratingValue = i + 1;
        return (
          <label key={ratingValue} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              className="sr-only"
              value={ratingValue}
              onClick={() => onChange(ratingValue)}
            />
            <Star
              style={{ width: `${size}px`, height: `${size}px` }}
              className="transition-colors duration-150"
              color={ratingValue <= (hover || value) ? '#FBBF24' : '#D1D5DB'}
              fill={ratingValue <= (hover || value) ? '#FBBF24' : 'none'}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
            />
          </label>
        );
      })}
    </div>
  );
}