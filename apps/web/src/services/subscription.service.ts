import axios from 'axios';
import axiosInstance from '@/lib/axios'; 
import type { Plan, Subscription, PaymentMethod, MidtransResponse, PaymentDetails } from '@/types/subscription';

export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethod: PaymentMethod;
  proof?: File;
}

export interface CreateSubscriptionResponse {
  success: boolean;
  message?: string;
  midtrans?: MidtransResponse;
  paymentDetails?: PaymentDetails;
  url?: string;
}

class SubscriptionApiService {
  private baseUrl = '/api/subscription';

  // Fetch all available subscription plans
  async getPlans(): Promise<Plan[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/plans`);
    return response.data;
  }

  // Fetch current user subscription 
  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const response = await axiosInstance.get(this.baseUrl);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // No subscription found
      }
      throw error;
    }
  }

  // Create or renew subscription
  async createSubscription(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    const { planId, paymentMethod, proof } = request;

    // Handle file upload for bank transfer with proof
    if (paymentMethod === "BANK_TRANSFER" && proof) {
      const formData = new FormData();
      formData.append("planId", planId);
      formData.append("paymentMethod", paymentMethod);
      formData.append("proof", proof);

      const response = await axiosInstance.post(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Handle JSON requests for other payment methods
    const response = await axiosInstance.post(this.baseUrl, {
      planId,
      paymentMethod,
    });
    
    return response.data;
  }

  // Cancel current subscription
  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete(this.baseUrl);
    return response.data;
  }

  // Get subscription history
  async getSubscriptionHistory(): Promise<Subscription[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/history`);
    return response.data;
  }

  // Verify payment status (for polling payment updates)
  async verifyPaymentStatus(orderId: string): Promise<{ status: string; subscription?: Subscription }> {
    const response = await axiosInstance.get(`${this.baseUrl}/verify/${orderId}`);
    return response.data;
  }
}

// Export singleton instance
export const subscriptionApi = new SubscriptionApiService();
export default subscriptionApi;