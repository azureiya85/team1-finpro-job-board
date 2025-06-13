'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Test } from '@/types/testTypes';

interface TestDetailTemplateProps {
  test: Test;
}

export function TestDetailTemplate({ test }: TestDetailTemplateProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{test.title}</h1>
        <Button onClick={() => router.back()}>Back</Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium">Description</h2>
            <p className="text-gray-600">{test.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Time Limit</h3>
              <p>{test.timeLimit} minutes</p>
            </div>
            <div>
              <h3 className="font-medium">Passing Score</h3>
              <p>{test.passingScore}%</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Questions</h2>
        {test.questions.map((question, index) => (
          <Card key={question.id} className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Question {index + 1}</h3>
                <p className="text-gray-800">{question.question}</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-medium">A:</span> {question.optionA}</p>
                <p><span className="font-medium">B:</span> {question.optionB}</p>
                <p><span className="font-medium">C:</span> {question.optionC}</p>
                <p><span className="font-medium">D:</span> {question.optionD}</p>
              </div>
              <div>
                <p className="text-green-600">
                  <span className="font-medium">Correct Answer:</span> Option {question.correctAnswer}
                </p>
                {question.explanation && (
                  <p className="text-gray-600 mt-2">
                    <span className="font-medium">Explanation:</span> {question.explanation}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}