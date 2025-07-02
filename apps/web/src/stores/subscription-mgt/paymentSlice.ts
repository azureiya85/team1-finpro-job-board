import type { StateCreator } from 'zustand';
import type { SubscriptionPaymentState, Subscription } from '@/types/subscription'; 
import type { 
  SubscriptionManagementState,
  SubscriptionPaymentSliceActions 
} from '@/types/zustandAdmin';

export type PaymentSlice = SubscriptionPaymentState & SubscriptionPaymentSliceActions;

export const createPaymentSlice: StateCreator<
  SubscriptionManagementState,
  [],
  [],
  PaymentSlice
> = (set, get) => ({
  // Payment State
  pendingPayments: [],
  selectedPayment: null,
  approving: false,
  rejecting: false,

  // Payment Actions
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

  selectPayment: (payment: Subscription | null) => {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject payment');
      }
      
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
});