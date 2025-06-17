import { 
  SubscriptionStatus as PrismaSubscriptionStatus, 
  PaymentStatus, 
  RefundStatus 
} from '@prisma/client';

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  features: {
    cvGenerator?: boolean;
    skillAssessmentLimit?: number | string;
    priorityCvReview?: boolean;
    [key: string]: boolean | number | string | undefined;
  };
}

export interface Subscription {
  id: string;
  plan: Plan;
  status: string;
  startDate: string;
  endDate: string;
  paymentStatus: string;
  paymentMethod: string;
}

export interface MidtransResponse {
  payment_type: string;
  bank: string | null;
  va_number: string | null;
  qr_string: string | null;
  order_id: string;
  transaction_id: string;
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
  | "BANK_TRANSFER" 
  | "MIDTRANS_BCA_VA" 
  | "MIDTRANS_QRIS" 
  | "CREDIT_CARD" 
  | "E_WALLET";

export type SubscriptionStatus = "ACTIVE" | "PENDING" | "CANCELLED" | "EXPIRED";

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
  // For specifying payment channels like 'bca_va', 'gopay', etc.
  enabled_payments?: string[];
}