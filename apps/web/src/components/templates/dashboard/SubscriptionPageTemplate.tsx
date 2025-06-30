"use client";

import React, { useEffect, useCallback } from "react";
import Script from "next/script"; 
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { subscriptionApi } from '@/services/subscription.service';
import { useSubscriptionStore } from '@/stores/subscriptionStores';
import SubscriptionPagePlans from '@/components/organisms/dashboard/subscription/SubscriptionPagePlans';
import SubscriptionPagePayment from '@/components/organisms/dashboard/subscription/SubscriptionPagePayment';
import SubscriptionDetails from '@/components/organisms/dashboard/subscription/developer/SubscriptionDetails';

export default function SubscriptionPageTemplate() {
  const {
    subscription,
    loading,
    error,
    setPlans,
    setSubscription,
    setLoading,
    setError,
    setRenewalEligibility, 
  } = useSubscriptionStore();
  
  // API calls with error handling
  const fetchPlans = useCallback(async () => {
    try {
      const data = await subscriptionApi.getPlans();
      setPlans(data);
    } catch (err) {
      setError('Failed to fetch subscription plans. Please try again.');
      console.error('Error fetching plans:', err);
    }
  }, [setPlans, setError]);

  const fetchSubscription = useCallback(async () => {
    try {
      const data = await subscriptionApi.getCurrentSubscription();
      setSubscription(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        setSubscription(null);
      } else {
        setError('Failed to fetch current subscription. Please try again.');
        console.error('Error fetching subscription:', err);
      }
    }
  }, [setSubscription, setError]);

  // Fetch renewal eligibility when a subscription exists
  const fetchRenewalEligibility = useCallback(async (subscriptionId: string) => {
    try {
      const eligibilityData = await subscriptionApi.checkRenewalEligibility(subscriptionId);
      setRenewalEligibility(eligibilityData);
    } catch (err) {
      console.error('Failed to check renewal eligibility:', err);
      setRenewalEligibility(null);
    }
  }, [setRenewalEligibility]);

  // Initialize data 
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      setRenewalEligibility(null);
      
      try {
        await Promise.all([fetchPlans(), fetchSubscription()]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchPlans, fetchSubscription, setLoading, setError, setRenewalEligibility]);

  // Effect to fetch eligibility data after subscription is loaded
  useEffect(() => {
    if (subscription?.id) {
      fetchRenewalEligibility(subscription.id);
    }
  }, [subscription, fetchRenewalEligibility]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Script for Midtrans */}
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground mt-2">Choose a plan that works best for you</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Subscription or No Subscription Message */}
      {subscription ? (
        <SubscriptionDetails 
          subscription={subscription}
          onRefreshSubscription={fetchSubscription}
        />
      ) : (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You are currently not subscribing to any plans. Choose a plan below to get started!
          </AlertDescription>
        </Alert>
      )}

      <SubscriptionPagePlans />
      <SubscriptionPagePayment onRefreshSubscription={fetchSubscription} />
    </div>
  );
}