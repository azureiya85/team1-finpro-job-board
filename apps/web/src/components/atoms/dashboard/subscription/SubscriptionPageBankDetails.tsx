"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSubscriptionStore } from '@/stores/subscriptionStores';

export default function SubscriptionPageBankDetails() {
  const { paymentDetails } = useSubscriptionStore();

  // Only render if payment details exist
  if (!paymentDetails) {
    return null;
  }

  return (
    <Card className="bg-blue-50 border-blue-200 mt-6">
      <CardHeader>
        <CardTitle className="text-lg text-blue-800">Bank Transfer Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Bank</Label>
            <p className="font-mono">{paymentDetails.bankName}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Account Number</Label>
            <p className="font-mono text-lg">{paymentDetails.accountNumber}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Account Holder</Label>
            <p>{paymentDetails.accountHolder}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Amount</Label>
            <p className="font-semibold">IDR {paymentDetails.amount.toLocaleString()}</p>
          </div>
        </div>
        <Separator />
        <div>
          <Label className="text-sm font-medium">Unique Code</Label>
          <p className="font-mono text-xl font-bold text-blue-600">{paymentDetails.uniqueCode}</p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{paymentDetails.instructions}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}