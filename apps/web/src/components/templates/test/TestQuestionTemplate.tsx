'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Test, Question } from '@/types/testTypes';
import { TestTimer } from '@/components/atoms/test/TestTimer';

export function TestQuestionTemplate() {
  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    fetchTestAndQuestion();
  }, [params.questionId]);

  useEffect(() => {
    if (test?.timeLimit) {
      setTimeLeft(test.timeLimit * 60);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [test]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmitTest(true);
    }
  }, [timeLeft]);

  const fetchTestAndQuestion = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}/test/${params.testId}`);
      const testData = await response.json();
      setTest(testData);

      const question = testData.questions.find((q: Question) => q.id === params.questionId);
      setCurrentQuestion(question);
    } catch (error) {
      console.error('Error fetching test data:', error);
    }
  };

  const handlePrevious = () => {
    if (!test) return;
    const currentIndex = test.questions.findIndex((q: Question) => q.id === params.questionId);
    if (currentIndex > 0) {
      const prevQuestion = test.questions[currentIndex - 1];
      router.push(`/jobs/${params.id}/test/${params.testId}/take-test/${prevQuestion.id}`);
    }
  };

  const handleNext = () => {
    if (!test || !currentQuestion) return;
    const currentIndex = test.questions.findIndex((q: Question) => q.id === params.questionId);
    if (currentIndex < test.questions.length - 1) {
      const nextQuestion = test.questions[currentIndex + 1];
      router.push(`/jobs/${params.id}/test/${params.testId}/take-test/${nextQuestion.id}`);
    } else {
      // Konfirmasi sebelum submit di soal terakhir
      if (window.confirm('Apakah Anda yakin ingin menyelesaikan test ini?')) {
        handleSubmitTest(false);
      }
    }
  };

  const handleSelectAnswer = (answer: string) => {
    if (!currentQuestion) return;
    
    setSelectedAnswer(answer);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleSubmitTest = async (isTimeUp: boolean = false) => {
    if (isSubmitting || !test) return;
    
    try {
      setIsSubmitting(true);
      
      // Konfirmasi hanya jika bukan karena waktu habis
      if (!isTimeUp && !window.confirm('Apakah Anda yakin ingin menyelesaikan test ini?')) {
        return;
      }

      // Kumpulkan semua jawaban
      const submittedAnswers = test.questions.map(q => ({
        questionId: q.id,
        answer: answers[q.id] || ''
      }));

      // Kirim jawaban ke API
      const response = await fetch(`/api/jobs/${params.id}/test/${params.testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: submittedAnswers }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit test');
      }

      // Redirect ke halaman result
      router.push(`/jobs/${params.id}/test/${params.testId}/result`);
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Gagal mengirim jawaban test. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!test || !currentQuestion) return <div>Loading...</div>;

  const currentQuestionNumber = test.questions.findIndex((q: Question) => q.id === params.questionId) + 1;

  return (
    <div className="container mx-auto p-4 max-w-4xl mt-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-semibold">Exam Title: {test.title}</h2>
          <p className="text-gray-600">Exam Date: {new Date().toLocaleDateString()}</p>
        </div>
        <TestTimer
    timeLeft={timeLeft}
    isWarning={timeLeft < 300}
    onTimeUp={() => {}}
  />
      </div>

      <Card className="p-6 mb-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Question {currentQuestionNumber}</h3>
          <p className="text-gray-600 text-sm mb-2">Question {currentQuestionNumber} / {test.questions.length}</p>
          <p className="text-lg">{currentQuestion.question}</p>
        </div>

        <div className="space-y-4">
          {[
            ['optionA', currentQuestion.optionA],
            ['optionB', currentQuestion.optionB],
            ['optionC', currentQuestion.optionC],
            ['optionD', currentQuestion.optionD]
          ].map(([key, value]) => (
            <div
              key={key}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedAnswer === key ? 'bg-emerald-100 border-emerald-500' : 'hover:bg-gray-50'}`}
              onClick={() => handleSelectAnswer(key)}
            >
              {value}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={currentQuestionNumber === 1}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={isSubmitting}
        >
          {currentQuestionNumber === test.questions.length ? 'Finish & Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
}