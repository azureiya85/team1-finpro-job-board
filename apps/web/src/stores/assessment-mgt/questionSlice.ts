import type { StateCreator } from 'zustand';
import type { QuestionSlice, AssessmentMgtStoreState } from '@/types/zustandAdmin';

export const createQuestionSlice: StateCreator<AssessmentMgtStoreState, [], [], QuestionSlice> = (set, get) => ({
  questions: [],
  isQuestionsLoading: false,
  questionError: null,

  fetchQuestions: async (assessmentId: string) => {
    set({ isQuestionsLoading: true, questionError: null });
    try {
      const response = await fetch(`/api/admin/skill/assessments/${assessmentId}/questions`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      
      const questions = await response.json();
      set({ questions, isQuestionsLoading: false });
    } catch (error) {
      set({ 
        questionError: error instanceof Error ? error.message : 'Unknown error',
        isQuestionsLoading: false 
      });
    }
  },

  createQuestion: async (assessmentId, data) => {
    set({ isQuestionsLoading: true, questionError: null });
    try {
      const response = await fetch(`/api/admin/skill/assessments/${assessmentId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create question');
      }
      
      await get().fetchQuestions(assessmentId);
      await get().fetchAssessments(); // Refresh to update question count
      set({ isQuestionsLoading: false });
      return true;
    } catch (error) {
      set({ 
        questionError: error instanceof Error ? error.message : 'Unknown error',
        isQuestionsLoading: false 
      });
      return false;
    }
  },

  updateQuestion: async (assessmentId, questionId, data) => {
    set({ isQuestionsLoading: true, questionError: null });
    try {
      const response = await fetch(`/api/admin/skill/assessments/${assessmentId}/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update question');
      }
      
      await get().fetchQuestions(assessmentId);
      set({ isQuestionsLoading: false });
      return true;
    } catch (error) {
      set({ 
        questionError: error instanceof Error ? error.message : 'Unknown error',
        isQuestionsLoading: false 
      });
      return false;
    }
  },

  deleteQuestion: async (assessmentId, questionId) => {
    set({ isQuestionsLoading: true, questionError: null });
    try {
      const response = await fetch(`/api/admin/skill/assessments/${assessmentId}/questions/${questionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete question');
      }
      
      await get().fetchQuestions(assessmentId);
      await get().fetchAssessments(); // Refresh to update question count
      set({ isQuestionsLoading: false });
      return true;
    } catch (error) {
      set({ 
        questionError: error instanceof Error ? error.message : 'Unknown error',
        isQuestionsLoading: false 
      });
      return false;
    }
  },

  clearQuestions: () => {
    set({ questions: [] });
  },
});