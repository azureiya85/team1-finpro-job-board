"use client";

import React, { useEffect, useState } from "react";
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
import { Info, Ban, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { subscriptionApi } from '@/services/subscription.service';
import { getSubscriptionStatusBadge } from '@/lib/statusConfig';
import { useSubscriptionStore } from '@/stores/subscriptionStores';
import { Subscription } from '@/types/subscription';

interface SubscriptionDetailsProps {
  subscription: Subscription;
  onRefreshSubscription: () => Promise<void>;
}

export default function SubscriptionDetails({ 
  subscription, 
  onRefreshSubscription 
}: SubscriptionDetailsProps) {
  const {
    loading,
    setLoading,
    setError,
    renewalEligibility,
  } = useSubscriptionStore(); 

  const [paymentToken, setPaymentToken] = useState<string | null>(null);

  // Effect to load Midtrans Snap.js script and open payment popup
  useEffect(() => {
    if (paymentToken) {
      if (window.snap) {
        window.snap.pay(paymentToken, {
          onSuccess: async function(result){
            console.log('Payment successful:', result);
            alert('Payment successful!');
            await onRefreshSubscription();
            setPaymentToken(null);
          },
          onPending: async function(result){
            console.log('Payment pending:', result);
            alert('Your payment is pending. We will update your subscription status once confirmed.');
            await onRefreshSubscription();
            setPaymentToken(null);
          },
          onError: function(result){
            console.error('Payment error:', result);
            setError('Payment failed. Please try again.');
            setPaymentToken(null);
          },
          onClose: function(){
            console.log('Payment popup closed.');
            setPaymentToken(null);
          }
        });
      } else {
        console.error("Midtrans Snap.js is not loaded yet.");
        setError("Payment service is not available. Please refresh the page and try again.")
      }
    }
  }, [paymentToken, onRefreshSubscription, setError]);
  
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
      await onRefreshSubscription();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during cancellation.';
      setError(errorMessage);
      console.error("Cancellation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRenewSubscription = async () => {
    if (!subscription) return;

    setLoading(true);
    setError(null);
    try {
      const response = await subscriptionApi.renewSubscription({ 
        subscriptionId: subscription.id,
        paymentMethod: 'PAYMENT_GATEWAY', 
      });

      if (response.midtrans?.token) {
        setPaymentToken(response.midtrans.token);
      } else {
        alert(response.message);
        await onRefreshSubscription();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during renewal.';
      setError(`Renewal failed: ${errorMessage}`);
      console.error("Renewal failed:", err);
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                Current Subscription
                {renderStatusBadge(subscription.status)}
              </CardTitle>
            </div>
            {renewalEligibility?.renewalEligibility.canRenew && (
              <Button onClick={handleRenewSubscription} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Renew Now
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium">Plan</Label>
              <p className="text-lg font-semibold">{subscription?.plan.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Price</Label>
              <p>IDR {subscription?.plan.price.toLocaleString()}</p>
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

      {/* Informational Alert for Renewal Status */}
      {renewalEligibility?.renewalEligibility.reason && (
        <Alert variant="default">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Renewal Status:</strong> {renewalEligibility.renewalEligibility.reason}.
            {renewalEligibility.renewalEligibility.daysUntilExpiry > 0 && 
             ` Your plan expires in ${renewalEligibility.renewalEligibility.daysUntilExpiry} days.`}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}