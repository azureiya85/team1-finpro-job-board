"use client";

import React, { useState } from "react";
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

// Reusable fetcher with explicit URL typing
const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function SubscriptionPage() {
  const { data: plans } = useSWR<Plan[]>("/plan", fetcher);
  const { data: subs, mutate } = useSWR<Subscription[]>(
    "/subscription",
    fetcher
  );

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const purchase = async () => {
    if (!selectedPlan || !proofFile) return;
    setUploading(true);

    try {
      // Always use BANK_TRANSFER with file upload
      const form = new FormData();
      form.append("planId", selectedPlan);
      form.append("paymentMethod", "BANK_TRANSFER");
      form.append("proof", proofFile);

      await api.post("/subscription", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await mutate(); // Refresh subscription list
    } catch (error) {
      console.error("Purchase error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Subscription Plans</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {plans?.map((plan) => (
          <div
            key={plan.id}
            className={`border rounded-lg p-4 cursor-pointer ${
              selectedPlan === plan.id
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300"
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="text-gray-600">
              IDR {plan.price.toLocaleString()} / {plan.duration} days
            </p>
            <ul className="mt-2 list-disc list-inside">
              {plan.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="mb-8">
          <h2 className="text-lg font-medium">Bank Transfer Payment</h2>
          <p className="mt-2 text-gray-700">
            Please upload your proof of bank transfer to complete the purchase.
          </p>
          <div className="mt-4">
            <label className="block font-medium">
              Upload Proof of Transfer:
            </label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setProofFile(e.target.files[0]);
                }
              }}
              className="mt-2"
            />
          </div>

          <Button
            variant="primary"
            className="mt-4"
            onClick={purchase}
            disabled={uploading || !proofFile}
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
              <td className="p-2">
                {new Date(s.endDate).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
