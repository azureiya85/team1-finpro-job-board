import type { StateCreator } from 'zustand';
import type { SubscriptionListState } from '@/types/subscription'; 
import type { 
  SubscriptionManagementState,
  SubscriptionListSliceActions 
} from '@/types/zustandAdmin';

export type ListSlice = SubscriptionListState & SubscriptionListSliceActions;

export const createListSlice: StateCreator<
  SubscriptionManagementState,
  [],
  [],
  ListSlice
> = (set, get) => ({
  // List State
  subscriptions: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},

  // List Actions
  fetchSubscriptions: async (page = 1, currentFilters = get().filters) => { 
    set({ loading: true, error: null });
    try {
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
        pagination: { ...data.meta, limit: get().pagination.limit },
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

  setSubscriptionFilters: (newFilters: Record<string, string | undefined>) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };
    set({ filters: updatedFilters }); 
    get().fetchSubscriptions(1, updatedFilters); 
  },
});