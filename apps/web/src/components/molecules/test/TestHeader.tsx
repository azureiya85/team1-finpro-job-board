'use client'

import { TestTimer } from '@/components/atoms/test/TestTimer';
import { TestProgressBar } from '@/components/atoms/test/TestProgressBar';
import { Card } from '@/components/ui/card';

interface TestHeaderProps {
  title: string;
  timeLeft: number;
  answeredCount: number;
  totalQuestions: number;
  onTimeUp: () => void;
}

export function TestHeader({
  title,
  timeLeft,
  answeredCount,
  totalQuestions,
  onTimeUp
}: TestHeaderProps) {
  return (
    <Card className="sticky top-0 z-10 bg-white">
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <div className="flex justify-between items-center">
          <TestTimer 
            timeLeft={timeLeft} 
            isWarning={timeLeft < 300}
            onTimeUp={onTimeUp}
          />
          <div className="text-sm text-gray-500">
            {answeredCount}/{totalQuestions} pertanyaan dijawab
          </div>
        </div>
        <TestProgressBar 
          value={answeredCount} 
          total={totalQuestions} 
        />
      </div>
    </Card>
  );
}