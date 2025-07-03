'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { fetchTests } from '@/lib/actions/testActions';
import { Test } from '@/types/testTypes';
import { TestTable } from '@/components/molecules/test/TestTable';
import { PageHeader } from '@/components/molecules/PageHeader';

export function TestManagementTemplate() {
  const [tests, setTests] = useState<Test[]>([]);
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

    useEffect(() => {
    const getTests = async () => {
      try {
        const data = await fetchTests(jobId);
        setTests(data);
      } catch {
        setTests([]);
      }
    };
    
    if (jobId) {
      getTests();
    }
  }, [jobId]);

  const handleDeleteTest = async (testId: string) => {
  try {
    if (!confirm('Are you sure you want to delete this test?')) {
      return;
    }

    console.log('Deleting test:', testId, 'for job:', jobId);
    const response = await fetch(`/api/jobs/${jobId}/test/${testId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    console.log('Delete response:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete test');
    }
    
    toast.success('Test deleted successfully');
    
    const updatedTests = await fetchTests(jobId);
    setTests(updatedTests);
  } catch (error) {
    console.error('Error deleting test:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to delete test');
  }
};

return (
  <div className="container mx-auto py-6 space-y-6 max-w-3xl mt-16">
    <PageHeader
      title="Test Management"
      action={
        tests.length > 0 ? (
          <Button onClick={() => router.push(`/jobs/${jobId}/test/create-test`)}>
            Create Test
          </Button>
        ) : null
      }
    />
    {tests.length === 0 ? (
      <div className="bg-gray-50 border rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Tests Available</h3>
        <p className="text-gray-600 mb-4">There are no pre-selection tests created for this job posting yet.</p>
        <Button onClick={() => router.push(`/jobs/${jobId}/test/create-test`)}>
          Create Your First Test
        </Button>
      </div>
    ) : (
      <TestTable 
        tests={tests} 
        jobId={jobId}
        onDelete={handleDeleteTest} 
      />
    )}
  </div>
);
}