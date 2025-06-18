import { TestTaking } from '@/components/organisms/test/TestTaking';
import { Card } from '@/components/ui/card';
import { Question } from '@/types/testTypes';

type TakeQuestionData = Pick<Question, 'id' | 'question' | 'optionA' | 'optionB' | 'optionC' | 'optionD' | 'correctAnswer'>;

interface TakeTestTemplateProps {
  testTitle: string;
  testDescription: string | null;
  questions: TakeQuestionData[];
  timeLimit: number;
  passingScore: number
  testId: string;
  onSubmit: (answers: Record<string, string>) => Promise<void>;
}

export function TakeTestTemplate({
  testTitle,
  testDescription,
  questions,
  timeLimit,
  passingScore,
  testId,
  onSubmit
}: TakeTestTemplateProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-2">{testTitle}</h1>
        <p className="text-gray-500 mb-4">{testDescription || ''}</p>
        <div className="text-sm text-gray-500">
          <span className="font-medium">Time Limit:</span> {timeLimit} minutes
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-medium">Total Questions:</span> {questions.length}
        </div>
      </Card>

      <TestTaking
        questions={questions as unknown as Question[]}
        timeLimit={timeLimit}
        passingScore={passingScore}
        testId={testId}
        onSubmit={onSubmit}
      />
    </div>
  );
}