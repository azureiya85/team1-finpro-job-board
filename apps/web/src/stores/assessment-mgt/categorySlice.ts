import type { StateCreator } from 'zustand';
import type { CategorySlice, AssessmentMgtStoreState } from '@/types/zustandAdmin';

export const createCategorySlice: StateCreator<AssessmentMgtStoreState, [], [], CategorySlice> = (set, get) => ({
  categories: [],
  isCategoriesLoading: false,
  categoryError: null,

  fetchCategories: async () => {
    set({ isCategoriesLoading: true, categoryError: null });
    try {
      const response = await fetch('/api/admin/skill/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const categories = await response.json();
      set({ categories, isCategoriesLoading: false });
    } catch (error) {
      set({ 
        categoryError: error instanceof Error ? error.message : 'Unknown error',
        isCategoriesLoading: false 
      });
    }
  },

  createCategory: async (data) => {
    set({ isCategoriesLoading: true, categoryError: null });
    try {
      const response = await fetch('/api/admin/skill/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create category');
      }
      
      await get().fetchCategories();
      set({ isCategoriesLoading: false });
      return true;
    } catch (error) {
      set({ 
        categoryError: error instanceof Error ? error.message : 'Unknown error',
        isCategoriesLoading: false 
      });
      return false;
    }
  },

  updateCategory: async (id, data) => {
    set({ isCategoriesLoading: true, categoryError: null });
    try {
      const response = await fetch(`/api/admin/skill/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }
      
      await get().fetchCategories();
      set({ isCategoriesLoading: false });
      return true;
    } catch (error) {
      set({ 
        categoryError: error instanceof Error ? error.message : 'Unknown error',
        isCategoriesLoading: false 
      });
      return false;
    }
  },

  deleteCategory: async (id) => {
    set({ isCategoriesLoading: true, categoryError: null });
    try {
      const response = await fetch(`/api/admin/skill/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }
      
      await get().fetchCategories();
      set({ isCategoriesLoading: false });
      return true;
    } catch (error) {
      set({ 
        categoryError: error instanceof Error ? error.message : 'Unknown error',
        isCategoriesLoading: false 
      });
      return false;
    }
  },
});