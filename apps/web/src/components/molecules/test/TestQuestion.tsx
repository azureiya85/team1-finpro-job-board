'use client'

import { TestOption } from '@/components/atoms/test/TestOption';
import { Card, CardContent } from '@/components/ui/card';

interface TestQuestionProps {
  questionNumber: number;
  question: string;
  options: {
    value: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  selectedAnswer?: string;
  onAnswerSelect: (value: string) => void;
  disabled?: boolean;
}

export function TestQuestion({
  questionNumber,
  question,
  options,
  selectedAnswer,
  onAnswerSelect,
  disabled = false
}: TestQuestionProps) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <span className="flex-shrink-0 w-8 text-gray-500">{questionNumber}.</span>
            <h3 className="text-lg text-gray-900">{question}</h3>
          </div>
          <div className="space-y-2 pl-8">
            {options.map((option) => (
              <TestOption
                key={option.value}
                id={`question-${questionNumber}-${option.value}`}
                label={option.text}
                value={option.value}
                isSelected={selectedAnswer === option.value}
                onChange={onAnswerSelect}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}