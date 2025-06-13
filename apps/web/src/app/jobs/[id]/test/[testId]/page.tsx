'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TestDetailTemplate } from '@/components/templates/test/TestDetailTemplate';
import { Test } from '@/types/testTypes';

export default function TestDetailPage() {
  const [test, setTest] = useState<Test | null>(null);
  const params = useParams();
  const testId = params.testId as string;
  const jobId = params.id as string;

  useEffect(() => {
    fetchTestDetail();
  }, [testId, jobId]);

  const fetchTestDetail = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/test/${testId}`);
      if (!response.ok) throw new Error('Failed to fetch test details');
      const data = await response.json();
      setTest(data);
    } catch (error) {
      console.error('Error fetching test details:', error);
    }
  };

  if (!test) return <div>Loading...</div>;

  return <TestDetailTemplate test={test} />;
}