"use client";

import React, { useEffect } from "react";
import Script from "next/script";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CheckCircle, QrCode } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSubscriptionStore } from "@/stores/subscriptionStores";


export default function SubscriptionPageMTPayment() {
 const {
   plans,
   selectedPlan,
   paymentMethod,
   midtransInfo,
 } = useSubscriptionStore();


 // 🧠 Automatically call snap.pay() when token is available
 useEffect(() => {
   if (!midtransInfo?.token || typeof window === "undefined") return;


   const triggerSnap = () => {
     window.snap.pay(midtransInfo.token, {
       onSuccess: (result) => {
         console.log("✅ Payment success:", result);
       },
       onPending: (result) => {
         console.log("⏳ Payment pending:", result);
       },
       onError: (result) => {
         console.error("❌ Payment error:", result);
       },
       onClose: () => {
         console.warn("🚪 Snap popup closed by user");
       },
     });
   };


   if (window.snap) {
     triggerSnap();
   } else {
     const interval = setInterval(() => {
       if (window.snap) {
         clearInterval(interval);
         triggerSnap();
       }
     }, 300);
   }
 }, [midtransInfo]);


 if (!midtransInfo) return null;


 return (
   <>
     {/* Snap.js loader */}
     <Script
       src="https://app.sandbox.midtrans.com/snap/snap.js"
       data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
       strategy="afterInteractive"
     />


     {/* Midtrans BCA VA */}
     {paymentMethod === "MIDTRANS_BCA_VA" && (
       <Card className="bg-green-50 border-green-200">
         <CardHeader>
           <CardTitle className="text-lg text-green-800">BCA Virtual Account</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <div>
             <Label className="text-sm font-medium">VA Number</Label>
             <p className="font-mono text-2xl font-bold text-green-600">
               {midtransInfo.va_number}
             </p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
             <div>
               <Label className="text-sm font-medium">Order ID</Label>
               <p className="font-mono">{midtransInfo.order_id}</p>
             </div>
             <div>
               <Label className="text-sm font-medium">Amount</Label>
               <p>
                 IDR{" "}
                 {plans?.find((p) => p.id === selectedPlan)?.price.toLocaleString()}
               </p>
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
