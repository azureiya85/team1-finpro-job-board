import { TestResults } from '@/components/organisms/test/TestResults';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

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
}

export function TestResultTemplate({
  testTitle,
  score,
  totalQuestions,
  answers,
  questions,
  timeSpent,
  passingScore,
}: TestResultTemplateProps) {

  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <div className="container mx-auto py-6 space-y-6 mt-16 max-w-3xl">
      <Card className="p-6">
        <h1 className="text-xl font-bold mb-2">{testTitle} - Results</h1>
        <p className="text-gray-500 text-sm">
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

      <div className="flex justify-center">
        <Button variant="outline" onClick={handleBack}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}