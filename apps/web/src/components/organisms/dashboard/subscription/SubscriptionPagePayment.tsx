"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Building, QrCode } from "lucide-react";
import type { PaymentMethod, Subscription } from '@/types/subscription'; 
import { subscriptionApi } from '@/services/subscription.service';
import { getPaymentMethodIcon } from '@/lib/statusConfig';
import { useSubscriptionStore } from '@/stores/subscriptionStores';
import SubscriptionPageBankPayment from '@/components/molecules/dashboard/Subscription/SubscriptionPageBankPayment';
import SubscriptionPageMTPayment from '@/components/molecules/dashboard/Subscription/SubscriptionPageMTPayment';
import { toast } from "sonner";

interface SubscriptionPagePaymentProps {
  onRefreshSubscription: () => Promise<void>;
  subscriptionToRenew?: Subscription | null; 
}

export default function SubscriptionPagePayment({ 
  onRefreshSubscription,
  subscriptionToRenew 
}: SubscriptionPagePaymentProps) {
  const {
    selectedPlan, 
    paymentMethod,
    uploading,
    setPaymentMethod,
    setUploading,
    setMidtransInfo,
    setPaymentDetails,
    setError,
    resetPaymentInfo,
  } = useSubscriptionStore();

  useEffect(() => {
    resetPaymentInfo();
  }, [paymentMethod, resetPaymentInfo]);

  // Purchase handler
  const handlePurchaseOrRenew = async () => {
    setUploading(true);
    setMidtransInfo(null);
    setPaymentDetails(null);
    setError(null);

    try {
      let response;
      if (subscriptionToRenew) {
        response = await subscriptionApi.renewSubscription({
          subscriptionId: subscriptionToRenew.id,
          paymentMethod,
        });
      } else {
        if (!selectedPlan) {
          toast.error("Please select a plan to purchase.");
          setUploading(false);
          return;
        }
        response = await subscriptionApi.createSubscription({
          planId: selectedPlan,
          paymentMethod,
        });
      }

      // Handle response (same logic for both create and renew)
      if (response.url) { window.location.href = response.url; return; }
      if (response.midtrans) { setMidtransInfo(response.midtrans); }
      if (response.paymentDetails) { setPaymentDetails(response.paymentDetails); }

      await onRefreshSubscription();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed. Please try again.';
      setError(errorMessage);
      console.error('Purchase/Renew error:', err);
    } finally {
      setUploading(false);
    }
  };

  const renderPaymentIcon = (method: string) => {
    const IconComponent = getPaymentMethodIcon(method);
    return <IconComponent className="w-4 h-4" />;
  };

  const isPurchaseDisabled = uploading;
  if (!subscriptionToRenew && !selectedPlan) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{subscriptionToRenew ? 'Renew Subscription' : 'Payment Method'}</CardTitle>
        <CardDescription>
          {subscriptionToRenew 
            ? `Choose a payment method to renew your ${subscriptionToRenew.plan.name} plan.`
            : "Choose how you'd like to pay"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <Label htmlFor="payment-method">Select Payment Method</Label>
          <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BANK_TRANSFER">
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Bank Transfer
                </div>
              </SelectItem>
              <SelectItem value="MIDTRANS_BCA_VA">
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  BCA Virtual Account
                </div>
              </SelectItem>
              <SelectItem value="MIDTRANS_QRIS">
                <div className="flex items-center">
                  <QrCode className="w-4 h-4 mr-2" />
                  QRIS
                </div>
              </SelectItem>
              {/*
              <SelectItem value="CREDIT_CARD">
                <div className="flex items-center">
                  {renderPaymentIcon("CREDIT_CARD")}
                  <span className="ml-2">Credit Card</span>
                </div>
              </SelectItem>
              <SelectItem value="E_WALLET">
                <div className="flex items-center">
                  {renderPaymentIcon("E_WALLET")}
                  <span className="ml-2">E-Wallet</span>
                </div>
              </SelectItem>
              */}
            </SelectContent>
          </Select>
        </div>

        {/* Bank Transfer Component */}
        {paymentMethod === "BANK_TRANSFER" && (
          <SubscriptionPageBankPayment />
        )}

        {/* Midtrans Payment Component */}
        {(paymentMethod === "MIDTRANS_BCA_VA" || paymentMethod === "MIDTRANS_QRIS") && (
          <SubscriptionPageMTPayment />
        )}

        {/* Purchase Button */}
        <Button
          onClick={handlePurchaseOrRenew} 
          disabled={isPurchaseDisabled}
          className="w-full"
          size="lg"
        >
          <div className="flex items-center">
            {renderPaymentIcon(paymentMethod)}
            <span className="ml-2">
              {uploading ? "Processing..." : (subscriptionToRenew ? 'Renew Now' : 'Purchase Subscription')}
            </span>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}