'use client';

import { useParams, useRouter } from 'next/navigation';
import { TestCreationForm } from '@/components/organisms/test/TestCreationForm';
import { TestQuestionList } from '@/components/organisms/test/TestQuestionList';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateTestData } from '@/types/testTypes';
import { toast } from 'sonner';

export function CreateTestTemplate() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const handleSubmit = async (data: CreateTestData) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create test');
      }

      toast.success('Test has been created successfully');
      
      const result = await response.json();
      const companyId = result.companyId;

      router.push(`/companies/${companyId}`);
      
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error('Failed to create test. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6 px-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Create Test</h1>
        <p className="text-gray-500">
          Create a new test by adding questions and setting the time limit. You can preview and manage existing questions in the Questions tab.
        </p>
      </Card>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">Create Test</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <TestCreationForm onSubmit={handleSubmit} />
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <TestQuestionList
            questions={[]}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}