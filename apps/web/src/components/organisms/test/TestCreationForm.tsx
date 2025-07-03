'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Question, CreateTestData } from '@/types/testTypes';
import { validateQuestion } from '@/lib/actions/testActions';
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
    initialData?.questions?.map(q => ({ ...q, isValid: true, createdAt: new Date(), updatedAt: new Date() })) || []
  );
  const [errors, setErrors] = useState<z.ZodError | null>(null);

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
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
      }
    ]);
  };

  const handleChange = (idx: number, field: keyof Question, val: string) => {
    const updated = [...questions];
    updated[idx] = {
      ...updated[idx],
      [field]: val,
      errors: validateQuestion({ ...updated[idx], [field]: val })
    };
    setQuestions(updated);
  };

  const handleSubmit = () => {
    const testData = {
      title,
      description,
      timeLimit,
      passingScore,
      questions: questions.map(({ explanation, ...q }) => ({
        ...q,
        explanation: explanation || ''
      }))
    };

    const result = testSchema.safeParse(testData);
    if (!result.success) return setErrors(result.error);

    onSubmit({ ...testData, isActive: true, companyId: '' });
  };

  const getFieldError = (path: (string | number)[]) =>
    errors?.errors?.find(e => JSON.stringify(e.path) === JSON.stringify(path))?.message;

  const renderQuestionForm = (q: Question, index: number) => (
    <Card key={q.id} className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Question {index + 1}</label>
        <Textarea
          value={q.question}
          onChange={e => handleChange(index, 'question', e.target.value)}
          placeholder="Enter question"
        />
        {getFieldError(['questions', index, 'question']) && (
          <p className="text-red-500 text-sm mt-1">{getFieldError(['questions', index, 'question'])}</p>
        )}
      </div>

      {['A', 'B', 'C', 'D'].map(opt => (
        <div key={opt}>
          <label className="block text-sm font-medium mb-1">Option {opt}</label>
          <Input
            value={q[`option${opt}` as keyof Question]?.toString() || ''}
            onChange={e => handleChange(index, `option${opt}` as keyof Question, e.target.value)}
            placeholder={`Enter option ${opt}`}
          />
          {getFieldError(['questions', index, `option${opt}`]) && (
            <p className="text-red-500 text-sm mt-1">{getFieldError(['questions', index, `option${opt}`])}</p>
          )}
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium mb-1">Correct Answer</label>
        <select
          value={q.correctAnswer}
          onChange={e => handleChange(index, 'correctAnswer', e.target.value)}
          className="w-full border rounded-md p-2"
        >
          {['A', 'B', 'C', 'D'].map(opt => (
            <option key={opt} value={opt}>Option {opt}</option>
          ))}
        </select>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        {[
          { label: 'Test Title', value: title, set: setTitle, name: 'title' },
          { label: 'Description', value: description, set: setDescription, name: 'description', isTextArea: true },
          { label: 'Time Limit (minutes)', value: timeLimit, set: (v: string) => setTimeLimit(Number(v)), name: 'timeLimit', type: 'number' },
          { label: 'Passing Score', value: passingScore, set: (v: string) => setPassingScore(Number(v)), name: 'passingScore', type: 'number' },
        ].map(({ label, value, set, name, isTextArea, type }) => (
          <div key={name}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            {isTextArea ? (
              <Textarea value={value} onChange={e => set(e.target.value)} placeholder={`Enter ${label.toLowerCase()}`} />
            ) : (
              <Input type={type || 'text'} value={value} onChange={e => set(e.target.value)} />
            )}
            {getFieldError([name]) && <p className="text-red-500 text-sm mt-1">{getFieldError([name])}</p>}
          </div>
        ))}
      </Card>

      <div className="space-y-4">{questions.map(renderQuestionForm)}</div>

      {getFieldError(['questions']) && (
        <p className="text-red-500 text-sm mt-1">{getFieldError(['questions'])}</p>
      )}

      <div className="flex justify-between">
        <Button onClick={addQuestion}>Add Question</Button>
        <Button onClick={handleSubmit}>Save Test</Button>
      </div>
    </div>
  );
}
