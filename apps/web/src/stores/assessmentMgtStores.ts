import { create } from 'zustand';

// --- TYPES ---
export interface SkillCategory {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SkillAssessment {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number;
  passingScore: number;
  isActive: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category?: SkillCategory;
  _count?: { questions: number };
}

export interface SkillAssessmentQuestion {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string | null;
  assessmentId: string;
  createdAt: string;
  updatedAt: string;
}

// --- STORE INTERFACE ---
export interface AssessmentStore {
  categories: SkillCategory[];
  assessments: SkillAssessment[];
  questions: SkillAssessmentQuestion[];
  selectedAssessment: SkillAssessment | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCategories: (categories: SkillCategory[]) => void;
  setAssessments: (assessments: SkillAssessment[]) => void;
  setQuestions: (questions: SkillAssessmentQuestion[]) => void;
  setSelectedAssessment: (assessment: SkillAssessment | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // API Actions
  fetchCategories: () => Promise<void>;
  fetchAssessments: () => Promise<void>;
  fetchQuestions: (assessmentId: string) => Promise<void>;
  createCategory: (data: { name: string; description?: string }) => Promise<void>;
  updateCategory: (id: string, data: { name: string; description?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  createAssessment: (data: {
    title: string;
    description?: string;
    timeLimit: number;
    passingScore: number;
    categoryId: string;
  }) => Promise<void>;
  updateAssessment: (id: string, data: {
    title?: string;
    description?: string;
    timeLimit?: number;
    passingScore?: number;
    isActive?: boolean;
    categoryId?: string;
  }) => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;
  createQuestion: (assessmentId: string, data: {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: "A" | "B" | "C" | "D";
    explanation?: string;
  }) => Promise<void>;
  updateQuestion: (assessmentId: string, questionId: string, data: {
    question?: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctAnswer?: "A" | "B" | "C" | "D";
    explanation?: string;
  }) => Promise<void>;
  deleteQuestion: (assessmentId: string, questionId: string) => Promise<void>;
}

// --- ZUSTAND STORE ---
export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  categories: [],
  assessments: [],
  questions: [],
  selectedAssessment: null,
  isLoading: false,
  error: null,

  setCategories: (categories) => set({ categories }),
  setAssessments: (assessments) => set({ assessments }),
  setQuestions: (questions) => set({ questions }),
  setSelectedAssessment: (assessment) => set({ selectedAssessment: assessment }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // API Actions Implementations
  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/admin/skill/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const categories = await response.json();
      set({ categories });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAssessments: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/admin/skill/assessments');
      if (!response.ok) throw new Error('Failed to fetch assessments');
      const assessments = await response.json();
      set({ assessments });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchQuestions: async (assessmentId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/admin/skill/assessments/${assessmentId}/questions`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const questions = await response.json();
      set({ questions });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  createCategory: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/admin/skill/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create category');
      await get().fetchCategories();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCategory: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/admin/skill/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update category');
      await get().fetchCategories();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCategory: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/admin/skill/categories/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }
      await get().fetchCategories();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createAssessment: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/admin/skill/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create assessment');
      await get().fetchAssessments();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateAssessment: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/admin/skill/assessments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update assessment');
      await get().fetchAssessments();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAssessment: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/admin/skill/assessments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete assessment');
      }
      await get().fetchAssessments();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createQuestion: async (assessmentId, data) => {
    try {
      set({ isLoading: true, error: null });
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
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuestion: async (assessmentId, questionId, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/admin/skill/assessments/${assessmentId}/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update question');
      await get().fetchQuestions(assessmentId);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteQuestion: async (assessmentId, questionId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/admin/skill/assessments/${assessmentId}/questions/${questionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete question');
      await get().fetchQuestions(assessmentId);
      await get().fetchAssessments(); // Refresh to update question count
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));