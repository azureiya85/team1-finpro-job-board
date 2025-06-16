'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TakeTestTemplate } from '@/components/templates/test/TakeTestTemplate';
import { Test, TestAnswer } from '@/types/testTypes';

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

  const handleSubmit = async (answers: Record<string, string>) => {
    try {
      const transformedAnswers: TestAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        selectedAnswer: answer // ubah dari answer menjadi selectedAnswer
      }));
  
      const response = await fetch(`/api/jobs/${jobId}/test/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: transformedAnswers }),
      });
  
      if (!response.ok) throw new Error('Failed to submit test');
      
      router.push(`/jobs/${jobId}/test/${testId}/result`);
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!test) return <div>Test not found</div>;

  return test ? (
    <TakeTestTemplate
      testTitle={test.title}
      testDescription={test.description}
      questions={test.questions}
      timeLimit={test.timeLimit}
      passingScore={test.passingScore}
      onSubmit={handleSubmit}
    />
  ) : null;
}