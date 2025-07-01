import type { StateCreator } from 'zustand';
import type { AssessmentSlice, AssessmentMgtStoreState } from '@/types/zustandAdmin';

export const createAssessmentSlice: StateCreator<AssessmentMgtStoreState, [], [], AssessmentSlice> = (set, get) => ({
  assessments: [],
  selectedAssessment: null,
  isAssessmentsLoading: false,
  assessmentError: null,

  fetchAssessments: async () => {
    set({ isAssessmentsLoading: true, assessmentError: null });
    try {
      const response = await fetch('/api/admin/skill/assessments');
      if (!response.ok) throw new Error('Failed to fetch assessments');
      
      const assessments = await response.json();
      set({ assessments, isAssessmentsLoading: false });
    } catch (error) {
      set({ 
        assessmentError: error instanceof Error ? error.message : 'Unknown error',
        isAssessmentsLoading: false 
      });
    }
  },

  selectAssessment: (assessment) => {
    set({ selectedAssessment: assessment });
  },

  createAssessment: async (data) => {
    set({ isAssessmentsLoading: true, assessmentError: null });
    try {
      const response = await fetch('/api/admin/skill/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, isActive: true }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assessment');
      }
      
      await get().fetchAssessments();
      set({ isAssessmentsLoading: false });
      return true;
    } catch (error) {
      set({ 
        assessmentError: error instanceof Error ? error.message : 'Unknown error',
        isAssessmentsLoading: false 
      });
      return false;
    }
  },

  updateAssessment: async (id, data) => {
    set({ isAssessmentsLoading: true, assessmentError: null });
    try {
      const response = await fetch(`/api/admin/skill/assessments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update assessment');
      }
      
      await get().fetchAssessments();
      set({ isAssessmentsLoading: false, selectedAssessment: null });
      return true;
    } catch (error) {
      set({ 
        assessmentError: error instanceof Error ? error.message : 'Unknown error',
        isAssessmentsLoading: false 
      });
      return false;
    }
  },

  deleteAssessment: async (id) => {
    set({ isAssessmentsLoading: true, assessmentError: null });
    try {
      const response = await fetch(`/api/admin/skill/assessments/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete assessment');
      }
      
      await get().fetchAssessments();
      set({ isAssessmentsLoading: false, selectedAssessment: null });
      return true;
    } catch (error) {
      set({ 
        assessmentError: error instanceof Error ? error.message : 'Unknown error',
        isAssessmentsLoading: false 
      });
      return false;
    }
  },
});