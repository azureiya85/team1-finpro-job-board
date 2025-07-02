import { create } from 'zustand';
import type {
  SubscriptionPlan,
  Subscription,
  SubscriptionListState,
  SubscriptionPaymentState,
  PlanManagementState,
  PlanFormData,
} from '@/types/subscription';

interface SubscriptionManagementStore extends SubscriptionListState, SubscriptionPaymentState, PlanManagementState {
  // Subscription List Actions
  fetchSubscriptions: (page?: number, filters?: Record<string, string>) => Promise<void>;
  setSubscriptionFilters: (filters: Record<string, string>) => void;
  
  // Subscription Payment Actions
  fetchPendingPayments: () => Promise<void>;
  selectPayment: (payment: Subscription | null) => void;
  approvePayment: (subscriptionId: string) => Promise<boolean>;
  rejectPayment: (subscriptionId: string, reason?: string) => Promise<boolean>;
  
  // Plan Management Actions
  fetchPlans: () => Promise<void>;
  selectPlan: (plan: SubscriptionPlan | null) => void;
  createPlan: (planData: PlanFormData) => Promise<boolean>;
  updatePlan: (planId: string, planData: Partial<PlanFormData>) => Promise<boolean>;
  deletePlan: (planId: string) => Promise<boolean>;
  
  // General Actions
  clearError: () => void;
}

export const useSubscriptionManagementStore = create<SubscriptionManagementStore>((set, get) => ({
  // Initial State
  subscriptions: [],
  pendingPayments: [],
  plans: [],
  loading: false,
  error: null,
  selectedPayment: null,
  selectedPlan: null,
  approving: false,
  rejecting: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},

  // Subscription List Actions
  fetchSubscriptions: async (page = 1, currentFilters = get().filters) => { 
    set({ loading: true, error: null });
    try {
      // Construct query parameters, ensuring only defined filters are included
      const queryParams: Record<string, string> = {};
      if (currentFilters.search) queryParams.search = currentFilters.search;
      if (currentFilters.status) queryParams.status = currentFilters.status;
      if (currentFilters.userId) queryParams.userId = currentFilters.userId;
      if (currentFilters.planId) queryParams.planId = currentFilters.planId;
      
      const response = await fetch(`/api/admin/subscription?page=${page}&limit=${get().pagination.limit}&${new URLSearchParams(queryParams).toString()}`);
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      
      const data = await response.json();
      set({
        subscriptions: data.data,
        pagination: { ...data.meta, limit: get().pagination.limit }, // Persist limit
        loading: false,
        filters: currentFilters, 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
    }
  },

  setSubscriptionFilters: (newFilters) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };
    set({ filters: updatedFilters }); 
    get().fetchSubscriptions(1, updatedFilters); 
  },

  // Subscription Payment Actions
  fetchPendingPayments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/admin/subscription?paymentStatus=PENDING');
      if (!response.ok) throw new Error('Failed to fetch pending payments');
      
      const data = await response.json();
      set({
        pendingPayments: data.data,
        loading: false,
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
    }
  },

  selectPayment: (payment) => {
    set({ selectedPayment: payment });
  },

  approvePayment: async (subscriptionId: string) => {
    set({ approving: true, error: null });
    try {
      const response = await fetch(`/api/admin/subscription/${subscriptionId}/approve`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve payment');
      }
      
      // Refresh pending payments
      await get().fetchPendingPayments();
      set({ approving: false, selectedPayment: null });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        approving: false 
      });
      return false;
    }
  },

  rejectPayment: async (subscriptionId: string, reason?: string) => {
    set({ rejecting: true, error: null });
    try {
      const response = await fetch(`/api/admin/subscription/${subscriptionId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject payment');
      }
      
      // Refresh pending payments
      await get().fetchPendingPayments();
      set({ rejecting: false, selectedPayment: null });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        rejecting: false 
      });
      return false;
    }
  },

  // Plan Management Actions
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

  selectPlan: (plan) => {
    set({ selectedPlan: plan });
  },

  createPlan: async (planData) => {
    set({ isCreating: true, error: null });
    try {
      const response = await fetch('/api/admin/subscription/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  updatePlan: async (planId, planData) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await fetch(`/api/admin/subscription/plan/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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
      
      // Refresh plans
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

  // General Actions
  clearError: () => {
    set({ error: null });
  },
}));