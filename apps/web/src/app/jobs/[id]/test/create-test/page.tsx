'use client';

import { useParams, useRouter } from 'next/navigation';
import { CreateTestTemplate } from '@/components/templates/test/CreateTestTemplate';
import { toast } from 'sonner';
import { CreateTestData } from '@/types/testTypes';

export default function CreateTestPage() {
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

  return <CreateTestTemplate jobId={jobId} onSubmit={handleSubmit} />;
}