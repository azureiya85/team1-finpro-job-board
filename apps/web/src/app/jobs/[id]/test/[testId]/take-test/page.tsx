'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TestLandingTemplate } from '@/components/templates/test/TestLandingTemplate';
import { Test } from '@/types/testTypes';

export default function TakeTestPage() {
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
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
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    if (test?.questions && test.questions.length > 0) {
      const firstQuestion = test.questions[0];
      router.push(`/jobs/${jobId}/test/${testId}/take-test/${firstQuestion.id}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!test) return <div>Test not found</div>;

  return test ? (
    <TestLandingTemplate
      testTitle={test.title}
      testDescription={test.description}
      timeLimit={test.timeLimit}
      totalQuestions={test.questions.length}
      passingScore={test.passingScore}
      onStartTest={handleStartTest}
    />
  ) : null;
}