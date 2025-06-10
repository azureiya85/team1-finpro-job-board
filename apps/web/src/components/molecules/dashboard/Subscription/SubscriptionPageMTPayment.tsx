"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CheckCircle, QrCode } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSubscriptionStore } from '@/stores/subscriptionStores';

export default function SubscriptionPageMTPayment() {
  const {
    plans,
    selectedPlan,
    paymentMethod,
    midtransInfo,
  } = useSubscriptionStore();

  if (!midtransInfo) return null;

  return (
    <>
      {/* Midtrans BCA VA */}
      {paymentMethod === "MIDTRANS_BCA_VA" && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">BCA Virtual Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">VA Number</Label>
              <p className="font-mono text-2xl font-bold text-green-600">{midtransInfo.va_number}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-sm font-medium">Order ID</Label>
                <p className="font-mono">{midtransInfo.order_id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Amount</Label>
                <p>IDR {plans?.find((p) => p.id === selectedPlan)?.price.toLocaleString()}</p>
              </div>
            </div>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Transfer to the above VA number. Your subscription will be activated automatically after payment.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Midtrans QRIS */}
      {paymentMethod === "MIDTRANS_QRIS" && (
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg text-purple-800 text-center">QRIS Payment</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src={`data:image/png;base64,${midtransInfo.qr_string}`}
                alt="QRIS Code"
                width={200}
                height={200}
                className="border rounded-lg"
              />
            </div>
            <Alert>
              <QrCode className="h-4 w-4" />
              <AlertDescription>
                Scan this QR code with any e-wallet app. Your subscription will be activated automatically after payment.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </>
  );
}