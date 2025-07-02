import type { StateCreator } from 'zustand';
import type { 
  SubscriptionManagementState,
  SubscriptionCoreState,
  SubscriptionCoreActions 
} from '@/types/zustandAdmin';

export type CoreSlice = SubscriptionCoreState & SubscriptionCoreActions;

export const createCoreSlice: StateCreator<
  SubscriptionManagementState,
  [],
  [],
  CoreSlice
> = (set) => ({
  // Core State
  loading: false,
  error: null,

  // Core Actions
  clearError: () => {
    set({ error: null });
  },
});