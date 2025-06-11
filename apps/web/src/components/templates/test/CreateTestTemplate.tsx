import { TestCreationForm } from '@/components/organisms/test/TestCreationForm';
import { TestQuestionList } from '@/components/organisms/test/TestQuestionList';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CreateTestTemplateProps {
  onSubmit: (data: {
    title: string;
    description: string;
    timeLimit: number;
    questions: {
      id: string;
      question: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctAnswer: string;
    }[];
  }) => void;
  existingQuestions?: {
    id: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
  }[];
  onEditQuestion?: (questionId: string) => void;
  onDeleteQuestion?: (questionId: string) => void;
}

export function CreateTestTemplate({
  onSubmit,
  existingQuestions = [],
  onEditQuestion,
  onDeleteQuestion
}: CreateTestTemplateProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Create Test</h1>
        <p className="text-gray-500">
          Create a new test by adding questions and setting the time limit. You can preview and manage existing questions in the Questions tab.
        </p>
      </Card>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">Create Test</TabsTrigger>
          <TabsTrigger value="questions">Questions ({existingQuestions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <TestCreationForm onSubmit={onSubmit} />
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <TestQuestionList
            questions={existingQuestions}
            onEdit={onEditQuestion}
            onDelete={onDeleteQuestion}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}