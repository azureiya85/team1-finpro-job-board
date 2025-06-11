'use client'

import { cn } from '@/lib/utils';

interface TestScoreProps {
  score: number;
  passingScore: number;
  className?: string;
}

export function TestScore({ score, passingScore, className }: TestScoreProps) {
  const isPassed = score >= passingScore;
  
  return (
    <div className={cn("text-center p-4 rounded-lg", className)}>
      <div className="text-4xl font-bold mb-2">
        <span className={cn(
          isPassed ? "text-green-600" : "text-red-600"
        )}>
          {score}
        </span>
        <span className="text-gray-400 text-2xl">/100</span>
      </div>
      <div className={cn(
        "text-sm font-medium",
        isPassed ? "text-green-600" : "text-red-600"
      )}>
        {isPassed ? "Passed" : "Not Passed"}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Minimum score: {passingScore}
      </div>
    </div>
  );
}