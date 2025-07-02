import type { StateCreator } from 'zustand';
import type { PlanManagementState, SubscriptionPlan, PlanFormData } from '@/types/subscription';
import type { 
  SubscriptionManagementState,
  SubscriptionPlanSliceActions 
} from '@/types/zustandAdmin';

export type PlanSlice = PlanManagementState & SubscriptionPlanSliceActions;

export const createPlanSlice: StateCreator<
  SubscriptionManagementState,
  [],
  [],
  PlanSlice
> = (set, get) => ({
  // Plan State
  plans: [],
  selectedPlan: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  // Plan Actions
  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/admin/subscription/plan');
      if (!response.ok) throw new Error('Failed to fetch plans');
      
      const plans = await response.json();
      set({
        plans,
        loading: false,
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
    }
  },

  selectPlan: (plan: SubscriptionPlan | null) => {
    set({ selectedPlan: plan });
  },

  createPlan: async (planData: PlanFormData) => {
    set({ isCreating: true, error: null });
    try {
      const response = await fetch('/api/admin/subscription/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create plan');
      }
      
      await get().fetchPlans();
      set({ isCreating: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isCreating: false 
      });
      return false;
    }
  },

  updatePlan: async (planId: string, planData: Partial<PlanFormData>) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await fetch(`/api/admin/subscription/plan/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update plan');
      }
      
      await get().fetchPlans();
      set({ isUpdating: false, selectedPlan: null });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isUpdating: false 
      });
      return false;
    }
  },

  deletePlan: async (planId: string) => {
    set({ isDeleting: true, error: null });
    try {
      const response = await fetch(`/api/admin/subscription/plan/${planId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete plan');
      }
      
      await get().fetchPlans();
      set({ isDeleting: false, selectedPlan: null });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isDeleting: false 
      });
      return false;
    }
  },
});