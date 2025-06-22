'use client'

import { Card } from '@/components/ui/card';

interface TestResultsProps {
  score: number;
  totalQuestions: number;
  answers: Record<string, string>;
  questions: {
    id: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
  }[];
  timeSpent: number;
  passingScore: number;
}

export function TestResults({
  score,
  totalQuestions,
  answers,
  questions,
  timeSpent,
  passingScore
}: TestResultsProps) {
  const percentScore = score;
  const isPassed = percentScore >= passingScore;
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className={`text-4xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
            {percentScore.toFixed(0)}%
          </div>
          <div className="text-xl font-medium">
            {isPassed ? 'Congratulations! You Passed' : 'Sorry, You Did Not Pass'}
          </div>
          <div className="text-gray-500">
            Time taken: {formatTime(timeSpent)}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {questions.map((question, index) => {
          const userAnswer = answers[question.id];
          const isCorrect = userAnswer === question.correctAnswer;

          return (
            <Card key={question.id} className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">Question {index + 1}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                </div>

                <p className="text-gray-700">{question.question}</p>

                <div className="grid grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    const optionValue = `option${option}`;
                    const isUserAnswer = userAnswer === optionValue;
                    const isCorrectAnswer = question.correctAnswer === optionValue;

                    return (
                      <div
                        key={option}
                        className={`p-3 rounded-md ${isCorrectAnswer ? 'bg-green-50 border border-green-200' : isUserAnswer && !isCorrectAnswer ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}
                      >
                        <span className="font-medium">Option {option}:</span>
                        <span className="ml-2">{question[optionValue as keyof typeof question]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}