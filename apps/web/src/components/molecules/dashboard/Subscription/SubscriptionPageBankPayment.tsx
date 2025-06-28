"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { useSubscriptionStore } from '@/stores/subscriptionStores';
import SubscriptionPageBankDetails from '../../../atoms/dashboard/subscription/SubscriptionPageBankDetails';
import SubscriptionPageBankFileSelector from '../../../atoms/dashboard/subscription/SubscriptionPageBankFileSelector';
import SubscriptionPageBankUploadHandler from '../../../atoms/dashboard/subscription/SubscriptionPageBankUploadHandler';

export default function SubscriptionPageBankPayment() {
  const { subscription } = useSubscriptionStore();

  // If payment proof is already submitted and pending review
  if (subscription && subscription.paymentProof && subscription.status === 'PENDING') {
    return (
      <Alert className="border-green-200 bg-green-50 mt-6">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your payment proof has been submitted and is awaiting admin review.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <SubscriptionPageBankFileSelector />
      <SubscriptionPageBankUploadHandler />
      <SubscriptionPageBankDetails />
    </>
  );
}