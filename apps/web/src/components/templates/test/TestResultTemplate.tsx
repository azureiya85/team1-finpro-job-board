import { TestResults } from '@/components/organisms/test/TestResults';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TestResultTemplateProps {
  testTitle: string;
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
  onRetake?: () => void;
  onBack: () => void;
}

export function TestResultTemplate({
  testTitle,
  score,
  totalQuestions,
  answers,
  questions,
  timeSpent,
  passingScore,
  onRetake,
  onBack
}: TestResultTemplateProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-2">{testTitle} - Results</h1>
        <p className="text-gray-500">
          Review your test results and check the correct answers below.
        </p>
      </Card>

      <TestResults
        score={score}
        totalQuestions={totalQuestions}
        answers={answers}
        questions={questions}
        timeSpent={timeSpent}
        passingScore={passingScore}
      />

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Dashboard
        </Button>
        {onRetake && (
          <Button onClick={onRetake}>
            Retake Test
          </Button>
        )}
      </div>
    </div>
  );
}