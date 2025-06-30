'use client';

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStores';
import { useAssessmentStore } from '@/stores/assessmentPageStores';
import { AssessmentLoadingView } from '@/components/organisms/dashboard/assessments/AssessmentsLoadingView';
import { AssessmentErrorView } from '@/components/organisms/dashboard/assessments/AssessmentsErrorView';
import { AssessmentQuestionView } from '@/components/organisms/dashboard/assessments/AssessmentsQuestionView';
import { AssessmentResultsView } from '@/components/organisms/dashboard/assessments/AssessmentsResultView';
import { AssessmentSubmissionDialog } from '@/components/organisms/dashboard/assessments/AssessmentsSubmissionDialog';
import { AssessmentData, AssessmentAnswer, SubmissionResult } from '@/types/assessments';

export default function TakeAssessmentPageTemplate() {
  const params = useParams();
  const assessmentId = params.id as string;
  const { user } = useAuthStore();
  const store = useAssessmentStore();
  
  const reset = useAssessmentStore((state) => state.reset);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const lsTimerKey = useMemo(() => user?.id && assessmentId ? `assessment_timer_${assessmentId}_${user.id}` : '', [assessmentId, user?.id]);
  const lsAnswersKey = useMemo(() => user?.id && assessmentId ? `assessment_answers_${assessmentId}_${user.id}` : '', [assessmentId, user?.id]);

  const cleanUpLocalStorage = useCallback(() => {
    if (lsTimerKey) localStorage.removeItem(lsTimerKey);
    if (lsAnswersKey) localStorage.removeItem(lsAnswersKey);
  }, [lsTimerKey, lsAnswersKey]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const handleSubmit = useCallback(async () => {
    const { assessmentData, answers, selectedOption, currentQuestionIndex, timeLeft } = store;
    if (!assessmentData || !user?.id) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    store.startSubmitting();

    // Ensure the very last answer is included before submitting
    let finalAnswers = [...answers];
    if (selectedOption) {
      const currentQuestionId = assessmentData.questions[currentQuestionIndex].id;
      const finalAnswer: AssessmentAnswer = { questionId: currentQuestionId, selectedOption: selectedOption as 'A' | 'B' | 'C' | 'D' };
      finalAnswers = [...finalAnswers.filter(a => a.questionId !== currentQuestionId), finalAnswer];
    }
    
    const timeSpentInSeconds = (assessmentData.timeLimit * 60) - (timeLeft ?? 0);
    const timeSpentInMinutes = Math.max(1, Math.ceil(timeSpentInSeconds / 60));

    try {
      const response = await fetch(`/api/users/assessments/${assessmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers, timeSpent: timeSpentInMinutes }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to submit.');
      
      const result: SubmissionResult = await response.json();
      store.finishSubmitting(result);
      cleanUpLocalStorage();
    } catch (err) {
      store.submissionFailed(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  }, [store, user?.id, assessmentId, cleanUpLocalStorage]);

  useEffect(() => {
    if (!user?.id || !assessmentId) {
      store.setError(!user?.id ? "User not authenticated." : "Assessment ID is missing.");
      return;
    }
    if (store.stage !== 'loading') return;

    const init = async () => {
      try {
        let restoredTimeLeft: number | null = null;
        let restoredAnswers: AssessmentAnswer[] = [];
        if (lsTimerKey) {
          const savedTimer = localStorage.getItem(lsTimerKey);
          if (savedTimer) restoredTimeLeft = Math.max(0, Math.floor((JSON.parse(savedTimer).endTime - Date.now()) / 1000));
        }
        if (lsAnswersKey) {
          const savedAnswers = localStorage.getItem(lsAnswersKey);
          if (savedAnswers) restoredAnswers = JSON.parse(savedAnswers).answers;
        }
        
        const res = await fetch(`/api/users/assessments/${assessmentId}/start`, { method: 'POST' });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to start assessment.');
        const data: AssessmentData = await res.json();
        
        if (restoredTimeLeft === null && lsTimerKey) {
          const endTime = Date.now() + data.timeLimit * 60 * 1000;
          localStorage.setItem(lsTimerKey, JSON.stringify({ endTime }));
        }
        store.initialize(data, restoredAnswers, restoredTimeLeft);
      } catch (err) {
        store.setError(err instanceof Error ? err.message : 'Failed to initialize.');
      }
    };
    init();
  }, [user?.id, assessmentId, store, lsTimerKey, lsAnswersKey]);

  useEffect(() => {
    if (store.stage !== 'taking' || store.timeLeft === null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    if (store.timeLeft <= 0) {
      if(store.stage === 'taking') handleSubmit();
      return;
    }
    timerRef.current = setInterval(store.decrementTime, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [store.stage, store.timeLeft, store.decrementTime, handleSubmit]);

  const handleNext = useCallback(() => {
    const { assessmentData, selectedOption, currentQuestionIndex } = store;
    if (!assessmentData || !selectedOption) return;

    const newAnswer: AssessmentAnswer = {
      questionId: assessmentData.questions[currentQuestionIndex].id,
      selectedOption: selectedOption as 'A' | 'B' | 'C' | 'D',
    };
    store.updateCurrentAnswer(newAnswer);
    if (lsAnswersKey) {
      localStorage.setItem(lsAnswersKey, JSON.stringify({ answers: [...store.answers.filter(a => a.questionId !== newAnswer.questionId), newAnswer] }));
    }

    const isLastQuestion = currentQuestionIndex === assessmentData.questions.length - 1;
    if (isLastQuestion) {
      store.setShowConfirmDialog(true);
    } else {
      store.goToNextQuestion();
    }
  }, [store, lsAnswersKey]);

  const renderContent = () => {
    switch (store.stage) {
      case 'loading': return <AssessmentLoadingView />;
      case 'taking':
      case 'submitting': return <AssessmentQuestionView onNext={handleNext} />;
      case 'results': return <AssessmentResultsView />;
      case 'error': return <AssessmentErrorView />;
      default: return <AssessmentErrorView />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {renderContent()}
      <AssessmentSubmissionDialog onSubmit={handleSubmit} />
    </div>
  );
}