'use client';

import { useParams, useRouter } from 'next/navigation';
import { TestCreationForm } from '@/components/organisms/test/TestCreationForm';
import { TestQuestionList } from '@/components/organisms/test/TestQuestionList';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateTestData } from '@/types/testTypes';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

interface CreateTestTemplateProps {
  mode?: 'create' | 'edit';
  initialData?: CreateTestData;
  testId?: string;
}

export function CreateTestTemplate({ mode = 'create', initialData, testId }: CreateTestTemplateProps) {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [test, setTest] = useState<CreateTestData | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      if (mode === 'edit' && testId) {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/jobs/${jobId}/test/${testId}`);
          if (!response.ok) throw new Error('Failed to fetch test');
          const data = await response.json();
          const formattedData = {
            ...data,
            questions: data.questions.map((q: any) => ({
              ...q,
              createdAt: new Date(q.createdAt),
              updatedAt: new Date(q.updatedAt)
            }))
          };
          setTest(formattedData);
        } catch (error) {
          toast.error('Failed to fetch test data');
          router.push(`/jobs/${jobId}/test`);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTest();
  }, [mode, testId, jobId, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (data: CreateTestData) => {
    try {
      const url = mode === 'edit' ? `/api/jobs/${jobId}/test/${testId}` : `/api/jobs/${jobId}/test`;
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${mode} test`);
      }

      toast.success(`Test has been ${mode === 'edit' ? 'updated' : 'created'} successfully`);
      
      const result = await response.json();
      const companyId = result.companyId;

      router.push(`/jobs/${jobId}/test`);
      
    } catch (error) {
      console.error(`Error ${mode}ing test:`, error);
      toast.error(`Failed to ${mode} test. Please try again.`);
    }
  };

   return (
    <div className="max-w-3xl mx-auto py-6 space-y-6 px-4 mt-16">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">{mode === 'edit' ? 'Edit' : 'Create'} Test</h1>
        <p className="text-gray-500">
          {mode === 'edit' ? 'Edit existing' : 'Create a new'} test by adding questions and setting the time limit.
        </p>
      </Card>

      <TestCreationForm onSubmit={handleSubmit} initialData={test} />
    </div>
  );
}