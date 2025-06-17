'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TestLandingTemplateProps {
  testTitle: string;
  testDescription: string | null;
  timeLimit: number;
  totalQuestions: number;
  passingScore: number;
  onStartTest: () => void;
}

export function TestLandingTemplate({
  testTitle,
  testDescription,
  timeLimit,
  totalQuestions,
  passingScore,
  onStartTest
}: TestLandingTemplateProps) {
  return (
    <div className="container mx-auto py-6 min-h-[80vh] flex items-center justify-center mt-16">
      <div className="max-w-2xl w-full space-y-6">
        <Card className="p-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">{testTitle}</h1>
            {testDescription && (
              <p className="text-muted-foreground">{testDescription}</p>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">Time Limit</p>
                <p className="text-2xl font-bold mt-1">{timeLimit} minutes</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">Total Questions</p>
                <p className="text-2xl font-bold mt-1">{totalQuestions}</p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">Minimum Passing Score</p>
              <p className="text-2xl font-bold mt-1">{passingScore}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              <p className="font-medium">Important!</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Make sure your internet connection is stable</li>
                <li>Do not leave or refresh the page during the test</li>
                <li>Timer will start once you begin the test</li>
                <li>Answers will be automatically submitted when time runs out</li>
              </ul>
            </div>

            <Button 
              onClick={onStartTest}
              className="w-full py-6 text-lg"
              variant="default"
            >
              Start Test
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}