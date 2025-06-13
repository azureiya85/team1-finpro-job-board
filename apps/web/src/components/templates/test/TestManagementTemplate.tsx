'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
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
        console.log('Fetching tests for job:', jobId);
        const data = await fetchTests(jobId);
        console.log('Received tests:', data);
        setTests(data);
      } catch (error) {
        console.error('Error in getTests:', error);
      }
    };
    
    if (jobId) {
      getTests();
    }
  }, [jobId]);

  const handleDeleteTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/test/${testId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete test');
      const data = await fetchTests(jobId);
      setTests(data);
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  return (
    <div className="container mx-auto py-20 px-4 space-y-6 max-w-7xl">
      <PageHeader 
        title="Test Management"
        action={<Button onClick={() => router.push(`/jobs/${jobId}/test/create-test`)}>Create New Test</Button>}
      />
      <TestTable 
        tests={tests}
        jobId={jobId}
        onDelete={handleDeleteTest}
      />
    </div>
  );
}