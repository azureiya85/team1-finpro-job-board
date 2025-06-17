'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Test, Question } from '@/types/testTypes';
import { useTestTimer } from '@/hooks/useTestTimer';

export function TestQuestionTemplate() {
  const params = useParams();
  const router = useRouter();
  
  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Inisialisasi answers dari localStorage
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Load answers dari localStorage saat komponen mount
  useEffect(() => {
    if (typeof window === 'undefined' || !params.testId) return;
    
    const savedAnswers = localStorage.getItem(`test_answers_${params.testId}`);
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (error) {
        console.error('Error loading answers:', error);
      }
    }
  }, [params.testId]);

  const handleTimeUp = () => {
    handleSubmitTest(true);
  };

  const timeLeft = useTestTimer(
    params.testId as string,
    test?.timeLimit,
    handleTimeUp
  );

  useEffect(() => {
    fetchTestAndQuestion();
  }, [params.questionId]);

  const fetchTestAndQuestion = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}/test/${params.testId}`);
      if (!response.ok) throw new Error('Failed to fetch test data');
      
      const testData = await response.json();
      setTest(testData);

      const question = testData.questions.find((q: Question) => q.id === params.questionId);
      setCurrentQuestion(question);
    } catch (error) {
      console.error('Error fetching test data:', error);
      alert('Gagal mengambil data test. Silakan refresh halaman.');
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
      if (window.confirm('Apakah Anda yakin ingin menyelesaikan test ini?')) {
        handleSubmitTest(false);
      }
    }
  };

  const handleSelectAnswer = (answer: string) => {
    if (!currentQuestion || !params.testId) return;
    
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: answer
    };
    
    // Update state
    setAnswers(newAnswers);
    
    // Simpan ke localStorage
    try {
      localStorage.setItem(`test_answers_${params.testId}`, JSON.stringify(newAnswers));
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleSubmitTest = async (isTimeUp: boolean = false) => {
    if (isSubmitting || !test || !params.testId) return;
    
    try {
      setIsSubmitting(true);
      
      if (!isTimeUp && !window.confirm('Apakah Anda yakin ingin menyelesaikan test ini?')) {
        setIsSubmitting(false);
        return;
      }

      const submittedAnswers = test.questions.map(q => ({
        questionId: q.id,
        answer: answers[q.id] || ''
      }));

      const response = await fetch(`/api/jobs/${params.id}/test/${params.testId}/take-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: submittedAnswers }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit test');
      }

      // Bersihkan localStorage setelah submit berhasil
      localStorage.removeItem(`test_timer_${params.testId}`);
      localStorage.removeItem(`test_answers_${params.testId}`);

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
        <div className="text-xl font-bold">
          Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
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
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${answers[currentQuestion.id] === key ? 'bg-emerald-100 border-emerald-500' : 'hover:bg-gray-50'}`}
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