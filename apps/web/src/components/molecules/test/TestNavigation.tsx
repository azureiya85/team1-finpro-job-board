'use client'

import { Button } from '@/components/ui/button';

interface TestNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number[];
  onNavigate: (questionNumber: number) => void;
}

export function TestNavigation({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
  onNavigate
}: TestNavigationProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg border">
      {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((number) => (
        <Button
          key={number}
          variant={currentQuestion === number ? "default" : "outline"}
          className={`w-10 h-10 ${answeredQuestions.includes(number) ? "bg-green-100" : ""}`}
          onClick={() => onNavigate(number)}
        >
          {number}
        </Button>
      ))}
    </div>
  );
}