import { create } from 'zustand';
import {
  AssessmentData,
  AssessmentAnswer,
  SubmissionResult,
  AssessmentStage,
} from '@/types/assessments';

// 1. Define State and Actions Interfaces
interface AssessmentState {
  stage: AssessmentStage;
  assessmentData: AssessmentData | null;
  currentQuestionIndex: number;
  answers: AssessmentAnswer[];
  selectedOption: string; // 'A', 'B', 'C', 'D' or ''
  timeLeft: number | null;
  submissionResult: SubmissionResult | null;
  error: string | null;
  showConfirmDialog: boolean;
}

interface AssessmentActions {
  initialize: (data: AssessmentData, restoredAnswers: AssessmentAnswer[], restoredTimeLeft: number | null) => void;
  setStage: (stage: AssessmentStage) => void;
  setError: (error: string | null) => void;
  updateCurrentAnswer: (newAnswer: AssessmentAnswer) => void;
  goToNextQuestion: () => void;
  setSelectedOption: (option: string) => void;
  decrementTime: () => void;
  setShowConfirmDialog: (show: boolean) => void;
  startSubmitting: () => void;
  finishSubmitting: (result: SubmissionResult) => void;
  submissionFailed: (error: string) => void;
  reset: () => void;
}

// 2. Define Initial State
const initialState: AssessmentState = {
  stage: 'loading',
  assessmentData: null,
  currentQuestionIndex: 0,
  answers: [],
  selectedOption: '',
  timeLeft: null,
  submissionResult: null,
  error: null,
  showConfirmDialog: false,
};

// 3. Create the Zustand Store
export const useAssessmentStore = create<AssessmentState & AssessmentActions>((set, get) => ({
  ...initialState,

  // --- Actions ---
  initialize: (data, restoredAnswers, restoredTimeLeft) => {
    const initialTimeLeft = restoredTimeLeft !== null ? restoredTimeLeft : data.timeLimit * 60;
    const initialQuestionIndex = Math.min(restoredAnswers.length, data.questions.length - 1);

    set({
      assessmentData: data,
      answers: restoredAnswers,
      timeLeft: initialTimeLeft,
      currentQuestionIndex: initialQuestionIndex,
      stage: 'taking',
      error: null,
    });

    const currentQuestionId = data.questions[initialQuestionIndex]?.id;
    if (currentQuestionId) {
        const existingAnswer = restoredAnswers.find(a => a.questionId === currentQuestionId);
        set({ selectedOption: existingAnswer?.selectedOption || '' });
    }
  },
  
  setStage: (stage) => set({ stage }),
  setError: (error) => set({ error, stage: 'error' }),
  
  updateCurrentAnswer: (newAnswer) => {
    const updatedAnswers = [...get().answers.filter(a => a.questionId !== newAnswer.questionId), newAnswer];
    set({ answers: updatedAnswers });
  },
  
  goToNextQuestion: () => {
    const nextIndex = get().currentQuestionIndex + 1;
    const nextQuestionId = get().assessmentData?.questions[nextIndex]?.id;
    if (nextQuestionId) {
        const existingAnswer = get().answers.find(a => a.questionId === nextQuestionId);
        set({ 
            currentQuestionIndex: nextIndex,
            selectedOption: existingAnswer?.selectedOption || ''
        });
    }
  },

  setSelectedOption: (option) => set({ selectedOption: option }),
  decrementTime: () => set((state) => ({ timeLeft: state.timeLeft !== null && state.timeLeft > 0 ? state.timeLeft - 1 : 0 })),
  setShowConfirmDialog: (show) => set({ showConfirmDialog: show }),

  startSubmitting: () => set({ stage: 'submitting', showConfirmDialog: false }),
  finishSubmitting: (result) => set({ submissionResult: result, stage: 'results' }),
  submissionFailed: (error) => set({ error, stage: 'error' }),
  
  reset: () => set(initialState),
}));