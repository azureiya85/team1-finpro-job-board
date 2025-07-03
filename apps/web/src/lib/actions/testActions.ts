import { Question, Test } from '@/types/testTypes';

export async function fetchTests(jobId: string): Promise<Test[]> {
  try {
    const response = await fetch(`/api/jobs/${jobId}/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch tests');
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format received');
    }

    const validatedTests = data.map(test => {
      if (!test.id) {
        throw new Error('Received test data without id');
      }
      return test;
    });

    return validatedTests;
  } catch (error) {
    throw error;
  }
}

export function validateQuestion(question: Question): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!question.question.trim()) {
    errors.question = 'Question is required';
  }
  if (!question.correctAnswer) {
    errors.correctAnswer = 'Correct answer is required';
  }
  return errors;
}

export function prepareTestData(test: Test): Omit<Test, 'id' | 'createdAt' | 'updatedAt'> {
  const { ...testData } = test;
  return testData;
}

export { calculateTestScore, formatTimeLeft } from '@/lib/testUtils';