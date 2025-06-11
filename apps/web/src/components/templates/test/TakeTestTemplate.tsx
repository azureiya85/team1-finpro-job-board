import { TestTaking } from '@/components/organisms/test/TestTaking';
import { Card } from '@/components/ui/card';

interface TakeTestTemplateProps {
  testTitle: string;
  testDescription: string;
  questions: {
    id: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
  }[];
  timeLimit: number;
  onSubmit: (answers: Record<string, string>) => void;
}

export function TakeTestTemplate({
  testTitle,
  testDescription,
  questions,
  timeLimit,
  onSubmit
}: TakeTestTemplateProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-2">{testTitle}</h1>
        <p className="text-gray-500 mb-4">{testDescription}</p>
        <div className="text-sm text-gray-500">
          <span className="font-medium">Time Limit:</span> {timeLimit} minutes
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-medium">Total Questions:</span> {questions.length}
        </div>
      </Card>

      <TestTaking
        questions={questions}
        timeLimit={timeLimit}
        onSubmit={onSubmit}
      />
    </div>
  );
}