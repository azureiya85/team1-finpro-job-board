"use client";

import React, { useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter, 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { AlertCircle, Info, Ban } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { subscriptionApi } from '@/services/subscription.service';
import { getSubscriptionStatusBadge } from '@/lib/statusConfig';
import { useSubscriptionStore } from '@/stores/subscriptionStores';
import SubscriptionPagePlans from '@/components/organisms/dashboard/subscription/SubscriptionPagePlans';
import SubscriptionPagePayment from '@/components/organisms/dashboard/subscription/SubscriptionPagePayment';

export default function SubscriptionPageTemplate() {
  const {
    subscription,
    loading,
    error,
    setPlans,
    setSubscription,
    setLoading,
    setError,
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

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([fetchPlans(), fetchSubscription()]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchPlans, fetchSubscription, setLoading, setError]);

   const handleCancelSubscription = async () => {
    if (!subscription) return;

    const isConfirmed = window.confirm(
      "Are you sure you want to cancel this pending subscription?"
    );

    if (!isConfirmed) return;

    setLoading(true);
    setError(null);
    try {
      await subscriptionApi.cancelSubscription(subscription.id);
      // Refresh subscription data to update the UI
      await fetchSubscription();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during cancellation.';
      setError(errorMessage);
      console.error("Cancellation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Render status badge helper
  const renderStatusBadge = (status: string) => {
    const config = getSubscriptionStatusBadge(status);
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current Subscription
              {renderStatusBadge(subscription.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium">Plan</Label>
                <p className="text-lg font-semibold">{subscription.plan.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Price</Label>
                <p>IDR {subscription.plan.price.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Start Date</Label>
                <p>{new Date(subscription.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">End Date</Label>
                <p>{new Date(subscription.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
            {subscription.status === 'PENDING' && (
            <CardFooter className="border-t pt-4 mt-4">
              <div className="w-full">
                <div className="flex items-start space-x-3">
                  <Ban className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Cancel Pending Order</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      This subscription is awaiting payment or confirmation. If you&apos;ve changed your mind, you can cancel it now.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={handleCancelSubscription}
                      disabled={loading}
                    >
                      {loading ? 'Cancelling...' : 'Cancel Subscription'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
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