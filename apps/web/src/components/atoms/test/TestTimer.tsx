'use client'

import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TestTimerProps {
  timeLeft: number; // dalam detik
  isWarning: boolean;
  onTimeUp?: () => void;
}

export function TestTimer({ timeLeft, isWarning, onTimeUp }: TestTimerProps) {
  useEffect(() => {
    if (timeLeft === 0 && onTimeUp) {
      onTimeUp();
    }
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={cn(
      "text-lg font-semibold px-4 py-2 rounded-md",
      isWarning ? "text-red-600 bg-red-50" : "text-gray-700 bg-gray-50"
    )}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}