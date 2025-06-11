'use client'

import { cn } from '@/lib/utils';

interface TestProgressBarProps {
  value: number;
  total: number;
  className?: string;
}

export function TestProgressBar({ value, total, className }: TestProgressBarProps) {
  const percentage = Math.round((value / total) * 100);
  
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{value} dari {total} selesai</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}