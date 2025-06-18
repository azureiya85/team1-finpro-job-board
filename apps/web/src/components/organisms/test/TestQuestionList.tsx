'use client'

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Question } from '@/types/testTypes';

interface TestQuestionListProps {
  questions: Question[];
  onEdit?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
}

export function TestQuestionList({ questions, onEdit, onDelete }: TestQuestionListProps) {
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <Card key={question.id} className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">Question {index + 1}</h3>
              <div className="space-x-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(question.id)}
                  >
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(question.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
            
            <p className="text-gray-700">{question.question}</p>
            
            <div className="grid grid-cols-2 gap-4">
              {['A', 'B', 'C', 'D'].map((option) => (
                <div
                  key={option}
                  className={`p-3 rounded-md ${option === question.correctAnswer ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}
                >
                  <span className="font-medium">Option {option}:</span>
                  <span className="ml-2">{String(question[`option${option}` as keyof Question])}</span>
                  {option === question.correctAnswer && (
                    <span className="ml-2 text-green-600">(Correct Answer)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}

      {questions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No questions added yet
        </div>
      )}
    </div>
  );
}