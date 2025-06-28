'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Question } from '@/types/testTypes';
import { validateQuestion } from '@/lib/actions/testActions';
import { CreateTestData } from '@/types/testTypes';
import { testSchema } from '@/lib/validations/zodTestValidation';
import { z } from 'zod';

interface TestCreationFormProps {
  onSubmit: (data: CreateTestData) => void;
  initialData?: CreateTestData;
}

export function TestCreationForm({ onSubmit, initialData }: TestCreationFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit || 30);
  const [passingScore, setPassingScore] = useState(initialData?.passingScore || 70);
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions ? initialData.questions.map(q => ({
      ...q,
      createdAt: new Date(),
      updatedAt: new Date(),
      isValid: true
    })) : []
  );
  const [errors, setErrors] = useState<z.ZodError | null>(null);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      testId: '',
      isValid: true
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { 
      ...newQuestions[index], 
      [field]: value,
      errors: validateQuestion({ ...newQuestions[index], [field]: value })
    };
    setQuestions(newQuestions);
  };

  const handleSubmit = () => {
    const testData = {
      title,
      description: description || '',
      timeLimit,
      passingScore,
      questions: questions.map(q => ({
        id: q.id,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        testId: q.testId || ''
      }))
    };

    const result = testSchema.safeParse(testData);
    if (!result.success) {
      setErrors(result.error);
      return;
    }

    const finalTestData: CreateTestData = {
      ...testData,
      isActive: true,
      companyId: ''
    };
    
    onSubmit(finalTestData);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Test Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter test title"
            />
            {errors?.errors?.find(e => e.path[0] === 'title') && (
              <p className="text-red-500 text-sm mt-1">{errors.errors.find(e => e.path[0] === 'title')?.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter test description"
            />
            {errors?.errors?.find(e => e.path[0] === 'description') && (
              <p className="text-red-500 text-sm mt-1">{errors.errors.find(e => e.path[0] === 'description')?.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time Limit (minutes)</label>
            <Input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              min={1}
            />
            {errors?.errors?.find(e => e.path[0] === 'timeLimit') && (
              <p className="text-red-500 text-sm mt-1">{errors.errors.find(e => e.path[0] === 'timeLimit')?.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Passing Score</label>
            <Input
              type="number"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              min={0}
              max={100}
            />
            {errors?.errors?.find(e => e.path[0] === 'passingScore') && (
              <p className="text-red-500 text-sm mt-1">{errors.errors.find(e => e.path[0] === 'passingScore')?.message}</p>
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {questions.map((q, index) => (
          <Card key={q.id} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question {index + 1}</label>
                <Textarea
                  value={q.question}
                  onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                  placeholder="Enter question"
                />
                {errors?.errors?.find(e => e.path[0] === 'questions' && e.path[1] === index && e.path[2] === 'question') && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.errors.find(e => e.path[0] === 'questions' && e.path[1] === index && e.path[2] === 'question')?.message}
                  </p>
                )}
              </div>
              {['A', 'B', 'C', 'D'].map((option) => (
                <div key={option}>
                  <label className="block text-sm font-medium mb-1">Option {option}</label>
                  <Input
                    value={q[`option${option}` as keyof Question]?.toString() || ''}
                    onChange={(e) => handleQuestionChange(index, `option${option}` as keyof Question, e.target.value)}
                    placeholder={`Enter option ${option}`}
                  />
                  {errors?.errors?.find(e => e.path[0] === 'questions' && e.path[1] === index && e.path[2] === `option${option}`) && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.errors.find(e => e.path[0] === 'questions' && e.path[1] === index && e.path[2] === `option${option}`)?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {errors?.errors?.find(e => e.path[0] === 'questions' && e.path.length === 1) && (
        <p className="text-red-500 text-sm mt-1">
          {errors.errors.find(e => e.path[0] === 'questions' && e.path.length === 1)?.message}
        </p>
      )}

      <div className="flex justify-between">
        <Button onClick={handleAddQuestion}>Add Question</Button>
        <Button onClick={handleSubmit}>Save Test</Button>
      </div>
    </div>
  );
}