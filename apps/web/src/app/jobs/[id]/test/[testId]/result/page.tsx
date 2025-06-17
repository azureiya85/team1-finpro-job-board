'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter} from 'next/navigation';
import { TestResultTemplate } from '@/components/templates/test/TestResultTemplate';
import { TestResult, TestAnswer } from '@/types/testTypes';

export default function TestResultPage() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const testId = params.testId as string;
  const jobId = params.id as string;
  const router = useRouter();

  useEffect(() => {
    fetchTestResult();
  }, [testId, jobId]);

  const fetchTestResult = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/test/${testId}/result`);
      if (!response.ok) throw new Error('Failed to fetch test result');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error fetching test result:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!result) return <div>Result not found</div>;
  if (!result.test) return <div>Test data not found</div>;
  
  console.log(result.test)

  return (
      <TestResultTemplate
      testTitle={result.test.title}
      score={result.score}
      totalQuestions={result.totalQuestions}
      answers={result.answers.reduce((acc: Record<string, string>, curr: TestAnswer) => ({
        ...acc,
        [curr.questionId]: curr.selectedAnswer
      }), {})}
      questions={result.test.questions}
      timeSpent={result.timeTaken}
      passingScore={result.passingScore}
      onBack={() => router.push(`/jobs/${jobId}`)}
      onRetake={() => router.push(`/jobs/${jobId}/test/${testId}/take-test`)}
    />
  );
}