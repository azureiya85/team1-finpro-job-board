"use client";

import React, { useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { api } from "../../../lib/axios";
import { Button } from "../../../components/subscription/button";

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
}

interface Subscription {
  id: string;
  plan: Plan;
  status: string;
  startDate: string;
  endDate: string;
}

interface MidtransResponse {
  payment_type: string;
  bank: string | null;
  va_number: string | null;
  qr_string: string | null;
  order_id: string;
  transaction_id: string;
}

export default function SubscriptionPage() {
  // Typed fetchers with 'url: string'
  const { data: plans } = useSWR<Plan[]>("/plan", (url: string) =>
    api.get(url).then((res) => res.data)
  );

  const { data: subs, mutate } = useSWR<Subscription[]>("/subscription", (url: string) =>
    api.get(url).then((res) => res.data)
  );

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [midtransInfo, setMidtransInfo] = useState<MidtransResponse | null>(null);

  const purchase = async () => {
    if (!selectedPlan) return;
    setUploading(true);
    setMidtransInfo(null);

    try {
      // 1. Bank Transfer
      if (paymentMethod === "BANK_TRANSFER" && proofFile) {
        const form = new FormData();
        form.append("planId", selectedPlan);
        form.append("paymentMethod", "BANK_TRANSFER");
        form.append("proof", proofFile);

        await api.post("/subscription", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        await mutate();
        setUploading(false);
        return;
      }

      // 2. Midtrans BCA VA or QRIS
      if (
        paymentMethod === "MIDTRANS_BCA_VA" ||
        paymentMethod === "MIDTRANS_QRIS"
      ) {
        const { data } = await api.post("/subscription", {
          planId: selectedPlan,
          paymentMethod,
        });

        setMidtransInfo(data.midtrans);
        setUploading(false);
        return;
      }

      // 3. Stripe Credit Card or E-Wallet
      if (paymentMethod === "CREDIT_CARD" || paymentMethod === "E_WALLET") {
        const { data } = await api.post("/subscriptions/checkout", {
          planId: selectedPlan,
          paymentMethod,
        });

        window.location.href = data.url;
        setUploading(false);
        return;
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Something went wrong during the payment process.");
    }

    setUploading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Subscription Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {plans?.map((plan) => (
          <div
            key={plan.id}
            className={`border rounded-lg p-4 cursor-pointer ${
              selectedPlan === plan.id ? "border-blue-600" : "border-gray-300"
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="text-gray-600">
              IDR {plan.price.toLocaleString()} / {plan.duration} days
            </p>
            <ul className="mt-2 list-disc list-inside">
              {plan.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="mb-8">
          <h2 className="text-lg font-medium">Choose Payment Method</h2>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="border p-2 rounded mt-2"
          >
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="MIDTRANS_BCA_VA">BCA Virtual Account (Midtrans)</option>
            <option value="MIDTRANS_QRIS">QRIS (Midtrans)</option>
            <option value="CREDIT_CARD">Credit Card (Stripe)</option>
            <option value="E_WALLET">E-Wallet</option>
          </select>

          {paymentMethod === "BANK_TRANSFER" && (
            <div className="mt-4">
              <label className="block font-medium">Upload Proof of Transfer:</label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={(e) => {
                  if (e.target.files?.[0]) setProofFile(e.target.files[0]);
                }}
                className="mt-2"
              />
            </div>
          )}

          {midtransInfo && paymentMethod === "MIDTRANS_BCA_VA" && (
            <div className="mt-4 p-4 border rounded bg-gray-50">
              <h3 className="text-md font-semibold mb-2">BCA Virtual Account</h3>
              <p>
                VA Number:{" "}
                <span className="font-mono text-lg">{midtransInfo.va_number}</span>
              </p>
              <p className="text-sm text-gray-600">
                Order ID: {midtransInfo.order_id}
              </p>
              <p className="text-sm text-gray-600">
                Gross Amount: IDR{" "}
                {plans?.find((p) => p.id === selectedPlan)?.price.toLocaleString()}
              </p>
              <p className="text-sm text-red-500 mt-2">
                Transfer to the above VA. Once you complete the transfer, the subscription
                will be activated automatically.
              </p>
            </div>
          )}

          {midtransInfo && paymentMethod === "MIDTRANS_QRIS" && (
            <div className="mt-4 p-4 border rounded bg-gray-50 text-center">
              <h3 className="text-md font-semibold mb-2">QRIS Code</h3>
              <div className="mx-auto" style={{ width: '192px', height: '192px' }}>
                <Image
                  src={`data:image/png;base64,${midtransInfo.qr_string}`}
                  alt="QRIS Code"
                  width={192}
                  height={192}
                  className="mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Scan this QR with any e-wallet / QRIS app. Once you complete payment, your
                subscription will be activated.
              </p>
            </div>
          )}

          <Button
            variant="primary"
            className="mt-4"
            onClick={purchase}
            disabled={uploading || (paymentMethod === "BANK_TRANSFER" && !proofFile)}
          >
            {uploading ? "Processing..." : "Purchase / Renew"}
          </Button>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Your Subscriptions</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="border-b p-2">Plan</th>
            <th className="border-b p-2">Status</th>
            <th className="border-b p-2">Start</th>
            <th className="border-b p-2">End</th>
          </tr>
        </thead>
        <tbody>
          {subs?.map((s) => (
            <tr key={s.id}>
              <td className="p-2">{s.plan.name}</td>
              <td className="p-2">{s.status}</td>
              <td className="p-2">
                {new Date(s.startDate).toLocaleDateString()}
              </td>
              <td className="p-2">{new Date(s.endDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}