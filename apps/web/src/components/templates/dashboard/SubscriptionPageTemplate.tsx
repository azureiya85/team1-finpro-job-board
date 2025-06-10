"use client";

import React, { useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
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
      setError('Failed to fetch current subscription. Please try again.');
      console.error('Error fetching subscription:', err);
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

      {/* Current Subscription */}
      {subscription && (
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
        </Card>
      )}

      {/* Plan Selection Component */}
      <SubscriptionPagePlans />

      {/* Payment Component */}
      <SubscriptionPagePayment onRefreshSubscription={fetchSubscription} />
    </div>
  );
}