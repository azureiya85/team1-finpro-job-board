import {
  SubscriptionStatus as PrismaSubscriptionStatus,
  PaymentStatus,
  RefundStatus,
} from '@prisma/client';

// User type
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface PlanFeatures {
  cvGenerator: boolean;
  skillAssessmentLimit: number | 'unlimited';
  priorityReview: boolean;
}

// Plan types
export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  features: PlanFeatures;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  features: PlanFeatures;
  createdAt: Date;
  updatedAt: Date;
}

// Subscription types
export interface Subscription {
  id:string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  paymentMethod: PaymentMethod;
  paymentProof?: string;
  startDate: string;
  endDate: string;
  isRenewal?: boolean;
  originalSubscriptionId?: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  plan: Plan;
}

// Payment types
export interface MidtransResponse {
  token: string;
  redirect_url: string;
  payment_type: string;
  bank: string | null;
  va_number: string | null;
  qr_string: string | null;
  order_id: string;
  transaction_id?: string;
}

export interface PaymentDetails {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  uniqueCode: string;
  instructions: string;
}

export type PaymentMethod =
  | 'BANK_TRANSFER'
  | 'MIDTRANS_BCA_VA'
  | 'MIDTRANS_QRIS'
  | 'CREDIT_CARD'
  | 'E_WALLET'
  | 'PAYMENT_GATEWAY'

export type SubscriptionStatus = 'ACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED' | 'INACTIVE';

export interface SubscriptionListState {
  subscriptions: Subscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: Record<string, string | undefined>; 
}

export interface SubscriptionPaymentState {
  pendingPayments: Subscription[];
  selectedPayment: Subscription | null;
  approving: boolean;
  rejecting: boolean;
}

export interface PlanManagementState {
  plans: SubscriptionPlan[];
  selectedPlan: SubscriptionPlan | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// API request/response types
export interface PlanFormData {
  name: string;
  price: number;
  duration: number;
  description: string;
  features: PlanFeatures;
}

export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethod: PaymentMethod;
}

export interface RenewSubscriptionRequest {
  subscriptionId: string;
  paymentMethod: PaymentMethod;
}

export interface SubscriptionActionResponse {
  success?: boolean;
  message?: string;
  midtrans?: MidtransResponse;
  paymentDetails?: PaymentDetails;
  url?: string;
  renewalSubscriptionId?: string;
  originalSubscriptionId?: string;
}

export interface UploadProofRequest {
  subscriptionId: string;
  paymentProofUrl: string;
}

export interface RenewalEligibilityResponse {
  subscription: Subscription;
  renewalEligibility: {
    canRenew: boolean;
    reason: string | null;
    daysUntilExpiry: number;
    hasExistingPendingRenewal: boolean;
    existingPendingRenewalId: string | null;
  };
}

// Legacy types for backward compatibility
export interface SubscriptionUpdateData {
  status: PrismaSubscriptionStatus;
  cancelledAt: Date;
  updatedAt: Date;
  cancellationReason?: string;
  endDate?: Date;
  refundAmount?: number;
  refundStatus?: RefundStatus;
  autoRenew?: boolean;
  paymentStatus?: PaymentStatus;
}

export interface MidtransItemDetails {
  id: string;
  price: number;
  quantity: number;
  name: string;
  brand?: string;
  category?: string;
  merchant_name?: string;
}

export interface MidtransTransactionParameters {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details: {
    first_name: string;
    last_name: string;
    email: string;
  };
  item_details?: MidtransItemDetails[];
  callbacks: {
    finish: string;
    error: string;
    pending: string;
  };
  enabled_payments?: string[];
}