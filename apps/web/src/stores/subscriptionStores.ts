import { create } from 'zustand';
import type { 
  Plan, 
  Subscription, 
  MidtransResponse, 
  PaymentDetails, 
  PaymentMethod 
} from '@/types/subscription';

interface SubscriptionState {
  // Data
  plans: Plan[];
  subscription: Subscription | null;
  selectedPlan: string | null;
  paymentMethod: PaymentMethod;
  proofFile: File | null;
  midtransInfo: MidtransResponse | null;
  paymentDetails: PaymentDetails | null;
  
  // UI States
  loading: boolean;
  uploading: boolean;
  error: string | null;
  
  // Actions
  setPlans: (plans: Plan[]) => void;
  setSubscription: (subscription: Subscription | null) => void;
  setSelectedPlan: (planId: string | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setProofFile: (file: File | null) => void;
  setMidtransInfo: (info: MidtransResponse | null) => void;
  setPaymentDetails: (details: PaymentDetails | null) => void;
  setLoading: (loading: boolean) => void;
  setUploading: (uploading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Reset functions
  resetPaymentInfo: () => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  // Initial state
  plans: [],
  subscription: null,
  selectedPlan: null,
  paymentMethod: "BANK_TRANSFER",
  proofFile: null,
  midtransInfo: null,
  paymentDetails: null,
  loading: true,
  uploading: false,
  error: null,
  
  // Actions
  setPlans: (plans) => set({ plans }),
  setSubscription: (subscription) => set({ subscription }),
  setSelectedPlan: (selectedPlan) => set({ selectedPlan }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setProofFile: (proofFile) => set({ proofFile }),
  setMidtransInfo: (midtransInfo) => set({ midtransInfo }),
  setPaymentDetails: (paymentDetails) => set({ paymentDetails }),
  setLoading: (loading) => set({ loading }),
  setUploading: (uploading) => set({ uploading }),
  setError: (error) => set({ error }),
  
  // Reset functions
  resetPaymentInfo: () => set({ 
    midtransInfo: null, 
    paymentDetails: null, 
    proofFile: null 
  }),
  
  reset: () => set({
    plans: [],
    subscription: null,
    selectedPlan: null,
    paymentMethod: "BANK_TRANSFER",
    proofFile: null,
    midtransInfo: null,
    paymentDetails: null,
    loading: true,
    uploading: false,
    error: null,
  }),
}));