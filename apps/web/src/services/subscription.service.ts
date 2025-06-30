import axios from 'axios';
import axiosInstance from '@/lib/axios'; 
import type { 
  Plan, 
  Subscription, 
  CreateSubscriptionRequest,
  RenewSubscriptionRequest,
  SubscriptionActionResponse,
  UploadProofRequest,
  RenewalEligibilityResponse
} from '@/types/subscription';

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
  async createSubscription(request: CreateSubscriptionRequest): Promise<SubscriptionActionResponse> {
    const response = await axiosInstance.post(this.baseUrl, request);
    return response.data;
  }
  
  // Renew an existing subscription
  async renewSubscription(request: RenewSubscriptionRequest): Promise<SubscriptionActionResponse> {
    const { subscriptionId, paymentMethod } = request;
    const response = await axiosInstance.post(
      `${this.baseUrl}/${subscriptionId}/renew`, 
      { paymentMethod } 
    );
    return response.data;
  }

  // Cancel current subscription
  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.post(`/api/subscription/${subscriptionId}/cancel`);
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

  async uploadPaymentProof(request: UploadProofRequest): Promise<{ message: string; subscription: Subscription }> {
    const { subscriptionId, paymentProofUrl } = request;
    const response = await axiosInstance.post(
      `/api/subscription/${subscriptionId}/payment-proof`, 
      { subscriptionId, paymentProofUrl } // Send the URL in the body
    );
    return response.data;
  }

  async checkRenewalEligibility(subscriptionId: string): Promise<RenewalEligibilityResponse> {
    const response = await axiosInstance.get(`${this.baseUrl}/${subscriptionId}/renew`);
    return response.data;
  }
}

// Export singleton instance
export const subscriptionApi = new SubscriptionApiService();
export default subscriptionApi;