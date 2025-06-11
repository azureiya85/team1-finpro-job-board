'use client'

import { useState, useEffect } from 'react';
import { TestQuestion } from '@/components/molecules/test/TestQuestion';
import { TestTimer } from '@/components/atoms/test/TestTimer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface TestFormProps {
  questions: {
    id: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
  }[];
  timeLimit: number; // dalam menit
  onSubmit: (answers: Record<string, string>) => void;
}

export function TestTaking({ questions, timeLimit, onSubmit }: TestFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerSelect = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(answers);
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
              onTimeUp={handleSubmit}
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
              { value: 'A', text: q.optionA },
              { value: 'B', text: q.optionB },
              { value: 'C', text: q.optionC },
              { value: 'D', text: q.optionD }
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
            disabled={answeredCount !== questions.length || isSubmitting}
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
              onClick={handleSubmit}
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