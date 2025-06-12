'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Question {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
}

interface TestCreationFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
    questions: Question[];
  }) => void;
}

export function TestCreationForm({ onSubmit }: TestCreationFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [passingScore, setPassingScore] = useState(70); // default 70%
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      id: Date.now().toString(),
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: '' // Menambahkan field explanation
    }]);
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleSubmit = () => {
    onSubmit({
      title,
      description,
      timeLimit,
      passingScore,
      questions
    });
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
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter test description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time Limit (minutes)</label>
            <Input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              min={1}
            />
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
              </div>
              {['A', 'B', 'C', 'D'].map((option) => (
                <div key={option}>
                  <label className="block text-sm font-medium mb-1">Option {option}</label>
                  <Input
                    value={q[`option${option}` as keyof Question]}
                    onChange={(e) => handleQuestionChange(index, `option${option}` as keyof Question, e.target.value)}
                    placeholder={`Enter option ${option}`}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1">Correct Answer</label>
                <select
                  value={q.correctAnswer}
                  onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                  className="w-full border rounded-md p-2"
                >
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <option key={option} value={option}>Option {option}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button onClick={handleAddQuestion}>Add Question</Button>
        <Button onClick={handleSubmit} disabled={!title || questions.length === 0}>Save Test</Button>
      </div>
    </div>
  );
}