'use client'

import { TestScore } from '@/components/atoms/test/TestScore';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface TestResultCardProps {
  score: number;
  passingScore: number;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
  testTitle: string;
}

export function TestResultCard({
  score,
  passingScore,
  timeSpent,
  correctAnswers,
  totalQuestions,
  testTitle
}: TestResultCardProps) {
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-xl font-semibold text-center">{testTitle}</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        <TestScore 
          score={score} 
          passingScore={passingScore} 
        />
        <div className="space-y-2 text-center">
          <div className="text-sm text-gray-500">
            Jawaban Benar: {correctAnswers} dari {totalQuestions}
          </div>
          <div className="text-sm text-gray-500">
            Waktu Pengerjaan: {minutes} menit {seconds} detik
          </div>
        </div>
      </CardContent>
    </Card>
  );
}