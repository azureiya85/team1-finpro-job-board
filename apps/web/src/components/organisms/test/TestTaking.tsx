'use client'

import { useState, useEffect } from 'react';
import { TestQuestion } from '@/components/molecules/test/TestQuestion';
import { TestTimer } from '@/components/atoms/test/TestTimer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Question } from '@/types/testTypes';
import { validateQuestion } from '@/lib/actions/testActions';
import { useTestTimer } from '@/hooks/useTestTimer'

interface TestFormProps {
  questions: Question[];
  timeLimit: number;
  passingScore?: number;
  testId: string;
  onSubmit: (answers: Record<string, string>) => void;
}

export function TestTaking({ questions, timeLimit, testId, onSubmit }: TestFormProps) {
  const answersKey = `test_answers_${testId}`;
  
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(answersKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleTimeUp = () => {
    handleSubmit(true);
  };
  const timeLeft = useTestTimer(testId, timeLimit, handleTimeUp);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(answersKey, JSON.stringify(answers));
  }, [answers, answersKey]);

  const handleAnswerSelect = (questionId: string, value: string) => {
    setAnswers(prev => {
      const updated = { ...prev, [questionId]: value };
      return updated;
    });
  };

  const handleSubmit = async (force: boolean = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!force && timeLeft > 0) {
        if (!window.confirm('Are you sure you want to submit the test?')) {
          setIsSubmitting(false);
          return;
        }
      }

      await onSubmit(answers);

      localStorage.removeItem(`test_timer_${testId}`);
      localStorage.removeItem(answersKey);
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="space-y-6">
      <Card className="sticky top-0 z-10">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <TestTimer 
              timeLeft={timeLeft} 
              isWarning={timeLeft < 300}
              onTimeUp={handleTimeUp}
            />
            <div className="text-sm text-gray-500">
              {answeredCount}/{questions.length} questions answered
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </Card>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <TestQuestion
            key={q.id}
            questionNumber={index + 1}
            question={q.question}
            options={[
              { value: 'optionA', text: q.optionA },
              { value: 'optionB', text: q.optionB },
              { value: 'optionC', text: q.optionC },
              { value: 'optionD', text: q.optionD }
            ]}
            selectedAnswer={answers[q.id]}
            onAnswerSelect={(value) => handleAnswerSelect(q.id, value)}
          />
        ))}
      </div>

      <div className="sticky bottom-0 bg-white p-4 border-t">
        <div className="flex justify-end max-w-3xl mx-auto">
          <Button
            onClick={() => setShowConfirmDialog(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Finish & Submit"}
          </Button>
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            Are you sure you want to submit your answers? You cannot change your answers after submission.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Yes, Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}