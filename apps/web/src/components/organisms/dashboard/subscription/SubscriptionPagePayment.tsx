"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Building, QrCode } from "lucide-react";
import type { PaymentMethod } from '@/types/subscription';
import { subscriptionApi } from '@/services/subscription.service';
import { getPaymentMethodIcon } from '@/lib/statusConfig';
import { useSubscriptionStore } from '@/stores/subscriptionStores';
import SubscriptionPageBankPayment from '@/components/molecules/dashboard/Subscription/SubscriptionPageBankPayment';
import SubscriptionPageMTPayment from '@/components/molecules/dashboard/Subscription/SubscriptionPageMTPayment';

interface SubscriptionPagePaymentProps {
  onRefreshSubscription: () => Promise<void>;
}

export default function SubscriptionPagePayment({ onRefreshSubscription }: SubscriptionPagePaymentProps) {
  const {
    selectedPlan,
    paymentMethod,
    proofFile,
    uploading,
    setPaymentMethod,
    setUploading,
    setMidtransInfo,
    setPaymentDetails,
    setError,
    resetPaymentInfo,
  } = useSubscriptionStore();

  // Reset payment info when payment method changes
  useEffect(() => {
    resetPaymentInfo();
  }, [paymentMethod, resetPaymentInfo]);

  // Purchase handler
  const handlePurchase = async () => {
    if (!selectedPlan) return;
    
    setUploading(true);
    setMidtransInfo(null);
    setPaymentDetails(null);
    setError(null);

    try {
      const response = await subscriptionApi.createSubscription({
        planId: selectedPlan,
        paymentMethod,
        proof: proofFile || undefined,
      });

      // Handle different response types
      if (response.url) {
        // Redirect for credit card/e-wallet
        window.location.href = response.url;
        return;
      }

      if (response.midtrans) {
        // Set Midtrans info for VA/QRIS
        setMidtransInfo(response.midtrans);
      }

      if (response.paymentDetails) {
        // Set payment details for manual bank transfer
        setPaymentDetails(response.paymentDetails);
      }

      // Refresh subscription data
      await onRefreshSubscription();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed. Please try again.';
      setError(errorMessage);
      console.error('Purchase error:', err);
    } finally {
      setUploading(false);
    }
  };

  // Render payment icon helper
  const renderPaymentIcon = (method: string) => {
    const IconComponent = getPaymentMethodIcon(method);
    return <IconComponent className="w-4 h-4" />;
  };

  const isPurchaseDisabled = uploading || (paymentMethod === "BANK_TRANSFER" && !proofFile);

  if (!selectedPlan) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>Choose how you&apos;d like to pay</CardDescription>
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
          onClick={handlePurchase}
          disabled={isPurchaseDisabled}
          className="w-full"
          size="lg"
        >
          <div className="flex items-center">
            {renderPaymentIcon(paymentMethod)}
            <span className="ml-2">
              {uploading ? "Processing..." : "Purchase / Renew Subscription"}
            </span>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}